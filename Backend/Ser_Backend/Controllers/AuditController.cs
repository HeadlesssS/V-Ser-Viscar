using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ser_Backend.Services.Implementations;

namespace Ser_Backend.Controllers
{
    [ApiController]
    [Route("api/audit")]
    [Authorize(Roles = "Admin")]
    public class AuditController : ControllerBase
    {
        private readonly AuditService _audit;

        public AuditController(AuditService audit)
        {
            _audit = audit;
        }

        [HttpGet]
        public async Task<IActionResult> GetLogs(
            [FromQuery] string? entityType = null,
            [FromQuery] string? action = null,
            [FromQuery] string? search = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var result = await _audit.GetLogsAsync(entityType, action, search, from, to, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            try
            {
                return Ok(await _audit.GetSummaryAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("entity-types")]
        public IActionResult GetEntityTypes()
        {
            return Ok(new[]
            {
                "SalesInvoice", "PurchaseInvoice", "PartRequest", "Appointment",
                "Review", "Part", "Vendor", "Customer", "Vehicle", "User",
                "AIPrediction", "Notification", "Auth"
            });
        }
    }
}
