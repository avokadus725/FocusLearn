using FocusLearn.Models.Domain;
using FocusLearn.Models.DTO;
using FocusLearn.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;

namespace FocusLearn.Repositories.Implementation
{
    public class LearningMaterialService : ILearningMaterialService
    {
        private readonly FocusLearnDbContext _context;

        public LearningMaterialService(FocusLearnDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LearningMaterial>> GetAllMaterialsAsync()
        {
            return await _context.LearningMaterials
                .Include(m => m.Creator)
                .ToListAsync();
        }

        public async Task<LearningMaterial?> GetMaterialByIdAsync(int id)
        {
            return await _context.LearningMaterials
                .Include(m => m.Creator)
                .FirstOrDefaultAsync(m => m.MaterialId == id);
        }

        public async Task AddMaterialAsync(int creatorId, LearningMaterialDTO materialDto)
        {
            var newMaterial = new LearningMaterial
            {
                CreatorId = creatorId,
                Title = materialDto.Title,
                Description = materialDto.Description,
                FileLink = materialDto.FileLink
            };

            _context.LearningMaterials.Add(newMaterial);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateMaterialAsync(int id, LearningMaterialDTO materialDto)
        {
            var existingMaterial = await _context.LearningMaterials.FindAsync(id);

            if (existingMaterial == null)
                return false;

            existingMaterial.Title = materialDto.Title;
            existingMaterial.Description = materialDto.Description;
            existingMaterial.FileLink = materialDto.FileLink;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteMaterialAsync(int id)
        {
            var material = await _context.LearningMaterials.FindAsync(id);

            if (material == null)
                return false;

            _context.LearningMaterials.Remove(material);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
