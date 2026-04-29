namespace Ser_Viscar.Models
{
    public class Part
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public PartCategory Category { get; set; } = null!;
        public decimal Price { get; set; }
        public int QuantityOnHand { get; set; }
        public int ReorderLevel { get; set; } = 10;
        public bool IsLowStock => QuantityOnHand < ReorderLevel;
        public ICollection<PurchaseInvoiceItem> PurchaseItems { get; set; } = new List<PurchaseInvoiceItem>();
        public ICollection<SalesInvoiceItem> SalesItems { get; set; } = new List<SalesInvoiceItem>();
    }
}
