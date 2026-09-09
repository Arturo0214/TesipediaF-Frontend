import { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FaRobot, FaFileUpload, FaShieldAlt, FaLock, FaSearch, FaCheckCircle,
  FaWhatsapp, FaArrowRight, FaMagic, FaFileAlt, FaListUl,
} from 'react-icons/fa';
import './DetectorIA.css';

const WA = 'https://wa.me/525670071517?text=Hola%2C%20quiero%20que%20revisen%20mi%20tesis%20con%20el%20detector%20de%20IA';
// Escáner estricto vive en el backend (ruta /detector/scan). Origen ya permitido por CSP.
const API = (import.meta.env.VITE_SCANNER_API_URL || import.meta.env.VITE_SOCKET_URL || '').replace(/\/$/, '');

const QUE_ANALIZA = [
  { t: 'Ritmo y variación de oraciones', d: 'La IA tiende a escribir con longitudes uniformes; tú no.' },
  { t: 'Muletillas típicas de IA', d: '“Es importante señalar que…”, “cabe mencionar…” y similares.' },
  { t: 'Estructuras repetidas', d: '“Por un lado… por otro lado…” y andamiajes artificiales.' },
  { t: 'Diversidad de vocabulario', d: 'Riqueza léxica real frente a repetición mecánica.' },
  { t: 'Uso de guiones y conectores', d: 'Patrones de puntuación propios de generadores.' },
  { t: 'Coherencia y citación', d: 'Continuidad de ideas y citas bien integradas.' },
];

const PASOS = [
  { n: 1, t: 'Sube tu documento', d: 'Arrastra tu archivo .docx. Es confidencial y no se comparte.' },
  { n: 2, t: 'Analizamos en segundos', d: 'Revisamos señales de escritura automática, oración por oración.' },
  { n: 3, t: 'Ve tu puntaje gratis', d: 'Tu porcentaje de IA y una muestra de los pasajes marcados. Desbloquea el informe completo cuando quieras.' },
];

const FAQS = [
  { q: '¿El detector es gratis?', a: 'Puedes analizar tu borrador gratis y ver tu puntaje de IA junto con una muestra de los pasajes marcados. Para desbloquear el informe completo —todos los pasajes, el desglose por sección y la ayuda para reescribirlos con tu propia voz— tenemos un plan de pago accesible.' },
  { q: '¿Mi documento es confidencial?', a: 'Totalmente. Tu archivo se usa solo para el análisis y no se comparte con terceros.' },
  { q: '¿Sirve para tesis en español?', a: 'Sí. Está calibrado para escritura académica en español, a diferencia de la mayoría de detectores en inglés.' },
  { q: '¿Detectar IA significa que hice trampa?', a: 'No. Es una herramienta preventiva: te ayuda a revisar tu redacción antes de entregar, para que tu trabajo suene 100% tuyo.' },
];

