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

        // GET api/sales-invoices
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

        // GET api/sales-invoices/{id}
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

        // GET api/sales-invoices/customer/{customerId}
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

        // POST api/sales-invoices
        [HttpPost]
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

        // DELETE api/sales-invoices/{id}
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
    }
}