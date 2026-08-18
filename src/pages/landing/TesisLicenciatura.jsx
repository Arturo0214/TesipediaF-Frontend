import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { trackVisit } from '../../features/visits/visitsSlice';
import { trackCTA, trackGoogleAdsConversion } from '../../services/eventService';
import {
  FaWhatsapp, FaCheckCircle, FaShieldAlt, FaStar, FaUserGraduate,
  FaGraduationCap, FaClock, FaFileAlt, FaArrowRight, FaQuoteLeft
} from 'react-icons/fa';
import './Landing.css';

const WA_LINK = 'https://wa.me/5215670071517?text=Hola%2C%20quiero%20cotizar%20mi%20tesis';

function TesisLicenciatura() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(trackVisit({ path: '/tesis-licenciatura', referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
    window.scrollTo(0, 0);
  }, [dispatch]);

  const handleWAClick = (ctaName) => {
    trackCTA(ctaName, 'WhatsApp CTA');
    trackGoogleAdsConversion();
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Asesoría de Tesis de Licenciatura",
    "description": "Servicio de asesoría profesional para tu tesis de licenciatura en México. Te guían investigadores con maestría; tú redactas tu trabajo original con nuestro acompañamiento.",
    "brand": { "@type": "Organization", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "5500", "highPrice": "15000", "unitText": "por programa de asesoría" },
    "url": "https://tesipedia.com/tesis-licenciatura"
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Tesis de Licenciatura — Servicio Profesional de Asesoría",
    "serviceType": "Asesoría y Acompañamiento de Tesis de Licenciatura",
    "provider": { "@type": "Organization", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Servicio profesional de asesoría para tu tesis de licenciatura en México. Trabajo original, redactado por ti con nuestra guía. Más de 2,800 estudiantes de licenciatura asesorados.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "5500", "highPrice": "15000", "unitText": "por programa de asesoría" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta la asesoría de una tesis de licenciatura?",
        "acceptedAnswer": { "@type": "Answer", "text": "El precio del programa de asesoría de una tesis de licenciatura depende del alcance del acompañamiento y del área de estudio. Comienza desde $5,500 MXN, y las áreas de salud y exactas suelen tener un costo mayor. Según la profundidad del apoyo, el rango va de $5,500 a $15,000 MXN. Ofrecemos planes de pago flexible en 3 o 6 meses." }
      },
      {
        "@type": "Question",
        "name": "¿Cuántas páginas tiene una tesis de licenciatura?",
        "acceptedAnswer": { "@type": "Answer", "text": "Una tesis de licenciatura típicamente tiene entre 50 y 120 páginas. La extensión varía según la carrera y universidad: Derecho y Administración suelen requerir 80-120 páginas, mientras que Ingeniería y Psicología oscilan entre 60-100 páginas. En la cotización, cuéntanos los requisitos de tu universidad y ajustamos el plan de asesoría." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto dura la asesoría de una tesis de licenciatura?",
        "acceptedAnswer": { "@type": "Answer", "text": "El acompañamiento típico para licenciatura es de 3 a 4 semanas por etapa. Este tiempo incluye guía en la investigación, orientación en la redacción, revisión de tus avances y retroalimentación. Si necesitas avanzar más rápido, ofrecemos sesiones intensivas." }
      },
      {
        "@type": "Question",
        "name": "¿Qué carreras cubren para licenciatura?",
        "acceptedAnswer": { "@type": "Answer", "text": "Asesoramos tesis de licenciatura para todas las carreras: Derecho, Administración, Contabilidad, Ingeniería Civil, Ingeniería en Sistemas, Psicología, Educación, Pedagogía, Comunicación, Mercadotecnia, Enfermería, Medicina, Biología, Química, Economía, Sociología, Antropología y más. Todos nuestros asesores son especialistas en su área." }
      },
      {
        "@type": "Question",
        "name": "¿La tesis de licenciatura la redacto yo con su guía?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Tú eres el autor de tu tesis: te guiamos en la metodología, revisamos y mejoramos tu borrador y te damos retroalimentación experta. Es trabajo original tuyo, elaborado con acompañamiento profesional." }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com/" },
      { "@type": "ListItem", "position": 2, "name": "Tesis de Licenciatura", "item": "https://tesipedia.com/tesis-licenciatura" }
    ]
  };

  const testimonials = [];

  return (
    <div className="landing-page">
      <Helmet>
        <title>Tesis de Licenciatura en México 2026 | Asesoría Tesipedia — Termínala Tú</title>
        <meta name="description" content="¿Necesitas hacer tu tesis de licenciatura en México? En Tesipedia te asesoramos para terminarla: guía metodológica, orientación en la redacción y revisión de tu borrador. Tú eres el autor. +2,800 estudiantes asesorados. Cotiza gratis." />
        <meta name="keywords" content="tesis de licenciatura, tesis licenciatura, hacer tesis licenciatura, asesoría tesis licenciatura, tesis licenciatura precio, tesis licenciatura México, ayuda con tesis de licenciatura" />
        <link rel="canonical" href="https://tesipedia.com/tesis-licenciatura" />
        <meta property="og:title" content="Tesis de Licenciatura en México 2026 | Asesoría Tesipedia" />
        <meta property="og:description" content="Te asesoramos para hacer tu tesis de licenciatura. Guía metodológica y revisión de tu borrador. Tú eres el autor. +2,800 estudiantes asesorados. Cotiza gratis." />
        <meta property="og:url" content="https://tesipedia.com/tesis-licenciatura" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <FaStar className="star-icon" /> Más de 2,800 estudiantes de licenciatura asesorados
          </div>
          <h1>Tesis de Licenciatura en México — Te Asesoramos para que la Termines Tú</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> te <strong>asesoramos para hacer tu tesis de licenciatura</strong>.
            Te guían investigadores con maestría en la metodología y la redacción, y revisamos tu borrador.
            <strong>Tú eres el autor</strong> de un trabajo original y propio.
          </p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('licenciatura_hero')} data-track-cta="licenciatura_hero" data-track-label="Cotizar Mi Tesis Gratis">
              <FaWhatsapp /> Cotizar Mi Asesoría Gratis
            </a>
            <a href="#como-funciona" className="landing-cta-secondary" data-track-cta="licenciatura_hero_proceso" data-track-label="¿Cómo funciona?">
              ¿Cómo funciona? <FaArrowRight />
            </a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> Trabajo 100% Tuyo</span>
            <span><FaShieldAlt /> Asesoría Profesional</span>
            <span><FaUserGraduate /> +2,800 Asesorados</span>
          </div>
        </div>
      </section>

      {/* POR QUÉ ASESORAR TU TESIS DE LICENCIATURA CON NOSOTROS */}
      <section className="landing-section" id="por-que-tesipedia">
        <h2>¿Por qué asesorar tu tesis de licenciatura en Tesipedia?</h2>
        <p className="landing-section-intro">
          Somos el servicio de asesoría en tesis de licenciatura más confiable de México.
          En lugar de venderte una tesis hecha, te acompañamos para que la tuya sea original y la puedas defender.
        </p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Trabajo Original y Tuyo</h3>
            <p>Tú redactas tu tesis de licenciatura con nuestra guía. Te orientamos en la metodología y revisamos tu borrador para que sea un trabajo original y propio.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+2,800 Estudiantes Asesorados</h3>
            <p>Más de 2,800 estudiantes de licenciatura de UNAM, IPN, UAM, BUAP, UDG, ITESM y más han avanzado su tesis con nuestro acompañamiento.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Acompañamiento por Etapas</h3>
            <p>Avanzas tu tesis de licenciatura capítulo por capítulo, con revisiones y retroalimentación experta en cada etapa.</p>
          </div>
          <div className="landing-feature-card">
            <FaFileAlt className="feature-icon" />
            <h3>Todas las Carreras de Licenciatura</h3>
            <p>Derecho, Administración, Ingeniería, Psicología, Educación, Medicina, Contabilidad, Comunicación, Enfermería y todas las demás.</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="landing-section landing-section-alt" id="como-funciona">
        <h2>¿Cómo funciona la asesoría de tu tesis de licenciatura?</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Cotiza gratis</h3>
            <p>Escríbenos por WhatsApp: carrera, en qué punto vas, fecha objetivo y requisitos específicos de tu universidad. Propuesta en minutos.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Recibe tu plan de asesoría</h3>
            <p>Te asignamos un investigador especialista en tu área de licenciatura. Recibes un plan personalizado con alcance, precio y pago flexible.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Avanzas con acompañamiento</h3>
            <p>Trabajas tu tesis con avances semanales. Tu asesor te guía en la redacción, revisa tus avances y te da retroalimentación en cada etapa.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Preparas tu defensa</h3>
            <p>Pulimos tu borrador contigo y te ayudamos a atender las observaciones de tus sinodales para que llegues seguro a tu examen profesional.</p>
          </div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('licenciatura_como_funciona')} data-track-cta="licenciatura_como_funciona" data-track-label="Quiero Mi Tesis de Licenciatura">
            <FaWhatsapp /> Quiero Asesoría para Mi Tesis
          </a>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="landing-section" id="precios">
        <h2>¿Cuánto cuesta la asesoría de una tesis de licenciatura?</h2>
        <p className="landing-section-intro">
          Programas de asesoría desde $5,500 MXN (las áreas de salud y exactas tienen un costo mayor). El precio depende del alcance del acompañamiento.
        </p>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Asesoría Esencial</h3>
            <div className="pricing-price">Desde <strong>$5,500 MXN</strong></div>
            <ul>
              <li>Acompañamiento por etapas</li>
              <li>Guía metodológica y de redacción</li>
              <li>Revisión de tu borrador</li>
              <li>Retroalimentación experta</li>
              <li>Pago en 3 o 6 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('licenciatura_pricing_estandar')} data-track-cta="licenciatura_pricing_estandar" data-track-label="Cotizar Estándar">Cotizar Esencial</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Más Popular</div>
            <h3>Asesoría Integral</h3>
            <div className="pricing-price">Desde <strong>$8,800 MXN</strong></div>
            <ul>
              <li>Acompañamiento de principio a fin</li>
              <li>Asesor especializado en tu área</li>
              <li>Guía metodológica y de redacción</li>
              <li>Apoyo con observaciones de sinodales</li>
              <li>Pago en 3 o 6 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('licenciatura_pricing_completa')} data-track-cta="licenciatura_pricing_completa" data-track-label="Cotizar Completa">Cotizar Integral</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Salud y Exactas</h3>
            <div className="pricing-price">Costo <strong>mayor</strong></div>
            <ul>
              <li>Medicina, Enfermería, Ingeniería, Matemáticas</li>
              <li>Asesor especializado en el área</li>
              <li>Acompañamiento por etapas</li>
              <li>Guía metodológica y de redacción</li>
              <li>Pago flexible</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('licenciatura_pricing_salud_exactas')} data-track-cta="licenciatura_pricing_salud_exactas" data-track-label="Cotizar Express">Cotizar Asesoría</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="landing-section landing-section-alt" id="testimonios">
        <h2>Estudiantes de licenciatura que avanzaron su tesis con nuestra asesoría</h2>
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
        <h2>Preguntas frecuentes sobre asesoría de tesis de licenciatura</h2>
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
        <h2>Avanza tu tesis hoy — Cotiza tu asesoría de licenciatura gratis</h2>
        <p>Únete a los más de 2,800 estudiantes que ya avanzaron su tesis de licenciatura con la asesoría de Tesipedia. Cotización sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWAClick('licenciatura_final_cta')} data-track-cta="licenciatura_final_cta" data-track-label="Cotizar Mi Tesis por WhatsApp">
          <FaWhatsapp /> Cotizar Mi Tesis por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>
    </div>
  );
}

export default TesisLicenciatura;
