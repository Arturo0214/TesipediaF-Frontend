import React, { useState, useRef, useEffect } from 'react';
import { Badge, ListGroup, Button } from 'react-bootstrap';
import { FaBell, FaCheck, FaRegBell } from 'react-icons/fa';
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

    const handleMarkAsRead = async (e, notificationId) => {
        // Prevent the click from bubbling up to the item click handler
        if (e) e.stopPropagation();
        try {
            await dispatch(markNotificationAsRead(notificationId)).unwrap();
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read on click if unread
        if (!notification.isRead) {
            try {
                await dispatch(markNotificationAsRead(notification._id)).unwrap();
            } catch (error) {
                console.error('Error al marcar notificación como leída:', error);
            }
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
        if (diffInSeconds < 60) return `hace ${diffInSeconds}s`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `hace ${diffInMinutes}min`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `hace ${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `hace ${diffInDays}d`;
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    };

    const recentNotifications = notifications.slice(0, 10);

    // Calcular posición del dropdown relativa al icono
    const [menuStyle, setMenuStyle] = useState({});
    useEffect(() => {
        if (show && iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Position below the bell icon, aligned to the right
            let top = rect.bottom + 6;
            let left = rect.left;

            // Make sure it doesn't go off the right edge
            if (left + 380 > viewportWidth) {
                left = viewportWidth - 380 - 12;
            }

            // Make sure it doesn't go off the left edge
            if (left < 12) {
                left = 12;
            }

            setMenuStyle({ top, left });
        }
    }, [show]);

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
                        <span className={`admin-notification-badge${unreadCount > 0 ? ' admin-notification-badge-pulse' : ''}`}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
            </button>
            {show && (
                <div
                    className="notification-dropdown-menu notification-dropdown-fixed"
                    ref={menuRef}
                    style={menuStyle}
                >
                    <div className="notification-header">
                        <h6>Notificaciones</h6>
                        {unreadCount > 0 && (
                            <button
                                className="mark-all-read-btn"
                                onClick={handleMarkAllAsRead}
                            >
                                Marcar todas como leídas
                            </button>
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
                            <div className="text-center">
                                <FaRegBell className="mb-2" />
                                <p className="mb-0">No hay notificaciones</p>
                            </div>
                        ) : (
                            <ListGroup variant="flush">
                                {recentNotifications.map((notification) => (
                                    <ListGroup.Item
                                        key={notification._id}
                                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="notification-content">
                                            <div className="notification-title">
                                                {capitalizeFirst(notification.title || notification.type || 'Notificación')}
                                            </div>
                                            <div className="notification-message">
                                                {notification.message || notification.body}
                                            </div>
                                            <div className="notification-meta">
                                                <small>
                                                    {formatDate(notification.createdAt)}
                                                </small>
                                                {!notification.isRead && (
                                                    <button
                                                        className="mark-read-btn"
                                                        onClick={(e) => handleMarkAsRead(e, notification._id)}
                                                        title="Marcar como leída"
                                                    >
                                                        <FaCheck size={10} /> Leída
                                                    </button>
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
                            <button className="view-all-btn">
                                Ver todas ({notifications.length})
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default NotificationDropdown;
