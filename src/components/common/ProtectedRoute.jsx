import React, { useEffect, useState, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, checkAdminStatus } from '../../features/auth/authSlice';

const ProtectedRoute = ({ requireAdmin }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user, isAuthenticated, isAdmin, isLoading } = useSelector(state => state.auth);
    const [authChecked, setAuthChecked] = useState(false);
    const hasVerified = useRef(false);

    useEffect(() => {
        // SIEMPRE verificar con el servidor al montar, sin importar qué diga Redux.
        // redux-persist puede tener isAuthenticated=true con una cookie expirada.
        if (hasVerified.current) return;
        hasVerified.current = true;

        const verifySession = async () => {
            try {
                await dispatch(getProfile()).unwrap();
            } catch (error) {
                // getProfile falló — cookie expirada o inexistente
                console.warn('Sesión no válida, redirigiendo a login');
            }
            setAuthChecked(true);
        };
        verifySession();
    }, [dispatch]);

    // Mostrar loading mientras se verifica con el servidor
    if (!authChecked || isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
        );
    }

    // Si no está autenticado DESPUÉS de verificar con el servidor, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
    }

    // Si requiere admin y no es admin, redirigir al dashboard
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/dashboard" state={{ from: { pathname: location.pathname } }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
