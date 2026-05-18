using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.Report;

namespace Ser_Backend.Services.Implementations
{
    public class FinancialReportService
    {
        private readonly AppDbContext _db;

        public FinancialReportService(AppDbContext db)
        {
            _db = db;
        }

        // DAILY report — single day report for a specific year, month, day
        public async Task<FinancialReportResponseDto> GetDailyReportAsync(int year, int month, int day)
        {
            var salesInvoices = await _db.SalesInvoices
                .Include(s => s.Items)
                .Where(s => s.SaleDate.Year == year
                         && s.SaleDate.Month == month
                         && s.SaleDate.Day == day)
                .ToListAsync();

            var purchaseInvoices = await _db.PurchaseInvoices
                .Include(p => p.Items)
                .Where(p => p.PurchaseDate.Year == year
                         && p.PurchaseDate.Month == month
                         && p.PurchaseDate.Day == day)
                .ToListAsync();

            var salesRevenue = salesInvoices.Sum(s => s.TotalAmount);
            var purchaseCost = purchaseInvoices.Sum(p => (decimal)p.TotalAmount);

            // Single row in breakdown for the selected day
            var breakdown = new List<PeriodSummaryDto>
            {
                new PeriodSummaryDto
                {
                    Period = $"{year}-{month:D2}-{day:D2}",
                    TotalSalesRevenue = salesRevenue,
                    TotalPurchaseCost = purchaseCost,
                    GrossProfit = salesRevenue - purchaseCost,
                    TotalSalesInvoices = salesInvoices.Count,
                    TotalPurchaseInvoices = purchaseInvoices.Count,
                    TotalUnitsSold = salesInvoices.SelectMany(s => s.Items).Sum(i => i.Quantity),
                    TotalUnitsPurchased = purchaseInvoices.SelectMany(p => p.Items).Sum(i => i.Quantity),
                }
            };

            return BuildReport("Daily", salesInvoices, purchaseInvoices, breakdown);
        }

        // MONTHLY report — single month report for a specific year and month
        public async Task<FinancialReportResponseDto> GetMonthlyReportAsync(int year, int month)
        {
            var salesInvoices = await _db.SalesInvoices
                .Include(s => s.Items)
                .Where(s => s.SaleDate.Year == year
                         && s.SaleDate.Month == month)
                .ToListAsync();

            var purchaseInvoices = await _db.PurchaseInvoices
                .Include(p => p.Items)
                .Where(p => p.PurchaseDate.Year == year
                         && p.PurchaseDate.Month == month)
                .ToListAsync();

            var salesRevenue = salesInvoices.Sum(s => s.TotalAmount);
            var purchaseCost = purchaseInvoices.Sum(p => (decimal)p.TotalAmount);

            // Single row for the selected month
            var breakdown = new List<PeriodSummaryDto>
            {
                new PeriodSummaryDto
                {
                    Period = $"{year}-{month:D2}",
                    TotalSalesRevenue = salesRevenue,
                    TotalPurchaseCost = purchaseCost,
                    GrossProfit = salesRevenue - purchaseCost,
                    TotalSalesInvoices = salesInvoices.Count,
                    TotalPurchaseInvoices = purchaseInvoices.Count,
                    TotalUnitsSold = salesInvoices.SelectMany(s => s.Items).Sum(i => i.Quantity),
                    TotalUnitsPurchased = purchaseInvoices.SelectMany(p => p.Items).Sum(i => i.Quantity),
                }
            };

            return BuildReport("Monthly", salesInvoices, purchaseInvoices, breakdown);
        }

        // YEARLY report — breakdown per year for a given range
        public async Task<FinancialReportResponseDto> GetYearlyReportAsync(int fromYear, int toYear)
        {
            var salesInvoices = await _db.SalesInvoices
                .Include(s => s.Items)
                .Where(s => s.SaleDate.Year >= fromYear && s.SaleDate.Year <= toYear)
                .ToListAsync();

            var purchaseInvoices = await _db.PurchaseInvoices
                .Include(p => p.Items)
                .Where(p => p.PurchaseDate.Year >= fromYear && p.PurchaseDate.Year <= toYear)
                .ToListAsync();

            var salesByYear = salesInvoices
                .GroupBy(s => s.SaleDate.Year)
                .ToDictionary(g => g.Key, g => g.ToList());

            var purchasesByYear = purchaseInvoices
                .GroupBy(p => p.PurchaseDate.Year)
                .ToDictionary(g => g.Key, g => g.ToList());

            var breakdown = new List<PeriodSummaryDto>();

            for (int year = fromYear; year <= toYear; year++)
            {
                var yearSales = salesByYear.GetValueOrDefault(year, []);
                var yearPurchases = purchasesByYear.GetValueOrDefault(year, []);

                var salesRevenue = yearSales.Sum(s => s.TotalAmount);
                var purchaseCost = yearPurchases.Sum(p => (decimal)p.TotalAmount);

                breakdown.Add(new PeriodSummaryDto
                {
                    Period = $"{year}",
                    TotalSalesRevenue = salesRevenue,
                    TotalPurchaseCost = purchaseCost,
                    GrossProfit = salesRevenue - purchaseCost,
                    TotalSalesInvoices = yearSales.Count,
                    TotalPurchaseInvoices = yearPurchases.Count,
                    TotalUnitsSold = yearSales.SelectMany(s => s.Items).Sum(i => i.Quantity),
                    TotalUnitsPurchased = yearPurchases.SelectMany(p => p.Items).Sum(i => i.Quantity),
                });
            }

            return BuildReport("Yearly", salesInvoices, purchaseInvoices, breakdown);
        }

        // Shared helper — builds the top-level report from raw data
        private static FinancialReportResponseDto BuildReport(
            string reportType,
            List<Models.SalesInvoice> salesInvoices,
            List<Models.PurchaseInvoice> purchaseInvoices,
            List<PeriodSummaryDto> breakdown)
        {
            var totalSalesRevenue = salesInvoices.Sum(s => s.TotalAmount);
            var totalPurchaseCost = purchaseInvoices.Sum(p => (decimal)p.TotalAmount);

            return new FinancialReportResponseDto
            {
                ReportType = reportType,
                GeneratedAt = DateTime.UtcNow,
                TotalSalesRevenue = totalSalesRevenue,
                TotalPurchaseCost = totalPurchaseCost,
                GrossProfit = totalSalesRevenue - totalPurchaseCost,
                TotalSalesInvoices = salesInvoices.Count,
                TotalPurchaseInvoices = purchaseInvoices.Count,
                TotalUnitsSold = salesInvoices.SelectMany(s => s.Items).Sum(i => i.Quantity),
                TotalUnitsPurchased = purchaseInvoices.SelectMany(p => p.Items).Sum(i => i.Quantity),
                TotalDiscountsGiven = salesInvoices.Sum(s => s.DiscountAmount),
                TotalCreditSales = salesInvoices.Where(s => s.IsCredit).Sum(s => s.TotalAmount),
                Breakdown = breakdown,
            };
        }
    }
}
