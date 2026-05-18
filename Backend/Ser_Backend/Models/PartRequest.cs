namespace Ser_Backend.Models
{
    public class PartRequest
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string PartName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public int QuantityRequested { get; set; } = 1;
        public enum PartRequestStatus
        {
            Pending,
            Fulfilled,
            Rejected
        }
        public PartRequestStatus Status { get; set; }  = PartRequestStatus.Pending; // Pending, Fulfilled, Rejected
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        public Customer Customer { get; set; } = null!;
    }

}
