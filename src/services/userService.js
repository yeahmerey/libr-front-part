import apiClient from "./apiClient";

export const userService = {
  async updateProfile(data) {
    const response = await apiClient("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  },
};
