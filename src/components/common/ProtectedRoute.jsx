import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, checkAdminStatus } from '../../features/auth/authSlice';

const ProtectedRoute = ({ requireAdmin }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user, isAuthenticated, isAdmin, isLoading } = useSelector(state => state.auth);
    // Controla si ya se intentó verificar la sesión (getProfile).
    // Mientras no se haya verificado, mostramos loading en vez de redirigir.
    const [authChecked, setAuthChecked] = useState(isAuthenticated);

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated && !isLoading) {
                try {
                    await dispatch(getProfile()).unwrap();
                } catch (error) {
                    // getProfile falló — el usuario NO tiene sesión válida
                    console.error('Error al obtener el perfil:', error);
                }
            }
            setAuthChecked(true);
        };
        checkAuth();
    }, [dispatch, isAuthenticated, isLoading]);

    // Mostrar loading mientras se verifica la autenticación
    // IMPORTANTE: No redirigir hasta que authChecked sea true
    if (!authChecked || isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
        );
    }

    // Si no está autenticado DESPUÉS de verificar, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
    }

    // Si requiere admin y no es admin, redirigir al dashboard
    if (requireAdmin && !isAdmin) {
        console.error('Acceso denegado: Se requieren privilegios de administrador');
        return <Navigate to="/dashboard" state={{ from: { pathname: location.pathname } }} replace />;
    }

    // Si todo está bien, mostrar el contenido
    return <Outlet />;
};

export default ProtectedRoute;
