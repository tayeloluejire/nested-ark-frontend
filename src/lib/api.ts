import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nested-ark-api-v3.onrender.com';

console.log('--- NESTED ARK OS: API INITIALIZED ---');
console.log('Targeting Backend:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 80000, // Increased to 80s to account for slow Render cold starts
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
    
    // If the error is a timeout or a 503/504 (Common on Render spin-up)
    if (
      config &&
      !config._retried &&
      (error.code === 'ECONNABORTED' || error.response?.status === 503 || error.response?.status === 504)
    ) {
      config._retried = true;
      console.warn('Backend cold start detected. Retrying in 10s...');
      
      // Wait 10 seconds for the server to finish booting
      await new Promise(r => setTimeout(r, 10000));
      return api(config);
    }

    if (error.code === 'ECONNABORTED') {
      console.error('API CRITICAL TIMEOUT: Backend failed to wake up in time.');
    }

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  }
);

// Manual Wake-up Ping
if (typeof window !== 'undefined') {
  setTimeout(() => {
    api.get('/api/health').catch(() => {});
  }, 500); 
}

export default api;