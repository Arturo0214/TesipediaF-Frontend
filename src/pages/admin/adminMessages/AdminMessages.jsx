import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import {
    FaEnvelope,
    FaUserCircle,
    FaSearch,
    FaPaperPlane,
    FaExclamationCircle,
    FaSignInAlt,
    FaTrashAlt,
    FaCheckCircle,
    FaInfoCircle,
    FaArrowLeft,
    FaComments,
    FaTimes,
    FaCircle,
    FaGlobe,
    FaLock,
    FaReply,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    sendMessage,
    getConversations,
    getDirectMessages,
    markMessageAsRead,
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
    const [socketConnected, setSocketConnected] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);
    const [showInfoDropdown, setShowInfoDropdown] = useState(false);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // ── Scroll helpers ──────────────────────────────────────
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    // ── Auth check ──────────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated) {
            setUiError("Necesitas iniciar sesión para acceder a esta página.");
        } else if (!isAdmin) {
            setUiError("No tienes permisos de administrador.");
        } else {
            setUiError(null);
        }
    }, [isAuthenticated, isAdmin]);

    // ── Load conversations ──────────────────────────────────
    const loadConversations = useCallback(async () => {
        try {
            setIsLoadingConversations(true);
            await dispatch(getConversations()).unwrap();
        } catch (err) {
            toast.error('No se pudieron cargar las conversaciones');
        } finally {
            setIsLoadingConversations(false);
        }
    }, [dispatch]);

    useEffect(() => { loadConversations(); }, [loadConversations]);

    // ── Load messages for selected conversation ─────────────
    const loadMessages = useCallback(async (chatId) => {
        if (!chatId || !isAuthenticated || !isAdmin) return;
        try {
            setIsLoadingMessages(true);
            const isPublicId = /^[a-zA-Z0-9]{32}$/.test(chatId);
            if (isPublicId) {
                await dispatch(getPublicMessagesByPublicId(chatId)).unwrap();
            } else {
                await dispatch(getDirectMessages(chatId)).unwrap();
            }
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            toast.error('Error al cargar mensajes');
        } finally {
            setIsLoadingMessages(false);
        }
    }, [dispatch, isAuthenticated, isAdmin, scrollToBottom]);

    useEffect(() => {
        if (selectedChat) loadMessages(selectedChat);
    }, [selectedChat, loadMessages]);

    // ── Mark messages as read ───────────────────────────────
    useEffect(() => {
        if (!selectedChat || !messages?.length || !user?._id) return;
        const unread = messages.filter(msg =>
            !msg.isRead &&
            msg.receiver &&
            (typeof msg.receiver === 'object'
                ? msg.receiver._id?.toString()
                : msg.receiver.toString()) === user._id.toString()
        );
        unread.forEach(msg => {
            if (msg?._id) dispatch(markMessageAsRead(msg._id)).unwrap().catch(() => {});
        });
    }, [selectedChat, messages, dispatch, user?._id]);

    // ── Filter conversations ────────────────────────────────
    const filteredConversations = useMemo(() => {
        if (!conversations?.length) return [];

        let filtered = [...conversations].filter(conv => {
            if (conv.isPublic) return true;
            const lastSenderId = conv.lastMessageSender?._id?.toString() || conv.lastMessageSender;
            return lastSenderId !== user?._id?.toString();
        });

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(conv =>
                (conv.senderName || '').toLowerCase().includes(q) ||
                (conv.lastMessage || '').toLowerCase().includes(q)
            );
        }

        if (filter === 'unread') {
            filtered = filtered.filter(conv => conv.unreadCount > 0);
        } else if (filter === 'today') {
            filtered = filtered.filter(conv => {
                if (!conv.lastMessageDate) return false;
                try { return isToday(new Date(conv.lastMessageDate)); }
                catch { return false; }
            });
        }

        return filtered.sort((a, b) => {
            if (!a.lastMessageDate) return 1;
            if (!b.lastMessageDate) return -1;
            return new Date(b.lastMessageDate) - new Date(a.lastMessageDate);
        });
    }, [conversations, searchQuery, filter, user?._id]);

    // ── Stats ───────────────────────────────────────────────
    const stats = useMemo(() => {
        if (!conversations?.length) return { total: 0, unread: 0, today: 0 };
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const unread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        const todayCount = conversations.filter(conv => {
            if (!conv.lastMessageDate) return false;
            try { return new Date(conv.lastMessageDate) >= today; }
            catch { return false; }
        }).length;
        return { total: conversations.length, unread, today: todayCount };
    }, [conversations]);

    // ── Select conversation ─────────────────────────────────
    const handleChatSelect = (conversationId) => {
        if (!conversationId) return;
        const match = conversations.find(c => c.conversationId === conversationId);
        if (match) {
            setSelectedConversation(match);
            setSelectedChat(conversationId);
            setShowInfoDropdown(false);
            loadMessages(conversationId);
        } else {
            toast.error('No se pudo cargar la conversación');
        }
    };

    // ── Send message ────────────────────────────────────────
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedChat) return;

        const isPublicChat = selectedConversation?.isPublic || /^[a-zA-Z0-9]{32}$/.test(selectedChat);
        const receiverId = isPublicChat ? selectedChat : selectedConversation?.senderId;

        try {
            setIsLoadingMessages(true);
            const result = await dispatch(sendMessage({
                receiver: receiverId,
                text: message,
                isPublic: isPublicChat
            })).unwrap();

            if (socketRef.current?.connected) {
                emitSocketEvent('send_message', {
                    receiver: receiverId,
                    text: message,
                    isPublic: isPublicChat,
                    _id: result._id,
                    createdAt: result.createdAt,
                    sender: user._id,
                    conversationId: result.conversationId
                });
            }

            dispatch(addMessage(result));
            setMessage('');

            if (result?.conversationId) {
                setSelectedConversation(prev => ({
                    ...prev,
                    lastMessage: result.text,
                    lastMessageDate: result.createdAt,
                    lastMessageSender: user?._id,
                    unreadCount: 0
                }));
            }
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            toast.error(`Error al enviar: ${err.message || 'Desconocido'}`);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    // ── Delete conversation ─────────────────────────────────
    const handleDeleteConversation = async (id) => {
        try {
            await dispatch(deleteConversation(id)).unwrap();
            if (selectedConversation?.conversationId === id || selectedConversation?._id === id) {
                setSelectedConversation(null);
                setSelectedChat(null);
            }
            setConversationToDelete(null);
            toast.success('Conversación eliminada');
            loadConversations();
        } catch {
            toast.error('No se pudo eliminar la conversación');
        }
    };

    // ── Date formatting ─────────────────────────────────────
    const formatMessageDate = (date) => {
        if (!date) return '';
        try {
            const d = new Date(date);
            if (isToday(d)) return format(d, 'HH:mm', { locale: es });
            if (isYesterday(d)) return 'Ayer';
            return format(d, 'dd/MM/yy', { locale: es });
        } catch { return ''; }
    };

    const formatMessageTime = (date) => {
        if (!date) return '';
        try { return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
        catch { return ''; }
    };

    // ── Socket initialization ───────────────────────────────
    useEffect(() => {
        if (!isAuthenticated || !isAdmin || !user?._id) return;

        // No need to extract token from document.cookie — JWT is httpOnly.
        // chatSocket.js sends cookies via withCredentials; backend extracts JWT from cookie header.
        const newSocket = connectSocket(user._id, false);
        socketRef.current = newSocket;

        if (newSocket) {
            onSocketEvent('connect', () => {
                setSocketConnected(true);
                dispatch(setConnectionStatus(true));
                dispatch(getConversations());
            });

            onSocketEvent('disconnect', () => {
                setSocketConnected(false);
                dispatch(setConnectionStatus(false));
            });

            onSocketEvent('connect_error', (error) => {
                console.warn('Socket connect_error:', error.message);
                if (error.message?.includes('Authentication') || error.message?.includes('Token')) {
                    disconnectSocket();
                    setTimeout(() => {
                        const retry = connectSocket(user._id, false);
                        socketRef.current = retry;
                    }, 2000);
                }
            });

            onSocketEvent('message', (msg) => {
                dispatch(addMessage(msg));
                if (selectedChat === msg.conversationId) {
                    setTimeout(scrollToBottom, 100);
                }
                dispatch(getConversations());
            });

            onSocketEvent('error', (error) => {
                toast.error('Error de conexión: ' + (error.message || ''));
            });
        }

        return () => {
            disconnectSocket();
            socketRef.current = null;
        };
    }, [dispatch, isAuthenticated, isAdmin, user?._id, scrollToBottom]);

    // Cleanup on unmount
    useEffect(() => {
        return () => { dispatch(clearMessages()); };
    }, [dispatch]);

    // ── Keyboard handling ───────────────────────────────────
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleBackToList = () => {
        setSelectedChat(null);
        setSelectedConversation(null);
    };

    // ── Get filtered messages for current chat ──────────────
    const currentMessages = useMemo(() => {
        if (!selectedChat || !selectedConversation || !messages?.length) return [];

        const userId = user?._id?.toString();
        const filtered = messages.filter(msg => {
            if (!msg?._id) return false;
            const senderId = msg.sender?._id?.toString() || (typeof msg.sender === 'string' ? msg.sender : null);
            const receiverId = msg.receiver?._id?.toString() || (typeof msg.receiver === 'string' ? msg.receiver : null);

            if (selectedConversation.isPublic) {
                return msg.isPublic && msg.conversationId === selectedChat;
            }
            if (!selectedConversation.isPublic) {
                return (
                    (senderId === userId && receiverId === selectedConversation.senderId) ||
                    (senderId === selectedConversation.senderId && receiverId === userId)
                );
            }
            return msg.conversationId === selectedChat;
        });

        return [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }, [selectedChat, selectedConversation, messages, user?._id]);

    // ── Auth guards ─────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <Container fluid className="py-4 h-100">
                <Alert variant="danger">
                    <Alert.Heading>Sesión no iniciada</Alert.Heading>
                    <p>Necesitas iniciar sesión para acceder a esta página.</p>
                    <hr />
                    <div className="d-flex justify-content-center">
                        <Button variant="primary" onClick={() => navigate('/login')} className="d-flex align-items-center">
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
                    <p>Se requieren permisos de administrador.</p>
                </Alert>
            </Container>
        );
    }

    // ── RENDER ───────────────────────────────────────────────
    return (
        <div className="msg-panel">
            {/* ─── Header ─────────────────────────────────── */}
            <div className="msg-header">
                <div className="msg-header-left">
                    <FaComments className="msg-header-icon" />
                    <div>
                        <h2 className="msg-header-title">Mensajes</h2>
                        <span className="msg-header-subtitle">
                            <FaCircle className={`msg-status-dot ${socketConnected ? 'online' : 'offline'}`} />
                            {socketConnected ? 'Conectado' : 'Desconectado'}
                        </span>
                    </div>
                </div>
                <div className="msg-header-stats">
                    <div className="msg-stat-pill">
                        <span className="msg-stat-count">{stats.today}</span>
                        <span className="msg-stat-label">Hoy</span>
                    </div>
                    <div className="msg-stat-pill">
                        <span className="msg-stat-count">{stats.unread}</span>
                        <span className="msg-stat-label">Sin leer</span>
                    </div>
                    <div className="msg-stat-pill">
                        <span className="msg-stat-count">{stats.total}</span>
                        <span className="msg-stat-label">Total</span>
                    </div>
                </div>
            </div>

            {/* ─── Error banner ───────────────────────────── */}
            {uiError && (
                <Alert variant="danger" onClose={() => setUiError(null)} dismissible className="m-2 mb-0">
                    {uiError}
                </Alert>
            )}

            {/* ─── Body: 2-column layout ──────────────────── */}
            <div className="msg-body">
                {/* LEFT: Conversations list */}
                <div className="msg-conversations-col">
                    {/* Search */}
                    <div className="msg-search-box">
                        <FaSearch className="msg-search-icon" />
                        <input
                            type="text"
                            className="msg-search-input"
                            placeholder="Buscar conversación..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="msg-filter-bar">
                        {['all', 'unread', 'today'].map(f => (
                            <button
                                key={f}
                                className={`msg-filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? 'Todas' : f === 'unread' ? 'Sin leer' : 'Hoy'}
                            </button>
                        ))}
                    </div>

                    {/* Conversation list */}
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
                                <button className="msg-filter-btn active" onClick={loadConversations} style={{ width: 'auto', padding: '6px 16px' }}>
                                    Reintentar
                                </button>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="msg-empty">
                                <FaComments style={{ fontSize: '2.5rem', color: '#c5ccd3' }} />
                                <span>No hay conversaciones</span>
                                <span className="msg-empty-hint">
                                    {filter !== 'all' ? 'Prueba cambiando el filtro' : 'Los mensajes aparecerán aquí'}
                                </span>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                if (!conv?.conversationId) return null;
                                const isActive = selectedChat === conv.conversationId;
                                const hasUnread = conv.unreadCount > 0;
                                const isDeleting = conversationToDelete === conv.conversationId;

                                return (
                                    <div
                                        key={conv.conversationId}
                                        className={`msg-conv-item ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''}`}
                                        onClick={() => handleChatSelect(conv.conversationId)}
                                    >
                                        {/* Avatar */}
                                        <div className={`msg-conv-avatar ${conv.isPublic ? 'public' : ''}`}>
                                            {conv.isPublic
                                                ? <FaGlobe size={14} />
                                                : (conv.senderName?.charAt(0)?.toUpperCase() || 'U')
                                            }
                                        </div>

                                        {/* Info: 2 rows */}
                                        <div className="msg-conv-info">
                                            <div className="msg-conv-top-row">
                                                <span className="msg-conv-name">
                                                    {conv.senderName || 'Usuario'}
                                                </span>
                                                <span className="msg-conv-time">
                                                    {formatMessageDate(conv.lastMessageDate)}
                                                </span>
                                            </div>
                                            <div className="msg-conv-bottom-row">
                                                <span className="msg-conv-preview">
                                                    {conv.lastMessage || 'Sin mensajes'}
                                                </span>
                                                <div className="msg-conv-meta">
                                                    {conv.isPublic && (
                                                        <span className="msg-badge public">Web</span>
                                                    )}
                                                    {conv.status === 'resolved' && (
                                                        <span className="msg-badge resolved">Resuelto</span>
                                                    )}
                                                    {hasUnread && (
                                                        <span className="msg-unread-count">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delete action */}
                                        <div className="msg-conv-actions" onClick={(e) => e.stopPropagation()}>
                                            {isDeleting ? (
                                                <div className="msg-delete-confirm">
                                                    <span className="msg-delete-confirm-text">¿Eliminar?</span>
                                                    <button className="msg-confirm-yes" onClick={() => handleDeleteConversation(conv._id || conv.conversationId)} title="Confirmar">
                                                        <FaCheckCircle size={11} />
                                                    </button>
                                                    <button className="msg-confirm-no" onClick={() => setConversationToDelete(null)} title="Cancelar">
                                                        <FaTimes size={11} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="msg-delete-btn"
                                                    onClick={() => setConversationToDelete(conv.conversationId)}
                                                    title="Eliminar"
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

                {/* RIGHT: Chat panel */}
                <div className={`msg-chat-col ${selectedChat ? 'msg-chat-active' : ''}`}>
                    {!selectedChat ? (
                        <div className="msg-no-chat">
                            <div className="msg-no-chat-graphic">
                                <FaComments />
                            </div>
                            <h4>Mensajes internos</h4>
                            <p>Selecciona una conversación para ver los mensajes</p>
                        </div>
                    ) : !selectedConversation ? (
                        <div className="msg-no-chat">
                            <FaExclamationCircle style={{ fontSize: '3rem', color: '#e0e0e0' }} />
                            <h4>Conversación no encontrada</h4>
                            <button className="msg-btn-back-list" onClick={handleBackToList}>
                                Volver a la lista
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div className="msg-chat-header">
                                <button className="msg-back-btn" onClick={handleBackToList}>
                                    <FaArrowLeft />
                                </button>
                                <div className="msg-chat-header-info">
                                    <div className={`msg-chat-avatar ${selectedConversation.isPublic ? 'public' : ''}`}>
                                        {selectedConversation.isPublic
                                            ? <FaGlobe size={16} />
                                            : (selectedConversation.senderName?.charAt(0)?.toUpperCase() || 'U')
                                        }
                                    </div>
                                    <div className="msg-chat-header-text">
                                        <div className="msg-chat-name">
                                            {selectedConversation.senderName || 'Usuario'}
                                        </div>
                                        <div className="msg-chat-status">
                                            {selectedConversation.isPublic && (
                                                <><FaGlobe size={10} /> Chat público · </>
                                            )}
                                            {selectedConversation.status === 'resolved'
                                                ? 'Conversación resuelta'
                                                : 'Conversación activa'
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="msg-chat-header-actions">
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            className={`msg-icon-btn ${showInfoDropdown ? 'active' : ''}`}
                                            onClick={() => setShowInfoDropdown(!showInfoDropdown)}
                                            title="Información"
                                        >
                                            <FaInfoCircle />
                                        </button>

                                        {showInfoDropdown && (
                                            <div className="msg-info-dropdown">
                                                <div className="msg-info-dropdown-header">
                                                    <h4>Información</h4>
                                                    <button className="msg-info-close" onClick={() => setShowInfoDropdown(false)}>
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                                <div className="msg-info-body">
                                                    <div className="msg-info-row">
                                                        <span className="msg-info-label">Tipo</span>
                                                        <span className={`msg-info-tag ${selectedConversation.isPublic ? 'public' : 'private'}`}>
                                                            {selectedConversation.isPublic ? 'Público' : 'Privado'}
                                                        </span>
                                                    </div>
                                                    <div className="msg-info-row">
                                                        <span className="msg-info-label">Estado</span>
                                                        <span className={`msg-info-tag ${selectedConversation.status === 'resolved' ? 'resolved' : 'open'}`}>
                                                            {selectedConversation.status === 'resolved' ? 'Cerrada' : 'Abierta'}
                                                        </span>
                                                    </div>
                                                    <div className="msg-info-row">
                                                        <span className="msg-info-label">Remitente</span>
                                                        <span>{selectedConversation.senderName || 'Usuario'}</span>
                                                    </div>
                                                    <div className="msg-info-row">
                                                        <span className="msg-info-label">Último mensaje</span>
                                                        <span>{formatMessageDate(selectedConversation.lastMessageDate)}</span>
                                                    </div>
                                                    <div className="msg-info-row">
                                                        <span className="msg-info-label">Sin leer</span>
                                                        <span>{selectedConversation.unreadCount || 0}</span>
                                                    </div>
                                                    <div className="msg-info-row">
                                                        <span className="msg-info-label">ID</span>
                                                        <span className="msg-info-id">{selectedConversation.conversationId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Messages area */}
                            <div className="msg-messages-area">
                                {isLoadingMessages ? (
                                    <div className="msg-loading">
                                        <Spinner animation="border" size="sm" />
                                        <span>Cargando mensajes...</span>
                                    </div>
                                ) : !currentMessages.length ? (
                                    <div className="msg-no-messages">
                                        <FaReply style={{ fontSize: '2.5rem', color: '#c5ccd3' }} />
                                        <span>No hay mensajes aún</span>
                                        <span className="msg-empty-hint">Envía el primer mensaje</span>
                                    </div>
                                ) : (
                                    <>
                                        {currentMessages.map((msg) => {
                                            const userId = user?._id?.toString();
                                            const senderId = msg.sender?._id?.toString() || (typeof msg.sender === 'string' ? msg.sender : 'unknown');
                                            const isSent = userId === senderId;
                                            const senderName = typeof msg.sender === 'object'
                                                ? (msg.sender.name || msg.sender.firstName || 'Usuario')
                                                : (isSent ? 'Tú' : selectedConversation?.senderName || 'Usuario');

                                            return (
                                                <div key={msg._id} className={`msg-bubble-row ${isSent ? 'sent' : 'received'}`}>
                                                    {!isSent && (
                                                        <div className="msg-bubble-avatar">
                                                            {selectedConversation?.senderName?.charAt(0)?.toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                    <div className={`msg-bubble ${isSent ? 'sent' : 'received'}`}>
                                                        {!isSent && (
                                                            <div className="msg-bubble-sender">{senderName}</div>
                                                        )}
                                                        <div className="msg-bubble-text">{msg.text}</div>
                                                        <div className="msg-bubble-time">
                                                            {formatMessageTime(msg.createdAt)}
                                                            {isSent && msg.isRead && (
                                                                <FaCheckCircle size={10} className="msg-read-icon" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Input area */}
                            {selectedConversation?.status === 'resolved' ? (
                                <div className="msg-resolved-bar">
                                    <FaLock size={12} />
                                    <span>Esta conversación ha sido resuelta</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="msg-input-bar">
                                    <textarea
                                        className="msg-input"
                                        placeholder="Escribe un mensaje..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        rows={1}
                                        disabled={isLoadingMessages}
                                    />
                                    <button
                                        type="submit"
                                        className="msg-send-btn"
                                        disabled={!message.trim() || isLoadingMessages}
                                    >
                                        <FaPaperPlane size={15} />
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
