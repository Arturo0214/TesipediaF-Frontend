import { useEffect, useRef } from 'react';
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
      <p className="hs-trust-label">Estudiantes asesorados de</p>
      <div className="hs-trust-logos">
        {unis.map((u) => <span key={u} className="hs-trust-uni">{u}</span>)}
      </div>
    </section>
  );
}

/* ---- Cómo se hace tu tesis: historia animada por scroll ---- */
export function HowItWorks() {
  const steps = [
    { icon: <FaCommentDots />, tag: 'Empieza aquí', t: 'Cuéntanos tu proyecto', d: 'Escríbenos por WhatsApp con tu tema, nivel, número de páginas y fecha. En minutos te damos una cotización clara y sin compromiso.' },
    { icon: <FaUserTie />, t: 'Te asignamos a tu asesor', d: 'Un investigador con posgrado en tu área te acompaña. Acuerdan alcance, plan de trabajo y un esquema de pago a tu medida.' },
    { icon: <FaFileSignature />, t: 'Avanzas con nuestra guía, capítulo por capítulo', d: 'Trabajas cada capítulo con la asesoría de tu experto y revisamos tus avances en cada etapa. Pides ajustes cuando quieras y sigues todo en tiempo real desde tu cuenta.' },
    { icon: <FaGraduationCap />, tag: 'Y te titulas', t: 'Tesis lista y defensa', d: 'Tu tesis completa, original y con citación correcta, revisada hasta pulir cada detalle. Te preparamos para tu examen profesional.' },
  ];
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stepEls = () => el.querySelectorAll('.ps-step');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.style.setProperty('--p', '1');
      stepEls().forEach((n) => n.classList.add('is-on'));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      let p = (vh * 0.8 - rect.top) / (rect.height * 0.72);
      p = Math.max(0, Math.min(1, p));
      el.style.setProperty('--p', p.toFixed(3));
      const nodes = stepEls();
      const onCount = Math.round(p * nodes.length + 0.15);
      nodes.forEach((n, i) => n.classList.toggle('is-on', i < onCount));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hs-section ps-section" id="como-funciona">
      <div className="hs-head" data-aos="fade-up">
        <h2>Así te asesoramos en tu tesis, paso a paso</h2>
        <p>Te acompañamos en cada etapa — de la primera idea a tu examen profesional.</p>
      </div>
      <div className="ps" ref={ref}>
        <div className="ps-line"><span className="ps-line-fill" /></div>
        {steps.map((s, i) => (
          <div className={`ps-step ${i % 2 ? 'ps-right' : 'ps-left'}`} key={i}>
            <div className="ps-card">
              {s.tag && <span className="ps-tag">{s.tag}</span>}
              <span className="ps-ico">{s.icon}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
            <div className="ps-node"><span className="ps-node-num">{i + 1}</span></div>
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
    { icon: <FaComments />, t: 'Chat con tu asesor', d: 'Comunícate con quien te asesora y pide ajustes cuando quieras.' },
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
    { t: 'Asesoría Tesis de Licenciatura', price: '110', to: '/tesis-licenciatura', feats: ['50-120 páginas', 'Avances 3-4 semanas', 'Revisión de originalidad'] },
    { t: 'Asesoría Tesis de Maestría', price: '160', to: '/tesis-maestria', feats: ['80-150 páginas', 'Asesor con doctorado', 'Avances 4-6 semanas'], featured: true },
    { t: 'Asesoría Tesis de Doctorado', price: '210', to: '/tesis-doctoral', feats: ['120-250 páginas', 'Nivel publicable', 'Avances 6-8 semanas'] },
  ];
  return (
    <section className="hs-section hs-section-alt" id="precios">
      <div className="hs-head" data-aos="fade-up">
        <h2>Precios de asesoría transparentes por nivel</h2>
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
        <h2>Asesoría de tesis para tu universidad y carrera</h2>
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
        <p>Resolvemos las dudas más comunes sobre la asesoría de tesis con Tesipedia.</p>
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
    { icon: <FaFileAlt />, t: 'Asesoría integral', d: 'Te guiamos en tu tesis de inicio a fin: tema, marco teórico, metodología, resultados y conclusiones.' },
    { icon: <FaSearch />, t: 'Revisión de originalidad', d: 'Revisamos la originalidad de tu trabajo y te apoyamos a fortalecer citas y referencias.' },
    { icon: <FaRobot />, t: 'Asesoría 100% humana', d: 'Te asesoran investigadores con posgrado. Tu tesis la redactas tú, con nuestra guía: un trabajo original.' },
    { icon: <FaUserTie />, t: 'Asesoría personalizada', d: 'Un asesor dedicado te acompaña, resuelve dudas y te prepara para tu defensa.' },
    { icon: <FaShieldAlt />, t: 'Revisiones hasta pulir tu tesis', d: 'Te acompañamos con revisiones en cada etapa para que llegues seguro a tu examen profesional.' },
    { icon: <FaGraduationCap />, t: 'Hasta tu defensa', d: 'No terminamos en la última revisión: te apoyamos hasta que presentes tu examen.' },
  ];
  return (
    <section className="hs-section" id="por-que">
      <div className="hs-head" data-aos="fade-up">
        <h2>Por qué Tesipedia es la asesoría de tesis #1 en México</h2>
        <p>Todo lo que necesitas para hacer tu tesis y titularte, con acompañamiento real.</p>
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
    { name: 'Carlos', deg: 'Ing. Industrial · UNAM', lvl: 'Licenciatura', text: 'Llevaba meses sin avanzar. Con la asesoría del equipo saqué adelante mi tesis en 8 semanas, con la tranquilidad de que el trabajo era mío. Hasta conseguí una oferta de trabajo gracias a ella.' },
    { name: 'Ana', deg: 'Psicología · ITESM', lvl: 'Maestría', text: 'Dudaba al principio, pero desde la primera reunión sentí confianza. Mi asesora fue cercana, clara y profesional. Hoy ya tengo mi título en manos.' },
    { name: 'Roberto', deg: 'Administración · IBERO', lvl: 'Doctorado', text: 'Me guiaron para estructurar desde cero con argumentos sólidos. El seguimiento fue constante y superé las expectativas de mi comité.' },
    { name: 'María', deg: 'Derecho · UAM', lvl: 'Licenciatura', text: 'Trabajando y estudiando era imposible avanzar. Me acompañaron paso a paso entendiendo mis tiempos. En 3 meses estaba lista para titularme.' },
    { name: 'Antonio', deg: 'Ing. Mecánica · IPN', lvl: 'Licenciatura', text: 'Me preocupaba la originalidad. La revisión y la guía de mi asesor me dieron la certeza de que mi tesis era mía y única. Excelente experiencia.' },
    { name: 'Vanessa', deg: 'Economía · UNAM', lvl: 'Licenciatura', text: 'No solo entendieron mis necesidades; me guiaron con normas APA, redacción y análisis estadístico. Todo muy claro y profesional.' },
  ];
  return (
    <section className="hs-section hs-section-alt" id="casos-exito">
      <div className="hs-head" data-aos="fade-up">
        <h2>Estudiantes que ya se titularon con nuestra asesoría</h2>
        <p>Historias reales de quienes confiaron en la asesoría de Tesipedia para lograr su título.</p>
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
          <h2>Ahorra 10% al pagar tu asesoría por transferencia o efectivo</h2>
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
        <h2>Hacer tesis en México — la asesoría #1 del país</h2>
        <p>
          <strong>¿Necesitas hacer tu tesis?</strong> En Tesipedia somos la asesoría líder en México para
          hacer tesis de licenciatura, maestría y doctorado. Con más de 3,000 estudiantes asesorados,
          te acompañamos para que termines tu tesis con la calidad que tu universidad exige.
        </p>
        <p>
          Nuestro equipo de más de 50 asesores expertos cubre todas las áreas: derecho, administración, ingeniería,
          psicología, educación, medicina, contaduría, arquitectura, ciencias sociales y más. Asesoramos a
          estudiantes de la <Link to="/tesis-unam">UNAM</Link>, <Link to="/tesis-ipn">IPN</Link>,
          {' '}<Link to="/tesis-tec-monterrey">Tec de Monterrey</Link>, <Link to="/tesis-uam">UAM</Link>,
          {' '}<Link to="/tesis-uanl">UANL</Link>, <Link to="/tesis-udg">UdeG</Link> y todas las universidades
          públicas y privadas de México.
        </p>
        <p>
          A diferencia de otros servicios, tu tesis es <strong>100% tuya</strong>: la redactas con la guía de
          investigadores humanos y te apoyamos con revisión de originalidad. No usamos plantillas ni reciclamos
          trabajos: tu tesis se construye desde cero siguiendo los lineamientos de tu universidad. Ofrecemos asesoría
          integral, acompañamiento y <Link to="/cuanto-cuesta-una-tesis">revisión</Link>, con precios transparentes
          desde $110 por página y planes de pago flexibles.
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
        <h2>Titúlate este año — cotiza tu asesoría gratis</h2>
        <p>Únete a los más de 3,000 estudiantes que ya se titularon con la asesoría de Tesipedia. Respuesta en minutos, sin compromiso.</p>
        <a href={WA} target="_blank" rel="noopener noreferrer" className="hs-btn hs-btn-primary hs-btn-lg" data-track-cta="home_final_whatsapp">
          <FaWhatsapp /> Cotizar mi tesis por WhatsApp
        </a>
        <p className="hs-final-sub">o llámanos: <a href="tel:+525670071517">+52 56 7007 1517</a></p>
      </div>
    </section>
  );
}
