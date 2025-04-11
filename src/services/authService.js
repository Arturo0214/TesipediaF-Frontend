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

    return token;
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
        // La respuesta del backend ya contiene el usuario directamente
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Cerrar sesión
const logout = async () => {
    const response = await axiosWithAuth.post('/auth/logout', {}, { withCredentials: true });
    return response.data;
};

// Obtener perfil del usuario (autenticado vía cookie)
const getProfile = async () => {
    const response = await axiosWithAuth.get('/auth/profile', { withCredentials: true });
    return response.data;
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
