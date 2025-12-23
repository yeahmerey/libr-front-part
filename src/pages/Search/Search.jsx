// src/pages/Search/Search.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userService } from "../../services/userService";
import { useTranslation } from "../../i18n/useTranslation"; // ← добавлен импорт

export default function Search() {
  const { t } = useTranslation(); // ← хук локализации
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

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>{t("search-users")}</h2>
      <input
        type="text"
        placeholder={t("enter-username")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
      />

      {loading && <p>{t("searching...")}</p>}

      {results.length === 0 && query.trim().length >= 2 && !loading && (
        <p>{t("no-users-found")}</p>
      )}

      <div>
        {results.map((user) => (
          <div
            key={user.id}
            style={{
              padding: "10px",
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Аватарка */}
            <div style={{ marginRight: "12px" }}>
              {user.image_url ? (
                <img
                  src={`http://localhost:8000${user.image_url}`}
                  alt={user.username}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                    fontWeight: "bold",
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Имя и био */}
            <div>
              <Link
                to={`/users/${user.id}`}
                style={{
                  textDecoration: "none",
                  color: "blue",
                  fontSize: "1.1em",
                }}
              >
                <strong>{user.username}</strong>
              </Link>
              {user.bio && (
                <p
                  style={{ margin: "4px 0", color: "#555", fontSize: "0.9em" }}
                >
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
