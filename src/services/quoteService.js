import axiosWithAuth from '../utils/axioswithAuth'; // axios configurado con withCredentials: true

// 📝 Crear cotización pública (sin login)
const createQuote = async (quoteData) => {
    try {
        if (!quoteData) {
            throw new Error('No se proporcionaron datos para la cotización');
        }

        // Si quoteData no es una instancia de FormData, crear uno nuevo
        const formData = quoteData instanceof FormData ? quoteData : new FormData();

        // Si quoteData es un objeto regular, agregar cada campo al FormData
        if (!(quoteData instanceof FormData) && typeof quoteData === 'object') {
            Object.entries(quoteData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });
        }

        // Verificar que el FormData no esté vacío
        if (Array.from(formData.entries()).length === 0) {
            throw new Error('El formulario está vacío');
        }

        console.log('🚀 Enviando datos al servidor:', {
            formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
                key,
                value: value instanceof File ? `File: ${value.name}` : value
            }))
        });

        const response = await axiosWithAuth.post('/quotes', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('✅ Respuesta del servidor:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en createQuote:', error.response?.data || error);
        throw error;
    }
};

//  Obtener cotización pública por publicId
const getQuoteByPublicId = async (publicId) => {
    const response = await axiosWithAuth.get(`/quotes/public/${publicId}`);
    return response.data;
};

// 🔗 Asociar cotización a usuario autenticado
const linkQuoteToUser = async (publicId) => {
    const response = await axiosWithAuth.put(`/quotes/link/${publicId}`);
    return response.data;
};

// 🔐 Obtener mis cotizaciones (usuario logueado)
const getMyQuotes = async () => {
    const response = await axiosWithAuth.get('quotes/my-quotes');
    return response.data;
};

// 💾 Guardar cotización generada
const saveGeneratedQuote = async (quoteData) => {
    const response = await axiosWithAuth.post('/quotes/generated', quoteData);
    return response.data;
};

// 📋 Obtener todas las cotizaciones generadas (admin)
const getGeneratedQuotes = async () => {
    const response = await axiosWithAuth.get('/quotes/generated/all');
    return response.data;
};

// 🔄 Actualizar cotización generada
const updateGeneratedQuote = async (quoteId, updatedData) => {
    const response = await axiosWithAuth.put(`/quotes/generated/${quoteId}`, updatedData);
    return response.data;
};

// 🔄 Actualizar mi cotización (usuario autenticado)
const updateMyQuote = async (quoteId, updatedData) => {
    console.log('🔄 Enviando actualización de cotización:', {
        quoteId,
        formDataEntries: Array.from(updatedData.entries()).map(([key, value]) => ({
            key,
            value: value instanceof File ? `File: ${value.name}` : value
        }))
    });

    const response = await axiosWithAuth.put(`/quotes/my-quotes/${quoteId}`, updatedData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    console.log('✅ Respuesta del servidor:', response.data);
    return response.data;
};

// 📋 Obtener todas las cotizaciones (admin)
const getAllQuotes = async () => {
    const response = await axiosWithAuth.get('/quotes');
    return response.data;
};

// 🔍 Obtener cotización por ID (admin)
const getQuoteById = async (quoteId) => {
    const response = await axiosWithAuth.get(`/quotes/${quoteId}`);
    return response.data;
};

// 🔄 Actualizar cotización (admin)
const updateQuote = async (quoteId, updatedData) => {
    try {
        // Si updatedData no es una instancia de FormData, crear uno nuevo
        const formData = updatedData instanceof FormData ? updatedData : new FormData();

        // Si updatedData es un objeto regular, agregar cada campo al FormData
        if (!(updatedData instanceof FormData) && typeof updatedData === 'object') {
            Object.entries(updatedData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });
        }

        console.log('🔄 Enviando actualización:', {
            quoteId,
            formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
                key,
                value: value instanceof File ? `File: ${value.name}` : value
            }))
        });

        const response = await axiosWithAuth.put(`/quotes/${quoteId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('✅ Respuesta del servidor:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en updateQuote:', error.response?.data || error);
        throw error;
    }
};

// 🔄 Actualizar cotización pública (sin login)
const updatePublicQuote = async (publicId, updatedData) => {
    const response = await axiosWithAuth.put(`/quotes/public/${publicId}`, updatedData);
    return response.data;
};

// ❌ Eliminar cotización (admin)
const deleteQuote = async (quoteId) => {
    const response = await axiosWithAuth.delete(`/quotes/${quoteId}`);
    return response.data;
};

// 🔍 Buscar cotizaciones (admin)
const searchQuotes = async (query) => {
    const response = await axiosWithAuth.get(`/quotes/search?q=${encodeURIComponent(query)}`);
    return response.data;
};

// 💰 Verificar estado del pago como invitado
const checkGuestPaymentStatus = async (trackingToken) => {
    const response = await axiosWithAuth.get(`quotes/check-guest-payment/${trackingToken}`);
    return response.data;
};

// 💰 Calcular precio de cotización de venta
const calculateSalesQuotePrice = async (priceData) => {
    const response = await axiosWithAuth.post('/quotes/calculate-sales-price', priceData);
    return response.data;
};

// 💰 Verificar estado del pago normal
const checkPaymentStatus = async (sessionId) => {
    const response = await axiosWithAuth.get(`payments/status/${sessionId}`);
    return response.data;
};

const quoteService = {
    createQuote,
    getQuoteByPublicId,
    linkQuoteToUser,
    getMyQuotes,
    getAllQuotes,
    getQuoteById,
    updateQuote,
    updatePublicQuote,
    deleteQuote,
    searchQuotes,
    checkGuestPaymentStatus,
    calculateSalesQuotePrice,
    checkPaymentStatus,
    updateMyQuote,
    saveGeneratedQuote,
    getGeneratedQuotes,
    updateGeneratedQuote,
    deleteGeneratedQuote: async (quoteId) => {
        const response = await axiosWithAuth.delete(`/quotes/generated/${quoteId}`);
        return response.data;
    },
    getQuoteStats: async () => {
        const response = await axiosWithAuth.get('/quotes/stats');
        return response.data;
    }
};

export default quoteService;
