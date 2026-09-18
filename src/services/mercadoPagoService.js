import axiosWithAuth from '../utils/axioswithAuth';

// Métricas de la tienda de guías (embudo + pagos de Mercado Pago).
export const getStoreStats = async (days = 30) => {
  const res = await axiosWithAuth.get(`/guias/admin/stats?days=${days}`);
  return res.data;
};

// Leads de WhatsApp de la campaña de guías (embudo Sofia: explorando → link → pagada).
export const getWhatsappGuideLeads = async () => {
  const res = await axiosWithAuth.get('/guias/admin/whatsapp-leads');
  return res.data;
};

export default { getStoreStats, getWhatsappGuideLeads };
