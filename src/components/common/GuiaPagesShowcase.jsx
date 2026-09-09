import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaDownload } from 'react-icons/fa';
import './GuiaPagesShowcase.css';

/**
 * Showcase animado de las páginas reales de una guía (carrusel apilado + badges flotantes).
 * `pages`: [{ src, label }] con URLs de Cloudinary. `chip`: texto del badge superior (kicker).
 * Reutilizado en la página de producto, el hero y el blog para verse idéntico.
 */
export default function GuiaPagesShowcase({ pages = [], chip = 'Guía Tesipedia', interval = 3800 }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => { pages.forEach((pg) => { const im = new Image(); im.src = pg.src; }); }, [pages]);
  useEffect(() => {
    if (paused || pages.length < 2) return undefined;
    const t = setTimeout(() => setI((p) => (p + 1) % pages.length), interval);
    return () => clearTimeout(t);
  }, [i, paused, pages, interval]);

  if (!pages.length) return null;
  const idx = Math.min(i, pages.length - 1);

  return (
    <div className="gps" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <span className="gps-blob" aria-hidden="true" />
      <span className="gps-stack gps-stack-2" aria-hidden="true" />
      <span className="gps-stack gps-stack-1" aria-hidden="true" />

      <div className="gps-card">
        <AnimatePresence mode="wait">
          <motion.img
            key={idx}
            src={pages[idx].src}
            alt={`${pages[idx].label} — guía Tesipedia`}
            className="gps-page"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            loading="lazy"
          />
        </AnimatePresence>
      </div>

      <motion.div className="gps-chip gps-chip-1"
        animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="gps-chip-ico gps-chip-ok"><FaCheckCircle /></span> {chip}
      </motion.div>
      <motion.div className="gps-chip gps-chip-2"
        animate={{ y: [0, 9, 0] }} transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}>
        <span className="gps-chip-ico gps-chip-amber"><FaDownload /></span>
        <span className="gps-chip-txt"><b>PDF descargable</b><i>49 págs · checklist + plantillas</i></span>
      </motion.div>

      {pages.length > 1 && (
        <div className="gps-dots">
          {pages.map((pg, n) => (
            <button key={pg.src} type="button" className={`gps-dot ${n === idx ? 'is-on' : ''}`}
              onClick={() => setI(n)} aria-label={pg.label} />
          ))}
        </div>
      )}
    </div>
  );
}
