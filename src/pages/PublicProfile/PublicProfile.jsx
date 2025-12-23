import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { useTranslation } from "../../i18n/useTranslation";

export default function PublicProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await userService.getUserById(id);
        const userPosts = await userService.getUserPosts(id);

        setUser(userData);
        setPosts(userPosts);

        const followers = await userService.getFollowers(id);
        const following = await userService.getFollowing(id);

        setFollowersCount(followers.length);
        setFollowingCount(following.length);

        if (currentUser) {
          const isFollowing = following.some((f) => f.id === currentUser.id);
          setIsFollowing(isFollowing);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (err.status === 404) navigate("/search");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser, navigate]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert(t("login"));
      return;
    }
    try {
      await userService.toggleFollow(user.id);
      setIsFollowing(!isFollowing);

      const followers = await userService.getFollowers(user.id);
      const following = await userService.getFollowing(user.id);
      setFollowersCount(followers.length);
      setFollowingCount(following.length);
    } catch (err) {
      alert("Failed to update follow status", err);
    }
  };

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

  if (loading) return <p style={{ padding: "20px" }}>{t("loading...")}</p>;
  if (!user) return <p style={{ padding: "20px" }}>{t("content-not-found")}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
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
              <h3>
                {t("followers")} ({followersCount})
              </h3>
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
              <p>{t("no-posts-yet")}</p>
            ) : (
              <div>
                {followersList.map((follower) => (
                  <div
                    key={follower.id}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #eee",
                    }}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
              <h3>
                {t("following")} ({followingCount})
              </h3>
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
              <p>{t("no-posts-yet")}</p>
            ) : (
              <div>
                {followingList.map((following) => (
                  <div
                    key={following.id}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #eee",
                    }}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "24px",
        }}
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
          {currentUser && currentUser.id !== user.id && (
            <button
              onClick={handleFollowToggle}
              style={{
                marginTop: "10px",
                padding: "6px 12px",
                backgroundColor: isFollowing ? "#6c757d" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {isFollowing ? t("unfollow") : t("follow")}
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          onClick={loadFollowers}
          style={{ cursor: "pointer", color: "#007bff" }}
        >
          <strong>{followersCount}</strong> {t("followers")}
        </div>
        <div
          onClick={loadFollowing}
          style={{ cursor: "pointer", color: "#007bff" }}
        >
          <strong>{followingCount}</strong> {t("following")}
        </div>
      </div>

      {user.bio && (
        <p>
          <strong>{t("bio")}:</strong> {user.bio}
        </p>
      )}
      {user.location && (
        <p>
          <strong>{t("location")}:</strong> {user.location}
        </p>
      )}
      {user.year_of_birth && (
        <p>
          <strong>{t("year-of-birth")}:</strong> {user.year_of_birth}
        </p>
      )}

      <h3 style={{ marginTop: "30px" }}>
        {t("posts")} ({posts.length})
      </h3>

      {posts.length === 0 ? (
        <p>{t("no-posts-yet")}</p>
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
                style={{
                  fontSize: "0.85em",
                  color: "#666",
                  marginTop: "8px",
                }}
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
