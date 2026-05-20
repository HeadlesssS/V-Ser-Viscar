using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ser_Backend.Services;

namespace Ser_Backend.Controllers
{
    [ApiController]
    [Route("api/pdf")]
    [Authorize]
    public class PdfController : ControllerBase
    {
        private readonly PdfService _pdf;
        private readonly ILogger<PdfController> _logger;

        public PdfController(PdfService pdf, ILogger<PdfController> logger)
        {
            _pdf = pdf;
            _logger = logger;
        }

        private IActionResult PdfFile(byte[] bytes, string filename) =>
            File(bytes, "application/pdf", filename.EndsWith(".pdf") ? filename : $"{filename}.pdf");

        private async Task<IActionResult> SafePdf(Func<Task<byte[]>> generate, string filename)
        {
            try
            {
                return PdfFile(await generate(), filename);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PDF generation failed for {Filename}", filename);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ── Sales invoices (Admin + Staff) ────────────────────────────────

        [HttpGet("sales-invoices")]
        [Authorize(Roles = "Admin,Staff")]
        public Task<IActionResult> SalesInvoicesList() =>
            SafePdf(_pdf.SalesInvoicesListAsync, "sales-invoices.pdf");

        [HttpGet("sales-invoice/{id:int}")]
        [Authorize(Roles = "Admin,Staff")]
        public Task<IActionResult> SalesInvoice(int id) =>
            SafePdf(() => _pdf.SalesInvoiceAsync(id), $"sales-invoice-{id}.pdf");

        // ── Purchase invoices (Admin) ─────────────────────────────────────

        [HttpGet("purchase-invoices")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PurchaseInvoicesList() =>
            PdfFile(await _pdf.PurchaseInvoicesListAsync(), "purchase-invoices.pdf");

        [HttpGet("purchase-invoice/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PurchaseInvoice(int id) =>
            PdfFile(await _pdf.PurchaseInvoiceAsync(id), $"purchase-invoice-{id}.pdf");

        // ── Financial reports (Admin) ─────────────────────────────────────

        [HttpGet("financial/daily")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> FinancialDaily([FromQuery] int year, [FromQuery] int month, [FromQuery] int day)
        {
            if (year <= 0 || month < 1 || month > 12 || day < 1 || day > 31)
                return BadRequest(new { message = "Invalid date." });
            return PdfFile(await _pdf.FinancialDailyAsync(year, month, day),
                $"financial-daily-{year}-{month:D2}-{day:D2}.pdf");
        }

        [HttpGet("financial/monthly")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> FinancialMonthly([FromQuery] int year, [FromQuery] int month)
        {
            if (year <= 0 || month < 1 || month > 12)
                return BadRequest(new { message = "Invalid year or month." });
            return PdfFile(await _pdf.FinancialMonthlyAsync(year, month),
                $"financial-monthly-{year}-{month:D2}.pdf");
        }

        [HttpGet("financial/yearly")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> FinancialYearly([FromQuery] int fromYear, [FromQuery] int toYear)
        {
            if (fromYear <= 0 || toYear <= 0 || fromYear > toYear)
                return BadRequest(new { message = "Invalid year range." });
            return PdfFile(await _pdf.FinancialYearlyAsync(fromYear, toYear),
                $"financial-yearly-{fromYear}-{toYear}.pdf");
        }

        // ── Customers (Admin + Staff) ─────────────────────────────────────

        [HttpGet("customers")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> CustomersList() =>
            PdfFile(await _pdf.CustomersListAsync(), "customers-and-vehicles.pdf");

        [HttpGet("customer/{id:int}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Customer(int id) =>
            PdfFile(await _pdf.CustomerAsync(id), $"customer-{id}.pdf");

        // ── Reviews, part requests, appointments (Admin + Staff) ──────────

        [HttpGet("reviews")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Reviews() =>
            PdfFile(await _pdf.ReviewsAsync(), "reviews.pdf");

        [HttpGet("part-requests")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> PartRequests() =>
            PdfFile(await _pdf.PartRequestsAsync(), "part-requests.pdf");

        [HttpGet("appointments")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Appointments() =>
            PdfFile(await _pdf.AppointmentsAsync(), "appointments.pdf");

        // ── Admin extras ──────────────────────────────────────────────────

        [HttpGet("audit-log")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AuditLog(
            [FromQuery] string? entityType = null,
            [FromQuery] string? action = null,
            [FromQuery] string? search = null) =>
            PdfFile(await _pdf.AuditLogAsync(entityType, action, search), "audit-log.pdf");

        [HttpGet("parts-catalog")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PartsCatalog() =>
            PdfFile(await _pdf.PartsCatalogAsync(), "parts-catalog.pdf");
    }
}
