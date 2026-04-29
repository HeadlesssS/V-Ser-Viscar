using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.Models;

namespace Ser_Viscar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartCategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public PartCategoriesController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _context.PartCategories.OrderBy(c => c.Name).ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PartCategory category)
        {
            _context.PartCategories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = category.Id }, category);
        }
    }
}
