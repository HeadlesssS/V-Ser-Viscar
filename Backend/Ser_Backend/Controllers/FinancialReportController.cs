using Microsoft.AspNetCore.Mvc;
using Ser_Backend.Services.Implementations;

namespace Ser_Backend.Controllers
{
    [ApiController]
    [Route("api/reports/financial")]
    public class FinancialReportController : ControllerBase
    {
        private readonly FinancialReportService _service;

        public FinancialReportController(FinancialReportService service)
        {
            _service = service;
        }

        // GET api/reports/financial/daily?year=2026&month=5&day=16
        [HttpGet("daily")]
        public async Task<IActionResult> Daily([FromQuery] int year, [FromQuery] int month, [FromQuery] int day)
        {
            try
            {
                if (year <= 0 || month < 1 || month > 12 || day < 1 || day > 31)
                    return BadRequest(new { message = "Provide a valid year, month (1-12), and day (1-31)." });

                var report = await _service.GetDailyReportAsync(year, month, day);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET api/reports/financial/monthly?year=2026&month=5
        [HttpGet("monthly")]
        public async Task<IActionResult> Monthly([FromQuery] int year, [FromQuery] int month)
        {
            try
            {
                if (year <= 0 || month < 1 || month > 12)
                    return BadRequest(new { message = "Provide a valid year and month (1-12)." });

                var report = await _service.GetMonthlyReportAsync(year, month);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET api/reports/financial/yearly?fromYear=2024&toYear=2026
        [HttpGet("yearly")]
        public async Task<IActionResult> Yearly([FromQuery] int fromYear, [FromQuery] int toYear)
        {
            try
            {
                if (fromYear <= 0 || toYear <= 0 || fromYear > toYear)
                    return BadRequest(new { message = "Provide a valid fromYear and toYear range." });

                var report = await _service.GetYearlyReportAsync(fromYear, toYear);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
