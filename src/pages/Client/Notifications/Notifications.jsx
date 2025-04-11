import React, { useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBell, FaFileAlt, FaComments, FaCheckCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '@features/notifications/notificationSlice';
import './Notifications.css';

const NotificationItem = ({ notification, onMarkAsRead }) => {
    const getNotificationIcon = useMemo(() => (type) => {
        switch (type) {
            case 'project':
                return <FaFileAlt aria-hidden="true" />;
            case 'message':
                return <FaComments aria-hidden="true" />;
            case 'payment':
                return <FaCheckCircle aria-hidden="true" />;
            default:
                return <FaBell aria-hidden="true" />;
        }
    }, []);

    const getNotificationIconClass = useMemo(() => (type) => {
        switch (type) {
            case 'project':
                return 'bg-primary';
            case 'message':
                return 'bg-success';
            case 'payment':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    }, []);

    return (
        <Dropdown.Item
            className={notification.isRead ? 'read' : 'unread'}
            onClick={() => onMarkAsRead(notification._id)}
            role="button"
            tabIndex={0}
            aria-label={`Notificación de ${notification.type}: ${notification.message}`}
        >
            <div className="notification-item">
                <div className={`notification-icon ${getNotificationIconClass(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                    <div className="notification-title">{notification.type.toUpperCase()}</div>
                    <div className="notification-text">{notification.message}</div>
                    <div className="notification-time">
                        {format(new Date(notification.createdAt), 'PPpp', { locale: es })}
                    </div>
                </div>
            </div>
        </Dropdown.Item>
    );
};

NotificationItem.propTypes = {
    notification: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        isRead: PropTypes.bool.isRequired,
        createdAt: PropTypes.string.isRequired,
    }).isRequired,
    onMarkAsRead: PropTypes.func.isRequired,
};

const Notifications = () => {
    const dispatch = useDispatch();
    const { notifications = [], unreadCount = 0, loading = false, error = null } = useSelector((state) => state.notifications || {});

    // Función para actualizar las notificaciones
    const updateNotifications = useCallback(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    useEffect(() => {
        updateNotifications();
    }, [updateNotifications]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            console.log('Marcando notificación como leída:', notificationId);
            await dispatch(markNotificationAsRead(notificationId)).unwrap();
            console.log('Notificación marcada como leída, actualizando lista');
            await dispatch(fetchNotifications());
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            console.log('Marcando todas las notificaciones como leídas');
            await dispatch(markAllNotificationsAsRead()).unwrap();
            console.log('Todas las notificaciones marcadas como leídas, actualizando lista');
            await dispatch(fetchNotifications());
        } catch (error) {
            console.error('Error al marcar todas las notificaciones como leídas:', error);
        }
    };

    const notificationItems = useMemo(() => {
        if (!notifications || !Array.isArray(notifications)) return [];

        return notifications.map(notification => (
            <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
            />
        ));
    }, [notifications, handleMarkAsRead]);

    return (
        <Dropdown align="end" className="notifications-dropdown">
            <Dropdown.Toggle
                variant="outline-secondary"
                id="notifications-dropdown"
                aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} no leídas)` : ''}`}
            >
                <FaBell className="me-1" aria-hidden="true" />
                {unreadCount > 0 && (
                    <Badge bg="danger" className="notification-badge" aria-label={`${unreadCount} notificaciones no leídas`}>
                        {unreadCount}
                    </Badge>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="notifications-menu">
                <Dropdown.Header className="d-flex justify-content-between align-items-center">
                    <span>Notificaciones</span>
                    <div>
                        {unreadCount > 0 && (
                            <button
                                className="btn btn-sm btn-link text-decoration-none p-0"
                                onClick={handleMarkAllAsRead}
                                aria-label="Marcar todas las notificaciones como leídas"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>
                </Dropdown.Header>

                {loading ? (
                    <Dropdown.Item disabled>
                        <div className="text-center py-3" role="status">Cargando...</div>
                    </Dropdown.Item>
                ) : error ? (
                    <Dropdown.Item disabled>
                        <div className="text-center py-3 text-danger" role="alert">{error}</div>
                    </Dropdown.Item>
                ) : notifications && notifications.length > 0 ? (
                    notificationItems
                ) : (
                    <Dropdown.Item disabled>
                        <div className="text-center py-3">
                            No tienes notificaciones
                        </div>
                    </Dropdown.Item>
                )}

                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/notificaciones" className="text-center">
                    Ver todas las notificaciones
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default Notifications;
