using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.Models;

namespace Ser_Viscar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesInvoicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public SalesInvoicesController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var invoices = await _context.SalesInvoices
                .Include(si => si.Customer)
                .Include(si => si.Items).ThenInclude(i => i.Part)
                .OrderByDescending(si => si.Date)
                .Select(si => new
                {
                    si.Id,
                    si.Date,
                    si.SubTotal,
                    si.DiscountPercent,
                    si.TotalAmount,
                    si.LoyaltyApplied,
                    si.PaymentMethod,
                    si.Status,
                    si.CustomerId,
                    customerName = si.Customer.Name,
                    items = si.Items.Select(i => new
                    {
                        i.Id, i.PartId, partName = i.Part.Name, i.Quantity, i.UnitPrice
                    })
                })
                .ToListAsync();
            return Ok(invoices);
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var invoices = await _context.SalesInvoices
                .Include(si => si.Items).ThenInclude(i => i.Part)
                .Where(si => si.CustomerId == customerId)
                .OrderByDescending(si => si.Date)
                .Select(si => new
                {
                    si.Id,
                    si.Date,
                    si.SubTotal,
                    si.DiscountPercent,
                    si.TotalAmount,
                    si.LoyaltyApplied,
                    si.PaymentMethod,
                    si.Status,
                    items = si.Items.Select(i => new
                    {
                        i.PartId, partName = i.Part.Name, i.Quantity, i.UnitPrice, lineTotal = i.Quantity * i.UnitPrice
                    })
                })
                .ToListAsync();
            return Ok(invoices);
        }

        public record SalesItemRequest(int PartId, int Quantity);
        public record SalesInvoiceRequest(int CustomerId, string PaymentMethod, string Status, List<SalesItemRequest> Items);

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SalesInvoiceRequest req)
        {
            var customer = await _context.Customers.FindAsync(req.CustomerId);
            if (customer == null) return BadRequest("Customer not found");

            var invoice = new SalesInvoice
            {
                CustomerId = req.CustomerId,
                Date = DateTime.UtcNow,
                PaymentMethod = req.PaymentMethod,
                Status = req.Status
            };

            decimal subTotal = 0;
            foreach (var item in req.Items)
            {
                var part = await _context.Parts.FindAsync(item.PartId);
                if (part == null) return BadRequest($"Part {item.PartId} not found");
                if (part.QuantityOnHand < item.Quantity)
                    return BadRequest($"Insufficient stock for part '{part.Name}'. Available: {part.QuantityOnHand}");

                var unitPrice = part.Price; // price snapshot
                invoice.Items.Add(new SalesInvoiceItem
                {
                    PartId = item.PartId,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice
                });

                part.QuantityOnHand -= item.Quantity;
                subTotal += item.Quantity * unitPrice;
            }

            invoice.SubTotal = subTotal;
            invoice.RecalculateTotal();

            _context.SalesInvoices.Add(invoice);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = invoice.Id }, new
            {
                invoice.Id,
                invoice.SubTotal,
                invoice.DiscountPercent,
                invoice.TotalAmount,
                invoice.LoyaltyApplied
            });
        }
    }
}
