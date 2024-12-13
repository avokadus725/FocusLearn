using FocusLearn.Models.Domain;
using FocusLearn.Models.DTO;

namespace FocusLearn.Repositories.Abstract
{
    public interface ILearningMaterialService
    {
        Task<IEnumerable<LearningMaterial>> GetAllMaterialsAsync();
        Task<LearningMaterial?> GetMaterialByIdAsync(int id);
        Task AddMaterialAsync(int creatorId, LearningMaterialDTO materialDto);
        Task<bool> UpdateMaterialAsync(int id, LearningMaterialDTO materialDto);
        Task<bool> DeleteMaterialAsync(int id);
    }
}
