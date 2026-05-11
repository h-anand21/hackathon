import { io } from 'socket.io-client';

// Fallback to localhost if env var is missing, ensuring we strip /api from the URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

export const socket = io(SOCKET_URL, {
  autoConnect: false // Connect manually only when needed to save resources
});
