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

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// Добавляем interceptor для автоматического добавления токена
api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => Promise.reject(error));


let refreshInFlight = null;

api.interceptors.response.use((response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config;

    if (status == 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      try {
        if (!refreshInFlight) {
          refreshInFlight = api.post("auth/refresh", null, {
            headers: {
              "x-refresh-token": refreshToken,
            },
          })
          .then((res) => res.data)
          .finally(() => refreshInFlight = null);
        }

        const tokens = await refreshInFlight;
        setTokens(tokens);

        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(originalRequest);
      }
      catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);