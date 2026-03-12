import React, { useState, useRef, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import {
    FaBell,
    FaCheck,
    FaRegBell,
    FaFileAlt,
    FaCommentDots,
    FaEye,
    FaCreditCard,
    FaProjectDiagram,
    FaExclamationTriangle,
    FaInfoCircle,
    FaShoppingCart,
    FaTruck,
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../../features/notifications/notificationSlice';
import './NotificationDropdown.css';

// Map notification types to icons and colors
const typeConfig = {
    cotizacion: { icon: FaFileAlt, color: '#4a6cf7', bg: '#eef1ff', label: 'Cotización' },
    mensaje: { icon: FaCommentDots, color: '#00b894', bg: '#e6f9f3', label: 'Mensaje' },
    visita: { icon: FaEye, color: '#6c5ce7', bg: '#f0eeff', label: 'Visita' },
    pago: { icon: FaCreditCard, color: '#e17055', bg: '#fef0ec', label: 'Pago' },
    proyecto: { icon: FaProjectDiagram, color: '#fdcb6e', bg: '#fef9e7', label: 'Proyecto' },
    pedido: { icon: FaShoppingCart, color: '#00cec9', bg: '#e6fcfb', label: 'Pedido' },
    entrega: { icon: FaTruck, color: '#55a3e5', bg: '#ebf4fd', label: 'Entrega' },
    alerta: { icon: FaExclamationTriangle, color: '#d63031', bg: '#fce4e4', label: 'Alerta' },
    info: { icon: FaInfoCircle, color: '#636e72', bg: '#f0f0f0', label: 'Info' },
};

const defaultTypeConfig = { icon: FaBell, color: '#636e72', bg: '#f0f0f0', label: 'Notificación' };

const NotificationDropdown = () => {
    const [show, setShow] = useState(false);
    const iconRef = useRef(null);
    const menuRef = useRef(null);
    const dispatch = useDispatch();

    const notifications = useSelector(state => state.notifications.notifications || []);
    const unreadCount = useSelector(state => state.notifications.unreadCount || 0);
    const loading = useSelector(state => state.notifications.loading);

    // Close on outside click
    useEffect(() => {
        if (!show) return;
        function handleClickOutside(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                iconRef.current &&
                !iconRef.current.contains(event.target)
            ) {
                setShow(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [show]);

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await dispatch(markNotificationAsRead(notification._id)).unwrap();
            } catch (error) {
                console.error('Error al marcar notificación como leída:', error);
            }
        }
    };

    const handleMarkAsRead = async (e, notificationId) => {
        e.stopPropagation();
        try {
            await dispatch(markNotificationAsRead(notificationId)).unwrap();
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await dispatch(markAllNotificationsAsRead()).unwrap();
        } catch (error) {
            console.error('Error al marcar todas las notificaciones como leídas:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        if (diffInSeconds < 60) return 'Ahora';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}min`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d`;
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    };

    const recentNotifications = notifications.slice(0, 15);

    // Position dropdown relative to bell icon
    const [menuStyle, setMenuStyle] = useState({});
    useEffect(() => {
        if (show && iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top = rect.bottom + 8;
            let left = rect.left - 160; // Center roughly

            // Bounds checks
            if (left + 400 > viewportWidth) left = viewportWidth - 412;
            if (left < 8) left = 8;
            if (top + 500 > viewportHeight) top = Math.max(8, viewportHeight - 510);

            setMenuStyle({ top, left });
        }
    }, [show]);

    const getTypeConfig = (type) => typeConfig[type] || defaultTypeConfig;

    return (
        <>
            <button
                className="admin-notification-toggle"
                ref={iconRef}
                aria-label="Mostrar notificaciones"
                onClick={() => setShow((prev) => !prev)}
                type="button"
            >
                <div className="admin-notification-icon-wrapper">
                    <FaBell className={`admin-notification-icon${show ? ' admin-notification-icon-active' : ''}`} />
                    {unreadCount > 0 && (
                        <span className={`admin-notification-badge${unreadCount > 0 ? ' admin-notification-badge-pulse' : ''}`}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
            </button>
            {show && (
                <div
                    className="notif-dropdown"
                    ref={menuRef}
                    style={menuStyle}
                >
                    {/* Header */}
                    <div className="notif-dropdown-header">
                        <div className="notif-dropdown-header-left">
                            <h6>Notificaciones</h6>
                            {unreadCount > 0 && (
                                <span className="notif-unread-count">{unreadCount}</span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button className="notif-mark-all-btn" onClick={handleMarkAllAsRead}>
                                <FaCheck size={10} />
                                Leer todas
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="notif-dropdown-list">
                        {loading ? (
                            <div className="notif-empty-state">
                                <div className="spinner-border spinner-border-sm" role="status" />
                                <span>Cargando...</span>
                            </div>
                        ) : recentNotifications.length === 0 ? (
                            <div className="notif-empty-state">
                                <FaRegBell size={24} />
                                <span>Sin notificaciones</span>
                            </div>
                        ) : (
                            recentNotifications.map((notification) => {
                                const config = getTypeConfig(notification.type);
                                const Icon = config.icon;

                                return (
                                    <div
                                        key={notification._id}
                                        className={`notif-item ${!notification.isRead ? 'notif-item-unread' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div
                                            className="notif-item-icon"
                                            style={{ background: config.bg, color: config.color }}
                                        >
                                            <Icon size={14} />
                                        </div>
                                        <div className="notif-item-body">
                                            <div className="notif-item-top">
                                                <span className="notif-item-type" style={{ color: config.color }}>
                                                    {config.label}
                                                </span>
                                                <span className="notif-item-time">
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                            </div>
                                            <div className="notif-item-message">
                                                {notification.message || notification.body}
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <button
                                                className="notif-item-read-btn"
                                                onClick={(e) => handleMarkAsRead(e, notification._id)}
                                                title="Marcar como leída"
                                            >
                                                <FaCheck size={9} />
                                            </button>
                                        )}
                                        {!notification.isRead && (
                                            <div className="notif-item-dot" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 15 && (
                        <div className="notif-dropdown-footer">
                            <span>Mostrando 15 de {notifications.length}</span>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default NotificationDropdown;
