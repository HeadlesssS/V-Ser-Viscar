using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.Auth;
using Ser_Backend.Models;
using System.Security.Claims;

namespace Ser_Backend.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/users?role=Staff
    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] string? role = null)
    {
        var query = _db.Users.AsQueryable();
        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.Role.ToString() == role);

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserListDto
            {
                Id = u.Id,
                Name = u.Name ?? "",
                Email = u.Email,
                Phone = u.Phone ?? "",
                Role = u.Role.ToString(),
                IsActive = u.isActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    // PUT api/users/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        // Prevent editing the current admin user's role (optional safety check)
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        user.Name = dto.Name;
        user.Email = dto.Email;
        user.Phone = dto.Phone;

        if (!string.IsNullOrWhiteSpace(dto.Password))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await _db.SaveChangesAsync();
        return Ok(new { message = "User updated successfully." });
    }

    // DELETE api/users/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (id == currentUserId)
            return BadRequest(new { message = "You cannot delete your own account." });

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        if (user.Role == Ser_Backend.Models.User.UserRole.Admin)
            return BadRequest(new { message = "Cannot delete Admin accounts." });

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return Ok(new { message = "User deleted successfully." });
    }

    // PUT api/users/{id}/toggle-status
    [HttpPut("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (id == currentUserId)
            return BadRequest(new { message = "You cannot deactivate your own account." });

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        user.isActive = !user.isActive;
        await _db.SaveChangesAsync();

        return Ok(new { message = $"User {(user.isActive ? "activated" : "deactivated")} successfully.", isActive = user.isActive });
    }
}
