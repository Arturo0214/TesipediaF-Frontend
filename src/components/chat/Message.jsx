import React from 'react';
import { format } from 'date-fns';
import './Chat.css';

const Message = ({ message, isOwnMessage }) => {
    const formattedTime = format(new Date(message.timestamp), 'HH:mm');

    return (
        <div className={`message ${isOwnMessage ? 'message-own' : 'message-other'}`}>
            <div className="message-header">
                <span className="sender-name">{message.senderName}</span>
                <span className="message-time">{formattedTime}</span>
            </div>
            <div className="message-content">
                {message.content}
            </div>
        </div>
    );
};

export default Message; 