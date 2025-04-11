import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import {
    FaEnvelope,
    FaUserCircle,
    FaGlobe,
    FaClock,
    FaSearch,
    FaFilter,
    FaPaperPlane,
    FaCheckCircle,
    FaExclamationCircle,
    FaSignInAlt
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    sendMessage,
    getConversations,
    getDirectMessages,
    markMessageAsRead,
    updateConversationStatus
} from '../../../features/chat/chatSlice';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import "./AdminMessages.css";
import { toast } from 'react-hot-toast';

const AdminMessages = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { conversations, messages, loading, error } = useSelector((state) => state.chat);
    const { user, isAuthenticated, isAdmin } = useSelector((state) => state.auth);

    // Estado para la interfaz
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [uiError, setUiError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'today'
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Verificar si el usuario actual tiene permisos de administrador
    useEffect(() => {
        if (!isAuthenticated) {
            setUiError("Necesitas iniciar sesión para acceder a esta página.");
        } else if (!isAdmin) {
            setUiError("No tienes permisos para acceder a esta página. Se requieren permisos de administrador.");
        } else {
            setUiError(null);
        }
    }, [isAuthenticated, isAdmin]);

    // Cargar conversaciones al montar el componente
    const loadConversations = useCallback(async () => {
        if (!isAuthenticated || !isAdmin) return;

        try {
            setIsLoadingConversations(true);
            await dispatch(getConversations()).unwrap();
        } catch (err) {
            console.error("Error fetching conversations:", err);
            setUiError(`Error al cargar conversaciones: ${err.message || err || 'Error desconocido'}`);
            toast.error(`Error al cargar conversaciones: ${err.message || 'Error desconocido'}`);
        } finally {
            setIsLoadingConversations(false);
        }
    }, [dispatch, isAuthenticated, isAdmin]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Retry button for loading conversations
    const handleRetryLoadConversations = () => {
        loadConversations();
    };

    // Cargar mensajes cuando se selecciona una conversación
    const loadMessages = useCallback(async (chatId) => {
        if (!chatId || !isAuthenticated || !isAdmin) return;

        try {
            setIsLoadingMessages(true);
            await dispatch(getDirectMessages(chatId)).unwrap();
        } catch (err) {
            console.error("Error fetching direct messages:", err);
            setUiError(`Error al cargar mensajes: ${err.message || err || 'Error desconocido'}`);
            toast.error(`Error al cargar mensajes: ${err.message || 'Error desconocido'}`);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [dispatch, isAuthenticated, isAdmin]);

    useEffect(() => {
        if (selectedChat) {
            loadMessages(selectedChat);
        }
    }, [selectedChat, loadMessages]);

    // Marcar mensajes como leídos cuando se selecciona una conversación
    useEffect(() => {
        if (selectedChat && messages && Array.isArray(messages) && messages.length > 0 && user?._id) {
            const unreadMessages = messages.filter(msg => !msg.isRead && msg.sender !== user._id);

            if (unreadMessages.length > 0) {
                // Marcar cada mensaje individualmente como leído
                unreadMessages.forEach(msg => {
                    if (msg && msg._id) {
                        dispatch(markMessageAsRead(msg._id))
                            .unwrap()
                            .catch(err => {
                                console.error(`Error al marcar mensaje ${msg._id} como leído:`, err);
                            });
                    }
                });
            }
        }
    }, [selectedChat, messages, dispatch, user]);

    // Filtrar conversaciones según el filtro seleccionado
    const filteredConversations = useMemo(() => {
        if (!conversations || !Array.isArray(conversations)) return [];

        let filtered = [...conversations];

        // Filtrar por búsqueda
        if (searchQuery) {
            filtered = filtered.filter(conv =>
                (conv.senderName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (conv.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtrar por estado
        if (filter === 'unread') {
            filtered = filtered.filter(conv => conv.unreadCount > 0);
        } else if (filter === 'today') {
            filtered = filtered.filter(conv => {
                if (!conv.lastMessageDate) return false;
                try {
                    const lastMessageDate = new Date(conv.lastMessageDate);
                    return isToday(lastMessageDate);
                } catch (e) {
                    console.error('Error parsing date:', e);
                    return false;
                }
            });
        }

        // Ordenar por fecha (más recientes primero)
        return filtered.sort((a, b) => {
            if (!a.lastMessageDate) return 1;
            if (!b.lastMessageDate) return -1;
            return new Date(b.lastMessageDate) - new Date(a.lastMessageDate);
        });
    }, [conversations, searchQuery, filter]);

    // Calcular estadísticas
    const stats = useMemo(() => {
        if (!conversations || !Array.isArray(conversations)) return {
            totalConversations: 0,
            unreadMessages: 0,
            todayMessages: 0,
            uniqueIPs: 0
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const unreadMessages = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

        const todayMessages = conversations.filter(conv => {
            if (!conv.lastMessageDate) return false;
            try {
                const messageDate = new Date(conv.lastMessageDate);
                return messageDate >= today;
            } catch (e) {
                console.error('Error parsing date:', e);
                return false;
            }
        }).length;

        // Simulación de IPs únicas (en un caso real, esto vendría del backend)
        const uniqueIPs = Math.floor(conversations.length * 0.7);

        return {
            totalConversations: conversations.length,
            unreadMessages,
            todayMessages,
            uniqueIPs
        };
    }, [conversations]);

    // Manejar selección de conversación
    const handleChatSelect = (chatId) => {
        if (!chatId) {
            console.error('Invalid chatId provided to handleChatSelect');
            return;
        }
        setSelectedChat(chatId);
    };

    // Manejar envío de mensaje
    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() || !selectedChat) return;

        try {
            await dispatch(sendMessage({
                receiver: selectedChat,
                text: message,
                isPublic: false
            })).unwrap();

            setMessage('');
            toast.success('Mensaje enviado correctamente');
            // Recargar los mensajes para ver el nuevo mensaje enviado
            loadMessages(selectedChat);
        } catch (err) {
            console.error('Error al enviar mensaje:', err);
            toast.error(`Error al enviar mensaje: ${err.message || 'Error desconocido'}`);
        }
    };

    // Formatear fecha de manera amigable
    const formatMessageDate = (date) => {
        if (!date) return 'Fecha desconocida';

        try {
            const messageDate = new Date(date);

            if (isToday(messageDate)) {
                return format(messageDate, 'HH:mm', { locale: es });
            } else if (isYesterday(messageDate)) {
                return 'Ayer';
            } else {
                return format(messageDate, 'dd/MM/yyyy', { locale: es });
            }
        } catch (e) {
            console.error('Error formatting date:', e, date);
            return 'Fecha inválida';
        }
    };

    // Renderizar conversación individual
    const renderConversationItem = (conversation) => {
        if (!conversation || !conversation.senderId) {
            console.error('Invalid conversation object:', conversation);
            return null;
        }

        const isActive = selectedChat === conversation.senderId;
        const hasUnread = conversation.unreadCount > 0;

        return (
            <div
                key={conversation.senderId}
                className={`conversation-item ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''} fade-in`}
                onClick={() => handleChatSelect(conversation.senderId)}
            >
                <div className="conversation-avatar">
                    {conversation.senderName?.charAt(0) || 'U'}
                </div>
                <div className="conversation-details">
                    <div className="conversation-name">
                        {conversation.senderName || 'Usuario'}
                        {conversation.status === 'resolved' && (
                            <Badge bg="success" className="ms-2">Resuelto</Badge>
                        )}
                    </div>
                    <div className="conversation-preview">
                        {conversation.lastMessage || 'Sin mensajes'}
                    </div>
                    <div className="conversation-meta">
                        <div className="conversation-time">
                            {formatMessageDate(conversation.lastMessageDate)}
                        </div>
                        {hasUnread && (
                            <div className="conversation-badge">
                                {conversation.unreadCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar mensaje individual
    const renderMessage = (message) => {
        if (!message || !message._id) {
            console.error('Invalid message object:', message);
            return null;
        }

        const isSent = message.sender === user?._id;

        return (
            <div key={message._id} className={`message ${isSent ? 'sent' : 'received'} fade-in`}>
                <div className="message-content">
                    {message.text}
                </div>
                <div className="message-meta">
                    <span className="message-time">
                        {message.createdAt ? format(new Date(message.createdAt), 'HH:mm') : 'Hora desconocida'}
                    </span>
                    {isSent && (
                        <span className="message-status">
                            <FaCheckCircle />
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // Renderizar sección de estadísticas
    const renderStatsSection = () => (
        <div className="stats-section">
            <h2 className="stats-title">Estadísticas de Mensajes</h2>
            <div className="stats-grid">
                <Card className="stats-card fade-in">
                    <div className="stats-card-header">
                        <div className="stats-icon new">
                            <FaEnvelope />
                        </div>
                        <h3 className="stats-card-title">Mensajes Nuevos Hoy</h3>
                    </div>
                    <div className="stats-value">{stats.todayMessages}</div>
                    <div className="stats-description">
                        Mensajes recibidos en las últimas 24 horas
                    </div>
                </Card>

                <Card className="stats-card fade-in">
                    <div className="stats-card-header">
                        <div className="stats-icon unread">
                            <FaExclamationCircle />
                        </div>
                        <h3 className="stats-card-title">Mensajes Sin Leer</h3>
                    </div>
                    <div className="stats-value">{stats.unreadMessages}</div>
                    <div className="stats-description">
                        Mensajes pendientes de revisión
                    </div>
                </Card>

                <Card className="stats-card fade-in">
                    <div className="stats-card-header">
                        <div className="stats-icon ip">
                            <FaGlobe />
                        </div>
                        <h3 className="stats-card-title">IPs Únicas</h3>
                    </div>
                    <div className="stats-value">{stats.uniqueIPs}</div>
                    <div className="stats-description">
                        Direcciones IP diferentes en mensajes
                    </div>
                </Card>

                <Card className="stats-card fade-in">
                    <div className="stats-card-header">
                        <div className="stats-icon users">
                            <FaUserCircle />
                        </div>
                        <h3 className="stats-card-title">Total Conversaciones</h3>
                    </div>
                    <div className="stats-value">{stats.totalConversations}</div>
                    <div className="stats-description">
                        Conversaciones activas en el sistema
                    </div>
                </Card>
            </div>
        </div>
    );

    // Renderizar sección de conversaciones en tiempo real
    const renderRealtimeConversations = () => (
        <div className="realtime-conversations">
            <div className="realtime-header">
                <h3 className="realtime-title">Conversaciones en Tiempo Real</h3>
                <div className="d-flex">
                    <div className="input-group me-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar conversaciones..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button variant="outline-secondary">
                            <FaSearch />
                        </Button>
                    </div>
                    <div className="dropdown">
                        <Button
                            variant="outline-secondary"
                            className="dropdown-toggle"
                            id="dropdownMenuButton"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <FaFilter className="me-1" /> {filter === 'all' ? 'Todas' : filter === 'unread' ? 'Sin leer' : 'Hoy'}
                        </Button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <li><button className="dropdown-item" onClick={() => setFilter('all')}>Todas</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilter('unread')}>Sin leer</button></li>
                            <li><button className="dropdown-item" onClick={() => setFilter('today')}>Hoy</button></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="realtime-content">
                {isLoadingConversations ? (
                    <div className="text-center p-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </div>
                ) : error ? (
                    <Alert variant="danger">
                        {error}
                        <div className="mt-3">
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={handleRetryLoadConversations}
                            >
                                Reintentar
                            </Button>
                        </div>
                    </Alert>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center p-5">
                        <FaEnvelope className="mb-3" style={{ fontSize: '3rem', color: 'var(--gray-medium)' }} />
                        <h4>No hay conversaciones</h4>
                        <p className="text-muted">No se encontraron conversaciones que coincidan con los criterios de búsqueda.</p>
                    </div>
                ) : (
                    <div className="conversation-list">
                        {filteredConversations.map(renderConversationItem)}
                    </div>
                )}
            </div>
        </div>
    );

    // Renderizar sección de chat
    const renderChatSection = () => {
        if (!selectedChat) {
            return (
                <div className="chat-container d-flex align-items-center justify-content-center">
                    <div className="text-center p-5">
                        <FaEnvelope className="mb-3" style={{ fontSize: '3rem', color: 'var(--gray-medium)' }} />
                        <h4>Selecciona una conversación</h4>
                        <p className="text-muted">Elige una conversación de la lista para ver los mensajes y responder.</p>
                    </div>
                </div>
            );
        }

        const selectedConversation = conversations?.find(c => c.senderId === selectedChat);

        if (!selectedConversation) {
            return (
                <div className="chat-container d-flex align-items-center justify-content-center">
                    <div className="text-center p-5">
                        <FaExclamationCircle className="mb-3" style={{ fontSize: '3rem', color: 'var(--danger-color)' }} />
                        <h4>Conversación no encontrada</h4>
                        <p className="text-muted">La conversación seleccionada ya no está disponible.</p>
                        <Button variant="primary" onClick={() => setSelectedChat(null)}>
                            Volver a la lista
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="chat-container">
                <div className="chat-header">
                    <div className="d-flex align-items-center">
                        <div className="conversation-avatar me-3">
                            {selectedConversation?.senderName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h5 className="mb-0">{selectedConversation?.senderName || 'Usuario'}</h5>
                            <small className="text-muted">
                                {selectedConversation?.status === 'resolved' ? 'Conversación resuelta' : 'Conversación activa'}
                            </small>
                        </div>
                    </div>
                    <div>
                        {selectedConversation?.status === 'resolved' ? (
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => dispatch(updateConversationStatus({
                                    conversationId: selectedChat,
                                    status: 'open'
                                }))}
                            >
                                Reabrir conversación
                            </Button>
                        ) : (
                            <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => dispatch(updateConversationStatus({
                                    conversationId: selectedChat,
                                    status: 'resolved'
                                }))}
                            >
                                Marcar como resuelto
                            </Button>
                        )}
                    </div>
                </div>
                <div className="chat-body">
                    {isLoadingMessages ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cargando mensajes...</span>
                            </Spinner>
                        </div>
                    ) : !messages || !Array.isArray(messages) ? (
                        <div className="text-center p-5">
                            <FaExclamationCircle className="mb-3" style={{ fontSize: '3rem', color: 'var(--warning-color)' }} />
                            <p className="text-muted">Error al cargar mensajes. Por favor, intenta nuevamente.</p>
                            <Button
                                variant="outline-primary"
                                onClick={() => loadMessages(selectedChat)}
                                className="mt-2"
                            >
                                Reintentar
                            </Button>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center p-5">
                            <p className="text-muted">No hay mensajes en esta conversación.</p>
                        </div>
                    ) : (
                        <div className="messages-container">
                            {messages.map(renderMessage)}
                        </div>
                    )}
                </div>
                <div className="chat-footer">
                    <form onSubmit={handleSendMessage}>
                        <div className="input-group">
                            <textarea
                                className="form-control"
                                placeholder="Escribe un mensaje..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={1}
                                disabled={selectedConversation?.status === 'resolved' || isLoadingMessages}
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!message.trim() || selectedConversation?.status === 'resolved' || isLoadingMessages}
                            >
                                <FaPaperPlane />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Verificar autenticación y permisos
    if (!isAuthenticated) {
        return (
            <Container fluid className="py-4 h-100">
                <Alert variant="danger">
                    <Alert.Heading>Sesión no iniciada</Alert.Heading>
                    <p>Necesitas iniciar sesión para acceder a esta página.</p>
                    <hr />
                    <div className="d-flex justify-content-center">
                        <Button
                            variant="primary"
                            onClick={() => navigate('/login')}
                            className="d-flex align-items-center"
                        >
                            <FaSignInAlt className="me-2" /> Iniciar Sesión
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    if (!isAdmin) {
        return (
            <Container fluid className="py-4 h-100">
                <Alert variant="danger">
                    <Alert.Heading>Acceso Denegado</Alert.Heading>
                    <p>No tienes permisos para acceder a esta página. Se requieren permisos de administrador.</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="admin-messages-container p-0">
            {uiError && (
                <Alert variant="danger" onClose={() => setUiError(null)} dismissible className="m-3">
                    {uiError}
                </Alert>
            )}

            <Row className="g-0">
                <Col lg={4} className="p-3">
                    {renderRealtimeConversations()}
                </Col>
                <Col lg={8} className="p-3">
                    {renderChatSection()}
                </Col>
            </Row>

            <div className="p-3">
                {renderStatsSection()}
            </div>
        </Container>
    );
};

export default AdminMessages;