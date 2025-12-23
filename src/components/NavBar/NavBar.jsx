// src/components/NavBar/NavBar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/useTranslation";

export default function NavBar() {
  const { user, logout } = useAuth();
  const { t, changeLanguage } = useTranslation(); // ← локализация

  return (
    <>
      <nav className="nav">
        <NavLink to="/">{t("home")}</NavLink>
        <NavLink to="/search">{t("search")}</NavLink>
        <NavLink to="/content">{t("books-&-movies")}</NavLink>
        {user && <NavLink to="/profile">{t("profile")}</NavLink>}
        {user && <NavLink to="/chat">{t("ai-chat")}</NavLink>}
        {user && user.is_admin && (
          <NavLink to="/admin">{t("manage-content")}</NavLink>
        )}
      </nav>

      <nav className="nav-second">
        {user ? (
          <div className="auth-info">
            {t("hello", { username: user.username })}!{" "}
            <button
              onClick={logout}
              style={{
                marginLeft: "10px",
                background: "none",
                color: "blue",
                cursor: "pointer",
              }}
            >
              {t("logout")}
            </button>
          </div>
        ) : (
          <>
            <NavLink to="/login">{t("login")}</NavLink>
            <NavLink to="/register">{t("register")}</NavLink>
          </>
        )}
        {/* Переключатель языка */}
        <button
          onClick={() => changeLanguage("en")}
          style={{ marginLeft: "10px" }}
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage("ru")}
          style={{ marginLeft: "6px" }}
        >
          RU
        </button>
        <button
          onClick={() => changeLanguage("kk")}
          style={{ marginLeft: "6px" }}
        >
          KK
        </button>
      </nav>
    </>
  );
}
