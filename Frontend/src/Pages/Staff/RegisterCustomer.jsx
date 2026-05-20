import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Admin/admin.css";

const BASE_URL = "/api";

const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

const empty = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "Customer",
};

function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button className="toast-close" onClick={() => onRemove(t.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerUser(form);
      if (res.message === "Registration successful.") {
        addToast(
          `Customer ${form.fullName} created. Adding vehicle next…`,
          "success",
        );
        setTimeout(
          () =>
            navigate("/staff/add-vehicle", { state: { email: form.email } }),
          700,
        );
      } else {
        addToast(res.message || "Registration failed.", "error");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="ph">
        <div>
          <div className="ph-bc">Staff Console / Customers</div>
          <div className="ph-title">Register New Customer</div>
          <div className="ph-sub">
            Create a customer account, then attach a vehicle in the next step.
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720, gap: 0 }}>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>
                Full Name <span>*</span>
              </label>
              <input
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                required
                placeholder="e.g. Sita Sharma"
              />
            </div>
            <div className="field">
              <label>
                Email <span>*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
                placeholder="customer@example.com"
              />
            </div>
            <div className="field">
              <label>
                Phone <span>*</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                required
                placeholder="98XXXXXXXX"
              />
            </div>
            <div className="field">
              <label>
                Password <span>*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
                minLength={6}
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-g"
              onClick={() => setForm(empty)}
              disabled={loading}
            >
              Clear
            </button>
            <button type="submit" className="btn btn-p" disabled={loading}>
              {loading ? "Registering…" : "Next — Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
