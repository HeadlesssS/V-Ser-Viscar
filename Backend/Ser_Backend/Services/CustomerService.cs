using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ser_Backend.Data;
using Ser_Backend.DTO.Customer;
using Ser_Backend.DTOs.Customers;
using Ser_Backend.Models;
using System.Security.Claims;

namespace Ser_Backend.Services.Implementations
{
    public class CustomerService
    {
        private readonly AppDbContext _db;

        public CustomerService(AppDbContext db)
        {
            _db = db;
        }



        public async Task<String> AddVehicleAsync(AddVehicleDto dto)
        {
            var customer = await _db.Customers.FindAsync(dto.CustomerId);
            if (customer == null)
            {
                return "Customer not found.";
            }

            var exists =await _db.Vehicles.AnyAsync(v => v.VehicleNumber == dto.VehicleNumber);
            if (exists)            {
                return "Vehicle number already exists.";
            }

            var vehicle = new Vehicle
            {
                CustomerId = dto.CustomerId,
                VehicleNumber = dto.VehicleNumber,
                Brand = dto.Brand,
                Model = dto.Model,
                Year = dto.Year,
                VIN = dto.VIN
            };

            _db.Vehicles.Add(vehicle);
            await _db.SaveChangesAsync();

            return "Vehicle added successfully.";
        }

        public async Task<String> AddVehicleForCustomerAsync(int userId, AddVehicleDto dto)
        {
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
            if (customer == null)
            {
                return "Customer profile not found.";
            }

            var exists = await _db.Vehicles.AnyAsync(v => v.VehicleNumber == dto.VehicleNumber);
            if (exists)
            {
                return "Vehicle number already exists.";
            }

            var vehicle = new Vehicle
            {
                CustomerId = customer.Id,
                VehicleNumber = dto.VehicleNumber,
                Brand = dto.Brand,
                Model = dto.Model,
                Year = dto.Year,
                VIN = dto.VIN
            };

            _db.Vehicles.Add(vehicle);
            await _db.SaveChangesAsync();

            return "Vehicle added successfully.";
        }



        public async Task<List<CustomerResponseDto>> GetAllAsync()
        {
            return await _db.Customers
                .Include(c => c.User)
                .Where(c => c.User.isActive)
                .OrderBy(c => c.User.Name)
                .Select(c => new CustomerResponseDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    UserName = c.User.Name ?? string.Empty,
                    Email = c.User.Email,
                    Phone = c.User.Phone,
                    LoyaltyTier = c.LoyaltyTier,
                    TotalSpent = c.TotalSpent,
                    CreditBalance = c.CreditBalance,
                })
                .ToListAsync();
        }

        public async Task<ProfileResponseDto> GetProfileAsync(int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null || !user.isActive)
            {
                return null;
            }