export default function DetectorIA() {
  const [state, setState] = useState('idle'); // idle | loading | done | unavailable
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setFileName(file.name);
    if (!API) { setState('unavailable'); return; }
    setState('loading');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch(`${API}/scan`, { method: 'POST', body: fd });
      if (!r.ok) throw new Error('scan');
      const data = await r.json();
      setResult(data);
      setState('done');
    } catch {
      setState('unavailable');
    }
  }, []);

  const onDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); };

  const softwareSchema = {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication',
    name: 'Detector de IA para Tesis — Tesipedia',
    applicationCategory: 'EducationalApplication', operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'MXN' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', ratingCount: '312' },
    description: 'Detector gratuito de contenido de IA para tesis en español. Analiza tu borrador y te dice qué tan “humano” suena antes de tu examen profesional.',
  };
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  const howToSchema = {
    '@context': 'https://schema.org', '@type': 'HowTo',
    name: 'Cómo revisar si tu tesis suena a IA',
    step: PASOS.map((p) => ({ '@type': 'HowToStep', position: p.n, name: p.t, text: p.d })),
  };

  return (
    <div className="dia">
      <Helmet>
        <title>Detector de IA para Tesis (Gratis) | Revisa tu Borrador — Tesipedia</title>
        <meta name="description" content="Detector de IA para tesis en español, gratis. Sube tu borrador .docx y descubre qué tan “humano” suena antes de tu sínodo. Analizamos muletillas, estructuras repetidas y más. Confidencial y sin registro." />
        <meta name="keywords" content="detector de ia, detector de ia gratis, detector de ia en español, detector de inteligencia artificial texto, revisar tesis ia, detector chatgpt tesis, humanizar texto ia tesis" />
        <meta property="og:title" content="Detector de IA para Tesis (Gratis) — Tesipedia" />
        <meta property="og:description" content="Sube tu borrador y revisa qué tan “humano” suena antes de tu examen profesional. Gratis, confidencial y calibrado para español." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tesipedia.com/detector-ia-tesis" />
        <link rel="canonical" href="https://tesipedia.com/detector-ia-tesis" />
        <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
      </Helmet>

      {/* HERO + uploader */}
      <section className="dia-hero">
        <div className="dia-hero-inner ds-container">
          <div className="dia-hero-text">
            <span className="ds-label"><FaRobot /> Detector de IA · Gratis</span>
            <h1 className="dia-h1">Descubre <span className="dia-em">cuánta IA</span> detecta tu tesis y cómo reducirla</h1>
            <p className="dia-sub">
              Sube tu borrador y medimos el <strong>porcentaje de IA</strong>, oración por oración.
              Donde hay señales, te mostramos <strong>cómo mejorarlo</strong> y te ayudamos a redactarlo con tu propia voz —
              antes de entregar a tu sínodo.
            </p>
            <div className="dia-trust">
              <span><FaLock /> Confidencial</span>
              <span><FaCheckCircle /> Sin registro</span>
              <span><FaShieldAlt /> Calibrado para español</span>
            </div>
          </div>

          <div className="dia-panel">
            <div
              className={`dia-drop ${state === 'loading' ? 'is-loading' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button" tabIndex={0}
            >
              <input ref={inputRef} type="file" accept=".docx,.doc" hidden
                onChange={(e) => handleFile(e.target.files?.[0])} />
              {state === 'loading' ? (
                <>
                  <div className="dia-spinner" />
                  <strong>Analizando “{fileName}”…</strong>
                  <span>Revisando señales de IA oración por oración</span>
                </>
              ) : (
                <>
                  <span className="dia-drop-ico"><FaFileUpload /></span>
                  <strong>Arrastra tu tesis aquí o haz clic</strong>
                  <span>Formato Word (.docx) · hasta 15 MB</span>
                </>
              )}
            </div>

            {state === 'done' && result && (
              <div className="dia-result">
                <div className="dia-score" style={{ '--p': `${Math.min(100, result.score || 0)}%` }}>
                  <b>{Math.round(result.score || 0)}%</b><span>IA</span>
                </div>
                <div className="dia-result-txt">
                  <strong>{result.score < 20 ? 'IA detectada: nivel bajo' : result.score < 45 ? 'IA detectada: nivel medio' : 'IA detectada: nivel alto'}</strong>
                  <span>{result.stats?.palabras ? `${result.stats.palabras} palabras · te decimos cómo reducirla` : 'Te decimos cómo reducirla'}</span>
                  <a className="ds-cta dia-result-cta" href={WA} target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp /> Quiero ayuda para reducirla
                  </a>
                </div>
              </div>
            )}

            {state === 'unavailable' && (
              <div className="dia-fallback">
                <p><FaMagic /> Estamos terminando de publicar el detector en línea. Mientras tanto, <strong>envíanos tu documento por WhatsApp</strong> y te devolvemos el análisis con los pasajes a mejorar.</p>
                <a className="ds-cta" href={WA} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp /> Enviar mi tesis por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUÉ ANALIZA */}
      <section className="dia-section ds-container">
        <div className="dia-head">
          <span className="ds-label"><FaListUl /> Qué revisamos</span>
          <h2>Ocho señales que delatan un texto escrito por IA</h2>
          <p>Nuestro análisis está calibrado para escritura académica en español, no para inglés.</p>
        </div>
        <div className="dia-grid">
          {QUE_ANALIZA.map((m, i) => (
            <div className="dia-card" key={i}>
              <span className="dia-card-ico"><FaSearch /></span>
              <h3>{m.t}</h3>
              <p>{m.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="dia-section dia-section-alt">
        <div className="ds-container">
          <div className="dia-head">
            <span className="ds-label">Cómo funciona</span>
            <h2>Tu reporte en tres pasos</h2>
          </div>
          <div className="dia-steps">
            {PASOS.map((p) => (
              <div className="dia-step" key={p.n}>
                <span className="dia-step-n">{p.n}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="dia-section ds-container">
        <div className="dia-head">
          <span className="ds-label">Preguntas frecuentes</span>
          <h2>Lo que suelen preguntarnos</h2>
        </div>
        <div className="dia-faq">
          {FAQS.map((f, i) => (
            <details className="dia-faq-item" key={i} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="dia-final">
        <div className="ds-container dia-final-inner">
          <h2>¿Tu tesis marcó indicios de IA?</h2>
          <p>Te ayudamos a reescribir esos pasajes con tu propia voz y a dejar tu trabajo 100% tuyo, listo para tu examen profesional.</p>
          <a className="ds-cta dia-final-cta" href={WA} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp /> Habla con un asesor — gratis
          </a>
          <p className="dia-final-note">o vuelve al <Link to="/">inicio</Link> para conocer la asesoría integral</p>
        </div>
      </section>
    </div>
  );
}
