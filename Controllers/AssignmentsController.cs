using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FocusLearn.Models.DTO;
using FocusLearn.Repositories.Abstract;
using System.Security.Claims;

namespace FocusLearn.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Доступ лише для авторизованих користувачів
    [ServiceFilter(typeof(UserStatusFilter))]

    public class AssignmentsController : ControllerBase
    {
        private readonly IAssignmentService _service;

        public AssignmentsController(IAssignmentService service)
        {
            _service = service;
        }

        /// <summary>
        /// Отримати всі завдання
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAssignments()
        {
            var assignments = await _service.GetAllAssignmentsAsync();
            return Ok(assignments);
        }
        /// <summary>
        /// Отримати доступні завдання
        /// </summary>
        [HttpGet("all")]
        [Authorize]
        public async Task<IActionResult> GetAvailableAssignments()
        {
            var assignments = await _service.GetAvailableAssignmentsAsync();
            return Ok(assignments);
        }

        /// <summary>
        /// Отримати всі завдання поточного користувача
        /// </summary>
        [HttpGet("my-assignments")]
        public async Task<IActionResult> GetMyAssignments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                      User.FindFirst("sub") ??
                      User.FindFirst("UserId");

            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var userId = int.Parse(userIdClaim.Value);

            var allAssignments = await _service.GetAllAssignmentsAsync();

            // Фільтруємо завдання за ідентифікатором користувача
            var userAssignments = allAssignments
                .Where(a => a.StudentId == userId || a.TutorId == userId)
                .ToList();

            if (userAssignments == null || !userAssignments.Any())
            {
                return NotFound("You don't have any assignments.");
            }

            return Ok(userAssignments);
        }

        /// <summary>
        /// Отримати завдання за ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAssignmentById(int id)
        {
            var assignment = await _service.GetAssignmentByIdAsync(id);
            if (assignment == null)
                return NotFound($"Assignment with ID {id} not found.");

            return Ok(assignment);
        }

        /// <summary>
        /// Створити нове завдання
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Tutor, Admin")] // Лише репетитори або адміністратори можуть створювати завдання
        public async Task<IActionResult> AddAssignment([FromBody] AssignmentDTO assignmentDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                      User.FindFirst("sub") ??
                      User.FindFirst("UserId");


            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var tutorId = int.Parse(userIdClaim.Value);


            await _service.AddAssignmentAsync(tutorId, assignmentDto);
            return StatusCode(StatusCodes.Status201Created);
        }

        /// <summary>
        /// Оновити завдання за ID
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Tutor, Admin")] // Лише репетитори або адміністратори можуть оновлювати завдання
        public async Task<IActionResult> UpdateAssignment(int id, [FromBody] AssignmentDTO assignmentDto)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid data.");

            var result = await _service.UpdateAssignmentAsync(id, assignmentDto);
            if (!result)
                return NotFound($"Assignment with ID {id} not found.");

            return NoContent();
        }

        /// <summary>
        /// Видалити завдання за ID
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Tutor, Admin")] // Лише адміністратор може видаляти завдання
        public async Task<IActionResult> DeleteAssignment(int id)
        {
            var result = await _service.DeleteAssignmentAsync(id);
            if (!result)
                return NotFound($"Assignment with ID {id} not found.");

            return NoContent();
        }
        /// <summary>
/// Приєднатися до завдання - "Виконати" (студент)
/// </summary>
[HttpPost("{id}/take")]
[Authorize(Roles = "Student")]
public async Task<IActionResult> TakeAssignment(int id)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
        User.FindFirst("sub") ??
        User.FindFirst("UserId");

    if (userIdClaim == null)
        return Unauthorized("User ID not found in token");

    var userId = int.Parse(userIdClaim.Value);
    
    // Перевіряємо чи завдання існує та доступне
    var assignment = await _service.GetAssignmentByIdAsync(id);
    if (assignment == null)
        return NotFound($"Assignment with ID {id} not found.");
    
    if (assignment.StudentId != null)
        return BadRequest("Assignment is already taken by another student.");
    
    if (assignment.Status != "InProgress")
        return BadRequest("Assignment is not available for taking.");

    var updateData = new AssignmentDTO
    {
        AssignmentId = assignment.AssignmentId,
        Title = assignment.Title,
        Description = assignment.Description,
        FileLink = assignment.FileLink,
        TutorId = assignment.TutorId,
        TaskId = assignment.TaskId,
        Status = "InProgress", // Статус залишається той же
        DueDate = DateTime.UtcNow.AddDays(7), // Встановлюємо термін
        StudentId = userId, // Призначаємо студента
        CreatedAt = assignment.CreatedAt,
        Rating = assignment.Rating
    };

    var result = await _service.UpdateAssignmentAsync(id, updateData);
    if (!result)
        return StatusCode(500, "Failed to take assignment.");

    return Ok(new { Message = "Assignment taken successfully", DueDate = updateData.DueDate });
}

