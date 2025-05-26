namespace FocusLearn.Models.DTO
{
    public class ActiveSessionDTO
    {
        public int UserId { get; set; }
        public int MethodId { get; set; }
        public string MethodTitle { get; set; } = null!;
        public string CurrentPhase { get; set; } = null!; // "Work" або "Break"
        public DateTime StartTime { get; set; }
        public DateTime? PauseStartTime { get; set; }
        public int TotalPausedSeconds { get; set; }
        public int PhaseDurationMinutes { get; set; }
        public int WorkDurationMinutes { get; set; }
        public int BreakDurationMinutes { get; set; }
        public bool IsActive { get; set; }
        public bool IsPaused { get; set; }
        public int RemainingSeconds { get; set; }
        public int ElapsedSeconds { get; set; }
        public DateTime? PhaseStartTime { get; set; }
        public int CurrentCycle { get; set; } // Номер поточного циклу (1, 2, 3...)
    }
}