using System;
using System.Collections.Generic;

namespace FocusLearn.Models;

public partial class Assignment
{
    public int AssignmentId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public int? StudentId { get; set; }

    public int TutorId { get; set; }

    public string? Status { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public byte? Rating { get; set; }

    public virtual User? Student { get; set; }

    public virtual User Tutor { get; set; } = null!;
}
