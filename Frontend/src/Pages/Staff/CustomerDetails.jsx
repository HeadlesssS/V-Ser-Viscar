import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ExportPdfButton from "../../components/ExportPdfButton";
import "../Admin/Admin.css";

const API = "/api";

// ── Helpers ────────────────────────────────────────────────────────────────

async function apiJson(url) {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data.message || `Request failed (${res.status})`);
  return data;
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

const COLORS = ["#cc1e1e", "#1a4faa", "#1a7a3a", "#b05a00", "#6b1a8a"];

const SEARCH_TYPES = [
  {
    key: "name",
    label: "Name",
    icon: "👤",
    placeholder: "Search by customer name…",
  },
  {
    key: "phone",
    label: "Phone",
    icon: "📞",
    placeholder: "Search by phone number…",
  },
  { key: "id", label: "ID", icon: "#", placeholder: "Search by customer ID…" },
  {
    key: "vehicle",
    label: "Vehicle Number",
    icon: "🚗",
    placeholder: "Search by vehicle plate number…",
  },
];

// ── Main Component ─────────────────────────────────────────────────────────

export default function CustomerDetails() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlId = searchParams.get("id");

  // ── Search state ──
  const [searchBy, setSearchBy] = useState("name");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  // ── Customer detail state ──
  const [customer, setCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);

  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  // Load a customer by numeric ID
  const loadCustomer = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setCustomer(null);
    setHistory([]);
    try {
      const [details, hist] = await Promise.all([
        apiJson(`${API}/customers/${id}`),
        apiJson(`${API}/customers/${id}/history`),
      ]);
      setCustomer(details);
      setHistory(Array.isArray(hist) ? hist : []);
      setActiveTab("details");
    } catch (err) {
      addToast(err.message || "Customer not found.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Full-text search
  const doSearch = useCallback(async (q, by) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearching(true);
    setSearched(true);
    try {
      const res = await fetch(
        `${API}/customers/search?q=${encodeURIComponent(q)}&by=${by}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await res.json().catch(() => []);
      if (!res.ok)
        throw new Error(data.message || `Request failed (${res.status})`);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast(err.message, "error");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search — fires 400 ms after the user stops typing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query, searchBy), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, searchBy, doSearch]);

  // Drive customer view entirely from the URL — load when ?id= is set,
  // clear when it's removed (e.g. back button)
  useEffect(() => {
    if (urlId) {
      loadCustomer(urlId);
    } else {
      setCustomer(null);
      setHistory([]);
    }
  }, [urlId, loadCustomer]);

  // Select a customer from the results list — updates URL to ?id=X.
  // Query/results are preserved in state so "back" restores the results.
  const handleSelectCustomer = (id) => {
    setSearchParams({ id: String(id) });
  };

  // Return to the search view — removing ?id= triggers the effect above
  const handleClearCustomer = () => {
    setSearchParams({});
  };

  const switchType = (key) => {
    setSearchBy(key);
    setQuery("");
    setResults([]);
    setSearched(false);
  };

  const currentType = SEARCH_TYPES.find((t) => t.key === searchBy);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="page">
      <Toast
        toasts={toasts}
        onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />

      {/* ══ LOADING SPINNER ══════════════════════════════════════════════ */}
      {loading && (
        <div className="empty-state">
          <div className="spinner" />
          <p>Loading customer data…</p>
        </div>
      )}

      {/* ══ DETAIL VIEW (customer loaded) ════════════════════════════════ */}
      {!loading && customer && (
        <>
          {/* Page header */}
          <div className="ph">
            <div style={{ flex: 1 }}>
              <p className="ph-bc">Staff › Customers › Profile</p>
              <h1 className="ph-title">{customer.fullName}</h1>
              <p className="ph-sub">
                Customer #{customer.id}&nbsp;·&nbsp;
                {customer.email}&nbsp;·&nbsp;{customer.phone}
              </p>
            </div>
            <div style={{ flexShrink: 0, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <ExportPdfButton
                path={`/customer/${customer.id}`}
                filename={`customer-${customer.id}.pdf`}
                label="Export PDF"
              />
              <button
                type="button"
                className="btn"
                onClick={handleClearCustomer}
              >
                ← Back to Results
              </button>
            </div>
          </div>

          {/* Summary card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e4e7",
              borderRadius: 14,
              padding: "20px 24px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: "#cc1e1e15",
                color: "#cc1e1e",
                border: "1px solid #cc1e1e30",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {(customer.fullName || "??").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#08060d" }}>
                {customer.fullName}
              </div>
              <div style={{ fontSize: 13, color: "#6b6375", marginTop: 2 }}>
                {customer.email}&nbsp;·&nbsp;{customer.phone}
              </div>
            </div>
            <TierBadge tier={customer.loyaltyTier} />
          </div>

          {/* Tabs */}
          <div
            className="ft"
            style={{ marginBottom: 20, width: "fit-content" }}
          >
            {[
              { key: "details", label: "👤 Profile" },
              { key: "vehicles", label: "🚗 Vehicles" },
              { key: "history", label: "📋 History" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                className={`ftb ${activeTab === t.key ? "ftb-on" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Profile Tab ── */}
          {activeTab === "details" && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e4e7",
                borderRadius: 14,
                padding: "20px 24px",
                maxWidth: 540,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              {[
                ["📧 Email", customer.email],
                ["📞 Phone", customer.phone],
                [
                  "💰 Total Spent",
                  `Rs ${customer.totalSpent?.toLocaleString()}`,
                ],
                [
                  "⏳ Credit Balance",
                  customer.creditBalance > 0
                    ? `Rs ${customer.creditBalance?.toLocaleString()}`
                    : "None",
                ],
                [
                  "🗓 Member Since",
                  new Date(customer.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#6b6375" }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color:
                        label.includes("Credit") && customer.creditBalance > 0
                          ? "#cc1e1e"
                          : "#08060d",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                }}
              >
                <span style={{ fontSize: 13, color: "#6b6375" }}>
                  🏅 Loyalty Tier
                </span>
                <TierBadge tier={customer.loyaltyTier} />
              </div>
            </div>
          )}

          {/* ── Vehicles Tab ── */}
          {activeTab === "vehicles" &&
            (customer.vehicles?.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🚗</div>
                <p>No vehicles registered for this customer.</p>
              </div>
            ) : (
              <div className="grid">
                {customer.vehicles?.map((v, i) => {
                  const color = COLORS[i % COLORS.length];
                  return (
                    <div key={v.id} className="card">
                      <div
                        className="card-top-line"
                        style={{ background: color }}
                      />
                      <div className="card-head">
                        <div
                          className="card-av"
                          style={{
                            background: `${color}15`,
                            color,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          🚗
                        </div>
                        <div>
                          <div className="card-title">{v.vehicleNumber}</div>
                          <div className="card-id">
                            {v.make} {v.model} · {v.year}
                          </div>
                        </div>
                      </div>
                      <div className="card-rows">
                        <div className="card-row">
                          <span className="card-row-ic">🔑</span>
                          <span className="card-row-lb">VIN</span>
                          <span className="card-row-val">{v.vin || "—"}</span>
                        </div>
                        <div className="card-row">
                          <span className="card-row-ic">🏭</span>
                          <span className="card-row-lb">Make</span>
                          <span className="card-row-val">{v.make}</span>
                        </div>
                        <div className="card-row">
                          <span className="card-row-ic">📅</span>
                          <span className="card-row-lb">Year</span>
                          <span className="card-row-val">{v.year}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

          {/* ── History Tab ── */}
          {activeTab === "history" &&
            (history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>No purchase history found for this customer.</p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {history.map((inv) => (
                  <div
                    key={inv.invoiceId}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e4e7",
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Invoice header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        borderBottom: "1px solid #f0f0f0",
                        background: "#f9f9fb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: "#cc1e1e15",
                            color: "#cc1e1e",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          SAL
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#08060d",
                            }}
                          >
                            SAL-{String(inv.invoiceId).padStart(4, "0")}
                          </div>
                          <div style={{ fontSize: 12, color: "#9c97a3" }}>
                            {new Date(inv.saleDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        {inv.discountAmount > 0 && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: "3px 8px",
                              borderRadius: 20,
                              background: "#edf7f0",
                              color: "#1a7a3a",
                              border: "1px solid #b3dfc0",
                              fontWeight: 600,
                            }}
                          >
                            🎉 10% Off
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 11,
                            padding: "3px 8px",
                            borderRadius: 20,
                            fontWeight: 600,
                            background: inv.isPaid ? "#edf7f0" : "#fff7ed",
                            color: inv.isPaid ? "#1a7a3a" : "#b05a00",
                            border: `1px solid ${inv.isPaid ? "#b3dfc0" : "#f5d78a"}`,
                          }}
                        >
                          {inv.isPaid ? "✓ Paid" : "⏳ Credit"}
                        </span>
                      </div>
                    </div>

                    {/* Items table */}
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: 13,
                        }}
                      >
                        <thead>
                          <tr style={{ background: "#f7f7f8" }}>
                            {["Part", "Qty", "Unit Price", "Line Total"].map(
                              (h) => (
                                <th
                                  key={h}
                                  style={{
                                    padding: "8px 14px",
                                    textAlign: h === "Part" ? "left" : "right",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "#9c97a3",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    borderBottom: "1px solid #e5e4e7",
                                  }}
                                >
                                  {h}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {inv.items?.map((item, idx) => (
                            <tr
                              key={idx}
                              style={{ borderBottom: "1px solid #f5f5f5" }}
                            >
                              <td
                                style={{
                                  padding: "10px 14px",
                                  fontWeight: 600,
                                  color: "#08060d",
                                }}
                              >
                                {item.partName}
                              </td>
                              <td
                                style={{
                                  padding: "10px 14px",
                                  textAlign: "right",
                                  color: "#3a3540",
                                }}
                              >
                                {item.quantity}
                              </td>
                              <td
                                style={{
                                  padding: "10px 14px",
                                  textAlign: "right",
                                  color: "#3a3540",
                                }}
                              >
                                Rs {item.unitPrice?.toLocaleString()}
                              </td>
                              <td
                                style={{
                                  padding: "10px 14px",
                                  textAlign: "right",
                                  fontWeight: 700,
                                  color: "#cc1e1e",
                                }}
                              >
                                Rs{" "}
                                {(
                                  item.quantity * item.unitPrice
                                )?.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div
                      style={{
                        padding: "12px 20px",
                        background: "#f9f9fb",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          minWidth: 220,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 13,
                            color: "#6b6375",
                          }}
                        >
                          <span>Subtotal</span>
                          <span>Rs {inv.subtotal?.toLocaleString()}</span>
                        </div>
                        {inv.discountAmount > 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 13,
                              color: "#1a7a3a",
                            }}
                          >
                            <span>Loyalty Discount (10%)</span>
                            <span>
                              − Rs {inv.discountAmount?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#08060d",
                            borderTop: "1px solid #e5e4e7",
                            paddingTop: 6,
                          }}
                        >
                          <span>Total</span>
                          <span style={{ color: "#cc1e1e" }}>
                            Rs {inv.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </>
      )}

      {/* ══ SEARCH VIEW (no customer selected) ═══════════════════════════ */}
      {!loading && !customer && (
        <>
          {/* Page header */}
          <div className="ph">
            <div>
              <p className="ph-bc">Staff › Customers</p>
              <h1 className="ph-title">Customer Lookup</h1>
              <p className="ph-sub">
                Find customers by name, phone, ID, or vehicle plate number.
              </p>
            </div>
            <ExportPdfButton
              path="/customers"
              filename="customers-and-vehicles.pdf"
              label="Export All Customers"
            />
          </div>

          {/* Search controls */}
          <div className="tb">
            {/* Search-type toggle */}
            <div className="ft">
              {SEARCH_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`ftb ${searchBy === t.key ? "ftb-on" : ""}`}
                  onClick={() => switchType(t.key)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Text input */}
            <div className="sw" style={{ flex: "1 1 300px" }}>
              <span className="sw-ic">⌕</span>
              <input
                className="sw-in"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={currentType?.placeholder}
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setSearched(false);
                  }}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#b0acb8",
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Result count */}
          {query.trim() && !searching && (
            <div style={{ marginBottom: 16, fontSize: 13, color: "#6b6375" }}>
              {results.length === 0
                ? "No results found"
                : `${results.length} customer${results.length !== 1 ? "s" : ""} found`}
            </div>
          )}

          {/* Spinner */}
          {searching && (
            <div className="empty-state">
              <div className="spinner" />
              <p>Searching…</p>
            </div>
          )}

          {/* No results */}
          {!searching && searched && results.length === 0 && query.trim() && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>
                No customers found for "<strong>{query}</strong>".
              </p>
            </div>
          )}

          {/* Results grid */}
          {!searching && results.length > 0 && (
            <div className="grid">
              {results.map((c, i) => {
                const color = COLORS[i % COLORS.length];
                const initials = (c.userName || c.fullName || "??")
                  .slice(0, 2)
                  .toUpperCase();
                const hasCredit = (c.creditBalance ?? 0) > 0;

                return (
                  <div key={c.id} className="card">
                    <div
                      className="card-top-line"
                      style={{ background: color }}
                    />

                    {/* Card head — avatar + name + tier */}
                    <div className="card-head">
                      <div
                        className="card-av"
                        style={{
                          background: `${color}15`,
                          color,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="card-title">
                          {c.userName || c.fullName}
                        </div>
                        <div className="card-id">Customer #{c.id}</div>
                      </div>
                      <TierBadge tier={c.loyaltyTier} />
                    </div>

                    {/* Info rows */}
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
                        <span className="card-row-ic">💰</span>
                        <span className="card-row-lb">Spent</span>
                        <span
                          className="card-row-val"
                          style={{ fontWeight: 700, color: "#1a7a3a" }}
                        >
                          Rs {(c.totalSpent ?? 0).toLocaleString()}
                        </span>
                      </div>
                      {hasCredit && (
                        <div className="card-row">
                          <span className="card-row-ic">⏳</span>
                          <span className="card-row-lb">Credit</span>
                          <span
                            className="card-row-val"
                            style={{ fontWeight: 700, color: "#cc1e1e" }}
                          >
                            Rs {(c.creditBalance ?? 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Vehicle rows when searching by vehicle */}
                      {searchBy === "vehicle" && c.vehicles?.length > 0 && (
                        <div
                          className="card-row"
                          style={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              alignItems: "center",
                            }}
                          >
                            <span className="card-row-ic">🚗</span>
                            <span className="card-row-lb">Vehicles</span>
                          </div>
                          <div
                            style={{
                              paddingLeft: 20,
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                              width: "100%",
                            }}
                          >
                            {c.vehicles.map((v, vi) => (
                              <div
                                key={vi}
                                style={{
                                  background: "#fff",
                                  border: "1px solid #e5e4e7",
                                  borderRadius: 6,
                                  padding: "5px 10px",
                                  fontSize: 12,
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 700,
                                    color: "#08060d",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  {v.plateNumber || v.registrationNumber || "—"}
                                </span>
                                <span style={{ color: "#6b6375" }}>
                                  {[v.make, v.model, v.year]
                                    .filter(Boolean)
                                    .join(" ")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="card-actions">
                      <button
                        type="button"
                        className="bic bic-e"
                        onClick={() => handleSelectCustomer(c.id)}
                      >
                        👁 View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state — no query yet */}
          {!query.trim() && !searching && (
            <div className="empty-state">
              <div className="empty-state-icon">{currentType?.icon}</div>
              <p>
                Enter a {currentType?.label.toLowerCase()} above to search for
                customers.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
