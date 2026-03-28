import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { trackVisit } from '../../features/visits/visitsSlice';
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

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Tesis de Maestría Profesional",
    "description": "Servicio de elaboración profesional de tesis de maestría en México. Elaboradas por investigadores con doctorado, 100% originales, verificadas con Turnitin y anti-IA.",
    "brand": { "@type": "Organization", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "687", "bestRating": "5", "worstRating": "1" },
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "270", "highPrice": "300", "unitText": "por página" },
    "url": "https://tesipedia.com/tesis-maestria"
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Tesis de Maestría — Servicio Profesional de Elaboración",
    "serviceType": "Elaboración de Tesis de Maestría",
    "provider": { "@type": "Organization", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Servicio profesional para elaborar tu tesis de maestría en México. Investigadores con doctorado, 100% original, verificada con Turnitin y anti-IA. Metodología rigurosa. +680 maestros titulados.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "21600", "highPrice": "45000", "unitText": "por tesis completa" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "687", "bestRating": "5" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta una tesis de maestría?",
        "acceptedAnswer": { "@type": "Answer", "text": "El precio de una tesis de maestría depende del número de páginas y área de estudio. Nuestras tarifas van desde $270 MXN por página ($300 para áreas de salud y exactas). Para una tesis típica de maestría (80 páginas mínimo), el costo es desde $21,600 MXN. Para tesis de 100-150 páginas: entre $27,000 y $45,000 MXN. Ofrecemos planes de pago flexible en 3, 6 o 9 meses." }
      },
      {
        "@type": "Question",
        "name": "¿Cuántas páginas debe tener una tesis de maestría?",
        "acceptedAnswer": { "@type": "Answer", "text": "Una tesis de maestría típicamente tiene entre 80 y 150 páginas. Esto depende de la universidad, área de estudio y metodología. MBA y Maestrías en Administración suelen ser 100-150 páginas. Maestrías en Ingeniería, Educación y Psicología oscilan entre 80-120 páginas. Especifica los requisitos de tu universidad y ajustamos el presupuesto." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo tardan en entregar una tesis de maestría?",
        "acceptedAnswer": { "@type": "Answer", "text": "El tiempo estándar de entrega para maestría es de 4 a 6 semanas. Este período incluye investigación exhaustiva, redacción, avances parciales y correcciones. Para tesis más complejas o con metodologías rigurosas, podemos extender hasta 8 semanas. Servicio express disponible en 3 semanas con costo adicional." }
      },
      {
        "@type": "Question",
        "name": "¿Puedo publicar mi tesis de maestría después?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Muchas tesis de maestría de Tesipedia han sido publicadas en revistas indexadas y congresos académicos. Nuestros investigadores doctores elaboran tesis con rigor metodológico y contenido publicable. Eso sí, la publicación en revistas indexadas requiere requisitos adicionales que cotizamos por separado." }
      },
      {
        "@type": "Question",
        "name": "¿Quién elabora la tesis de maestría?",
        "acceptedAnswer": { "@type": "Answer", "text": "Todas las tesis de maestría son elaboradas por investigadores con doctorado (PhD o similar). Nuestros doctores son especialistas en su área de estudio y tienen experiencia en metodología rigurosa. Te asignamos el investigador más apropiado para tu tema de tesis." }
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

  const testimonials = [
    { name: 'Roberto A.', carrera: 'Maestría en Administración, IPADE', text: 'Mi tesis fue excelente. Los doctores que la hicieron entienden el nivel de maestría. Pasé mi defensa sin problemas y ya estoy publicando artículos.', rating: 5 },
    { name: 'Gabriela R.', carrera: 'Maestría en Educación, UPN', text: 'Llevaba 1.5 años atorada con mi tesis. Tesipedia me la entreg en 5 semanas con metodología rigurosa. Mi comité quedó impresionado.', rating: 5 },
    { name: 'Andrés L.', carrera: 'Maestría en Ingeniería, UNAM', text: 'Los doctores que elaboraron mi tesis conocen realmente el tema. La tesis tiene nivel de publicación. Muy profesional.', rating: 5 },
  ];

  return (
    <div className="landing-page">
      <Helmet>
        <title>Tesis de Maestría en México 2026 | Tesipedia — Desde $270 por página</title>
        <meta name="description" content="Elabora tu tesis de maestría en México con Tesipedia. Desde $270 MXN por página, 4-6 semanas de entrega. Investigadores con doctorado, 100% original, Turnitin + anti-IA. +680 maestros titulados. Cotiza gratis." />
        <meta name="keywords" content="tesis de maestría, tesis maestría, hacer tesis maestría, tesis maestría precio, tesis maestría México, tesis de posgrado, maestría profesional" />
        <link rel="canonical" href="https://tesipedia.com/tesis-maestria" />
        <meta property="og:title" content="Tesis de Maestría en México 2026 | Tesipedia" />
        <meta property="og:description" content="Elabora tu tesis de maestría profesional. Desde $270 MXN/página, 4-6 semanas. Doctores especialistas, Turnitin + anti-IA. +680 maestros titulados. Cotiza gratis." />
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
            <FaStar className="star-icon" /> 4.9/5 — Más de 680 tesis de maestría aprobadas
          </div>
          <h1>Tesis de Maestría en México — Profesional, Original y Sin Plagio</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> elaboramos tu tesis de <strong>maestría desde $270 por página</strong>.
            Escrita por investigadores con doctorado, verificada con <strong>Turnitin</strong> y escáner <strong>anti-IA</strong>.
            Entrega en <strong>4-6 semanas</strong>.
          </p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary">
              <FaWhatsapp /> Cotizar Mi Tesis Gratis
            </a>
            <a href="#como-funciona" className="landing-cta-secondary">
              ¿Cómo funciona? <FaArrowRight />
            </a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> 100% Original</span>
            <span><FaShieldAlt /> Doctores Especialistas</span>
            <span><FaUserGraduate /> +680 Titulados</span>
          </div>
        </div>
      </section>

      {/* POR QUÉ HACER TU TESIS DE MAESTRÍA CON NOSOTROS */}
      <section className="landing-section" id="por-que-tesipedia">
        <h2>¿Por qué hacer tu tesis de maestría en Tesipedia?</h2>
        <p className="landing-section-intro">
          Somos el servicio especializado en tesis de maestría más confiable de México.
          Cada tesis es elaborada por investigadores con doctorado con rigor metodológico de nivel posgrado.
        </p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Doctores PhD — Sin IA</h3>
            <p>Tus tesis las elaboran investigadores con doctorado (PhD, Dr. Rer. Nat., etc.). Metodología rigurosa, nivel publicable, sin inteligencia artificial.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+680 Maestros Titulados</h3>
            <p>Más de 680 estudiantes de maestría de UNAM, IPADE, IPN, TEC, ITAM, UVM, UAM y más se titularon con nosotros. 98% aprobación.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Entrega en 4-6 Semanas</h3>
            <p>Recibe tu tesis de maestría con investigación exhaustiva, metodología rigurosa y correcciones hasta aprobación final.</p>
          </div>
          <div className="landing-feature-card">
            <FaFileAlt className="feature-icon" />
            <h3>Nivel Publicable</h3>
            <p>Nuestras tesis de maestría tienen calidad de publicación en revistas indexadas. Muchos estudiantes publican artículos tras la titulación.</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="landing-section landing-section-alt" id="como-funciona">
        <h2>¿Cómo funciona hacer tu tesis de maestría?</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Cotiza gratis</h3>
            <p>Escríbenos por WhatsApp: programa de maestría, tema, número de páginas, metodología requerida. Te cotizamos en minutos.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Recibe tu propuesta</h3>
            <p>Te asignamos un doctor especialista en tu área. Recibes propuesta personalizada con investigador, alcance y metodología.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Desarrollo con rigor</h3>
            <p>Tu doctor elabora la tesis con avances semanales. Investigación exhaustiva, metodología rigurosa, ajustes según tus necesidades.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Entrega y defensa</h3>
            <p>Recibes tu tesis con reporte Turnitin y certificado anti-IA. Incluso correcciones de sinodales hasta aprobación final.</p>
          </div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary">
            <FaWhatsapp /> Quiero Mi Tesis de Maestría
          </a>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="landing-section" id="precios">
        <h2>¿Cuánto cuesta una tesis de maestría?</h2>
        <p className="landing-section-intro">
          Precios desde $270 MXN por página ($300 para áreas de salud y exactas). Investigadores con doctorado, metodología rigurosa.
        </p>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Maestría Estándar</h3>
            <div className="pricing-price">Desde <strong>$270/página</strong></div>
            <ul>
              <li>80-100 páginas</li>
              <li>Precio: $21,600 - $27,000 MXN</li>
              <li>Entrega: 4-6 semanas</li>
              <li>Investigador con doctorado</li>
              <li>Pago en 3, 6 o 9 meses</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card">Cotizar Estándar</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Más Popular</div>
            <h3>Maestría Completa</h3>
            <div className="pricing-price">Desde <strong>$270/página</strong></div>
            <ul>
              <li>100-150 páginas</li>
              <li>Precio: $27,000 - $40,500 MXN</li>
              <li>Entrega: 4-6 semanas</li>
              <li>Doctor especialista</li>
              <li>Pago flexible</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card">Cotizar Completa</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Salud y Exactas</h3>
            <div className="pricing-price">Desde <strong>$300/página</strong></div>
            <ul>
              <li>Medicina, Ingeniería, Ciencias, Matemáticas</li>
              <li>Doctor especialista en el área</li>
              <li>Entrega: 4-6 semanas</li>
              <li>Nivel publicable</li>
              <li>Pago flexible</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card">Cotizar Publicable</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="landing-section landing-section-alt" id="testimonios">
        <h2>Lo que dicen nuestros maestros titulados</h2>
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
        <h2>Preguntas frecuentes sobre tesis de maestría</h2>
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
        <h2>Titúlate hoy — Cotiza tu tesis de maestría gratis</h2>
        <p>Únete a los más de 680 maestros que ya se titularon con Tesipedia. Cotización sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big">
          <FaWhatsapp /> Cotizar Mi Tesis por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>
    </div>
  );
}

export default TesisMaestria;
