import { FaFlask, FaLightbulb, FaBookOpen, FaTag, FaMicroscope, FaQuoteRight, FaGraduationCap, FaListUl, FaPenFancy, FaRegNewspaper } from 'react-icons/fa';

/**
 * BlogCover — portada editorial de marca (sin fotos stock). Estilo "revista académica de lujo":
 * papel marfil, tinta navy, acento dorado por categoría, título en serif y sello Tesipedia.
 * Coherente en las 80 entradas; reemplaza las imágenes genéricas que no pegaban con la marca.
 */
const CAT = {
  'Metodología':   { ico: FaFlask,          accent: '#0EA5A5', label: 'Metodología' },
  'Consejos':      { ico: FaLightbulb,      accent: '#E0B23C', label: 'Consejos' },
  'Guía':          { ico: FaBookOpen,       accent: '#2563EB', label: 'Guía' },
  'Guías':         { ico: FaBookOpen,       accent: '#2563EB', label: 'Guías' },
  'Precios':       { ico: FaTag,            accent: '#16A34A', label: 'Precios' },
  'Investigación': { ico: FaMicroscope,     accent: '#7C3AED', label: 'Investigación' },
  'Citación':      { ico: FaQuoteRight,     accent: '#DB2777', label: 'Citación' },
  'Titulación':    { ico: FaGraduationCap,  accent: '#4F46E5', label: 'Titulación' },
  'Temas de tesis':{ ico: FaListUl,         accent: '#C79A2E', label: 'Temas de tesis' },
  'Ejemplos':      { ico: FaPenFancy,       accent: '#0891B2', label: 'Ejemplos' },
};
const fallback = { ico: FaRegNewspaper, accent: '#C79A2E', label: 'Artículo' };

export default function BlogCover({ post, variant = 'card' }) {
  const c = CAT[post.category] || fallback;
  const Ico = c.ico;
  // palabra clave grande de fondo (del kicker) para textura editorial
  const wm = (post.category || 'Tesis').split(' ')[0];
  return (
    <div className={`blog-cover blog-cover-${variant}`} style={{ '--accent': c.accent }}>
      <span className="blog-cover-wm" aria-hidden="true">{wm}</span>
      <div className="blog-cover-rule" />
      <div className="blog-cover-top">
        <span className="blog-cover-ico"><Ico /></span>
        <span className="blog-cover-kicker">{c.label}</span>
      </div>
      <p className="blog-cover-title">{post.title}</p>
      <div className="blog-cover-foot">
        <span className="blog-cover-brand">Tesipedia</span>
        <span className="blog-cover-dot">·</span>
        <span className="blog-cover-meta">{post.readTime || 'Lectura'}</span>
      </div>
    </div>
  );
}
