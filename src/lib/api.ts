import axios from 'axios';

// Priority 1: Vercel Env Var | Priority 2: Hardcoded v3 Fallback
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nested-ark-api-v3.onrender.com';

console.log('--- NESTED ARK OS: API INITIALIZED ---');
console.log('Targeting Backend:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (
      config &&
      !config._retried &&
      (error.code === 'ECONNABORTED' || error.response?.status === 503 || error.response?.status === 504)
    ) {
      config._retried = true;
      console.warn('Backend cold start detected. Retrying in 5s...');
      await new Promise(r => setTimeout(r, 5000));
      return api(config);
    }

    if (error.code === 'ECONNABORTED') {
      console.error('API TIMEOUT: Backend failed to respond in 60s.');
    }

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  }
);

if (typeof window !== 'undefined') {
  setTimeout(() => {
    api.get('/api/health').catch(() => {});
  }, 1000); 
}

export default api;