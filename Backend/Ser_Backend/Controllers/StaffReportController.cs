using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ser_Backend.Services.Implementations;

namespace Ser_Backend.Controllers
{
    /// <summary>
    /// Provides staff-facing customer analytics reports.
    /// All endpoints require the Admin or Staff role.
    /// </summary>
    [ApiController]
    [Route("api/staff-reports")]
    [Authorize(Roles = "Admin,Staff")]
    public class StaffReportController : ControllerBase
    {
        private readonly StaffReportService _service;

        public StaffReportController(StaffReportService service)
        {
            _service = service;
        }

        // ------------------------------------------------------------------ //
        //  GET api/staff-reports/high-spenders?top=20                         //
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Returns the top N customers ranked by total amount spent.
        /// </summary>
        /// <param name="top">How many records to return (default 20).</param>
        [HttpGet("high-spenders")]
        public async Task<IActionResult> GetHighSpenders([FromQuery] int top = 20)
        {
            try
            {
                var result = await _service.GetHighSpendersAsync(top);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ------------------------------------------------------------------ //
        //  GET api/staff-reports/regular-customers?top=20                     //
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Returns the top N customers ranked by number of purchases.
        /// </summary>
        /// <param name="top">How many records to return (default 20).</param>
        [HttpGet("regular-customers")]
        public async Task<IActionResult> GetRegularCustomers([FromQuery] int top = 20)
        {
            try
            {
                var result = await _service.GetRegularCustomersAsync(top);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ------------------------------------------------------------------ //
        //  GET api/staff-reports/pending-credits                              //
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Returns all customers with an outstanding credit balance, ordered
        /// by how many days their oldest unpaid invoice is overdue.
        /// </summary>
        [HttpGet("pending-credits")]
        public async Task<IActionResult> GetPendingCredits()
        {
            try
            {
                var result = await _service.GetPendingCreditsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
