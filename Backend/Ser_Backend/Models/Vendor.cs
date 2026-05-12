namespace Ser_Backend.Models
{
    public class Vendor
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public ICollection<Part> Parts { get; set; } = [];
        public ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = [];
    }
}
