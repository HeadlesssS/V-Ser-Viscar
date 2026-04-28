import { useState } from "react";
import { getInvoiceDetail, sendInvoiceEmail } from "../../api/staffApi";
import {
  styles,
  LoadingSpinner,
  EmptyState,
  StatusBadge,
  Modal,
} from "../../components/ui/SharedUI";

// ═══════════════════════════════════════════════════════════════════
//  Feature 11 (Irshad): Invoice Email Page
//  ─────────────────────────────────────────────────────────────────
//  Workflow:
//  1. Staff enters an invoice ID (or searches for it)
//  2. Invoice details are loaded and previewed
//  3. Staff can optionally add a custom message
//  4. Staff sends the invoice email to the customer
// ═══════════════════════════════════════════════════════════════════

export default function InvoiceEmailPage() {
  const [invoiceId, setInvoiceId] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sendResult, setSendResult] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [emailOverride, setEmailOverride] = useState("");
  const [showSendModal, setShowSendModal] = useState(false);

  // ── Load invoice details ──
  async function handleLoadInvoice() {
    if (!invoiceId || isNaN(Number(invoiceId))) {
      setError("Please enter a valid invoice ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setInvoice(null);
    setSendResult(null);

    try {
      const data = await getInvoiceDetail(Number(invoiceId));
      setInvoice(data);
    } catch (err) {
      setError(err.message || "Invoice not found.");
    } finally {
      setLoading(false);
    }
  }

  // ── Send email ──
  async function handleSendEmail() {
    if (!invoice) return;

    setSending(true);
    setError(null);
    setSendResult(null);

    try {
      const result = await sendInvoiceEmail(invoice.id, {
        customMessage: customMessage || null,
        recipientEmailOverride: emailOverride || null,
      });
      setSendResult(result);
      setShowSendModal(false);
    } catch (err) {
      setError(err.message || "Failed to send email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={styles.pageWrapper}>
      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div style={styles.breadcrumb}>
          <span>Staff</span>
          <span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "#0d6efd" }}>Send Invoice Email</span>
        </div>
        <h1 style={styles.pageTitle}>Send Invoice via Email</h1>
        <p style={styles.pageSubtitle}>
          Preview and send sales invoices directly to customer email
        </p>
      </div>

      {/* ── Invoice Lookup ── */}
      <div
        style={{
          ...styles.card,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
          padding: "16px 20px",
        }}
      >
        <label
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            whiteSpace: "nowrap",
          }}
        >
          Invoice ID:
        </label>
        <input
          type="number"
          placeholder="Enter invoice ID..."
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLoadInvoice()}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1.5px solid #e5e7eb",
            fontSize: "15px",
            outline: "none",
            fontFamily: '"Segoe UI", Tahoma, sans-serif',
          }}
        />
        <button
          onClick={handleLoadInvoice}
          disabled={loading || !invoiceId}
          style={{
            ...styles.btnPrimary,
            opacity: loading || !invoiceId ? 0.5 : 1,
          }}
        >
          {loading ? "Loading..." : "Load Invoice"}
        </button>
      </div>

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
        </div>
      )}

      {/* ── Send Success ── */}
      {sendResult?.success && (
        <div
          style={{
            background: "#d1fae5",
            border: "1px solid #6ee7b7",
            borderRadius: "8px",
            padding: "18px 22px",
            marginBottom: "20px",
          }}
        >
          <p style={{ margin: 0, fontWeight: "600", color: "#065f46", fontSize: "15px" }}>
            ✅ Invoice sent successfully!
          </p>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#047857" }}>
            {sendResult.message} — Sent at{" "}
            {new Date(sendResult.sentAt).toLocaleString("en-GB")}
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && <LoadingSpinner message="Loading invoice details..." />}

      {/* ── Invoice Preview ── */}
      {!loading && invoice && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          {/* Left: Invoice Detail */}
          <div>
            {/* Invoice Header Card */}
            <div
              style={{
                ...styles.card,
                borderLeft: "4px solid #0d6efd",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: "20px", color: "#111827" }}>
                    Invoice {invoice.invoiceNumber}
                  </h2>
                  <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                    Date:{" "}
                    {new Date(invoice.invoiceDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StatusBadge
                  type={
                    invoice.status === "Paid"
                      ? "success"
                      : invoice.status === "Cancelled"
                      ? "danger"
                      : "info"
                  }
                >
                  {invoice.status}
                </StatusBadge>
              </div>
            </div>

            {/* Line Items */}
            <div style={{ ...styles.card, padding: 0, overflow: "hidden", marginBottom: "20px" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>Line Items</h3>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Part Name</th>
                    <th style={{ ...styles.th, textAlign: "center" }}>Qty</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Unit Price</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} style={{ background: idx % 2 === 0 ? "#f9fafb" : "#fff" }}>
                      <td style={styles.td}>{item.partName}</td>
                      <td style={{ ...styles.td, textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        Rs. {item.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ ...styles.td, textAlign: "right", fontWeight: "600" }}>
                        Rs. {item.lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ padding: "14px 20px", background: "#f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "14px" }}>
                  <span style={{ color: "#6c757d" }}>Subtotal</span>
                  <span>Rs. {invoice.subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "14px", color: "#059669" }}>
                    <span>Discount ({invoice.discountPercent}%)</span>
                    <span>- Rs. {invoice.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: "2px solid #e5e7eb",
                    fontSize: "17px",
                    fontWeight: "700",
                  }}
                >
                  <span>Total</span>
                  <span>Rs. {invoice.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                {invoice.balanceDue > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "14px", color: "#dc2626", fontWeight: "600" }}>
                    <span>Balance Due</span>
                    <span>Rs. {invoice.balanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Loyalty badge */}
            {invoice.loyaltyApplied && (
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  color: "#92400e",
                }}
              >
                ⭐ Loyalty Discount Applied — {invoice.discountPercent}% off (saved Rs.{" "}
                {invoice.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })})
              </div>
            )}
          </div>

          {/* Right: Customer Info + Send Action */}
          <div>
            {/* Customer Card */}
            <div style={{ ...styles.card, marginBottom: "20px" }}>
              <h3 style={{ fontSize: "13px", color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                Customer
              </h3>
              <p style={{ margin: "6px 0", fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                {invoice.customerName}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "#6c757d" }}>
                📧 {invoice.customerEmail}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "#6c757d" }}>
                📞 {invoice.customerPhone}
              </p>
              {invoice.createdByStaff && (
                <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#9ca3af" }}>
                  Created by: {invoice.createdByStaff}
                </p>
              )}
            </div>

            {/* Send Email Action Card */}
            <div
              style={{
                ...styles.card,
                background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
                border: "1px solid #bfdbfe",
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "14px", color: "#1e40af" }}>
                📧 Send Invoice
              </h3>
              <p style={{ fontSize: "13px", color: "#4b5563", marginBottom: "16px" }}>
                Send this invoice to <strong>{invoice.customerEmail}</strong> with a
                professional email template.
              </p>
              <button
                onClick={() => setShowSendModal(true)}
                style={{
                  ...styles.btnPrimary,
                  width: "100%",
                  justifyContent: "center",
                  padding: "12px",
                  fontSize: "15px",
                }}
              >
                📤 Send Invoice Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !invoice && !error && (
        <EmptyState
          icon="📧"
          title="Preview and send invoices"
          subtitle="Enter an invoice ID above to load its details and send via email"
        />
      )}

      {/* ── Send Confirmation Modal ── */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send Invoice Email"
        footer={
          <>
            <button
              style={styles.btnOutline}
              onClick={() => setShowSendModal(false)}
            >
              Cancel
            </button>
            <button
              style={{ ...styles.btnPrimary, ...(!sending ? {} : { opacity: 0.5 }) }}
              onClick={handleSendEmail}
              disabled={sending}
            >
              {sending ? "Sending..." : "📤 Send Email"}
            </button>
          </>
        }
      >
        <div>
          <p style={{ fontSize: "14px", color: "#374151", marginBottom: "16px" }}>
            Sending invoice <strong>{invoice?.invoiceNumber}</strong> to{" "}
            <strong>{emailOverride || invoice?.customerEmail}</strong>
          </p>

          {/* Custom message input */}
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
            Custom Message (optional)
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a personal note to the email..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1.5px solid #e5e7eb",
              fontSize: "14px",
              fontFamily: '"Segoe UI", Tahoma, sans-serif',
              resize: "vertical",
              outline: "none",
              marginBottom: "14px",
            }}
          />

          {/* Email override */}
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
            Send to different email (optional)
          </label>
          <input
            type="email"
            value={emailOverride}
            onChange={(e) => setEmailOverride(e.target.value)}
            placeholder={invoice?.customerEmail || "customer@email.com"}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1.5px solid #e5e7eb",
              fontSize: "14px",
              fontFamily: '"Segoe UI", Tahoma, sans-serif',
              outline: "none",
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
