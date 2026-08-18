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

function TesisMaestria() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(trackVisit({ path: '/tesis-maestria', referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
    window.scrollTo(0, 0);
  }, [dispatch]);

  const handleWAClick = (ctaName) => {
    trackCTA(ctaName, 'WhatsApp CTA');
    trackGoogleAdsConversion();
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Asesoría de Tesis de Maestría",
    "description": "Servicio de asesoría profesional para tu tesis de maestría en México. Te guían investigadores con doctorado; tú redactas tu trabajo original con nuestro acompañamiento y rigor metodológico.",
    "brand": { "@type": "Organization", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "12800", "highPrice": "30000", "unitText": "por programa de asesoría" },
    "url": "https://tesipedia.com/tesis-maestria"
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Tesis de Maestría — Servicio Profesional de Asesoría",
    "serviceType": "Asesoría y Acompañamiento de Tesis de Maestría",
    "provider": { "@type": "Organization", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Servicio profesional de asesoría para tu tesis de maestría en México. Asesores con doctorado, trabajo original redactado por ti con nuestra guía y rigor metodológico. +680 estudiantes de maestría asesorados.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "12800", "highPrice": "30000", "unitText": "por programa de asesoría" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta la asesoría de una tesis de maestría?",
        "acceptedAnswer": { "@type": "Answer", "text": "El precio del programa de asesoría de una tesis de maestría depende del alcance del acompañamiento y del área de estudio. Comienza desde $12,800 MXN, y las áreas de salud y exactas suelen tener un costo mayor. Según la profundidad del apoyo, el rango va de $12,800 a $30,000 MXN. Ofrecemos planes de pago flexible en 3, 6 o 9 meses." }
      },
      {
        "@type": "Question",
        "name": "¿Cuántas páginas debe tener una tesis de maestría?",
        "acceptedAnswer": { "@type": "Answer", "text": "Una tesis de maestría típicamente tiene entre 80 y 150 páginas. Esto depende de la universidad, área de estudio y metodología. MBA y Maestrías en Administración suelen ser 100-150 páginas. Maestrías en Ingeniería, Educación y Psicología oscilan entre 80-120 páginas. Cuéntanos los requisitos de tu universidad y ajustamos el plan de asesoría." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto dura la asesoría de una tesis de maestría?",
        "acceptedAnswer": { "@type": "Answer", "text": "El acompañamiento típico para maestría es de 4 a 6 semanas por etapa. Este período incluye guía en la investigación, orientación en la redacción, revisión de tus avances y retroalimentación. Para temas más complejos o con metodologías rigurosas, puede extenderse. También ofrecemos sesiones intensivas." }
      },
      {
        "@type": "Question",
        "name": "¿Pueden ayudarme a que mi tesis sea publicable?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Te acompañamos para que tu tesis de maestría tenga rigor metodológico y contenido con potencial de publicación en revistas indexadas y congresos. Nuestros asesores con doctorado te orientan en ese proceso. La gestión de publicación en revistas indexadas es un apoyo adicional que cotizamos por separado." }
      },
      {
        "@type": "Question",
        "name": "¿Quién me asesora en la tesis de maestría?",
        "acceptedAnswer": { "@type": "Answer", "text": "Te asesoran investigadores con doctorado (PhD o similar), especialistas en tu área de estudio y con experiencia en metodología rigurosa. Te asignamos el asesor más apropiado para tu tema de tesis." }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com/" },
      { "@type": "ListItem", "position": 2, "name": "Tesis de Maestría", "item": "https://tesipedia.com/tesis-maestria" }
    ]
  };

  const testimonials = [];

  return (
    <div className="landing-page">
      <Helmet>
        <title>Tesis de Maestría en México 2026 | Asesoría Tesipedia — Termínala Tú</title>
        <meta name="description" content="¿Necesitas hacer tu tesis de maestría en México? En Tesipedia te asesoramos para terminarla: guía metodológica rigurosa, orientación en la redacción y revisión de tu borrador con asesores doctores. Tú eres el autor. +680 estudiantes de maestría asesorados. Cotiza gratis." />
        <meta name="keywords" content="tesis de maestría, tesis maestría, hacer tesis maestría, asesoría tesis maestría, tesis maestría precio, tesis maestría México, tesis de posgrado, ayuda con tesis de maestría" />
        <link rel="canonical" href="https://tesipedia.com/tesis-maestria" />
        <meta property="og:title" content="Tesis de Maestría en México 2026 | Asesoría Tesipedia" />
        <meta property="og:description" content="Te asesoramos para hacer tu tesis de maestría. Guía metodológica rigurosa con asesores doctores. Tú eres el autor. +680 estudiantes de maestría asesorados. Cotiza gratis." />
        <meta property="og:url" content="https://tesipedia.com/tesis-maestria" />
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
            <FaStar className="star-icon" /> Más de 680 estudiantes de maestría asesorados
          </div>
          <h1>Tesis de Maestría en México — Te Asesoramos para que la Termines Tú</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> te <strong>asesoramos para hacer tu tesis de maestría</strong>.
            Te guían investigadores con doctorado en la metodología y la redacción, y revisamos tu borrador con rigor.
            <strong>Tú eres el autor</strong> de un trabajo original y propio.
          </p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('maestria_hero')} data-track-cta="maestria_hero" data-track-label="Cotizar Mi Tesis Gratis">
              <FaWhatsapp /> Cotizar Mi Asesoría Gratis
            </a>
            <a href="#como-funciona" className="landing-cta-secondary" data-track-cta="maestria_hero_proceso" data-track-label="¿Cómo funciona?">
              ¿Cómo funciona? <FaArrowRight />
            </a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> Trabajo 100% Tuyo</span>
            <span><FaShieldAlt /> Asesores con Doctorado</span>
            <span><FaUserGraduate /> +680 Asesorados</span>
          </div>
        </div>
      </section>

      {/* POR QUÉ ASESORAR TU TESIS DE MAESTRÍA CON NOSOTROS */}
      <section className="landing-section" id="por-que-tesipedia">
        <h2>¿Por qué asesorar tu tesis de maestría en Tesipedia?</h2>
        <p className="landing-section-intro">
          Somos el servicio de asesoría en tesis de maestría más confiable de México.
          Te acompañan investigadores con doctorado con rigor metodológico de nivel posgrado para que tu tesis sea tuya.
        </p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Asesores Doctores (PhD)</h3>
            <p>Te asesoran investigadores con doctorado (PhD, Dr. Rer. Nat., etc.). Guía en metodología rigurosa y orientación para un trabajo de nivel publicable, redactado por ti.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+680 Estudiantes Asesorados</h3>
            <p>Más de 680 estudiantes de maestría de UNAM, IPADE, IPN, TEC, ITAM, UVM, UAM y más han avanzado su tesis con nuestro acompañamiento.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Acompañamiento por Etapas</h3>
            <p>Avanzas tu tesis de maestría con investigación exhaustiva, metodología rigurosa y revisiones en cada etapa.</p>
          </div>
          <div className="landing-feature-card">
            <FaFileAlt className="feature-icon" />
            <h3>Enfoque Publicable</h3>
            <p>Te orientamos para que tu tesis de maestría tenga calidad con potencial de publicación en revistas indexadas.</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="landing-section landing-section-alt" id="como-funciona">
        <h2>¿Cómo funciona la asesoría de tu tesis de maestría?</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Cotiza gratis</h3>
            <p>Escríbenos por WhatsApp: programa de maestría, tema, en qué punto vas y metodología requerida. Propuesta en minutos.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Recibe tu plan de asesoría</h3>
            <p>Te asignamos un asesor doctor especialista en tu área. Recibes un plan personalizado con alcance, metodología y pago flexible.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Avanzas con rigor</h3>
            <p>Trabajas tu tesis con avances semanales. Tu asesor te guía en la investigación y la redacción con metodología rigurosa y retroalimentación.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Preparas tu defensa</h3>
            <p>Pulimos tu borrador contigo y te ayudamos a atender las observaciones de tus sinodales para que llegues seguro a tu defensa.</p>
          </div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('maestria_como_funciona')} data-track-cta="maestria_como_funciona" data-track-label="Quiero Mi Tesis de Maestría">
            <FaWhatsapp /> Quiero Asesoría para Mi Tesis
          </a>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="landing-section" id="precios">
        <h2>¿Cuánto cuesta la asesoría de una tesis de maestría?</h2>
        <p className="landing-section-intro">
          Programas de asesoría desde $12,800 MXN (las áreas de salud y exactas tienen un costo mayor). Asesores con doctorado y metodología rigurosa.
        </p>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Asesoría Esencial</h3>
            <div className="pricing-price">Desde <strong>$12,800 MXN</strong></div>
            <ul>
              <li>Acompañamiento por etapas</li>
              <li>Asesor con doctorado</li>
              <li>Guía metodológica y de redacción</li>
              <li>Revisión de tu borrador</li>
              <li>Pago en 3, 6 o 9 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('maestria_pricing_estandar')} data-track-cta="maestria_pricing_estandar" data-track-label="Cotizar Estándar">Cotizar Esencial</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Más Popular</div>
            <h3>Asesoría Integral</h3>
            <div className="pricing-price">Desde <strong>$16,000 MXN</strong></div>
            <ul>
              <li>Acompañamiento de principio a fin</li>
              <li>Asesor doctor especialista</li>
              <li>Guía metodológica rigurosa</li>
              <li>Apoyo con observaciones de sinodales</li>
              <li>Pago flexible</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('maestria_pricing_completa')} data-track-cta="maestria_pricing_completa" data-track-label="Cotizar Completa">Cotizar Integral</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Salud y Exactas</h3>
            <div className="pricing-price">Costo <strong>mayor</strong></div>
            <ul>
              <li>Medicina, Ingeniería, Ciencias, Matemáticas</li>
              <li>Asesor doctor especialista en el área</li>
              <li>Acompañamiento por etapas</li>
              <li>Enfoque publicable</li>
              <li>Pago flexible</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('maestria_pricing_salud_exactas')} data-track-cta="maestria_pricing_salud_exactas" data-track-label="Cotizar Publicable">Cotizar Asesoría</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="landing-section landing-section-alt" id="testimonios">
        <h2>Estudiantes de maestría que avanzaron su tesis con nuestra asesoría</h2>
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
        <h2>Preguntas frecuentes sobre asesoría de tesis de maestría</h2>
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
        <h2>Avanza tu tesis hoy — Cotiza tu asesoría de maestría gratis</h2>
        <p>Únete a los más de 680 estudiantes que ya avanzaron su tesis de maestría con la asesoría de Tesipedia. Cotización sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWAClick('maestria_final_cta')} data-track-cta="maestria_final_cta" data-track-label="Cotizar Mi Tesis por WhatsApp">
          <FaWhatsapp /> Cotizar Mi Tesis por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>
    </div>
  );
}

export default TesisMaestria;
