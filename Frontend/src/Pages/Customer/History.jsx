import { useState, useEffect, useCallback } from "react";

const BASE_URL = "/api";

/* ── SVG Icons ─────────────────────────────────────────────────────────── */
const InvoiceIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const StarIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const TagIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

/* ── Helpers ────────────────────────────────────────────────────────────── */
const getProfile = async (token) => {
  try {
    const res = await fetch(`${BASE_URL}/customers/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const fmtDate = (ds) => {
  if (!ds) return "—";
  try {
    return new Date(ds).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return ds;
  }
};

const fmtRs = (n) =>
  Number(n || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ── Status config ─────────────────────────────────────────────────────── */
const STATUS_CFG = {
  Paid: {
    label: "Paid",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#6ee7b7",
    accent: "#10b981",
    dot: "#10b981",
  },
  Unpaid: {
    label: "Unpaid",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fbbf24",
    accent: "#d97706",
    dot: "#d97706",
  },
  Credit: {
    label: "Credit",
    color: "#1e40af",
    bg: "#eff6ff",
    border: "#93c5fd",
    accent: "#3b82f6",
    dot: "#3b82f6",
  },
};

const resolveStatus = (inv) => {
  const pt = inv.paymentType || "";
  if (pt === "Cash" || pt === "Card") return "Paid";
  if (pt === "Credit") return inv.isPaid ? "Credit" : "Unpaid";
  if (!inv.isCredit) return "Paid";
  return inv.isPaid ? "Credit" : "Unpaid";
};

const resolveTotal = (inv) => inv.total ?? inv.totalAmount ?? 0;
const resolveInvNum = (inv) =>
  inv.invoiceNumber ?? `SAL-${String(inv.id).padStart(4, "0")}`;

// ==========================================================================
export default function PurchaseHistory() {
  const token = localStorage.getItem("token");

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  /* ── Load ─────────────────────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const profile = await getProfile(token);
      if (!profile?.id) {
        setError("Could not load your profile.");
        return;
      }

      const res = await fetch(`${BASE_URL}/sales-invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let all = [];
      try {
        all = text ? JSON.parse(text) : [];
      } catch {
        all = [];
      }

      if (!Array.isArray(all)) {
        setError("Unexpected response from server.");
        return;
      }

      const myName = localStorage.getItem("name") || profile.name || "";
      const mine = all.filter(
        (inv) => inv.customerName === myName || inv.customerId === profile.id,
      );
      setInvoices(mine);
    } catch (e) {
      setError(e.message || "Failed to load invoice history.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const t = setTimeout(loadData, 0);
    return () => clearTimeout(t);
  }, [loadData]);

  /* ── Derived stats ────────────────────────────────────────────────────── */
  const totalPurchases = invoices.length;
  const totalSpent = invoices.reduce((s, i) => s + resolveTotal(i), 0);
  const totalSaved = invoices.reduce((s, i) => s + (i.discountAmount || 0), 0);
  const creditBalance = invoices
    .filter((i) => resolveStatus(i) === "Unpaid")
    .reduce((s, i) => s + resolveTotal(i), 0);
  const hasLoyalty = invoices.some((i) => resolveTotal(i) > 5000);

  /* ── Filter + search ──────────────────────────────────────────────────── */
  const filtered = invoices
    .filter((inv) => {
      const s = resolveStatus(inv);
      if (filter === "Paid") return s === "Paid";
      if (filter === "Unpaid") return s === "Unpaid";
      if (filter === "Credit") return s === "Credit";
      return true;
    })
    .filter((inv) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        resolveInvNum(inv).toLowerCase().includes(q) ||
        fmtDate(inv.invoiceDate || inv.date)
          .toLowerCase()
          .includes(q)
      );
    });

  const FILTERS = ["All", "Paid", "Unpaid", "Credit"];

  // ========================================================================
  return (
    <div
      style={{
        padding: "26px 28px 56px",
        fontFamily: "system-ui,'Segoe UI',Roboto,sans-serif",
        animation: "fadeUp 0.35s ease",
      }}
    >
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
          paddingBottom: "22px",
          borderBottom: "1px solid #e5e4e7",
        }}
      >
        <div>
          <div
            style={{ fontSize: "12px", color: "#9c97a3", marginBottom: "5px" }}
          >
            My Portal
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#08060d",
              letterSpacing: "-0.3px",
              margin: "0 0 4px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#cc1e1e", display: "flex" }}>
              <InvoiceIcon size={22} />
            </span>
            Invoice History
            {hasLoyalty && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 11px 3px 8px",
                  background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
                  border: "1px solid #fcd34d",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#92400e",
                }}
              >
                <StarIcon /> Loyalty Member
              </span>
            )}
          </h1>
          <p style={{ fontSize: "13px", color: "#6b6375", margin: 0 }}>
            Your complete purchase and payment history
          </p>
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Total Invoices",
            display: String(totalPurchases),
            color: "#cc1e1e",
          },
          {
            label: "Total Spent",
            display: `Rs ${fmtRs(totalSpent)}`,
            color: "#cc1e1e",
          },
          {
            label: "Total Saved",
            display: `Rs ${fmtRs(totalSaved)}`,
            color: "#059669",
          },
          {
            label: "Credit Balance",
            display: `Rs ${fmtRs(creditBalance)}`,
            color: "#d97706",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              border: "1px solid #e5e4e7",
              borderRadius: "12px",
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#9c97a3", fontWeight: 500 }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: s.label === "Total Invoices" ? "28px" : "20px",
                fontWeight: 700,
                color: s.color,
                lineHeight: 1.1,
              }}
            >
              {s.display}
            </div>
          </div>
        ))}
      </div>

      {/* ── Loyalty Banner ──────────────────────────────────────────────── */}
      {hasLoyalty && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            background: "linear-gradient(135deg,#fffbeb,#fef9ee)",
            border: "1px solid #fcd34d",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <span style={{ color: "#f59e0b", display: "flex" }}>
            <TagIcon />
          </span>
          <div>
            <span
              style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}
            >
              Loyalty Member
            </span>
            <span
              style={{ fontSize: "12px", color: "#a16207", marginLeft: "8px" }}
            >
              You have invoices exceeding Rs 5,000 — you qualify for loyalty
              benefits.
            </span>
          </div>
        </div>
      )}

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            background: "#fff",
            border: "1px solid #e5e4e7",
            borderRadius: "8px",
            padding: "3px",
            gap: "2px",
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
                fontFamily: "inherit",
                background: filter === f ? "#cc1e1e" : "transparent",
                color: filter === f ? "#fff" : "#6b6375",
                transition: "all .13s",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <span
            style={{
              position: "absolute",
              left: "11px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#b0acb8",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number or date..."
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              border: "1px solid #e5e4e7",
              borderRadius: "8px",
              fontSize: "13px",
              fontFamily: "inherit",
              background: "#fff",
              color: "#08060d",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color .15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#cc1e1e")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e4e7")}
          />
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "2px solid #e5e4e7",
              borderTopColor: "#cc1e1e",
              borderRadius: "50%",
              animation: "spin .7s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ fontSize: "13px", color: "#9c97a3" }}>
            Loading your invoices…
          </p>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div
          style={{
            background: "#fff0f0",
            border: "1px solid rgba(204,30,30,0.25)",
            borderRadius: "10px",
            padding: "14px 18px",
            color: "#cc1e1e",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {/* ── Invoice Cards ───────────────────────────────────────────────── */}
      {!loading &&
        !error &&
        (filtered.length === 0 ? (
          <div
            style={{
              padding: "56px 20px",
              textAlign: "center",
              background: "#fff",
              border: "1px solid #e5e4e7",
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                opacity: 0.2,
                marginBottom: "12px",
                display: "flex",
                justifyContent: "center",
                transform: "scale(2)",
              }}
            >
              <InvoiceIcon size={18} />
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "#9c97a3",
                fontWeight: 500,
                marginTop: "16px",
              }}
            >
              No invoices found
            </p>
            <p style={{ fontSize: "12px", color: "#b0acb8", marginTop: "4px" }}>
              {filter !== "All"
                ? `No ${filter.toLowerCase()} invoices — try a different filter.`
                : "You have no purchase history yet."}
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {filtered.map((inv) => {
              const status = resolveStatus(inv);
              const cfg = STATUS_CFG[status] || STATUS_CFG.Paid;
              const isExp = expandedId === inv.id;
              const invNum = resolveInvNum(inv);
              const dateStr = fmtDate(
                inv.invoiceDate || inv.saleDate || inv.date || "",
              );
              const total = resolveTotal(inv);
              const items = inv.items || inv.saleItems || [];

              return (
                <div
                  key={inv.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e4e7",
                    borderRadius: "14px",
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "box-shadow .2s, border-color .2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.08)";
                    e.currentTarget.style.borderColor = "#d4d2d8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 1px 4px rgba(0,0,0,0.04)";
                    e.currentTarget.style.borderColor = "#e5e4e7";
                  }}
                >
                  {/* ── Summary row ── */}
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    {/* Accent bar */}
                    <div
                      style={{
                        width: "4px",
                        background: cfg.accent,
                        flexShrink: 0,
                      }}
                    />

                    <div
                      style={{
                        flex: 1,
                        padding: "16px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      {/* Left */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "15px",
                              fontWeight: 700,
                              color: "#08060d",
                            }}
                          >
                            {invNum}
                          </span>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "2px 8px",
                              background: cfg.bg,
                              border: `1px solid ${cfg.border}`,
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: cfg.color,
                            }}
                          >
                            <span
                              style={{
                                width: "5px",
                                height: "5px",
                                borderRadius: "50%",
                                background: cfg.dot,
                                display: "inline-block",
                              }}
                            />
                            {cfg.label}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              color: "#6b6375",
                            }}
                          >
                            <CalendarIcon /> {dateStr}
                          </span>
                          {inv.staffName && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "12px",
                                color: "#6b6375",
                              }}
                            >
                              <UserIcon /> {inv.staffName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: 700,
                              color: "#08060d",
                            }}
                          >
                            Rs {fmtRs(total)}
                          </div>
                          {inv.discountAmount > 0 && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#059669",
                                marginTop: "1px",
                              }}
                            >
                              Saved Rs {fmtRs(inv.discountAmount)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setExpandedId(isExp ? null : inv.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "7px 12px",
                            border: "1px solid #e5e4e7",
                            borderRadius: "8px",
                            background: isExp ? "#f7f7f8" : "#fff",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#6b6375",
                            fontFamily: "inherit",
                            transition: "all .15s",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isExp ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          {isExp ? "Hide" : "Details"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Expanded items ── */}
                  {isExp && (
                    <div
                      style={{
                        borderTop: "1px solid #f0eff2",
                        background: "#fafaf9",
                        padding: "16px 22px 20px",
                        animation: "fadeUp 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#9c97a3",
                          textTransform: "uppercase",
                          letterSpacing: "0.6px",
                          marginBottom: "10px",
                        }}
                      >
                        Line Items
                      </div>

                      {items.length === 0 ? (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#b0acb8",
                            fontStyle: "italic",
                          }}
                        >
                          No line items available.
                        </p>
                      ) : (
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "13px",
                          }}
                        >
                          <thead>
                            <tr>
                              {[
                                "Part Name",
                                "Qty",
                                "Unit Price",
                                "Subtotal",
                              ].map((h) => (
                                <th
                                  key={h}
                                  style={{
                                    textAlign:
                                      h === "Part Name" ? "left" : "right",
                                    padding: "6px 8px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: "#9c97a3",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.4px",
                                    borderBottom: "1px solid #e5e4e7",
                                  }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr
                                key={idx}
                                style={{
                                  borderBottom:
                                    idx < items.length - 1
                                      ? "1px solid #f0eff2"
                                      : "none",
                                }}
                              >
                                <td
                                  style={{
                                    padding: "8px",
                                    color: "#3a3540",
                                    fontWeight: 500,
                                  }}
                                >
                                  {item.partName || item.name || "—"}
                                </td>
                                <td
                                  style={{
                                    padding: "8px",
                                    textAlign: "right",
                                    color: "#6b6375",
                                  }}
                                >
                                  {item.quantity || item.qty || 0}
                                </td>
                                <td
                                  style={{
                                    padding: "8px",
                                    textAlign: "right",
                                    color: "#6b6375",
                                  }}
                                >
                                  Rs {fmtRs(item.unitPrice)}
                                </td>
                                <td
                                  style={{
                                    padding: "8px",
                                    textAlign: "right",
                                    color: "#08060d",
                                    fontWeight: 600,
                                  }}
                                >
                                  Rs{" "}
                                  {fmtRs(
                                    item.subtotal ??
                                      (item.quantity || 1) *
                                        (item.unitPrice || 0),
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {/* Totals */}
                      <div
                        style={{
                          marginTop: "14px",
                          paddingTop: "12px",
                          borderTop: "1px solid #e5e4e7",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "260px",
                            fontSize: "12px",
                            color: "#6b6375",
                          }}
                        >
                          <span>Subtotal</span>
                          <span>Rs {fmtRs(inv.subtotal ?? total)}</span>
                        </div>
                        {inv.discountAmount > 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "260px",
                              fontSize: "12px",
                              color: "#059669",
                            }}
                          >
                            <span>Discount</span>
                            <span>− Rs {fmtRs(inv.discountAmount)}</span>
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "260px",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#08060d",
                            borderTop: "1px solid #e5e4e7",
                            paddingTop: "7px",
                            marginTop: "4px",
                          }}
                        >
                          <span>Total</span>
                          <span>Rs {fmtRs(total)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}
