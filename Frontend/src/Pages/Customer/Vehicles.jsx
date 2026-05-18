import { useState, useEffect } from "react";
import "./Customer.css";

const BASE_URL = "http://localhost:5169/api";

export const getProfile = async (token) => {
    const res = await fetch(`${BASE_URL}/customers/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
};

export const addVehicle = async (data, token) => {
    const res = await fetch(`${BASE_URL}/customers/vehicles`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return res.json();
};

export default function MyVehicles() {
    const token = localStorage.getItem("token");
    const [vehicles, setVehicles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ brand: "", model: "", year: "", vehicleNumber: "", vin: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        try {
            const res = await getProfile(token);
            if (res && Array.isArray(res.vehicles)) {
                setVehicles(res.vehicles);
            }
        } catch (err) {
            console.error("Failed to load customer vehicles:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (!form.brand || !form.model || !form.year || !form.vehicleNumber) {
            setError("Please fill in all required fields.");
            setLoading(false);
            return;
        }

        try {
            const res = await addVehicle({
                brand: form.brand,
                model: form.model,
                year: parseInt(form.year),
                vehicleNumber: form.vehicleNumber,
                vin: form.vin
            }, token);

            if (res.message === "Vehicle added successfully.") {
                setMessage("Vehicle registered successfully!");
                setForm({ brand: "", model: "", year: "", vehicleNumber: "", vin: "" });
                setShowForm(false);
                loadVehicles();
            } else {
                setError(res.message || "Failed to register vehicle.");
            }
        } catch (err) {
            setError("Server connection lost. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            {/* Header */}
            <div className="ph">
                <div>
                    <div className="ph-bc">My Portal</div>
                    <div className="ph-title">My Registered Vehicles</div>
                    <div className="ph-sub">Manage your active garage profile and register new vehicles for diagnostics.</div>
                </div>
                <button className="btn btn-p" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Register Vehicle"}
                </button>
            </div>

            {/* Registration Form */}
            {showForm && (
                <div className="card mb-3" style={{ maxWidth: "600px", animation: "fadeUp 0.3s ease" }}>
                    <div className="card-top-line" style={{ background: "linear-gradient(90deg, var(--accent), transparent)" }} />
                    <h3 style={{ marginBottom: "20px", fontWeight: 700 }}>Register New Vehicle</h3>
                    {error && <div className="badge badge-danger mb-2" style={{ width: "100%" }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-grid">
                            <div className="field">
                                <label>Brand / Make *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Toyota"
                                    value={form.brand}
                                    onChange={e => setForm({ ...form, brand: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>Model Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Corolla"
                                    value={form.model}
                                    onChange={e => setForm({ ...form, model: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="field">
                                <label>Manufacture Year *</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 2019"
                                    value={form.year}
                                    onChange={e => setForm({ ...form, year: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>Plate/Registration Number *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. BA 3 PA 8829"
                                    value={form.vehicleNumber}
                                    onChange={e => setForm({ ...form, vehicleNumber: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label>VIN / Chassis Number (optional)</label>
                            <input
                                type="text"
                                placeholder="17-character chassis number"
                                value={form.vin}
                                onChange={e => setForm({ ...form, vin: e.target.value })}
                            />
                        </div>

                        <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                            {loading ? "Registering..." : "Register Vehicle"}
                        </button>
                    </form>
                </div>
            )}

            {message && <div className="badge badge-success mb-3" style={{ width: "100%", textAlign: "center", padding: "10px" }}>{message}</div>}

            {/* Vehicles List */}
            {vehicles.length === 0 ? (
                <div className="card empty-state" style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state-icon" style={{ fontSize: "48px" }}>🚗</div>
                    <h3>No Vehicles Registered</h3>
                    <p style={{ marginTop: "8px" }}>You must register at least one vehicle to book appointments and run AI diagnostics. Click "+ Register Vehicle".</p>
                </div>
            ) : (
                <div className="grid">
                    {vehicles.map(v => (
                        <div key={v.id} className="card" style={{ animation: "fadeUp 0.3s ease" }}>
                            <div className="card-top-line" style={{ background: "linear-gradient(90deg, #aa3bff, transparent)" }} />
                            <div className="card-head">
                                <div className="card-av" style={{ background: "rgba(170,59,255,0.08)", color: "var(--accent)" }}>
                                    🚗
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="card-title" style={{ fontSize: "16px", fontWeight: 700 }}>{v.brand} {v.model}</div>
                                    <div className="card-id">{v.vehicleNumber}</div>
                                </div>
                                <span className="badge b-act">Active</span>
                            </div>

                            <div className="card-rows" style={{ marginTop: "12px" }}>
                                <div className="card-row">
                                    <span className="card-row-ic">🗓️</span>
                                    <span className="card-row-lb">Year</span>
                                    <span className="card-row-val">{v.year}</span>
                                </div>
                                <div className="card-row">
                                    <span className="card-row-ic">🔑</span>
                                    <span className="card-row-lb">VIN</span>
                                    <span className="card-row-val">{v.vin || "Not recorded"}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
