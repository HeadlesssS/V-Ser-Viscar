using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.Models;

namespace Ser_Viscar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public PartsController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var parts = await _context.Parts
                .Include(p => p.Category)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.CategoryId,
                    categoryName = p.Category.Name,
                    p.Price,
                    p.QuantityOnHand,
                    p.ReorderLevel,
                    p.IsLowStock
                })
                .OrderBy(p => p.Name)
                .ToListAsync();
            return Ok(parts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var part = await _context.Parts.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
            if (part == null) return NotFound();
            return Ok(new
            {
                part.Id, part.Name, part.Description, part.CategoryId,
                categoryName = part.Category.Name, part.Price, part.QuantityOnHand, part.ReorderLevel, part.IsLowStock
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Part part)
        {
            _context.Parts.Add(part);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = part.Id }, part);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Part updated)
        {
            var part = await _context.Parts.FindAsync(id);
            if (part == null) return NotFound();
            part.Name = updated.Name;
            part.Description = updated.Description;
            part.CategoryId = updated.CategoryId;
            part.Price = updated.Price;
            part.QuantityOnHand = updated.QuantityOnHand;
            part.ReorderLevel = updated.ReorderLevel;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var part = await _context.Parts.FindAsync(id);
            if (part == null) return NotFound();
            _context.Parts.Remove(part);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("lowstock")]
        public async Task<IActionResult> LowStock()
        {
            var parts = await _context.Parts
                .Include(p => p.Category)
                .Where(p => p.QuantityOnHand < p.ReorderLevel)
                .Select(p => new { p.Id, p.Name, p.QuantityOnHand, p.ReorderLevel })
                .ToListAsync();
            return Ok(parts);
        }
    }
}
