using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ser_Backend.DTO.Appointment;
using Ser_Backend.DTO.PartRequests;
using Ser_Backend.DTO.Reviews;
using Ser_Backend.Services.Implementations;
using System.Security.Claims;

namespace Ser_Backend.Controllers;

[ApiController]
[Route("api")]
public class CustomerActivityController : ControllerBase
{
    private readonly CustomerActivityService _service;

    public CustomerActivityController(CustomerActivityService service)
    {
        _service = service;
    }

    int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("appointments")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> BookAppointment(CreateAppointmentDto dto)
    {
        try
        {
            var result = await _service.BookAppointmentAsync(GetUserId(), dto);
            return Ok(new { message = result });
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("appointments/my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyAppointments()
    {
        try
        {
            var result = await _service.GetMyAppointmentsAsync(GetUserId());
            return Ok(result);
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("part-requests")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreatePartRequest(CreatePartRequestDto dto)
    {
        try
        {
            var result = await _service.CreatePartRequestAsync(GetUserId(), dto);
            return Ok(new { message = result });
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    // GET api/part-requests/my
    [HttpGet("part-requests/my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyPartRequests()
    {
        try
        {
            var result = await _service.GetMyPartRequestsAsync(GetUserId());
            return Ok(result);
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("reviews")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> SubmitReview(CreateReviewDto dto)
    {
        try
        {
            var result = await _service.SubmitReviewAsync(GetUserId(), dto);
            return Ok(new { message = result });
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("reviews")]
    [Authorize]
    public async Task<IActionResult> GetAllReviews()
    {
        try
        {
            var result = await _service.GetAllReviewsAsync();
            return Ok(result);
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}