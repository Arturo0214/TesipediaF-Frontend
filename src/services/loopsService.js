import axiosWithAuth from '../utils/axioswithAuth';

// 🔁 Métricas de los loops de negocio (precios, reactivación, objeciones)
const getLoopMetrics = async ({ fresh = false } = {}) => {
  const response = await axiosWithAuth.get(`/loops${fresh ? '?fresh=1' : ''}`);
  return response.data;
};

const loopsService = { getLoopMetrics };
export default loopsService;
