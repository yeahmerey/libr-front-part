import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { userService } from "../../services/userService";

export default function PublicProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await userService.getUserById(id);
        const userPosts = await userService.getUserPosts(id);
        setUser(userData);
        setPosts(userPosts);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (!user) return <p style={{ padding: "20px" }}>User not found.</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Шапка с аватаркой */}
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}
      >
        {user.image_url ? (
          <img
            src={`http://localhost:8000${user.image_url}`}
            alt={user.username}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              marginRight: "20px",
            }}
          />
        ) : (
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: "32px",
              fontWeight: "bold",
              marginRight: "20px",
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2>{user.username}'s Profile</h2>
        </div>
      </div>

      {/* Данные профиля */}
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

      {/* Посты */}
      <h3 style={{ marginTop: "30px" }}>Posts ({posts.length})</h3>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #eee",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
              }}
            >
              <p>{post.content}</p>
              {post.image_url && (
                <img
                  src={`http://localhost:8000${post.image_url}`}
                  alt="Post"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "4px",
                    marginTop: "8px",
                  }}
                />
              )}
              <p
                style={{ fontSize: "0.85em", color: "#666", marginTop: "8px" }}
              >
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
