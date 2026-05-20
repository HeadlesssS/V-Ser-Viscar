import { useState, useEffect, useCallback } from "react";
import "./Customer.css";

const BASE_URL = "/api";

/* ── API helpers ── */
const parseApiResponse = async (res) => {
  const raw = await res.text();
  let payload = {};

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = { message: raw };
    }
  }

  if (!res.ok) {
    const validationErrors = payload?.errors
      ? Object.values(payload.errors).flat().join(" ")
      : "";
    return {
      success: false,
      status: res.status,
      data: payload,
      message:
        validationErrors ||
        payload?.message ||
        `Request failed with status ${res.status}.`,
    };
  }

  return { success: true, status: res.status, data: payload };
};

const bookAppointment = async (data, token) => {
  const res = await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return parseApiResponse(res);
};

const getMyAppointments = async (token) => {
  const res = await fetch(`${BASE_URL}/appointments/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse(res);
};

const getProfile = async (token) => {
  const res = await fetch(`${BASE_URL}/customers/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseApiResponse(res);
};

/* ── constants ── */
const SERVICE_ICONS = {
  "Oil Change": "🛢️",
  "Brake Service": "🔧",
  "Engine Repair": "⚙️",
  "Tyre Replacement": "🔄",
  "Battery Check": "🔋",
  "General Service": "🔩",
};

const STATUS_CONFIG = {
  Pending: {
    color: "#92400e",
    bg: "#fef3c7",
    border: "#fcd34d",
    dot: "#f59e0b",
    accentBar: "#eab308",
  },
  Confirmed: {
    color: "#1a7a3a",
    bg: "#edf7f0",
    border: "#b3dfc0",
    dot: "#22c55e",
    accentBar: "#22c55e",
  },
  Completed: {
    color: "#1a4faa",
    bg: "#edf0ff",
    border: "#aac4f0",
    dot: "#3b82f6",
    accentBar: "#3b82f6",
  },
  Cancelled: {
    color: "#cc1e1e",
    bg: "#fff0f0",
    border: "rgba(204,30,30,0.3)",
    dot: "#ef4444",
    accentBar: "#ef4444",
  },
};

function getDaysUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function Appointments() {
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vehicleId: "",
    appointmentDate: "",
    serviceType: "",
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const serviceTypes = [
    "Oil Change",
    "Brake Service",
    "Engine Repair",
    "Tyre Replacement",
    "Battery Check",
    "General Service",
  ];

  const loadData = useCallback(async () => {
    if (!token) {
      setError("Please sign in to view appointments.");
      setPageLoading(false);
      return;
    }

    const [apptsRes, profileRes] = await Promise.all([
      getMyAppointments(token),
      getProfile(token),
    ]);

    if (apptsRes.success && Array.isArray(apptsRes.data)) {
      setAppointments(apptsRes.data);
    } else if (!apptsRes.success) {
      setError(apptsRes.message || "Failed to load appointments.");
    }

    if (profileRes.success && profileRes.data?.vehicles) {
      setVehicles(profileRes.data.vehicles);
    } else if (!profileRes.success) {
      setError(profileRes.message || "Failed to load profile.");
    }

    setPageLoading(false);
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!token) {
      setError("Please sign in first.");
      setLoading(false);
      return;
    }

    const selectedVehicleId = Number(form.vehicleId);
    if (!Number.isInteger(selectedVehicleId) || selectedVehicleId <= 0) {
      setError("Please select a valid vehicle.");
      setLoading(false);
      return;
    }

    const selectedDate = new Date(form.appointmentDate);
    if (Number.isNaN(selectedDate.getTime())) {
      setError("Please choose a valid appointment date and time.");
      setLoading(false);
      return;
    }

    if (selectedDate <= new Date()) {
      setError("Appointment date must be in the future.");
      setLoading(false);
      return;
    }

    try {
      const res = await bookAppointment(
        {
          vehicleId: selectedVehicleId,
          appointmentDate: selectedDate.toISOString(),
          serviceType: form.serviceType,
          notes: form.notes,
        },
        token,
      );

      if (res.success || res.message === "Appointment booked successfully.") {
        setMessage("Appointment booked successfully!");
        setShowForm(false);
        setForm({
          vehicleId: "",
          appointmentDate: "",
          serviceType: "",
          notes: "",
        });
        await loadData();
      } else {
        setError(res.message || "Failed to book appointment.");
      }
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived stats ── */
  const totalCount = appointments.length;
  const upcomingCount = appointments.filter(
    (a) => a.status === "Pending" || a.status === "Confirmed",
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status === "Completed",
  ).length;
  const cancelledCount = appointments.filter(
    (a) => a.status === "Cancelled",
  ).length;

  /* ── Filter ── */
  const filteredAppts = appointments.filter((a) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Upcoming")
      return a.status === "Pending" || a.status === "Confirmed";
    return a.status === activeFilter;
  });

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="page">
      {/* ── Page Header ── */}
      <div className="ph">
        <div>
          <div className="ph-bc">My Portal</div>
          <div className="ph-title">My Appointments</div>
          <div className="ph-sub">
            Manage, book and review your upcoming vehicle maintenance.
          </div>
        </div>
        <button className="btn btn-p" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "+ Book Appointment"}
        </button>
      </div>

      {/* ── Booking Form (animated slide) ── */}
      <div className={`premium-form-container${showForm ? " show" : ""}`}>
        <div
          className="card"
          style={{ maxWidth: "620px", marginBottom: "24px" }}
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
              gap: "12px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(170,59,255,0.1)",
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              📅
            </div>
            <h3 style={{ fontWeight: 700, fontSize: "16px" }}>
              Book New Appointment
            </h3>
          </div>

          {error && (
            <div
              style={{
                background: "#fff0f0",
                border: "1px solid rgba(204,30,30,0.3)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#cc1e1e",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <div className="form-grid">
              <div className="field">
                <label>Select Vehicle</label>
                <select
                  value={form.vehicleId}
                  onChange={(e) =>
                    setForm({ ...form, vehicleId: e.target.value })
                  }
                  required
                >
                  <option value="">— Select a vehicle —</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleNumber} — {v.make || v.brand} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Service Type</label>
                <select
                  value={form.serviceType}
                  onChange={(e) =>
                    setForm({ ...form, serviceType: e.target.value })
                  }
                  required
                >
                  <option value="">— Select service —</option>
                  {serviceTypes.map((s) => (
                    <option key={s} value={s}>
                      {SERVICE_ICONS[s]} {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Date &amp; Time</label>
              <input
                type="datetime-local"
                value={form.appointmentDate}
                onChange={(e) =>
                  setForm({ ...form, appointmentDate: e.target.value })
                }
                required
                style={{ cursor: "pointer" }}
              />
            </div>

            <div className="field">
              <label>Notes (optional)</label>
              <textarea
                rows={3}
                placeholder="Describe the issue or specify any requests…"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  padding: "12px",
                  borderRadius: "8px",
                  color: "#08060d",
                  fontSize: "14px",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#cc1e1e";
                  e.target.style.boxShadow = "0 0 0 3px rgba(204,30,30,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              className="btn btn-p"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? "⏳ Booking…" : "✓ Book Appointment"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Success message ── */}
      {message && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #b3dfc0",
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#1a5c30",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ✅ {message}
        </div>
      )}

      {/* ── Page content ── */}
      {pageLoading ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div
            className="spinner"
            style={{ width: "44px", height: "44px", margin: "0 auto 16px" }}
          />
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Loading appointments…
          </p>
        </div>
      ) : (
        <>
          {/* ── Stats Row ── */}
          <div className="stats">
            <div className="sc" style={{ flex: 1, minWidth: "90px" }}>
              <div className="sc-n">{totalCount}</div>
              <div className="sc-l">Total</div>
            </div>
            <div
              className="sc"
              style={{
                flex: 1,
                minWidth: "90px",
                borderTop: "3px solid #f59e0b",
              }}
            >
              <div className="sc-n" style={{ color: "#92400e" }}>
                {upcomingCount}
              </div>
              <div className="sc-l">Upcoming</div>
            </div>
            <div
              className="sc"
              style={{
                flex: 1,
                minWidth: "90px",
                borderTop: "3px solid #3b82f6",
              }}
            >
              <div className="sc-n" style={{ color: "#1a4faa" }}>
                {completedCount}
              </div>
              <div className="sc-l">Completed</div>
            </div>
            <div
              className="sc"
              style={{
                flex: 1,
                minWidth: "90px",
                borderTop: "3px solid #ef4444",
              }}
            >
              <div className="sc-n" style={{ color: "#cc1e1e" }}>
                {cancelledCount}
              </div>
              <div className="sc-l">Cancelled</div>
            </div>
          </div>

          {/* ── Filter Tabs ── */}
          <div className="tb">
            <div className="ft">
              {[
                { key: "All", label: "All", count: totalCount },
                { key: "Upcoming", label: "Upcoming", count: upcomingCount },
                { key: "Completed", label: "Completed", count: completedCount },
                { key: "Cancelled", label: "Cancelled", count: cancelledCount },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  className={`ftb ${activeFilter === key ? "ftb-on" : ""}`}
                  onClick={() => setActiveFilter(key)}
                >
                  {label}
                  <span
                    style={{
                      opacity: 0.65,
                      marginLeft: "4px",
                      fontSize: "11px",
                    }}
                  >
                    ({count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Appointments Grid ── */}
          {filteredAppts.length === 0 ? (
            <div className="card empty-state">
              <div
                className="empty-state-icon"
                style={{ fontSize: "56px", opacity: 0.18 }}
              >
                {activeFilter === "Upcoming"
                  ? "📅"
                  : activeFilter === "Completed"
                    ? "✅"
                    : activeFilter === "Cancelled"
                      ? "❌"
                      : "🚗"}
              </div>
              <h3 style={{ color: "var(--text)", marginBottom: "8px" }}>
                {activeFilter === "Upcoming"
                  ? "No Upcoming Appointments"
                  : activeFilter === "All" && totalCount === 0
                    ? "No Appointments Yet"
                    : `No ${activeFilter} Appointments`}
              </h3>
              <p style={{ marginBottom: "16px" }}>
                {activeFilter === "All" && totalCount === 0
                  ? 'You have no scheduled service appointments. Click "+ Book Appointment" to get started.'
                  : `No ${activeFilter.toLowerCase()} appointments to display.`}
              </p>
              {activeFilter !== "All" && (
                <button
                  className="btn btn-g"
                  onClick={() => setActiveFilter("All")}
                >
                  View All
                </button>
              )}
            </div>
          ) : (
            <div className="appointment-grid">
              {filteredAppts.map((a) => {
                const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.Pending;
                const icon = SERVICE_ICONS[a.serviceType] || "🔧";
                const apptDate = new Date(a.appointmentDate);
                const daysUntil = getDaysUntil(a.appointmentDate);
                const isUpcoming =
                  a.status === "Pending" || a.status === "Confirmed";

                return (
                  <div
                    key={a.id}
                    className={`card appointment-card ${a.status}`}
                    style={{
                      gap: "14px",
                      borderTop: `4px solid ${cfg.accentBar}`,
                    }}
                  >
                    {/* ── Card Header ── */}
                    <div className="card-head">
                      <div
                        className="card-av"
                        style={{
                          background: `${cfg.dot}18`,
                          color: cfg.dot,
                          fontSize: "22px",
                          width: "50px",
                          height: "50px",
                          borderRadius: "12px",
                          flexShrink: 0,
                        }}
                      >
                        {icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="card-title"
                          style={{ fontSize: "15px", fontWeight: 700 }}
                        >
                          {a.serviceType}
                        </div>
                        <div
                          className="card-id"
                          style={{ marginTop: "3px", fontSize: "12px" }}
                        >
                          {a.vehicleNumber}
                          {a.make || a.brand
                            ? ` — ${a.make || a.brand} ${a.model}`
                            : ""}
                        </div>
                      </div>
                      {/* Status badge with dot indicator */}
                      <span
                        className="badge"
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                          padding: "4px 10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: cfg.dot,
                            flexShrink: 0,
                          }}
                        />
                        {a.status}
                      </span>
                    </div>

                    {/* ── Date Display ── */}
                    <div
                      style={{
                        background: "#f7f7f8",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {/* Calendar chip */}
                      <div
                        style={{
                          background: cfg.dot,
                          color: "#fff",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          textAlign: "center",
                          minWidth: "52px",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: 800,
                            lineHeight: 1,
                          }}
                        >
                          {apptDate.getDate()}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            textTransform: "uppercase",
                            opacity: 0.9,
                            marginTop: "1px",
                          }}
                        >
                          {apptDate.toLocaleString("en-GB", {
                            month: "short",
                          })}
                        </div>
                      </div>

                      {/* Date text */}
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--text)",
                          }}
                        >
                          {apptDate.toLocaleString("en-GB", {
                            weekday: "long",
                          })}
                          , {apptDate.getFullYear()}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            marginTop: "2px",
                          }}
                        >
                          {apptDate.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      {/* Countdown badge */}
                      {isUpcoming && daysUntil >= 0 && (
                        <div
                          style={{
                            marginLeft: "auto",
                            background: `${cfg.dot}18`,
                            color: cfg.color,
                            borderRadius: "8px",
                            padding: "5px 11px",
                            fontSize: "11px",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {daysUntil === 0
                            ? "Today!"
                            : daysUntil === 1
                              ? "Tomorrow"
                              : `In ${daysUntil} days`}
                        </div>
                      )}
                    </div>

                    {/* ── Notes ── */}
                    {a.notes && (
                      <div className="card-row">
                        <span className="card-row-ic">📝</span>
                        <span className="card-row-lb" style={{ width: "44px" }}>
                          Notes
                        </span>
                        <span className="card-row-val">{a.notes}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
