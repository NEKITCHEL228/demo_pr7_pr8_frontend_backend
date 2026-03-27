import axios from "axios";

/**
 * Единая точка настройки axios.
 * Бэкенд слушает порт 3000: http://localhost:3000
 * Базовый префикс API: /api
 */
export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
});

// Добавляем interceptor для автоматического добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
