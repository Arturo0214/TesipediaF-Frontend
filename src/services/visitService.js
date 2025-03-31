import axios from '../utils/axioswithAuth';

const API_URL = '/visits';

const getVisits = async () => {
    const response = await axios.get(`${API_URL}/history`);
    return response.data;
};

const getVisitById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

const trackVisit = async (visitData) => {
    const response = await axios.post(`${API_URL}/track`, visitData, { withCredentials: true });
    return response.data;
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
