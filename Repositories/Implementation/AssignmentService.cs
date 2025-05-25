using FocusLearn.Models.Domain;
using FocusLearn.Models.DTO;
using FocusLearn.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;
namespace FocusLearn.Repositories.Implementation
{
public class AssignmentService : IAssignmentService
{
private readonly FocusLearnDbContext _context;
    public AssignmentService(FocusLearnDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Отримати всі завдання
    /// </summary>
    public async Task<IEnumerable<AssignmentDTO>> GetAllAssignmentsAsync()
    {
        return await _context.Assignments
            .Select(a => new AssignmentDTO
            {
                AssignmentId = a.AssignmentId,
                Title = a.Title,
                Description = a.Description,
                FileLink = a.FileLink,
                StudentId = a.StudentId,
                TutorId = a.TutorId,
                TaskId = a.TaskId,
                Status = a.Status,
                DueDate = a.DueDate,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt,
                Rating = a.Rating,

                TutorName = a.Tutor.UserName
            })
            .ToListAsync();
    }
    
        /// <summary>
    /// Отримати доступні завдання
    /// </summary>
    public async Task<IEnumerable<AssignmentDTO>> GetAvailableAssignmentsAsync()
    {
        return await _context.Assignments
            .Where(a => a.StudentId == null && a.Status == "InProgress") 
            .Select(a => new AssignmentDTO
            {
                AssignmentId = a.AssignmentId,
                Title = a.Title,
                Description = a.Description,
                FileLink = a.FileLink,
                StudentId = a.StudentId,
                TutorId = a.TutorId,
                TaskId = a.TaskId,
                Status = a.Status,
                DueDate = a.DueDate,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt,
                Rating = a.Rating,

                TutorName = a.Tutor.UserName
            })
            .ToListAsync();
    }


    /// <summary>
        /// Отримати завдання за ID
        /// </summary>
        public async Task<AssignmentDTO?> GetAssignmentByIdAsync(int id)
        {
            return await _context.Assignments
                .Where(a => a.AssignmentId == id)
                .Select(a => new AssignmentDTO
                {
                    AssignmentId = a.AssignmentId,
                    Title = a.Title,
                    Description = a.Description,
                    FileLink = a.FileLink,
                    StudentId = a.StudentId,
                    TutorId = a.TutorId,
                    TaskId = a.TaskId,
                    Status = a.Status,
                    DueDate = a.DueDate,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    Rating = a.Rating,

                    TutorName = a.Tutor.UserName
                })
                .FirstOrDefaultAsync();
        }

    /// <summary>
    /// Додати завдання
    /// </summary>
    public async Task AddAssignmentAsync(int tutorId, AssignmentDTO assignmentDto)
    {
        var assignment = new Assignment
        {
            Title = assignmentDto.Title,
            Description = assignmentDto.Description,
            FileLink = assignmentDto.FileLink,
            StudentId = null,
            TutorId = tutorId,
            TaskId = assignmentDto.TaskId,
            Status = "InProgress",
            DueDate = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Rating = null
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Редагувати завдання
    /// </summary>
    public async Task<bool> UpdateAssignmentAsync(int id, AssignmentDTO assignmentDto)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return false;

        // Оновлюємо тільки ті поля, які передані і не null
        if (!string.IsNullOrEmpty(assignmentDto.Title))
            assignment.Title = assignmentDto.Title;
        
        // Для опису дозволяємо явне встановлення null
        if (assignmentDto.Description != null)
            assignment.Description = assignmentDto.Description;
        
        // Для FileLink дозволяємо явне встановлення null (очистити файл)
        assignment.FileLink = assignmentDto.FileLink;
        
        // Для StudentId дозволяємо явне встановлення null (зробити доступним)
        assignment.StudentId = assignmentDto.StudentId;
        
        if (assignmentDto.TaskId.HasValue)
            assignment.TaskId = assignmentDto.TaskId;
        
        if (!string.IsNullOrEmpty(assignmentDto.Status))
            assignment.Status = assignmentDto.Status;
        
        // Для DueDate дозволяємо явне встановлення null (очистити термін)
        assignment.DueDate = assignmentDto.DueDate;
        
        // Для Rating дозволяємо явне встановлення null (очистити оцінку)
        assignment.Rating = assignmentDto.Rating;

        assignment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Видалити завдання
    /// </summary>
    public async Task<bool> DeleteAssignmentAsync(int id)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return false;

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();
        return true;
    }
}
}