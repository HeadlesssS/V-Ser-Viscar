import { useState, useEffect } from "react";
import "./Customer.css";

const BASE_URL = "http://localhost:5169/api";

export const bookAppointment = async (data, token) => {
    const res = await fetch(`${BASE_URL}/appointments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const getMyAppointments = async (token) => {
    const res = await fetch(`${BASE_URL}/appointments/my`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
};

export const getProfile = async (token) => {
    const res = await fetch(`${BASE_URL}/customers/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
};

export default function Appointments() {
    const token = localStorage.getItem("token");
    const [appointments, setAppointments] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        vehicleId: "", appointmentDate: "", serviceType: "", notes: ""
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const serviceTypes = [
        "Oil Change", "Brake Service", "Engine Repair",
        "Tyre Replacement", "Battery Check", "General Service"
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [appts, profile] = await Promise.all([
            getMyAppointments(token),
            getProfile(token)
        ]);
        if (Array.isArray(appts)) setAppointments(appts);
        if (profile && profile.vehicles) setVehicles(profile.vehicles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const res = await bookAppointment({
            vehicleId: parseInt(form.vehicleId),
            appointmentDate: new Date(form.appointmentDate).toISOString(),
            serviceType: form.serviceType,
            notes: form.notes
        }, token);

        if (res.message === "Appointment booked successfully.") {
            setMessage("Appointment booked!");
            setShowForm(false);
            setForm({ vehicleId: "", appointmentDate: "", serviceType: "", notes: "" });
            loadData();
        } else {
            setError(res.message || "Failed to book appointment.");
        }
        setLoading(false);
    };

    const statusColor = (status) => {
        if (status === "Confirmed") return "badge-success";
        if (status === "Cancelled") return "badge-danger";
        if (status === "Completed") return "badge-success";
        return "badge-warning";
    };

    const statusLabelColor = (status) => {
        if (status === "Confirmed") return "b-act";
        if (status === "Cancelled") return "b-ina";
        if (status === "Completed") return "b-act";
        return "badge-warning";
    };

    return (
        <div className="page">
            <div className="ph">
                <div>
                    <div className="ph-bc">My Portal</div>
                    <div className="ph-title">My Appointments</div>
                    <div className="ph-sub">Manage, book and review your upcoming vehicle maintenance.</div>
                </div>
                <button className="btn btn-p" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Book Appointment"}
                </button>
            </div>

            {/* Book Form */}
            {showForm && (
                <div className="card mb-3" style={{ maxWidth: "600px", animation: "fadeUp 0.3s ease" }}>
                    <div className="card-top-line" style={{ background: "linear-gradient(90deg, var(--accent), transparent)" }} />
                    <h3 style={{ marginBottom: "20px", fontWeight: 700 }}>Book New Appointment</h3>
                    {error && <div className="badge badge-danger mb-2" style={{ width: "100%" }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-grid">
                            <div className="field">
                                <label>Select Vehicle</label>
                                <select
                                    value={form.vehicleId}
                                    onChange={e => setForm({ ...form, vehicleId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select a vehicle --</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.vehicleNumber} — {v.make || v.brand} {v.model}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field">
                                <label>Service Type</label>
                                <select
                                    value={form.serviceType}
                                    onChange={e => setForm({ ...form, serviceType: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select service --</option>
                                    {serviceTypes.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="field">
                            <label>Date & Time</label>
                            <input
                                type="datetime-local"
                                value={form.appointmentDate}
                                onChange={e => setForm({ ...form, appointmentDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="field">
                            <label>Notes (optional)</label>
                            <textarea
                                rows={3}
                                placeholder="Describe the issue or specify any requests..."
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                style={{
                                    background: "#fff", border: "1px solid var(--border)",
                                    padding: "12px", borderRadius: "8px",
                                    color: "#08060d", fontSize: "14px", resize: "vertical",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                            {loading ? "Booking..." : "Book Appointment"}
                        </button>
                    </form>
                </div>
            )}

            {message && <div className="badge badge-success mb-3" style={{ width: "100%", textAlign: "center", padding: "10px" }}>{message}</div>}

            {/* Appointments List */}
            {appointments.length === 0 ? (
                <div className="card empty-state" style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state-icon" style={{ fontSize: "48px" }}>📅</div>
                    <h3>No Appointments Found</h3>
                    <p style={{ marginTop: "8px" }}>You have no scheduled service appointments. Click "+ Book Appointment" to schedule one.</p>
                </div>
            ) : (
                <div className="appointment-grid">
                    {appointments.map(a => (
                        <div key={a.id} className={`card appointment-card ${a.status}`}>
                            <div className="card-head">
                                <div className="card-av" style={{ background: "rgba(170,59,255,0.08)", color: "var(--accent)" }}>
                                    🔧
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="card-title" style={{ fontSize: "16px", fontWeight: 700 }}>{a.serviceType}</div>
                                    <div className="card-id">{a.vehicleNumber} — {a.make || a.brand} {a.model}</div>
                                </div>
                                <span className={`badge ${statusLabelColor(a.status)}`}>{a.status}</span>
                            </div>

                            <div className="card-rows" style={{ marginTop: "10px" }}>
                                <div className="card-row">
                                    <span className="card-row-ic">📅</span>
                                    <span className="card-row-lb" style={{ width: "70px" }}>Scheduled</span>
                                    <span className="card-row-val">{new Date(a.appointmentDate).toLocaleString()}</span>
                                </div>
                                <div className="card-row">
                                    <span className="card-row-ic">📝</span>
                                    <span className="card-row-lb" style={{ width: "70px" }}>Details</span>
                                    <span className="card-row-val">{a.notes || "No details provided."}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
