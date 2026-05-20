import "../Admin/Admin.css";

export default function StaffProfile() {
  const raw = localStorage.getItem("name") || "";
  const name = raw && raw !== "undefined" ? raw : "Staff Member";
  const initial = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const accentColor = "#1a4faa";

  const CAPS = [
    {
      icon: "👤",
      label: "Register Customers",
      desc: "Onboard new customers into the system",
    },
    {
      icon: "🚗",
      label: "Manage Vehicles",
      desc: "Add and link vehicles to customer profiles",
    },
    {
      icon: "🔍",
      label: "Search Records",
      desc: "Find customers by name, phone, ID or plate",
    },
    {
      icon: "💳",
      label: "Sales Invoices",
      desc: "Create and send sales invoices to customers",
    },
    {
      icon: "📅",
      label: "Appointments",
      desc: "Schedule and manage service appointments",
    },
    {
      icon: "📦",
      label: "Part Requests",
      desc: "Review and fulfil customer part requests",
    },
    {
      icon: "📊",
      label: "Customer Reports",
      desc: "View spending reports and loyalty tiers",
    },
    {
      icon: "⭐",
      label: "Reviews",
      desc: "Read and moderate customer reviews",
    },
  ];

  return (
    <div className="page">
      {/* ── Page header ── */}
      <div className="ph">
        <div>
          <div className="ph-bc">Staff Console › My Profile</div>
          <div className="ph-title">My Profile</div>
          <div className="ph-sub">
            Your staff account, role and system access overview.
          </div>
        </div>
      </div>

      {/* ── Hero Card ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          borderRadius: 20,
          padding: "32px 36px",
          marginBottom: 24,
          border: "1px solid rgba(26,79,170,0.25)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(26,79,170,0.18) 0%, transparent 70%)",
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
          {/* Avatar */}
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}15)`,
              border: `2.5px solid ${accentColor}60`,
              color: "#60a5fa",
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

          {/* Info */}
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
                  background: "rgba(26,79,170,0.25)",
                  color: "#93c5fd",
                  border: "1px solid rgba(96,165,250,0.3)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                👔 Staff Member
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
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 12,
            marginTop: 28,
          }}
        >
          {[
            { label: "Role", value: "Staff" },
            { label: "Access Level", value: "Standard" },
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
            Everything you have access to in the system
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
                e.currentTarget.style.background = "#eff6ff";
                e.currentTarget.style.borderColor = "#93c5fd";
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
