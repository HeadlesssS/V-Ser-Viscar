namespace Ser_Viscar.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Customer"; // Admin, Staff, Customer
        public string? Email { get; set; }
        public Customer? Customer { get; set; }
    }
}
