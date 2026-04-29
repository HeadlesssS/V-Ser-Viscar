using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.Models;

namespace Ser_Viscar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public CustomersController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _context.Customers
                .Select(c => new { c.Id, c.Name, c.Phone, c.Email, c.UserId })
                .OrderBy(c => c.Name)
                .ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var c = await _context.Customers.FindAsync(id);
            if (c == null) return NotFound();
            return Ok(new { c.Id, c.Name, c.Phone, c.Email, c.UserId });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Customer customer)
        {
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Customer updated)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();
            customer.Name = updated.Name;
            customer.Phone = updated.Phone;
            customer.Email = updated.Email;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
