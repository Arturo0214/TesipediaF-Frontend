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
    // 1. Intentar desde cookie
    const cookies = document.cookie.split(';').reduce((cookiesObj, cookie) => {
      if (!cookie) return cookiesObj;
      const [name, value] = cookie.trim().split('=').map(c => c.trim());
      if (name && value) {
        cookiesObj[name] = value;
      }
      return cookiesObj;
    }, {});

    if (cookies.jwt) {
      return cookies.jwt;
    }

    // 2. Fallback: localStorage (móviles pueden borrar cookies)
    try {
      const stored = localStorage.getItem('jwt_backup');
      if (stored) {
        // Re-establecer cookie desde localStorage
        const isSecure = window.location.protocol === 'https:';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        let cookieConfig = 'path=/';
        if (isLocalhost) {
          cookieConfig += '; samesite=lax';
        } else {
          cookieConfig += '; samesite=none';
          if (isSecure) cookieConfig += '; secure';
        }
        document.cookie = `jwt=${stored}; max-age=${365 * 24 * 60 * 60}; ${cookieConfig}`;
        console.log('[Auth] Token restaurado desde localStorage en interceptor');
        return stored;
      }
    } catch (e) {
      // localStorage no disponible
    }

    return '';
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
        case 401: {
          // Solo cerrar sesión si NO estamos en login y NO hay token válido
          // Evitar logout en errores temporales de red
          const currentToken = getAuthToken();
          const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/register';
          const isAuthRoute = error.config?.url?.includes('/auth/');

          if (!isLoginPage && !isAuthRoute && !currentToken) {
            // No hay token — redirigir al login
            console.warn('Sin token de autenticación, redirigiendo a login');
            window.location.href = '/login';
          } else if (!isLoginPage && !isAuthRoute) {
            // Token existe pero el server lo rechazó — puede ser expirado
            // Intentar refrescar silenciosamente en vez de sacar al usuario
            console.warn('Token rechazado por el servidor (401) — sesión posiblemente expirada');
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