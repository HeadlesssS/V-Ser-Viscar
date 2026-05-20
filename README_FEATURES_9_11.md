# 🚗 Ser-Viscar Vehicle Center — Features 9–11

> **Vehicle Parts Selling & Inventory Management System**
> CS6004 Application Development Coursework · Features 9, 10 & 11 of 16

---

![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-EF_Core-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![SMTP](https://img.shields.io/badge/Email-SMTP_Gmail-EA4335?style=for-the-badge&logo=gmail&logoColor=white)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Coursework Context](#-coursework-context)
3. [Tech Stack](#-tech-stack)
4. [Architecture Overview](#-architecture-overview)
5. [Feature 9 — Staff: Generate Customer Reports](#-feature-9--staff-generate-customer-reports)
   - [Overview](#feature-9-overview)
   - [API Endpoints](#feature-9-api-endpoints)
   - [Response Schemas](#feature-9-response-schemas)
   - [Frontend](#feature-9-frontend)
   - [Key Files](#feature-9-key-files)
6. [Feature 10 — Staff: Search Customers](#-feature-10--staff-search-customers)
   - [Overview](#feature-10-overview)
   - [API Endpoint](#feature-10-api-endpoint)
   - [Search Modes](#feature-10-search-modes)
   - [Response Schema](#feature-10-response-schema)
   - [Frontend](#feature-10-frontend)
   - [Key Files](#feature-10-key-files)
7. [Feature 11 — Staff: Send Invoice Email](#-feature-11--staff-send-invoice-email)
   - [Overview](#feature-11-overview)
   - [API Endpoint](#feature-11-api-endpoint)
   - [Email Template Structure](#email-template-structure)
   - [Frontend](#feature-11-frontend)
   - [Key Files](#feature-11-key-files)
8. [SMTP Configuration & Setup](#-smtp-configuration--setup)
9. [Authentication & Authorization](#-authentication--authorization)
10. [Complete File Reference](#-complete-file-reference)
11. [Screenshots](#-screenshots)
12. [Error Handling](#-error-handling)
13. [Credits](#-credits)

---

## 🌐 Project Overview

**Ser-Viscar Vehicle Center** is a full-stack web application designed to streamline the day-to-day operations of a vehicle parts retail business. The system handles inventory management, customer records, sales invoicing, loyalty programmes, and staff tooling — all under a secure JWT-authenticated role-based architecture.

Features 9 through 11 represent the **Staff Intelligence & Communication** tier of the application, enabling staff members to gain data-driven insights into customer behaviour, rapidly locate customer records, and deliver branded invoice communications directly to customers via email.

### Base URL

```
http://localhost:5173
```

---

## 🎓 Coursework Context

| Field | Detail |
|---|---|
| **Module** | CS6004 — Application Development |
| **Project Title** | Vehicle Parts Selling & Inventory Management System |
| **Total Features** | 16 |
| **This Document Covers** | Features 9, 10, and 11 |
| **Feature Group** | Staff Intelligence & Communication |
| **Backend Framework** | ASP.NET Core Web API (.NET 9) |
| **Frontend Framework** | React 19 + Vite |
| **Database** | PostgreSQL (via EF Core + Npgsql) |

These three features are tightly coupled in purpose: **Feature 9** gives staff the ability to generate business intelligence reports on customer spending and credit, **Feature 10** provides real-time customer search so staff can quickly access records mid-transaction, and **Feature 11** completes the customer interaction loop by dispatching professional HTML invoices straight to the customer's inbox.

---

## 🛠 Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | .NET 9 |
| Framework | ASP.NET Core Web API |
| ORM | Entity Framework Core 9 |
| Database Driver | Npgsql (PostgreSQL) |
| Authentication | JWT Bearer Tokens |
| Email | System.Net.Mail (SmtpClient) |
| Architecture | Repository → Service → Controller |

### Frontend

| Layer | Technology |
|---|---|
| Library | React 19 |
| Build Tool | Vite |
| Routing | React Router DOM v7 |
| HTTP Client | Fetch API (custom wrapper) |
| Styling | Custom CSS (no external UI frameworks) |
| State | React Hooks (`useState`, `useEffect`, `useRef`) |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│                                                             │
│  /staff/customer-reports   ──►  CustomerReports.jsx         │
│  /staff/search-customer    ──►  SearchCustomer.jsx          │
│  /staff/customer-details   ──►  CustomerDetails.jsx         │
│  /staff/sales-invoices     ──►  SalesInvoicePage.jsx        │
└───────────────────────┬─────────────────────────────────────┘
                        │  HTTP/JSON  (JWT Bearer)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   ASP.NET Core Web API                       │
│                                                             │
│  StaffReportController   ──►  StaffReportService            │
│  CustomerController      ──►  CustomerService               │
│  SalesInvoiceController  ──►  SalesInvoiceService           │
│                               EmailService                  │
└───────────────────────┬─────────────────────────────────────┘
                        │  EF Core / Npgsql
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                       PostgreSQL                             │
│                                                             │
│  Users · Customers · Invoices · InvoiceItems · Vehicles     │
└─────────────────────────────────────────────────────────────┘
                        │  SmtpClient
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Gmail SMTP (smtp.gmail.com:587)                │
└─────────────────────────────────────────────────────────────┘
```

All three features share the same authentication middleware pipeline. Every request to the endpoints below must carry a valid JWT token issued to a user with the **Admin** or **Staff** role.

---

## 📊 Feature 9 — Staff: Generate Customer Reports

### Feature 9 Overview

Staff members can generate three distinct business intelligence reports from a single, tabbed dashboard. Reports are fetched fresh on each tab activation or manual refresh, and are designed for operational use — helping identify top customers for loyalty incentives, track repeat buyers, and flag overdue credit accounts.

**Frontend Route:** `/staff/customer-reports`
**API Base Path:** `/api/staff-reports`

---

### Feature 9 API Endpoints

| # | Method | Endpoint | Auth Required | Description |
|---|--------|----------|---------------|-------------|
| 1 | `GET` | `/api/staff-reports/high-spenders` | Admin / Staff JWT | Top N customers by total amount spent |
| 2 | `GET` | `/api/staff-reports/regular-customers` | Admin / Staff JWT | Top N customers by invoice frequency |
| 3 | `GET` | `/api/staff-reports/pending-credits` | Admin / Staff JWT | All customers with outstanding credit balances |

---

#### `GET /api/staff-reports/high-spenders`

Returns the top N customers ranked by their lifetime `TotalSpent`, descending. Useful for identifying VIP customers and targeting loyalty tier upgrades.

**Query Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `top` | `integer` | No | `20` | Maximum number of customers to return |

**Request Example**

```
GET /api/staff-reports/high-spenders?top=10
Authorization: Bearer <jwt_token>
```

**Response — `200 OK`**

```
[
  {
    "id": 3,
    "fullName": "Aisha Noor",
    "email": "aisha@example.com",
    "phone": "0771234567",
    "totalSpent": 87500.00,
    "loyaltyTier": "Platinum",
    "invoiceCount": 14
  },
  ...
]
```

---

#### `GET /api/staff-reports/regular-customers`

Returns the top N customers ranked by invoice count descending. Highlights your most frequent buyers regardless of spend amount.

**Query Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `top` | `integer` | No | `20` | Maximum number of customers to return |

**Request Example**

```
GET /api/staff-reports/regular-customers?top=20
Authorization: Bearer <jwt_token>
```

**Response — `200 OK`**

```
[
  {
    "id": 7,
    "fullName": "Rayan Malik",
    "email": "rayan@example.com",
    "phone": "0779876543",
    "invoiceCount": 22,
    "totalSpent": 43200.00,
    "lastPurchaseDate": "2025-06-10T14:32:00"
  },
  ...
]
```

---

#### `GET /api/staff-reports/pending-credits`

Returns all customers who currently have a `CreditBalance > 0`, ordered by `OverdueDays` descending (longest overdue first). This report is essential for accounts-receivable follow-up.

**Query Parameters**

_None_

**Request Example**

```
GET /api/staff-reports/pending-credits
Authorization: Bearer <jwt_token>
```

**Response — `200 OK`**

```
[
  {
    "id": 12,
    "fullName": "Omar Farooq",
    "email": "omar@example.com",
    "phone": "0762345678",
    "creditBalance": 12500.00,
    "oldestUnpaidDate": "2025-03-15T09:00:00",
    "overdueDays": 97
  },
  ...
]
```

---

### Feature 9 Response Schemas

#### `HighSpenderDto`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Customer ID |
| `fullName` | `string` | Customer's full name |
| `email` | `string` | Registered email address |
| `phone` | `string` | Contact phone number |
| `totalSpent` | `decimal` | Lifetime total spend in Rs |
| `loyaltyTier` | `string` | `Standard` / `Gold` / `Platinum` |
| `invoiceCount` | `int` | Total number of invoices |

#### `RegularCustomerDto`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Customer ID |
| `fullName` | `string` | Customer's full name |
| `email` | `string` | Registered email address |
| `phone` | `string` | Contact phone number |
| `invoiceCount` | `int` | Total number of invoices |
| `totalSpent` | `decimal` | Lifetime total spend in Rs |
| `lastPurchaseDate` | `DateTime?` | Date and time of most recent invoice |

#### `PendingCreditDto`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Customer ID |
| `fullName` | `string` | Customer's full name |
| `email` | `string` | Registered email address |
| `phone` | `string` | Contact phone number |
| `creditBalance` | `decimal` | Total outstanding credit balance in Rs |
| `oldestUnpaidDate` | `DateTime?` | Date of the oldest unpaid credit invoice |
| `overdueDays` | `int` | Days elapsed since oldest unpaid invoice |

---

### Feature 9 Frontend

The report dashboard is a single React page (`/staff/customer-reports`) with three tabs:

| Tab | Report | Sorted By |
|-----|--------|-----------|
| 🏆 High Spenders | Customers by total spend | `totalSpent` desc |
| 🔁 Regular Customers | Customers by purchase frequency | `invoiceCount` desc |
| ⚠️ Pending Credits | Customers with credit balance | `overdueDays` desc |

**UI Highlights**

- **Medal Icons** — 🥇 Gold, 🥈 Silver, 🥉 Bronze medals automatically rendered for the top 3 entries in the High Spenders and Regular Customers tabs.
- **Loyalty Tier Badges** — Colour-coded inline badges:
  - 🔵 `Standard` — default blue
  - 🟡 `Gold` — amber/gold
  - ⚪ `Platinum` — silver/platinum gradient
- **Rs Formatting** — All monetary values are formatted as `Rs X,XXX.XX` using the Sri Lankan locale.
- **Overdue Highlighting** — In the Pending Credits tab, any customer with `overdueDays > 30` receives a red-highlighted row and an **Overdue** badge.
- **Stats Row** — Displays aggregate metrics (total records shown, combined balance, etc.) above the table.
- **Refresh Button** — Re-fetches the active report from the API without a full page reload.
- **Loading & Empty States** — Skeleton/spinner during fetch; friendly empty-state message when no records match.

---

### Feature 9 Key Files

#### Backend

| File | Purpose |
|------|---------|
| `DTO/StaffReport/StaffReportDto.cs` | Defines `HighSpenderDto`, `RegularCustomerDto`, and `PendingCreditDto` |
| `Services/StaffReportService.cs` | Implements `GetHighSpendersAsync`, `GetRegularCustomersAsync`, `GetPendingCreditsAsync` with EF Core LINQ queries |
| `Controllers/StaffReportController.cs` | Exposes the three GET endpoints under `/api/staff-reports` |

#### Frontend

| File | Purpose |
|------|---------|
| `Pages/Staff/CustomerReports.jsx` | Full 3-tab report page with medals, badges, stats row, and all UI states |

---

## 🔍 Feature 10 — Staff: Search Customers

### Feature 10 Overview

A real-time customer search tool that allows staff to instantly locate customer records during a sales transaction or support interaction, without navigating away from their current workflow. Searches are debounced at 400 ms to avoid hammering the API on every keystroke.

**Frontend Route:** `/staff/search-customer`
**API Endpoint:** `GET /api/customers/search`

---

### Feature 10 API Endpoint

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/customers/search` | Admin / Staff JWT | Search active customers by name, phone, ID, or vehicle number |

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | `string` | Yes | The search query string |
| `by` | `string` | Yes | Search mode: `name`, `phone`, `id`, or `vehicle` |

**Request Example**

```
GET /api/customers/search?q=Aisha&by=name
Authorization: Bearer <jwt_token>
```

---

### Feature 10 Search Modes

| Mode (`by=`) | Field Searched | Match Strategy | Notes |
|---|---|---|---|
| `name` | `User.Name` | Case-insensitive `CONTAINS` | Partial match anywhere in name |
| `phone` | `User.Phone` | `CONTAINS` | Partial match; no formatting required |
| `id` | `Customer.Id` | Exact integer match | Must be a valid integer |
| `vehicle` | `Vehicle.VehicleNumber` | Case-insensitive `CONTAINS` (via `EXISTS` subquery) | Matches any vehicle linked to the customer |

> **Implementation note:** The `vehicle` mode uses a SQL `EXISTS` subquery rather than a `JOIN` to avoid duplicating customer records when a single customer has multiple vehicles registered.

Only **active** customers (i.e., those whose linked `User` record is not deactivated) are returned in search results.

---

### Feature 10 Response Schema

**Response — `200 OK`**

```
[
  {
    "id": 5,
    "userId": 9,
    "userName": "Aisha Noor",
    "email": "aisha@example.com",
    "phone": "0771234567",
    "loyaltyTier": "Gold",
    "totalSpent": 45600.00,
    "creditBalance": 0.00
  },
  ...
]
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Customer record ID |
| `userId` | `int` | Linked user account ID |
| `userName` | `string` | Customer's display name |
| `email` | `string` | Email address |
| `phone` | `string` | Phone number |
| `loyaltyTier` | `string` | `Standard` / `Gold` / `Platinum` |
| `totalSpent` | `decimal` | Lifetime spend in Rs |
| `creditBalance` | `decimal` | Current outstanding credit balance in Rs |

---

### Feature 10 Frontend

The search page (`/staff/search-customer`) is built around four mode-toggle buttons that switch the active search dimension without clearing the query input.

**Mode Toggle Buttons**

| Button | Icon | Search Mode |
|--------|------|-------------|
| Name | 👤 | `by=name` |
| Phone | 📞 | `by=phone` |
| ID | # | `by=id` |
| Vehicle Number | 🚗 | `by=vehicle` |

**UI Features**

- **Debounced Search (400 ms)** — Results update automatically as the user types, without triggering a request on every character. The debounce timer resets when the search mode changes.
- **Premium Result Cards** — Each matching customer is rendered as a card containing:
  - Initials avatar (generated from `userName`)
  - Full name, email, and phone
  - Loyalty tier badge (colour-coded)
  - Credit balance warning (if `creditBalance > 0`)
  - **👁 View Details** button
- **Navigation** — Clicking **👁 View Details** navigates to `/staff/customer-details?id={customerId}`, passing the customer ID as a URL search parameter.
- **Loading State** — Spinner shown while fetch is in progress.
- **Empty / No Query State** — Friendly prompt displayed when the search box is empty or returns no results.

---

### Feature 10 Key Files

#### Backend

| File | Purpose |
|------|---------|
| `Services/CustomerService.cs` | Adds `SearchCustomersAsync(string query, string searchBy)` with EF Core queries and EXISTS subquery for vehicle search |
| `Controllers/CustomerController.cs` | Adds `GET /api/customers/search` endpoint wired to `SearchCustomersAsync` |

#### Frontend

| File | Purpose |
|------|---------|
| `Pages/Staff/SearchCustomer.jsx` | Full search page with debounced input, 4-mode toggle, premium cards, and navigation |
| `Pages/Staff/CustomerDetails.jsx` | Upgraded to read `?id=` from URL search params, with premium detail UI |

---

## 📧 Feature 11 — Staff: Send Invoice Email

### Feature 11 Overview

Staff can dispatch a branded HTML invoice email directly to a customer's registered email address in a single click. The email is generated server-side from the live invoice data and sent through Gmail SMTP. Once sent, the invoice record is flagged as `EmailSent = true`, preventing accidental re-sends and providing a clear audit trail.

**Frontend Route:** `/staff/sales-invoices` (integrated into existing invoice list)
**API Endpoint:** `POST /api/sales-invoices/{id}/send-email`

---

### Feature 11 API Endpoint

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/sales-invoices/{id}/send-email` | Admin / Staff JWT | Send a professional HTML invoice email to the customer |

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `int` | Yes | The invoice ID to send |

**Request Example**

```
POST /api/sales-invoices/42/send-email
Authorization: Bearer <jwt_token>
Content-Length: 0
```

**Response — `200 OK`**

```
{
  "message": "Invoice email sent successfully for invoice #42."
}
```

**Error Responses**

| Status | Scenario |
|--------|----------|
| `404 Not Found` | Invoice ID does not exist |
| `400 Bad Request` | Customer has no registered email address |
| `500 Internal Server Error` | SMTP connection or send failure |

---

### Email Template Structure

The HTML email is fully constructed server-side by `EmailService.cs`. It is a self-contained HTML document with inline CSS for maximum email client compatibility.

```
┌──────────────────────────────────────────────────────────┐
│          🚗  SER-VISCAR VEHICLE CENTER                    │
│              (Dark Navy Branding Header)                  │
├──────────────────────────────────────────────────────────┤
│  Invoice #42           │  Date: 2025-06-15                │
│  Staff: John Silva     │  Status: [PAID] / [CREDIT]       │
├──────────────────────────────────────────────────────────┤
│  ITEMS TABLE                                              │
│  Part Name · SKU · Qty · Unit Price (Rs) · Line Total    │
│  ─────────────────────────────────────────────────────── │
│  Brake Pad Set   BP-204   2   Rs 3,500   Rs 7,000        │
│  Engine Oil 5W30 OIL-55W  3   Rs 1,200   Rs 3,600        │
├──────────────────────────────────────────────────────────┤
│  Subtotal                              Rs 10,600          │
│  Loyalty Discount (10%)               − Rs 1,060  ✨     │
│  GRAND TOTAL                          Rs  9,540  ★       │
├──────────────────────────────────────────────────────────┤
│  ⚠️  CREDIT NOTICE (shown only if status = Credit)       │
│  This invoice is currently unpaid. Please settle         │
│  your balance at your earliest convenience.              │
├──────────────────────────────────────────────────────────┤
│  🎉 LOYALTY CONGRATULATIONS BANNER                       │
│  (shown only when loyalty discount was applied)          │
└──────────────────────────────────────────────────────────┘
```

**Conditional Sections**

| Section | Condition |
|---------|-----------|
| **Paid badge** (green) | Invoice `PaymentStatus == "Paid"` |
| **Credit badge** (red) | Invoice `PaymentStatus == "Credit"` |
| **Loyalty discount row** | Subtotal exceeds Rs 5,000 (10% discount applied) |
| **Credit warning notice** | Invoice `PaymentStatus == "Credit"` |
| **Loyalty congratulations banner** | Loyalty discount was applied |

---

### Feature 11 Frontend

The email functionality is embedded directly into the existing Sales Invoices page (`/staff/sales-invoices`) to keep the workflow seamless.

**Per-Invoice Email Button**

Each invoice card in the list displays a `📧 Email` button alongside the existing action buttons. The button cycles through three visual states:

| State | Appearance | Condition |
|-------|-----------|-----------|
| **Ready** | `📧 Email` (default style) | Email has not been sent yet |
| **Sending** | `⏳ Sending…` (disabled, muted) | SMTP request in flight |
| **Sent** | `✓ Sent` (green, disabled) | `EmailSent == true` on invoice |

- The button is **disabled** immediately on click to prevent double-sends during the async operation.
- On success, the button transitions to the green **✓ Sent** state and remains disabled for the session (idempotent UI).
- On error, the button reverts to the **Ready** state and a toast/alert displays the error message.

**Invoice Detail Modal — Email Status Panel**

When viewing the full invoice detail modal, an **Email Status** panel is rendered at the bottom, showing:

- Whether the email has previously been sent (`EmailSent` flag)
- A send button (if not yet sent) or a confirmation badge (if already sent)

---

### Feature 11 Key Files

#### Backend

| File | Purpose |
|------|---------|
| `Services/EmailService.cs` | Builds the full HTML email string and dispatches it via `SmtpClient`; reads SMTP config from `IConfiguration` |
| `Services/SalesInvoiceService.cs` | Adds `SendInvoiceEmailAsync(int invoiceId)` — loads invoice with items + customer email, calls `EmailService`, sets `EmailSent = true` |
| `Controllers/SalesInvoiceController.cs` | Adds `POST /api/sales-invoices/{id}/send-email` endpoint |
| `appsettings.json` | `SmtpSettings` section (host, port, SSL, credentials) |
| `Program.cs` | Registers `StaffReportService` and `EmailService` as scoped/singleton dependencies |

#### Frontend

| File | Purpose |
|------|---------|
| `Pages/Staff/SalesInvoicePage.jsx` | Adds `📧 Email` button with three-state UI, email status panel in detail modal |

---

## ⚙️ SMTP Configuration & Setup

Feature 11 requires a valid SMTP configuration to dispatch invoice emails. The recommended approach for development and small-scale deployment is **Gmail with an App Password**.

### Step 1 — Configure `appsettings.json`

Add the following section to your `appsettings.json` (located in the backend project root):

```
"SmtpSettings": {
  "Host": "smtp.gmail.com",
  "Port": "587",
  "EnableSsl": "true",
  "Username": "your-gmail@gmail.com",
  "Password": "your-16-char-app-password",
  "FromName": "Ser-Viscar Vehicle Center"
}
```

> ⚠️ **Security Warning:** Never commit real credentials to source control. Use `appsettings.Development.json` (which is `.gitignore`'d) or environment variables / user secrets for production deployments.

### Step 2 — Generate a Gmail App Password

Gmail requires an **App Password** rather than your regular account password when using SMTP from code. Follow these steps:

1. Go to your Google Account: [myaccount.google.com](https://myaccount.google.com)
2. Navigate to **Security** → **2-Step Verification** — ensure it is **enabled**
3. Under **2-Step Verification**, scroll down to **App passwords**
4. Click **App passwords** (direct link: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords))
5. Select app: **Mail** | Select device: **Other (Custom name)** → type `Ser-Viscar`
6. Click **Generate** — copy the **16-character password** shown
7. Paste this password into the `Password` field in `appsettings.json`

### Step 3 — SMTP Configuration Reference

| Setting | Development Value | Notes |
|---------|-------------------|-------|
| `Host` | `smtp.gmail.com` | Gmail SMTP server |
| `Port` | `587` | STARTTLS port (recommended) |
| `EnableSsl` | `true` | Required for port 587 |
| `Username` | `yourname@gmail.com` | Must match the Gmail account |
| `Password` | `xxxx xxxx xxxx xxxx` | 16-char App Password (no spaces) |
| `FromName` | `Ser-Viscar Vehicle Center` | Display name shown in email client |

### Alternative SMTP Providers

If Gmail is not suitable, the `SmtpSettings` section works with any SMTP provider. Common alternatives:

| Provider | Host | Port |
|----------|------|------|
| Outlook / Hotmail | `smtp.office365.com` | `587` |
| Yahoo Mail | `smtp.mail.yahoo.com` | `587` |
| Mailtrap (testing) | `sandbox.smtp.mailtrap.io` | `2525` |
| SendGrid | `smtp.sendgrid.net` | `587` |

---

## 🔐 Authentication & Authorization

All endpoints introduced in Features 9, 10, and 11 are protected by JWT Bearer authentication and require the **Admin** or **Staff** role claim.

### Required JWT Claims

| Claim | Required Value |
|-------|---------------|
| `role` | `Admin` OR `Staff` |

### How to Obtain a Token

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "staff@serviscar.com",
  "password": "your-password"
}
```

The response will include a `token` field. Pass this in the `Authorization` header for all subsequent requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Matrix

| Endpoint | Customer | Staff | Admin |
|----------|----------|-------|-------|
| `GET /api/staff-reports/high-spenders` | ❌ | ✅ | ✅ |
| `GET /api/staff-reports/regular-customers` | ❌ | ✅ | ✅ |
| `GET /api/staff-reports/pending-credits` | ❌ | ✅ | ✅ |
| `GET /api/customers/search` | ❌ | ✅ | ✅ |
| `POST /api/sales-invoices/{id}/send-email` | ❌ | ✅ | ✅ |

---

## 📁 Complete File Reference

### Backend Files

| File | Status | Feature | Description |
|------|--------|---------|-------------|
| `DTO/StaffReport/StaffReportDto.cs` | 🆕 Created | 9 | DTOs: `HighSpenderDto`, `RegularCustomerDto`, `PendingCreditDto` |
| `Services/StaffReportService.cs` | 🆕 Created | 9 | Service: `GetHighSpendersAsync`, `GetRegularCustomersAsync`, `GetPendingCreditsAsync` |
| `Controllers/StaffReportController.cs` | 🆕 Created | 9 | Controller: 3 report GET endpoints |
| `Services/EmailService.cs` | 🆕 Created | 11 | HTML email builder + `SmtpClient` dispatcher |
| `Services/SalesInvoiceService.cs` | ✏️ Modified | 11 | Added `SendInvoiceEmailAsync`; added `CustomerEmail` to `MapToDto` |
| `Controllers/SalesInvoiceController.cs` | ✏️ Modified | 11 | Added `POST /api/sales-invoices/{id}/send-email` |
| `Services/CustomerService.cs` | ✏️ Modified | 10 | Added `SearchCustomersAsync(query, searchBy)` |
| `Controllers/CustomerController.cs` | ✏️ Modified | 10 | Added `GET /api/customers/search` endpoint |
| `Program.cs` | ✏️ Modified | 9, 11 | Registered `StaffReportService`, `EmailService` with DI container |
| `appsettings.json` | ✏️ Modified | 11 | Added `SmtpSettings` configuration section |

### Frontend Files

| File | Status | Feature | Description |
|------|--------|---------|-------------|
| `Pages/Staff/CustomerReports.jsx` | 🆕 Created | 9 | 3-tab report dashboard (high spenders, regular, pending credits) |
| `Pages/Staff/SearchCustomer.jsx` | 🆕 Created | 10 | Debounced real-time customer search with 4 mode toggles |
| `Pages/Staff/CustomerDetails.jsx` | ✏️ Modified | 10 | Reads `?id=` from URL search params; upgraded to premium detail UI |
| `Pages/Staff/SalesInvoicePage.jsx` | ✏️ Modified | 11 | Added `📧 Email` button with 3-state UI + email status panel |

---

## 📸 Screenshots

> _Screenshots will be added upon UI finalisation. The following sections describe expected visual output._

### Feature 9 — Customer Reports Dashboard

| Screenshot | Description |
|------------|-------------|
| `screenshots/f9-high-spenders.png` | High Spenders tab showing top 10 customers with 🥇🥈🥉 medals and Platinum/Gold badges |
| `screenshots/f9-regular-customers.png` | Regular Customers tab with invoice count rankings and last purchase dates |
| `screenshots/f9-pending-credits.png` | Pending Credits tab with overdue row highlighting and red "Overdue" badges |

### Feature 10 — Customer Search

| Screenshot | Description |
|------------|-------------|
| `screenshots/f10-search-name.png` | Name search showing initials avatars and loyalty tier badges on result cards |
| `screenshots/f10-search-vehicle.png` | Vehicle number search returning matching customer card with credit balance warning |
| `screenshots/f10-customer-details.png` | Customer detail view loaded via `?id=` URL param |

### Feature 11 — Send Invoice Email

| Screenshot | Description |
|------------|-------------|
| `screenshots/f11-email-button.png` | Invoice card list with `📧 Email` button in default state |
| `screenshots/f11-sending-state.png` | Button mid-send showing `⏳ Sending…` disabled state |
| `screenshots/f11-sent-state.png` | Button after successful send showing green `✓ Sent` |
| `screenshots/f11-email-preview.png` | Rendered HTML email with dark navy header, items table, and loyalty banner |

---

## 🚨 Error Handling

### Backend

All controllers use standard ASP.NET Core HTTP response codes:

| Scenario | HTTP Status | Response Body |
|----------|-------------|---------------|
| Missing / invalid JWT | `401 Unauthorized` | (empty) |
| Insufficient role | `403 Forbidden` | (empty) |
| Resource not found | `404 Not Found` | `{ "message": "..." }` |
| Invalid query parameter | `400 Bad Request` | `{ "message": "..." }` |
| SMTP failure | `500 Internal Server Error` | `{ "message": "Failed to send email: ..." }` |
| Unexpected exception | `500 Internal Server Error` | `{ "message": "An unexpected error occurred." }` |

### Frontend

| Scenario | UI Behaviour |
|----------|-------------|
| Network error (reports/search) | Error alert displayed; previous results cleared |
| Email send failure | Button reverts to Ready state; error message shown |
| No results returned | Friendly empty-state message/illustration |
| Loading in progress | Spinner or disabled button to prevent duplicate requests |

---

## 👤 Credits

| Role | Name |
|------|------|
| **Developer** | Md Irshad Aalam |
| **Module** | CS6004 — Application Development |
| **Features Documented** | 9 (Customer Reports), 10 (Search Customers), 11 (Send Invoice Email) |
| **Total Project Features** | 16 |
| **Backend Stack** | ASP.NET Core Web API · .NET 9 · EF Core · PostgreSQL |
| **Frontend Stack** | React 19 · Vite · React Router DOM |

---

<div align="center">

**Ser-Viscar Vehicle Center** — Vehicle Parts Selling & Inventory Management System

*CS6004 Application Development Coursework*

---

Built with ❤️ using .NET 10 + React 19

</div>
