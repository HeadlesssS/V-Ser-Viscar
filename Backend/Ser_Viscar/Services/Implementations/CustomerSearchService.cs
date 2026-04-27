using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.DTOs.Customer;
using Ser_Viscar.Models.Enums;
using Ser_Viscar.Services.Interfaces;

namespace Ser_Viscar.Services.Implementations
{
    // ═══════════════════════════════════════════════════════════════════
    //  Feature 10 (Irshad): Customer Search Service
    //  ─────────────────────────────────────────────────────────────────
    //  Marking Scheme: "Staff can search customers by vehicle number,
    //  phone, ID, or name" — 4 marks
    //  ─────────────────────────────────────────────────────────────────
    //  Search Strategy:
    //  1. Builds a single LINQ query with OR conditions
    //  2. Searches across Customer fields: FullName, Phone, Id
    //  3. Joins to Vehicles for LicensePlate matching
    //  4. Numeric terms also searched as Customer ID
    //  5. Results include vehicle summaries and purchase totals
    // ═══════════════════════════════════════════════════════════════════

    public class CustomerSearchService : ICustomerSearchService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<CustomerSearchService> _logger;

        public CustomerSearchService(
            ApplicationDbContext db,
            ILogger<CustomerSearchService> logger)
        {
            _db = db;
            _logger = logger;
        }

        /// <summary>
        /// Unified search: matches against name, phone, ID, and vehicle plate.
        /// Uses case-insensitive comparison via EF.Functions.ILike (PostgreSQL).
        /// </summary>
        public async Task<List<CustomerSearchResultDto>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                _logger.LogWarning("Empty search term received");
                return new List<CustomerSearchResultDto>();
            }

            var term = searchTerm.Trim();
            var pattern = $"%{term}%";

            // Try parsing as integer for ID-based search
            int? searchId = int.TryParse(term, out var parsedId) ? parsedId : null;

            _logger.LogInformation(
                "Customer search initiated — term: '{Term}', isNumeric: {IsNumeric}",
                term, searchId.HasValue);

            // ── Build the query with multiple OR conditions ──
            var query = _db.Customers
                .Include(c => c.Vehicles)
                .Include(c => c.SalesInvoices)
                .Include(c => c.Payments)
                .Where(c =>
                    // Match by name (case-insensitive)
                    EF.Functions.ILike(c.FullName, pattern) ||

                    // Match by phone number
                    EF.Functions.ILike(c.Phone, pattern) ||

                    // Match by email
                    EF.Functions.ILike(c.Email, pattern) ||

                    // Match by customer ID (exact match for numeric terms)
                    (searchId.HasValue && c.Id == searchId.Value) ||

                    // Match by vehicle license plate number
                    c.Vehicles.Any(v => EF.Functions.ILike(v.LicensePlate, pattern))
                );

            // ── Execute and map results ──
            var customers = await query
                .OrderBy(c => c.FullName)
                .Take(50) // Limit results to prevent overloading
                .ToListAsync();

            var results = customers.Select(c => new CustomerSearchResultDto
            {
                Id = c.Id,
                FullName = c.FullName,
                Email = c.Email,
                Phone = c.Phone,
                Address = c.Address,
                CreatedAt = c.CreatedAt,

                // Map vehicle summaries
                Vehicles = c.Vehicles.Select(v => new VehicleSummaryDto
                {
                    Id = v.Id,
                    Make = v.Make,
                    Model = v.Model,
                    Year = v.Year,
                    LicensePlate = v.LicensePlate
                }).ToList(),

                // Aggregate purchase data
                TotalSpent = c.SalesInvoices
                    .Where(i => i.Status != InvoiceStatus.Cancelled)
                    .Sum(i => i.TotalAmount),

                TotalPurchases = c.SalesInvoices
                    .Count(i => i.Status != InvoiceStatus.Cancelled),

                HasPendingCredits = c.Payments
                    .Any(p => p.PaymentStatus != PaymentStatus.Paid
                              && p.PaymentStatus != PaymentStatus.Cancelled)

            }).ToList();

            _logger.LogInformation(
                "Customer search completed — term: '{Term}', results: {Count}",
                term, results.Count);

            return results;
        }
    }
}
