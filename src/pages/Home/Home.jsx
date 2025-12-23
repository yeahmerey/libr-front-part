// src/pages/Home/Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Получаем все посты (публичный эндпоинт)
        const data = await apiClient("/posts");
        setPosts(data);
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Форматирование даты
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading posts...</p>;
  }

  if (posts.length === 0) {
    return <p style={{ padding: "20px" }}>No posts yet.</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Latest Posts</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#fafafa",
            }}
          >
            {/* Контент поста */}
            <p style={{ fontSize: "1.1em", margin: "0 0 12px" }}>
              {post.content}
            </p>

            {/* Изображение (если есть) */}
            {post.image_url && (
              <img
                src={`http://localhost:8000${post.image_url}`}
                alt="Post"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "6px",
                  marginBottom: "12px",
                }}
              />
            )}

            {/* Автор и дата */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.9em",
                color: "#666",
              }}
            >
              <div>
                {post.user_id ? (
                  <Link
                    to={`/users/${post.user_id}`}
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    @{post.username || "See author"}
                  </Link>
                ) : (
                  <span>@{post.username || "See author"}</span>
                )}
              </div>
              <div>{formatDate(post.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
