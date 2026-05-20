namespace Ser_Backend.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }  // Who performed the action (null for system actions)
        public string Action { get; set; } = string.Empty;  // Create, Update, Delete, Login, etc.
        public string EntityType { get; set; } = string.Empty;  // Part, Customer, Appointment, etc.
        public int? EntityId { get; set; }  // ID of the entity that was affected
        public string OldValues { get; set; } = string.Empty;  // JSON of previous values for updates
        public string NewValues { get; set; } = string.Empty;  // JSON of new values
        public string Description { get; set; } = string.Empty;  // Human-readable description
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? IpAddress { get; set; }  // IP address of the request
        public string? UserAgent { get; set; }  // Browser/client info
        public string Status { get; set; } = "Success";  // Success or Failed

        public User? User { get; set; }
    }
}
