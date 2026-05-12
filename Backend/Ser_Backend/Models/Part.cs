namespace Ser_Backend.Models
{
    public class Part
    {
        public int Id { get; set; }
        public int VendorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal CostPrice { get; set; }
        public decimal SellingPrice { get; set; }
        public int StockQuantity { get; set; }
        public int LowStockThreshold { get; set; } = 10;
        public bool IsActive { get; set; } = true;

        public Vendor Vendor { get; set; } = null!;
        public ICollection<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } = [];
        public ICollection<SalesInvoiceItem> SalesInvoiceItems { get; set; } = [];
    }
}
