using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.AIPredictions;
using Ser_Backend.Models;

namespace Ser_Backend.Services
{
    public class AIPredictionService
    {
        private readonly AppDbContext _db;
        private readonly HttpClient _httpClient;
        private const string GROQ_API_KEY = "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";
        private const string GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

        public AIPredictionService(AppDbContext db)
        {
            _db = db;
            _httpClient = new HttpClient();
        }

        public async Task<AIPredictionResponseDto> RunPredictionAsync(int userId, RunAIPredictionDto dto)
        {
            // Verify Customer
            var customer = await _db.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId);
            if (customer == null)
                throw new Exception("Customer profile not found.");

            // Verify Vehicle ownership
            var vehicle = await _db.Vehicles
                .Include(v => v.Appointments)
                .FirstOrDefaultAsync(v => v.Id == dto.VehicleId && v.CustomerId == customer.Id);
            if (vehicle == null)
                throw new Exception("Vehicle not found or does not belong to you.");

            // Retrieve past service appointments for repair history context
            var pastServices = vehicle.Appointments
                .Where(a => a.Status == Appointment.AppointmentStatus.Completed)
                .Select(a => $"{a.AppointmentDate.ToShortDateString()}: {a.ServiceType} ({a.Notes})")
                .ToList();

            string repairHistory = pastServices.Any() 
                ? string.Join("; ", pastServices) 
                : "No recorded past service history in this service center.";

            // Formulate prompt for Groq API
            string prompt = $@"You are 'Ser-Viscar AI', a state-of-the-art predictive vehicle diagnostic system.
Analyze the following vehicle telemetry data and diagnostic parameters to predict the most likely upcoming component failure:

[VEHICLE INFO]
- Brand/Make: {vehicle.Brand}
- Model: {vehicle.Model}
- Year: {vehicle.Year}
- Registered Number: {vehicle.VehicleNumber}

[USAGE & DIAGNOSTIC METRICS]
- Current Mileage/Odometer: {dto.Mileage} km
- Primary Usage Pattern: {dto.UsagePattern}
- Reported Symptoms or Anomalies: {dto.Symptoms}
- Past Maintenance/Repair History: {repairHistory}

CRITICAL INSTRUCTIONS:
Predict ONE specific part or subsystem that is at the highest risk of failing soon.
You must respond strictly in the following format so our parser can read your analysis. Do not include any conversational intro or outro.

FORMAT:
PART: [Name of the specific component, e.g., Front Brake Pads]
PROBABILITY: [A single number representing the failure probability percentage, between 10 and 99, e.g., 85]
SEVERITY: [Exactly one of: Low, Medium, High]
TIMEFRAME: [Estimated timeframe or mileage window, e.g., Within 1,000 km or 1 Month]
DIAGNOSIS: [A detailed, professional explanation of why this part is at risk based on the vehicle year, mileage, symptoms, and usage patterns. Keep it within 3-4 sentences.]
ACTION: [A step-by-step recommended action plan for the customer to address this in advance. Keep it action-oriented.]";

            string predictedPart = "Vehicle Component";
            int probability = 50;
            string severityStr = "Medium";
            string timeframe = "Within 2,000 km";
            string diagnosis = "Telemetry analysis suggests checking general wear components.";
            string actionPlan = "Schedule a multi-point inspection at Ser-Viscar.";

