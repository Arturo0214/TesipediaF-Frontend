import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { trackVisit } from '../../features/visits/visitsSlice';
import { trackCTA, trackGoogleAdsConversion } from '../../services/eventService';
import { getUniversidadBySlug } from '../../data/seoUniversidades';
import { LandingStats, LandingBreadcrumb, StickyWhatsApp, howToSchema } from './LandingShared';
import {
  FaWhatsapp, FaCheckCircle, FaShieldAlt, FaStar, FaUserGraduate,
  FaGraduationCap, FaClock, FaFileAlt, FaArrowRight, FaUniversity, FaBolt
} from 'react-icons/fa';
import './Landing.css';

const WA_LINK = 'https://wa.me/5215670071517?text=Hola%2C%20quiero%20cotizar%20mi%20tesis';
const SITE = 'https://tesipedia.com';

function TesisUniversidadLanding({ slug }) {
  const dispatch = useDispatch();
  const u = getUniversidadBySlug(slug);

  useEffect(() => {
    dispatch(trackVisit({ path: `/${slug}`, referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
    window.scrollTo(0, 0);
  }, [dispatch, slug]);

  const handleWAClick = (ctaName) => {
    trackCTA(ctaName, 'WhatsApp CTA');
    trackGoogleAdsConversion();
  };

  if (!u) return null;
  const canonical = `${SITE}/${u.slug}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Asesoría de Tesis para la ${u.sigla}`,
    "serviceType": "Asesoría y acompañamiento profesional de tesis",
    "provider": { "@type": "ProfessionalService", "name": "Tesipedia", "url": SITE, "telephone": "+52-56-7007-1517" },
    "areaServed": { "@type": "Place", "name": u.ciudad },
    "description": u.intro,
    "offers": { "@type": "Offer", "price": "5500", "priceCurrency": "MXN", "priceSpecification": { "@type": "UnitPriceSpecification", "price": "5500", "priceCurrency": "MXN", "unitText": "por programa de asesoría" } }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": `¿Asesoran tesis para la ${u.sigla}?`, "acceptedAnswer": { "@type": "Answer", "text": `Sí. En Tesipedia asesoramos a estudiantes de la ${u.nombre} (${u.sigla}) en todas sus carreras y niveles (licenciatura, maestría y doctorado), respetando los requisitos y el formato de tu facultad o escuela. Tú eres el autor de tu tesis y nosotros te acompañamos.` } },
      { "@type": "Question", "name": `¿Cuánto cuesta la asesoría de una tesis para la ${u.sigla}?`, "acceptedAnswer": { "@type": "Answer", "text": "Los programas de asesoría comienzan desde $5,500 MXN para licenciatura, $12,800 para maestría y $25,200 para doctorado. El precio final depende del alcance del acompañamiento, el área y la fecha objetivo. La cotización es gratuita." } },
      { "@type": "Question", "name": "¿El trabajo es original y con citación correcta?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Tú redactas tu tesis con nuestra guía, con citación correcta y revisión de originalidad, sin plantillas ni trabajos reciclados. Te orientan investigadores con posgrado." } },
      { "@type": "Question", "name": "¿Cuánto dura el acompañamiento?", "acceptedAnswer": { "@type": "Answer", "text": "De 3 a 4 semanas por etapa para licenciatura y de 4 a 8 semanas para posgrado. También ofrecemos sesiones intensivas para avances urgentes." } }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": `${SITE}/` },
      { "@type": "ListItem", "position": 2, "name": "Comprar Tesis", "item": `${SITE}/comprar-tesis` },
      { "@type": "ListItem", "position": 3, "name": `Tesis ${u.sigla}`, "item": canonical }
    ]
  };

  const procesoSchema = howToSchema(`Cómo te asesoramos en tu tesis para la ${u.sigla}`, [
    { name: 'Cotiza gratis', text: 'Escríbenos por WhatsApp con tu carrera, nivel, en qué punto vas y fecha objetivo. Te cotizamos en minutos.' },
    { name: 'Asesor especializado', text: 'Te asignamos un investigador de tu área con propuesta, alcance y esquema de pago flexible.' },
    { name: 'Avances y revisiones', text: 'Trabajas tu tesis por capítulo con guía y retroalimentación en cada etapa del proceso.' },
    { name: 'Preparas tu titulación', text: 'Pulimos tu borrador contigo, con citación correcta y apoyo para atender las observaciones de tus sinodales.' },
  ]);

  return (
    <div className="landing-page">
      <Helmet>
        <title>{u.metaTitle}</title>
        <meta name="description" content={u.metaDescription} />
        <meta name="keywords" content={u.keywords} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={u.metaTitle} />
        <meta property="og:description" content={u.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(procesoSchema)}</script>
      </Helmet>

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-badges">
            <span className="landing-hero-badge badge-offer"><FaBolt /> Cotización gratis hoy</span>
            <span className="landing-hero-badge"><FaStar className="star-icon" /> 4.9 · +3,000 titulados</span>
          </div>
          <h1>{u.h1}</h1>
          <p className="landing-hero-sub">{u.intro}</p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick(`uni_${u.slug}_hero`)}>
              <FaWhatsapp /> Cotizar Mi Tesis Gratis
            </a>
            <a href="#como-funciona" className="landing-cta-secondary">¿Cómo funciona? <FaArrowRight /></a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> 100% Original</span>
            <span><FaShieldAlt /> Revisión de originalidad</span>
            <span><FaUniversity /> {u.sigla}</span>
          </div>
        </div>
      </section>

      <LandingStats />

      <LandingBreadcrumb items={[
        { label: 'Inicio', to: '/' },
        { label: 'Comprar Tesis', to: '/comprar-tesis' },
        { label: `Tesis ${u.sigla}` },
      ]} />

      {/* TITULACIÓN EN LA UNIVERSIDAD */}
      <section className="landing-section" id="titulacion">
        <h2>Titulación por tesis en la {u.sigla}</h2>
        <p className="landing-section-intro">{u.titulacion}</p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaUniversity className="feature-icon" />
            <h3>Conocemos tu universidad</h3>
            <p>Adaptamos la asesoría de tu tesis a los requisitos de la {u.nombre} y al formato de tu facultad o escuela en {u.ciudad}.</p>
          </div>
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Trabajo Original y Tuyo</h3>
            <p>Te orientan investigadores con maestría y doctorado, con citación correcta y revisión de originalidad. Tú eres el autor.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+3,000 asesorados</h3>
            <p>Miles de estudiantes ya avanzaron su tesis con nosotros en las principales universidades de México.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Acompañamiento por etapas</h3>
            <p>Avanzas por capítulo con revisiones y retroalimentación de tu asesor en cada etapa.</p>
          </div>
        </div>
      </section>

      {/* CARRERAS */}
      <section className="landing-section landing-section-alt" id="carreras">
        <h2>Carreras de la {u.sigla} con las que más asesoramos</h2>
        <p className="landing-section-intro">
          Contamos con asesores especializados por área. Estas son algunas de las carreras de la {u.nombre} en las que asesoramos tesis con frecuencia:
        </p>
        <div className="landing-pills">
          {u.carreras.map((c, i) => (
            <span className="landing-pill" key={i}><FaFileAlt /> Tesis de {c}</span>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="landing-section" id="como-funciona">
        <h2>¿Cómo te asesoramos en tu tesis?</h2>
        <div className="landing-steps">
          <div className="landing-step"><div className="step-number">1</div><h3>Cotiza gratis</h3><p>Escríbenos por WhatsApp con tu carrera, nivel, en qué punto vas y fecha objetivo. Te cotizamos en minutos.</p></div>
          <div className="landing-step"><div className="step-number">2</div><h3>Asesor especializado</h3><p>Te asignamos un investigador de tu área con propuesta, alcance y esquema de pago flexible.</p></div>
          <div className="landing-step"><div className="step-number">3</div><h3>Avances y revisiones</h3><p>Trabajas tu tesis por capítulo con guía y retroalimentación en cada etapa del proceso.</p></div>
          <div className="landing-step"><div className="step-number">4</div><h3>Preparas tu titulación</h3><p>Pulimos tu borrador contigo, con citación correcta y apoyo para atender las observaciones de tus sinodales.</p></div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick(`uni_${u.slug}_proceso`)}>
            <FaWhatsapp /> Quiero Asesoría para Mi Tesis
          </a>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="landing-section landing-section-alt" id="precios">
        <h2>Precios de asesoría de tesis para la {u.sigla}</h2>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Licenciatura</h3>
            <div className="pricing-price">Desde <strong>$5,500 MXN</strong></div>
            <ul><li>Programa de asesoría</li><li>Acompañamiento por etapas</li><li>Revisión de originalidad</li></ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick(`uni_${u.slug}_lic`)}>Cotizar Licenciatura</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Más Popular</div>
            <h3>Maestría</h3>
            <div className="pricing-price">Desde <strong>$12,800 MXN</strong></div>
            <ul><li>Programa de asesoría</li><li>Asesor con doctorado</li><li>Guía metodológica</li></ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick(`uni_${u.slug}_mae`)}>Cotizar Maestría</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Doctorado</h3>
            <div className="pricing-price">Desde <strong>$25,200 MXN</strong></div>
            <ul><li>Programa de asesoría</li><li>Asesor con doctorado</li><li>Orientación a publicación opcional</li></ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick(`uni_${u.slug}_doc`)}>Cotizar Doctorado</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-section" id="preguntas-frecuentes">
        <h2>Preguntas frecuentes — Asesoría de Tesis {u.sigla}</h2>
        <div className="landing-faq-list">
          {faqSchema.mainEntity.map((q, i) => (
            <details className="landing-faq-item" key={i} open={i === 0}>
              <summary><h3>{q.name}</h3></summary>
              <p>{q.acceptedAnswer.text}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="landing-final-cta">
        <h2>Avanza tu tesis de la {u.sigla} — Cotiza tu asesoría gratis</h2>
        <p>Únete a los más de 3,000 estudiantes que ya avanzaron su tesis con la asesoría de Tesipedia. Cotización sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWAClick(`uni_${u.slug}_final`)}>
          <FaWhatsapp /> Cotizar Mi Asesoría por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>

      {/* CONTENIDO SEO (profundidad) */}
      <section className="landing-section">
        <h2>Te asesoramos en tu tesis para la {u.nombre}</h2>
        <p className="landing-section-intro" style={{ maxWidth: '820px' }}>
          Titularte en la {u.sigla} no tiene que ser una pesadilla de meses. En Tesipedia trabajamos
          contigo desde la elección y delimitación del tema hasta el cierre de tu tesis, cuidando que
          cumpla con el formato, la estructura y los criterios de evaluación de tu facultad en {u.ciudad}.
          Te guía un investigador con posgrado en tu área, con citación correcta
          (APA, Vancouver u otro) y revisión de originalidad, para que llegues a tu examen
          profesional con la seguridad de presentar un trabajo sólido y 100% propio, redactado por ti.
        </p>
        <p className="landing-section-intro" style={{ maxWidth: '820px', marginTop: '-12px' }}>
          Ya sea licenciatura, maestría o doctorado, te acompañamos con avances por capítulo, revisiones
          y retroalimentación de tu asesor y comunicación directa en todo el proceso. Solicita tu
          cotización gratuita por WhatsApp y empieza hoy a avanzar en tu tesis de la {u.sigla}.
        </p>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick(`uni_${u.slug}_seo`)}>
            <FaWhatsapp /> Cotizar Mi Tesis Gratis
          </a>
        </div>
      </section>

      {/* INTERNAL LINKS SEO */}
      <section className="landing-section" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#1e3a5f', marginBottom: '1rem' }}>Servicios relacionados</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/comprar-tesis" className="landing-textlink">Asesoría de Tesis en México</Link>
            <Link to="/tesis-licenciatura" className="landing-textlink">Asesoría de Tesis de Licenciatura</Link>
            <Link to="/tesis-maestria" className="landing-textlink">Asesoría de Tesis de Maestría</Link>
            <Link to="/cuanto-cuesta-una-tesis" className="landing-textlink">¿Cuánto cuesta una tesis?</Link>
            <Link to="/blog" className="landing-textlink">Blog Académico</Link>
          </div>
        </div>
      </section>

      <StickyWhatsApp onClick={() => handleWAClick(`uni_${u.slug}_sticky`)} />
    </div>
  );
}

export default TesisUniversidadLanding;
