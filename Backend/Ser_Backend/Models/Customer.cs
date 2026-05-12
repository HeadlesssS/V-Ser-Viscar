using Microsoft.AspNetCore.Mvc.ViewEngines;

namespace Ser_Backend.Models
{
    public class Customer
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string LoyaltyTier { get; set; } = "Standard";
        public decimal TotalSpent { get; set; } = 0;
        public decimal CreditBalance { get; set; } = 0;
        public DateTime? LastCreditReminder { get; set; }

        public User User { get; set; } = null!;
        public ICollection<Vehicle> Vehicles { get; set; } = [];
        public ICollection<SalesInvoice> SalesInvoices { get; set; } = [];
        public ICollection<Appointment> Appointments { get; set; } = [];
        public ICollection<PartRequest> PartRequests { get; set; } = [];
        public ICollection<Review> Reviews { get; set; } = [];
    }
}
