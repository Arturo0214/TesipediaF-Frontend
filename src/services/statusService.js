import axiosWithAuth from '../utils/axioswithAuth'; // axios con auth

// 🩺 Estado de salud del sistema (servidor Railway + Sofia/n8n)
const getSystemStatus = async () => {
  const response = await axiosWithAuth.get('/status');
  return response.data;
};

const statusService = { getSystemStatus };
export default statusService;
