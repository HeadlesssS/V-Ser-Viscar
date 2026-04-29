using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.Models;

namespace Ser_Viscar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseInvoicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public PurchaseInvoicesController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var invoices = await _context.PurchaseInvoices
                .Include(pi => pi.Vendor)
                .Include(pi => pi.Items).ThenInclude(i => i.Part)
                .OrderByDescending(pi => pi.Date)
                .Select(pi => new
                {
                    pi.Id,
                    pi.Date,
                    pi.TotalAmount,
                    pi.Notes,
                    vendorName = pi.Vendor.Name,
                    pi.VendorId,
                    items = pi.Items.Select(i => new
                    {
                        i.Id, i.PartId, partName = i.Part.Name, i.Quantity, i.UnitCost
                    })
                })
                .ToListAsync();
            return Ok(invoices);
        }

        public record PurchaseItemRequest(int PartId, int Quantity, decimal UnitCost);
        public record PurchaseInvoiceRequest(int VendorId, string? Notes, List<PurchaseItemRequest> Items);

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PurchaseInvoiceRequest req)
        {
            var invoice = new PurchaseInvoice
            {
                VendorId = req.VendorId,
                Date = DateTime.UtcNow,
                Notes = req.Notes
            };

            decimal total = 0;
            foreach (var item in req.Items)
            {
                var part = await _context.Parts.FindAsync(item.PartId);
                if (part == null) return BadRequest($"Part {item.PartId} not found");

                invoice.Items.Add(new PurchaseInvoiceItem
                {
                    PartId = item.PartId,
                    Quantity = item.Quantity,
                    UnitCost = item.UnitCost
                });

                // Update stock
                part.QuantityOnHand += item.Quantity;
                total += item.Quantity * item.UnitCost;
            }

            invoice.TotalAmount = total;
            _context.PurchaseInvoices.Add(invoice);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = invoice.Id }, new { invoice.Id, invoice.TotalAmount });
        }
    }
}
