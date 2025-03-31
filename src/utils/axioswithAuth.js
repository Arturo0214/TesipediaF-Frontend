import axios from 'axios';

const axiosWithAuth = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

axiosWithAuth.interceptors.request.use((config) => {
  return config;
});

export default axiosWithAuth;