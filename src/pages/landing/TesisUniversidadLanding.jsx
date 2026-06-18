import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { trackVisit } from '../../features/visits/visitsSlice';
import { trackCTA, trackGoogleAdsConversion } from '../../services/eventService';
import { getUniversidadBySlug } from '../../data/seoUniversidades';
import {
  FaWhatsapp, FaCheckCircle, FaShieldAlt, FaStar, FaUserGraduate,
  FaGraduationCap, FaClock, FaFileAlt, FaArrowRight, FaUniversity
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
    "name": `Elaboración de Tesis para la ${u.sigla}`,
    "serviceType": "Elaboración profesional de tesis",
    "provider": { "@type": "ProfessionalService", "name": "Tesipedia", "url": SITE, "telephone": "+52-56-7007-1517" },
    "areaServed": { "@type": "Place", "name": u.ciudad },
    "description": u.intro,
    "offers": { "@type": "Offer", "price": "110", "priceCurrency": "MXN", "priceSpecification": { "@type": "UnitPriceSpecification", "price": "110", "priceCurrency": "MXN", "unitText": "por página" } }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": `¿Hacen tesis para la ${u.sigla}?`, "acceptedAnswer": { "@type": "Answer", "text": `Sí. En Tesipedia elaboramos tesis para estudiantes de la ${u.nombre} (${u.sigla}) en todas sus carreras y niveles (licenciatura, maestría y doctorado), respetando los requisitos y el formato de tu facultad o escuela.` } },
      { "@type": "Question", "name": `¿Cuánto cuesta una tesis para la ${u.sigla}?`, "acceptedAnswer": { "@type": "Answer", "text": "Desde $110 MXN por página para licenciatura, $160 para maestría y $210 para doctorado. El precio final depende del número de páginas, el área y la fecha de entrega. La cotización es gratuita." } },
      { "@type": "Question", "name": "¿La tesis es original y con citación correcta?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Cada tesis se elabora desde cero por investigadores con posgrado, con citación correcta y revisión de originalidad, sin plantillas ni trabajos reciclados." } },
      { "@type": "Question", "name": "¿Cuánto tardan en entregar?", "acceptedAnswer": { "@type": "Answer", "text": "De 3 a 4 semanas para licenciatura y de 4 a 8 semanas para posgrado. También contamos con servicio express para entregas urgentes." } }
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
      </Helmet>

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <FaStar className="star-icon" /> +3,000 estudiantes titulados
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

      {/* TITULACIÓN EN LA UNIVERSIDAD */}
      <section className="landing-section" id="titulacion">
        <h2>Titulación por tesis en la {u.sigla}</h2>
        <p className="landing-section-intro">{u.titulacion}</p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaUniversity className="feature-icon" />
            <h3>Conocemos tu universidad</h3>
            <p>Adaptamos tu tesis a los requisitos de la {u.nombre} y al formato de tu facultad o escuela en {u.ciudad}.</p>
          </div>
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>100% Original</h3>
            <p>Investigadores con maestría y doctorado, citación correcta y revisión de originalidad en cada proyecto.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+3,000 titulados</h3>
            <p>Miles de estudiantes ya se titularon con nosotros en las principales universidades de México.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Entrega en 3-4 semanas</h3>
            <p>Avances parciales y correcciones hasta la aprobación de tu asesor y sinodales.</p>
          </div>
        </div>
      </section>

      {/* CARRERAS */}
      <section className="landing-section landing-section-alt" id="carreras">
        <h2>Carreras de la {u.sigla} con las que más ayudamos</h2>
        <p className="landing-section-intro">
          Contamos con asesores especializados por área. Estas son algunas de las carreras de la {u.nombre} en las que elaboramos tesis con frecuencia:
        </p>
        <div className="landing-pills">
          {u.carreras.map((c, i) => (
            <span className="landing-pill" key={i}><FaFileAlt /> Tesis de {c}</span>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="landing-section" id="como-funciona">
        <h2>¿Cómo hacemos tu tesis?</h2>
        <div className="landing-steps">
          <div className="landing-step"><div className="step-number">1</div><h3>Cotiza gratis</h3><p>Escríbenos por WhatsApp con tu carrera, nivel, número de páginas y fecha de entrega. Te cotizamos en minutos.</p></div>
          <div className="landing-step"><div className="step-number">2</div><h3>Asesor especializado</h3><p>Te asignamos un investigador de tu área con propuesta, alcance y esquema de pago flexible.</p></div>
          <div className="landing-step"><div className="step-number">3</div><h3>Avances y revisiones</h3><p>Recibes avances por capítulo y solicitas ajustes en cada etapa del proceso.</p></div>
          <div className="landing-step"><div className="step-number">4</div><h3>Entrega y titulación</h3><p>Tesis completa, original y citada, con correcciones de sinodales hasta la aprobación.</p></div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick(`uni_${u.slug}_proceso`)}>
            <FaWhatsapp /> Quiero Cotizar Mi Tesis
          </a>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="landing-section landing-section-alt" id="precios">
        <h2>Precios de tesis para la {u.sigla}</h2>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Licenciatura</h3>
            <div className="pricing-price">Desde <strong>$110/pág</strong></div>
            <ul><li>50-120 páginas</li><li>Entrega 3-4 semanas</li><li>Revisión de originalidad</li></ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick(`uni_${u.slug}_lic`)}>Cotizar Licenciatura</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Más Popular</div>
            <h3>Maestría</h3>
            <div className="pricing-price">Desde <strong>$160/pág</strong></div>
            <ul><li>80-150 páginas</li><li>Entrega 4-6 semanas</li><li>Investigador con doctorado</li></ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick(`uni_${u.slug}_mae`)}>Cotizar Maestría</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Doctorado</h3>
            <div className="pricing-price">Desde <strong>$210/pág</strong></div>
            <ul><li>120-250 páginas</li><li>Entrega 6-8 semanas</li><li>Publicación opcional</li></ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick(`uni_${u.slug}_doc`)}>Cotizar Doctorado</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-section" id="preguntas-frecuentes">
        <h2>Preguntas frecuentes — Tesis {u.sigla}</h2>
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
        <h2>Titúlate en la {u.sigla} — Cotiza gratis</h2>
        <p>Únete a los más de 3,000 estudiantes que ya se titularon con Tesipedia. Cotización sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWAClick(`uni_${u.slug}_final`)}>
          <FaWhatsapp /> Cotizar Mi Tesis por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>

      {/* INTERNAL LINKS SEO */}
      <section className="landing-section" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#1e3a5f', marginBottom: '1rem' }}>Servicios relacionados</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/comprar-tesis" className="landing-textlink">Comprar Tesis en México</Link>
            <Link to="/tesis-licenciatura" className="landing-textlink">Tesis de Licenciatura</Link>
            <Link to="/tesis-maestria" className="landing-textlink">Tesis de Maestría</Link>
            <Link to="/cuanto-cuesta-una-tesis" className="landing-textlink">¿Cuánto cuesta una tesis?</Link>
            <Link to="/blog" className="landing-textlink">Blog Académico</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TesisUniversidadLanding;
