import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, checkAdminStatus } from '../../features/auth/authSlice';

const ProtectedRoute = ({ requireAdmin }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user, isAuthenticated, isAdmin, isLoading } = useSelector(state => state.auth);

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated && !isLoading) {
                try {
                    await dispatch(getProfile()).unwrap();
                } catch (error) {
                    console.error('Error al obtener el perfil:', error);
                }
            }
        };
        checkAuth();
    }, [dispatch, isAuthenticated, isLoading]);

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return <div className="text-center py-5">Verificando autenticación...</div>;
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Si requiere admin y no es admin, redirigir al dashboard
    if (requireAdmin && !isAdmin) {
        console.error('Acceso denegado: Se requieren privilegios de administrador');
        return <Navigate to="/dashboard" state={{ from: location.pathname }} replace />;
    }

    // Si todo está bien, mostrar el contenido
    return <Outlet />;
};

export default ProtectedRoute; 