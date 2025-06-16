import io from 'socket.io-client';
import { SOCKET_URL } from '../../config/constants';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const connectSocket = (userId, isPublic = false, token = null) => {
    if (socket?.connected) {
        console.log('Socket ya está conectado');
        return socket;
    }

    // Desconectar socket existente si hay uno
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    const connectionOptions = {
        query: {
            userId,
            isPublic: isPublic.toString()
        },
        auth: token ? { token } : undefined,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
    };

    console.log('Conectando socket con opciones:', {
        url: SOCKET_URL,
        userId,
        isPublic,
        hasToken: !!token
    });

    try {
        socket = io(SOCKET_URL, connectionOptions);

        socket.on('connect', () => {
            console.log('Socket conectado exitosamente');
            reconnectAttempts = 0;
        });

        socket.on('connect_error', (error) => {
            console.error('Error de conexión socket:', error.message);
            reconnectAttempts++;

            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                console.error('Máximo número de intentos de reconexión alcanzado');
                socket.disconnect();
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket desconectado:', reason);
        });

        socket.on('error', (error) => {
            console.error('Error en socket:', error);
        });

        return socket;
    } catch (error) {
        console.error('Error al crear conexión socket:', error);
        return null;
    }
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        reconnectAttempts = 0;
        console.log('Socket desconectado manualmente');
    }
};

export const emitSocketEvent = (event, data) => {
    if (socket?.connected) {
        socket.emit(event, data);
    } else {
        console.warn('No se puede emitir evento: socket no conectado');
    }
};

export const onSocketEvent = (event, callback) => {
    if (socket) {
        socket.on(event, callback);
    } else {
        console.warn('No se puede escuchar evento: socket no inicializado');
    }
};

export const isSocketConnected = () => {
    return socket?.connected || false;
}; 