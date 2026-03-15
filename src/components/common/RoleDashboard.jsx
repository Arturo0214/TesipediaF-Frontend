import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import ClientPanel from '../../pages/Client/ClientPanel';
import WriterPanel from '../../pages/Writer/WriterPanel';

const RoleDashboard = () => {
  const { user, isAdmin } = useSelector((state) => state.auth);

  if (isAdmin) return <Navigate to="/admin" replace />;
  if (user?.role === 'writer' || user?.role === 'redactor') return <WriterPanel />;
  return <ClientPanel />;
};

export default RoleDashboard;
