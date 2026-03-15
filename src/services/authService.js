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

// Guardar token en localStorage como respaldo
const saveTokenBackup = (token) => {
    try {
        localStorage.setItem('jwt_backup', token);
    } catch (e) {
        console.warn('[Auth] No se pudo guardar backup en localStorage:', e);
    }
};

// Limpiar token de localStorage
const clearTokenBackup = () => {
    try {
        localStorage.removeItem('jwt_backup');
    } catch (e) {
        console.warn('[Auth] No se pudo limpiar localStorage:', e);
    }
};

// Obtener token de las cookies (con fallback a localStorage para móviles)
export const getToken = () => {
    // Primero intentar desde cookie
    const match = document.cookie.match(/(?:^|; )jwt=([^;]*)/);
    if (match && match[1]) {
        const token = decodeURIComponent(match[1]);
        // Sincronizar con localStorage por si la cookie se pierde después
        saveTokenBackup(token);
        return token;
    }
    // Fallback: localStorage (navegadores móviles pueden borrar cookies)
    try {
        const stored = localStorage.getItem('jwt_backup');
        if (stored) {
            // Re-establecer la cookie desde localStorage
            const cookieConfig = getCookieConfig();
            document.cookie = `jwt=${stored}; max-age=${365 * 24 * 60 * 60}; ${cookieConfig}`;
            console.log('[Auth] Token restaurado desde localStorage a cookie');
            return stored;
        }
    } catch (e) {
        console.warn('[Auth] No se pudo acceder a localStorage:', e);
    }
    return null;
};

// Registrar un nuevo usuario
const register = async (userData) => {
    const response = await axiosWithAuth.post('/auth/register', userData, { withCredentials: true });

    // Si el backend devuelve token, guardarlo
    if (response.data.token) {
        const cookieConfig = getCookieConfig();
        document.cookie = `jwt=${response.data.token}; max-age=${365 * 24 * 60 * 60}; ${cookieConfig}`;
        saveTokenBackup(response.data.token);
        console.log('[Auth] Token guardado tras registro');
    }

    return response.data;
};

// Iniciar sesión
const login = async (userData) => {
    try {
        const response = await axiosWithAuth.post('/auth/login', userData, { withCredentials: true });

        // Verificar si la respuesta contiene el token
        if (response.data.token) {
            // Establecer la cookie con max-age de 1 año
            const cookieConfig = getCookieConfig();
            const cookieString = `jwt=${response.data.token}; max-age=${365 * 24 * 60 * 60}; ${cookieConfig}`;

            document.cookie = cookieString;
            // Guardar backup en localStorage para móviles
            saveTokenBackup(response.data.token);
            console.log('[Auth] Token guardado en cookie + localStorage');
        }

        return response.data;
    } catch (error) {
        console.error('[Auth] Error en login:', error);
        throw error.response?.data || error;
    }
};

// Cerrar sesión
const logout = async () => {
    try {
        const response = await axiosWithAuth.post('/auth/logout', {}, { withCredentials: true });

        // Limpiar la cookie JWT
        const cookieConfig = getCookieConfig();
        document.cookie = `jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; ${cookieConfig}`;

        // Limpiar backup de localStorage
        clearTokenBackup();

        console.log('[Auth] Sesión cerrada — cookie y localStorage limpiados');

        return response.data;
    } catch (error) {
        // Incluso si falla el request, limpiar localmente
        const cookieConfig = getCookieConfig();
        document.cookie = `jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; ${cookieConfig}`;
        clearTokenBackup();

        console.error('[Auth] Error en logout:', error);
        throw error.response?.data || error;
    }
};

// Obtener perfil del usuario (autenticado vía cookie)
const getProfile = async () => {
    try {
        const response = await axiosWithAuth.get('/auth/profile', { withCredentials: true });
        console.log('Perfil de usuario obtenido:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
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
