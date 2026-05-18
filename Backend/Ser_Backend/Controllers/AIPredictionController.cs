using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ser_Backend.DTO.AIPredictions;
using Ser_Backend.Services;

namespace Ser_Backend.Controllers
{
    [ApiController]
    [Route("api/ai-predictions")]
    public class AIPredictionController : ControllerBase
    {
        private readonly AIPredictionService _service;

        public AIPredictionController(AIPredictionService service)
        {
            _service = service;
        }

        int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost("run")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> RunPrediction([FromBody] RunAIPredictionDto dto)
        {
            try
            {
                var result = await _service.RunPredictionAsync(GetUserId(), dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyPredictions()
        {
            try
            {
                var result = await _service.GetMyPredictionsAsync(GetUserId());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
