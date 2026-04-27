using System.ComponentModel.DataAnnotations;
using Ser_Viscar.Models.Enums;

namespace Ser_Viscar.Models
{
    /// <summary>
    /// Sales Invoice entity — tracks vehicle parts sold to customers.
    /// 
    /// TEAM INTEGRATION NOTES:
    /// ─────────────────────────────────────────────────────────
    /// • Chasita (F7): Creates sales invoices, calculates totals.
    /// • Chasita (F16): Implements loyalty discount logic here.
    /// • Irshad (F9): Queries invoices for high-spender/regular reports.
    /// • Irshad (F11): Sends invoice details via email to customer.
    /// • Chasita (F14): Returns customer purchase/service history.
    /// ─────────────────────────────────────────────────────────
    /// </summary>
    public class SalesInvoice
    {
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string InvoiceNumber { get; set; } = string.Empty;

        public int CustomerId { get; set; }

        /// <summary>
        /// Staff member who created this invoice.
        /// </summary>
        public int? CreatedByUserId { get; set; }

        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

        public decimal SubTotal { get; set; }

        /// <summary>
        /// Loyalty discount percentage (10% if SubTotal > 5000).
        /// Implemented by Chasita (F16).
        /// </summary>
        public decimal DiscountPercent { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal TotalAmount { get; set; }

        /// <summary>
        /// Whether loyalty discount was applied (F16 - Chasita).
        /// </summary>
        public bool LoyaltyApplied { get; set; }

        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation ──
        public Customer Customer { get; set; } = null!;
        public User? CreatedByUser { get; set; }
        public ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        // ══════════════════════════════════════════════════════════
        //  TODO (Chasita - F7/F16): Add RecalculateTotal() method
        //  that applies loyalty discount when SubTotal > 5000.
        //  public void RecalculateTotal() { ... }
        // ══════════════════════════════════════════════════════════
    }
}
