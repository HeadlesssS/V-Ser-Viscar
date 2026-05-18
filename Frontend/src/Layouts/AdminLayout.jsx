import { NavLink, Outlet } from 'react-router-dom'
import './AdminLayout.css'

const NAV = [
  { to: '/admin/dashboard',         icon: '🏠', label: 'Dashboard' },
  { to: '/admin/vendors',           icon: '🏭', label: 'Vendors' },
  { to: '/admin/parts',             icon: '🔧', label: 'Parts Catalog' },
  { to: '/admin/purchase-invoices', icon: '🧾', label: 'Purchase Invoices' },
  { to: '/admin/financial-reports', icon: '📊', label: 'Financial Reports' },
  { to: '/admin/sales-invoices',    icon: '💵', label: 'Sales Invoices' },
  { to: '/admin/register-staff',    icon: '👤', label: 'Register Staff' },
]

export default function AdminLayout() {
  return (
    <div className="shell">
      <aside className="sb">
        <div className="sb-logo">
          <div className="sb-logo-ic">AP</div>
          <div>
            <div className="sb-logo-title">AutoParts Admin Dashboard</div>
            <div className="sb-logo-sub">Vehicle Service</div>
          </div>
        </div>
        <div className="sb-sec">Admin Panel</div>
        <nav className="sb-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) => `sb-link${isActive ? ' sb-link--on' : ''}`}>
              <span className="sb-link-ic">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-av">A</div>
            <div>
              <div className="sb-uname">Admin</div>
              <div className="sb-urole">Administrator</div>
            </div>
          </div>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}