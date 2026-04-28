using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;
using Ser_Viscar.Services.Interfaces;
using Ser_Viscar.Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

// ── Database Configuration ──
var connection = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connection));

// ── DI: Feature Services (Irshad — F9, F10, F11) ──
builder.Services.AddScoped<ICustomerSearchService, CustomerSearchService>();
builder.Services.AddScoped<ICustomerReportService, CustomerReportService>();
builder.Services.AddScoped<IInvoiceEmailService, InvoiceEmailService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// ══════════════════════════════════════════════════════════
//  TODO (Pawan - F2): Add IUserService, UserService
//  builder.Services.AddScoped<IUserService, UserService>();
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
//  TODO (Chasita - F3, F7): Add IPartService, ISalesInvoiceService
//  builder.Services.AddScoped<IPartService, PartService>();
//  builder.Services.AddScoped<ISalesInvoiceService, SalesInvoiceService>();
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
//  TODO (Sanjana - F4, F5): Add IVendorService, IPurchaseInvoiceService
//  builder.Services.AddScoped<IVendorService, VendorService>();
//  builder.Services.AddScoped<IPurchaseInvoiceService, PurchaseInvoiceService>();
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
//  TODO (Bhoj - F8, F13): Add IAppointmentService, IReviewService
//  builder.Services.AddScoped<IAppointmentService, AppointmentService>();
// ══════════════════════════════════════════════════════════

// ── Controllers + Swagger ──
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Use camelCase for JSON serialization
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Ser-Viscar — Vehicle Parts Management API",
        Version = "v1",
        Description = "ASP.NET Core Web API for vehicle parts inventory, " +
                      "sales, customers, and reporting."
    });
});

// ── CORS for React frontend ──
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// ── HTTP Pipeline ──
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ser-Viscar API v1"));
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
