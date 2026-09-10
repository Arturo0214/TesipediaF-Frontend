import axiosWithAuth from '../utils/axioswithAuth';

// Métricas de la tienda de guías (embudo + pagos de Mercado Pago).
export const getStoreStats = async (days = 30) => {
  const res = await axiosWithAuth.get(`/guias/admin/stats?days=${days}`);
  return res.data;
};

export default { getStoreStats };
