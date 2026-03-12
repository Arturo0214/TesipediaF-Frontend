import axiosWithAuth from '../utils/axioswithAuth';

const BASE_URL = (import.meta.env.VITE_BASE_URL || '').replace(/\/+$/, '');

const hubspotService = {
  getSummary: async () => {
    const response = await axiosWithAuth.get(`${BASE_URL}/api/v1/hubspot/summary`);
    return response.data;
  },

  getDeals: async (params = {}) => {
    const response = await axiosWithAuth.get(`${BASE_URL}/api/v1/hubspot/deals`, { params });
    return response.data;
  },

  getContacts: async (params = {}) => {
    const response = await axiosWithAuth.get(`${BASE_URL}/api/v1/hubspot/contacts`, { params });
    return response.data;
  },

  getPipelines: async () => {
    const response = await axiosWithAuth.get(`${BASE_URL}/api/v1/hubspot/pipelines`);
    return response.data;
  },
};

export default hubspotService;
