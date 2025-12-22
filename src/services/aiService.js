import apiClient from "./apiClient";

export const aiService = {
  async sendMessage(message) {
    const response = await apiClient("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return response; // { reply: "..." }
  },

  async getHistory() {
    return await apiClient("/ai/history");
  },

  async clearHistory() {
    return await apiClient("/ai/history", {
      method: "DELETE",
    });
  },
};
