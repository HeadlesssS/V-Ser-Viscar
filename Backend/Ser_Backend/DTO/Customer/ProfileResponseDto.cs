using System.Collections.Generic;
using Ser_Backend.DTOs.Customers;

namespace Ser_Backend.DTO.Customer;

public class ProfileResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public string? LoyaltyTier { get; set; }
    public decimal? TotalSpent { get; set; }
    public decimal? CreditBalance { get; set; }
    public List<VehicleDto> Vehicles { get; set; } = new();
}