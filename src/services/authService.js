import axiosWithAuth from '../utils/axioswithAuth';

// Obtener token de las cookies
export const getToken = () => {
    const cookies = document.cookie;
    console.log('Cookies disponibles:', cookies);

    const tokenCookie = cookies
        .split('; ')
        .find(row => row.startsWith('jwt='));

    console.log('Token cookie encontrada:', tokenCookie);

    const token = tokenCookie?.split('=')[1];
    console.log('Token extraído:', token ? 'Token encontrado' : 'Token no encontrado');

    return token || null; // Asegurar que se devuelva null si no se encuentra el token
};

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

// Registrar un nuevo usuario
const register = async (userData) => {
    const response = await axiosWithAuth.post('/auth/register', userData, { withCredentials: true });
    return response.data; // Retorna el usuario
};

// Iniciar sesión
const login = async (userData) => {
    try {
        const response = await axiosWithAuth.post('/auth/login', userData, { withCredentials: true });

        // Verificar si la respuesta contiene el token
        if (response.data.token) {
            // Establecer la cookie con el token
            const cookieConfig = getCookieConfig();
            const cookieString = `jwt=${response.data.token}; ${cookieConfig}`;

            document.cookie = cookieString;
            console.log('[Auth Debug] Cookie establecida:', cookieString);
        }

        return response.data;
    } catch (error) {
        console.error('[Auth Debug] Error en login:', error);
        throw error.response?.data || error;
    }
};

// Cerrar sesión
const logout = async () => {
    try {
        const response = await axiosWithAuth.post('/auth/logout', {}, { withCredentials: true });

        // Limpiar la cookie JWT
        const cookieConfig = getCookieConfig();
        const cookieString = `jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${cookieConfig}`;

        document.cookie = cookieString;
        console.log('[Auth Debug] Cookie JWT eliminada');

        return response.data;
    } catch (error) {
        console.error('[Auth Debug] Error en logout:', error);
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
