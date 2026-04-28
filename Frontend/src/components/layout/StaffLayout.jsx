// ═══════════════════════════════════════════════════════════════════
//  Staff Layout — Premium Sidebar + Topbar Shell
//  Used by: App.jsx to wrap all staff-facing pages
// ═══════════════════════════════════════════════════════════════════

const NAV_GROUPS = [
  {
    label: "Features",
    items: [
      { key: "dashboard", label: "Dashboard",         icon: "🏠", badge: null },
      { key: "search",    label: "Customer Search",   icon: "🔍", badge: "F10" },
      { key: "reports",   label: "Customer Reports",  icon: "📊", badge: "F9"  },
      { key: "email",     label: "Invoice Email",     icon: "📧", badge: "F11" },
    ],
  },
  {
    label: "Team Features (Coming Soon)",
    items: [
      { key: null, label: "Staff Management",    icon: "👤", badge: "F2",  disabled: true },
      { key: null, label: "Parts & Inventory",   icon: "🔩", badge: "F3",  disabled: true },
      { key: null, label: "Sales Invoices",      icon: "🧾", badge: "F7",  disabled: true },
      { key: null, label: "Appointments",        icon: "📅", badge: "F13", disabled: true },
    ],
  },
];

export default function StaffLayout({ activePage, onNavigate, children }) {
  return (
    <div className="layout-root">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #0d6efd, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🚗
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.3px",
              }}
            >
              Ser-Viscar
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
              Vehicle Parts System
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="sidebar-section-label">{group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.key ?? item.label}
                  className={`sidebar-item${activePage === item.key ? " active" : ""}${item.disabled ? " disabled" : ""}`}
                  onClick={() => !item.disabled && item.key && onNavigate(item.key)}
                  disabled={item.disabled}
                  style={item.disabled ? { opacity: 0.45, cursor: "not-allowed" } : {}}
                  title={item.disabled ? "Coming soon — teammate feature" : undefined}
                >
                  <span className="item-icon">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span className="item-badge">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0d6efd, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              IR
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                Irshad
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Staff Member</div>
            </div>
          </div>

          {/* App version */}
          <div
            style={{
              marginTop: 10,
              padding: "6px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 11, color: "#475569" }}>CS6004NT CW2</span>
            <span
              style={{
                fontSize: 10,
                background: "rgba(13,110,253,0.25)",
                color: "#93c5fd",
                padding: "2px 7px",
                borderRadius: 9999,
                fontWeight: 600,
              }}
            >
              v1.0
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          {/* Breadcrumb / page title */}
          <PageTitle activePage={activePage} />

          {/* Right side: actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Backend status indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 20,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                fontSize: 12,
                color: "#065f46",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "inline-block",
                  animation: "pulse 2s ease infinite",
                }}
              />
              API :5085
            </div>

            {/* User avatar */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0d6efd, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(13,110,253,0.3)",
              }}
              title="Irshad — Staff"
            >
              IR
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content animate-fadeIn">{children}</main>

        {/* Footer */}
        <footer
          style={{
            padding: "16px 32px",
            borderTop: "1px solid #f0f0f0",
            fontSize: 12,
            color: "#9ca3af",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Ser-Viscar Vehicle Parts Management System</span>
          <span>CS6004NT Coursework 2 — Irshad (F9, F10, F11)</span>
        </footer>
      </div>
    </div>
  );
}

/* ── Page Title Component ── */
const PAGE_TITLES = {
  dashboard: { title: "Dashboard",        subtitle: "Overview of your features",            icon: "🏠" },
  search:    { title: "Customer Search",  subtitle: "Find customers by name, phone or plate", icon: "🔍" },
  reports:   { title: "Customer Reports", subtitle: "High spenders, regulars & credits",     icon: "📊" },
  email:     { title: "Invoice Email",    subtitle: "Preview and send invoices via email",   icon: "📧" },
};

function PageTitle({ activePage }) {
  const info = PAGE_TITLES[activePage] ?? PAGE_TITLES.dashboard;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {info.icon}
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
          {info.title}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>{info.subtitle}</div>
      </div>
    </div>
  );
}
