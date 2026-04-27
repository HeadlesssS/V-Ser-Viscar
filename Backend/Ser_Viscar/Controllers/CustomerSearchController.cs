using Microsoft.AspNetCore.Mvc;
using Ser_Viscar.Services.Interfaces;

namespace Ser_Viscar.Controllers
{
    // ═══════════════════════════════════════════════════════════════════
    //  Feature 10 (Irshad): Customer Search Controller
    //  ─────────────────────────────────────────────────────────────────
    //  Endpoint: GET /api/customers/search?term={searchTerm}
    //  ─────────────────────────────────────────────────────────────────
    //  Supports searching by:
    //  • Customer name (partial match, case-insensitive)
    //  • Phone number (partial match)
    //  • Customer ID (exact match for numeric terms)
    //  • Vehicle license plate number (partial match)
    //  • Email address (partial match)
    //  ─────────────────────────────────────────────────────────────────
    //  Role Access: Staff, Admin
    // ═══════════════════════════════════════════════════════════════════

    [ApiController]
    [Route("api/customers")]
    public class CustomerSearchController : ControllerBase
    {
        private readonly ICustomerSearchService _searchService;
        private readonly ILogger<CustomerSearchController> _logger;

        public CustomerSearchController(
            ICustomerSearchService searchService,
            ILogger<CustomerSearchController> logger)
        {
            _searchService = searchService;
            _logger = logger;
        }

        /// <summary>
        /// Search customers by name, phone, ID, or vehicle number.
        /// Returns matched customers with vehicle and purchase summaries.
        /// </summary>
        /// <param name="term">Search query string (min 1 character).</param>
        /// <returns>List of matching customer records.</returns>
        /// <response code="200">Search results returned successfully.</response>
        /// <response code="400">Search term is missing or empty.</response>
        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Search([FromQuery] string term)
        {
            // ── Input validation ──
            if (string.IsNullOrWhiteSpace(term))
            {
                return BadRequest(new { error = "Search term is required." });
            }

            if (term.Trim().Length < 1)
            {
                return BadRequest(new { error = "Search term must be at least 1 character." });
            }

            try
            {
                var results = await _searchService.SearchAsync(term);

                return Ok(new
                {
                    query = term,
                    count = results.Count,
                    results
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Customer search failed for term: '{Term}'", term);
                return StatusCode(500, new { error = "An error occurred while searching customers." });
            }
        }
    }
}
