import { useState } from "react";

const BASE_URL = "http://localhost:5169/api";

export const getCustomerDetails = async (customerId, token) => {
    const res = await fetch(`${BASE_URL}/customers/${customerId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
};

export const getCustomerHistory = async (customerId, token) => {
    const res = await fetch(`${BASE_URL}/customers/${customerId}/history`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
};

export default function CustomerDetails() {
    const token = localStorage.getItem("token");
    const [customerId, setCustomerId] = useState("");
    const [customer, setCustomer] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState("details");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setCustomer(null);
        setHistory([]);

        const [details, hist] = await Promise.all([
            getCustomerDetails(customerId, token),
            getCustomerHistory(customerId, token)
        ]);

        if (details.id) {
            setCustomer(details);
            setHistory(hist);
        } else {
            setError(details.message || "Customer not found.");
        }
        setLoading(false);
    };

    return (
        <div className="page">
            <h1 className="page-title">Customer Details</h1>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-1 mb-3" style={{ maxWidth: "400px" }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                    <input
                        type="number"
                        placeholder="Enter Customer ID"
                        value={customerId}
                        onChange={e => setCustomerId(e.target.value)}
                        required
                    />
                </div>
                <button className="btn btn-primary" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {error && <div className="badge badge-danger mb-2">{error}</div>}

            {customer && (
                <>
                    {/* Tabs */}
                    <div className="flex gap-1 mb-3">
                        {["details", "vehicles", "history"].map(tab => (
                            <button
                                key={tab}
                                className="btn"
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    background: activeTab === tab ? "var(--primary)" : "var(--bg-card)",
                                    color: activeTab === tab ? "#111" : "var(--text-secondary)",
                                    textTransform: "capitalize"
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Details Tab */}
                    {activeTab === "details" && (
                        <div className="card" style={{ maxWidth: "500px" }}>
                            <h3 style={{ color: "var(--primary)", marginBottom: "20px" }}>
                                {customer.fullName}
                            </h3>
                            {[
                                ["Email", customer.email],
                                ["Phone", customer.phone],
                                ["Loyalty Tier", customer.loyaltyTier],
                                ["Total Spent", `Rs. ${customer.totalSpent.toLocaleString()}`],
                                ["Credit Balance", `Rs. ${customer.creditBalance.toLocaleString()}`],
                                ["Member Since", new Date(customer.createdAt).toLocaleDateString()]
                            ].map(([label, value]) => (
                                <div key={label} className="flex-between" style={{
                                    padding: "12px 0",
                                    borderBottom: "1px solid var(--border)"
                                }}>
                                    <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                                    <span style={{ fontWeight: 600 }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Vehicles Tab */}
                    {activeTab === "vehicles" && (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Vehicle No.</th>
                                        <th>Make</th>
                                        <th>Model</th>
                                        <th>Year</th>
                                        <th>VIN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.vehicles.length === 0 ? (
                                        <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)" }}>No vehicles registered</td></tr>
                                    ) : customer.vehicles.map(v => (
                                        <tr key={v.id}>
                                            <td>{v.vehicleNumber}</td>
                                            <td>{v.make}</td>
                                            <td>{v.model}</td>
                                            <td>{v.year}</td>
                                            <td>{v.vin || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === "history" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {history.length === 0 ? (
                                <p>No purchase history found.</p>
                            ) : history.map(inv => (
                                <div key={inv.invoiceId} className="card">
                                    <div className="flex-between mb-2">
                                        <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                                            Invoice #{inv.invoiceId}
                                        </span>
                                        <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                                            {new Date(inv.saleDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <table style={{ marginBottom: "12px" }}>
                                        <thead>
                                            <tr>
                                                <th>Part</th>
                                                <th>Qty</th>
                                                <th>Unit Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inv.items.map((item, i) => (
                                                <tr key={i}>
                                                    <td>{item.partName}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>Rs. {item.unitPrice.toLocaleString()}</td>
                                                    <td>Rs. {item.lineTotal.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="flex-between">
                                        <div className="flex gap-1">
                                            <span className={`badge ${inv.isPaid ? "badge-success" : "badge-danger"}`}>
                                                {inv.isPaid ? "Paid" : "Unpaid"}
                                            </span>
                                            {inv.isCredit && (
                                                <span className="badge badge-warning">Credit</span>
                                            )}
                                            {inv.discountAmount > 0 && (
                                                <span className="badge badge-success">
                                                    10% Discount Applied
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            {inv.discountAmount > 0 && (
                                                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                                    Discount: - Rs. {inv.discountAmount.toLocaleString()}
                                                </p>
                                            )}
                                            <strong style={{ color: "var(--primary)" }}>
                                                Total: Rs. {inv.totalAmount.toLocaleString()}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}