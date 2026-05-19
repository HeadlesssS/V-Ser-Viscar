import { useState, useEffect, useCallback } from "react";

const BASE_URL = "/api";

/* ── API helpers ─────────────────────────────────────────────────────────── */
const getMyPartRequests = async (token) => {
  const res = await fetch(`${BASE_URL}/part-requests/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

const createPartRequest = async (data, token) => {
  const res = await fetch(`${BASE_URL}/part-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

/* ── SVG Icons ───────────────────────────────────────────────────────────── */
const WrenchIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const PackageIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const XIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="12"
    height="12"
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

const CheckCircleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/* ── Status config ───────────────────────────────────────────────────────── */
const STATUS_CFG = {
  Pending: {
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fbbf24",
    dot: "#d97706",
    label: "Pending",
  },
  Fulfilled: {
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#6ee7b7",
    dot: "#10b981",
    label: "Fulfilled",
  },
  Rejected: {
    color: "#991b1b",
    bg: "#fef2f2",
    border: "#fca5a5",
    dot: "#ef4444",
    label: "Rejected",
  },
};

const getCfg = (s) => STATUS_CFG[s] || STATUS_CFG.Pending;

const fmtDate = (ds) => {
  if (!ds) return "—";
  try {
    return new Date(ds).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return ds;
  }
};

/* ══════════════════════════════════════════════════════════════════════════ */
export default function PartsRequest() {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null); // { type: "success"|"error", msg }
  const [form, setForm] = useState({
    partName: "",
    description: "",
    quantityRequested: 1,
  });

  /* ── Load ─────────────────────────────────────────────────────────────── */
  const loadRequests = useCallback(async () => {
    setFetching(true);
    try {
      const res = await getMyPartRequests(token);
      if (Array.isArray(res)) setRequests(res);
    } catch {
      /* silent */
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    const t = setTimeout(loadRequests, 0);
    return () => clearTimeout(t);
  }, [loadRequests]);

  /* ── Toast helper ─────────────────────────────────────────────────────── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Submit ───────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.partName.trim()) return;
    setLoading(true);
    try {
      const res = await createPartRequest(form, token);
      if (res.message === "Part request submitted successfully." || res.id) {
        showToast("success", "Part request submitted successfully.");
        setShowForm(false);
        setForm({ partName: "", description: "", quantityRequested: 1 });
        loadRequests();
      } else {
        showToast("error", res.message || "Failed to submit request.");
      }
    } catch {
      showToast("error", "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived stats ────────────────────────────────────────────────────── */
  const stats = [
    { label: "Total Requests", value: requests.length, color: "#cc1e1e" },
    {
      label: "Pending",
      value: requests.filter((r) => r.status === "Pending").length,
      color: "#d97706",
    },
    {
      label: "Fulfilled",
      value: requests.filter((r) => r.status === "Fulfilled").length,
      color: "#059669",
    },
    {
      label: "Rejected",
      value: requests.filter((r) => r.status === "Rejected").length,
      color: "#dc2626",
    },
  ];

  /* ── Input style helper ──────────────────────────────────────────────── */
  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e5e4e7",
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "inherit",
    color: "#08060d",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#3a3540",
    marginBottom: "5px",
    display: "block",
  };

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      style={{
        padding: "26px 28px 56px",
        fontFamily: "system-ui,'Segoe UI',Roboto,sans-serif",
        animation: "fadeUp 0.35s ease",
      }}
    >
      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "18px",
            right: "18px",
            zIndex: 999,
            animation: "slideIn .22s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              padding: "11px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "1px solid transparent",
              background: toast.type === "success" ? "#f0fdf4" : "#fff0f0",
              borderColor:
                toast.type === "success" ? "#b3dfc0" : "rgba(204,30,30,0.3)",
              color: toast.type === "success" ? "#1a5c30" : "#cc1e1e",
              minWidth: "260px",
            }}
          >
            {toast.type === "success" ? <CheckCircleIcon /> : <XIcon />}
            <span style={{ flex: 1 }}>{toast.msg}</span>
            <button
              onClick={() => setToast(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
                opacity: 0.5,
                padding: 0,
                display: "flex",
              }}
            >
              <XIcon />
            </button>
          </div>
        </div>
      )}

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
            }}
          >
            <span style={{ color: "#cc1e1e", display: "flex" }}>
              <WrenchIcon size={22} />
            </span>
            Part Requests
          </h1>
          <p style={{ fontSize: "13px", color: "#6b6375", margin: 0 }}>
            Request specialized or out-of-stock vehicle components.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            border: "2px solid transparent",
            fontFamily: "inherit",
            background: showForm ? "#f7f7f8" : "#cc1e1e",
            color: showForm ? "#6b6375" : "#fff",
            borderColor: showForm ? "#e5e4e7" : "#cc1e1e",
            transition: "all .15s",
          }}
        >
          {showForm ? (
            <>
              <XIcon /> Cancel
            </>
          ) : (
            <>
              <PlusIcon /> New Request
            </>
          )}
        </button>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              border: "1px solid #e5e4e7",
              borderRadius: "12px",
              padding: "16px 20px",
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
                fontSize: "28px",
                fontWeight: 700,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Inline New Request Form ──────────────────────────────────────── */}
      {showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e4e7",
            borderRadius: "14px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            animation: "fadeUp 0.25s ease",
          }}
        >
          {/* Top accent strip */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #cc1e1e, transparent)",
              borderRadius: "14px 14px 0 0",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <span style={{ color: "#cc1e1e", display: "flex" }}>
              <PackageIcon size={16} />
            </span>
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#08060d",
                margin: 0,
              }}
            >
              Request Unavailable Part
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "12px",
                alignItems: "end",
              }}
            >
              <div>
                <label style={labelStyle}>
                  Part Name <span style={{ color: "#cc1e1e" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Front Brake Pads for Toyota Corolla 2019"
                  value={form.partName}
                  onChange={(e) =>
                    setForm({ ...form, partName: e.target.value })
                  }
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#cc1e1e")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e4e7")}
                />
              </div>
              <div style={{ minWidth: "100px" }}>
                <label style={labelStyle}>Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={form.quantityRequested}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantityRequested: parseInt(e.target.value) || 1,
                    })
                  }
                  style={{ ...inputStyle, width: "100px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#cc1e1e")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e4e7")}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description & Notes</label>
              <textarea
                rows={3}
                placeholder="Specify part number, brand preferences, vehicle specifications..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                onFocus={(e) => (e.target.style.borderColor = "#cc1e1e")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e4e7")}
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
                onClick={() => setShowForm(false)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid #e5e4e7",
                  background: "#fff",
                  color: "#6b6375",
                  fontFamily: "inherit",
                }}
              >
                <XIcon /> Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 22px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  border: "none",
                  background: loading ? "#e0b8b8" : "#cc1e1e",
                  color: "#fff",
                  fontFamily: "inherit",
                  transition: "background .15s",
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                      }}
                    />
                    Submitting…
                  </>
                ) : (
                  <>
                    <PlusIcon /> Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Loading state ────────────────────────────────────────────────── */}
      {fetching && (
        <div style={{ padding: "48px 20px", textAlign: "center" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              border: "2px solid #e5e4e7",
              borderTopColor: "#cc1e1e",
              borderRadius: "50%",
              animation: "spin .7s linear infinite",
              margin: "0 auto 10px",
            }}
          />
          <p style={{ fontSize: "13px", color: "#9c97a3" }}>
            Loading your requests…
          </p>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!fetching && requests.length === 0 && (
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
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#f7f7f8",
              border: "1px solid #e5e4e7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              color: "#b0acb8",
            }}
          >
            <WrenchIcon size={22} />
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "#9c97a3",
              fontWeight: 500,
              marginBottom: "4px",
            }}
          >
            No Part Requests Yet
          </p>
          <p style={{ fontSize: "12px", color: "#b0acb8" }}>
            Click "New Request" above to request an unavailable part.
          </p>
        </div>
      )}

      {/* ── Request Cards ────────────────────────────────────────────────── */}
      {!fetching && requests.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {requests.map((r) => {
            const cfg = getCfg(r.status);
            const dateStr = fmtDate(r.requestedAt || r.createdAt || r.date);

            return (
              <div
                key={r.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e4e7",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  transition:
                    "transform .18s, box-shadow .18s, border-color .18s",
                  animation: "fadeUp 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(3px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "#d4d2d8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0,0,0,0.04)";
                  e.currentTarget.style.borderColor = "#e5e4e7";
                }}
              >
                {/* Icon avatar */}
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: `${cfg.dot}15`,
                    border: `1px solid ${cfg.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: cfg.dot,
                    flexShrink: 0,
                  }}
                >
                  <PackageIcon size={18} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#08060d",
                      }}
                    >
                      {r.partName}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "1px 8px",
                        background: "#f0eff2",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#6b6375",
                      }}
                    >
                      Qty: {r.quantityRequested}
                    </span>
                  </div>
                  {r.description && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b6375",
                        margin: "0 0 6px",
                        lineHeight: 1.5,
                      }}
                    >
                      {r.description}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "11px",
                      color: "#9c97a3",
                    }}
                  >
                    <CalendarIcon /> {dateStr}
                  </div>
                </div>

                {/* Status badge */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 10px",
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: cfg.color,
                    flexShrink: 0,
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
            );
          })}
        </div>
      )}
    </div>
  );
}
