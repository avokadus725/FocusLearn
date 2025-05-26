using FocusLearn.Models.DTO;

namespace FocusLearn.Repositories.Abstract
{
    public interface ITimerService
    {
        /// <summary>
        /// Запустити нову сесію концентрації
        /// </summary>
        Task<ActiveSessionDTO> StartSessionAsync(int userId, int methodId, int durationMinutes);

        /// <summary>
        /// Отримати активну сесію користувача
        /// </summary>
        Task<ActiveSessionDTO?> GetActiveSessionAsync(int userId);

        /// <summary>
        /// Поставити сесію на паузу або відновити
        /// </summary>
        Task<ActiveSessionDTO?> TogglePauseAsync(int userId);

        /// <summary>
        /// Завершити поточну сесію
        /// </summary>
        Task<bool> StopSessionAsync(int userId);

        /// <summary>
        /// Завершити поточну фазу та перейти до наступної
        /// </summary>
        Task<ActiveSessionDTO?> CompleteCurrentPhaseAsync(int userId);

        /// <summary>
        /// Оновити час активної сесії (для періодичного збереження)
        /// </summary>
        Task UpdateSessionTimeAsync(int userId);
    }
}