import "./PublicProfile.css";
// src/pages/PublicProfile/PublicProfile.jsx
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
      <h2>{user.username}'s Profile</h2>
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

      <h3>Posts ({posts.length})</h3>
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
                borderRadius: "4px",
              }}
            >
              <p>{post.content}</p>
              {post.image_url && (
                <img
                  src={`http://localhost:8000${post.image_url}`}
                  alt="Post"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}
              <p style={{ fontSize: "0.85em", color: "#666" }}>
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
