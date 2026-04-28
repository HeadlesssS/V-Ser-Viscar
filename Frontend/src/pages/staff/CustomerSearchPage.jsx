import { useState, useCallback } from "react";
import { searchCustomers } from "../../api/staffApi";
import {
  styles,
  LoadingSpinner,
  EmptyState,
  StatusBadge,
} from "../../components/ui/SharedUI";

// ═══════════════════════════════════════════════════════════════════
//  Feature 10 (Irshad): Customer Search Page
//  ─────────────────────────────────────────────────────────────────
//  Staff can search customers by:
//  • Customer name (partial match)
//  • Phone number (partial match)
//  • Customer ID (exact match)
//  • Vehicle license plate number (partial match)
//  • Email address (partial match)
//  ─────────────────────────────────────────────────────────────────
//  Results show customer details + vehicle list + purchase summary
// ═══════════════════════════════════════════════════════════════════

export default function CustomerSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // ── Debounced search handler ──
  const handleSearch = useCallback(async (term) => {
    if (!term || term.trim().length < 1) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchCustomers(term);
      setResults(data);
    } catch (err) {
      setError(err.message || "Search failed. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchTerm);
    }
  };

  // Toggle expanded row
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={styles.pageWrapper}>
      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div style={styles.breadcrumb}>
          <span>Staff</span>
          <span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "#0d6efd" }}>Customer Search</span>
        </div>
        <h1 style={styles.pageTitle}>Customer Search</h1>
        <p style={styles.pageSubtitle}>
          Search by name, phone, customer ID, email, or vehicle plate number
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div style={styles.searchWrapper}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder='Search customers... (e.g., "Ram", "9812345678", "BA 1 PA 4521")'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.searchInput}
        />
        <button
          onClick={() => handleSearch(searchTerm)}
          disabled={loading || !searchTerm.trim()}
          style={{
            ...styles.btnPrimary,
            position: "absolute",
            right: "6px",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "10px 24px",
            opacity: loading || !searchTerm.trim() ? 0.5 : 1,
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* ── Error Message ── */}
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
        </div>
      )}

      {/* ── Loading ── */}
      {loading && <LoadingSpinner message="Searching customers..." />}

      {/* ── Results ── */}
      {!loading && results && (
        <>
          {/* Result count */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>
              Found{" "}
              <strong style={{ color: "#212529" }}>{results.count}</strong>{" "}
              customer{results.count !== 1 ? "s" : ""} for{" "}
              <em>"{results.query}"</em>
            </p>
          </div>

          {results.count === 0 ? (
            <EmptyState
              icon="🔍"
              title="No customers found"
              subtitle={`No results for "${results.query}". Try a different search term.`}
            />
          ) : (
            /* ── Results Table ── */
            <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Contact</th>
                    <th style={styles.th}>Vehicles</th>
                    <th style={styles.th}>Purchases</th>
                    <th style={styles.th}>Total Spent</th>
                    <th style={styles.th}>Credits</th>
                    <th style={{ ...styles.th, textAlign: "center" }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((customer) => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      isExpanded={expandedId === customer.id}
                      onToggle={() => toggleExpand(customer.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Initial State ── */}
      {!loading && !results && !error && (
        <EmptyState
          icon="👥"
          title="Search for customers"
          subtitle="Enter a name, phone number, customer ID, or vehicle plate number above"
        />
      )}
    </div>
  );
}

/* ── Customer Row Component ─────────────────────────────────── */
function CustomerRow({ customer, isExpanded, onToggle }) {
  return (
    <>
      <tr
        style={{
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        onClick={onToggle}
      >
        <td style={{ ...styles.td, fontWeight: "600", color: "#0d6efd" }}>
          #{customer.id}
        </td>
        <td style={styles.td}>
          <div>
            <strong style={{ color: "#212529" }}>{customer.fullName}</strong>
            <br />
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
              {customer.email}
            </span>
          </div>
        </td>
        <td style={styles.td}>{customer.phone}</td>
        <td style={styles.td}>
          <StatusBadge type="info">{customer.vehicles.length} vehicle(s)</StatusBadge>
        </td>
        <td style={{ ...styles.td, fontWeight: "500" }}>{customer.totalPurchases}</td>
        <td style={{ ...styles.td, fontWeight: "600", color: "#059669" }}>
          Rs. {customer.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </td>
        <td style={styles.td}>
          {customer.hasPendingCredits ? (
            <StatusBadge type="warning">Pending</StatusBadge>
          ) : (
            <StatusBadge type="success">Clear</StatusBadge>
          )}
        </td>
        <td style={{ ...styles.td, textAlign: "center" }}>
          <span style={{ fontSize: "16px", transition: "transform 0.2s" }}>
            {isExpanded ? "▲" : "▼"}
          </span>
        </td>
      </tr>

      {/* ── Expanded Details Row ── */}
      {isExpanded && (
        <tr>
          <td colSpan="8" style={{ padding: 0 }}>
            <div
              style={{
                background: "#f8fafc",
                padding: "20px 24px",
                borderTop: "1px solid #e5e7eb",
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Customer Details */}
                <div>
                  <h4 style={{ fontSize: "13px", color: "#6c757d", textTransform: "uppercase", marginBottom: "10px" }}>
                    Customer Information
                  </h4>
                  <p style={{ margin: "4px 0", fontSize: "14px" }}>
                    <strong>Name:</strong> {customer.fullName}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "14px" }}>
                    <strong>Email:</strong> {customer.email}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "14px" }}>
                    <strong>Phone:</strong> {customer.phone}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "14px" }}>
                    <strong>Address:</strong> {customer.address || "Not provided"}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "14px" }}>
                    <strong>Registered:</strong>{" "}
                    {new Date(customer.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Vehicles */}
                <div>
                  <h4 style={{ fontSize: "13px", color: "#6c757d", textTransform: "uppercase", marginBottom: "10px" }}>
                    Registered Vehicles
                  </h4>
                  {customer.vehicles.length === 0 ? (
                    <p style={{ fontSize: "14px", color: "#9ca3af" }}>No vehicles registered</p>
                  ) : (
                    customer.vehicles.map((v) => (
                      <div
                        key={v.id}
                        style={{
                          background: "#fff",
                          borderRadius: "8px",
                          padding: "10px 14px",
                          border: "1px solid #e5e7eb",
                          marginBottom: "8px",
                          fontSize: "14px",
                        }}
                      >
                        <strong>
                          {v.make} {v.model} {v.year ? `(${v.year})` : ""}
                        </strong>
                        <br />
                        <span style={{ color: "#0d6efd", fontWeight: "600", fontSize: "13px" }}>
                          🚗 {v.licensePlate}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
