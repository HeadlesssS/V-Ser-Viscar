import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const BASE_URL = "/api";

// ─── Notification Type to Route Mapping ────────────────────────────────────
const NOTIFICATION_ROUTES = {
  NewAppointment: "/admin/appointments",
  AppointmentConfirmed: "/admin/appointments",
  AppointmentCancelled: "/admin/appointments",
  NewPartRequest: "/admin/part-requests-management",
  PartRequestApproved: "/admin/part-requests-management",
  PartRequestRejected: "/admin/part-requests-management",
  NewReview: "/admin/reviews",
  ReviewApproved: "/admin/reviews",
  LowStock: "/admin/parts",
  PartReceived: "/admin/parts",
  CreditReminder: "/admin/vendors", // or could be customer-related page
};

// ─── Auth helper ─────────────────────────────────────────────────────────────
const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ─── Toast component ──────────────────────────────────────────────────────────
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

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  sub,
  count,
  countColor,
  onRefresh,
  onSend,
  refreshing,
  sending,
  sendLabel,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: "1px solid #f0eff2",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#fff0f0",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 3,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15, color: "#08060d" }}>
              {title}
            </span>
            {count != null && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 22,
                  height: 22,
                  borderRadius: 11,
                  background: count > 0 ? "#fff0f0" : "#f7f7f8",
                  color: count > 0 ? countColor || "#cc1e1e" : "#9c97a3",
                  fontSize: 11,
                  fontWeight: 700,
                  border:
                    count > 0
                      ? "1px solid rgba(204,30,30,0.25)"
                      : "1px solid #e5e4e7",
                  padding: "0 6px",
                }}
              >
                {count}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#6b6375" }}>{sub}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          className="btn btn-g"
          onClick={onRefresh}
          disabled={refreshing}
          style={{ fontSize: 13, padding: "8px 14px" }}
        >
          {refreshing ? "⟳ Loading…" : "⟳ Refresh"}
        </button>
        <button
          className="btn btn-p"
          onClick={onSend}
          disabled={sending || count === 0}
          style={{ fontSize: 13, padding: "8px 14px" }}
        >
          {sending ? (
            <>
              <span
                style={{
                  width: 13,
                  height: 13,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin .7s linear infinite",
                }}
              />
              Sending…
            </>
          ) : (
            sendLabel
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const navigate = useNavigate();

  // General Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  // Low Stock state
  const [lowStock, setLowStock] = useState({ count: 0, parts: [] });
  const [stockLoading, setStockLoading] = useState(true);
  const [stockSending, setStockSending] = useState(false);

  // Overdue Credits state
  const [overdue, setOverdue] = useState({ count: 0, customers: [] });
  const [creditLoading, setCreditLoading] = useState(true);
  const [creditSending, setCreditSending] = useState(false);

  // Shared toast state
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  // ── Fetch low stock ───────────────────────────────────────────────────────
  const fetchLowStock = useCallback(async () => {
    setStockLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/notifications/low-stock`, {
        headers: authHeader(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLowStock({ count: data.count ?? 0, parts: data.parts ?? [] });
    } catch (err) {
      addToast(`Failed to load low stock data: ${err.message}`, "error");
      setLowStock({ count: 0, parts: [] });
    }
    setStockLoading(false);
  }, []);

  // ── Fetch general notifications ────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: authHeader(),
      });
      // If endpoint doesn't exist yet (404), just skip notifications
      if (res.status === 404) {
        setNotifications([]);
        setNotifLoading(false);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Assume the backend returns an array of notifications
      setNotifications(Array.isArray(data) ? data : data.notifications ?? []);
    } catch (err) {
      // Silently fail for now - notifications are optional
      console.warn("Notifications feature not yet available", err);
      setNotifications([]);
    }
    setNotifLoading(false);
  }, []);

  // ── Fetch overdue credits ─────────────────────────────────────────────────
  const fetchOverdue = useCallback(async () => {
    setCreditLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/notifications/overdue-credits`, {
        headers: authHeader(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOverdue({ count: data.count ?? 0, customers: data.customers ?? [] });
    } catch (err) {
      addToast(`Failed to load overdue credits: ${err.message}`, "error");
      setOverdue({ count: 0, customers: [] });
    }
    setCreditLoading(false);
  }, []);

  useEffect(() => {
    // Only fetch once on mount
    fetchNotifications();
    fetchLowStock();
    fetchOverdue();
  }, []);

  // ── Send low stock email ──────────────────────────────────────────────────
  const sendLowStockAlert = async () => {
    setStockSending(true);
    try {
      const res = await fetch(`${BASE_URL}/notifications/low-stock-alert`, {
        method: "POST",
        headers: authHeader(),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(
          data.message || "Low stock alert email sent to admin.",
          "success",
        );
      } else {
        addToast(data.message || "Failed to send low stock alert.", "error");
      }
    } catch {
      addToast("Network error while sending low stock alert.", "error");
    }
    setStockSending(false);
  };

  // ── Send credit reminders ─────────────────────────────────────────────────
  const sendCreditReminders = async () => {
    setCreditSending(true);
    try {
      const res = await fetch(`${BASE_URL}/notifications/credit-reminders`, {
        method: "POST",
        headers: authHeader(),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(
          data.message ||
            `Credit reminder emails sent to ${overdue.count} customer(s).`,
          "success",
        );
      } else {
        addToast(data.message || "Failed to send credit reminders.", "error");
      }
    } catch {
      addToast("Network error while sending credit reminders.", "error");
    }
    setCreditSending(false);
  };

  // ── Handle notification click ──────────────────────────────────────────────
  const handleNotificationClick = (notification) => {
    const route = NOTIFICATION_ROUTES[notification.type];
    if (route) {
      // Mark as read if not already
      if (!notification.isRead) {
        markNotificationAsRead(notification.id);
      }
      // Navigate to the relevant page
      navigate(route);
      addToast("Navigating to " + route, "success");
    } else {
      addToast(`No route found for notification type: ${notification.type}`, "error");
    }
  };

  // ── Mark notification as read ──────────────────────────────────────────────
  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: authHeader(),
      });
    } catch (err) {
      // Silently fail - this is not critical
      console.error("Failed to mark notification as read:", err);
    }
  };

  // ── Stock level indicator ─────────────────────────────────────────────────
  const StockBar = ({ qty }) => {
    const pct = Math.min(100, (qty / 10) * 100);
    const color = qty === 0 ? "#cc1e1e" : qty <= 3 ? "#e07800" : "#d4a800";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background: "#f0eff2",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: color,
              borderRadius: 3,
              transition: "width .3s",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color,
            minWidth: 28,
            textAlign: "right",
          }}
        >
          {qty}
        </span>
      </div>
    );
  };

  return (
    <div className="page">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="ph">
        <div>
          <div className="ph-bc">Admin / Notifications</div>
          <div className="ph-title">Notification Center</div>
          <div className="ph-sub">
            Monitor low stock alerts and overdue credit reminders.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-g"
            onClick={() => {
              fetchNotifications();
              fetchLowStock();
              fetchOverdue();
            }}
            disabled={notifLoading || stockLoading || creditLoading}
          >
            ⟳ Refresh All
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* GENERAL NOTIFICATIONS SECTION                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {notifications.length > 0 && (
        <div className="card" style={{ marginBottom: 20, borderLeft: "4px solid #6366f1" }}>
          <div style={{ padding: "16px 0", borderBottom: "1px solid #f0eff2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "#eef2ff",
                  fontSize: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                🔔
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#08060d" }}>
                  Recent Notifications
                </div>
                <div style={{ fontSize: 12, color: "#6b6375" }}>
                  Click any notification to navigate to the relevant page
                </div>
              </div>
            </div>
          </div>

          {notifLoading ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <div className="spinner" />
              <div style={{ fontSize: 13, color: "#9c97a3" }}>
                Loading notifications…
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </div>
              <p>No new notifications. You're all caught up!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {notifications.map((notif, idx) => {
                const isUnread = !notif.isRead;
                const route = NOTIFICATION_ROUTES[notif.type];
                const date = new Date(notif.sentAt);
                const timeStr = date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateStr = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={notif.id ?? idx}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 8,
                      background: isUnread ? "#f0f4ff" : "#fafafa",
                      border: `1px solid ${isUnread ? "#c7d2fe" : "#e5e4e7"}`,
                      cursor: route ? "pointer" : "default",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      ":hover": {
                        background: route ? "#e0e7ff" : undefined,
                      },
                    }}
                    onMouseEnter={(e) => {
                      if (route) {
                        e.currentTarget.style.background = "#e0e7ff";
                        e.currentTarget.style.borderColor = "#a5b4fc";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isUnread ? "#f0f4ff" : "#fafafa";
                      e.currentTarget.style.borderColor = isUnread ? "#c7d2fe" : "#e5e4e7";
                    }}
                  >
                    {isUnread && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#6366f1",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: isUnread ? 600 : 500,
                          color: "#08060d",
                          marginBottom: 3,
                        }}
                      >
                        {notif.message}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#9c97a3",
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <span>{dateStr}</span>
                        <span>{timeStr}</span>
                        {route && (
                          <span style={{ color: "#6366f1", fontWeight: 600 }}>
                            → {route}
                          </span>
                        )}
                      </div>
                    </div>
                    {route && (
                      <div
                        style={{
                          fontSize: 18,
                          color: "#6366f1",
                          flexShrink: 0,
                        }}
                      >
                        →
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Summary Stats ──────────────────────────────────────────────────── */}
      <div className="stats">
        <div className="sc">
          <div className="sc-n">{stockLoading ? "—" : lowStock.count}</div>
          <div className="sc-l">Low Stock Parts</div>
        </div>
        <div className="sc">
          <div
            className="sc-n"
            style={{
              color:
                lowStock.parts.filter((p) => p.stockQuantity === 0).length > 0
                  ? "#cc1e1e"
                  : "#9c97a3",
            }}
          >
            {stockLoading
              ? "—"
              : lowStock.parts.filter((p) => p.stockQuantity === 0).length}
          </div>
          <div className="sc-l">Out of Stock</div>
        </div>
        <div className="sc">
          <div className="sc-n" style={{ color: "#e07800" }}>
            {creditLoading ? "—" : overdue.count}
          </div>
          <div className="sc-l">Overdue Credits</div>
        </div>
        <div className="sc">
          <div className="sc-n sc-n-g">
            {creditLoading
              ? "—"
              : overdue.customers
                  .reduce((sum, c) => sum + (c.creditBalance ?? 0), 0)
                  .toLocaleString("en-NP", {
                    style: "currency",
                    currency: "NPR",
                    maximumFractionDigits: 0,
                  })}
          </div>
          <div className="sc-l">Total Overdue Amount</div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — LOW STOCK ALERTS                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ marginBottom: 20 }}>
        <SectionHeader
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          }
          title="Low Stock Alerts"
          sub="Parts with stock quantity below 10 units"
          count={lowStock.count}
          countColor="#cc1e1e"
          onRefresh={fetchLowStock}
          onSend={sendLowStockAlert}
          refreshing={stockLoading}
          sending={stockSending}
          sendLabel="Alert Admin"
        />

        {stockLoading ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <div className="spinner" />
            <div style={{ fontSize: 13, color: "#9c97a3" }}>
              Checking stock levels…
            </div>
          </div>
        ) : lowStock.parts.length === 0 ? (
          <div className="empty-state">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#edf7f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a7a3a"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p>All parts are sufficiently stocked. No alerts at this time.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #e5e4e7",
                    background: "#fdf8f8",
                  }}
                >
                  {["Part Name", "SKU", "Stock Level", "Status", "Active"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "9px 14px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#6b6375",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {lowStock.parts.map((part, idx) => {
                  const isOut = part.stockQuantity === 0;
                  const isCritical = part.stockQuantity <= 3 && !isOut;
                  return (
                    <tr
                      key={part.id ?? idx}
                      style={{
                        borderBottom: "1px solid #f0eff2",
                        background: isOut
                          ? "rgba(204,30,30,0.03)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafafa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = isOut
                          ? "rgba(204,30,30,0.03)"
                          : "")
                      }
                    >
                      {/* Part Name */}
                      <td style={{ padding: "11px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 7,
                              background: isOut ? "#fff0f0" : "#fff8ec",
                              color: isOut ? "#cc1e1e" : "#e07800",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                            </svg>
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#08060d",
                            }}
                          >
                            {part.name ?? "—"}
                          </span>
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: "11px 14px" }}>
                        <code
                          style={{
                            fontSize: 11,
                            fontFamily: "monospace",
                            background: "#f7f7f8",
                            padding: "2px 7px",
                            borderRadius: 4,
                            color: "#6b6375",
                          }}
                        >
                          {part.sku ?? "—"}
                        </code>
                      </td>

                      {/* Stock bar */}
                      <td style={{ padding: "11px 14px", minWidth: 140 }}>
                        <StockBar qty={part.stockQuantity ?? 0} />
                      </td>

                      {/* Severity badge */}
                      <td style={{ padding: "11px 14px" }}>
                        {isOut ? (
                          <span className="badge b-ina">Out of Stock</span>
                        ) : isCritical ? (
                          <span
                            className="badge"
                            style={{
                              background: "#fff8ec",
                              color: "#e07800",
                              border: "1px solid #f5d08a",
                            }}
                          >
                            Critical
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              background: "#fffbec",
                              color: "#d4a800",
                              border: "1px solid #f0e070",
                            }}
                          >
                            Low
                          </span>
                        )}
                      </td>

                      {/* Active */}
                      <td style={{ padding: "11px 14px" }}>
                        <span
                          className={`badge ${part.isActive ? "b-act" : "b-ina"}`}
                        >
                          {part.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary footer */}
            <div
              style={{
                padding: "10px 14px",
                borderTop: "1px solid #f0eff2",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "#9c97a3",
              }}
            >
              <span>{lowStock.parts.length} part(s) below threshold</span>
              <span>
                {lowStock.parts.filter((p) => p.stockQuantity === 0).length}{" "}
                out-of-stock ·{" "}
                {
                  lowStock.parts.filter(
                    (p) => p.stockQuantity > 0 && p.stockQuantity <= 3,
                  ).length
                }{" "}
                critical ·{" "}
                {lowStock.parts.filter((p) => p.stockQuantity > 3).length} low
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — OVERDUE CREDITS                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="card">
        <SectionHeader
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          }
          title="Overdue Credit Reminders"
          sub="Customers with credit outstanding for more than 1 month"
          count={overdue.count}
          countColor="#e07800"
          onRefresh={fetchOverdue}
          onSend={sendCreditReminders}
          refreshing={creditLoading}
          sending={creditSending}
          sendLabel="Send Reminders"
        />

        {creditLoading ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <div className="spinner" />
            <div style={{ fontSize: 13, color: "#9c97a3" }}>
              Checking overdue accounts…
            </div>
          </div>
        ) : overdue.customers.length === 0 ? (
          <div className="empty-state">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#edf7f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a7a3a"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p>
              No overdue credit accounts found. All customers are up to date.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #e5e4e7",
                    background: "#fdf8f8",
                  }}
                >
                  {[
                    "Customer",
                    "Email",
                    "Credit Balance",
                    "Overdue Invoices",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "9px 14px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#6b6375",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdue.customers.map((cust, idx) => {
                  const name = cust.name ?? cust.fullName ?? "Unknown";
                  const initials = name
                    .split(" ")
                    .map((w) => w[0] ?? "")
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const balance = cust.creditBalance ?? 0;
                  const invoiceCount = Array.isArray(cust.overdueInvoices)
                    ? cust.overdueInvoices.length
                    : (cust.overdueInvoices ?? 0);

                  return (
                    <tr
                      key={cust.id ?? idx}
                      style={{ borderBottom: "1px solid #f0eff2" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafafa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      {/* Customer name + avatar */}
                      <td style={{ padding: "11px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "#fff0f0",
                              color: "#cc1e1e",
                              fontSize: 11,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {initials || "?"}
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#08060d",
                            }}
                          >
                            {name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td
                        style={{
                          padding: "11px 14px",
                          fontSize: 13,
                          color: "#3a3540",
                        }}
                      >
                        {cust.email ?? "—"}
                      </td>

                      {/* Credit balance */}
                      <td style={{ padding: "11px 14px" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: balance > 10000 ? "#cc1e1e" : "#e07800",
                          }}
                        >
                          {balance.toLocaleString("en-NP", {
                            style: "currency",
                            currency: "NPR",
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      {/* Overdue invoices */}
                      <td style={{ padding: "11px 14px" }}>
                        {typeof invoiceCount === "number" ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              background:
                                invoiceCount > 0 ? "#fff0f0" : "#f7f7f8",
                              color: invoiceCount > 0 ? "#cc1e1e" : "#9c97a3",
                              border: `1px solid ${invoiceCount > 0 ? "rgba(204,30,30,0.25)" : "#e5e4e7"}`,
                              borderRadius: 20,
                              padding: "3px 10px",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {invoiceCount} invoice
                            {invoiceCount !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "#9c97a3" }}>
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary footer */}
            <div
              style={{
                padding: "10px 14px",
                borderTop: "1px solid #f0eff2",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "#9c97a3",
              }}
            >
              <span>{overdue.customers.length} overdue account(s)</span>
              <span>
                Total outstanding:{" "}
                <strong style={{ color: "#e07800" }}>
                  {overdue.customers
                    .reduce((s, c) => s + (c.creditBalance ?? 0), 0)
                    .toLocaleString("en-NP", {
                      style: "currency",
                      currency: "NPR",
                      maximumFractionDigits: 2,
                    })}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
