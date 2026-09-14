import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTimes, FaArrowRight } from 'react-icons/fa';
import useABTest from '../../hooks/useABTest';
import './PromoBar.css';

/**
 * PromoBar — cinta superior global hacia la tienda de guías.
 * - Cerrable: el cierre persiste 7 días en localStorage.
 * - No aparece en la propia tienda (/guias*) ni en flujos de pago.
 * - Altura fija y en flujo normal del documento → sin CLS.
 */
const STORAGE_KEY = 'tp_promobar_guias_closed_at';
const DIAS_OCULTA = 7;

const isClosed = () => {
  try {
    const t = Number(localStorage.getItem(STORAGE_KEY) || 0);
    return t > 0 && Date.now() - t < DIAS_OCULTA * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

function PromoBar() {
  const [closed, setClosed] = useState(isClosed);
  const { pathname } = useLocation();
  // Experimento 2: copy precio (A) vs beneficio (B)
  const copyVariant = useABTest('promobar_copy');

  // Rutas donde la barra estorba o es redundante
  const hidden =
    pathname.startsWith('/guias') ||
    pathname.startsWith('/pago') ||
    pathname.startsWith('/payment') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register');

  // Aparece SOLO al hacer scroll pasando el hero (~70% del alto de la ventana).
  const [scrolledPast, setScrolledPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > window.innerHeight * 0.72);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (closed || hidden) return null;

  const close = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* private mode */ }
    setClosed(true);
  };

  return (
    <div className={`tp-promobar ${scrolledPast ? 'is-shown' : ''}`} role="region" aria-label="Promoción de guías">
      <Link to="/guias" className="tp-promobar-link" data-track-cta={`promobar_guias_${copyVariant.toLowerCase()}`}>
        <span className="tp-promobar-emoji" aria-hidden="true">📚</span>
        {copyVariant === 'B' ? (
          <span className="tp-promobar-text">
            <b>Termina tu tesis más rápido</b>
            <span className="tp-promobar-sub"> · guías paso a paso, con ejemplos y plantillas</span>
          </span>
        ) : (
          <span className="tp-promobar-text">
            <b>Guías de tesis desde $79</b>
            <span className="tp-promobar-sub"> · descarga inmediata · pago seguro</span>
          </span>
        )}
        <span className="tp-promobar-cta">Ver guías <FaArrowRight /></span>
      </Link>
      <button type="button" className="tp-promobar-close" onClick={close} aria-label="Cerrar promoción">
        <FaTimes />
      </button>
    </div>
  );
}

export default PromoBar;
