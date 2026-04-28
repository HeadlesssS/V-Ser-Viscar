using Microsoft.AspNetCore.Mvc;
using Ser_Viscar.Data;

[ApiController]
[Route("api/[controller]")]
public class VendorController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public VendorController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_context.Vendors.ToList());
    }

    [HttpPost]
    public IActionResult Create(Vendor vendor)
    {
        _context.Vendors.Add(vendor);
        _context.SaveChanges();
        return Ok(vendor);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, Vendor updated)
    {
        var vendor = _context.Vendors.Find(id);
        if (vendor == null) return NotFound();

        vendor.Name = updated.Name;
        vendor.Contact = updated.Contact;
        vendor.Address = updated.Address;

        _context.SaveChanges();
        return Ok(vendor);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var vendor = _context.Vendors.Find(id);
        if (vendor == null) return NotFound();

        _context.Vendors.Remove(vendor);
        _context.SaveChanges();
        return Ok();
    }
}