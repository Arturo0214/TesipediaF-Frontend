import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot, FaUserTie, FaShieldAlt, FaChartBar, FaGraduationCap,
  FaBookOpen, FaArrowRight, FaCheck, FaFileAlt, FaStar,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import { getGuia } from '../../../data/guias';
import './HeroCarousel.css';

const GUIA_COVER = getGuia('apa-7')?.pages?.[0]?.src || '';

const SLIDES = [
  {
    key: 'guias', tag: 'Guías descargables', accent: '#2563EB', icon: <FaBookOpen />,
    title: 'Guías académicas descargables',
    desc: 'Guías-taller en PDF para cada parte de la tesis: APA 7, planteamiento, metodología y defensa. Con muestra gratis.',
    cta: { label: 'Ver guías', to: '/guias', track: 'hero_carousel_guias' },
    visual: 'guides',
  },
  {
    key: 'detector', tag: 'Nuevo · Detector IA', accent: '#1D4ED8', icon: <FaRobot />,
    title: 'Detector de IA para tu tesis',
    desc: 'Medimos cuánta IA se detecta en tu texto, oración por oración, y te decimos cómo reducirla.',
    cta: { label: 'Probar el detector', to: '/detector-ia-tesis', track: 'hero_carousel_detector' },
    visual: 'scanner',
  },
  {
    key: 'asesoria', tag: 'Acompañamiento', accent: '#0EA5E9', icon: <FaUserTie />,
    title: 'Asesoría capítulo por capítulo',
    desc: 'Un investigador con posgrado te guía en cada etapa —del protocolo a la defensa— a tu ritmo.',
    visual: 'progress',
  },
  {
    key: 'original', tag: 'Incluido', accent: '#2563EB', icon: <FaShieldAlt />,
    title: 'Revisión de originalidad',
    desc: 'Cuidamos que tu trabajo sea 100% tuyo, bien citado y con la voz académica correcta.',
    visual: 'shield',
  },
  {
    key: 'datos', tag: 'Metodología', accent: '#1D4ED8', icon: <FaChartBar />,
    title: 'Análisis de datos y método',
    desc: 'SPSS, R y Excel: diseño de instrumentos, muestra e interpretación de resultados.',
    visual: 'bars',
  },
  {
    key: 'defensa', tag: 'Hasta el final', accent: '#2563EB', icon: <FaGraduationCap />,
    title: 'Preparación para tu defensa',
    desc: 'Ensayamos tu examen profesional, diapositivas y preguntas del sínodo para que llegues seguro.',
    visual: 'grad',
  },
];

const DURATION = 4600;

