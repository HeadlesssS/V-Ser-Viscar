import { useState, useEffect, useCallback } from "react";
import ExportPdfButton from "../../components/ExportPdfButton";
import "./Admin.css";

const BASE_URL = "/api";

const STATUS_CFG = {
  Pending:   { color: "#92400e", bg: "#fffbeb", border: "#fbbf24", accentBar: "#d97706" },
  Confirmed: { color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", accentBar: "#10b981" },
  Completed: { color: "#1e40af", bg: "#eff6ff", border: "#93c5fd", accentBar: "#3b82f6" },
  Cancelled: { color: "#991b1b", bg: "#fef2f2", border: "#fca5a5", accentBar: "#ef4444" },
};

const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

/* ── SVG Icons ── */
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const CarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-3"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const DoubleCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 13 13"/>
    <polyline points="7 11 11 15 3 23"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* ── Toast ── */
let _toastId = 0;
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "success") => {
    const id = ++_toastId;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, push, remove };
}

/* ── Helpers ── */
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

/* ── StatusBadge ── */
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || {};
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 600,
      background: cfg.bg || "#f7f7f8",
      color: cfg.color || "#6b6375",
      border: `1px solid ${cfg.border || "#e5e4e7"}`,
      whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

/* ── AppointmentCard ── */
function AppointmentCard({ appt, onStatusChange, updating }) {
  const cfg = STATUS_CFG[appt.status] || {};
  const isUpdating = updating === appt.id;
  const showActions = appt.status === "Pending" || appt.status === "Confirmed";

  return (
    <div className="card" style={{ border: `1px solid ${cfg.border || "#e5e4e7"}` }}>
      {/* Accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        borderRadius: "14px 14px 0 0",
        background: cfg.accentBar || "#e5e4e7",
      }} />

      {/* Header */}
      <div className="card-head" style={{ marginTop: "6px" }}>
        <div className="card-av" style={{ background: cfg.bg || "#f7f7f8", color: cfg.color || "#6b6375" }}>
          {initials(appt.customerName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card-title">{appt.customerName}</div>
          <div className="card-id">#{appt.id}</div>
        </div>
        <StatusBadge status={appt.status} />
      </div>

      {/* Details */}
      <div className="card-rows">
        <div className="card-row">
          <span className="card-row-ic"><PhoneIcon /></span>
          <span className="card-row-lb">Phone</span>
          <span className="card-row-val">{appt.customerPhone || "—"}</span>
        </div>
        <div className="card-row">
          <span className="card-row-ic"><CarIcon /></span>
          <span className="card-row-lb">Vehicle</span>
          <span className="card-row-val">
            {[appt.vehicleNumber, appt.make, appt.model].filter(Boolean).join(" · ") || "—"}
          </span>
        </div>
        <div className="card-row">
          <span className="card-row-ic"><UserIcon /></span>
          <span className="card-row-lb">Service</span>
          <span className="card-row-val">{appt.serviceType || "—"}</span>
        </div>
        <div className="card-row">
          <span className="card-row-ic"><CalendarIcon /></span>
          <span className="card-row-lb">Date</span>
          <span className="card-row-val">{formatDate(appt.appointmentDate)}</span>
        </div>
        {appt.notes && (
          <div className="card-row">
            <span className="card-row-ic" style={{ opacity: 0.5, fontSize: 11 }}>N</span>
            <span className="card-row-lb">Notes</span>
            <span className="card-row-val" style={{ fontStyle: "italic", color: "#6b6375" }}>{appt.notes}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="card-actions">
          {appt.status === "Pending" && (
            <button
              className="bic bic-e"
              disabled={isUpdating}
              onClick={() => onStatusChange(appt.id, "Confirmed")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                background: "#ecfdf5", color: "#065f46", borderColor: "#6ee7b7",
              }}
            >
              <CheckIcon /> Confirm
            </button>
          )}
          {appt.status === "Confirmed" && (
            <button
              className="bic bic-e"
              disabled={isUpdating}
              onClick={() => onStatusChange(appt.id, "Completed")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                background: "#eff6ff", color: "#1e40af", borderColor: "#93c5fd",
              }}
            >
              <DoubleCheckIcon /> Complete
            </button>
          )}
          <button
            className="bic bic-d"
            disabled={isUpdating}
            onClick={() => onStatusChange(appt.id, "Cancelled")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              background: "#fef2f2", color: "#991b1b", borderColor: "#fca5a5",
            }}
          >
            <XIcon /> Cancel
          </button>
        </div>
      )}
      {isUpdating && (
        <div style={{ textAlign: "center", padding: "4px 0", fontSize: 12, color: "#9c97a3" }}>
          Updating…
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function AppointmentsPage() {
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const { toasts, push, remove } = useToast();

  /* Fetch */
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      push(err.message || "Failed to load appointments", "error");
    } finally {
      setLoading(false);
    }
  }, [token, push]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  /* Update status */
  const handleStatusChange = useCallback(async (id, status) => {
    setUpdating(id);
    try {
      const res = await fetch(`${BASE_URL}/appointments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status } : a))
      );
      push(`Appointment ${status.toLowerCase()} successfully`, "success");
    } catch (err) {
      push(err.message || "Failed to update status", "error");
    } finally {
      setUpdating(null);
    }
  }, [token, push]);

  /* Stats */
  const counts = {
    Total:     appointments.length,
    Pending:   appointments.filter(a => a.status === "Pending").length,
    Confirmed: appointments.filter(a => a.status === "Confirmed").length,
    Completed: appointments.filter(a => a.status === "Completed").length,
    Cancelled: appointments.filter(a => a.status === "Cancelled").length,
  };

  /* Filtered list */
  const q = search.trim().toLowerCase();
  const filtered = appointments.filter(a => {
    const matchFilter = filter === "All" || a.status === filter;
    const matchSearch = !q ||
      (a.customerName || "").toLowerCase().includes(q) ||
      (a.serviceType || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="page">
      {/* Toast */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span style={{ flex: 1 }}>{t.msg}</span>
            <button className="toast-close" onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>

      {/* Page Header */}
      <div className="ph">
        <div>
          <div className="ph-bc">Management</div>
          <div className="ph-title">Appointments</div>
          <div className="ph-sub">View and manage all service appointments</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <ExportPdfButton
            path="/appointments"
            filename="appointments.pdf"
            label="Export PDF"
          />
          <button className="btn btn-p" onClick={fetchAppointments} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        {[
          { label: "Total",     value: counts.Total,     style: {} },
          { label: "Pending",   value: counts.Pending,   style: { color: "#d97706" } },
          { label: "Confirmed", value: counts.Confirmed, style: { color: "#10b981" } },
          { label: "Completed", value: counts.Completed, style: { color: "#3b82f6" } },
          { label: "Cancelled", value: counts.Cancelled, style: { color: "#ef4444" } },
        ].map(s => (
          <div key={s.label} className="sc">
            <div className="sc-n" style={s.style}>{s.value}</div>
            <div className="sc-l">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="tb">
        <div className="sw">
          <span className="sw-ic"><SearchIcon /></span>
          <input
            className="sw-in"
            placeholder="Search by customer or service type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="ft">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`ftb${filter === f ? " ftb-on" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner" />
          <p>Loading appointments…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CalendarIcon />
          </div>
          <p>{search || filter !== "All" ? "No appointments match your filters." : "No appointments found."}</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map(appt => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              onStatusChange={handleStatusChange}
              updating={updating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
