using Microsoft.AspNetCore.Mvc;
using Ser_Backend.DTO.PurchaseInvoice;
using Ser_Backend.Services.Implementations;

namespace Ser_Backend.Controllers
{
    [ApiController]
    [Route("api/purchase-invoices")]
    public class PurchaseInvoiceController : ControllerBase
    {
        private readonly PurchaseInvoiceService _service;

        public PurchaseInvoiceController(PurchaseInvoiceService service)
        {
            _service = service;
        }

        // GET api/purchase-invoices
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var invoices = await _service.GetAllAsync();
                return Ok(invoices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET api/purchase-invoices/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var invoice = await _service.GetByIdAsync(id);
                return Ok(invoice);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // POST api/purchase-invoices
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PurchaseInvoiceRequestDto dto)
        {
            try
            {
                var invoice = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE api/purchase-invoices/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return Ok(new { message = "Invoice deleted and stock reversed successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}