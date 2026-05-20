import { useState, useEffect, useCallback } from "react";

const BASE_URL = "/api";

const safeJson = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button type="button" className="toast-close" onClick={() => onRemove(t.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default function UserProfileEditor({
  accentColor = "#cc1e1e",
  roleBadge = "User",
  stats = [],
}) {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/customers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeJson(res);
      if (res.ok && data?.id) {
        setProfile(data);
        setEditForm({ name: data.name || "", phone: data.phone || "" });
      } else {
        addToast(data.message || "Could not load profile.", "error");
      }
    } catch {
      addToast("Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/customers/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editForm.name, phone: editForm.phone }),
      });
      const data = await safeJson(res);
      if (res.ok && data.message === "Profile updated successfully.") {
        addToast("Profile updated successfully!", "success");
        setShowEditForm(false);
        localStorage.setItem("name", editForm.name);
        await loadProfile();
      } else {
        addToast(data.message || "Failed to update profile.", "error");
      }
    } catch {
      addToast("Server error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", marginBottom: 24 }}>
        <div className="spinner" style={{ margin: "0 auto 12px" }} />
        <p style={{ color: "#6b6375", fontSize: 13 }}>Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card" style={{ padding: 32, textAlign: "center", marginBottom: 24 }}>
        <p style={{ marginBottom: 12 }}>Unable to load profile.</p>
        <button type="button" className="btn btn-p" onClick={loadProfile}>
          Retry
        </button>
      </div>
    );
  }

  const displayStats = [
    { label: "Email", value: profile.email || "—" },
    { label: "Phone", value: profile.phone || "—" },
    { label: "Member Since", value: formatDate(profile.createdAt) },
    ...stats,
  ];

  return (
    <>
      <Toast toasts={toasts} onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />

      <div
        style={{
          background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 50%, transparent 100%)`,
          borderRadius: 20,
          padding: "28px 32px",
          marginBottom: showEditForm ? 16 : 24,
          border: `1px solid ${accentColor}33`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}15)`,
              border: `2px solid ${accentColor}50`,
              color: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {getInitials(profile.name)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#08060d", marginBottom: 8 }}>
              {profile.name}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span
                className="badge"
                style={{
                  background: `${accentColor}18`,
                  color: accentColor,
                  border: `1px solid ${accentColor}40`,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {roleBadge}
              </span>
              <span className="badge b-act" style={{ fontSize: 11 }}>
                ● Active
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-g"
            onClick={() => setShowEditForm(!showEditForm)}
          >
            {showEditForm ? "✕ Cancel" : "✏️ Edit Profile"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            marginTop: 24,
          }}
        >
          {displayStats.map((s) => (
            <div
              key={s.label}
              style={{
                background: "#fff",
                border: "1px solid #e5e4e7",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: 11, color: "#9c97a3", marginBottom: 4, textTransform: "uppercase" }}>
                {s.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#08060d", wordBreak: "break-word" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEditForm && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 560 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Edit Profile</div>
          <form onSubmit={handleEditSubmit} className="form">
            <div className="form-grid">
              <div className="field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Your phone number"
                />
              </div>
            </div>
            <div className="field">
              <label>Email (read-only)</label>
              <input type="email" value={profile.email || ""} disabled style={{ opacity: 0.55 }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button" className="btn btn-g" onClick={() => setShowEditForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-p" disabled={saving}>
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
