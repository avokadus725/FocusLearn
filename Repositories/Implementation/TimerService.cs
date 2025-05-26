using FocusLearn.Models.Domain;
using FocusLearn.Models.DTO;
using FocusLearn.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;

namespace FocusLearn.Repositories.Implementation
{
    public class TimerService : ITimerService
    {
        private readonly FocusLearnDbContext _context;
        private readonly ILogger<TimerService> _logger;
        
        private static readonly ConcurrentDictionary<int, ActiveSessionDTO> _activeSessions = new();

        public TimerService(FocusLearnDbContext context, ILogger<TimerService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ActiveSessionDTO> StartSessionAsync(int userId, int methodId, int durationMinutes)
        {
            _logger.LogInformation("Starting session for user {UserId}, method {MethodId}", userId, methodId);

            if (_activeSessions.ContainsKey(userId))
            {
                _logger.LogWarning("User {UserId} already has active session", userId);
                throw new InvalidOperationException("У користувача вже є активна сесія");
            }

            var method = await _context.ConcentrationMethods.FindAsync(methodId);
            if (method == null)
            {
                _logger.LogError("Method {MethodId} not found", methodId);
                throw new ArgumentException("Методику не знайдено");
            }

            var now = DateTime.UtcNow;
            var session = new ActiveSessionDTO
            {
                UserId = userId,
                MethodId = methodId,
                MethodTitle = method.Title,
                CurrentPhase = "Work",
                StartTime = now,
                PhaseStartTime = now,
                PauseStartTime = null,
                TotalPausedSeconds = 0,
                PhaseDurationMinutes = method.WorkDuration,
                WorkDurationMinutes = method.WorkDuration,
                BreakDurationMinutes = method.BreakDuration,
                IsActive = true,
                IsPaused = false,
                CurrentCycle = 1
            };

            UpdateSessionCalculations(session);

            _activeSessions[userId] = session;

            _logger.LogInformation("Session started successfully for user {UserId}", userId);
            return session;
        }

        public async Task<ActiveSessionDTO?> GetActiveSessionAsync(int userId)
        {
            if (_activeSessions.TryGetValue(userId, out var session))
            {
                UpdateSessionCalculations(session);
                return session;
            }

            return null;
        }

        public async Task<ActiveSessionDTO?> TogglePauseAsync(int userId)
        {
            if (!_activeSessions.TryGetValue(userId, out var session))
            {
                _logger.LogWarning("No active session found for user {UserId}", userId);
                return null;
            }

            if (session.CurrentPhase != "Work")
            {
                throw new InvalidOperationException("Перерву не можна ставити на паузу");
            }

            var now = DateTime.UtcNow;

            if (session.IsPaused)
            {
                if (session.PauseStartTime.HasValue)
                {
                    var pauseDuration = (int)(now - session.PauseStartTime.Value).TotalSeconds;
                    session.TotalPausedSeconds += pauseDuration;
                }
                session.IsPaused = false;
                session.PauseStartTime = null;
                _logger.LogInformation("Session resumed for user {UserId}", userId);
            }
            else
            {
                session.IsPaused = true;
                session.PauseStartTime = now;
                _logger.LogInformation("Session paused for user {UserId}", userId);
            }

            UpdateSessionCalculations(session);
            return session;
        }

        public async Task<bool> StopSessionAsync(int userId)
        {
            if (!_activeSessions.TryRemove(userId, out var session))
            {
                _logger.LogWarning("No active session found for user {UserId}", userId);
                return false;
            }

            await SaveCurrentPhaseToDatabase(session);

            _logger.LogInformation("Session stopped for user {UserId}", userId);
            return true;
        }

        public async Task<ActiveSessionDTO?> CompleteCurrentPhaseAsync(int userId)
        {
            if (!_activeSessions.TryGetValue(userId, out var session))
            {
                _logger.LogWarning("No active session found for user {UserId}", userId);
                return null;
            }

            await SaveCurrentPhaseToDatabase(session);

            var now = DateTime.UtcNow;

            if (session.CurrentPhase == "Work")
            {
                session.CurrentPhase = "Break";
                session.PhaseDurationMinutes = session.BreakDurationMinutes;
                session.PhaseStartTime = now;
                session.TotalPausedSeconds = 0;
                session.IsPaused = false;
                session.PauseStartTime = null;
                _logger.LogInformation("Phase changed to Break for user {UserId}", userId);
            }
            else
            {
                session.CurrentPhase = "Work";
                session.PhaseDurationMinutes = session.WorkDurationMinutes;
                session.PhaseStartTime = now;
                session.TotalPausedSeconds = 0;
                session.IsPaused = false;
                session.PauseStartTime = null;
                session.CurrentCycle++;
                _logger.LogInformation("Phase changed to Work, cycle {Cycle} for user {UserId}", session.CurrentCycle, userId);
            }

            UpdateSessionCalculations(session);
            return session;
        }

        public async Task UpdateSessionTimeAsync(int userId)
        {
            if (_activeSessions.TryGetValue(userId, out var session))
            {
                UpdateSessionCalculations(session);
            }
        }

        private void UpdateSessionCalculations(ActiveSessionDTO session)
        {
            var now = DateTime.UtcNow;
            var phaseStartTime = session.PhaseStartTime ?? session.StartTime;
            
            var totalPhaseSeconds = (int)(now - phaseStartTime).TotalSeconds;
            
            var pausedSeconds = session.TotalPausedSeconds;
            if (session.IsPaused && session.PauseStartTime.HasValue)
            {
                pausedSeconds += (int)(now - session.PauseStartTime.Value).TotalSeconds;
            }

            session.ElapsedSeconds = Math.Max(0, totalPhaseSeconds - pausedSeconds);
            

            var totalPhaseTime = session.PhaseDurationMinutes * 60;
            session.RemainingSeconds = Math.Max(0, totalPhaseTime - session.ElapsedSeconds);
        }

        private async Task SaveCurrentPhaseToDatabase(ActiveSessionDTO session)
        {
            try
            {
                var phaseStartTime = session.PhaseStartTime ?? session.StartTime;
                var now = DateTime.UtcNow;
                
                var iotSession = new IoTSession
                {
                    UserId = session.UserId,
                    MethodId = session.MethodId,
                    SessionType = session.CurrentPhase == "Work" ? "Concentration" : "Break",
                    StartTime = phaseStartTime,
                    EndTime = now
                };

                _context.IoTSessions.Add(iotSession);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Session phase saved to database for user {UserId}", session.UserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving session phase to database");
            }
        }
    }
}