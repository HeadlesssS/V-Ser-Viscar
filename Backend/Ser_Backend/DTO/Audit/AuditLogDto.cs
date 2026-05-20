namespace Ser_Backend.DTO.Audit
{
    public class AuditLogDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserRole { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public int? EntityId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string OldValues { get; set; } = string.Empty;
        public string NewValues { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? IpAddress { get; set; }
        public string Status { get; set; } = "Success";
    }

    public class AuditSummaryDto
    {
        public int Total { get; set; }
        public int Today { get; set; }
        public Dictionary<string, int> ByEntityType { get; set; } = new();
        public Dictionary<string, int> ByAction { get; set; } = new();
    }

    public class AuditQueryResultDto
    {
        public List<AuditLogDto> Items { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}
