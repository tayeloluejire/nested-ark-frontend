import axios from 'axios';

// Update this to your actual Render API URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://nested-ark-api-22.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');

    if (token && config.headers) {
      // Correct way to append headers in Axios interceptors
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;