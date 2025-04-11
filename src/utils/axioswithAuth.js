import axios from 'axios';

const axiosWithAuth = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

const getAuthToken = () => {
  try {
    const cookies = document.cookie.split(';').reduce((cookiesObj, cookie) => {
      if (!cookie) return cookiesObj;
      const [name, value] = cookie.trim().split('=').map(c => c.trim());
      if (name && value) {
        cookiesObj[name] = value;
      }
      return cookiesObj;
    }, {});

    return cookies.jwt || '';
  } catch (error) {
    console.error('Error extracting JWT token:', error);
    return '';
  }
};

axiosWithAuth.interceptors.request.use((config) => {
  try {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method === 'get') {
      const timestamp = new Date().getTime();
      config.params = {
        ...config.params,
        _t: timestamp
      };
    }

    if (config.method === 'patch' || config.method === 'post') {
      config.headers['Content-Type'] = 'application/json';
    }

    if ((config.method === 'patch' || config.method === 'post') && !config.data) {
      config.data = {};
    }

    if (import.meta.env.MODE !== 'production') {
      console.log('Request:', config.method?.toUpperCase(), config.url);
    }

    return config;
  } catch (error) {
    console.error('Error in request interceptor:', error);
    return config;
  }
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

axiosWithAuth.interceptors.response.use(
  (response) => {
    if (import.meta.env.MODE !== 'production') {
      console.log('Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    console.error('Axios error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      data: error.response?.data
    });

    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Authentication error - Token expirado o inválido');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;

        case 403:
          console.error('Authorization error - Permisos insuficientes');
          break;

        case 404:
          console.error('Resource not found:', error.config.url);
          break;

        case 500:
          console.error('Server error:', error.response.data);
          break;
      }
    }

    else if (error.request) {
      console.error('Network error - No se recibió respuesta del servidor');
    }

    return Promise.reject(error);
  }
);

export default axiosWithAuth;