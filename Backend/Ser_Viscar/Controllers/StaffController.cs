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
    [Route("api/staff")]
    [Authorize(Roles = "Staff,Admin")]
    public class StaffController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly PasswordHasher<User> _hasher = new();

        public StaffController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost("create-customer")]
        public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest req)
        {
            var email = (req.Email ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email)) return BadRequest(new { message = "Email is required." });

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user is null)
            {
                user = new User
                {
                    Name = (req.Name ?? string.Empty).Trim(),
                    Email = email,
                    Phone = (req.Phone ?? string.Empty).Trim(),
                    Role = UserRole.Customer,
                };

                // Staff-created customer: set a random password (customer can still register later with different email),
                // or you can later add "invite/reset password" flow.
                var randomPwd = Guid.NewGuid().ToString("N");
                user.PasswordHash = _hasher.HashPassword(user, randomPwd);

                _db.Users.Add(user);
                await _db.SaveChangesAsync();
            }
            else
            {
                // Keep it simple: update profile fields if provided.
                user.Name = (req.Name ?? user.Name).Trim();
                user.Phone = (req.Phone ?? user.Phone).Trim();
                if (user.Role != UserRole.Customer) user.Role = UserRole.Customer;
                await _db.SaveChangesAsync();
            }

            var vehicleNumber = (req.VehicleNumber ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(vehicleNumber))
                return BadRequest(new { message = "Vehicle number is required." });

            var exists = await _db.Vehicles.AnyAsync(v => v.CustomerId == user.Id && v.VehicleNumber == vehicleNumber);
            if (!exists)
            {
                _db.Vehicles.Add(new Vehicle
                {
                    CustomerId = user.Id,
                    VehicleNumber = vehicleNumber,
                    Brand = (req.Brand ?? string.Empty).Trim(),
                    Model = (req.Model ?? string.Empty).Trim(),
                });
                await _db.SaveChangesAsync();
            }

            return Ok(new { message = "Customer saved." });
        }

        [HttpGet("customers")]
        public async Task<IActionResult> Customers()
        {
            var customers = await _db.Users
                .Where(u => u.Role == UserRole.Customer)
                .OrderByDescending(u => u.Id)
                .Select(u => new
                {
                    id = u.Id,
                    name = u.Name,
                    email = u.Email,
                    phone = u.Phone,
                    vehicle = u.Vehicles
                        .OrderByDescending(v => v.Id)
                        .Select(v => new
                        {
                            id = v.Id,
                            vehicleNumber = v.VehicleNumber,
                            brand = v.Brand,
                            model = v.Model
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(customers);
        }
    }
}

