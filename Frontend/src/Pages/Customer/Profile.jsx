import { useState, useEffect, useCallback } from "react";
import "./Customer.css";

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

const getProfile = async (token) => {
  const res = await fetch(`${BASE_URL}/customers/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return safeJson(res);
};

const updateProfile = async (data, token) => {
  const res = await fetch(`${BASE_URL}/customers/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return safeJson(res);
};

const addVehicleApi = async (data, token) => {
  const res = await fetch(`${BASE_URL}/customers/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return safeJson(res);
};

const TIER_STYLES = {
  Standard: { bg: "#f0f0f0", color: "#6b6375", label: "Standard" },
  Gold: { bg: "#fffbea", color: "#b05a00", label: "⭐ Gold" },
  Platinum: { bg: "#f5f5f5", color: "#5a5a7a", label: "💎 Platinum" },
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

export default function CustomerProfile() {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [vehicleForm, setVehicleForm] = useState({
    brand: "",
    model: "",
    year: "",
    vehicleNumber: "",
    vin: "",
  });
  const [saving, setSaving] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile(token);
      if (data && data.id) {
        setProfile(data);
        setEditForm({ name: data.name || "", phone: data.phone || "" });
      } else {
        addToast("Could not load profile data.", "error");
      }
    } catch {
      addToast("Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadProfile();
    }, 0);
    return () => clearTimeout(t);
  }, [loadProfile]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(
        { name: editForm.name, phone: editForm.phone },
        token,
      );
      if (res.message === "Profile updated successfully.") {
        addToast("Profile updated successfully!", "success");
        setShowEditForm(false);
        await loadProfile();
      } else {
        addToast(res.message || "Failed to update profile.", "error");
      }
    } catch {
      addToast("Server error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (
      !vehicleForm.brand ||
      !vehicleForm.model ||
      !vehicleForm.year ||
      !vehicleForm.vehicleNumber
    ) {
      addToast("Please fill in all required fields.", "error");
      return;
    }
    setAddingVehicle(true);
    try {
      const res = await addVehicleApi(
        {
          brand: vehicleForm.brand,
          model: vehicleForm.model,
          year: parseInt(vehicleForm.year),
          vehicleNumber: vehicleForm.vehicleNumber,
          vin: vehicleForm.vin,
        },
        token,
      );
      if (res.message === "Vehicle added successfully.") {
        addToast("Vehicle added successfully!", "success");
        setShowAddVehicle(false);
        setVehicleForm({
          brand: "",
          model: "",
          year: "",
          vehicleNumber: "",
          vin: "",
        });
        await loadProfile();
      } else {
        addToast(res.message || "Failed to add vehicle.", "error");
      }
    } catch {
      addToast("Server error. Please try again.", "error");
    } finally {
      setAddingVehicle(false);
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
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const tierStyle = TIER_STYLES[profile?.loyaltyTier] || TIER_STYLES.Standard;

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div
            className="spinner"
            style={{ width: "44px", height: "44px", margin: "0 auto 16px" }}
          />
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  /* ── Error / No Profile ── */
  if (!profile) {
    return (
      <div className="page">
        <div className="card empty-state">
          <div
            className="empty-state-icon"
            style={{ fontSize: "48px", opacity: 0.2 }}
          >
            👤
          </div>
          <h3 style={{ marginBottom: "8px" }}>Profile Not Available</h3>
          <p style={{ marginBottom: "16px" }}>
            Unable to load your profile. Please try again.
          </p>
          <button className="btn btn-p" onClick={loadProfile}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const vehicles = profile.vehicles || [];

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="page">
      <Toast
        toasts={toasts}
        onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />

      {/* ── Page Header ── */}
      <div className="ph">
        <div>
          <div className="ph-bc">My Portal</div>
          <div className="ph-title">My Profile</div>
          <div className="ph-sub">
            Manage your account details and registered vehicles.
          </div>
        </div>
      </div>

      {/* ── Profile Hero Card ── */}
      <div
        className="card"
        style={{ marginBottom: "24px", animation: "fadeUp 0.3s ease" }}
      >
        <div
          className="card-top-line"
          style={{
            background: "linear-gradient(90deg, var(--accent), transparent)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Large avatar with initials */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(170,59,255,0.15), rgba(170,59,255,0.04))",
              border: "2px solid rgba(170,59,255,0.25)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              flexShrink: 0,
              letterSpacing: "1px",
            }}
          >
            {getInitials(profile.name)}
          </div>

          {/* Name + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "8px",
                color: "var(--text)",
              }}
            >
              {profile.name}
            </h2>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Role badge */}
              <span
                className="badge b-act"
                style={{ fontSize: "11px", textTransform: "capitalize" }}
              >
                {profile.role || "Customer"}
              </span>

              {/* Loyalty tier badge */}
              <span
                className="badge"
                style={{
                  background: tierStyle.bg,
                  color: tierStyle.color,
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {tierStyle.label}
              </span>

              {/* Member since */}
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                🗓️ Member since {formatDate(profile.createdAt)}
              </span>
            </div>

            {/* Email (read only display) */}
            <div
              style={{
                marginTop: "8px",
                fontSize: "13px",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>✉️</span>
              <span>{profile.email}</span>
            </div>
          </div>

          {/* Edit Profile button */}
          <button
            className="btn btn-g"
            onClick={() => setShowEditForm(!showEditForm)}
          >
            {showEditForm ? "✕ Cancel" : "✏️ Edit Profile"}
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="stats" style={{ marginTop: "20px" }}>
          <div className="sc">
            <div className="sc-n" style={{ color: "#1a7a3a" }}>
              Rs {(profile.totalSpent || 0).toLocaleString()}
            </div>
            <div className="sc-l">Total Spent</div>
          </div>
          <div className="sc">
            <div
              className="sc-n"
              style={{
                color:
                  (profile.creditBalance || 0) > 0 ? "#cc1e1e" : "var(--text)",
              }}
            >
              Rs {(profile.creditBalance || 0).toLocaleString()}
            </div>
            <div className="sc-l">Credit Balance</div>
          </div>
          <div className="sc">
            <div className="sc-n">{vehicles.length}</div>
            <div className="sc-l">Vehicles</div>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Form (animated slide) ── */}
      <div className={`premium-form-container${showEditForm ? " show" : ""}`}>
        <div
          className="card"
          style={{ maxWidth: "600px", marginBottom: "24px" }}
        >
          <div
            className="card-top-line"
            style={{
              background: "linear-gradient(90deg, #1a4faa, transparent)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(26,79,170,0.1)",
                color: "#1a4faa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "17px",
              }}
            >
              ✏️
            </div>
            <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Edit Profile</h3>
          </div>

          <form onSubmit={handleEditSubmit} className="form">
            <div className="form-grid">
              <div className="field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="Your phone number"
                />
              </div>
            </div>

            <div className="field">
              <label>Email (read-only)</label>
              <input
                type="email"
                value={profile.email || ""}
                disabled
                style={{ opacity: 0.55, cursor: "not-allowed" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "4px",
              }}
            >
              <button
                type="button"
                className="btn btn-g"
                onClick={() => setShowEditForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-p" disabled={saving}>
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── My Vehicles Section ── */}
      <div className="card" style={{ animation: "fadeUp 0.35s ease" }}>
        <div
          className="card-top-line"
          style={{ background: "linear-gradient(90deg, #1a7a3a, transparent)" }}
        />

        {/* Vehicles header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(26,122,58,0.1)",
                color: "#1a7a3a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              🚗
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "16px" }}>My Vehicles</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}{" "}
                registered
              </p>
            </div>
          </div>
          <button
            className="btn btn-p"
            onClick={() => setShowAddVehicle(!showAddVehicle)}
          >
            {showAddVehicle ? "✕ Cancel" : "+ Add Vehicle"}
          </button>
        </div>

        {/* ── Add Vehicle inline form ── */}
        {showAddVehicle && (
          <div
            style={{
              marginBottom: "20px",
              padding: "18px",
              background: "rgba(0,0,0,0.02)",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              animation: "fadeUp 0.2s ease",
            }}
          >
            <h4
              style={{
                fontWeight: 600,
                fontSize: "14px",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              🚘 Register New Vehicle
            </h4>
            <form onSubmit={handleAddVehicle} className="form">
              <div className="form-grid">
                <div className="field">
                  <label>Brand / Make *</label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota"
                    value={vehicleForm.brand}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, brand: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Model Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Corolla"
                    value={vehicleForm.model}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, model: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>Year *</label>
                  <input
                    type="number"
                    placeholder="e.g. 2019"
                    min="1980"
                    max={new Date().getFullYear() + 1}
                    value={vehicleForm.year}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, year: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Plate / Registration No. *</label>
                  <input
                    type="text"
                    placeholder="e.g. BA 3 PA 8829"
                    value={vehicleForm.vehicleNumber}
                    onChange={(e) =>
                      setVehicleForm({
                        ...vehicleForm,
                        vehicleNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>VIN / Chassis Number (optional)</label>
                <input
                  type="text"
                  placeholder="17-character chassis number"
                  value={vehicleForm.vin}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, vin: e.target.value })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  className="btn btn-g"
                  onClick={() => setShowAddVehicle(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-p"
                  disabled={addingVehicle}
                >
                  {addingVehicle ? "Adding…" : "✓ Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Vehicle list ── */}
        {vehicles.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 16px" }}>
            <div
              className="empty-state-icon"
              style={{ fontSize: "42px", opacity: 0.18 }}
            >
              🚗
            </div>
            <p style={{ color: "var(--text-secondary)" }}>
              No vehicles registered yet. Click "+ Add Vehicle" to get started.
            </p>
          </div>
        ) : (
          <div className="grid">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="card"
                style={{ animation: "fadeUp 0.3s ease" }}
              >
                <div
                  className="card-top-line"
                  style={{
                    background: "linear-gradient(90deg, #aa3bff, transparent)",
                  }}
                />
                <div className="card-head">
                  <div
                    className="card-av"
                    style={{
                      background: "rgba(170,59,255,0.08)",
                      color: "var(--accent)",
                      fontSize: "18px",
                    }}
                  >
                    🚗
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="card-title"
                      style={{ fontSize: "15px", fontWeight: 700 }}
                    >
                      {v.make || v.brand} {v.model}
                    </div>
                    <div className="card-id">{v.vehicleNumber}</div>
                  </div>
                  <span className="badge b-act">Active</span>
                </div>

                <div className="card-rows" style={{ marginTop: "10px" }}>
                  <div className="card-row">
                    <span className="card-row-ic">🗓️</span>
                    <span className="card-row-lb">Year</span>
                    <span className="card-row-val">{v.year}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-row-ic">🔑</span>
                    <span className="card-row-lb">VIN</span>
                    <span className="card-row-val">
                      {v.vin || "Not recorded"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
