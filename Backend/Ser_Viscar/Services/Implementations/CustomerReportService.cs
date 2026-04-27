using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.DTOs.Report;
using Ser_Viscar.Models.Enums;
using Ser_Viscar.Services.Interfaces;

namespace Ser_Viscar.Services.Implementations
{
    // ═══════════════════════════════════════════════════════════════════
    //  Feature 9 (Irshad): Customer Report Service
    //  ─────────────────────────────────────────────────────────────────
    //  Marking Scheme: "Staff can generate customer-related reports
    //  (regulars, high spenders, pending credits)" — 4 marks
    //  ─────────────────────────────────────────────────────────────────
    //  Report Types:
    //  1. High Spenders    → Customers ranked by total spend
    //  2. Regular Customers → Customers ranked by purchase frequency
    //  3. Pending Credits   → Customers with overdue/unpaid balances
    //  ─────────────────────────────────────────────────────────────────
    //  All queries use LINQ with OrderByDescending, GroupBy, and Join
    //  operations across Customer, SalesInvoice, and Payment entities.
    // ═══════════════════════════════════════════════════════════════════

    public class CustomerReportService : ICustomerReportService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<CustomerReportService> _logger;

        public CustomerReportService(
            ApplicationDbContext db,
            ILogger<CustomerReportService> logger)
        {
            _db = db;
            _logger = logger;
        }

        // ──────────────────────────────────────────────────
        //  Report 1: High Spenders
        //  Ranks customers by total amount spent across all invoices.
        // ──────────────────────────────────────────────────
        public async Task<CustomerReportResponseDto> GetHighSpendersAsync(int top = 20)
        {
            _logger.LogInformation("Generating high-spender report — top {Top}", top);

            var spenders = await _db.Customers
                .Include(c => c.SalesInvoices)
                .Where(c => c.SalesInvoices.Any(i => i.Status != InvoiceStatus.Cancelled))
                .Select(c => new HighSpenderDto
                {
                    CustomerId = c.Id,
                    FullName = c.FullName,
                    Email = c.Email,
                    Phone = c.Phone,

                    TotalSpent = c.SalesInvoices
                        .Where(i => i.Status != InvoiceStatus.Cancelled)
                        .Sum(i => i.TotalAmount),

                    TotalInvoices = c.SalesInvoices
                        .Count(i => i.Status != InvoiceStatus.Cancelled),

                    AverageOrderValue = c.SalesInvoices
                        .Where(i => i.Status != InvoiceStatus.Cancelled)
                        .Average(i => i.TotalAmount),

                    // Customer qualifies for loyalty if any invoice had it applied
                    LoyaltyEligible = c.SalesInvoices
                        .Any(i => i.LoyaltyApplied)
                })
                .OrderByDescending(x => x.TotalSpent)
                .Take(top)
                .ToListAsync();

            _logger.LogInformation("High-spender report generated — {Count} results", spenders.Count);

            return new CustomerReportResponseDto
            {
                ReportType = "high_spenders",
                GeneratedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                TotalRecords = spenders.Count,
                Data = spenders
            };
        }

