import { useState } from "react";
import "./admin.css";

const BASE_URL = "http://localhost:5169/api";

export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

const empty = { fullName: "", email: "", password: "", phone: "", role: "Staff" };

function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === 'success' ? '✓' : '✕'}</span>
          <span style={{ flex:1 }}>{t.msg}</span>
          <button className="toast-close" onClick={() => onRemove(t.id)}>×</button>
        </div>
      ))}
    </div>
  )
}

export default function RegisterStaff() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  const removeToast = (id) => setToasts(t => t.filter(x => x.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerUser(form);
      if (res.message === "Registration successful.") {
        addToast(`${form.role} account created for ${form.fullName}.`, 'success');
        setForm(empty);
      } else {
        addToast(res.message || "Registration failed.", 'error');
      }
    } catch {
      addToast("Network error. Please try again.", 'error');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="ph">
        <div>
          <div className="ph-bc">Admin / Staff Management</div>
          <div className="ph-title">Register New Staff</div>
          <div className="ph-sub">Create an account for a staff member or fellow administrator.</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720, gap: 0 }}>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Full Name <span>*</span></label>
              <input value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                required placeholder="e.g. Ramesh Kumar" />
            </div>
            <div className="field">
              <label>Email <span>*</span></label>
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required placeholder="staff@example.com" />
            </div>
            <div className="field">
              <label>Phone <span>*</span></label>
              <input value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required placeholder="98XXXXXXXX" />
            </div>
            <div className="field">
              <label>Role <span>*</span></label>
              <select value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Password <span>*</span></label>
              <input type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required minLength={6} placeholder="Minimum 6 characters" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-g"
              onClick={() => setForm(empty)} disabled={loading}>Clear</button>
            <button type="submit" className="btn btn-p" disabled={loading}>
              {loading ? 'Registering…' : 'Register Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}