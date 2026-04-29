using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;

namespace Ser_Viscar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AuthController(ApplicationDbContext context) => _context = context;

        public record LoginRequest(string Name, string Password);

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _context.Users
                .Include(u => u.Customer)
                .FirstOrDefaultAsync(u => u.Name == req.Name && u.Password == req.Password);

            if (user == null)
                return Unauthorized(new { message = "Invalid username or password" });

            return Ok(new
            {
                id = user.Id,
                name = user.Name,
                role = user.Role,
                email = user.Email,
                customerId = user.Customer?.Id
            });
        }
    }
}
