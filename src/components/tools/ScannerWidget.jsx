import { useState, useRef, useCallback } from 'react';
import { FaFileUpload, FaWhatsapp, FaMagic, FaLock, FaCheckCircle } from 'react-icons/fa';
import './ScannerWidget.css';

const WA = 'https://wa.me/525670071517?text=Hola%2C%20quiero%20que%20revisen%20mi%20tesis%20con%20el%20detector%20de%20IA';
// Mismo origen que el detector público (backend /scan). Origen ya permitido por CSP.
const API = (import.meta.env.VITE_SCANNER_API_URL || import.meta.env.VITE_SOCKET_URL || '').replace(/\/$/, '');

/**
 * Escáner de IA compacto y reutilizable (usado en el panel del cliente).
 * Misma lógica que la landing DetectorIA pero autocontenido.
 */
export default function ScannerWidget({ compact = false }) {
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
  const reset = () => { setState('idle'); setResult(null); setFileName(''); };

  const score = Math.round(result?.score || 0);
  const nivel = score < 20 ? 'nivel bajo' : score < 45 ? 'nivel medio' : 'nivel alto';

  return (
    <div className={`sw ${compact ? 'sw-compact' : ''}`}>
      <div
        className={`sw-drop ${state === 'loading' ? 'is-loading' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button" tabIndex={0}
      >
        <input ref={inputRef} type="file" accept=".docx,.doc" hidden
          onChange={(e) => handleFile(e.target.files?.[0])} />
        {state === 'loading' ? (
          <>
            <div className="sw-spinner" />
            <strong>Analizando “{fileName}”…</strong>
            <span>Revisando señales de IA oración por oración</span>
          </>
        ) : (
          <>
            <span className="sw-drop-ico"><FaFileUpload /></span>
            <strong>Arrastra tu documento aquí o haz clic</strong>
            <span>Formato Word (.docx) · hasta 15 MB</span>
          </>
        )}
      </div>

      <div className="sw-trust">
        <span><FaLock /> Confidencial</span>
        <span><FaCheckCircle /> Calibrado para español</span>
      </div>

      {state === 'done' && result && (
        <div className="sw-result">
          <div className="sw-score" style={{ '--p': `${Math.min(100, score)}%` }}>
            <b>{score}%</b><span>IA</span>
          </div>
          <div className="sw-result-txt">
            <strong>IA detectada: {nivel}</strong>
            <span>{result.stats?.palabras ? `${result.stats.palabras} palabras analizadas` : 'Análisis listo'}</span>
            <div className="sw-result-actions">
              <a className="sw-cta" href={WA} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp /> Quiero ayuda para reducirla
              </a>
              <button type="button" className="sw-again" onClick={reset}>Analizar otro</button>
            </div>
          </div>
        </div>
      )}

      {state === 'unavailable' && (
        <div className="sw-fallback">
          <p><FaMagic /> Estamos terminando de publicar el detector en línea. Mientras tanto, <strong>envíanos tu documento por WhatsApp</strong> y te devolvemos el análisis con los pasajes a mejorar.</p>
          <a className="sw-cta" href={WA} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp /> Enviar por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
