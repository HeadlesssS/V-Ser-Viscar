using Microsoft.EntityFrameworkCore;
using Ser_Viscar.Data;



var builder = WebApplication.CreateBuilder(args);

// =======================
// ?? DATABASE CONNECTION
// =======================
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// =======================
// ?? CORS (IMPORTANT FOR REACT)
// =======================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// =======================
// ?? CONTROLLERS
// =======================
builder.Services.AddControllers();

// =======================
// ?? SWAGGER
// =======================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// =======================
// ?? SWAGGER UI
// =======================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// =======================
// ?? MIDDLEWARE PIPELINE
// =======================

app.UseHttpsRedirection();

// ?? MUST BE BEFORE AUTHORIZATION
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
