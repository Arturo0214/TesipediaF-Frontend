import React, { useState, Suspense, useEffect } from 'react';
import { Nav, Alert, Button } from 'react-bootstrap';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    FaFileAlt,
    FaProjectDiagram,
    FaMoneyBillWave,
    FaChartLine,
    FaUsers,
    FaCogs,
    FaPencilAlt,
    FaShoppingCart,
    FaClipboardList,
    FaUsersCog,
    FaChartBar,
    FaBell,
    FaSignOutAlt
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../../../features/auth/authSlice';
import './AdminPanel.css';
import '../adminCommon.css';

// Import components
import ManageQuotes from '../adminQuotes/ManageQuotes.jsx';
import ManageProjects from '../adminProjects/ManageProjects.jsx';
import ManagePayments from '../adminPayments/ManagePayments.jsx';
import ManageVisits from '../adminVisits/ManageVisits.jsx';
import ManageUsers from '../adminUsers/ManageUsers.jsx';
import ManageServices from '../adminServices/ManageServices.jsx';
import AdminDashboard from '../adminDashboard/AdminDashboard.jsx';
import AdminMessages from '../adminMessages/AdminMessages.jsx';

// Error boundary component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Component Error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Alert variant="danger" className="tesipedia-admin-error">
                    <Alert.Heading>Error al cargar el componente</Alert.Heading>
                    <p>Hubo un problema al cargar esta sección. Detalles: {this.state.error?.message || 'Error desconocido'}</p>
                    {this.state.errorInfo && (
                        <details style={{ whiteSpace: 'pre-wrap' }}>
                            <summary>Ver detalles del error</summary>
                            {this.state.errorInfo.componentStack}
                        </details>
                    )}
                </Alert>
            );
        }
        return this.props.children;
    }
}

const AdminPanel = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Determinar pestaña inicial basada en la URL
    const getInitialTab = () => {
        const path = location.pathname;
        if (path.includes('/usuarios')) return 'usuarios';
        if (path.includes('/mensajes')) return 'mensajes';
        if (path.includes('/cotizaciones')) return 'cotizaciones';
        if (path.includes('/proyectos')) return 'proyectos';
        if (path.includes('/pagos')) return 'pagos';
        if (path.includes('/visitas')) return 'visitas';
        if (path.includes('/servicios')) return 'servicios';
        return 'dashboard';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [componentError, setComponentError] = useState(null);

    const navItems = [
        { key: 'dashboard', icon: FaChartBar, label: 'Dashboard', section: 'principal', path: '/admin' },
        { key: 'cotizaciones', icon: FaFileAlt, label: 'Cotizaciones', section: 'principal', path: '/admin/cotizaciones' },
        { key: 'proyectos', icon: FaProjectDiagram, label: 'Proyectos', section: 'principal', path: '/admin/proyectos' },
        { key: 'pagos', icon: FaMoneyBillWave, label: 'Pagos', section: 'principal', path: '/admin/pagos' },
        { key: 'mensajes', icon: FaClipboardList, label: 'Mensajes', section: 'gestion', path: '/admin/mensajes' },
        { key: 'usuarios', icon: FaUsers, label: 'Usuarios', section: 'gestion', path: '/admin/usuarios' },
        { key: 'servicios', icon: FaCogs, label: 'Servicios', section: 'gestion', path: '/admin/servicios' },
        { key: 'visitas', icon: FaChartLine, label: 'Visitas', section: 'estadisticas', path: '/admin/visitas' }
    ];

    const handleTabSelect = (key) => {
        setActiveTab(key);
        setComponentError(null);
        setIsSidebarOpen(false);

        // Navegar a la ruta correspondiente
        const selectedItem = navItems.find(item => item.key === key);
        if (selectedItem) {
            navigate(selectedItem.path, { replace: true });
        }
    };

    // Actualizar pestaña al cambiar la URL
    useEffect(() => {
        const path = location.pathname;
        const newTab = getInitialTab();
        if (newTab !== activeTab) {
            setActiveTab(newTab);
            setComponentError(null);
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const components = {
        dashboard: AdminDashboard,
        cotizaciones: ManageQuotes,
        proyectos: ManageProjects,
        pagos: ManagePayments,
        visitas: ManageVisits,
        usuarios: ManageUsers,
        servicios: ManageServices,
        mensajes: AdminMessages
    };

    const renderTabContent = () => {
        const Component = components[activeTab] || components.dashboard;

        return (
            <Suspense fallback={<div className="tesipedia-admin-loading">Cargando...</div>}>
                <ErrorBoundary>
                    <div className="tesipedia-admin-component">
                        <Component />
                    </div>
                </ErrorBoundary>
            </Suspense>
        );
    };

    const renderNavSection = (section, title) => {
        const sectionItems = navItems.filter(item => item.section === section);
        if (sectionItems.length === 0) return null;

        return (
            <div className="tesipedia-admin-nav-section">
                <div className="tesipedia-admin-nav-section-title">{title}</div>
                {sectionItems.map(({ key, icon: Icon, label, path }) => (
                    <Nav.Link
                        key={key}
                        active={activeTab === key}
                        onClick={() => handleTabSelect(key)}
                        className="tesipedia-admin-nav-link"
                        as={Link}
                        to={path}
                        replace
                    >
                        <Icon />
                        <span>{label}</span>
                    </Nav.Link>
                ))}
            </div>
        );
    };

    return (
        <div className="tesipedia-admin-panel">
            <h1 className="tesipedia-admin-title">Panel de Administración</h1>
            <div className="tesipedia-admin-container">
                <aside className={`tesipedia-admin-sidebar ${isSidebarOpen ? 'active' : ''}`}>
                    <nav className="tesipedia-admin-nav">
                        {renderNavSection('principal', 'Principal')}
                        {renderNavSection('gestion', 'Gestión')}
                        {renderNavSection('estadisticas', 'Estadísticas')}

                        <button
                            className="tesipedia-admin-logout"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt />
                            <span>Cerrar Sesión</span>
                        </button>
                    </nav>
                </aside>

                <main className="tesipedia-admin-content">
                    {componentError ? (
                        <Alert variant="danger" className="tesipedia-admin-error">
                            <Alert.Heading>Error al cargar el componente</Alert.Heading>
                            <p>{componentError}</p>
                        </Alert>
                    ) : (
                        renderTabContent()
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;
