import axios from 'axios';

const isDev = import.meta.env.MODE === 'development';
const BASE_URL = isDev ? 'http://localhost:5000/api' : 'https://hackathon-vblw.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
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
