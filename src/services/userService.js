import axiosWithAuth from '../utils/axioswithAuth';

// Obtener todos los usuarios (admin)
export const getUsers = async () => {
    try {
        const response = await axiosWithAuth.get('/admin/users');
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Obtener usuario por ID (admin)
export const getUserById = async (id) => {
    try {
        const response = await axiosWithAuth.get(`/admin/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user with ID ${id}:`, error);
        throw error;
    }
};

// Actualizar usuario (admin)
export const updateUser = async (id, userData) => {
    try {
        const response = await axiosWithAuth.put(`/admin/users/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error(`Error updating user with ID ${id}:`, error);
        throw error;
    }
};

// Eliminar usuario (admin)
export const deleteUser = async (id) => {
    try {
        const response = await axiosWithAuth.delete(`/admin/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting user with ID ${id}:`, error);
        throw error;
    }
};

// Actualizar rol de usuario (admin)
export const updateUserRole = async (id, role) => {
    try {
        const response = await axiosWithAuth.put(`/users/${id}/role`, { role });
        return response.data;
    } catch (error) {
        console.error(`Error updating role for user with ID ${id}:`, error);
        throw error;
    }
};

// Actualizar estado de usuario (admin)
export const updateUserStatus = async (id, isActive) => {
    try {
        const response = await axiosWithAuth.put(`/users/${id}/status`, { isActive });
        return response.data;
    } catch (error) {
        console.error(`Error updating status for user with ID ${id}:`, error);
        throw error;
    }
};

// Obtener perfil del usuario actual
export const getUserProfile = async () => {
    try {
        const response = await axiosWithAuth.get('/users/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Actualizar perfil del usuario actual
export const updateUserProfile = async (userData) => {
    try {
        const response = await axiosWithAuth.put('/users/profile', userData);
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};
