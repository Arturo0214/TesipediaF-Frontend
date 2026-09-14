import { Link } from 'react-router-dom';
import { FaBookOpen, FaArrowRight, FaBolt } from 'react-icons/fa';
import { getGuia, getPaquete } from '../../data/guias';
import './GuiasCrossSell.css';

/**
 * GuiasCrossSell — banda compacta de venta de guías para landings de servicio.
 * Captura al visitante que NO va a contratar asesoría (ticket alto) con la
 * alternativa low-ticket: hacerla él mismo con una guía desde $79.
 * Props:
 *  - origen: string para data-track-cta (ej. "asesoria", "comprar", "cotizar")
 *  - titulo / sub: copy contextual opcional
 *  - ids: productos a mostrar (default: apa-7, marco-teorico, paq-completo)
 */
const getProductoLocal = (id) => getGuia(id) || getPaquete(id);

function GuiasCrossSell({
  origen = 'landing',
  titulo = '¿Prefieres avanzarla tú mismo?',
  sub = 'Guías-taller en PDF, paso a paso y con ejemplos. Sin esperas: descarga inmediata.',
  ids = ['apa-7', 'marco-teorico', 'paq-completo'],
}) {
  const productos = ids.map(getProductoLocal).filter(Boolean);
  if (!productos.length) return null;

  return (
    <section className="gxs" aria-labelledby={`gxs-title-${origen}`}>
      <div className="gxs-inner">
        <div className="gxs-head">
          <span className="gxs-kicker"><FaBookOpen /> Tienda de guías</span>
          <h2 id={`gxs-title-${origen}`}>{titulo}</h2>
          <p>{sub}</p>
        </div>
        <div className="gxs-cards">
          {productos.map((p) => (
            <Link
              key={p.id}
              to={`/guias/${p.id}`}
              className={`gxs-card ${p.tipo === 'paquete' ? 'gxs-card-paq' : ''}`}
              data-track-cta={`guias_xsell_${origen}_${p.id}`}
            >
              <span className="gxs-card-kicker">{p.kicker}</span>
              <strong>{p.nombre}</strong>
              <div className="gxs-card-foot">
                <b>${p.precio} MXN</b>
                <span><FaBolt /> Descarga inmediata</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="gxs-all">
          <Link to="/guias" className="gxs-verlas" data-track-cta={`guias_xsell_${origen}_ver_todas`}>
            Ver todas las guías <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default GuiasCrossSell;
