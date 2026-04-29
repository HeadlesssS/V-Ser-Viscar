using System.ComponentModel.DataAnnotations;

namespace Ser_Viscar.Models
{
    public class Vehicle
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }
        public User? Customer { get; set; }

        [MaxLength(40)]
        public string VehicleNumber { get; set; } = string.Empty;

        [MaxLength(80)]
        public string Brand { get; set; } = string.Empty;

        [MaxLength(80)]
        public string Model { get; set; } = string.Empty;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}

