import React, { useState, useEffect, lazy, Suspense } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import './FixedButtons.css';

// Lazy load chatbot — only loads when visitor clicks
const TesipediaBot = lazy(() => import('../chat/TesipediaBot'));

const FixedButtons = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingDismissed, setGreetingDismissed] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const isAuthenticated = !!user;

  // Show greeting popup after 4 seconds for visitors
  useEffect(() => {
    if (isAuthenticated || greetingDismissed) return;
    const timer = setTimeout(() => {
      if (!isChatOpen) setShowGreeting(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, greetingDismissed, isChatOpen]);

  // Hide greeting when chat opens
  useEffect(() => {
    if (isChatOpen) setShowGreeting(false);
  }, [isChatOpen]);

  // Listen for external "open chat" events
  useEffect(() => {
    if (isAuthenticated) return;
    const handleOpenChat = () => {
      setChatLoaded(true);
      setIsChatOpen(true);
    };
    window.addEventListener('tesipedia:open-chat', handleOpenChat);
    return () => window.removeEventListener('tesipedia:open-chat', handleOpenChat);
  }, [isAuthenticated]);

  const handleChatClick = () => {
    setChatLoaded(true);
    setIsChatOpen(!isChatOpen);
    setShowGreeting(false);
    setGreetingDismissed(true);
  };

  const handleDismissGreeting = (e) => {
    e.stopPropagation();
    setShowGreeting(false);
    setGreetingDismissed(true);
  };

  return (
    <>
      <div className="fixed-buttons-container">
        {/* Greeting popup bubble */}
        {!isAuthenticated && showGreeting && !isChatOpen && (
          <div className="chat-greeting" onClick={handleChatClick} role="button" tabIndex={0}>
            <button
              className="chat-greeting-close"
              onClick={handleDismissGreeting}
              aria-label="Cerrar mensaje"
            >
              <FaTimes />
            </button>
            <div className="chat-greeting-avatar">
              <img
                src="https://res.cloudinary.com/dbowaer8j/image/upload/f_auto,q_auto,w_80/v1743713944/Tesipedia-logo_n1liaw.png"
                alt=""
                width="32"
                height="32"
              />
            </div>
            <div className="chat-greeting-content">
              <strong>Sofia de Tesipedia</strong>
              <p>¡Hola! ¿Necesitas ayuda con tu tesis? Estoy aquí para orientarte.</p>
            </div>
          </div>
        )}

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
          {!isAuthenticated && (
            <button
              onClick={handleChatClick}
              className={`chat-bot-trigger ${isChatOpen ? 'active' : ''}`}
              aria-label={isChatOpen ? 'Cerrar chat en línea' : 'Abrir chat en línea'}
              aria-expanded={isChatOpen}
              title="Chat en línea"
            >
              {isChatOpen ? (
                <FaTimes aria-hidden="true" />
              ) : (
                <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
                  <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
                </svg>
              )}
              {!isChatOpen && <span className="chat-bot-badge">1</span>}
            </button>
          )}
        </nav>
      </div>

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
