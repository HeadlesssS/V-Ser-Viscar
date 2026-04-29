using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.Models;

namespace Ser_Viscar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VendorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public VendorsController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _context.Vendors.OrderBy(v => v.Name).ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Vendor vendor)
        {
            _context.Vendors.Add(vendor);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = vendor.Id }, vendor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Vendor updated)
        {
            var vendor = await _context.Vendors.FindAsync(id);
            if (vendor == null) return NotFound();
            vendor.Name = updated.Name;
            vendor.Phone = updated.Phone;
            vendor.Email = updated.Email;
            vendor.Address = updated.Address;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var vendor = await _context.Vendors.FindAsync(id);
            if (vendor == null) return NotFound();
            _context.Vendors.Remove(vendor);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
