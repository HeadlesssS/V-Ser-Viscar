import UserProfileEditor from "../../components/UserProfileEditor";
import "./Admin.css";

export default function AdminProfile() {
  const CAPS = [
    { icon: "📊", label: "Financial Reports", desc: "Full access to daily, monthly and yearly reports" },
    { icon: "🔧", label: "Parts Catalog", desc: "Add, edit and deactivate vehicle parts" },
    { icon: "🏭", label: "Vendor Management", desc: "Manage vendor relationships and pricing" },
    { icon: "🧾", label: "Purchase Invoices", desc: "Create and track purchase orders from vendors" },
    { icon: "💵", label: "Sales Invoices", desc: "Full visibility into all sales transactions" },
    { icon: "👥", label: "Staff Management", desc: "Register, activate and deactivate staff accounts" },
    { icon: "📅", label: "Appointments", desc: "View and update all service appointments" },
    { icon: "📦", label: "Part Requests", desc: "Manage and fulfil all customer part requests" },
    { icon: "⭐", label: "Reviews", desc: "Monitor and delete customer reviews" },
    { icon: "🔔", label: "Notifications", desc: "System-wide notification management" },
  ];

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div className="ph-bc">Admin Panel › My Profile</div>
          <div className="ph-title">Admin Profile</div>
          <div className="ph-sub">Manage your account details and system access overview.</div>
        </div>
      </div>

      <UserProfileEditor
        accentColor="#cc1e1e"
        roleBadge="👑 System Administrator"
        stats={[{ label: "Access Level", value: "Full" }]}
      />

      <div className="card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#08060d", marginBottom: 3 }}>
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
              }}
            >
              <div style={{ fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#08060d", marginBottom: 2 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 11, color: "#9c97a3", lineHeight: 1.4 }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
