namespace Ser_Viscar.DTOs.Customer
{
    // ═══════════════════════════════════════════════════════════
    //  Feature 10 (Irshad): Customer Search DTOs
    //  Staff can search customers by vehicle number, phone, ID, or name
    // ═══════════════════════════════════════════════════════════

    /// <summary>
    /// Response DTO for customer search results.
    /// Returns matched customers with their vehicle and purchase summary.
    /// </summary>
    public class CustomerSearchResultDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Summary of this customer's vehicles (for quick reference).
        /// </summary>
        public List<VehicleSummaryDto> Vehicles { get; set; } = new();

        /// <summary>
        /// Total amount spent across all invoices.
        /// Useful for staff to gauge customer value at a glance.
        /// </summary>
        public decimal TotalSpent { get; set; }

        /// <summary>
        /// Number of completed purchases.
        /// </summary>
        public int TotalPurchases { get; set; }

        /// <summary>
        /// Whether the customer has any pending credit payments.
        /// </summary>
        public bool HasPendingCredits { get; set; }
    }

    /// <summary>
    /// Compact vehicle summary shown in search results.
    /// </summary>
    public class VehicleSummaryDto
    {
        public int Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int? Year { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
    }
}
