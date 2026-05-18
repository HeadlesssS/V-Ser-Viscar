import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Auth/Auth.css";

const BASE_URL = "http://localhost:5169/api";

export const registerUser = async (data) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res.json();
};

export default function CustomerRegister() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: "", email: "", password: "",
        confirmPassword: "", phone: "", role: "Customer"
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        const res = await registerUser({
            name: form.fullName,
            email: form.email,
            password: form.password,
            phone: form.phone,
            role: form.role
        });

        if (res.message === "Registration successful.") {
            navigate("/login");
        } else {
            setError(res.message || "Registration failed.");
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Register as a customer</p>

                {error && (
                    <div className="badge badge-danger mb-2" style={{ width: "100%", textAlign: "center" }}>
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
                            onChange={e => setForm({ ...form, fullName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            placeholder="Enter your phone number"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Create a password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm your password"
                            value={form.confirmPassword}
                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                        />
                    </div>

                    <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
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