namespace Ser_Viscar.Models
{
    public class SalesInvoiceItem
    {
        public int Id { get; set; }
        public int SalesInvoiceId { get; set; }
        public SalesInvoice Invoice { get; set; } = null!;
        public int PartId { get; set; }
        public Part Part { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; } // Price snapshot at time of sale
        public decimal LineTotal => Quantity * UnitPrice;
    }
}
