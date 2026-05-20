import { useState, useEffect, useCallback } from "react";
import ExportPdfButton from "../../components/ExportPdfButton";
import "../Admin/Admin.css";

const API = "/api";

const COLORS = ["#cc1e1e", "#1a4faa", "#1a7a3a", "#b05a00", "#6b1a8a"];

async function apiJson(url, options = {}) {
  const res = await fetch(url, options);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

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

function Modal({ open, onClose, title, wide, children }) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={wide ? { maxWidth: 600 } : {}}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

const emptyItem = () => ({ partId: "", quantity: "", unitPrice: "" });

export default function SalesInvoicePage() {
  const [invoices, setInvoices] = useState([]);

  const [customers, setCustomers] = useState([]);

  const [parts, setParts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [showDetail, setShowDetail] = useState(null);

  const [detailLoading, setDetailLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [emailSending, setEmailSending] = useState(new Set());

  const [toasts, setToasts] = useState([]);

  const [customerId, setCustomerId] = useState("");

  const [staffId, setStaffId] = useState("");

  const [isCredit, setIsCredit] = useState(false);

  const [items, setItems] = useState([emptyItem()]);

  const addToast = (msg, type = "success") => {
    const id = Date.now();

    setToasts((t) => [...t, { id, msg, type }]);

    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [inv, cus, pts] = await Promise.all([
        apiJson(`${API}/sales-invoices`),

        apiJson(`${API}/customers`),

        apiJson(`${API}/parts`),
      ]);

      setInvoices(Array.isArray(inv) ? inv : []);

      setCustomers(Array.isArray(cus) ? cus : []);

      setParts(
        Array.isArray(pts) ? pts.filter((p) => p.isActive !== false) : [],
      );
    } catch (err) {
      addToast(err.message || "Failed to load data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  const updateItem = (i, field, val) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== i) return item;

        const updated = { ...item, [field]: val };

        if (field === "partId") {
          const part = parts.find((p) => p.id === parseInt(val, 10));

          if (part) updated.unitPrice = String(part.sellingPrice);
        }

        return updated;
      }),
    );
  };

  const subtotal = items.reduce(
    (s, i) =>
      s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0),

    0,
  );

  const discountAmount = subtotal > 5000 ? subtotal * 0.1 : 0;

  const totalAmount = subtotal - discountAmount;

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();

    return (
      !q ||
      inv.customerName?.toLowerCase().includes(q) ||
      inv.staffName?.toLowerCase().includes(q) ||
      String(inv.id).includes(q)
    );
  });

  const openCreate = () => {
    setCustomerId("");

    setStaffId("");

    setIsCredit(false);

    setItems([emptyItem()]);

    setShowForm(true);
  };

  const validateItems = () => {
    for (const item of items) {
      if (!item.partId || !item.quantity || !item.unitPrice) {
        return "Please fill all item fields.";
      }

      const qty = parseInt(item.quantity, 10);

      const part = parts.find((p) => p.id === parseInt(item.partId, 10));

      if (!part) return "Please select a valid part for each line.";

      if (qty <= 0) return "Quantity must be greater than zero.";

      if (qty > part.stockQuantity) {
        return `Insufficient stock for "${part.name}". Available: ${part.stockQuantity}.`;
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      addToast("Please select a customer.", "error");

      return;
    }

    const itemError = validateItems();

    if (itemError) {
      addToast(itemError, "error");

      return;
    }

    const body = {
      customerId: parseInt(customerId, 10),

      isCredit,

      items: items.map((i) => ({
        partId: parseInt(i.partId, 10),

        quantity: parseInt(i.quantity, 10),

        unitPrice: parseFloat(i.unitPrice),
      })),
    };

    if (staffId) body.staffId = parseInt(staffId, 10);

    setSubmitting(true);

    try {
      await apiJson(`${API}/sales-invoices`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(body),
      });

      addToast("Sales invoice created successfully.");

      setShowForm(false);

      load();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (inv) => {
    setShowDetail(inv);

    setDetailLoading(true);

    try {
      const detail = await apiJson(`${API}/sales-invoices/${inv.id}`);

      setShowDetail(detail);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiJson(`${API}/sales-invoices/${confirmDelete.id}`, {
        method: "DELETE",
      });

      addToast("Invoice deleted and stock reversed.");

      setConfirmDelete(null);

      load();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleSendEmail = async (inv) => {
    setEmailSending((prev) => new Set(prev).add(inv.id));
    try {
      await fetch(`${API}/sales-invoices/${inv.id}/send-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(data.message || `Request failed (${res.status})`);
      });
      setInvoices((prev) =>
        prev.map((x) => (x.id === inv.id ? { ...x, emailSent: true } : x)),
      );
      if (showDetail?.id === inv.id) {
        setShowDetail((prev) => prev && { ...prev, emailSent: true });
      }
      addToast("Invoice email sent successfully.");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setEmailSending((prev) => {
        const next = new Set(prev);
        next.delete(inv.id);
        return next;
      });
    }
  };

  const customerLabel = (c) =>
    c.userName || c.user?.name || `Customer #${c.id}`;

  const totalRevenue = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);

  const totalDiscount = invoices.reduce(
    (s, i) => s + (i.discountAmount || 0),
    0,
  );

  const creditCount = invoices.filter((i) => i.isCredit).length;

  const thisMonth = invoices.filter(
    (i) => new Date(i.saleDate).getMonth() === new Date().getMonth(),
  ).length;

  return (
    <div className="page">
      <Toast
        toasts={toasts}
        onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />

      <div className="ph">
        <div>
          <p className="ph-bc">Staff › Sales Invoices</p>

          <h1 className="ph-title">Sales Invoices</h1>

          <p className="ph-sub">Create and manage vehicle parts sales.</p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ExportPdfButton
            path="/sales-invoices"
            filename="sales-invoices.pdf"
            label="Export All"
          />
          <button type="button" className="btn btn-p" onClick={openCreate}>
            + New Sale
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="sc">
          <span className="sc-n">{invoices.length}</span>
          <span className="sc-l">Total Invoices</span>
        </div>

        <div className="sc">
          <span className="sc-n sc-n-g">
            Rs {totalRevenue.toLocaleString()}
          </span>
          <span className="sc-l">Total Revenue</span>
        </div>

        <div className="sc">
          <span className="sc-n" style={{ color: "#b05a00" }}>
            {creditCount}
          </span>
          <span className="sc-l">Credit Sales</span>
        </div>

        <div className="sc">
          <span className="sc-n" style={{ color: "#6b1a8a" }}>
            Rs {totalDiscount.toLocaleString()}
          </span>
          <span className="sc-l">Discounts Given</span>
        </div>

        <div className="sc">
          <span className="sc-n" style={{ color: "#1a4faa" }}>
            {thisMonth}
          </span>
          <span className="sc-l">This Month</span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="sw" style={{ width: 320 }}>
          <span className="sw-ic">⌕</span>

          <input
            className="sw-in"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, staff or ID..."
          />
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner" />
          <p>Loading invoices…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧾</div>

          <p>
            {search
              ? "No invoices match your search."
              : "No sales invoices yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((inv, i) => {
            const color = COLORS[i % COLORS.length];

            const date = new Date(inv.saleDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={inv.id}
                style={{
                  background: "#fff",

                  border: "1px solid #e5e4e7",

                  borderRadius: 14,

                  overflow: "hidden",

                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {inv.loyaltyDiscountApplied && (
                  <div
                    style={{
                      background: "#f0fdf4",

                      borderBottom: "1px solid #b3dfc0",

                      padding: "6px 20px",

                      fontSize: 11,

                      color: "#1a7a3a",

                      fontWeight: 600,
                    }}
                  >
                    🎉 10% Loyalty Discount Applied — Rs{" "}
                    {inv.discountAmount?.toLocaleString()} saved
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "stretch" }}>
                  <div style={{ width: 4, background: color, flexShrink: 0 }} />

                  <div
                    style={{
                      padding: "16px 20px",

                      display: "flex",

                      alignItems: "center",

                      gap: 14,

                      borderRight: "1px solid #f0f0f0",

                      minWidth: 190,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        flexShrink: 0,

                        background: `${color}15`,
                        border: `1px solid ${color}30`,
                        color,

                        fontSize: 11,
                        fontWeight: 800,

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {inv.customerName?.slice(0, 2).toUpperCase() || "SA"}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#08060d",
                        }}
                      >
                        SAL-{String(inv.id).padStart(4, "0")}
                      </div>

                      <div
                        style={{ fontSize: 12, color: "#9c97a3", marginTop: 2 }}
                      >
                        {date}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      padding: "16px 24px",
                      display: "flex",
                      alignItems: "center",

                      gap: 28,
                      borderRight: "1px solid #f0f0f0",
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      ["Customer", inv.customerName],

                      ["Staff", inv.staffName || "Staff"],

                      ["Items", `${inv.items?.length || 0} part(s)`],

                      ["Payment", inv.isPaid ? "Paid" : "Credit"],
                    ].map(([lb, val]) => (
                      <div
                        key={lb}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: "#9c97a3",
                            textTransform: "uppercase",

                            letterSpacing: "0.8px",
                            fontWeight: 600,
                          }}
                        >
                          {lb}
                        </span>

                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,

                            color:
                              lb === "Payment"
                                ? inv.isPaid
                                  ? "#1a7a3a"
                                  : "#b05a00"
                                : "#08060d",
                          }}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      flexDirection: "column",

                      alignItems: "flex-end",
                      justifyContent: "center",
                      gap: 10,
                      minWidth: 180,
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      {inv.discountAmount > 0 && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9c97a3",
                            textDecoration: "line-through",
                            marginBottom: 2,
                          }}
                        >
                          Rs {inv.subtotal?.toLocaleString()}
                        </div>
                      )}

                      <div
                        style={{
                          fontSize: 11,
                          color: "#9c97a3",
                          marginBottom: 2,
                        }}
                      >
                        Total Amount
                      </div>

                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: "#cc1e1e",
                        }}
                      >
                        Rs {inv.totalAmount?.toLocaleString()}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-g"
                        onClick={() => openDetail(inv)}
                      >
                        View
                      </button>

                      <button
                        type="button"
                        className="btn btn-d"
                        onClick={() => setConfirmDelete(inv)}
                      >
                        Delete
                      </button>

                      <button
                        type="button"
                        className="btn btn-g"
                        disabled={inv.emailSent || emailSending.has(inv.id)}
                        onClick={() => handleSendEmail(inv)}
                        style={
                          inv.emailSent
                            ? {
                                color: "#1a7a3a",
                                borderColor: "#b3dfc0",
                                background: "#f0fdf4",
                              }
                            : {}
                        }
                      >
                        {emailSending.has(inv.id)
                          ? "Sending…"
                          : inv.emailSent
                            ? "✓ Sent"
                            : "📧 Email"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Create Sales Invoice"
        wide
      >
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>
                Customer <span>*</span>
              </label>

              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">Select customer…</option>

                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {customerLabel(c)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>
                Staff ID{" "}
                <span style={{ fontWeight: 400, color: "#9c97a3" }}>
                  (optional)
                </span>
              </label>

              <input
                type="number"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="Leave blank to use default staff"
              />
            </div>
          </div>

          <div className="field">
            <label>
              Items <span>*</span>
            </label>

            <div
              style={{
                border: "1px solid #e5e4e7",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr auto",
                  gap: 8,

                  padding: "8px 12px",
                  background: "#f7f7f8",
                  fontSize: 11,
                  fontWeight: 600,

                  color: "#9c97a3",
                  textTransform: "uppercase",
                }}
              >
                <span>Part</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span />
              </div>

              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr auto",
                    gap: 8,

                    padding: "8px 12px",
                    borderTop: "1px solid #f0f0f0",
                    alignItems: "center",
                  }}
                >
                  <select
                    value={item.partId}
                    onChange={(e) => updateItem(idx, "partId", e.target.value)}
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e5e4e7",
                      borderRadius: 6,

                      fontSize: 12,
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="">Select part…</option>

                    {parts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stockQuantity})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    max={
                      item.partId
                        ? parts.find((p) => p.id === parseInt(item.partId, 10))
                            ?.stockQuantity
                        : undefined
                    }
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", e.target.value)
                    }
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e5e4e7",
                      borderRadius: 6,

                      fontSize: 12,
                      fontFamily: "inherit",
                    }}
                  />

                  <input
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    min="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(idx, "unitPrice", e.target.value)
                    }
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e5e4e7",
                      borderRadius: 6,

                      fontSize: 12,
                      fontFamily: "inherit",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (items.length === 1) {
                        addToast("At least one item required.", "error");

                        return;
                      }

                      setItems(items.filter((_, i) => i !== idx));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setItems([...items, emptyItem()])}
                style={{
                  padding: "8px 12px",
                  background: "#f7f7f8",
                  border: "none",

                  borderTop: "1px solid #e5e4e7",
                  width: "100%",
                  cursor: "pointer",

                  fontSize: 12,
                  color: "#6b6375",
                  fontFamily: "inherit",
                }}
              >
                + Add Item
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#f7f7f8",
              borderRadius: 8,
              padding: "12px 14px",

              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span style={{ color: "#6b6375" }}>Subtotal</span>

              <span style={{ fontWeight: 600 }}>
                Rs {subtotal.toLocaleString()}
              </span>
            </div>

            {discountAmount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "#1a7a3a" }}>
                  🎉 Loyalty Discount (10%)
                </span>

                <span style={{ color: "#1a7a3a", fontWeight: 600 }}>
                  - Rs {discountAmount.toLocaleString()}
                </span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 15,
                fontWeight: 700,

                borderTop: "1px solid #e5e4e7",
                paddingTop: 8,
              }}
            >
              <span>Total</span>

              <span style={{ color: "#cc1e1e" }}>
                Rs {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="field">
            <label>Payment Type</label>

            <div
              style={{
                display: "flex",
                background: "#f7f7f8",
                border: "1px solid #e5e4e7",

                borderRadius: 8,
                padding: 4,
                gap: 4,
              }}
            >
              <button
                type="button"
                onClick={() => setIsCredit(false)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",

                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",

                  background: !isCredit ? "#cc1e1e" : "transparent",

                  color: !isCredit ? "#fff" : "#6b6375",
                }}
              >
                Cash / Paid
              </button>

              <button
                type="button"
                onClick={() => setIsCredit(true)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",

                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",

                  background: isCredit ? "#b05a00" : "transparent",

                  color: isCredit ? "#fff" : "#6b6375",
                }}
              >
                Credit
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-g"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-p" disabled={submitting}>
              {submitting ? "Creating…" : "Create Invoice"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!showDetail}
        onClose={() => setShowDetail(null)}
        title={`SAL-${String(showDetail?.id || 0).padStart(4, "0")}`}
        wide
      >
        {detailLoading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p>Loading invoice…</p>
          </div>
        ) : (
          showDetail && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-grid">
                {[
                  ["Customer", showDetail.customerName],

                  ["Staff", showDetail.staffName || "Staff"],

                  [
                    "Date",
                    new Date(showDetail.saleDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }),
                  ],

                  ["Status", showDetail.isPaid ? "✓ Paid" : "⏳ Credit"],
                ].map(([lb, val]) => (
                  <div
                    key={lb}
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "#9c97a3",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: 600,
                      }}
                    >
                      {lb}
                    </span>

                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,

                        color:
                          lb === "Status"
                            ? showDetail.isPaid
                              ? "#1a7a3a"
                              : "#b05a00"
                            : "#08060d",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  border: "1px solid #e5e4e7",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: 8,

                    padding: "8px 14px",
                    background: "#f7f7f8",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#9c97a3",

                    textTransform: "uppercase",
                  }}
                >
                  <span>Part</span>
                  <span>Qty</span>
                  <span>Unit Price</span>
                  <span style={{ textAlign: "right" }}>Line Total</span>
                </div>

                {showDetail.items?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr",
                      gap: 8,

                      padding: "10px 14px",
                      borderTop: "1px solid #f0f0f0",
                      fontSize: 13,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#08060d" }}>
                        {item.partName}
                      </div>

                      <div style={{ fontSize: 11, color: "#9c97a3" }}>
                        {item.sku}
                      </div>
                    </div>

                    <span>{item.quantity}</span>

                    <span>Rs {item.unitPrice?.toLocaleString()}</span>

                    <span
                      style={{
                        fontWeight: 700,
                        color: "#cc1e1e",
                        textAlign: "right",
                      }}
                    >
                      Rs {item.lineTotal?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#f7f7f8",
                  borderRadius: 8,
                  padding: "12px 14px",

                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: "#6b6375" }}>Subtotal</span>

                  <span>Rs {showDetail.subtotal?.toLocaleString()}</span>
                </div>

                {showDetail.discountAmount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "#1a7a3a" }}>
                      🎉 Loyalty Discount (10%)
                    </span>

                    <span style={{ color: "#1a7a3a", fontWeight: 600 }}>
                      - Rs {showDetail.discountAmount?.toLocaleString()}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 16,
                    fontWeight: 700,

                    borderTop: "1px solid #e5e4e7",
                    paddingTop: 8,
                  }}
                >
                  <span>Total</span>

                  <span style={{ color: "#cc1e1e" }}>
                    Rs {showDetail.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: showDetail?.emailSent ? "#f0fdf4" : "#f7f7f8",
                  border: `1px solid ${showDetail?.emailSent ? "#b3dfc0" : "#e5e4e7"}`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>
                    {showDetail?.emailSent ? "✅" : "📧"}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: showDetail?.emailSent ? "#1a7a3a" : "#6b6375",
                      }}
                    >
                      {showDetail?.emailSent
                        ? "Invoice email sent"
                        : "Invoice email not sent"}
                    </div>
                    <div style={{ fontSize: 11, color: "#9c97a3" }}>
                      {showDetail?.emailSent
                        ? "Customer has received this invoice by email."
                        : "Click the button to email this invoice to the customer."}
                    </div>
                  </div>
                </div>
                {!showDetail?.emailSent && (
                  <button
                    type="button"
                    className="btn btn-g"
                    disabled={showDetail && emailSending.has(showDetail.id)}
                    onClick={() => showDetail && handleSendEmail(showDetail)}
                    style={{ fontSize: 12, padding: "8px 14px" }}
                  >
                    {showDetail && emailSending.has(showDetail.id)
                      ? "Sending…"
                      : "📧 Send Invoice Email"}
                  </button>
                )}
              </div>

              <div className="form-actions">
                {showDetail?.id && (
                  <ExportPdfButton
                    path={`/sales-invoice/${showDetail.id}`}
                    filename={`sales-invoice-${showDetail.id}.pdf`}
                    label="Download PDF"
                  />
                )}
                <button
                  type="button"
                  className="btn btn-g"
                  onClick={() => setShowDetail(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )
        )}
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Invoice?"
      >
        <div className="confirm-body">
          <div className="confirm-icon">⚠</div>

          <p className="confirm-text">
            Invoice{" "}
            <strong>
              SAL-{String(confirmDelete?.id || 0).padStart(4, "0")}
            </strong>{" "}
            will be permanently deleted and stock reversed.
          </p>

          <div className="form-actions" style={{ justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </button>

            <button type="button" className="btn btn-d" onClick={handleDelete}>
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
