namespace Ser_Viscar.DTOs.Invoice
{
    // ═══════════════════════════════════════════════════════════
    //  Feature 11 (Irshad): Invoice Email DTOs
    //  Staff can send invoices via email to customers.
    // ═══════════════════════════════════════════════════════════

    /// <summary>
    /// Request DTO for sending an invoice email.
    /// </summary>
    public class SendInvoiceEmailRequestDto
    {
        /// <summary>
        /// Optional custom message to include in the email body.
        /// </summary>
        public string? CustomMessage { get; set; }

        /// <summary>
        /// Optional override for recipient email.
        /// If null, uses the customer's registered email.
        /// </summary>
        public string? RecipientEmailOverride { get; set; }
    }

    /// <summary>
    /// Response after sending an invoice email.
    /// </summary>
    public class SendInvoiceEmailResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string SentTo { get; set; } = string.Empty;
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
    }

    /// <summary>
    /// Full invoice detail DTO used when rendering invoice for email.
    /// Also useful for Chasita's (F14) purchase history display.
    /// </summary>
    public class InvoiceDetailDto
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }

        // Customer info
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;

        // Financial breakdown
        public decimal SubTotal { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public bool LoyaltyApplied { get; set; }

        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }

        // Staff who created it
        public string? CreatedByStaff { get; set; }

        // Line items
        public List<InvoiceItemDetailDto> Items { get; set; } = new();

        // Payment summary
        public decimal TotalPaid { get; set; }
        public decimal BalanceDue { get; set; }
    }

    /// <summary>
    /// Line item detail within an invoice.
    /// </summary>
    public class InvoiceItemDetailDto
    {
        public int Id { get; set; }
        public string PartName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
    }
}
