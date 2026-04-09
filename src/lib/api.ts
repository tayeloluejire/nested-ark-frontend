import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nested-ark-api-v3.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000, // Increased to 90s (Render Max Cold Start)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Check for Cold Start indicators
    const isColdStart = 
      error.code === 'ECONNABORTED' || 
      error.response?.status === 503 || 
      error.response?.status === 504 ||
      error.message.includes('Network Error');

    if (config && !config._retried && isColdStart) {
      config._retried = true;
      console.warn('⚡ Nested Ark OS: Backend Waking Up... Retrying in 5s');
      
      // Wait 5 seconds and try again
      await new Promise(r => setTimeout(r, 5000));
      return api(config);
    }

    return Promise.reject(error);
  }
);

// Force a "Keep-Alive" ping every 10 minutes if the tab is open
if (typeof window !== 'undefined') {
  setInterval(() => {
    api.get('/api/health').catch(() => {});
  }, 600000); 
}

export default api;