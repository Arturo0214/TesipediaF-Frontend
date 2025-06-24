import React, { useState, useRef, useEffect } from 'react';
import { Badge, ListGroup, Button } from 'react-bootstrap';
import { FaBell, FaCheck } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../../features/notifications/notificationSlice';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
    const [show, setShow] = useState(false);
    const iconRef = useRef(null);
    const menuRef = useRef(null);
    const dispatch = useDispatch();

    const notifications = useSelector(state => state.notifications.notifications || []);
    const unreadCount = useSelector(state => state.notifications.unreadCount || 0);
    const loading = useSelector(state => state.notifications.loading);

    // Cerrar el menú al hacer click fuera
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

    const handleMarkAsRead = async (notificationId) => {
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
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        if (diffInSeconds < 60) return `hace ${diffInSeconds} segundo${diffInSeconds !== 1 ? 's' : ''}`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    };

    const recentNotifications = notifications.slice(0, 10);

    // Calcular la posición top del menú para alinearlo con el icono
    const [menuTop, setMenuTop] = useState(70);
    useEffect(() => {
        if (show && iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            setMenuTop(rect.top + rect.height + 4); // 4px de separación
        }
    }, [show]);

    // Helper para capitalizar solo la primera letra
    const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    return (
        <>
            <button
                className="admin-notification-toggle"
                ref={iconRef}
                aria-label="Mostrar notificaciones"
                onClick={() => setShow((prev) => !prev)}
                tabIndex={0}
                type="button"
            >
                <div className="admin-notification-icon-wrapper">
                    <FaBell className={`admin-notification-icon${show ? ' admin-notification-icon-active' : ''}`} />
                    {unreadCount > 0 && (
                        <span
                            className={`admin-notification-badge${unreadCount > 0 ? ' admin-notification-badge-pulse' : ''}`}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
            </button>
            {show && (
                <div
                    className="notification-dropdown-menu notification-dropdown-fixed"
                    ref={menuRef}
                    style={{ top: menuTop, right: 32 }}
                >
                    <div className="notification-header">
                        <h6 className="mb-0">Notificaciones</h6>
                        {unreadCount > 0 && (
                            <Button
                                variant="link"
                                size="sm"
                                className="mark-all-read-btn"
                                onClick={handleMarkAllAsRead}
                            >
                                Marcar todas como leídas
                            </Button>
                        )}
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="text-center py-3">
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : recentNotifications.length === 0 ? (
                            <div className="text-center py-3 text-muted">
                                <FaBell className="mb-2" />
                                <p className="mb-0">No hay notificaciones</p>
                            </div>
                        ) : (
                            <ListGroup variant="flush">
                                {recentNotifications.map((notification) => (
                                    <ListGroup.Item
                                        key={notification._id}
                                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    >
                                        <div className="notification-content">
                                            <div className="notification-title">
                                                {['visitas', 'cotizaciones', 'mensajes', 'pagos'].includes((notification.type || '').toLowerCase())
                                                    ? capitalizeFirst(notification.title || notification.type || 'Notificación')
                                                    : (notification.title || notification.type || 'Notificación')}
                                            </div>
                                            <div className="notification-message">
                                                {notification.message || notification.body}
                                            </div>
                                            <div className="notification-meta">
                                                <small className="text-muted">
                                                    {formatDate(notification.createdAt)}
                                                </small>
                                                {!notification.isRead && (
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="mark-read-btn"
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                        title="Marcar como leída"
                                                    >
                                                        <FaCheck size={12} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </div>

                    {notifications.length > 10 && (
                        <div className="notification-footer">
                            <Button variant="link" size="sm" className="view-all-btn">
                                Ver todas las notificaciones
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default NotificationDropdown; 