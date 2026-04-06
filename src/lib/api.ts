import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://nested-ark-api-22.onrender.com',
  timeout: 30000, // 30s — Render free tier can be slow on cold start
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // DO NOT set withCredentials: true — we use Bearer tokens (Authorization header),
  // not cookies. withCredentials: true requires the backend to return an exact
  // origin (not wildcard), and causes preflight failures when misconfigured.
  withCredentials: false,
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Global response error handler — surface clean messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('API timeout — Render may be on cold start, retry in a moment.');
    }
    if (error.response?.status === 401) {
      // Token expired — clear storage (AuthContext will handle redirect)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
