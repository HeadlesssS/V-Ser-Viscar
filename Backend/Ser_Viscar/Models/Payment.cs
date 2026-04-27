using System.ComponentModel.DataAnnotations;
using Ser_Viscar.Models.Enums;

namespace Ser_Viscar.Models
{
    /// <summary>
    /// Payment record for a sales invoice — handles credit and overdue tracking.
    /// 
    /// TEAM INTEGRATION NOTES:
    /// ─────────────────────────────────────────────────────────
    /// • Chasita (F7): Creates payment records during invoice creation.
    /// • Irshad (F9): Queries payments for pending-credit reports.
    /// • Chasita (F15): Uses IsOverdueByOneMonth() for email reminders.
    /// ─────────────────────────────────────────────────────────
    /// </summary>
    public class Payment
    {
        public int Id { get; set; }

        public int SalesInvoiceId { get; set; }

        public int CustomerId { get; set; }

        public decimal AmountDue { get; set; }

        public decimal AmountPaid { get; set; }

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// For credit payments — the date by which payment is expected.
        /// Used by Irshad (F9) for pending-credit reports and
        /// by Chasita (F15) for overdue email reminders.
        /// </summary>
        public DateTime? DueDate { get; set; }

        public PaymentMethod PaymentMethod { get; set; }

        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation ──
        public SalesInvoice SalesInvoice { get; set; } = null!;
        public Customer Customer { get; set; } = null!;

        // ── Domain Logic ──

        /// <summary>
        /// Business rule: Checks if this credit payment is overdue by more
        /// than 1 month. Used by F9 (Irshad) for reporting and 
        /// F15 (Chasita) for automated email reminders.
        /// </summary>
        public bool IsOverdueByOneMonth()
        {
            if (PaymentStatus == PaymentStatus.Paid)
                return false;

            if (!DueDate.HasValue)
                return false;

            return DueDate.Value.AddMonths(1) < DateTime.UtcNow;
        }

        /// <summary>
        /// Outstanding balance for this payment.
        /// </summary>
        public decimal OutstandingBalance => AmountDue - AmountPaid;
    }
}
