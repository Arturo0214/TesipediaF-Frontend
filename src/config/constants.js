// API URLs
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_URL;

// Other constants
export const DEFAULT_AVATAR = 'https://via.placeholder.com/150';
export const DEFAULT_BANNER = 'https://via.placeholder.com/1200x300';

// Socket events
export const SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    MESSAGE: 'message',
    JOIN_ROOM: 'joinRoom',
    LEAVE_ROOM: 'leaveRoom',
    ERROR: 'error'
};

// Message types
export const MESSAGE_TYPES = {
    TEXT: 'text',
    FILE: 'file',
    SYSTEM: 'system'
};

// Chat room types
export const CHAT_TYPES = {
    PUBLIC: 'public',
    PRIVATE: 'private',
    GROUP: 'group'
}; 