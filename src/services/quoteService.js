import axiosWithAuth from '../utils/axioswithAuth'; // axios configurado con withCredentials: true

// 📝 Crear cotización pública (sin login)
const createQuote = async (quoteData) => {
    const response = await axiosWithAuth.post('quotes', quoteData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// 🔎 Obtener cotización pública por publicId
const getQuoteByPublicId = async (publicId) => {
    const response = await axiosWithAuth.get(`quotes/public/${publicId}`);
    return response.data;
};

// 🔗 Asociar cotización a usuario autenticado
const linkQuoteToUser = async (publicId) => {
    const response = await axiosWithAuth.put(`quotes/link/${publicId}`);
    return response.data;
};

// 🔐 Obtener mis cotizaciones (usuario logueado)
const getMyQuotes = async () => {
    const response = await axiosWithAuth.get('quotes/my-quotes');
    return response.data;
};

// 📋 Obtener todas las cotizaciones (admin)
const getAllQuotes = async () => {
    const response = await axiosWithAuth.get('quotes');
    return response.data;
};

// 🔍 Obtener cotización por ID (admin)
const getQuoteById = async (quoteId) => {
    const response = await axiosWithAuth.get(`quotes/${quoteId}`);
    return response.data;
};

// 🔄 Actualizar cotización (admin)
const updateQuote = async (quoteId, updatedData) => {
    const response = await axiosWithAuth.put(`quotes/${quoteId}`, updatedData);
    return response.data;
};

// 🔄 Actualizar cotización pública (sin login)
const updatePublicQuote = async (publicId, updatedData) => {
    const response = await axiosWithAuth.put(`quotes/public/${publicId}`, updatedData);
    return response.data;
};

// ❌ Eliminar cotización (admin)
const deleteQuote = async (quoteId) => {
    const response = await axiosWithAuth.delete(`quotes/${quoteId}`);
    return response.data;
};

// 🔍 Buscar cotizaciones
const searchQuotes = async (query) => {
    const response = await axiosWithAuth.get(`quotes/search?query=${encodeURIComponent(query)}`);
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
};

export default quoteService;
