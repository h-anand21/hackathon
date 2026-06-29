import { io } from 'socket.io-client';
import { Platform } from 'react-native';

const getSocketUrl = () => {
  if (process.env.EXPO_PUBLIC_SOCKET_URL) {
    if (Platform.OS === 'android' && process.env.EXPO_PUBLIC_SOCKET_URL.includes('localhost')) {
      return process.env.EXPO_PUBLIC_SOCKET_URL.replace('localhost', '10.0.2.2');
    }
    return process.env.EXPO_PUBLIC_SOCKET_URL;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
};

export const socket = io(getSocketUrl(), {
  autoConnect: false,
  transports: ['websocket'], // React Native works best with pure websockets transport
});
