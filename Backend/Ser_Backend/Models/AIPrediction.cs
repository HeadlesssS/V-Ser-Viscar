namespace Ser_Backend.Models
{
    public class AIPrediction
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public string PredictedIssue { get; set; } = string.Empty;
        public enum PredictionSeverity
        {
            Low,
            Medium,
            High
        }
        public  PredictionSeverity Severity { get; set; } = PredictionSeverity.Low; // Low, Medium, High
        public DateTime PredictedAt { get; set; } = DateTime.UtcNow;
        public bool AlertSent { get; set; } = false;

        public Vehicle Vehicle { get; set; } = null!;
    }
}
