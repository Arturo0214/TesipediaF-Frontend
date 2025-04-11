import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

// Crear sesión de Stripe para pago normal
export const createStripeSession = async (orderId) => {
    try {
        const response = await axios.post(`${API_URL}/payments/create-session`, { orderId });
        return response.data;
    } catch (error) {
        console.error("❌ Error al crear sesión de Stripe:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error.response?.data || { message: 'Error al crear la sesión de pago' };
    }
};

// Crear sesión de pago para invitado
export const createGuestPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_URL}/payments/guest-payment`, paymentData);
        const stripeUrl = response.data.url || response.data.sessionUrl;

        // Asegurarse de que la respuesta tenga el formato esperado
        const formattedResponse = {
            ...response.data,
            url: stripeUrl,
            sessionUrl: stripeUrl
        };

        return formattedResponse;
    } catch (error) {
        console.error("❌ Error al crear pago de invitado:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // Mejorar el mensaje de error basado en el tipo de error
        let errorMessage = 'Error al procesar el pago de invitado';
        if (error.response?.status === 400) {
            errorMessage = error.response.data.message || 'Datos de pago inválidos';
        } else if (error.response?.status === 404) {
            errorMessage = 'Recurso no encontrado';
        } else if (error.response?.status === 500) {
            errorMessage = 'Error en el servidor al procesar el pago';
        }

        throw { message: errorMessage, details: error.response?.data };
    }
};

// Verificar estado de pago normal
export const checkPaymentStatus = async (sessionId) => {
    try {
        const response = await axios.get(`${API_URL}/payments/status/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error al verificar estado de pago:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error.response?.data || { message: 'Error al verificar el estado del pago' };
    }
};

// Verificar estado de pago de invitado
export const checkGuestPaymentStatus = async (trackingToken) => {
    try {
        if (!trackingToken) {
            console.error("❌ Token de seguimiento no proporcionado");
            throw new Error("Token de seguimiento no proporcionado");
        }

        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await axios.get(`${API_URL}/payments/guest-status/${trackingToken}?t=${timestamp}`);

        // Validar y formatear la respuesta
        if (!response.data || typeof response.data.status !== 'string') {
            console.warn("⚠️ Respuesta inesperada del servidor");
            return {
                status: 'unknown',
                message: 'Formato de respuesta inválido'
            };
        }

        // Asegurarse de que todos los campos necesarios estén presentes
        const formattedResponse = {
            status: response.data.status,
            amount: response.data.amount || 0,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt,
            message: getStatusMessage(response.data.status)
        };

        return formattedResponse;
    } catch (error) {
        console.error("❌ Error al verificar estado de pago de invitado:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        if (error.response?.status === 404) {
            return {
                status: 'not_found',
                message: 'Pago no encontrado'
            };
        }

        if (error.response?.status === 429) {
            return {
                status: 'rate_limited',
                message: 'Demasiadas solicitudes. Por favor, espera un momento.'
            };
        }

        throw {
            message: error.response?.data?.message || 'Error al verificar el estado del pago de invitado',
            status: error.response?.status || 500
        };
    }
};

// Función auxiliar para obtener mensajes de estado
const getStatusMessage = (status) => {
    const messages = {
        'completed': 'Pago completado exitosamente',
        'pending': 'Pago en proceso',
        'failed': 'El pago ha fallado',
        'not_found': 'Pago no encontrado',
        'unknown': 'Estado desconocido'
    };
    return messages[status] || 'Estado no reconocido';
};

// Obtener historial de pagos
export const getPaymentHistory = async () => {
    try {
        const response = await axios.get(`${API_URL}/payments/history`);
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
        const response = await axios.get(`${API_URL}/payments/${paymentId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error al obtener detalles del pago:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al obtener los detalles del pago' };
    }
};
