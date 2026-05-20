# Ser-Viscar — Vehicle Parts Selling & Inventory Management System

**CS6004NT Application Development — 30% Group Coursework | Team-V**

A full-stack, production-ready web platform for vehicle service centres. The system unifies parts inventory, sales invoicing, customer management, service appointments, and AI-driven vehicle diagnostics under a single premium interface — with role-tailored portals for Admin, Staff, and Customers.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Team Members & Feature Ownership](#team-members--feature-ownership)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Getting Started](#getting-started)
6. [Feature Documentation](#feature-documentation)
   - [Feature 1 — Financial Reports](#feature-1--financial-reports)
   - [Feature 2 — Staff & User Management](#feature-2--staff--user-management)
   - [Feature 3 — Parts Management](#feature-3--parts-management)
   - [Feature 4 — Purchase Invoices](#feature-4--purchase-invoices)
   - [Feature 5 — Vendor Management](#feature-5--vendor-management)
   - [Feature 6 — Register Customers & Vehicles](#feature-6--register-customers--vehicles)
   - [Feature 7 — Part Sales & Sales Invoices](#feature-7--part-sales--sales-invoices)
   - [Feature 8 — Customer Details & History](#feature-8--customer-details--history)
   - [Feature 9 — Customer Reports](#feature-9--customer-reports)
   - [Feature 10 — Customer Search](#feature-10--customer-search)
   - [Feature 11 — Email Invoice to Customer](#feature-11--email-invoice-to-customer)
   - [Feature 12 — Customer Self-Registration & Profile](#feature-12--customer-self-registration--profile)
   - [Feature 13 — Appointments, Part Requests & Reviews](#feature-13--appointments-part-requests--reviews)
   - [Feature 14 — Purchase & Service History](#feature-14--purchase--service-history)
   - [Feature 15 — Automated Notifications](#feature-15--automated-notifications)
   - [Feature 16 — Loyalty Programme](#feature-16--loyalty-programme)
7. [Real-Time Notification Bell](#real-time-notification-bell)
8. [API Reference](#api-reference)
9. [Authentication & Security](#authentication--security)
10. [SMTP Email Setup](#smtp-email-setup)
11. [Database Schema Overview](#database-schema-overview)
12. [Project File Structure](#project-file-structure)
13. [Build & Deployment](#build--deployment)
14. [Known Limitations & Future Work](#known-limitations--future-work)

---

## Project Overview

| Item | Detail |
|------|--------|
| **Module** | CS6004NT Application Development |
| **Assessment** | 30% Group Coursework (First Sit, First Set 1) |
| **Team** | Team-V |
| **Frontend URL** | `http://localhost:5173` |
| **Backend URL** | `http://localhost:5169` |
| **API Base** | `/api` (proxied through Vite) |

### Role Portals

| Role | Entry URL | Capabilities |
|------|-----------|-------------|
| **Admin** | `/admin/dashboard` | Full system control |
| **Staff** | `/staff/dashboard` | Customer management & sales |
| **Customer** | `/customer/dashboard` | Self-service & history |

---

## Team Members & Feature Ownership

| Member | Student ID | Features Owned | Area |
|--------|-----------|---------------|------|
| **Md Irshad Aalam** | — | **9, 10, 11** | Staff Reports, Customer Search, Email Invoicing |
| **Chasita Rai** | — | 3, 7,14,15 | Financial Reports, Vendor Management |
| **Bhoj Bhadur Khadka** | — | 8, 13, 16 | Parts Management, Purchase & Sales Invoices |
| **Pawan Parajuli** | — | 2, 6, 12,  | Customer & Vehicle Registration, Profile, History |
| **Sanjana Bhattarai** | — | 1, 4, 5 | User Management, Appointments, Notifications, Loyalty |

> All team members contributed to the shared infrastructure (authentication, layout, database schema, deployment configuration).

---

## Technology Stack

### Backend — ASP.NET Core 9

| Technology | Purpose |
|-----------|---------|
| ASP.NET Core 9 Web API | REST API server |
| Entity Framework Core 9 | ORM & database migrations |
| PostgreSQL | Primary relational database |
| BCrypt.Net-Next | Password hashing |
| JWT Bearer Authentication | Stateless auth tokens |
| System.Net.Mail (SMTP) | Email delivery |
| Swagger / OpenAPI | API documentation |

### Frontend — React 19 + Vite 8

| Technology | Purpose |
|-----------|---------|
| React 19 | UI component framework |
| Vite 8 | Dev server & production bundler |
| React Router v7 | Client-side routing |
| Recharts | Data visualisation charts |
| Inline CSS / CSS Modules | Styling (no external UI library) |

---

## System Architecture

```
Browser (React SPA)
       |
  Vite Dev Proxy  (/api  →  localhost:5169)
       |
ASP.NET Core Web API
       |
Entity Framework Core
       |
PostgreSQL Database
       |
Gmail SMTP (outbound emails)
```

### Backend Layer Structure

```
Controllers/       HTTP request handlers, route definitions
Services/          Business logic (one service per domain)
DTO/               Data Transfer Objects (request + response shapes)
Models/            EF Core entity classes
Data/              AppDbContext (database mappings)
Migrations/        EF Core migration history
```

### Frontend Layer Structure

```
src/
  App.jsx            Route definitions for all three role portals
  Layouts/
    AppLayout.jsx    Shared sidebar + notification bell (all roles)
    AdminLayout.css  Sidebar & bell panel styles
  Pages/
    Admin/           Admin-only pages
    Staff/           Staff-only pages
    Customer/        Customer self-service pages
    Auth/            Login & public registration
  components/
    ProtectedRoute   Role-based route guard
  services/          Shared API helper utilities
```

---

## Getting Started

### Prerequisites

- .NET 9 SDK
- Node.js 20+ and npm
- PostgreSQL 15+
- Gmail account with App Password (for email features)

### 1 — Configure the Backend

Edit `Backend/Ser_Backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=serviscar;Username=postgres;Password=YOUR_PG_PASSWORD"
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyAtLeast32CharsLong",
    "Issuer": "Ser-Viscar",
    "Audience": "Ser-Viscar-Client",
    "ExpiryInMinutes": 480
  },
  "SmtpSettings": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "your.email@gmail.com",
    "Password": "your-16-char-app-password",
    "FromName": "Ser-Viscar Service Centre"
  }
}
```

### 2 — Run Database Migrations

```bash
cd Backend/Ser_Backend
dotnet ef database update
```

### 3 — Start the Backend

```bash
dotnet run
# API available at https://localhost:5169
# Swagger UI at https://localhost:5169/swagger
```

### 4 — Configure the Frontend Proxy

Ensure `Frontend/vite.config.js` contains:

```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5169',
        changeOrigin: true,
      },
    },
  },
});
```

### 5 — Start the Frontend

```bash
cd Frontend
npm install
npm run dev
# App at http://localhost:5169
```

### 6 — Create the First Admin Account

Run this SQL directly on your PostgreSQL database (passwords are BCrypt-hashed):

```sql
INSERT INTO "Users" ("Name","Email","PasswordHash","Phone","Role","isActive","CreatedAt")
VALUES (
  'Administrator',
  'admin@serviscar.com',
  '$2a$11$examplehashreplacewithrealbcrypt',
  '+44000000000',
  'Admin',
  true,
  NOW()
);
```

Or use a seed endpoint if one is available in development mode.

---

## Feature Documentation

---

### Feature 1 — Financial Reports

**Owner: Chasita** | Admin only

Generates financial summaries across three time periods.

**API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/financial-reports/daily` | Today's revenue, costs, profit |
| `GET` | `/api/financial-reports/monthly` | Current month breakdown |
| `GET` | `/api/financial-reports/yearly` | Full year summary |

**Response Fields**

```json
{
  "totalRevenue": 45230.00,
  "totalCost": 28140.00,
  "grossProfit": 17090.00,
  "totalInvoices": 134,
  "averageOrderValue": 337.54,
  "period": "2026-05"
}
```

**Frontend:** `/admin/financial-reports` — Bar charts (Recharts) showing revenue vs cost with period toggle tabs.

---

### Feature 2 — Staff & User Management

**Owner: Hope** | Admin only

Full CRUD operations on Staff and Customer accounts.

**API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users?role=Staff` | List all users (filter by role) |
| `POST` | `/api/auth/register-staff` | Register new Staff or Customer |
| `PUT` | `/api/users/{id}` | Update name, email, phone, password |
| `DELETE` | `/api/users/{id}` | Permanently delete user |
| `PUT` | `/api/users/{id}/toggle-status` | Activate / deactivate account |

**Role Constraints**
- Admin accounts cannot be created via API
- Admin accounts cannot be deleted
- An admin cannot deactivate their own account

**Frontend:** `/admin/register-staff`
- Registration form with eye-toggle password field
- Filterable user table (All / Staff / Customer tabs)
- Per-row Edit, Toggle-Status, and Delete actions
- Confirmation modal before deletion

---

### Feature 3 — Parts Management

**Owner: Bhoj** | Admin only

Full inventory management for vehicle parts.

**API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/parts` | List all parts |
| `POST` | `/api/parts` | Add new part |
| `PUT` | `/api/parts/{id}` | Update part details |
| `DELETE` | `/api/parts/{id}` | Remove part |

**Part Fields:** `name`, `sku`, `category`, `vendorId`, `costPrice`, `sellingPrice`, `stockQuantity`, `lowStockThreshold`

**Frontend:** `/admin/parts`
- Card grid with search, category filter, and stock-level filter
- Edit and Delete buttons appear on card hover (smooth fade transition)
- Low-stock cards highlighted in amber; out-of-stock in red
- Auto-triggers low-stock notification when stock drops below threshold

---

### Feature 4 — Purchase Invoices

**Owner: Bhoj** | Admin only

Records stock replenishment from vendors and updates part quantities.

**API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/purchase-invoices` | List all purchase invoices |
| `POST` | `/api/purchase-invoices` | Create invoice (updates stock) |
| `GET` | `/api/purchase-invoices/{id}` | Invoice detail |

**Frontend:** `/admin/purchase-invoices` — Form to select vendor, add line items, auto-calculate totals.

---

### Feature 5 — Vendor Management

**Owner: Chasita** | Admin only

CRUD operations on supplier/vendor records.

**API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/vendors` | List all vendors |
| `POST` | `/api/vendors` | Add vendor |
| `PUT` | `/api/vendors/{id}` | Edit vendor |
| `DELETE` | `/api/vendors/{id}` | Remove vendor |

**Vendor Fields:** `name`, `contactPerson`, `phone`, `email`, `address`

**Frontend:** `/admin/vendors` — Card grid with inline edit modal.

---

### Feature 6 — Register Customers & Vehicles

**Owner: Pawan** | Staff only

Staff registers walk-in customers and associates their vehicles.

**API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register-staff` (role=Customer) | Create customer account |
| `POST` | `/api/vehicles` | Add vehicle to customer |
| `GET` | `/api/vehicles/customer/{customerId}` | List customer's vehicles |

**Frontend:** `/staff/register-customer` and `/staff/add-vehicle`

---

### Feature 7 — Part Sales & Sales Invoices

**Owner: Bhoj** | Staff + Admin

Handles the complete sales transaction flow.

**API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sales-invoices` | List all invoices |
| `POST` | `/api/sales-invoices` | Create invoice (decrements stock) |
| `GET` | `/api/sales-invoices/{id}` | Invoice detail |

**Request Body**
```json
{
  "customerId": 5,
  "paymentType": "Cash",
  "items": [
    { "partId": 12, "quantity": 2 }
  ]
}
```

**Business Rules**
- Stock auto-decremented on invoice creation
- 10% loyalty discount applied automatically if subtotal > Rs 5,000
- `paymentType` values: `Cash`, `Credit`, `Card`

**Frontend:** `/staff/sales-invoices` — Multi-item invoice builder with live totals, loyalty discount indicator, and email send button.

---

### Feature 8 — Customer Details & History

**Owner: Pawan** | Staff only

Staff views a customer's full profile, vehicle list, and purchase history.

**API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/customers/{id}` | Customer profile |
| `GET` | `/api/customers/{id}/vehicles` | Customer's vehicles |
| `GET` | `/api/customers/{id}/invoices` | Purchase history |

**Frontend:** `/staff/customer-details` — Tabbed view of profile, vehicles, and invoice history.

---

### Feature 9 — Customer Reports

**Owner: Irshad** | Staff + Admin

Generates operational intelligence reports for customer behaviour analysis.

**API Endpoints**

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| `GET` | `/api/staff-reports/high-spenders` | `top=10` | Customers ranked by total spending |
| `GET` | `/api/staff-reports/regular-customers` | `minVisits=3` | Customers by purchase frequency |
| `GET` | `/api/staff-reports/pending-credits` | — | Customers with outstanding credit balances |

**High Spender Response**
```json
[
  {
    "customerId": 3,
    "customerName": "Aisha Rahman",
    "email": "aisha@example.com",
    "phone": "+44799000001",
    "totalSpent": 12450.00,
    "totalInvoices": 8,
    "lastPurchase": "2026-05-15T14:30:00Z"
  }
]
```

**Regular Customer Response**
```json
[
  {
    "customerId": 7,
    "customerName": "Raj Patel",
    "visitCount": 12,
    "totalSpent": 8320.00,
    "averageSpend": 693.33
  }
]
```

**Pending Credits Response**
```json
[
  {
    "customerId": 4,
    "customerName": "Tom Nguyen",
    "phone": "+44799000002",
    "totalCreditBalance": 2800.00,
    "invoiceCount": 3,
    "oldestCreditDate": "2026-03-01T00:00:00Z"
  }
]
```

**Frontend:** `/staff/customer-reports`
- Three report tabs with live data
- Sortable tables with customer avatars and rank indicators
- Export-friendly layout

**Key Backend Files**
- `Controllers/StaffReportController.cs`
- `Services/StaffReportService.cs`
- `DTO/StaffReport/`

**Key Frontend Files**
- `src/Pages/Staff/CustomerReports.jsx`

---

### Feature 10 — Customer Search

**Owner: Irshad** | Staff + Admin

Multi-mode customer lookup enabling fast identification of any customer.

**API Endpoint**

```
GET /api/customers/search?query={value}&mode={mode}
```

| `mode` value | Searches by |
|-------------|------------|
| `name` | Customer's full name (partial match) |
| `phone` | Phone number (partial match) |
| `id` | Exact customer ID |
| `vehicle` | Vehicle registration number |

**Response**
```json
[
  {
    "customerId": 5,
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "phone": "+44790123456",
    "vehicleCount": 2,
    "totalSpent": 3450.00,
    "lastVisit": "2026-04-22T10:15:00Z"
  }
]
```

**Frontend:** `/staff/search-customer`
- Search input with mode selector (Name / Phone / ID / Vehicle)
- Live-filter results as you type (debounced 300ms)
- Click any result card to navigate to that customer's full detail page

**Key Backend Files**
- `Controllers/CustomerController.cs` — `GET /api/customers/search`
- `Services/CustomerService.cs` — `SearchCustomersAsync()`

**Key Frontend Files**
- `src/Pages/Staff/SearchCustomer.jsx`

---

### Feature 11 — Email Invoice to Customer

**Owner: Irshad** | Staff + Admin

Sends a formatted HTML invoice to the customer's registered email address directly from the sales invoice page.

**API Endpoint**

```
POST /api/sales-invoices/{id}/send-email
```

**Request Body:** None (uses stored invoice + customer email)

**Response**
```json
{ "message": "Invoice emailed to sarah@example.com successfully." }
```

**Email Contains**
- Company branding header (Ser-Viscar)
- Invoice number, date, and payment type
- Itemised parts table with quantities and prices
- Subtotal, loyalty discount (if applied), and grand total
- Footer with service centre contact information

**SMTP Configuration** — See [SMTP Email Setup](#smtp-email-setup) section.

**Frontend:** `/staff/sales-invoices`
- Each invoice row has a "Send Email" button
- Loading spinner during send
- Toast notification on success or failure

**Key Backend Files**
- `Controllers/SalesInvoiceController.cs` — `POST /{id}/send-email`
- `Services/SalesInvoiceService.cs` — `SendInvoiceEmailAsync()`
- `Services/EmailService.cs` — SMTP delivery

**Key Frontend Files**
- `src/Pages/Staff/SalesInvoicePage.jsx`

---

### Feature 12 — Customer Self-Registration & Profile

**Owner: Pawan** | Public + Customer

Customers can register independently without needing a staff member.

**API Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | None | Self-register (role forced to Customer) |
| `GET` | `/api/auth/profile` | Customer | View own profile |
| `PUT` | `/api/auth/profile` | Customer | Update name, phone |
| `GET` | `/api/vehicles/my` | Customer | My registered vehicles |
| `POST` | `/api/vehicles` | Customer | Add a vehicle |

**Frontend:** `/register` (public), `/customer/profile`, `/customer/vehicles`

---

### Feature 13 — Appointments, Part Requests & Reviews

**Owner: Hope** | Customer + Admin + Staff

Three interconnected self-service modules.

#### Appointments

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/appointments` | Customer | Book appointment |
| `GET` | `/api/appointments/my` | Customer | My appointments |
| `GET` | `/api/appointments` | Admin, Staff | All appointments |
| `PUT` | `/api/appointments/{id}/status` | Admin, Staff | Update status |

**Appointment Status Flow:** `Pending` → `Confirmed` → `Completed` (or `Cancelled` at any stage)

When status changes, a bell notification is automatically sent to the customer.

**Frontend:**
- Customer: `/customer/appointments` — Book form + appointment cards with status indicators
- Admin/Staff: `/admin/appointments`, `/staff/appointments` — Management table with status update buttons

#### Part Requests

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/part-requests` | Customer | Submit request |
| `GET` | `/api/part-requests/my` | Customer | My requests |
| `GET` | `/api/part-requests` | Admin, Staff | All requests |
| `PUT` | `/api/part-requests/{id}/status` | Admin, Staff | Fulfill or reject |

**Frontend:**
- Customer: `/customer/parts-request` — Premium card list with stats
- Admin/Staff: `/admin/part-requests-management`, `/staff/part-requests-management`

#### Reviews

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/reviews` | Customer | Submit review |
| `GET` | `/api/reviews` | Public | All reviews (no auth required) |

**Frontend:** `/customer/reviews` — Star-rating selector + review cards.

---

### Feature 14 — Purchase & Service History

**Owner: Pawan** | Customer only

Full chronological record of all transactions.

**API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sales-invoices` | All invoices (filtered client-side by customer name) |
| `GET` | `/api/appointments/my` | Service appointment history |

**Frontend:** `/customer/history`
- Summary stats: Total Invoices, Total Spent, Total Saved, Credit Balance
- Loyalty Member banner for high-spend customers
- Filter tabs: All, Paid, Unpaid, Credit
- Expandable invoice cards showing itemised line items
- Formatted dates and Rs currency display

---

### Feature 15 — Automated Notifications

**Owner: Hope** | System + Admin

Two automated workflows that trigger without manual intervention.

#### Low Stock Alert

- **Trigger:** Stock quantity falls below `lowStockThreshold` (default: 10 units)
- **Action:** Admin receives a bell notification + optional email alert
- **API:** `GET /api/notifications/low-stock` — view low stock summary
- **API:** `POST /api/notifications/low-stock-alert` — send email to admin

#### Overdue Credit Reminders

- **Trigger:** Customer has unpaid credit invoices older than 30 days
- **Action:** Email reminder sent to each overdue customer
- **API:** `GET /api/notifications/overdue-credits` — view overdue summary
- **API:** `POST /api/notifications/credit-reminders` — send reminder emails

**Frontend:** `/admin/notifications`
- Two sections: Low Stock (with stock bar visualisations) and Overdue Credits
- Manual "Send Alert" / "Send Reminders" buttons for immediate dispatch

---

### Feature 16 — Loyalty Programme

**Owner: Hope** | Automatic (applied at invoice creation)

Rewards customers who make high-value purchases.

**Rule:** If a single invoice subtotal exceeds **Rs 5,000**, a **10% discount** is automatically applied.

**Implementation:**
- `SalesInvoiceService.cs` calculates the discount during `CreateInvoiceAsync()`
- `discountAmount` is stored on the `SalesInvoice` record
- Customer sees the discount on their history page

**Loyalty Badge:** Customers who have benefited from the loyalty discount see a gold "Loyalty Member" badge on their Purchase History page.

---

## Real-Time Notification Bell

All three role portals include a notification bell in the sidebar footer.

### How It Works

1. **Polling:** Every 30 seconds, the frontend polls `GET /api/bell-notifications`
2. **Badge:** Unread count shown as a red badge on the bell icon
3. **Panel:** Clicking the bell opens a slide-up panel listing recent notifications
4. **Mark as Read:** "Mark all read" button clears the unread badge

### Notification Types

| Type | Colour | Triggered By |
|------|--------|-------------|
| `NewAppointment` | Blue | Customer books appointment |
| `AppointmentUpdate` | Green | Admin/Staff changes appointment status |
| `NewPartRequest` | Purple | Customer submits part request |
| `PartRequestUpdate` | Purple | Admin/Staff updates part request status |
| `LowStock` | Orange | Stock below threshold |
| `CreditReminder` | Red | Overdue credit reminder sent |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bell-notifications` | My notifications + unread count |
| `PUT` | `/api/bell-notifications/read-all` | Mark all as read |
| `PUT` | `/api/bell-notifications/{id}/read` | Mark single as read |

---

## API Reference

### Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

Obtain a token via `POST /api/auth/login`.

### Complete Endpoint List

| Method | Endpoint | Roles | Feature |
|--------|----------|-------|---------|
| `POST` | `/api/auth/register` | Public | 12 |
| `POST` | `/api/auth/register-staff` | Admin | 2 |
| `POST` | `/api/auth/login` | Public | — |
| `GET` | `/api/users` | Admin | 2 |
| `PUT` | `/api/users/{id}` | Admin | 2 |
| `DELETE` | `/api/users/{id}` | Admin | 2 |
| `PUT` | `/api/users/{id}/toggle-status` | Admin | 2 |
| `GET` | `/api/vendors` | Admin | 5 |
| `POST` | `/api/vendors` | Admin | 5 |
| `PUT` | `/api/vendors/{id}` | Admin | 5 |
| `DELETE` | `/api/vendors/{id}` | Admin | 5 |
| `GET` | `/api/parts` | Admin, Staff | 3 |
| `POST` | `/api/parts` | Admin | 3 |
| `PUT` | `/api/parts/{id}` | Admin | 3 |
| `DELETE` | `/api/parts/{id}` | Admin | 3 |
| `GET` | `/api/purchase-invoices` | Admin | 4 |
| `POST` | `/api/purchase-invoices` | Admin | 4 |
| `GET` | `/api/sales-invoices` | Admin, Staff | 7 |
| `POST` | `/api/sales-invoices` | Staff | 7 |
| `POST` | `/api/sales-invoices/{id}/send-email` | Staff, Admin | 11 |
| `GET` | `/api/customers/search` | Staff, Admin | 10 |
| `GET` | `/api/staff-reports/high-spenders` | Staff, Admin | 9 |
| `GET` | `/api/staff-reports/regular-customers` | Staff, Admin | 9 |
| `GET` | `/api/staff-reports/pending-credits` | Staff, Admin | 9 |
| `POST` | `/api/appointments` | Customer | 13 |
| `GET` | `/api/appointments/my` | Customer | 13 |
| `GET` | `/api/appointments` | Admin, Staff | 13 |
| `PUT` | `/api/appointments/{id}/status` | Admin, Staff | 13 |
| `POST` | `/api/part-requests` | Customer | 13 |
| `GET` | `/api/part-requests/my` | Customer | 13 |
| `GET` | `/api/part-requests` | Admin, Staff | 13 |
| `PUT` | `/api/part-requests/{id}/status` | Admin, Staff | 13 |
| `POST` | `/api/reviews` | Customer | 13 |
| `GET` | `/api/reviews` | Public | 13 |
| `GET` | `/api/financial-reports/daily` | Admin | 1 |
| `GET` | `/api/financial-reports/monthly` | Admin | 1 |
| `GET` | `/api/financial-reports/yearly` | Admin | 1 |
| `GET` | `/api/notifications/low-stock` | Admin | 15 |
| `POST` | `/api/notifications/low-stock-alert` | Admin | 15 |
| `GET` | `/api/notifications/overdue-credits` | Admin | 15 |
| `POST` | `/api/notifications/credit-reminders` | Admin | 15 |
| `GET` | `/api/bell-notifications` | All | — |
| `PUT` | `/api/bell-notifications/read-all` | All | — |
| `POST` | `/api/ai-predictions` | Customer | — |

---

## Authentication & Security

### JWT Configuration

```json
"JwtSettings": {
  "SecretKey": "minimum-32-character-secret-key-here",
  "Issuer": "Ser-Viscar",
  "Audience": "Ser-Viscar-Client",
  "ExpiryInMinutes": 480
}
```

### Token Claims

| Claim | Value |
|-------|-------|
| `NameIdentifier` | User ID (integer) |
| `Email` | User email |
| `Name` | Display name |
| `Role` | `Admin`, `Staff`, or `Customer` |

### Role Access Matrix

| Portal | Admin | Staff | Customer |
|--------|-------|-------|---------|
| Admin routes | Yes | No | No |
| Staff routes | Yes | Yes | No |
| Customer routes | No | No | Yes |

### Password Security

- Passwords hashed with BCrypt (work factor 11)
- Plaintext passwords never stored or logged
- App Passwords required for Gmail SMTP (not your Google account password)

---

## SMTP Email Setup

Feature 11 (invoice email) and Feature 15 (credit reminders) both require working SMTP.

### Step 1 — Enable Gmail 2-Factor Authentication

1. Visit [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

### Step 2 — Generate an App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and device **Windows Computer**
3. Copy the generated **16-character** password

### Step 3 — Update appsettings.json

```json
"SmtpSettings": {
  "Host": "smtp.gmail.com",
  "Port": 587,
  "Username": "your.email@gmail.com",
  "Password": "abcd efgh ijkl mnop",
  "FromName": "Ser-Viscar Service Centre"
}
```

> Remove spaces from the 16-character app password before pasting.

---

## Database Schema Overview

```
Users               id, name, email, passwordHash, phone, role, isActive, createdAt
Staff               id, userId(FK), employeeCode
Customers           id, userId(FK)
Vehicles            id, customerId(FK), vehicleNumber, brand, model, year, colour
Vendors             id, name, contactPerson, phone, email, address
Parts               id, vendorId(FK), name, sku, category, costPrice, sellingPrice,
                    stockQuantity, lowStockThreshold
PurchaseInvoices    id, adminId(FK), vendorId(FK), invoiceDate, totalAmount
PurchaseInvoiceItems id, purchaseInvoiceId(FK), partId(FK), quantity, unitCost
SalesInvoices       id, customerId(FK), staffId(FK), invoiceNumber, invoiceDate,
                    paymentType, subtotal, discountAmount, total
SalesInvoiceItems   id, salesInvoiceId(FK), partId(FK), quantity, unitPrice, subtotal
Appointments        id, customerId(FK), vehicleId(FK), appointmentDate, serviceType,
                    status, notes
PartRequests        id, customerId(FK), partName, description, quantityRequested,
                    status, requestedAt
Reviews             id, customerId(FK), rating, comment, reviewedAt
Notifications       id, type, message, recipientId(FK→Users), isRead, sentAt
AIPredictions       id, customerId(FK), vehicleId(FK), mileage, usagePattern,
                    symptoms, prediction, createdAt
```

---

## Project File Structure

```
V-Ser-Viscar/
├── README.md                          This file
├── README_FEATURES_9_11.md            Detailed docs for Features 9-11
│
├── Backend/
│   └── Ser_Backend/
│       ├── Controllers/
│       │   ├── AuthController.cs          Login, register
│       │   ├── UserController.cs          Admin user CRUD
│       │   ├── VendorController.cs        Vendor CRUD
│       │   ├── PartController.cs          Parts CRUD
│       │   ├── PurchaseInvoiceController.cs
│       │   ├── SalesInvoiceController.cs  Sales + email
│       │   ├── CustomerController.cs      Search + details
│       │   ├── CustomerActivityController.cs  Appointments, part requests, reviews
│       │   ├── StaffReportController.cs   Reports (Features 9-11)
│       │   ├── FinancialReportController.cs
│       │   ├── NotificationController.cs  Low stock + credit reminders
│       │   ├── BellNotificationController.cs  Real-time bell
│       │   └── AIPredictionController.cs
│       ├── Services/
│       │   ├── AuthService.cs
│       │   ├── VendorService.cs
│       │   ├── PartService.cs
│       │   ├── PurchaseInvoiceService.cs
│       │   ├── SalesInvoiceService.cs
│       │   ├── CustomerService.cs
│       │   ├── CustomerActivityService.cs
│       │   ├── StaffReportService.cs
│       │   ├── FinancialReportService.cs
│       │   ├── NotificationService.cs
│       │   ├── EmailService.cs
│       │   └── AIPredictionService.cs
│       ├── Models/
│       │   ├── User.cs
│       │   ├── Staff.cs
│       │   ├── Customer.cs
│       │   ├── Vehicle.cs
│       │   ├── Vendor.cs
│       │   ├── Part.cs
│       │   ├── PurchaseInvoice.cs / PurchaseInvoiceItem.cs
│       │   ├── SalesInvoice.cs / SalesInvoiceItem.cs
│       │   ├── Appointment.cs
│       │   ├── PartRequest.cs
│       │   ├── Review.cs
│       │   ├── Notification.cs
│       │   └── AIPrediction.cs
│       ├── DTO/                           Request/Response shapes
│       ├── Data/AppDbContext.cs            EF Core context
│       ├── Migrations/                    EF migration files
│       └── Program.cs                     Service registration + middleware
│
└── Frontend/
    └── src/
        ├── App.jsx                        All route definitions
        ├── App.css
        ├── main.jsx
        ├── Layouts/
        │   ├── AppLayout.jsx              Shared sidebar, bell, logout
        │   └── AdminLayout.css            Sidebar + bell styles
        ├── Pages/
        │   ├── Admin/
        │   │   ├── DashboardPage.jsx
        │   │   ├── FinancialReportPage.jsx
        │   │   ├── VendorPage.jsx
        │   │   ├── PartPage.jsx           Hover-only edit/delete
        │   │   ├── PurchaseInvoicePage.jsx
        │   │   ├── RegisterStaff.jsx      Full CRUD (Users)
        │   │   ├── NotificationsPage.jsx
        │   │   ├── AppointmentsPage.jsx   Shared with Staff
        │   │   └── PartRequestsManagementPage.jsx
        │   ├── Staff/
        │   │   ├── StaffDashboard.jsx
        │   │   ├── RegisterCustomer.jsx
        │   │   ├── AddVehicle.jsx
        │   │   ├── SearchCustomer.jsx     Feature 10
        │   │   ├── CustomerDetails.jsx    Feature 8
        │   │   ├── SalesInvoicePage.jsx   Feature 7 + 11
        │   │   └── CustomerReports.jsx    Feature 9
        │   ├── Customer/
        │   │   ├── CustomerDashboard.jsx
        │   │   ├── Register.jsx           Feature 12
        │   │   ├── Profile.jsx            Feature 12
        │   │   ├── Vehicles.jsx           Feature 12
        │   │   ├── Appointments.jsx       Feature 13
        │   │   ├── PartsRequest.jsx       Feature 13
        │   │   ├── Reviews.jsx            Feature 13
        │   │   ├── History.jsx            Feature 14
        │   │   └── Predictions.jsx        AI feature
        │   └── Auth/
        │       └── Login.jsx
        └── components/
            └── ProtectedRoute.jsx
```

---

## Build & Deployment

### Development Build Check

```bash
# Backend
cd Backend/Ser_Backend
dotnet build
# Expected: Build succeeded. 0 Warning(s). 0 Error(s).

# Frontend
cd Frontend
npx vite build
# Expected: ✓ built in ~1.5s  (chunk size warning is non-blocking)
```

### Production Considerations

1. **Environment variables** — Move `appsettings.json` secrets to environment variables or Azure Key Vault
2. **CORS** — Tighten `AllowAll` CORS policy to specific production origins
3. **HTTPS** — Enforce HTTPS in production (remove `app.UseHttpsRedirection()` redirect loop if behind a reverse proxy)
4. **Database** — Use connection string from environment, enable connection pooling
5. **Frontend** — Run `npm run build`, serve `dist/` from Nginx or Azure Static Web Apps
6. **Backend** — Publish with `dotnet publish -c Release`, host on Azure App Service or Docker

### Docker (optional)

```dockerfile
# Backend
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY ./publish .
ENTRYPOINT ["dotnet", "Ser_Backend.dll"]
```

---

## Known Limitations & Future Work

| Area | Current State | Improvement |
|------|--------------|-------------|
| Real-time notifications | 30-second polling | Replace with SignalR WebSocket hub |
| AI Predictions | Rule-based heuristic | Integrate ML.NET or Azure Cognitive Services |
| Image uploads | Not implemented | Add part/vendor image upload via Azure Blob Storage |
| Pagination | Client-side filtering | Add server-side pagination for large datasets |
| Audit log | Not implemented | Track all admin actions to an audit table |
| 2FA | Not implemented | Add TOTP-based two-factor authentication |
| Mobile | Responsive but not native | PWA or React Native companion app |

---

## Appendix — Error Response Format

All API errors return a consistent JSON envelope:

```json
{
  "message": "Human-readable error description"
}
```

HTTP status codes used:

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad request / validation error |
| `401` | Missing or invalid JWT token |
| `403` | Insufficient role permissions |
| `404` | Resource not found |
| `500` | Internal server error |

---

*Ser-Viscar — CS6004NT Group Coursework | Team-V | Built with ASP.NET Core 9 + React 19*
