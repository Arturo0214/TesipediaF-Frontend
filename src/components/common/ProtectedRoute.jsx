import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, checkAdminStatus } from '../../features/auth/authSlice';

const ProtectedRoute = ({ requireAdmin }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user, isAuthenticated, isAdmin, isLoading } = useSelector(state => state.auth);

    // On component mount, check if there's a token and fetch user profile if needed
    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            // Use the existing token to try getting the profile
            dispatch(getProfile());
        }

        // Make sure we check admin status if user is authenticated
        if (isAuthenticated && user) {
            dispatch(checkAdminStatus());
        }
    }, [dispatch, isAuthenticated, isLoading, user]);

    // Show a loading state while checking authentication
    if (isLoading) {
        return <div className="text-center py-5">Verificando autenticación...</div>;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        // Save the location they were trying to access for redirecting after login
        return <Navigate to="/login" state={{ from: location.pathname }} />;
    }

    // For admin routes, check admin status
    if (requireAdmin) {
        // Use both the user role check and the isAdmin flag for robustness
        if (!isAdmin || user?.role !== 'admin') {
            console.error('Access denied: Admin privileges required');
            return <Navigate to="/dashboard" />;
        }
    }

    // User has permission to access the route
    return <Outlet />;
};

export default ProtectedRoute; 