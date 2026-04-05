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
    "name": "Servicio de Elaboración de Tesis — Tesipedia",
    "description": "Conoce cuánto cuesta una tesis en México en 2026. Precios reales y transparentes desde $110 por página. Tesis de licenciatura, maestría y doctorado 100% originales.",
    "brand": { "@type": "Brand", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "3247", "bestRating": "5", "worstRating": "1" },
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "5500", "highPrice": "87500", "offerCount": "3" },
    "review": [
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Laura M." },
        "datePublished": "2025-12-10",
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "El precio fue justo y sin sorpresas. Me dieron cotización exacta desde el primer día y no cambió. Mi tesis de licenciatura costó menos de lo que esperaba."
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Jorge P." },
        "datePublished": "2025-11-05",
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "Comparé precios en 5 servicios distintos. Tesipedia fue el más transparente y con mejor relación calidad-precio. Mi tesis de maestría quedó perfecta."
      }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Precios de Tesis en México — Tesipedia",
    "serviceType": "Elaboración de Tesis Profesional",
    "provider": { "@type": "ProfessionalService", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Precios transparentes para elaboración de tesis en México. Licenciatura desde $110/página, maestría desde $160/página, doctorado desde $210/página. Sin costos ocultos. Más de 3,000 estudiantes titulados.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "110", "highPrice": "250", "unitText": "por página" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta una tesis de licenciatura en México en 2026?",
        "acceptedAnswer": { "@type": "Answer", "text": "El precio promedio de una tesis de licenciatura en México en 2026 varía entre $8,000 y $25,000 MXN dependiendo del proveedor. En Tesipedia, el costo es desde $110 por página, lo que equivale a aproximadamente $5,500 MXN por una tesis de 50 páginas. Incluimos Turnitin, certificado anti-IA y correcciones de sinodales sin costo extra." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cobran por hacer una tesis de maestría?",
        "acceptedAnswer": { "@type": "Answer", "text": "El costo de una tesis de maestría en México oscila entre $15,000 y $45,000 MXN en el mercado. En Tesipedia cobramos desde $160 por página, lo que significa aproximadamente $12,800 MXN por una tesis de 80 páginas. Tu tesis es elaborada por un investigador con doctorado en tu área." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta una tesis de doctorado?",
        "acceptedAnswer": { "@type": "Answer", "text": "Una tesis doctoral en México puede costar entre $30,000 y $90,000 MXN. En Tesipedia, el precio es desde $210 por página, aproximadamente $25,200 MXN por 120 páginas. Incluimos investigador con doctorado, publicación indexada opcional y correcciones ilimitadas hasta la aprobación." }
      },
      {
        "@type": "Question",
        "name": "¿El precio incluye correcciones de sinodales?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. En Tesipedia, el precio que cotizamos incluye todas las correcciones que soliciten tus sinodales hasta la aprobación final de tu tesis. No cobramos extra por ajustes, cambios de formato o modificaciones solicitadas por tu comité evaluador." }
      },
      {
        "@type": "Question",
        "name": "¿Hay costos ocultos o cargos adicionales?",
        "acceptedAnswer": { "@type": "Answer", "text": "No. En Tesipedia manejamos precios 100% transparentes. El precio por página que te cotizamos incluye: elaboración completa, reporte Turnitin, certificado anti-IA, correcciones de sinodales y formato según lineamientos de tu universidad. No hay cargos sorpresa." }
      },
      {
        "@type": "Question",
        "name": "¿Ofrecen planes de pago o facilidades?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. En Tesipedia ofrecemos planes de pago flexibles. Puedes pagar tu tesis en parcialidades conforme avanza el trabajo. Aceptamos transferencia bancaria, depósito en OXXO, tarjeta de crédito/débito y PayPal. Cotiza gratis por WhatsApp para conocer tu plan personalizado." }
      },
      {
        "@type": "Question",
        "name": "¿Por qué Tesipedia es más barato que otros servicios?",
        "acceptedAnswer": { "@type": "Answer", "text": "En Tesipedia trabajamos directamente con investigadores sin intermediarios, lo que nos permite ofrecer precios desde $110/página sin sacrificar calidad. Otros servicios cobran $200-$400 por página porque incluyen márgenes de intermediarios. Nuestro modelo directo beneficia tanto al estudiante como al investigador." }
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

  const testimonials = [
    { name: 'Laura M.', carrera: 'Lic. en Contaduría, BUAP', text: 'El precio fue justo y sin sorpresas. Me dieron cotización exacta desde el primer día y no cambió. Mi tesis de licenciatura costó menos de lo que esperaba.', rating: 5 },
    { name: 'Jorge P.', carrera: 'Maestría en Finanzas, ITESM', text: 'Comparé precios en 5 servicios distintos. Tesipedia fue el más transparente y con mejor relación calidad-precio. Mi tesis de maestría quedó perfecta.', rating: 5 },
    { name: 'Daniela S.', carrera: 'Lic. en Administración, UDG', text: 'Me preocupaba el costo, pero el plan de pagos de Tesipedia me permitió pagar conforme avanzaba mi tesis. Excelente calidad por un precio muy accesible.', rating: 5 },
  ];

  return (
    <div className="landing-page">
      <Helmet>
        <title>¿Cuánto Cuesta una Tesis en México 2026? Precios Desde $110/Página | Tesipedia</title>
        <meta name="description" content="Descubre cuánto cuesta hacer una tesis en México en 2026. Precios reales y transparentes: Licenciatura desde $110/pág, Maestría $160/pág, Doctorado $210/pág. Sin costos ocultos. El promedio del mercado es $250/pág — en Tesipedia pagas hasta 56% menos. Cotiza gratis." />
        <meta name="keywords" content="cuanto cuesta una tesis, cuanto cobran por hacer una tesis, precio de tesis en mexico, cuanto cuesta tesis licenciatura, precio tesis maestria, costo de una tesis, cuanto sale hacer una tesis, tesis precio, elaboracion de tesis precios, tesipedia precios" />
        <link rel="canonical" href="https://tesipedia.com/cuanto-cuesta-una-tesis" />
        <meta property="og:title" content="¿Cuánto Cuesta una Tesis en México 2026? Precios Desde $110/Página | Tesipedia" />
        <meta property="og:description" content="Precios reales de tesis en México 2026. Licenciatura $110/pág, Maestría $160/pág, Doctorado $210/pág. Sin costos ocultos. Cotiza gratis por WhatsApp." />
        <meta property="og:url" content="https://tesipedia.com/cuanto-cuesta-una-tesis" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="¿Cuánto Cuesta una Tesis en México 2026? Precios Desde $110/Página | Tesipedia" />
        <meta name="twitter:description" content="Precios reales de tesis en México 2026. Licenciatura $110/pág, Maestría $160/pág, Doctorado $210/pág. Cotiza gratis." />
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
          <h1>¿Cuánto Cuesta Hacer una Tesis en México en 2026? Precios Reales y Transparentes</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> conoces el precio exacto de tu tesis desde el primer momento. <strong>Licenciatura desde $110/página, Maestría desde $160/página, Doctorado desde $210/página.</strong> Sin costos ocultos, sin sorpresas. El promedio del mercado es $250/página — con nosotros <strong>ahorras hasta un 56%</strong>.
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
            <span><FaUserGraduate /> +3,000 Titulados</span>
          </div>
        </div>
      </section>

      {/* POR QUÉ NUESTROS PRECIOS */}
      <section className="landing-section" id="por-que-tesipedia">
        <h2>¿Por qué los precios de Tesipedia son los más transparentes de México?</h2>
        <p className="landing-section-intro">
          Sabemos que el precio es una de las principales preocupaciones al buscar quién te ayude con tu tesis. Por eso en Tesipedia ofrecemos precios claros, sin letra chica y sin costos sorpresa. Ya sea que necesites <Link to="/comprar-tesis">comprar tu tesis</Link> completa o solo necesites apoyo parcial, aquí sabes exactamente cuánto vas a pagar.
        </p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaMoneyBillWave className="feature-icon" />
            <h3>Precio por Página — Sin Sorpresas</h3>
            <p>Cobramos por página escrita. Sabes el costo total antes de iniciar. Si tu tesis tiene 60 páginas a $110/pág, pagas exactamente $6,600 MXN. Así de simple.</p>
          </div>
          <div className="landing-feature-card">
            <FaBalanceScale className="feature-icon" />
            <h3>Hasta 56% Menos que el Promedio</h3>
            <p>El precio promedio del mercado es $250/página. En Tesipedia comienzas desde $110/página porque trabajamos directo con investigadores, sin intermediarios.</p>
          </div>
          <div className="landing-feature-card">
            <FaPercent className="feature-icon" />
            <h3>Planes de Pago Flexibles</h3>
            <p>Paga en parcialidades conforme avanza tu tesis. Aceptamos transferencia, OXXO, tarjeta y PayPal. Sin intereses ni recargos adicionales.</p>
          </div>
          <div className="landing-feature-card">
            <FaHandshake className="feature-icon" />
            <h3>Correcciones Incluidas en el Precio</h3>
            <p>El precio que cotizamos incluye correcciones de sinodales, reporte Turnitin, certificado anti-IA y formato según lineamientos de tu universidad.</p>
          </div>
        </div>
      </section>

      {/* TABLA DE PRECIOS */}
      <section className="landing-section landing-section-alt" id="tabla-precios">
        <h2>Tabla de Precios de Tesis en México 2026</h2>
        <p className="landing-section-intro">
          Estos son los precios actualizados para elaboración de tesis en México. Compara los precios del mercado con los de Tesipedia y descubre por qué somos la mejor opción.
        </p>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Tesis de Licenciatura</h3>
            <div className="pricing-price">Desde <strong>$110/pág</strong></div>
            <div className="pricing-ref">~$5,500 MXN (50 págs)</div>
            <ul>
              <li>50-120 páginas</li>
              <li>Mercado: $200-$350/pág</li>
              <li>Ahorras hasta $12,000 MXN</li>
              <li>Entrega: 3-4 semanas</li>
              <li>Incluye Turnitin + Anti-IA</li>
              <li>Correcciones de sinodales</li>
              <li>Áreas salud/exactas: $150/pág</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('precio_tabla_licenciatura')} data-track-cta="precio_tabla_licenciatura" data-track-label="Cotizar Licenciatura">Cotizar Licenciatura</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Mejor Valor</div>
            <h3>Tesis de Maestría</h3>
            <div className="pricing-price">Desde <strong>$160/pág</strong></div>
            <div className="pricing-ref">~$12,800 MXN (80 págs)</div>
            <ul>
              <li>80-150 páginas</li>
              <li>Mercado: $300-$500/pág</li>
              <li>Ahorras hasta $27,200 MXN</li>
              <li>Entrega: 4-6 semanas</li>
              <li>Investigador con doctorado</li>
              <li>Incluye Turnitin + Anti-IA</li>
              <li>Áreas salud/exactas: $200/pág</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('precio_tabla_maestria')} data-track-cta="precio_tabla_maestria" data-track-label="Cotizar Maestría">Cotizar Maestría</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Tesis de Doctorado</h3>
            <div className="pricing-price">Desde <strong>$210/pág</strong></div>
            <div className="pricing-ref">~$25,200 MXN (120 págs)</div>
            <ul>
              <li>120-250 páginas</li>
              <li>Mercado: $400-$700/pág</li>
              <li>Ahorras hasta $58,800 MXN</li>
              <li>Entrega: 6-8 semanas</li>
              <li>Investigador con doctorado</li>
              <li>Publicación indexada opcional</li>
              <li>Áreas salud/exactas: $250/pág</li>
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
        <h2>¿Qué incluye el precio de tu tesis?</h2>
        <p className="landing-section-intro">
          A diferencia de otros servicios que cobran extras por cada ajuste, en Tesipedia el precio por página incluye todo lo necesario para que te titules sin gastar de más.
        </p>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Elaboración completa</h3>
            <p>Tu tesis escrita desde cero por un investigador humano con maestría o doctorado en tu área. 100% original, sin plagio ni inteligencia artificial.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Verificación Turnitin + Anti-IA</h3>
            <p>Incluimos reporte oficial de Turnitin y certificado de escáner anti-IA. Tu tesis pasa todos los sistemas de detección de las universidades mexicanas.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Correcciones de sinodales</h3>
            <p>Todas las correcciones que solicite tu comité evaluador están incluidas en el precio. No cobramos extra por ajustes hasta que tu tesis sea aprobada.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Formato universitario</h3>
            <p>Tu tesis se entrega con el formato exacto que exige tu universidad: portada, índice, bibliografía APA/Vancouver/Harvard, márgenes y tipografía correctos.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="landing-section landing-section-alt" id="testimonios">
        <h2>Lo que dicen nuestros estudiantes sobre los precios</h2>
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
        <h2>Preguntas frecuentes sobre precios de tesis en México</h2>
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
        <h2>Conoce el precio exacto de tu tesis en menos de 5 minutos</h2>
        <p>Envíanos los datos de tu tesis por WhatsApp y recibe una cotización personalizada sin compromiso. Más de 3,000 estudiantes ya se titularon con Tesipedia.</p>
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
            <Link to="/comprar-tesis" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Comprar Tesis en México</Link>
            <Link to="/tesis-licenciatura" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Tesis de Licenciatura desde $110/pág</Link>
            <Link to="/tesis-maestria" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Tesis de Maestría desde $160/pág</Link>
            <Link to="/tesis-doctoral" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Tesis Doctoral desde $210/pág</Link>
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
