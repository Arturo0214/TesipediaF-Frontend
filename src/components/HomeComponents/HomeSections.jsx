import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaWhatsapp, FaArrowRight, FaUserTie, FaMagic,
  FaGraduationCap, FaCheckCircle, FaPlus, FaBell, FaComments, FaFileDownload, FaChartLine,
  FaFileAlt, FaSearch, FaRobot, FaShieldAlt, FaQuoteLeft, FaStar, FaPercent,
  FaMoneyBillWave, FaCreditCard, FaUniversity, FaBookOpen,
} from 'react-icons/fa';
import './HomeSections.css';

const WA = 'https://wa.me/525670071517?text=Hola%2C%20quiero%20cotizar%20mi%20tesis';
const LOGO = 'https://res.cloudinary.com/dbowaer8j/image/upload/f_auto,q_auto,w_160/v1743713944/Tesipedia-logo_n1liaw.png';

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

/* ---- Cómo te asesoramos: stepper interactivo compacto ---- */
export function HowItWorks() {
  const steps = [
    { icon: <FaComments />, short: 'Cotiza', tag: 'Empieza aquí', t: 'Cuéntanos tu proyecto', d: 'Escríbenos por WhatsApp con tu tema, nivel, número de páginas y fecha. En minutos te damos una cotización clara y sin compromiso.' },
    { icon: <FaUserTie />, short: 'Tu asesor', t: 'Te asignamos a tu asesor', d: 'Un investigador con posgrado en tu área te acompaña. Acuerdan alcance, plan de trabajo y un esquema de pago a tu medida.' },
    { icon: <FaFileAlt />, short: 'Avanzas', t: 'Avanzas con nuestra guía, capítulo por capítulo', d: 'Trabajas cada capítulo con la asesoría de tu experto y revisamos tus avances en cada etapa. Sigues todo en tiempo real desde tu cuenta.' },
    { icon: <FaGraduationCap />, short: 'Te titulas', tag: 'Y te titulas', t: 'Tu tesis, lista para la defensa', d: 'Tu tesis completa, original y con citación correcta, revisada hasta pulir cada detalle. Te preparamos para tu examen profesional.' },
  ];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useRef(false);
  useEffect(() => { reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches; }, []);
  useEffect(() => {
    if (paused || reduce.current) return undefined;
    const t = setTimeout(() => setActive((a) => (a + 1) % steps.length), 3800);
    return () => clearTimeout(t);
  }, [active, paused, steps.length]);

  const s = steps[active];
  const pct = (active / (steps.length - 1)) * 100;

  return (
    <section className="hs-section hw2" id="como-funciona"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hw2-head">
        <span className="ds-label">El proceso</span>
        <h2 className="hw2-title">Así te asesoramos, de la primera idea a tu defensa</h2>
      </div>

      <div className="hw2-track" role="tablist" aria-label="Pasos del proceso">
        <div className="hw2-line"><span className="hw2-line-fill" style={{ width: `${pct}%` }} /></div>
        {steps.map((st, i) => (
          <button
            key={i} role="tab" aria-selected={i === active}
            className={`hw2-node ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`}
            onClick={() => setActive(i)}
          >
            <span className="hw2-node-dot">{i < active ? <FaCheckCircle /> : i + 1}</span>
            <span className="hw2-node-label">{st.short}</span>
          </button>
        ))}
      </div>

      <div className="hw2-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={active} className="hw2-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hw2-card-ico">{s.icon}</div>
            <div className="hw2-card-body">
              <div className="hw2-card-top">
                <span className="hw2-card-step">Paso {active + 1} de {steps.length}</span>
                {s.tag && <span className="hw2-card-tag">{s.tag}</span>}
              </div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---- Escáner INTERACTIVO: documento real + aplica mejoras y el % de IA baja en vivo ---- */
const SA_FINDINGS = [
  {
    id: 0, tag: 'Muletilla de IA', tone: 'warn', pts: 8,
    origInline: 'Es importante señalar que resulta fundamental mencionar que',
    fixInline: 'El estudio determina que',
    orig: '“Es importante señalar que resulta fundamental mencionar…”',
    sug: 'El estudio determina que…',
  },
  {
    id: 1, tag: 'Estructura simétrica', tone: 'warn', pts: 6,
    origInline: 'Por un lado se aplicó una encuesta, por otro lado se realizaron entrevistas y, por un lado, se revisaron documentos.',
    fixInline: 'Para triangular la información se combinaron encuestas, entrevistas y revisión documental.',
    orig: '“Por un lado… por otro lado… por un lado…”',
    sug: 'Fúndelo en una oración que fluya.',
  },
  {
    id: 2, tag: 'Ritmo uniforme (oración-punto)', tone: 'info', pts: 4,
    origInline: 'El instrumento fue un cuestionario. Tuvo 32 ítems. Se validó con expertos. Se aplicó en campo.',
    fixInline: 'El instrumento principal fue un cuestionario de 32 ítems, validado mediante juicio de expertos y aplicado durante el trabajo de campo.',
    orig: '“Oración corta. Oración corta. Oración corta.”',
    sug: 'Combina las frases cortas en un ritmo variado.',
  },
];
const SA_START = 18;

export function ScannerTeaser() {
  const ref = useRef(null);
  const [applied, setApplied] = useState([]);
  const [hover, setHover] = useState(null);
  const [phase, setPhase] = useState('edit'); // edit | report

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add('is-on'); io.disconnect(); } }), { threshold: 0.25 });
    io.observe(el); return () => io.disconnect();
  }, []);

  // Al aplicar TODAS las mejoras, tras 5s pasa a la portada del reporte (solo IA)
  useEffect(() => {
    if (applied.length === SA_FINDINGS.length && phase === 'edit') {
      const t = setTimeout(() => setPhase('report'), 5000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [applied.length, phase]);

  const reset = () => { setApplied([]); setPhase('edit'); };
  const SA_SECCIONES = ['Resumen', 'Introducción', 'Marco teórico', 'Metodología', 'Resultados', 'Conclusiones'];

  const isApplied = (id) => applied.includes(id);
  const score = SA_START - SA_FINDINGS.filter((f) => isApplied(f.id)).reduce((s, f) => s + f.pts, 0);
  const level = score === 0 ? 'original' : score >= 40 ? 'alto' : score >= 12 ? 'medio' : 'bajo';
  const levelClass = score === 0 ? 'is-bajo' : level === 'alto' ? 'is-alto' : level === 'medio' ? 'is-medio' : 'is-bajo';
  const pending = SA_FINDINGS.length - applied.length;
  const apply = (id) => setApplied((a) => (a.includes(id) ? a : [...a, id]));
  const Mark = ({ id }) => {
    const f = SA_FINDINGS[id]; const done = isApplied(f.id);
    return (
      <mark
        className={`sa-mk ${done ? 'sa-mk-fixed' : `sa-mk-${f.tone}`} ${hover === id && !done ? 'sa-mk-hi' : ''}`}
        onMouseEnter={() => setHover(id)} onMouseLeave={() => setHover(null)}
        onClick={() => apply(id)} role="button" tabIndex={0}
        title={done ? 'Mejora aplicada' : 'Clic para aplicar la mejora'}
      >
        {done ? f.fixInline : f.origInline}
      </mark>
    );
  };

  const metrics = [
    { t: 'Ritmo y variación de oraciones', v: 14 },
    { t: 'Muletillas típicas de IA', v: 9 },
    { t: 'Estructuras repetidas', v: 18 },
    { t: 'Diversidad de vocabulario', v: 82, invert: true },
    { t: 'Coherencia y citación', v: 91, invert: true },
  ];

  return (
    <section className="st-section ds-paper" id="detector-ia" ref={ref}>
      <div className="st-head">
        <span className="ds-label">Detector de IA · gratis · interactivo</span>
        <h2 className="st-title">Detecta cuánta IA hay en tu tesis <span className="st-em">y cómo reducirla</span></h2>
        <p className="st-lead">Sube tu borrador y en segundos medimos el <strong>porcentaje de IA</strong>, oración por oración. Aplica las mejoras aquí abajo y <strong>mira cómo baja el porcentaje</strong> en vivo.</p>
      </div>

      <div className="st-grid">
        {/* ===== analizador INTERACTIVO ===== */}
        <div className="sa">
          <div className="sa-win">
            <div className="sa-bar">
              <span className="sa-dots"><i /><i /><i /></span>
              <span className="sa-file"><FaFileAlt /> tu-tesis-capitulo-3.docx</span>
              <span className={`sa-verdict ${levelClass}`}>
                <span className="sa-verdict-dot" /> {score}% IA · {score === 0 ? 'original ✓' : `nivel ${level}`}
              </span>
            </div>

            {phase === 'report' ? (
              /* ===== PANTALLA 2: portada del reporte (solo IA) ===== */
              <div className="sa-report">
                <div className="sa-rep-hero">
                  <div className="sa-rep-ring"><b>0%</b><span>IA</span></div>
                  <div className="sa-rep-hero-txt">
                    <h4>Redacción original ✓</h4>
                    <p>Sin señales de escritura automática. Tu tesis suena 100% tuya.</p>
                  </div>
                </div>
                <div className="sa-rep-sections">
                  <div className="sa-rep-shead">IA detectada por sección</div>
                  {SA_SECCIONES.map((s, i) => (
                    <div className="sa-rep-row" key={s} style={{ '--i': i }}>
                      <span className="sa-rep-name">{s}</span>
                      <div className="sa-rep-bar"><i /></div>
                      <span className="sa-rep-pct"><FaCheckCircle /> 0%</span>
                    </div>
                  ))}
                </div>
                <div className="sa-foot">
                  <span className="sa-foot-l"><span className="sa-foot-dot" /> Reporte listo · <b>0% de IA</b> en todo el documento</span>
                  <button type="button" className="sa-foot-r" onClick={reset}>Analizar de nuevo <FaArrowRight /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="sa-body">
                  {/* documento REAL — clic en lo resaltado para aplicar la mejora */}
                  <div className="sa-doc">
                    <div className="sa-doc-tag">Sección detectada</div>
                    <h4 className="sa-doc-h">3. Metodología</h4>
                    <p className="sa-p">
                      La presente investigación adopta un enfoque cuantitativo de alcance descriptivo.{' '}
                      <Mark id={0} /> el diseño fue no experimental y de corte transversal. La población se
                      conformó por 240 estudiantes de licenciatura, de la que se obtuvo una muestra
                      probabilística de 148 participantes.
                    </p>
                    <p className="sa-p">
                      <Mark id={1} /> <Mark id={2} /> Finalmente, se aplicaron pruebas de correlación
                      para contrastar las hipótesis planteadas.
                    </p>
                    <div className="sa-scan" />
                  </div>

                  {/* hallazgos interactivos */}
                  <div className="sa-findings">
                    <div className="sa-find-head">
                      Hallazgos <b>{pending}</b> <span>· {applied.length ? `${applied.length} aplicado${applied.length > 1 ? 's' : ''}` : 'oración por oración'}</span>
                    </div>
                    {SA_FINDINGS.map((f) => {
                      const done = isApplied(f.id);
                      return (
                        <div
                          className={`sa-card sa-card-${f.tone} ${done ? 'sa-card-done' : ''}`}
                          key={f.id} style={{ '--i': f.id }}
                          onMouseEnter={() => setHover(f.id)} onMouseLeave={() => setHover(null)}
                        >
                          <span className={`sa-cardtag sa-cardtag-${f.tone}`}>{f.tag}</span>
                          <p className="sa-orig">{f.orig}</p>
                          <p className="sa-sug"><FaMagic /> {f.sug}</p>
                          <div className="sa-cardfoot">
                            <button type="button" className="sa-apply" onClick={() => apply(f.id)} disabled={done}>
                              <FaCheckCircle /> {done ? 'Aplicado' : 'Aplicar'}
                            </button>
                            <span className="sa-pts">−{f.pts}% IA</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="sa-foot">
                  <span className="sa-foot-l">
                    <span className="sa-foot-dot" />
                    {pending === 0
                      ? <> ¡Listo! · <b>{score}% de IA</b> · preparando reporte…</>
                      : <> Análisis completo · <b>{score}% de IA detectada</b> · {pending} mejora{pending > 1 ? 's' : ''} por aplicar</>}
                  </span>
                  {pending > 0 && (
                    <button type="button" className="sa-foot-r" onClick={() => setApplied(SA_FINDINGS.map((f) => f.id))}>
                      Aplicar todo <FaArrowRight />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===== qué analiza + CTA ===== */}
        <div className="st-text-col">
          <h3 className="st-sub">Qué revisamos en tu texto</h3>
          <div className="st-metrics">
            {metrics.map((m, i) => (
              <div className="st-metric" key={i} style={{ '--i': i }}>
                <div className="st-metric-top"><span>{m.t}</span><b>{m.invert ? `${m.v}% ✓` : `${m.v}%`}</b></div>
                <div className="st-meter"><i style={{ '--w': `${m.invert ? m.v : Math.max(12, 100 - m.v)}%` }} /></div>
              </div>
            ))}
          </div>
          <Link to="/detector-ia-tesis" className="ds-cta st-cta" data-track-cta="scanner_teaser">
            <FaSearch /> Prueba el detector con tu tesis
          </Link>
          <p className="st-note">Sin registro · Tu documento es confidencial y no se comparte.</p>
        </div>
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

/* ---- Niveles + precios (con psicología de venta + precio del escáner) ---- */
export function LevelsPricing() {
  const levels = [
    { t: 'Maestría', price: '160', anchor: '210', to: '/tesis-maestria', best: 'Ideal para posgrado', feats: ['80-150 páginas', 'Asesor con doctorado', 'Avances en 4-6 semanas', 'Preparación de defensa'] },
    { t: 'Licenciatura', price: '110', anchor: '150', to: '/tesis-licenciatura', best: 'El más elegido', feats: ['50-120 páginas', 'Avances en 3-4 semanas', 'Revisión de originalidad', 'Asesor especializado'], featured: true },
    { t: 'Doctorado', price: '210', anchor: '280', to: '/tesis-doctoral', best: 'Nivel publicable', feats: ['120-250 páginas', 'Rigor para publicación', 'Avances en 6-8 semanas', 'Acompañamiento a sínodo'] },
  ];
  const prc = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const prcCard = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
  return (
    <section className="hs-section hs-section-alt pr2" id="precios">
      <div className="hs-head" data-aos="fade-up">
        <span className="ds-label">Precios transparentes</span>
        <h2 className="pr2-title">Invierte en titularte, <span className="pr2-em">no en repetir</span></h2>
        <p>Desde $110 por página, sin costos ocultos. Cotización gratis y pagos en parcialidades.</p>
      </div>

      {/* franja del escáner (precio del detector) */}
      <div className="pr2-scan" data-aos="fade-up">
        <div className="pr2-scan-l">
          <span className="pr2-scan-ico"><FaSearch /></span>
          <div>
            <strong>Detector de IA para tu tesis</strong>
            <span>Análisis <b>gratis</b> · Reporte PDF profesional por secciones <b>$99 MXN</b></span>
          </div>
        </div>
        <Link to="/detector-ia-tesis" className="pr2-scan-cta" data-track-cta="pricing_scanner">Probar gratis <FaArrowRight /></Link>
      </div>

      <motion.div className="hs-levels" variants={prc} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-70px' }}>
        {levels.map((l, i) => (
          <motion.div className={`hs-level pr2-card ${l.featured ? 'is-featured' : ''}`} key={i} variants={prcCard}>
            {l.featured && <span className="hs-level-badge">★ El más elegido</span>}
            <span className="pr2-best">{l.best}</span>
            <h3>Asesoría de tesis · {l.t}</h3>
            <div className="pr2-price">
              <span className="pr2-anchor">${l.anchor}</span>
              <strong>${l.price}</strong><span className="pr2-unit">/página</span>
            </div>
            <span className="pr2-save">Precio de temporada</span>
            <ul>{l.feats.map((f, j) => <li key={j}><FaCheckCircle /> {f}</li>)}</ul>
            <div className="hs-level-ctas">
              <a href={WA} target="_blank" rel="noopener noreferrer" className="hs-btn hs-btn-primary" data-track-cta={`home_precio_${l.price}`}>
                <FaWhatsapp /> Cotizar mi asesoría
              </a>
              <Link to={l.to} className="hs-btn hs-btn-soft">Ver detalle <FaArrowRight /></Link>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* barra de confianza / reversión de riesgo */}
      <div className="pr2-trust" data-aos="fade-up">
        <span><FaCheckCircle /> Cotización gratis, sin compromiso</span>
        <span><FaShieldAlt /> Revisiones incluidas hasta pulir</span>
        <span><FaStar /> +3,000 estudiantes titulados</span>
        <span><FaGraduationCap /> Pagos en parcialidades</span>
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
    <section className="hs-section exp2" aria-label="Explora">
      <div className="hs-head">
        <span className="ds-label">Explora</span>
        <h2 className="exp2-title">Asesoría para tu universidad y carrera</h2>
        <p>Conocemos los requisitos de cada institución y área del conocimiento.</p>
      </div>
      <div className="exp2-grid">
        <div className="exp2-panel" data-aos="fade-up">
          <div className="exp2-panel-head"><span className="exp2-ico"><FaUniversity /></span><h3>Por universidad</h3></div>
          <div className="exp2-chips">
            {unis.map(([to, t]) => <Link key={to} to={to} className="exp2-chip">{t} <FaArrowRight /></Link>)}
          </div>
        </div>
        <div className="exp2-panel" data-aos="fade-up" data-aos-delay="80">
          <div className="exp2-panel-head"><span className="exp2-ico exp2-ico-b"><FaBookOpen /></span><h3>Por carrera</h3></div>
          <div className="exp2-chips">
            {cars.map(([to, t]) => <Link key={to} to={to} className="exp2-chip">Tesis de {t} <FaArrowRight /></Link>)}
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
    { icon: <FaRobot />, t: 'Asesoría 100% humana', d: 'Te asesoran investigadores con posgrado y te ayudamos a redactarla con tu propia voz: un trabajo original.' },
    { icon: <FaUserTie />, t: 'Asesoría personalizada', d: 'Un asesor dedicado te acompaña, resuelve dudas y te prepara para tu defensa.' },
    { icon: <FaShieldAlt />, t: 'Revisiones hasta pulir tu tesis', d: 'Te acompañamos con revisiones en cada etapa para que llegues seguro a tu examen profesional.' },
    { icon: <FaGraduationCap />, t: 'Hasta tu defensa', d: 'No terminamos en la última revisión: te apoyamos hasta que presentes tu examen.' },
  ];
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const card = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
  return (
    <section className="hs-section why2" id="por-que">
      <div className="why2-glow" aria-hidden="true" />
      <div className="hs-head">
        <span className="why2-logo"><img src={LOGO} alt="Tesipedia" width="120" height="34" loading="lazy" /></span>
        <span className="ds-label">Por qué Tesipedia</span>
        <h2 className="why2-title">La asesoría de tesis <span className="why2-em">#1 en México</span></h2>
        <p>Todo lo que necesitas para avanzar tu tesis y titularte, con acompañamiento real.</p>
      </div>
      <motion.div
        className="why2-grid"
        variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-70px' }}
      >
        {items.map((it, i) => (
          <motion.div className="why2-card" variants={card} key={i}>
            <span className="why2-ico">{it.icon}</span>
            <h3>{it.t}</h3>
            <p>{it.d}</p>
            <span className="why2-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="why2-accent" />
          </motion.div>
        ))}
      </motion.div>
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
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
  return (
    <section className="hs-section hs-section-alt st2" id="casos-exito">
      <div className="hs-head">
        <span className="ds-label">Historias reales</span>
        <h2 className="st2-title">Ya se titularon con nuestra asesoría</h2>
        <div className="st2-rating">
          <span className="st2-stars">{[...Array(5)].map((_, j) => <FaStar key={j} />)}</span>
          <strong>4.9/5</strong>
          <span className="st2-rating-sub">· +3,000 estudiantes titulados</span>
        </div>
      </div>
      <motion.div className="hs-stories" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
        {t.map((s, i) => (
          <motion.figure className="hs-story st2-card" key={i} variants={item}>
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
          </motion.figure>
        ))}
      </motion.div>
    </section>
  );
}

/* ---- Oferta (descuento por transferencia/efectivo) ---- */
export function SpecialOffer() {
  return (
    <section className="hs-offer off2" id="oferta">
      <div className="off2-card" data-aos="fade-up">
        <span className="off2-glow" aria-hidden="true" />
        <div className="off2-grid">
          <div className="off2-left">
            <span className="off2-badge"><FaPercent /> Oferta limitada del mes</span>
            <h2 className="off2-h">Titúlate y <span className="off2-em">ahorra 10%</span> en tu asesoría</h2>
            <p className="off2-sub">Paga tu asesoría por <strong>transferencia o efectivo</strong> y obtén un 10% de descuento. Con planes de pago en <strong>parcialidades</strong> y cotización sin costo.</p>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="off2-cta" data-track-cta="home_oferta">
              <FaWhatsapp /> Quiero mi 10% de descuento <FaArrowRight />
            </a>
            <span className="off2-urg"><span className="off2-urg-dot" /> Cupos limitados este mes · respuesta en minutos, sin compromiso</span>
          </div>
          <div className="off2-right">
            <div className="off2-pay">
              <span className="off2-pay-ico"><FaMoneyBillWave /></span>
              <div className="off2-pay-txt"><strong>Transferencia</strong><span>SPEI · bancos</span></div>
              <b className="off2-pct">−10%</b>
            </div>
            <div className="off2-pay">
              <span className="off2-pay-ico"><FaCreditCard /></span>
              <div className="off2-pay-txt"><strong>Pago en efectivo</strong><span>OXXO · depósito</span></div>
              <b className="off2-pct">−10%</b>
            </div>
            <div className="off2-guar"><FaShieldAlt /> Cotización sin compromiso · revisiones incluidas</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Bloque SEO (texto rico en keywords) ---- */
export function SeoBlock() {
  return (
    <section className="hs-section hs-seoblock seo2">
      <div className="hs-seoblock-inner seo2-card" data-aos="fade-up">
        <div className="seo2-stats">
          <div className="seo2-stat"><strong>+3,000</strong><span>estudiantes asesorados</span></div>
          <div className="seo2-stat"><strong>50+</strong><span>asesores con posgrado</span></div>
          <div className="seo2-stat"><strong>4.9<i>★</i></strong><span>valoración promedio</span></div>
          <div className="seo2-stat"><strong>$110</strong><span>desde, por página</span></div>
        </div>
        <span className="ds-label">Asesoría de tesis en México</span>
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
        <h2>Titúlate este año con la asesoría de Tesipedia</h2>
        <p>Únete a los más de 3,000 estudiantes que ya se titularon con nosotros. Escríbenos y te atendemos en minutos, sin compromiso.</p>
        <a href={WA} target="_blank" rel="noopener noreferrer" className="hs-btn hs-btn-primary hs-btn-lg" data-track-cta="home_final_whatsapp">
          <FaWhatsapp /> Quiero atención por WhatsApp
        </a>
        <p className="hs-final-sub">Respuesta inmediata en horario de atención · Lun-Sáb 9:00-20:00</p>
      </div>
    </section>
  );
}
