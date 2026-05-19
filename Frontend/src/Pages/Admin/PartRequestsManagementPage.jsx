import { useState, useEffect, useCallback } from "react";
import "./Admin.css";

const BASE_URL = "/api";

const STATUS_CFG = {
  Pending:   { color: "#92400e", bg: "#fffbeb", border: "#fbbf24", accentBar: "#d97706" },
  Fulfilled: { color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", accentBar: "#10b981" },
  Rejected:  { color: "#991b1b", bg: "#fef2f2", border: "#fca5a5", accentBar: "#ef4444" },
};

const FILTERS = ["All", "Pending", "Fulfilled", "Rejected"];

/* ── SVG Icons ── */
const PackageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const WrenchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
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
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const AlignLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="17" y1="10" x2="3" y2="10"/>
    <line x1="21" y1="6" x2="3" y2="6"/>
    <line x1="21" y1="14" x2="3" y2="14"/>
    <line x1="17" y1="18" x2="3" y2="18"/>
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

/* ── PartRequestCard ── */
function PartRequestCard({ req, onStatusChange, updating }) {
  const cfg = STATUS_CFG[req.status] || {};
  const isUpdating = updating === req.id;
  const showActions = req.status === "Pending";

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
          {initials(req.customerName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card-title">{req.customerName}</div>
          <div className="card-id">#{req.id}</div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {/* Details */}
      <div className="card-rows">
        {/* Part name + quantity badge */}
        <div className="card-row" style={{ alignItems: "center" }}>
          <span className="card-row-ic"><PackageIcon /></span>
          <span className="card-row-lb">Part</span>
          <span className="card-row-val" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, color: "#08060d" }}>{req.partName || "—"}</span>
            {req.quantityRequested != null && (
              <span style={{
                display: "inline-block",
                padding: "1px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 700,
                background: "#f0f4ff",
                color: "#3b5bdb",
                border: "1px solid #bac8ff",
              }}>
                Qty: {req.quantityRequested}
              </span>
            )}
          </span>
        </div>

        {req.description && (
          <div className="card-row">
            <span className="card-row-ic"><AlignLeftIcon /></span>
            <span className="card-row-lb">Desc</span>
            <span className="card-row-val" style={{ color: "#6b6375", fontStyle: "italic" }}>
              {req.description}
            </span>
          </div>
        )}

        <div className="card-row">
          <span className="card-row-ic"><UserIcon /></span>
          <span className="card-row-lb">Customer</span>
          <span className="card-row-val">{req.customerName || "—"}</span>
        </div>

        <div className="card-row">
          <span className="card-row-ic"><CalendarIcon /></span>
          <span className="card-row-lb">Requested</span>
          <span className="card-row-val">{formatDate(req.requestedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="card-actions">
          <button
            className="bic bic-e"
            disabled={isUpdating}
            onClick={() => onStatusChange(req.id, "Fulfilled")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              background: "#ecfdf5", color: "#065f46", borderColor: "#6ee7b7",
            }}
          >
            <CheckIcon /> Fulfill
          </button>
          <button
            className="bic bic-d"
            disabled={isUpdating}
            onClick={() => onStatusChange(req.id, "Rejected")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              background: "#fef2f2", color: "#991b1b", borderColor: "#fca5a5",
            }}
          >
            <XIcon /> Reject
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
export default function PartRequestsManagementPage() {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const { toasts, push, remove } = useToast();

  /* Fetch */
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/part-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      push(err.message || "Failed to load part requests", "error");
    } finally {
      setLoading(false);
    }
  }, [token, push]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  /* Update status */
  const handleStatusChange = useCallback(async (id, status) => {
    setUpdating(id);
    try {
      const res = await fetch(`${BASE_URL}/part-requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status } : r))
      );
      push(`Request marked as ${status.toLowerCase()}`, "success");
    } catch (err) {
      push(err.message || "Failed to update status", "error");
    } finally {
      setUpdating(null);
    }
  }, [token, push]);

  /* Stats */
  const counts = {
    Total:     requests.length,
    Pending:   requests.filter(r => r.status === "Pending").length,
    Fulfilled: requests.filter(r => r.status === "Fulfilled").length,
    Rejected:  requests.filter(r => r.status === "Rejected").length,
  };

  /* Filtered list */
  const q = search.trim().toLowerCase();
  const filtered = requests.filter(r => {
    const matchFilter = filter === "All" || r.status === filter;
    const matchSearch = !q ||
      (r.customerName || "").toLowerCase().includes(q) ||
      (r.partName || "").toLowerCase().includes(q);
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
          <div className="ph-title">Part Requests</div>
          <div className="ph-sub">Review and respond to customer part requests</div>
        </div>
        <button className="btn btn-p" onClick={fetchRequests} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="stats">
        {[
          { label: "Total",     value: counts.Total,     style: {} },
          { label: "Pending",   value: counts.Pending,   style: { color: "#d97706" } },
          { label: "Fulfilled", value: counts.Fulfilled, style: { color: "#10b981" } },
          { label: "Rejected",  value: counts.Rejected,  style: { color: "#ef4444" } },
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
            placeholder="Search by customer or part name…"
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
          <p>Loading part requests…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <WrenchIcon />
          </div>
          <p>{search || filter !== "All" ? "No requests match your filters." : "No part requests found."}</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map(req => (
            <PartRequestCard
              key={req.id}
              req={req}
              onStatusChange={handleStatusChange}
              updating={updating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
