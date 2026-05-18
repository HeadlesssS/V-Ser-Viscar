namespace Ser_Backend.DTOs.Customers;

public class CustomerDetailsDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public decimal CreditBalance { get; set; }
    public string LoyaltyTier { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<VehicleDto> Vehicles { get; set; } = [];
}

public class VehicleDto
{
    public int Id { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string VIN { get; set; } = string.Empty;
}