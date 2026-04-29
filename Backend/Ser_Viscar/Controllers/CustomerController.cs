using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.Dtos;
using Ser_Viscar.Models;

namespace Ser_Viscar.Controllers
{
    [ApiController]
    [Route("api/customer")]
    [Authorize(Roles = "Customer,Admin,Staff")]
    public class CustomerController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public CustomerController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
        {
            var userId = GetUserId();
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user is null) return Unauthorized(new { message = "Not logged in." });

            var email = (req.Email ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email)) return BadRequest(new { message = "Email is required." });

            var emailTaken = await _db.Users.AnyAsync(u => u.Email == email && u.Id != user.Id);
            if (emailTaken) return Conflict(new { message = "Email already in use." });

            user.Name = (req.Name ?? string.Empty).Trim();
            user.Email = email;
            user.Phone = (req.Phone ?? string.Empty).Trim();

            await _db.SaveChangesAsync();

            return Ok(new
            {
                user = new
                {
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    phone = user.Phone,
                    role = user.Role.ToString()
                }
            });
        }

        [HttpPost("add-vehicle")]
        public async Task<IActionResult> AddVehicle([FromBody] AddVehicleRequest req)
        {
            var userId = GetUserId();
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user is null) return Unauthorized(new { message = "Not logged in." });

            var vehicleNumber = (req.VehicleNumber ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(vehicleNumber))
                return BadRequest(new { message = "Vehicle number is required." });

            Vehicle? vehicle = null;
            if (!string.IsNullOrWhiteSpace(req.Id) && int.TryParse(req.Id, out var id))
            {
                vehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == id && v.CustomerId == userId);
            }

            if (vehicle is null)
            {
                var dup = await _db.Vehicles.AnyAsync(v => v.CustomerId == userId && v.VehicleNumber == vehicleNumber);
                if (dup) return Conflict(new { message = "Vehicle number already exists." });

                vehicle = new Vehicle
                {
                    CustomerId = userId,
                    VehicleNumber = vehicleNumber,
                    Brand = (req.Brand ?? string.Empty).Trim(),
                    Model = (req.Model ?? string.Empty).Trim(),
                };
                _db.Vehicles.Add(vehicle);
            }
            else
            {
                // Editing
                vehicle.VehicleNumber = vehicleNumber;
                vehicle.Brand = (req.Brand ?? string.Empty).Trim();
                vehicle.Model = (req.Model ?? string.Empty).Trim();
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                vehicle = new
                {
                    id = vehicle.Id,
                    vehicleNumber = vehicle.VehicleNumber,
                    brand = vehicle.Brand,
                    model = vehicle.Model
                }
            });
        }

        [HttpGet("vehicles")]
        public async Task<IActionResult> Vehicles()
        {
            var userId = GetUserId();
            var list = await _db.Vehicles
                .Where(v => v.CustomerId == userId)
                .OrderByDescending(v => v.Id)
                .Select(v => new
                {
                    id = v.Id,
                    vehicleNumber = v.VehicleNumber,
                    brand = v.Brand,
                    model = v.Model
                })
                .ToListAsync();

            return Ok(list);
        }

        private int GetUserId()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            return int.TryParse(sub, out var id) ? id : 0;
        }
    }
}

