// src/pages/Register/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/useTranslation"; // ← добавлен

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // ← хук

  const validatePassword = (pass) => {
    if (pass.length < 8) {
      return t("password-too-short");
    }
    if (!/[A-Z]/.test(pass)) {
      return t("password-uppercase");
    }
    if (!/[a-z]/.test(pass)) {
      return t("password-lowercase");
    }
    if (!/[0-9]/.test(pass)) {
      return t("password-number");
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwords-do-not-match"));
      return;
    }
    try {
      await register(username, email, password);
      alert(t("registration-successful"));
      navigate("/login");
    } catch (err) {
      setError(err.message || t("registration-failed"));
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>{t("register")}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder={t("username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ margin: "10px 0" }}>
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ margin: "10px 0" }}>
          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ margin: "10px 0" }}>
          <input
            type="password"
            placeholder={t("confirm-password")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{t("register")}</button>
      </form>
    </div>
  );
}
