using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.Dtos;
using Ser_Viscar.Models;

namespace Ser_Viscar.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly PasswordHasher<User> _hasher = new();

        public AdminController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost("create-staff")]
        public async Task<IActionResult> CreateStaff([FromBody] CreateStaffRequest req)
        {
            var email = (req.Email ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email)) return BadRequest(new { message = "Email is required." });
            if (string.IsNullOrWhiteSpace(req.Password)) return BadRequest(new { message = "Password is required." });

            var role = ParseRole(req.Role, allowCustomer: false);
            if (role is null) return BadRequest(new { message = "Role must be Admin or Staff." });

            var exists = await _db.Users.AnyAsync(u => u.Email == email);
            if (exists) return Conflict(new { message = "Email already exists." });

            var user = new User
            {
                Name = (req.Name ?? string.Empty).Trim(),
                Email = email,
                Phone = (req.Phone ?? string.Empty).Trim(),
                Role = role.Value,
            };
            user.PasswordHash = _hasher.HashPassword(user, req.Password);

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                phone = user.Phone,
                role = user.Role.ToString()
            });
        }

        [HttpGet("staff")]
        public async Task<IActionResult> GetStaff()
        {
            var staff = await _db.Users
                .Where(u => u.Role == UserRole.Admin || u.Role == UserRole.Staff)
                .OrderByDescending(u => u.Id)
                .Select(u => new
                {
                    id = u.Id,
                    name = u.Name,
                    email = u.Email,
                    phone = u.Phone,
                    role = u.Role.ToString()
                })
                .ToListAsync();

            return Ok(staff);
        }

        [HttpPut("update-role/{id:int}")]
        public async Task<IActionResult> UpdateRole([FromRoute] int id, [FromBody] UpdateRoleRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user is null) return NotFound(new { message = "Staff not found." });

            var role = ParseRole(req.Role, allowCustomer: false);
            if (role is null) return BadRequest(new { message = "Role must be Admin or Staff." });

            user.Role = role.Value;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Role updated." });
        }

        [HttpDelete("delete-staff/{id:int}")]
        public async Task<IActionResult> DeleteStaff([FromRoute] int id)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user is null) return NotFound(new { message = "Staff not found." });

            if (user.Role != UserRole.Admin && user.Role != UserRole.Staff)
                return BadRequest(new { message = "Only staff/admin accounts can be deleted here." });

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Deleted." });
        }

        private static UserRole? ParseRole(string role, bool allowCustomer)
        {
            var r = (role ?? string.Empty).Trim();
            if (r.Equals("Admin", StringComparison.OrdinalIgnoreCase)) return UserRole.Admin;
            if (r.Equals("Staff", StringComparison.OrdinalIgnoreCase)) return UserRole.Staff;
            if (allowCustomer && r.Equals("Customer", StringComparison.OrdinalIgnoreCase)) return UserRole.Customer;
            return null;
        }
    }
}

