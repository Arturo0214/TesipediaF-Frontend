import { Link } from 'react-router-dom';
import { FaBookOpen, FaArrowRight, FaBolt } from 'react-icons/fa';
import './TiendaGuiasCTA.css';

/**
 * CTA reutilizable hacia la Tienda de Guías (/guias). Se inserta en blog posts y landings
 * para canalizar el tráfico orgánico hacia el producto (guías-taller en PDF).
 * Props: titulo, texto, trackId (opcional).
 */
export default function TiendaGuiasCTA({
  titulo = 'Avanza tu tesis hoy con nuestras guías-taller',
  texto = 'PDFs paso a paso con ejemplos y plantillas, por sección, carrera y universidad. Descarga inmediata desde $79.',
  trackId = 'tienda_cta',
}) {
  return (
    <aside className="tg-cta" aria-label="Tienda de guías de tesis">
      <div className="tg-cta-ico" aria-hidden="true"><FaBookOpen /></div>
      <div className="tg-cta-body">
        <strong>{titulo}</strong>
        <p>{texto}</p>
      </div>
      <Link to="/guias" className="tg-cta-btn" data-track-cta={trackId}>
        <FaBolt /> Ver la tienda de guías <FaArrowRight />
      </Link>
    </aside>
  );
}
