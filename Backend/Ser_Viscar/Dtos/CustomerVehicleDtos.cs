namespace Ser_Viscar.Dtos
{
    public record UpdateProfileRequest(string Name, string Email, string Phone);

    public record AddVehicleRequest(string VehicleNumber, string Brand, string Model, string? Id);

    public record CreateCustomerRequest(
        string Name,
        string Email,
        string Phone,
        string VehicleNumber,
        string Brand,
        string Model
    );
}

