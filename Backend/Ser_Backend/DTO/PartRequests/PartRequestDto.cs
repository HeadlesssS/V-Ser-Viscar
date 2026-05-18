namespace Ser_Backend.DTO.PartRequests;

public class CreatePartRequestDto
{
    public string PartName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int QuantityRequested { get; set; } = 1;
}

public class PartRequestResponseDto
{
    public int Id { get; set; }
    public string PartName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int QuantityRequested { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
}

public class PartRequestAdminDto
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string PartName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int QuantityRequested { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
}

public class UpdatePartRequestStatusDto
{
    public string Status { get; set; } = string.Empty; // Pending, Fulfilled, Rejected
}
