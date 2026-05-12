namespace Ser_Backend.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // LowStock, CreditReminder
        public string Message { get; set; } = string.Empty;
        public int RecipientId { get; set; }  // UserId
        public bool IsRead { get; set; } = false;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public User Recipient { get; set; } = null!;
    }
}
