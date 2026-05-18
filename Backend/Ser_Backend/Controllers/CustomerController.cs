using Microsoft.AspNetCore.Mvc;
using Ser_Backend.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Ser_Backend.DTO.Customer;
using System.Security.Claims;

namespace Ser_Backend.Controllers
{
    [ApiController]
    [Route("api/customers")]
    public class CustomerController : ControllerBase
    {
        private readonly CustomerService _service;

        public CustomerController(CustomerService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(await _service.GetAllAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("vehicles")]
        [Authorize(Roles = "Admin,Staff,Customer")]
        public async Task<IActionResult> AddVehicle([FromBody] AddVehicleDto dto)
        {
            try
            {
                var role = User.FindFirstValue(ClaimTypes.Role);
                if (role == "Customer")
                {
                    var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                    var result = await _service.AddVehicleForCustomerAsync(userId, dto);
                    return Ok(new { message = result });
                }
                else
                {
                    var result = await _service.AddVehicleAsync(dto);
                    return Ok(new { message = result });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var profile = await _service.GetProfileAsync(userId);
                if (profile == null)
                    return NotFound(new { message = "Profile not found." });

                return Ok(profile);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("profile")]
        [Authorize]

        public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var result = await _service.UpdateProfileAsync(userId, dto);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("by-email")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetByEmail([FromQuery] string email)
        {
            try
            {
                var result = await _service.GetByEmailAsync(email);
                if (result == null)
                    return NotFound(new { message = "Customer not found." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

    

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetCustomerDetails(int id)
    {
        try{
            var result = await _service.GetCustomerDetailsAsync(id);
            return Ok(result);
        }
        catch (Exception ex){
            return StatusCode(500, new { message = ex.Message });
        }
    }


    [HttpGet("{id}/history")]

    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetCustomerHistory(int id){
        try{
            var result = await _service.GetCustomerHistoryAsync(id);
            return Ok(result);
        }
        catch (Exception ex){
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
}

