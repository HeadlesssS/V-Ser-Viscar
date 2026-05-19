using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.Part;
using Ser_Backend.Models;

namespace Ser_Backend.Services.Implementations
{
    public class PartService
    {
        private readonly AppDbContext _db;

        public PartService(AppDbContext db)
        {
            _db = db;
        }

        // GET all active parts
        public async Task<List<PartResponseDto>> GetAllAsync()
        {
            return await _db.Parts
                .Include(p => p.Vendor)
                .Where(p => p.IsActive)
                .OrderBy(p => p.Name)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        // GET single part
        public async Task<PartResponseDto> GetByIdAsync(int id)
        {
            var part = await _db.Parts
                .Include(p => p.Vendor)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new Exception($"Part with ID {id} not found.");

            return MapToDto(part);
        }

        // GET parts by category
        public async Task<List<PartResponseDto>> GetByCategoryAsync(string category)
        {
            return await _db.Parts
                .Include(p => p.Vendor)
                .Where(p => p.IsActive && p.Category.ToLower() == category.ToLower())
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        // GET low stock parts (below threshold)
        public async Task<List<PartResponseDto>> GetLowStockAsync()
        {
            return await _db.Parts
                .Include(p => p.Vendor)
                .Where(p => p.IsActive && p.StockQuantity < p.LowStockThreshold)
                .OrderBy(p => p.StockQuantity)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        // CREATE part
        public async Task<PartResponseDto> CreateAsync(PartRequestDto dto)
        {
            // Validate vendor exists
            var vendor = await _db.Vendors.FindAsync(dto.VendorId)
                ?? throw new Exception($"Vendor with ID {dto.VendorId} not found.");

            if (!vendor.IsActive)
                throw new Exception("Cannot assign part to an inactive vendor.");

            // Check duplicate SKU
            var skuExists = await _db.Parts.AnyAsync(p => p.SKU == dto.SKU && p.IsActive);
            if (skuExists)
                throw new Exception($"A part with SKU '{dto.SKU}' already exists.");

            if (dto.CostPrice <= 0)
                throw new Exception("Cost price must be greater than zero.");

            if (dto.SellingPrice <= 0)
                throw new Exception("Selling price must be greater than zero.");

            var part = new Part
            {
                VendorId = dto.VendorId,
                Name = dto.Name,
                SKU = dto.SKU,
                Category = dto.Category,
                CostPrice = dto.CostPrice,
                SellingPrice = dto.SellingPrice,
                StockQuantity = dto.StockQuantity,
                LowStockThreshold = dto.LowStockThreshold,
                IsActive = true,
            };

            _db.Parts.Add(part);
            await _db.SaveChangesAsync();

            return await GetByIdAsync(part.Id);
        }

        // UPDATE part
        public async Task<PartResponseDto> UpdateAsync(int id, PartRequestDto dto)
        {
            var part = await _db.Parts.FindAsync(id)
                ?? throw new Exception($"Part with ID {id} not found.");

            if (!part.IsActive)
                throw new Exception("Cannot update an inactive part.");

            // Validate vendor
            var vendor = await _db.Vendors.FindAsync(dto.VendorId)
                ?? throw new Exception($"Vendor with ID {dto.VendorId} not found.");

            if (!vendor.IsActive)
                throw new Exception("Cannot assign part to an inactive vendor.");

            // Check duplicate SKU excluding self
            var skuTaken = await _db.Parts.AnyAsync(p => p.SKU == dto.SKU && p.Id != id && p.IsActive);
            if (skuTaken)
                throw new Exception($"Another part already uses SKU '{dto.SKU}'.");

            if (dto.CostPrice <= 0)
                throw new Exception("Cost price must be greater than zero.");

            if (dto.SellingPrice <= 0)
                throw new Exception("Selling price must be greater than zero.");

            part.VendorId = dto.VendorId;
            part.Name = dto.Name;
            part.SKU = dto.SKU;
            part.Category = dto.Category;
            part.CostPrice = dto.CostPrice;
            part.SellingPrice = dto.SellingPrice;
            part.StockQuantity = dto.StockQuantity;
            part.LowStockThreshold = dto.LowStockThreshold;

            await _db.SaveChangesAsync();

            return await GetByIdAsync(part.Id);
        }

        // SOFT DELETE part
        public async Task DeleteAsync(int id)
        {
            var part = await _db.Parts.FindAsync(id)
                ?? throw new Exception($"Part with ID {id} not found.");

            if (!part.IsActive)
                throw new Exception("Part is already inactive.");

            part.IsActive = false;
            await _db.SaveChangesAsync();
        }

        // Helper mapper
        private static PartResponseDto MapToDto(Part p) => new()
        {
            Id = p.Id,
            VendorId = p.VendorId,
            VendorName = p.Vendor?.Name ?? string.Empty,
            Name = p.Name,
            SKU = p.SKU,
            Category = p.Category,
            CostPrice = p.CostPrice,
            SellingPrice = p.SellingPrice,
            StockQuantity = p.StockQuantity,
            LowStockThreshold = p.LowStockThreshold,
            IsLowStock = p.StockQuantity < p.LowStockThreshold,
            IsActive = p.IsActive,
        };
    }
}