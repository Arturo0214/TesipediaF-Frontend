import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaGraduationCap, FaUserTie, FaShieldAlt, FaClock, FaCheck, FaAward, FaFileAlt,
  FaUserGraduate, FaHandshake, FaCertificate,
} from 'react-icons/fa';
import 'aos/dist/aos.css';
import AOS from 'aos';
import './Home.css';

function Home() {
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    {
      number: "1,500+",
      text: "Estudiantes Titulados",
      icon: <FaUserGraduate />
    },
    {
      number: "1,500+",
      text: "Tesis Aprobadas",
      icon: <FaGraduationCap />
    },
    {
      number: "100%",
      text: "Índice de Aprobación",
      icon: <FaAward />
    },
    {
      number: "30+",
      text: "Asesores Expertos",
      icon: <FaHandshake />
    }
  ];

  useEffect(() => {
    AOS.init({
      duration: 500,
      once: true
    });

    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 2000); // Cambia cada 2 segundos 

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Hero Section con animación */}
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
                  className="btn btn-lg" // Cambia a una clase de botón más adecuada
                  style={{
                    backgroundColor: '#ffffff',        // Fondo blanco
                    borderColor: '#ffffff',            // Borde blanco (puedes cambiarlo si quieres bordes en rojo)
                    color: '#ff6b6b',                  // Texto en rojo coral
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

      {/* Servicios Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">Nuestros Servicios</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="service-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="service-icon-wrapper mb-4">
                    <FaGraduationCap className="service-icon" />
                  </div>
                  <Card.Title>Desarrollo de Tesis</Card.Title>
                  <Card.Text>
                    Desarrollamos tu tesis completa con metodología profesional y
                    garantía de aprobación.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="service-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="service-icon-wrapper mb-4">
                    <FaUserTie className="service-icon" />
                  </div>
                  <Card.Title>Asesoría Personalizada</Card.Title>
                  <Card.Text>
                    Te asignamos un asesor experto en tu área para guiarte durante
                    todo el proceso.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="service-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="service-icon-wrapper mb-4">
                    <FaFileAlt className="service-icon" />
                  </div>
                  <Card.Title>Revisión y Corrección</Card.Title>
                  <Card.Text>
                    Revisamos y corregimos tu tesis para garantizar la máxima
                    calidad académica.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Proceso Section */}
      <section className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">¿Cómo Funciona?</h2>
          <Row className="g-4">
            <Col md={3}>
              <div className="process-step text-center">
                <div className="step-number">1</div>
                <h4>Cotiza tu Tesis</h4>
                <p>Llena el formulario con los detalles de tu proyecto</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="process-step text-center">
                <div className="step-number">2</div>
                <h4>Realiza el Pago</h4>
                <p>Elige tu método de pago preferido</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="process-step text-center">
                <div className="step-number">3</div>
                <h4>Seguimiento</h4>
                <p>Mantente en contacto con tu asesor asignado</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="process-step text-center">
                <div className="step-number">4</div>
                <h4>Recibe tu Tesis</h4>
                <p>Obtén tu trabajo listo para presentar</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Garantías Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">¿Por qué Elegirnos?</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="guarantee-item text-center">
                <FaShieldAlt className="guarantee-icon mb-3" />
                <h4>100% Confidencial</h4>
                <p>Tu información personal está protegida</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="guarantee-item text-center">
                <FaAward className="guarantee-icon mb-3" />
                <h4>Garantía de Calidad</h4>
                <p>Aseguramos la aprobación de tu tesis</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="guarantee-item text-center">
                <FaClock className="guarantee-icon mb-3" />
                <h4>Entregas a Tiempo</h4>
                <p>Cumplimos con los plazos establecidos</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5">
        <Container className="text-center">
          <h2 className="mb-4">¿Listo para Comenzar tu Tesis?</h2>
          <p className="lead mb-4">
            No esperes más para dar el siguiente paso en tu carrera académica
          </p>
          <Button
            as={Link}
            to="/cotizar"
            size="lg"
            variant="primary"
            className="shadow"
          >
            Cotizar Ahora
          </Button>
        </Container>
      </section>
    </>
  );
}

export default Home;
