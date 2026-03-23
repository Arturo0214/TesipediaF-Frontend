import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaComments,
  FaWhatsapp, FaGraduationCap, FaShieldAlt, FaCheckCircle,
  FaPaperPlane
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import ChatPanel from '../../components/chat/ChatPanel';
import './Contact.css';

function Contact() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Tesipedia",
    "url": "https://tesipedia.com/contacto",
    "telephone": "+52-56-7007-1517",
    "email": "tesipediaoficial@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ciudad de México",
      "addressRegion": "CDMX",
      "addressCountry": "MX"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "14:00"
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com/" },
      { "@type": "ListItem", "position": 2, "name": "Contacto", "item": "https://tesipedia.com/contacto" }
    ]
  };

  return (
    <div className="ct-page">
      <Helmet>
        <title>Contacto | ¿Necesitas ayuda con tu tesis? Escríbenos | Tesipedia México</title>
        <meta name="description" content="Contacta a Tesipedia por WhatsApp o chat en línea. Respuesta en menos de 5 minutos. Cotiza tu tesis gratis. Teléfono: +52 56 7007 1517. Atención personalizada en Ciudad de México." />
        <meta name="keywords" content="contacto Tesipedia, WhatsApp tesis, cotizar tesis México, asesoría tesis CDMX, ayuda con mi tesis teléfono, servicio de tesis contacto" />
        <meta property="og:title" content="Contacto Tesipedia | Cotiza tu tesis gratis" />
        <meta property="og:description" content="Escríbenos por WhatsApp o chat. Respuesta en menos de 5 minutos." />
        <meta property="og:url" content="https://tesipedia.com/contacto" />
        <link rel="canonical" href="https://tesipedia.com/contacto" />
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
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
