using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.Notifications;
using System.Security.Claims;

namespace Ser_Backend.Controllers;

[ApiController]
[Route("api/bell-notifications")]
[Authorize]
public class BellNotificationController : ControllerBase
{
    private readonly AppDbContext _db;

    public BellNotificationController(AppDbContext db)
    {
        _db = db;
    }

    int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/bell-notifications
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = GetUserId();
        var notifications = await _db.Notifications
            .Where(n => n.RecipientId == userId)
            .OrderByDescending(n => n.SentAt)
            .Take(50)
            .Select(n => new BellNotificationDto
            {
                Id = n.Id,
                Type = n.Type,
                Message = n.Message,
                IsRead = n.IsRead,
                SentAt = n.SentAt
            })
            .ToListAsync();

        return Ok(new
        {
            notifications,
            unreadCount = notifications.Count(n => !n.IsRead)
        });
    }

    // PUT api/bell-notifications/{id}/read
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetUserId();
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.RecipientId == userId);

        if (notification == null) return NotFound();
        notification.IsRead = true;
        await _db.Notifications.Where(n => n.RecipientId == userId && !n.IsRead).ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        await _db.SaveChangesAsync();
        return Ok(new { message = "Marked as read." });
    }

    // PUT api/bell-notifications/read-all
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetUserId();
        await _db.Notifications
            .Where(n => n.RecipientId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        return Ok(new { message = "All notifications marked as read." });
    }
}