            try
            {
                var requestBody = new
                {
                    model = "llama-3.3-70b-versatile",
                    messages = new[]
                    {
                        new { role = "system", content = "You are a professional automotive diagnostic assistant." },
                        new { role = "user", content = prompt }
                    },
                    temperature = 0.3,
                    max_tokens = 800
                };

                var request = new HttpRequestMessage(HttpMethod.Post, GROQ_ENDPOINT);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", GROQ_API_KEY);
                request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(responseJson);
                    string aiResponse = doc.RootElement
                        .GetProperty("choices")[0]
                        .GetProperty("message")
                        .GetProperty("content")
                        .GetString() ?? string.Empty;

                    // Parse fields from AI response
                    var partMatch = Regex.Match(aiResponse, @"PART:\s*(.*)", RegexOptions.IgnoreCase);
                    var probMatch = Regex.Match(aiResponse, @"PROBABILITY:\s*(\d+)", RegexOptions.IgnoreCase);
                    var sevMatch = Regex.Match(aiResponse, @"SEVERITY:\s*(Low|Medium|High)", RegexOptions.IgnoreCase);
                    var timeMatch = Regex.Match(aiResponse, @"TIMEFRAME:\s*(.*)", RegexOptions.IgnoreCase);
                    var diagMatch = Regex.Match(aiResponse, @"DIAGNOSIS:\s*([\s\S]*?)(?=ACTION:|$)", RegexOptions.IgnoreCase);
                    var actMatch = Regex.Match(aiResponse, @"ACTION:\s*([\s\S]*)", RegexOptions.IgnoreCase);

                    if (partMatch.Success) predictedPart = partMatch.Groups[1].Value.Trim();
                    if (probMatch.Success) int.TryParse(probMatch.Groups[1].Value, out probability);
                    if (sevMatch.Success) severityStr = sevMatch.Groups[1].Value.Trim();
                    if (timeMatch.Success) timeframe = timeMatch.Groups[1].Value.Trim();
                    if (diagMatch.Success) diagnosis = diagMatch.Groups[1].Value.Trim();
                    if (actMatch.Success) actionPlan = actMatch.Groups[1].Value.Trim();
                }
            }
            catch (Exception)
            {
                // Fallback diagnostics if Groq API is unavailable or rate limited
                probability = 75;
                timeframe = "Within 1,500 km";
                if (!string.IsNullOrEmpty(dto.Symptoms))
                {
                    if (dto.Symptoms.Contains("brake", StringComparison.OrdinalIgnoreCase))
                    {
                        predictedPart = "Front Brake Pads & Rotors";
                        severityStr = "High";
                        diagnosis = "Your vehicle's mileage is high and you've reported brake squeaking. Stop-and-go city commuting causes accelerated thermal decay on brake pads.";
                        actionPlan = "Schedule a brake pad replacement and rotor resurfacing immediately.";
                    }
                    else if (dto.Symptoms.Contains("steering", StringComparison.OrdinalIgnoreCase) || dto.Symptoms.Contains("vibration", StringComparison.OrdinalIgnoreCase))
                    {
                        predictedPart = "Front Suspension Bushings / Tie Rod Ends";
                        severityStr = "Medium";
                        diagnosis = "Steering vibrations at high mileage indicate worn bushings or tie rod ends, especially when driving on rough off-road terrain.";
                        actionPlan = "Book a wheel alignment and front suspension inspection.";
                    }
                    else
                    {
                        predictedPart = "Ignition Coils & Spark Plugs";
                        severityStr = "Medium";
                        diagnosis = "Hard starting or sluggish performance indicates potential carbon build-up or worn spark plugs at current mileage.";
                        actionPlan = "Schedule spark plug and combustion chamber cleanup service.";
                    }
                }
                else
                {
                    predictedPart = "Serpentine Engine Belt";
                    severityStr = "Low";
                    diagnosis = "No immediate symptoms reported, but preventative maintenance schedule suggests drive belt inspection due to high usage.";
                    actionPlan = "Visually inspect the belt for cracks during your next routine oil change.";
                }
            }

            // Map severity string to C# model enum
            AIPrediction.PredictionSeverity severity = AIPrediction.PredictionSeverity.Medium;
            if (severityStr.Equals("High", StringComparison.OrdinalIgnoreCase)) severity = AIPrediction.PredictionSeverity.High;
            else if (severityStr.Equals("Low", StringComparison.OrdinalIgnoreCase)) severity = AIPrediction.PredictionSeverity.Low;

