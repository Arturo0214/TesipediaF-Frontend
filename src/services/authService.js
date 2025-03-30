import axios from 'axios';

// URL base de la API
const API_URL = 'http://localhost:8000/auth/'; // Cambia esto según tu configuración    

// Registrar un nuevo usuario
const register = async (userData) => {
    const response = await axios.post(`${API_URL}register`, userData);
    return response.data;
};

// Iniciar sesión
const login = async (userData) => {
    const response = await axios.post(`${API_URL}login`, userData);
    return response.data;
};

// Cerrar sesión
const logout = async () => {
    await axios.post(`${API_URL}logout`);
};

// Obtener perfil del usuario
const getProfile = async () => {
    const response = await axios.get(`${API_URL}profile`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Asegúrate de manejar el token correctamente
        },
    });
    return response.data;
};

// Exportar las funciones
const authService = {
    register,
    login,
    logout,
    getProfile,
};

export default authService;
