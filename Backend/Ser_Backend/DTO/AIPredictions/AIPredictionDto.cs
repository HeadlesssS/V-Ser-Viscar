using System;

namespace Ser_Backend.DTO.AIPredictions
{
    public class RunAIPredictionDto
    {
        public int VehicleId { get; set; }
        public int Mileage { get; set; }
        public string UsagePattern { get; set; } = string.Empty;
        public string Symptoms { get; set; } = string.Empty;
    }

    public class AIPredictionResponseDto
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public string VehicleName { get; set; } = string.Empty;
        public string PredictedIssue { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public int Probability { get; set; }
        public string ActionPlan { get; set; } = string.Empty;
        public string Timeframe { get; set; } = string.Empty;
        public string DetailedDiagnosis { get; set; } = string.Empty;
        public DateTime PredictedAt { get; set; }
    }
}
