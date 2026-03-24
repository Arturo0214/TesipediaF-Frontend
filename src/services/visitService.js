import axios from '../utils/axioswithAuth';

const API_URL = '/visits';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://tesipedia-backend-service-production.up.railway.app';

const getVisits = async () => {
    const response = await axios.get(`${API_URL}/history`);
    return response.data;
};

const getVisitById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// trackVisit es público — NO usa axiosWithAuth para evitar redirects a /login en 401
const trackVisit = async (visitData) => {
    try {
        const url = BASE_URL.endsWith('/') ? `${BASE_URL}visits/track` : `${BASE_URL}/visits/track`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visitData),
        });
        if (!response.ok) return null;
        return response.json();
    } catch {
        return null;
    }
};

const updateVisit = async (id, visitData) => {
    const response = await axios.put(`${API_URL}/${id}`, visitData);
    return response.data;
};

const deleteVisit = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

const getVisitStats = async () => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
};

const getVisitAnalytics = async () => {
    const response = await axios.get(`${API_URL}/analytics`);
    return response.data;
};

export default {
    getVisits,
    getVisitById,
    trackVisit,
    updateVisit,
    deleteVisit,
    getVisitStats,
    getVisitAnalytics,
};
