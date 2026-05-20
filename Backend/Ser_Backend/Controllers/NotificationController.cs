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

        // GET api/notifications  — get all general notifications for the current user
        [HttpGet]
        [Authorize] // Require authentication for any user
        public async Task<IActionResult> GetNotifications()
        {
            try
            {
                // Get the current user ID from claims - try multiple claim types
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("sub")?.Value 
                    ?? User.FindFirst("nameid")?.Value
                    ?? User.FindFirst("userId")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return BadRequest(new { message = "Unable to identify user from token claims" });
                }

                var notifications = await _service.GetUserNotificationsAsync(userId);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // PUT api/notifications/{id}/read  — mark a notification as read
        [HttpPut("{id}/read")]
        [Authorize]
        public async Task<IActionResult> MarkNotificationAsRead(int id)
        {
            try
            {
                await _service.MarkNotificationAsReadAsync(id);
                return Ok(new { message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
