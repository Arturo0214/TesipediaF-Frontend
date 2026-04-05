import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { trackVisit } from '../../features/visits/visitsSlice';
import { trackCTA, trackGoogleAdsConversion } from '../../services/eventService';
import {
  FaWhatsapp, FaCheckCircle, FaShieldAlt, FaStar, FaUserGraduate,
  FaGraduationCap, FaClock, FaFileAlt, FaArrowRight, FaQuoteLeft,
  FaPencilAlt, FaSearch, FaComments, FaClipboardCheck
} from 'react-icons/fa';
import './Landing.css';

const WA_LINK = 'https://wa.me/5215670071517?text=Hola%2C%20necesito%20ayuda%20con%20mi%20tesis';

function AyudaConTesis() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(trackVisit({ path: '/ayuda-con-tesis', referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
    window.scrollTo(0, 0);
  }, [dispatch]);

  const handleWAClick = (ctaName) => {
    trackCTA(ctaName, 'WhatsApp CTA');
    trackGoogleAdsConversion();
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Ayuda con Tesis — Tesipedia",
    "description": "¿Necesitas ayuda con tu tesis? En Tesipedia te ayudamos a titularte. Redacción completa, correcciones, asesoría metodológica y más. Más de 3,000 graduados en México.",
    "brand": { "@type": "Brand", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "3247", "bestRating": "5", "worstRating": "1" },
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "5500", "highPrice": "87500", "offerCount": "3" },
    "review": [
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Fernanda V." },
        "datePublished": "2025-12-20",
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "Llevaba un año sin avanzar en mi tesis. Tesipedia me asignó un asesor increíble que me guió paso a paso. En 5 semanas ya tenía mi tesis lista y aprobada."
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Ricardo T." },
        "datePublished": "2025-11-18",
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "Solo necesitaba ayuda con el marco teórico y la metodología. Me resolvieron justo lo que necesitaba, rápido y profesional. Muy recomendado."
      }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Ayuda con Tesis en México — Tesipedia",
    "serviceType": "Asesoría y Elaboración de Tesis",
    "provider": { "@type": "ProfessionalService", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Servicio profesional de ayuda con tesis en México. Redacción completa, correcciones, asesoría metodológica y apoyo parcial para licenciatura, maestría y doctorado. Más de 3,000 estudiantes titulados. 100% original, verificada con Turnitin y anti-IA.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "110", "highPrice": "250", "unitText": "por página" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué tipo de ayuda con tesis ofrecen en Tesipedia?",
        "acceptedAnswer": { "@type": "Answer", "text": "En Tesipedia ofrecemos ayuda completa para tu tesis: redacción desde cero, correcciones y mejoras de tesis existentes, asesoría metodológica, elaboración de capítulos específicos (marco teórico, metodología, resultados), revisión anti-plagio y formateo según lineamientos de tu universidad. Nos adaptamos a lo que necesites." }
      },
      {
        "@type": "Question",
        "name": "¿Me pueden ayudar si ya tengo avances en mi tesis?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Muchos de nuestros estudiantes ya tienen avances parciales. Podemos retomar tu trabajo desde donde lo dejaste, corregir lo que ya tienes, completar los capítulos faltantes o reescribir secciones que necesiten mejoras. Te asignamos un asesor que revisa tu avance y te propone un plan personalizado." }
      },
      {
        "@type": "Question",
        "name": "¿Quién me ayuda con mi tesis? ¿Son profesionales?",
        "acceptedAnswer": { "@type": "Answer", "text": "Tu tesis es elaborada por investigadores humanos con maestría y doctorado especializados en tu área de estudio. No usamos inteligencia artificial. Contamos con expertos en todas las áreas: Derecho, Administración, Ingeniería, Psicología, Educación, Medicina, Contabilidad, y muchas más." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo tardan en ayudarme con mi tesis?",
        "acceptedAnswer": { "@type": "Answer", "text": "El tiempo depende del tipo de ayuda que necesites. Redacción completa: 3-8 semanas según el nivel. Correcciones y mejoras: 1-2 semanas. Capítulos específicos: 1-3 semanas. Asesoría metodológica: sesiones semanales. También ofrecemos servicio express para entregas urgentes." }
      },
      {
        "@type": "Question",
        "name": "¿La ayuda incluye correcciones de sinodales?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Todos nuestros servicios de ayuda con tesis incluyen correcciones de sinodales hasta la aprobación final. Si tu comité evaluador solicita cambios, los realizamos sin costo adicional. Nuestro objetivo es que te titules." }
      },
      {
        "@type": "Question",
        "name": "¿Ayudan con tesis de cualquier carrera y universidad?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Ayudamos con tesis de todas las carreras y universidades de México: UNAM, IPN, UAM, BUAP, UDG, UANL, TEC, universidades privadas y tecnológicos. Tenemos asesores especializados en todas las áreas del conocimiento." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta la ayuda con mi tesis?",
        "acceptedAnswer": { "@type": "Answer", "text": "El costo depende del tipo de ayuda y nivel académico. Redacción completa: desde $110/página (licenciatura), $160/página (maestría), $210/página (doctorado). Correcciones: desde $3,500 MXN. Asesoría metodológica: desde $2,500 MXN. Cotiza gratis por WhatsApp para recibir un presupuesto personalizado." }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com/" },
      { "@type": "ListItem", "position": 2, "name": "Ayuda con Tesis", "item": "https://tesipedia.com/ayuda-con-tesis" }
    ]
  };

  const testimonials = [
    { name: 'Fernanda V.', carrera: 'Lic. en Pedagogía, UNAM', text: 'Llevaba un año sin avanzar en mi tesis. Tesipedia me asignó un asesor increíble que me guió paso a paso. En 5 semanas ya tenía mi tesis lista y aprobada.', rating: 5 },
    { name: 'Ricardo T.', carrera: 'Maestría en Derecho, UANL', text: 'Solo necesitaba ayuda con el marco teórico y la metodología. Me resolvieron justo lo que necesitaba, rápido y profesional. Muy recomendado.', rating: 5 },
    { name: 'Patricia H.', carrera: 'Lic. en Enfermería, IPN', text: 'Mi directora de tesis me pedía correcciones tras correcciones. Tesipedia me ayudó a reestructurar todo y al final mi sinodal dijo que era de las mejores tesis que había leído.', rating: 5 },
  ];

  return (
    <div className="landing-page">
      <Helmet>
        <title>Ayuda con Tu Tesis en México 2026 — Redacción, Correcciones y Asesoría | Tesipedia</title>
        <meta name="description" content="¿Necesitas ayuda con tu tesis? En Tesipedia te ayudamos a titularte. Redacción completa, correcciones, asesoría metodológica. +3,000 graduados. Todas las carreras y universidades de México. 100% original. Cotiza gratis por WhatsApp." />
        <meta name="keywords" content="ayuda con tesis, ayuda para hacer mi tesis, quien me ayuda con mi tesis, ayuda tesis licenciatura, ayuda tesis maestria, ayuda tesis doctorado, asesoría de tesis, me ayudan con mi tesis, necesito ayuda con mi tesis, apoyo para tesis, tesipedia" />
        <link rel="canonical" href="https://tesipedia.com/ayuda-con-tesis" />
        <meta property="og:title" content="Ayuda con Tu Tesis en México 2026 — Redacción, Correcciones y Asesoría | Tesipedia" />
        <meta property="og:description" content="¿Necesitas ayuda con tu tesis? Redacción completa, correcciones y asesoría. +3,000 graduados. Cotiza gratis por WhatsApp." />
        <meta property="og:url" content="https://tesipedia.com/ayuda-con-tesis" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ayuda con Tu Tesis en México 2026 — Redacción, Correcciones y Asesoría | Tesipedia" />
        <meta name="twitter:description" content="¿Necesitas ayuda con tu tesis? Redacción, correcciones y asesoría. +3,000 graduados. Cotiza gratis." />
        <meta name="twitter:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <FaStar className="star-icon" /> 4.9/5 — Más de 3,000 estudiantes titulados
          </div>
          <h1>¿Necesitas Ayuda con Tu Tesis? Tesipedia Te Ayuda a Titularte en México</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> te ofrecemos la ayuda profesional que necesitas para terminar tu tesis y titularte. Ya sea que necesites <strong>redacción completa, correcciones, asesoría metodológica</strong> o apoyo con capítulos específicos, tenemos al especialista indicado para ti. <strong>Más de 3,000 estudiantes</strong> ya se titularon con nuestra ayuda.
          </p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('ayuda_hero')} data-track-cta="ayuda_hero" data-track-label="Pedir Ayuda por WhatsApp">
              <FaWhatsapp /> Pedir Ayuda por WhatsApp
            </a>
            <a href="#tipos-de-ayuda" className="landing-cta-secondary" data-track-cta="ayuda_hero_tipos" data-track-label="Ver Tipos de Ayuda">
              Ver Tipos de Ayuda <FaArrowRight />
            </a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> 100% Original</span>
            <span><FaShieldAlt /> Verificada con Turnitin</span>
            <span><FaUserGraduate /> +3,000 Titulados</span>
          </div>
        </div>
      </section>

      {/* TIPOS DE AYUDA */}
      <section className="landing-section" id="tipos-de-ayuda">
        <h2>¿Qué tipo de ayuda necesitas con tu tesis?</h2>
        <p className="landing-section-intro">
          Cada estudiante tiene necesidades diferentes. Algunos necesitan que les escriban la tesis completa, otros solo necesitan correcciones o asesoría. En Tesipedia nos adaptamos a ti. Elige el tipo de ayuda que necesitas o <Link to="/comprar-tesis">compra tu tesis completa</Link>.
        </p>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaPencilAlt className="pricing-icon" />
            <h3>Redacción Completa</h3>
            <div className="pricing-price">Desde <strong>$110/pág</strong></div>
            <div className="pricing-ref">Tesis escrita desde cero</div>
            <ul>
              <li>Investigación y redacción total</li>
              <li>Investigadores con posgrado</li>
              <li>100% original, sin plagio ni IA</li>
              <li>Incluye Turnitin + Anti-IA</li>
              <li>Correcciones de sinodales</li>
              <li>Entrega: 3-8 semanas</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('ayuda_tipo_redaccion')} data-track-cta="ayuda_tipo_redaccion" data-track-label="Cotizar Redacción Completa">Cotizar Redacción Completa</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaClipboardCheck className="pricing-icon" />
            <div className="pricing-badge">Más Solicitado</div>
            <h3>Correcciones y Mejoras</h3>
            <div className="pricing-price">Desde <strong>$3,500 MXN</strong></div>
            <div className="pricing-ref">Para tesis con avances</div>
            <ul>
              <li>Revisión de tu tesis existente</li>
              <li>Correcciones de estilo y fondo</li>
              <li>Reestructuración de capítulos</li>
              <li>Corrección de observaciones</li>
              <li>Mejora de argumentación</li>
              <li>Entrega: 1-2 semanas</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('ayuda_tipo_correcciones')} data-track-cta="ayuda_tipo_correcciones" data-track-label="Cotizar Correcciones">Cotizar Correcciones</a>
          </div>
          <div className="landing-pricing-card">
            <FaComments className="pricing-icon" />
            <h3>Asesoría Metodológica</h3>
            <div className="pricing-price">Desde <strong>$2,500 MXN</strong></div>
            <div className="pricing-ref">Guía experta para tu tesis</div>
            <ul>
              <li>Definición de tema y enfoque</li>
              <li>Diseño metodológico</li>
              <li>Marco teórico y estado del arte</li>
              <li>Análisis de resultados</li>
              <li>Preparación para defensa</li>
              <li>Sesiones personalizadas</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('ayuda_tipo_asesoria')} data-track-cta="ayuda_tipo_asesoria" data-track-label="Cotizar Asesoría">Cotizar Asesoría</a>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="landing-section landing-section-alt" id="como-funciona">
        <h2>¿Cómo funciona la ayuda con tu tesis?</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Cuéntanos tu situación</h3>
            <p>Escríbenos por WhatsApp y cuéntanos: ¿qué carrera estudias? ¿qué nivel es tu tesis? ¿tienes avances? ¿qué tipo de ayuda necesitas? Te respondemos en minutos.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Te asignamos un especialista</h3>
            <p>Analizamos tu caso y te asignamos un investigador experto en tu área de estudio. Recibes una propuesta personalizada con alcance, tiempo y precio.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Recibe avances y participa</h3>
            <p>Tu asesor trabaja en tu tesis con avances semanales. Puedes revisar cada entrega, dar retroalimentación y solicitar ajustes en cada etapa.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Titúlate con confianza</h3>
            <p>Recibes tu tesis completa con reporte Turnitin y certificado anti-IA. Incluimos todas las correcciones de sinodales hasta tu aprobación final.</p>
          </div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('ayuda_como_funciona')} data-track-cta="ayuda_como_funciona" data-track-label="Quiero Ayuda con Mi Tesis">
            <FaWhatsapp /> Quiero Ayuda con Mi Tesis
          </a>
        </div>
      </section>

      {/* POR QUÉ TESIPEDIA */}
      <section className="landing-section" id="por-que-tesipedia">
        <h2>¿Por qué elegir Tesipedia para ayudarte con tu tesis?</h2>
        <p className="landing-section-intro">
          Entendemos la frustración de no poder avanzar con tu tesis. Ya sea por falta de tiempo, dificultad con la metodología o problemas con tu asesor, en Tesipedia tenemos la solución. Conoce los <Link to="/cuanto-cuesta-una-tesis">precios de nuestros servicios</Link>.
        </p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>100% Original — Sin Plagio ni IA</h3>
            <p>Cada tesis se elabora desde cero por investigadores humanos con maestría y doctorado. Incluimos reporte Turnitin y certificado anti-IA con cada entrega.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+3,000 Estudiantes Titulados</h3>
            <p>Más de 3,000 estudiantes de la UNAM, IPN, UAM, BUAP, UDG, UANL, TEC y más ya se titularon con nuestra ayuda. 98% de índice de aprobación.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Nos Adaptamos a Tu Tiempo</h3>
            <p>Ya sea que necesites tu tesis en 3 semanas o 3 meses, nos ajustamos a tu calendario. También ofrecemos servicio express para entregas urgentes.</p>
          </div>
          <div className="landing-feature-card">
            <FaFileAlt className="feature-icon" />
            <h3>Todas las Carreras y Niveles</h3>
            <p>Ayudamos con tesis de licenciatura, maestría y doctorado en todas las áreas: Derecho, Administración, Ingeniería, Psicología, Educación, Medicina y más.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="landing-section landing-section-alt" id="testimonios">
        <h2>Estudiantes que recibieron ayuda de Tesipedia</h2>
        <div className="landing-testimonials-grid">
          {testimonials.map((t, i) => (
            <div className="landing-testimonial-card" key={i}>
              <div className="testimonial-stars">
                {[...Array(t.rating)].map((_, j) => <FaStar key={j} />)}
              </div>
              <FaQuoteLeft className="testimonial-quote-icon" />
              <p>{t.text}</p>
              <div className="testimonial-author">
                <strong>{t.name}</strong>
                <span>{t.carrera}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-section" id="preguntas-frecuentes">
        <h2>Preguntas frecuentes sobre ayuda con tesis</h2>
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
        <h2>No dejes tu tesis para después — Pide ayuda hoy</h2>
        <p>Más de 3,000 estudiantes ya se titularon con Tesipedia. Cuéntanos tu situación y recibe un plan personalizado sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWAClick('ayuda_final_cta')} data-track-cta="ayuda_final_cta" data-track-label="Pedir Ayuda por WhatsApp">
          <FaWhatsapp /> Pedir Ayuda por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>

      {/* INTERNAL LINKS SEO */}
      <section className="landing-section" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#1e3a5f', marginBottom: '1rem' }}>Servicios relacionados</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/comprar-tesis" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Comprar Tesis en México</Link>
            <Link to="/cuanto-cuesta-una-tesis" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Precios de Tesis 2026</Link>
            <Link to="/tesis-licenciatura" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Tesis de Licenciatura desde $110/pág</Link>
            <Link to="/tesis-maestria" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Tesis de Maestría desde $160/pág</Link>
            <Link to="/tesis-doctoral" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Tesis Doctoral desde $210/pág</Link>
            <Link to="/preguntas-frecuentes" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Preguntas Frecuentes</Link>
            <Link to="/blog" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Blog Académico</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AyudaConTesis;
