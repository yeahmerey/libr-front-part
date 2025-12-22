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
};
