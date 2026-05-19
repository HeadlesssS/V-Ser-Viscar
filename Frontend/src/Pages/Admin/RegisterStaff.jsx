import { useState, useEffect, useCallback } from "react";
import "./Admin.css";

const BASE_URL = "/api";

// ─── Eye Icon ─────────────────────────────────────────────────────────────────
const EyeIcon = ({ show }) =>
  show ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

// ─── Toast Component ──────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "Staff",
};

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const styles = {
    Admin: {
      background: "#fff0f0",
      color: "#cc1e1e",
      border: "1px solid rgba(204,30,30,0.25)",
    },
    Staff: {
      background: "#edf3ff",
      color: "#1a4faa",
      border: "1px solid #aac4f0",
    },
    Customer: {
      background: "#f5f0ff",
      color: "#6b1a8a",
      border: "1px solid #d4b8f0",
    },
  };
  const s = styles[role] || styles.Staff;
  return (
    <span className="badge" style={s}>
      {role}
    </span>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmModal({ user, onCancel, onConfirm, loading }) {
  if (!user) return null;
  const name = user.fullName ?? user.name ?? "this user";
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <span className="modal-title">Delete User</span>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "#fff0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#cc1e1e"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "#3a3540",
              marginBottom: 6,
            }}
          >
            Are you sure you want to delete
          </p>
          <p
            style={{
              textAlign: "center",
              fontSize: 15,
              fontWeight: 700,
              color: "#08060d",
              marginBottom: 20,
            }}
          >
            {name}?
          </p>
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#9c97a3",
              marginBottom: 24,
            }}
          >
            This action cannot be undone. The user account will be permanently
            removed.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-g" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button
              className="btn"
              onClick={onConfirm}
              disabled={loading}
              style={{
                background: "#cc1e1e",
                color: "#fff",
                border: "none",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
function EditModal({ user, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    fullName: user?.fullName ?? user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? user?.phoneNumber ?? "",
    role: user?.role ?? "Staff",
    password: "",
  });
  const [showPwd, setShowPwd] = useState(false);

  if (!user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">Edit User</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div style={{ padding: "4px 24px 24px" }}>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Full Name */}
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
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              {/* Email */}
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
                  placeholder="user@example.com"
                />
              </div>

              {/* Phone */}
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

              {/* Role */}
              <div className="field">
                <label>
                  Role <span>*</span>
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                >
                  <option value="Staff">Staff</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>

              {/* Password (optional) */}
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>
                  New Password{" "}
                  <span
                    style={{ fontWeight: 400, color: "#9c97a3", fontSize: 11 }}
                  >
                    (leave blank to keep unchanged)
                  </span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    minLength={form.password ? 6 : undefined}
                    placeholder="Minimum 6 characters"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#9c97a3",
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                    }}
                  >
                    <EyeIcon show={showPwd} />
                  </button>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-g"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-p" disabled={loading}>
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin .7s linear infinite",
                      }}
                    />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RegisterStaff() {
  // Register form
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toast
  const [toasts, setToasts] = useState([]);

  // User list
  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Edit
  const [editUser, setEditUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toggle status
  const [togglingId, setTogglingId] = useState(null);

  // ── Toast helpers ────────────────────────────────────────────────────────
  const addToast = (msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  // ── Fetch users ───────────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/users`, { headers: authHeader() });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : (data.users ?? []));
    } catch {
      setUsers([]);
    }
    setListLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadUsers(), 0);
    return () => clearTimeout(t);
  }, [loadUsers]);

  // ── Register new user ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/register-staff`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(
          `${form.role} account created for ${form.fullName}.`,
          "success",
        );
        setForm(EMPTY_FORM);
        loadUsers();
      } else {
        addToast(data.message || "Registration failed.", "error");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    }
    setLoading(false);
  };

  // ── Edit user ─────────────────────────────────────────────────────────────
  const handleEdit = async (formData) => {
    if (!editUser) return;
    setEditLoading(true);
    try {
      const body = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      };
      if (formData.password) body.password = formData.password;

      const res = await fetch(`${BASE_URL}/users/${editUser.id}`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`${formData.fullName} updated successfully.`, "success");
        setEditUser(null);
        loadUsers();
      } else {
        addToast(data.message || "Update failed.", "error");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    }
    setEditLoading(false);
  };

  // ── Delete user ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/users/${deleteUser.id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (res.ok) {
        const name = deleteUser.fullName ?? deleteUser.name ?? "User";
        addToast(`${name} deleted successfully.`, "success");
        setDeleteUser(null);
        loadUsers();
      } else {
        const data = await res.json();
        addToast(data.message || "Delete failed.", "error");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    }
    setDeleteLoading(false);
  };

  // ── Toggle active status ──────────────────────────────────────────────────
  const handleToggle = async (user) => {
    setTogglingId(user.id);
    try {
      const res = await fetch(`${BASE_URL}/users/${user.id}/toggle-status`, {
        method: "PUT",
        headers: authHeader(),
      });
      if (res.ok) {
        const name = user.fullName ?? user.name ?? "User";
        const wasActive = user.isActive !== false;
        addToast(
          `${name} ${wasActive ? "deactivated" : "activated"} successfully.`,
          "success",
        );
        loadUsers();
      } else {
        const data = await res.json();
        addToast(data.message || "Toggle failed.", "error");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    }
    setTogglingId(null);
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const staffCount = users.filter((u) => u.role === "Staff").length;
  const customerCount = users.filter((u) => u.role === "Customer").length;
  const activeCount = users.filter((u) => u.isActive !== false).length;

  // ── Filtered list ─────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchSearch =
      !q ||
      (u.fullName ?? u.name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.role ?? "").toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  return (
    <div className="page">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      <EditModal
        user={editUser}
        onClose={() => setEditUser(null)}
        onSave={handleEdit}
        loading={editLoading}
      />

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      <ConfirmModal
        user={deleteUser}
        onCancel={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="ph">
        <div>
          <div className="ph-bc">Admin / Staff Management</div>
          <div className="ph-title">Register Staff &amp; Customers</div>
          <div className="ph-sub">
            Create and manage accounts for staff members and customers.
          </div>
        </div>
        <button
          className="btn btn-g"
          onClick={loadUsers}
          disabled={listLoading}
        >
          {listLoading ? "Loading…" : "Refresh List"}
        </button>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <div className="stats">
        <div className="sc">
          <div className="sc-n">{users.length}</div>
          <div className="sc-l">Total Users</div>
        </div>
        <div className="sc">
          <div className="sc-n" style={{ color: "#1a4faa" }}>
            {staffCount}
          </div>
          <div className="sc-l">Staff Members</div>
        </div>
        <div className="sc">
          <div className="sc-n" style={{ color: "#6b1a8a" }}>
            {customerCount}
          </div>
          <div className="sc-l">Customers</div>
        </div>
        <div className="sc">
          <div className="sc-n sc-n-g">{activeCount}</div>
          <div className="sc-l">Active Accounts</div>
        </div>
      </div>

      {/* ── Registration Form ────────────────────────────────────────────── */}
      <div className="card" style={{ maxWidth: 760, marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#fff0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#cc1e1e"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#08060d" }}>
              New Account
            </div>
            <div style={{ fontSize: 12, color: "#6b6375" }}>
              Fill in the details below to register a new user
            </div>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Full Name */}
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
                placeholder="e.g. Ramesh Kumar"
              />
            </div>

            {/* Email */}
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
                placeholder="user@example.com"
              />
            </div>

            {/* Phone */}
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

            {/* Role */}
            <div className="field">
              <label>
                Role <span>*</span>
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                <option value="Staff">Staff</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            {/* Password */}
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>
                Password <span>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9c97a3",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  <EyeIcon show={showPwd} />
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-g"
              onClick={() => setForm(EMPTY_FORM)}
              disabled={loading}
            >
              Clear
            </button>
            <button type="submit" className="btn btn-p" disabled={loading}>
              {loading ? (
                <>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin .7s linear infinite",
                    }}
                  />
                  Registering…
                </>
              ) : (
                "Register Account"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Registered Users Table ───────────────────────────────────────── */}
      <div className="card" style={{ gap: 0, overflow: "hidden" }}>
        {/* Table toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px 14px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 160 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "#08060d",
                marginBottom: 2,
              }}
            >
              Registered Users
            </div>
            <div style={{ fontSize: 12, color: "#9c97a3" }}>
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"}{" "}
              found
            </div>
          </div>

          {/* Role filter */}
          <div className="ft">
            {["All", "Staff", "Customer"].map((r) => (
              <button
                key={r}
                className={`ftb${roleFilter === r ? " ftb-on" : ""}`}
                onClick={() => setRoleFilter(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="sw" style={{ maxWidth: 260 }}>
            <span className="sw-ic">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              className="sw-in"
              placeholder="Search by name, email or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {listLoading ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div className="spinner" />
            <div style={{ fontSize: 13, color: "#9c97a3", marginTop: 12 }}>
              Loading users…
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#f7f7f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#b0acb8"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <p style={{ fontSize: 13, color: "#9c97a3", margin: 0 }}>
              {search
                ? "No users match your search."
                : "No registered users yet."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #e5e4e7",
                    background: "#f7f7f8",
                  }}
                >
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    "Role",
                    "Status",
                    "Created",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#6b6375",
                        textTransform: "uppercase",
                        letterSpacing: "0.6px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => {
                  const name = user.fullName ?? user.name ?? "—";
                  const initials = name
                    .split(" ")
                    .map((w) => w[0] ?? "")
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const isActive = user.isActive !== false;
                  const createdAt = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-NP", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={user.id ?? idx}
                      style={{
                        borderBottom: "1px solid #f0eff2",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafafa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      {/* Name + avatar */}
                      <td style={{ padding: "11px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "#fff0f0",
                              color: "#cc1e1e",
                              fontSize: 11,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {initials || "?"}
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#08060d",
                            }}
                          >
                            {name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td
                        style={{
                          padding: "11px 14px",
                          fontSize: 13,
                          color: "#3a3540",
                        }}
                      >
                        {user.email ?? "—"}
                      </td>

                      {/* Phone */}
                      <td
                        style={{
                          padding: "11px 14px",
                          fontSize: 13,
                          color: "#3a3540",
                        }}
                      >
                        {user.phone ?? user.phoneNumber ?? "—"}
                      </td>

                      {/* Role badge */}
                      <td style={{ padding: "11px 14px" }}>
                        <RoleBadge role={user.role ?? "—"} />
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: "11px 14px" }}>
                        <span
                          className={`badge ${isActive ? "b-act" : "b-ina"}`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Created */}
                      <td
                        style={{
                          padding: "11px 14px",
                          fontSize: 12,
                          color: "#9c97a3",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {createdAt}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "11px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            alignItems: "center",
                          }}
                        >
                          {/* Edit */}
                          <button
                            title="Edit user"
                            onClick={() => setEditUser(user)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 7,
                              border: "1px solid #e5e4e7",
                              background: "#fff",
                              color: "#1a4faa",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all .14s",
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#edf3ff";
                              e.currentTarget.style.borderColor = "#aac4f0";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#fff";
                              e.currentTarget.style.borderColor = "#e5e4e7";
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>

                          {/* Toggle activate/deactivate */}
                          <button
                            title={
                              isActive ? "Deactivate user" : "Activate user"
                            }
                            onClick={() => handleToggle(user)}
                            disabled={togglingId === user.id}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 7,
                              border: `1px solid ${isActive ? "#f5d08a" : "#b3dfc0"}`,
                              background: isActive ? "#fffbec" : "#edf7f0",
                              color: isActive ? "#d4a800" : "#1a7a3a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor:
                                togglingId === user.id
                                  ? "not-allowed"
                                  : "pointer",
                              transition: "all .14s",
                              flexShrink: 0,
                              opacity: togglingId === user.id ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (togglingId === user.id) return;
                              e.currentTarget.style.background = isActive
                                ? "#fff8ec"
                                : "#d4f0de";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = isActive
                                ? "#fffbec"
                                : "#edf7f0";
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                              />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                          </button>

                          {/* Delete */}
                          <button
                            title="Delete user"
                            onClick={() => setDeleteUser(user)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 7,
                              border: "1px solid #e5e4e7",
                              background: "#fff",
                              color: "#cc1e1e",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all .14s",
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#fff0f0";
                              e.currentTarget.style.borderColor =
                                "rgba(204,30,30,0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#fff";
                              e.currentTarget.style.borderColor = "#e5e4e7";
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer */}
        {!listLoading && filtered.length > 0 && (
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #f0eff2",
              fontSize: 12,
              color: "#9c97a3",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              Showing {filtered.length} of {users.length} users
            </span>
            <span>
              {staffCount} Staff · {customerCount} Customers · {activeCount}{" "}
              Active
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
