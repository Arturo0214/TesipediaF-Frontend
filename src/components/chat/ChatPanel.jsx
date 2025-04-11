import React, { useEffect, useRef, useState } from 'react';
import { FaPaperPlane, FaPaperclip, FaSpinner, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
    sendMessage,
    getMessagesByOrder,
    generatePublicId,
    setConnectionStatus,
    addMessage,
    clearMessages,
} from '../../features/chat/chatSlice';
import { connectSocket, disconnectSocket, onSocketEvent, emitSocketEvent } from '../../services/chat/chatSocket';
import './ChatPanel.css';

const ChatPanel = ({ isOpen, onClose, orderId, userId, userName, isPublic = false }) => {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);

    const { messages, loading, isConnected, publicId } = useSelector((state) => state.chat);

    // 👉 Scroll automático
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 👉 Inicializar Chat
    useEffect(() => {
        if (!isOpen) return;

        const initializeChat = async () => {
            try {
                console.log('Inicializando chat con:', { isOpen, orderId, userId, isPublic, publicId });

                let socketUserId = userId;

                if (isPublic) {
                    if (!publicId) {
                        console.log('Generando publicId...');
                        const generatedId = await dispatch(generatePublicId()).unwrap();
                        console.log('PublicId generado:', generatedId);
                        socketUserId = generatedId;
                    } else {
                        socketUserId = publicId;
                    }
                }

                if (isPublic) {
                    console.log('Obteniendo mensajes públicos para:', socketUserId);
                    await dispatch(getMessagesByOrder({ orderId: null, publicId: socketUserId })).unwrap();
                } else if (orderId) {
                    console.log('Obteniendo mensajes para orden:', orderId);
                    await dispatch(getMessagesByOrder(orderId)).unwrap();
                }

                console.log('Conectando socket con userId:', socketUserId);
                const socket = connectSocket(socketUserId, isPublic);

                onSocketEvent('connect', () => {
                    console.log('Socket conectado, actualizando estado...');
                    dispatch(setConnectionStatus(true));
                    if (orderId) {
                        console.log('Uniéndose a la sala de chat:', orderId);
                        emitSocketEvent('joinOrderChat', orderId);
                    }
                });

                onSocketEvent('disconnect', () => {
                    console.log('Socket desconectado, actualizando estado...');
                    dispatch(setConnectionStatus(false));
                });

                onSocketEvent('sendMessage', (message) => {
                    console.log('Nuevo mensaje recibido:', message);
                    dispatch(addMessage(message));
                });

            } catch (error) {
                console.error('Error inicializando chat:', error);
            }
        };

        initializeChat();

        return () => {
            console.log('Limpiando chat...');
            dispatch(clearMessages());
            disconnectSocket();
        };
    }, [dispatch, isOpen, orderId, userId, isPublic, publicId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 👉 Enviar mensaje
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !attachment) return;

        try {
            const messageData = {
                text: newMessage,
                receiver: isPublic ? null : userId,
                orderId: isPublic ? null : orderId,
                attachment,
                publicId: isPublic ? publicId : null,
                name: isPublic ? 'Usuario Anónimo' : userName,
            };

            // Si el usuario está autenticado, no necesitamos enviar el nombre
            // ya que el backend lo obtendrá del token
            if (!isPublic) {
                delete messageData.name;
            }

            await dispatch(sendMessage(messageData)).unwrap();
            setNewMessage('');
            setAttachment(null);
        } catch (error) {
            console.error('Error enviando mensaje:', error);
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
