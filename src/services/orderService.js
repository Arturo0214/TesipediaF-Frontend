import axiosWithAuth from '../utils/axioswithAuth';

const API_URL = import.meta.env.VITE_BASE_URL || 'https://tesipedia-backend-service-production.up.railway.app';

// Crear orden a partir de una cotización
export const createOrderFromQuote = async (publicId) => {
    try {
        const response = await axiosWithAuth.post(`/orders/from-quote/${publicId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al crear la orden desde la cotización' };
    }
};

// Obtener órdenes del usuario
export const getMyOrders = async () => {
    try {
        const response = await axiosWithAuth.get('/orders/my-orders');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener las órdenes' };
    }
};

// Obtener una orden específica
export const getOrderById = async (orderId) => {
    try {
        const response = await axiosWithAuth.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener la orden' };
    }
};

// Obtener todas las órdenes (admin)
export const getAllOrders = async (page = 1, keyword = '') => {
    try {
        const response = await axiosWithAuth.get('/orders', {
            params: {
                page,
                keyword
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener las órdenes' };
    }
};

// Actualizar estado de la orden
export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axiosWithAuth.put(`/orders/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar el estado de la orden' };
    }
};

// Cancelar orden
export const cancelOrder = async (orderId) => {
    try {
        const response = await axiosWithAuth.post(`/orders/${orderId}/cancel`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al cancelar la orden' };
    }
};

// Obtener analytics de órdenes
export const getOrderAnalytics = async () => {
    try {
        const response = await axiosWithAuth.get('/orders/analytics');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener analytics de órdenes' };
    }
}; 