/// <summary>
/// Завантажити файл на перевірку (студент)
/// </summary>
[HttpPost("{id}/submit")]
[Authorize(Roles = "Student")]
public async Task<IActionResult> SubmitAssignment(int id, [FromBody] SubmitAssignmentRequest request)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
        User.FindFirst("sub") ??
        User.FindFirst("UserId");

    if (userIdClaim == null)
        return Unauthorized("User ID not found in token");

    var userId = int.Parse(userIdClaim.Value);

    // Перевіряємо чи це завдання належить цьому студенту
    var assignment = await _service.GetAssignmentByIdAsync(id);
    if (assignment == null)
        return NotFound($"Assignment with ID {id} not found.");
    
    if (assignment.StudentId != userId)
        return Forbid("You can only submit your own assignments.");

    if (assignment.Status != "InProgress")
        return BadRequest("Assignment is not in progress.");

    var updateData = new AssignmentDTO
    {
        AssignmentId = assignment.AssignmentId,
        Title = assignment.Title,
        Description = assignment.Description,
        FileLink = request.FileLink, // Додаємо файл
        TutorId = assignment.TutorId,
        TaskId = assignment.TaskId,
        Status = "Pending", // Змінюємо на "На перевірці"
        DueDate = assignment.DueDate,
        StudentId = assignment.StudentId,
        CreatedAt = assignment.CreatedAt,
        Rating = assignment.Rating
    };

    var result = await _service.UpdateAssignmentAsync(id, updateData);
    if (!result)
        return StatusCode(500, "Failed to submit assignment.");

    return Ok(new { Message = "Assignment submitted for review successfully" });
}

/// <summary>
/// Завершити завдання (студент) - очищає поля та повертає в доступні
/// Працює як для InProgress (до файлу), так і для Completed (після оцінки)
/// </summary>
[HttpPost("{id}/complete")]
[Authorize(Roles = "Student")]
public async Task<IActionResult> CompleteAssignment(int id)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
        User.FindFirst("sub") ??
        User.FindFirst("UserId");

    if (userIdClaim == null)
        return Unauthorized("User ID not found in token");

    var userId = int.Parse(userIdClaim.Value);

    // Перевіряємо чи це завдання належить цьому студенту
    var assignment = await _service.GetAssignmentByIdAsync(id);
    if (assignment == null)
        return NotFound($"Assignment with ID {id} not found.");
    
    if (assignment.StudentId != userId)
        return Forbid("You can only complete your own assignments.");

    // Дозволяємо завершувати завдання в статусі InProgress або Completed
    if (assignment.Status != "InProgress" && assignment.Status != "Completed")
        return BadRequest("Assignment must be in progress or completed to be finished.");

    var updateData = new AssignmentDTO
    {
        AssignmentId = assignment.AssignmentId,
        Title = assignment.Title,
        Description = assignment.Description,
        FileLink = null, // Очищаємо файл
        TutorId = assignment.TutorId,
        TaskId = assignment.TaskId,
        Status = "InProgress", // Повертаємо в доступні
        DueDate = null, // Очищаємо термін
        StudentId = null, // Очищаємо студента
        CreatedAt = assignment.CreatedAt,
        Rating = null // Очищаємо рейтинг
    };

    var result = await _service.UpdateAssignmentAsync(id, updateData);
    if (!result)
        return StatusCode(500, "Failed to complete assignment.");

    return Ok(new { Message = "Assignment completed and returned to available assignments" });
}

/// <summary>
/// Поставити оцінку завданню (викладач)
/// </summary>
[HttpPost("{id}/grade")]
[Authorize(Roles = "Tutor, Admin")]
public async Task<IActionResult> GradeAssignment(int id, [FromBody] GradeAssignmentRequest request)
{
    var assignment = await _service.GetAssignmentByIdAsync(id);
    if (assignment == null)
        return NotFound($"Assignment with ID {id} not found.");
    
    if (assignment.Status != "Pending")
        return BadRequest("Assignment must be pending review to be graded.");

    if (assignment.StudentId == null)
        return BadRequest("Assignment must have a student assigned.");

    var updateData = new AssignmentDTO
    {
        AssignmentId = assignment.AssignmentId,
        Title = assignment.Title,
        Description = assignment.Description,
        FileLink = assignment.FileLink,
        TutorId = assignment.TutorId,
        TaskId = assignment.TaskId,
        Status = "Completed", // Змінюємо на завершено
        DueDate = assignment.DueDate,
        StudentId = assignment.StudentId,
        CreatedAt = assignment.CreatedAt,
        Rating = request.Rating // Додаємо оцінку
    };

    var result = await _service.UpdateAssignmentAsync(id, updateData);
    if (!result)
        return StatusCode(500, "Failed to grade assignment.");

    return Ok(new { Message = "Assignment graded successfully", Rating = request.Rating });
}

// DTO для запитів
public class SubmitAssignmentRequest
{
    public string FileLink { get; set; } = null!;
}

public class GradeAssignmentRequest
{
    public byte Rating { get; set; }
}
    }
}
