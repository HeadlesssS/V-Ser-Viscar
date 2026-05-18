using Microsoft.AspNetCore.Mvc;
using Ser_Backend.DTO.Vendor;
using Ser_Backend.Services;

namespace Ser_Backend.Controllers
{
    [ApiController]
    [Route("api/vendors")]
    public class VendorController : ControllerBase
    {
        private readonly VendorService _vendorService;

        public VendorController(VendorService vendorService)
        {
            _vendorService = vendorService;
        }

        // GET api/vendors
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var vendors = await _vendorService.GetAllAsync();
                return Ok(vendors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET api/vendors/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var vendor = await _vendorService.GetByIdAsync(id);
                return Ok(vendor);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // POST api/vendors
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VendorRequestDto dto)
        {
            try
            {
                var vendor = await _vendorService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = vendor.Id }, vendor);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT api/vendors/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] VendorRequestDto dto)
        {
            try
            {
                var vendor = await _vendorService.UpdateAsync(id, dto);
                return Ok(vendor);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE api/vendors/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _vendorService.DeleteAsync(id);
                return Ok(new { message = "Vendor deactivated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}