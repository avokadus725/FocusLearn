using FocusLearn.Models.Domain;
using FocusLearn.Models.DTO;

namespace FocusLearn.Repositories.Abstract
{
    public interface IUserService
    {
        Task<User?> GetUserByProviderAsync(string providerId, string authProvider);
        Task AddUserAsync(User user);
        Task<UserDTO?> GetUserByIdAsync(int userId);
        Task<User?> GetUserByEmailAsync(string email);
        Task<bool> UpdateUserAsync(int userId, UpdateProfileDTO updateUserDto);
        Task<bool> DeleteUserAsync(int userId);
        Task<IEnumerable<UserDTO>> GetAllUsersAsync();
    }
}
