import { Link } from 'react-router-dom';
import {
  FaWhatsapp, FaArrowRight, FaCommentDots, FaUserTie, FaFileSignature,
  FaGraduationCap, FaCheckCircle, FaPlus, FaBell, FaComments, FaFileDownload, FaChartLine,
  FaFileAlt, FaSearch, FaRobot, FaShieldAlt, FaQuoteLeft, FaStar, FaPercent,
  FaMoneyBillWave, FaCreditCard,
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

/* ---- Seguimiento en tiempo real ---- */
export function RealTimeTracking() {
  const feats = [
    { icon: <FaChartLine />, t: 'Avance por capítulos', d: 'Ve el porcentaje de progreso de tu tesis y qué etapa se está trabajando.' },
    { icon: <FaFileDownload />, t: 'Descarga tus avances', d: 'Recibe y descarga cada entrega directamente desde tu cuenta.' },
    { icon: <FaComments />, t: 'Chat con tu asesor', d: 'Comunícate con quien hace tu tesis y pide ajustes cuando quieras.' },
    { icon: <FaBell />, t: 'Notificaciones', d: 'Te avisamos cada vez que hay un avance nuevo o una respuesta.' },
  ];
  const stages = [
    { t: 'Protocolo y marco teórico', done: true },
    { t: 'Metodología', done: true },
    { t: 'Resultados y análisis', live: true },
    { t: 'Conclusiones y formato', done: false },
  ];
  return (
    <section className="hs-section hs-realtime" id="seguimiento">
      <div className="hs-rt-grid">
        <div className="hs-rt-text" data-aos="fade-right">
          <span className="hs-rt-eyebrow"><FaChartLine /> Tu proyecto, siempre a la vista</span>
          <h2>Sigue tu tesis en tiempo real</h2>
          <p>
            Con tu cuenta de Tesipedia no te quedas en la incertidumbre: ves el avance de tu tesis
            <strong> en tiempo real</strong>, capítulo por capítulo, descargas cada entrega y hablas
            con tu asesor cuando lo necesites. Total transparencia, de principio a fin.
          </p>
          <div className="hs-rt-feats">
            {feats.map((f, i) => (
              <div className="hs-rt-feat" key={i}>
                <span className="hs-rt-feat-ico">{f.icon}</span>
                <div><strong>{f.t}</strong><span>{f.d}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock del panel del cliente */}
        <div className="hs-rt-mock" data-aos="fade-left">
          <div className="hs-rt-mockcard">
            <div className="hs-rt-mockhead">
              <span className="hs-rt-dot" /><span className="hs-rt-dot" /><span className="hs-rt-dot" />
              <span className="hs-rt-mocktitle">Mi proyecto · Tesis de Licenciatura</span>
            </div>
            <div className="hs-rt-mockbody">
              <div className="hs-rt-progresshead">
                <span>Progreso de tu tesis</span><strong>65%</strong>
              </div>
              <div className="hs-rt-bar"><span style={{ width: '65%' }} /></div>
              <div className="hs-rt-live"><span className="hs-rt-pulse" /> En tiempo real · actualizado hoy</div>
              <ul className="hs-rt-stages">
                {stages.map((s, i) => (
                  <li key={i} className={s.done ? 'is-done' : s.live ? 'is-live' : ''}>
                    <span className="hs-rt-check">{s.done ? <FaCheckCircle /> : s.live ? <span className="hs-rt-pulse" /> : <span className="hs-rt-circle" />}</span>
                    {s.t}
                    {s.live && <em>en proceso</em>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
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

/* ---- Por qué Tesipedia (diferenciadores) ---- */
export function WhyTesipedia() {
  const items = [
    { icon: <FaFileAlt />, t: 'Desarrollo completo', d: 'Tu tesis de inicio a fin: tema, marco teórico, metodología, resultados y conclusiones.' },
    { icon: <FaSearch />, t: 'Anti-plagio Turnitin', d: 'Cada trabajo pasa por Turnitin. Recibes tu reporte de originalidad como respaldo.' },
    { icon: <FaRobot />, t: '100% humano, sin IA', d: 'Escrito por investigadores con posgrado. Pasa los detectores de IA más exigentes.' },
    { icon: <FaUserTie />, t: 'Asesoría personalizada', d: 'Un asesor dedicado te acompaña, resuelve dudas y te prepara para tu defensa.' },
    { icon: <FaShieldAlt />, t: 'Garantía de aprobación', d: 'Correcciones ilimitadas hasta que tu asesor y sinodales aprueben tu tesis.' },
    { icon: <FaGraduationCap />, t: 'Hasta titularte', d: 'No terminamos en la entrega: te apoyamos hasta que tengas tu título en mano.' },
  ];
  return (
    <section className="hs-section" id="por-que">
      <div className="hs-head" data-aos="fade-up">
        <h2>Por qué Tesipedia es el servicio #1 en México</h2>
        <p>Todo lo que necesitas para hacer tu tesis y titularte, con respaldo real.</p>
      </div>
      <div className="hs-why">
        {items.map((it, i) => (
          <div className="hs-why-card" key={i} data-aos="fade-up" data-aos-delay={(i % 3) * 80}>
            <span className="hs-why-ico">{it.icon}</span>
            <h3>{it.t}</h3>
            <p>{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---- Historias de éxito (testimonios) ---- */
export function SuccessStories() {
  const t = [
    { name: 'Carlos', deg: 'Ing. Industrial · UNAM', lvl: 'Licenciatura', text: 'Llevaba meses sin avanzar. Con el equipo terminé mi tesis en 8 semanas, con tranquilidad total por el escáner antiplagio. Hasta conseguí una oferta de trabajo gracias a ella.' },
    { name: 'Ana', deg: 'Psicología · ITESM', lvl: 'Maestría', text: 'Dudaba al principio, pero desde la primera reunión sentí confianza. Mi asesora fue cercana, clara y profesional. Hoy ya tengo mi título en manos.' },
    { name: 'Roberto', deg: 'Administración · IBERO', lvl: 'Doctorado', text: 'Me ayudaron a estructurar desde cero con argumentos sólidos. El seguimiento fue constante y superé las expectativas de mi comité.' },
    { name: 'María', deg: 'Derecho · UAM', lvl: 'Licenciatura', text: 'Trabajando y estudiando era imposible avanzar. Me apoyaron paso a paso entendiendo mis tiempos. En 3 meses estaba lista para titularme.' },
    { name: 'Antonio', deg: 'Ing. Mecánica · IPN', lvl: 'Licenciatura', text: 'Me preocupaba la originalidad. El escáner anti-IA y antiplagio me dieron la certeza de que mi tesis era mía y única. Excelente experiencia.' },
    { name: 'Vanessa', deg: 'Economía · UNAM', lvl: 'Licenciatura', text: 'No solo entendieron mis necesidades; me apoyaron con normas APA, redacción y análisis estadístico. Todo muy claro y profesional.' },
  ];
  return (
    <section className="hs-section hs-section-alt" id="casos-exito">
      <div className="hs-head" data-aos="fade-up">
        <h2>Estudiantes que ya se titularon con nosotros</h2>
        <p>Historias reales de quienes confiaron en Tesipedia para lograr su título.</p>
      </div>
      <div className="hs-stories">
        {t.map((s, i) => (
          <figure className="hs-story" key={i} data-aos="fade-up" data-aos-delay={(i % 3) * 80}>
            <div className="hs-story-stars">{[...Array(5)].map((_, j) => <FaStar key={j} />)}</div>
            <FaQuoteLeft className="hs-story-quote" />
            <blockquote>{s.text}</blockquote>
            <figcaption>
              <span className="hs-story-avatar">{s.name[0]}</span>
              <span>
                <strong>{s.name}</strong>
                <span>{s.deg}</span>
              </span>
              <span className="hs-story-lvl">{s.lvl}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ---- Oferta (descuento por transferencia/efectivo) ---- */
export function SpecialOffer() {
  return (
    <section className="hs-offer" id="oferta">
      <div className="hs-offer-inner" data-aos="fade-up">
        <div className="hs-offer-left">
          <span className="hs-offer-tag"><FaPercent /> 10% de descuento</span>
          <h2>Ahorra 10% al pagar tu tesis por transferencia o efectivo</h2>
          <p>Incluye asesoría inicial gratuita y planes de pago en parcialidades.</p>
        </div>
        <div className="hs-offer-right">
          <div className="hs-offer-pay"><FaMoneyBillWave /> Transferencia <span>−10%</span></div>
          <div className="hs-offer-pay"><FaCreditCard /> Pago en efectivo <span>−10%</span></div>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="hs-btn hs-btn-primary" data-track-cta="home_oferta">
            <FaWhatsapp /> Solicitar cotización
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---- Bloque SEO (texto rico en keywords) ---- */
export function SeoBlock() {
  return (
    <section className="hs-section hs-seoblock">
      <div className="hs-seoblock-inner" data-aos="fade-up">
        <h2>Hacer tesis en México — el servicio #1 del país</h2>
        <p>
          <strong>¿Necesitas hacer tu tesis?</strong> En Tesipedia somos el servicio líder en México para hacer
          tesis de licenciatura, maestría y doctorado. Con más de 3,000 estudiantes titulados y un 98% de
          aprobación, te hacemos tu tesis con la calidad que tu universidad exige.
        </p>
        <p>
          Nuestro equipo de más de 50 asesores expertos cubre todas las áreas: derecho, administración, ingeniería,
          psicología, educación, medicina, contaduría, arquitectura, ciencias sociales y más. Hacemos tesis para
          estudiantes de la <Link to="/tesis-unam">UNAM</Link>, <Link to="/tesis-ipn">IPN</Link>,
          {' '}<Link to="/tesis-tec-monterrey">Tec de Monterrey</Link>, <Link to="/tesis-uam">UAM</Link>,
          {' '}<Link to="/tesis-uanl">UANL</Link>, <Link to="/tesis-udg">UdeG</Link> y todas las universidades
          públicas y privadas de México.
        </p>
        <p>
          A diferencia de otros servicios, cada tesis es <strong>100% original</strong>, elaborada por investigadores
          humanos y verificada con Turnitin y escáner anti-IA. No usamos plantillas ni reciclamos trabajos: tu tesis
          se desarrolla desde cero siguiendo los lineamientos de tu universidad. Ofrecemos desarrollo completo,
          acompañamiento y <Link to="/cuanto-cuesta-una-tesis">corrección</Link>, con precios transparentes desde
          $110 por página y planes de pago flexibles.
        </p>
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
