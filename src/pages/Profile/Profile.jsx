import { useAuth } from "../../context/useAuth.js";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Profile</h1>
      <p>
        <strong>Username:</strong> {user.username}
      </p>
      {user.email && (
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      )}
      {user.bio && (
        <p>
          <strong>Bio:</strong> {user.bio}
        </p>
      )}
    </div>
  );
}
