public class PurchaseInvoice
{
    public int Id { get; set; }

    public DateTime Date { get; set; }

    public int VendorId { get; set; }

    public decimal TotalAmount { get; set; }

    public Vendor? Vendor { get; set; } 
}