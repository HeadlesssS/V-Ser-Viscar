namespace Ser_Backend.DTO.Customer
{
    public class CustomerResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string LoyaltyTier { get; set; } = string.Empty;
        public decimal TotalSpent { get; set; }
        public decimal CreditBalance { get; set; }
    }

    public class CustomerByEmailDto
    {
        public int CustomerId { get; set; }
        public string FullName { get; set; } = string.Empty;
    }
}
