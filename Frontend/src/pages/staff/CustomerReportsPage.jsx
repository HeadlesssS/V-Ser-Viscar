import { useState, useEffect } from "react";
import {
  getHighSpendersReport,
  getRegularCustomersReport,
  getPendingCreditsReport,
} from "../../api/staffApi";
import {
  styles,
  LoadingSpinner,
  EmptyState,
  StatusBadge,
  TabGroup,
  StatCard,
} from "../../components/ui/SharedUI";

// ═══════════════════════════════════════════════════════════════════
//  Feature 9 (Irshad): Customer Reports Page
//  ─────────────────────────────────────────────────────────────────
//  Three report tabs:
//  1. High Spenders — ranked by total amount spent
//  2. Regular Customers — ranked by purchase frequency
//  3. Pending Credits — customers with unpaid balances
// ═══════════════════════════════════════════════════════════════════

const TABS = [
  { key: "high_spenders", label: "High Spenders", icon: "💰" },
  { key: "regulars", label: "Regular Customers", icon: "🔄" },
  { key: "pending_credits", label: "Pending Credits", icon: "⏳" },
];

export default function CustomerReportsPage() {
  const [activeTab, setActiveTab] = useState("high_spenders");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch report when tab changes
  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  async function fetchReport(type) {
    setLoading(true);
    setError(null);

    try {
      let data;
      switch (type) {
        case "high_spenders":
          data = await getHighSpendersReport(20);
          break;
        case "regulars":
          data = await getRegularCustomersReport(20);
          break;
        case "pending_credits":
          data = await getPendingCreditsReport();
          break;
        default:
          return;
      }
      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load report.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.pageWrapper}>
      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div style={styles.breadcrumb}>
          <span>Staff</span>
          <span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "#0d6efd" }}>Customer Reports</span>
        </div>
        <h1 style={styles.pageTitle}>Customer Reports</h1>
        <p style={styles.pageSubtitle}>
          Analyze customer activity — spending patterns, regularity, and credit status
        </p>
      </div>

      {/* ── Tab Navigation ── */}
      <TabGroup tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Error ── */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            padding: "14px 18px",
            marginBottom: "20px",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          ⚠️ {error}
          <button
            onClick={() => fetchReport(activeTab)}
            style={{ ...styles.btnOutline, ...styles.btnSmall, marginLeft: "12px" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && <LoadingSpinner message="Generating report..." />}

      {/* ── Report Content ── */}
      {!loading && report && (
        <>
          {/* Report metadata */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              fontSize: "13px",
              color: "#6c757d",
            }}
          >
            <span>
              Generated: {report.generatedAt} • {report.totalRecords} records
            </span>
            <button
              onClick={() => fetchReport(activeTab)}
              style={{ ...styles.btnOutline, ...styles.btnSmall }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* Render report by type */}
          {activeTab === "high_spenders" && <HighSpendersReport data={report.data} />}
          {activeTab === "regulars" && <RegularCustomersReport data={report.data} />}
          {activeTab === "pending_credits" && <PendingCreditsReport data={report.data} />}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   High Spenders Report Component
   ═══════════════════════════════════════════════════════════════ */
function HighSpendersReport({ data }) {
  if (!data || data.length === 0) {
    return <EmptyState icon="💰" title="No spender data" subtitle="No purchase records found." />;
  }

  // Calculate summary stats
  const totalRevenue = data.reduce((sum, d) => sum + d.totalSpent, 0);
  const avgOrder = data.reduce((sum, d) => sum + d.averageOrderValue, 0) / data.length;
  const loyaltyCount = data.filter((d) => d.loyaltyEligible).length;

  return (
    <>
      {/* ── Summary Stats ── */}
      <div style={styles.statsRow}>
        <StatCard label="Total Revenue" value={`Rs. ${totalRevenue.toLocaleString("en-IN")}`} color="#059669" icon="💵" />
        <StatCard label="Top Spender" value={data[0]?.fullName || "—"} color="#7c3aed" icon="👑" />
        <StatCard label="Avg Order Value" value={`Rs. ${Math.round(avgOrder).toLocaleString("en-IN")}`} color="#0d6efd" icon="📊" />
        <StatCard label="Loyalty Eligible" value={loyaltyCount} color="#f59e0b" icon="⭐" />
      </div>

      {/* ── Table ── */}
      <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Total Spent</th>
              <th style={styles.th}>Invoices</th>
              <th style={styles.th}>Avg Order</th>
              <th style={styles.th}>Loyalty</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.customerId}>
                <td style={{ ...styles.td, fontWeight: "600", color: "#9ca3af" }}>
                  {idx + 1}
                </td>
                <td style={styles.td}>
                  <strong style={{ color: "#212529" }}>{row.fullName}</strong>
                  <br />
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>ID: {row.customerId}</span>
                </td>
                <td style={styles.td}>
                  <div style={{ fontSize: "13px" }}>
                    {row.email}
                    <br />
                    {row.phone}
                  </div>
                </td>
                <td style={{ ...styles.td, fontWeight: "700", color: "#059669", fontSize: "15px" }}>
                  Rs. {row.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>{row.totalInvoices}</td>
                <td style={styles.td}>
                  Rs. {row.averageOrderValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td style={styles.td}>
                  {row.loyaltyEligible ? (
                    <StatusBadge type="success">⭐ Eligible</StatusBadge>
                  ) : (
                    <StatusBadge type="info">Standard</StatusBadge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Regular Customers Report Component
   ═══════════════════════════════════════════════════════════════ */
function RegularCustomersReport({ data }) {
  if (!data || data.length === 0) {
    return <EmptyState icon="🔄" title="No regular customer data" subtitle="No recurring purchases found." />;
  }

  return (
    <>
      {/* ── Summary Stats ── */}
      <div style={styles.statsRow}>
        <StatCard label="Most Frequent" value={data[0]?.fullName || "—"} color="#7c3aed" icon="🏆" />
        <StatCard label="Top Frequency" value={`${data[0]?.totalPurchases || 0} orders`} color="#0d6efd" icon="🔄" />
        <StatCard label="Active Customers" value={data.filter((d) => (d.daysSinceLastPurchase || 999) < 30).length} color="#059669" icon="✅" />
        <StatCard label="Needs Follow-up" value={data.filter((d) => (d.daysSinceLastPurchase || 0) > 60).length} color="#dc2626" icon="📞" />
      </div>

      {/* ── Table ── */}
      <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Purchases</th>
              <th style={styles.th}>Total Spent</th>
              <th style={styles.th}>Last Purchase</th>
              <th style={styles.th}>Days Ago</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const daysAgo = row.daysSinceLastPurchase;
              let activityStatus = { type: "success", label: "Active" };
              if (daysAgo > 90) activityStatus = { type: "danger", label: "Inactive" };
              else if (daysAgo > 60) activityStatus = { type: "warning", label: "At Risk" };
              else if (daysAgo > 30) activityStatus = { type: "info", label: "Moderate" };

              return (
                <tr key={row.customerId}>
                  <td style={{ ...styles.td, fontWeight: "600", color: "#9ca3af" }}>{idx + 1}</td>
                  <td style={styles.td}>
                    <strong>{row.fullName}</strong>
                    <br />
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{row.email}</span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: "700", fontSize: "16px", color: "#0d6efd" }}>
                    {row.totalPurchases}
                  </td>
                  <td style={{ ...styles.td, fontWeight: "600" }}>
                    Rs. {row.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td style={styles.td}>
                    {row.lastPurchaseDate
                      ? new Date(row.lastPurchaseDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td style={{ ...styles.td, fontWeight: "500" }}>
                    {daysAgo != null ? `${daysAgo}d` : "—"}
                  </td>
                  <td style={styles.td}>
                    <StatusBadge type={activityStatus.type}>{activityStatus.label}</StatusBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Pending Credits Report Component
   ═══════════════════════════════════════════════════════════════ */
function PendingCreditsReport({ data }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!data || data.length === 0) {
    return <EmptyState icon="✅" title="No pending credits" subtitle="All customer payments are up to date." />;
  }

  const totalOutstanding = data.reduce((sum, d) => sum + d.totalOutstanding, 0);
  const overdueCount = data.filter((d) => d.isOverdue).length;

  return (
    <>
      {/* ── Summary Stats ── */}
      <div style={styles.statsRow}>
        <StatCard
          label="Total Outstanding"
          value={`Rs. ${totalOutstanding.toLocaleString("en-IN")}`}
          color="#dc2626"
          icon="💳"
        />
        <StatCard label="Customers with Credits" value={data.length} color="#f59e0b" icon="👥" />
        <StatCard label="Overdue (>1 month)" value={overdueCount} color="#dc2626" icon="🚨" />
        <StatCard
          label="Pending Invoices"
          value={data.reduce((sum, d) => sum + d.pendingInvoiceCount, 0)}
          color="#6366f1" icon="📄"
        />
      </div>

      {/* ── Table ── */}
      <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Outstanding</th>
              <th style={styles.th}>Invoices</th>
              <th style={styles.th}>Oldest Due</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <PendingCreditRow
                key={row.customerId}
                row={row}
                isExpanded={expandedId === row.customerId}
                onToggle={() =>
                  setExpandedId(expandedId === row.customerId ? null : row.customerId)
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Pending Credit Row with expandable detail ──────────────── */
function PendingCreditRow({ row, isExpanded, onToggle }) {
  return (
    <>
      <tr
        style={{
          cursor: "pointer",
          background: row.isOverdue ? "#fff5f5" : "transparent",
        }}
        onClick={onToggle}
      >
        <td style={styles.td}>
          <strong>{row.fullName}</strong>
          <br />
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>ID: {row.customerId}</span>
        </td>
        <td style={styles.td}>
          <div style={{ fontSize: "13px" }}>
            {row.email}
            <br />
            {row.phone}
          </div>
        </td>
        <td style={{ ...styles.td, fontWeight: "700", color: "#dc2626", fontSize: "15px" }}>
          Rs. {row.totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </td>
        <td style={{ ...styles.td, textAlign: "center" }}>{row.pendingInvoiceCount}</td>
        <td style={styles.td}>
          {row.oldestDueDate
            ? new Date(row.oldestDueDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </td>
        <td style={styles.td}>
          {row.isOverdue ? (
            <StatusBadge type="danger">🚨 Overdue</StatusBadge>
          ) : (
            <StatusBadge type="warning">Pending</StatusBadge>
          )}
        </td>
        <td style={{ ...styles.td, textAlign: "center" }}>
          <span>{isExpanded ? "▲" : "▼"}</span>
        </td>
      </tr>

      {/* ── Expanded Payment Details ── */}
      {isExpanded && row.pendingPayments && (
        <tr>
          <td colSpan="7" style={{ padding: 0 }}>
            <div
              style={{
                background: "#fafafa",
                padding: "16px 24px",
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              <h4 style={{ fontSize: "13px", color: "#6c757d", textTransform: "uppercase", marginBottom: "10px" }}>
                Pending Payment Breakdown
              </h4>
              <table style={{ ...styles.table, fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, fontSize: "11px" }}>Invoice #</th>
                    <th style={{ ...styles.th, fontSize: "11px" }}>Amount Due</th>
                    <th style={{ ...styles.th, fontSize: "11px" }}>Paid</th>
                    <th style={{ ...styles.th, fontSize: "11px" }}>Balance</th>
                    <th style={{ ...styles.th, fontSize: "11px" }}>Due Date</th>
                    <th style={{ ...styles.th, fontSize: "11px" }}>Days Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {row.pendingPayments.map((p) => (
                    <tr
                      key={p.paymentId}
                      style={{ background: p.isOverdue ? "#fef2f2" : "transparent" }}
                    >
                      <td style={{ ...styles.td, fontWeight: "500" }}>{p.invoiceNumber}</td>
                      <td style={styles.td}>Rs. {p.amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td style={styles.td}>Rs. {p.amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#dc2626" }}>
                        Rs. {p.outstandingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={styles.td}>
                        {p.dueDate
                          ? new Date(p.dueDate).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td style={styles.td}>
                        {p.daysOverdue != null ? (
                          <span style={{ color: p.daysOverdue > 30 ? "#dc2626" : "#f59e0b", fontWeight: "600" }}>
                            {p.daysOverdue}d
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
