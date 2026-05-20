using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.Audit;
using Ser_Backend.Models;
using System.Security.Claims;

namespace Ser_Backend.Services.Implementations
{
    public class AuditService
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _http;

        public AuditService(AppDbContext db, IHttpContextAccessor http)
        {
            _db = db;
            _http = http;
        }

        public async Task LogAsync(
            string action,
            string entityType,
            string description,
            int? userId = null,
            int? entityId = null,
            string? oldValues = null,
            string? newValues = null,
            string status = "Success")
        {
            var ctx = _http.HttpContext;
            var resolvedUserId = userId ?? GetCurrentUserId(ctx);

            _db.AuditLogs.Add(new AuditLog
            {
                UserId = resolvedUserId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Description = description,
                OldValues = oldValues ?? string.Empty,
                NewValues = newValues ?? string.Empty,
                Timestamp = DateTime.UtcNow,
                IpAddress = ctx?.Connection.RemoteIpAddress?.ToString(),
                UserAgent = ctx?.Request.Headers.UserAgent.ToString(),
                Status = status
            });
            await _db.SaveChangesAsync();
        }

        public async Task<AuditQueryResultDto> GetLogsAsync(
            string? entityType = null,
            string? action = null,
            string? search = null,
            DateTime? from = null,
            DateTime? to = null,
            int page = 1,
            int pageSize = 50)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 10, 100);

            var query = _db.AuditLogs
                .Include(a => a.User)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(entityType))
                query = query.Where(a => a.EntityType == entityType);

            if (!string.IsNullOrWhiteSpace(action))
                query = query.Where(a => a.Action == action);

            if (from.HasValue)
                query = query.Where(a => a.Timestamp >= from.Value);

            if (to.HasValue)
                query = query.Where(a => a.Timestamp <= to.Value);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(a =>
                    a.Description.ToLower().Contains(term) ||
                    a.EntityType.ToLower().Contains(term) ||
                    a.Action.ToLower().Contains(term) ||
                    (a.User != null && a.User.Name != null && a.User.Name.ToLower().Contains(term)));
            }

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    UserName = a.User != null ? a.User.Name : "System",
                    UserRole = a.User != null ? a.User.Role.ToString() : null,
                    Action = a.Action,
                    EntityType = a.EntityType,
                    EntityId = a.EntityId,
                    Description = a.Description,
                    OldValues = a.OldValues,
                    NewValues = a.NewValues,
                    Timestamp = a.Timestamp,
                    IpAddress = a.IpAddress,
                    Status = a.Status
                })
                .ToListAsync();

            return new AuditQueryResultDto
            {
                Items = items,
                Total = total,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<AuditSummaryDto> GetSummaryAsync()
        {
            var today = DateTime.UtcNow.Date;
            var logs = await _db.AuditLogs.AsNoTracking().ToListAsync();

            return new AuditSummaryDto
            {
                Total = logs.Count,
                Today = logs.Count(a => a.Timestamp.Date == today),
                ByEntityType = logs
                    .GroupBy(a => a.EntityType)
                    .ToDictionary(g => g.Key, g => g.Count()),
                ByAction = logs
                    .GroupBy(a => a.Action)
                    .ToDictionary(g => g.Key, g => g.Count())
            };
        }

        private static int? GetCurrentUserId(HttpContext? ctx)
        {
            var id = ctx?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(id, out var parsed) ? parsed : null;
        }
    }
}
