import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("overview");
    const userName = localStorage.getItem("name");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/login");
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <div style={{
                width: "250px",
                backgroundColor: "var(--primary)",
                color: "white",
                padding: "20px",
                boxShadow: "2px 0 5px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ marginBottom: "30px" }}>Ser-Viscar Admin</h2>
                
                <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <button
                        onClick={() => setActiveSection("overview")}
                        style={{
                            padding: "12px 15px",
                            border: "none",
                            backgroundColor: activeSection === "overview" ? "rgba(255,255,255,0.3)" : "transparent",
                            color: "white",
                            cursor: "pointer",
                            borderRadius: "5px",
                            textAlign: "left",
                            fontSize: "14px",
                            transition: "all 0.3s"
                        }}
                    >
                        📊 Overview
                    </button>
                    <button
                        onClick={() => navigate("/admin/financial-reports")}
                        style={{
                            padding: "12px 15px",
                            border: "none",
                            backgroundColor: activeSection === "reports" ? "rgba(255,255,255,0.3)" : "transparent",
                            color: "white",
                            cursor: "pointer",
                            borderRadius: "5px",
                            textAlign: "left",
                            fontSize: "14px",
                            transition: "all 0.3s"
                        }}
                    >
                        📈 Financial Reports
                    </button>
                    <button
                        onClick={() => navigate("/admin/parts")}
                        style={{
                            padding: "12px 15px",
                            border: "none",
                            backgroundColor: activeSection === "parts" ? "rgba(255,255,255,0.3)" : "transparent",
                            color: "white",
                            cursor: "pointer",
                            borderRadius: "5px",
                            textAlign: "left",
                            fontSize: "14px",
                            transition: "all 0.3s"
                        }}
                    >
                        🔧 Parts Management
                    </button>
                    <button
                        onClick={() => navigate("/admin/purchase-invoices")}
                        style={{
                            padding: "12px 15px",
                            border: "none",
                            backgroundColor: activeSection === "purchase" ? "rgba(255,255,255,0.3)" : "transparent",
                            color: "white",
                            cursor: "pointer",
                            borderRadius: "5px",
                            textAlign: "left",
                            fontSize: "14px",
                            transition: "all 0.3s"
                        }}
                    >
                        📦 Purchase Invoices
                    </button>
                    <button
                        onClick={() => navigate("/admin/vendors")}
                        style={{
                            padding: "12px 15px",
                            border: "none",
                            backgroundColor: activeSection === "vendors" ? "rgba(255,255,255,0.3)" : "transparent",
                            color: "white",
                            cursor: "pointer",
                            borderRadius: "5px",
                            textAlign: "left",
                            fontSize: "14px",
                            transition: "all 0.3s"
                        }}
                    >
                        🏢 Vendors
                    </button>
                    <button
                        onClick={() => navigate("/admin/register-staff")}
                        style={{
                            padding: "12px 15px",
                            border: "none",
                            backgroundColor: activeSection === "staff" ? "rgba(255,255,255,0.3)" : "transparent",
                            color: "white",
                            cursor: "pointer",
                            borderRadius: "5px",
                            textAlign: "left",
                            fontSize: "14px",
                            transition: "all 0.3s"
                        }}
                    >
                        👥 Manage Staff
                    </button>
                    <hr style={{ margin: "20px 0", opacity: 0.3 }} />
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: "12px 15px",
                            border: "none",
                            backgroundColor: "rgba(255,0,0,0.3)",
                            color: "white",
                            cursor: "pointer",
                            borderRadius: "5px",
                            textAlign: "left",
                            fontSize: "14px",
                            transition: "all 0.3s"
                        }}
                    >
                        🚪 Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: "40px" }}>
                <div style={{ marginBottom: "30px" }}>
                    <h1 style={{ fontSize: "32px", marginBottom: "5px" }}>Welcome, {userName}!</h1>
                    <p style={{ color: "#666" }}>Admin Dashboard</p>
                </div>

                {activeSection === "overview" && (
                    <div>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "20px",
                            marginBottom: "40px"
                        }}>
                            <div className="card" style={{ padding: "30px", textAlign: "center" }}>
                                <h3 style={{ fontSize: "24px", color: "var(--primary)" }}>📊</h3>
                                <h2>Financial Reports</h2>
                                <p style={{ color: "#666", marginBottom: "15px" }}>View daily, monthly, and yearly reports</p>
                                <button
                                    onClick={() => navigate("/admin/financial-reports")}
                                    className="btn btn-primary"
                                    style={{ width: "100%" }}
                                >
                                    View Reports
                                </button>
                            </div>

                            <div className="card" style={{ padding: "30px", textAlign: "center" }}>
                                <h3 style={{ fontSize: "24px", color: "var(--primary)" }}>🔧</h3>
                                <h2>Parts Management</h2>
                                <p style={{ color: "#666", marginBottom: "15px" }}>Add, edit, or delete vehicle parts</p>
                                <button
                                    onClick={() => navigate("/admin/parts")}
                                    className="btn btn-primary"
                                    style={{ width: "100%" }}
                                >
                                    Manage Parts
                                </button>
                            </div>

                            <div className="card" style={{ padding: "30px", textAlign: "center" }}>
                                <h3 style={{ fontSize: "24px", color: "var(--primary)" }}>📦</h3>
                                <h2>Purchase Invoices</h2>
                                <p style={{ color: "#666", marginBottom: "15px" }}>Create purchase orders from vendors</p>
                                <button
                                    onClick={() => navigate("/admin/purchase-invoices")}
                                    className="btn btn-primary"
                                    style={{ width: "100%" }}
                                >
                                    Purchase Invoices
                                </button>
                            </div>

                            <div className="card" style={{ padding: "30px", textAlign: "center" }}>
                                <h3 style={{ fontSize: "24px", color: "var(--primary)" }}>🏢</h3>
                                <h2>Vendor Management</h2>
                                <p style={{ color: "#666", marginBottom: "15px" }}>Manage vendor details and information</p>
                                <button
                                    onClick={() => navigate("/admin/vendors")}
                                    className="btn btn-primary"
                                    style={{ width: "100%" }}
                                >
                                    Manage Vendors
                                </button>
                            </div>

                            <div className="card" style={{ padding: "30px", textAlign: "center" }}>
                                <h3 style={{ fontSize: "24px", color: "var(--primary)" }}>👥</h3>
                                <h2>Staff Management</h2>
                                <p style={{ color: "#666", marginBottom: "15px" }}>Register and manage staff members</p>
                                <button
                                    onClick={() => navigate("/admin/register-staff")}
                                    className="btn btn-primary"
                                    style={{ width: "100%" }}
                                >
                                    Manage Staff
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
