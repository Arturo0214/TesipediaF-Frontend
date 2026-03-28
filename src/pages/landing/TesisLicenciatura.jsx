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
    "name": "Tesis de Licenciatura Profesional",
    "description": "Servicio de elaboración profesional de tesis de licenciatura en México. Escritas por investigadores con maestría, 100% originales, verificadas con Turnitin y anti-IA.",
    "brand": { "@type": "Organization", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "2847", "bestRating": "5", "worstRating": "1" },
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "110", "highPrice": "150", "unitText": "por página" },
    "url": "https://tesipedia.com/tesis-licenciatura"
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Tesis de Licenciatura — Servicio Profesional de Elaboración",
    "serviceType": "Elaboración de Tesis de Licenciatura",
    "provider": { "@type": "Organization", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Servicio profesional para elaborar tu tesis de licenciatura en México. 100% original, verificada con Turnitin y anti-IA. Más de 2,800 estudiantes titulados en nivel licenciatura.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "5500", "highPrice": "15000", "unitText": "por tesis completa" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta una tesis de licenciatura?",
        "acceptedAnswer": { "@type": "Answer", "text": "El precio de una tesis de licenciatura depende del número de páginas y área de estudio. Nuestras tarifas van desde $110 MXN por página ($150 para áreas de salud y exactas). Para una tesis típica de licenciatura (50 páginas mínimo), el costo es desde $5,500 MXN. Para tesis de 70-100 páginas: entre $7,700 y $15,000 MXN. Ofrecemos planes de pago flexible en 3 o 6 meses." }
      },
      {
        "@type": "Question",
        "name": "¿Cuántas páginas tiene una tesis de licenciatura?",
        "acceptedAnswer": { "@type": "Answer", "text": "Una tesis de licenciatura típicamente tiene entre 50 y 120 páginas. La extensión varía según la carrera y universidad: Derecho y Administración suelen requerir 80-120 páginas, mientras que Ingeniería y Psicología oscilan entre 60-100 páginas. En la cotización, especifica el número de páginas de tu universidad y ajustamos el precio." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo tardan en entregar una tesis de licenciatura?",
        "acceptedAnswer": { "@type": "Answer", "text": "El tiempo estándar de entrega para licenciatura es de 3 a 4 semanas. Este tiempo incluye la investigación, redacción, avances parciales y correcciones. Si necesitas una entrega más rápida, ofrecemos servicio express en 2-3 semanas con costo adicional." }
      },
      {
        "@type": "Question",
        "name": "¿Qué carreras cubren para licenciatura?",
        "acceptedAnswer": { "@type": "Answer", "text": "Elaboramos tesis de licenciatura para todas las carreras: Derecho, Administración, Contabilidad, Ingeniería Civil, Ingeniería en Sistemas, Psicología, Educación, Pedagogía, Comunicación, Mercadotecnia, Enfermería, Medicina, Biología, Química, Economía, Sociología, Antropología y más. Todos nuestros investigadores son especialistas en su área." }
      },
      {
        "@type": "Question",
        "name": "¿Pasa los detectores anti-plagió y anti-IA en licenciatura?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí, 100%. Todas las tesis de licenciatura de Tesipedia son escritas por investigadores humanos (no IA). Incluimos verificación con Turnitin y certificado anti-IA antes de entregar. Nuestras tesis pasan todos los sistemas de detección de universidades como UNAM, IPN, UAM, BUAP, UDG y más." }
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

  const testimonials = [
    { name: 'Laura V.', carrera: 'Lic. en Derecho, UNAM', text: 'Tenía miedo de que no fuera original, pero la tesis de Tesipedia pasó Turnitin con volado. Mi sinodal dijo que fue una excelente investigación. Muy recomendado.', rating: 5 },
    { name: 'Diego M.', carrera: 'Lic. en Administración, ITESM', text: 'Llevaba 1 año atorado con mi tesis. Tesipedia me la entregó en 4 semanas, bien hecha y lista para defender. Valió totalmente la pena.', rating: 5 },
    { name: 'Sofía T.', carrera: 'Lic. en Psicología, UAM', text: 'Los investigadores fueron muy profesionales. Me explicaron la tesis completa antes de entregarla. Pasé mi examen profesional sin problema.', rating: 5 },
  ];

  return (
    <div className="landing-page">
      <Helmet>
        <title>Tesis de Licenciatura en México 2026 | Tesipedia — Desde $110 por página</title>
        <meta name="description" content="Elabora tu tesis de licenciatura en México con Tesipedia. Desde $110 MXN por página, 3-4 semanas de entrega. 100% original, verificada con Turnitin y anti-IA. +2,800 titulados. Cotiza gratis." />
        <meta name="keywords" content="tesis de licenciatura, tesis licenciatura, hacer tesis licenciatura, tesis licenciatura precio, tesis licenciatura México, elaboración de tesis licenciatura" />
        <link rel="canonical" href="https://tesipedia.com/tesis-licenciatura" />
        <meta property="og:title" content="Tesis de Licenciatura en México 2026 | Tesipedia" />
        <meta property="og:description" content="Elabora tu tesis de licenciatura profesional. Desde $110 MXN/página, 3-4 semanas. 100% original, Turnitin + anti-IA. +2,800 estudiantes titulados. Cotiza gratis." />
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
            <FaStar className="star-icon" /> 4.9/5 — Más de 2,800 tesis de licenciatura aprobadas
          </div>
          <h1>Tesis de Licenciatura en México — Profesional, Original y Sin Plagio</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> elaboramos tu tesis de <strong>licenciatura desde $110 por página</strong>.
            Escrita por investigadores con maestría, verificada con <strong>Turnitin</strong> y escáner <strong>anti-IA</strong>.
            Entrega en <strong>3-4 semanas</strong>.
          </p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('licenciatura_hero')} data-track-cta="licenciatura_hero" data-track-label="Cotizar Mi Tesis Gratis">
              <FaWhatsapp /> Cotizar Mi Tesis Gratis
            </a>
            <a href="#como-funciona" className="landing-cta-secondary" data-track-cta="licenciatura_hero_proceso" data-track-label="¿Cómo funciona?">
              ¿Cómo funciona? <FaArrowRight />
            </a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> 100% Original</span>
            <span><FaShieldAlt /> Verificada con Turnitin</span>
            <span><FaUserGraduate /> +2,800 Titulados</span>
          </div>
        </div>
      </section>

      {/* POR QUÉ COMPRAR TU TESIS DE LICENCIATURA CON NOSOTROS */}
      <section className="landing-section" id="por-que-tesipedia">
        <h2>¿Por qué hacer tu tesis de licenciatura en Tesipedia?</h2>
        <p className="landing-section-intro">
          Somos el servicio especializado en tesis de licenciatura más confiable de México.
          Cada tesis es escrita por investigadores con maestría — nunca usamos inteligencia artificial.
        </p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>100% Original — Sin Plagio ni IA</h3>
            <p>Cada tesis de licenciatura se elabora desde cero por investigadores con posgrado. Incluimos reporte Turnitin y certificado anti-IA.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+2,800 Licenciados Titulados</h3>
            <p>Más de 2,800 estudiantes de licenciatura de UNAM, IPN, UAM, BUAP, UDG, ITESM y más ya se titularon con nosotros. 98% aprobación.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Entrega en 3-4 Semanas</h3>
            <p>Recibe tu tesis de licenciatura completa en tiempo récord. Incluimos avances semanales y correcciones ilimitadas.</p>
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
        <h2>¿Cómo funciona hacer tu tesis de licenciatura?</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Cotiza gratis</h3>
            <p>Escríbenos por WhatsApp: carrera, número de páginas, fecha de defensa y requisitos específicos de tu universidad. Cotización en minutos.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Recibe tu propuesta</h3>
            <p>Te asignamos un investigador especialista en tu área de licenciatura. Recibes propuesta personalizada, price y plan de pago flexible.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Desarrollo con avances</h3>
            <p>Tu investigador elabora la tesis con avances semanales. Puedes revisar, ajustar y solicitar cambios en cada etapa.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Entrega y defensa</h3>
            <p>Recibes tu tesis con reporte Turnitin y certificado anti-IA. Incluso correcciones de sinodales hasta aprobación final.</p>
          </div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('licenciatura_como_funciona')} data-track-cta="licenciatura_como_funciona" data-track-label="Quiero Mi Tesis de Licenciatura">
            <FaWhatsapp /> Quiero Mi Tesis de Licenciatura
          </a>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="landing-section" id="precios">
        <h2>¿Cuánto cuesta una tesis de licenciatura?</h2>
        <p className="landing-section-intro">
          Precios desde $110 MXN por página ($150 para áreas de salud y exactas). El costo total depende del número de páginas y tiempo de entrega.
        </p>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Licenciatura Estándar</h3>
            <div className="pricing-price">Desde <strong>$110/página</strong></div>
            <ul>
              <li>50-80 páginas</li>
              <li>Precio: $5,500 - $8,800 MXN</li>
              <li>Entrega: 3-4 semanas</li>
              <li>Incluye Turnitin + Anti-IA</li>
              <li>Pago en 3 o 6 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('licenciatura_pricing_estandar')} data-track-cta="licenciatura_pricing_estandar" data-track-label="Cotizar Estándar">Cotizar Estándar</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Más Popular</div>
            <h3>Licenciatura Completa</h3>
            <div className="pricing-price">Desde <strong>$110/página</strong></div>
            <ul>
              <li>80-120 páginas</li>
              <li>Precio: $8,800 - $13,200 MXN</li>
              <li>Entrega: 3-4 semanas</li>
              <li>Investigador especializado</li>
              <li>Pago en 3 o 6 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('licenciatura_pricing_completa')} data-track-cta="licenciatura_pricing_completa" data-track-label="Cotizar Completa">Cotizar Completa</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Salud y Exactas</h3>
            <div className="pricing-price">Desde <strong>$150/página</strong></div>
            <ul>
              <li>Medicina, Enfermería, Ingeniería, Matemáticas</li>
              <li>Investigador especializado en el área</li>
              <li>Entrega: 3-4 semanas</li>
              <li>Incluye Turnitin + Anti-IA</li>
              <li>Pago flexible</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('licenciatura_pricing_salud_exactas')} data-track-cta="licenciatura_pricing_salud_exactas" data-track-label="Cotizar Express">Cotizar Express</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="landing-section landing-section-alt" id="testimonios">
        <h2>Lo que dicen nuestros licenciados titulados</h2>
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
        <h2>Preguntas frecuentes sobre tesis de licenciatura</h2>
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
        <h2>Titúlate hoy — Cotiza tu tesis de licenciatura gratis</h2>
        <p>Únete a los más de 2,800 licenciados que ya se titularon con Tesipedia. Cotización sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWAClick('licenciatura_final_cta')} data-track-cta="licenciatura_final_cta" data-track-label="Cotizar Mi Tesis por WhatsApp">
          <FaWhatsapp /> Cotizar Mi Tesis por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>
    </div>
  );
}

export default TesisLicenciatura;
