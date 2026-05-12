 namespace Ser_Backend.Models
{
    public class Appointment
    {
        public int Id { get; set; } 
        public int CustomerId { get; set; }
        public int VehicleId { get; set; }
        public DateTime AppointmentDate { get; set; }

        public string ServiceType {  get; set; } =string.Empty;
        public enum AppointmentStatus
        {
            Pending,
            Confirmed,
            Completed,
            Cancelled
        }

        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;

        public string Notes { get; set; } =string.Empty;

        public Customer Customer { get; set; } = null;
        public Vehicle Vehicle { get; set; } = null;







    }
}
