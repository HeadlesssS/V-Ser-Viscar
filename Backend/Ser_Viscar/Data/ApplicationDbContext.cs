using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Models;
using Ser_Viscar.Models.Enums;

namespace Ser_Viscar.Data
{
    /// <summary>
    /// Application database context — central EF Core configuration.
    /// 
    /// TEAM INTEGRATION NOTES:
    /// ─────────────────────────────────────────────────────────
    /// Each team member adds their DbSets and Fluent API configs here.
    /// Current DbSets added by Irshad (F9, F10, F11) — other members
    /// will add their own entities when merging.
    ///
    /// • Pawan (F2, F6, F12): Already has Users DbSet. Will extend 
    ///   with Role entity if needed.
    /// • Chasita (F3, F7, F14, F15): Will add Part, PartCategory,
    ///   and complete SalesInvoice creation logic.
    /// • Bhoj (F8, F13, F16): Will add Appointment, Review entities.
    /// • Sanjana (F1, F4, F5): Will add Vendor, PurchaseInvoice,
    ///   PurchaseInvoiceItem entities.
    /// ─────────────────────────────────────────────────────────
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // ── Identity & Access ──
        public DbSet<User> Users { get; set; }

        // ── Customer & Vehicle ──
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }

        // ── Sales & Billing ──
        public DbSet<SalesInvoice> SalesInvoices { get; set; }
        public DbSet<SalesInvoiceItem> SalesInvoiceItems { get; set; }
        public DbSet<Payment> Payments { get; set; }

        // ══════════════════════════════════════════════════════════
        //  TODO (Chasita - F3): Add Part and PartCategory DbSets
        //  public DbSet<Part> Parts { get; set; }
        //  public DbSet<PartCategory> PartCategories { get; set; }
        // ══════════════════════════════════════════════════════════

        // ══════════════════════════════════════════════════════════
        //  TODO (Sanjana - F4, F5): Add Vendor and PurchaseInvoice DbSets
        //  public DbSet<Vendor> Vendors { get; set; }
        //  public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        //  public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; }
        // ══════════════════════════════════════════════════════════

        // ══════════════════════════════════════════════════════════
        //  TODO (Bhoj - F13): Add Appointment and Review DbSets
        //  public DbSet<Appointment> Appointments { get; set; }
        //  public DbSet<Review> Reviews { get; set; }
        // ══════════════════════════════════════════════════════════

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Customer → Vehicles (one-to-many) ──
            modelBuilder.Entity<Vehicle>(entity =>
            {
                entity.HasOne(v => v.Customer)
                    .WithMany(c => c.Vehicles)
                    .HasForeignKey(v => v.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(v => v.LicensePlate);
            });

            // ── Customer → SalesInvoices (one-to-many) ──
            modelBuilder.Entity<SalesInvoice>(entity =>
            {
                entity.HasOne(i => i.Customer)
                    .WithMany(c => c.SalesInvoices)
                    .HasForeignKey(i => i.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(i => i.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(i => i.CreatedByUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(i => i.InvoiceNumber).IsUnique();

                // ── Decimal precision for financial fields ──
                entity.Property(i => i.SubTotal).HasColumnType("decimal(18,2)");
                entity.Property(i => i.DiscountPercent).HasColumnType("decimal(5,2)");
                entity.Property(i => i.DiscountAmount).HasColumnType("decimal(18,2)");
                entity.Property(i => i.TotalAmount).HasColumnType("decimal(18,2)");
            });

            // ── SalesInvoice → Items (one-to-many) ──
            modelBuilder.Entity<SalesInvoiceItem>(entity =>
            {
                entity.HasOne(item => item.SalesInvoice)
                    .WithMany(inv => inv.Items)
                    .HasForeignKey(item => item.SalesInvoiceId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(item => item.UnitPriceSnapshot).HasColumnType("decimal(18,2)");
                entity.Property(item => item.LineTotal).HasColumnType("decimal(18,2)");
            });

            // ── Payment entity ──
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasOne(p => p.SalesInvoice)
                    .WithMany(inv => inv.Payments)
                    .HasForeignKey(p => p.SalesInvoiceId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.Customer)
                    .WithMany(c => c.Payments)
                    .HasForeignKey(p => p.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(p => p.AmountDue).HasColumnType("decimal(18,2)");
                entity.Property(p => p.AmountPaid).HasColumnType("decimal(18,2)");
            });

            // ── Customer indexes for search (F10 - Irshad) ──
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasIndex(c => c.FullName);
                entity.HasIndex(c => c.Phone);
                entity.HasIndex(c => c.Email);
            });

            // ══════════════════════════════════════════════════════════
            //  TODO (All): Add seed data for demo/testing
            //  Seed Admin user, sample customers, vehicles, invoices, etc.
            // ══════════════════════════════════════════════════════════
        }
    }
}
