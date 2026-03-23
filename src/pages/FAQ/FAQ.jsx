import React, { useState } from 'react';
import { Container, Row, Col, Accordion, Button } from 'react-bootstrap';
import {
  FaQuestionCircle, FaClock, FaShieldAlt, FaCreditCard,
  FaCheckCircle, FaWhatsapp, FaComments, FaPaperPlane,
  FaHeadset, FaGraduationCap, FaFileAlt, FaRedo
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
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
    answer: 'Nuestro servicio de desarrollo de tesis es un proceso personalizado que comienza con una consulta inicial gratuita para entender tus necesidades específicas. Asignamos un asesor especializado en tu área de estudio quien te guiará durante todo el proceso, desde la conceptualización hasta la entrega final. Ofrecemos 3 modalidades: Desarrollo Completo (hacemos todo), Acompañamiento (trabajo conjunto) y Corrección (revisión de tu trabajo existente). Cada modalidad incluye escáner antiplagio Turnitin y detección anti-IA.',
    icon: <FaFileAlt />,
  },
  {
    category: 'servicio',
    question: '¿Qué tipos de tesis y trabajos académicos hacen?',
    answer: 'Desarrollamos todo tipo de trabajos académicos: tesis de licenciatura, tesis de maestría, tesis de doctorado, tesinas, artículos científicos, ensayos académicos, protocolos de investigación, trabajos de titulación y más. Cubrimos todas las áreas del conocimiento incluyendo ciencias sociales, ingenierías, ciencias de la salud, derecho, administración, educación, psicología, entre otras. Contamos con más de 50 asesores especializados en diferentes disciplinas.',
    icon: <FaFileAlt />,
  },
  {
    category: 'tiempos',
    question: '¿Cuánto tiempo tardan en hacer una tesis?',
    answer: 'El tiempo estándar de entrega es de 3 a 4 semanas para una tesis completa de licenciatura. Para tesis de maestría y doctorado, el plazo puede ser de 4 a 8 semanas dependiendo de la complejidad del proyecto y los requisitos específicos de tu institución. También ofrecemos servicios express para casos urgentes con entrega acelerada. Durante todo el proceso tienes seguimiento en tiempo real del avance de tu proyecto.',
    icon: <FaClock />,
  },
  {
    category: 'calidad',
    question: '¿Cómo garantizan que mi tesis sea original y sin plagio?',
    answer: 'Cada tesis pasa por un riguroso proceso de verificación. Utilizamos Turnitin®, el software antiplagio más reconocido a nivel mundial y usado por las principales universidades de México (UNAM, IPN, ITESM, UAM). Además, aplicamos escáneres anti-IA para garantizar que el contenido sea 100% humano. Nuestro equipo de investigadores desarrolla cada proyecto desde cero, asegurando contenido único y personalizado. Te entregamos el reporte de Turnitin como respaldo.',
    icon: <FaShieldAlt />,
  },
  {
    category: 'pagos',
    question: '¿Cuánto cuesta que me hagan una tesis en México?',
    answer: 'El costo de una tesis varía según el tipo de trabajo, nivel académico, número de páginas y modalidad elegida. Para una tesis de licenciatura de 100 páginas, los precios van desde $9,900 MXN (corrección) hasta $19,800 MXN (desarrollo completo). Para artículos científicos de 35 páginas, desde $6,300 MXN hasta $12,600 MXN. Ofrecemos descuento del 10% por pago en efectivo. Aceptamos tarjetas de crédito/débito, PayPal, transferencias bancarias y pagos en OXXO. También manejamos planes de pago flexibles.',
    icon: <FaCreditCard />,
  },
  {
    category: 'calidad',
    question: '¿Ofrecen garantía de aprobación de la tesis?',
    answer: 'Sí, ofrecemos garantía de aprobación. Si tu trabajo requiere modificaciones después de la revisión de fondo y estilo incluida en el paquete, las realizamos para obtener la aprobación de tu asesor y sinodales. Nuestro índice de aprobación es del 98% con más de 3,000 estudiantes titulados exitosamente. Te acompañamos hasta que obtengas tu título, incluyendo preparación para tu defensa de tesis.',
    icon: <FaCheckCircle />,
  },
  {
    category: 'servicio',
    question: '¿Cuántas correcciones incluye mi paquete de tesis?',
    answer: 'La Modalidad 1 (Desarrollo Completo) incluye correcciones de fondo y estilo del asesor y sinodales, más una asesoría 1:1 al entregarse la versión preliminar. La Modalidad 2 (Acompañamiento) incluye acompañamiento continuo con ajustes durante todo el proceso. La modalidad de Corrección incluye una revisión integral de tu trabajo existente. Correcciones adicionales fuera del alcance original pueden tener un costo extra según la magnitud del cambio.',
    icon: <FaRedo />,
  },
  {
    category: 'tiempos',
    question: '¿Brindan atención los fines de semana?',
    answer: 'Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM. Los sábados atendemos de 9:00 AM a 2:00 PM. Si envías una solicitud durante el fin de semana o un día festivo, será atendida el siguiente día hábil en orden de llegada. Por WhatsApp puedes escribirnos las 24 horas y te respondemos en menos de 5 minutos durante horario de atención. Te garantizamos respuesta oportuna y seguimiento dedicado.',
    icon: <FaClock />,
  },
  {
    category: 'servicio',
    question: '¿Es confidencial el servicio de tesis?',
    answer: 'Absolutamente. La confidencialidad es uno de nuestros pilares fundamentales. No compartimos información de ningún cliente con terceros. Tu identidad, datos personales y el contenido de tu tesis están protegidos bajo nuestra política de privacidad. No publicamos ni reutilizamos ningún trabajo. Cada proyecto es único y exclusivo para cada estudiante.',
    icon: <FaShieldAlt />,
  },
  {
    category: 'pagos',
    question: '¿Puedo pagar mi tesis en parcialidades o a meses?',
    answer: 'Sí, ofrecemos planes de pago flexibles adaptados a tus necesidades. Puedes hacer un anticipo para iniciar y liquidar conforme avanza tu proyecto. Aceptamos tarjetas de crédito y débito (con opción de meses sin intereses según tu banco), PayPal, transferencias bancarias SPEI, y pagos en efectivo en OXXO. Además, ofrecemos 10% de descuento por pago completo en efectivo.',
    icon: <FaCreditCard />,
  },
];

