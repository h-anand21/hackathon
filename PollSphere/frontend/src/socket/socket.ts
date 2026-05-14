import { io } from 'socket.io-client';

// Fallback to localhost if env var is missing, ensuring we strip /api from the URL
const isDev = import.meta.env.MODE === 'development';
const SOCKET_URL = isDev ? 'http://localhost:5000' : 'https://hackathon-vblw.onrender.com';

export const socket = io(SOCKET_URL, {
  autoConnect: false 
});
