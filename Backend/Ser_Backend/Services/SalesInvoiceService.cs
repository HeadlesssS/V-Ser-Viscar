using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.SalesInvoice;
using Ser_Backend.Models;

namespace Ser_Backend.Services.Implementations
{
    public class SalesInvoiceService
    {
        private readonly AppDbContext _db;
        private const decimal LoyaltyDiscountThreshold = 5000m;
        private const decimal LoyaltyDiscountRate      = 0.10m;

        public SalesInvoiceService(AppDbContext db)
        {
            _db = db;
        }

        // GET all
        public async Task<List<SalesInvoiceResponseDto>> GetAllAsync()
        {
            return await _db.SalesInvoices
                .Include(s => s.Staff).ThenInclude(st => st.User)
                .Include(s => s.Customer).ThenInclude(c => c.User)
                .Include(s => s.Items).ThenInclude(i => i.Part)
                .OrderByDescending(s => s.SaleDate)
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        // GET by ID
        public async Task<SalesInvoiceResponseDto> GetByIdAsync(int id)
        {
            var invoice = await _db.SalesInvoices
                .Include(s => s.Staff).ThenInclude(st => st.User)
                .Include(s => s.Customer).ThenInclude(c => c.User)
                .Include(s => s.Items).ThenInclude(i => i.Part)
                .FirstOrDefaultAsync(s => s.Id == id)
                ?? throw new Exception($"Sales invoice with ID {id} not found.");

            return MapToDto(invoice);
        }

        // GET by customer
        public async Task<List<SalesInvoiceResponseDto>> GetByCustomerAsync(int customerId)
        {
            return await _db.SalesInvoices
                .Include(s => s.Staff).ThenInclude(st => st.User)
                .Include(s => s.Customer).ThenInclude(c => c.User)
                .Include(s => s.Items).ThenInclude(i => i.Part)
                .Where(s => s.CustomerId == customerId)
                .OrderByDescending(s => s.SaleDate)
                .Select(s => MapToDto(s))
                .ToListAsync();
        }

        // CREATE
        public async Task<SalesInvoiceResponseDto> CreateAsync(SalesInvoiceRequestDto dto, int staffUserId)
        {
            // Get staff — try by JWT userId, then by dto.StaffId, then fallback to first
            Staff? staff = null;

            if (staffUserId > 0)
                staff = await _db.Staff.FirstOrDefaultAsync(s => s.UserId == staffUserId);

            if (staff == null && dto.StaffId > 0)
                staff = await _db.Staff.FindAsync(dto.StaffId);

            if (staff == null)
                staff = await _db.Staff.FirstOrDefaultAsync()
                    ?? throw new Exception("No staff record found. Please register a Staff user first.");

            // Validate customer
            var customer = await _db.Customers
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == dto.CustomerId)
                ?? throw new Exception($"Customer with ID {dto.CustomerId} not found.");

            if (dto.Items == null || dto.Items.Count == 0)
                throw new Exception("Invoice must have at least one item.");

            // Build items
            var invoiceItems = new List<SalesInvoiceItem>();
            decimal subtotal = 0;

            foreach (var itemDto in dto.Items)
            {
                if (itemDto.Quantity <= 0)
                    throw new Exception($"Quantity for Part ID {itemDto.PartId} must be greater than zero.");

                if (itemDto.UnitPrice <= 0)
                    throw new Exception($"Unit price for Part ID {itemDto.PartId} must be greater than zero.");

                var part = await _db.Parts.FindAsync(itemDto.PartId)
                    ?? throw new Exception($"Part with ID {itemDto.PartId} not found.");

                if (!part.IsActive)
                    throw new Exception($"Part '{part.Name}' is inactive.");

                if (part.StockQuantity < itemDto.Quantity)
                    throw new Exception($"Insufficient stock for '{part.Name}'. Available: {part.StockQuantity}, Requested: {itemDto.Quantity}.");

                invoiceItems.Add(new SalesInvoiceItem
                {
                    PartId    = itemDto.PartId,
                    Quantity  = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                });

                subtotal += itemDto.Quantity * itemDto.UnitPrice;

                // Decrease stock
                part.StockQuantity -= itemDto.Quantity;
            }

            // Loyalty discount
            decimal discountAmount = 0;
            if (subtotal > LoyaltyDiscountThreshold)
                discountAmount = subtotal * LoyaltyDiscountRate;

            decimal totalAmount = subtotal - discountAmount;

            var invoice = new SalesInvoice
            {
                StaffId        = staff.Id,
                CustomerId     = dto.CustomerId,
                Subtotal       = subtotal,
                DiscountAmount = discountAmount,
                TotalAmount    = totalAmount,
                IsCredit       = dto.IsCredit,
                IsPaid         = !dto.IsCredit,
                SaleDate       = DateTime.UtcNow,
                Items          = invoiceItems,
            };

            _db.SalesInvoices.Add(invoice);

            // Update customer totals
            customer.TotalSpent += totalAmount;
            if (dto.IsCredit)
                customer.CreditBalance += totalAmount;

            await _db.SaveChangesAsync();

            return await GetByIdAsync(invoice.Id);
        }

        // DELETE
        public async Task DeleteAsync(int id)
        {
            var invoice = await _db.SalesInvoices
                .Include(s => s.Items)
                .Include(s => s.Customer)
                .FirstOrDefaultAsync(s => s.Id == id)
                ?? throw new Exception($"Sales invoice with ID {id} not found.");

            foreach (var item in invoice.Items)
            {
                var part = await _db.Parts.FindAsync(item.PartId);
                if (part != null)
                    part.StockQuantity += item.Quantity;
            }

            invoice.Customer.TotalSpent -= invoice.TotalAmount;
            if (invoice.IsCredit)
                invoice.Customer.CreditBalance -= invoice.TotalAmount;

            _db.SalesInvoices.Remove(invoice);
            await _db.SaveChangesAsync();
        }

        // Mapper
        private static SalesInvoiceResponseDto MapToDto(SalesInvoice s) => new()
        {
            Id                     = s.Id,
            StaffId                = s.StaffId,
            StaffName              = s.Staff?.User?.Name ?? string.Empty,
            CustomerId             = s.CustomerId,
            CustomerName           = s.Customer?.User?.Name ?? string.Empty,
            Subtotal               = s.Subtotal,
            DiscountAmount         = s.DiscountAmount,
            TotalAmount            = s.TotalAmount,
            IsCredit               = s.IsCredit,
            IsPaid                 = s.IsPaid,
            EmailSent              = s.EmailSent,
            LoyaltyDiscountApplied = s.DiscountAmount > 0,
            SaleDate               = s.SaleDate,
            Items                  = s.Items.Select(i => new SalesInvoiceItemResponseDto
            {
                Id        = i.Id,
                PartId    = i.PartId,
                PartName  = i.Part?.Name ?? string.Empty,
                SKU       = i.Part?.SKU ?? string.Empty,
                Quantity  = i.Quantity,
                UnitPrice = i.UnitPrice,
                LineTotal = i.Quantity * i.UnitPrice,
            }).ToList(),
        };
    }
}