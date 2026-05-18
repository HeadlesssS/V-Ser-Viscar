using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ser_Backend.Services.Implementations;

namespace Ser_Backend.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize(Roles = "Admin")]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _service;

        public NotificationController(NotificationService service)
        {
            _service = service;
        }

        // GET api/notifications/low-stock
        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStock()
        {
            try
            {
                var result = await _service.GetLowStockSummaryAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST api/notifications/low-stock-alert  — sends email to admin
        [HttpPost("low-stock-alert")]
        public async Task<IActionResult> SendLowStockAlert()
        {
            try
            {
                var result = await _service.SendLowStockAlertAsync();
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET api/notifications/overdue-credits
        [HttpGet("overdue-credits")]
        public async Task<IActionResult> GetOverdueCredits()
        {
            try
            {
                var result = await _service.GetOverdueCreditsSummaryAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST api/notifications/credit-reminders  — sends email to each overdue customer
        [HttpPost("credit-reminders")]
        public async Task<IActionResult> SendCreditReminders()
        {
            try
            {
                var result = await _service.SendOverdueCreditRemindersAsync();
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
