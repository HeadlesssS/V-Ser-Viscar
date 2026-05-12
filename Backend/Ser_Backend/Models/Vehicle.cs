namespace Ser_Backend.Models
{
    public class Vehicle
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string VehicleNumber { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string VIN { get; set; } = string.Empty;


        public Customer Customer { get; set; } = null!;
        public ICollection<Appointment> Appointments { get; set; } = [];
        public ICollection<AIPrediction> AIPredictions { get; set; } = [];
    }
}
