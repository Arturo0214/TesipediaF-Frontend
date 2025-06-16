import React from 'react';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';
import Message from './Message';

const MessageList = ({ messages, loading, error, currentUserId }) => {
    if (loading) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando mensajes...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="m-3">
                {error}
            </Alert>
        );
    }

    if (!messages || messages.length === 0) {
        return (
            <div className="text-center p-4 text-muted">
                No hay mensajes aún. ¡Sé el primero en escribir!
            </div>
        );
    }

    return (
        <ListGroup className="message-list">
            {messages.map((message) => (
                <Message
                    key={message._id}
                    message={message}
                    isOwnMessage={message.sender === currentUserId}
                />
            ))}
        </ListGroup>
    );
};

export default MessageList; 