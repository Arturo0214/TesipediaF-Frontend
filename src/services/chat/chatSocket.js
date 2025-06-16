import { io } from 'socket.io-client';
import { getToken } from '../authService';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://tesipedia-backend-service-production.up.railway.app';

let socket = null;

// 🔌 Conectar socket
export const connectSocket = (userId, isPublic = false) => {
  if (socket) {
    console.log('Desconectando socket existente antes de crear uno nuevo');
    socket.disconnect();
  }

  console.log('Conectando socket con:', { userId, isPublic, token: isPublic ? 'N/A' : getToken() ? 'Token presente' : 'Token ausente' });

  const socketOptions = {
    auth: isPublic
      ? { userId, isPublic: true }
      : { userId, token: getToken(), isPublic: false },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 10000,
    autoConnect: true,
    forceNew: true,
    // Agregar query parameters para identificar mejor la conexión
    query: {
      userId,
      isPublic: isPublic ? 'true' : 'false'
    }
  };

  socket = io(VITE_BASE_URL, socketOptions);

  socket.on('connect', () => {
    console.log('Socket conectado exitosamente con ID:', socket.id);
    if (isPublic) {
      // Para usuarios públicos, unirse a una sala específica
      socket.emit('joinPublicChat', userId);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket desconectado. Razón:', reason);
    if (reason === 'io server disconnect' || reason === 'transport close') {
      // Reconectar automáticamente si la desconexión fue por el servidor o por problemas de transporte
      setTimeout(() => {
        console.log('Intentando reconexión automática...');
        socket.connect();
      }, 1000);
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Error de conexión:', error.message);
    if (error.message.includes('rate limit')) {
      console.log('Rate limit alcanzado, esperando antes de reconectar...');
      setTimeout(() => {
        socket.connect();
      }, 5000);
    }
  });

  socket.on('error', (error) => {
    console.error('Error de socket:', error);
    // Intentar reconectar en caso de error
    setTimeout(() => {
      console.log('Intentando reconexión después de error...');
      socket.connect();
    }, 2000);
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Intento de reconexión #${attemptNumber}`);
    // Actualizar las opciones de autenticación en cada intento
    socket.auth = socketOptions.auth;
  });

  socket.on('reconnect_failed', () => {
    console.error('Reconexión fallida después de múltiples intentos');
    // Notificar al usuario que debe recargar la página
    alert('La conexión se ha perdido. Por favor, recarga la página.');
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconectado después de ${attemptNumber} intentos`);
    if (isPublic) {
      // Volver a unirse a la sala pública después de reconectar
      socket.emit('joinPublicChat', userId);
    }
  });

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
