import apiClient from "./apiClient";

export const userService = {
  async updateProfile(data) {
    return await apiClient("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async getUserById(id) {
    return await apiClient(`/users/${id}`);
  },

  async getUserPosts(userId) {
    return await apiClient(`/users/${userId}/posts`);
  },

  async searchUser(query) {
    const params = new URLSearchParams({ query });
    return await apiClient(`/users/search?${params}`);
  },
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:8000/images", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data; // должен вернуть { image_url: "..." }
  },
};
