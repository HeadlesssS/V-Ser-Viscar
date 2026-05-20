namespace Ser_Backend.DTO.Appointment
{
    public class CreateAppointmentDto
    {
        public int VehicleId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string ServiceType { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class AppointmentResponseDto
    {
        public int Id { get; set; }
        public string VehicleNumber { get; set; } = string.Empty;
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string ServiceType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class AppointmentAdminDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string VehicleNumber { get; set; } = string.Empty;
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string ServiceType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class UpdateAppointmentStatusDto
    {
        public string Status { get; set; } = string.Empty; // Pending, Confirmed, Completed, Cancelled
    }
}
