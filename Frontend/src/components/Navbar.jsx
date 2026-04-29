import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = {
    Admin: [
      { to: '/parts', label: '🔩 Parts' },
      { to: '/purchases', label: '📦 Purchases' },
    ],
    Staff: [
      { to: '/sales', label: '🧾 Sales' },
    ],
    Customer: [
      { to: '/history', label: '📋 My History' },
    ],
  };

  const links = navLinks[user?.role] || [];

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <Link to="/" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)', textDecoration: 'none' }}>
        🔧 SarViscar
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {links.map(link => (
          <Link key={link.to} to={link.to} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.9rem' }}>
            {link.label}
          </Link>
        ))}
        <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginLeft: '8px' }}>
          👤 {user?.name} <span style={{ background: '#e7f5ff', color: '#1971c2', padding: '2px 8px', borderRadius: '20px', fontSize: '0.78rem' }}>{user?.role}</span>
        </span>
        <button onClick={handleLogout} className="btn" style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #fc8181', padding: '6px 14px', fontSize: '0.9rem' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
