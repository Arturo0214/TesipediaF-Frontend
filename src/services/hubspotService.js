import axiosWithAuth from '../utils/axioswithAuth';

// axiosWithAuth ya tiene baseURL = VITE_BASE_URL (/api/)
// Las rutas deben ser relativas al baseURL, NO incluir /api/ de nuevo
const BASE = '/api/v1/hubspot';

const hubspotService = {
  getSummary: async () => {
    const response = await axiosWithAuth.get(`${BASE}/summary`);
    return response.data;
  },

  getDeals: async (params = {}) => {
    const response = await axiosWithAuth.get(`${BASE}/deals`, { params });
    return response.data;
  },

  getContacts: async (params = {}) => {
    const response = await axiosWithAuth.get(`${BASE}/contacts`, { params });
    return response.data;
  },

  getPipelines: async () => {
    const response = await axiosWithAuth.get(`${BASE}/pipelines`);
    return response.data;
  },
};

export default hubspotService;
