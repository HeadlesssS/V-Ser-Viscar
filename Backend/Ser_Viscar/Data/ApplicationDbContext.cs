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
        public DbSet<Vehicle> Vehicles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(b =>
            {
                b.HasIndex(u => u.Email).IsUnique();
                b.Property(u => u.Role).HasConversion<string>();
            });

            modelBuilder.Entity<Vehicle>(b =>
            {
                b.HasIndex(v => new { v.CustomerId, v.VehicleNumber }).IsUnique();
                b.HasOne(v => v.Customer)
                    .WithMany(u => u.Vehicles)
                    .HasForeignKey(v => v.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
