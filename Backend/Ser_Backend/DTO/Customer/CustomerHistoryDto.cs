namespace Ser_Backend.DTOs.Customers;

public class CustomerHistoryDto
{
    public int InvoiceId { get; set; }
    public DateTime SaleDate { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public bool IsPaid { get; set; }
    public bool IsCredit { get; set; }
    public List<InvoiceItemDto> Items { get; set; } = [];
}

public class InvoiceItemDto
{
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal => Quantity * UnitPrice;
}