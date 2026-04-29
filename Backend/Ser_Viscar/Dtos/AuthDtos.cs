namespace Ser_Viscar.Dtos
{
    public record RegisterRequest(string Name, string Email, string Password, string Phone);
    public record LoginRequest(string Email, string Password);

    public record AuthUserResponse(int Id, string Name, string Email, string Phone, string Role);
    public record AuthResponse(AuthUserResponse User);
}

