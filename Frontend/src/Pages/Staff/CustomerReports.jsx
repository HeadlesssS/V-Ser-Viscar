import { useState, useEffect, useCallback } from "react";
import "../Admin/Admin.css";

const API = "/api";

const COLORS = ["#cc1e1e", "#1a4faa", "#1a7a3a", "#b05a00", "#6b1a8a"];
const MEDALS = ["🥇", "🥈", "🥉"];

const TIER_STYLES = {
  Standard: {
    bg: "#f0f0f0",
    color: "#6b6375",
    border: "#d0cdd5",
    label: "Standard",
  },
  Gold: {
    bg: "#fffbea",
    color: "#b05a00",
    border: "#f5d78a",
    label: "⭐ Gold",
  },
  Platinum: {
    bg: "#f5f5f5",
    color: "#5a5a7a",
    border: "#c0c0d0",
    label: "💎 Platinum",
  },
};

function TierBadge({ tier }) {
  const s = TIER_STYLES[tier] || TIER_STYLES.Standard;
  return (
    <span
      className="badge"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
}

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

/* ── High Spenders tab ───────────────────────────────────────── */
function HighSpendersTab({ data }) {
  return (
    <div className="grid">
      {data.map((c, i) => {
        const topColor =
          i === 0
            ? "#b8860b"
            : i === 1
              ? "#a8a8a8"
              : i === 2
                ? "#cd7f32"
                : "#cc1e1e";
        const color = COLORS[i % COLORS.length];
        return (
          <div key={c.id} className="card">
            <div className="card-top-line" style={{ background: topColor }} />

            <div className="card-head">
              <div
                className="card-av"
                style={{
                  background: `${color}15`,
                  color,
                  border: `1px solid ${color}30`,
                  fontSize: i < 3 ? 18 : 14,
                }}
              >
                {i < 3
                  ? MEDALS[i]
                  : c.fullName?.slice(0, 2).toUpperCase() || "??"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card-title">{c.fullName}</div>
                <div className="card-id">
                  #{c.id} · Rank #{i + 1}
                </div>
              </div>
              <TierBadge tier={c.loyaltyTier} />
            </div>

            <div className="card-rows">
              <div className="card-row">
                <span className="card-row-ic">✉</span>
                <span className="card-row-lb">Email</span>
                <span className="card-row-val">{c.email || "—"}</span>
              </div>
              <div className="card-row">
                <span className="card-row-ic">📞</span>
                <span className="card-row-lb">Phone</span>
                <span className="card-row-val">{c.phone || "—"}</span>
              </div>
              <div className="card-row">
                <span className="card-row-ic">🧾</span>
                <span className="card-row-lb">Invoices</span>
                <span className="card-row-val">
                  {c.invoiceCount ?? 0} invoice(s)
                </span>
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg,#fff0f0,#fff8f8)",
                border: "1px solid rgba(204,30,30,0.15)",
                borderRadius: 10,
                padding: "10px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, color: "#9c97a3", marginBottom: 3 }}>
                Total Spent
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#cc1e1e" }}>
                Rs {(c.totalSpent ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Regular Customers tab ───────────────────────────────────── */
function RegularCustomersTab({ data }) {
  return (
    <div className="grid">
      {data.map((c, i) => {
        const lastDate = c.lastPurchaseDate
          ? new Date(c.lastPurchaseDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—";
        return (
          <div key={c.id} className="card">
            <div className="card-top-line" style={{ background: "#1a4faa" }} />

            <div className="card-head">
              <div
                className="card-av"
                style={{
                  background: "#1a4faa15",
                  color: "#1a4faa",
                  border: "1px solid #1a4faa30",
                  fontSize: i < 3 ? 18 : 14,
                }}
              >
                {i < 3
                  ? MEDALS[i]
                  : c.fullName?.slice(0, 2).toUpperCase() || "??"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card-title">{c.fullName}</div>
                <div className="card-id">
                  #{c.id} · Rank #{i + 1}
                </div>
              </div>
            </div>

            <div className="card-rows">
              <div className="card-row">
                <span className="card-row-ic">✉</span>
                <span className="card-row-lb">Email</span>
                <span className="card-row-val">{c.email || "—"}</span>
              </div>
              <div className="card-row">
                <span className="card-row-ic">📞</span>
                <span className="card-row-lb">Phone</span>
                <span className="card-row-val">{c.phone || "—"}</span>
              </div>
              <div className="card-row">
                <span className="card-row-ic">📅</span>
                <span className="card-row-lb">Last Buy</span>
                <span className="card-row-val">{lastDate}</span>
              </div>
              <div className="card-row">
                <span className="card-row-ic">💰</span>
                <span className="card-row-lb">Spent</span>
                <span
                  className="card-row-val"
                  style={{ fontWeight: 700, color: "#1a7a3a" }}
                >
                  Rs {(c.totalSpent ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg,#edf3ff,#f5f8ff)",
                border: "1px solid rgba(26,79,170,0.15)",
                borderRadius: 10,
                padding: "10px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, color: "#9c97a3", marginBottom: 3 }}>
                Total Invoices
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1a4faa" }}>
                {c.invoiceCount ?? 0}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Pending Credits tab ─────────────────────────────────────── */
function PendingCreditsTab({ data }) {
  return (
    <div className="grid">
      {data.map((c) => {
        const overdue = (c.overdueDays ?? 0) > 30;
        const oldestDate = c.oldestUnpaidDate
          ? new Date(c.oldestUnpaidDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—";
        const accentColor = overdue ? "#cc1e1e" : "#b05a00";
        return (
          <div key={c.id} className="card">
            <div
              className="card-top-line"
              style={{ background: accentColor }}
            />

            <div className="card-head">
              <div
                className="card-av"
                style={{
                  background: overdue ? "#fff0f0" : "#fff8f0",
                  color: accentColor,
                  border: `1px solid ${accentColor}40`,
                }}
              >
                {c.fullName?.slice(0, 2).toUpperCase() || "??"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card-title">{c.fullName}</div>
                <div className="card-id">#{c.id}</div>
              </div>
              {overdue && <span className="badge b-ina">Overdue</span>}
            </div>

            <div className="card-rows">
              <div className="card-row">
                <span className="card-row-ic">✉</span>
                <span className="card-row-lb">Email</span>
                <span className="card-row-val">{c.email || "—"}</span>
              </div>
              <div className="card-row">
                <span className="card-row-ic">📞</span>
                <span className="card-row-lb">Phone</span>
                <span className="card-row-val">{c.phone || "—"}</span>
              </div>
              <div className="card-row">
                <span className="card-row-ic">📅</span>
                <span className="card-row-lb">Since</span>
                <span className="card-row-val">{oldestDate}</span>
              </div>
              <div className="card-row">
                <span className="card-row-ic">⏱</span>
                <span className="card-row-lb">Overdue</span>
                <span
                  className="card-row-val"
                  style={{ fontWeight: 700, color: accentColor }}
                >
                  {c.overdueDays ?? 0} day(s)
                </span>
              </div>
            </div>

            <div
              style={{
                background: overdue
                  ? "linear-gradient(135deg,#fff0f0,#fff5f5)"
                  : "linear-gradient(135deg,#fff8f0,#fffaf5)",
                border: `1px solid ${accentColor}30`,
                borderRadius: 10,
                padding: "10px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, color: "#9c97a3", marginBottom: 3 }}>
                Credit Balance
              </div>
              <div
                style={{ fontSize: 22, fontWeight: 800, color: accentColor }}
              >
                Rs {(c.creditBalance ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
const TABS = [
  { key: "high", label: "High Spenders", icon: "💰" },
  { key: "regular", label: "Regular Customers", icon: "🔄" },
  { key: "pending", label: "Pending Credits", icon: "⏳" },
];

export default function CustomerReports() {
  const [tab, setTab] = useState("high");
  const [highSpenders, setHighSpenders] = useState([]);
  const [regularCustomers, setRegularCustomers] = useState([]);
  const [pendingCredits, setPendingCredits] = useState([]);
  const [loaded, setLoaded] = useState({
    high: false,
    regular: false,
    pending: false,
  });
  const [loading, setLoading] = useState({
    high: false,
    regular: false,
    pending: false,
  });
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const fetchTab = useCallback(async (which) => {
    setLoading((l) => ({ ...l, [which]: true }));
    try {
      const url =
        which === "high"
          ? `${API}/staff-reports/high-spenders?top=20`
          : which === "regular"
            ? `${API}/staff-reports/regular-customers?top=20`
            : `${API}/staff-reports/pending-credits`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok)
        throw new Error(data.message || `Request failed (${res.status})`);

      if (which === "high") setHighSpenders(data);
      else if (which === "regular") setRegularCustomers(data);
      else setPendingCredits(data);

      setLoaded((l) => ({ ...l, [which]: true }));
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading((l) => ({ ...l, [which]: false }));
    }
  }, []);

  /* Load first tab immediately */
  useEffect(() => {
    const t = setTimeout(() => {
      fetchTab("high");
    }, 0);
    return () => clearTimeout(t);
  }, [fetchTab]);

  /* Lazy-load other tabs on first visit */
  useEffect(() => {
    const t = setTimeout(() => {
      if (tab === "regular" && !loaded.regular) fetchTab("regular");
      if (tab === "pending" && !loaded.pending) fetchTab("pending");
    }, 0);
    return () => clearTimeout(t);
  }, [tab, loaded, fetchTab]);

  const counts = {
    high: highSpenders.length,
    regular: regularCustomers.length,
    pending: pendingCredits.length,
  };

  const totalPending = pendingCredits.reduce(
    (s, c) => s + (c.creditBalance ?? 0),
    0,
  );

  return (
    <div className="page">
      <Toast
        toasts={toasts}
        onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />

      {/* Page header */}
      <div className="ph">
        <div>
          <p className="ph-bc">Staff › Reports</p>
          <h1 className="ph-title">Customer Reports</h1>
          <p className="ph-sub">
            Insights on top spenders, frequent buyers, and pending credit
            balances.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-g"
          onClick={() => fetchTab(tab, true)}
          disabled={loading[tab]}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="stats">
        <div className="sc">
          <span className="sc-n">{counts.high}</span>
          <span className="sc-l">High Spenders</span>
        </div>
        <div className="sc">
          <span className="sc-n" style={{ color: "#1a4faa" }}>
            {counts.regular}
          </span>
          <span className="sc-l">Regular Customers</span>
        </div>
        <div className="sc">
          <span className="sc-n" style={{ color: "#b05a00" }}>
            {counts.pending}
          </span>
          <span className="sc-l">Pending Credits</span>
        </div>
        <div className="sc">
          <span className="sc-n" style={{ color: "#cc1e1e" }}>
            Rs {totalPending.toLocaleString()}
          </span>
          <span className="sc-l">Total Pending Amount</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="ft" style={{ marginBottom: 20, width: "fit-content" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`ftb ${tab === t.key ? "ftb-on" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
            {counts[t.key] > 0 && (
              <span
                style={{
                  display: "inline-block",
                  background:
                    tab === t.key ? "rgba(255,255,255,0.25)" : "#f0f0f0",
                  borderRadius: 10,
                  padding: "1px 7px",
                  marginLeft: 5,
                  fontSize: 11,
                }}
              >
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading[tab] ? (
        <div className="empty-state">
          <div className="spinner" />
          <p>Loading data…</p>
        </div>
      ) : tab === "high" ? (
        highSpenders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <p>No high spender data available.</p>
          </div>
        ) : (
          <HighSpendersTab data={highSpenders} />
        )
      ) : tab === "regular" ? (
        regularCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔄</div>
            <p>No regular customer data available.</p>
          </div>
        ) : (
          <RegularCustomersTab data={regularCustomers} />
        )
      ) : pendingCredits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <p>No pending credits — all balances cleared!</p>
        </div>
      ) : (
        <PendingCreditsTab data={pendingCredits} />
      )}
    </div>
  );
}
