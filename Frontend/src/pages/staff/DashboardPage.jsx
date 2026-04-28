// ═══════════════════════════════════════════════════════════════════
//  Dashboard Page — F9, F10, F11 Overview (Irshad)
// ═══════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    key: "search",
    feature: "F10",
    icon: "🔍",
    title: "Customer Search",
    description:
      "Find any customer instantly by name, phone number, customer ID, email, or vehicle license plate. Expandable rows show registered vehicles and purchase summaries.",
    bullets: [
      "Partial-match search (PostgreSQL ILike)",
      "Vehicle plate number lookup",
      "Purchase history aggregation",
      "Pending-credit flag per customer",
    ],
    color: "#0d6efd",
    lightBg: "#eff6ff",
    marks: 4,
    endpoint: "GET /api/customers/search?term=",
  },
  {
    key: "reports",
    feature: "F9",
    icon: "📊",
    title: "Customer Reports",
    description:
      "Generate three types of customer analytical reports. Identify top revenue drivers, repeat buyers, and customers with outstanding credit balances.",
    bullets: [
      "High Spenders — ranked by total spend",
      "Regular Customers — ranked by frequency",
      "Pending Credits — overdue flagging",
      "Summary stat cards per report",
    ],
    color: "#7c3aed",
    lightBg: "#f5f3ff",
    marks: 4,
    endpoint: "GET /api/reports/customers/high-spenders",
  },
  {
    key: "email",
    feature: "F11",
    icon: "📧",
    title: "Invoice Email",
    description:
      "Preview any sales invoice and send it to the customer via email. Supports custom messages, email overrides, and renders a professional HTML invoice template.",
    bullets: [
      "Full invoice preview with line items",
      "Professional HTML email template",
      "Custom message & email override",
      "Loyalty badge in email if applied",
    ],
    color: "#059669",
    lightBg: "#f0fdf4",
    marks: 4,
    endpoint: "POST /api/invoices/{id}/email",
  },
];

const QUICK_STATS = [
  { label: "Features Implemented", value: "3",    icon: "✅", color: "#059669" },
  { label: "API Endpoints",        value: "6",    icon: "🔌", color: "#0d6efd" },
  { label: "Total Marks",          value: "12",   icon: "🎯", color: "#7c3aed" },
  { label: "Backend Stack",        value: ".NET", icon: "⚙️",  color: "#374151" },
];

export default function DashboardPage({ onNavigate }) {
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" :
    now.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ animation: "fadeIn 0.3s ease both" }}>

      {/* ── Welcome Banner ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #0d6efd 60%, #6366f1 100%)",
          borderRadius: 16,
          padding: "32px 36px",
          marginBottom: 28,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", top: 20, right: 80, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "0 0 6px" }}>
          {greeting}, Irshad 👋
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
          Ser-Viscar Staff Portal
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: 0, maxWidth: 480 }}>
          Vehicle Parts Management System — CS6004NT Coursework 2.
          Your three features (F9, F10, F11) are live and ready to use.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          {["F9 Reports", "F10 Search", "F11 Email"].map((tag) => (
            <span
              key={tag}
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                padding: "4px 14px",
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {QUICK_STATS.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "18px 20px",
              borderTop: `3px solid ${stat.color}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                {stat.value}
              </div>
            </div>
            <span style={{ fontSize: 26, opacity: 0.3 }}>{stat.icon}</span>
          </div>
        ))}
      </div>

      {/* ── Section heading ── */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>
          Your Features
        </h2>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
          Click any card to open the feature
        </p>
      </div>

      {/* ── Feature Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.key} feature={f} index={i} onNavigate={onNavigate} />
        ))}
      </div>

      {/* ── API Quick Reference ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #f0f0f0",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18 }}>🔌</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>
              API Endpoints
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
              ASP.NET Core backend running on :5085
            </p>
          </div>
        </div>
        <div style={{ padding: "0" }}>
          {API_ENDPOINTS.map((ep, i) => (
            <div
              key={ep.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "13px 24px",
                borderBottom: i < API_ENDPOINTS.length - 1 ? "1px solid #f5f5f5" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span
                style={{
                  display: "inline-block",
                  minWidth: 44,
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textAlign: "center",
                  background: ep.method === "GET" ? "#dbeafe" : "#d1fae5",
                  color: ep.method === "GET" ? "#1e40af" : "#065f46",
                }}
              >
                {ep.method}
              </span>
              <code
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontFamily: "Consolas, 'Courier New', monospace",
                  color: "#374151",
                }}
              >
                {ep.path}
              </code>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: "#f3f4f6",
                  color: "#6b7280",
                  padding: "2px 8px",
                  borderRadius: 6,
                }}
              >
                {ep.feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Feature Card ── */
function FeatureCard({ feature: f, index, onNavigate }) {
  return (
    <div
      onClick={() => onNavigate(f.key)}
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #f0f0f0",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.18s, box-shadow 0.18s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        animationDelay: `${index * 0.07}s`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
      }}
    >
      {/* Color band */}
      <div style={{ height: 4, background: f.color }} />

      <div style={{ padding: "20px 22px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: f.lightBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            {f.icon}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: f.lightBg,
                color: f.color,
                padding: "3px 10px",
                borderRadius: 9999,
              }}
            >
              {f.feature}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                background: "#f0fdf4",
                color: "#059669",
                padding: "3px 8px",
                borderRadius: 9999,
              }}
            >
              {f.marks} marks
            </span>
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>
          {f.title}
        </h3>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 14px", lineHeight: 1.6 }}>
          {f.description}
        </p>

        {/* Bullets */}
        <ul style={{ margin: "0 0 18px", padding: 0, listStyle: "none" }}>
          {f.bullets.map((b) => (
            <li key={b} style={{ fontSize: 13, color: "#374151", marginBottom: 4, display: "flex", gap: 8 }}>
              <span style={{ color: f.color, marginTop: 1 }}>✓</span>
              {b}
            </li>
          ))}
        </ul>

        {/* Endpoint pill */}
        <code
          style={{
            display: "block",
            fontSize: 11.5,
            fontFamily: "Consolas, 'Courier New', monospace",
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: "6px 10px",
            color: "#475569",
            marginBottom: 16,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {f.endpoint}
        </code>

        {/* CTA */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            padding: "10px",
            borderRadius: 10,
            border: "none",
            background: f.color,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          onClick={(e) => { e.stopPropagation(); onNavigate(f.key); }}
        >
          Open {f.title} →
        </button>
      </div>
    </div>
  );
}

/* ── API endpoint list ── */
const API_ENDPOINTS = [
  { method: "GET",  path: "/api/customers/search?term={query}",           feature: "F10" },
  { method: "GET",  path: "/api/reports/customers/high-spenders?top=20",  feature: "F9"  },
  { method: "GET",  path: "/api/reports/customers/regulars?top=20",       feature: "F9"  },
  { method: "GET",  path: "/api/reports/customers/pending-credits",       feature: "F9"  },
  { method: "GET",  path: "/api/invoices/{id}/detail",                    feature: "F11" },
  { method: "POST", path: "/api/invoices/{id}/email",                     feature: "F11" },
];
