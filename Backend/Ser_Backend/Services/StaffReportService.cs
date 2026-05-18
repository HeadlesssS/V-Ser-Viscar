using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.StaffReport;

namespace Ser_Backend.Services.Implementations
{
    /// <summary>
    /// Service that produces staff-facing customer reports:
    /// high spenders, regular customers, and pending credit balances.
    /// </summary>
    public class StaffReportService
    {
        private readonly AppDbContext _db;

        public StaffReportService(AppDbContext db)
        {
            _db = db;
        }

        // ------------------------------------------------------------------ //
        //  Feature 9-A: High Spenders                                         //
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Returns the top <paramref name="top"/> customers ordered by total
        /// amount spent (descending), together with their invoice count.
        /// </summary>
        /// <param name="top">Maximum number of records to return. Default 20.</param>
        public async Task<List<HighSpenderDto>> GetHighSpendersAsync(int top = 20)
        {
            if (top <= 0) top = 20;

            // Materialise in two steps so the invoice count sub-query is clean.
            var results = await _db.Customers
                .Include(c => c.User)
                .Where(c => c.User.isActive)
                .OrderByDescending(c => c.TotalSpent)
                .Take(top)
                .Select(c => new HighSpenderDto
                {
                    Id           = c.Id,
                    FullName     = c.User.Name ?? string.Empty,
                    Email        = c.User.Email,
                    Phone        = c.User.Phone,
                    TotalSpent   = c.TotalSpent,
                    LoyaltyTier  = c.LoyaltyTier,
                    InvoiceCount = c.SalesInvoices.Count()
                })
                .ToListAsync();

            return results;
        }

        // ------------------------------------------------------------------ //
        //  Feature 9-B: Regular Customers (most frequent buyers)              //
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Returns the top <paramref name="top"/> customers ordered by the
        /// number of sales invoices they have (descending).
        /// </summary>
        /// <param name="top">Maximum number of records to return. Default 20.</param>
        public async Task<List<RegularCustomerDto>> GetRegularCustomersAsync(int top = 20)
        {
            if (top <= 0) top = 20;

            // Project into an anonymous type first so we can materialise before
            // computing the nullable LastPurchaseDate in memory.
            var raw = await _db.Customers
                .Include(c => c.User)
                .Where(c => c.User.isActive)
                .Select(c => new
                {
                    c.Id,
                    FullName         = c.User.Name ?? string.Empty,
                    c.User.Email,
                    c.User.Phone,
                    c.TotalSpent,
                    InvoiceCount     = c.SalesInvoices.Count(),
                    LastPurchaseDate = (DateTime?)c.SalesInvoices
                                          .OrderByDescending(s => s.SaleDate)
                                          .Select(s => s.SaleDate)
                                          .FirstOrDefault()
                })
                .OrderByDescending(x => x.InvoiceCount)
                .Take(top)
                .ToListAsync();

            return raw.Select(x => new RegularCustomerDto
            {
                Id               = x.Id,
                FullName         = x.FullName,
                Email            = x.Email,
                Phone            = x.Phone,
                InvoiceCount     = x.InvoiceCount,
                TotalSpent       = x.TotalSpent,
                // If no invoices exist the default DateTime is the epoch –
                // treat that as "no purchase" (null).
                LastPurchaseDate = x.InvoiceCount > 0 ? x.LastPurchaseDate : null
            }).ToList();
        }

        // ------------------------------------------------------------------ //
        //  Feature 9-C: Pending Credits                                       //
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Returns all customers who have a positive <c>CreditBalance</c>,
        /// together with the date of their oldest unpaid credit invoice and the
        /// number of days that invoice is overdue.  Results are ordered by
        /// <c>OverdueDays</c> descending (most overdue first).
        /// </summary>
        public async Task<List<PendingCreditDto>> GetPendingCreditsAsync()
        {
            var now = DateTime.UtcNow;

            // Materialise first so we can compute OverdueDays in memory.
            var raw = await _db.Customers
                .Include(c => c.User)
                .Where(c => c.User.isActive && c.CreditBalance > 0)
                .Select(c => new
                {
                    c.Id,
                    FullName        = c.User.Name ?? string.Empty,
                    c.User.Email,
                    c.User.Phone,
                    c.CreditBalance,
                    OldestUnpaidDate = (DateTime?)c.SalesInvoices
                                           .Where(s => s.IsCredit && !s.IsPaid)
                                           .OrderBy(s => s.SaleDate)
                                           .Select(s => s.SaleDate)
                                           .FirstOrDefault()
                })
                .ToListAsync();

            return raw
                .Select(x => new PendingCreditDto
                {
                    Id              = x.Id,
                    FullName        = x.FullName,
                    Email           = x.Email,
                    Phone           = x.Phone,
                    CreditBalance   = x.CreditBalance,
                    // Guard against default(DateTime) when no unpaid invoice exists.
                    OldestUnpaidDate = x.OldestUnpaidDate == default(DateTime)
                                           ? null
                                           : x.OldestUnpaidDate,
                    OverdueDays     = x.OldestUnpaidDate.HasValue && x.OldestUnpaidDate != default(DateTime)
                                           ? (int)(now - x.OldestUnpaidDate.Value).TotalDays
                                           : (int?)null
                })
                .OrderByDescending(x => x.OverdueDays)
                .ToList();
        }
    }
}
