namespace Ser_Viscar.Dtos
{
    public record CreateStaffRequest(string Name, string Email, string Password, string Phone, string Role);
    public record UpdateRoleRequest(string Role);
}