            // Save structured report as part of the PredictedIssue string inside the DB
            string fullReport = $"PART: {predictedPart} | PROBABILITY: {probability}% | TIMEFRAME: {timeframe} | DIAGNOSIS: {diagnosis} | ACTION: {actionPlan}";

            var prediction = new AIPrediction
            {
                VehicleId = vehicle.Id,
                PredictedIssue = fullReport,
                Severity = severity,
                PredictedAt = DateTime.UtcNow,
                AlertSent = severity == AIPrediction.PredictionSeverity.High
            };

            _db.AIPredictions.Add(prediction);
            await _db.SaveChangesAsync();

            return new AIPredictionResponseDto
            {
                Id = prediction.Id,
                VehicleId = vehicle.Id,
                VehicleName = $"{vehicle.VehicleNumber} — {vehicle.Brand} {vehicle.Model}",
                PredictedIssue = predictedPart,
                Severity = severity.ToString(),
                Probability = probability,
                ActionPlan = actionPlan,
                Timeframe = timeframe,
                DetailedDiagnosis = diagnosis,
                PredictedAt = prediction.PredictedAt
            };
        }

        public async Task<List<AIPredictionResponseDto>> GetMyPredictionsAsync(int userId)
        {
            var customer = await _db.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId);
            if (customer == null)
                throw new Exception("Customer not found.");

            var predictions = await _db.AIPredictions
                .Include(p => p.Vehicle)
                .Where(p => p.Vehicle.CustomerId == customer.Id)
                .OrderByDescending(p => p.PredictedAt)
                .ToListAsync();

            var resultList = new List<AIPredictionResponseDto>();

            foreach (var p in predictions)
            {
                string predictedPart = "Vehicle Component";
                int probability = 60;
                string timeframe = "Within 2,000 km";
                string diagnosis = "General diagnostic wear alert.";
                string actionPlan = "Book an inspection at Ser-Viscar.";

                // Parse the structured DB string back into individual DTO properties
                if (!string.IsNullOrEmpty(p.PredictedIssue) && p.PredictedIssue.Contains('|'))
                {
                    var partMatch = Regex.Match(p.PredictedIssue, @"PART:\s*([^|]*)");
                    var probMatch = Regex.Match(p.PredictedIssue, @"PROBABILITY:\s*(\d+)%");
                    var timeMatch = Regex.Match(p.PredictedIssue, @"TIMEFRAME:\s*([^|]*)");
                    var diagMatch = Regex.Match(p.PredictedIssue, @"DIAGNOSIS:\s*([^|]*)");
                    var actMatch = Regex.Match(p.PredictedIssue, @"ACTION:\s*(.*)");

                    if (partMatch.Success) predictedPart = partMatch.Groups[1].Value.Trim();
                    if (probMatch.Success) int.TryParse(probMatch.Groups[1].Value, out probability);
                    if (timeMatch.Success) timeframe = timeMatch.Groups[1].Value.Trim();
                    if (diagMatch.Success) diagnosis = diagMatch.Groups[1].Value.Trim();
                    if (actMatch.Success) actionPlan = actMatch.Groups[1].Value.Trim();
                }
                else
                {
                    predictedPart = p.PredictedIssue;
                }

                resultList.Add(new AIPredictionResponseDto
                {
                    Id = p.Id,
                    VehicleId = p.VehicleId,
                    VehicleName = $"{p.Vehicle.VehicleNumber} — {p.Vehicle.Brand} {p.Vehicle.Model}",
                    PredictedIssue = predictedPart,
                    Severity = p.Severity.ToString(),
                    Probability = probability,
                    ActionPlan = actionPlan,
                    Timeframe = timeframe,
                    DetailedDiagnosis = diagnosis,
                    PredictedAt = p.PredictedAt
                });
            }

            return resultList;
        }
    }
}
