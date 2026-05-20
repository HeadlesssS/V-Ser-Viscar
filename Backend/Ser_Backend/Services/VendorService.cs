using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.Vendor;
using Ser_Backend.Models;
using Ser_Backend.Services.Implementations;

namespace Ser_Backend.Services
{
    public class VendorService
    {
        private readonly AppDbContext _db;
        private readonly AuditService _audit;

        public VendorService(AppDbContext db, AuditService audit)
        {
            _db = db;
            _audit = audit;
        }

        // GET all active vendors
        public async Task<List<VendorResponseDto>> GetAllAsync()
        {
            return await _db.Vendors
                .Where(v => v.IsActive)
                .Select(v => MapToDto(v))
                .ToListAsync();
        }

        // GET single vendor by ID
        public async Task<VendorResponseDto> GetByIdAsync(int id)
        {
            var vendor = await _db.Vendors.FindAsync(id)
                ?? throw new Exception($"Vendor with ID {id} not found.");

            if (!vendor.IsActive)
                throw new Exception("Vendor is inactive.");

            return MapToDto(vendor);
        }

        // CREATE vendor
        public async Task<VendorResponseDto> CreateAsync(VendorRequestDto dto)
        {
            // Check duplicate email
            var exists = await _db.Vendors.AnyAsync(v => v.Email == dto.Email && v.IsActive);
            if (exists)
                throw new Exception("A vendor with this email already exists.");

            var vendor = new Vendor
            {
                Name = dto.Name,
                ContactPerson = dto.ContactPerson,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                IsActive = true
            };

            _db.Vendors.Add(vendor);
            await _db.SaveChangesAsync();

            await _audit.LogAsync("Create", "Vendor",
                $"Vendor created: {vendor.Name}",
                entityId: vendor.Id);

            return MapToDto(vendor);
        }

        // UPDATE vendor
        public async Task<VendorResponseDto> UpdateAsync(int id, VendorRequestDto dto)
        {
            var vendor = await _db.Vendors.FindAsync(id)
                ?? throw new Exception($"Vendor with ID {id} not found.");

            if (!vendor.IsActive)
                throw new Exception("Cannot update an inactive vendor.");

            // Check duplicate email (excluding self)
            var emailTaken = await _db.Vendors
                .AnyAsync(v => v.Email == dto.Email && v.Id != id && v.IsActive);
            if (emailTaken)
                throw new Exception("Another vendor already uses this email.");

            vendor.Name = dto.Name;
            vendor.ContactPerson = dto.ContactPerson;
            vendor.Phone = dto.Phone;
            vendor.Email = dto.Email;
            vendor.Address = dto.Address;

            await _db.SaveChangesAsync();

            await _audit.LogAsync("Update", "Vendor",
                $"Vendor updated: {vendor.Name}",
                entityId: vendor.Id);

            return MapToDto(vendor);
        }

        // SOFT DELETE vendor (sets IsActive = false)
        public async Task DeleteAsync(int id)
        {
            var vendor = await _db.Vendors.FindAsync(id)
                ?? throw new Exception($"Vendor with ID {id} not found.");

            if (!vendor.IsActive)
                throw new Exception("Vendor is already inactive.");

            vendor.IsActive = false;
            await _db.SaveChangesAsync();

            await _audit.LogAsync("Delete", "Vendor",
                $"Vendor deactivated: {vendor.Name}",
                entityId: vendor.Id);
        }

        // Helper: map model to DTO
        private static VendorResponseDto MapToDto(Vendor v) => new()
        {
            Id = v.Id,
            Name = v.Name,
            ContactPerson = v.ContactPerson,
            Phone = v.Phone,
            Email = v.Email,
            Address = v.Address,
            IsActive = v.IsActive
        };
    }
}