import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/vendors',  icon: '⬡', label: 'Vendors',            },
  { to: '/invoices', icon: '⬢', label: 'Purchase Invoices',  },
  { to: '/reports',  icon: '◈', label: 'Financial Reports', },
]

export default function Layout({ children, apiStatus }) {
  return (
    <div className="layout">
      {/* ─── Sidebar ─── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-mark">VP</div>
          <div className="brand-name">
            VehicleParts<br /><em>Admin</em>
          </div>
          <div className="brand-sub">Management Dashboard</div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <p className="nav-section">Admin Features</p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-tag">{item.tag}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className={`api-pill ${apiStatus}`}>
            <span className="api-dot" />
            {apiStatus === 'online'
              ? 'API Online'
              : apiStatus === 'offline'
              ? 'API Offline'
              : 'Checking…'}
          </div>
          <p className="footer-hint">localhost:5174 → /api</p>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <main className="main-content">{children}</main>
    </div>
  )
}
