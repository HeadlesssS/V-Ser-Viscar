using Ser_Viscar.DTOs.Customer;
using Ser_Viscar.DTOs.Invoice;
using Ser_Viscar.DTOs.Report;

namespace Ser_Viscar.Services.Interfaces
{
    // ═══════════════════════════════════════════════════════════
    //  Feature 10 (Irshad): Customer Search Service Interface
    // ═══════════════════════════════════════════════════════════

    /// <summary>
    /// Service for searching customers by multiple criteria.
    /// Supports search by name, phone number, customer ID, or vehicle number.
    /// </summary>
    public interface ICustomerSearchService
    {
        /// <summary>
        /// Unified search across name, phone, ID, and vehicle plate number.
        /// </summary>
        /// <param name="searchTerm">The search query string.</param>
        /// <returns>List of matching customers with vehicle and purchase summaries.</returns>
        Task<List<CustomerSearchResultDto>> SearchAsync(string searchTerm);
    }

    // ═══════════════════════════════════════════════════════════
    //  Feature 9 (Irshad): Customer Report Service Interface
    // ═══════════════════════════════════════════════════════════

    /// <summary>
    /// Service for generating customer-related analytical reports.
    /// Three report types: high spenders, regular customers, pending credits.
    /// </summary>
    public interface ICustomerReportService
    {
        /// <summary>
        /// High spenders report — customers ranked by total amount spent.
        /// </summary>
        /// <param name="top">Number of top spenders to return (default 20).</param>
        Task<CustomerReportResponseDto> GetHighSpendersAsync(int top = 20);

        /// <summary>
        /// Regular customers report — ranked by purchase frequency.
        /// </summary>
        /// <param name="top">Number of top customers to return (default 20).</param>
        Task<CustomerReportResponseDto> GetRegularCustomersAsync(int top = 20);

        /// <summary>
        /// Pending credits report — customers with unpaid balances.
        /// Highlights those overdue by more than 1 month.
        /// </summary>
        Task<CustomerReportResponseDto> GetPendingCreditsAsync();
    }

    // ═══════════════════════════════════════════════════════════
    //  Feature 11 (Irshad): Invoice Email Service Interface
    // ═══════════════════════════════════════════════════════════

    /// <summary>
    /// Service for composing and sending invoice emails to customers.
    /// </summary>
    public interface IInvoiceEmailService
    {
        /// <summary>
        /// Retrieves full invoice details for rendering/emailing.
        /// </summary>
        Task<InvoiceDetailDto?> GetInvoiceDetailAsync(int invoiceId);

        /// <summary>
        /// Sends the specified invoice to the customer via email.
        /// </summary>
        Task<SendInvoiceEmailResponseDto> SendInvoiceEmailAsync(
            int invoiceId,
            SendInvoiceEmailRequestDto request);
    }

    // ═══════════════════════════════════════════════════════════
    //  Email Infrastructure Service Interface
    //  Used by Feature 11 (Irshad) and Feature 15 (Chasita)
    // ═══════════════════════════════════════════════════════════

    /// <summary>
    /// Low-level email sending abstraction.
    /// Current implementation logs emails (dev mode).
    /// 
    /// TODO (Chasita - F15): Also use this for overdue credit reminder emails.
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Sends an email with the given parameters.
        /// </summary>
        Task<bool> SendEmailAsync(string to, string subject, string htmlBody);
    }
}
