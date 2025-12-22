// src/pages/ContentDetail/ContentDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import RatingInput from "../../components/RatingInput/RatingInput";

export default function ContentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);

  // Форма отзыва
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const content = await apiClient(`/content/${id}`);
        setItem(content);

        const [reviewsRes, avgRes] = await Promise.all([
          apiClient(`/content/${id}/reviews`),
          apiClient(`/content/${id}/average-rating`),
        ]);
        setReviews(reviewsRes);
        setAverageRating(avgRes.average_rating);
      } catch (err) {
        console.error("Failed to load content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to leave a review");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient(`/content/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });

      // Обновим список отзывов
      const updatedReviews = await apiClient(`/content/${id}/reviews`);
      setReviews(updatedReviews);

      // Сбросим форму
      setComment("");
      alert("Review submitted!");
    } catch (err) {
      alert("Failed to submit review: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (!item) return <p style={{ padding: "20px" }}>Content not found.</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Link
        to="/content"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          color: "#007bff",
        }}
      >
        ← Back to all
      </Link>

      <div style={{ display: "flex", gap: "30px" }}>
        {item.image_url ? (
          <img
            src={`http://localhost:8000${item.image_url}`}
            alt={item.name}
            style={{
              width: "250px",
              height: "350px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        ) : (
          <div
            style={{
              width: "250px",
              height: "350px",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              borderRadius: "8px",
            }}
          >
            No Image
          </div>
        )}

        <div>
          <h1>{item.name}</h1>
          <p style={{ fontSize: "1.1em", color: "#666", marginBottom: "10px" }}>
            {item.type === "book" ? "📚 Book" : "🎬 Movie"}
          </p>

          {/* Средний рейтинг */}
          {averageRating !== null && (
            <div style={{ marginBottom: "15px" }}>
              <strong>Average Rating:</strong> ⭐ {averageRating}/5
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <h3>Description</h3>
            <p>{item.description || "No description available."}</p>
          </div>
        </div>
      </div>

      {/* Форма отзыва — только для авторизованных */}
      {user && (
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
          }}
        >
          <h3>Leave a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <RatingInput value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review (optional)..."
              rows="3"
              style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Список отзывов */}
      <div style={{ marginTop: "30px" }}>
        <h3>Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first!</p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {reviews.map((review, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  border: "1px solid #eee",
                  borderRadius: "6px",
                  backgroundColor: "#fafafa",
                }}
              >
                <div>
                  <strong>{review.username}</strong> — ⭐ {review.rating}/5
                </div>
                {review.comment && (
                  <div style={{ marginTop: "6px", color: "#555" }}>
                    "{review.comment}"
                  </div>
                )}
                <div
                  style={{
                    fontSize: "0.85em",
                    color: "#999",
                    marginTop: "6px",
                  }}
                >
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
