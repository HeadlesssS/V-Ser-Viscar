namespace Ser_Viscar.DTOs.Report
{
    // ═══════════════════════════════════════════════════════════
    //  Feature 9 (Irshad): Customer Report DTOs
    //  Staff can generate customer-related reports:
    //  • Regular customers (most purchases)
    //  • High spenders (most money spent)
    //  • Pending credits (overdue payments)
    // ═══════════════════════════════════════════════════════════

    /// <summary>
    /// Wrapper response for all customer report types.
    /// </summary>
    public class CustomerReportResponseDto
    {
        public string ReportType { get; set; } = string.Empty;
        public string GeneratedAt { get; set; } = string.Empty;
        public int TotalRecords { get; set; }

        /// <summary>
        /// Report data — shape depends on ReportType.
        /// </summary>
        public object Data { get; set; } = null!;
    }

    /// <summary>
    /// High-spender report entry — customers ranked by total spend.
    /// </summary>
    public class HighSpenderDto
    {
        public int CustomerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public decimal TotalSpent { get; set; }
        public int TotalInvoices { get; set; }
        public decimal AverageOrderValue { get; set; }

        /// <summary>
        /// Whether customer qualifies for loyalty discount (spent > 5000 on any single purchase).
        /// </summary>
        public bool LoyaltyEligible { get; set; }
    }

    /// <summary>
    /// Regular customer report entry — customers ranked by purchase frequency.
    /// </summary>
    public class RegularCustomerDto
    {
        public int CustomerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int TotalPurchases { get; set; }
        public decimal TotalSpent { get; set; }
        public DateTime? LastPurchaseDate { get; set; }

        /// <summary>
        /// Days since last purchase — helps identify customers who may need follow-up.
        /// </summary>
        public int? DaysSinceLastPurchase { get; set; }
    }

    /// <summary>
    /// Pending credit report entry — customers with unpaid balances.
    /// </summary>
    public class PendingCreditDto
    {
        public int CustomerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        /// <summary>
        /// Total outstanding credit balance across all invoices.
        /// </summary>
        public decimal TotalOutstanding { get; set; }

        /// <summary>
        /// Number of invoices with pending payments.
        /// </summary>
        public int PendingInvoiceCount { get; set; }

        /// <summary>
        /// Oldest unpaid due date — used to determine urgency.
        /// </summary>
        public DateTime? OldestDueDate { get; set; }

        /// <summary>
        /// True if any payment is overdue by more than 1 month.
        /// Triggers visual alert in the UI.
        /// </summary>
        public bool IsOverdue { get; set; }

        /// <summary>
        /// Individual pending payment records for detail view.
        /// </summary>
        public List<PendingPaymentDetailDto> PendingPayments { get; set; } = new();
    }

    /// <summary>
    /// Detail of a single pending payment within a credit report.
    /// </summary>
    public class PendingPaymentDetailDto
    {
        public int PaymentId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public decimal AmountDue { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal OutstandingBalance { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsOverdue { get; set; }
        public int? DaysOverdue { get; set; }
    }
}
