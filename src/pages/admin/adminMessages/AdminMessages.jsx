import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import {
    FaEnvelope,
    FaUserCircle,
    FaGlobe,
    FaSearch,
    FaPaperPlane,
    FaExclamationCircle,
    FaSignInAlt,
    FaTrashAlt,
    FaCheckCircle,
    FaInfoCircle,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    sendMessage,
    getConversations,
    getDirectMessages,
    markMessageAsRead,
    updateConversationStatus,
    getPublicMessagesByPublicId,
    addMessage,
    setConnectionStatus,
    clearMessages,
    deleteConversation
} from '../../../features/chat/chatSlice';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import "./AdminMessages.css";
import { toast } from 'react-hot-toast';
import { connectSocket, disconnectSocket, onSocketEvent, emitSocketEvent } from '../../../services/chat/chatSocket';

const AdminMessages = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { conversations, messages, loading, error } = useSelector((state) => state.chat);
    const { user, isAuthenticated, isAdmin } = useSelector((state) => state.auth);
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [uiError, setUiError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'today'
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [showIpList, setShowIpList] = useState(false);
    const [ipList, setIpList] = useState([
        { ip: '192.168.1.1', lastAccess: '2024-03-27 10:30:00', visits: 5 },
        { ip: '192.168.1.2', lastAccess: '2024-03-27 11:15:00', visits: 3 },
        // Aquí se pueden agregar más IPs desde el backend
    ]);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showInfoDropdown, setShowInfoDropdown] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);

    // Función para hacer scroll al último mensaje
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Efecto para hacer scroll al último mensaje cuando cambian los mensajes
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

    // Cargar conversaciones
    const loadConversations = useCallback(async () => {
        try {
            console.log('🔄 Cargando conversaciones...');
            setIsLoadingConversations(true);
            const data = await dispatch(getConversations()).unwrap();
            console.log('📋 Conversaciones cargadas:', data);

            // Separar y contar tipos de conversaciones para depuración
            const publicConvs = data.filter(conv => conv.isPublic);
            const directConvs = data.filter(conv => !conv.isPublic);

            console.log(`📊 Resumen de conversaciones:
            - Total: ${data.length}
            - Públicas: ${publicConvs.length}
            - Directas: ${directConvs.length}`);

            // Mostrar IDs de conversaciones para verificación
            console.log('🔍 IDs de conversaciones públicas:',
                publicConvs.map(c => ({ id: c._id, conversationId: c.conversationId })));

            setConversations(data);
            if (data.length > 0 && !selectedConversation) {
                setSelectedConversation(data[0]._id);
            }
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
            toast.error('No se pudieron cargar las conversaciones');
        } finally {
            setIsLoadingConversations(false);
        }
    }, [dispatch, selectedConversation]);

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
            console.log('📂 CARGANDO MENSAJES PARA:', chatId);

            // Determinar el tipo de ID (público o MongoDB)
            const isPublicId = /^[a-zA-Z0-9]{32}$/.test(chatId);
            const isMongoId = /^[0-9a-fA-F]{24}$/.test(chatId);
            const isCompoundId = /^[0-9a-fA-F]{24}-[0-9a-fA-F]{24}$/.test(chatId);

            console.log('Tipo de ID detectado:', {
                isPublicId,
                isMongoId,
                isCompoundId
            });

            // Cargar mensajes según el tipo de ID
            let result;
            if (isPublicId) {
                console.log('Cargando mensajes públicos para:', chatId);
                result = await dispatch(getPublicMessagesByPublicId(chatId)).unwrap();
            } else {
                console.log('Cargando mensajes directos para:', chatId);
                result = await dispatch(getDirectMessages(chatId)).unwrap();
            }

            console.log(`✅ MENSAJES CARGADOS: ${result.length} mensajes`);

            // Hacer scroll al último mensaje después de cargar
            setTimeout(scrollToBottom, 100);

        } catch (err) {
            console.error('❌ ERROR AL CARGAR MENSAJES:', err);
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
            const unreadMessages = messages.filter(msg =>
                !msg.isRead &&
                msg.receiver &&
                (typeof msg.receiver === 'object'
                    ? msg.receiver._id.toString()
                    : msg.receiver.toString()) === user._id.toString()
            );

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
    }, [selectedChat, messages, dispatch, user?._id]);

    // Filtrar conversaciones según el filtro seleccionado
    const filteredConversations = useMemo(() => {
        if (!conversations || !Array.isArray(conversations)) return [];

        let filtered = [...conversations];

        // Filtrar las conversaciones donde el admin es el remitente
        filtered = filtered.filter(conv => {
            // Si es una conversación pública, siempre la mostramos
            if (conv.isPublic) return true;

            // Para conversaciones directas, solo mostramos las que el admin recibió
            const lastMessageSenderId = conv.lastMessageSender?._id?.toString() || conv.lastMessageSender;
            return lastMessageSenderId !== user?._id?.toString();
        });

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
    }, [conversations, searchQuery, filter, user?._id]);

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

        // Solo contar mensajes no leídos que fueron recibidos (no enviados por el admin)
        const unreadMessages = conversations.reduce((total, conv) => {
            const unreadCount = conv.messages?.filter(msg =>
                !msg.isRead &&
                (
                    (typeof msg.sender === 'string' && msg.sender !== user._id) ||
                    (typeof msg.sender === 'object' && msg.sender._id !== user._id)
                )
            ).length || 0;
            return total + unreadCount;
        }, 0);

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
    }, [conversations, user?._id]);

    // Manejar selección de conversación
    const handleChatSelect = (conversationId) => {
        if (!conversationId) return;

        const matchingConversation = conversations.find(
            conv => conv.conversationId === conversationId
        );

        if (matchingConversation) {
            setSelectedConversation(matchingConversation);
            setSelectedChat(conversationId);
            loadMessages(conversationId);
        } else {
            console.error('No se encontró la conversación con ID:', conversationId);
            toast.error('No se pudo cargar la conversación seleccionada');
        }
    };

    // Manejar envío de mensaje
    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() || !selectedChat) {
            toast.error('Por favor, selecciona un chat y escribe un mensaje');
            return;
        }

        const isPublicChat = selectedConversation?.isPublic || /^[a-zA-Z0-9]{32}$/.test(selectedChat);
        const receiverId = isPublicChat ? selectedChat : selectedConversation?.senderId;

        const messageData = {
            receiver: receiverId,
            text: message,
            isPublic: isPublicChat
        };

        try {
            setIsLoadingMessages(true);

            // Enviar mensaje a través de HTTP (para persistencia)
            const result = await dispatch(sendMessage(messageData)).unwrap();
            console.log('✅ MENSAJE ENVIADO:', result);

            // También emitir el mensaje a través del socket para comunicación en tiempo real
            if (socket && socket.connected) {
                console.log('📤 Emitiendo mensaje a través del socket');
                emitSocketEvent('send_message', {
                    ...messageData,
                    _id: result._id, // Usar el ID generado por el servidor
                    createdAt: result.createdAt,
                    sender: user._id,
                    conversationId: result.conversationId
                });
            } else {
                console.warn('⚠️ Socket no conectado, mensaje enviado solo por HTTP');
            }

            dispatch(addMessage(result));
            setMessage('');

            // Actualizar conversación con último mensaje
            if (result && result.conversationId) {
                const updatedConversation = {
                    ...selectedConversation,
                    lastMessage: result.text,
                    lastMessageDate: result.createdAt,
                    lastMessageSender: user?._id,
                    unreadCount: 0
                };
                setSelectedConversation(updatedConversation);
                console.log('🔄 Conversación actualizada localmente:', updatedConversation);
            }

            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error('❌ ERROR AL ENVIAR MENSAJE:', err);
            toast.error(`Error al enviar: ${err.message || 'Desconocido'}`);
        } finally {
            setIsLoadingMessages(false);
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
        if (!conversation || !conversation.conversationId) {
            console.error('Invalid conversation object:', conversation);
            return null;
        }

        const isActive = selectedChat === conversation.conversationId;
        const hasUnread = conversation.unreadCount > 0;
        const isDeleting = conversationToDelete === conversation.conversationId;

        return (
            <div
                key={conversation.conversationId}
                className={`conversation-item ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''} fade-in`}
            >
                <div
                    className="conversation-content"
                    onClick={() => handleChatSelect(conversation.conversationId)}
                >
                    <div className="conversation-avatar">
                        {conversation.senderName?.charAt(0) || 'U'}
                    </div>
                    <div className="conversation-details">
                        <div className="conversation-name">
                            <span>{conversation.senderName || 'Usuario'}</span>
                            {conversation.isPublic && (
                                <Badge bg="info" className="ms-1">Público</Badge>
                            )}
                            {conversation.status === 'resolved' && (
                                <Badge bg="success" className="ms-1">Resuelto</Badge>
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
                <div className="conversation-actions">
                    {isDeleting ? (
                        <div className="delete-confirmation-dropdown">
                            <div className="delete-confirmation-text">¿Eliminar?</div>
                            <div className="delete-confirmation-buttons">
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteConversation(conversation.conversationId);
                                    }}
                                    className="confirm-delete-btn"
                                    title="Confirmar eliminación"
                                >
                                    <FaCheckCircle size={12} />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConversationToDelete(null);
                                    }}
                                    className="cancel-delete-btn"
                                    title="Cancelar"
                                >
                                    <FaExclamationCircle size={12} />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('🖱️ Click en botón eliminar para:', conversation.conversationId);
                                setConversationToDelete(conversation.conversationId);
                            }}
                            className="delete-conversation-btn"
                            title="Eliminar conversación"
                        >
                            <FaTrashAlt size={12} />
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    // Renderizar un mensaje individual
    const renderMessage = (message) => {
        // Obtener los IDs de forma segura
        const userIdFromRedux = user?._id?.toString();

        // Determinar el ID del remitente del mensaje
        let senderId;
        if (typeof message.sender === 'object' && message.sender?._id) {
            senderId = message.sender._id.toString();
        } else if (typeof message.sender === 'string') {
            senderId = message.sender;
        } else {
            senderId = 'unknown';
        }

        // Determinar si el mensaje fue enviado por el usuario actual
        const isSent = userIdFromRedux === senderId;

        console.log('💬 Análisis de mensaje:', {
            msgId: message._id,
            senderId,
            userIdFromRedux,
            isSent
        });

        // Estilos inline para garantizar que la alineación funcione
        return (
            <div
                key={message._id}
                style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: isSent ? 'flex-end' : 'flex-start',
                    marginBottom: '10px'
                }}
            >
                <div
                    style={{
                        maxWidth: '70%',
                        padding: '10px 15px',
                        borderRadius: isSent ? '15px 15px 5px 15px' : '15px 15px 15px 5px',
                        backgroundColor: isSent ? '#4a6cf7' : '#f0f0f0',
                        color: isSent ? 'white' : '#333',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <div style={{ marginBottom: '5px', wordBreak: 'break-word' }}>
                        {message.text}
                    </div>
                    <div
                        style={{
                            fontSize: '0.75rem',
                            opacity: 0.7,
                            textAlign: 'right',
                            color: isSent ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.6)'
                        }}
                    >
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar sección de estadísticas
    const renderStatsSection = () => (
        <div className="stats-section">
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
                        {ipList.length > 0 && (
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => setShowIpList(!showIpList)}
                                className="d-block mx-auto mt-2"
                            >
                                {showIpList ? 'Ocultar detalles' : 'Ver detalles'}
                            </Button>
                        )}
                    </div>
                    {showIpList && (
                        <div className="ip-list-container mt-3">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>IP</th>
                                        <th>Último acceso</th>
                                        <th>Visitas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ipList.map((ip, index) => (
                                        <tr key={index}>
                                            <td>{ip.ip}</td>
                                            <td>{ip.lastAccess}</td>
                                            <td>{ip.visits}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
                <div className="d-flex flex-column gap-2">
                    <div className="search-container w-100">
                        <div className="input-group">
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
                    </div>
                    <div className="filter-container w-100">
                        <div className="btn-group w-100">
                            <Button
                                variant={filter === 'all' ? 'primary' : 'outline-primary'}
                                onClick={() => setFilter('all')}
                                className="flex-grow-1"
                            >
                                Todas
                            </Button>
                            <Button
                                variant={filter === 'unread' ? 'primary' : 'outline-primary'}
                                onClick={() => setFilter('unread')}
                                className="flex-grow-1"
                            >
                                Sin leer
                            </Button>
                            <Button
                                variant={filter === 'today' ? 'primary' : 'outline-primary'}
                                onClick={() => setFilter('today')}
                                className="flex-grow-1"
                            >
                                Hoy
                            </Button>
                        </div>
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

        const selectedConversation = conversations?.find(c => c.conversationId === selectedChat);

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

        // Filtrar mensajes para mostrar solo los de la conversación actual
        const currentMessages = messages.filter(msg => {
            if (!msg || !msg._id) return false;

            const senderId = msg.sender?._id ? msg.sender._id.toString() :
                typeof msg.sender === 'string' ? msg.sender : null;

            const receiverId = msg.receiver?._id ? msg.receiver._id.toString() :
                typeof msg.receiver === 'string' ? msg.receiver : null;

            const currentUserId = user?._id?.toString();

            // Para mensajes directos
            if (selectedConversation && !selectedConversation.isPublic) {
                // Verificar si el mensaje pertenece a esta conversación directa
                return (
                    (senderId === currentUserId && receiverId === selectedConversation.senderId) ||
                    (senderId === selectedConversation.senderId && receiverId === currentUserId)
                );
            }

            // Para mensajes públicos
            if (selectedConversation?.isPublic) {
                return msg.isPublic && msg.conversationId === selectedChat;
            }

            // Fallback para otros casos
            return msg.conversationId === selectedChat;
        });

        currentMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        console.log(`✅ Mostrando ${currentMessages.length} mensajes para la conversación ${selectedChat}`);

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
                    <div className="d-flex gap-2">
                        <div className="position-relative">
                            <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => setShowInfoDropdown(!showInfoDropdown)}
                                title="Ver información de la conversación"
                            >
                                <FaInfoCircle />
                            </Button>

                            {showInfoDropdown && selectedConversation && (
                                <div className="info-dropdown">
                                    <div className="info-dropdown-content">
                                        <div className="info-header">
                                            <h4>Información de la conversación</h4>
                                            <button
                                                className="close-info-button"
                                                onClick={() => setShowInfoDropdown(false)}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                        <div className="info-body">
                                            <div className="info-item">
                                                <strong>ID:</strong>
                                                <span>{selectedConversation.conversationId}</span>
                                            </div>
                                            <div className="info-item">
                                                <strong>Estado:</strong>
                                                <span className={`badge status-${selectedConversation.status || 'open'}`}>
                                                    {selectedConversation.status === 'closed' ? 'Cerrada' : 'Abierta'}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <strong>Tipo:</strong>
                                                <span className={`badge ${selectedConversation.isPublic ? 'public' : 'private'}`}>
                                                    {selectedConversation.isPublic ? 'Pública' : 'Privada'}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <strong>Fecha de inicio:</strong>
                                                <span>{new Date(selectedConversation.messages[0]?.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="info-item">
                                                <strong>Último mensaje:</strong>
                                                <span>{new Date(selectedConversation.lastMessageDate).toLocaleString()}</span>
                                            </div>
                                            <div className="info-item">
                                                <strong>Mensajes no leídos:</strong>
                                                <span>{selectedConversation.unreadCount}</span>
                                            </div>
                                            <div className="info-item">
                                                <strong>Remitente:</strong>
                                                <span>{selectedConversation.senderName}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="chat-body">
                    {isLoadingMessages ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cargando mensajes...</span>
                            </Spinner>
                        </div>
                    ) : !currentMessages || !Array.isArray(currentMessages) ? (
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
                    ) : currentMessages.length === 0 ? (
                        <div className="text-center p-5">
                            <p className="text-muted">No hay mensajes en esta conversación.</p>
                        </div>
                    ) : (
                        <div className="messages-container">
                            {currentMessages.map((message) => renderMessage(message))}
                            <div ref={messagesEndRef} />
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

    // Mantener el renderInfoModal original
    const renderInfoModal = () => {
        if (!selectedConversation) return null;

        return (
            <Modal
                show={showInfoModal}
                onHide={() => setShowInfoModal(false)}
                className="info-modal"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Información de la Conversación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="info-item">
                        <span className="info-label">ID de Conversación:</span>
                        <span className="info-value">{selectedConversation.conversationId}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Estado:</span>
                        <span className="info-value">
                            <span className={`info-badge ${selectedConversation.status?.toLowerCase() || 'active'}`}>
                                {selectedConversation.status === 'resolved' ? 'Resuelto' : 'Activo'}
                            </span>
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Tipo:</span>
                        <span className="info-value">
                            <span className={`info-badge ${selectedConversation.isPublic ? 'public' : 'private'}`}>
                                {selectedConversation.isPublic ? 'Público' : 'Privado'}
                            </span>
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Fecha de Inicio:</span>
                        <span className="info-value">
                            {selectedConversation.createdAt ? new Date(selectedConversation.createdAt).toLocaleString() : 'No disponible'}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Último Mensaje:</span>
                        <span className="info-value">
                            {selectedConversation.lastMessageDate ? new Date(selectedConversation.lastMessageDate).toLocaleString() : 'No disponible'}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Mensajes No Leídos:</span>
                        <span className="info-value">
                            {selectedConversation.unreadCount || 0}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Remitente:</span>
                        <span className="info-value">
                            {selectedConversation.senderName || 'Usuario Anónimo'}
                        </span>
                    </div>
                    {selectedConversation.lastMessageSender && (
                        <div className="info-item">
                            <span className="info-label">Último Remitente:</span>
                            <span className="info-value">
                                {selectedConversation.lastMessageSender === user?._id ? 'Tú (Admin)' : selectedConversation.senderName || 'Usuario'}
                            </span>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowInfoModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };

    // Inicializar socket para recibir mensajes en tiempo real
    useEffect(() => {
        if (!isAuthenticated || !isAdmin) return;

        const initializeSocket = () => {
            // Obtener el token de las cookies
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('jwt='))
                ?.split('=')[1];

            if (!token) {
                console.error('No se encontró el token JWT');
                return;
            }

            console.log('Inicializando socket con token...');
            const newSocket = connectSocket(user._id, false, token);
            setSocket(newSocket);

            if (newSocket) {
                onSocketEvent('connect', () => {
                    console.log('Socket conectado en AdminMessages');
                    dispatch(setConnectionStatus(true));
                    // Recargar conversaciones al reconectar
                    dispatch(getConversations());
                });

                onSocketEvent('disconnect', () => {
                    console.log('Socket desconectado en AdminMessages');
                    dispatch(setConnectionStatus(false));
                });

                onSocketEvent('connect_error', (error) => {
                    console.error('Error de conexión socket:', error);
                    // Si el error es de autenticación, intentar reconectar con nuevo token
                    if (error.message.includes('Authentication')) {
                        console.log('Intentando reconexión por error de autenticación...');
                        disconnectSocket();
                        setTimeout(initializeSocket, 1000);
                    }
                });

                onSocketEvent('message', (message) => {
                    console.log('Nuevo mensaje recibido en AdminMessages:', message);

                    // Determinar el ID del remitente del mensaje
                    let senderId;
                    if (typeof message.sender === 'object' && message.sender?._id) {
                        senderId = message.sender._id.toString();
                    } else if (typeof message.sender === 'string') {
                        senderId = message.sender;
                    } else {
                        senderId = 'unknown';
                    }

                    // Determinar el ID del receptor del mensaje
                    let receiverId;
                    if (typeof message.receiver === 'object' && message.receiver?._id) {
                        receiverId = message.receiver._id.toString();
                    } else if (typeof message.receiver === 'string') {
                        receiverId = message.receiver;
                    } else {
                        receiverId = 'unknown';
                    }

                    // Determinar si el mensaje fue enviado por el usuario actual
                    const isPublicMessage = message.isPublic === true;
                    const isPublicChat = selectedConversation?.isPublic || /^[a-zA-Z0-9]{32}$/.test(selectedChat);

                    // Un mensaje es recibido (aparece a la derecha) si:
                    // 1. El senderId NO coincide con el ID del admin (userIdFromRedux)
                    // 2. O si es un mensaje público y el senderId NO coincide con el selectedChat
                    const isReceived = userIdFromRedux !== senderId && !(isPublicMessage && isPublicChat && senderId === selectedChat);

                    console.log('💬 Análisis de mensaje:', {
                        msgId: message._id,
                        senderId,
                        receiverId,
                        conversationId: message.conversationId,
                        selectedChat,
                        isReceived,
                        isPublic: message.isPublic,
                        isPublicMessage,
                        isPublicChat,
                        userIdFromRedux
                    });

                    dispatch(addMessage(message));

                    // Si el mensaje pertenece a la conversación actual, solo hacer scroll
                    if (selectedChat === message.conversationId) {
                        console.log(`Nuevo mensaje pertenece al chat actual (${selectedChat}), haciendo scroll.`);
                        // Ya no recargamos mensajes, solo hacemos scroll
                        // El componente debería re-renderizar con el nuevo mensaje de la store
                        setTimeout(scrollToBottom, 100); // Pequeño delay para asegurar renderizado
                    }

                    // Actualizar la lista de conversaciones para reflejar el último mensaje/estado
                    // Esto es necesario porque getConversations agrega datos como lastMessage y unreadCount
                    console.log('Recargando lista de conversaciones para actualizar previews.');
                    dispatch(getConversations());
                });

                onSocketEvent('error', (error) => {
                    console.error('Error en socket:', error);
                    toast.error('Error en la conexión: ' + error.message);
                });
            }
        };

        initializeSocket();

        return () => {
            console.log('Limpiando chat...');
            dispatch(clearMessages());
            disconnectSocket();
        };
    }, [dispatch, isAuthenticated, isAdmin, user?._id, selectedChat]);

    // Manejar eliminación de conversación
    const handleDeleteConversation = async (id) => {
        try {
            console.log('🗑️ Intentando eliminar conversación con ID:', id);
            const convToDelete = conversations.find(conv => conv._id === id);

            if (!convToDelete) {
                console.error('❌ No se encontró la conversación a eliminar');
                return;
            }

            console.log('📝 Detalles de la conversación a eliminar:', {
                _id: convToDelete._id,
                conversationId: convToDelete.conversationId,
                isPublic: convToDelete.isPublic,
                lastMessage: convToDelete.lastMessage?.text?.substring(0, 30) + '...'
            });

            const response = await dispatch(deleteConversation(id)).unwrap();
            console.log('✅ Conversación eliminada exitosamente:', response);

            // Actualizar el estado después de eliminar
            setConversations(prevConversations => prevConversations.filter(conv => conv._id !== id));
            if (selectedConversation === id) {
                const newConversations = conversations.filter(conv => conv._id !== id);
                setSelectedConversation(newConversations.length > 0 ? newConversations[0]._id : null);
                setMessages([]);
            }
            setShowDropdown(null);
            toast.success('Conversación eliminada con éxito');
        } catch (error) {
            console.error('Error al eliminar conversación:', error);
            toast.error('No se pudo eliminar la conversación');
        }
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
        <Container fluid className="admin-messages-container">
            {uiError && (
                <Alert variant="danger" onClose={() => setUiError(null)} dismissible className="m-3">
                    {uiError}
                </Alert>
            )}

            <Row className="h-100">
                <Col lg={3} md={4} className="conversations-column">
                    {renderRealtimeConversations()}
                </Col>
                <Col lg={6} md={8} className="chat-column">
                    {renderChatSection()}
                </Col>
                <Col lg={3} className="stats-column d-none d-lg-block">
                    <div className="stats-section">
                        <div className="stats-title">Estadísticas de Mensajes</div>
                        {renderStatsSection()}
                    </div>
                </Col>
            </Row>
            {renderInfoModal()}
        </Container>
    );
};

export default AdminMessages;
