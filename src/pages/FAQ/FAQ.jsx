import React, { useState } from 'react';
import { Container, Row, Col, Accordion, Button } from 'react-bootstrap';
import {
  FaQuestionCircle, FaClock, FaShieldAlt, FaCreditCard,
  FaCheckCircle, FaWhatsapp, FaComments, FaPaperPlane,
  FaHeadset, FaGraduationCap, FaFileAlt, FaRedo
} from 'react-icons/fa';
import ChatPanel from '../../components/chat/ChatPanel';
import './FAQ.css';

const faqCategories = [
  {
    id: 'servicio',
    label: 'Servicio',
    icon: <FaFileAlt />,
    color: '#2563eb',
  },
  {
    id: 'tiempos',
    label: 'Tiempos',
    icon: <FaClock />,
    color: '#f59e0b',
  },
  {
    id: 'calidad',
    label: 'Calidad',
    icon: <FaShieldAlt />,
    color: '#10b981',
  },
  {
    id: 'pagos',
    label: 'Pagos',
    icon: <FaCreditCard />,
    color: '#8b5cf6',
  },
];

const faqItems = [
  {
    category: 'servicio',
    question: '¿Cómo funciona el servicio de desarrollo de tesis?',
    answer: 'Nuestro servicio de desarrollo de tesis es un proceso personalizado que comienza con una consulta inicial para entender tus necesidades específicas. Asignamos un asesor especializado en tu área de estudio quien te guiará durante todo el proceso, desde la conceptualización hasta la entrega final.',
    icon: <FaFileAlt />,
  },
  {
    category: 'tiempos',
    question: '¿Cuál es el tiempo promedio de entrega?',
    answer: 'El tiempo estándar de entrega es de 3 semanas para una tesis completa. Sin embargo, este plazo puede variar según la complejidad del proyecto y los requisitos específicos de tu institución. También ofrecemos servicios express para casos urgentes.',
    icon: <FaClock />,
  },
  {
    category: 'calidad',
    question: '¿Cómo garantizan la originalidad del trabajo?',
    answer: 'Utilizamos Turnitin® y otras herramientas especializadas para garantizar la originalidad de cada trabajo. Además, nuestro equipo de investigadores desarrolla cada proyecto desde cero, asegurando contenido único y personalizado según tus requerimientos.',
    icon: <FaShieldAlt />,
  },
  {
    category: 'pagos',
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos diversos métodos de pago incluyendo tarjetas de crédito/débito, PayPal, transferencias bancarias y pagos en efectivo a través de OXXO. Ofrecemos planes de pago flexibles adaptados a tus necesidades.',
    icon: <FaCreditCard />,
  },
  {
    category: 'calidad',
    question: '¿Ofrecen garantía de aprobación?',
    answer: 'Sí, ofrecemos una garantía de aprobación del 100%. Si tu trabajo requiere modificaciones después de la revisión de fondo y estilo incluidas en el paquete, las realizaremos con un costo adicional hasta obtener la aprobación.',
    icon: <FaCheckCircle />,
  },
  {
    category: 'servicio',
    question: '¿Cuántas correcciones incluye mi paquete?',
    answer: 'Todos nuestros paquetes incluyen una corrección gratuita. En caso de requerir correcciones adicionales no contempladas en la cotización inicial, se puede aplicar un cargo adicional dependiendo de la magnitud del cambio solicitado.',
    icon: <FaRedo />,
  },
  {
    category: 'pagos',
    question: '¿Puedo solicitar un reembolso si hubo un error en la cotización?',
    answer: 'En caso de existir un error comprobable en la cotización debido a información incorrecta proporcionada por el cliente o por parte del equipo, revisaremos cada caso de forma individual. Podemos ofrecer reembolsos parciales o ajustes en el servicio para garantizar tu satisfacción.',
    icon: <FaCreditCard />,
  },
  {
    category: 'tiempos',
    question: '¿Brindan atención los fines de semana?',
    answer: 'Nuestro horario de atención es de lunes a viernes. Los sábados atendemos de 9:00 AM a 2:00 PM. Si envías una solicitud durante el fin de semana o un día festivo, será atendida el siguiente día hábil en orden de llegada. Te garantizamos respuesta oportuna y seguimiento dedicado.',
    icon: <FaClock />,
  },
];

