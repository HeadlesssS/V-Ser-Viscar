using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using Ser_Backend.Data;
using Ser_Backend.DTO.Appointment;
using Ser_Backend.DTO.PartRequests;
using Ser_Backend.DTO.Report;
using Ser_Backend.DTO.Reviews;
using Ser_Backend.DTO.SalesInvoice;
using Ser_Backend.DTOs.Customers;
using Ser_Backend.Services.Implementations;
using Ser_Backend.Services.Pdf;
using Ser_Backend.DTO.PurchaseInvoice;

namespace Ser_Backend.Services
{
    public class PdfService
    {
        private readonly AppDbContext _db;
        private readonly SalesInvoiceService _sales;
        private readonly PurchaseInvoiceService _purchase;
        private readonly FinancialReportService _financial;
        private readonly CustomerService _customers;

        public PdfService(
            AppDbContext db,
            SalesInvoiceService sales,
            PurchaseInvoiceService purchase,
            FinancialReportService financial,
            CustomerService customers)
        {
            _db = db;
            _sales = sales;
            _purchase = purchase;
            _financial = financial;
            _customers = customers;
        }

        public async Task<byte[]> SalesInvoiceAsync(int id)
        {
            var inv = await _sales.GetByIdAsync(id);
            return BuildSalesInvoice(inv);
        }

        public async Task<byte[]> SalesInvoicesListAsync()
        {
            var list = await _sales.GetAllAsync();
            return PdfLayout.Generate(doc =>
                {
                    PdfLayout.Page(doc, "Sales Invoices Report", $"{list.Count} invoice(s)", content =>
                    {
                        content.Column(col =>
                        {
                            col.Item().Table(table =>
                            {
                                table.ColumnsDefinition(c =>
                                {
                                    c.ConstantColumn(40);
                                    c.RelativeColumn(2);
                                    c.RelativeColumn(1.5f);
                                    c.RelativeColumn(1.2f);
                                    c.RelativeColumn(1);
                                    c.ConstantColumn(70);
                                });
                                table.Header(h =>
                                {
                                    foreach (var hdr in new[] { "ID", "Customer", "Staff", "Date", "Total", "Status" })
                                        h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                                });
                                foreach (var inv in list)
                                {
                                    table.Cell().Element(PdfLayout.BodyCell).Text($"#{inv.Id}");
                                    table.Cell().Element(PdfLayout.BodyCell).Text(inv.CustomerName);
                                    table.Cell().Element(PdfLayout.BodyCell).Text(inv.StaffName);
                                    table.Cell().Element(PdfLayout.BodyCell).Text(inv.SaleDate.ToString("dd MMM yyyy"));
                                    table.Cell().Element(PdfLayout.BodyCell).Text(PdfLayout.Money(inv.TotalAmount));
                                    table.Cell().Element(PdfLayout.BodyCell).Text(inv.IsPaid ? "Paid" : "Credit");
                                }
                            });
                            col.Item().PaddingTop(12).Text($"Total revenue: {PdfLayout.Money(list.Sum(i => i.TotalAmount))}")
                                .Bold().FontSize(11);
                        });
                    });
                });
        }

        public async Task<byte[]> PurchaseInvoiceAsync(int id)
        {
            var inv = await _purchase.GetByIdAsync(id);
            return BuildPurchaseInvoice(inv);
        }

