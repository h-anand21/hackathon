import axios from 'axios';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    if (Platform.OS === 'android' && process.env.EXPO_PUBLIC_API_URL.includes('localhost')) {
      return process.env.EXPO_PUBLIC_API_URL.replace('localhost', '10.0.2.2');
    }
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();
console.log('Mobile App API URL Loaded:', BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Module-level reference to Clerk's getToken function.
// Set this once from any authenticated screen using initTokenGetter().
let _getToken: (() => Promise<string | null>) | null = null;

/**
 * Call this once after Clerk loads (e.g. in index.tsx useEffect)
 * so the axios interceptor can always fetch a fresh token.
 */
export const initTokenGetter = (getter: () => Promise<string | null>) => {
  _getToken = getter;
};

/**
 * Legacy setter — still usable for one-off token overrides.
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Axios request interceptor — runs before EVERY api call.
// Automatically injects a fresh Clerk JWT when available.
api.interceptors.request.use(
  async (config) => {
    if (_getToken) {
      try {
        const token = await _getToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch {
        // Silently skip if token fetch fails
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
