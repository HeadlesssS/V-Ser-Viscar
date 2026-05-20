using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using System.Net;
using System.Net.Mail;
using System.Net.Sockets;

namespace Ser_Backend.Services.Implementations
{
    public class NotificationService
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        private readonly AuditService _audit;

        public NotificationService(AppDbContext db, IConfiguration config, AuditService audit)
        {
            _db = db;
            _config = config;
            _audit = audit;
        }

        // Feature 15A: Send low stock alert to admin
        public async Task<string> SendLowStockAlertAsync()
        {
            // Find parts with stock < 10
            var lowStockParts = await _db.Parts
                .Where(p => p.IsActive && p.StockQuantity < 10)
                .OrderBy(p => p.StockQuantity)
                .ToListAsync();

            if (!lowStockParts.Any())
                return "No parts with low stock found.";

            var smtp = _config.GetSection("SmtpSettings");
            var host = smtp["Host"] ?? "smtp.gmail.com";
            var port = int.Parse(smtp["Port"] ?? "587");
            var enableSsl = bool.Parse(smtp["EnableSsl"] ?? "true");
            var username = smtp["Username"] ?? string.Empty;
            var password = smtp["Password"] ?? string.Empty;
            var fromName = smtp["FromName"] ?? "Ser-Viscar System";

            // Build admin email
            var adminEmail = await _db.Users
                .Where(u => u.Role == Models.User.UserRole.Admin && u.isActive)
                .Select(u => u.Email)
                .FirstOrDefaultAsync() ?? username;

            var rows = string.Join("\n", lowStockParts.Select(p =>
                $"<tr><td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;'>{p.Name}</td><td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;'>{p.SKU}</td><td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:{(p.StockQuantity == 0 ? "#dc2626" : "#d97706")};font-weight:700;'>{p.StockQuantity}</td></tr>"));

            var body = $"""
                <!DOCTYPE html><html><body style="font-family:'Segoe UI',Arial,sans-serif;color:#111827;background:#f3f4f6;margin:0;padding:32px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
                <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                <tr><td style="background:#b91c1c;padding:28px 32px;">
                  <h1 style="margin:0;color:#fff;font-size:20px;">⚠️ Low Stock Alert — Ser-Viscar</h1>
                  <p style="margin:4px 0 0;color:#fca5a5;font-size:13px;">Inventory Management System</p>
                </td></tr>
                <tr><td style="padding:24px 32px;">
                  <p>The following <strong>{lowStockParts.Count}</strong> part(s) have stock below 10 units and require immediate restocking:</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
                  <tr style="background:#f8fafc;"><th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Part Name</th><th style="padding:10px 12px;text-align:center;border-bottom:2px solid #e5e7eb;">SKU</th><th style="padding:10px 12px;text-align:center;border-bottom:2px solid #e5e7eb;">Stock</th></tr>
                  {rows}
                  </table>
                  <p style="margin-top:20px;font-size:13px;color:#6b7280;">Please create a purchase invoice to restock these items.</p>
                </td></tr>
                <tr><td style="padding:20px 32px;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Ser-Viscar Vehicle Center — Automated Notification</p></td></tr>
                </table></td></tr></table></body></html>
                """;

            using var message = new MailMessage
            {
                From = new MailAddress(username, fromName),
                Subject = $"⚠️ Low Stock Alert: {lowStockParts.Count} parts need restocking",
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(new MailAddress(adminEmail));

#pragma warning disable SYSLIB0006
            using var client = new SmtpClient(host, port)
            {
                EnableSsl = enableSsl,
                Credentials = new NetworkCredential(username, password),
                DeliveryMethod = SmtpDeliveryMethod.Network,
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
                    "Gmail SMTP authentication failed. Set a valid App Password in appsettings.json → SmtpSettings → Password. " +
                    "Generate at: myaccount.google.com/apppasswords", ex);
            }
            await _audit.LogAsync("Create", "Notification",
                $"Low stock alert email sent for {lowStockParts.Count} part(s)");

            return $"Low stock alert sent to {adminEmail} for {lowStockParts.Count} part(s).";
        }

        // Feature 15B: Send overdue credit reminders to customers
        public async Task<string> SendOverdueCreditRemindersAsync()
        {
            var cutoffDate = DateTime.UtcNow.AddMonths(-1);
            var smtp = _config.GetSection("SmtpSettings");
            var host = smtp["Host"] ?? "smtp.gmail.com";
            var port = int.Parse(smtp["Port"] ?? "587");
            var enableSsl = bool.Parse(smtp["EnableSsl"] ?? "true");
            var username = smtp["Username"] ?? string.Empty;
            var password = smtp["Password"] ?? string.Empty;
            var fromName = smtp["FromName"] ?? "Ser-Viscar System";

            // Find customers with unpaid credit invoices older than 1 month
            var overdueCustomers = await _db.Customers
                .Include(c => c.User)
                .Include(c => c.SalesInvoices)
                .Where(c => c.User.isActive && c.CreditBalance > 0 &&
                            c.SalesInvoices.Any(s => s.IsCredit && !s.IsPaid && s.SaleDate <= cutoffDate))
                .ToListAsync();

            if (!overdueCustomers.Any())
                return "No customers with overdue credit balances found.";

            int sentCount = 0;

#pragma warning disable SYSLIB0006
            using var client = new SmtpClient(host, port)
            {
                EnableSsl = enableSsl,
                Credentials = new NetworkCredential(username, password),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
            };
#pragma warning restore SYSLIB0006

            foreach (var customer in overdueCustomers)
            {
                if (string.IsNullOrWhiteSpace(customer.User.Email)) continue;

                var overdueInvoices = customer.SalesInvoices
                    .Where(s => s.IsCredit && !s.IsPaid && s.SaleDate <= cutoffDate)
                    .ToList();

                var invoiceRows = string.Join("\n", overdueInvoices.Select(inv =>
                    $"<tr><td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;'>INV-{inv.Id:D4}</td><td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;'>{inv.SaleDate:dd MMM yyyy}</td><td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#dc2626;'>Rs {inv.TotalAmount:F2}</td><td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#d97706;'>{(int)(DateTime.UtcNow - inv.SaleDate).TotalDays} days</td></tr>"));

                var body = $"""
                    <!DOCTYPE html><html><body style="font-family:'Segoe UI',Arial,sans-serif;color:#111827;background:#f3f4f6;margin:0;padding:32px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
                    <tr><td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                    <tr><td style="background:#1e3a5f;padding:28px 32px;">
                      <h1 style="margin:0;color:#fff;font-size:20px;">🔔 Payment Reminder — Ser-Viscar</h1>
                      <p style="margin:4px 0 0;color:#93c5fd;font-size:13px;">Vehicle Parts & Service Center</p>
                    </td></tr>
                    <tr><td style="padding:24px 32px;">
                      <p>Dear <strong>{customer.User.Name}</strong>,</p>
                      <p>This is a friendly reminder that you have outstanding credit balance(s) with us that are overdue by more than one month:</p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin:16px 0;">
                      <tr style="background:#f8fafc;"><th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Invoice</th><th style="padding:10px 12px;text-align:center;border-bottom:2px solid #e5e7eb;">Date</th><th style="padding:10px 12px;text-align:right;border-bottom:2px solid #e5e7eb;">Amount</th><th style="padding:10px 12px;text-align:center;border-bottom:2px solid #e5e7eb;">Overdue</th></tr>
                      {invoiceRows}
                      </table>
                      <p style="font-size:16px;font-weight:700;color:#dc2626;">Total Outstanding: Rs {customer.CreditBalance:F2}</p>
                      <p style="font-size:14px;color:#4b5563;">Please visit our service center or contact us to settle your balance at your earliest convenience.</p>
                    </td></tr>
                    <tr><td style="padding:20px 32px;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Ser-Viscar Vehicle Center — Automated Reminder</p></td></tr>
                    </table></td></tr></table></body></html>
                    """;

                using var msg = new MailMessage
                {
                    From = new MailAddress(username, fromName),
                    Subject = $"⚠️ Payment Reminder: Outstanding Credit Balance — Rs {customer.CreditBalance:F2}",
                    Body = body,
                    IsBodyHtml = true
                };
                msg.To.Add(new MailAddress(customer.User.Email, customer.User.Name));
                try
                {
                    await client.SendMailAsync(msg);
                    sentCount++;
                }
                catch (SmtpException ex) when (ex.Message.Contains("Authentication") || ex.Message.Contains("5.7.0"))
                {
                    throw new InvalidOperationException(
                        "Gmail SMTP authentication failed. Set a valid App Password in appsettings.json → SmtpSettings → Password. " +
                        "Generate at: myaccount.google.com/apppasswords", ex);
                }
            }

            await _audit.LogAsync("Create", "Notification",
                $"Credit reminder emails sent to {sentCount} customer(s)");

            return $"Credit reminder emails sent to {sentCount} customer(s).";
        }

        // Get low stock summary (no email)
        public async Task<object> GetLowStockSummaryAsync()
        {
            var parts = await _db.Parts
                .Where(p => p.IsActive && p.StockQuantity < 10)
                .OrderBy(p => p.StockQuantity)
                .Select(p => new { p.Id, p.Name, p.SKU, p.StockQuantity, p.IsActive })
                .ToListAsync();
            return new { count = parts.Count, parts };
        }

        // Get overdue credits summary (no email)
        public async Task<object> GetOverdueCreditsSummaryAsync()
        {
            var cutoffDate = DateTime.UtcNow.AddMonths(-1);
            var customers = await _db.Customers
                .Include(c => c.User)
                .Include(c => c.SalesInvoices)
                .Where(c => c.User.isActive && c.CreditBalance > 0 &&
                            c.SalesInvoices.Any(s => s.IsCredit && !s.IsPaid && s.SaleDate <= cutoffDate))
                .Select(c => new
                {
                    c.Id,
                    Name = c.User.Name,
                    Email = c.User.Email,
                    c.CreditBalance,
                    OverdueInvoices = c.SalesInvoices
                        .Where(s => s.IsCredit && !s.IsPaid && s.SaleDate <= cutoffDate)
                        .Count()
                })
                .ToListAsync();
            return new { count = customers.Count, customers };
        }

        // Get all notifications for a specific user
        public async Task<List<object>> GetUserNotificationsAsync(int userId)
        {
            var notifications = await _db.Notifications
                .Where(n => n.RecipientId == userId)
                .OrderByDescending(n => n.SentAt)
                .Take(50) // Limit to last 50 notifications
                .Select(n => new
                {
                    n.Id,
                    n.Type,
                    n.Message,
                    n.IsRead,
                    n.SentAt,
                    n.NavigationRoute,
                    n.RelatedEntityId,
                    n.RelatedEntityType
                })
                .ToListAsync();

            return notifications.Cast<object>().ToList();
        }

        // Mark a notification as read
        public async Task MarkNotificationAsReadAsync(int notificationId)
        {
            var notification = await _db.Notifications.FindAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = true;
                _db.Notifications.Update(notification);
                await _db.SaveChangesAsync();
            }
        }
    }
}
