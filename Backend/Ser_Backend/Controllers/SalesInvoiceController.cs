using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ser_Backend.DTO.SalesInvoice;
using Ser_Backend.Services.Implementations;
using System.Security.Claims;

namespace Ser_Backend.Controllers
{
    [ApiController]
    [Route("api/sales-invoices")]
    public class SalesInvoiceController : ControllerBase
    {
        private readonly SalesInvoiceService _service;

        public SalesInvoiceController(SalesInvoiceService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(await _service.GetAllAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                return Ok(await _service.GetByIdAsync(id));
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            try
            {
                return Ok(await _service.GetByCustomerAsync(customerId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SalesInvoiceRequestDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var staffUserId = userIdClaim != null ? int.Parse(userIdClaim) : 0;

                var invoice = await _service.CreateAsync(dto, staffUserId);
                return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return Ok(new { message = "Sales invoice deleted and stock reversed." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ------------------------------------------------------------------ //
        //  Feature 11: POST api/sales-invoices/{id}/send-email                //
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Sends an HTML invoice email to the customer and marks
        /// <c>EmailSent = true</c> on the invoice.
        /// </summary>
        [HttpPost("{id}/send-email")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> SendEmail(int id)
        {
            try
            {
                await _service.SendInvoiceEmailAsync(id);
                return Ok(new { message = $"Invoice email sent successfully for invoice #{id}." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
