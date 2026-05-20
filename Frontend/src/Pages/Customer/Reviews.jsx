import { useState, useEffect, useCallback } from "react";
import "./Customer.css";

const BASE_URL = "/api";

const safeJson = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const submitReview = async (data, token) => {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return safeJson(res);
};

const getAllReviews = async (token) => {
  const res = await fetch(`${BASE_URL}/reviews`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return safeJson(res);
};

/* ── constants ── */
const STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
const STAR_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

export default function Reviews() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [hoverStar, setHoverStar] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterRating, setFilterRating] = useState(0); // 0 = All
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "highest"
  const [canReview, setCanReview] = useState(false);
  const [reviewStatus, setReviewStatus] = useState({
    hasExistingReview: false,
    hasValidAppointment: false,
    reason: null,
  });

  const loadReviews = useCallback(async () => {
    try {
      const res = await getAllReviews(token);
      if (Array.isArray(res)) setReviews(res);
    } catch {
      // silently fail - reviews load when possible
    }
  }, [token]);

  const loadCanReview = useCallback(async () => {
    if (role !== "Customer") return;
    try {
      const res = await fetch(`${BASE_URL}/reviews/can-review`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeJson(res);
      setCanReview(data.canReview ?? false);
      setReviewStatus({
        hasExistingReview: data.hasExistingReview ?? false,
        hasValidAppointment: data.hasValidAppointment ?? false,
        reason: data.reason ?? null,
      });
    } catch {
      // ignore
    }
  }, [token, role]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadReviews();
      loadCanReview();
    }, 0);
    return () => clearTimeout(t);
  }, [loadReviews, loadCanReview]);

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
      loadCanReview();
    } else {
      setError(res.message || "Failed to submit review.");
    }
    setLoading(false);
  };

  /* ── derived stats ── */
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return {
      star,
      count,
      pct: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
    };
  });

  /* ── filter + sort ── */
  const filteredReviews = reviews
    .filter((r) => filterRating === 0 || r.rating === filterRating)
    .sort((a, b) =>
      sortBy === "highest"
        ? b.rating - a.rating
        : new Date(b.reviewedAt) - new Date(a.reviewedAt),
    );

  const activeStar = hoverStar || form.rating;

  const renderStarIcons = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{ color: i < rating ? "#eab308" : "#d1d5db", fontSize: "15px" }}
      >
        ★
      </span>
    ));

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="page">
      {/* ── Page Header ── */}
      <div className="ph">
        <div>
          <div className="ph-bc">Community Portal</div>
          <div className="ph-title">Reviews &amp; Feedback</div>
          <div className="ph-sub">
            Read honest experiences shared by our clients or write your own.
          </div>
        </div>
        {role === "Customer" &&
          (canReview ? (
            <button
              className="btn btn-p"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "✕ Cancel" : "✍️ Write a Review"}
            </button>
          ) : reviewStatus.hasExistingReview ? (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #b3dfc0",
                borderRadius: 8,
                padding: "8px 14px",
                color: "#1a5c30",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ✓ You have already submitted a review
            </div>
          ) : (
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #93c5fd",
                borderRadius: 8,
                padding: "8px 14px",
                color: "#1e40af",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ℹ Book an appointment first to write a review
            </div>
          ))}
      </div>

      {/* ── Hero Section ── */}
      {reviews.length > 0 && (
        <div
          style={{
            background:
              "linear-gradient(135deg, #1a0630 0%, #2d1050 50%, #1a0630 100%)",
            borderRadius: "16px",
            padding: "28px 32px",
            marginBottom: "24px",
            display: "flex",
            gap: "32px",
            alignItems: "center",
            flexWrap: "wrap",
            boxShadow: "0 4px 24px rgba(170,59,255,0.22)",
            border: "1px solid rgba(170,59,255,0.18)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* BG radial glow */}
          <div
            style={{
              position: "absolute",
              right: "8%",
              top: "-50px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(170,59,255,0.14) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Average score */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div
              style={{
                fontSize: "60px",
                fontWeight: 800,
                color: "#eab308",
                lineHeight: 1,
                textShadow: "0 0 40px rgba(234,179,8,0.45)",
              }}
            >
              {avgRating}
            </div>
            <div
              style={{
                color: "#eab308",
                fontSize: "22px",
                margin: "7px 0 5px",
                letterSpacing: "3px",
              }}
            >
              {"★".repeat(Math.round(parseFloat(avgRating)))}
              {"☆".repeat(5 - Math.round(parseFloat(avgRating)))}
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
              {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "1px",
              height: "80px",
              background: "rgba(255,255,255,0.1)",
              flexShrink: 0,
            }}
          />

          {/* Distribution bars */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "9px",
              minWidth: "180px",
            }}
          >
            {ratingDistribution.map(({ star, count, pct }) => (
              <div
                key={star}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  opacity:
                    filterRating === 0 || filterRating === star ? 1 : 0.35,
                  transition: "opacity 0.15s",
                }}
                onClick={() =>
                  setFilterRating(filterRating === star ? 0 : star)
                }
              >
                <span
                  style={{
                    color: "#eab308",
                    fontSize: "11px",
                    width: "20px",
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {star}★
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "7px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #eab308, #f59e0b)",
                      borderRadius: "4px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "11px",
                    width: "24px",
                    flexShrink: 0,
                  }}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Write Review Form (animated slide) ── */}
      <div className={`premium-form-container${showForm ? " show" : ""}`}>
        <div
          className="card"
          style={{ maxWidth: "540px", marginBottom: "24px" }}
        >
          <div
            className="card-top-line"
            style={{
              background: "linear-gradient(90deg, var(--accent), transparent)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "rgba(170,59,255,0.1)",
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "17px",
              }}
            >
              ✍️
            </div>
            <h3 style={{ fontWeight: 700, fontSize: "16px" }}>
              Write a Review
            </h3>
          </div>

          {error && (
            <div
              style={{
                background: "#fff0f0",
                border: "1px solid rgba(204,30,30,0.3)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#cc1e1e",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            {/* Star selector */}
            <div className="field">
              <label>Your Rating</label>
              <div
                className="star-selector"
                style={{ gap: "6px", margin: "6px 0 4px" }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star-selector-item ${activeStar >= star ? "selected" : ""}`}
                    onClick={() => setForm({ ...form, rating: star })}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    style={{ fontSize: "40px", cursor: "pointer" }}
                  >
                    ★
                  </span>
                ))}
              </div>
              {activeStar > 0 && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: STAR_COLORS[activeStar],
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    marginTop: "2px",
                  }}
                >
                  <span style={{ fontSize: "14px", letterSpacing: "1px" }}>
                    {"★".repeat(activeStar)}
                  </span>
                  {STAR_LABELS[activeStar]}
                </span>
              )}
            </div>

            {/* Comment */}
            <div className="field">
              <label>Your Feedback</label>
              <textarea
                rows={4}
                placeholder="Share your experience with our services, staff, and pricing…"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                required
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  padding: "12px",
                  borderRadius: "8px",
                  color: "#08060d",
                  fontSize: "14px",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--accent)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(170,59,255,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              className="btn btn-p"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? "Submitting…" : "✓ Submit Review"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Success message ── */}
      {message && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #b3dfc0",
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#1a5c30",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ✅ {message}
        </div>
      )}

      {/* ── Toolbar (filter + sort) ── */}
      {reviews.length > 0 && (
        <div className="tb" style={{ marginBottom: "20px" }}>
          <div className="ft">
            <button
              className={`ftb ${filterRating === 0 ? "ftb-on" : ""}`}
              onClick={() => setFilterRating(0)}
            >
              All ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((star) => {
              const cnt = reviews.filter((r) => r.rating === star).length;
              return cnt > 0 ? (
                <button
                  key={star}
                  className={`ftb ${filterRating === star ? "ftb-on" : ""}`}
                  onClick={() =>
                    setFilterRating(filterRating === star ? 0 : star)
                  }
                >
                  {star}★ ({cnt})
                </button>
              ) : null;
            })}
          </div>
          <div className="ft" style={{ marginLeft: "auto" }}>
            <button
              className={`ftb ${sortBy === "newest" ? "ftb-on" : ""}`}
              onClick={() => setSortBy("newest")}
            >
              Newest
            </button>
            <button
              className={`ftb ${sortBy === "highest" ? "ftb-on" : ""}`}
              onClick={() => setSortBy("highest")}
            >
              Top Rated
            </button>
          </div>
        </div>
      )}

      {/* ── Reviews List ── */}
      {filteredReviews.length === 0 ? (
        <div className="card empty-state">
          <div
            className="empty-state-icon"
            style={{ fontSize: "58px", opacity: 0.18 }}
          >
            ⭐
          </div>
          <h3 style={{ color: "var(--text)", marginBottom: "8px" }}>
            {reviews.length === 0
              ? "No Reviews Yet"
              : "No reviews match this filter"}
          </h3>
          <p style={{ marginBottom: "16px" }}>
            {reviews.length === 0
              ? "Be the first to share your experience with our garage services!"
              : "Try selecting a different star rating filter above."}
          </p>
          {reviews.length === 0 && role === "Customer" && (
            <button className="btn btn-p" onClick={() => setShowForm(true)}>
              ✍️ Write the First Review
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="review-card"
              style={{ position: "relative" }}
            >
              {(role === "Admin" || role === "Staff") && (
                <button
                  onClick={async () => {
                    if (!window.confirm("Delete this review?")) return;
                    await fetch(`${BASE_URL}/reviews/${r.id}`, {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    loadReviews();
                  }}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "#fff0f0",
                    border: "1px solid rgba(204,30,30,0.3)",
                    borderRadius: 6,
                    padding: "4px 8px",
                    color: "#cc1e1e",
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: 600,
                    zIndex: 1,
                  }}
                >
                  ✕ Delete
                </button>
              )}
              {/* Gradient accent top line per rating */}
              <div
                className="card-top-line"
                style={{
                  background: `linear-gradient(90deg, ${STAR_COLORS[r.rating] || "#eab308"} 0%, transparent 100%)`,
                }}
              />

              <div className="review-card-header">
                <div className="review-customer-info">
                  <div
                    className="review-avatar"
                    style={{
                      background: `${STAR_COLORS[r.rating] || "#eab308"}1a`,
                      color: STAR_COLORS[r.rating] || "#eab308",
                      width: "44px",
                      height: "44px",
                      fontSize: "17px",
                      borderRadius: "50%",
                    }}
                  >
                    {(r.customerName || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ fontSize: "14px", color: "var(--text)" }}>
                      {r.customerName || "Customer"}
                    </strong>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        marginTop: "2px",
                      }}
                    >
                      Verified Service Client
                    </div>
                  </div>
                </div>

                {/* Stars + label */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "3px",
                  }}
                >
                  <div className="review-stars">
                    {renderStarIcons(r.rating)}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: STAR_COLORS[r.rating],
                    }}
                  >
                    {STAR_LABELS[r.rating]}
                  </span>
                </div>
              </div>

              <p
                className="review-comment"
                style={{ fontStyle: "italic", paddingLeft: "2px" }}
              >
                &ldquo;{r.comment}&rdquo;
              </p>

              <div className="review-meta">
                <span>📅</span>
                <span>
                  {new Date(r.reviewedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
