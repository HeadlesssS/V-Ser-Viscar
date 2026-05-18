namespace Ser_Backend.DTO.PurchaseInvoice
{
    // Single item inside a purchase invoice request
    public class PurchaseInvoiceItemRequestDto
    {
        public int PartId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitCost { get; set; }
    }

    // Create request
    public class PurchaseInvoiceRequestDto
    {
        public int AdminId { get; set; }
        public int VendorId { get; set; }
        public string Notes { get; set; } = string.Empty;
        public List<PurchaseInvoiceItemRequestDto> Items { get; set; } = [];
    }

    // Single item in response
    public class PurchaseInvoiceItemResponseDto
    {
        public int Id { get; set; }
        public int PartId { get; set; }
        public string PartName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public decimal LineTotal { get; set; }
    }

    // Full invoice response
    public class PurchaseInvoiceResponseDto
    {
        public int Id { get; set; }
        public int AdminId { get; set; }
        public string AdminName { get; set; } = string.Empty;
        public int VendorId { get; set; }
        public string VendorName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime PurchaseDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public List<PurchaseInvoiceItemResponseDto> Items { get; set; } = [];
    }
}