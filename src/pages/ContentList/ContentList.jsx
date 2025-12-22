// src/pages/ContentList/ContentList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

export default function ContentList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let url = "/content";
        const params = [];
        if (search) params.push(`q=${encodeURIComponent(search)}`);
        if (type) params.push(`type=${type}`);
        if (params.length) url += "?" + params.join("&");
        const data = await apiClient(url);
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [search, type]);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Books & Movies</h2>

      {/* Фильтры */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="">All</option>
          <option value="book">Books</option>
          <option value="movie">Movies</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No content found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/content/${item.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {item.image_url ? (
                  <img
                    src={`http://localhost:8000${item.image_url}`}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "180px",
                      backgroundColor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                    }}
                  >
                    No Image
                  </div>
                )}
                <div style={{ padding: "12px" }}>
                  <div
                    style={{
                      fontSize: "0.85em",
                      color: "#666",
                      marginBottom: "4px",
                    }}
                  >
                    {item.type === "book" ? "📚 Book" : "🎬 Movie"}
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "1.1em" }}>
                    {item.name}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9em",
                      color: "#555",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.description || "No description"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
