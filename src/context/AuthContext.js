// src/context/AuthContext.js
import { createContext, useContext } from "react";

// Создаём контекст
export const AuthContext = createContext();

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
