import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/content">Content</NavLink>
        {user && <NavLink to="/profile">Profile</NavLink>}
        {user && <NavLink to="/chat">AI Chat</NavLink>}
        {user && user.is_admin && <NavLink to="/admin">Admin Panel</NavLink>}
      </nav>

      <nav className="nav-second">
        {user ? (
          <div className="auth-info">
            Hello, {user.username}!{" "}
            <button
              onClick={logout}
              style={{
                marginLeft: "10px",
                background: "none",
                color: "blue",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </>
  );
}
