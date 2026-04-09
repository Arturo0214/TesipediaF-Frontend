import React, { useState, Suspense, useEffect, lazy } from 'react';
import { Nav, Alert, Button } from 'react-bootstrap';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    FaFileAlt,
    FaProjectDiagram,
    FaMoneyBillWave,
    FaChartLine,
    FaUsers,
    FaPencilAlt,
    FaShoppingCart,
    FaClipboardList,
    FaUsersCog,
    FaChartBar,
    FaBell,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaWhatsapp,
    FaCalculator,
    FaHubspot,
    FaCogs,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
    FaRocket,
    FaChartPie,
    FaClipboardCheck,
    FaFacebookF,
    FaFunnelDollar,
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
import { connectSocket, onSocketEvent, emitSocketEvent } from '../../../services/socket/socketService';
import './AdminPanel.css';
import '../adminCommon.css';
import '../../../components/admin/NotificationDropdown.css';
import authService from '../../../services/authService';

// Lazy-loaded admin sections — each loads only when its tab is active
// This splits the 1.3MB AdminPanel chunk into ~100-200KB per section
const ManageQuotes = lazy(() => import('../adminQuotes/ManageQuotes.jsx'));
const ManageProjects = lazy(() => import('../adminProjects/ManageProjects.jsx'));
const ManagePayments = lazy(() => import('../adminPayments/ManagePayments.jsx'));
const ManageVisits = lazy(() => import('../adminVisits/ManageVisits.jsx'));
const ManageUsers = lazy(() => import('../adminUsers/ManageUsers.jsx'));
const AdminDashboard = lazy(() => import('../adminDashboard/AdminDashboard.jsx'));
const AdminHubSpot = lazy(() => import('../adminHubSpot/AdminHubSpot.jsx'));
const AdminMessages = lazy(() => import('../adminMessages/AdminMessages.jsx'));
const AdminWhatsApp = lazy(() => import('../adminWhatsApp/AdminWhatsApp.jsx'));
const AdminManyChat = lazy(() => import('../adminManyChat/AdminManyChat.jsx'));
const AdminAutomations = lazy(() => import('../adminAutomations/AdminAutomations.jsx'));
const SalesQuote = lazy(() => import('../../SalesQuote/SalesQuote.jsx'));
const AdminRevenue = lazy(() => import('../adminRevenue/AdminRevenue.jsx'));
const AdminInformes = lazy(() => import('../adminInformes/AdminInformes.jsx'));
const AdminCampaigns = lazy(() => import('../adminCampaigns/AdminCampaigns.jsx'));
const AdminFunnel = lazy(() => import('../adminFunnel/AdminFunnel.jsx'));
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        try { return localStorage.getItem('tesipedia_sidebar_collapsed') === 'true'; } catch { return false; }
    });

    const toggleSidebarCollapse = () => {
        setSidebarCollapsed(prev => {
            const next = !prev;
            try { localStorage.setItem('tesipedia_sidebar_collapsed', String(next)); } catch {}
            return next;
        });
    };

    // Determinar pestaña inicial basada en la URL
    const getInitialTab = () => {
        const path = location.pathname;
        if (path.includes('/usuarios')) return 'usuarios';
        if (path.includes('/automatizaciones')) return 'automatizaciones';
        if (path.includes('/manychat')) return 'manychat';
        if (path.includes('/whatsapp')) return 'whatsapp';
        if (path.includes('/mensajes')) return 'mensajes';
        if (path.includes('/cotizaciones')) return 'cotizaciones';
        if (path.includes('/proyectos')) return 'proyectos';
        if (path.includes('/pagos')) return 'pagos';
        if (path.includes('/visitas')) return 'visitas';
        if (path.includes('/hubspot')) return 'hubspot';
        if (path.includes('/cotizar')) return 'cotizar';
        if (path.includes('/revenue')) return 'revenue';
        if (path.includes('/informes')) return 'informes';
        if (path.includes('/campaigns')) return 'campaigns';
        if (path.includes('/funnel')) return 'funnel';
        return 'dashboard';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [componentError, setComponentError] = useState(null);

    const navItems = [
        { key: 'dashboard', icon: FaChartBar, label: 'Dashboard', section: 'principal', path: '/admin' },
        { key: 'cotizar', icon: FaCalculator, label: 'Cotizar', section: 'principal', path: '/admin/cotizar' },
        { key: 'cotizaciones', icon: FaFileAlt, label: 'Cotizaciones', section: 'principal', path: '/admin/cotizaciones' },
        { key: 'proyectos', icon: FaProjectDiagram, label: 'Proyectos', section: 'principal', path: '/admin/proyectos' },
        { key: 'pagos', icon: FaMoneyBillWave, label: 'Pagos', section: 'principal', path: '/admin/pagos' },
        { key: 'whatsapp', icon: FaWhatsapp, label: 'WhatsApp', section: 'gestion', path: '/admin/whatsapp' },
        { key: 'manychat', icon: FaRocket, label: 'ManyChat', section: 'gestion', path: '/admin/manychat' },
        { key: 'automatizaciones', icon: FaCogs, label: 'Automatizaciones', section: 'gestion', path: '/admin/automatizaciones' },
        { key: 'mensajes', icon: FaClipboardList, label: 'Mensajes', section: 'gestion', path: '/admin/mensajes' },
        { key: 'usuarios', icon: FaUsers, label: 'Usuarios', section: 'gestion', path: '/admin/usuarios' },
        { key: 'funnel', icon: FaFunnelDollar, label: 'Funnel', section: 'gestion', path: '/admin/funnel' },
        { key: 'revenue', icon: FaChartPie, label: 'Revenue', section: 'finanzas', path: '/admin/revenue' },
        { key: 'informes', icon: FaClipboardCheck, label: 'Informes', section: 'finanzas', path: '/admin/informes' },
        { key: 'campaigns', icon: FaFacebookF, label: 'Campañas Meta', section: 'finanzas', path: '/admin/campaigns' },
        { key: 'hubspot', icon: FaHubspot, label: 'HubSpot', section: 'estadisticas', path: '/admin/hubspot' },
        { key: 'visitas', icon: FaChartLine, label: 'Visitas', section: 'estadisticas', path: '/admin/visitas' }
    ];

    // Mapeo inverso: sección → tipos de notificación que se marcan como leídos
    const sectionToNotificationTypes = {
        cotizaciones: ['cotizacion'],
        proyectos: ['proyecto'],
        pagos: ['pago', 'pedido'],
        mensajes: ['mensaje'],
        visitas: ['visita'],
        whatsapp: ['whatsapp', 'lead'],
        dashboard: ['alerta', 'info'],
    };

    const handleTabSelect = (key) => {
        setActiveTab(key);
        setComponentError(null);
        setIsSidebarOpen(false);

        // Marcar notificaciones de esta sección como leídas
        const types = sectionToNotificationTypes[key] || [];
        types.forEach(notificationType => {
            const hasUnread = notifications.some(n => !n.isRead && n.type === notificationType);
            if (hasUnread) {
                dispatch(markNotificationsByType(notificationType));
            }
        });

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

        // Unirse a la sala de notificaciones
        if (socket) {
            emitSocketEvent('joinNotifications');
        }

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

        // Polling de respaldo cada 30 segundos para detectar nuevas notificaciones
        const pollInterval = setInterval(() => {
            dispatch(fetchNotifications());
        }, 30000);

        return () => {
            clearInterval(pollInterval);
        };
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
        cotizar: SalesQuote,
        cotizaciones: ManageQuotes,
        proyectos: ManageProjects,
        pagos: ManagePayments,
        visitas: ManageVisits,
        usuarios: ManageUsers,
        hubspot: AdminHubSpot,
        mensajes: AdminMessages,
        whatsapp: AdminWhatsApp,
        manychat: AdminManyChat,
        automatizaciones: AdminAutomations,
        funnel: AdminFunnel,
        revenue: AdminRevenue,
        informes: AdminInformes,
        campaigns: AdminCampaigns,
    };

    const notifications = useSelector(state => state.notifications.notifications || []);

    // Mapeo de tipos de notificación a keys de secciones
    const notificationTypeToSection = {
        cotizacion: 'cotizaciones',
        proyecto: 'proyectos',
        pago: 'pagos',
        pedido: 'pagos',
        mensaje: 'mensajes',
        visita: 'visitas',
        whatsapp: 'whatsapp',
        lead: 'whatsapp',
        alerta: 'dashboard',
        info: 'dashboard',
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
                                title={label}
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
            {/* Botón menú solo en mobile */}
            <button
                className={`tesipedia-admin-sidebar-toggle${isSidebarOpen ? ' active' : ''}`}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            {/* Overlay oscuro cuando el sidebar está abierto en mobile */}
            {isSidebarOpen && <div className="tesipedia-admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
            <div className={`tesipedia-admin-container${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
                <aside className={`tesipedia-admin-sidebar ${isSidebarOpen ? 'active' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}>
                    {/* Título + botón de colapsar */}
                    <div className="tesipedia-sidebar-header">
                        <span className="tesipedia-sidebar-title">Panel de Administración</span>
                        <button
                            className="tesipedia-sidebar-collapse-btn"
                            onClick={toggleSidebarCollapse}
                            title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
                        >
                            {sidebarCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
                        </button>
                    </div>
                    <nav className="tesipedia-admin-nav">
                        {renderNavSection('principal', 'Principal')}
                        {renderNavSection('gestion', 'Gestión')}
                        {renderNavSection('finanzas', 'Finanzas')}
                        {renderNavSection('estadisticas', 'Estadísticas')}

                        <button
                            className="tesipedia-admin-logout"
                            onClick={handleLogout}
                            title="Cerrar Sesión"
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
