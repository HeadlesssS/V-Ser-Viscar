namespace Ser_Backend.Models
{
    public class Staff
    {
        public int Id { get; set; }
        public int UserId { get; set;  }    

        public string EmployeeCode { get; set; } =string .Empty;

        public DateTime HiredAt { get; set; } =DateTime.Now;

        public User User { get; set; } = null!;

        public ICollection<SalesInvoice> SaleInvoices { get; set; }


    }
}
