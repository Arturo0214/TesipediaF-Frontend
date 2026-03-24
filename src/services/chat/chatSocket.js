import { io } from 'socket.io-client';
import { getToken } from '../authService';

// Socket.IO needs a direct URL (not a Vite proxy path like /api/)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.VITE_BASE_URL?.startsWith('http') ? import.meta.env.VITE_BASE_URL : null)
  || 'https://tesipedia-backend-service-production.up.railway.app';

let socket = null;
// Track custom listeners so we can clean them up properly
const customListeners = new Map();

// 🔌 Conectar socket
export const connectSocket = (userId, isPublic = false) => {
  if (!userId) {
    console.error('No se puede conectar el socket: userId es undefined');
    return null;
  }

  if (socket) {
    // Clean up all custom listeners before disconnecting
    customListeners.forEach((cb, event) => socket.off(event, cb));
    customListeners.clear();
    socket.disconnect();
  }

  const token = getToken();
  const socketOptions = {
    auth: isPublic
      ? { userId, isPublic: true }
      : { userId, token: token || undefined, isPublic: false },
    transports: ['polling', 'websocket'], // polling first so httpOnly cookies are sent
    withCredentials: true, // send cookies (httpOnly JWT) with handshake
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 10000,
    // Don't auto-connect — let ChatPanel register listeners first
    autoConnect: false,
    forceNew: true,
    query: {
      userId,
      isPublic: isPublic ? 'true' : 'false'
    }
  };

  try {
    socket = io(SOCKET_URL, socketOptions);
  } catch (error) {
    console.error('Error al crear la conexión del socket:', error);
    return null;
  }

  socket.on('disconnect', (reason) => {
    console.log('Socket desconectado. Razón:', reason);
    if (reason === 'io server disconnect' || reason === 'transport close') {
      setTimeout(() => {
        if (socket) socket.connect();
      }, 1000);
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Error de conexión:', error.message);
    if (error.message.includes('rate limit')) {
      setTimeout(() => {
        if (socket) socket.connect();
      }, 5000);
    }
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Intento de reconexión #${attemptNumber}`);
    socket.auth = socketOptions.auth;
  });

  socket.on('reconnect_failed', () => {
    console.error('Reconexión fallida después de múltiples intentos');
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconectado después de ${attemptNumber} intentos`);
    if (isPublic) {
      socket.emit('joinPublicChat', userId);
    }
  });

  // Connect AFTER returning so ChatPanel can register its listeners first
  // Using setTimeout(0) to defer to next microtask
  setTimeout(() => {
    if (socket) socket.connect();
  }, 0);

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

// 📥 Escuchar eventos (removes only previously registered custom listener, not internal ones)
export const onSocketEvent = (event, callback) => {
  if (socket) {
    // Remove only the previous custom listener for this event
    const prevListener = customListeners.get(event);
    if (prevListener) {
      socket.off(event, prevListener);
    }
    customListeners.set(event, callback);
    socket.on(event, callback);
  }
};

// 🔎 Saber si el socket está conectado
export const isSocketConnected = () => {
  return socket && socket.connected;
};

// 🔎 Obtener instancia de socket
export const getSocket = () => socket;
