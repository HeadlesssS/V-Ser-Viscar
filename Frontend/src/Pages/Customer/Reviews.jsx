import { useState, useEffect } from "react";
import "./Customer.css";

const BASE_URL = "http://localhost:5169/api";

export const submitReview = async (data, token) => {
    const res = await fetch(`${BASE_URL}/reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const getAllReviews = async (token) => {
    const res = await fetch(`${BASE_URL}/reviews`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
};

export default function Reviews() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ rating: 5, comment: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadReviews(); }, []);

    const loadReviews = async () => {
        const res = await getAllReviews(token);
        if (Array.isArray(res)) setReviews(res);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const res = await submitReview(form, token);

        if (res.message === "Review submitted successfully.") {
            setMessage("Review submitted!");
            setShowForm(false);
            setForm({ rating: 5, comment: "" });
            loadReviews();
        } else {
            setError(res.message || "Failed to submit review.");
        }
        setLoading(false);
    };

    const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

    return (
        <div className="page">
            <div className="ph">
                <div>
                    <div className="ph-bc">Community Portal</div>
                    <div className="ph-title">Reviews & Feedback</div>
                    <div className="ph-sub">Read honest experiences shared by our clients or write your own.</div>
                </div>
                {role === "Customer" && (
                    <button className="btn btn-p" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Cancel" : "+ Write a Review"}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card mb-3" style={{ maxWidth: "500px", animation: "fadeUp 0.3s ease" }}>
                    <div className="card-top-line" style={{ background: "linear-gradient(90deg, var(--accent), transparent)" }} />
                    <h3 style={{ marginBottom: "20px", fontWeight: 700 }}>Write a Review</h3>
                    {error && <div className="badge badge-danger mb-2" style={{ width: "100%" }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="form">
                        <div className="field">
                            <label>Rating</label>
                            <div className="star-selector">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        className={`star-selector-item ${form.rating >= star ? "selected" : ""}`}
                                        onClick={() => setForm({ ...form, rating: star })}
                                        style={{ fontSize: "32px", cursor: "pointer", transition: "transform 0.1s" }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                Tap a star to set your rating: <strong>{form.rating} out of 5 stars</strong>
                            </span>
                        </div>

                        <div className="field">
                            <label>Your Feedback</label>
                            <textarea
                                rows={4}
                                placeholder="Describe your experience with our services, staff, and pricing..."
                                value={form.comment}
                                onChange={e => setForm({ ...form, comment: e.target.value })}
                                required
                                style={{
                                    background: "#fff", border: "1px solid var(--border)",
                                    padding: "12px", borderRadius: "8px",
                                    color: "#08060d", fontSize: "14px", resize: "vertical",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                            {loading ? "Submitting..." : "Submit Review"}
                        </button>
                    </form>
                </div>
            )}

            {message && <div className="badge badge-success mb-3" style={{ width: "100%", textAlign: "center", padding: "10px" }}>{message}</div>}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="card empty-state" style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state-icon" style={{ fontSize: "48px" }}>⭐</div>
                    <h3>No Reviews Yet</h3>
                    <p style={{ marginTop: "8px" }}>Be the first one to share your feedback about our garage services!</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {reviews.map(r => (
                        <div key={r.id} className="review-card">
                            <div className="review-card-header">
                                <div className="review-customer-info">
                                    <div className="review-avatar">
                                        {(r.customerName || "C").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <strong style={{ fontSize: "15px", color: "var(--text-h)" }}>{r.customerName || "Customer"}</strong>
                                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                                            Verified Service Client
                                        </div>
                                    </div>
                                </div>
                                <span className="review-stars">
                                    {renderStars(r.rating)}
                                </span>
                            </div>
                            <p className="review-comment">{r.comment}</p>
                            <div className="review-meta">
                                <span>📅 Submitted on {new Date(r.reviewedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
