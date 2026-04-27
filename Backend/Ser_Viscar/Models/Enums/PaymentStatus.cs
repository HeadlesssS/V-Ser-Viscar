namespace Ser_Viscar.Models.Enums
{
    /// <summary>
    /// Tracks the payment lifecycle for sales invoices.
    /// Used by Feature 9 (pending credit reports) and Feature 15 (overdue reminders).
    /// </summary>
    public enum PaymentStatus
    {
        Pending = 0,
        PartiallyPaid = 1,
        Paid = 2,
        Overdue = 3,
        Cancelled = 4
    }

    /// <summary>
    /// Payment method options for sales transactions.
    /// </summary>
    public enum PaymentMethod
    {
        Cash = 0,
        Card = 1,
        Credit = 2,
        BankTransfer = 3,
        DigitalWallet = 4
    }

    /// <summary>
    /// Status of a sales invoice through its lifecycle.
    /// </summary>
    public enum InvoiceStatus
    {
        Draft = 0,
        Confirmed = 1,
        Paid = 2,
        Cancelled = 3
    }

    /// <summary>
    /// User roles in the system.
    /// </summary>
    public enum UserRole
    {
        Admin = 0,
        Staff = 1,
        Customer = 2
    }
}
