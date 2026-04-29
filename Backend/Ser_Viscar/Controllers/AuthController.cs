using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Auth;
using Ser_Viscar.Data;
using Ser_Viscar.Dtos;
using Ser_Viscar.Models;

namespace Ser_Viscar.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly JwtTokenService _jwt;
        private readonly PasswordHasher<User> _hasher = new();

        public AuthController(ApplicationDbContext db, JwtTokenService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
        {
            var email = (req.Email ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email)) return BadRequest(new { message = "Email is required." });
            if (string.IsNullOrWhiteSpace(req.Password)) return BadRequest(new { message = "Password is required." });

            var exists = await _db.Users.AnyAsync(u => u.Email == email);
            if (exists) return Conflict(new { message = "Email already registered." });

            var user = new User
            {
                Name = (req.Name ?? string.Empty).Trim(),
                Email = email,
                Phone = (req.Phone ?? string.Empty).Trim(),
                Role = UserRole.Customer,
            };
            user.PasswordHash = _hasher.HashPassword(user, req.Password);

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            SignInWithCookie(user);

            return Ok(new AuthResponse(ToUserResponse(user)));
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
        {
            var email = (req.Email ?? string.Empty).Trim().ToLowerInvariant();
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user is null) return Unauthorized(new { message = "Invalid email or password." });

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, req.Password ?? string.Empty);
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized(new { message = "Invalid email or password." });

            SignInWithCookie(user);
            return Ok(new AuthResponse(ToUserResponse(user)));
        }

        private void SignInWithCookie(User user)
        {
            var token = _jwt.CreateAccessToken(user);
            Response.Cookies.Append("access_token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Path = "/"
            });
        }

        private static AuthUserResponse ToUserResponse(User u) =>
            new(u.Id, u.Name, u.Email, u.Phone, u.Role.ToString());
    }
}

