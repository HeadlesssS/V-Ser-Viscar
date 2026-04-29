using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Models;

namespace Ser_Viscar.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<PartCategory> PartCategories { get; set; }
        public DbSet<Part> Parts { get; set; }
        public DbSet<Vendor> Vendors { get; set; }
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<SalesInvoice> SalesInvoices { get; set; }
        public DbSet<SalesInvoiceItem> SalesInvoiceItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Part -> Category
            modelBuilder.Entity<Part>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Parts)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Part decimal precision
            modelBuilder.Entity<Part>()
                .Property(p => p.Price)
                .HasColumnType("decimal(18,2)");

            // PurchaseInvoice -> Vendor
            modelBuilder.Entity<PurchaseInvoice>()
                .HasOne(pi => pi.Vendor)
                .WithMany(v => v.PurchaseInvoices)
                .HasForeignKey(pi => pi.VendorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseInvoice>()
                .Property(pi => pi.TotalAmount)
                .HasColumnType("decimal(18,2)");

            // PurchaseInvoiceItem -> Invoice + Part
            modelBuilder.Entity<PurchaseInvoiceItem>()
                .HasOne(i => i.Invoice)
                .WithMany(pi => pi.Items)
                .HasForeignKey(i => i.PurchaseInvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .HasOne(i => i.Part)
                .WithMany(p => p.PurchaseItems)
                .HasForeignKey(i => i.PartId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(i => i.UnitCost)
                .HasColumnType("decimal(18,2)");

            // Customer -> User (optional one-to-one)
            modelBuilder.Entity<Customer>()
                .HasOne(c => c.User)
                .WithOne(u => u.Customer)
                .HasForeignKey<Customer>(c => c.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // SalesInvoice -> Customer
            modelBuilder.Entity<SalesInvoice>()
                .HasOne(si => si.Customer)
                .WithMany(c => c.SalesInvoices)
                .HasForeignKey(si => si.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SalesInvoice>()
                .Property(si => si.SubTotal)
                .HasColumnType("decimal(18,2)");
            modelBuilder.Entity<SalesInvoice>()
                .Property(si => si.TotalAmount)
                .HasColumnType("decimal(18,2)");
            modelBuilder.Entity<SalesInvoice>()
                .Property(si => si.DiscountPercent)
                .HasColumnType("decimal(18,2)");

            // SalesInvoiceItem -> Invoice + Part
            modelBuilder.Entity<SalesInvoiceItem>()
                .HasOne(i => i.Invoice)
                .WithMany(si => si.Items)
                .HasForeignKey(i => i.SalesInvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SalesInvoiceItem>()
                .HasOne(i => i.Part)
                .WithMany(p => p.SalesItems)
                .HasForeignKey(i => i.PartId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SalesInvoiceItem>()
                .Property(i => i.UnitPrice)
                .HasColumnType("decimal(18,2)");

            // Seed default admin
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                Name = "admin",
                Password = "admin123",
                Role = "Admin",
                Email = "admin@sarviscar.com"
            });

            // Seed default staff
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 2,
                Name = "staff",
                Password = "staff123",
                Role = "Staff",
                Email = "staff@sarviscar.com"
            });

            // Seed a customer user
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 3,
                Name = "customer1",
                Password = "cust123",
                Role = "Customer",
                Email = "customer1@example.com"
            });

            // Seed customer linked to user 3
            modelBuilder.Entity<Customer>().HasData(new Customer
            {
                Id = 1,
                Name = "John Doe",
                Phone = "9800000001",
                Email = "customer1@example.com",
                UserId = 3
            });

            // Seed categories
            modelBuilder.Entity<PartCategory>().HasData(
                new PartCategory { Id = 1, Name = "Engine Parts" },
                new PartCategory { Id = 2, Name = "Brake System" },
                new PartCategory { Id = 3, Name = "Electrical" },
                new PartCategory { Id = 4, Name = "Body Parts" },
                new PartCategory { Id = 5, Name = "Filters" }
            );

            // Seed vendor
            modelBuilder.Entity<Vendor>().HasData(new Vendor
            {
                Id = 1,
                Name = "Auto Parts Ltd",
                Phone = "9800000099",
                Email = "vendor@autoparts.com",
                Address = "Kathmandu, Nepal"
            });
        }
    }
}
