import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import './portal.css'

export default function PortalLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="pt-shell">
      <header className="pt-top">
        <div className="pt-brand">
          <div className="pt-logo" aria-hidden="true">
            VS
          </div>
          <div>
            <div className="pt-title">Customer Portal</div>
            <div className="pt-sub">Vehicle service self‑service</div>
          </div>
        </div>

        <div className="pt-user">
          {user ? (
            <>
              <div className="pt-userMeta">
                <div className="pt-userName">{user?.name || 'Customer'}</div>
                <div className="pt-userEmail">{user?.email || ''}</div>
              </div>
              <button
                type="button"
                className="pt-btn pt-btn--ghost"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <div className="pt-userMeta">
              <div className="pt-userName">Welcome</div>
              <div className="pt-userEmail">Please log in</div>
            </div>
          )}
        </div>
      </header>

      <nav className="pt-nav" aria-label="Portal navigation">
        <NavLink className="pt-link" to="/profile">
          Profile
        </NavLink>
        <NavLink className="pt-link" to="/vehicles">
          Vehicles
        </NavLink>
        <div className="pt-spacer" />
        <NavLink className="pt-link pt-link--muted" to="/staff">
          Staff
        </NavLink>
        <NavLink className="pt-link pt-link--muted" to="/admin">
          Admin
        </NavLink>
      </nav>

      <main className="pt-main">
        <Outlet />
      </main>
    </div>
  )
}

