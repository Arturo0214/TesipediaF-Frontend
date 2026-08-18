import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { trackVisit } from '../../features/visits/visitsSlice';
import { trackCTA, trackGoogleAdsConversion } from '../../services/eventService';
import {
  FaWhatsapp, FaCheckCircle, FaShieldAlt, FaStar, FaUserGraduate,
  FaGraduationCap, FaClock, FaFileAlt, FaArrowRight, FaQuoteLeft,
  FaMoneyBillWave, FaBalanceScale, FaPercent, FaHandshake
} from 'react-icons/fa';
import './Landing.css';

const WA_LINK = 'https://wa.me/5215670071517?text=Hola%2C%20quiero%20saber%20cu%C3%A1nto%20cuesta%20mi%20tesis';

function CuantoCuestaUnaTesis() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(trackVisit({ path: '/cuanto-cuesta-una-tesis', referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
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
    "description": "Conoce cuánto cuesta la asesoría de una tesis en México en 2026. Precios claros y transparentes por programa de asesoría. Acompañamiento para tesis de licenciatura, maestría y doctorado; tú eres el autor.",
    "brand": { "@type": "Brand", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "5500", "highPrice": "87500", "offerCount": "3" }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Precios de Asesoría de Tesis en México — Tesipedia",
    "serviceType": "Asesoría y Acompañamiento de Tesis",
    "provider": { "@type": "ProfessionalService", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Precios transparentes para la asesoría de tesis en México. Licenciatura desde $5,500 MXN, maestría desde $12,800 MXN, doctorado desde $25,200 MXN por programa de asesoría. Sin costos ocultos. Más de 3,000 estudiantes asesorados.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "5500", "highPrice": "87500", "unitText": "por programa de asesoría" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta la asesoría de una tesis de licenciatura en México en 2026?",
        "acceptedAnswer": { "@type": "Answer", "text": "En Tesipedia, el programa de asesoría para una tesis de licenciatura comienza desde $5,500 MXN. El precio final depende del alcance del acompañamiento y del área de estudio. Incluye guía metodológica, orientación en la redacción y revisión de tu borrador, con planes de pago flexibles." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta la asesoría de una tesis de maestría?",
        "acceptedAnswer": { "@type": "Answer", "text": "En Tesipedia, el programa de asesoría de maestría comienza desde $12,800 MXN. Trabajas con un asesor con doctorado en tu área que te guía en la metodología y la redacción. El precio final depende del alcance del acompañamiento." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta la asesoría de una tesis de doctorado?",
        "acceptedAnswer": { "@type": "Answer", "text": "En Tesipedia, el programa de asesoría doctoral comienza desde $25,200 MXN. Incluye acompañamiento de un asesor con doctorado, orientación hacia la publicación indexada (opcional) y revisión de tus avances. El precio depende del alcance del apoyo." }
      },
      {
        "@type": "Question",
        "name": "¿La asesoría incluye apoyo con las observaciones de sinodales?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. En Tesipedia, tu programa de asesoría incluye apoyo para atender las observaciones que soliciten tus sinodales. Te acompañamos con los ajustes, el formato y las modificaciones que pida tu comité evaluador, dentro del alcance acordado." }
      },
      {
        "@type": "Question",
        "name": "¿Hay costos ocultos o cargos adicionales?",
        "acceptedAnswer": { "@type": "Answer", "text": "No. En Tesipedia manejamos precios transparentes. El programa de asesoría que te cotizamos incluye: guía metodológica, orientación en la redacción, revisión de tu borrador y apoyo con el formato según los lineamientos de tu universidad. Sin cargos sorpresa." }
      },
      {
        "@type": "Question",
        "name": "¿Ofrecen planes de pago o facilidades?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. En Tesipedia ofrecemos planes de pago flexibles. Puedes pagar tu asesoría en parcialidades conforme avanza el acompañamiento. Aceptamos transferencia bancaria, depósito en OXXO, tarjeta de crédito/débito y PayPal. Cotiza gratis por WhatsApp para conocer tu plan personalizado." }
      },
      {
        "@type": "Question",
        "name": "¿Por qué conviene asesorarte en lugar de comprar una tesis hecha?",
        "acceptedAnswer": { "@type": "Answer", "text": "Comprar una tesis hecha implica riesgos académicos y de originalidad. Con la asesoría de Tesipedia tú eres el autor de tu trabajo: te acompañamos para que la tesis sea tuya, la entiendas y la puedas defender con seguridad, trabajando directamente con investigadores con posgrado." }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com/" },
      { "@type": "ListItem", "position": 2, "name": "Cuánto Cuesta una Tesis", "item": "https://tesipedia.com/cuanto-cuesta-una-tesis" }
    ]
  };

  const testimonials = [];

  return (
    <div className="landing-page">
      <Helmet>
        <title>¿Cuánto Cuesta una Tesis en México 2026? Precios de Asesoría | Tesipedia</title>
        <meta name="description" content="Descubre cuánto cuesta la asesoría para hacer una tesis en México en 2026. Precios claros y transparentes por programa de asesoría: Licenciatura desde $5,500 MXN, Maestría desde $12,800 MXN, Doctorado desde $25,200 MXN. Sin costos ocultos. Tú eres el autor. Cotiza gratis." />
        <meta name="keywords" content="cuanto cuesta una tesis, cuanto cuesta la asesoria de tesis, precio de tesis en mexico, cuanto cuesta tesis licenciatura, precio asesoria tesis maestria, costo de una tesis, cuanto sale hacer una tesis, tesis precio, asesoria de tesis precios, tesipedia precios" />
        <link rel="canonical" href="https://tesipedia.com/cuanto-cuesta-una-tesis" />
        <meta property="og:title" content="¿Cuánto Cuesta una Tesis en México 2026? Precios de Asesoría | Tesipedia" />
        <meta property="og:description" content="Precios de asesoría de tesis en México 2026. Licenciatura desde $5,500, Maestría desde $12,800, Doctorado desde $25,200 MXN. Sin costos ocultos. Cotiza gratis por WhatsApp." />
        <meta property="og:url" content="https://tesipedia.com/cuanto-cuesta-una-tesis" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="¿Cuánto Cuesta una Tesis en México 2026? Precios de Asesoría | Tesipedia" />
        <meta name="twitter:description" content="Precios de asesoría de tesis en México 2026. Licenciatura desde $5,500, Maestría desde $12,800, Doctorado desde $25,200 MXN. Cotiza gratis." />
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
          <h1>¿Cuánto Cuesta Hacer una Tesis en México en 2026? Precios de Asesoría Transparentes</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> conoces el precio de tu programa de asesoría desde el primer momento. <strong>Asesoría de Licenciatura desde $5,500 MXN, Maestría desde $12,800 MXN, Doctorado desde $25,200 MXN.</strong> Sin costos ocultos, sin sorpresas. Te acompañamos para que tú termines tu tesis y seas el autor.
          </p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('precio_hero')} data-track-cta="precio_hero" data-track-label="Cotizar Mi Tesis Gratis">
              <FaWhatsapp /> Cotizar Mi Tesis Gratis
            </a>
            <a href="#tabla-precios" className="landing-cta-secondary" data-track-cta="precio_hero_tabla" data-track-label="Ver Tabla de Precios">
              Ver Tabla de Precios <FaArrowRight />
            </a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> Precios Transparentes</span>
            <span><FaShieldAlt /> Sin Costos Ocultos</span>
            <span><FaUserGraduate /> +3,000 Asesorados</span>
          </div>
        </div>
      </section>

      {/* POR QUÉ NUESTROS PRECIOS */}
      <section className="landing-section" id="por-que-tesipedia">
        <h2>¿Por qué los precios de asesoría de Tesipedia son transparentes?</h2>
        <p className="landing-section-intro">
          Sabemos que el precio es una de las principales preocupaciones al buscar quién te ayude con tu tesis. Por eso en Tesipedia ofrecemos precios claros, sin letra chica y sin costos sorpresa. Ya sea que busques <Link to="/comprar-tesis">asesoría integral para tu tesis</Link> o solo apoyo en una etapa, aquí sabes exactamente cuánto vas a pagar.
        </p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaMoneyBillWave className="feature-icon" />
            <h3>Precio por Programa — Sin Sorpresas</h3>
            <p>Cotizamos un programa de asesoría con alcance claro. Sabes el costo total antes de iniciar, sin cobros escondidos por el camino. Así de simple.</p>
          </div>
          <div className="landing-feature-card">
            <FaBalanceScale className="feature-icon" />
            <h3>Trato Directo con Asesores</h3>
            <p>Trabajas directamente con investigadores con posgrado, sin intermediarios. Eso se traduce en un acompañamiento cercano y precios justos.</p>
          </div>
          <div className="landing-feature-card">
            <FaPercent className="feature-icon" />
            <h3>Planes de Pago Flexibles</h3>
            <p>Paga en parcialidades conforme avanza tu asesoría. Aceptamos transferencia, OXXO, tarjeta y PayPal. Sin intereses ni recargos adicionales.</p>
          </div>
          <div className="landing-feature-card">
            <FaHandshake className="feature-icon" />
            <h3>Apoyo con Sinodales Incluido</h3>
            <p>El programa que cotizamos incluye apoyo con las observaciones de sinodales y con el formato según los lineamientos de tu universidad.</p>
          </div>
        </div>
      </section>

      {/* TABLA DE PRECIOS */}
      <section className="landing-section landing-section-alt" id="tabla-precios">
        <h2>Precios de Asesoría de Tesis en México 2026</h2>
        <p className="landing-section-intro">
          Estos son los precios de referencia de nuestros programas de asesoría de tesis en México. Cada plan se ajusta según el alcance del acompañamiento que necesites.
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
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('precio_tabla_licenciatura')} data-track-cta="precio_tabla_licenciatura" data-track-label="Cotizar Licenciatura">Cotizar Licenciatura</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Mejor Valor</div>
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
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('precio_tabla_maestria')} data-track-cta="precio_tabla_maestria" data-track-label="Cotizar Maestría">Cotizar Maestría</a>
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
              <li>Orientación a la publicación opcional</li>
              <li>Áreas salud/exactas: costo mayor</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('precio_tabla_doctorado')} data-track-cta="precio_tabla_doctorado" data-track-label="Cotizar Doctorado">Cotizar Doctorado</a>
          </div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('precio_tabla_cotizar')} data-track-cta="precio_tabla_cotizar" data-track-label="Cotizar Mi Tesis Ahora">
            <FaWhatsapp /> Cotizar Mi Tesis Ahora
          </a>
        </div>
      </section>

      {/* QUÉ INCLUYE EL PRECIO */}
      <section className="landing-section" id="que-incluye">
        <h2>¿Qué incluye el programa de asesoría?</h2>
        <p className="landing-section-intro">
          A diferencia de otros servicios que cobran extras por cada ajuste, en Tesipedia el programa de asesoría incluye todo el acompañamiento necesario para que tú termines tu tesis sin gastar de más.
        </p>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Guía metodológica</h3>
            <p>Un investigador con maestría o doctorado en tu área te orienta en el diseño de tu investigación para que tu trabajo sea sólido y original.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Revisión de tu borrador</h3>
            <p>Revisamos y mejoramos lo que redactas, con retroalimentación clara. El trabajo es original y lo redactas tú con nuestra guía.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Apoyo con sinodales</h3>
            <p>Te acompañamos para atender las observaciones que solicite tu comité evaluador, dentro del alcance de tu programa de asesoría.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Formato universitario</h3>
            <p>Te ayudamos con el formato que exige tu universidad: portada, índice, bibliografía APA/Vancouver/Harvard, márgenes y tipografía correctos.</p>
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
        <h2>Preguntas frecuentes sobre precios de asesoría de tesis en México</h2>
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
        <h2>Conoce el precio de tu asesoría en menos de 5 minutos</h2>
        <p>Envíanos los datos de tu tesis por WhatsApp y recibe una cotización personalizada sin compromiso. Más de 3,000 estudiantes ya avanzaron su tesis con la asesoría de Tesipedia.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWAClick('precio_final_cta')} data-track-cta="precio_final_cta" data-track-label="Cotizar Mi Tesis por WhatsApp">
          <FaWhatsapp /> Cotizar Mi Tesis por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>

      {/* INTERNAL LINKS SEO */}
      <section className="landing-section" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#1e3a5f', marginBottom: '1rem' }}>Servicios relacionados</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/comprar-tesis" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Asesoría de Tesis en México</Link>
            <Link to="/tesis-licenciatura" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Asesoría de Tesis de Licenciatura</Link>
            <Link to="/tesis-maestria" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Asesoría de Tesis de Maestría</Link>
            <Link to="/tesis-doctoral" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Asesoría de Tesis Doctoral</Link>
            <Link to="/ayuda-con-tesis" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Ayuda con Tesis</Link>
            <Link to="/preguntas-frecuentes" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Preguntas Frecuentes</Link>
            <Link to="/blog" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Blog Académico</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CuantoCuestaUnaTesis;