// Generar FAQPage Schema para Google Rich Snippets
const generateFAQSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
});

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://tesipedia.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Preguntas Frecuentes",
      "item": "https://tesipedia.com/preguntas-frecuentes"
    }
  ]
};

function FAQ() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const filteredFaqs = activeCategory === 'all'
    ? faqItems
    : faqItems.filter(item => item.category === activeCategory);

  return (
    <div className="fq-page">
      <Helmet>
        <title>Preguntas Frecuentes sobre Tesis | ¿Cuánto cuesta? ¿Cómo funciona? | Tesipedia</title>
        <meta name="description" content="Respuestas a las preguntas más comunes: ¿Cuánto cuesta que me hagan una tesis en México? ¿Cuánto tardan? ¿Es original? ¿Garantizan aprobación? Todo sobre el servicio de Tesipedia." />
        <meta name="keywords" content="preguntas frecuentes tesis, cuánto cuesta una tesis México, cuánto tardan en hacer una tesis, tesis sin plagio, garantía aprobación tesis, pagar tesis a meses, servicio de tesis confidencial, Tesipedia FAQ" />
        <meta property="og:title" content="Preguntas Frecuentes | ¿Cuánto cuesta una tesis? | Tesipedia" />
        <meta property="og:description" content="Todas las respuestas sobre nuestro servicio de tesis: precios, tiempos, calidad y garantías." />
        <meta property="og:url" content="https://tesipedia.com/preguntas-frecuentes" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://tesipedia.com/preguntas-frecuentes" />

        {/* FAQPage Schema - CLAVE para Rich Snippets en Google */}
        <script type="application/ld+json">{JSON.stringify(generateFAQSchema())}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* ── SEO Hidden H1 ── */}
      <h1 className="visually-hidden">Preguntas Frecuentes sobre Servicio de Tesis Profesional en México - Tesipedia</h1>

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
