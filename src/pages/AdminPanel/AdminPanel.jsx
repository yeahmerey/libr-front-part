// src/pages/AdminPanel/AdminPanel.jsx
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient.js";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Состояния для создания пользователя
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Состояния для редактирования username
  const [editUserId, setEditUserId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.is_admin) return;
    const fetchUsers = async () => {
      try {
        const data = await apiClient("/admin/users");
        setUsers(data);
      } catch (err) {
        alert("Failed to load users: " + (err.message || err));
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  const createUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      alert("All fields are required.");
      return;
    }
    try {
      await apiClient("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
        }),
      });
      alert("User created successfully!");
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      // Обновляем список
      const data = await apiClient("/admin/users");
      setUsers(data);
    } catch (err) {
      alert("Failed to create user: " + (err.message || err));
    }
  };

  const startEdit = (user) => {
    setEditUserId(user.id);
    setEditUsername(user.username);
  };

  const saveEdit = async (userId) => {
    if (!editUsername.trim()) {
      alert("Username cannot be empty.");
      return;
    }
    try {
      await apiClient(`/admin/users/${userId}/username`, {
        method: "PUT",
        body: JSON.stringify({ new_username: editUsername }),
      });
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, username: editUsername } : u
        )
      );
      setEditUserId(null);
      alert("Username updated!");
    } catch (err) {
      alert("Failed to update username: " + (err.message || err));
    }
  };

  const cancelEdit = () => {
    setEditUserId(null);
  };

  const toggleAdmin = async (userId) => {
    if (!window.confirm("Toggle admin status?")) return;
    try {
      await apiClient(`/admin/users/${userId}/toggle-admin`, { method: "PUT" });
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_admin: !u.is_admin } : u
        )
      );
    } catch (err) {
      alert("Failed to update admin status: " + (err.message || err));
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete user?")) return;
    try {
      await apiClient(`/admin/users/${userId}`, { method: "DELETE" });
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Failed to delete user: " + (err.message || err));
    }
  };

  if (!user?.is_admin) {
    return <p>Access denied. Admins only.</p>;
  }

  if (loading) return <p>Loading users...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Admin Panel — Users ({users.length})</h2>
      <button onClick={() => navigate(-1)}>Back</button>
      {/* <Link to="/profile">Back to Profile</Link> */}
      <Link to="/admin/content">Create Content</Link>
      {/* Форма создания пользователя */}
      <div
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>Create New User</h3>
        <form onSubmit={createUser}>
          <input
            type="text"
            placeholder="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "8px",
              padding: "6px",
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "8px",
              padding: "6px",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "12px",
              padding: "6px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "6px 12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Create User
          </button>
        </form>
      </div>
      {/* Таблица пользователей */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{u.id}</td>
              <td>
                {editUserId === u.id ? (
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    style={{ padding: "4px", width: "120px" }}
                    autoFocus
                  />
                ) : (
                  u.username
                )}
              </td>
              <td>{u.email}</td>
              <td>{u.is_admin ? "✅" : "❌"}</td>
              <td>
                {u.id !== user.id && (
                  <>
                    {editUserId === u.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(u.id)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            marginLeft: "6px",
                            padding: "4px 8px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(u)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#ffc107",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => toggleAdmin(u.id)}
                      style={{
                        marginLeft: "10px",
                        padding: "4px 8px",
                        backgroundColor: u.is_admin ? "#dc3545" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {u.is_admin ? "Remove Admin" : "Make Admin"}
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      style={{
                        marginLeft: "10px",
                        padding: "4px 8px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
