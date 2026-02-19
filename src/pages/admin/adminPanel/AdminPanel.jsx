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
    FaSignOutAlt,
    FaBars
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../features/auth/authSlice';
import {
    addNotification,
    updateNotification,
    removeNotification,
    fetchNotifications,
    markNotificationsByType // Nuevo import
} from '../../../features/notifications/notificationSlice';
import { connectSocket, onSocketEvent } from '../../../services/socket/socketService';
import './AdminPanel.css';
import '../adminCommon.css';
import '../../../components/admin/NotificationDropdown.css';
import authService from '../../../services/authService';

// Import components
import ManageQuotes from '../adminQuotes/ManageQuotes.jsx';
import ManageProjects from '../adminProjects/ManageProjects.jsx';
import ManagePayments from '../adminPayments/ManagePayments.jsx';
import ManageVisits from '../adminVisits/ManageVisits.jsx';
import ManageUsers from '../adminUsers/ManageUsers.jsx';
import ManageServices from '../adminServices/ManageServices.jsx';
import AdminDashboard from '../adminDashboard/AdminDashboard.jsx';
import AdminMessages from '../adminMessages/AdminMessages.jsx';
import NotificationDropdown from '../../../components/admin/NotificationDropdown.jsx';

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
    const authUser = useSelector(state => state.auth.user);
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

        // Force scroll reset
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        // Reset all possible scroll containers
        const scrollContainers = document.querySelectorAll('.tesipedia-admin-content, .table-responsive, .mu-table-responsive');
        scrollContainers.forEach(container => {
            if (container) {
                container.scrollTop = 0;
            }
        });

        // Navegar a la ruta correspondiente
        const selectedItem = navItems.find(item => item.key === key);
        if (selectedItem) {
            navigate(selectedItem.path, { replace: true });
        }
    };

    // También agregar el scroll to top cuando cambia la URL
    useEffect(() => {
        const path = location.pathname;
        const newTab = getInitialTab();
        if (newTab !== activeTab) {
            setActiveTab(newTab);
            setComponentError(null);

            // Force scroll reset
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

            // Reset all possible scroll containers
            const scrollContainers = document.querySelectorAll('.tesipedia-admin-content, .table-responsive, .mu-table-responsive');
            scrollContainers.forEach(container => {
                if (container) {
                    container.scrollTop = 0;
                }
            });
        }
    }, [location.pathname]);

    // Conexión global al socket de notificaciones
    useEffect(() => {
        if (!authUser?._id) return;
        const token = authService.getToken(); // Lee la cookie jwt
        if (!token) {
            console.error('[Socket] No se encontró el token JWT en las cookies');
            return;
        }
        console.log('[Socket] Conectando socket para usuario:', authUser._id);
        dispatch(fetchNotifications());
        const socket = connectSocket(authUser._id, false, token);
        onSocketEvent('notification:new', (notification) => {
            console.log('[Socket] Recibida notificación nueva:', notification);
            dispatch(addNotification(notification));
        });
        onSocketEvent('notification:update', (notification) => {
            console.log('[Socket] Notificación actualizada:', notification);
            dispatch(updateNotification(notification));
        });
        onSocketEvent('notification:delete', (notificationId) => {
            console.log('[Socket] Notificación eliminada:', notificationId);
            dispatch(removeNotification(notificationId));
        });
        // eslint-disable-next-line
    }, [authUser?._id]);

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

    const notifications = useSelector(state => state.notifications.notifications || []);

    // Mapeo de tipos de notificación a keys de secciones
    const notificationTypeToSection = {
        cotizacion: 'cotizaciones',
        proyecto: 'proyectos',
        pago: 'pagos',
        mensaje: 'mensajes',
        visita: 'visitas',
        // Puedes agregar más si tienes más secciones
    };

    // Calcular notificaciones no leídas por sección
    const unreadBySection = {};
    notifications.forEach(n => {
        if (!n.isRead && notificationTypeToSection[n.type]) {
            const section = notificationTypeToSection[n.type];
            unreadBySection[section] = (unreadBySection[section] || 0) + 1;
        }
    });

    const renderTabContent = () => {
        const Component = components[activeTab] || components.dashboard;

        return (
            <Suspense fallback={<div className="tesipedia-admin-loading">Cargando...</div>}>
                <ErrorBoundary>
                    <div className="tesipedia-admin-component" key={activeTab}>
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
                <div className="tesipedia-admin-nav-section-title notification-title-with-icon">
                    {title}
                    {section === 'principal' && <NotificationDropdown />}
                </div>
                {sectionItems.map(({ key, icon: Icon, label, path }) => {
                    const unread = unreadBySection[key] || 0;
                    const isActive = activeTab === key;
                    return (
                        <div
                            key={key}
                            className={`sidebar-nav-item-wrapper${unread > 0 && !isActive ? ' sidebar-item-alert' : ''}`}
                            style={{ position: 'relative' }}
                        >
                            <Nav.Link
                                active={isActive}
                                onClick={() => handleTabSelect(key)}
                                className="tesipedia-admin-nav-link"
                                as={Link}
                                to={path}
                                replace
                            >
                                <Icon />
                                <span>{label}</span>
                                {unread > 0 && !isActive && (
                                    <span className="sidebar-badge-alert">{unread}</span>
                                )}
                            </Nav.Link>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="tesipedia-admin-panel">
            {/* Botón hamburguesa solo en mobile */}
            <button
                className="tesipedia-admin-sidebar-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Abrir menú"
            >
                <FaBars />
            </button>
            {/* Overlay oscuro cuando el sidebar está abierto en mobile */}
            {isSidebarOpen && <div className="tesipedia-admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
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

                <main className="tesipedia-admin-content" key={`main-${activeTab}`}>
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
