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
    "name": "Tesis Doctoral Profesional",
    "description": "Servicio de elaboración profesional de tesis doctoral en México. Investigación de nivel internacional, 100% original, verificada con Turnitin y anti-IA. Publicación en revistas indexadas.",
    "brand": { "@type": "Organization", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "142", "bestRating": "5", "worstRating": "1" },
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "210", "highPrice": "250", "unitText": "por página" },
    "url": "https://tesipedia.com/tesis-doctoral"
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Tesis Doctoral — Servicio Profesional de Elaboración",
    "serviceType": "Elaboración de Tesis Doctoral",
    "provider": { "@type": "Organization", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Servicio profesional para elaborar tu tesis doctoral en México. Investigadores doctores con experiencia internacional, nivel publicable, 100% original. Publicación en revistas indexadas incluida. +140 doctores titulados.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "25200", "highPrice": "62500", "unitText": "por tesis completa" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta una tesis doctoral?",
        "acceptedAnswer": { "@type": "Answer", "text": "El precio de una tesis doctoral depende del número de páginas y área de estudio. Nuestras tarifas van desde $210 MXN por página ($250 para áreas de salud y exactas). Para una tesis típica de doctorado (120 páginas mínimo), el costo es desde $25,200 MXN. Para tesis de 150-250 páginas: entre $31,500 y $62,500 MXN. Ofrecemos planes de pago flexible en 6, 9 o 12 meses." }
      },
      {
        "@type": "Question",
        "name": "¿Cuántas páginas tiene una tesis doctoral?",
        "acceptedAnswer": { "@type": "Answer", "text": "Una tesis doctoral típicamente tiene entre 120 y 250 páginas, dependiendo de la disciplina y universidad. Doctorados en Ciencias (Matemáticas, Física, Química) suelen tener 150-250 páginas. Doctorados en Humanidades (Filosofía, Historia, Literatura) oscilan entre 200-300 páginas. Doctorados en Educación e Ingeniería: 120-180 páginas. Especifica los requisitos de tu programa doctoral y ajustamos el presupuesto." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo tardan en entregar una tesis doctoral?",
        "acceptedAnswer": { "@type": "Answer", "text": "El tiempo estándar de entrega para doctorado es de 6 a 8 semanas. Este período incluye investigación exhaustiva de nivel internacional, redacción rigurosa, avances parciales y correcciones. Para tesis con publicación indexada, agregamos 4-6 semanas adicionales para el proceso de publicación y revisión editorial. Total con publicación: 10-14 semanas." }
      },
      {
        "@type": "Question",
        "name": "¿Puedo publicar mi tesis doctoral en revistas indexadas?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Todas las tesis doctorales de Tesipedia están diseñadas para ser publicables en revistas indexadas (Scopus, WoS, Latindex, etc.). Ofrecemos servicio incluido de gestión de publicación: redacción del artículo, selección de revista y seguimiento hasta publicación. Muchos de nuestros doctores han publicado en revistas internacionales de alto impacto." }
      },
      {
        "@type": "Question",
        "name": "¿Cómo es la defensa de la tesis doctoral?",
        "acceptedAnswer": { "@type": "Answer", "text": "Nuestros doctores especializados pueden prepararte para la defensa oral. Incluimos: análisis de tu tema, recomendaciones para la presentación, respuestas a preguntas potenciales del jurado y coaching antes de la defensa. También coordinamos con sinodales para ajustar la tesis conforme a sus comentarios antes de la defensa final." }
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

  const testimonials = [
    { name: 'Dr. Francisco M.', carrera: 'Doctorado en Ingeniería Biomédica, UNAM', text: 'Mi tesis fue publicada en Journal of Biomedical Engineering. Tesipedia no solo me ayudó con la tesis, sino que me guiaron en todo el proceso de publicación. Excelente.', rating: 5 },
    { name: 'Dra. Patricia E.', carrera: 'Doctorado en Educación, UAM', text: 'Los doctores que elaboraron mi tesis entienden el nivel internacional que requiere un doctorado. Mi sinodal (del extranjero) quedó impresionado con la calidad. Ya publiqué 2 artículos.', rating: 5 },
    { name: 'Dr. Javier P.', carrera: 'Doctorado en Química, UNAMw', text: 'Tesis de nivel internacional. Los investigadores tienen experiencia en publicación y metodología de investigación. Mi defensa fue fluida gracias a la preparación.', rating: 5 },
  ];

  return (
    <div className="landing-page">
      <Helmet>
        <title>Tesis Doctoral en México 2026 | Tesipedia — Desde $210 por página</title>
        <meta name="description" content="Elabora tu tesis doctoral en México con Tesipedia. Desde $210 MXN por página, 6-8 semanas de entrega. Investigadores doctores internacionales, 100% original, publicación indexada. +140 doctores titulados. Cotiza gratis." />
        <meta name="keywords" content="tesis doctoral, tesis de doctorado, hacer tesis doctoral, tesis doctoral México, tesis doctorado precio, publicación tesis, revista indexada" />
        <link rel="canonical" href="https://tesipedia.com/tesis-doctoral" />
        <meta property="og:title" content="Tesis Doctoral en México 2026 | Tesipedia" />
        <meta property="og:description" content="Elabora tu tesis doctoral profesional. Desde $210 MXN/página, 6-8 semanas. Doctores internacionales, nivel publicable, Turnitin + anti-IA. +140 doctores titulados. Cotiza gratis." />
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
            <FaStar className="star-icon" /> 4.9/5 — Más de 140 tesis doctorales aprobadas
          </div>
          <h1>Tesis Doctoral en México — Profesional, Original y Publicable</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> elaboramos tu tesis de <strong>doctorado desde $210 por página</strong>.
            Escrita por doctores internacionales, verificada con <strong>Turnitin</strong> y escáner <strong>anti-IA</strong>.
            Entrega en <strong>6-8 semanas</strong>. Publicación indexada incluida.
          </p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('doctorado_hero')} data-track-cta="doctorado_hero" data-track-label="Cotizar Mi Tesis Gratis">
              <FaWhatsapp /> Cotizar Mi Tesis Gratis
            </a>
            <a href="#como-funciona" className="landing-cta-secondary" data-track-cta="doctorado_hero_proceso" data-track-label="¿Cómo funciona?">
              ¿Cómo funciona? <FaArrowRight />
            </a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> 100% Original</span>
            <span><FaShieldAlt /> Nivel Internacional</span>
            <span><FaUserGraduate /> +140 Doctores</span>
          </div>
        </div>
      </section>

      {/* POR QUÉ HACER TU TESIS DOCTORAL CON NOSOTROS */}
      <section className="landing-section" id="por-que-tesipedia">
        <h2>¿Por qué hacer tu tesis doctoral en Tesipedia?</h2>
        <p className="landing-section-intro">
          Somos el servicio especializado en tesis doctorales más riguroso de México.
          Cada tesis es elaborada por doctores con experiencia internacional y publicaciones en revistas indexadas.
        </p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Doctores Internacionales</h3>
            <p>Tus tesis las elaboran doctores (PhD) con experiencia en investigación internacional y publicaciones en revistas indexadas. Nivel de investigación de clase mundial.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+140 Doctores Titulados</h3>
            <p>Más de 140 estudiantes de doctorado de UNAM, COLMEX, CINVESTAV, Instituto Tecnológico de Monterrey, UNAMw y universidades del extranjero se titularon con nosotros. 98% aprobación.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Investigación Internacional</h3>
            <p>Nuestras tesis doctorales están diseñadas para publicación en revistas indexadas (Scopus, WoS). Investigación rigurosa, metodología de clase mundial.</p>
          </div>
          <div className="landing-feature-card">
            <FaFileAlt className="feature-icon" />
            <h3>Publicación Incluida</h3>
            <p>Ofrecemos servicio completo de publicación: redacción de artículos, selección de revistas internacionales, seguimiento hasta publicación indexada.</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="landing-section landing-section-alt" id="como-funciona">
        <h2>¿Cómo funciona hacer tu tesis doctoral?</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Cotiza gratis</h3>
            <p>Escríbenos por WhatsApp: programa doctoral, tema de investigación, número de páginas, si deseas publicación indexada. Cotización personalizada en 24 horas.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Recibe tu equipo doctoral</h3>
            <p>Te asignamos doctores especialistas en tu área. Recibes propuesta con equipo de investigadores, metodología y cronograma detallado.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Investigación rigurosa</h3>
            <p>Nuestros doctores conducen investigación de nivel internacional. Avances quincenales, análisis de datos, redacción académica. Preparación para defensa incluida.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Defensa y publicación</h3>
            <p>Recibes tu tesis lista para defender, con reporte Turnitin y certificado anti-IA. Si incluye publicación: gestión completa en revistas indexadas.</p>
          </div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWAClick('doctorado_como_funciona')} data-track-cta="doctorado_como_funciona" data-track-label="Quiero Mi Tesis Doctoral">
            <FaWhatsapp /> Quiero Mi Tesis Doctoral
          </a>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="landing-section" id="precios">
        <h2>¿Cuánto cuesta una tesis doctoral?</h2>
        <p className="landing-section-intro">
          Precios desde $210 MXN por página ($250 para áreas de salud y exactas). Doctores internacionales, investigación de nivel clase mundial.
        </p>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Doctorado Estándar</h3>
            <div className="pricing-price">Desde <strong>$210/página</strong></div>
            <ul>
              <li>120-150 páginas</li>
              <li>Precio: $25,200 - $31,500 MXN</li>
              <li>Entrega: 6-8 semanas</li>
              <li>Doctor especialista</li>
              <li>Pago flexible 6-12 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('doctorado_pricing_estandar')} data-track-cta="doctorado_pricing_estandar" data-track-label="Cotizar Estándar">Cotizar Estándar</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Más Popular</div>
            <h3>Doctorado Completo</h3>
            <div className="pricing-price">Desde <strong>$210/página</strong></div>
            <ul>
              <li>150-200 páginas</li>
              <li>Precio: $31,500 - $42,000 MXN</li>
              <li>Entrega: 6-8 semanas</li>
              <li>Equipo de doctores</li>
              <li>Pago flexible 9-12 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('doctorado_pricing_completo')} data-track-cta="doctorado_pricing_completo" data-track-label="Cotizar Completo">Cotizar Completo</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Salud y Exactas</h3>
            <div className="pricing-price">Desde <strong>$250/página</strong></div>
            <ul>
              <li>Medicina, Ciencias, Ingeniería, Matemáticas</li>
              <li>Doctor especialista en el área</li>
              <li>Entrega: 6-8 semanas</li>
              <li>Nivel publicable</li>
              <li>Pago flexible 12 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card" onClick={() => handleWAClick('doctorado_pricing_salud_exactas')} data-track-cta="doctorado_pricing_salud_exactas" data-track-label="Cotizar + Publicación">Cotizar + Publicación</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="landing-section landing-section-alt" id="testimonios">
        <h2>Lo que dicen nuestros doctores titulados</h2>
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
        <h2>Preguntas frecuentes sobre tesis doctoral</h2>
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
        <h2>Titúlate doctor hoy — Cotiza tu tesis gratis</h2>
        <p>Únete a los más de 140 doctores que ya se titularon con Tesipedia. Cotización sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWAClick('doctorado_final_cta')} data-track-cta="doctorado_final_cta" data-track-label="Cotizar Mi Tesis Doctoral por WhatsApp">
          <FaWhatsapp /> Cotizar Mi Tesis Doctoral por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>
    </div>
  );
}

export default TesisDoctorado;
