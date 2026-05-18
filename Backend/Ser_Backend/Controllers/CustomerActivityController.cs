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
    [AllowAnonymous]
    public async Task<IActionResult> GetAllReviews()
    {
        try
        {
            var result = await _service.GetAllReviewsAsync();
            return Ok(result);
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("reviews/my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyReview()
    {
        try
        {
            var result = await _service.GetMyReviewAsync(GetUserId());
            return Ok(result);
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("reviews/can-review")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CanReview()
    {
        try
        {
            var result = await _service.CanReviewAsync(GetUserId());
            return Ok(result);
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("reviews/{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        try
        {
            var result = await _service.DeleteReviewAsync(id);
            return Ok(new { message = result });
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    // GET api/appointments (Admin + Staff)
    [HttpGet("appointments")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllAppointments()
    {
        try
        {
            var result = await _service.GetAllAppointmentsAsync();
            return Ok(result);
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    // PUT api/appointments/{id}/status (Admin + Staff)
    [HttpPut("appointments/{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusDto dto)
    {
        try
        {
            var result = await _service.UpdateAppointmentStatusAsync(id, dto.Status);
            return Ok(new { message = result });
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    // GET api/part-requests (Admin + Staff)
    [HttpGet("part-requests")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllPartRequests()
    {
        try
        {
            var result = await _service.GetAllPartRequestsAsync();
            return Ok(result);
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    // PUT api/part-requests/{id}/status (Admin + Staff)
    [HttpPut("part-requests/{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdatePartRequestStatus(int id, [FromBody] UpdatePartRequestStatusDto dto)
    {
        try
        {
            var result = await _service.UpdatePartRequestStatusAsync(id, dto.Status);
            return Ok(new { message = result });
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}
