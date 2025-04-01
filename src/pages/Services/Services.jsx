import { Container, Row, Col, ListGroup, Modal } from 'react-bootstrap';
import { FaGraduationCap, FaUserTie, FaClipboardCheck, FaChartLine, FaCheckCircle, FaArrowRight, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import './Services.css';

function Services() {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFeatureClick = (feature, color, serviceNumber) => {
    setSelectedFeature({ ...feature, color, serviceNumber });
    if (isMobile) {
      setShowModal(true);
    }
  };

  const FeatureDetails = ({ inModal }) => {
    if (!selectedFeature) {
      return (
        <div className="feature-placeholder">
          <p>Selecciona una característica para ver más detalles</p>
        </div>
      );
    }

    return (
      <>
        {inModal && (
          <FaTimes
            className="modal-close-btn"
            onClick={() => setShowModal(false)}
          />
        )}
        <div className="feature-detail-header">
          <span className="feature-detail-number" style={{
            color: selectedFeature.color
          }}>
            {selectedFeature.serviceNumber}
          </span>
          <h3 style={{ color: selectedFeature.color }}>{selectedFeature.title}</h3>
        </div>
        <p className="feature-description">{selectedFeature.description}</p>
        <div className="feature-benefits">
          <h4>Beneficios:</h4>
          <ul>
            {selectedFeature.benefits.map((benefit, idx) => (
              <li key={idx}>
                <FaCheckCircle style={{ color: selectedFeature.color }} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  };

  const services = [
    {
      icon: <FaGraduationCap />,
      title: 'Desarrollo de Tesis',
      description: 'Garantizamos el desarrollo completo de tu tesis con una metodología profesional y un 100% de aprobación.',
      features: [
        {
          title: 'Desarrollo completo desde cero',
          description: 'Iniciamos tu proyecto desde la conceptualización hasta la entrega final, guiándote en cada paso del proceso con metodologías probadas y efectivas.',
          benefits: ['Ahorro de tiempo', 'Estructura profesional', 'Guía experta']
        },
        {
          title: 'Escáner anti-plagio',
          description: 'Verificamos la originalidad de tu tesis utilizando Turnitin®, el software líder mundial en detección de plagio, garantizando un trabajo 100% único y validado.',
          benefits: ['Reporte oficial Turnitin', 'Verificación exhaustiva', 'Garantía de originalidad']
        },
        {
          title: 'Escáner Anti-IA',
          description: 'Utilizamos Turnitin® AI Writing Detection para asegurar que el contenido sea genuinamente humano, cumpliendo con los estándares académicos más exigentes.',
          benefits: ['Detección Turnitin AI', 'Contenido auténtico', 'Cumplimiento académico']
        },
        {
          title: 'Entrega en 3 semanas',
          description: 'Nos comprometemos a entregar tu tesis completa en un plazo de 3 semanas, manteniendo la más alta calidad en cada capítulo.',
          benefits: ['Entrega rápida', 'Calidad garantizada', 'Tiempo optimizado']
        },
        {
          title: 'Metodología científica rigurosa',
          description: 'Aplicamos métodos de investigación validados académicamente, asegurando la calidad y rigor científico de tu trabajo.',
          benefits: ['Validez académica', 'Fundamentación sólida', 'Resultados confiables']
        },
        {
          title: '100% de garantía de aprobación',
          description: 'Nuestro compromiso es tu éxito. Trabajamos hasta asegurar la aprobación de tu tesis con los más altos estándares.',
          benefits: ['100% de éxito', 'Revisiones ilimitadas', 'Soporte continuo']
        },
        {
          title: 'Seguimiento personalizado',
          description: 'Te acompañamos en cada etapa con atención individualizada, adaptándonos a tus necesidades y tiempos.',
          benefits: ['Atención individual', 'Flexibilidad horaria', 'Comunicación constante']
        },
        {
          title: 'Cumplimiento de normativas institucionales',
          description: 'Nos adaptamos a los requerimientos específicos de tu institución, asegurando el cumplimiento de todas las normas.',
          benefits: ['Formato correcto', 'Referencias precisas', 'Documentación completa']
        },
        {
          title: 'Asesoría en defensa oral',
          description: 'Te preparamos para la presentación final con técnicas efectivas de comunicación y manejo de preguntas.',
          benefits: ['Preparación integral', 'Ensayos prácticos', 'Técnicas de presentación']
        }
      ],
      color: '#4F46E5'
    },
    {
      icon: <FaUserTie />,
      title: 'Asesoría Académica',
      description: 'Acompañamiento experto para diversos tipos de trabajos académicos y profesionales.',
      features: [
        {
          title: 'Tesis y tesinas',
          description: 'Asesoramiento especializado en el desarrollo de tesis y tesinas, con énfasis en la estructura, metodología y argumentación.',
          benefits: ['Orientación metodológica', 'Revisión estructural', 'Feedback continuo']
        },
        {
          title: 'Proyectos de investigación',
          description: 'Apoyo integral en el diseño, ejecución y documentación de proyectos de investigación académica y científica.',
          benefits: ['Diseño metodológico', 'Análisis de datos', 'Documentación profesional']
        },
        {
          title: 'Ensayos académicos',
          description: 'Guía en la elaboración de ensayos académicos con argumentación sólida y estructura coherente.',
          benefits: ['Claridad argumentativa', 'Estructura lógica', 'Referencias académicas']
        },
        {
          title: 'Artículos científicos',
          description: 'Asesoría en la redacción y publicación de artículos científicos siguiendo estándares internacionales.',
          benefits: ['Formato científico', 'Revisión por pares', 'Estrategias de publicación']
        },
        {
          title: 'Exámenes profesionales',
          description: 'Preparación integral para exámenes profesionales, incluyendo revisión de contenido y estrategias de presentación.',
          benefits: ['Material personalizado', 'Simulacros prácticos', 'Técnicas de estudio']
        },
        {
          title: 'Asesoría temática personalizada',
          description: 'Atención individualizada según las necesidades específicas de cada proyecto o área de estudio.',
          benefits: ['Adaptación al tema', 'Atención personalizada', 'Soluciones específicas']
        }
      ],
      color: '#06B6D4'
    },
    {
      icon: <FaClipboardCheck />,
      title: 'Preparación para Examen Profesional',
      description: 'Asesoría especializada para tu examen profesional, garantizando tu éxito.',
      features: [
        {
          title: 'Preparación integral del tema',
          description: 'Desarrollo completo del temario con énfasis en los puntos clave y conceptos fundamentales de tu área.',
          benefits: ['Dominio del tema', 'Material completo', 'Conceptos clave']
        },
        {
          title: 'Simulacros de examen',
          description: 'Práctica intensiva con simulaciones reales del examen, incluyendo retroalimentación detallada.',
          benefits: ['Experiencia práctica', 'Retroalimentación inmediata', 'Manejo del tiempo']
        },
        {
          title: 'Material de estudio personalizado',
          description: 'Recursos y materiales adaptados a tu estilo de aprendizaje y necesidades específicas.',
          benefits: ['Contenido adaptado', 'Recursos multimedia', 'Ejercicios prácticos']
        },
        {
          title: 'Estrategias de presentación',
          description: 'Técnicas efectivas para la presentación oral y manejo de preguntas durante el examen.',
          benefits: ['Comunicación efectiva', 'Control de nervios', 'Respuestas precisas']
        },
        {
          title: 'Acompañamiento psicológico',
          description: 'Apoyo emocional y técnicas de manejo del estrés para mantener la calma durante el proceso.',
          benefits: ['Manejo de ansiedad', 'Confianza personal', 'Equilibrio emocional']
        },
        {
          title: 'Técnicas de oratoria',
          description: 'Desarrollo de habilidades de comunicación oral para una presentación clara y convincente.',
          benefits: ['Expresión clara', 'Lenguaje corporal', 'Impacto comunicativo']
        }
      ],
      color: '#EC4899'
    },
    {
      icon: <FaChartLine />,
      title: 'Análisis Estadístico',
      description: 'Procesamiento y análisis profesional de datos para tu investigación.',
      features: [
        {
          title: 'Análisis descriptivo',
          description: 'Procesamiento inicial de datos con estadísticas descriptivas y visualizaciones informativas.',
          benefits: ['Resumen de datos', 'Gráficos claros', 'Interpretación precisa']
        },
        {
          title: 'Pruebas estadísticas',
          description: 'Aplicación de pruebas estadísticas avanzadas para validar hipótesis y encontrar correlaciones.',
          benefits: ['Validación científica', 'Rigor metodológico', 'Resultados confiables']
        },
        {
          title: 'Visualización de datos',
          description: 'Creación de gráficos y visualizaciones profesionales para comunicar resultados efectivamente.',
          benefits: ['Gráficos profesionales', 'Claridad visual', 'Comunicación efectiva']
        },
        {
          title: 'Interpretación de resultados',
          description: 'Análisis detallado de los resultados estadísticos y su significado en el contexto de la investigación.',
          benefits: ['Conclusiones claras', 'Contexto aplicado', 'Recomendaciones']
        },
        {
          title: 'Software especializado',
          description: 'Uso de herramientas estadísticas profesionales para análisis avanzados y precisos.',
          benefits: ['Tecnología actual', 'Métodos avanzados', 'Precisión analítica']
        },
        {
          title: 'Reportes detallados',
          description: 'Elaboración de informes completos con metodología, resultados y conclusiones.',
          benefits: ['Documentación completa', 'Formato profesional', 'Explicaciones claras']
        }
      ],
      color: '#059669'
    }
  ];

  return (
    <div className="services-page">
      <Container>
        <div className="services-header">
          <h2 className="services-title">
            <span className="services-title-decoration">
              Servicios
            </span>
          </h2>
          <div className="services-subtitle">Soluciones académicas profesionales</div>
        </div>

        <Row className="justify-content-center gx-3">
          <Col lg={6} xl={6}>
            <div className="services-list">
              {services.map((service, index) => (
                <div className="service-card" key={index}>
                  <div className="service-number" style={{
                    color: service.color,
                    textShadow: `2px 2px 4px ${service.color}40`
                  }}>
                    {index + 1}
                  </div>
                  <span className="service-hint">
                    <FaArrowRight /> Selecciona el rubro para ver más
                  </span>
                  <div className="service-content">
                    <div className="service-header">
                      <div className="service-icon" style={{
                        color: service.color,
                        borderColor: service.color,
                        background: 'white'
                      }}>
                        {service.icon}
                      </div>
                      <div className="service-title-group">
                        <h2 style={{ color: service.color }}>{service.title}</h2>
                        <p>{service.description}</p>
                      </div>
                    </div>
                    <ListGroup variant="flush" className="service-features">
                      {service.features.map((feature, idx) => (
                        <ListGroup.Item
                          key={idx}
                          onClick={() => handleFeatureClick(feature, service.color, index + 1)}
                          className={selectedFeature?.title === feature.title ? 'active' : ''}
                        >
                          <FaCheckCircle style={{ color: service.color }} />
                          <span>{feature.title}</span>
                          <div className="feature-arrow-container">
                            <FaArrowRight className="feature-arrow" style={{
                              background: `linear-gradient(90deg, transparent, ${service.color}40 50%, ${service.color})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }} />
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                </div>
              ))}
            </div>
          </Col>
          <Col lg={5} xl={4} className="d-none d-lg-block">
            <div className="feature-detail-panel">
              <FeatureDetails />
            </div>
          </Col>
        </Row>

        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          className="feature-detail-modal"
          centered
        >
          <Modal.Body>
            <FeatureDetails inModal={true} />
          </Modal.Body>
        </Modal>

        <div className="services-cta-section">
          <div className="shine-effect"></div>
          <h3>¿Listo para alcanzar la excelencia académica?</h3>
          <p>Obtén una cotización personalizada para tu proyecto en menos de 5 minutos</p>
          <a href="/cotizar" className="btn btn-primary">
            Cotiza tu proyecto ahora <FaArrowRight className="ms-2" />
          </a>
        </div>
      </Container>
    </div>
  );
}

export default Services;
