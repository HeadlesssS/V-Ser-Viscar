import { useState, useEffect } from "react";
import "./Customer.css";

const BASE_URL = "http://localhost:5169/api";

export const createPartRequest = async (data, token) => {
    const res = await fetch(`${BASE_URL}/part-requests`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const getMyPartRequests = async (token) => {
    const res = await fetch(`${BASE_URL}/part-requests/my`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
};

export default function PartsRequest() {
    const token = localStorage.getItem("token");
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ partName: "", description: "", quantityRequested: 1 });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadRequests(); }, []);

    const loadRequests = async () => {
        const res = await getMyPartRequests(token);
        if (Array.isArray(res)) setRequests(res);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const res = await createPartRequest(form, token);

        if (res.message === "Part request submitted successfully.") {
            setMessage("Request submitted!");
            setShowForm(false);
            setForm({ partName: "", description: "", quantityRequested: 1 });
            loadRequests();
        } else {
            setError(res.message || "Failed to submit request.");
        }
        setLoading(false);
    };

    const statusLabelColor = (status) => {
        if (status === "Fulfilled") return "b-act";
        if (status === "Rejected") return "b-ina";
        return "badge-warning";
    };

    return (
        <div className="page">
            <div className="ph">
                <div>
                    <div className="ph-bc">My Portal</div>
                    <div className="ph-title">Part Requests</div>
                    <div className="ph-sub">Request specialized or out-of-stock vehicle components.</div>
                </div>
                <button className="btn btn-p" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Request a Part"}
                </button>
            </div>

            {/* Book Form */}
            {showForm && (
                <div className="card mb-3" style={{ maxWidth: "600px", animation: "fadeUp 0.3s ease" }}>
                    <div className="card-top-line" style={{ background: "linear-gradient(90deg, var(--accent), transparent)" }} />
                    <h3 style={{ marginBottom: "20px", fontWeight: 700 }}>Request Unavailable Part</h3>
                    {error && <div className="badge badge-danger mb-2" style={{ width: "100%" }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="form">
                        <div className="field">
                            <label>Part Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Front Brake Pads for Toyota Corolla 2019"
                                value={form.partName}
                                onChange={e => setForm({ ...form, partName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-grid">
                            <div className="field">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={form.quantityRequested}
                                    onChange={e => setForm({ ...form, quantityRequested: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label>Description & Notes</label>
                            <textarea
                                rows={3}
                                placeholder="Specify part number, brand preferences, or vehicle description..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                style={{
                                    background: "#fff", border: "1px solid var(--border)",
                                    padding: "12px", borderRadius: "8px",
                                    color: "#08060d", fontSize: "14px", resize: "vertical",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                    </form>
                </div>
            )}

            {message && <div className="badge badge-success mb-3" style={{ width: "100%", textAlign: "center", padding: "10px" }}>{message}</div>}

            {/* Invoices List */}
            {requests.length === 0 ? (
                <div className="card empty-state" style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state-icon" style={{ fontSize: "48px" }}>🔧</div>
                    <h3>No Part Requests Found</h3>
                    <p style={{ marginTop: "8px" }}>You haven't requested any parts yet. Click "+ Request a Part" to request one.</p>
                </div>
            ) : (
                <div className="part-request-list">
                    {requests.map(r => (
                        <div key={r.id} className="part-request-card">
                            <div>
                                <div style={{ fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span>⚙️ {r.partName}</span>
                                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                                        (Qty: {r.quantityRequested})
                                    </span>
                                </div>
                                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                                    {r.description || "No description provided."}
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "8px" }}>
                                    Requested on {new Date(r.requestedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <span className={`badge ${statusLabelColor(r.status)}`}>{r.status}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
