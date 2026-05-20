import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Auth/Auth.css";

const BASE_URL = "/api";

const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const raw = await res.text();
  let payload = {};

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = { message: raw };
    }
  }

  if (!res.ok) {
    return {
      ...payload,
      message: payload.message || `Request failed with status ${res.status}.`,
      success: false,
    };
  }

  return {
    ...payload,
    success: true,
  };
};

export default function CustomerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "Customer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({
        name: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
      });

      if (res.success || res.message === "Registration successful.") {
        navigate("/login");
      } else {
        setError(res.message || "Registration failed.");
      }
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Register as a customer</p>

        {error && (
          <div
            className="badge badge-danger mb-2"
            style={{ width: "100%", textAlign: "center" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Phone</label>
            <input
              type="text"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div className="input-group" style={{ position: "relative" }}>
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 10,
                bottom: 10,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                color: "#b0acb8",
                padding: 0,
                lineHeight: 1,
              }}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          <div className="input-group" style={{ position: "relative" }}>
            <label>Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: 10,
                bottom: 10,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                color: "#b0acb8",
                padding: 0,
                lineHeight: 1,
              }}
            >
              {showConfirmPassword ? "🙈" : "👁"}
            </button>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-2" style={{ textAlign: "center" }}>
          Already have an account?{" "}
          <span
            style={{ color: "var(--primary)", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
