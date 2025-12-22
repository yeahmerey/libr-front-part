// src/pages/ContentDetail/ContentDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

export default function ContentDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await apiClient(`/content/${id}`);
        setItem(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

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
          <div style={{ marginTop: "20px" }}>
            <h3>Description</h3>
            <p>{item.description || "No description available."}</p>
          </div>

          {/* Сюда позже добавим: "Add to Library", "Reviews", "AI Recommendations" */}
        </div>
      </div>
    </div>
  );
}
