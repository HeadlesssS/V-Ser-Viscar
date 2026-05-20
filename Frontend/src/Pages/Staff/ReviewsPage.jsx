import { useState, useEffect, useCallback } from "react";
import "../Admin/Admin.css";

const BASE_URL = "/api";

const STAR_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];
const STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

const safeJson = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

function StarDisplay({ rating }) {
  return (
    <span style={{ letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            color: s <= rating ? STAR_COLORS[rating] : "#e0dde4",
            fontSize: 14,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function StaffReviewsPage() {
  const token = localStorage.getItem("token");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeJson(res);
      if (Array.isArray(data)) setReviews(data);
      else setReviews([]);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this review?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${BASE_URL}/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) {
        showToast("Review deleted successfully.");
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        const d = await safeJson(res);
        showToast(d.message || "Failed to delete review.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const filtered = reviews
    .filter((r) => filterRating === 0 || r.rating === filterRating)
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (r.customerName || "").toLowerCase().includes(q) ||
        (r.comment || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="page">
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div
            className={`toast toast-${toast.type === "error" ? "error" : "success"}`}
          >
            <span>{toast.type === "error" ? "✗" : "✓"}</span>
            <span>{toast.msg}</span>
            <button className="toast-close" onClick={() => setToast(null)}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="ph">
        <div>
          <div className="ph-bc">Staff Console › Reviews</div>
          <div className="ph-title">Customer Reviews</div>
          <div className="ph-sub">
            View and moderate customer feedback and ratings.
          </div>
        </div>
        <button
          className="btn btn-g"
          onClick={loadReviews}
          style={{ alignSelf: "flex-start" }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="sc">
          <div className="sc-n">{reviews.length}</div>
          <div className="sc-l">Total Reviews</div>
        </div>
        <div className="sc">
          <div
            className="sc-n"
            style={{
              color:
                avgRating !== "—"
                  ? STAR_COLORS[Math.round(parseFloat(avgRating))]
                  : "#9c97a3",
            }}
          >
            {avgRating !== "—" ? `${avgRating} ★` : "—"}
          </div>
          <div className="sc-l">Average Rating</div>
        </div>
        {ratingCounts.map(({ star, count }) => (
          <div key={star} className="sc">
            <div
              className="sc-n"
              style={{ color: STAR_COLORS[star], fontSize: 20 }}
            >
              {count}
            </div>
            <div className="sc-l">{star}★ Reviews</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="tb">
        <div className="sw">
          <span className="sw-ic">🔍</span>
          <input
            className="sw-in"
            placeholder="Search by customer name or comment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ft">
          {[0, 5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              className={`ftb${filterRating === r ? " ftb-on" : ""}`}
              onClick={() => setFilterRating(r)}
            >
              {r === 0 ? "All" : `${r}★`}
            </button>
          ))}
        </div>
        <div className="ft">
          {[
            ["newest", "Newest"],
            ["highest", "Highest"],
            ["lowest", "Lowest"],
          ].map(([val, lbl]) => (
            <button
              key={val}
              className={`ftb${sortBy === val ? " ftb-on" : ""}`}
              onClick={() => setSortBy(val)}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" />
          <div style={{ fontSize: 13, color: "#9c97a3" }}>Loading reviews…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <p>
            {search || filterRating > 0
              ? "No reviews match your filters."
              : "No reviews yet."}
          </p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((r) => {
            const starColor = STAR_COLORS[r.rating] || "#9c97a3";
            const starLabel = STAR_LABELS[r.rating] || "";
            const cInitial = (r.customerName?.[0] || "?").toUpperCase();
            return (
              <div key={r.id} className="card">
                <div
                  className="card-top-line"
                  style={{
                    background: `linear-gradient(90deg, ${starColor}80, transparent)`,
                  }}
                />
                <div className="card-head">
                  <div
                    className="card-av"
                    style={{ background: `${starColor}18`, color: starColor }}
                  >
                    {cInitial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-title">
                      {r.customerName || "Customer"}
                    </div>
                    <div className="card-id">{formatDate(r.createdAt)}</div>
                  </div>
                </div>

                {/* Star rating */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StarDisplay rating={r.rating} />
                  <span
                    style={{ fontSize: 11, color: starColor, fontWeight: 600 }}
                  >
                    {starLabel}
                  </span>
                </div>

                {/* Comment */}
                {r.comment && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#3a3540",
                      lineHeight: 1.6,
                      background: "#f7f7f8",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontStyle: "italic",
                      borderLeft: `3px solid ${starColor}60`,
                    }}
                  >
                    "{r.comment}"
                  </div>
                )}

                <div className="card-actions">
                  <button
                    className="bic bic-d"
                    disabled={deleting === r.id}
                    onClick={() => handleDelete(r.id)}
                    style={{ opacity: deleting === r.id ? 0.6 : 1 }}
                  >
                    {deleting === r.id ? "Deleting…" : "🗑 Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
