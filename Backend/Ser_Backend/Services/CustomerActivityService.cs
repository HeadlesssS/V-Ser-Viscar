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

        // Notify all Admins about the new appointment
        var admins = await _db.Users.Where(u => u.Role == User.UserRole.Admin).ToListAsync();
        foreach (var admin in admins)
        {
            _db.Notifications.Add(new Notification
            {
                Type = "NewAppointment",
                Message = $"New appointment booked for {appointment.ServiceType} on {appointment.AppointmentDate:dd MMM yyyy}.",
                RecipientId = admin.Id,
                IsRead = false,
                SentAt = DateTime.UtcNow
            });
        }
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

        // Notify all Admins about the new part request
        var admins = await _db.Users.Where(u => u.Role == User.UserRole.Admin).ToListAsync();
        foreach (var admin in admins)
        {
            _db.Notifications.Add(new Notification
            {
                Type = "NewPartRequest",
                Message = $"New part request: '{request.PartName}' (x{request.QuantityRequested}).",
                RecipientId = admin.Id,
                IsRead = false,
                SentAt = DateTime.UtcNow
            });
        }
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

        // Check: customer must have at least one Confirmed or Completed appointment
        var hasValidAppointment = await _db.Appointments
            .AnyAsync(a => a.CustomerId == customer.Id &&
                (a.Status == Appointment.AppointmentStatus.Confirmed ||
                 a.Status == Appointment.AppointmentStatus.Completed));
        if (!hasValidAppointment)
            throw new Exception("You need a confirmed or completed appointment before writing a review.");

        // Check: one review per customer
        var existingReview = await _db.Reviews.AnyAsync(r => r.CustomerId == customer.Id);
        if (existingReview)
            throw new Exception("You have already submitted a review. Each customer can only submit one review.");

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
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.User.Name,
                Rating = r.Rating,
                Comment = r.Comment,
                ReviewedAt = r.ReviewedAt
            })
            .ToListAsync();
    }

    public async Task<string> DeleteReviewAsync(int reviewId)
    {
        var review = await _db.Reviews.FindAsync(reviewId);
        if (review == null)
            throw new Exception("Review not found.");
        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();
        return "Review deleted successfully.";
    }

    public async Task<object> CanReviewAsync(int userId)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null)
            return new { canReview = false, hasExistingReview = false, hasValidAppointment = false, reason = "Customer not found." };

        var hasValidAppointment = await _db.Appointments
            .AnyAsync(a => a.CustomerId == customer.Id &&
                (a.Status == Appointment.AppointmentStatus.Confirmed ||
                 a.Status == Appointment.AppointmentStatus.Completed));

        var existingReview = await _db.Reviews.FirstOrDefaultAsync(r => r.CustomerId == customer.Id);

        return new
        {
            canReview = hasValidAppointment && existingReview == null,
            hasExistingReview = existingReview != null,
            hasValidAppointment,
            reason = !hasValidAppointment
                ? "You need a confirmed or completed appointment."
                : existingReview != null
                    ? "You have already submitted a review."
                    : (string?)null
        };
    }

    public async Task<ReviewResponseDto?> GetMyReviewAsync(int userId)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return null;

        return await _db.Reviews
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .Where(r => r.CustomerId == customer.Id)
            .Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.User.Name,
                Rating = r.Rating,
                Comment = r.Comment,
                ReviewedAt = r.ReviewedAt
            })
            .FirstOrDefaultAsync();
    }

    // ── ADMIN / STAFF METHODS ──────────────────────────────

    public async Task<List<AppointmentAdminDto>> GetAllAppointmentsAsync()
    {
        return await _db.Appointments
            .Include(a => a.Vehicle)
            .Include(a => a.Customer).ThenInclude(c => c.User)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new AppointmentAdminDto
            {
                Id = a.Id,
                CustomerName = a.Customer.User.Name ?? "Unknown",
                CustomerPhone = a.Customer.User.Phone ?? "",
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

    public async Task<string> UpdateAppointmentStatusAsync(int appointmentId, string status)
    {
        var appointment = await _db.Appointments
            .Include(a => a.Customer).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);
        if (appointment == null)
            throw new Exception("Appointment not found.");

        if (!Enum.TryParse<Appointment.AppointmentStatus>(status, out var parsed))
            throw new Exception("Invalid status.");

        appointment.Status = parsed;
        await _db.SaveChangesAsync();

        // Create a bell notification for the customer
        var notification = new Notification
        {
            Type = "AppointmentUpdate",
            Message = $"Your appointment for {appointment.ServiceType} on {appointment.AppointmentDate:dd MMM yyyy} has been {status}.",
            RecipientId = appointment.Customer.UserId,
            IsRead = false,
            SentAt = DateTime.UtcNow
        };
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        return $"Appointment status updated to {status}.";
    }

    public async Task<List<PartRequestAdminDto>> GetAllPartRequestsAsync()
    {
        return await _db.PartRequests
            .Include(p => p.Customer).ThenInclude(c => c.User)
            .OrderByDescending(p => p.RequestedAt)
            .Select(p => new PartRequestAdminDto
            {
                Id = p.Id,
                CustomerName = p.Customer.User.Name ?? "Unknown",
                PartName = p.PartName,
                Description = p.Description,
                QuantityRequested = p.QuantityRequested,
                Status = p.Status.ToString(),
                RequestedAt = p.RequestedAt
            })
            .ToListAsync();
    }

    public async Task<string> UpdatePartRequestStatusAsync(int requestId, string status)
    {
        var request = await _db.PartRequests
            .Include(p => p.Customer).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(p => p.Id == requestId);
        if (request == null)
            throw new Exception("Part request not found.");

        if (!Enum.TryParse<PartRequest.PartRequestStatus>(status, out var parsed))
            throw new Exception("Invalid status.");

        request.Status = parsed;
        await _db.SaveChangesAsync();

        // Notify the customer
        var notification = new Notification
        {
            Type = "PartRequestUpdate",
            Message = $"Your request for '{request.PartName}' has been {status}.",
            RecipientId = request.Customer.UserId,
            IsRead = false,
            SentAt = DateTime.UtcNow
        };
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        return $"Part request status updated to {status}.";
    }
}
