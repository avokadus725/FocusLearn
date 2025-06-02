namespace FocusLearn.Models.DTO
{
    public class ProductivityTrendDTO
    {
        public double Slope { get; set; }
        public double Intercept { get; set; }
        public bool IsPositive { get; set; }
        public double CorrelationCoefficient { get; set; }
        public List<DailyProductivityDTO> DailyData { get; set; } = new List<DailyProductivityDTO>();
    }

    public class DailyProductivityDTO
    {
        public DateTime Date { get; set; }
        public double Productivity { get; set; }
    }
}
