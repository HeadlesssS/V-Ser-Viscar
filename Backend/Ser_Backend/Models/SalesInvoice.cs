namespace Ser_Backend.Models
{
    public class SalesInvoice
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public int CustomerId { get; set; }
        public decimal Subtotal { get; set; }
        public decimal DiscountAmount { get; set; } = 0;
        public decimal TotalAmount { get; set; }
        public bool IsCredit { get; set; } = false;
        public bool IsPaid { get; set; } = true;
        public bool EmailSent { get; set; } = false;
        public DateTime SaleDate { get; set; } = DateTime.UtcNow;


        public Staff Staff { get; set; } = null!;
        public Customer Customer { get; set; } = null!;
        public ICollection<SalesInvoiceItem> Items { get; set; } = [];
    }
}
