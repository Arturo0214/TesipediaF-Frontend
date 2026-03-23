import axiosWithAuth from '../utils/axioswithAuth';

// Función auxiliar para configurar cookies según el entorno
const getCookieConfig = () => {
    const isSecure = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    let cookieString = 'path=/';

    if (isLocalhost) {
        // En desarrollo local
        cookieString += '; samesite=lax';
    } else {
        // En producción
        cookieString += '; samesite=none';
        if (isSecure) {
            cookieString += '; secure';
        }
    }

    return cookieString;
};


// Obtener token de las cookies
export const getToken = () => {
    // Obtener token desde cookie (httpOnly en el servidor)
    const match = document.cookie.match(/(?:^|; )jwt=([^;]*)/);
    if (match && match[1]) {
        return decodeURIComponent(match[1]);
    }
    return null;
};

// Registrar un nuevo usuario
const register = async (userData) => {
    const response = await axiosWithAuth.post('/auth/register', userData, { withCredentials: true });

    // Token será establecido por el servidor en httpOnly cookie
    if (import.meta.env.MODE !== 'production') {
        console.log('[Auth] Registro completado - token establecido vía httpOnly cookie');
    }

    return response.data;
};

// Iniciar sesión
const login = async (userData) => {
    try {
        const response = await axiosWithAuth.post('/auth/login', userData, { withCredentials: true });

        // Token será establecido por el servidor en httpOnly cookie
        if (import.meta.env.MODE !== 'production') {
            console.log('[Auth] Login exitoso - token establecido vía httpOnly cookie');
        }

        return response.data;
    } catch (error) {
        if (import.meta.env.MODE !== 'production') {
            console.error('[Auth] Error en login:', error);
        }
        throw error.response?.data || error;
    }
};

// Cerrar sesión
const logout = async () => {
    try {
        const response = await axiosWithAuth.post('/auth/logout', {}, { withCredentials: true });

        // El servidor limpiará el httpOnly cookie
        // También limpiar cualquier cookie accesible desde JS (fallback)
        const cookieConfig = getCookieConfig();
        document.cookie = `jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; ${cookieConfig}`;

        if (import.meta.env.MODE !== 'production') {
            console.log('[Auth] Sesión cerrada - cookie limpiada por servidor');
        }

        return response.data;
    } catch (error) {
        // Incluso si falla el request, limpiar localmente
        const cookieConfig = getCookieConfig();
        document.cookie = `jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; ${cookieConfig}`;

        if (import.meta.env.MODE !== 'production') {
            console.error('[Auth] Error en logout:', error);
        }
        // No lanzar error — logout local es suficiente
        return { message: 'Sesión cerrada localmente' };
    }
};

// Obtener perfil del usuario (autenticado vía cookie)
const getProfile = async () => {
    try {
        const response = await axiosWithAuth.get('/auth/profile', { withCredentials: true });
        if (import.meta.env.MODE !== 'production') {
            console.log('Perfil de usuario obtenido');
        }
        return response.data;
    } catch (error) {
        if (import.meta.env.MODE !== 'production') {
            console.error('Error al obtener el perfil:', error);
        }
        throw error;
    }
};

// Restablecer contraseña
const resetPassword = async (token, password) => {
    const response = await axiosWithAuth.post('/auth/reset-password', { token, password }, { withCredentials: true });
    return response.data;
};

// Enviar correo de restablecimiento de contraseña
const forgotPassword = async (email) => {
    const response = await axiosWithAuth.post('/auth/forgot-password', { email }, { withCredentials: true });
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    getProfile,
    resetPassword,
    forgotPassword,
    getToken
};

export default authService;
