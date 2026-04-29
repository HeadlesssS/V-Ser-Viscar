using System.ComponentModel.DataAnnotations;

namespace Ser_Viscar.Models
{
    public enum UserRole
    {
        Admin = 0,
        Staff = 1,
        Customer = 2
    }

    public class User
    {
        public int Id { get; set; }

        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(180)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(40)]
        public string Phone { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public UserRole Role { get; set; } = UserRole.Customer;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    }
}
