namespace Ser_Backend.DTO.Customer;

public class AddVehicleDto
{
    public int CustomerId {get;set; }
    public string VehicleNumber {get;set;} = string.Empty;
    public string Brand {get;set;} = string.Empty;
    public string Model {get;set;} = string.Empty;
    public int Year {get;set;}
    public string VIN {get;set;} = string.Empty;
}