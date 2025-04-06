import axios from 'axios';

const axiosWithAuth = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
});

axiosWithAuth.interceptors.request.use((config) => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('jwt='))
    ?.split('=')[1];

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('Request config:', {
    url: config.url,
    headers: config.headers,
    withCredentials: config.withCredentials
  });

  return config;
});

axiosWithAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

export default axiosWithAuth;