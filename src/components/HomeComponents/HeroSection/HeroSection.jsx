import { Col, Container, Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCheck, FaClock, FaShieldAlt, FaArrowRight, FaComments, FaWhatsapp } from 'react-icons/fa';
import './HeroSection.css';

const HeroSection = ({ stats, currentStat, onOpenChat }) => {
  return (
    <section className="hero-section-container text-white position-relative overflow-hidden">
      <div className="hero-section-background"></div>
      <Container>
        <Row className="align-items-center min-vh-100">
          <Col lg={6} className="hero-section-text" data-aos="fade-right">
            <h1 className="display-4 fw-bold mb-4" style={{ color: 'white' }}>
              ¡Tu Título Profesional en Tiempo Récord!
            </h1>
            <p className="lead mb-4">
              Más de 1,500 estudiantes titulados confían en nuestra metodología profesional y asesoría especializada.
            </p>
            <div className="hero-section-features mb-4">
              <div className="hero-section-feature-item">
                <FaCheck className="hero-section-feature-icon" /> Garantía de Aprobación Total
              </div>
              <div className="hero-section-feature-item">
                <FaClock className="hero-section-feature-icon" /> Ahorra Meses de Trabajo
              </div>
              <div className="hero-section-feature-item">
                <FaShieldAlt className="hero-section-feature-icon" /> 100% Confidencial
              </div>
            </div>
            <div className="d-flex gap-3 justify-content-center">
              <Button
                as={Link}
                to="/cotizar"
                className="btn-gradient-primary"
              >
                <span>¡Quiero Titularme Ya!</span>
              </Button>
              <Button
                as={Link}
                to="/como-funciona"
                className="btn-outline-gradient"
              >
                <span>Ver Proceso</span>
                <FaArrowRight className="arrow-icon" />
              </Button>
            </div>
          </Col>
          <Col lg={6} className="hero-section-stats position-relative" data-aos="fade-left">
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
                  <FaComments className="contact-btn-icon-new" />
                  <div className="contact-btn-content-new">
                    <span className="contact-btn-text-new">Chatear en la Página</span>
                    <span className="contact-btn-subtext-new">Respuesta inmediata</span>
                  </div>
                </Button>
                <Button
                  as="a"
                  href="https://wa.me/525583352096"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-btn-new contact-btn-whatsapp-new"
                >
                  <FaWhatsapp className="contact-btn-icon-new" />
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