import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { trackVisit } from '../../features/visits/visitsSlice';
import { trackCTA, trackGoogleAdsConversion } from '../../services/eventService';
import { getCarreraBySlug } from '../../data/seoCarreras';
import { LandingStats, LandingBreadcrumb, StickyWhatsApp, howToSchema } from './LandingShared';
import {
  FaWhatsapp, FaCheckCircle, FaShieldAlt, FaStar, FaUserGraduate,
  FaGraduationCap, FaClock, FaFlask, FaArrowRight, FaLightbulb, FaBolt
} from 'react-icons/fa';
import './Landing.css';

const WA_LINK = 'https://wa.me/5215670071517?text=Hola%2C%20quiero%20cotizar%20mi%20tesis';
const SITE = 'https://tesipedia.com';

function TesisCarreraLanding({ slug }) {
  const dispatch = useDispatch();
  const c = getCarreraBySlug(slug);
  // Loop de contenido/SEO: guía publicada (generada del trabajo vendido de esta carrera)
  const [guia, setGuia] = useState(null);

  useEffect(() => {
    dispatch(trackVisit({ path: `/${slug}`, referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
    window.scrollTo(0, 0);
  }, [dispatch, slug]);

  useEffect(() => {
    let alive = true;
    const base = import.meta.env.VITE_BASE_URL || '/api/';
    fetch(`${base}content-guides/public/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((g) => { if (alive) setGuia(g); })
      .catch(() => {});
    return () => { alive = false; };
  }, [slug]);

  const handleWAClick = (ctaName) => {
    trackCTA(ctaName, 'WhatsApp CTA');
    trackGoogleAdsConversion();
  };

  if (!c) return null;
  const canonical = `${SITE}/${c.slug}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Asesoría de Tesis de ${c.nombre}`,
    "serviceType": `Asesoría de Tesis de ${c.nombre}`,
    "provider": { "@type": "ProfessionalService", "name": "Tesipedia", "url": SITE, "telephone": "+52-56-7007-1517" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": c.intro,
    "offers": { "@type": "Offer", "price": "5500", "priceCurrency": "MXN", "priceSpecification": { "@type": "UnitPriceSpecification", "price": "5500", "priceCurrency": "MXN", "unitText": "por programa de asesoría" } }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": `¿Asesoran tesis de ${c.nombre}?`, "acceptedAnswer": { "@type": "Answer", "text": `Sí. En Tesipedia asesoramos tesis de ${c.nombre} con investigadores especializados en ${c.area}, para licenciatura, maestría y doctorado, con la metodología y citación que exige tu universidad. Tú eres el autor de tu tesis y nosotros te guiamos.` } },
      { "@type": "Question", "name": `¿Qué metodología usan en una tesis de ${c.nombre}?`, "acceptedAnswer": { "@type": "Answer", "text": c.metodologia } },
      { "@type": "Question", "name": `¿Cuánto cuesta la asesoría de una tesis de ${c.nombre}?`, "acceptedAnswer": { "@type": "Answer", "text": "Los programas de asesoría comienzan desde $5,500 MXN para licenciatura, $12,800 para maestría y $25,200 para doctorado. El precio final depende del alcance del acompañamiento, el área y la fecha objetivo. La cotización es gratuita." } },
      { "@type": "Question", "name": "¿El trabajo es original?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Tú redactas tu tesis con nuestra guía, con citación correcta y revisión de originalidad. Te orientan investigadores con posgrado." } }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": `${SITE}/` },
      { "@type": "ListItem", "position": 2, "name": "Comprar Tesis", "item": `${SITE}/comprar-tesis` },
      { "@type": "ListItem", "position": 3, "name": `Tesis de ${c.nombre}`, "item": canonical }
    ]
  };

  const procesoSchema = howToSchema(`Cómo te asesoramos en tu tesis de ${c.nombre}`, [
    { name: 'Cotiza gratis', text: 'Cuéntanos tu tema (o te ayudamos a elegirlo), nivel, en qué punto vas y fecha. Te cotizamos en minutos.' },
    { name: 'Asesor del área', text: `Te asignamos un investigador especializado en ${c.nombre} con propuesta y pago flexible.` },
    { name: 'Avances y revisiones', text: 'Trabajas tu tesis por capítulos con guía y retroalimentación en cada etapa.' },
    { name: 'Preparas tu titulación', text: 'Pulimos tu borrador contigo, con citación correcta y apoyo para atender las observaciones de tus sinodales.' },
  ]);

  return (
    <div className="landing-page">
      <Helmet>
        <title>{c.metaTitle}</title>
        <meta name="description" content={c.metaDescription} />
        <meta name="keywords" content={c.keywords} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={c.metaTitle} />
        <meta property="og:description" content={c.metaDescription} />
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
          <h1>{c.h1}</h1>
          <p className="landing-hero-sub">{c.intro}</p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick(`car_${c.slug}_hero`)}>
              <FaWhatsapp /> Cotizar Mi Tesis Gratis
            </a>
            <a href="#metodologia" className="landing-cta-secondary">Ver metodología <FaArrowRight /></a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> 100% Original</span>
            <span><FaShieldAlt /> Citación correcta</span>
            <span><FaUserGraduate /> Asesores con posgrado</span>
          </div>
        </div>
      </section>

      <LandingStats />

      <LandingBreadcrumb items={[
        { label: 'Inicio', to: '/' },
        { label: 'Comprar Tesis', to: '/comprar-tesis' },
        { label: `Tesis de ${c.nombre}` },
      ]} />

      {/* METODOLOGÍA */}
      <section className="landing-section" id="metodologia">
        <h2>Metodología para tu tesis de {c.nombre}</h2>
        <p className="landing-section-intro">{c.metodologia}</p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaFlask className="feature-icon" />
            <h3>Rigor metodológico</h3>
            <p>Diseño de investigación adecuado a {c.area}, con instrumentos y análisis sólidos.</p>
          </div>
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Citación correcta</h3>
            <p>Formato APA, Vancouver o el que pida tu universidad, con revisión de originalidad.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>Asesor especializado</h3>
            <p>Investigadores con maestría y doctorado en el área de {c.nombre}.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Acompañamiento puntual</h3>
            <p>Avances por capítulo con revisiones y retroalimentación de tu asesor en cada etapa.</p>
          </div>
        </div>
      </section>

      {/* TEMAS */}
      <section className="landing-section landing-section-alt" id="temas">
        <h2>Temas de tesis de {c.nombre}</h2>
        <p className="landing-section-intro">
          ¿No tienes tema todavía? Te ayudamos a elegirlo y delimitarlo. Estas son algunas líneas frecuentes en {c.nombre}:
        </p>
        <div className="landing-pills">
          {c.temas.map((t, i) => (
            <span className="landing-pill" key={i}><FaLightbulb /> {t}</span>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="landing-section" id="como-funciona">
        <h2>¿Cómo te asesoramos en tu tesis de {c.nombre}?</h2>
        <div className="landing-steps">
          <div className="landing-step"><div className="step-number">1</div><h3>Cotiza gratis</h3><p>Cuéntanos tu tema (o te ayudamos a elegirlo), nivel, en qué punto vas y fecha. Te cotizamos en minutos.</p></div>
          <div className="landing-step"><div className="step-number">2</div><h3>Asesor del área</h3><p>Te asignamos un investigador especializado en {c.nombre} con propuesta y pago flexible.</p></div>
          <div className="landing-step"><div className="step-number">3</div><h3>Avances y revisiones</h3><p>Trabajas tu tesis por capítulos con guía y retroalimentación en cada etapa.</p></div>
          <div className="landing-step"><div className="step-number">4</div><h3>Preparas tu titulación</h3><p>Pulimos tu borrador contigo, con citación correcta y apoyo para atender las observaciones de tus sinodales.</p></div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick(`car_${c.slug}_proceso`)}>
            <FaWhatsapp /> Quiero Asesoría para Mi Tesis
          </a>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="landing-section landing-section-alt" id="precios">
        <h2>Precios de asesoría de tesis de {c.nombre}</h2>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Licenciatura</h3>
            <div className="pricing-price">Desde <strong>$5,500 MXN</strong></div>
            <ul><li>Programa de asesoría</li><li>Acompañamiento por etapas</li><li>Revisión de originalidad</li></ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick(`car_${c.slug}_lic`)}>Cotizar Licenciatura</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Más Popular</div>
            <h3>Maestría</h3>
            <div className="pricing-price">Desde <strong>$12,800 MXN</strong></div>
            <ul><li>Programa de asesoría</li><li>Asesor con doctorado</li><li>Guía metodológica</li></ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick(`car_${c.slug}_mae`)}>Cotizar Maestría</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Doctorado</h3>
            <div className="pricing-price">Desde <strong>$25,200 MXN</strong></div>
            <ul><li>Programa de asesoría</li><li>Asesor con doctorado</li><li>Orientación a publicación opcional</li></ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick(`car_${c.slug}_doc`)}>Cotizar Doctorado</a>
          </div>
        </div>
      </section>

      {/* Guía SEO generada del trabajo real de esta carrera (loop de contenido) */}
      {guia && (
        <section className="landing-section landing-section-alt" id="guia">
          <h2>{guia.title}</h2>
          {guia.intro && <p className="landing-lead">{guia.intro}</p>}
          {(guia.sections || []).map((s, i) => (
            <div className="landing-guide-block" key={i}>
              <h3>{s.heading}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </section>
      )}

      {/* FAQ */}
      <section className="landing-section" id="preguntas-frecuentes">
        <h2>Preguntas frecuentes — Asesoría de Tesis de {c.nombre}</h2>
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
        <h2>Avanza tu tesis de {c.nombre} — Cotiza tu asesoría gratis</h2>
        <p>Únete a los más de 3,000 estudiantes que ya avanzaron su tesis con la asesoría de Tesipedia. Cotización sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWAClick(`car_${c.slug}_final`)}>
          <FaWhatsapp /> Cotizar Mi Asesoría por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>

      {/* CONTENIDO SEO (profundidad) */}
      <section className="landing-section">
        <h2>Te asesoramos en tu tesis de {c.nombre} de principio a fin</h2>
        <p className="landing-section-intro" style={{ maxWidth: '820px' }}>
          Una buena tesis de {c.nombre} necesita más que redacción: requiere un diseño de investigación
          coherente con {c.area}, fuentes actualizadas y un análisis bien fundamentado. En Tesipedia te
          asignamos un investigador con posgrado en el área, que trabaja contigo el planteamiento, el marco
          teórico, la metodología, los resultados y las conclusiones, con la citación y el formato que pide
          tu universidad y revisión de originalidad. Tú eres el autor y redactas tu trabajo con nuestra guía.
        </p>
        <p className="landing-section-intro" style={{ maxWidth: '820px', marginTop: '-12px' }}>
          Si aún no tienes tema, te ayudamos a elegirlo y delimitarlo según tu interés y la viabilidad de la
          investigación. Avanzas por capítulo con revisiones y retroalimentación de tu asesor.
          Cotiza gratis por WhatsApp y avanza hoy en tu tesis de {c.nombre}.
        </p>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick(`car_${c.slug}_seo`)}>
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
            <Link to="/ayuda-con-tesis" className="landing-textlink">Ayuda con tu Tesis</Link>
            <Link to="/cuanto-cuesta-una-tesis" className="landing-textlink">¿Cuánto cuesta una tesis?</Link>
            <Link to="/asesoria-tesis" className="landing-textlink">Asesoría de Tesis</Link>
            <Link to="/blog" className="landing-textlink">Blog Académico</Link>
          </div>
        </div>
      </section>

      <StickyWhatsApp onClick={() => handleWAClick(`car_${c.slug}_sticky`)} />
    </div>
  );
}

export default TesisCarreraLanding;
