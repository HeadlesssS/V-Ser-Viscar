import { useState } from "react";
import StaffLayout from "./components/layout/StaffLayout";
import DashboardPage from "./pages/staff/DashboardPage";
import CustomerSearchPage from "./pages/staff/CustomerSearchPage";
import CustomerReportsPage from "./pages/staff/CustomerReportsPage";
import InvoiceEmailPage from "./pages/staff/InvoiceEmailPage";
import "./styles/global.css";

// ═══════════════════════════════════════════════════════════════════
//  App Root — Staff Features Navigation (Irshad: F9, F10, F11)
//  ─────────────────────────────────────────────────────────────────
//  Uses the premium StaffLayout (dark sidebar + topbar).
//  Pages: Dashboard (default), CustomerSearch, CustomerReports,
//         InvoiceEmail.
//
//  TODO (All): When integrating with the full team, replace this
//  with react-router-dom routes. See route map in README.
//
//  Full Route Map:
//  /                        → Dashboard
//  /staff/customers/search  → Customer Search (Irshad - F10)  ✅
//  /staff/reports           → Customer Reports (Irshad - F9)  ✅
//  /staff/invoices/email    → Invoice Email (Irshad - F11)    ✅
//  /admin/staff             → Staff Management (Pawan - F2)
//  /admin/parts             → Parts Management (Chasita - F3)
//  /staff/sales             → Sell Parts (Chasita - F7)
//  /staff/customers/:id     → Customer Detail (Bhoj - F8)
//  /customer/appointments   → Appointments (Bhoj - F13)
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <StaffLayout activePage={activePage} onNavigate={setActivePage}>
      <PageRenderer activePage={activePage} onNavigate={setActivePage} />
    </StaffLayout>
  );
}

/* ── Renders the active page ── */
function PageRenderer({ activePage, onNavigate }) {
  switch (activePage) {
    case "dashboard":
      return <DashboardPage onNavigate={onNavigate} />;
    case "search":
      return <CustomerSearchPage />;
    case "reports":
      return <CustomerReportsPage />;
    case "email":
      return <InvoiceEmailPage />;
    default:
      return <DashboardPage onNavigate={onNavigate} />;
  }
}
