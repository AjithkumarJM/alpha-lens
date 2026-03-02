import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const fetchAnalysis = (symbol) => api.get(`/analysis/${symbol}`);
export const fetchQuote = (symbol) => api.get(`/quote/${symbol}`);
export const fetchWatchlist = () => api.get("/watchlist");
export const addToWatchlist = (symbol) => api.post("/watchlist", { symbol });
export const removeFromWatchlist = (symbol) =>
  api.delete(`/watchlist/${symbol}`);

export default api;
