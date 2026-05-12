using System.ComponentModel.DataAnnotations;

namespace Ser_Backend.Models

{
    public class User
    {

        public enum UserRole
        {
            Admin,
            Staff,
            Customer
        }


        public int Id { get; set; }
        public string? Name { get; set; }

        public string Email { get; set; }
        public string? PasswordHash { get; set; } 

        public string Phone { get; set; }

        public UserRole Role { get; set; }

        public bool isActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } =DateTime.Now;

        public Staff? Staff { get; set; }

        public Customer? Customer { get; set; }
    }
}
