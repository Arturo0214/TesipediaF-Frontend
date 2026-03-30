import axiosWithAuth from '../utils/axioswithAuth';

// axiosWithAuth ya tiene baseURL = VITE_BASE_URL, usar rutas relativas
const revenueService = {
  // Dashboard principal
  getDashboard: async (year, month) => {
    const params = {};
    if (year !== undefined) params.year = year;
    if (month !== undefined) params.month = month;
    const response = await axiosWithAuth.get('/revenue/dashboard', { params });
    return response.data;
  },

  // Listar gastos
  getExpenses: async (filters = {}) => {
    const response = await axiosWithAuth.get('/revenue/expenses', { params: filters });
    return response.data;
  },

  // Crear gasto
  createExpense: async (data) => {
    const response = await axiosWithAuth.post('/revenue/expenses', data);
    return response.data;
  },

  // Crear gastos en bulk
  createExpensesBulk: async (expenses) => {
    const response = await axiosWithAuth.post('/revenue/expenses/bulk', { expenses });
    return response.data;
  },

  // Actualizar gasto
  updateExpense: async (id, data) => {
    const response = await axiosWithAuth.put(`/revenue/expenses/${id}`, data);
    return response.data;
  },

  // Eliminar gasto
  deleteExpense: async (id) => {
    const response = await axiosWithAuth.delete(`/revenue/expenses/${id}`);
    return response.data;
  },

  // Auto-calcular costos de una venta
  autoCalculateCosts: async (paymentId) => {
    const response = await axiosWithAuth.post(`/revenue/auto-costs/${paymentId}`);
    return response.data;
  },

  // Costo por venta detallado
  getCostPerSale: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axiosWithAuth.get('/revenue/cost-per-sale', { params });
    return response.data;
  },

  // Categorias
  getCategories: async () => {
    const response = await axiosWithAuth.get('/revenue/categories');
    return response.data;
  },

  // Sincronizar costos desde APIs externas
  syncProviders: async (year, month) => {
    const response = await axiosWithAuth.post('/revenue/sync', { year, month });
    return response.data;
  },

  // Estado de configuracion de providers
  getSyncStatus: async () => {
    const response = await axiosWithAuth.get('/revenue/sync-status');
    return response.data;
  },

  // Campañas (Meta Ads + Google Ads) a nivel campaña
  getCampaigns: async (year, month) => {
    const params = {};
    if (year !== undefined) params.year = year;
    if (month !== undefined) params.month = month;
    const response = await axiosWithAuth.get('/revenue/campaigns', { params });
    return response.data;
  },

  // Uso/billing de servicios (Anthropic, Railway, Netlify)
  getUsage: async () => {
    const response = await axiosWithAuth.get('/revenue/usage');
    return response.data;
  },
};

export default revenueService;
