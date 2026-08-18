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
    "description": "¿Necesitas ayuda con tu tesis? En Tesipedia te acompañamos para que la termines tú. Asesoría metodológica, revisión de tu borrador, apoyo por capítulos y guía en la redacción. Más de 3,000 estudiantes asesorados en México.",
    "brand": { "@type": "Brand", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "2500", "highPrice": "87500", "offerCount": "3" }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Ayuda con Tesis en México — Tesipedia",
    "serviceType": "Asesoría y Acompañamiento de Tesis",
    "provider": { "@type": "ProfessionalService", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Servicio profesional de ayuda con tesis en México. Asesoría metodológica, revisión de tu borrador, apoyo por capítulos y guía en la redacción para licenciatura, maestría y doctorado. Más de 3,000 estudiantes asesorados. Trabajo original, redactado por ti con nuestra guía.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "2500", "highPrice": "87500", "unitText": "por programa de asesoría" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué tipo de ayuda con tesis ofrecen en Tesipedia?",
        "acceptedAnswer": { "@type": "Answer", "text": "En Tesipedia ofrecemos acompañamiento integral para tu tesis: asesoría metodológica, revisión y mejora de tu borrador, guía en la redacción, apoyo por capítulos específicos (marco teórico, metodología, resultados) y ayuda con el formato según los lineamientos de tu universidad. Nos adaptamos a lo que necesites. Tú eres el autor de tu trabajo." }
      },
      {
        "@type": "Question",
        "name": "¿Me pueden ayudar si ya tengo avances en mi tesis?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Muchos de nuestros estudiantes ya tienen avances parciales. Retomamos tu trabajo desde donde lo dejaste, revisamos lo que ya tienes, te guiamos para completar los capítulos faltantes y te damos retroalimentación para mejorar secciones. Te asignamos un asesor que revisa tu avance y te propone un plan personalizado." }
      },
      {
        "@type": "Question",
        "name": "¿Quién me asesora con mi tesis? ¿Son profesionales?",
        "acceptedAnswer": { "@type": "Answer", "text": "Te asesoran investigadores con maestría y doctorado especializados en tu área de estudio. Contamos con expertos en todas las áreas: Derecho, Administración, Ingeniería, Psicología, Educación, Medicina, Contabilidad, y muchas más." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto dura la ayuda con mi tesis?",
        "acceptedAnswer": { "@type": "Answer", "text": "El tiempo depende del tipo de acompañamiento que necesites. Programa integral: 3-8 semanas por etapa según el nivel. Revisión y mejoras: 1-2 semanas. Apoyo por capítulos: 1-3 semanas. Asesoría metodológica: sesiones semanales. También ofrecemos sesiones intensivas para avances urgentes." }
      },
      {
        "@type": "Question",
        "name": "¿La ayuda incluye apoyo con observaciones de sinodales?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Nuestros programas de ayuda con tesis incluyen apoyo para atender las observaciones de sinodales. Si tu comité evaluador solicita cambios, te acompañamos con los ajustes dentro del alcance acordado. Nuestro objetivo es que avances con seguridad." }
      },
      {
        "@type": "Question",
        "name": "¿Asesoran tesis de cualquier carrera y universidad?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Asesoramos tesis de todas las carreras y universidades de México: UNAM, IPN, UAM, BUAP, UDG, UANL, TEC, universidades privadas y tecnológicos. Tenemos asesores especializados en todas las áreas del conocimiento." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta la ayuda con mi tesis?",
        "acceptedAnswer": { "@type": "Answer", "text": "El costo depende del tipo de acompañamiento y del nivel académico. Programa integral de asesoría: desde $5,500 MXN (licenciatura), $12,800 MXN (maestría), $25,200 MXN (doctorado). Revisión y mejoras: desde $3,500 MXN. Asesoría metodológica: desde $2,500 MXN. Cotiza gratis por WhatsApp para recibir un presupuesto personalizado." }
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

  const testimonials = [];

  return (
    <div className="landing-page">
      <Helmet>
        <title>Ayuda con Tu Tesis en México 2026 — Asesoría, Revisión y Acompañamiento | Tesipedia</title>
        <meta name="description" content="¿Necesitas ayuda con tu tesis? En Tesipedia te acompañamos para que la termines tú. Asesoría metodológica, revisión de tu borrador y apoyo por capítulos. +3,000 estudiantes asesorados. Todas las carreras y universidades de México. Tú eres el autor. Cotiza gratis por WhatsApp." />
        <meta name="keywords" content="ayuda con tesis, ayuda para hacer mi tesis, quien me ayuda con mi tesis, ayuda tesis licenciatura, ayuda tesis maestria, ayuda tesis doctorado, asesoría de tesis, me ayudan con mi tesis, necesito ayuda con mi tesis, apoyo para tesis, tesipedia" />
        <link rel="canonical" href="https://tesipedia.com/ayuda-con-tesis" />
        <meta property="og:title" content="Ayuda con Tu Tesis en México 2026 — Asesoría, Revisión y Acompañamiento | Tesipedia" />
        <meta property="og:description" content="¿Necesitas ayuda con tu tesis? Asesoría, revisión de tu borrador y acompañamiento. +3,000 estudiantes asesorados. Cotiza gratis por WhatsApp." />
        <meta property="og:url" content="https://tesipedia.com/ayuda-con-tesis" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ayuda con Tu Tesis en México 2026 — Asesoría, Revisión y Acompañamiento | Tesipedia" />
        <meta name="twitter:description" content="¿Necesitas ayuda con tu tesis? Asesoría, revisión y acompañamiento. +3,000 estudiantes asesorados. Cotiza gratis." />
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
            <FaStar className="star-icon" /> Más de 3,000 estudiantes asesorados
          </div>
          <h1>¿Necesitas Ayuda con Tu Tesis? Tesipedia Te Acompaña para que la Termines Tú</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> te ofrecemos el acompañamiento profesional que necesitas para terminar tu tesis. Ya sea que necesites <strong>asesoría metodológica, revisión de tu borrador</strong> o apoyo con capítulos específicos, tenemos al especialista indicado para ti. <strong>Tú eres el autor</strong> y más de <strong>3,000 estudiantes</strong> ya avanzaron su tesis con nuestra asesoría.
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
            <span><FaCheckCircle /> Trabajo 100% Tuyo</span>
            <span><FaShieldAlt /> Asesoría Profesional</span>
            <span><FaUserGraduate /> +3,000 Asesorados</span>
          </div>
        </div>
      </section>

      {/* TIPOS DE AYUDA */}
      <section className="landing-section" id="tipos-de-ayuda">
        <h2>¿Qué tipo de ayuda necesitas con tu tesis?</h2>
        <p className="landing-section-intro">
          Cada estudiante tiene necesidades diferentes. Algunos necesitan acompañamiento de principio a fin, otros solo revisión o asesoría en una etapa. En Tesipedia nos adaptamos a ti. Elige el tipo de apoyo que necesitas o conoce nuestra <Link to="/comprar-tesis">asesoría integral de tesis</Link>.
        </p>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaPencilAlt className="pricing-icon" />
            <h3>Asesoría Integral</h3>
            <div className="pricing-price">Desde <strong>$5,500 MXN</strong></div>
            <div className="pricing-ref">Acompañamiento de principio a fin</div>
            <ul>
              <li>Guía en investigación y redacción</li>
              <li>Investigadores con posgrado</li>
              <li>Trabajo original, redactado por ti</li>
              <li>Revisión de tu borrador</li>
              <li>Apoyo con observaciones de sinodales</li>
              <li>Acompañamiento: 3-8 semanas por etapa</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('ayuda_tipo_redaccion')} data-track-cta="ayuda_tipo_redaccion" data-track-label="Cotizar Redacción Completa">Cotizar Asesoría Integral</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaClipboardCheck className="pricing-icon" />
            <div className="pricing-badge">Más Solicitado</div>
            <h3>Revisión y Mejoras</h3>
            <div className="pricing-price">Desde <strong>$3,500 MXN</strong></div>
            <div className="pricing-ref">Para tesis con avances</div>
            <ul>
              <li>Revisión de tu tesis existente</li>
              <li>Retroalimentación de estilo y fondo</li>
              <li>Guía para reestructurar capítulos</li>
              <li>Apoyo con las observaciones recibidas</li>
              <li>Mejora de la argumentación</li>
              <li>Acompañamiento: 1-2 semanas</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('ayuda_tipo_correcciones')} data-track-cta="ayuda_tipo_correcciones" data-track-label="Cotizar Correcciones">Cotizar Revisión</a>
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
            <h3>Avanza y participa</h3>
            <p>Tu asesor te guía con avances semanales. Revisas cada etapa, recibes retroalimentación experta y trabajas tu tesis a tu ritmo.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Prepárate con confianza</h3>
            <p>Pulimos tu borrador contigo y te ayudamos a atender las observaciones de tus sinodales para que llegues seguro a tu examen.</p>
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
            <h3>Trabajo Original y Tuyo</h3>
            <p>Tú redactas tu tesis con nuestra guía. Investigadores con maestría y doctorado te orientan y revisan tu borrador para que sea un trabajo original y propio.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+3,000 Estudiantes Asesorados</h3>
            <p>Más de 3,000 estudiantes de la UNAM, IPN, UAM, BUAP, UDG, UANL, TEC y más han avanzado su tesis con nuestro acompañamiento.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Nos Adaptamos a Tu Tiempo</h3>
            <p>Ya sea que necesites avanzar en 3 semanas o 3 meses, nos ajustamos a tu calendario. También ofrecemos sesiones intensivas para avances urgentes.</p>
          </div>
          <div className="landing-feature-card">
            <FaFileAlt className="feature-icon" />
            <h3>Todas las Carreras y Niveles</h3>
            <p>Asesoramos tesis de licenciatura, maestría y doctorado en todas las áreas: Derecho, Administración, Ingeniería, Psicología, Educación, Medicina y más.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="landing-section landing-section-alt" id="testimonios">
        <h2>Estudiantes que avanzaron su tesis con la asesoría de Tesipedia</h2>
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
        <p>Más de 3,000 estudiantes ya avanzaron su tesis con la asesoría de Tesipedia. Cuéntanos tu situación y recibe un plan personalizado sin compromiso en menos de 5 minutos.</p>
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
            <Link to="/comprar-tesis" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Asesoría de Tesis en México</Link>
            <Link to="/cuanto-cuesta-una-tesis" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Precios de Asesoría 2026</Link>
            <Link to="/tesis-licenciatura" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Asesoría de Tesis de Licenciatura</Link>
            <Link to="/tesis-maestria" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Asesoría de Tesis de Maestría</Link>
            <Link to="/tesis-doctoral" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Asesoría de Tesis Doctoral</Link>
            <Link to="/preguntas-frecuentes" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Preguntas Frecuentes</Link>
            <Link to="/blog" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Blog Académico</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AyudaConTesis;
