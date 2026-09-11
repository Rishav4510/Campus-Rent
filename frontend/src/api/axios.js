import axios from "axios";

export const API_BASE_URL = "http://localhost:5000/api";
export const BACKEND_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cr_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiry (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentToken = localStorage.getItem("cr_token");
      if (currentToken) {
        localStorage.removeItem("cr_token");
        localStorage.removeItem("cr_user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper to resolve image paths
export const getImageUrl = (path) => {
  if (!path) return "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_URL}${path}`;
};

export default api;
