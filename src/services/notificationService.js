import axios from 'axios';
import axiosWithAuth from '../utils/axioswithAuth';

// Configuración base para las peticiones
const notificationAPI = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api`, // No se cambia porque ya está bien
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // ⏳ 10 segundos máximo para evitar congelamientos
});

// Interceptor para añadir el token de autenticación automáticamente
notificationAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Error en interceptor de petición:', error);
        return Promise.reject(error);
    }
);

// axiosWithAuth ya tiene baseURL = VITE_BASE_URL, usar rutas relativas

let lastFetchTime = 0;
const MINIMUM_INTERVAL = 5000; // 5 segundos entre solicitudes

const getNotifications = async () => {
    const now = Date.now();

    // Si no ha pasado el tiempo mínimo desde la última solicitud, no hacer nada
    if (now - lastFetchTime < MINIMUM_INTERVAL) {
        return null;
    }

    try {
        lastFetchTime = now;
        const response = await axiosWithAuth.get('/notifications');
        return response.data;
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        throw error;
    }
};

const markAsRead = async (notificationId) => {
    try {
        const response = await axiosWithAuth.put(`/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        throw error;
    }
};

const markAllAsRead = async () => {
    try {
        const response = await axiosWithAuth.put('/notifications/read-all');
        return response.data;
    } catch (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
        throw error;
    }
};

/**
 * Servicio para gestionar las notificaciones
 */
const notificationService = {
    // 🔔 Obtener las notificaciones del usuario actual
    getMyNotifications: async (page = 1, limit = 20) => {
        try {
            const response = await notificationAPI.get(`/notifications?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error en getMyNotifications:', error);
            throw error.response?.data || { message: 'Error al obtener notificaciones' };
        }
    },

    // 🔔 Obtener las notificaciones del administrador
    getAdminNotifications: async (page = 1, limit = 20) => {
        try {
            const response = await notificationAPI.get(`/notifications/admin?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error en getAdminNotifications:', error);
            throw error.response?.data || { message: 'Error al obtener notificaciones de administrador' };
        }
    },

    // 🔔 Marcar una notificación como leída
    markAsRead: async (id) => {
        try {
            const response = await notificationAPI.patch(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error en markAsRead (ID: ${id}):`, error);
            throw error.response?.data || { message: 'Error al marcar la notificación como leída' };
        }
    },

    // 🔔 Marcar todas las notificaciones como leídas
    markAllAsRead: async () => {
        try {
            const response = await notificationAPI.patch('/notifications/mark-all-read');
            return response.data;
        } catch (error) {
            console.error('❌ Error en markAllAsRead:', error);
            throw error.response?.data || { message: 'Error al marcar todas las notificaciones como leídas' };
        }
    },

    // 🔔 Eliminar una notificación
    deleteNotification: async (id) => {
        try {
            const response = await notificationAPI.delete(`/notifications/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error en deleteNotification (ID: ${id}):`, error);
            throw error.response?.data || { message: 'Error al eliminar la notificación' };
        }
    },

    // 🔔 Obtener estadísticas de notificaciones
    getNotificationStats: async () => {
        try {
            const response = await notificationAPI.get('/notifications/stats');
            return response.data;
        } catch (error) {
            console.error('❌ Error en getNotificationStats:', error);
            throw error.response?.data || { message: 'Error al obtener estadísticas de notificaciones' };
        }
    },

    // 🔔 Crear una nueva notificación (solo admin)
    createNotification: async (notificationData) => {
        try {
            const response = await notificationAPI.post('/notifications', notificationData);
            return response.data;
        } catch (error) {
            console.error('❌ Error en createNotification:', error);
            throw error.response?.data || { message: 'Error al crear la notificación' };
        }
    },

    getNotifications,
    markAsRead,
    markAllAsRead
};

export default notificationService;
