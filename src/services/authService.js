import apiClient from "./apiClient";

export const authService = {
  async register(username, email, password) {
    return await apiClient("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },
  async login(username, password) {
    return await apiClient("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },
  async logout() {
    return await apiClient("/auth/logout", {
      method: "POST",
    });
  },
  async refresh() {
    return await apiClient("/auth/refresh", {
      method: "POST",
    });
  },
  async getCurrentUser() {
    return await apiClient("/users/me");
  },
};
