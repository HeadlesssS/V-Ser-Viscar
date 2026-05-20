import { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

// ─── SVG Icon Components ───────────────────────────────────────────────────
const Icon = ({ d, size = 16, viewBox = "0 0 24 24", children, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

const DashboardIcon = () => (
  <Icon size={16}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </Icon>
);
const VendorIcon = () => (
  <Icon size={16}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Icon>
);
const PartsIcon = () => (
  <Icon size={16}>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </Icon>
);
const InvoiceIcon = () => (
  <Icon size={16}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </Icon>
);
const ReportIcon = () => (
  <Icon size={16}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </Icon>
);
const BellIcon = ({ size = 16 }) => (
  <Icon size={size}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </Icon>
);
const SalesIcon = () => (
  <Icon size={16}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" />
  </Icon>
);
const StaffIcon = () => (
  <Icon size={16}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </Icon>
);
const CustomerIcon = () => (
  <Icon size={16}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);
const CarIcon = () => (
  <Icon size={16}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </Icon>
);
const SearchIcon = () => (
  <Icon size={16}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);
const ClipboardIcon = () => (
  <Icon size={16}>
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </Icon>
);
const ChartIcon = () => (
  <Icon size={16}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Icon>
);
const ProfileIcon = () => (
  <Icon size={16}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);
const CalendarIcon = () => (
  <Icon size={16}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);
const PackageIcon = () => (
  <Icon size={16}>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </Icon>
);
const StarIcon = () => (
  <Icon size={16}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Icon>
);
const HistoryIcon = () => (
  <Icon size={16}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
  </Icon>
);
const AuditIcon = () => (
  <Icon size={16}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </Icon>
);
const BrainIcon = () => (
  <Icon size={16}>
    <path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7v0A2.5 2.5 0 012 9.5v5A2.5 2.5 0 004.5 17v0A2.5 2.5 0 007 19.5v0A2.5 2.5 0 009.5 22h5a2.5 2.5 0 002.5-2.5v0a2.5 2.5 0 002.5-2.5v0a2.5 2.5 0 002.5-2.5v-5A2.5 2.5 0 0019.5 7v0A2.5 2.5 0 0017 4.5v0A2.5 2.5 0 0014.5 2z" />
  </Icon>
);
const LogoutIcon = () => (
  <Icon size={16}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
);
const CheckAllIcon = () => (
  <Icon size={14}>
    <polyline points="17 1 21 5 13 13" />
    <polyline points="7 11 11 15 3 23" />
  </Icon>
);
const CloseIcon = () => (
  <Icon size={14}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

// ─── Nav Configs (NO EMOJIS, all SVG icons) ───────────────────────────────
const NAV_ADMIN = [
  { to: "/admin/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
  { to: "/admin/vendors", icon: <VendorIcon />, label: "Vendors" },
  { to: "/admin/parts", icon: <PartsIcon />, label: "Parts Catalog" },
  {
    to: "/admin/purchase-invoices",
    icon: <InvoiceIcon />,
    label: "Purchase Invoices",
  },
  {
    to: "/admin/financial-reports",
    icon: <ReportIcon />,
    label: "Financial Reports",
  },
  { to: "/admin/sales-invoices", icon: <SalesIcon />, label: "Sales Invoices" },
  { to: "/admin/register-staff", icon: <StaffIcon />, label: "Manage Users" },
  { to: "/admin/appointments", icon: <CalendarIcon />, label: "Appointments" },
  {
    to: "/admin/part-requests-management",
    icon: <PackageIcon />,
    label: "Part Requests",
  },
  { to: "/admin/reviews", icon: <StarIcon />, label: "Reviews" },
  { to: "/admin/audit-log", icon: <AuditIcon />, label: "Audit Log" },
  { to: "/admin/profile", icon: <ProfileIcon />, label: "My Profile" },
  { to: "/admin/notifications", icon: <BellIcon />, label: "Notifications" },
];

const NAV_STAFF = [
  { to: "/staff/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
  {
    to: "/staff/register-customer",
    icon: <CustomerIcon />,
    label: "Register Customer",
  },
  { to: "/staff/add-vehicle", icon: <CarIcon />, label: "Add Vehicle" },
  {
    to: "/staff/customer-details",
    icon: <SearchIcon />,
    label: "Customer Lookup",
  },
  { to: "/staff/sales-invoices", icon: <SalesIcon />, label: "Sales Invoices" },
  {
    to: "/staff/customer-reports",
    icon: <ChartIcon />,
    label: "Customer Reports",
  },
  { to: "/staff/appointments", icon: <CalendarIcon />, label: "Appointments" },
  {
    to: "/staff/part-requests-management",
    icon: <PackageIcon />,
    label: "Part Requests",
  },
  { to: "/staff/reviews", icon: <StarIcon />, label: "Reviews" },
  { to: "/staff/profile", icon: <ProfileIcon />, label: "My Profile" },
];

const NAV_CUSTOMER = [
  { to: "/customer/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
  { to: "/customer/profile", icon: <ProfileIcon />, label: "My Profile" },
  { to: "/customer/vehicles", icon: <CarIcon />, label: "My Vehicles" },
  {
    to: "/customer/appointments",
    icon: <CalendarIcon />,
    label: "Appointments",
  },
  {
    to: "/customer/parts-request",
    icon: <PackageIcon />,
    label: "Request Part",
  },
  { to: "/customer/reviews", icon: <StarIcon />, label: "Reviews" },
  { to: "/customer/history", icon: <HistoryIcon />, label: "Purchase History" },
  { to: "/customer/predictions", icon: <BrainIcon />, label: "AI Predictions" },
];

const ROLE_CFG = {
  Admin: {
    nav: NAV_ADMIN,
    section: "Admin Panel",
    title: "Ser-Viscar Admin",
    sub: "Service Center",
    logo: "SV",
    uroleLabel: "Administrator",
  },
  Staff: {
    nav: NAV_STAFF,
    section: "Staff Console",
    title: "Ser-Viscar Staff",
    sub: "Service Center",
    logo: "SV",
    uroleLabel: "Staff Member",
  },
  Customer: {
    nav: NAV_CUSTOMER,
    section: "My Portal",
    title: "Ser-Viscar",
    sub: "Service Center",
    logo: "CV",
    uroleLabel: "Customer",
  },
};

// ─── Notification type configs ─────────────────────────────────────────────
const NOTIF_CFG = {
  NewAppointment: {
    color: "#1e40af",
    bg: "#eff6ff",
    border: "#93c5fd",
    label: "New Appointment",
  },
  AppointmentUpdate: {
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#6ee7b7",
    label: "Appointment Update",
  },
  NewPartRequest: {
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    label: "Part Request",
  },
  PartRequestUpdate: {
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    label: "Part Request Update",
  },
  LowStock: {
    color: "#c2410c",
    bg: "#fff7ed",
    border: "#fdba74",
    label: "Low Stock Alert",
  },
  CreditReminder: {
    color: "#991b1b",
    bg: "#fef2f2",
    border: "#fca5a5",
    label: "Credit Reminder",
  },
  default: {
    color: "#374151",
    bg: "#f9fafb",
    border: "#e5e7eb",
    label: "Notification",
  },
};

function getNotifCfg(type) {
  return NOTIF_CFG[type] || NOTIF_CFG.default;
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Bell Notification Dropdown ───────────────────────────────────────────
function BellNotificationPanel({ token, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/bell-notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnread(data.unreadCount || 0);
      }
    } catch {
      /* silently ignore network errors */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch("/api/bell-notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="bell-panel">
      <div className="bell-panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BellIcon size={16} />
          <span className="bell-panel-title">Notifications</span>
          {unread > 0 && (
            <span className="bell-badge bell-badge-panel">{unread}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {unread > 0 && (
            <button
              className="bell-mark-all"
              onClick={markAllRead}
              title="Mark all as read"
            >
              <CheckAllIcon /> Mark all read
            </button>
          )}
          <button className="bell-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
      </div>
      <div className="bell-panel-body">
        {loading ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bell-empty">
            <div className="bell-empty-icon">
              <BellIcon size={28} />
            </div>
            <div>No notifications yet</div>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = getNotifCfg(n.type);
            return (
              <div
                key={n.id}
                className={`bell-item${n.isRead ? "" : " bell-item--unread"}`}
                style={{ borderLeft: `3px solid ${cfg.border}` }}
              >
                <div
                  className="bell-item-dot"
                  style={{ background: n.isRead ? "transparent" : cfg.color }}
                />
                <div className="bell-item-content">
                  <div className="bell-item-type" style={{ color: cfg.color }}>
                    {cfg.label}
                  </div>
                  <div className="bell-item-msg">{n.message}</div>
                  <div className="bell-item-time">{timeAgo(n.sentAt)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Bell Trigger (button + badge) ────────────────────────────────────────
function BellTrigger({ token }) {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/bell-notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnread(data.unreadCount || 0);
      }
    } catch {
      /* ignore */
    }
  }, [token]);

  useEffect(() => {
    fetchUnread();
    intervalRef.current = setInterval(fetchUnread, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchUnread]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const panelH = 480;
      const panelW = 360;
      const spaceRight = window.innerWidth - rect.right - 10;
      const leftPos =
        spaceRight >= panelW
          ? rect.right + 10
          : Math.max(8, window.innerWidth - panelW - 8);
      const topPos = Math.max(
        8,
        Math.min(
          rect.top - panelH + rect.height,
          window.innerHeight - panelH - 8,
        ),
      );
      setPanelPos({ top: topPos, left: leftPos });
    }
    setOpen((o) => !o);
  };

  const handleClose = () => {
    setOpen(false);
    fetchUnread(); // refresh count after panel closes
  };

  return (
    <div className="bell-wrap">
      <button
        ref={triggerRef}
        className={`bell-btn${open ? " bell-btn--active" : ""}`}
        onClick={handleOpen}
        title="Notifications"
      >
        <BellIcon size={17} />
        {unread > 0 && (
          <span className="bell-badge">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>
      {open && (
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: panelPos.top,
            left: panelPos.left,
            zIndex: 9999,
          }}
        >
          <BellNotificationPanel token={token} onClose={handleClose} />
        </div>
      )}
    </div>
  );
}

// ─── Main AppLayout ────────────────────────────────────────────────────────
export default function AppLayout() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Admin";
  const rawName = localStorage.getItem("name") || "";
  const name =
    rawName && rawName !== "undefined"
      ? rawName
      : role === "Staff"
        ? "Staff Member"
        : role === "Admin"
          ? "Administrator"
          : "User";
  const token = localStorage.getItem("token");
  const cfg = ROLE_CFG[role] || ROLE_CFG.Admin;
  const [collapsed, setCollapsed] = useState(false);
  const initial = (name[0] || "?").toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  return (
    <div className="shell">
      <aside
        className={`sb${collapsed ? " sb--collapsed" : ""}`}
        style={{ position: "relative" }}
      >
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-ic">{cfg.logo}</div>
          <div>
            <div className="sb-logo-title">{cfg.title}</div>
            <div className="sb-logo-sub">{cfg.sub}</div>
          </div>
        </div>

        {/* Section label */}
        <div className="sb-sec">{cfg.section}</div>

        {/* Navigation */}
        <nav className="sb-nav">
          {cfg.nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end
              data-tooltip={n.label}
              className={({ isActive }) =>
                `sb-link${isActive ? " sb-link--on" : ""}`
              }
            >
              <span className="sb-link-ic">{n.icon}</span>
              <span className="sb-link-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle at bottom of nav */}
        <button
          className="sb-collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="sb-collapse-icon sb-link-ic">‹</span>
          <span className="sb-link-label sb-collapse-label">Collapse</span>
        </button>

        {/* Footer: user info + bell + logout */}
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-av">{initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sb-uname" title={name}>
                {name}
              </div>
              <div className="sb-urole">{cfg.uroleLabel}</div>
            </div>
            <BellTrigger token={token} />
          </div>
          <button type="button" className="sb-logout" onClick={handleLogout}>
            <span className="sb-link-ic">
              <LogoutIcon />
            </span>
            <span className="sb-link-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
