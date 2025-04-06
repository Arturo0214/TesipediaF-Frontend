import { io } from 'socket.io-client';
import { getToken } from '../authService';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let socket = null;

// 🔌 Conectar socket
export const connectSocket = (userId, isPublic = false) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(VITE_API_URL, {
    auth: isPublic
      ? { userId, isPublic: true }
      : { userId, token: getToken(), isPublic: false },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('Socket conectado'));
  socket.on('disconnect', () => console.log('Socket desconectado'));
  socket.on('connect_error', (error) => console.error('Error de conexión:', error.message));

  return socket;
};

// 🔌 Desconectar socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// 📤 Emitir eventos
export const emitSocketEvent = (event, data) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  }
};

// 📥 Escuchar eventos
export const onSocketEvent = (event, callback) => {
  if (socket) {
    socket.off(event);
    socket.on(event, callback);
  }
};

// 🔎 Saber si el socket está conectado
export const isSocketConnected = () => {
  return socket && socket.connected;
};

// 🔎 Obtener instancia de socket
export const getSocket = () => socket;
