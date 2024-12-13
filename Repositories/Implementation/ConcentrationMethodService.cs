using FocusLearn.Models.Domain;
using FocusLearn.Models.DTO;
using FocusLearn.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;

namespace FocusLearn.Repositories.Implementation
{
    public class ConcentrationMethodService : IConcentrationMethodService
    {
        private readonly FocusLearnDbContext _context;

        public ConcentrationMethodService(FocusLearnDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ConcentrationMethod>> GetAllMethodsAsync()
        {
            return await _context.ConcentrationMethods.ToListAsync();
        }

        public async Task<ConcentrationMethod?> GetMethodByIdAsync(int id)
        {
            return await _context.ConcentrationMethods.FindAsync(id);
        }

        public async Task AddMethodAsync(ConcentrationMethodDTO methodDto)
        {
            var newMethod = new ConcentrationMethod
            {
                Title = methodDto.Title,
                Description = methodDto.Description,
                WorkDuration = methodDto.WorkDuration,
                BreakDuration = methodDto.BreakDuration
            };

            _context.ConcentrationMethods.Add(newMethod);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateMethodAsync(int id, ConcentrationMethodDTO methodDto)
        {
            var existingMethod = await _context.ConcentrationMethods.FindAsync(id);

            if (existingMethod == null)
                return false;

            existingMethod.Title = methodDto.Title;
            existingMethod.Description = methodDto.Description;
            existingMethod.WorkDuration = methodDto.WorkDuration;
            existingMethod.BreakDuration = methodDto.BreakDuration;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteMethodAsync(int id)
        {
            var method = await _context.ConcentrationMethods.FindAsync(id);

            if (method == null)
                return false;

            _context.ConcentrationMethods.Remove(method);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
