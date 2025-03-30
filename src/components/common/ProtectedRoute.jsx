import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ requireAdmin }) => {
    const { user, isAuthenticated } = useSelector(state => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && user?.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return <Outlet />;
};

export default ProtectedRoute; 