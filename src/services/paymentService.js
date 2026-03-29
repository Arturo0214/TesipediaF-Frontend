import axios from 'axios';
import axiosWithAuth from '../utils/axioswithAuth';

// axiosWithAuth ya tiene baseURL = VITE_BASE_URL, usar rutas relativas
// Para llamadas sin auth (guest), usar BASE_URL explícito
const BASE_URL = import.meta.env.VITE_BASE_URL || '';

// Crear orden a partir de una cotización
export const createOrderFromQuote = async (publicId) => {
    try {
        const response = await axiosWithAuth.post(`/orders/from-quote/${publicId}`);
        return response;
    } catch (error) {
        console.error('Error en createOrderFromQuote:', error);
        throw error;
    }
};

// Crear sesión de Stripe para pago normal
export const createStripeSession = async (orderId) => {
    try {
        const response = await axiosWithAuth.post('/payments/create-session', { orderId });
        return response;
    } catch (error) {
        console.error('Error en createStripeSession:', error);
        throw error;
    }
};

// Crear sesión de pago para invitado
export const createGuestPayment = async (paymentData) => {
    try {
        const response = await axiosWithAuth.post('/payments/guest-payment', paymentData);
        return response.data;
    } catch (error) {
        if (error.response?.data?.message?.includes('ya fue convertida')) {
            throw { message: 'Esta cotización ya fue pagada. Por favor, crea una nueva cotización.' };
        }
        throw error.response?.data || error;
    }
};

// Verificar estado de pago normal
export const checkPaymentStatus = async (sessionId) => {
    try {
        const response = await axiosWithAuth.get(`/payments/check-status/${sessionId}`);
        return {
            data: {
                status: response.data.status,
                orderId: response.data.orderId,
                updatedAt: response.data.updatedAt,
                ...response.data
            }
        };
    } catch (error) {
        console.error('Error en checkPaymentStatus:', error);
        throw error;
    }
};

// Verificar estado de pago de invitado
export const checkGuestPaymentStatus = async (trackingToken) => {
    try {
        const response = await axios.get(`${BASE_URL}payments/guest/check-status/${trackingToken}`);
        return {
            data: {
                status: response.data.status,
                orderId: response.data.orderId,
                updatedAt: response.data.updatedAt,
                ...response.data
            }
        };
    } catch (error) {
        console.error('Error en checkGuestPaymentStatus:', error);
        throw error;
    }
};

// Función auxiliar para obtener mensajes de estado
const getStatusMessage = (status) => {
    const messages = {
        'completed': 'Pago completado exitosamente',
        'paid': 'Pago completado exitosamente',
        'pending': 'Pago en proceso',
        'failed': 'El pago ha fallado',
        'cancelled': 'El pago fue cancelado',
        'not_found': 'Pago no encontrado',
    };
    return messages[status] || 'Estado desconocido';
};

// Obtener historial de pagos
export const getPaymentHistory = async () => {
    try {
        const response = await axiosWithAuth.get('/payments/history');
        return response.data;
    } catch (error) {
        console.error("❌ Error al obtener historial de pagos:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error.response?.data || { message: 'Error al obtener el historial de pagos' };
    }
};

// Obtener detalles de un pago específico
export const getPaymentDetails = async (paymentId) => {
    try {
        const response = await axiosWithAuth.get(`/payments/${paymentId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error al obtener detalles del pago:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al obtener los detalles del pago' };
    }
};

// Obtener detalles de una cotización
export const getQuoteDetails = async (publicId) => {
    try {
        const response = await axiosWithAuth.get(`/quotes/public/${publicId}`);
        return response;
    } catch (error) {
        console.error('Error en getQuoteDetails:', error);
        throw error;
    }
};

// Vincular una cotización a un usuario
export const linkQuoteToUser = async (publicId) => {
    try {
        const response = await axios.post(`${BASE_URL}quotes/link/${publicId}`);
        return response;
    } catch (error) {
        console.error('Error en linkQuoteToUser:', error);
        throw error;
    }
};

// Crear una sesión de pago para invitados
export const createGuestPaymentSession = async (quoteId) => {
    try {
        const response = await axios.post(`${BASE_URL}payments/guest/create-session`, { quoteId });
        return response;
    } catch (error) {
        console.error('Error en createGuestPaymentSession:', error);
        throw error;
    }
};

// Get sales performance by vendedor
export const getSalesByVendedor = async (period = 'all') => {
    try {
        const response = await axiosWithAuth.get('/payments/vendedor-sales', {
            params: { period }
        });
        return response.data;
    } catch (error) {
        console.error('Error en getSalesByVendedor:', error);
        throw error.response?.data || { message: 'Error al obtener ventas por vendedor' };
    }
};

const paymentService = {
    checkPaymentStatus,
    checkGuestPaymentStatus,
    createStripeSession,
    createGuestPaymentSession,
    getQuoteDetails,
    linkQuoteToUser,
    createOrderFromQuote,
    getSalesByVendedor
};

export default paymentService;
