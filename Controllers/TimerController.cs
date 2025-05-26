using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FocusLearn.Repositories.Abstract;
using FocusLearn.Models.DTO;

namespace FocusLearn.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TimerController : ControllerBase
    {
        private readonly ITimerService _timerService;
        private readonly IConcentrationMethodService _methodService;
        private readonly MqttClientService _mqttClient;
        private readonly ILogger<TimerController> _logger;

        public TimerController(
            ITimerService timerService, 
            IConcentrationMethodService methodService,
            MqttClientService mqttClient,
            ILogger<TimerController> logger)
        {
            _timerService = timerService;
            _methodService = methodService;
            _mqttClient = mqttClient;
            _logger = logger;
        }

        /// <summary>
        /// Запустити нову сесію концентрації
        /// </summary>
        [HttpPost("start")]
        public async Task<IActionResult> StartSession([FromBody] StartSessionRequest request)
        {
            try
            {
                _logger.LogInformation("Starting session for method {MethodId}", request.MethodId);

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                                 User.FindFirst("sub") ??
                                 User.FindFirst("UserId");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    _logger.LogWarning("User ID not found in token");
                    return Unauthorized(new { Message = "User ID not found in token" });
                }

                _logger.LogInformation("User ID: {UserId}", userId);

                // Перевіряємо чи існує активна сесія
                var activeSession = await _timerService.GetActiveSessionAsync(userId);
                if (activeSession != null)
                {
                    _logger.LogWarning("User {UserId} already has active session", userId);
                    return BadRequest(new { Message = "У вас вже є активна сесія. Завершіть її перед початком нової." });
                }

                // Отримуємо методику
                var method = await _methodService.GetMethodByIdAsync(request.MethodId);
                if (method == null)
                {
                    _logger.LogWarning("Method {MethodId} not found", request.MethodId);
                    return NotFound(new { Message = "Методика не знайдена." });
                }

                _logger.LogInformation("Found method: {MethodTitle}", method.Title);

                // Створюємо нову сесію
                var session = await _timerService.StartSessionAsync(userId, request.MethodId, method.WorkDuration);

                _logger.LogInformation("Session started successfully for user {UserId}", userId);

                // Відправляємо дані на IoT пристрій через MQTT
                try
                {
                    var mqttPayload = new
                    {
                        WorkDuration = method.WorkDuration,
                        BreakDuration = method.BreakDuration,
                        UserId = userId,
                        MethodId = request.MethodId,
                        SessionType = "Concentration"
                    };
                    await _mqttClient.PublishMessageAsync("focuslearn/concentration", 
                        System.Text.Json.JsonSerializer.Serialize(mqttPayload));

                    _logger.LogInformation("MQTT message sent successfully");
                }
                catch (Exception mqttEx)
                {
                    _logger.LogError(mqttEx, "Failed to send MQTT message, but session created");
                    // Не падаємо, якщо MQTT не працює
                }

                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting session");
                return StatusCode(500, new { Message = "Помилка при запуску сесії", Details = ex.Message });
            }
        }

        /// <summary>
        /// Поставити сесію на паузу або відновити
        /// </summary>
        [HttpPost("pause")]
        public async Task<IActionResult> PauseSession()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                                 User.FindFirst("sub") ??
                                 User.FindFirst("UserId");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { Message = "User ID not found in token" });
                }

                var session = await _timerService.TogglePauseAsync(userId);
                if (session == null)
                {
                    return NotFound(new { Message = "Активна сесія не знайдена." });
                }

                return Ok(session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pausing session");
                return StatusCode(500, new { Message = "Помилка при паузі сесії", Details = ex.Message });
            }
        }

        /// <summary>
        /// Завершити поточну сесію
        /// </summary>
        [HttpPost("stop")]
        public async Task<IActionResult> StopSession()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                                 User.FindFirst("sub") ??
                                 User.FindFirst("UserId");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { Message = "User ID not found in token" });
                }

                var result = await _timerService.StopSessionAsync(userId);
                if (!result)
                {
                    return NotFound(new { Message = "Активна сесія не знайдена." });
                }

                return Ok(new { Message = "Сесію завершено успішно." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping session");
                return StatusCode(500, new { Message = "Помилка при завершенні сесії", Details = ex.Message });
            }
        }

        /// <summary>
        /// Отримати статус поточної сесії
        /// </summary>
        [HttpGet("status")]
        public async Task<IActionResult> GetSessionStatus()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                                 User.FindFirst("sub") ??
                                 User.FindFirst("UserId");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { Message = "User ID not found in token" });
                }

                var session = await _timerService.GetActiveSessionAsync(userId);
                if (session == null)
                {
                    return Ok(new { IsActive = false });
                }

                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting session status");
                return StatusCode(500, new { Message = "Помилка при отриманні статусу сесії", Details = ex.Message });
            }
        }

        /// <summary>
        /// Завершити поточну фазу сесії (для автоматичного переходу)
        /// </summary>
        [HttpPost("complete-phase")]
        public async Task<IActionResult> CompleteCurrentPhase()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                                 User.FindFirst("sub") ??
                                 User.FindFirst("UserId");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { Message = "User ID not found in token" });
                }

                var session = await _timerService.CompleteCurrentPhaseAsync(userId);
                if (session == null)
                {
                    return NotFound(new { Message = "Активна сесія не знайдена." });
                }

                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing phase");
                return StatusCode(500, new { Message = "Помилка при завершенні фази", Details = ex.Message });
            }
        }
    }

    public class StartSessionRequest
    {
        public int MethodId { get; set; }
    }
}