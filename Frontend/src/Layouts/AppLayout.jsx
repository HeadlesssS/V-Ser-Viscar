import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import './AdminLayout.css'

const NAV_ADMIN = [
  { to: '/admin/dashboard',         icon: '🏠', label: 'Dashboard' },
  { to: '/admin/vendors',           icon: '🏭', label: 'Vendors' },
  { to: '/admin/parts',             icon: '🔧', label: 'Parts Catalog' },
  { to: '/admin/purchase-invoices', icon: '🧾', label: 'Purchase Invoices' },
  { to: '/admin/financial-reports', icon: '📊', label: 'Financial Reports' },
  { to: '/admin/sales-invoices',    icon: '💵', label: 'Sales Invoices' },
  { to: '/admin/register-staff',    icon: '👤', label: 'Register Staff' },
]

const NAV_STAFF = [
  { to: '/staff/dashboard',         icon: '🏠', label: 'Dashboard' },
  { to: '/staff/register-customer', icon: '👤', label: 'Register Customer' },
  { to: '/staff/add-vehicle',       icon: '🚗', label: 'Add Vehicle' },
  { to: '/staff/search-customer',   icon: '🔍', label: 'Search Customers' },
  { to: '/staff/sales-invoices',    icon: '💳', label: 'Sales Invoices' },
  { to: '/staff/customer-details',  icon: '📋', label: 'Customer Details' },
]

const NAV_CUSTOMER = [
  { to: '/customer/dashboard',     icon: '🏠', label: 'Dashboard' },
  { to: '/customer/profile',       icon: '👤', label: 'My Profile' },
  { to: '/customer/vehicles',      icon: '🚗', label: 'My Vehicles' },
  { to: '/customer/appointments',  icon: '📅', label: 'Appointments' },
  { to: '/customer/parts-request', icon: '🔧', label: 'Request Part' },
  { to: '/customer/reviews',       icon: '⭐', label: 'Reviews' },
  { to: '/customer/history',       icon: '📜', label: 'Purchase History' },
  { to: '/customer/predictions',   icon: '🤖', label: 'AI Predictions' },
]

const ROLE_CFG = {
  Admin:    { nav: NAV_ADMIN,    section: 'Admin Panel',   title: 'AutoParts Admin', sub: 'Vehicle Service', logo: 'AP', uroleLabel: 'Administrator' },
  Staff:    { nav: NAV_STAFF,    section: 'Staff Console', title: 'AutoParts Staff', sub: 'Vehicle Service', logo: 'SP', uroleLabel: 'Staff Member' },
  Customer: { nav: NAV_CUSTOMER, section: 'My Portal',     title: 'Ser-Viscar',      sub: 'Service Center',  logo: 'CP', uroleLabel: 'Customer' },
}

export default function AppLayout() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role') || 'Admin'
  const name = localStorage.getItem('name') || 'User'
  const cfg  = ROLE_CFG[role] || ROLE_CFG.Admin
  const initial = (name[0] || '?').toUpperCase()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    navigate('/login')
  }

  return (
    <div className="shell">
      <aside className="sb">
        <div className="sb-logo">
          <div className="sb-logo-ic">{cfg.logo}</div>
          <div>
            <div className="sb-logo-title">{cfg.title}</div>
            <div className="sb-logo-sub">{cfg.sub}</div>
          </div>
        </div>
        <div className="sb-sec">{cfg.section}</div>
        <nav className="sb-nav">
          {cfg.nav.map(n => (
            <NavLink key={n.to} to={n.to} end
              className={({ isActive }) => `sb-link${isActive ? ' sb-link--on' : ''}`}>
              <span className="sb-link-ic">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-av">{initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sb-uname" title={name}>{name}</div>
              <div className="sb-urole">{cfg.uroleLabel}</div>
            </div>
          </div>
          <button type="button" className="sb-logout" onClick={handleLogout}>
            <span className="sb-link-ic">🚪</span> Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
