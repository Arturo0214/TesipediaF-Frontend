import axiosWithAuth from '../utils/axioswithAuth';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Registrar un nuevo usuario
const register = async (userData) => {
    const response = await axiosWithAuth.post(`${BASE_URL}/auth/register`, userData, { withCredentials: true });
    return response.data; // Retorna el usuario
};

// Iniciar sesión
const login = async (userData) => {
    const response = await axiosWithAuth.post(`${BASE_URL}/auth/login`, userData, { withCredentials: true });
    return { user: response.data }; // Retorna objeto para usar en Redux
};

// Cerrar sesión
const logout = async () => {
    const response = await axiosWithAuth.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
    return response.data; // Asegúrate de que el backend maneje esta solicitud correctamente
};

// Obtener perfil del usuario (autenticado vía cookie)
const getProfile = async () => {
    const response = await axiosWithAuth.get(`${BASE_URL}/auth/profile`, { withCredentials: true });
    return response.data;
};

// Restablecer contraseña
const resetPassword = async (token, password) => {
    const response = await axiosWithAuth.post(`${BASE_URL}/auth/reset-password`, { token, password }, { withCredentials: true });
    return response.data;
};

// Enviar correo de restablecimiento de contraseña
const forgotPassword = async (email) => {
    const response = await axiosWithAuth.post(`${BASE_URL}/auth/forgot-password`, { email }, { withCredentials: true });
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    getProfile,
    resetPassword,
    forgotPassword,
};

export default authService;
