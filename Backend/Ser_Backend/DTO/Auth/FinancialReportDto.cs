namespace Ser_Backend.DTO.Report
{
    // Summary line per day/month/year period
    public class PeriodSummaryDto
    {
        public string Period { get; set; } = string.Empty;   // e.g. "2026-05-14" / "2026-05" / "2026"
        public decimal TotalSalesRevenue { get; set; }
        public decimal TotalPurchaseCost { get; set; }
        public decimal GrossProfit { get; set; }
        public int TotalSalesInvoices { get; set; }
        public int TotalPurchaseInvoices { get; set; }
        public int TotalUnitsSold { get; set; }
        public int TotalUnitsPurchased { get; set; }
    }

    // Full report response
    public class FinancialReportResponseDto
    {
        public string ReportType { get; set; } = string.Empty;  // "Daily" / "Monthly" / "Yearly"
        public DateTime GeneratedAt { get; set; }
        public decimal TotalSalesRevenue { get; set; }
        public decimal TotalPurchaseCost { get; set; }
        public decimal GrossProfit { get; set; }
        public int TotalSalesInvoices { get; set; }
        public int TotalPurchaseInvoices { get; set; }
        public int TotalUnitsSold { get; set; }
        public int TotalUnitsPurchased { get; set; }
        public decimal TotalDiscountsGiven { get; set; }
        public decimal TotalCreditSales { get; set; }
        public List<PeriodSummaryDto> Breakdown { get; set; } = [];
    }
}