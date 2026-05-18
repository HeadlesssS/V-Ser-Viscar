import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Admin/admin.css";

const BASE_URL = "http://localhost:5169/api";

export const getAllCustomers = async (token) => {
    const res = await fetch(`${BASE_URL}/customers`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load customers.");
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

const empty = { vehicleNumber: "", make: "", model: "", year: "", vin: "" };

function Toast({ toasts, onRemove }) {
    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <span>{t.type === 'success' ? '✓' : '✕'}</span>
                    <span style={{ flex: 1 }}>{t.msg}</span>
                    <button className="toast-close" onClick={() => onRemove(t.id)}>×</button>
                </div>
            ))}
        </div>
    );
}

export default function AddVehicle() {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [customers, setCustomers] = useState([]);
    const [customersLoading, setCustomersLoading] = useState(true);
    const [customerId, setCustomerId] = useState("");
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    const addToast = (msg, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    };
    const removeToast = (id) => setToasts(t => t.filter(x => x.id !== id));

    useEffect(() => {
        const load = async () => {
            try {
                const list = await getAllCustomers(token);
                setCustomers(list);
                const prefillEmail = location.state?.email;
                if (prefillEmail) {
                    const match = list.find(c => c.email === prefillEmail);
                    if (match) setCustomerId(String(match.id));
                }
            } catch {
                addToast("Could not load customer list.", 'error');
            }
            setCustomersLoading(false);
        };
        load();
    }, []);

    const selectedCustomer = customers.find(c => String(c.id) === String(customerId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerId) {
            addToast("Please select a customer first.", 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await addVehicle({
                customerId: parseInt(customerId),
                vehicleNumber: form.vehicleNumber,
                make: form.make,
                model: form.model,
                year: parseInt(form.year),
                vin: form.vin
            }, token);

            if (res.message === "Vehicle added successfully.") {
                addToast(`Vehicle added for ${selectedCustomer?.userName || 'customer'}.`, 'success');
                setTimeout(() => navigate("/staff/dashboard"), 1500);
            } else {
                addToast(res.message || "Failed to add vehicle.", 'error');
            }
        } catch {
            addToast("Network error. Please try again.", 'error');
        }
        setLoading(false);
    };

    return (
        <div className="page">
            <Toast toasts={toasts} onRemove={removeToast} />

            <div className="ph">
                <div>
                    <div className="ph-bc">Staff Console / Vehicles</div>
                    <div className="ph-title">Add Vehicle</div>
                    <div className="ph-sub">Attach a vehicle record to a registered customer profile.</div>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 720, gap: 0 }}>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label>Customer <span>*</span></label>
                            <select value={customerId}
                                onChange={e => setCustomerId(e.target.value)}
                                required disabled={customersLoading || customers.length === 0}>
                                <option value="" disabled>
                                    {customersLoading
                                        ? 'Loading customers…'
                                        : customers.length === 0
                                            ? 'No customers found — register one first'
                                            : 'Select a customer…'}
                                </option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.userName} — {c.email}
                                    </option>
                                ))}
                            </select>
                            {selectedCustomer && (
                                <div className="card-id" style={{ marginTop: 6 }}>
                                    Phone: {selectedCustomer.phone || '—'} · Loyalty: {selectedCustomer.loyaltyTier}
                                </div>
                            )}
                        </div>
                        <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label>Vehicle Number <span>*</span></label>
                            <input value={form.vehicleNumber}
                                onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value }))}
                                required placeholder="e.g. BA 1 CHA 1234" />
                        </div>
                        <div className="field">
                            <label>Make (Brand) <span>*</span></label>
                            <input value={form.make}
                                onChange={e => setForm(f => ({ ...f, make: e.target.value }))}
                                required placeholder="e.g. Toyota" />
                        </div>
                        <div className="field">
                            <label>Model <span>*</span></label>
                            <input value={form.model}
                                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                                required placeholder="e.g. Corolla" />
                        </div>
                        <div className="field">
                            <label>Year <span>*</span></label>
                            <input type="number" value={form.year}
                                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                                required min={1950} max={2100} placeholder="e.g. 2019" />
                        </div>
                        <div className="field">
                            <label>VIN</label>
                            <input value={form.vin}
                                onChange={e => setForm(f => ({ ...f, vin: e.target.value }))}
                                maxLength={17} placeholder="17-character VIN (optional)" />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-g"
                            onClick={() => setForm(empty)} disabled={loading}>Clear</button>
                        <button type="submit" className="btn btn-p" disabled={loading || !customerId}>
                            {loading ? 'Adding…' : 'Add Vehicle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}