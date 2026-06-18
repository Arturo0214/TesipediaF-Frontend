import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaWhatsapp, FaChevronDown } from 'react-icons/fa';
import { styles } from './adsStyles';

const LOGO_URL = 'https://res.cloudinary.com/dbowaer8j/image/upload/f_auto,q_auto,w_200/v1743713944/Tesipedia-logo_n1liaw.png';

/**
 * Chrome compartido para landings de Google Ads: mini-header y mini-footer
 * AISLADOS (sin navbar/footer del sitio) para no enlazar a páginas no-compliant
 * como /comprar-tesis. Google revisa el sitio enlazado: un solo link basta para rechazar.
 */
export function MiniHeader({ canonical, waLink, onCtaClick, ctaText = 'Consulta Gratis' }) {
  return (
    <header style={styles.miniHeader}>
      <a href={canonical}>
        <img src={LOGO_URL} alt="Tesipedia — Asesoría Académica" style={styles.miniHeaderLogo} width="150" height="38" />
      </a>
      <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={onCtaClick} style={styles.miniHeaderCta}>
        <FaWhatsapp /> {ctaText}
      </a>
    </header>
  );
}
MiniHeader.propTypes = {
  canonical: PropTypes.string.isRequired,
  waLink: PropTypes.string.isRequired,
  onCtaClick: PropTypes.func,
  ctaText: PropTypes.string,
};

export function MiniFooter({ brand = 'Tesipedia — Asesoría y Tutoría Académica', tagline = 'Orientación académica personalizada con asesores certificados.' }) {
  return (
    <footer style={styles.miniFooter}>
      <div style={styles.miniFooterBrand}>{brand}</div>
      <p style={{ margin: '8px 0 12px' }}>{tagline}</p>
      <div>
        <a href="https://tesipedia.com/politica-de-privacidad" style={styles.miniFooterLink}>Política de Privacidad</a>
        <a href="https://tesipedia.com/contacto" style={styles.miniFooterLink}>Contacto</a>
      </div>
      <p style={{ margin: '12px 0 0', fontSize: '0.78rem', opacity: 0.5 }}>
        © {new Date().getFullYear()} Tesipedia — Todos los derechos reservados
      </p>
    </footer>
  );
}
MiniFooter.propTypes = {
  brand: PropTypes.string,
  tagline: PropTypes.string,
};

export function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...styles.faqItem, ...(open ? { borderColor: '#4F46E5', boxShadow: '0 4px 16px rgba(79,70,229,0.08)' } : {}) }}>
      <button style={styles.faqQuestion} onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{question}</span>
        <FaChevronDown style={{ ...styles.faqChevron, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {open && <div style={styles.faqAnswer}>{answer}</div>}
    </div>
  );
}
FaqItem.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.node.isRequired,
};
