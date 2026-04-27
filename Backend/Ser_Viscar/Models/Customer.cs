using System.ComponentModel.DataAnnotations;

namespace Ser_Viscar.Models
{
    /// <summary>
    /// Customer entity — core model for the Customer & Vehicle domain.
    /// 
    /// TEAM INTEGRATION NOTES:
    /// ─────────────────────────────────────────────────────────
    /// • Pawan (F2, F6, F12): Will add staff-registration flow, 
    ///   self-registration endpoint, and password hashing logic.
    /// • Bhoj (F8, F13): Will add navigation to Appointments and 
    ///   eager-loading queries for customer detail views.
    /// • Irshad (F9, F10, F11): Uses this entity for customer search,
    ///   report generation, and invoice email sending.
    /// ─────────────────────────────────────────────────────────
    /// </summary>
    public class Customer
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Address { get; set; }

        /// <summary>
        /// Links to the Identity User for login purposes.
        /// Set by Pawan (F6, F12) during registration flows.
        /// </summary>
        public int? UserId { get; set; }

        /// <summary>
        /// Indicates if customer self-registered (F12 - Pawan) or was 
        /// registered by staff (F6 - Pawan).
        /// </summary>
        public bool IsSelfRegistered { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation Properties ──────────────────────────────

        public User? User { get; set; }

        /// <summary>
        /// Customer's vehicles — populated by Pawan (F6) during registration.
        /// Used by Irshad (F10) for vehicle-number-based search.
        /// </summary>
        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();

        /// <summary>
        /// All sales invoices for this customer.
        /// Used by Irshad (F9) for high-spender and regular-customer reports.
        /// Built by Chasita (F7) during sales invoice creation.
        /// </summary>
        public ICollection<SalesInvoice> SalesInvoices { get; set; } = new List<SalesInvoice>();

        /// <summary>
        /// Payment records linked through invoices.
        /// Used by Irshad (F9) for pending-credit reports.
        /// </summary>
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        // ══════════════════════════════════════════════════════════
        //  TODO (Bhoj - F13): Add navigation to Appointments collection
        //  public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        // ══════════════════════════════════════════════════════════
    }
}
