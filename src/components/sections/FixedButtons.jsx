import React, { useState, useEffect, lazy, Suspense } from 'react';
import { FaWhatsapp, FaComments } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import './FixedButtons.css';

// Lazy load chatbot — only loads when visitor clicks
// Note: ChatPanel (Socket.io live chat) is only used inside order-specific pages (ClientPanel)
const TesipediaBot = lazy(() => import('../chat/TesipediaBot'));

const FixedButtons = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // Chatbot is only for visitors (not logged-in users)
  const isAuthenticated = !!user;

  // Listen for external "open chat" events (from HeroSection, ServicesSection, etc.)
  useEffect(() => {
    if (isAuthenticated) return; // No chatbot for logged-in users
    const handleOpenChat = () => {
      setChatLoaded(true);
      setIsChatOpen(true);
    };
    window.addEventListener('tesipedia:open-chat', handleOpenChat);
    return () => window.removeEventListener('tesipedia:open-chat', handleOpenChat);
  }, [isAuthenticated]);

  const handleChatClick = (e) => {
    e.preventDefault();
    setChatLoaded(true);
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <nav className="fixed-buttons" aria-label="Botones de contacto rápido" role="navigation">
        <a
          href="https://wa.me/525670071517"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-button"
          aria-label="Contactar por WhatsApp"
          title="Contactar por WhatsApp"
        >
          <FaWhatsapp aria-hidden="true" />
        </a>
        {/* Chat button only for visitors — logged-in users use their dashboard chat */}
        {!isAuthenticated && (
          <button
            onClick={handleChatClick}
            className={`chat-button ${isChatOpen ? 'active' : ''}`}
            aria-label={isChatOpen ? 'Cerrar chat en línea' : 'Abrir chat en línea'}
            aria-expanded={isChatOpen}
            title="Chat en línea"
          >
            <FaComments aria-hidden="true" />
          </button>
        )}
      </nav>

      {!isAuthenticated && chatLoaded && (
        <Suspense fallback={null}>
          <TesipediaBot
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
};

export default FixedButtons;