        public async Task<byte[]> PurchaseInvoicesListAsync()
        {
            var list = await _purchase.GetAllAsync();
            return PdfLayout.Generate(doc =>
                {
                    PdfLayout.Page(doc, "Purchase Invoices Report", $"{list.Count} invoice(s)", content =>
                    {
                        content.Column(col =>
                        {
                            col.Item().Table(table =>
                            {
                                table.ColumnsDefinition(c =>
                                {
                                    c.ConstantColumn(40);
                                    c.RelativeColumn(2);
                                    c.RelativeColumn(1.5f);
                                    c.RelativeColumn(1.2f);
                                    c.RelativeColumn(1);
                                });
                                table.Header(h =>
                                {
                                    foreach (var hdr in new[] { "ID", "Vendor", "Admin", "Date", "Total" })
                                        h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                                });
                                foreach (var inv in list)
                                {
                                    table.Cell().Element(PdfLayout.BodyCell).Text($"#{inv.Id}");
                                    table.Cell().Element(PdfLayout.BodyCell).Text(inv.VendorName);
                                    table.Cell().Element(PdfLayout.BodyCell).Text(inv.AdminName);
                                    table.Cell().Element(PdfLayout.BodyCell).Text(inv.PurchaseDate.ToString("dd MMM yyyy"));
                                    table.Cell().Element(PdfLayout.BodyCell).Text(PdfLayout.Money(inv.TotalAmount));
                                }
                            });
                            col.Item().PaddingTop(12).Text($"Total spent: {PdfLayout.Money(list.Sum(i => i.TotalAmount))}")
                                .Bold().FontSize(11);
                        });
                    });
                });
        }

        public async Task<byte[]> FinancialDailyAsync(int year, int month, int day)
        {
            var report = await _financial.GetDailyReportAsync(year, month, day);
            return BuildFinancialReport(report, $"Daily Report — {year}-{month:D2}-{day:D2}");
        }

        public async Task<byte[]> FinancialMonthlyAsync(int year, int month)
        {
            var report = await _financial.GetMonthlyReportAsync(year, month);
            return BuildFinancialReport(report, $"Monthly Report — {year}-{month:D2}");
        }

        public async Task<byte[]> FinancialYearlyAsync(int fromYear, int toYear)
        {
            var report = await _financial.GetYearlyReportAsync(fromYear, toYear);
            return BuildFinancialReport(report, $"Yearly Report — {fromYear} to {toYear}");
        }

        public async Task<byte[]> CustomerAsync(int customerId)
        {
            var c = await _customers.GetCustomerDetailsAsync(customerId);
            return BuildCustomer(c);
        }

        public async Task<byte[]> CustomersListAsync()
        {
            var customers = await _db.Customers
                    .Include(c => c.User)
                    .Include(c => c.Vehicles)
                    .Where(c => c.User.isActive)
                    .OrderBy(c => c.User.Name)
                    .ToListAsync();

                return PdfLayout.Generate(doc =>
                {
                    PdfLayout.Page(doc, "Customers & Vehicles", $"{customers.Count} customer(s)", content =>
                    {
                        content.Column(outer =>
                        {
                            foreach (var c in customers)
                            {
                                outer.Item().PaddingBottom(14).Column(col =>
                                {
                                    col.Item().Text(c.User.Name ?? "—").Bold().FontSize(11);
                                    col.Item().Text($"{c.User.Email} · {c.User.Phone} · Tier: {GetTier(c.TotalSpent)}")
                                        .FontSize(9).FontColor(Colors.Grey.Darken1);
                                    col.Item().PaddingTop(4).Text($"Spent: {PdfLayout.Money(c.TotalSpent)} · Credit: {PdfLayout.Money(c.CreditBalance)}")
                                        .FontSize(9);
                                    if (c.Vehicles.Any())
                                    {
                                        col.Item().PaddingTop(6).Table(table =>
                                        {
                                            table.ColumnsDefinition(t =>
                                            {
                                                t.RelativeColumn();
                                                t.RelativeColumn();
                                                t.RelativeColumn();
                                                t.ConstantColumn(50);
                                            });
                                            table.Header(h =>
                                            {
                                                foreach (var hdr in new[] { "Reg. No.", "Make", "Model", "Year" })
                                                    h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                                            });
                                            foreach (var v in c.Vehicles)
                                            {
                                                table.Cell().Element(PdfLayout.BodyCell).Text(v.VehicleNumber);
                                                table.Cell().Element(PdfLayout.BodyCell).Text(v.Brand);
                                                table.Cell().Element(PdfLayout.BodyCell).Text(v.Model);
                                                table.Cell().Element(PdfLayout.BodyCell).Text(v.Year.ToString());
                                            }
                                        });
                                    }
                                    else
                                    {
                                        col.Item().PaddingTop(4).Text("No vehicles registered.").Italic().FontSize(9);
                                    }
                                    col.Item().PaddingTop(8).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
                                });
                            }
                        });
                    });
                });
        }

