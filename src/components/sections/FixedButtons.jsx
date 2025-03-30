import React from 'react';
import { FaWhatsapp, FaComments } from 'react-icons/fa';
import './FixedButtons.css'; // Asegúrate de que este archivo CSS esté actualizado

const FixedButtons = () => {
  return (
    <div className="fixed-buttons">
      <a href="https://wa.me/525583352096" target="_blank" rel="noopener noreferrer" className="whatsapp-button">
        <FaWhatsapp />
      </a>
      <a href="https://t.me/yourchatlink" target="_blank" rel="noopener noreferrer" className="chat-button">
        <FaComments />
      </a>
    </div>
  );
};

export default FixedButtons;