import { useNavigate } from "react-router-dom";
import "../Admin/admin.css";

const TILES = [
  { to: '/customer/profile',       icon: '👤', title: 'My Profile',       desc: 'Update your contact details and password.',         cta: 'Open',     color: '#cc1e1e' },
  { to: '/customer/vehicles',      icon: '🚗', title: 'My Vehicles',      desc: 'Manage the vehicles registered to your account.',   cta: 'Manage',   color: '#1a4faa' },
  { to: '/customer/appointments',  icon: '📅', title: 'Appointments',     desc: 'Book or review upcoming service appointments.',     cta: 'Book',     color: '#1a7a3a' },
  { to: '/customer/parts-request', icon: '🔧', title: 'Request a Part',   desc: 'Submit a request for an unavailable part.',         cta: 'Request',  color: '#b05a00' },
  { to: '/customer/reviews',       icon: '⭐', title: 'Service Reviews',  desc: 'Share feedback about your past services.',          cta: 'Write',    color: '#6b1a8a' },
  { to: '/customer/history',       icon: '📜', title: 'Purchase History', desc: 'Review past invoices and service records.',         cta: 'View',     color: '#1a7a7a' },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("name") || 'Customer';

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div className="ph-bc">My Portal</div>
          <div className="ph-title">Welcome, {userName}</div>
          <div className="ph-sub">Manage your vehicles, appointments and account from one place.</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18, borderColor: 'rgba(204,30,30,0.18)', background: 'linear-gradient(135deg, #fff0f0 0%, #ffffff 100%)' }}>
        <div className="card-top-line" style={{ background: 'linear-gradient(90deg, #cc1e1e, transparent)' }} />
        <div className="card-head">
          <div className="card-av" style={{ background: '#cc1e1e15', color: '#cc1e1e', fontSize: 20 }}>🤖</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="card-title">AI Part Failure Predictions</div>
            <div className="card-id">Our AI analyses your vehicle's usage to alert you before parts fail.</div>
          </div>
          <button type="button" className="btn btn-p" onClick={() => navigate('/customer/predictions')}>
            View Predictions
          </button>
        </div>
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

