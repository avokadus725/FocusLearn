namespace FocusLearn.Models.DTO
{
    public class ProductivityPredictionDTO
    {
        public double CurrentProductivity { get; set; }
        public double PotentialProductivity { get; set; }
        public double ImprovementPercentage { get; set; }
        public List<string> Recommendations { get; set; } = new List<string>();
    }
}
