using FocusLearn.Models.Domain;
using FocusLearn.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;

namespace FocusLearn.Models.DTO
{
    public class LearningMaterialDTO
    {
        public int MaterialId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? FileLink { get; set; }
        public int CreatorId { get; set; }

    }
}