/* --- Mini-visuales animadas por slide (dinámicas, como el demo del escáner) --- */
function Visual({ type }) {
  if (type === 'scanner') {
    return (
      <div className="hc-vis hc-vis-scan">
        <div className="hc-sheet">
          <div className="hc-sheet-bar">
            <span className="hc-sheet-dots"><i /><i /><i /></span>
            <span className="hc-sheet-file"><FaFileAlt /> tu-tesis-cap-3.docx</span>
            <span className="hc-sheet-chip">18% IA</span>
          </div>
          <div className="hc-sheet-page">
            <h6 className="hc-sheet-h">3. Metodología</h6>
            <p>
              La presente investigación adopta un enfoque cuantitativo de alcance
              descriptivo. <mark>Es importante señalar que resulta fundamental mencionar
              que</mark> el diseño fue no experimental y de corte transversal. La población
              se conformó por 240 estudiantes de licenciatura.
            </p>
            <p>
              Se aplicó una encuesta y se revisaron documentos. <mark>El instrumento fue un
              cuestionario</mark> de 32 ítems validado con expertos. Finalmente, se aplicaron
              pruebas de correlación para contrastar las hipótesis planteadas.
            </p>
            <div className="hc-scanline" />
          </div>
        </div>
      </div>
    );
  }
  if (type === 'progress') {
    const chaps = ['Protocolo', 'Marco teórico', 'Metodología', 'Resultados'];
    return (
      <div className="hc-vis hc-vis-prog">
        {chaps.map((c, i) => (
          <div className="hc-chap" style={{ animationDelay: `${i * 0.18}s` }} key={c}>
            <span className="hc-chap-check"><FaCheck /></span>{c}
          </div>
        ))}
        <div className="hc-prog-bar"><i /></div>
      </div>
    );
  }
  if (type === 'shield') {
    return (
      <div className="hc-vis hc-vis-shield">
        <div className="hc-shield"><FaShieldAlt /><span className="hc-shield-pulse" /></div>
        <div className="hc-shield-tags">
          <span>0 coincidencias</span>
          <span>Citación APA ✓</span>
        </div>
      </div>
    );
  }
  if (type === 'guides') {
    return (
      <div className="hc-vis hc-vis-realpage">
        <span className="hc-rp-stack hc-rp-stack-2" aria-hidden="true" />
        <span className="hc-rp-stack hc-rp-stack-1" aria-hidden="true" />
        <div className="hc-rp-card">
          <img src={GUIA_COVER} alt="Taller APA 7 — guía descargable" loading="lazy" />
          <span className="hc-rp-badge"><FaBookOpen /> PDF · guía</span>
        </div>
      </div>
    );
  }
  if (type === 'bars') {
    const hs = [42, 68, 54, 84, 72];
    return (
      <div className="hc-vis hc-vis-bars">
        {hs.map((h, i) => (
          <span key={i} style={{ '--h': `${h}%`, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }
  return (
    <div className="hc-vis hc-vis-grad">
      <FaGraduationCap className="hc-cap" />
      <span className="hc-stamp">Titulado</span>
    </div>
  );
}

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useRef(false);

  useEffect(() => { reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches; }, []);
  const go = useCallback((n) => setI(() => (n + SLIDES.length) % SLIDES.length), []);
  useEffect(() => {
    if (paused || reduce.current) return undefined;
    const t = setTimeout(() => go(i + 1), DURATION);
    return () => clearTimeout(t);
  }, [i, paused, go]);

  const s = SLIDES[i] || SLIDES[0];

  return (
    <div
      className="hc"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ '--accent': s.accent }}
    >
      <div className="hc-glow" aria-hidden="true" />
      <div className="hc-frame">
        <div className="hc-top">
          <span className="hc-tag"><span className="hc-tag-dot" /> {s.tag}</span>
          <span className="hc-brand">Tesipedia</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={s.key}
            className="hc-slide"
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hc-visual-wrap"><Visual type={s.visual} /></div>
            <div className="hc-ico">{s.icon}</div>
            <h3 className="hc-title">{s.title}</h3>
            <p className="hc-desc">{s.desc}</p>
            <div className="hc-cta-row">
              {s.cta && (
                <Link className="hc-cta" to={s.cta.to} data-track-cta={s.cta.track}>
                  {s.cta.label} <FaArrowRight />
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="hc-foot">
          <div className="hc-cred">
            <span className="hc-cred-item"><b>+3,000</b> asesorados</span>
            <span className="hc-cred-item"><b>4.9</b><FaStar /> valoración</span>
            <span className="hc-cred-item"><b>50+</b> asesores</span>
          </div>
          <div className="hc-nav">
            <button className="hc-arrow" onClick={() => go(i - 1)} aria-label="Anterior" type="button">
              <FaChevronLeft />
            </button>
            <div className="hc-dots" role="tablist" aria-label="Servicios">
              {SLIDES.map((sl, n) => (
                <button
                  key={sl.key}
                  className={`hc-dot ${n === i ? 'is-on' : ''}`}
                  onClick={() => go(n)}
                  aria-label={sl.title}
                  aria-selected={n === i}
                  role="tab"
                >
                  <span className="hc-dot-fill" style={{ animationDuration: `${DURATION}ms`, animationPlayState: (n === i && !paused && !reduce.current) ? 'running' : 'paused' }} />
                </button>
              ))}
            </div>
            <button className="hc-arrow" onClick={() => go(i + 1)} aria-label="Siguiente" type="button">
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
