import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ name: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.data);
      if (res.data.role === 'Admin') navigate('/parts');
      else if (res.data.role === 'Staff') navigate('/sales');
      else navigate('/history');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: '1.8rem', marginBottom: '6px' }}>🔧 SarViscar</h2>
          <p style={{ color: 'var(--text-light)' }}>Vehicle Parts & Inventory System</p>
        </div>
        {error && (
          <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', color: '#c53030', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-dark)' }}>Username</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Enter username"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-dark)' }}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Enter password"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: '20px', padding: '12px', background: '#f8f9fa', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--text-light)' }}>
          <strong>Demo credentials:</strong><br />
          Admin: admin / admin123<br />
          Staff: staff / staff123<br />
          Customer: customer1 / cust123
        </div>
      </div>
    </div>
  );
}
