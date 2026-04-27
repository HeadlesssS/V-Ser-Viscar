using Microsoft.AspNetCore.Mvc;
using Ser_Viscar.Services.Interfaces;

namespace Ser_Viscar.Controllers
{
    // ═══════════════════════════════════════════════════════════════════
    //  Feature 9 (Irshad): Customer Reports Controller
    //  ─────────────────────────────────────────────────────────────────
    //  Endpoints:
    //  GET /api/reports/customers/high-spenders?top=20
    //  GET /api/reports/customers/regulars?top=20
    //  GET /api/reports/customers/pending-credits
    //  ─────────────────────────────────────────────────────────────────
    //  Role Access: Staff, Admin
    // ═══════════════════════════════════════════════════════════════════

    [ApiController]
    [Route("api/reports/customers")]
    public class CustomerReportsController : ControllerBase
    {
        private readonly ICustomerReportService _reportService;
        private readonly ILogger<CustomerReportsController> _logger;

        public CustomerReportsController(
            ICustomerReportService reportService,
            ILogger<CustomerReportsController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        /// <summary>
        /// Generate high-spender report — customers ranked by total amount spent.
        /// </summary>
        /// <param name="top">Number of top spenders to return (default 20, max 100).</param>
        /// <response code="200">Report generated successfully.</response>
        [HttpGet("high-spenders")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetHighSpenders([FromQuery] int top = 20)
        {
            // Clamp the top parameter to a reasonable range
            top = Math.Clamp(top, 1, 100);

            try
            {
                var report = await _reportService.GetHighSpendersAsync(top);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate high-spender report");
                return StatusCode(500, new { error = "Failed to generate report." });
            }
        }

        /// <summary>
        /// Generate regular-customer report — customers ranked by purchase frequency.
        /// </summary>
        /// <param name="top">Number of top customers to return (default 20, max 100).</param>
        /// <response code="200">Report generated successfully.</response>
        [HttpGet("regulars")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRegularCustomers([FromQuery] int top = 20)
        {
            top = Math.Clamp(top, 1, 100);

            try
            {
                var report = await _reportService.GetRegularCustomersAsync(top);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate regular-customer report");
                return StatusCode(500, new { error = "Failed to generate report." });
            }
        }

        /// <summary>
        /// Generate pending-credit report — customers with unpaid balances.
        /// Highlights customers overdue by more than 1 month.
        /// </summary>
        /// <response code="200">Report generated successfully.</response>
        [HttpGet("pending-credits")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPendingCredits()
        {
            try
            {
                var report = await _reportService.GetPendingCreditsAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate pending-credit report");
                return StatusCode(500, new { error = "Failed to generate report." });
            }
        }
    }
}
