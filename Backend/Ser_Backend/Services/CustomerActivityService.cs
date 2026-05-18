using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.Appointment;
using Ser_Backend.DTO.PartRequests;
using Ser_Backend.DTO.Reviews;
using Ser_Backend.Models;

namespace Ser_Backend.Services.Implementations;

public class CustomerActivityService
{
    private readonly AppDbContext _db;

    public CustomerActivityService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<string> BookAppointmentAsync(int userId, CreateAppointmentDto dto)
    {
        // Get customer from userId
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null)
            throw new Exception("Customer profile not found.");

        var vehicle = await _db.Vehicles
            .FirstOrDefaultAsync(v => v.Id == dto.VehicleId && v.CustomerId == customer.Id);
        if (vehicle == null)
            throw new Exception("Vehicle not found or does not belong to you.");

        // Appointment must be in the future
        if (dto.AppointmentDate <= DateTime.UtcNow)
            throw new Exception("Appointment date must be in the future.");

        var appointment = new Appointment
        {
            CustomerId = customer.Id,
            VehicleId = dto.VehicleId,
            AppointmentDate = dto.AppointmentDate,
            ServiceType = dto.ServiceType,
            Notes = dto.Notes,
            Status = Appointment.AppointmentStatus.Pending
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        return "Appointment booked successfully.";
    }

    public async Task<List<AppointmentResponseDto>> GetMyAppointmentsAsync(int userId)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null)
            throw new Exception("Customer not found.");

        return await _db.Appointments
            .Include(a => a.Vehicle)
            .Where(a => a.CustomerId == customer.Id)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new AppointmentResponseDto
            {
                Id = a.Id,
                VehicleNumber = a.Vehicle.VehicleNumber,
                Make = a.Vehicle.Brand,
                Model = a.Vehicle.Model,
                AppointmentDate = a.AppointmentDate,
                ServiceType = a.ServiceType,
                Status = a.Status.ToString(),
                Notes = a.Notes
            })
            .ToListAsync();
    }

    // ── PART REQUESTS ─────────────────────────────────────

    public async Task<string> CreatePartRequestAsync(int userId, CreatePartRequestDto dto)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null)
            throw new Exception("Customer not found.");

        var request = new PartRequest
        {
            CustomerId = customer.Id,
            PartName = dto.PartName,
            Description = dto.Description,
            QuantityRequested = dto.QuantityRequested,
            Status = PartRequest.PartRequestStatus.Pending,
            RequestedAt = DateTime.UtcNow
        };

        _db.PartRequests.Add(request);
        await _db.SaveChangesAsync();

        return "Part request submitted successfully.";
    }

    public async Task<List<PartRequestResponseDto>> GetMyPartRequestsAsync(int userId)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null)
            throw new Exception("Customer not found.");

        return await _db.PartRequests
            .Where(p => p.CustomerId == customer.Id)
            .OrderByDescending(p => p.RequestedAt)
            .Select(p => new PartRequestResponseDto
            {
                Id = p.Id,
                PartName = p.PartName,
                Description = p.Description,
                QuantityRequested = p.QuantityRequested,
                Status = p.Status.ToString(),
                RequestedAt = p.RequestedAt
            })
            .ToListAsync();
    }

    public async Task<string> SubmitReviewAsync(int userId, CreateReviewDto dto)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null)
            throw new Exception("Customer not found.");

        if (dto.Rating < 1 || dto.Rating > 5)
            throw new Exception("Rating must be between 1 and 5.");

        var review = new Review
        {
            CustomerId = customer.Id,
            Rating = dto.Rating,
            Comment = dto.Comment,
            ReviewedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return "Review submitted successfully.";
    }

    public async Task<List<ReviewResponseDto>> GetAllReviewsAsync()
    {
        return await _db.Reviews
            .Include(r => r.Customer)
                .ThenInclude(c => c.User)
            .OrderByDescending(r => r.ReviewedAt)
            .Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                CustomerName = r.Customer.User.Name,
                Rating = r.Rating,
                Comment = r.Comment,
                ReviewedAt = r.ReviewedAt
            })
            .ToListAsync();
    }
}