function FAQ() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const filteredFaqs = activeCategory === 'all'
    ? faqItems
    : faqItems.filter(item => item.category === activeCategory);

  return (
    <div className="fq-page">
      {/* ── Hero ── */}
      <section className="fq-hero">
        <div className="fq-hero-bg" />
        <Container className="fq-hero-inner">
          <span className="fq-hero-badge">
            <FaQuestionCircle /> Centro de Ayuda
          </span>
          <h1 className="fq-hero-title">
            Preguntas{' '}
            <span className="fq-hero-accent">Frecuentes</span>
          </h1>
          <p className="fq-hero-sub">
            Todo lo que necesitas saber sobre nuestro servicio de
            desarrollo de tesis profesional.
          </p>
          <div className="fq-hero-stats">
            <div className="fq-hero-stat">
              <span className="fq-hero-stat-num">+3,000</span>
              <span className="fq-hero-stat-lbl">Titulados</span>
            </div>
            <div className="fq-hero-stat">
              <span className="fq-hero-stat-num">98%</span>
              <span className="fq-hero-stat-lbl">Satisfacción</span>
            </div>
            <div className="fq-hero-stat">
              <span className="fq-hero-stat-num">&lt;5 min</span>
              <span className="fq-hero-stat-lbl">Respuesta</span>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Main Content ── */}
      <Container className="fq-main">
        {/* Category Filter */}
        <div className="fq-filters">
          <button
            className={`fq-filter-btn ${activeCategory === 'all' ? 'fq-filter-active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <FaQuestionCircle /> Todas
          </button>
          {faqCategories.map(cat => (
            <button
              key={cat.id}
              className={`fq-filter-btn ${activeCategory === cat.id ? 'fq-filter-active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <Accordion className="fq-accordion">
              {filteredFaqs.map((item, i) => (
                <Accordion.Item eventKey={String(i)} key={i} className="fq-item">
                  <Accordion.Header className="fq-question">
                    <span className="fq-q-icon">{item.icon}</span>
                    {item.question}
                  </Accordion.Header>
                  <Accordion.Body className="fq-answer">
                    {item.answer}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>

        {/* ── CTA Section ── */}
        <div className="fq-cta">
          <div className="fq-cta-inner">
            <div className="fq-cta-icon-wrap">
              <FaHeadset />
            </div>
            <h3 className="fq-cta-title">¿No encontraste tu respuesta?</h3>
            <p className="fq-cta-desc">
              Nuestro equipo de asesores está disponible para resolver todas tus dudas
              de forma personalizada.
            </p>
            <div className="fq-cta-buttons">
              <Button
                as="a"
                href="https://wa.me/525670071517?text=Hola%2C%20tengo%20una%20duda%20sobre%20el%20servicio%20de%20tesis"
                target="_blank"
                rel="noopener noreferrer"
                className="fq-cta-btn fq-btn-green"
              >
                <FaWhatsapp /> WhatsApp <FaPaperPlane className="fq-btn-arrow" />
              </Button>
              <Button
                onClick={() => setIsChatOpen(true)}
                className="fq-cta-btn fq-btn-blue"
              >
                <FaComments /> Chat en Línea <FaPaperPlane className="fq-btn-arrow" />
              </Button>
            </div>
            <div className="fq-cta-trust">
              <span><FaCheckCircle /> Respuesta en menos de 5 min</span>
              <span><FaGraduationCap /> Asesores especializados</span>
              <span><FaShieldAlt /> 100% confidencial</span>
            </div>
          </div>
        </div>
      </Container>

      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        isPublic={true}
      />
    </div>
  );
}

export default FAQ;
