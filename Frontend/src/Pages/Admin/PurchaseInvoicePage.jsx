import { useState, useEffect, useCallback } from "react";
import ExportPdfButton from "../../components/ExportPdfButton";
import "./admin.css";

const API = "/api";

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
      <div className="modal-box" style={wide ? { maxWidth: 580 } : {}}>
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

export default function PurchaseInvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([
    { partId: "", quantity: "", unitCost: "" },
  ]);
  const [vendorId, setVendorId] = useState("");
  const [notes, setNotes] = useState("");
  const [adminId, setAdminId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, ven] = await Promise.all([
        fetch(`${API}/purchase-invoices`).then((r) => r.json()),
        fetch(`${API}/vendors`).then((r) => r.json()),
      ]);
      setInvoices(Array.isArray(inv) ? inv : []);
      setVendors(Array.isArray(ven) ? ven.filter((v) => v.isActive) : []);
    } catch {
      addToast("Failed to load data.", "error");
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

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      !q ||
      inv.vendorName?.toLowerCase().includes(q) ||
      String(inv.id).includes(q)
    );
  });

  const openCreate = () => {
    setVendorId("");
    setNotes("");
    setAdminId("");
    setItems([{ partId: "", quantity: "", unitCost: "" }]);
    setShowForm(true);
  };

  const updateItem = (i, field, val) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorId) {
      addToast("Please select a vendor.", "error");
      return;
    }
    const token = localStorage.getItem("token");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/purchase-invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminId: parseInt(adminId),
          vendorId: parseInt(vendorId),
          notes,
          items: items.map((i) => ({
            partId: parseInt(i.partId),
            quantity: parseInt(i.quantity),
            unitCost: parseFloat(i.unitCost),
          })),
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message);
      }
      addToast("Invoice created successfully.");
      setShowForm(false);
      load();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/purchase-invoices/${confirmDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message);
      }
      addToast("Invoice deleted and stock reversed.");
      setConfirmDelete(null);
      load();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const totalSpent = invoices.reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="page">
      <Toast
        toasts={toasts}
        onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />

      <div className="ph">
        <div>
          <p className="ph-bc">Admin › Purchase Invoices</p>
          <h1 className="ph-title">Purchase Invoices</h1>
          <p className="ph-sub">Track all stock purchases from vendors.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ExportPdfButton
            path="/purchase-invoices"
            filename="purchase-invoices.pdf"
            label="Export All"
          />
          <button className="btn btn-p" onClick={openCreate}>
            + New Invoice
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="sc">
          <span className="sc-n">{invoices.length}</span>
          <span className="sc-l">Total Invoices</span>
        </div>
        <div className="sc">
          <span className="sc-n">Rs {totalSpent.toLocaleString()}</span>
          <span className="sc-l">Total Spent</span>
        </div>
      </div>

      {/* Shorter search bar */}
      <div className="tb">
        <div className="sw" style={{ maxWidth: 320 }}>
          <span className="sw-ic">⌕</span>
          <input
            className="sw-in"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices..."
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
          <p>No invoices found.</p>
        </div>
      ) : (
        <div className="grid" style={{ gap: 20 }}>
          {filtered.map((inv) => {
            const date = new Date(inv.purchaseDate).toLocaleDateString(
              "en-GB",
              { day: "2-digit", month: "short", year: "numeric" },
            );
            const invNum = `INV-${String(inv.id).padStart(4, "0")}`;
            return (
              <div
                key={inv.id}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,0,0,0.12)";
                  e.currentTarget.style.borderColor = "#cc1e1e44";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = "#e5e4e7";
                }}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e4e7",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition:
                    "transform .18s, box-shadow .18s, border-color .18s",
                  cursor: "default",
                }}
              >
                {/* Invoice header bar */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #7a0e0e 0%, #cc1e1e 100%)",
                    padding: "14px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 600,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        marginBottom: 2,
                      }}
                    >
                      Purchase Invoice
                    </div>
                    <div
                      style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}
                    >
                      {invNum}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.7)",
                        marginBottom: 2,
                      }}
                    >
                      Date
                    </div>
                    <div
                      style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}
                    >
                      {date}
                    </div>
                  </div>
                </div>

                {/* Invoice body */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #f3f2f4",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                  }}
                >
                  {[
                    ["🏭 Vendor", inv.vendorName],
                    ["👤 Admin", inv.adminName || "Admin"],
                    ["📝 Notes", inv.notes || "—"],
                    ["📦 Items", `${inv.items?.length || 0} item(s)`],
                    [
                      "🔖 Part IDs",
                      inv.items
                        ?.map((i) => i.partId || i.partName)
                        .filter(Boolean)
                        .join(", ") || "—",
                    ],
                    [
                      "💰 Unit Costs",
                      "Rs " +
                        (inv.items
                          ?.map((i) => i.unitCost?.toLocaleString())
                          .filter(Boolean)
                          .join(", ") || "—"),
                    ],
                  ].map(([lb, val]) => (
                    <div
                      key={lb}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 0",
                        borderBottom: "1px solid #f7f6f8",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "#9c97a3",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          flexShrink: 0,
                        }}
                      >
                        {lb}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#08060d",
                          fontWeight: 500,
                          textAlign: "right",
                        }}
                      >
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Invoice footer */}
                <div
                  style={{
                    padding: "14px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#fafafa",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#9c97a3",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Total Amount
                    </span>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#cc1e1e",
                        marginTop: 2,
                      }}
                    >
                      Rs {inv.totalAmount?.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <ExportPdfButton
                      path={`/purchase-invoice/${inv.id}`}
                      filename={`purchase-invoice-${inv.id}.pdf`}
                      label="PDF"
                      style={{ padding: "9px 14px", fontSize: 12 }}
                    />
                    <button
                      onClick={() => setConfirmDelete(inv)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#a81818")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#cc1e1e")
                      }
                      style={{
                        padding: "9px 20px",
                        background: "#cc1e1e",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "background .15s",
                        letterSpacing: "0.3px",
                      }}
                    >
                      ✕ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Create Purchase Invoice"
        wide
      >
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>
                Vendor <span>*</span>
              </label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                required
              >
                <option value="">Select vendor…</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>
                Admin ID <span>*</span>
              </label>
              <input
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter admin ID"
                required
              />
            </div>
            <div className="field">
              <label>Notes</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
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
                  letterSpacing: "0.5px",
                }}
              >
                <span>Part ID</span>
                <span>Qty</span>
                <span>Unit Cost</span>
                <span></span>
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
                  <input
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e5e4e7",
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                    placeholder="Part ID"
                    value={item.partId}
                    onChange={(e) => updateItem(idx, "partId", e.target.value)}
                  />
                  <input
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e5e4e7",
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", e.target.value)
                    }
                  />
                  <input
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e5e4e7",
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                    type="number"
                    placeholder="Cost"
                    value={item.unitCost}
                    onChange={(e) =>
                      updateItem(idx, "unitCost", e.target.value)
                    }
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
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      border: "1px solid #fcc",
                      background: "#fff8f8",
                      color: "#cc1e1e",
                      cursor: "pointer",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setItems([
                    ...items,
                    { partId: "", quantity: "", unitCost: "" },
                  ])
                }
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

      {/* Delete Confirm */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Invoice?"
      >
        <div className="confirm-body">
          <div className="confirm-icon">⚠</div>
          <p className="confirm-text">
            Invoice{" "}
            <strong>INV-{String(confirmDelete?.id).padStart(4, "0")}</strong>{" "}
            will be permanently deleted and stock will be reversed.
          </p>
          <div className="form-actions" style={{ justifyContent: "center" }}>
            <button
              className="btn btn-g"
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </button>
            <button className="btn btn-d" onClick={handleDelete}>
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
