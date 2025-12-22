// src/services/postService.js

import apiClient from "./apiClient";

// Функция для создания FormData с content и опциональным файлом
function createPostFormData(content, imageFile = null) {
  const formData = new FormData();
  formData.append("content", content);
  if (imageFile) {
    formData.append("file", imageFile);
  }
  return formData;
}

export const postService = {
  async getMyPosts() {
    return await apiClient("/users/posts");
  },

  async createPost(content, imageFile = null) {
    const formData = createPostFormData(content, imageFile);
    const response = await fetch("http://localhost:8000/posts", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    return response.json();
  },

  async updatePost(postId, content, imageFile = null) {
    const formData = createPostFormData(content, imageFile);
    const response = await fetch(`http://localhost:8000/posts/${postId}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    return response.json();
  },

  async deletePost(postId) {
    return await apiClient(`/posts/${postId}`, {
      method: "DELETE",
    });
  },
};
