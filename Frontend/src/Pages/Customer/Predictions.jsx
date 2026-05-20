import { useState, useEffect, useCallback } from "react";

const BASE_URL = "/api";

/* ── API helpers ─────────────────────────────────────────────────────────── */
const getProfile = async (token) => {
  const res = await fetch(`${BASE_URL}/customers/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

const getMyPredictions = async (token) => {
  const res = await fetch(`${BASE_URL}/ai-predictions/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

const runAIPrediction = async (data, token) => {
  const res = await fetch(`${BASE_URL}/ai-predictions/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

/* ── SVG Icons ───────────────────────────────────────────────────────────── */
const BrainIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7H4a2 2 0 00-2 2v0a2 2 0 002 2h.5A2.5 2.5 0 017 13.5v0A2.5 2.5 0 019.5 16H10a2 2 0 002-2v-1a2 2 0 012-2h1a2.5 2.5 0 002.5-2.5v0A2.5 2.5 0 0015 6h-.5A2.5 2.5 0 0112 3.5v0A2.5 2.5 0 009.5 1" />
    <path d="M14 16.5a2.5 2.5 0 002.5 2.5H17a2 2 0 012 2v0" />
  </svg>
);

const CarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="16.5" cy="17.5" r="2.5" />
  </svg>
);

const GaugeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    <path d="M12 12l-3-3" />
    <path d="M12 8v1" />
    <path d="M16 10l-.87.5" />
    <path d="M8 10l.87.5" />
  </svg>
);

const ActivityIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ZapIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const HistoryIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
  </svg>
);

const LightUsageIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const ModerateUsageIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 8h1a4 4 0 010 8h-1" />
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

const HeavyUsageIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ExtremeUsageIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
  </svg>
);

/* ── Circular Gauge ─────────────────────────────────────────────────────── */
const CircleGauge = ({
  value = 0,
  color = "#cc1e1e",
  size = 120,
  label = "",
}) => {
  const r = 44;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#f0eff2"
            strokeWidth="9"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeDasharray={C}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: color,
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          <span style={{ fontSize: "10px", color: "#9c97a3", fontWeight: 500 }}>
            / 100
          </span>
        </div>
      </div>
      {label && (
        <span style={{ fontSize: "12px", color: "#6b6375", fontWeight: 500 }}>
          {label}
        </span>
      )}
    </div>
  );
};

/* ── Usage Pattern Config ───────────────────────────────────────────────── */
const USAGE_PATTERNS = [
  {
    id: "Light",
    label: "Light",
    desc: "Short city trips",
    Icon: LightUsageIcon,
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    id: "Moderate",
    label: "Moderate",
    desc: "Daily commuting",
    Icon: ModerateUsageIcon,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    id: "Heavy",
    label: "Heavy",
    desc: "Long distances",
    Icon: HeavyUsageIcon,
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    id: "Extreme",
    label: "Extreme",
    desc: "Off-road / Racing",
    Icon: ExtremeUsageIcon,
    color: "#dc2626",
    bg: "#fef2f2",
  },
];

/* ── Severity config ────────────────────────────────────────────────────── */
const SEV = {
  High: { color: "#991b1b", bg: "#fef2f2", border: "#fca5a5", dot: "#ef4444" },
  Medium: {
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fbbf24",
    dot: "#d97706",
  },
  Low: { color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", dot: "#10b981" },
};

const getSev = (s) => SEV[s] || SEV.Medium;
const getGaugeColor = (p) =>
  p >= 75 ? "#dc2626" : p >= 45 ? "#d97706" : "#059669";
const getHealthScore = (p) => Math.max(0, 100 - Math.round(p));

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Predictions() {
  const token = localStorage.getItem("token");

  const [vehicles, setVehicles] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [mileage, setMileage] = useState("");
  const [usagePattern, setUsagePattern] = useState("Moderate");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ── Load vehicles + history ──────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    try {
      const profile = await getProfile(token);
      if (profile && Array.isArray(profile.vehicles)) {
        setVehicles(profile.vehicles);
        if (profile.vehicles.length > 0) {
          setSelectedVehicleId(String(profile.vehicles[0].id));
        }
      }
      const history = await getMyPredictions(token);
      if (Array.isArray(history)) setPredictions(history);
    } catch {
      /* silently ignore */
    }
  }, [token]);

  useEffect(() => {
    const t = setTimeout(loadData, 0);
    return () => clearTimeout(t);
  }, [loadData]);

  /* ── Submit ───────────────────────────────────────────────────────────── */
  const handleRun = async (e) => {
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
    setSuccess("");
    setActiveResult(null);

    try {
      const res = await runAIPrediction(
        {
          vehicleId: parseInt(selectedVehicleId),
          mileage: parseInt(mileage),
          usagePattern,
          symptoms,
        },
        token,
      );
      if (res.predictedIssue) {
        setActiveResult(res);
        setSuccess("Diagnostics completed successfully.");
        loadData();
      } else {
        setError(res.message || "AI prediction failed. Please try again.");
      }
    } catch {
      setError("Server connection lost. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Input styles helper ─────────────────────────────────────────────── */
  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e5e4e7",
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "inherit",
    color: "#08060d",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#3a3540",
    marginBottom: "5px",
    display: "block",
  };

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      style={{
        padding: "26px 28px 56px",
        fontFamily: "system-ui,'Segoe UI',Roboto,sans-serif",
        animation: "fadeUp 0.35s ease",
      }}
    >
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          marginBottom: "24px",
          paddingBottom: "22px",
          borderBottom: "1px solid #e5e4e7",
        }}
      >
        <div
          style={{ fontSize: "12px", color: "#9c97a3", marginBottom: "5px" }}
        >
          Intelligent Diagnostics
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#08060d",
            letterSpacing: "-0.3px",
            margin: "0 0 4px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ display: "flex", color: "#cc1e1e" }}>
            <BrainIcon />
          </span>
          AI Vehicle Analysis
        </h1>
        <p style={{ fontSize: "13px", color: "#6b6375", margin: 0 }}>
          Powered by predictive diagnostics — enter your vehicle data to
          forecast potential failures before they happen.
        </p>
      </div>

      {/* ── Two-column layout ───────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* ════════ LEFT — Input Form ════════ */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e4e7",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <span style={{ display: "flex", color: "#cc1e1e" }}>
              <ActivityIcon />
            </span>
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#08060d",
                margin: 0,
              }}
            >
              Telemetry Input
            </h2>
          </div>

          <form
            onSubmit={handleRun}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Vehicle select */}
            <div>
              <label style={labelStyle}>
                <span
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <CarIcon /> Vehicle
                </span>
              </label>
              {vehicles.length === 0 ? (
                <div
                  style={{
                    padding: "10px 12px",
                    background: "#fafaf9",
                    border: "1px solid #e5e4e7",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#9c97a3",
                  }}
                >
                  No vehicles registered. Please add a vehicle from your
                  profile.
                </div>
              ) : (
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={(e) => (e.target.style.borderColor = "#cc1e1e")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e4e7")}
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} {v.year ? `(${v.year})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Mileage */}
            <div>
              <label style={labelStyle}>
                <span
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <GaugeIcon /> Current Mileage (km)
                </span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 45000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#cc1e1e")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e4e7")}
              />
            </div>

            {/* Usage pattern */}
            <div>
              <label style={{ ...labelStyle, marginBottom: "10px" }}>
                Usage Pattern
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                {USAGE_PATTERNS.map(({ id, label, desc, Icon, color, bg }) => {
                  const sel = usagePattern === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setUsagePattern(id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 12px",
                        border: sel
                          ? `2px solid ${color}`
                          : "2px solid #e5e4e7",
                        borderRadius: "10px",
                        cursor: "pointer",
                        textAlign: "left",
                        background: sel ? bg : "#fff",
                        transition: "all .15s",
                        fontFamily: "inherit",
                      }}
                    >
                      <span
                        style={{
                          color: sel ? color : "#9c97a3",
                          display: "flex",
                          flexShrink: 0,
                        }}
                      >
                        <Icon />
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: sel ? 700 : 500,
                            color: sel ? color : "#3a3540",
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#9c97a3",
                            marginTop: "1px",
                          }}
                        >
                          {desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label style={labelStyle}>Symptoms / Notes (optional)</label>
              <textarea
                rows={3}
                placeholder="Describe any unusual sounds, vibrations, warning lights..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                onFocus={(e) => (e.target.style.borderColor = "#cc1e1e")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e4e7")}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  background: "#fff0f0",
                  border: "1px solid rgba(204,30,30,0.25)",
                  borderRadius: "8px",
                  color: "#cc1e1e",
                  fontSize: "13px",
                }}
              >
                <AlertIcon /> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || vehicles.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "11px",
                background: loading ? "#e0b8b8" : "#cc1e1e",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 700,
                cursor:
                  loading || vehicles.length === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "background .15s",
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin .7s linear infinite",
                    }}
                  />
                  Running Diagnostics…
                </>
              ) : (
                <>
                  <ZapIcon /> Run Diagnostics
                </>
              )}
            </button>
          </form>
        </div>

        {/* ════════ RIGHT — Results ════════ */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e4e7",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            minHeight: "420px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <span style={{ display: "flex", color: "#cc1e1e" }}>
              <ActivityIcon />
            </span>
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#08060d",
                margin: 0,
              }}
            >
              Diagnostic Results
            </h2>
          </div>

          {/* Loading state */}
          {loading && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "3px solid #f0eff2",
                  borderTopColor: "#cc1e1e",
                  borderRadius: "50%",
                  animation: "spin .8s linear infinite",
                }}
              />
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#08060d",
                    margin: 0,
                  }}
                >
                  Analysing vehicle data…
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9c97a3",
                    marginTop: "4px",
                  }}
                >
                  Querying telemetry and service history
                </p>
              </div>
            </div>
          )}

          {/* Idle state */}
          {!loading && !activeResult && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#f7f7f8",
                  border: "1px solid #e5e4e7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#b0acb8",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#3a3540",
                    margin: 0,
                  }}
                >
                  AI Engine Idle
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9c97a3",
                    marginTop: "4px",
                    lineHeight: 1.5,
                  }}
                >
                  Fill in the telemetry fields and click
                  <br />
                  Run Diagnostics to begin analysis.
                </p>
              </div>
            </div>
          )}

          {/* Success banner */}
          {!loading && success && activeResult && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                background: "#ecfdf5",
                border: "1px solid #6ee7b7",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#065f46",
                fontWeight: 500,
                marginBottom: "16px",
              }}
            >
              <ShieldIcon /> {success}
            </div>
          )}

          {/* Results */}
          {!loading &&
            activeResult &&
            (() => {
              const health = getHealthScore(activeResult.probability || 0);
              const gColor = getGaugeColor(activeResult.probability || 0);
              const sevCfg = getSev(activeResult.severity);

              return (
                <div
                  style={{
                    animation: "fadeUp 0.35s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {/* Health + Title row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      padding: "16px",
                      background: "#fafaf9",
                      borderRadius: "12px",
                      border: "1px solid #f0eff2",
                    }}
                  >
                    <CircleGauge
                      value={health}
                      color={gColor}
                      size={110}
                      label="Health Score"
                    />
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#9c97a3",
                          textTransform: "uppercase",
                          letterSpacing: "0.6px",
                        }}
                      >
                        Detected Issue
                      </span>
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 800,
                          color: "#08060d",
                          margin: "4px 0 8px",
                        }}
                      >
                        {activeResult.predictedIssue}
                      </h3>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 10px",
                          background: sevCfg.bg,
                          border: `1px solid ${sevCfg.border}`,
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: sevCfg.color,
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: sevCfg.dot,
                            display: "inline-block",
                          }}
                        />
                        {activeResult.severity || "Medium"} Risk
                      </span>
                    </div>
                  </div>

                  {/* Probability bar */}
                  <div
                    style={{
                      background: "#fafaf9",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      border: "1px solid #f0eff2",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#3a3540",
                        marginBottom: "8px",
                      }}
                    >
                      <span>Failure Probability</span>
                      <span style={{ color: gColor }}>
                        {activeResult.probability}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "#e5e4e7",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${activeResult.probability}%`,
                          background: gColor,
                          borderRadius: "4px",
                          transition: "width 1.2s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  {activeResult.timeframe && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 14px",
                        background: "#fafaf9",
                        borderRadius: "10px",
                        border: "1px solid #f0eff2",
                      }}
                    >
                      <span style={{ color: "#cc1e1e", display: "flex" }}>
                        <ClockIcon />
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#9c97a3",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            fontWeight: 600,
                          }}
                        >
                          Expected Timeframe
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#08060d",
                            marginTop: "2px",
                          }}
                        >
                          {activeResult.timeframe}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed diagnosis */}
                  {activeResult.detailedDiagnosis && (
                    <div
                      style={{
                        padding: "14px 16px",
                        background: "#fafaf9",
                        borderRadius: "10px",
                        border: "1px solid #f0eff2",
                        borderLeft: `3px solid ${gColor}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#9c97a3",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "6px",
                        }}
                      >
                        AI Diagnosis
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#3a3540",
                          margin: 0,
                          lineHeight: 1.6,
                        }}
                      >
                        {activeResult.detailedDiagnosis}
                      </p>
                    </div>
                  )}

                  {/* Action plan */}
                  {activeResult.actionPlan && (
                    <div
                      style={{
                        padding: "14px 16px",
                        background: "#fafaf9",
                        borderRadius: "10px",
                        border: "1px solid #f0eff2",
                        borderLeft: "3px solid #2563eb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <ShieldIcon />
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#9c97a3",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Recommended Action
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1e40af",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {activeResult.actionPlan}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
        </div>
      </div>

      {/* ── Historical Predictions ───────────────────────────────────────── */}
      <div style={{ marginTop: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <span style={{ display: "flex", color: "#cc1e1e" }}>
            <HistoryIcon />
          </span>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#08060d",
              margin: 0,
            }}
          >
            Analysis History
          </h2>
        </div>

        {predictions.length === 0 ? (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              background: "#fff",
              border: "1px solid #e5e4e7",
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                opacity: 0.3,
                display: "flex",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <HistoryIcon />
            </div>
            <p style={{ fontSize: "14px", color: "#9c97a3", fontWeight: 500 }}>
              No historical predictions yet
            </p>
            <p style={{ fontSize: "12px", color: "#b0acb8", marginTop: "4px" }}>
              Run your first diagnostics scan above to save results here.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "14px",
            }}
          >
            {predictions.map((p) => {
              const gC = getGaugeColor(p.probability || 0);
              const sC = getSev(p.severity);
              return (
                <div
                  key={p.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e4e7",
                    borderRadius: "14px",
                    padding: "18px",
                    borderLeft: `4px solid ${gC}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "transform .18s, box-shadow .18s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 18px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,0.04)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#08060d",
                        }}
                      >
                        {p.predictedIssue}
                      </div>
                      {p.vehicleName && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#9c97a3",
                            marginTop: "2px",
                          }}
                        >
                          {p.vehicleName}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        background: sC.bg,
                        border: `1px solid ${sC.border}`,
                        borderRadius: "20px",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: sC.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: sC.dot,
                          display: "inline-block",
                        }}
                      />
                      {p.severity}
                    </span>
                  </div>

                  {/* Mini probability bar */}
                  <div style={{ marginBottom: "10px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        color: "#9c97a3",
                        marginBottom: "4px",
                      }}
                    >
                      <span>Probability</span>
                      <span style={{ color: gC, fontWeight: 700 }}>
                        {p.probability}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "5px",
                        background: "#f0eff2",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${p.probability}%`,
                          background: gC,
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                  </div>

                  {p.timeframe && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        color: "#6b6375",
                      }}
                    >
                      <ClockIcon /> {p.timeframe}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
