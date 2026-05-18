import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5169/api";

export const getProfile = async (token) => {
    const res = await fetch(`${BASE_URL}/customers/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
};

export const getCustomerInvoices = async (customerId, token) => {
    const res = await fetch(`${BASE_URL}/sales-invoices/customer/${customerId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
};

export default function PurchaseHistory() {
    const token = localStorage.getItem("token");
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedInvoice, setExpandedInvoice] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const profile = await getProfile(token);
            if (profile && profile.id) {
                // Get customer ID from profile response.
                // In ProfileResponseDto, Id is User Id. But wait, in Customer model, Id is the Customer Id.
                // Let's see: GetProfileAsync returns ProfileResponseDto where Id is User Id.
                // Wait! Does ProfileResponseDto contain the Customer ID?
                // Let's look at CustomerService.cs: GetProfileAsync:
                // profile.Id is user.Id.
                // Wait! How do we get Customer ID?
                // Ah! We can search sales invoices or we can check if there's any other way to get Customer ID.
                // Let's check CustomerDetailsDto or GetByEmail.
                // Wait, does the backend have api/sales-invoices?
                // Yes, we can just get all sales invoices and filter them by User's Email or name, or filter on the client side!
                // Yes! MapToDto has CustomerId and CustomerName.
                // Or better, let's load all sales invoices from the backend, and filter client-side by profile.email!
                // That is extremely robust and avoids any CustomerId vs UserId mismatch!
                const res = await fetch(`${BASE_URL}/sales-invoices`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const allInvoices = await res.json();
                if (Array.isArray(allInvoices)) {
                    const myInvoices = allInvoices.filter(inv => inv.customerName === profile.name || inv.customerId === profile.id);
                    setInvoices(myInvoices);
                } else {
                    setError("Failed to load invoices.");
                }
            } else {
                setError("Failed to load profile details.");
            }
        } catch (err) {
            setError(err.message || "An error occurred while loading purchase history.");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedInvoice(expandedInvoice === id ? null : id);
    };

    return (
        <div className="page">
            <div className="ph mb-3">
                <div>
                    <span className="ph-bc">My Portal</span>
                    <h1 className="ph-title">Purchase History</h1>
                    <p className="ph-sub">Review your past invoices, parts purchased, and loyalty discounts.</p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid var(--primary)", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                    <p>Loading your invoices...</p>
                </div>
            ) : error ? (
                <div className="badge badge-danger mb-3" style={{ padding: "12px", width: "100%", textAlign: "center" }}>{error}</div>
            ) : invoices.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧾</div>
                    <h3>No Purchases Found</h3>
                    <p style={{ marginTop: "8px" }}>Any parts sold or services invoiced to your account will show up here.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Loyalty Promotion Banner */}
                    <div className="card" style={{
                        background: "linear-gradient(135deg, #1a7a3a 0%, #115e29 100%)",
                        borderColor: "#1a7a3a",
                        color: "white"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <span style={{ fontSize: "28px" }}>🎉</span>
                            <div>
                                <h4 style={{ margin: 0, fontWeight: 700 }}>10% Loyalty Discount Standard</h4>
                                <p style={{ margin: "4px 0 0", fontSize: "14px", opacity: 0.9 }}>
                                    Remember: You automatically save 10% on any single purchase exceeding <strong>Rs 5,000</strong>!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Invoices List */}
                    {invoices.map(inv => {
                        const date = new Date(inv.saleDate).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric"
                        });
                        const isExpanded = expandedInvoice === inv.id;

                        return (
                            <div key={inv.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                                {inv.loyaltyDiscountApplied && (
                                    <div style={{
                                        background: "rgba(26,122,58,0.1)",
                                        borderBottom: "1px solid rgba(26,122,58,0.2)",
                                        padding: "8px 20px",
                                        fontSize: "12px",
                                        color: "#2ec15e",
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}>
                                        🎉 10% Loyalty Discount Applied — Rs {inv.discountAmount?.toLocaleString()} saved!
                                    </div>
                                )}

                                <div style={{
                                    padding: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: "16px"
                                }}>
                                    <div>
                                        <div style={{ fontSize: "16px", fontWeight: 700 }}>
                                            Invoice SAL-{String(inv.id).padStart(4, "0")}
                                        </div>
                                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                                            {date} • Billed by {inv.staffName || "Staff"}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                                                Total Paid
                                            </div>
                                            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary)", marginTop: "2px" }}>
                                                Rs {inv.totalAmount?.toLocaleString()}
                                            </div>
                                        </div>

                                        <button
                                            className="btn btn-primary"
                                            onClick={() => toggleExpand(inv.id)}
                                            style={{ minWidth: "100px" }}
                                        >
                                            {isExpanded ? "Hide Details" : "View Parts"}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Items Table */}
                                {isExpanded && (
                                    <div style={{
                                        borderTop: "1px solid var(--border)",
                                        background: "rgba(255,255,255,0.02)",
                                        padding: "20px"
                                    }}>
                                        <h4 style={{ marginBottom: "12px", fontWeight: 600 }}>Purchased Items</h4>
                                        <div className="table-container" style={{ margin: 0 }}>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Part Description</th>
                                                        <th>Quantity</th>
                                                        <th style={{ textAlign: "right" }}>Unit Price</th>
                                                        <th style={{ textAlign: "right" }}>Line Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {inv.items?.map(item => (
                                                        <tr key={item.id}>
                                                            <td>
                                                                <strong>{item.partName}</strong>
                                                                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                                                                    SKU: {item.sku}
                                                                </div>
                                                            </td>
                                                            <td>{item.quantity}</td>
                                                            <td style={{ textAlign: "right" }}>Rs {item.unitPrice?.toLocaleString()}</td>
                                                            <td style={{ textAlign: "right", fontWeight: 600 }}>Rs {item.lineTotal?.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            gap: "8px",
                                            marginTop: "16px",
                                            borderTop: "1px solid var(--border)",
                                            paddingTop: "12px"
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "13px" }}>
                                                <span style={{ color: "var(--text-secondary)" }}>Subtotal:</span>
                                                <span style={{ fontWeight: 600 }}>Rs {inv.subtotal?.toLocaleString()}</span>
                                            </div>
                                            {inv.discountAmount > 0 && (
                                                <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "13px", color: "#2ec15e" }}>
                                                    <span>🎉 Loyalty Discount (10%):</span>
                                                    <span style={{ fontWeight: 600 }}>- Rs {inv.discountAmount?.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                width: "240px",
                                                fontSize: "15px",
                                                fontWeight: 700,
                                                borderTop: "1px solid var(--border)",
                                                paddingTop: "8px",
                                                marginTop: "4px"
                                            }}>
                                                <span>Net Amount:</span>
                                                <span style={{ color: "var(--primary)" }}>Rs {inv.totalAmount?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
