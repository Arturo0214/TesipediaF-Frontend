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

function TesisDoctorado() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(trackVisit({ path: '/tesis-doctoral', referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
    window.scrollTo(0, 0);
  }, [dispatch]);

  const handleWAClick = (ctaName) => {
    trackCTA(ctaName, 'WhatsApp CTA');
    trackGoogleAdsConversion();
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Asesoría de Tesis Doctoral",
    "description": "Servicio de asesoría profesional para tu tesis doctoral en México. Te guían investigadores doctores con experiencia internacional; tú desarrollas tu investigación original con nuestro acompañamiento y orientación hacia la publicación.",
    "brand": { "@type": "Organization", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "25200", "highPrice": "62500", "unitText": "por programa de asesoría" },
    "url": "https://tesipedia.com/tesis-doctoral"
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Tesis Doctoral — Servicio Profesional de Asesoría",
    "serviceType": "Asesoría y Acompañamiento de Tesis Doctoral",
    "provider": { "@type": "Organization", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Servicio profesional de asesoría para tu tesis doctoral en México. Asesores doctores con experiencia internacional, trabajo original desarrollado por ti con nuestra guía y orientación hacia la publicación en revistas indexadas. +140 doctorandos asesorados.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "25200", "highPrice": "62500", "unitText": "por programa de asesoría" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta la asesoría de una tesis doctoral?",
        "acceptedAnswer": { "@type": "Answer", "text": "El precio del programa de asesoría de una tesis doctoral depende del alcance del acompañamiento y del área de estudio. Comienza desde $25,200 MXN, y las áreas de salud y exactas suelen tener un costo mayor. Según la profundidad del apoyo, el rango va de $25,200 a $62,500 MXN. Ofrecemos planes de pago flexible en 6, 9 o 12 meses." }
      },
      {
        "@type": "Question",
        "name": "¿Cuántas páginas tiene una tesis doctoral?",
        "acceptedAnswer": { "@type": "Answer", "text": "Una tesis doctoral típicamente tiene entre 120 y 250 páginas, dependiendo de la disciplina y universidad. Doctorados en Ciencias (Matemáticas, Física, Química) suelen tener 150-250 páginas. Doctorados en Humanidades (Filosofía, Historia, Literatura) oscilan entre 200-300 páginas. Doctorados en Educación e Ingeniería: 120-180 páginas. Cuéntanos los requisitos de tu programa doctoral y ajustamos el plan de asesoría." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto dura la asesoría de una tesis doctoral?",
        "acceptedAnswer": { "@type": "Answer", "text": "El acompañamiento típico para doctorado es de 6 a 8 semanas por etapa. Este período incluye guía en la investigación de nivel internacional, orientación en la redacción rigurosa, revisión de tus avances y retroalimentación. Si además buscas apoyo hacia la publicación indexada, ese proceso suma tiempo adicional." }
      },
      {
        "@type": "Question",
        "name": "¿Me pueden orientar para publicar mi tesis doctoral en revistas indexadas?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Te orientamos para que tu tesis doctoral tenga la calidad necesaria para ser publicable en revistas indexadas (Scopus, WoS, Latindex, etc.). Como apoyo adicional, te acompañamos en la preparación del artículo, la selección de revista y el seguimiento del proceso editorial." }
      },
      {
        "@type": "Question",
        "name": "¿Me ayudan a prepararme para la defensa doctoral?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Tus asesores doctores te preparan para la defensa oral: análisis de tu tema, recomendaciones para la presentación, práctica con preguntas potenciales del jurado y retroalimentación. También te ayudamos a atender los comentarios de tus sinodales para ajustar tu tesis antes de la defensa." }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com/" },
      { "@type": "ListItem", "position": 2, "name": "Tesis Doctoral", "item": "https://tesipedia.com/tesis-doctoral" }
    ]
  };

  const testimonials = [];

  return (
    <div className="landing-page">
      <Helmet>
        <title>Tesis Doctoral en México 2026 | Asesoría Tesipedia — Desarróllala Tú</title>
        <meta name="description" content="¿Necesitas desarrollar tu tesis doctoral en México? En Tesipedia te asesoramos: guía en investigación de nivel internacional, orientación en la redacción y hacia la publicación indexada con asesores doctores. Tú eres el autor. +140 doctorandos asesorados. Cotiza gratis." />
        <meta name="keywords" content="tesis doctoral, tesis de doctorado, hacer tesis doctoral, asesoría tesis doctoral, tesis doctoral México, tesis doctorado precio, publicación tesis, revista indexada" />
        <link rel="canonical" href="https://tesipedia.com/tesis-doctoral" />
        <meta property="og:title" content="Tesis Doctoral en México 2026 | Asesoría Tesipedia" />
        <meta property="og:description" content="Te asesoramos para desarrollar tu tesis doctoral. Investigación de nivel internacional y orientación hacia la publicación indexada. Tú eres el autor. +140 doctorandos asesorados. Cotiza gratis." />
        <meta property="og:url" content="https://tesipedia.com/tesis-doctoral" />
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
            <FaStar className="star-icon" /> Más de 140 doctorandos asesorados
          </div>
          <h1>Tesis Doctoral en México — Te Asesoramos para que la Desarrolles Tú</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> te <strong>asesoramos para desarrollar tu tesis doctoral</strong>.
            Te guían doctores con experiencia internacional en la investigación y la redacción, con orientación hacia la publicación indexada.
            <strong>Tú eres el autor</strong> de una investigación original y propia.
          </p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('doctorado_hero')} data-track-cta="doctorado_hero" data-track-label="Cotizar Mi Tesis Gratis">
              <FaWhatsapp /> Cotizar Mi Asesoría Gratis
            </a>
            <a href="#como-funciona" className="landing-cta-secondary" data-track-cta="doctorado_hero_proceso" data-track-label="¿Cómo funciona?">
              ¿Cómo funciona? <FaArrowRight />
            </a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> Investigación 100% Tuya</span>
            <span><FaShieldAlt /> Nivel Internacional</span>
            <span><FaUserGraduate /> +140 Asesorados</span>
          </div>
        </div>
      </section>

      {/* POR QUÉ ASESORAR TU TESIS DOCTORAL CON NOSOTROS */}
      <section className="landing-section" id="por-que-tesipedia">
        <h2>¿Por qué asesorar tu tesis doctoral en Tesipedia?</h2>
        <p className="landing-section-intro">
          Somos el servicio de asesoría en tesis doctorales más riguroso de México.
          Te acompañan doctores con experiencia internacional y publicaciones en revistas indexadas para que tu investigación sea tuya.
        </p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Asesores Doctores Internacionales</h3>
            <p>Te asesoran doctores (PhD) con experiencia en investigación internacional y publicaciones en revistas indexadas. Orientación de nivel de clase mundial.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+140 Doctorandos Asesorados</h3>
            <p>Más de 140 estudiantes de doctorado de UNAM, COLMEX, CINVESTAV, Instituto Tecnológico de Monterrey y universidades del extranjero han avanzado su tesis con nuestro acompañamiento.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Investigación de Nivel Internacional</h3>
            <p>Te guiamos para que tu tesis doctoral tenga rigor de clase mundial y potencial de publicación en revistas indexadas (Scopus, WoS).</p>
          </div>
          <div className="landing-feature-card">
            <FaFileAlt className="feature-icon" />
            <h3>Orientación a la Publicación</h3>
            <p>Como apoyo adicional, te acompañamos en la preparación de artículos, la selección de revistas internacionales y el seguimiento del proceso editorial.</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="landing-section landing-section-alt" id="como-funciona">
        <h2>¿Cómo funciona la asesoría de tu tesis doctoral?</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Cotiza gratis</h3>
            <p>Escríbenos por WhatsApp: programa doctoral, tema de investigación, en qué punto vas y si buscas orientación hacia la publicación indexada. Propuesta en 24 horas.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Recibe tu plan de asesoría</h3>
            <p>Te asignamos doctores especialistas en tu área. Recibes un plan con equipo de asesores, metodología y cronograma detallado.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Avanzas con rigor</h3>
            <p>Desarrollas tu investigación de nivel internacional con acompañamiento: avances quincenales, guía en el análisis de datos y en la redacción académica.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Preparas defensa y publicación</h3>
            <p>Te preparamos para la defensa y te ayudamos a atender las observaciones de tus sinodales. Si lo deseas, te orientamos hacia la publicación en revistas indexadas.</p>
          </div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('doctorado_como_funciona')} data-track-cta="doctorado_como_funciona" data-track-label="Quiero Mi Tesis Doctoral">
            <FaWhatsapp /> Quiero Asesoría para Mi Tesis
          </a>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="landing-section" id="precios">
        <h2>¿Cuánto cuesta la asesoría de una tesis doctoral?</h2>
        <p className="landing-section-intro">
          Programas de asesoría desde $25,200 MXN (las áreas de salud y exactas tienen un costo mayor). Asesores doctores con experiencia internacional.
        </p>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Asesoría Esencial</h3>
            <div className="pricing-price">Desde <strong>$25,200 MXN</strong></div>
            <ul>
              <li>Acompañamiento por etapas</li>
              <li>Asesor doctor especialista</li>
              <li>Guía en investigación y redacción</li>
              <li>Revisión de tus avances</li>
              <li>Pago flexible 6-12 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('doctorado_pricing_estandar')} data-track-cta="doctorado_pricing_estandar" data-track-label="Cotizar Estándar">Cotizar Esencial</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Más Popular</div>
            <h3>Asesoría Integral</h3>
            <div className="pricing-price">Desde <strong>$31,500 MXN</strong></div>
            <ul>
              <li>Acompañamiento de principio a fin</li>
              <li>Equipo de asesores doctores</li>
              <li>Guía en investigación rigurosa</li>
              <li>Apoyo con observaciones de sinodales</li>
              <li>Pago flexible 9-12 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('doctorado_pricing_completo')} data-track-cta="doctorado_pricing_completo" data-track-label="Cotizar Completo">Cotizar Integral</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Salud y Exactas</h3>
            <div className="pricing-price">Costo <strong>mayor</strong></div>
            <ul>
              <li>Medicina, Ciencias, Ingeniería, Matemáticas</li>
              <li>Asesor doctor especialista en el área</li>
              <li>Acompañamiento por etapas</li>
              <li>Orientación a la publicación</li>
              <li>Pago flexible 12 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('doctorado_pricing_salud_exactas')} data-track-cta="doctorado_pricing_salud_exactas" data-track-label="Cotizar + Publicación">Cotizar + Publicación</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="landing-section landing-section-alt" id="testimonios">
        <h2>Doctorandos que avanzaron su tesis con nuestra asesoría</h2>
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
        <h2>Preguntas frecuentes sobre asesoría de tesis doctoral</h2>
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
        <h2>Avanza tu tesis hoy — Cotiza tu asesoría doctoral gratis</h2>
        <p>Únete a los más de 140 doctorandos que ya avanzaron su tesis con la asesoría de Tesipedia. Cotización sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWAClick('doctorado_final_cta')} data-track-cta="doctorado_final_cta" data-track-label="Cotizar Mi Tesis Doctoral por WhatsApp">
          <FaWhatsapp /> Cotizar Mi Tesis Doctoral por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>
    </div>
  );
}

export default TesisDoctorado;
