import { Link } from 'react-router-dom';
import {
  FaWhatsapp, FaArrowRight, FaCommentDots, FaUserTie, FaFileSignature,
  FaGraduationCap, FaCheckCircle, FaPlus,
} from 'react-icons/fa';
import './HomeSections.css';

const WA = 'https://wa.me/525670071517?text=Hola%2C%20quiero%20cotizar%20mi%20tesis';

/* ---- Barra de confianza: universidades ---- */
export function TrustBar() {
  const unis = ['UNAM', 'IPN', 'UAM', 'Tec de Monterrey', 'UANL', 'BUAP', 'UdeG', 'UV'];
  return (
    <section className="hs-trust" aria-label="Universidades">
      <p className="hs-trust-label">Estudiantes titulados de</p>
      <div className="hs-trust-logos">
        {unis.map((u) => <span key={u} className="hs-trust-uni">{u}</span>)}
      </div>
    </section>
  );
}

/* ---- Cómo funciona (4 pasos) ---- */
export function HowItWorks() {
  const steps = [
    { icon: <FaCommentDots />, t: 'Cotiza gratis', d: 'Escríbenos por WhatsApp con tu tema, nivel, páginas y fecha. Te cotizamos en minutos.' },
    { icon: <FaUserTie />, t: 'Asesor especializado', d: 'Te asignamos un investigador con posgrado en tu área y un plan de pago flexible.' },
    { icon: <FaFileSignature />, t: 'Avances y revisiones', d: 'Recibes la tesis por capítulos y pides ajustes en cada etapa del proceso.' },
    { icon: <FaGraduationCap />, t: 'Entrega y titulación', d: 'Tesis completa, original y citada, con correcciones hasta la aprobación de tu asesor.' },
  ];
  return (
    <section className="hs-section" id="como-funciona">
      <div className="hs-head" data-aos="fade-up">
        <h2>Cómo hacemos tu tesis en 4 pasos</h2>
        <p>Un proceso claro y acompañado, de la primera idea a tu examen profesional.</p>
      </div>
      <div className="hs-steps">
        {steps.map((s, i) => (
          <div className="hs-step" key={i} data-aos="fade-up" data-aos-delay={i * 80}>
            <div className="hs-step-num">{i + 1}</div>
            <div className="hs-step-ico">{s.icon}</div>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---- Niveles + precios (enlazan a landings) ---- */
export function LevelsPricing() {
  const levels = [
    { t: 'Tesis de Licenciatura', price: '110', to: '/tesis-licenciatura', feats: ['50-120 páginas', 'Entrega 3-4 semanas', 'Revisión de originalidad'] },
    { t: 'Tesis de Maestría', price: '160', to: '/tesis-maestria', feats: ['80-150 páginas', 'Investigador con doctorado', 'Entrega 4-6 semanas'], featured: true },
    { t: 'Tesis de Doctorado', price: '210', to: '/tesis-doctoral', feats: ['120-250 páginas', 'Nivel publicable', 'Entrega 6-8 semanas'] },
  ];
  return (
    <section className="hs-section hs-section-alt" id="precios">
      <div className="hs-head" data-aos="fade-up">
        <h2>Precios transparentes por nivel</h2>
        <p>Desde $110 por página, sin costos ocultos. Cotización gratuita y planes de pago.</p>
      </div>
      <div className="hs-levels">
        {levels.map((l, i) => (
          <div className={`hs-level ${l.featured ? 'is-featured' : ''}`} key={i} data-aos="fade-up" data-aos-delay={i * 80}>
            {l.featured && <span className="hs-level-badge">Más popular</span>}
            <FaGraduationCap className="hs-level-ico" />
            <h3>{l.t}</h3>
            <div className="hs-level-price">desde <strong>${l.price}</strong><span>/página</span></div>
            <ul>{l.feats.map((f, j) => <li key={j}><FaCheckCircle /> {f}</li>)}</ul>
            <div className="hs-level-ctas">
              <a href={WA} target="_blank" rel="noopener noreferrer" className="hs-btn hs-btn-primary" data-track-cta={`home_precio_${l.price}`}>
                <FaWhatsapp /> Cotizar
              </a>
              <Link to={l.to} className="hs-btn hs-btn-soft">Ver detalle <FaArrowRight /></Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---- Explora por universidad y carrera (enlazado interno SEO) ---- */
export function ExploreLinks() {
  const unis = [
    ['/tesis-unam', 'Tesis UNAM'], ['/tesis-ipn', 'Tesis IPN'], ['/tesis-uam', 'Tesis UAM'],
    ['/tesis-tec-monterrey', 'Tesis Tec'], ['/tesis-uanl', 'Tesis UANL'], ['/tesis-udg', 'Tesis UdeG'],
  ];
  const cars = [
    ['/tesis-de-derecho', 'Derecho'], ['/tesis-de-psicologia', 'Psicología'], ['/tesis-de-administracion', 'Administración'],
    ['/tesis-de-contaduria', 'Contaduría'], ['/tesis-de-enfermeria', 'Enfermería'], ['/tesis-de-medicina', 'Medicina'],
  ];
  return (
    <section className="hs-section" aria-label="Explora">
      <div className="hs-head" data-aos="fade-up">
        <h2>Tesis para tu universidad y carrera</h2>
        <p>Conocemos los requisitos de cada institución y área del conocimiento.</p>
      </div>
      <div className="hs-explore">
        <div data-aos="fade-up">
          <h3>Por universidad</h3>
          <div className="hs-explore-links">
            {unis.map(([to, t]) => <Link key={to} to={to} className="hs-link">{t}</Link>)}
          </div>
        </div>
        <div data-aos="fade-up" data-aos-delay="80">
          <h3>Por carrera</h3>
          <div className="hs-explore-links">
            {cars.map(([to, t]) => <Link key={to} to={to} className="hs-link">Tesis de {t}</Link>)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- FAQ visible (alimenta el FAQPage schema ya existente) ---- */
export function HomeFAQ({ faqs = [] }) {
  return (
    <section className="hs-section hs-section-alt" id="preguntas-frecuentes">
      <div className="hs-head" data-aos="fade-up">
        <h2>Preguntas frecuentes</h2>
        <p>Resolvemos las dudas más comunes sobre hacer tu tesis con Tesipedia.</p>
      </div>
      <div className="hs-faq">
        {faqs.map((q, i) => (
          <details className="hs-faq-item" key={i} open={i === 0}>
            <summary><span>{q.name}</span><FaPlus className="hs-faq-plus" /></summary>
            <p>{q.acceptedAnswer.text}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ---- CTA final ---- */
export function FinalCTA() {
  return (
    <section className="hs-final">
      <div className="hs-final-inner" data-aos="fade-up">
        <h2>Titúlate este año — cotiza tu tesis gratis</h2>
        <p>Únete a los más de 3,000 estudiantes que ya se titularon con Tesipedia. Respuesta en minutos, sin compromiso.</p>
        <a href={WA} target="_blank" rel="noopener noreferrer" className="hs-btn hs-btn-primary hs-btn-lg" data-track-cta="home_final_whatsapp">
          <FaWhatsapp /> Cotizar mi tesis por WhatsApp
        </a>
        <p className="hs-final-sub">o llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </div>
    </section>
  );
}
