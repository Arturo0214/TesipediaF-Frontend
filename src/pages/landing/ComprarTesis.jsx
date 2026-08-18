import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { trackVisit } from '../../features/visits/visitsSlice';
import { trackCTA, trackGoogleAdsConversion } from '../../services/eventService';
import {
  FaWhatsapp, FaCheckCircle, FaShieldAlt, FaStar, FaUserGraduate,
  FaGraduationCap, FaClock, FaFileAlt, FaArrowRight, FaQuoteLeft
} from 'react-icons/fa';
import './Landing.css';

const WA_LINK = 'https://wa.me/5215670071517?text=Hola%2C%20quiero%20cotizar%20mi%20tesis';

function ComprarTesis() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(trackVisit({ path: '/comprar-tesis', referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
    window.scrollTo(0, 0);
  }, [dispatch]);

  const handleWAClick = (ctaName) => {
    trackCTA(ctaName, 'WhatsApp CTA');
    trackGoogleAdsConversion();
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Asesoría de Tesis — Tesipedia",
    "description": "¿Buscas comprar tesis? Mejor asesórate y termina la tuya con Tesipedia. Servicio de asesoría académica para tesis de licenciatura, maestría y doctorado. Tú eres el autor; nosotros te guiamos.",
    "brand": { "@type": "Brand", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "5500", "highPrice": "87500", "offerCount": "3" }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Asesoría de Tesis en México — Servicio Profesional de Acompañamiento",
    "serviceType": "Asesoría y Acompañamiento de Tesis",
    "provider": { "@type": "ProfessionalService", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Servicio profesional de asesoría de tesis en México. Te acompañamos para que hagas tu tesis de licenciatura, maestría o doctorado: guía en la redacción, revisión de tu borrador y asesoría metodológica. Más de 3,000 estudiantes asesorados. Trabajo original, redactado por ti con nuestra guía.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "5500", "highPrice": "87500", "unitText": "por programa de asesoría" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta la asesoría de tesis en México?",
        "acceptedAnswer": { "@type": "Answer", "text": "El precio de un programa de asesoría de tesis en México varía según el nivel académico, el área de estudio y el alcance del acompañamiento. Para licenciatura: desde $5,500 MXN. Para maestría: desde $12,800 MXN. Para doctorado: desde $25,200 MXN. Las áreas de salud y ciencias exactas suelen tener un costo mayor. En Tesipedia ofrecemos cotización gratuita y planes de pago flexibles." }
      },
      {
        "@type": "Question",
        "name": "¿Por qué conviene asesorarte en lugar de comprar una tesis?",
        "acceptedAnswer": { "@type": "Answer", "text": "Comprar una tesis hecha implica riesgos académicos y de originalidad. Con la asesoría de Tesipedia tú eres el autor de tu trabajo: te acompañamos en la investigación y la redacción para que la tesis sea tuya, la entiendas y puedas defenderla con seguridad. Trabajas con investigadores con maestría y doctorado que te guían en cada etapa." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo dura el acompañamiento?",
        "acceptedAnswer": { "@type": "Answer", "text": "Los tiempos dependen de tu punto de partida y tu ritmo de trabajo. Como referencia, el acompañamiento típico es de 3 a 4 semanas por etapa para licenciatura, 4 a 6 semanas para maestría y 6 a 8 semanas para doctorado. También ofrecemos sesiones intensivas para avances urgentes." }
      },
      {
        "@type": "Question",
        "name": "¿El trabajo es original y lo redacto yo?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. La tesis la redactas tú con nuestra guía: te orientamos en la metodología, revisamos y mejoramos tu borrador y te damos retroalimentación experta. Es trabajo original tuyo, elaborado con acompañamiento profesional." }
      },
      {
        "@type": "Question",
        "name": "¿Asesoran tesis para cualquier carrera y universidad?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Ofrecemos asesoría de tesis para todas las carreras y universidades de México: UNAM, IPN, UAM, BUAP, UDG, UANL, TEC, universidades privadas y más. Contamos con asesores especializados en todas las áreas del conocimiento." }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com/" },
      { "@type": "ListItem", "position": 2, "name": "Comprar Tesis", "item": "https://tesipedia.com/comprar-tesis" }
    ]
  };

  const testimonials = [];

  return (
    <div className="landing-page">
      <Helmet>
        <title>¿Comprar Tesis? Mejor Asesórate y Termínala | Tesipedia México 2026</title>
        <meta name="description" content="¿Buscas comprar tesis en México? Mejor asesórate y termina la tuya. En Tesipedia te acompañamos para hacer tu tesis de licenciatura, maestría o doctorado: guía metodológica, revisión de tu borrador y asesoría experta. Tú eres el autor. Más de 3,000 estudiantes asesorados. Cotiza gratis por WhatsApp." />
        <meta name="keywords" content="comprar tesis, comprar tesis en México, comprar tesis México, asesoría de tesis, asesoría de tesis México, hacer tesis, ayuda con tesis, tesis licenciatura, tesis maestría, tesis doctorado, tesipedia, asesoría académica, quién me ayuda con mi tesis" />
        <link rel="canonical" href="https://tesipedia.com/comprar-tesis" />
        <meta property="og:title" content="¿Comprar Tesis? Mejor Asesórate y Termínala | Tesipedia" />
        <meta property="og:description" content="¿Buscas comprar tesis en México? Mejor asesórate y termina la tuya. Te acompañamos para que hagas tu tesis. Tú eres el autor. +3,000 estudiantes asesorados. Cotiza gratis." />
        <meta property="og:url" content="https://tesipedia.com/comprar-tesis" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
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
          <h1>¿Buscas Comprar Tesis? Te Asesoramos para que la Termines Tú</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> no vendemos tesis hechas: te <strong>asesoramos para hacer tu tesis de licenciatura, maestría o doctorado</strong>. Trabajas con investigadores con posgrado que te guían en la metodología, revisan tu borrador y te dan retroalimentación experta. <strong>Tú eres el autor</strong> y presentas un trabajo original y propio.
          </p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('comprar_hero')} data-track-cta="comprar_hero" data-track-label="Cotizar Gratis por WhatsApp">
              <FaWhatsapp /> Cotizar Gratis por WhatsApp
            </a>
            <a href="#como-funciona" className="landing-cta-secondary" data-track-cta="comprar_hero_proceso" data-track-label="¿Cómo funciona?">
              ¿Cómo funciona? <FaArrowRight />
            </a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> Trabajo 100% Tuyo</span>
            <span><FaShieldAlt /> Asesoría Profesional</span>
            <span><FaUserGraduate /> +3,000 Asesorados</span>
          </div>
        </div>
      </section>

      {/* POR QUÉ ASESORARTE CON NOSOTROS */}
      <section className="landing-section" id="por-que-tesipedia">
        <h2>¿Por qué asesorar tu tesis con Tesipedia?</h2>
        <p className="landing-section-intro">
          Somos el servicio de asesoría académica más confiable de México. En lugar de venderte una tesis hecha, te acompañamos para que la tuya sea original, la entiendas y la puedas defender. Trabajas con investigadores con posgrado que te guían en cada etapa. Ya sea que necesites apoyo con tu <Link to="/tesis-licenciatura">tesis de licenciatura</Link>, <Link to="/tesis-maestria">tesis de maestría</Link> o <Link to="/tesis-doctoral">tesis doctoral</Link>, estás en el lugar correcto.
        </p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Trabajo Original y Tuyo</h3>
            <p>Tú redactas tu tesis con nuestra guía. Te orientamos en la metodología y revisamos tu borrador para que presentes un trabajo original y propio.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+3,000 Estudiantes Asesorados</h3>
            <p>Más de 3,000 estudiantes de la UNAM, IPN, UAM, BUAP, UDG y más han avanzado en su tesis con nuestro acompañamiento.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Acompañamiento por Etapas</h3>
            <p>Avanzas por capítulos con retroalimentación experta y revisiones en cada etapa, a tu ritmo y con un plan claro.</p>
          </div>
          <div className="landing-feature-card">
            <FaFileAlt className="feature-icon" />
            <h3>Todas las Carreras y Universidades</h3>
            <p>Cubrimos todas las áreas: Derecho, Administración, Ingeniería, Psicología, Educación, Medicina, Contabilidad y más.</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="landing-section landing-section-alt" id="como-funciona">
        <h2>¿Cómo funciona la asesoría de tu tesis?</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Cotiza gratis</h3>
            <p>Escríbenos por WhatsApp con los datos de tu tesis: carrera, nivel, en qué punto vas y fecha objetivo. Te enviamos una propuesta en minutos.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Recibe tu plan de asesoría</h3>
            <p>Te asignamos un asesor especializado en tu área. Recibes un plan personalizado con alcance, precio y esquema de pago flexible.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Avanzas con acompañamiento</h3>
            <p>Trabajas tu tesis capítulo por capítulo. Tu asesor te guía en la redacción, revisa tus avances y te da retroalimentación en cada etapa.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Preparas tu titulación</h3>
            <p>Pulimos tu borrador contigo y te ayudamos a atender las observaciones de tus sinodales, para que llegues seguro a tu examen.</p>
          </div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('comprar_como_funciona')} data-track-cta="comprar_como_funciona" data-track-label="Quiero Cotizar Mi Tesis">
            <FaWhatsapp /> Quiero Asesoría para Mi Tesis
          </a>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="landing-section" id="precios">
        <h2>¿Cuánto cuesta la asesoría de tesis en México?</h2>
        <p className="landing-section-intro">
          El precio depende del nivel académico, el área y el alcance del acompañamiento.
          Ofrecemos programas de asesoría claros y con planes de pago flexibles.
        </p>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Asesoría de Licenciatura</h3>
            <div className="pricing-price">Desde <strong>$5,500 MXN</strong></div>
            <div className="pricing-ref">por programa de asesoría</div>
            <ul>
              <li>Acompañamiento por etapas</li>
              <li>Guía metodológica y de redacción</li>
              <li>Revisión de tu borrador</li>
              <li>Apoyo con observaciones de sinodales</li>
              <li>Áreas salud/exactas: costo mayor</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('comprar_pricing_licenciatura')} data-track-cta="comprar_pricing_licenciatura" data-track-label="Cotizar Licenciatura">Cotizar Licenciatura</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Más Popular</div>
            <h3>Asesoría de Maestría</h3>
            <div className="pricing-price">Desde <strong>$12,800 MXN</strong></div>
            <div className="pricing-ref">por programa de asesoría</div>
            <ul>
              <li>Acompañamiento por etapas</li>
              <li>Asesor con doctorado</li>
              <li>Guía metodológica y de redacción</li>
              <li>Revisión de tu borrador</li>
              <li>Áreas salud/exactas: costo mayor</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('comprar_pricing_maestria')} data-track-cta="comprar_pricing_maestria" data-track-label="Cotizar Maestría">Cotizar Maestría</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Asesoría de Doctorado</h3>
            <div className="pricing-price">Desde <strong>$25,200 MXN</strong></div>
            <div className="pricing-ref">por programa de asesoría</div>
            <ul>
              <li>Acompañamiento por etapas</li>
              <li>Asesor con doctorado</li>
              <li>Guía en investigación y redacción</li>
              <li>Apoyo para publicación opcional</li>
              <li>Áreas salud/exactas: costo mayor</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('comprar_pricing_doctorado')} data-track-cta="comprar_pricing_doctorado" data-track-label="Cotizar Doctorado">Cotizar Doctorado</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="landing-section landing-section-alt" id="testimonios">
        <h2>Estudiantes que avanzaron su tesis con nuestra asesoría</h2>
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
        <h2>Preguntas frecuentes sobre asesoría de tesis en México</h2>
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
        <h2>Avanza tu tesis hoy — Cotiza tu asesoría gratis</h2>
        <p>Únete a los más de 3,000 estudiantes que ya avanzaron su tesis con la asesoría de Tesipedia. Cotización sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWAClick('comprar_final_cta')} data-track-cta="comprar_final_cta" data-track-label="Cotizar Mi Tesis por WhatsApp">
          <FaWhatsapp /> Cotizar Mi Tesis por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>

      {/* INTERNAL LINKS SEO */}
      <section className="landing-section" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#1e3a5f', marginBottom: '1rem' }}>Servicios relacionados</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
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

export default ComprarTesis;
