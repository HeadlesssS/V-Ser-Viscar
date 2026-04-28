using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;

[ApiController]
[Route("api/[controller]")]
public class PurchaseInvoiceController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PurchaseInvoiceController(ApplicationDbContext context)
    {
        _context = context;
    }

    // ✅ CREATE INVOICE
    [HttpPost]
    public IActionResult Create(PurchaseInvoice invoice)
    {
        invoice.Date = DateTime.UtcNow;

        _context.PurchaseInvoices.Add(invoice);
        _context.SaveChanges();

        // reload vendor data
        var result = _context.PurchaseInvoices
            .Include(p => p.Vendor)
            .FirstOrDefault(x => x.Id == invoice.Id);

        return Ok(result);
    }

    // ✅ GET ALL INVOICES
    [HttpGet]
    public IActionResult GetAll()
    {
        var data = _context.PurchaseInvoices
            .Include(p => p.Vendor)
            .ToList();

        return Ok(data);
    }

    // ✅ GET BY ID (optional but useful for marks)
    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var invoice = _context.PurchaseInvoices
            .Include(p => p.Vendor)
            .FirstOrDefault(x => x.Id == id);

        if (invoice == null)
        {
            return NotFound("Invoice not found");
        }

        return Ok(invoice);
    }

    // ✅ DELETE INVOICE (bonus feature for marks)
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var invoice = _context.PurchaseInvoices.Find(id);

        if (invoice == null)
        {
            return NotFound("Invoice not found");
        }

        _context.PurchaseInvoices.Remove(invoice);
        _context.SaveChanges();

        return Ok("Deleted successfully");
    }
    [HttpGet("daily")]
    public IActionResult GetDailyReport()
    {
        var today = DateTime.UtcNow.Date;

        var total = _context.PurchaseInvoices
            .Where(x => x.Date.Date == today)
            .Sum(x => x.TotalAmount);

        return Ok(new
        {
            Date = today,
            TotalSales = total
        });
    }
    [HttpGet("monthly")]
    public IActionResult GetMonthlyReport()
    {
        var now = DateTime.UtcNow;

        var total = _context.PurchaseInvoices
            .Where(x => x.Date.Month == now.Month &&
                        x.Date.Year == now.Year)
            .Sum(x => x.TotalAmount);

        return Ok(new
        {
            Month = now.Month,
            Year = now.Year,
            TotalSales = total
        });
    }
    [HttpGet("yearly")]
    public IActionResult GetYearlyReport()
    {
        var year = DateTime.UtcNow.Year;

        var total = _context.PurchaseInvoices
            .Where(x => x.Date.Year == year)
            .Sum(x => x.TotalAmount);

        return Ok(new
        {
            Year = year,
            TotalSales = total
        });
    }
}