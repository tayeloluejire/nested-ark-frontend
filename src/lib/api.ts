import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nested-ark-api-22.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  // 60s timeout — Render free tier can take 30–60s to wake from cold start.
  // The home page fires a silent /api/health ping on load so the server is warm
  // by the time the user actually clicks Register or Login.
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

// ── Attach Bearer token on every request ─────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Global response error handler ────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Render cold-start: auto-retry once after 3s
    if (
      error.code === 'ECONNABORTED' &&
      config &&
      !config._retried
    ) {
      config._retried = true;
      await new Promise(r => setTimeout(r, 3000));
      return api(config);
    }

    if (error.code === 'ECONNABORTED') {
      console.warn('API still unresponsive after retry. The backend may be starting up.');
    }

    // Token expired — clear storage (AuthContext will handle redirect)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
