import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════
//  Shared UI Components — used across Features 9, 10, 11 pages
//  Premium, polished components following global.css design system
// ═══════════════════════════════════════════════════════════════════

/* ── Styles ─────────────────────────────────────────────────── */
const styles = {
  // Page wrapper — outer padding removed (handled by StaffLayout)
  pageWrapper: {
    fontFamily: '"Segoe UI", Tahoma, sans-serif',
  },

  // Page header with breadcrumb
  pageHeader: {
    marginBottom: "28px",
  },
  breadcrumb: {
    fontSize: "13px",
    color: "#6c757d",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#212529",
    margin: "0 0 4px 0",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6c757d",
    margin: 0,
  },

  // Search input
  searchWrapper: {
    position: "relative",
    marginBottom: "24px",
  },
  searchInput: {
    width: "100%",
    padding: "14px 20px 14px 48px",
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    fontSize: "15px",
    fontFamily: '"Segoe UI", Tahoma, sans-serif',
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    background: "#fff",
    color: "#212529",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    fontSize: "18px",
    pointerEvents: "none",
  },

  // Cards
  card: {
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
    padding: "20px",
    transition: "transform 0.15s, box-shadow 0.15s",
  },

  // Stat cards row
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "10px",
    padding: "18px 20px",
    borderTop: "3px solid",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#212529",
  },

  // Table
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#6c757d",
    borderBottom: "2px solid #e5e7eb",
    background: "#f9fafb",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #f0f0f0",
    color: "#374151",
  },

  // Badges
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.3px",
  },
  badgeSuccess: {
    background: "#d1fae5",
    color: "#065f46",
  },
  badgeDanger: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  badgeWarning: {
    background: "#fef3c7",
    color: "#92400e",
  },
  badgeInfo: {
    background: "#dbeafe",
    color: "#1e40af",
  },

  // Buttons
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#0d6efd",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: '"Segoe UI", Tahoma, sans-serif',
  },
  btnOutline: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1.5px solid #e5e7eb",
    background: "transparent",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
    fontFamily: '"Segoe UI", Tahoma, sans-serif',
  },
  btnSmall: {
    padding: "6px 14px",
    fontSize: "13px",
  },
  btnDanger: {
    background: "#dc2626",
  },
  btnSuccess: {
    background: "#059669",
  },

  // Tab navigation
  tabsWrapper: {
    display: "flex",
    gap: "4px",
    marginBottom: "24px",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "0",
  },
  tab: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    color: "#6c757d",
    borderBottom: "2px solid transparent",
    marginBottom: "-2px",
    transition: "color 0.2s, border-color 0.2s",
    fontFamily: '"Segoe UI", Tahoma, sans-serif',
  },
  tabActive: {
    color: "#0d6efd",
    borderBottomColor: "#0d6efd",
    fontWeight: "600",
  },

  // Empty state
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#9ca3af",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },

  // Loading spinner
  loadingWrapper: {
    textAlign: "center",
    padding: "60px 20px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #f0f0f0",
    borderTop: "3px solid #0d6efd",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 12px",
  },

  // Modal overlay
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    width: "90%",
    maxWidth: "640px",
    maxHeight: "85vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #f0f0f0",
  },
  modalBody: {
    padding: "24px",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "16px 24px",
    borderTop: "1px solid #f0f0f0",
  },
};

/* ── Loading Spinner Component ──────────────────────────────── */
export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={styles.loadingWrapper}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={styles.spinner} />
      <p style={{ color: "#6c757d", fontSize: "14px" }}>{message}</p>
    </div>
  );
}

/* ── Empty State Component ──────────────────────────────────── */
export function EmptyState({ icon = "📋", title, subtitle }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>{icon}</div>
      <h3 style={{ fontSize: "16px", color: "#374151", marginBottom: "4px" }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ fontSize: "13px", color: "#9ca3af" }}>{subtitle}</p>
      )}
    </div>
  );
}

/* ── Status Badge Component ─────────────────────────────────── */
export function StatusBadge({ type = "info", children }) {
  const badgeStyles = {
    success: styles.badgeSuccess,
    danger: styles.badgeDanger,
    warning: styles.badgeWarning,
    info: styles.badgeInfo,
  };

  return (
    <span
      style={{ ...styles.badge, ...(badgeStyles[type] || styles.badgeInfo) }}
    >
      {children}
    </span>
  );
}

/* ── Modal Component ────────────────────────────────────────── */
export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              fontSize: "22px",
              color: "#9ca3af",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>
        <div style={styles.modalBody}>{children}</div>
        {footer && <div style={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}

/* ── Tab Group Component ────────────────────────────────────── */
export function TabGroup({ tabs, activeTab, onTabChange }) {
  return (
    <div style={styles.tabsWrapper}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          style={{
            ...styles.tab,
            ...(activeTab === tab.key ? styles.tabActive : {}),
          }}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.icon && <span style={{ marginRight: "6px" }}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ── Stat Card Component ────────────────────────────────────── */
export function StatCard({ label, value, color = "#0d6efd", icon }) {
  return (
    <div style={{ ...styles.statCard, borderTopColor: color }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p style={styles.statLabel}>{label}</p>
          <p style={styles.statValue}>{value}</p>
        </div>
        {icon && <span style={{ fontSize: "28px", opacity: 0.3 }}>{icon}</span>}
      </div>
    </div>
  );
}

// Export all styles for use in page components
export { styles };
