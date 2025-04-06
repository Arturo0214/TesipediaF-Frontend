import React, { useState } from 'react';
import { FaWhatsapp, FaComments } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import ChatPanel from '../chat/ChatPanel';
import './FixedButtons.css'; 

const FixedButtons = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleChatClick = (e) => {
    e.preventDefault();
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <div className="fixed-buttons">
        <a href="https://wa.me/525583352096" target="_blank" rel="noopener noreferrer" className="whatsapp-button">
          <FaWhatsapp />
        </a>
        <a href="#" onClick={handleChatClick} className={`chat-button ${isChatOpen ? 'active' : ''}`}>
          <FaComments />
        </a>
      </div>

      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        orderId={user ? user._id : null} // 👈 solo pasamos el orderId real si el usuario está logueado
        userId={user?._id}
        userName={user?.name || 'Usuario'}
        isPublic={!user} // 👈 si no hay usuario, es público
      />
    </>
  );
};

export default FixedButtons;
