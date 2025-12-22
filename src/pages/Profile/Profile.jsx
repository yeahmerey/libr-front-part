import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

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
  const [avatarPreview, setAvatarPreview] = useState(null);

  // === Follow system ===
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  // === Load user data ===
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        year_of_birth: user.year_of_birth ? String(user.year_of_birth) : "",
      });
      if (user.image_url) {
        setAvatarPreview(`http://localhost:8000${user.image_url}`);
      }
    }
  }, [user]);

  // === Load follow counts ===
  useEffect(() => {
    if (user) {
      const loadFollowCounts = async () => {
        try {
          const followers = await userService.getFollowers(user.id);
          const following = await userService.getFollowing(user.id);
          setFollowersCount(followers.length);
          setFollowingCount(following.length);
        } catch (err) {
          console.error("Failed to load follow counts:", err);
        }
      };
      loadFollowCounts();
    }
  }, [user]);

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

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

  // === Avatar handlers ===
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      await userService.uploadAvatar(file);
      const updatedUser = await userService.getUserById(user.id);
      setUser(updatedUser);
    } catch (err) {
      alert("Failed to upload avatar: " + err.message);
      setAvatarPreview(
        user.image_url ? `http://localhost:8000${user.image_url}` : null
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // === Follow handlers ===
  const loadFollowers = async () => {
    try {
      const followers = await userService.getFollowers(user.id);
      setFollowersList(followers);
      setShowFollowers(true);
    } catch (err) {
      alert("Failed to load followers", err);
    }
  };

  const loadFollowing = async () => {
    try {
      const following = await userService.getFollowing(user.id);
      setFollowingList(following);
      setShowFollowing(true);
    } catch (err) {
      alert("Failed to load following", err);
    }
  };

  if (!user) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* === Модальное окно: подписчики === */}
      {showFollowers && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3>Followers ({followersCount})</h3>
              <button
                onClick={() => setShowFollowers(false)}
                style={{
                  background: "none",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "30px",
                  height: "30px",
                }}
              >
                ✕
              </button>
            </div>
            {followersList.length === 0 ? (
              <p>No followers yet.</p>
            ) : (
              <div>
                {followersList.map((follower) => (
                  <div
                    key={follower.id}
                    style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}
                  >
                    <Link
                      to={`/users/${follower.id}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onClick={() => setShowFollowers(false)} // Закрываем модалку при клике
                    >
                      <img
                        src={
                          follower.image_url
                            ? `http://localhost:8000${follower.image_url}`
                            : null
                        }
                        alt={follower.username}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginRight: "10px",
                        }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <strong>{follower.username}</strong>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* === Модальное окно: подписки === */}
      {showFollowing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3>Following ({followingCount})</h3>
              <button
                onClick={() => setShowFollowing(false)}
                style={{
                  background: "none",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "30px",
                  height: "30px",
                }}
              >
                ✕
              </button>
            </div>
            {followingList.length === 0 ? (
              <p>Not following anyone yet.</p>
            ) : (
              <div>
                {followingList.map((following) => (
                  <div
                    key={following.id}
                    style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}
                  >
                    <Link
                      to={`/users/${following.id}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onClick={() => setShowFollowing(false)} // Закрываем модалку
                    >
                      <img
                        src={
                          following.image_url
                            ? `http://localhost:8000${following.image_url}`
                            : null
                        }
                        alt={following.username}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginRight: "10px",
                        }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <strong>{following.username}</strong>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* === Красивая аватарка === */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <div
          style={{
            position: "relative",
            display: "inline-block",
            cursor: "pointer",
          }}
          onClick={triggerFileInput}
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #ddd",
              }}
            />
          ) : (
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
                color: "#999",
                fontWeight: "bold",
                border: "2px dashed #ccc",
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div
            style={{
              position: "absolute",
              bottom: "0",
              right: "0",
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "white",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            ✎
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: "none" }}
        />
        <p style={{ marginTop: "8px", fontSize: "0.9em", color: "#666" }}>
          Click avatar to change
        </p>
      </div>

      {/* === Счётчики подписок === */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div
          onClick={loadFollowers}
          style={{ cursor: "pointer", color: "#007bff", fontWeight: "bold" }}
        >
          <strong>{followersCount}</strong> followers
        </div>
        <div
          onClick={loadFollowing}
          style={{ cursor: "pointer", color: "#007bff", fontWeight: "bold" }}
        >
          <strong>{followingCount}</strong> following
        </div>
      </div>

      {/* === Profile Section === */}
      <h2>Profile</h2>
      {editingProfile ? (
        <form
          onSubmit={handleProfileSubmit}
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
          }}
        >
          <input
            name="username"
            placeholder="Username"
            value={profileData.username}
            onChange={handleProfileChange}
            required
            style={{
              display: "block",
              marginBottom: "12px",
              width: "100%",
              padding: "8px",
            }}
          />
          <textarea
            name="bio"
            placeholder="Bio"
            value={profileData.bio}
            onChange={handleProfileChange}
            rows="2"
            style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
          />
          <input
            name="location"
            placeholder="Location"
            value={profileData.location}
            onChange={handleProfileChange}
            style={{
              display: "block",
              marginBottom: "12px",
              width: "100%",
              padding: "8px",
            }}
          />
          <input
            name="year_of_birth"
            type="number"
            placeholder="Year of Birth"
            value={profileData.year_of_birth}
            onChange={handleProfileChange}
            min="1900"
            max={new Date().getFullYear()}
            style={{
              display: "block",
              marginBottom: "12px",
              width: "100%",
              padding: "8px",
            }}
          />
          <div>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Save Profile
            </button>
            <button
              type="button"
              onClick={() => setEditingProfile(false)}
              style={{
                marginLeft: "10px",
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
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
          <button
            onClick={handleProfileEdit}
            style={{
              marginTop: "10px",
              padding: "6px 12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Edit Profile
          </button>
        </div>
      )}

      <hr
        style={{ margin: "30px 0", border: "0", borderTop: "1px solid #eee" }}
      />

      {/* === Posts Section === */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h2>My Posts</h2>
        <button
          onClick={startCreatePost}
          style={{
            padding: "6px 12px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          + New Post
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handlePostSubmit}
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <textarea
            name="content"
            placeholder="Write your post..."
            value={postForm.content}
            onChange={handlePostChange}
            required
            rows="3"
            style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handlePostChange}
            style={{ marginBottom: "12px" }}
          />
          <div>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {editingPostId ? "Update Post" : "Create Post"}
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              style={{
                marginLeft: "10px",
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
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
                {formatDateTime(post.created_at)}
              </p>
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => startEditPost(post)}
                  style={{
                    marginRight: "10px",
                    padding: "4px 8px",
                    backgroundColor: "#ffc107",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  style={{
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
