import { Col, Container, Row, Button } from 'react-bootstrap';
import { FaCheck, FaClock, FaShieldAlt, FaComments, FaWhatsapp } from 'react-icons/fa';
import './HeroSection.css';

const HeroSection = ({ stats, currentStat, onOpenChat }) => {
  return (
    <section className="hero-section-container text-white position-relative overflow-hidden">
      <div className="hero-section-background"></div>
      <Container>
        <Row className="hero-section-row align-items-start">
          {/* LEFT COLUMN — Text + Features + CTA */}
          <Col lg={6} className="hero-section-text" data-aos="fade-right">
            <h1 className="display-5 fw-bold mb-3" style={{ color: 'white' }}>
              ¿Necesitas hacer tu tesis? Te ayudamos a titularte
            </h1>
            <p className="lead mb-3" style={{ fontSize: '1.05rem' }}>
              En Tesipedia hacemos tu tesis de licenciatura, maestría y doctorado en México. 100% original, sin plagio ni IA. +3,000 titulados. Entrega desde 3 semanas.
            </p>
            <div className="hero-section-features mb-4">
              <div className="hero-section-feature-item">
                <FaCheck className="hero-section-feature-icon" aria-hidden="true" /> Garantía de Aprobación Total
              </div>
              <div className="hero-section-feature-item">
                <FaClock className="hero-section-feature-icon" aria-hidden="true" /> Ahorra Meses de Trabajo
              </div>
              <div className="hero-section-feature-item">
                <FaShieldAlt className="hero-section-feature-icon" aria-hidden="true" /> 100% Confidencial
              </div>
            </div>
            <div className="d-flex gap-3 justify-content-center">
              <Button
                as="a"
                href="https://wa.me/525670071517?text=Hola%2C%20quiero%20información%20sobre%20el%20servicio%20de%20tesis"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gradient-primary"
              >
                <span>¡Quiero Titularme Ya!</span>
              </Button>
              <Button
                onClick={onOpenChat}
                className="btn-outline-gradient"
              >
                <FaComments style={{ position: 'relative', zIndex: 2 }} aria-hidden="true" />
                <span>Chat en Línea</span>
              </Button>
            </div>
          </Col>

          {/* RIGHT COLUMN — Stat cards + Contact buttons below */}
          <Col lg={6} className="hero-section-right" data-aos="fade-left">
            <div className="hero-section-stats-showcase">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`hero-section-floating-stat-card ${currentStat === index ? 'active' : ''}`}
                  style={{
                    transform: `translateY(${index * 25}px)`,
                    zIndex: stats.length - index
                  }}
                >
                  <div className="hero-section-stat-icon-wrapper">
                    {stat.icon}
                  </div>
                  <div className="hero-section-stat-content">
                    <div className="hero-section-stat-number-wrapper">
                      <span className="hero-section-stat-number-highlight">{stat.number}</span>
                    </div>
                    <div className="hero-section-stat-text-wrapper">
                      <span className="hero-section-stat-text-highlight">{stat.text}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hero-section-contact-new">
              <h3 className="contact-title-new">¿Tienes dudas sobre tu tesis?</h3>
              <p className="contact-subtitle-new">¡Habla con un asesor ahora!</p>
              <div className="contact-buttons-new">
                <Button
                  onClick={onOpenChat}
                  className="contact-btn-new contact-btn-chat-new"
                >
                  <FaComments className="contact-btn-icon-new" aria-hidden="true" />
                  <div className="contact-btn-content-new">
                    <span className="contact-btn-text-new">Chatear en la Página</span>
                    <span className="contact-btn-subtext-new">Respuesta inmediata</span>
                  </div>
                </Button>
                <Button
                  as="a"
                  href="https://wa.me/525670071517"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-btn-new contact-btn-whatsapp-new"
                  aria-label="Contactar por WhatsApp"
                >
                  <FaWhatsapp className="contact-btn-icon-new" aria-hidden="true" />
                  <div className="contact-btn-content-new">
                    <span className="contact-btn-text-new">Contactar por WhatsApp</span>
                    <span className="contact-btn-subtext-new">Asesoría 24/7</span>
                  </div>
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
