import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import "./Profile.css"; // опционально

export default function Profile() {
  const { user, setUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    location: "",
    year_of_birth: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        year_of_birth: user.year_of_birth ? String(user.year_of_birth) : "",
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [user]);

  const handleEdit = () => setEditing(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...formData };
    // Преобразуем year_of_birth в число или null
    if (payload.year_of_birth === "") {
      payload.year_of_birth = null;
    } else {
      const year = parseInt(payload.year_of_birth, 10);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        alert(
          "Please enter a valid year (1900–" + new Date().getFullYear() + ")"
        );
        return;
      }
      payload.year_of_birth = year;
    }

    try {
      const updatedUser = await userService.updateProfile(payload);
      setUser(updatedUser); // обновляем контекст
      setEditing(false);
    } catch (err) {
      alert("Failed to update profile: " + (err.message || err));
    }
  };

  if (!user) return <p>Loading...</p>;

  if (editing) {
    return (
      <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ margin: "10px 0" }}>
            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ margin: "10px 0" }}>
            <textarea
              name="bio"
              placeholder="Bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ margin: "10px 0" }}>
            <input
              name="location"
              placeholder="Location (e.g., Paris, France)"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <div style={{ margin: "10px 0" }}>
            <input
              name="year_of_birth"
              type="number"
              placeholder="Year of Birth"
              value={formData.year_of_birth}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
          <button type="submit">Save</button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Profile</h1>
      <p>
        <strong>Username:</strong> {user.username}
      </p>
      {user.bio && (
        <p>
          <strong>Bio:</strong> {user.bio}
        </p>
      )}
      {user.location && (
        <p>
          <strong>Location:</strong> {user.location}
        </p>
      )}
      {user.year_of_birth && (
        <p>
          <strong>Year of Birth:</strong> {user.year_of_birth}
        </p>
      )}
      <button onClick={handleEdit} style={{ marginTop: "10px" }}>
        Edit Profile
      </button>
    </div>
  );
}
