import axiosWithAuth from '../utils/axioswithAuth';

const API_URL = import.meta.env.VITE_API_URL;

const revenueService = {
  // Dashboard principal
  getDashboard: async (year, month) => {
    const params = {};
    if (year !== undefined) params.year = year;
    if (month !== undefined) params.month = month;
    const response = await axiosWithAuth.get(`${API_URL}/revenue/dashboard`, { params });
    return response.data;
  },

  // Listar gastos
  getExpenses: async (filters = {}) => {
    const response = await axiosWithAuth.get(`${API_URL}/revenue/expenses`, { params: filters });
    return response.data;
  },

  // Crear gasto
  createExpense: async (data) => {
    const response = await axiosWithAuth.post(`${API_URL}/revenue/expenses`, data);
    return response.data;
  },

  // Crear gastos en bulk
  createExpensesBulk: async (expenses) => {
    const response = await axiosWithAuth.post(`${API_URL}/revenue/expenses/bulk`, { expenses });
    return response.data;
  },

  // Actualizar gasto
  updateExpense: async (id, data) => {
    const response = await axiosWithAuth.put(`${API_URL}/revenue/expenses/${id}`, data);
    return response.data;
  },

  // Eliminar gasto
  deleteExpense: async (id) => {
    const response = await axiosWithAuth.delete(`${API_URL}/revenue/expenses/${id}`);
    return response.data;
  },

  // Auto-calcular costos de una venta
  autoCalculateCosts: async (paymentId) => {
    const response = await axiosWithAuth.post(`${API_URL}/revenue/auto-costs/${paymentId}`);
    return response.data;
  },

  // Costo por venta detallado
  getCostPerSale: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axiosWithAuth.get(`${API_URL}/revenue/cost-per-sale`, { params });
    return response.data;
  },

  // Categorías
  getCategories: async () => {
    const response = await axiosWithAuth.get(`${API_URL}/revenue/categories`);
    return response.data;
  },

  // Sincronizar costos desde APIs externas
  syncProviders: async (year, month) => {
    const response = await axiosWithAuth.post(`${API_URL}/revenue/sync`, { year, month });
    return response.data;
  },

  // Estado de configuración de providers
  getSyncStatus: async () => {
    const response = await axiosWithAuth.get(`${API_URL}/revenue/sync-status`);
    return response.data;
  },
};

export default revenueService;
