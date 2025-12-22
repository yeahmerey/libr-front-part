// src/pages/Search/Search.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userService } from "../../services/userService";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const users = await userService.searchUser(query);
        setResults(users);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Дебаунс (опционально)
    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Search Users</h2>
      <input
        type="text"
        placeholder="Enter username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
      />

      {loading && <p>Searching...</p>}

      {results.length === 0 && query.trim().length >= 2 && !loading && (
        <p>No users found.</p>
      )}

      <div>
        {results.map((user) => (
          <div
            key={user.id}
            style={{ padding: "10px", borderBottom: "1px solid #eee" }}
          >
            <Link
              to={`/users/${user.id}`}
              style={{ textDecoration: "none", color: "blue" }}
            >
              <strong>{user.username}</strong>
            </Link>
            {user.bio && (
              <p style={{ margin: "4px 0", color: "#555" }}>{user.bio}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
