import React, { useState } from 'react';
import { Container, Row, Col, Accordion, Button } from 'react-bootstrap';
import {
  FaQuestionCircle, FaClock, FaShieldAlt, FaCreditCard,
  FaCheckCircle, FaWhatsapp, FaComments, FaPaperPlane,
  FaHeadset, FaGraduationCap, FaFileAlt, FaRedo
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
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
    question: '¿Cómo funciona la asesoría para hacer mi tesis?',
    answer: 'Nuestra asesoría para hacer tu tesis es un proceso personalizado que comienza con una consulta inicial gratuita para entender tus necesidades específicas. Asignamos un asesor especializado en tu área de estudio quien te guiará durante todo el proceso, desde la conceptualización hasta la revisión final de tu trabajo. Ofrecemos 3 modalidades: Asesoría Integral (te acompañamos en cada capítulo mientras tú lo desarrollas), Acompañamiento (trabajo conjunto sobre tus avances) y Corrección (revisión y mejora de tu borrador existente). Cada modalidad incluye revisión de originalidad y de estilo para que tu trabajo sea sólido y propio.',
    icon: <FaFileAlt />,
  },
  {
    category: 'servicio',
    question: '¿Para qué tipos de tesis y trabajos académicos dan asesoría?',
    answer: 'Asesoramos en todo tipo de trabajos académicos: tesis de licenciatura, tesis de maestría, tesis de doctorado, tesinas, artículos científicos, ensayos académicos, protocolos de investigación, trabajos de titulación y más. Cubrimos todas las áreas del conocimiento incluyendo ciencias sociales, ingenierías, ciencias de la salud, derecho, administración, educación, psicología, entre otras. Contamos con más de 50 asesores especializados en diferentes disciplinas que te guían para que desarrolles tu propio trabajo.',
    icon: <FaFileAlt />,
  },
  {
    category: 'tiempos',
    question: '¿Cuánto tiempo toma la asesoría de una tesis?',
    answer: 'El tiempo estándar de acompañamiento es de 3 a 4 semanas para una tesis de licenciatura. Para tesis de maestría y doctorado, el plazo puede ser de 4 a 8 semanas dependiendo de la complejidad del proyecto y los requisitos específicos de tu institución. También ofrecemos asesoría express para casos urgentes con ritmo acelerado. Durante todo el proceso tienes seguimiento en tiempo real del avance de tu proyecto.',
    icon: <FaClock />,
  },
  {
    category: 'calidad',
    question: '¿Cómo se asegura que mi tesis sea original y esté bien escrita?',
    answer: 'Tu tesis la escribes tú con nuestra guía, por lo que el contenido es original desde su origen. Como apoyo, revisamos la redacción y realizamos verificaciones de originalidad con herramientas como Turnitin®, usadas por las principales universidades de México (UNAM, IPN, ITESM, UAM), para que identifiques y corrijas cualquier cita mal referenciada. Nuestros asesores te orientan en la argumentación, la estructura y la correcta citación para que entregues un trabajo sólido, propio y bien fundamentado.',
    icon: <FaShieldAlt />,
  },
  {
    category: 'pagos',
    question: '¿Cuánto cuesta la asesoría de una tesis en México?',
    answer: 'El costo de la asesoría varía según el tipo de trabajo, nivel académico, alcance del acompañamiento y modalidad elegida. Para tesis de licenciatura, los precios de asesoría inician desde $110 MXN por página de trabajo acompañado. Para maestría desde $160 y doctorado desde $210. Ofrecemos descuento del 10% por pago en efectivo. Aceptamos tarjetas de crédito/débito, PayPal, transferencias bancarias y pagos en OXXO. También manejamos planes de pago flexibles.',
    icon: <FaCreditCard />,
  },
  {
    category: 'calidad',
    question: '¿Qué incluye el acompañamiento hasta la revisión de tu asesor y sinodales?',
    answer: 'Te acompañamos durante todo el proceso de tu tesis, incluida la revisión de fondo y estilo. Si tu asesor o sinodales piden ajustes dentro del alcance contratado, te guiamos para realizarlos y fortalecer tu trabajo. Hemos acompañado a más de 3,000 estudiantes en su proceso de titulación. Nuestro apoyo es metodológico y de revisión; la aprobación depende de tu institución, por lo que trabajamos para que llegues con un trabajo sólido y bien preparado, incluyendo la preparación para tu defensa.',
    icon: <FaCheckCircle />,
  },
  {
    category: 'servicio',
    question: '¿Cuántas revisiones incluye mi programa de asesoría?',
    answer: 'La Modalidad 1 (Asesoría Integral) incluye revisiones de fondo y estilo del asesor y sinodales, más una asesoría 1:1 al llegar a la versión preliminar. La Modalidad 2 (Acompañamiento) incluye acompañamiento continuo con ajustes durante todo el proceso. La modalidad de Corrección incluye una revisión integral de tu borrador existente. Las revisiones adicionales fuera del alcance original pueden tener un costo extra según la magnitud del cambio.',
    icon: <FaRedo />,
  },
  {
    category: 'tiempos',
    question: '¿Brindan atención los fines de semana?',
    answer: 'Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM. Los sábados atendemos de 9:00 AM a 2:00 PM. Si envías una solicitud durante el fin de semana o un día festivo, será atendida el siguiente día hábil en orden de llegada. Por WhatsApp puedes escribirnos las 24 horas y te respondemos en menos de 5 minutos durante horario de atención. Nos esforzamos por darte una respuesta oportuna y un seguimiento dedicado.',
    icon: <FaClock />,
  },
  {
    category: 'servicio',
    question: '¿Es confidencial la asesoría de tesis?',
    answer: 'Absolutamente. La confidencialidad es uno de nuestros pilares fundamentales. No compartimos información de ningún estudiante con terceros. Tu identidad, datos personales y el contenido de tu tesis están protegidos bajo nuestra política de privacidad. No publicamos ni reutilizamos ningún trabajo. Cada asesoría es única y exclusiva para cada estudiante.',
    icon: <FaShieldAlt />,
  },
  {
    category: 'pagos',
    question: '¿Puedo pagar mi asesoría de tesis en parcialidades o a meses?',
    answer: 'Sí, ofrecemos planes de pago flexibles adaptados a tus necesidades. Puedes hacer un anticipo para iniciar y liquidar conforme avanza tu proyecto. Aceptamos tarjetas de crédito y débito (con opción de meses sin intereses según tu banco), PayPal, transferencias bancarias SPEI, y pagos en efectivo en OXXO. Además, ofrecemos 10% de descuento por pago completo en efectivo.',
    icon: <FaCreditCard />,
  },
  {
    category: 'servicio',
    question: '¿Buscas quién te haga la tesis? Mejor asesórate y termínala tú',
    answer: 'Si estás buscando comprar tu tesis, considera una opción más segura: en Tesipedia te asesoramos para que la termines tú mismo. Con más de 3,000 estudiantes asesorados, te acompañamos para que desarrolles un trabajo original y propio desde $110 MXN por página de acompañamiento, con revisión de originalidad y de estilo. Nuestros asesores con maestría y doctorado te guían en cada etapa. Puedes cotizar gratis por WhatsApp al +52 56 7007 1517. Operamos de forma legal como servicio de asesoría académica profesional.',
    icon: <FaFileAlt />,
  },
  {
    category: 'servicio',
    question: '¿Dan asesoría de tesis para cualquier universidad de México?',
    answer: 'Sí, en Tesipedia asesoramos a estudiantes de cualquier universidad pública o privada de México. Hemos acompañado en su titulación a estudiantes de la UNAM, IPN, ITESM (Tec de Monterrey), UAM, UVM, UNITEC, La Salle, Anáhuac, Iberoamericana, BUAP, UdeG, UANL, y muchas más. Conocemos los lineamientos y formatos específicos de cada institución para que tu tesis cumpla con los requisitos.',
    icon: <FaGraduationCap />,
  },
  {
    category: 'servicio',
    question: '¿Pueden asesorarme aunque ya tenga avances de mi tesis?',
    answer: 'Por supuesto. Si ya tienes avances en tu tesis, podemos continuar desde donde te quedaste. Ofrecemos la modalidad de Acompañamiento donde trabajamos contigo sobre tus avances existentes, y también la modalidad de Corrección si solo necesitas una revisión profesional. Evaluamos tu trabajo actual de forma gratuita y te damos un plan personalizado para terminar tu tesis lo más rápido posible.',
    icon: <FaFileAlt />,
  },
  {
    category: 'calidad',
    question: '¿El trabajo es original y redactado por ti con guía humana?',
    answer: 'Sí. En Tesipedia el trabajo lo redactas tú con la guía de investigadores humanos, sin contenido generado por IA, por lo que es original desde su origen. Nuestros asesores te orientan en la argumentación y la redacción, y realizamos verificaciones de originalidad para que revises la calidad y autenticidad de tu propio contenido.',
    icon: <FaShieldAlt />,
  },
  {
    category: 'tiempos',
    question: '¿Pueden asesorarme con mi tesis urgente o express?',
    answer: 'Sí, ofrecemos asesoría express para tesis urgentes con un ritmo de acompañamiento acelerado. Si necesitas avanzar en menos de 3 semanas, contáctanos para evaluar tu caso. El costo puede variar según la urgencia y complejidad, pero mantenemos la misma calidad y rigurosidad que en nuestra asesoría estándar. Muchos estudiantes nos contactan con plazos ajustados y los hemos acompañado con buenos resultados.',
    icon: <FaClock />,
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
        <title>Preguntas Frecuentes | ¿Cuánto cuesta hacer una tesis? ¿Cómo comprar tesis? | Tesipedia</title>
        <meta name="description" content="Respuestas a las preguntas más comunes: ¿Cuánto cuesta la asesoría de una tesis en México? ¿Cómo funciona? ¿Cuánto tarda? ¿El trabajo es original? Te asesoramos para que hagas y termines tu propia tesis." />
        <meta name="keywords" content="hacer tesis, comprar tesis, asesoría de tesis, cuánto cuesta hacer una tesis, cuánto cuesta una tesis México, quién me asesora con mi tesis, hacer tesis rápido, revisión de originalidad tesis, pagar asesoría de tesis a meses, Tesipedia FAQ" />
        <meta property="og:title" content="Preguntas Frecuentes | ¿Cuánto cuesta la asesoría de una tesis? | Tesipedia" />
        <meta property="og:description" content="Todas las respuestas sobre nuestra asesoría de tesis: precios, tiempos, calidad y acompañamiento." />
        <meta property="og:url" content="https://tesipedia.com/preguntas-frecuentes" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://tesipedia.com/preguntas-frecuentes" />

        {/* FAQPage Schema - CLAVE para Rich Snippets en Google */}
        <script type="application/ld+json">{JSON.stringify(generateFAQSchema())}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* ── SEO Hidden H1 ── */}
      <h1 className="visually-hidden">Preguntas Frecuentes sobre Asesoría de Tesis Profesional en México - Tesipedia</h1>

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

      {/* Internal linking - Related blog articles */}
      <Container className="fq-main" style={{ paddingTop: 0 }}>
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '3rem'
        }}>
          <h3 style={{ color: '#1e3a5f', marginBottom: '1rem', fontSize: '1.2rem', textAlign: 'center' }}>
            Artículos que pueden ayudarte
          </h3>
          <Row className="g-3">
            <Col md={4}>
              <Link to="/blog/cuanto-cuesta-hacer-una-tesis-en-mexico-2026-precios-reales" style={{
                display: 'block', padding: '1rem', background: '#fff', borderRadius: '12px',
                textDecoration: 'none', color: '#1e3a5f', fontWeight: '600', fontSize: '0.9rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'transform 0.2s'
              }}>
                💰 ¿Cuánto Cuesta Hacer una Tesis en México?
              </Link>
            </Col>
            <Col md={4}>
              <Link to="/blog/como-hacer-una-tesis-rapido-10-pasos-titularte-2026" style={{
                display: 'block', padding: '1rem', background: '#fff', borderRadius: '12px',
                textDecoration: 'none', color: '#1e3a5f', fontWeight: '600', fontSize: '0.9rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'transform 0.2s'
              }}>
                ⚡ Cómo Hacer una Tesis Rápido: 10 Pasos
              </Link>
            </Col>
            <Col md={4}>
              <Link to="/blog/formato-apa-7-edicion-tesis-guia-completa-ejemplos" style={{
                display: 'block', padding: '1rem', background: '#fff', borderRadius: '12px',
                textDecoration: 'none', color: '#1e3a5f', fontWeight: '600', fontSize: '0.9rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'transform 0.2s'
              }}>
                📚 Formato APA 7a Edición: Guía Completa
              </Link>
            </Col>
          </Row>
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