        public async Task<byte[]> ReviewsAsync()
        {
            var reviews = await _db.Reviews
                    .Include(r => r.Customer).ThenInclude(c => c.User)
                    .OrderByDescending(r => r.ReviewedAt)
                    .Select(r => new ReviewResponseDto
                    {
                        Id = r.Id,
                        CustomerId = r.CustomerId,
                        CustomerName = r.Customer.User.Name ?? "Unknown",
                        Rating = r.Rating,
                        Comment = r.Comment,
                        ReviewedAt = r.ReviewedAt
                    })
                    .ToListAsync();

                return PdfLayout.Generate(doc =>
                {
                    PdfLayout.Page(doc, "Customer Reviews", $"{reviews.Count} review(s)", content =>
                    {
                        content.Column(col =>
                        {
                            col.Item().Table(table =>
                            {
                                table.ColumnsDefinition(c =>
                                {
                                    c.ConstantColumn(35);
                                    c.RelativeColumn(1.5f);
                                    c.ConstantColumn(50);
                                    c.RelativeColumn(3);
                                    c.RelativeColumn(1.2f);
                                });
                                table.Header(h =>
                                {
                                    foreach (var hdr in new[] { "ID", "Customer", "Rating", "Comment", "Date" })
                                        h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                                });
                                foreach (var r in reviews)
                                {
                                    table.Cell().Element(PdfLayout.BodyCell).Text($"#{r.Id}");
                                    table.Cell().Element(PdfLayout.BodyCell).Text(r.CustomerName);
                                    table.Cell().Element(PdfLayout.BodyCell).Text($"{r.Rating}/5");
                                    table.Cell().Element(PdfLayout.BodyCell).Text(r.Comment);
                                    table.Cell().Element(PdfLayout.BodyCell).Text(r.ReviewedAt.ToString("dd MMM yyyy"));
                                }
                            });
                            if (reviews.Count > 0)
                            {
                                var avg = reviews.Average(r => r.Rating);
                                col.Item().PaddingTop(12).Text($"Average rating: {avg:F1} / 5").Bold();
                            }
                        });
                    });
                });
        }

