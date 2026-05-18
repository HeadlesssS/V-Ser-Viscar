import { useState, useEffect } from "react";
import "./Customer.css";

const BASE_URL = "http://localhost:5169/api";

export const getProfile = async (token) => {
    const res = await fetch(`${BASE_URL}/customers/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
};

export const getMyPredictions = async (token) => {
    const res = await fetch(`${BASE_URL}/ai-predictions/my`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
};

export const runAIPrediction = async (data, token) => {
    const res = await fetch(`${BASE_URL}/ai-predictions/run`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return res.json();
};

export default function Predictions() {
    const token = localStorage.getItem("token");
    const [vehicles, setVehicles] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState("");
    const [mileage, setMileage] = useState("");
    const [usagePattern, setUsagePattern] = useState("City Commuting");
    const [symptoms, setSymptoms] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeResult, setActiveResult] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profile = await getProfile(token);
            if (profile && Array.isArray(profile.vehicles)) {
                setVehicles(profile.vehicles);
                if (profile.vehicles.length > 0) {
                    setSelectedVehicleId(profile.vehicles[0].id.toString());
                }
            }
            const history = await getMyPredictions(token);
            if (Array.isArray(history)) {
                setPredictions(history);
            }
        } catch (err) {
            console.error("Failed to load AI prediction data:", err);
        }
    };

    const handleRunDiagnosis = async (e) => {
        e.preventDefault();
        if (!selectedVehicleId) {
            setError("Please select a vehicle to diagnose.");
            return;
        }
        if (!mileage || parseInt(mileage) <= 0) {
            setError("Please enter a valid mileage.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccessMessage("");
        setActiveResult(null);

        try {
            const res = await runAIPrediction({
                vehicleId: parseInt(selectedVehicleId),
                mileage: parseInt(mileage),
                usagePattern,
                symptoms
            }, token);

            if (res.predictedIssue) {
                setActiveResult(res);
                setSuccessMessage("AI Diagnostics Completed Successfully!");
                loadData(); // Reload historical list
            } else {
                setError(res.message || "Failed to complete AI prediction analysis.");
            }
        } catch (err) {
            setError("Server connection lost. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getSeverityBadgeClass = (severity) => {
        if (severity === "High") return "b-ina";
        if (severity === "Low") return "b-act";
        return "badge-warning";
    };

    const getGaugeColor = (probability) => {
        if (probability >= 80) return "#cc1e1e"; // Red
        if (probability >= 50) return "#eab308"; // Amber
        return "#1a7a3a"; // Green
    };

    return (
        <div className="page">
            {/* Header */}
            <div className="ph">
                <div>
                    <div className="ph-bc">Ser-Viscar Intelligent Diagnostics</div>
                    <div className="ph-title">Predictive AI Part Failures</div>
                    <div className="ph-sub">Let our deep learning neural net analyze telemetry, service logs, and driving patterns to predict part decay before it happens.</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }} className="form-group-row">
                
                {/* Form Inputs Card */}
                <div className="card">
                    <div className="card-top-line" style={{ background: "linear-gradient(90deg, #aa3bff, #cc1e1e)" }} />
                    <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>⚡ Vehicle Telemetry Parameters</h3>

                    {error && <div className="badge badge-danger mb-3" style={{ width: "100%", padding: "10px" }}>{error}</div>}

                    <form onSubmit={handleRunDiagnosis} className="form">
                        <div className="field">
                            <label>Select Active Vehicle</label>
                            <select
                                value={selectedVehicleId}
                                onChange={e => setSelectedVehicleId(e.target.value)}
                                required
                            >
                                <option value="">-- Choose a Vehicle --</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.vehicleNumber} — {v.brand} {v.model} ({v.year})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Current Mileage / Odometer Reading (km)</label>
                            <input
                                type="number"
                                placeholder="e.g. 120000"
                                value={mileage}
                                onChange={e => setMileage(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field">
                            <label>Primary Usage Pattern</label>
                            <select
                                value={usagePattern}
                                onChange={e => setUsagePattern(e.target.value)}
                                required
                            >
                                <option value="City Commuting">🏙️ City Commuting (Stop & Go, heavy brake wear)</option>
                                <option value="Highway Cruising">🛣️ Highway Cruising (Constant speed, low chassis stress)</option>
                                <option value="Off-road / Rough Terrain">⛰️ Off-road / Rough Terrain (Heavy shock stress)</option>
                                <option value="Commercial / Towing">📦 Commercial Delivery / Towing (High powertrain stress)</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>Observed Symptom or Unusual Sounds (Optional)</label>
                            <textarea
                                rows={3}
                                placeholder="e.g. grinding noise during braking, steering wheel vibrations, slow cold starts..."
                                value={symptoms}
                                onChange={e => setSymptoms(e.target.value)}
                                style={{
                                    background: "#fff", border: "1px solid var(--border)",
                                    padding: "12px", borderRadius: "8px",
                                    color: "#08060d", fontSize: "14px", resize: "vertical",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-p" 
                            style={{ 
                                width: "100%", 
                                justifyContent: "center", 
                                background: "linear-gradient(135deg, #aa3bff 0%, #8b12ff 100%)",
                                borderColor: "#aa3bff",
                                fontSize: "15px",
                                fontWeight: "bold"
                            }} 
                            disabled={loading}
                        >
                            {loading ? "⚡ Booting AI & Running Telemetry Analysis..." : "⚡ Run AI Failure Diagnosis"}
                        </button>
                    </form>
                </div>

                {/* AI Diagnostics Output Card */}
                <div className="card" style={{ minHeight: "380px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    
                    {loading && (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                            <div className="spinner" style={{ width: "64px", height: "64px", borderWidth: "4px" }}></div>
                            <h4 style={{ marginTop: "24px", color: "var(--text-h)", fontWeight: 700 }}>AI Neural Diagnosis Active...</h4>
                            <p style={{ fontSize: "13px", color: "var(--text)", marginTop: "8px" }}>
                                Querying vehicle service records, matching telemetry with Llama 3.3 engine...
                            </p>
                        </div>
                    )}

                    {!loading && !activeResult && (
                        <div style={{ textAlign: "center", color: "var(--text)", padding: "40px 20px" }}>
                            <div style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.7 }}>🤖</div>
                            <h3 style={{ color: "var(--text-h)", fontWeight: 700 }}>AI Diagnostic Engine Idle</h3>
                            <p style={{ marginTop: "10px", fontSize: "14px" }}>
                                Populate the telemetry fields on the left and select "Run AI Failure Diagnosis" to evaluate vehicle decay parameters.
                            </p>
                        </div>
                    )}

                    {!loading && activeResult && (
                        <div style={{ animation: "fadeUp 0.4s ease" }}>
                            <div className="card-top-line" style={{ backgroundColor: getGaugeColor(activeResult.probability) }} />
                            
                            {successMessage && <div className="badge badge-success mb-3" style={{ width: "100%", padding: "8px", textAlign: "center" }}>{successMessage}</div>}

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <div>
                                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>High Risk Component Detected</span>
                                    <h2 style={{ fontWeight: 800, fontSize: "22px", margin: "4px 0 0" }}>⚠️ {activeResult.predictedIssue}</h2>
                                </div>
                                <span className={`badge ${getSeverityBadgeClass(activeResult.severity)}`} style={{ padding: "6px 14px", fontSize: "13px" }}>
                                    {activeResult.severity} Risk
                                </span>
                            </div>

                            {/* Gauge / Probability percentage */}
                            <div style={{ background: "rgba(0,0,0,0.03)", padding: "16px", borderRadius: "12px", marginBottom: "20px", border: "1px solid var(--border)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}>
                                    <span>Failure Probability Score</span>
                                    <span style={{ color: getGaugeColor(activeResult.probability) }}>{activeResult.probability}% Probability</span>
                                </div>
                                <div style={{ height: "10px", background: "rgba(0,0,0,0.1)", borderRadius: "5px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${activeResult.probability}%`, backgroundColor: getGaugeColor(activeResult.probability), transition: "width 1s ease" }}></div>
                                </div>
                            </div>

                            <div className="card-rows">
                                <div className="card-row">
                                    <span className="card-row-ic">⏱️</span>
                                    <span className="card-row-lb" style={{ width: "90px" }}>Timeframe</span>
                                    <span className="card-row-val" style={{ fontWeight: 600 }}>{activeResult.timeframe}</span>
                                </div>
                                <div className="card-row" style={{ flexDirection: "column", gap: "4px", padding: "12px" }}>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <span className="card-row-ic">🔬</span>
                                        <span className="card-row-lb" style={{ width: "90px" }}>AI Diagnosis</span>
                                    </div>
                                    <span className="card-row-val" style={{ marginTop: "4px", fontSize: "13.5px", lineHeight: "1.6" }}>
                                        {activeResult.detailedDiagnosis}
                                    </span>
                                </div>
                                <div className="card-row" style={{ flexDirection: "column", gap: "4px", padding: "12px", borderLeft: `3px solid ${getGaugeColor(activeResult.probability)}`, background: "rgba(0,0,0,0.01)" }}>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <span className="card-row-ic">🛡️</span>
                                        <span className="card-row-lb" style={{ width: "90px" }}>Action Plan</span>
                                    </div>
                                    <span className="card-row-val" style={{ marginTop: "4px", fontSize: "13.5px", fontWeight: 600, color: "var(--text-h)" }}>
                                        {activeResult.actionPlan}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Historical Predictions List */}
            <div style={{ marginTop: "32px" }}>
                <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>📜 Failure Analysis History</h3>

                {predictions.length === 0 ? (
                    <div className="card empty-state" style={{ textAlign: "center", padding: "40px" }}>
                        <div className="empty-state-icon" style={{ fontSize: "40px" }}>📜</div>
                        <h3>No Historical Diagnosis Found</h3>
                        <p style={{ marginTop: "8px" }}>Run your first AI diagnostics scan above to persist failure predictions here.</p>
                    </div>
                ) : (
                    <div className="grid">
                        {predictions.map(p => (
                            <div key={p.id} className="card" style={{ borderLeft: `4px solid ${getGaugeColor(p.probability)}` }}>
                                <div className="card-head">
                                    <div className="card-av" style={{ background: "rgba(170,59,255,0.08)", color: "var(--accent)", fontSize: "18px" }}>
                                        🤖
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="card-title" style={{ fontSize: "15px", fontWeight: 700 }}>{p.predictedIssue}</div>
                                        <div className="card-id">{p.vehicleName}</div>
                                    </div>
                                    <span className={`badge ${getSeverityBadgeClass(p.severity)}`}>{p.severity}</span>
                                </div>

                                <div className="card-rows" style={{ marginTop: "10px" }}>
                                    <div className="card-row">
                                        <span className="card-row-ic">📈</span>
                                        <span className="card-row-lb" style={{ width: "70px" }}>Probability</span>
                                        <span className="card-row-val" style={{ color: getGaugeColor(p.probability), fontWeight: 700 }}>{p.probability}%</span>
                                    </div>
                                    <div className="card-row">
                                        <span className="card-row-ic">⏱️</span>
                                        <span className="card-row-lb" style={{ width: "70px" }}>Timeframe</span>
                                        <span className="card-row-val">{p.timeframe}</span>
                                    </div>
                                    <div className="card-row" style={{ display: "block", fontSize: "12px", padding: "8px 10px" }}>
                                        <strong>Diagnosis:</strong> {p.detailedDiagnosis}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
