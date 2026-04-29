namespace Ser_Viscar.Models
{
    public class SalesInvoice
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public Customer Customer { get; set; } = null!;
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public decimal SubTotal { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal TotalAmount { get; set; }
        public bool LoyaltyApplied { get; set; }
        public string PaymentMethod { get; set; } = "Cash"; // Cash, Credit, Card
        public string Status { get; set; } = "Paid"; // Paid, Credit
        public ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();

        public void RecalculateTotal()
        {
            if (SubTotal > 5000)
            {
                DiscountPercent = 10;
                LoyaltyApplied = true;
            }
            else
            {
                DiscountPercent = 0;
                LoyaltyApplied = false;
            }
            TotalAmount = SubTotal - (SubTotal * DiscountPercent / 100);
        }
    }
}
