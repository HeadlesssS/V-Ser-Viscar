using Ser_Viscar.Services.Interfaces;

namespace Ser_Viscar.Services.Implementations
{
    // ═══════════════════════════════════════════════════════════════════
    //  Email Service (Infrastructure Layer)
    //  ─────────────────────────────────────────────────────────────────
    //  Used by:
    //  • Irshad (F11): Sending sales invoices to customers
    //  • Chasita (F15): Sending overdue credit reminder emails
    //  ─────────────────────────────────────────────────────────────────
    //  Current: Logs email content (development mode).
    //  Production: Replace with SMTP / SendGrid / Mailgun integration.
    // ═══════════════════════════════════════════════════════════════════

    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;

        public EmailService(
            ILogger<EmailService> logger,
            IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Sends an email. In development, logs the email content.
        /// In production, integrates with SMTP or a third-party provider.
        /// </summary>
        public async Task<bool> SendEmailAsync(string to, string subject, string htmlBody)
        {
            try
            {
                // ── Check if SMTP is configured ──
                var smtpHost = _configuration["Email:SmtpHost"];

                if (!string.IsNullOrEmpty(smtpHost))
                {
                    // ══════════════════════════════════════════════════════
                    //  PRODUCTION SMTP IMPLEMENTATION
                    //  Uncomment and configure for real email sending:
                    //
                    //  using var client = new SmtpClient(smtpHost);
                    //  client.Port = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                    //  client.Credentials = new NetworkCredential(
                    //      _configuration["Email:Username"],
                    //      _configuration["Email:Password"]);
                    //  client.EnableSsl = true;
                    //
                    //  var mailMessage = new MailMessage
                    //  {
                    //      From = new MailAddress(
                    //          _configuration["Email:From"] ?? "noreply@serviscar.com",
                    //          "Ser-Viscar Vehicle Parts"),
                    //      Subject = subject,
                    //      Body = htmlBody,
                    //      IsBodyHtml = true
                    //  };
                    //  mailMessage.To.Add(to);
                    //
                    //  await client.SendMailAsync(mailMessage);
                    // ══════════════════════════════════════════════════════

                    _logger.LogInformation(
                        "SMTP configured but sending via log mode. To: {To}, Subject: {Subject}",
                        to, subject);
                }

                // ── Development Mode: Log the email ──
                _logger.LogInformation(
                    "\n" +
                    "╔══════════════════════════════════════════════════╗\n" +
                    "║           📧 EMAIL SENT (SIMULATED)             ║\n" +
                    "╠══════════════════════════════════════════════════╣\n" +
                    "║  To:      {To,-40}║\n" +
                    "║  Subject: {Subject,-40}║\n" +
                    "╠══════════════════════════════════════════════════╣\n" +
                    "║  Body Preview (first 500 chars):                ║\n" +
                    "╚══════════════════════════════════════════════════╝\n" +
                    "{Body}",
                    to,
                    subject.Length > 40 ? subject[..37] + "..." : subject,
                    htmlBody.Length > 500 ? htmlBody[..500] + "..." : htmlBody);

                // Simulate async email delivery delay
                await Task.Delay(100);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}", to);
                return false;
            }
        }
    }
}
