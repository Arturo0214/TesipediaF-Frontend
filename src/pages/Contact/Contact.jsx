import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaComments,
  FaWhatsapp, FaGraduationCap, FaShieldAlt, FaCheckCircle,
  FaPaperPlane
} from 'react-icons/fa';
import ChatPanel from '../../components/chat/ChatPanel';
import './Contact.css';

function Contact() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="ct-page">
      {/* ── Main Content ── */}
      <Container className="ct-main">
        <Row className="g-4 align-items-stretch">
          {/* Left — CTA Cards */}
          <Col lg={5}>
            <div className="ct-cta-card ct-cta-wa">
              <div className="ct-cta-icon-wrap ct-cta-icon-green">
                <FaWhatsapp />
              </div>
              <h3 className="ct-cta-title">Escríbenos por WhatsApp</h3>
              <p className="ct-cta-desc">
                Respuesta en menos de 5 minutos. Cuéntanos sobre tu proyecto
                y recibe una cotización personalizada.
              </p>
              <Button
                as="a"
                href="https://wa.me/525670071517?text=Hola%2C%20quiero%20información%20sobre%20el%20servicio%20de%20tesis"
                target="_blank"
                rel="noopener noreferrer"
                className="ct-cta-btn ct-btn-green"
              >
                <FaWhatsapp /> Abrir WhatsApp <FaPaperPlane className="ct-btn-arrow" />
              </Button>
            </div>

            <div className="ct-cta-card ct-cta-chat">
              <div className="ct-cta-icon-wrap ct-cta-icon-blue">
                <FaComments />
              </div>
              <h3 className="ct-cta-title">Chat en la Página</h3>
              <p className="ct-cta-desc">
                Habla con un asesor directamente desde aquí. Sin necesidad de
                instalar nada, respuesta inmediata.
              </p>
              <Button
                onClick={() => setIsChatOpen(true)}
                className="ct-cta-btn ct-btn-blue"
              >
                <FaComments /> Iniciar Chat <FaPaperPlane className="ct-btn-arrow" />
              </Button>
            </div>
          </Col>

          {/* Right — Info */}
          <Col lg={7}>
            <div className="ct-info-panel">
              <h2 className="ct-info-title">Información de Contacto</h2>
              <p className="ct-info-sub">Elige el canal que prefieras para comunicarte con nosotros</p>

              <div className="ct-info-grid">
                <div className="ct-info-item">
                  <div className="ct-info-icon"><FaPhone /></div>
                  <div>
                    <h4>Teléfono / WhatsApp</h4>
                    <a href="https://wa.me/525670071517" target="_blank" rel="noopener noreferrer">
                      +52 56 7007 1517
                    </a>
                  </div>
                </div>
                <div className="ct-info-item">
                  <div className="ct-info-icon"><FaEnvelope /></div>
                  <div>
                    <h4>Correo Electrónico</h4>
                    <span>tesipediaoficial@gmail.com</span>
                  </div>
                </div>
                <div className="ct-info-item">
                  <div className="ct-info-icon"><FaMapMarkerAlt /></div>
                  <div>
                    <h4>Ubicación</h4>
                    <span>Ciudad de México, CDMX</span>
                  </div>
                </div>
                <div className="ct-info-item">
                  <div className="ct-info-icon"><FaClock /></div>
                  <div>
                    <h4>Horario de Atención</h4>
                    <span>Lun – Vie: 9:00 AM – 6:00 PM</span>
                    <span>Sáb: 9:00 AM – 2:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="ct-trust">
                <div className="ct-trust-item">
                  <FaCheckCircle className="ct-trust-icon" />
                  <span>100% Confidencial</span>
                </div>
                <div className="ct-trust-item">
                  <FaShieldAlt className="ct-trust-icon" />
                  <span>Anti-Plagio Garantizado</span>
                </div>
                <div className="ct-trust-item">
                  <FaGraduationCap className="ct-trust-icon" />
                  <span>Acompañamiento Total</span>
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
