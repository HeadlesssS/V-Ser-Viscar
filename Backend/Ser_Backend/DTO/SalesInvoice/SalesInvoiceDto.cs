namespace Ser_Backend.DTO.SalesInvoice
{
    public class SalesInvoiceItemRequestDto
    {
        public int PartId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class SalesInvoiceRequestDto
    {
        public int CustomerId { get; set; }
        public int StaffId { get; set; }
        public bool IsCredit { get; set; } = false;
        public List<SalesInvoiceItemRequestDto> Items { get; set; } = [];
    }

    public class SalesInvoiceItemResponseDto
    {
        public int Id { get; set; }
        public int PartId { get; set; }
        public string PartName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }

    public class SalesInvoiceResponseDto
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        /// <summary>Customer's email address – used by <c>EmailService</c>.</summary>
        public string CustomerEmail { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public bool IsCredit { get; set; }
        public bool IsPaid { get; set; }
        public bool EmailSent { get; set; }
        public bool LoyaltyDiscountApplied { get; set; }
        public DateTime SaleDate { get; set; }
        public List<SalesInvoiceItemResponseDto> Items { get; set; } = [];
    }
}
