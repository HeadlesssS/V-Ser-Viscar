using System.ComponentModel.DataAnnotations;

namespace Ser_Viscar.Models
{
    /// <summary>
    /// Vehicle entity — linked to a Customer.
    /// 
    /// TEAM INTEGRATION NOTES:
    /// ─────────────────────────────────────────────────────────
    /// • Pawan (F6): Registers vehicles during customer registration.
    /// • Pawan (F12): Allows customer to manage vehicle details.
    /// • Bhoj (F8): Displays vehicle info in customer detail view.
    /// • Irshad (F10): Searches customers by vehicle LicensePlate.
    /// ─────────────────────────────────────────────────────────
    /// </summary>
    public class Vehicle
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        [Required, MaxLength(50)]
        public string Make { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Model { get; set; } = string.Empty;

        public int? Year { get; set; }

        /// <summary>
        /// Vehicle registration/license plate number.
        /// Used by Irshad (F10) for vehicle-number search.
        /// </summary>
        [Required, MaxLength(30)]
        public string LicensePlate { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? VIN { get; set; }

        public int? Mileage { get; set; }

        public DateTime? LastServiceDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation ──
        public Customer Customer { get; set; } = null!;
    }
}
