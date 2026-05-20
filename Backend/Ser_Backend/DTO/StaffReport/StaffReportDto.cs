namespace Ser_Backend.DTO.StaffReport
{
    /// <summary>DTO for a high-spending customer report entry.</summary>
    public class HighSpenderDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public decimal TotalSpent { get; set; }
        public string LoyaltyTier { get; set; } = string.Empty;
        public int InvoiceCount { get; set; }
    }

    /// <summary>DTO for a regular (frequent) customer report entry.</summary>
    public class RegularCustomerDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int InvoiceCount { get; set; }
        public decimal TotalSpent { get; set; }
        public DateTime? LastPurchaseDate { get; set; }
    }

    /// <summary>DTO for a customer with outstanding credit balance.</summary>
    public class PendingCreditDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public decimal CreditBalance { get; set; }
        public DateTime? OldestUnpaidDate { get; set; }
        public int? OverdueDays { get; set; }
    }
}
