import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { trackVisit } from '../../features/visits/visitsSlice';
import { trackGoogleAdsConversion, trackCTA } from '../../services/eventService';
import {
  FaWhatsapp, FaCheckCircle, FaStar, FaUserGraduate,
  FaGraduationCap, FaClock, FaChalkboardTeacher, FaArrowRight, FaQuoteLeft,
  FaBookReader, FaHandsHelping, FaCalendarCheck, FaShieldAlt, FaChevronDown
} from 'react-icons/fa';

const WA_LINK = 'https://wa.me/5215670071517?text=Hola%2C%20me%20interesa%20la%20tutor%C3%ADa%20acad%C3%A9mica';
const handleWAClick = (ctaName = 'tutoria_whatsapp') => {
  trackCTA(ctaName, 'WhatsApp Tutoría Académica');
  trackGoogleAdsConversion();
};

const LOGO_URL = 'https://res.cloudinary.com/dbowaer8j/image/upload/f_auto,q_auto,w_200/v1743713944/Tesipedia-logo_n1liaw.png';

/* ─── Inline Styles ─── */
const styles = {
  /* MINI HEADER — limpio para Google Ads */
  miniHeader: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  miniHeaderLogo: {
    height: '38px',
    width: 'auto',
  },
  miniHeaderCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#25d366',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 700,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  /* MINI FOOTER — limpio para Google Ads */
  miniFooter: {
    background: '#1a1a2e',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    padding: '32px 24px',
    fontSize: '0.88rem',
    lineHeight: 1.7,
  },
  miniFooterBrand: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.05rem',
    marginBottom: '8px',
  },
  miniFooterLink: {
    color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    margin: '0 10px',
    fontSize: '0.82rem',
  },
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#1a1a2e',
    overflowX: 'hidden',
    background: '#fff',
  },
  /* HERO */
  hero: {
    background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    color: '#fff',
    padding: '100px 24px 80px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(79,70,229,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(37,211,102,0.15) 0%, transparent 40%)',
    pointerEvents: 'none',
  },
  heroContent: {
    maxWidth: '820px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,193,7,0.12)',
    border: '1px solid rgba(255,193,7,0.35)',
    color: '#ffc107',
    fontSize: '0.88rem',
    fontWeight: 600,
    padding: '8px 20px',
    borderRadius: '50px',
    marginBottom: '24px',
    backdropFilter: 'blur(10px)',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.2rem)',
    fontWeight: 800,
    lineHeight: 1.12,
    marginBottom: '20px',
    letterSpacing: '-0.03em',
  },
  heroGradientText: {
    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
    lineHeight: 1.65,
    opacity: 0.9,
    maxWidth: '640px',
    margin: '0 auto 32px',
  },
  heroCtas: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '32px',
  },
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #25d366 0%, #128C7E 100%)',
    color: '#fff',
    padding: '16px 32px',
    borderRadius: '14px',
    fontSize: '1.08rem',
    fontWeight: 700,
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(37,211,102,0.35)',
    border: 'none',
    cursor: 'pointer',
  },
  ctaSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: '#fff',
    padding: '16px 28px',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
  },
  trustRow: {
    display: 'flex',
    gap: '28px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    fontSize: '0.88rem',
    fontWeight: 500,
    opacity: 0.85,
  },
  trustItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  /* SECTIONS */
  section: {
    padding: '80px 24px',
    maxWidth: '1140px',
    margin: '0 auto',
  },
  sectionAlt: {
    padding: '80px 24px',
    background: 'linear-gradient(180deg, #f8f9ff 0%, #eef1ff 100%)',
  },
  sectionInner: {
    maxWidth: '1140px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: '12px',
    color: '#1a1a2e',
    letterSpacing: '-0.02em',
  },
  sectionSub: {
    textAlign: 'center',
    maxWidth: '680px',
    margin: '0 auto 48px',
    color: '#64748b',
    fontSize: '1.08rem',
    lineHeight: 1.65,
  },
  /* FEATURES */
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '32px 28px',
    transition: 'all 0.3s ease',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden',
  },
  featureIconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px',
    fontSize: '1.5rem',
  },
  featureTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '10px',
    color: '#1a1a2e',
  },
  featureDesc: {
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: 1.6,
    margin: 0,
  },
  /* STEPS */
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '32px',
    position: 'relative',
  },
  step: {
    textAlign: 'center',
    padding: '8px',
    position: 'relative',
  },
  stepNum: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
    color: '#fff',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 800,
    margin: '0 auto 18px',
    boxShadow: '0 8px 20px rgba(79,70,229,0.25)',
  },
  stepTitle: {
    fontSize: '1.08rem',
    fontWeight: 700,
    marginBottom: '10px',
    color: '#1a1a2e',
  },
  stepDesc: {
    fontSize: '0.92rem',
    color: '#64748b',
    lineHeight: 1.6,
    margin: 0,
  },
  /* PRICING */
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '28px',
    alignItems: 'stretch',
  },
  priceCard: {
    background: '#fff',
    borderRadius: '24px',
    padding: '36px 28px 32px',
    textAlign: 'center',
    position: 'relative',
    border: '2px solid #e2e8f0',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  priceCardFeatured: {
    background: 'linear-gradient(180deg, #fafafe 0%, #f0edff 100%)',
    borderColor: '#4F46E5',
    boxShadow: '0 12px 40px rgba(79,70,229,0.15)',
    transform: 'scale(1.02)',
  },
  priceBadge: {
    position: 'absolute',
    top: '-14px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)',
    color: '#fff',
    padding: '6px 22px',
    borderRadius: '50px',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
  },
  priceLevel: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#64748b',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  priceAmount: {
    fontSize: '2.8rem',
    fontWeight: 800,
    color: '#1a1a2e',
    lineHeight: 1,
  },
  priceUnit: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    fontWeight: 500,
    marginBottom: '24px',
    display: 'block',
    marginTop: '4px',
  },
  priceList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 28px',
    textAlign: 'left',
    flex: 1,
  },
  priceListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    fontSize: '0.94rem',
    color: '#475569',
    borderBottom: '1px solid #f1f5f9',
  },
  checkIcon: {
    color: '#25d366',
    flexShrink: 0,
    fontSize: '0.85rem',
  },
  priceBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 24px',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 700,
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    width: '100%',
    boxSizing: 'border-box',
  },
  /* TESTIMONIALS */
  testimonialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  testimonialCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '28px',
    border: '1px solid #e2e8f0',
    position: 'relative',
  },
  testimonialStars: {
    color: '#ffc107',
    display: 'flex',
    gap: '2px',
    marginBottom: '14px',
    fontSize: '0.95rem',
  },
  testimonialText: {
    fontSize: '0.98rem',
    lineHeight: 1.65,
    color: '#475569',
    marginBottom: '18px',
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  authorAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1rem',
    color: '#fff',
  },
  authorName: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#1a1a2e',
  },
  authorRole: {
    fontSize: '0.82rem',
    color: '#94a3b8',
  },
  /* FAQ */
  faqList: {
    maxWidth: '780px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  faqItem: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  },
  faqQuestion: {
    width: '100%',
    padding: '20px 24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1a1a2e',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  faqAnswer: {
    padding: '0 24px 20px',
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: 1.65,
  },
  faqChevron: {
    transition: 'transform 0.3s ease',
    color: '#4F46E5',
    flexShrink: 0,
    marginLeft: '12px',
  },
  /* FINAL CTA */
  finalCta: {
    background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    color: '#fff',
    textAlign: 'center',
    padding: '80px 24px',
    position: 'relative',
    overflow: 'hidden',
  },
  finalCtaBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(79,70,229,0.2) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  finalCtaIcon: {
    fontSize: '3rem',
    marginBottom: '20px',
    opacity: 0.9,
  },
  finalCtaTitle: {
    fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
    fontWeight: 800,
    marginBottom: '14px',
  },
  finalCtaSub: {
    maxWidth: '560px',
    margin: '0 auto 28px',
    opacity: 0.88,
    fontSize: '1.08rem',
    lineHeight: 1.6,
  },
};

/* ─── FAQ Accordion Component ─── */
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...styles.faqItem, ...(open ? { borderColor: '#4F46E5', boxShadow: '0 4px 16px rgba(79,70,229,0.08)' } : {}) }}>
      <button style={styles.faqQuestion} onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{question}</span>
        <FaChevronDown style={{ ...styles.faqChevron, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {open && <div style={styles.faqAnswer}>{answer}</div>}
    </div>
  );
}

