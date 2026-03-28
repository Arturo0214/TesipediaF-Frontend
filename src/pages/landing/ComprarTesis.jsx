import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { trackVisit } from '../../features/visits/visitsSlice';
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

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Servicio de Elaboración de Tesis — Tesipedia",
    "description": "Compra tu tesis en México con Tesipedia. Servicio profesional de elaboración de tesis de licenciatura, maestría y doctorado. 100% original, libre de plagio e IA.",
    "brand": { "@type": "Brand", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "3247", "bestRating": "5", "worstRating": "1" },
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "5500", "highPrice": "87500", "offerCount": "3" },
    "review": [
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "María G." },
        "datePublished": "2025-11-15",
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "Mi tesis quedó increíble. La entregaron antes de tiempo y pasó Turnitin sin problema."
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Carlos R." },
        "datePublished": "2025-10-20",
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "Llevaba 2 años atorado con mi tesis de maestría. Con Tesipedia me titulé en 6 semanas."
      }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Comprar Tesis en México — Servicio Profesional de Elaboración",
    "serviceType": "Elaboración de Tesis Profesional",
    "provider": { "@type": "ProfessionalService", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "areaServed": { "@type": "Country", "name": "México" },
    "description": "Servicio profesional para comprar tu tesis en México. Elaboramos tesis de licenciatura, maestría y doctorado 100% originales. Verificadas con Turnitin y escáner anti-IA. Más de 3,000 estudiantes titulados.",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "110", "highPrice": "250", "unitText": "por página" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta comprar una tesis en México?",
        "acceptedAnswer": { "@type": "Answer", "text": "El precio de comprar una tesis en México varía según el nivel académico, área de estudio y número de páginas. Para licenciatura: desde $5,500 MXN (50 páginas a $110/pág). Para maestría: desde $12,800 MXN (80 páginas a $160/pág). Para doctorado: desde $25,200 MXN (120 páginas a $210/pág). Las áreas de salud y ciencias exactas tienen un costo ligeramente mayor. En Tesipedia ofrecemos los precios más bajos del mercado, cotización gratuita y planes de pago." }
      },
      {
        "@type": "Question",
        "name": "¿Es seguro comprar una tesis en Tesipedia?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Tesipedia es el servicio más confiable de México con más de 3,000 estudiantes titulados y 98% de aprobación. Cada tesis se elabora desde cero por investigadores humanos con maestría y doctorado. Incluimos verificación Turnitin y escáner anti-IA." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo tardan en entregar la tesis?",
        "acceptedAnswer": { "@type": "Answer", "text": "El tiempo estándar de entrega es de 3 a 4 semanas para licenciatura, 4 a 6 semanas para maestría y 6 a 8 semanas para doctorado. También ofrecemos servicio express para entregas urgentes." }
      },
      {
        "@type": "Question",
        "name": "¿La tesis pasa los detectores de plagio y de IA?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Todas las tesis de Tesipedia son escritas por investigadores humanos (no IA). Verificamos con Turnitin y escáneres anti-IA antes de entregar. Nuestras tesis pasan todos los sistemas de detección de las universidades mexicanas." }
      },
      {
        "@type": "Question",
        "name": "¿Hacen tesis para cualquier carrera y universidad?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Elaboramos tesis para todas las carreras y universidades de México: UNAM, IPN, UAM, BUAP, UDG, UANL, TEC, universidades privadas y más. Contamos con asesores especializados en todas las áreas del conocimiento." }
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

  const testimonials = [
    { name: 'María G.', carrera: 'Lic. en Derecho, UNAM', text: 'Mi tesis quedó increíble. La entregaron antes de tiempo y pasó Turnitin sin problema. 100% recomendado.', rating: 5 },
    { name: 'Carlos R.', carrera: 'Maestría en Administración, IPN', text: 'Llevaba 2 años atorado con mi tesis de maestría. Con Tesipedia me titulé en 6 semanas. Excelente servicio.', rating: 5 },
    { name: 'Ana L.', carrera: 'Lic. en Psicología, UAM', text: 'Los asesores son muy profesionales. Me explicaron todo el proceso y las correcciones fueron rápidas. Mi sinodal quedó impresionado.', rating: 5 },
  ];

  return (
    <div className="landing-page">
      <Helmet>
        <title>Comprar Tesis en México 2026 — Desde $110/Página | Tesipedia #1 en Tesis Profesionales</title>
        <meta name="description" content="Compra tu tesis profesional en México desde $110 por página. Tesis de licenciatura, maestría y doctorado 100% originales. Verificadas con Turnitin y anti-IA. Más de 3,000 titulados. Entrega en 3 semanas. Cotiza gratis por WhatsApp." />
        <meta name="keywords" content="comprar tesis, comprar tesis en México, comprar tesis México, tesis por encargo México, hacer tesis, tesis profesional, tesis 100% original, tesis sin plagio, tesis licenciatura, tesis maestría, tesis doctorado, tesipedia, elaboración de tesis, encargar tesis, quién me hace mi tesis" />
        <link rel="canonical" href="https://tesipedia.com/comprar-tesis" />
        <meta property="og:title" content="Comprar Tesis en México 2026 — Desde $110/Página | Tesipedia" />
        <meta property="og:description" content="Compra tu tesis profesional en México. Desde $110/página. 100% original, Turnitin + anti-IA. +3,000 titulados. Cotiza gratis." />
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
            <FaStar className="star-icon" /> 4.9/5 — Más de 3,000 estudiantes titulados
          </div>
          <h1>Comprar Tesis en México — Desde $110 por Página, Original y Sin Plagio</h1>
          <p className="landing-hero-sub">
            En <strong>Tesipedia</strong> puedes <strong>comprar tu tesis de licenciatura, maestría y doctorado</strong> desde <strong>$110 MXN por página</strong>. Escrita por investigadores humanos, verificada con <strong>Turnitin</strong> y escáner <strong>anti-IA</strong>. Más de 3,000 estudiantes titulados en México.
          </p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary">
              <FaWhatsapp /> Cotizar Gratis por WhatsApp
            </a>
            <a href="#como-funciona" className="landing-cta-secondary">
              ¿Cómo funciona? <FaArrowRight />
            </a>
          </div>
          <div className="landing-hero-trust">
            <span><FaCheckCircle /> 100% Original</span>
            <span><FaShieldAlt /> Verificada con Turnitin</span>
            <span><FaUserGraduate /> +3,000 Titulados</span>
          </div>
        </div>
      </section>

      {/* POR QUÉ COMPRAR TU TESIS CON NOSOTROS */}
      <section className="landing-section" id="por-que-tesipedia">
        <h2>¿Por qué comprar tu tesis en Tesipedia?</h2>
        <p className="landing-section-intro">
          Somos el servicio de elaboración de tesis más confiable de México. A diferencia de otros servicios, en Tesipedia cada tesis es escrita por investigadores humanos con posgrado — nunca usamos inteligencia artificial. Ya sea que busques una <Link to="/tesis-licenciatura">tesis de licenciatura</Link>, <Link to="/tesis-maestria">tesis de maestría</Link> o <Link to="/tesis-doctoral">tesis doctoral</Link>, estás en el lugar correcto.
        </p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>100% Original — Sin Plagio ni IA</h3>
            <p>Cada tesis se elabora desde cero por investigadores con maestría y doctorado. Incluimos reporte Turnitin y certificado anti-IA.</p>
          </div>
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+3,000 Estudiantes Titulados</h3>
            <p>Más de 3,000 estudiantes de la UNAM, IPN, UAM, BUAP, UDG y más ya se titularon con nosotros. 98% de índice de aprobación.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Entrega en 3-4 Semanas</h3>
            <p>Recibe tu tesis completa en tiempo récord. Incluimos avances parciales y correcciones ilimitadas hasta la aprobación.</p>
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
        <h2>¿Cómo funciona comprar tu tesis?</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Cotiza gratis</h3>
            <p>Escríbenos por WhatsApp con los datos de tu tesis: carrera, nivel, número de páginas y fecha de entrega. Te enviamos cotización en minutos.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Recibe tu propuesta</h3>
            <p>Te asignamos un asesor especializado en tu área. Recibes una propuesta personalizada con alcance, precio y esquema de pago flexible.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Desarrollo y avances</h3>
            <p>Tu investigador elabora la tesis con avances semanales. Puedes revisar y solicitar ajustes en cada etapa del proceso.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">4</div>
            <h3>Entrega y aprobación</h3>
            <p>Recibes tu tesis completa con reporte Turnitin y certificado anti-IA. Incluimos correcciones de sinodales hasta la aprobación final.</p>
          </div>
        </div>
        <div className="landing-cta-center">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary">
            <FaWhatsapp /> Quiero Cotizar Mi Tesis
          </a>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="landing-section" id="precios">
        <h2>¿Cuánto cuesta comprar una tesis en México?</h2>
        <p className="landing-section-intro">
          El precio depende del nivel académico, número de páginas y tiempo de entrega.
          Ofrecemos los precios más competitivos del mercado con la mejor calidad.
        </p>
        <div className="landing-pricing-grid">
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Tesis de Licenciatura</h3>
            <div className="pricing-price">Desde <strong>$110/pág</strong></div>
            <div className="pricing-ref">~$5,500 MXN (50 págs)</div>
            <ul>
              <li>50-120 páginas</li>
              <li>Entrega: 3-4 semanas</li>
              <li>Incluye Turnitin + Anti-IA</li>
              <li>Correcciones de sinodales</li>
              <li>Áreas salud/exactas: $150/pág</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card">Cotizar Licenciatura</a>
          </div>
          <div className="landing-pricing-card landing-pricing-featured">
            <FaGraduationCap className="pricing-icon" />
            <div className="pricing-badge">Más Popular</div>
            <h3>Tesis de Maestría</h3>
            <div className="pricing-price">Desde <strong>$160/pág</strong></div>
            <div className="pricing-ref">~$12,800 MXN (80 págs)</div>
            <ul>
              <li>80-150 páginas</li>
              <li>Entrega: 4-6 semanas</li>
              <li>Investigador con doctorado</li>
              <li>Incluye Turnitin + Anti-IA</li>
              <li>Áreas salud/exactas: $200/pág</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card">Cotizar Maestría</a>
          </div>
          <div className="landing-pricing-card">
            <FaGraduationCap className="pricing-icon" />
            <h3>Tesis de Doctorado</h3>
            <div className="pricing-price">Desde <strong>$210/pág</strong></div>
            <div className="pricing-ref">~$25,200 MXN (120 págs)</div>
            <ul>
              <li>120-250 páginas</li>
              <li>Entrega: 6-8 semanas</li>
              <li>Investigador con doctorado</li>
              <li>Publicación indexada opcional</li>
              <li>Áreas salud/exactas: $250/pág</li>
            </ul>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-card">Cotizar Doctorado</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="landing-section landing-section-alt" id="testimonios">
        <h2>Lo que dicen nuestros estudiantes titulados</h2>
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
        <h2>Preguntas frecuentes sobre comprar tesis en México</h2>
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
        <h2>Titúlate hoy — Cotiza tu tesis gratis</h2>
        <p>Únete a los más de 3,000 estudiantes que ya se titularon con Tesipedia. Cotización sin compromiso en menos de 5 minutos.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big">
          <FaWhatsapp /> Cotizar Mi Tesis por WhatsApp
        </a>
        <p className="landing-final-sub">O llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </section>

      {/* INTERNAL LINKS SEO */}
      <section className="landing-section" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#1e3a5f', marginBottom: '1rem' }}>Servicios relacionados</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/tesis-licenciatura" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Tesis de Licenciatura desde $110/pág</Link>
            <Link to="/tesis-maestria" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Tesis de Maestría desde $160/pág</Link>
            <Link to="/tesis-doctoral" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Tesis Doctoral desde $210/pág</Link>
            <Link to="/preguntas-frecuentes" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Preguntas Frecuentes</Link>
            <Link to="/blog" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>Blog Académico</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ComprarTesis;
