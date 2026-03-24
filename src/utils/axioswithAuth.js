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
    // 1. Intentar desde cookie (funciona si NO es httpOnly)
    const match = document.cookie.match(/(?:^|; )jwt=([^;]*)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }

    // 2. Intentar desde Redux persist (el login guarda token en user)
    const persistAuth = localStorage.getItem('persist:auth');
    if (persistAuth) {
      const parsed = JSON.parse(persistAuth);
      if (parsed.user) {
        const user = JSON.parse(parsed.user);
        if (user?.token) return user.token;
      }
    }

    // 3. Fallback: jwt_backup en localStorage
    const backup = localStorage.getItem('jwt_backup');
    if (backup) return backup;

    return '';
  } catch (error) {
    if (import.meta.env.MODE !== 'production') {
      console.error('Error extracting JWT token:', error);
    }
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
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      } else {
        delete config.headers['Content-Type'];
      }
    }

    if ((config.method === 'patch' || config.method === 'post') && !config.data) {
      config.data = {};
    }

    if (import.meta.env.MODE !== 'production') {
      console.log('Request:', config.method?.toUpperCase(), config.url.replace(/jwt[^&]*/g, 'jwt=***'));
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
      console.log('Response:', response.status, response.config.url.replace(/jwt[^&]*/g, 'jwt=***'));
    }
    return response;
  },
  async (error) => {
    if (import.meta.env.MODE !== 'production') {
      console.error('Axios error:', {
        status: error.response?.status,
        url: error.config?.url.replace(/jwt[^&]*/g, 'jwt=***'),
        method: error.config?.method,
        message: error.message,
        data: error.response?.data
      });
    }

    if (error.response) {
      switch (error.response.status) {
        case 401: {
          // NOTA: La cookie JWT es httpOnly, así que getAuthToken() NO puede leerla.
          // NO hacer hard redirect (window.location.href) porque borra el estado de Redux.
          // ProtectedRoute se encarga de redirigir al login cuando getProfile() falla.
          const isAuthRoute = error.config?.url?.includes('/auth/');
          if (!isAuthRoute) {
            console.warn('401 — sesión posiblemente expirada. ProtectedRoute manejará la redirección.');
          }
          break;
        }

        case 403:
          console.error('Authorization error - Permisos insuficientes');
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/dashboard';
          }
          break;

        case 404:
          console.error('Resource not found:', error.config.url);
          break;

        default:
          console.error('Error en la petición:', error.message);
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      console.error('Error al configurar la petición:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosWithAuth;