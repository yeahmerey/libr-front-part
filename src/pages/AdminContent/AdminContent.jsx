// src/pages/AdminContent/AdminContent.jsx
import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function AdminContent() {
  const { user } = useAuth();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Форма создания
  const [type, setType] = useState("book");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Форма редактирования
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState("book");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

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

  // Обработчик загрузки изображения (создание)
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

  // Обработчик загрузки изображения (редактирование)
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  // Создание контента
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
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
        imageUrl = imgData.image_url;
      }

      const contentData = { type, name, description, image_url: imageUrl };
      await apiClient("/admin/content", {
        method: "POST",
        body: JSON.stringify(contentData),
      });

      // Сброс
      setName("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);

      // Обновление списка
      const data = await apiClient("/content");
      setContents(data);
    } catch (err) {
      setError("Failed to create content: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  // Начало редактирования
  const startEdit = (content) => {
    setEditingId(content.id);
    setEditType(content.type);
    setEditName(content.name);
    setEditDescription(content.description || "");
    setEditImageFile(null);
    setEditImagePreview(
      content.image_url ? `http://localhost:8000${content.image_url}` : null
    );
  };

  // Сохранение изменений
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    setError("");

    try {
      let imageUrl = null;
      // Если загружено новое изображение
      if (editImageFile) {
        const formData = new FormData();
        formData.append("file", editImageFile);
        const imgRes = await fetch("http://localhost:8000/images", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!imgRes.ok) throw new Error("Image upload failed");
        const imgData = await imgRes.json();
        imageUrl = imgData.image_url;
      }
      // Если изображение не менялось, оставляем старое
      else if (contents.find((c) => c.id === editingId)?.image_url) {
        imageUrl = contents.find((c) => c.id === editingId).image_url;
      }

      const contentData = {
        type: editType,
        name: editName,
        description: editDescription,
        image_url: imageUrl,
      };
      await apiClient(`/admin/content/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(contentData),
      });

      // Обновление списка
      const data = await apiClient("/content");
      setContents(data);
      setEditingId(null);
    } catch (err) {
      setError("Failed to update content: " + (err.message || err));
    } finally {
      setEditSubmitting(false);
    }
  };

  // Удаление контента
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this content? This cannot be undone.")) return;
    try {
      await apiClient(`/admin/content/${id}`, {
        method: "DELETE",
      });
      setContents(contents.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete content: " + (err.message || err));
    }
  };

  if (!user?.is_admin) {
    return <p style={{ padding: "20px" }}>Access denied.</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
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
        <h3>{editingId ? "Edit Content" : "Add New Content"}</h3>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {editingId ? (
          <form onSubmit={handleEditSubmit}>
            <div style={{ marginBottom: "10px" }}>
              <label>Type:</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
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
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                style={{ marginLeft: "10px", padding: "4px", width: "300px" }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>Description:</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows="3"
                style={{ marginLeft: "10px", padding: "4px", width: "300px" }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleEditImageChange}
                style={{ marginLeft: "10px" }}
              />
              {(editImagePreview || editImageFile) && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    style={{ height: "100px", objectFit: "cover" }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={editSubmitting}
              style={{
                padding: "6px 12px",
                backgroundColor: "#ffc107",
                color: "white",
                border: "none",
                borderRadius: "4px",
                marginRight: "10px",
              }}
            >
              {editSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Cancel
            </button>
          </form>
        ) : (
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
        )}
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
                position: "relative",
              }}
            >
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
                    width: "10 p00%",
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
              <h4>{item.name}</h4>
              <p style={{ fontSize: "0.85em", color: "#666" }}>{item.type}</p>

              {/* Кнопки действий */}
              <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                <button
                  onClick={() => startEdit(item)}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "#ffc107",
                    border: "none",
                    borderRadius: "3px",
                    fontSize: "0.85em",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    fontSize: "0.85em",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
