using System.Net;
using System.Net.Mail;
using System.Text;
using Ser_Backend.DTO.SalesInvoice;

namespace Ser_Backend.Services.Implementations
{
    /// <summary>
    /// Handles outbound SMTP email delivery using settings from
    /// <c>appsettings.json → SmtpSettings</c>.
    /// </summary>
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        // ------------------------------------------------------------------ //
        //  Feature 11: Send Invoice Email                                      //
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Sends a professionally formatted HTML invoice email to the customer.
        /// </summary>
        /// <param name="toEmail">Recipient email address.</param>
        /// <param name="customerName">Customer's full name (used in greeting).</param>
        /// <param name="invoice">The fully populated invoice DTO.</param>
        public async Task SendInvoiceEmailAsync(
            string toEmail,
            string customerName,
            SalesInvoiceResponseDto invoice)
        {
            var smtp = _config.GetSection("SmtpSettings");

            var host      = smtp["Host"]     ?? "smtp.gmail.com";
            var port      = int.Parse(smtp["Port"] ?? "587");
            var enableSsl = bool.Parse(smtp["EnableSsl"] ?? "true");
            var username  = smtp["Username"] ?? string.Empty;
            var password  = smtp["Password"] ?? string.Empty;
            var fromName  = smtp["FromName"] ?? "Ser-Viscar Vehicle Center";

            var body = BuildHtmlBody(customerName, invoice);

            using var message = new MailMessage
            {
                From       = new MailAddress(username, fromName),
                Subject    = $"Invoice #{invoice.Id} — Ser-Viscar Vehicle Center",
                Body       = body,
                IsBodyHtml = true,
                BodyEncoding = Encoding.UTF8,
            };
            message.To.Add(new MailAddress(toEmail, customerName));

#pragma warning disable SYSLIB0006  // SmtpClient is legacy but still functional
            using var client = new SmtpClient(host, port)
            {
                EnableSsl            = enableSsl,
                Credentials          = new NetworkCredential(username, password),
                DeliveryMethod       = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
            };
#pragma warning restore SYSLIB0006

            try
            {
                await client.SendMailAsync(message);
            }
            catch (SmtpException ex) when (ex.Message.Contains("Authentication") || ex.Message.Contains("5.7.0"))
            {
                throw new InvalidOperationException(
                    "Gmail SMTP authentication failed. Please set a valid 16-character App Password " +
                    "in appsettings.json → SmtpSettings → Password. " +
                    "Generate one at: myaccount.google.com/apppasswords (requires 2-Step Verification).", ex);
            }
        }

        // ------------------------------------------------------------------ //
        //  Private: HTML builder                                               //
        // ------------------------------------------------------------------ //

