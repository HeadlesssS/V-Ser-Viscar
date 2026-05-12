namespace Ser_Backend.Models
{
    public class PurchaseInvoice
    {
        public int Id { get; set; }

        public int AdminId {  get; set; }

        public int VendorId { get; set; }

        public float TotalAmount { get; set; }

        public DateTime PurchaseDate { get; set; } = DateTime.Now;

        public string Notes { get; set; }   = string.Empty;

        public User Admin { get; set; } = null!;

        public Vendor Vendor { get; set; } = null;

        public ICollection<PurchaseInvoiceItem> Items { get; set; } = [];
    }
}
