namespace Ser_Backend.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // LowStock, CreditReminder, NewAppointment, NewPartRequest, NewReview, etc.
        public string Message { get; set; } = string.Empty;
        public int RecipientId { get; set; }  // UserId
        public bool IsRead { get; set; } = false;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public string? NavigationRoute { get; set; } // Route to navigate to (e.g., /admin/appointments, /admin/part-requests-management)
        public int? RelatedEntityId { get; set; } // ID of the entity related to this notification (e.g., appointment ID, part request ID)
        public string? RelatedEntityType { get; set; } // Type of the related entity (e.g., Appointment, PartRequest, Review)

        public User Recipient { get; set; } = null!;
    }
}