        // ──────────────────────────────────────────────────
        //  Report 2: Regular Customers
        //  Ranks customers by purchase frequency (number of invoices).
        // ──────────────────────────────────────────────────
        public async Task<CustomerReportResponseDto> GetRegularCustomersAsync(int top = 20)
        {
            _logger.LogInformation("Generating regular-customer report — top {Top}", top);

            var regulars = await _db.Customers
                .Include(c => c.SalesInvoices)
                .Where(c => c.SalesInvoices.Any(i => i.Status != InvoiceStatus.Cancelled))
                .Select(c => new
                {
                    Customer = c,
                    ValidInvoices = c.SalesInvoices
                        .Where(i => i.Status != InvoiceStatus.Cancelled)
                        .ToList()
                })
                .OrderByDescending(x => x.ValidInvoices.Count)
                .Take(top)
                .ToListAsync();

            var result = regulars.Select(x =>
            {
                var lastPurchase = x.ValidInvoices
                    .OrderByDescending(i => i.InvoiceDate)
                    .FirstOrDefault()?.InvoiceDate;

                return new RegularCustomerDto
                {
                    CustomerId = x.Customer.Id,
                    FullName = x.Customer.FullName,
                    Email = x.Customer.Email,
                    Phone = x.Customer.Phone,
                    TotalPurchases = x.ValidInvoices.Count,
                    TotalSpent = x.ValidInvoices.Sum(i => i.TotalAmount),
                    LastPurchaseDate = lastPurchase,
                    DaysSinceLastPurchase = lastPurchase.HasValue
                        ? (int)(DateTime.UtcNow - lastPurchase.Value).TotalDays
                        : null
                };
            }).ToList();

            _logger.LogInformation("Regular-customer report generated — {Count} results", result.Count);

            return new CustomerReportResponseDto
            {
                ReportType = "regular_customers",
                GeneratedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                TotalRecords = result.Count,
                Data = result
            };
        }

        // ──────────────────────────────────────────────────
        //  Report 3: Pending Credits
        //  Lists customers with unpaid credit balances.
        //  Highlights those overdue by more than 1 month.
        // ──────────────────────────────────────────────────
        public async Task<CustomerReportResponseDto> GetPendingCreditsAsync()
        {
            _logger.LogInformation("Generating pending-credit report");

            var pendingPayments = await _db.Payments
                .Include(p => p.Customer)
                .Include(p => p.SalesInvoice)
                .Where(p => p.PaymentStatus != PaymentStatus.Paid
                         && p.PaymentStatus != PaymentStatus.Cancelled)
                .ToListAsync();

            // Group by customer for aggregation
            var grouped = pendingPayments
                .GroupBy(p => p.CustomerId)
                .Select(g =>
                {
                    var customer = g.First().Customer;
                    var payments = g.ToList();

                    return new PendingCreditDto
                    {
                        CustomerId = customer.Id,
                        FullName = customer.FullName,
                        Email = customer.Email,
                        Phone = customer.Phone,

                        TotalOutstanding = payments.Sum(p => p.OutstandingBalance),

                        PendingInvoiceCount = payments
                            .Select(p => p.SalesInvoiceId)
                            .Distinct()
                            .Count(),

                        OldestDueDate = payments
                            .Where(p => p.DueDate.HasValue)
                            .OrderBy(p => p.DueDate)
                            .FirstOrDefault()?.DueDate,

                        // Flag overdue using the domain method on Payment entity
                        IsOverdue = payments.Any(p => p.IsOverdueByOneMonth()),

                        PendingPayments = payments.Select(p => new PendingPaymentDetailDto
                        {
                            PaymentId = p.Id,
                            InvoiceNumber = p.SalesInvoice?.InvoiceNumber ?? "N/A",
                            AmountDue = p.AmountDue,
                            AmountPaid = p.AmountPaid,
                            OutstandingBalance = p.OutstandingBalance,
                            DueDate = p.DueDate,
                            IsOverdue = p.IsOverdueByOneMonth(),
                            DaysOverdue = p.DueDate.HasValue && p.DueDate.Value < DateTime.UtcNow
                                ? (int)(DateTime.UtcNow - p.DueDate.Value).TotalDays
                                : null
                        }).ToList()
                    };
                })
                // Show overdue customers first, then by outstanding amount
                .OrderByDescending(x => x.IsOverdue)
                .ThenByDescending(x => x.TotalOutstanding)
                .ToList();

            _logger.LogInformation("Pending-credit report generated — {Count} customers", grouped.Count);

            return new CustomerReportResponseDto
            {
                ReportType = "pending_credits",
                GeneratedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                TotalRecords = grouped.Count,
                Data = grouped
            };
        }
    }
}
