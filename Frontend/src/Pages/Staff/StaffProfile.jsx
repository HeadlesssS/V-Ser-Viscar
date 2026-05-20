import UserProfileEditor from "../../components/UserProfileEditor";
import "../Admin/Admin.css";

export default function StaffProfile() {
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
      <div className="ph">
        <div>
          <div className="ph-bc">Staff Console › My Profile</div>
          <div className="ph-title">My Profile</div>
          <div className="ph-sub">
            Your staff account, role and system access overview.
          </div>
        </div>
      </div>

      <UserProfileEditor
        accentColor="#1a4faa"
        roleBadge="👔 Staff Member"
        stats={[
          { label: "Access Level", value: "Standard" },
          { label: "Capabilities", value: String(CAPS.length) },
        ]}
      />

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
