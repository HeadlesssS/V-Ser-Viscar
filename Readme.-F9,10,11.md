# Ser-Viscar — Features 9, 10, 11 (Irshad)

## Features Implemented

| Feature | Description | Marks | Status |
|---------|-------------|-------|--------|
| F9  | Staff can generate customer-related reports (regulars, high spenders, pending credits) | 4 | Done |
| F10 | Staff can search customers by vehicle number, phone, ID, or name | 4 | Done |
| F11 | Staff can send invoices via email to customers | 4 | Done |

## API Endpoints

| Method | Endpoint | Feature |
|--------|----------|---------|
| GET | /api/customers/search?term={query} | F10 |
| GET | /api/reports/customers/high-spenders?top=20 | F9 |
| GET | /api/reports/customers/regulars?top=20 | F9 |
| GET | /api/reports/customers/pending-credits | F9 |
| GET | /api/invoices/{id}/detail | F11 |
| POST | /api/invoices/{id}/email | F11 |

## Running

Backend: `cd Backend/Ser_Viscar && dotnet run`  
Frontend: `cd Frontend && npm install && npm run dev`

## Team Integration

All files include TODO comments for each team member's merge points.
See ApplicationDbContext.cs and Program.cs for DbSet and DI placeholders.
