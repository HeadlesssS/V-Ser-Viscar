using Microsoft.AspNetCore.Mvc;
using Ser_Viscar.DTOs.Invoice;
using Ser_Viscar.Services.Interfaces;

namespace Ser_Viscar.Controllers
{
    // ═══════════════════════════════════════════════════════════════════
    //  Feature 11 (Irshad): Invoice Email Controller
    //  ─────────────────────────────────────────────────────────────────
    //  Endpoints:
    //  GET  /api/invoices/{id}/detail   — Get full invoice details
    //  POST /api/invoices/{id}/email    — Send invoice to customer email
    //  ─────────────────────────────────────────────────────────────────
    //  Role Access: Staff, Admin
    //  ─────────────────────────────────────────────────────────────────
    //  NOTE: The invoice CRUD itself is built by Chasita (F7).
    //  This controller only handles viewing invoice details and emailing.
    // ═══════════════════════════════════════════════════════════════════

    [ApiController]
    [Route("api/invoices")]
    public class InvoiceEmailController : ControllerBase
    {
        private readonly IInvoiceEmailService _invoiceEmailService;
        private readonly ILogger<InvoiceEmailController> _logger;

        public InvoiceEmailController(
            IInvoiceEmailService invoiceEmailService,
            ILogger<InvoiceEmailController> logger)
        {
            _invoiceEmailService = invoiceEmailService;
            _logger = logger;
        }

        /// <summary>
        /// Get full invoice details including customer info, line items, and payments.
        /// Used by staff to preview an invoice before emailing.
        /// </summary>
        /// <param name="id">The invoice ID.</param>
        /// <response code="200">Invoice details returned.</response>
        /// <response code="404">Invoice not found.</response>
        [HttpGet("{id:int}/detail")]
        [ProducesResponseType(typeof(InvoiceDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetInvoiceDetail(int id)
        {
            try
            {
                var detail = await _invoiceEmailService.GetInvoiceDetailAsync(id);

                if (detail == null)
                {
                    return NotFound(new { error = $"Invoice #{id} not found." });
                }

                return Ok(detail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve invoice detail #{Id}", id);
                return StatusCode(500, new { error = "Failed to retrieve invoice details." });
            }
        }

        /// <summary>
        /// Send an invoice to the customer via email.
        /// Composes a professional HTML email and sends it to the customer's
        /// registered email (or a custom override address).
        /// </summary>
        /// <param name="id">The invoice ID to send.</param>
        /// <param name="request">Optional custom message and email override.</param>
        /// <response code="200">Email sent successfully.</response>
        /// <response code="404">Invoice not found.</response>
        /// <response code="400">Email sending failed.</response>
        [HttpPost("{id:int}/email")]
        [ProducesResponseType(typeof(SendInvoiceEmailResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SendInvoiceEmail(
            int id,
            [FromBody] SendInvoiceEmailRequestDto? request)
        {
            try
            {
                // Use empty request if none provided
                request ??= new SendInvoiceEmailRequestDto();

                var result = await _invoiceEmailService.SendInvoiceEmailAsync(id, request);

                if (!result.Success)
                {
                    // Determine if it's a 404 (not found) or 400 (bad request)
                    if (result.Message.Contains("not found"))
                    {
                        return NotFound(new { error = result.Message });
                    }

                    return BadRequest(new { error = result.Message });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send invoice email #{Id}", id);
                return StatusCode(500, new { error = "An error occurred while sending the invoice email." });
            }
        }
    }
}
