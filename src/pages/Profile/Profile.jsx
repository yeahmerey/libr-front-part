import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";

export default function Profile() {
  const { user, setUser } = useAuth();

  // === User profile ===
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    bio: "",
    location: "",
    year_of_birth: "",
  });

  // === Posts ===
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [postForm, setPostForm] = useState({ content: "", image: null });
  const [isCreating, setIsCreating] = useState(false);

  // === Load user data ===
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        year_of_birth: user.year_of_birth ? String(user.year_of_birth) : "",
      });
    }
  }, [user]);

  // === Load user's posts ===
  useEffect(() => {
    const loadPosts = async () => {
      if (!user) return;
      try {
        const userPosts = await postService.getMyPosts();
        setPosts(userPosts || []);
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };
    loadPosts();
  }, [user]);

  // === Profile handlers ===
  const handleProfileEdit = () => setEditingProfile(true);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...profileData };
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
      setUser(updatedUser);
      setEditingProfile(false);
    } catch (err) {
      alert("Failed to update profile: " + (err.message || err));
    }
  };

  // === Post handlers ===
  const startCreatePost = () => {
    setPostForm({ content: "", image: null });
    setEditingPostId(null);
    setIsCreating(true);
  };

  const startEditPost = (post) => {
    setPostForm({ content: post.content || "", image: null });
    setEditingPostId(post.id);
    setIsCreating(true);
  };

  const handlePostChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setPostForm((prev) => ({ ...prev, image: files[0] || null }));
    } else {
      setPostForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPostId) {
        await postService.updatePost(
          editingPostId,
          postForm.content,
          postForm.image
        );
      } else {
        await postService.createPost(postForm.content, postForm.image);
      }
      // Обновляем список постов
      const userPosts = await postService.getMyPosts();
      setPosts(userPosts || []);
      setIsCreating(false);
    } catch (err) {
      alert("Failed to save post: " + (err.message || err));
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await postService.deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      alert("Failed to delete post: " + (err.message || err));
    }
  };

  if (!user) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* === Profile Section === */}
      <h2>Profile</h2>
      {editingProfile ? (
        <form
          onSubmit={handleProfileSubmit}
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <input
            name="username"
            placeholder="Username"
            value={profileData.username}
            onChange={handleProfileChange}
            required
            style={{ display: "block", marginBottom: "10px" }}
          />
          <textarea
            name="bio"
            placeholder="Bio"
            value={profileData.bio}
            onChange={handleProfileChange}
            rows="2"
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <input
            name="location"
            placeholder="Location"
            value={profileData.location}
            onChange={handleProfileChange}
            style={{ display: "block", marginBottom: "10px" }}
          />
          <input
            name="year_of_birth"
            type="number"
            placeholder="Year of Birth"
            value={profileData.year_of_birth}
            onChange={handleProfileChange}
            min="1900"
            max={new Date().getFullYear()}
            style={{ display: "block", marginBottom: "10px" }}
          />
          <button type="submit">Save Profile</button>
          <button
            type="button"
            onClick={() => setEditingProfile(false)}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div style={{ marginBottom: "20px" }}>
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
          <button onClick={handleProfileEdit} style={{ marginTop: "10px" }}>
            Edit Profile
          </button>
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />

      {/* === Posts Section === */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>My Posts</h2>
        <button onClick={startCreatePost}>+ New Post</button>
      </div>

      {isCreating && (
        <form
          onSubmit={handlePostSubmit}
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <textarea
            name="content"
            placeholder="Write your post..."
            value={postForm.content}
            onChange={handlePostChange}
            required
            rows="3"
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handlePostChange}
          />
          <button type="submit">
            {editingPostId ? "Update Post" : "Create Post"}
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </form>
      )}

      {loadingPosts ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
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
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => startEditPost(post)}
                  style={{ marginRight: "10px" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  style={{ color: "red" }}
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
