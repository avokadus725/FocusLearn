using FocusLearn.Repositories.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FocusLearn.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BusinessLogicController : ControllerBase
    {
        private readonly IBusinessLogicService _service;

        public BusinessLogicController(IBusinessLogicService service)
        {
            _service = service;
        }

        /// <summary>
        /// Отримати загальну статистику користувача
        /// </summary>
        [HttpGet("user-statistics")]
        public async Task<IActionResult> GetUserStatistics([FromQuery] DateTime periodStartDate, [FromQuery] string periodType)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                      User.FindFirst("sub") ??
                      User.FindFirst("UserId");

                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found in token");
                }

                var userId = int.Parse(userIdClaim.Value);
                var statistics = await _service.CalculateUserStatisticsAsync(userId, periodStartDate, periodType);

                return Ok(statistics);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while calculating statistics.", Details = ex.Message });
            }
        }

        /// <summary>
        /// Оновити статистику методики для користувача
        /// </summary>
        [HttpPost("update-method-statistics")]
        public async Task<IActionResult> UpdateMethodStatistics([FromQuery] int methodId, [FromQuery] DateTime periodStartDate, [FromQuery] string periodType)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                      User.FindFirst("sub") ??
                      User.FindFirst("UserId");

                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found in token");
                }

                var userId = int.Parse(userIdClaim.Value);
                await _service.UpdateMethodStatisticsAsync(userId, methodId, periodStartDate, periodType);

                return Ok(new { Message = "Statistics updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while updating statistics.", Details = ex.Message });
            }
        }

        /// <summary>
        /// Визначити найефективнішу методику
        /// </summary>
        [HttpGet("most-effective-method")]
        public async Task<IActionResult> GetMostEffectiveMethod([FromQuery] DateTime periodStartDate, [FromQuery] string periodType)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                      User.FindFirst("sub") ??
                      User.FindFirst("UserId");

                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found in token");
                }

                var userId = int.Parse(userIdClaim.Value);
                var result = await _service.GetMostEffectiveMethodAsync(userId, periodStartDate, periodType);

                return Ok(new { Message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while determining the most effective method.", Details = ex.Message });
            }
        }


        /// <summary>
        /// Отримати коефіцієнт продуктивності користувача
        /// </summary>
        [HttpGet("productivity-coefficient")]
        public async Task<IActionResult> GetProductivityCoefficient(
            [FromQuery] DateTime periodStartDate,
            [FromQuery] string periodType)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                      User.FindFirst("sub") ??
                      User.FindFirst("UserId");

                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found in token");
                }

                var userId = int.Parse(userIdClaim.Value);

                var coefficient = await _service.CalculateProductivityCoefficientAsync(
                    userId,
                    periodStartDate,
                    periodType);

                return Ok(new { ProductivityCoefficient = coefficient });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while calculating productivity coefficient.", Details = ex.Message });
            }
        }

        /// <summary>
        /// Спрогнозувати потенційне покращення продуктивності
        /// </summary>
        [HttpGet("predict-productivity")]
        public async Task<IActionResult> PredictProductivityImprovement(
            [FromQuery] DateTime periodStartDate,
            [FromQuery] string periodType)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                      User.FindFirst("sub") ??
                      User.FindFirst("UserId");

                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found in token");
                }

                var userId = int.Parse(userIdClaim.Value);

                var prediction = await _service.PredictProductivityImprovementAsync(
                    userId,
                    periodStartDate,
                    periodType);

                return Ok(prediction);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while predicting productivity improvement.", Details = ex.Message });
            }
        }

        /// <summary>
        /// Аналіз тренду продуктивності
        /// </summary>
        [HttpGet("productivity-trend")]
        public async Task<IActionResult> AnalyzeProductivityTrend([FromQuery] int daysToAnalyze = 30)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                      User.FindFirst("sub") ??
                      User.FindFirst("UserId");

                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found in token");
                }

                var userId = int.Parse(userIdClaim.Value);

                var trend = await _service.AnalyzeProductivityTrendAsync(userId, daysToAnalyze);
                return Ok(trend);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while analyzing productivity trend.", Details = ex.Message });
            }
        }
    }
}

