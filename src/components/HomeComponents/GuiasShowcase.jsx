import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaArrowRight, FaBolt, FaLock, FaFilePdf } from 'react-icons/fa';
import { getGuia, getPaquete } from '../../data/guias';
import GuiasCarousel from './GuiasCarousel';
import useABTest from '../../hooks/useABTest';
import './GuiasShowcase.css';

/**
 * GuiasShowcase — sección de venta de guías en el Home.
 * El Home concentra ~73% del tráfico del sitio y no tenía NINGUNA presencia
 * de la tienda. Carrusel de portadas reales (estilo "elige tu plantilla") +
 * selector por etapa que convierte navegación en discovery de producto.
 *
 * Experimentos activos (useABTest, exposición trackeada):
 *  - stage_reco: la recomendación por etapa ofrece guía individual (A) vs paquete (B).
 *  - guia_cta:   CTA "Ver la guía" (A) vs "Comprar ahora" directo al modal de pago (B).
 */

// Etapas → producto real recomendado. productoA = guía individual, productoB = paquete.
const ETAPAS = [
  { id: 'empezar', label: 'Apenas voy a empezar', productoA: 'planteamiento', productoB: 'paq-arranque', pitch: 'Del tema al protocolo aprobado, con la pregunta bien formulada.' },
  { id: 'planteamiento', label: 'Planteamiento', productoA: 'planteamiento', productoB: 'paq-arranque', pitch: 'Convierte tu tema amplio en un problema de investigación que tu asesor apruebe.' },
  { id: 'marco', label: 'Marco teórico', productoA: 'marco-teorico', productoB: 'paq-escritura', pitch: 'Deja de resumir autores: aprende a discutirlos y articularlos.' },
  { id: 'metodologia', label: 'Metodología', productoA: 'metodologia', productoB: 'paq-escritura', pitch: 'Diseña una metodología replicable con variables bien operacionalizadas.' },
  { id: 'apa', label: 'Citas y referencias', productoA: 'apa-7', productoB: 'paq-citacion', pitch: 'APA 7 con ejemplos listos para copiar y los errores que reprueban.' },
  { id: 'resultados', label: 'Resultados', productoA: 'resultados', productoB: 'paq-cierre', pitch: 'Convierte tus datos en hallazgos con SPSS, R o Excel.' },
  { id: 'defensa', label: 'Ya voy a defender', productoA: 'defensa', productoB: 'paq-cierre', pitch: 'Guion de exposición, diapositivas y simulación de preguntas del sínodo.' },
  { id: 'todo', label: 'La quiero completa', productoA: 'paq-completo', productoB: 'paq-completo', pitch: 'Las 13 guías del taller: del planteamiento a la defensa, con APA 7, Vancouver y Chicago.' },
];

const getProductoLocal = (id) => getGuia(id) || getPaquete(id);

function GuiasShowcase() {
  const [etapa, setEtapa] = useState(ETAPAS[0]);

  // Experimento 3: recomendación individual (A) vs paquete (B)
  const recoVariant = useABTest('stage_reco');
  // Experimento 4: "Ver la guía" (A) vs "Comprar ahora" → abre el modal de pago (B)
  const ctaVariant = useABTest('guia_cta');

  const recomendado = getProductoLocal(recoVariant === 'B' ? etapa.productoB : etapa.productoA);
  const ctaLabel = ctaVariant === 'B' ? 'Comprar ahora' : 'Ver la guía';
  const ctaQuery = ctaVariant === 'B' ? '?comprar=1' : '';
  const v = ctaVariant.toLowerCase();

  return (
    <section className="hs-section gsw-section" aria-labelledby="gsw-title">
      <div className="hs-head">
        <span className="gsw-kicker"><FaBookOpen /> Tienda de guías · PDFs descargables</span>
        <h2 id="gsw-title">Avanza tu tesis hoy, desde $79</h2>
        <p>Guías-taller paso a paso, con ejemplos y plantillas. Descarga inmediata, pago seguro con MercadoPago.</p>
      </div>

      {/* ── Carrusel de portadas reales (estilo "elige tu plantilla") ── */}
      <GuiasCarousel
        ctaLabel={ctaVariant === 'B' ? 'Comprar ahora' : 'Ver esta guía'}
        ctaQuery={ctaQuery}
        trackPrefix={`home_guias_carousel_${v}`}
      />

      {/* ── Selector por etapa: navegación → discovery de producto ── */}
      <div className="gsw-stage">
        <p className="gsw-stage-q">¿En qué parte de tu tesis estás?</p>
        <div className="gsw-chips" role="tablist" aria-label="Etapa de tu tesis">
          {ETAPAS.map((e) => (
            <button
              key={e.id}
              type="button"
              role="tab"
              aria-selected={etapa.id === e.id}
              className={`gsw-chip ${etapa.id === e.id ? 'is-active' : ''}`}
              onClick={() => setEtapa(e)}
              data-track-cta={`home_guias_stage_${e.id}`}
            >
              {e.label}
            </button>
          ))}
        </div>

        {recomendado && (
          <div className="gsw-reco" key={`${recomendado.id}-${etapa.id}`}>
            <div className="gsw-reco-copy">
              <span className="gsw-reco-kicker">{recomendado.kicker}</span>
              <h3>{recomendado.nombre}</h3>
              <p>{etapa.pitch}</p>
              <div className="gsw-reco-meta">
                <span><FaBolt /> Descarga inmediata</span>
                <span><FaLock /> Pago seguro</span>
                <span><FaFilePdf /> PDF práctico</span>
              </div>
            </div>
            <div className="gsw-reco-buy">
              <div className="gsw-price">${recomendado.precio} <small>MXN</small></div>
              <Link
                to={`/guias/${recomendado.id}${ctaQuery}`}
                className="hs-btn gsw-btn-buy"
                data-track-cta={`home_guias_reco_${v}_${recomendado.id}`}
              >
                {ctaLabel} <FaArrowRight />
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="gsw-all">
        <Link to="/guias" className="hs-btn hs-btn-soft" data-track-cta="home_guias_ver_tienda">
          Ver todas las guías <FaArrowRight />
        </Link>
      </div>
    </section>
  );
}

export default GuiasShowcase;
