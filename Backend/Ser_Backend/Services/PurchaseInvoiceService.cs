using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.PurchaseInvoice;
using Ser_Backend.Models;

namespace Ser_Backend.Services.Implementations
{
    public class PurchaseInvoiceService
    {
        private readonly AppDbContext _db;

        public PurchaseInvoiceService(AppDbContext db)
        {
            _db = db;
        }

        // GET all invoices (summary list)
        public async Task<List<PurchaseInvoiceResponseDto>> GetAllAsync()
        {
            return await _db.PurchaseInvoices
                .Include(p => p.Vendor)
                .Include(p => p.Admin)
                .Include(p => p.Items)
                    .ThenInclude(i => i.Part)
                .OrderByDescending(p => p.PurchaseDate)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        // GET single invoice by ID
        public async Task<PurchaseInvoiceResponseDto> GetByIdAsync(int id)
        {
            var invoice = await _db.PurchaseInvoices
                .Include(p => p.Vendor)
                .Include(p => p.Admin)
                .Include(p => p.Items)
                    .ThenInclude(i => i.Part)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new Exception($"Purchase invoice with ID {id} not found.");

            return MapToDto(invoice);
        }

        // CREATE invoice — also updates part stock
        public async Task<PurchaseInvoiceResponseDto> CreateAsync(PurchaseInvoiceRequestDto dto)
        {
            // Validate vendor
            var vendor = await _db.Vendors.FindAsync(dto.VendorId)
                ?? throw new Exception($"Vendor with ID {dto.VendorId} not found.");

            if (!vendor.IsActive)
                throw new Exception("Cannot create invoice for an inactive vendor.");

            // Validate admin
            var admin = await _db.Users.FindAsync(dto.AdminId)
                ?? throw new Exception($"Admin with ID {dto.AdminId} not found.");

            if (dto.Items == null || dto.Items.Count == 0)
                throw new Exception("Invoice must have at least one item.");

            // Build items and calculate total
            var invoiceItems = new List<PurchaseInvoiceItem>();
            decimal total = 0;

            foreach (var itemDto in dto.Items)
            {
                if (itemDto.Quantity <= 0)
                    throw new Exception($"Quantity for Part ID {itemDto.PartId} must be greater than zero.");

                if (itemDto.UnitCost <= 0)
                    throw new Exception($"Unit cost for Part ID {itemDto.PartId} must be greater than zero.");

                var part = await _db.Parts.FindAsync(itemDto.PartId)
                    ?? throw new Exception($"Part with ID {itemDto.PartId} not found.");

                if (!part.IsActive)
                    throw new Exception($"Part '{part.Name}' is inactive and cannot be purchased.");

                invoiceItems.Add(new PurchaseInvoiceItem
                {
                    PartId = itemDto.PartId,
                    Quantity = itemDto.Quantity,
                    UnitCost = itemDto.UnitCost,
                });

                total += itemDto.Quantity * itemDto.UnitCost;

                // Update stock quantity
                part.StockQuantity += itemDto.Quantity;
            }

            var invoice = new PurchaseInvoice
            {
                AdminId = dto.AdminId,
                VendorId = dto.VendorId,
                Notes = dto.Notes,
                TotalAmount = (float)total,
                PurchaseDate = DateTime.UtcNow,
                Items = invoiceItems,
            };

            _db.PurchaseInvoices.Add(invoice);
            await _db.SaveChangesAsync();

            // Reload with navigation props for response
            return await GetByIdAsync(invoice.Id);
        }

        // DELETE invoice — also reverses stock
        public async Task DeleteAsync(int id)
        {
            var invoice = await _db.PurchaseInvoices
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new Exception($"Purchase invoice with ID {id} not found.");

            // Reverse stock for each item
            foreach (var item in invoice.Items)
            {
                var part = await _db.Parts.FindAsync(item.PartId);
                if (part != null)
                    part.StockQuantity -= item.Quantity;
            }

            _db.PurchaseInvoices.Remove(invoice);
            await _db.SaveChangesAsync();
        }

        // Helper mapper
        private static PurchaseInvoiceResponseDto MapToDto(PurchaseInvoice p) => new()
        {
            Id = p.Id,
            AdminId = p.AdminId,
            AdminName = p.Admin?.Name ?? string.Empty,
            VendorId = p.VendorId,
            VendorName = p.Vendor?.Name ?? string.Empty,
            TotalAmount = (decimal)p.TotalAmount,
            PurchaseDate = p.PurchaseDate,
            Notes = p.Notes,
            Items = p.Items.Select(i => new PurchaseInvoiceItemResponseDto
            {
                Id = i.Id,
                PartId = i.PartId,
                PartName = i.Part?.Name ?? string.Empty,
                SKU = i.Part?.SKU ?? string.Empty,
                Quantity = i.Quantity,
                UnitCost = i.UnitCost,
                LineTotal = i.Quantity * i.UnitCost,
            }).ToList(),
        };
    }
}