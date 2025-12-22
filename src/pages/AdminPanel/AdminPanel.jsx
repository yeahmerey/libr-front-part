// src/pages/AdminPanel/AdminPanel.jsx
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient.js";
import { useAuth } from "../../context/AuthContext";

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_admin) return;
    const fetchUsers = async () => {
      try {
        const data = await apiClient("/admin/users");
        setUsers(data);
      } catch (err) {
        alert("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

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
      alert("Failed to update admin status", err);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete user?")) return;
    try {
      await apiClient(`/admin/users/${userId}`, { method: "DELETE" });
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Failed to delete user", err);
    }
  };

  if (!user?.is_admin) {
    return <p>Access denied. Admins only.</p>;
  }

  if (loading) return <p>Loading users...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Admin Panel — Users ({users.length})</h2>
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
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.is_admin ? "✅" : "❌"}</td>
              <td>
                {u.id !== user.id && (
                  <>
                    <button onClick={() => toggleAdmin(u.id)}>
                      {u.is_admin ? "Remove Admin" : "Make Admin"}
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      style={{ marginLeft: "10px", color: "red" }}
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
