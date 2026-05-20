using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ser_Backend.DTO.Auth;
using Ser_Backend.Services.Implementations;

namespace Ser_Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    // POST api/auth/register  (public — customers self-registering only)
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            // Force role to Customer for all public registrations
            dto.Role = "Customer";
            var result = await _authService.RegisterAsync(dto);
            return Ok(new { message = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST api/auth/register-staff  (admin-only — create Staff or Customer accounts)
    [HttpPost("register-staff")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RegisterStaff(RegisterDto dto)
    {
        try
        {
            if (dto.Role == "Admin")
                return BadRequest(new { message = "Cannot create Admin accounts through this endpoint." });

            if (dto.Role != "Staff" && dto.Role != "Customer")
                return BadRequest(new { message = "Role must be either 'Staff' or 'Customer'." });

            var result = await _authService.RegisterAsync(dto);
            return Ok(new { message = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}
