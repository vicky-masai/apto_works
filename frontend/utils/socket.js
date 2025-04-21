// utils/socket.ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  withCredentials: true, // optional: if you use cookies or auth
  transports: ['websocket'], // force WebSocket (optional)
});

export default socket;
