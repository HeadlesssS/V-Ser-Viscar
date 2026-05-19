import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const BASE_URL = "/api";

const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await loginUser(form.email, form.password);

    if (res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("name", res.name || res.fullName);

      // Redirect based on role
      if (res.role === "Admin") navigate("/admin/dashboard");
      else if (res.role === "Staff") navigate("/staff/dashboard");
      else navigate("/customer/dashboard");
    } else {
      setError(res.message || "Login failed.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Ser-Viscar</h1>
        <p className="auth-subtitle">Sign in to your account</p>

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
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="input-group" style={{ position: "relative" }}>
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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

          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-2" style={{ textAlign: "center" }}>
          Don't have an account?{" "}
          <span
            style={{ color: "var(--primary)", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
