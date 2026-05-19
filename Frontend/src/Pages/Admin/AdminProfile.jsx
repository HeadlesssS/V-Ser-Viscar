import "./Admin.css";

export default function AdminProfile() {
  const raw = localStorage.getItem("name") || "";
  const name = raw && raw !== "undefined" ? raw : "Administrator";
  const initial = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const accentColor = "#cc1e1e";

  const CAPS = [
    {
      icon: "📊",
      label: "Financial Reports",
      desc: "Full access to daily, monthly and yearly reports",
    },
    {
      icon: "🔧",
      label: "Parts Catalog",
      desc: "Add, edit and deactivate vehicle parts",
    },
    {
      icon: "🏭",
      label: "Vendor Management",
      desc: "Manage vendor relationships and pricing",
    },
    {
      icon: "🧾",
      label: "Purchase Invoices",
      desc: "Create and track purchase orders from vendors",
    },
    {
      icon: "💵",
      label: "Sales Invoices",
      desc: "Full visibility into all sales transactions",
    },
    {
      icon: "👥",
      label: "Staff Management",
      desc: "Register, activate and deactivate staff accounts",
    },
    {
      icon: "📅",
      label: "Appointments",
      desc: "View and update all service appointments",
    },
    {
      icon: "📦",
      label: "Part Requests",
      desc: "Manage and fulfil all customer part requests",
    },
    {
      icon: "⭐",
      label: "Reviews",
      desc: "Monitor and delete customer reviews",
    },
    {
      icon: "🔔",
      label: "Notifications",
      desc: "System-wide notification management",
    },
  ];

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div className="ph-bc">Admin Panel › My Profile</div>
          <div className="ph-title">Admin Profile</div>
          <div className="ph-sub">
            System administrator account and full-access overview.
          </div>
        </div>
      </div>

      {/* ── Hero Card ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #1a0000 0%, #2d0a0a 50%, #1a0000 100%)",
          borderRadius: 20,
          padding: "32px 36px",
          marginBottom: 24,
          border: "1px solid rgba(204,30,30,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(204,30,30,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}15)`,
              border: `2.5px solid ${accentColor}50`,
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: `0 0 28px ${accentColor}30`,
            }}
          >
            {initial}
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#f8fafc",
                marginBottom: 8,
                letterSpacing: -0.5,
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  background: "rgba(204,30,30,0.25)",
                  color: "#fca5a5",
                  border: "1px solid rgba(252,165,165,0.3)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                👑 System Administrator
              </span>
              <span
                style={{
                  background: "rgba(26,122,58,0.2)",
                  color: "#86efac",
                  border: "1px solid rgba(134,239,172,0.25)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                ● Active
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                🔑 Full Access
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 12,
            marginTop: 28,
          }}
        >
          {[
            { label: "Role", value: "Admin" },
            { label: "Access Level", value: "Full" },
            { label: "Capabilities", value: `${CAPS.length}` },
            { label: "Status", value: "Active" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#f1f5f9",
                  marginBottom: 3,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Capabilities Grid ── */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#08060d",
              marginBottom: 3,
            }}
          >
            System Capabilities
          </div>
          <div style={{ fontSize: 13, color: "#6b6375" }}>
            Complete administrative control over all system functions
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 10,
          }}
        >
          {CAPS.map((c) => (
            <div
              key={c.label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                background: "#f7f7f8",
                border: "1px solid #e5e4e7",
                borderRadius: 10,
                padding: "12px 14px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fff5f5";
                e.currentTarget.style.borderColor = "rgba(204,30,30,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f7f7f8";
                e.currentTarget.style.borderColor = "#e5e4e7";
              }}
            >
              <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>
                {c.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#08060d",
                    marginBottom: 2,
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{ fontSize: 11, color: "#9c97a3", lineHeight: 1.4 }}
                >
                  {c.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
