import { useNavigate } from "react-router-dom";
import "../Admin/admin.css";

const TILES = [
  { to: '/staff/register-customer', icon: '👤', title: 'Register Customer',  desc: 'Onboard a new customer to the system.',                  cta: 'Register',   color: '#cc1e1e' },
  { to: '/staff/add-vehicle',       icon: '🚗', title: 'Add Vehicle',        desc: 'Attach a vehicle record to a customer profile.',         cta: 'Add',        color: '#1a4faa' },
  { to: '/staff/search-customer',   icon: '🔍', title: 'Search Customers',   desc: 'Find by name, phone, ID or vehicle number.',             cta: 'Search',     color: '#1a7a3a' },
  { to: '/staff/sales-invoices',    icon: '💳', title: 'Sales Invoices',     desc: 'Create new sales invoices and email receipts.',          cta: 'Open',       color: '#b05a00' },
  { to: '/staff/customer-details',  icon: '📋', title: 'Customer Reports',   desc: 'Top spenders, regulars and overdue credit accounts.',    cta: 'View',       color: '#6b1a8a' },
];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("name") || 'Staff';

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div className="ph-bc">Staff Console</div>
          <div className="ph-title">Welcome back, {userName}</div>
          <div className="ph-sub">Operational hub for customer service, vehicles and sales.</div>
        </div>
      </div>

      <div className="stats">
        <div className="sc"><div className="sc-n">5</div><div className="sc-l">Quick Actions</div></div>
        <div className="sc"><div className="sc-n sc-n-g">Live</div><div className="sc-l">Sales Channel</div></div>
        <div className="sc"><div className="sc-n sc-n-m">Today</div><div className="sc-l">Reporting Window</div></div>
      </div>

      <div className="grid">
        {TILES.map(t => (
          <div key={t.to} className="card" onClick={() => navigate(t.to)} style={{ cursor: 'pointer' }}>
            <div className="card-top-line" style={{ background: `linear-gradient(90deg, ${t.color}, transparent)` }} />
            <div className="card-head">
              <div className="card-av" style={{ background: `${t.color}15`, color: t.color }}>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card-title">{t.title}</div>
                <div className="card-id">{t.desc}</div>
              </div>
            </div>
            <div className="card-actions">
              <button type="button" className="btn btn-p" style={{ width: '100%', justifyContent: 'center' }}
                onClick={(e) => { e.stopPropagation(); navigate(t.to); }}>
                {t.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

