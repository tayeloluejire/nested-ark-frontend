import axios from 'axios';

// FORCE v3 as the hardcoded fallback to ensure we don't hit the blocked v2 server
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nested-ark-api-v3.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  // 60s timeout — Render free tier can take 30–60s to wake from cold start.
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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

    // Handle Render cold-start or network timeouts
    // Added 503 (Service Unavailable) which Render often sends during a spin-up
    if (
      config &&
      !config._retried &&
      (error.code === 'ECONNABORTED' || error.response?.status === 503 || error.response?.status === 504)
    ) {
      config._retried = true;
      // Increased delay to 5s to give Render more time to spin up
      await new Promise(r => setTimeout(r, 5000));
      return api(config);
    }

    if (error.code === 'ECONNABORTED') {
      console.warn('API still unresponsive after retry. The backend may be starting up.');
    }

    // Token expired — clear storage
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }

    return Promise.reject(error);
  }
);

// ── Server warm-up ping ──────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  // Fire a silent health check to "wake up" the Render instance immediately on page load
  setTimeout(() => {
    api.get('/api/health').catch(() => {
      // Silently catch error if server is still sleeping
    });
  }, 1000); 
}

export default api;