using System.ComponentModel.DataAnnotations;

namespace Ser_Viscar.Models
{
    /// <summary>
    /// Line item within a SalesInvoice — stores price snapshots.
    /// 
    /// TEAM INTEGRATION NOTES:
    /// ─────────────────────────────────────────────────────────
    /// • Chasita (F7): Creates items with price snapshots from Parts.
    /// • Irshad (F11): Includes item details in emailed invoices.
    /// • Chasita (F3): References Part entity for stock management.
    /// ─────────────────────────────────────────────────────────
    /// </summary>
    public class SalesInvoiceItem
    {
        public int Id { get; set; }

        public int SalesInvoiceId { get; set; }

        /// <summary>
        /// FK to the Part sold. Managed by Chasita (F3, F7).
        /// </summary>
        public int PartId { get; set; }

        /// <summary>
        /// Snapshot of the part name at time of sale for audit trail.
        /// </summary>
        [Required, MaxLength(150)]
        public string PartNameSnapshot { get; set; } = string.Empty;

        /// <summary>
        /// Snapshot of the unit price at time of sale.
        /// </summary>
        public decimal UnitPriceSnapshot { get; set; }

        public int Quantity { get; set; }

        /// <summary>
        /// Computed: Quantity × UnitPriceSnapshot.
        /// </summary>
        public decimal LineTotal { get; set; }

        // ── Navigation ──
        public SalesInvoice SalesInvoice { get; set; } = null!;

        // ══════════════════════════════════════════════════════════
        //  TODO (Chasita - F3): Add Part navigation property once
        //  the Part entity is created.
        //  public Part Part { get; set; } = null!;
        // ══════════════════════════════════════════════════════════
    }
}
