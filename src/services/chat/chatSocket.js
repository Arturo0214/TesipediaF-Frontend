import { io } from 'socket.io-client';
import { getToken } from '../authService';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

let socket = null;

// 🔌 Conectar socket
export const connectSocket = (userId, isPublic = false) => {
  if (socket) {
    socket.disconnect();
  }

  console.log('Conectando socket con:', { userId, isPublic, token: isPublic ? 'N/A' : getToken() ? 'Token presente' : 'Token ausente' });

  socket = io(VITE_BASE_URL, {
    auth: isPublic
      ? { userId, isPublic: true }
      : { userId, token: getToken(), isPublic: false },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('Socket conectado exitosamente'));
  socket.on('disconnect', (reason) => console.log('Socket desconectado. Razón:', reason));
  socket.on('connect_error', (error) => console.error('Error de conexión:', error.message));
  socket.on('error', (error) => console.error('Error de socket:', error));
  socket.on('reconnect_attempt', (attemptNumber) => console.log(`Intento de reconexión #${attemptNumber}`));
  socket.on('reconnect_failed', () => console.error('Reconexión fallida después de múltiples intentos'));

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
