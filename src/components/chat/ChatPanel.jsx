import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaPaperPlane, FaPaperclip, FaSpinner, FaTimes } from 'react-icons/fa';
import { trackGoogleAdsConversion } from '../../services/eventService';
import { useDispatch, useSelector } from 'react-redux';
import {
    sendMessage,
    getMessagesByOrder,
    generatePublicId,
    setConnectionStatus,
    addMessage,
    clearMessages,
} from '../../features/chat/chatSlice';
import { connectSocket, disconnectSocket, onSocketEvent, emitSocketEvent, isSocketConnected } from '../../services/chat/chatSocket';
import './ChatPanel.css';

const ChatPanel = ({ isOpen, onClose, orderId, userId, userName, isPublic = false }) => {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const initializedRef = useRef(false);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);

    const { messages, loading, isConnected, publicId } = useSelector((state) => state.chat);

    // 👉 Scroll automático
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // 👉 Inicializar Chat — publicId removed from deps to prevent infinite loop
    useEffect(() => {
        if (!isOpen) return;
        if (initializedRef.current) return;

        let cancelled = false;

        const initializeChat = async () => {
            try {
                let socketUserId = userId;
                let currentPublicId = publicId;

                if (isPublic) {
                    if (!currentPublicId) {
                        const response = await dispatch(generatePublicId()).unwrap();
                        if (cancelled) return;
                        currentPublicId = response;
                    }

                    if (!currentPublicId) {
                        console.error('No se pudo generar un publicId válido');
                        return;
                    }

                    socketUserId = currentPublicId;
                    await dispatch(getMessagesByOrder({ orderId: null, publicId: currentPublicId })).unwrap();
                } else if (orderId) {
                    await dispatch(getMessagesByOrder(orderId)).unwrap();
                }

                if (cancelled) return;

                if (!socketUserId) {
                    console.error('No se pudo obtener un userId válido para la conexión del socket');
                    return;
                }

                const token = !isPublic ? localStorage.getItem('token') : null;
                const socket = connectSocket(socketUserId, isPublic, token);

                if (!socket) {
                    console.error('No se pudo crear la conexión del socket');
                    return;
                }

                // Register event listeners
                onSocketEvent('connect', () => {
                    if (cancelled) return;
                    dispatch(setConnectionStatus(true));
                    if (isPublic && currentPublicId) {
                        emitSocketEvent('joinPublicChat', currentPublicId);
                    } else if (orderId) {
                        emitSocketEvent('joinOrderChat', orderId);
                    }
                });

                onSocketEvent('disconnect', () => {
                    if (cancelled) return;
                    dispatch(setConnectionStatus(false));
                });

                onSocketEvent('message', (message) => {
                    if (cancelled) return;
                    dispatch(addMessage(message));
                    scrollToBottom();
                });

                // If socket already connected (autoConnect race), fire manually
                if (isSocketConnected()) {
                    dispatch(setConnectionStatus(true));
                    if (isPublic && currentPublicId) {
                        emitSocketEvent('joinPublicChat', currentPublicId);
                    } else if (orderId) {
                        emitSocketEvent('joinOrderChat', orderId);
                    }
                }

                initializedRef.current = true;
            } catch (error) {
                console.error('Error inicializando chat:', error);
            }
        };

        initializeChat();

        return () => {
            cancelled = true;
            initializedRef.current = false;
            dispatch(clearMessages());
            disconnectSocket();
        };
    }, [dispatch, isOpen, orderId, userId, isPublic, scrollToBottom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 👉 Enviar mensaje
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !attachment) return;

        try {
            const messageData = new FormData();

            // Datos básicos del mensaje
            messageData.append('text', newMessage);
            messageData.append('isPublic', isPublic);

            // Definir el conversationId explícitamente para mensajes públicos
            let conversationId = null;

            if (isPublic) {
                messageData.append('publicId', publicId);
                messageData.append('name', userName || 'Usuario Anónimo');
                // Para mensajes públicos, el conversationId es el publicId
                conversationId = publicId;
                messageData.append('conversationId', conversationId);
                console.log('📝 Configurando conversationId para mensaje público:', conversationId);
            } else {
                messageData.append('receiver', userId);
                if (orderId) {
                    messageData.append('orderId', orderId);
                }
                // Para mensajes directos, el servidor generará el conversationId
            }

            // Adjuntar archivo si existe
            if (attachment) {
                messageData.append('attachment', attachment);
            }

            console.log('Enviando mensaje:', {
                text: newMessage,
                isPublic,
                publicId,
                conversationId,
                attachment: attachment?.name
            });

            // Enviar mensaje a través de HTTP (para persistencia)
            const response = await dispatch(sendMessage(messageData)).unwrap();
            console.log('Mensaje enviado exitosamente:', response);

            // Fire Google Ads conversion on first public message
            if (isPublic) trackGoogleAdsConversion();

            // Usar el conversationId del mensaje enviado
            const responseConversationId = response.conversationId || conversationId;
            console.log('📝 conversationId del mensaje enviado:', responseConversationId);

            // También emitir el mensaje a través del socket para comunicación en tiempo real
            if (isConnected) {
                console.log('📤 Emitiendo mensaje a través del socket');

                // Crear un objeto con los datos del mensaje para el socket
                const socketMessageData = {
                    text: newMessage,
                    isPublic: isPublic,
                    _id: response._id, // Usar el ID generado por el servidor
                    createdAt: response.createdAt,
                    sender: isPublic ? publicId : userId,
                    conversationId: responseConversationId // Usar el conversationId del response
                };

                // Agregar datos específicos según el tipo de chat
                if (isPublic) {
                    socketMessageData.publicId = publicId;
                    socketMessageData.name = userName || 'Usuario Anónimo';
                    emitSocketEvent('sendPublicMessage', socketMessageData);
                } else {
                    socketMessageData.receiver = userId;
                    if (orderId) {
                        socketMessageData.orderId = orderId;
                    }
                    emitSocketEvent('sendMessage', socketMessageData);
                }
            } else {
                console.warn('⚠️ Socket no conectado, mensaje enviado solo por HTTP');
            }

            setNewMessage('');
            setAttachment(null);
            scrollToBottom();
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        }
    };

    // 👉 Adjuntar archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setAttachment(file);
    };

    return (
        <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
            {/* Header */}
            <div className="chat-panel-header">
                <h3>{isPublic ? 'Chat Público' : orderId ? 'Chat del Pedido' : 'Chat Directo'}</h3>
                <button className="close-button" onClick={onClose}>
                    <FaTimes />
                </button>
            </div>

            {/* Mensajes */}
            <div className="chat-messages">
                {loading ? (
                    <div className="chat-loading">
                        <FaSpinner className="spinner" />
                        <p>Cargando mensajes...</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message._id || message.id}
                            className={`message ${(message.isPublic ? publicId : userId) === (message.sender?._id || message.sender)
                                ? 'sent'
                                : 'received'
                                }`}
                        >
                            <div className="message-content">
                                {message.attachment && (
                                    <div className="attachment">
                                        <a href={message.attachment.url} target="_blank" rel="noopener noreferrer">
                                            {message.attachment.fileName}
                                        </a>
                                    </div>
                                )}
                                <p>{message.text}</p>
                                <span className="message-time">
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Formulario de enviar */}
            <form onSubmit={handleSendMessage} className="chat-input-form">
                <div className="chat-input-container">
                    <label htmlFor="attachment" className="attachment-label">
                        <FaPaperclip />
                        <input
                            type="file"
                            id="attachment"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="chat-input"
                        disabled={!isConnected}
                    />
                    <button
                        type="submit"
                        className="send-button"
                        disabled={!isConnected || (!newMessage.trim() && !attachment)}
                    >
                        <FaPaperPlane />
                    </button>
                </div>

                {attachment && (
                    <div className="attachment-preview">
                        <span>{attachment.name}</span>
                        <button
                            type="button"
                            onClick={() => setAttachment(null)}
                            className="remove-attachment"
                        >
                            ×
                        </button>
                    </div>
                )}

                {!isConnected && (
                    <div className="connection-status">
                        Reconectando...
                    </div>
                )}
            </form>
        </div>
    );
};

export default ChatPanel;