/* ─── Feature Card Colors ─── */
const featureColors = [
  { bg: '#eef2ff', color: '#4F46E5' },
  { bg: '#ecfdf5', color: '#059669' },
  { bg: '#fef3c7', color: '#d97706' },
  { bg: '#fce7f3', color: '#db2777' },
  { bg: '#e0f2fe', color: '#0284c7' },
  { bg: '#f3e8ff', color: '#7c3aed' },
];

function TutoriaAcademica() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(trackVisit({ path: '/tutoria-academica', referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
    window.scrollTo(0, 0);
  }, [dispatch]);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Tesipedia — Tutoría y Mentoría Académica",
    "description": "Servicio de tutoría y orientación académica personalizada para estudiantes universitarios. Mentores con maestría y doctorado te guían en tu proyecto de investigación.",
    "url": "https://tesipedia.com/tutoria-academica",
    "logo": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "sameAs": ["https://www.facebook.com/tesipedia"],
    "areaServed": { "@type": "Country", "name": "México" },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Programas de Tutoría Académica",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Mentoría en Metodología de Investigación" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Orientación para Proyectos de Licenciatura" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Tutoría para Proyectos de Maestría y Doctorado" } }
      ]
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué incluye la tutoría académica de Tesipedia?",
        "acceptedAnswer": { "@type": "Answer", "text": "Nuestro programa de tutoría incluye orientación en metodología de investigación, revisión de estructura y marco teórico, guía en análisis de datos, corrección de estilo académico y preparación para presentación. Cada sesión es personalizada según tu nivel y área de estudio." }
      },
      {
        "@type": "Question",
        "name": "¿Quiénes son los mentores de Tesipedia?",
        "acceptedAnswer": { "@type": "Answer", "text": "Nuestros mentores son profesionales con maestría y doctorado en diversas áreas del conocimiento. Cuentan con experiencia en investigación académica y publicaciones indexadas." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta la tutoría académica?",
        "acceptedAnswer": { "@type": "Answer", "text": "La tutoría para licenciatura tiene un costo de $500 MXN por hora, maestría $700 MXN por hora y doctorado $1,000 MXN por hora. Ofrecemos paquetes con descuento y pagos a meses sin intereses." }
      }
    ]
  };

  const features = [
    { icon: <FaChalkboardTeacher />, title: 'Mentoría 1 a 1', desc: 'Sesiones personalizadas con un tutor experto en tu área. Avanza a tu ritmo con retroalimentación directa.' },
    { icon: <FaBookReader />, title: 'Metodología de Investigación', desc: 'Aprende a construir un marco teórico sólido, diseñar tu metodología y analizar datos profesionalmente.' },
    { icon: <FaUserGraduate />, title: 'Tutores con Posgrado', desc: 'Todos nuestros mentores cuentan con maestría o doctorado y experiencia comprobada en investigación.' },
    { icon: <FaHandsHelping />, title: 'Acompañamiento Integral', desc: 'Desde la elección de tema hasta tu presentación final. Te guiamos en cada capítulo y revisión.' },
    { icon: <FaClock />, title: 'Horarios Flexibles', desc: 'Agenda tus sesiones en el horario que mejor te convenga. Atención por WhatsApp para dudas rápidas.' },
    { icon: <FaCalendarCheck />, title: 'Plan de Trabajo Personalizado', desc: 'Cronograma adaptado a tu fecha de entrega con metas semanales claras y medibles.' },
  ];

  const steps = [
    { num: '1', title: 'Diagnóstico Inicial', desc: 'Evaluamos tu avance, identificamos áreas de oportunidad y definimos objetivos claros.' },
    { num: '2', title: 'Plan de Orientación', desc: 'Diseñamos un programa personalizado con sesiones, entregables y revisiones periódicas.' },
    { num: '3', title: 'Sesiones de Mentoría', desc: 'Trabajas con tu tutor asignado en metodología, estructura, análisis y redacción.' },
    { num: '4', title: 'Revisión y Preparación', desc: 'Revisamos tu trabajo final, verificamos calidad y te preparamos para tu defensa.' },
  ];

  const testimonials = [
    { text: 'Mi tutor me ayudó a entender la metodología cualitativa desde cero. En 6 semanas logré estructurar toda mi investigación.', name: 'Ana L.', role: 'Maestría en Educación', color: '#4F46E5' },
    { text: 'Llevaba un año sin avanzar. La mentoría me dio un plan claro y el acompañamiento que necesitaba para terminar.', name: 'Roberto M.', role: 'Licenciatura en Derecho', color: '#059669' },
    { text: 'Los tutores realmente saben de investigación. Me orientaron en el análisis estadístico y la presentación de resultados.', name: 'Diana P.', role: 'Doctorado en Psicología', color: '#7c3aed' },
  ];

  const faqs = [
    { q: '¿Qué incluye la tutoría académica?', a: 'Incluye orientación en metodología de investigación, revisión de estructura, guía en marco teórico, apoyo en análisis de datos, corrección de estilo académico y preparación para tu presentación o defensa.' },
    { q: '¿Quiénes son los mentores?', a: 'Son profesionales con maestría y doctorado en diversas áreas. Cuentan con experiencia en investigación y publicaciones. Asignamos un mentor especializado en tu tema.' },
    { q: '¿Cuánto duran las sesiones?', a: 'Cada sesión de tutoría dura aproximadamente 1 hora. Puedes tomar sesiones individuales o contratar paquetes de varias sesiones con descuento.' },
    { q: '¿Puedo pagar a meses?', a: 'Sí, ofrecemos planes de pago a meses sin intereses. Consulta por WhatsApp las opciones disponibles para tu programa de tutoría.' },
    { q: '¿Cómo empiezo?', a: 'Escríbenos por WhatsApp para una consulta gratuita. Evaluamos tu proyecto, te asignamos un mentor y diseñamos un plan personalizado.' },
  ];

  return (
    <>
      {/* ── MINI HEADER — limpio para Google Ads ── */}
      <header style={styles.miniHeader}>
        <a href="https://tesipedia.com/tutoria-academica">
          <img src={LOGO_URL} alt="Tesipedia — Tutoría Académica" style={styles.miniHeaderLogo} width="150" height="38" />
        </a>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => handleWAClick('tutoria_header_cta')} style={styles.miniHeaderCta}>
          <FaWhatsapp /> Consulta Gratis
        </a>
      </header>

    <div style={styles.page}>
      <Helmet>
        <title>Tutoría Académica Profesional | Mentoría para tu Proyecto — Tesipedia</title>
        <meta name="description" content="Tutoría y mentoría académica personalizada. Mentores con maestría y doctorado te orientan paso a paso en tu proyecto de investigación. Consulta gratis." />
        <meta name="keywords" content="tutoría académica, mentoría universitaria, orientación tesis, asesoría investigación, tutor tesis, metodología investigación" />
        <link rel="canonical" href="https://tesipedia.com/tutoria-academica" />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <span style={styles.badge}>
            <FaStar /> Mentores con Maestría y Doctorado
          </span>
          <h1 style={styles.heroTitle}>
            <span style={styles.heroGradientText}>Tutoría Académica</span>
            <br />Personalizada para Tu Proyecto
          </h1>
          <p style={styles.heroSub}>
            Aprende metodología de investigación con expertos que te orientan paso a paso.
            Desde la elección de tema hasta la presentación final.
            <strong> Consulta gratis hoy.</strong>
          </p>
          <div style={styles.heroCtas}>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => handleWAClick('tutoria_hero_whatsapp')} style={styles.ctaPrimary} data-track-cta="tutoria_hero_whatsapp" data-track-label="Consulta Gratis por WhatsApp">
              <FaWhatsapp /> Consulta Gratis por WhatsApp
            </a>
            <a href="#como-funciona" style={styles.ctaSecondary} data-track-cta="tutoria_hero_programa" data-track-label="Conoce el Programa">
              Conoce el Programa <FaArrowRight />
            </a>
          </div>
          <div style={styles.trustRow}>
            <span style={styles.trustItem}><FaCheckCircle style={{ color: '#25d366' }} /> +3,000 estudiantes orientados</span>
            <span style={styles.trustItem}><FaShieldAlt style={{ color: '#25d366' }} /> Mentores certificados</span>
            <span style={styles.trustItem}><FaStar style={{ color: '#ffc107' }} /> 4.9/5 satisfacción</span>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>¿Por qué elegir nuestra mentoría?</h2>
        <p style={styles.sectionSub}>
          Te acompañamos en cada etapa de tu proyecto académico con orientación experta y personalizada
        </p>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={{ ...styles.featureIconWrap, background: featureColors[i].bg, color: featureColors[i].color }}>
                {f.icon}
              </div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" style={styles.sectionAlt}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>¿Cómo funciona la mentoría?</h2>
          <p style={styles.sectionSub}>Un proceso claro y estructurado para que avances con confianza</p>
          <div style={styles.stepsGrid}>
            {steps.map((s, i) => (
              <div key={i} style={styles.step}>
                <div style={styles.stepNum}>{s.num}</div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => handleWAClick('tutoria_mentoria_hoy')} style={styles.ctaPrimary} data-track-cta="tutoria_mentoria_hoy" data-track-label="Empieza Tu Mentoria Hoy">
              <FaWhatsapp /> Empieza Tu Mentoría Hoy
            </a>
          </div>
        </div>
      </section>

      {/* ── PROGRAMAS / PRECIOS ── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Programas de Tutoría</h2>
        <p style={styles.sectionSub}>Elige el nivel de acompañamiento que necesitas</p>
        <div style={styles.pricingGrid}>
          {/* Licenciatura */}
          <div style={styles.priceCard}>
            <div style={styles.priceLevel}>Licenciatura</div>
            <div style={styles.priceAmount}>$500</div>
            <span style={styles.priceUnit}>MXN / hora de tutoría</span>
            <ul style={styles.priceList}>
              {['Tutor especializado en tu área', 'Orientación en metodología', 'Revisión de estructura', 'Guía en marco teórico', 'Apoyo por WhatsApp'].map((item, i) => (
                <li key={i} style={styles.priceListItem}>
                  <FaCheckCircle style={styles.checkIcon} /> {item}
                </li>
              ))}
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => handleWAClick('tutoria_precio_licenciatura')}
              style={{ ...styles.priceBtn, background: '#fff', color: '#4F46E5', border: '2px solid #4F46E5' }}
              data-track-cta="tutoria_precio_licenciatura" data-track-label="Consultar Programa Licenciatura">
              <FaWhatsapp /> Consultar Programa
            </a>
          </div>

          {/* Maestría */}
          <div style={{ ...styles.priceCard, ...styles.priceCardFeatured }}>
            <div style={styles.priceBadge}>Más Solicitado</div>
            <div style={styles.priceLevel}>Maestría</div>
            <div style={{ ...styles.priceAmount, color: '#4F46E5' }}>$700</div>
            <span style={styles.priceUnit}>MXN / hora de tutoría</span>
            <ul style={styles.priceList}>
              {['Mentor con doctorado', 'Diseño metodológico avanzado', 'Análisis de datos', 'Revisión exhaustiva', 'Preparación para defensa', 'Pagos a meses sin intereses'].map((item, i) => (
                <li key={i} style={styles.priceListItem}>
                  <FaCheckCircle style={styles.checkIcon} /> {item}
                </li>
              ))}
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => handleWAClick('tutoria_precio_maestria')}
              style={{ ...styles.priceBtn, background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)', color: '#fff', border: '2px solid transparent', boxShadow: '0 6px 20px rgba(79,70,229,0.3)' }}
              data-track-cta="tutoria_precio_maestria" data-track-label="Consultar Programa Maestria">
              <FaWhatsapp /> Consultar Programa
            </a>
          </div>

          {/* Doctorado */}
          <div style={styles.priceCard}>
            <div style={styles.priceLevel}>Doctorado</div>
            <div style={styles.priceAmount}>$1,000</div>
            <span style={styles.priceUnit}>MXN / hora de tutoría</span>
            <ul style={styles.priceList}>
              {['Mentor investigador publicado', 'Marco epistemológico', 'Metodología de alto nivel', 'Análisis cualitativo/cuantitativo', 'Publicación indexada', 'Pagos a meses sin intereses'].map((item, i) => (
                <li key={i} style={styles.priceListItem}>
                  <FaCheckCircle style={styles.checkIcon} /> {item}
                </li>
              ))}
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => handleWAClick('tutoria_precio_doctorado')}
              style={{ ...styles.priceBtn, background: '#fff', color: '#4F46E5', border: '2px solid #4F46E5' }}
              data-track-cta="tutoria_precio_doctorado" data-track-label="Consultar Programa Doctorado">
              <FaWhatsapp /> Consultar Programa
            </a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section style={styles.sectionAlt}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Lo que dicen nuestros estudiantes</h2>
          <p style={styles.sectionSub}>Miles de estudiantes ya avanzaron en su proyecto con nuestra mentoría</p>
          <div style={styles.testimonialsGrid}>
            {testimonials.map((t, i) => (
              <div key={i} style={styles.testimonialCard}>
                <div style={styles.testimonialStars}>
                  {[...Array(5)].map((_, j) => <FaStar key={j} />)}
                </div>
                <FaQuoteLeft style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '10px' }} />
                <p style={styles.testimonialText}>{t.text}</p>
                <div style={styles.testimonialAuthor}>
                  <div style={{ ...styles.authorAvatar, background: t.color }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={styles.authorName}>{t.name}</div>
                    <div style={styles.authorRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Preguntas Frecuentes</h2>
        <p style={styles.sectionSub}>Resolvemos tus dudas sobre nuestro programa de tutoría</p>
        <div style={styles.faqList}>
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={styles.finalCta}>
        <div style={styles.finalCtaBg} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <FaGraduationCap style={styles.finalCtaIcon} />
          <h2 style={styles.finalCtaTitle}>Empieza tu mentoría hoy</h2>
          <p style={styles.finalCtaSub}>
            Consulta gratis y sin compromiso. Un mentor experto te orientará desde el primer momento.
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => handleWAClick('tutoria_final_cta')} style={{ ...styles.ctaPrimary, fontSize: '1.15rem', padding: '18px 40px' }} data-track-cta="tutoria_final_cta" data-track-label="Consulta Gratis Final">
            <FaWhatsapp /> Consulta Gratis por WhatsApp
          </a>
        </div>
      </section>
    </div>

      {/* ── MINI FOOTER — limpio para Google Ads ── */}
      <footer style={styles.miniFooter}>
        <div style={styles.miniFooterBrand}>Tesipedia — Tutoría y Mentoría Académica</div>
        <p style={{ margin: '8px 0 12px' }}>
          Orientación académica personalizada con mentores certificados.
        </p>
        <div>
          <a href="https://tesipedia.com/politica-de-privacidad" style={styles.miniFooterLink}>Política de Privacidad</a>
          <a href="https://tesipedia.com/contacto" style={styles.miniFooterLink}>Contacto</a>
        </div>
        <p style={{ margin: '12px 0 0', fontSize: '0.78rem', opacity: 0.5 }}>
          © {new Date().getFullYear()} Tesipedia — Todos los derechos reservados
        </p>
      </footer>
    </>
  );
}

export default TutoriaAcademica;
