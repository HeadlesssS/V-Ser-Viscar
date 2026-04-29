namespace Ser_Viscar.Models
{
    public class PurchaseInvoiceItem
    {
        public int Id { get; set; }
        public int PurchaseInvoiceId { get; set; }
        public PurchaseInvoice Invoice { get; set; } = null!;
        public int PartId { get; set; }
        public Part Part { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public decimal LineTotal => Quantity * UnitCost;
    }
}
