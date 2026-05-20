import { useState, useEffect, useCallback, Fragment } from "react";
import { downloadPdf } from "../../utils/pdfExport";
import "./Admin.css";

const BASE_URL = "/api";

const ENTITY_LABELS = {
  SalesInvoice: "Sales Invoice",
  PurchaseInvoice: "Purchase Invoice",
  PartRequest: "Part Request",
  Appointment: "Appointment",
  Review: "Review",
  Part: "Part",
  Vendor: "Vendor",
  Customer: "Customer",
  Vehicle: "Vehicle",
  User: "User",
  AIPrediction: "AI Prediction",
  Notification: "Notification",
  Auth: "Authentication",
};

const ACTION_COLORS = {
  Create: { bg: "#edf7f0", color: "#1a7a3a", border: "#b3dfc0" },
  Update: { bg: "#eff6ff", color: "#1e40af", border: "#93c5fd" },
  Delete: { bg: "#fff0f0", color: "#cc1e1e", border: "rgba(204,30,30,0.25)" },
  Login: { bg: "#f5f3ff", color: "#7c3aed", border: "#c4b5fd" },
};

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function ActionBadge({ action }) {
  const cfg = ACTION_COLORS[action] || {
    bg: "#f7f7f8",
    color: "#6b6375",
    border: "#e5e4e7",
  };
  return (
    <span
      className="badge"
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {action}
    </span>
  );
}

function EntityBadge({ type }) {
  return (
    <span
      className="badge"
      style={{
        background: "#f7f7f8",
        color: "#3a3540",
        border: "1px solid #e5e4e7",
      }}
    >
      {ENTITY_LABELS[type] || type}
    </span>
  );
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const pageSize = 30;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (entityType) params.set("entityType", entityType);
      if (actionFilter) params.set("action", actionFilter);
      if (search) params.set("search", search);

      const [logsRes, summaryRes] = await Promise.all([
        fetch(`${BASE_URL}/audit?${params}`, { headers: authHeader() }),
        fetch(`${BASE_URL}/audit/summary`, { headers: authHeader() }),
      ]);

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.items || []);
        setTotal(data.total || 0);
      } else {
        setLogs([]);
        setTotal(0);
      }

      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, entityType, actionFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const exportAuditPdf = async () => {
    const params = new URLSearchParams();
    if (entityType) params.set("entityType", entityType);
    if (actionFilter) params.set("action", actionFilter);
    if (search) params.set("search", search);
    const qs = params.toString();
    try {
      await downloadPdf(`/audit-log${qs ? `?${qs}` : ""}`, "audit-log.pdf");
    } catch (err) {
      alert(err.message || "PDF export failed");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const formatTime = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const topEntities = summary?.byEntityType
    ? Object.entries(summary.byEntityType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div className="ph-bc">Admin / Audit Log</div>
          <div className="ph-title">Activity Audit Log</div>
          <div className="ph-sub">
            Track operations: invoices, appointments, part requests, reviews, users, and more.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-g" onClick={exportAuditPdf}>
            📄 Export PDF
          </button>
          <button type="button" className="btn btn-g" onClick={loadData} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="sc">
          <div className="sc-n">{summary?.total ?? "—"}</div>
          <div className="sc-l">Total Events</div>
        </div>
        <div className="sc">
          <div className="sc-n sc-n-g">{summary?.today ?? "—"}</div>
          <div className="sc-l">Today</div>
        </div>
        {topEntities.map(([type, count]) => (
          <div key={type} className="sc">
            <div className="sc-n" style={{ fontSize: 20 }}>{count}</div>
            <div className="sc-l">{ENTITY_LABELS[type] || type}</div>
          </div>
        ))}
      </div>

      <div className="tb">
        <form className="sw" onSubmit={handleSearch}>
          <span className="sw-ic">⌕</span>
          <input
            className="sw-in"
            placeholder="Search description, user, entity…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        <select
          className="sw-in"
          style={{ flex: "0 0 160px", paddingLeft: 12 }}
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
        >
          <option value="">All entity types</option>
          {Object.keys(ENTITY_LABELS).map((k) => (
            <option key={k} value={k}>{ENTITY_LABELS[k]}</option>
          ))}
        </select>
        <select
          className="sw-in"
          style={{ flex: "0 0 130px", paddingLeft: 12 }}
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
        >
          <option value="">All actions</option>
          <option value="Create">Create</option>
          <option value="Update">Update</option>
          <option value="Delete">Delete</option>
          <option value="Login">Login</option>
        </select>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e4e7", borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9c97a3" }}>Loading audit log…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9c97a3" }}>
            <div style={{ fontWeight: 600, color: "#3a3540", marginBottom: 4 }}>No audit events yet</div>
            <div style={{ fontSize: 13 }}>Events appear as users perform actions in the app.</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f7f7f8", borderBottom: "1px solid #e5e4e7" }}>
                {["Time", "User", "Action", "Entity", "Description", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9c97a3", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <Fragment key={log.id}>
                  <tr
                    style={{ borderBottom: "1px solid #f0eff2", cursor: log.oldValues || log.newValues ? "pointer" : "default" }}
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#6b6375", whiteSpace: "nowrap" }}>{formatTime(log.timestamp)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>{log.userName || "System"}</div>
                      {log.userRole && <div style={{ fontSize: 11, color: "#9c97a3" }}>{log.userRole}</div>}
                    </td>
                    <td style={{ padding: "12px 14px" }}><ActionBadge action={log.action} /></td>
                    <td style={{ padding: "12px 14px" }}>
                      <EntityBadge type={log.entityType} />
                      {log.entityId != null && <span style={{ marginLeft: 6, fontSize: 11, color: "#9c97a3" }}>#{log.entityId}</span>}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#3a3540", maxWidth: 360 }}>{log.description}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      {(log.oldValues || log.newValues) && <span style={{ fontSize: 11, color: "#9c97a3" }}>{expandedId === log.id ? "▲" : "▼"}</span>}
                    </td>
                  </tr>
                  {expandedId === log.id && (log.oldValues || log.newValues) && (
                    <tr>
                      <td colSpan={6} style={{ padding: "10px 14px 14px", background: "#fafafa", borderBottom: "1px solid #f0eff2" }}>
                        <div style={{ display: "flex", gap: 16, fontSize: 12, flexWrap: "wrap" }}>
                          {log.oldValues && (
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div style={{ fontWeight: 600, color: "#9c97a3", marginBottom: 4 }}>Previous</div>
                              <code style={{ background: "#fff0f0", padding: "4px 8px", borderRadius: 4, color: "#cc1e1e" }}>{log.oldValues}</code>
                            </div>
                          )}
                          {log.newValues && (
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div style={{ fontWeight: 600, color: "#9c97a3", marginBottom: 4 }}>New</div>
                              <code style={{ background: "#edf7f0", padding: "4px 8px", borderRadius: 4, color: "#1a7a3a" }}>{log.newValues}</code>
                            </div>
                          )}
                          {log.ipAddress && <div style={{ fontSize: 11, color: "#9c97a3" }}>IP: {log.ipAddress}</div>}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
          <button type="button" className="btn btn-g" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Previous</button>
          <span style={{ fontSize: 13, color: "#6b6375" }}>Page {page} of {totalPages} ({total} events)</span>
          <button type="button" className="btn btn-g" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
