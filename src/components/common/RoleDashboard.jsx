import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import ClientPanel from '../../pages/Client/ClientPanel';
import WriterPanel from '../../pages/Writer/WriterPanel';

const RoleDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Usar user.role directamente (no isAdmin de Redux) para evitar
  // race condition con redux-persist de sesiones anteriores
  const role = user?.role;
  if (role === 'admin' || role === 'superadmin') return <Navigate to="/admin" replace />;
  if (role === 'writer' || role === 'redactor') return <WriterPanel />;
  return <ClientPanel />;
};

export default RoleDashboard;