        public async Task<byte[]> PartRequestsAsync()
        {
            var requests = await _db.PartRequests
                    .Include(p => p.Customer).ThenInclude(c => c.User)
                    .OrderByDescending(p => p.RequestedAt)
                    .Select(p => new PartRequestAdminDto
                    {
                        Id = p.Id,
                        CustomerName = p.Customer.User.Name ?? "Unknown",
                        PartName = p.PartName,
                        Description = p.Description,
                        QuantityRequested = p.QuantityRequested,
                        Status = p.Status.ToString(),
                        RequestedAt = p.RequestedAt
                    })
                    .ToListAsync();

                return PdfLayout.Generate(doc =>
                {
                    PdfLayout.Page(doc, "Part Requests", $"{requests.Count} request(s)", content =>
                    {
                        content.Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.ConstantColumn(35);
                                c.RelativeColumn(1.5f);
                                c.RelativeColumn(1.5f);
                                c.RelativeColumn(2);
                                c.ConstantColumn(55);
                                c.ConstantColumn(70);
                                c.RelativeColumn(1);
                            });
                            table.Header(h =>
                            {
                                foreach (var hdr in new[] { "ID", "Customer", "Part", "Description", "Qty", "Status", "Date" })
                                    h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                            });
                            foreach (var p in requests)
                            {
                                table.Cell().Element(PdfLayout.BodyCell).Text($"#{p.Id}");
                                table.Cell().Element(PdfLayout.BodyCell).Text(p.CustomerName);
                                table.Cell().Element(PdfLayout.BodyCell).Text(p.PartName);
                                table.Cell().Element(PdfLayout.BodyCell).Text(p.Description);
                                table.Cell().Element(PdfLayout.BodyCell).Text(p.QuantityRequested.ToString());
                                table.Cell().Element(PdfLayout.BodyCell).Text(p.Status);
                                table.Cell().Element(PdfLayout.BodyCell).Text(p.RequestedAt.ToString("dd MMM yyyy"));
                            }
                        });
                    });
                });
        }

        public async Task<byte[]> AppointmentsAsync()
        {
            var appointments = await _db.Appointments
                    .Include(a => a.Vehicle)
                    .Include(a => a.Customer).ThenInclude(c => c.User)
                    .OrderByDescending(a => a.AppointmentDate)
                    .Select(a => new AppointmentAdminDto
                    {
                        Id = a.Id,
                        CustomerName = a.Customer.User.Name ?? "Unknown",
                        CustomerPhone = a.Customer.User.Phone ?? "",
                        VehicleNumber = a.Vehicle.VehicleNumber,
                        Make = a.Vehicle.Brand,
                        Model = a.Vehicle.Model,
                        AppointmentDate = a.AppointmentDate,
                        ServiceType = a.ServiceType,
                        Status = a.Status.ToString(),
                        Notes = a.Notes
                    })
                    .ToListAsync();

                return PdfLayout.Generate(doc =>
                {
                    PdfLayout.Page(doc, "Appointments / Bookings", $"{appointments.Count} booking(s)", content =>
                    {
                        content.Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.ConstantColumn(35);
                                c.RelativeColumn(1.5f);
                                c.RelativeColumn(1.2f);
                                c.RelativeColumn(1);
                                c.RelativeColumn(1.2f);
                                c.ConstantColumn(70);
                                c.RelativeColumn(1.5f);
                            });
                            table.Header(h =>
                            {
                                foreach (var hdr in new[] { "ID", "Customer", "Vehicle", "Service", "Date", "Status", "Notes" })
                                    h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                            });
                            foreach (var a in appointments)
                            {
                                table.Cell().Element(PdfLayout.BodyCell).Text($"#{a.Id}");
                                table.Cell().Element(PdfLayout.BodyCell).Text($"{a.CustomerName}\n{a.CustomerPhone}");
                                table.Cell().Element(PdfLayout.BodyCell).Text($"{a.VehicleNumber}\n{a.Make} {a.Model}");
                                table.Cell().Element(PdfLayout.BodyCell).Text(a.ServiceType);
                                table.Cell().Element(PdfLayout.BodyCell).Text(a.AppointmentDate.ToString("dd MMM yyyy HH:mm"));
                                table.Cell().Element(PdfLayout.BodyCell).Text(a.Status);
                                table.Cell().Element(PdfLayout.BodyCell).Text(a.Notes ?? "—");
                            }
                        });
                    });
                });
        }

        public async Task<byte[]> AuditLogAsync(string? entityType, string? action, string? search)
        {
            var query = _db.AuditLogs.Include(a => a.User).AsNoTracking().AsQueryable();
                if (!string.IsNullOrWhiteSpace(entityType))
                    query = query.Where(a => a.EntityType == entityType);
                if (!string.IsNullOrWhiteSpace(action))
                    query = query.Where(a => a.Action == action);
                if (!string.IsNullOrWhiteSpace(search))
                {
                    var term = search.Trim().ToLower();
                    query = query.Where(a =>
                        a.Description.ToLower().Contains(term) ||
                        a.EntityType.ToLower().Contains(term));
                }

                var logs = await query.OrderByDescending(a => a.Timestamp).Take(500).ToListAsync();

                return PdfLayout.Generate(doc =>
                {
                    PdfLayout.Page(doc, "Audit Log Export", $"{logs.Count} event(s)", content =>
                    {
                        content.Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(1.2f);
                                c.RelativeColumn(1.2f);
                                c.ConstantColumn(55);
                                c.RelativeColumn(1);
                                c.ConstantColumn(55);
                                c.RelativeColumn(2.5f);
                            });
                            table.Header(h =>
                            {
                                foreach (var hdr in new[] { "Time", "User", "Action", "Entity", "ID", "Description" })
                                    h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                            });
                            foreach (var log in logs)
                            {
                                table.Cell().Element(PdfLayout.BodyCell).Text(log.Timestamp.ToString("dd MMM yy HH:mm"));
                                table.Cell().Element(PdfLayout.BodyCell).Text(log.User?.Name ?? "System");
                                table.Cell().Element(PdfLayout.BodyCell).Text(log.Action);
                                table.Cell().Element(PdfLayout.BodyCell).Text(log.EntityType);
                                table.Cell().Element(PdfLayout.BodyCell).Text(log.EntityId?.ToString() ?? "—");
                                table.Cell().Element(PdfLayout.BodyCell).Text(log.Description);
                            }
                        });
                    });
                });
        }

        public async Task<byte[]> PartsCatalogAsync()
        {
            var parts = await _db.Parts
                    .Include(p => p.Vendor)
                    .Where(p => p.IsActive)
                    .OrderBy(p => p.Name)
                    .ToListAsync();

                return PdfLayout.Generate(doc =>
                {
                    PdfLayout.Page(doc, "Parts Catalog", $"{parts.Count} part(s)", content =>
                    {
                        content.Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(1);
                                c.RelativeColumn(1);
                                c.ConstantColumn(55);
                                c.RelativeColumn(1);
                                c.RelativeColumn(1);
                            });
                            table.Header(h =>
                            {
                                foreach (var hdr in new[] { "Name", "SKU", "Category", "Stock", "Cost", "Selling" })
                                    h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                            });
                            foreach (var p in parts)
                            {
                                table.Cell().Element(PdfLayout.BodyCell).Text(p.Name);
                                table.Cell().Element(PdfLayout.BodyCell).Text(p.SKU);
                                table.Cell().Element(PdfLayout.BodyCell).Text(p.Category);
                                table.Cell().Element(PdfLayout.BodyCell).Text(p.StockQuantity.ToString());
                                table.Cell().Element(PdfLayout.BodyCell).Text(PdfLayout.Money(p.CostPrice));
                                table.Cell().Element(PdfLayout.BodyCell).Text(PdfLayout.Money(p.SellingPrice));
                            }
                        });
                    });
                });
        }

        // ── Document builders ─────────────────────────────────────────────

        private static byte[] BuildSalesInvoice(SalesInvoiceResponseDto inv) =>
            PdfLayout.Generate(doc =>
            {
                PdfLayout.Page(doc, $"Sales Invoice SAL-{inv.Id:D4}", inv.CustomerName, content =>
                {
                    content.Column(col =>
                    {
                        col.Item().Element(c => PdfLayout.KeyValueGrid(c, new[]
                        {
                            ("Customer", inv.CustomerName),
                            ("Email", inv.CustomerEmail),
                            ("Staff", inv.StaffName),
                            ("Date", inv.SaleDate.ToString("dd MMMM yyyy")),
                            ("Payment", inv.IsPaid ? "Paid" : "Credit"),
                            ("Email Sent", inv.EmailSent ? "Yes" : "No"),
                        }));

                        col.Item().PaddingTop(16).Text("Line Items").Bold().FontSize(11);
                        col.Item().PaddingTop(6).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(3);
                                c.RelativeColumn(1);
                                c.ConstantColumn(45);
                                c.RelativeColumn(1);
                                c.RelativeColumn(1);
                            });
                            table.Header(h =>
                            {
                                foreach (var hdr in new[] { "Part", "SKU", "Qty", "Unit Price", "Line Total" })
                                    h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                            });
                            foreach (var item in inv.Items)
                            {
                                table.Cell().Element(PdfLayout.BodyCell).Text(item.PartName);
                                table.Cell().Element(PdfLayout.BodyCell).Text(item.SKU);
                                table.Cell().Element(PdfLayout.BodyCell).Text(item.Quantity.ToString());
                                table.Cell().Element(PdfLayout.BodyCell).Text(PdfLayout.Money(item.UnitPrice));
                                table.Cell().Element(PdfLayout.BodyCell).Text(PdfLayout.Money(item.LineTotal));
                            }
                        });

                        col.Item().PaddingTop(12).AlignRight().Column(totals =>
                        {
                            totals.Item().Text($"Subtotal: {PdfLayout.Money(inv.Subtotal)}");
                            if (inv.DiscountAmount > 0)
                                totals.Item().Text($"Discount: -{PdfLayout.Money(inv.DiscountAmount)}").FontColor(PdfLayout.Brand);
                            totals.Item().Text($"Total: {PdfLayout.Money(inv.TotalAmount)}").Bold().FontSize(12);
                        });
                    });
                });
            });

        private static byte[] BuildPurchaseInvoice(PurchaseInvoiceResponseDto inv) =>
            PdfLayout.Generate(doc =>
            {
                PdfLayout.Page(doc, $"Purchase Invoice PUR-{inv.Id:D4}", inv.VendorName, content =>
                {
                    content.Column(col =>
                    {
                        col.Item().Element(c => PdfLayout.KeyValueGrid(c, new[]
                        {
                            ("Vendor", inv.VendorName),
                            ("Recorded By", inv.AdminName),
                            ("Date", inv.PurchaseDate.ToString("dd MMMM yyyy")),
                            ("Notes", string.IsNullOrWhiteSpace(inv.Notes) ? "—" : inv.Notes),
                        }));

                        col.Item().PaddingTop(16).Text("Line Items").Bold().FontSize(11);
                        col.Item().PaddingTop(6).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(3);
                                c.RelativeColumn(1);
                                c.ConstantColumn(45);
                                c.RelativeColumn(1);
                                c.RelativeColumn(1);
                            });
                            table.Header(h =>
                            {
                                foreach (var hdr in new[] { "Part", "SKU", "Qty", "Unit Cost", "Line Total" })
                                    h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                            });
                            foreach (var item in inv.Items)
                            {
                                table.Cell().Element(PdfLayout.BodyCell).Text(item.PartName);
                                table.Cell().Element(PdfLayout.BodyCell).Text(item.SKU);
                                table.Cell().Element(PdfLayout.BodyCell).Text(item.Quantity.ToString());
                                table.Cell().Element(PdfLayout.BodyCell).Text(PdfLayout.Money(item.UnitCost));
                                table.Cell().Element(PdfLayout.BodyCell).Text(PdfLayout.Money(item.LineTotal));
                            }
                        });

                        col.Item().PaddingTop(12).AlignRight()
                            .Text($"Total: {PdfLayout.Money(inv.TotalAmount)}").Bold().FontSize(12);
                    });
                });
            });

        private static byte[] BuildFinancialReport(FinancialReportResponseDto report, string title) =>
            PdfLayout.Generate(doc =>
            {
                PdfLayout.Page(doc, title, report.ReportType, content =>
                {
                    content.Column(col =>
                    {
                        col.Item().Element(c => PdfLayout.KeyValueGrid(c, new[]
                        {
                            ("Sales Revenue", PdfLayout.Money(report.TotalSalesRevenue)),
                            ("Purchase Cost", PdfLayout.Money(report.TotalPurchaseCost)),
                            ("Gross Profit", PdfLayout.Money(report.GrossProfit)),
                            ("Sales Invoices", report.TotalSalesInvoices.ToString()),
                            ("Purchase Invoices", report.TotalPurchaseInvoices.ToString()),
                            ("Units Sold", report.TotalUnitsSold.ToString()),
                            ("Units Purchased", report.TotalUnitsPurchased.ToString()),
                            ("Discounts Given", PdfLayout.Money(report.TotalDiscountsGiven)),
                            ("Credit Sales", PdfLayout.Money(report.TotalCreditSales)),
                        }));

                        if (report.Breakdown.Count > 0)
                        {
                            col.Item().PaddingTop(16).Text("Period Breakdown").Bold().FontSize(11);
                            col.Item().PaddingTop(6).Table(table =>
                            {
                                table.ColumnsDefinition(c =>
                                {
                                    c.RelativeColumn(1.2f);
                                    c.RelativeColumn(1);
                                    c.RelativeColumn(1);
                                    c.RelativeColumn(1);
                                });
                                table.Header(h =>
                                {
                                    foreach (var hdr in new[] { "Period", "Revenue", "Cost", "Profit" })
                                        h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                                });
                                foreach (var row in report.Breakdown)
                                {
                                    table.Cell().Element(PdfLayout.BodyCell).Text(row.Period);
                                    table.Cell().Element(PdfLayout.BodyCell).Text(PdfLayout.Money(row.TotalSalesRevenue));
                                    table.Cell().Element(PdfLayout.BodyCell).Text(PdfLayout.Money(row.TotalPurchaseCost));
                                    table.Cell().Element(PdfLayout.BodyCell).Text(PdfLayout.Money(row.GrossProfit));
                                }
                            });
                        }
                    });
                });
            });

        private static byte[] BuildCustomer(CustomerDetailsDto c) =>
            PdfLayout.Generate(doc =>
            {
                PdfLayout.Page(doc, "Customer Profile", c.FullName, content =>
                {
                    content.Column(col =>
                    {
                        col.Item().Element(x => PdfLayout.KeyValueGrid(x, new[]
                        {
                            ("Full Name", c.FullName),
                            ("Email", c.Email),
                            ("Phone", c.Phone),
                            ("Loyalty Tier", c.LoyaltyTier),
                            ("Total Spent", PdfLayout.Money(c.TotalSpent)),
                            ("Credit Balance", PdfLayout.Money(c.CreditBalance)),
                            ("Member Since", c.CreatedAt.ToString("dd MMMM yyyy")),
                        }));

                        col.Item().PaddingTop(16).Text("Registered Vehicles").Bold().FontSize(11);
                        if (c.Vehicles.Count == 0)
                        {
                            col.Item().PaddingTop(6).Text("No vehicles on file.").Italic();
                            return;
                        }

                        col.Item().PaddingTop(6).Table(table =>
                        {
                            table.ColumnsDefinition(t =>
                            {
                                t.RelativeColumn(1.5f);
                                t.RelativeColumn(1);
                                t.RelativeColumn(1);
                                t.ConstantColumn(50);
                                t.RelativeColumn(1.5f);
                            });
                            table.Header(h =>
                            {
                                foreach (var hdr in new[] { "Reg. Number", "Make", "Model", "Year", "VIN" })
                                    h.Cell().Element(PdfLayout.HeaderCell).Text(hdr);
                            });
                            foreach (var v in c.Vehicles)
                            {
                                table.Cell().Element(PdfLayout.BodyCell).Text(v.VehicleNumber);
                                table.Cell().Element(PdfLayout.BodyCell).Text(v.Make);
                                table.Cell().Element(PdfLayout.BodyCell).Text(v.Model);
                                table.Cell().Element(PdfLayout.BodyCell).Text(v.Year.ToString());
                                table.Cell().Element(PdfLayout.BodyCell).Text(v.VIN);
                            }
                        });
                    });
                });
            });

        private static string GetTier(decimal spent) =>
            spent >= 5000 ? "Platinum" : spent >= 2000 ? "Gold" : "Standard";
    }
}