        private static string BuildHtmlBody(string customerName, SalesInvoiceResponseDto inv)
        {
            // --- Item rows ---
            var rows = new StringBuilder();
            foreach (var item in inv.Items)
            {
                rows.AppendLine($"""
                    <tr>
                      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">{item.PartName}</td>
                      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">{item.SKU}</td>
                      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">{item.Quantity}</td>
                      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">RM {item.UnitPrice:F2}</td>
                      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">RM {item.LineTotal:F2}</td>
                    </tr>
                """);
            }

            // --- Discount row (only shown when a discount was applied) ---
            var discountRow = inv.LoyaltyDiscountApplied
                ? $"""
                    <tr>
                      <td colspan="4" style="padding:6px 12px;text-align:right;color:#16a34a;font-style:italic;">
                        Loyalty Discount (10%)
                      </td>
                      <td style="padding:6px 12px;text-align:right;color:#16a34a;">- RM {inv.DiscountAmount:F2}</td>
                    </tr>
                  """
                : string.Empty;

            // --- Loyalty note ---
            var loyaltyNote = inv.LoyaltyDiscountApplied
                ? $"""
                    <p style="margin:12px 0;padding:10px 14px;background:#f0fdf4;border-left:4px solid #16a34a;
                               border-radius:4px;color:#15803d;font-size:14px;">
                      🎉 A <strong>10 % loyalty discount</strong> was applied to this invoice because your
                      subtotal exceeded RM 5,000.
                    </p>
                  """
                : string.Empty;

            // --- Payment badge ---
            var (badgeColor, badgeText) = inv.IsPaid
                ? ("#16a34a", "PAID")
                : ("#dc2626", "CREDIT – UNPAID");

            // --- Full HTML document ---
            return $"""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width,initial-scale=1" />
                  <title>Invoice #{inv.Id}</title>
                </head>
                <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;color:#111827;">

                  <!-- Wrapper -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:8px;overflow:hidden;
                                      box-shadow:0 2px 8px rgba(0,0,0,.08);">

                          <!-- Header -->
                          <tr>
                            <td style="background:#1e3a5f;padding:28px 32px;">
                              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:.5px;">
                                🔧 Ser-Viscar Vehicle Center
                              </h1>
                              <p style="margin:4px 0 0;color:#93c5fd;font-size:13px;">
                                Professional Vehicle Parts &amp; Services
                              </p>
                            </td>
                          </tr>

                          <!-- Invoice meta -->
                          <tr>
                            <td style="padding:24px 32px 0;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td>
                                    <p style="margin:0;font-size:24px;font-weight:700;color:#1e3a5f;">
                                      Invoice #{inv.Id}
                                    </p>
                                    <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">
                                      Date: {inv.SaleDate:dd MMM yyyy, HH:mm} UTC
                                    </p>
                                    <p style="margin:2px 0 0;color:#6b7280;font-size:13px;">
                                      Served by: {inv.StaffName}
                                    </p>
                                  </td>
                                  <td align="right" valign="top">
                                    <span style="display:inline-block;padding:6px 14px;background:{badgeColor};
                                                 color:#fff;border-radius:20px;font-size:12px;font-weight:700;
                                                 letter-spacing:.5px;">
                                      {badgeText}
                                    </span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>

                          <!-- Greeting -->
                          <tr>
                            <td style="padding:20px 32px 0;">
                              <p style="margin:0;font-size:15px;">
                                Dear <strong>{customerName}</strong>,
                              </p>
                              <p style="margin:8px 0 0;font-size:14px;color:#4b5563;">
                                Thank you for your purchase. Please find your invoice details below.
                              </p>
                            </td>
                          </tr>

                          <!-- Items table -->
                          <tr>
                            <td style="padding:20px 32px 0;">
                              <table width="100%" cellpadding="0" cellspacing="0"
                                     style="border-collapse:collapse;font-size:14px;">
                                <!-- Header row -->
                                <tr style="background:#f8fafc;">
                                  <th style="padding:10px 12px;text-align:left;color:#374151;
                                             border-bottom:2px solid #e5e7eb;font-weight:600;">Part</th>
                                  <th style="padding:10px 12px;text-align:center;color:#374151;
                                             border-bottom:2px solid #e5e7eb;font-weight:600;">SKU</th>
                                  <th style="padding:10px 12px;text-align:center;color:#374151;
                                             border-bottom:2px solid #e5e7eb;font-weight:600;">Qty</th>
                                  <th style="padding:10px 12px;text-align:right;color:#374151;
                                             border-bottom:2px solid #e5e7eb;font-weight:600;">Unit Price</th>
                                  <th style="padding:10px 12px;text-align:right;color:#374151;
                                             border-bottom:2px solid #e5e7eb;font-weight:600;">Total</th>
                                </tr>
                                {rows}
                                <!-- Subtotal -->
                                <tr>
                                  <td colspan="4" style="padding:10px 12px;text-align:right;
                                                         font-weight:600;color:#374151;">Subtotal</td>
                                  <td style="padding:10px 12px;text-align:right;font-weight:600;">
                                    RM {inv.Subtotal:F2}
                                  </td>
                                </tr>
                                {discountRow}
                                <!-- Grand total -->
                                <tr style="background:#f0f4ff;">
                                  <td colspan="4" style="padding:12px;text-align:right;
                                                         font-size:16px;font-weight:700;color:#1e3a5f;">
                                    Grand Total
                                  </td>
                                  <td style="padding:12px;text-align:right;font-size:16px;
                                             font-weight:700;color:#1e3a5f;">
                                    RM {inv.TotalAmount:F2}
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>

                          <!-- Loyalty note -->
                          <tr>
                            <td style="padding:16px 32px 0;">
                              {loyaltyNote}
                            </td>
                          </tr>

                          <!-- Credit notice -->
                          {(inv.IsCredit && !inv.IsPaid ? $"""
                          <tr>
                            <td style="padding:16px 32px 0;">
                              <p style="margin:0;padding:10px 14px;background:#fff7ed;
                                         border-left:4px solid #ea580c;border-radius:4px;
                                         color:#9a3412;font-size:14px;">
                                ⚠️ This invoice was processed on <strong>credit</strong>. Please settle
                                the outstanding amount of <strong>RM {inv.TotalAmount:F2}</strong> at your
                                earliest convenience.
                              </p>
                            </td>
                          </tr>
                          """ : string.Empty)}

                          <!-- Footer -->
                          <tr>
                            <td style="padding:28px 32px;border-top:1px solid #e5e7eb;margin-top:24px;">
                              <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
                                Ser-Viscar Vehicle Center &nbsp;|&nbsp;
                                viscar.service@gmail.com<br/>
                                This is an automated email — please do not reply directly.
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """;
        }
    }
}
