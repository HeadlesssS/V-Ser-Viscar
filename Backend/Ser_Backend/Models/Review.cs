namespace Ser_Backend.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; } = string.Empty;
        public DateTime ReviewedAt { get; set; } = DateTime.Now;


        public Customer Customer { get; set; } = null!;
    }
}
