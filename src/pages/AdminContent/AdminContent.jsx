// src/pages/AdminContent/AdminContent.jsx
import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
export default function AdminContent() {
  const { user } = useAuth();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Форма
  const [type, setType] = useState("book");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Загрузка списка контента
  useEffect(() => {
    const loadContents = async () => {
      try {
        const data = await apiClient("/content");
        setContents(data);
      } catch (err) {
        setError("Failed to load content", err);
      } finally {
        setLoading(false);
      }
    };
    loadContents();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // 1. Загружаем изображение (если есть)
      let imageUrl = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const imgRes = await fetch("http://localhost:8000/images", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!imgRes.ok) throw new Error("Image upload failed");
        const imgData = await imgRes.json();
        imageUrl = imgData.image_url; // например: "/static/images/abc123.jpg"
      }

      // 2. Создаём контент
      const contentData = { type, name, description, image_url: imageUrl };
      await apiClient("/admin/content", {
        method: "POST",
        body: JSON.stringify(contentData),
      });

      // 3. Сброс и обновление
      alert("Content created!");
      setName("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      // Обновим список
      const data = await apiClient("/content");
      setContents(data);
    } catch (err) {
      setError("Failed to create content: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.is_admin) {
    return <p style={{ padding: "20px" }}>Access denied.</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <Link to="/admin">Back to Admin Panel</Link>
      <h2>Manage Content</h2>

      {/* Форма создания */}
      <div
        style={{
          marginBottom: "40px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>Add New Content</h3>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ marginLeft: "10px", padding: "4px" }}
            >
              <option value="book">Book</option>
              <option value="movie">Movie</option>
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ marginLeft: "10px", padding: "4px", width: "300px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              style={{ marginLeft: "10px", padding: "4px", width: "300px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ marginLeft: "10px" }}
            />
            {imagePreview && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ height: "100px", objectFit: "cover" }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "6px 12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {submitting ? "Creating..." : "Create Content"}
          </button>
        </form>
      </div>

      {/* Список контента */}
      <h3>Existing Content ({contents.length})</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          {contents.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #eee",
                padding: "10px",
                borderRadius: "6px",
              }}
            >
              <div>
                {item.image_url ? (
                  <img
                    src={`http://localhost:8000${item.image_url}`}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "120px",
                      backgroundColor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    No Image
                  </div>
                )}
              </div>
              <h4>{item.name}</h4>
              <p style={{ fontSize: "0.85em", color: "#666" }}>{item.type}</p>
              {/* Можно добавить кнопки удалить/редактировать */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
