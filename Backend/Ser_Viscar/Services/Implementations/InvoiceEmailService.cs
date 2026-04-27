using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.DTOs.Invoice;
using Ser_Viscar.Models.Enums;
using Ser_Viscar.Services.Interfaces;

namespace Ser_Viscar.Services.Implementations
{
    // ═══════════════════════════════════════════════════════════════════
    //  Feature 11 (Irshad): Invoice Email Service
    //  ─────────────────────────────────────────────────────────────────
    //  Marking Scheme: "Staff can send invoices via email to customers"
    //  — 4 marks
    //  ─────────────────────────────────────────────────────────────────
    //  Workflow:
    //  1. Load full invoice details (customer, items, payments)
    //  2. Compose professional HTML email template
    //  3. Send via IEmailService abstraction
    //  4. Return confirmation with sent details
    // ═══════════════════════════════════════════════════════════════════

    public class InvoiceEmailService : IInvoiceEmailService
    {
        private readonly ApplicationDbContext _db;
        private readonly IEmailService _emailService;
        private readonly ILogger<InvoiceEmailService> _logger;

        public InvoiceEmailService(
            ApplicationDbContext db,
            IEmailService emailService,
            ILogger<InvoiceEmailService> logger)
        {
            _db = db;
            _emailService = emailService;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves full invoice details for display or email rendering.
        /// Includes customer info, line items with price snapshots, 
        /// and payment summary.
        /// </summary>
        public async Task<InvoiceDetailDto?> GetInvoiceDetailAsync(int invoiceId)
        {
            var invoice = await _db.SalesInvoices
                .Include(i => i.Customer)
                .Include(i => i.Items)
                .Include(i => i.Payments)
                .Include(i => i.CreatedByUser)
                .FirstOrDefaultAsync(i => i.Id == invoiceId);

            if (invoice == null) return null;

            var totalPaid = invoice.Payments
                .Where(p => p.PaymentStatus == PaymentStatus.Paid)
                .Sum(p => p.AmountPaid);

            return new InvoiceDetailDto
            {
                Id = invoice.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                InvoiceDate = invoice.InvoiceDate,

                CustomerId = invoice.CustomerId,
                CustomerName = invoice.Customer.FullName,
                CustomerEmail = invoice.Customer.Email,
                CustomerPhone = invoice.Customer.Phone,

                SubTotal = invoice.SubTotal,
                DiscountPercent = invoice.DiscountPercent,
                DiscountAmount = invoice.DiscountAmount,
                TotalAmount = invoice.TotalAmount,
                LoyaltyApplied = invoice.LoyaltyApplied,

                Status = invoice.Status.ToString(),
                Notes = invoice.Notes,
                CreatedByStaff = invoice.CreatedByUser?.Name,

                Items = invoice.Items.Select(item => new InvoiceItemDetailDto
                {
                    Id = item.Id,
                    PartName = item.PartNameSnapshot,
                    UnitPrice = item.UnitPriceSnapshot,
                    Quantity = item.Quantity,
                    LineTotal = item.LineTotal
                }).ToList(),

                TotalPaid = totalPaid,
                BalanceDue = invoice.TotalAmount - totalPaid
            };
        }

        /// <summary>
        /// Sends a formatted invoice email to the customer.
        /// Composes a professional HTML template with all invoice details.
        /// </summary>
        public async Task<SendInvoiceEmailResponseDto> SendInvoiceEmailAsync(
            int invoiceId,
            SendInvoiceEmailRequestDto request)
        {
            _logger.LogInformation("Preparing invoice email for Invoice #{Id}", invoiceId);

            // ── Load invoice details ──
            var detail = await GetInvoiceDetailAsync(invoiceId);

            if (detail == null)
            {
                return new SendInvoiceEmailResponseDto
                {
                    Success = false,
                    Message = $"Invoice #{invoiceId} not found.",
                    InvoiceId = invoiceId
                };
            }

            // ── Determine recipient ──
            var recipientEmail = request.RecipientEmailOverride ?? detail.CustomerEmail;

            if (string.IsNullOrWhiteSpace(recipientEmail))
            {
                return new SendInvoiceEmailResponseDto
                {
                    Success = false,
                    Message = "Customer does not have an email address on file.",
                    InvoiceId = invoiceId,
                    InvoiceNumber = detail.InvoiceNumber
                };
            }

            // ── Compose HTML email ──
            var subject = $"Invoice {detail.InvoiceNumber} — Ser-Viscar Vehicle Parts";
            var htmlBody = ComposeInvoiceHtml(detail, request.CustomMessage);

            // ── Send via email service ──
            var sent = await _emailService.SendEmailAsync(recipientEmail, subject, htmlBody);

            _logger.LogInformation(
                "Invoice email {Status} — Invoice: {Number}, To: {Email}",
                sent ? "sent" : "failed", detail.InvoiceNumber, recipientEmail);

            return new SendInvoiceEmailResponseDto
            {
                Success = sent,
                Message = sent
                    ? $"Invoice {detail.InvoiceNumber} sent to {recipientEmail}."
                    : "Failed to send email. Please try again.",
                SentTo = recipientEmail,
                InvoiceId = invoiceId,
                InvoiceNumber = detail.InvoiceNumber,
                SentAt = DateTime.UtcNow
            };
        }

        // ──────────────────────────────────────────────────
        //  Private: Compose professional HTML email template
        // ──────────────────────────────────────────────────
        private static string ComposeInvoiceHtml(InvoiceDetailDto detail, string? customMessage)
        {
            var itemsHtml = string.Join("\n", detail.Items.Select((item, idx) =>
                $@"<tr style='background:{(idx % 2 == 0 ? "#f9fafb" : "#ffffff")}'>
                    <td style='padding:10px 14px;border-bottom:1px solid #e5e7eb'>{item.PartName}</td>
                    <td style='padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center'>{item.Quantity}</td>
                    <td style='padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:right'>Rs. {item.UnitPrice:N2}</td>
                    <td style='padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:right'>Rs. {item.LineTotal:N2}</td>
                </tr>"));

            var loyaltyBadge = detail.LoyaltyApplied
                ? @"<div style='background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:8px 14px;margin:12px 0;font-size:13px;color:#92400e'>
                     ⭐ Loyalty Discount Applied — {detail.DiscountPercent}% off (saved Rs. {detail.DiscountAmount:N2})
                   </div>"
                : "";

            var customMessageHtml = !string.IsNullOrWhiteSpace(customMessage)
                ? $@"<div style='background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;margin:16px 0;border-radius:0 6px 6px 0'>
                      <p style='margin:0;color:#1e40af;font-size:14px'><strong>Message from our team:</strong></p>
                      <p style='margin:6px 0 0;color:#374151;font-size:14px'>{customMessage}</p>
                    </div>"
                : "";

            return $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0;padding:0;font-family:Segoe UI,Tahoma,sans-serif;background:#f3f4f6'>
  <div style='max-width:640px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)'>
    
    <!-- Header -->
    <div style='background:linear-gradient(135deg,#1e3a5f 0%,#0d6efd 100%);padding:28px 32px;color:white'>
      <h1 style='margin:0;font-size:22px;font-weight:600'>Ser-Viscar</h1>
      <p style='margin:4px 0 0;font-size:13px;opacity:0.85'>Vehicle Parts & Service Center</p>
    </div>

    <!-- Invoice Header -->
    <div style='padding:24px 32px;border-bottom:1px solid #e5e7eb'>
      <table style='width:100%'>
        <tr>
          <td>
            <h2 style='margin:0;font-size:20px;color:#111827'>Invoice {detail.InvoiceNumber}</h2>
            <p style='margin:4px 0 0;font-size:13px;color:#6b7280'>Date: {detail.InvoiceDate:MMMM dd, yyyy}</p>
          </td>
          <td style='text-align:right'>
            <span style='background:#dbeafe;color:#1d4ed8;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600'>
              {detail.Status}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Customer Details -->
    <div style='padding:16px 32px;background:#f9fafb'>
      <p style='margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px'>Bill To</p>
      <p style='margin:6px 0 0;font-size:15px;font-weight:600;color:#111827'>{detail.CustomerName}</p>
      <p style='margin:2px 0;font-size:13px;color:#4b5563'>{detail.CustomerEmail} | {detail.CustomerPhone}</p>
    </div>

    {customMessageHtml}

    <!-- Line Items Table -->
    <div style='padding:20px 32px'>
      <table style='width:100%;border-collapse:collapse;font-size:14px'>
        <thead>
          <tr style='background:#f1f5f9'>
            <th style='padding:10px 14px;text-align:left;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb'>Part</th>
            <th style='padding:10px 14px;text-align:center;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb'>Qty</th>
            <th style='padding:10px 14px;text-align:right;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb'>Unit Price</th>
            <th style='padding:10px 14px;text-align:right;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb'>Total</th>
          </tr>
        </thead>
        <tbody>
          {itemsHtml}
        </tbody>
      </table>
    </div>

    {loyaltyBadge}

    <!-- Totals -->
    <div style='padding:16px 32px;background:#f1f5f9'>
      <table style='width:100%;font-size:14px'>
        <tr>
          <td style='padding:4px 0;color:#6b7280'>Subtotal</td>
          <td style='padding:4px 0;text-align:right;color:#374151'>Rs. {detail.SubTotal:N2}</td>
        </tr>
        {(detail.DiscountAmount > 0 ? $@"<tr>
          <td style='padding:4px 0;color:#059669'>Discount ({detail.DiscountPercent}%)</td>
          <td style='padding:4px 0;text-align:right;color:#059669'>- Rs. {detail.DiscountAmount:N2}</td>
        </tr>" : "")}
        <tr>
          <td style='padding:8px 0;font-size:16px;font-weight:700;color:#111827;border-top:2px solid #e5e7eb'>Total Amount</td>
          <td style='padding:8px 0;text-align:right;font-size:16px;font-weight:700;color:#111827;border-top:2px solid #e5e7eb'>Rs. {detail.TotalAmount:N2}</td>
        </tr>
        <tr>
          <td style='padding:4px 0;color:#6b7280'>Paid</td>
          <td style='padding:4px 0;text-align:right;color:#374151'>Rs. {detail.TotalPaid:N2}</td>
        </tr>
        {(detail.BalanceDue > 0 ? $@"<tr>
          <td style='padding:4px 0;font-weight:600;color:#dc2626'>Balance Due</td>
          <td style='padding:4px 0;text-align:right;font-weight:600;color:#dc2626'>Rs. {detail.BalanceDue:N2}</td>
        </tr>" : "")}
      </table>
    </div>

    <!-- Footer -->
    <div style='padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb'>
      <p style='margin:0;font-size:12px;color:#9ca3af'>Thank you for choosing Ser-Viscar Vehicle Parts & Service Center</p>
      <p style='margin:4px 0 0;font-size:11px;color:#d1d5db'>This is a system-generated invoice. For queries, contact our team.</p>
    </div>

  </div>
</body>
</html>";
        }
    }
}
