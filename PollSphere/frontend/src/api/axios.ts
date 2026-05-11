import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// We will inject the Clerk token into headers before each request
api.interceptors.request.use(async (config) => {
  // Access the global Clerk object injected by ClerkProvider
  const clerk = (window as any).Clerk;
  if (clerk && clerk.session) {
    const token = await clerk.session.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
