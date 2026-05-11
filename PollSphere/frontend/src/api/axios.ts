import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// We will inject the Clerk token into headers before each request
api.interceptors.request.use(async (config) => {
  // Logic to grab token goes here (handled dynamically in hooks/useAuth usually or globally)
  return config;
});

export default api;
