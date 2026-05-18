using Microsoft.AspNetCore.Mvc;
using Ser_Backend.DTO.Part;
using Ser_Backend.Services.Implementations;

namespace Ser_Backend.Controllers
{
    [ApiController]
    [Route("api/parts")]
    public class PartController : ControllerBase
    {
        private readonly PartService _service;

        public PartController(PartService service)
        {
            _service = service;
        }

        // GET api/parts
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

        // GET api/parts/{id}
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

        // GET api/parts/category/{category}
        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetByCategory(string category)
        {
            try
            {
                return Ok(await _service.GetByCategoryAsync(category));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET api/parts/low-stock
        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStock()
        {
            try
            {
                return Ok(await _service.GetLowStockAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST api/parts
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PartRequestDto dto)
        {
            try
            {
                var part = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = part.Id }, part);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT api/parts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PartRequestDto dto)
        {
            try
            {
                return Ok(await _service.UpdateAsync(id, dto));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE api/parts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return Ok(new { message = "Part deactivated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}