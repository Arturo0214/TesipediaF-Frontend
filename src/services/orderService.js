import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Obtener orden por ID
export const getOrderById = async (orderId) => {
    try {
        const response = await axios.get(`${API_URL}/orders/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener la orden' };
    }
};

// Obtener todas las órdenes (admin)
export const getAllOrders = async (page = 1, keyword = '') => {
    try {
        const response = await axios.get(`${API_URL}/orders`, {
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
        const response = await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar el estado de la orden' };
    }
};

// Cancelar orden
export const cancelOrder = async (orderId) => {
    try {
        const response = await axios.post(`${API_URL}/orders/${orderId}/cancel`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al cancelar la orden' };
    }
};

// Obtener analytics de órdenes
export const getOrderAnalytics = async () => {
    try {
        const response = await axios.get(`${API_URL}/orders/analytics`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener analytics de órdenes' };
    }
}; 