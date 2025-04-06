import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaComments, FaWhatsapp } from 'react-icons/fa';
import ChatPanel from '../components/chat/ChatPanel';
import './Contact.css';

function Contact() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/525583352096', '_blank');
  };

  return (
    <div className="contact-page-container">
      <div className="contact-hero-section">
        <h1 className="contact-main-title">Contacto</h1>
        <p className="contact-hero-text">Estamos aquí para ayudarte en tu proyecto académico</p>
      </div>

      <Container className="contact-main-content">
        <Row className="g-4">
          <Col lg={5}>
            <div className="contact-chat-section">
              <div className="contact-chat-content">
                <h2 className="contact-section-title">¿Necesitas ayuda?</h2>
                <p className="contact-section-text">
                  Escríbenos directamente y te ayudaremos a encontrar la mejor solución
                </p>
                <div className="contact-buttons-container">
                  <Button
                    onClick={() => setIsChatOpen(true)}
                    className="contact-chat-button"
                  >
                    <FaComments /> Iniciar Chat
                  </Button>
                  <Button
                    onClick={handleWhatsAppClick}
                    className="contact-whatsapp-button"
                  >
                    <FaWhatsapp /> Contactar por WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={7}>
            <div className="contact-info-section">
              <div className="contact-info-grid">
                <div className="contact-info-card">
                  <FaEnvelope className="contact-info-icon" />
                  <div>
                    <h3 className="contact-info-title">Correo Electrónico</h3>
                    <p className="contact-info-text">tesipediaoficial@gmail.com</p>
                  </div>
                </div>
                <div className="contact-info-card">
                  <FaPhone className="contact-info-icon" />
                  <div>
                    <h3 className="contact-info-title">Teléfono</h3>
                    <p className="contact-info-text">+52 55 8335 2096</p>
                  </div>
                </div>
                <div className="contact-info-card">
                  <FaMapMarkerAlt className="contact-info-icon" />
                  <div>
                    <h3 className="contact-info-title">Ubicación</h3>
                    <p className="contact-info-text">Ciudad de México, CDMX</p>
                  </div>
                </div>
                <div className="contact-info-card">
                  <FaClock className="contact-info-icon" />
                  <div>
                    <h3 className="contact-info-title">Horario de Atención</h3>
                    <p className="contact-info-text">Lun - Vie: 9:00 AM - 6:00 PM</p>
                    <p className="contact-info-text">Sáb: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        isPublic={true}
      />
    </div>
  );
}

export default Contact;
