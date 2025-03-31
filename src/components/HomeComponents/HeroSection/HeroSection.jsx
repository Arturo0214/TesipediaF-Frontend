import { Col, Container, Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCheck, FaClock, FaShieldAlt } from 'react-icons/fa';
import './HeroSection.css';

const HeroSection = ({ stats, currentStat }) => {
  return (
    <section className="hero-section text-white position-relative overflow-hidden">
      <div className="hero-background"></div>
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="mb-5 mb-lg-0 text-container" data-aos="fade-right">
            <h1 className="display-4 fw-bold mb-4" style={{ color: 'white' }}>
              ¡Tu Título Profesional en Tiempo Récord!
            </h1>
            <p className="lead mb-4">
              Más de 1,500 estudiantes titulados confían en nuestra metodología profesional y asesoría especializada.
            </p>
            <div className="hero-features mb-4">
              <div className="feature-item">
                <FaCheck className="feature-icon" /> Garantía de Aprobación Total
              </div>
              <div className="feature-item">
                <FaClock className="feature-icon" /> Ahorra Meses de Trabajo
              </div>
              <div className="feature-item">
                <FaShieldAlt className="feature-icon" /> 100% Confidencial
              </div>
            </div>
            <div className="d-flex justify-content-center gap-3">
              <Button
                as={Link}
                to="/cotizar"
                size="lg"
                className="btn-gradient-primary"
                style={{ backgroundColor: '#ff6b6b', borderColor: '#ff6b6b' }}
              >
                ¡Quiero Titularme Ya!
              </Button>
              <Button
                as={Link}
                to="/como-funciona"
                size="lg"
                variant="outline-light"
                className="btn-outline-gradient"
                style={{ borderColor: '#ff8e53', color: '#ff8e53' }}
              >
                Ver Proceso
              </Button>
            </div>
          </Col>
          <Col lg={6} className="position-relative" data-aos="fade-left">
            <div className="stats-showcase">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`floating-stat-card ${currentStat === index ? 'active' : ''}`}
                  style={{
                    transform: `translateY(${index * 25}px)`,
                    zIndex: stats.length - index
                  }}
                >
                  <div className="stat-icon-wrapper">
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <div className="stat-number-wrapper">
                      <span className="stat-number-highlight">{stat.number}</span>
                    </div>
                    <div className="stat-text-wrapper">
                      <span className="stat-text-highlight">{stat.text}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="contact-advisor-floating">
              <p className="mb-2 text-center">¿Tienes preguntas?</p>
              <a
                role="button"
                href="https://wa.me/525583352096"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg"
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: '#ffffff',
                  color: '#ff6b6b',
                  fontWeight: 'bold',
                  width: '100%',
                }}
              >
                Contactar Asesor
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;