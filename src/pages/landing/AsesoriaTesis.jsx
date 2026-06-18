import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { trackVisit } from '../../features/visits/visitsSlice';
import { trackGoogleAdsConversion, trackCTA } from '../../services/eventService';
import {
  FaWhatsapp, FaCheckCircle, FaStar, FaUserGraduate, FaGraduationCap,
  FaClock, FaChalkboardTeacher, FaArrowRight, FaQuoteLeft, FaBookReader,
  FaHandsHelping, FaCalendarCheck, FaShieldAlt, FaSearch, FaPenFancy,
} from 'react-icons/fa';
import { styles, featureColors } from './_ads/adsStyles';
import { MiniHeader, MiniFooter, FaqItem } from './_ads/AdsChrome';

const CANONICAL = 'https://tesipedia.com/asesoria-tesis';
const WA_LINK = 'https://wa.me/5215670071517?text=Hola%2C%20me%20interesa%20la%20asesor%C3%ADa%20para%20mi%20tesis';

const handleWAClick = (ctaName = 'asesoria_whatsapp') => {
  trackCTA(ctaName, 'WhatsApp Asesoría Tesis');
  trackGoogleAdsConversion();
};

function AsesoriaTesis() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(trackVisit({ path: '/asesoria-tesis', referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
    window.scrollTo(0, 0);
  }, [dispatch]);

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Tesipedia — Asesoría y Acompañamiento de Tesis',
    description: 'Asesoría metodológica y acompañamiento académico personalizado para tu tesis. Asesores con maestría y doctorado te orientan en metodología, marco teórico, análisis de datos y redacción académica.',
    url: CANONICAL,
    logo: 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png',
    areaServed: { '@type': 'Country', name: 'México' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios de Asesoría de Tesis',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Asesoría en Metodología de Investigación' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Revisión y Corrección de Estilo Académico' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Acompañamiento para Tesis de Licenciatura, Maestría y Doctorado' } },
      ],
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '¿Qué incluye la asesoría de tesis?', acceptedAnswer: { '@type': 'Answer', text: 'Incluye orientación en metodología de investigación, revisión de estructura y marco teórico, guía en análisis de datos, corrección de estilo académico y retroalimentación sobre tus borradores. Cada sesión es personalizada según tu nivel y área.' } },
      { '@type': 'Question', name: '¿Quiénes son los asesores?', acceptedAnswer: { '@type': 'Answer', text: 'Profesionales con maestría y doctorado en diversas áreas, con experiencia en investigación académica y publicaciones. Asignamos un asesor especializado en tu tema.' } },
      { '@type': 'Question', name: '¿Cuánto cuesta la asesoría?', acceptedAnswer: { '@type': 'Answer', text: 'La asesoría para licenciatura es desde $500 MXN por hora, maestría desde $700 MXN por hora y doctorado desde $1,000 MXN por hora. Ofrecemos paquetes con descuento y pagos a meses sin intereses.' } },
    ],
  };

  const features = [
    { icon: <FaChalkboardTeacher />, title: 'Asesoría 1 a 1', desc: 'Sesiones personalizadas con un asesor experto en tu área. Avanza a tu ritmo con retroalimentación directa sobre tu trabajo.' },
    { icon: <FaBookReader />, title: 'Metodología de Investigación', desc: 'Aprende a construir un marco teórico sólido, diseñar tu metodología y analizar tus datos correctamente.' },
    { icon: <FaPenFancy />, title: 'Revisión y Estilo Académico', desc: 'Revisamos tus borradores y te damos retroalimentación de fondo y forma para que mejores tu propia redacción.' },
    { icon: <FaUserGraduate />, title: 'Asesores con Posgrado', desc: 'Todos nuestros asesores cuentan con maestría o doctorado y experiencia comprobada en investigación.' },
    { icon: <FaHandsHelping />, title: 'Acompañamiento Integral', desc: 'Desde la elección del tema hasta tu presentación final. Te orientamos en cada capítulo y revisión.' },
    { icon: <FaCalendarCheck />, title: 'Plan de Trabajo a tu Fecha', desc: 'Cronograma adaptado a tu fecha de entrega, con metas claras y medibles semana a semana.' },
  ];

  const steps = [
    { num: '1', title: 'Diagnóstico Inicial', desc: 'Evaluamos tu avance, identificamos áreas de oportunidad y definimos objetivos claros para tu proyecto.' },
    { num: '2', title: 'Plan de Asesoría', desc: 'Diseñamos un programa personalizado con sesiones, entregables y revisiones periódicas.' },
    { num: '3', title: 'Sesiones de Acompañamiento', desc: 'Trabajas con tu asesor en metodología, estructura, análisis y mejora de tu redacción.' },
    { num: '4', title: 'Revisión y Preparación', desc: 'Revisamos tu trabajo, te damos retroalimentación final y te preparamos para tu defensa.' },
  ];

  const testimonials = [
    { text: 'Mi asesor me ayudó a entender la metodología cualitativa desde cero. En pocas semanas logré estructurar toda mi investigación.', name: 'Ana L.', role: 'Maestría en Educación', color: '#4F46E5' },
    { text: 'Llevaba meses sin avanzar. La asesoría me dio un plan claro y el acompañamiento que necesitaba para retomar mi tesis.', name: 'Roberto M.', role: 'Licenciatura en Derecho', color: '#059669' },
    { text: 'Los asesores realmente saben de investigación. Me orientaron en el análisis estadístico y en cómo presentar mis resultados.', name: 'Diana P.', role: 'Doctorado en Psicología', color: '#7c3aed' },
  ];

  const faqs = [
    { q: '¿Qué incluye la asesoría de tesis?', a: 'Orientación en metodología, revisión de estructura, guía en marco teórico, apoyo en análisis de datos, corrección de estilo académico y retroalimentación sobre tus borradores para que mejores tu propio trabajo.' },
    { q: '¿Quiénes son los asesores?', a: 'Profesionales con maestría y doctorado en diversas áreas, con experiencia en investigación y publicaciones. Asignamos un asesor especializado en tu tema.' },
    { q: '¿Cuánto duran las sesiones?', a: 'Cada sesión de asesoría dura aproximadamente 1 hora. Puedes tomar sesiones individuales o contratar paquetes con descuento.' },
    { q: '¿Puedo pagar a meses?', a: 'Sí, ofrecemos planes de pago a meses sin intereses. Consulta por WhatsApp las opciones disponibles para tu programa de asesoría.' },
    { q: '¿Cómo empiezo?', a: 'Escríbenos por WhatsApp para una consulta gratuita. Evaluamos tu proyecto, te asignamos un asesor y diseñamos un plan personalizado.' },
  ];

  const programas = [
    { level: 'Licenciatura', price: '$500', featured: false, items: ['Asesor especializado en tu área', 'Orientación en metodología', 'Revisión de estructura', 'Guía en marco teórico', 'Apoyo por WhatsApp'] },
    { level: 'Maestría', price: '$700', featured: true, items: ['Asesor con doctorado', 'Diseño metodológico avanzado', 'Apoyo en análisis de datos', 'Revisión exhaustiva de borradores', 'Preparación para defensa', 'Pagos a meses sin intereses'] },
    { level: 'Doctorado', price: '$1,000', featured: false, items: ['Asesor investigador publicado', 'Marco epistemológico', 'Metodología de alto nivel', 'Análisis cualitativo/cuantitativo', 'Orientación para publicación indexada', 'Pagos a meses sin intereses'] },
  ];

  return (
    <>
      <MiniHeader canonical={CANONICAL} waLink={WA_LINK} onCtaClick={() => handleWAClick('asesoria_header_cta')} />

      <div style={styles.page}>
        <Helmet>
          <title>Asesoría de Tesis Profesional | Acompañamiento Académico — Tesipedia</title>
          <meta name="description" content="Asesoría y acompañamiento metodológico para tu tesis. Asesores con maestría y doctorado te orientan paso a paso en tu investigación. Consulta gratis." />
          <meta name="keywords" content="asesoría de tesis, asesor de tesis, acompañamiento tesis, asesoría metodológica, orientación tesis, ayuda con mi tesis, asesoría investigación" />
          <link rel="canonical" href={CANONICAL} />
          <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
          <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        </Helmet>

        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.heroBg} />
          <div style={styles.heroContent}>
            <span style={styles.badge}><FaStar /> Asesores con Maestría y Doctorado</span>
            <h1 style={styles.heroTitle}>
              <span style={styles.heroGradientText}>Asesoría de Tesis</span>
              <br />que te Acompaña Hasta el Final
            </h1>
            <p style={styles.heroSub}>
              Te orientamos en metodología, estructura y análisis para que desarrolles tu investigación
              con confianza. Acompañamiento personalizado desde el tema hasta tu presentación.
              <strong> Consulta gratis hoy.</strong>
            </p>
            <div style={styles.heroCtas}>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => handleWAClick('asesoria_hero_whatsapp')} style={styles.ctaPrimary}>
                <FaWhatsapp /> Consulta Gratis por WhatsApp
              </a>
              <a href="#como-funciona" style={styles.ctaSecondary}>
                Conoce el Programa <FaArrowRight />
              </a>
            </div>
            <div style={styles.trustRow}>
              <span style={styles.trustItem}><FaCheckCircle style={{ color: '#25d366' }} /> +3,000 estudiantes orientados</span>
              <span style={styles.trustItem}><FaShieldAlt style={{ color: '#25d366' }} /> Asesores certificados</span>
              <span style={styles.trustItem}><FaStar style={{ color: '#ffc107' }} /> 4.9/5 satisfacción</span>
            </div>
          </div>
        </section>

        {/* BENEFICIOS */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>¿Por qué elegir nuestra asesoría?</h2>
          <p style={styles.sectionSub}>Te acompañamos en cada etapa de tu tesis con orientación experta y personalizada</p>
          <div style={styles.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <div style={{ ...styles.featureIconWrap, background: featureColors[i].bg, color: featureColors[i].color }}>{f.icon}</div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como-funciona" style={styles.sectionAlt}>
          <div style={styles.sectionInner}>
            <h2 style={styles.sectionTitle}>¿Cómo funciona la asesoría?</h2>
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
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => handleWAClick('asesoria_proceso_hoy')} style={styles.ctaPrimary}>
                <FaWhatsapp /> Empieza Tu Asesoría Hoy
              </a>
            </div>
          </div>
        </section>

        {/* PROGRAMAS / PRECIOS */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Programas de Asesoría</h2>
          <p style={styles.sectionSub}>Elige el nivel de acompañamiento que necesitas. Precios "desde" por hora de asesoría.</p>
          <div style={styles.pricingGrid}>
            {programas.map((p, i) => (
              <div key={i} style={p.featured ? { ...styles.priceCard, ...styles.priceCardFeatured } : styles.priceCard}>
                {p.featured && <div style={styles.priceBadge}>Más Solicitado</div>}
                <div style={styles.priceLevel}>{p.level}</div>
                <div style={p.featured ? { ...styles.priceAmount, color: '#4F46E5' } : styles.priceAmount}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#94a3b8', verticalAlign: 'middle' }}>desde </span>{p.price}
                </div>
                <span style={styles.priceUnit}>MXN / hora de asesoría</span>
                <ul style={styles.priceList}>
                  {p.items.map((item, j) => (
                    <li key={j} style={styles.priceListItem}><FaCheckCircle style={styles.checkIcon} /> {item}</li>
                  ))}
                </ul>
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => handleWAClick(`asesoria_precio_${p.level.toLowerCase()}`)}
                  style={p.featured
                    ? { ...styles.priceBtn, background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)', color: '#fff', border: '2px solid transparent', boxShadow: '0 6px 20px rgba(79,70,229,0.3)' }
                    : { ...styles.priceBtn, background: '#fff', color: '#4F46E5', border: '2px solid #4F46E5' }}>
                  <FaWhatsapp /> Consultar Programa
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIOS */}
        <section style={styles.sectionAlt}>
          <div style={styles.sectionInner}>
            <h2 style={styles.sectionTitle}>Lo que dicen nuestros estudiantes</h2>
            <p style={styles.sectionSub}>Miles de estudiantes ya avanzaron en su tesis con nuestra asesoría</p>
            <div style={styles.testimonialsGrid}>
              {testimonials.map((t, i) => (
                <div key={i} style={styles.testimonialCard}>
                  <div style={styles.testimonialStars}>{[...Array(5)].map((_, j) => <FaStar key={j} />)}</div>
                  <FaQuoteLeft style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '10px' }} />
                  <p style={styles.testimonialText}>{t.text}</p>
                  <div style={styles.testimonialAuthor}>
                    <div style={{ ...styles.authorAvatar, background: t.color }}>{t.name.charAt(0)}</div>
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

        {/* FAQ */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Preguntas Frecuentes</h2>
          <p style={styles.sectionSub}>Resolvemos tus dudas sobre nuestro programa de asesoría</p>
          <div style={styles.faqList}>
            {faqs.map((faq, i) => <FaqItem key={i} question={faq.q} answer={faq.a} />)}
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={styles.finalCta}>
          <div style={styles.finalCtaBg} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <FaGraduationCap style={styles.finalCtaIcon} />
            <h2 style={styles.finalCtaTitle}>Avanza en tu tesis hoy</h2>
            <p style={styles.finalCtaSub}>Consulta gratis y sin compromiso. Un asesor experto te orientará desde el primer momento.</p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => handleWAClick('asesoria_final_cta')} style={{ ...styles.ctaPrimary, fontSize: '1.15rem', padding: '18px 40px' }}>
              <FaWhatsapp /> Consulta Gratis por WhatsApp
            </a>
          </div>
        </section>
      </div>

      <MiniFooter />
    </>
  );
}

export default AsesoriaTesis;
