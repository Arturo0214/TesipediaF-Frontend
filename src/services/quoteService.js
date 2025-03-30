import axios from 'axios';

const API_URL = '/api/quotes/';

// Crear cotización
const createQuote = async (quoteData) => {
    const response = await axios.post(API_URL, quoteData);
    return response.data;
};

// Obtener cotizaciones del usuario
const getMyQuotes = async () => {
    const response = await axios.get(`${API_URL}my-quotes`);
    return response.data;
};

// Obtener cotización por ID
const getQuoteById = async (quoteId) => {
    const response = await axios.get(`${API_URL}${quoteId}`);
    return response.data;
};

const quoteService = {
    createQuote,
    getMyQuotes,
    getQuoteById,
};

export default quoteService; 