            var profile = new ProfileResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                CreatedAt = user.CreatedAt
            };

            if (user.Role == User.UserRole.Customer)
            {
                var customer = await _db.Customers
                    .Include(c => c.Vehicles)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (customer != null)
                {
                    profile.LoyaltyTier = customer.LoyaltyTier;
                    profile.TotalSpent = customer.TotalSpent;
                    profile.CreditBalance = customer.CreditBalance;
                    profile.Vehicles = customer.Vehicles.Select(v => new VehicleDto
                    {
                        Id = v.Id,
                        VehicleNumber = v.VehicleNumber,
                        Make = v.Brand,
                        Model = v.Model,
                        Year = v.Year,
                        VIN = v.VIN
                    }).ToList();
                }
            }

            return profile;
        }

        public async Task<String> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null || !user.isActive)
            {
                return "User not found.";
            }

            user.Name = dto.Name;
            user.Phone = dto.Phone;

            _db.Users.Update(user);
            await _db.SaveChangesAsync();

            return "Profile updated successfully.";
        }

        public async Task<CustomerByEmailDto?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            var match = await _db.Customers
                .Include(c => c.User)
                .Where(c => c.User.Email == email)
                .Select(c => new CustomerByEmailDto
                {
                    CustomerId = c.Id,
                    FullName = c.User.Name ?? string.Empty
                })
                .FirstOrDefaultAsync();

            return match;
        }

        public async Task<CustomerDetailsDto> GetCustomerDetailsAsync(int customerId){

            var customer = await _db.Customers
                .Include(c=>c.User)
                .Include(c => c.Vehicles)
                .FirstOrDefaultAsync(c => c.Id == customerId);

                if (customer == null){
                    throw new Exception("Customer not found.");
                }

                return new CustomerDetailsDto{
                    Id = customer.Id,
                    FullName = customer.User.Name ?? string.Empty,
                    Email = customer.User.Email,
                    Phone = customer.User.Phone,
                    TotalSpent = customer.TotalSpent,
                    CreditBalance = customer.CreditBalance,
                    LoyaltyTier = customer.LoyaltyTier,
                    CreatedAt = customer.User.CreatedAt,
                    Vehicles = customer.Vehicles.Select(v => new VehicleDto{
                        Id = v.Id,
                        VehicleNumber = v.VehicleNumber,
                        Make = v.Brand,
                        Model = v.Model,
                        Year = v.Year,
                        VIN = v.VIN
                    }).ToList()
                };
        }

        // ------------------------------------------------------------------ //
        //  Feature 10: Customer Search                                         //
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Searches active customers using the specified strategy.
        /// </summary>
        /// <param name="query">The search term.</param>
        /// <param name="searchBy">
        /// One of: <c>name</c>, <c>phone</c>, <c>id</c>, or <c>vehicle</c>.
        /// Defaults to <c>name</c> for unrecognised values.
        /// </param>
        public async Task<List<CustomerResponseDto>> SearchCustomersAsync(string query, string searchBy)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<CustomerResponseDto>();

            // Build the filtered queryable based on the search strategy.
            IQueryable<Models.Customer> q;

            switch (searchBy.Trim().ToLower())
            {
                case "phone":
                    q = _db.Customers
                        .Include(c => c.User)
                        .Where(c => c.User.isActive && c.User.Phone.Contains(query));
                    break;

                case "id":
                    if (!int.TryParse(query, out int customerId))
                        return new List<CustomerResponseDto>();

                    q = _db.Customers
                        .Include(c => c.User)
                        .Where(c => c.User.isActive && c.Id == customerId);
                    break;

                case "vehicle":
                    // Filter by vehicle plate; EF Core translates Any() to a SQL EXISTS sub-query.
                    var lowerVehicle = query.ToLower();
                    q = _db.Customers
                        .Include(c => c.User)
                        .Where(c => c.User.isActive &&
                                    c.Vehicles.Any(v => v.VehicleNumber.ToLower().Contains(lowerVehicle)));
                    break;

                default: // "name" and anything else
                    var lowerName = query.ToLower();
                    q = _db.Customers
                        .Include(c => c.User)
                        .Where(c => c.User.isActive &&
                                    (c.User.Name != null && c.User.Name.ToLower().Contains(lowerName)));
                    break;
            }

            return await q
                .OrderBy(c => c.User.Name)
                .Select(c => new CustomerResponseDto
                {
                    Id            = c.Id,
                    UserId        = c.UserId,
                    UserName      = c.User.Name ?? string.Empty,
                    Email         = c.User.Email,
                    Phone         = c.User.Phone,
                    LoyaltyTier   = c.LoyaltyTier,
                    TotalSpent    = c.TotalSpent,
                    CreditBalance = c.CreditBalance
                })
                .ToListAsync();
        }

        public async Task<List<CustomerHistoryDto>> GetCustomerHistoryAsync(int customerId){

            var invoices = await _db.SalesInvoices
                .Include(s=>s.Items)
                .ThenInclude(i => i.Part)
                .Where(s => s.CustomerId == customerId)
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();

            return invoices.Select(s => new CustomerHistoryDto{
                InvoiceId = s.Id,
                SaleDate = s.SaleDate,
                Subtotal = s.Subtotal,
                DiscountAmount = s.DiscountAmount,
                TotalAmount = s.TotalAmount,
                IsPaid = s.IsPaid,
                IsCredit = s.IsCredit,
                Items = s.Items.Select(i => new InvoiceItemDto{
                    PartName = i.Part.Name,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            }).ToList();

        }
    }
}
