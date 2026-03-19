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
    FaArrowLeft,
    FaComments,
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
    const [filter, setFilter] = useState('all');
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [showIpList, setShowIpList] = useState(false);
    const [ipList, setIpList] = useState([
        { ip: '192.168.1.1', lastAccess: '2024-03-27 10:30:00', visits: 5 },
        { ip: '192.168.1.2', lastAccess: '2024-03-27 11:15:00', visits: 3 },
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

            const publicConvs = data.filter(conv => conv.isPublic);
            const directConvs = data.filter(conv => !conv.isPublic);

            console.log(`📊 Resumen de conversaciones:
            - Total: ${data.length}
            - Públicas: ${publicConvs.length}
            - Directas: ${directConvs.length}`);

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

    const handleRetryLoadConversations = () => {
        loadConversations();
    };

    // Cargar mensajes cuando se selecciona una conversación
    const loadMessages = useCallback(async (chatId) => {
        if (!chatId || !isAuthenticated || !isAdmin) return;

        try {
            setIsLoadingMessages(true);
            console.log('📂 CARGANDO MENSAJES PARA:', chatId);

            const isPublicId = /^[a-zA-Z0-9]{32}$/.test(chatId);
            const isMongoId = /^[0-9a-fA-F]{24}$/.test(chatId);
            const isCompoundId = /^[0-9a-fA-F]{24}-[0-9a-fA-F]{24}$/.test(chatId);

            console.log('Tipo de ID detectado:', { isPublicId, isMongoId, isCompoundId });

            let result;
            if (isPublicId) {
                console.log('Cargando mensajes públicos para:', chatId);
                result = await dispatch(getPublicMessagesByPublicId(chatId)).unwrap();
            } else {
                console.log('Cargando mensajes directos para:', chatId);
                result = await dispatch(getDirectMessages(chatId)).unwrap();
            }

            console.log(`✅ MENSAJES CARGADOS: ${result.length} mensajes`);
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

        filtered = filtered.filter(conv => {
            if (conv.isPublic) return true;
            const lastMessageSenderId = conv.lastMessageSender?._id?.toString() || conv.lastMessageSender;
            return lastMessageSenderId !== user?._id?.toString();
        });

        if (searchQuery) {
            filtered = filtered.filter(conv =>
                (conv.senderName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (conv.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

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

            const result = await dispatch(sendMessage(messageData)).unwrap();
            console.log('✅ MENSAJE ENVIADO:', result);

            if (socket && socket.connected) {
                console.log('📤 Emitiendo mensaje a través del socket');
                emitSocketEvent('send_message', {
                    ...messageData,
                    _id: result._id,
                    createdAt: result.createdAt,
                    sender: user._id,
                    conversationId: result.conversationId
                });
            } else {
                console.warn('⚠️ Socket no conectado, mensaje enviado solo por HTTP');
            }

            dispatch(addMessage(result));
            setMessage('');

            if (result && result.conversationId) {
                const updatedConversation = {
                    ...selectedConversation,
                    lastMessage: result.text,
                    lastMessageDate: result.createdAt,
                    lastMessageSender: user?._id,
                    unreadCount: 0
                };
                setSelectedConversation(updatedConversation);
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
        if (!date) return '';

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
            return '';
        }
    };

    // Inicializar socket para recibir mensajes en tiempo real
    useEffect(() => {
        if (!isAuthenticated || !isAdmin) return;

        const initializeSocket = () => {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('jwt='))
                ?.split('=')[1];

            if (!token) {
                console.error('No se encontró el token JWT');
                return;
            }

            console.log('Inicializando socket...');
            const newSocket = connectSocket(user._id, false, token);
            setSocket(newSocket);

            if (newSocket) {
                onSocketEvent('connect', () => {
                    console.log('Socket conectado en AdminMessages');
                    dispatch(setConnectionStatus(true));
                    dispatch(getConversations());
                });

                onSocketEvent('disconnect', () => {
                    console.log('Socket desconectado en AdminMessages');
                    dispatch(setConnectionStatus(false));
                });

                onSocketEvent('connect_error', (error) => {
                    console.error('Error de conexión socket:', error);
                    if (error.message.includes('Authentication')) {
                        console.log('Intentando reconexión por error de autenticación...');
                        disconnectSocket();
                        setTimeout(initializeSocket, 1000);
                    }
                });

                onSocketEvent('message', (message) => {
                    console.log('Nuevo mensaje recibido en AdminMessages:', message);

                    let senderId;
                    if (typeof message.sender === 'object' && message.sender?._id) {
                        senderId = message.sender._id.toString();
                    } else if (typeof message.sender === 'string') {
                        senderId = message.sender;
                    } else {
                        senderId = 'unknown';
                    }

                    let receiverId;
                    if (typeof message.receiver === 'object' && message.receiver?._id) {
                        receiverId = message.receiver._id.toString();
                    } else if (typeof message.receiver === 'string') {
                        receiverId = message.receiver;
                    } else {
                        receiverId = 'unknown';
                    }

                    const userIdFromRedux = user?._id?.toString();
                    const isPublicMessage = message.isPublic === true;
                    const isPublicChat = selectedConversation?.isPublic || /^[a-zA-Z0-9]{32}$/.test(selectedChat);

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

                    if (selectedChat === message.conversationId) {
                        setTimeout(scrollToBottom, 100);
                    }

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
            console.log('Desconectando socket...');
            disconnectSocket();
        };
    }, [dispatch, isAuthenticated, isAdmin, user?._id]);

    useEffect(() => {
        return () => {
            console.log('Componente AdminMessages desmontado, limpiando mensajes...');
            dispatch(clearMessages());
        };
    }, [dispatch]);

    // Manejar eliminación de conversación
    const handleDeleteConversation = async (id) => {
        try {
            console.log('🗑️ Intentando eliminar conversación con ID:', id);
            const convToDelete = conversations.find(conv => conv._id === id);

            if (!convToDelete) {
                console.error('❌ No se encontró la conversación a eliminar');
                return;
            }

            const response = await dispatch(deleteConversation(id)).unwrap();
            console.log('✅ Conversación eliminada exitosamente:', response);

            setConversations(prevConversations => prevConversations.filter(conv => conv._id !== id));
            if (selectedConversation === id) {
                const newConversations = conversations.filter(conv => conv._id !== id);
                setSelectedConversation(newConversations.length > 0 ? newConversations[0]._id : null);
                setMessages([]);
            }
            setConversationToDelete(null);
            toast.success('Conversación eliminada con éxito');
        } catch (error) {
            console.error('Error al eliminar conversación:', error);
            toast.error('No se pudo eliminar la conversación');
        }
    };

    // Manejar tecla Enter para enviar
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    // Volver a lista (mobile)
    const handleBackToList = () => {
        setSelectedChat(null);
        setSelectedConversation(null);
    };

    // ============================================
    // RENDER HELPERS
    // ============================================

    // Obtener mensajes filtrados para la conversación actual
    const getCurrentMessages = () => {
        if (!selectedChat || !selectedConversation) return [];

        const currentMessages = messages.filter(msg => {
            if (!msg || !msg._id) return false;

            const senderId = msg.sender?._id ? msg.sender._id.toString() :
                typeof msg.sender === 'string' ? msg.sender : null;

            const receiverId = msg.receiver?._id ? msg.receiver._id.toString() :
                typeof msg.receiver === 'string' ? msg.receiver : null;

            const currentUserId = user?._id?.toString();

            if (selectedConversation && !selectedConversation.isPublic) {
                return (
                    (senderId === currentUserId && receiverId === selectedConversation.senderId) ||
                    (senderId === selectedConversation.senderId && receiverId === currentUserId)
                );
            }

            if (selectedConversation?.isPublic) {
                return msg.isPublic && msg.conversationId === selectedChat;
            }

            return msg.conversationId === selectedChat;
        });

        currentMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return currentMessages;
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

    const currentMessages = getCurrentMessages();

    return (
        <div className="msg-panel">
            {/* Header */}
            <div className="msg-header">
                <div className="msg-header-title">
                    <FaComments className="msg-header-icon" />
                    <h2>Mensajes</h2>
                </div>
                <div className="msg-header-stats">
                    <div className="msg-stat-pill">
                        <FaEnvelope />
                        <span className="msg-stat-count">{stats.todayMessages}</span> hoy
                    </div>
                    <div className="msg-stat-pill">
                        <FaExclamationCircle />
                        <span className="msg-stat-count">{stats.unreadMessages}</span> sin leer
                    </div>
                    <div className="msg-stat-pill">
                        <FaUserCircle />
                        <span className="msg-stat-count">{stats.totalConversations}</span> chats
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {uiError && (
                <Alert variant="danger" onClose={() => setUiError(null)} dismissible className="m-2 mb-0">
                    {uiError}
                </Alert>
            )}

            {/* Body */}
            <div className="msg-body">
                {/* Columna izquierda — Lista de conversaciones */}
                <div className="msg-conversations-col">
                    {/* Buscador */}
                    <div className="msg-search-box">
                        <FaSearch className="msg-search-icon" />
                        <input
                            type="text"
                            className="msg-search-input"
                            placeholder="Buscar conversaciones..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filtros */}
                    <div className="msg-filter-bar">
                        <button
                            className={`msg-filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Todas
                        </button>
                        <button
                            className={`msg-filter-btn ${filter === 'unread' ? 'active' : ''}`}
                            onClick={() => setFilter('unread')}
                        >
                            Sin leer
                        </button>
                        <button
                            className={`msg-filter-btn ${filter === 'today' ? 'active' : ''}`}
                            onClick={() => setFilter('today')}
                        >
                            Hoy
                        </button>
                    </div>

                    {/* Lista */}
                    <div className="msg-conversations-list">
                        {isLoadingConversations ? (
                            <div className="msg-loading">
                                <Spinner animation="border" size="sm" />
                                <span>Cargando...</span>
                            </div>
                        ) : error ? (
                            <div className="msg-empty">
                                <FaExclamationCircle style={{ fontSize: '2rem', color: '#dc3545' }} />
                                <span>{error}</span>
                                <button
                                    className="msg-filter-btn active"
                                    onClick={handleRetryLoadConversations}
                                    style={{ width: 'auto', padding: '6px 16px' }}
                                >
                                    Reintentar
                                </button>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="msg-empty">
                                <FaEnvelope style={{ fontSize: '2rem' }} />
                                <span>No hay conversaciones</span>
                            </div>
                        ) : (
                            filteredConversations.map((conversation) => {
                                if (!conversation || !conversation.conversationId) return null;

                                const isActive = selectedChat === conversation.conversationId;
                                const hasUnread = conversation.unreadCount > 0;
                                const isDeleting = conversationToDelete === conversation.conversationId;

                                return (
                                    <div
                                        key={conversation.conversationId}
                                        className={`msg-conversation-item ${isActive ? 'msg-selected' : ''} ${hasUnread ? 'msg-unread' : ''} msg-fade-in`}
                                        onClick={() => handleChatSelect(conversation.conversationId)}
                                    >
                                        <div className="msg-conv-avatar">
                                            {conversation.senderName?.charAt(0) || 'U'}
                                        </div>
                                        <div className="msg-conv-info">
                                            <div className="msg-conv-row">
                                                <span className="msg-conv-name-text">{conversation.senderName || 'Usuario'}</span>
                                                {conversation.isPublic && (
                                                    <span className="msg-type-badge public">Público</span>
                                                )}
                                                {conversation.status === 'resolved' && (
                                                    <span className="msg-type-badge resolved">Resuelto</span>
                                                )}
                                                <span className="msg-conv-last-msg">
                                                    {conversation.lastMessage || 'Sin mensajes'}
                                                </span>
                                                <span className="msg-conv-time">
                                                    {formatMessageDate(conversation.lastMessageDate)}
                                                </span>
                                                {hasUnread && (
                                                    <span className="msg-unread-badge">
                                                        {conversation.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="msg-conv-actions" onClick={(e) => e.stopPropagation()}>
                                            {isDeleting ? (
                                                <div className="msg-delete-confirm">
                                                    <span className="msg-delete-confirm-text">¿Eliminar?</span>
                                                    <button
                                                        className="msg-confirm-btn"
                                                        onClick={() => handleDeleteConversation(conversation.conversationId)}
                                                        title="Confirmar"
                                                    >
                                                        <FaCheckCircle size={11} />
                                                    </button>
                                                    <button
                                                        className="msg-cancel-btn"
                                                        onClick={() => setConversationToDelete(null)}
                                                        title="Cancelar"
                                                    >
                                                        <FaExclamationCircle size={11} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="msg-delete-btn"
                                                    onClick={() => setConversationToDelete(conversation.conversationId)}
                                                    title="Eliminar conversación"
                                                >
                                                    <FaTrashAlt size={10} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Columna derecha — Chat */}
                <div className={`msg-chat-col ${selectedChat ? 'msg-chat-active' : ''}`}>
                    {!selectedChat ? (
                        <div className="msg-no-chat">
                            <FaComments className="msg-no-chat-icon" />
                            <h4>Selecciona una conversación</h4>
                            <p>Elige una conversación de la lista para ver los mensajes.</p>
                        </div>
                    ) : !selectedConversation ? (
                        <div className="msg-no-chat">
                            <FaExclamationCircle className="msg-no-chat-icon" />
                            <h4>Conversación no encontrada</h4>
                            <button className="msg-filter-btn active" onClick={handleBackToList} style={{ width: 'auto', padding: '6px 16px' }}>
                                Volver a la lista
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div className="msg-chat-header">
                                <div className="msg-chat-header-info">
                                    <button className="msg-back-btn" onClick={handleBackToList}>
                                        <FaArrowLeft />
                                    </button>
                                    <div className="msg-chat-header-avatar">
                                        {selectedConversation?.senderName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="msg-chat-header-details">
                                        <div className="msg-chat-header-name">
                                            {selectedConversation?.senderName || 'Usuario'}
                                        </div>
                                        <div className="msg-chat-header-status">
                                            {selectedConversation?.status === 'resolved' ? 'Conversación resuelta' : 'Conversación activa'}
                                            {selectedConversation?.isPublic && ' · Público'}
                                        </div>
                                    </div>
                                </div>
                                <div className="msg-chat-header-actions">
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            className="msg-info-btn"
                                            onClick={() => setShowInfoDropdown(!showInfoDropdown)}
                                            title="Información"
                                        >
                                            <FaInfoCircle />
                                        </button>

                                        {showInfoDropdown && selectedConversation && (
                                            <div className="msg-info-dropdown">
                                                <div className="msg-info-dropdown-header">
                                                    <h4>Info de conversación</h4>
                                                    <button className="msg-info-close" onClick={() => setShowInfoDropdown(false)}>
                                                        &times;
                                                    </button>
                                                </div>
                                                <div className="msg-info-body">
                                                    <div className="msg-info-item">
                                                        <strong>ID:</strong>
                                                        <span style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>
                                                            {selectedConversation.conversationId}
                                                        </span>
                                                    </div>
                                                    <div className="msg-info-item">
                                                        <strong>Estado:</strong>
                                                        <span className={`msg-info-badge ${selectedConversation.status || 'open'}`}>
                                                            {selectedConversation.status === 'closed' || selectedConversation.status === 'resolved' ? 'Cerrada' : 'Abierta'}
                                                        </span>
                                                    </div>
                                                    <div className="msg-info-item">
                                                        <strong>Tipo:</strong>
                                                        <span className={`msg-info-badge ${selectedConversation.isPublic ? 'public' : 'private'}`}>
                                                            {selectedConversation.isPublic ? 'Público' : 'Privado'}
                                                        </span>
                                                    </div>
                                                    <div className="msg-info-item">
                                                        <strong>Último msg:</strong>
                                                        <span>{formatMessageDate(selectedConversation.lastMessageDate)}</span>
                                                    </div>
                                                    <div className="msg-info-item">
                                                        <strong>Sin leer:</strong>
                                                        <span>{selectedConversation.unreadCount || 0}</span>
                                                    </div>
                                                    <div className="msg-info-item">
                                                        <strong>Remitente:</strong>
                                                        <span>{selectedConversation.senderName || 'Usuario'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="msg-messages-container">
                                {isLoadingMessages ? (
                                    <div className="msg-loading">
                                        <Spinner animation="border" size="sm" />
                                        <span>Cargando mensajes...</span>
                                    </div>
                                ) : !currentMessages || currentMessages.length === 0 ? (
                                    <div className="msg-no-messages">
                                        <FaEnvelope style={{ fontSize: '2rem' }} />
                                        <span>No hay mensajes en esta conversación.</span>
                                    </div>
                                ) : (
                                    <>
                                        {currentMessages.map((msg) => {
                                            const userIdFromRedux = user?._id?.toString();
                                            let senderId;
                                            if (typeof msg.sender === 'object' && msg.sender?._id) {
                                                senderId = msg.sender._id.toString();
                                            } else if (typeof msg.sender === 'string') {
                                                senderId = msg.sender;
                                            } else {
                                                senderId = 'unknown';
                                            }
                                            const isSent = userIdFromRedux === senderId;
                                            const senderName = typeof msg.sender === 'object'
                                                ? (msg.sender.name || msg.sender.firstName || 'Usuario')
                                                : (isSent ? 'Tú' : selectedConversation?.senderName || 'Usuario');

                                            return (
                                                <div
                                                    key={msg._id}
                                                    className={`msg-message ${isSent ? 'msg-message-sent' : 'msg-message-received'} msg-fade-in`}
                                                >
                                                    <div className="msg-message-avatar">
                                                        {isSent ? (
                                                            <FaUserCircle size={14} />
                                                        ) : (
                                                            (selectedConversation?.senderName?.charAt(0) || 'U')
                                                        )}
                                                    </div>
                                                    <div className="msg-message-bubble">
                                                        <div className="msg-message-sender">
                                                            {isSent ? 'Tú (Admin)' : senderName}
                                                        </div>
                                                        <div className="msg-message-text">
                                                            {msg.text}
                                                        </div>
                                                        <div className="msg-message-time">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSendMessage} className="msg-input-container">
                                <textarea
                                    className="msg-input"
                                    placeholder="Escribe un mensaje..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    disabled={selectedConversation?.status === 'resolved' || isLoadingMessages}
                                />
                                <button
                                    type="submit"
                                    className="msg-send-btn"
                                    disabled={!message.trim() || selectedConversation?.status === 'resolved' || isLoadingMessages}
                                >
                                    <FaPaperPlane size={16} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
