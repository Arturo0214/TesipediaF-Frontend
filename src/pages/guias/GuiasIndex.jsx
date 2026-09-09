import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaArrowRight, FaFilePdf, FaStar, FaLayerGroup, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { GUIAS, PAQUETES, getGuia } from '../../data/guias';
import { useCart } from '../../context/CartContext';
import './GuiasIndex.css';

const nucleo = GUIAS.filter((g) => g.tipo !== 'carrera');
const carrera = GUIAS.filter((g) => g.tipo === 'carrera');

function GuiaCard({ id }) {
  const g = getGuia(id);
  const cart = useCart();
  if (!g) return null;
  const cover = g.pages?.[0]?.src;
  const inCart = cart?.has(g.id);
  const addToCart = (e) => { e.preventDefault(); e.stopPropagation(); inCart ? cart.setOpen(true) : cart?.add(g.id); };
  return (
    <Link to={`/guias/${g.id}`} className="gi-card" data-track-cta={`guias_index_${g.id}`}>
      <div className="gi-card-cover">
        {cover ? <img src={cover} alt={g.nombre} loading="lazy" /> : <FaBookOpen />}
        <span className="gi-card-price">${g.precio}</span>
      </div>
      <div className="gi-card-body">
        <span className="gi-card-kicker">{g.kicker}</span>
        <h3>{g.nombre}</h3>
        <div className="gi-card-actions">
          <span className="gi-card-cta">Ver guía <FaArrowRight /></span>
          <button type="button" className={`gi-card-add ${inCart ? 'is-in' : ''}`} onClick={addToCart} aria-label={inCart ? 'En el carrito' : 'Añadir al carrito'}>
            {inCart ? <FaCheck /> : <FaShoppingCart />}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function GuiasIndex() {
  return (
    <div className="gi">
      <Helmet>
        <title>Guías de Tesis en PDF (APA 7, metodología, defensa y por carrera) — Tesipedia</title>
        <meta name="description" content="Guías-taller en PDF para hacer tu tesis paso a paso: APA 7, planteamiento, marco teórico, metodología, resultados, defensa y guías por carrera. Descarga inmediata, pago seguro." />
        <meta name="keywords" content="guías de tesis pdf, guía apa 7, cómo hacer una tesis, metodología tesis, guía por carrera, plantilla tesis" />
        <link rel="canonical" href="https://tesipedia.com/guias" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'ItemList',
          itemListElement: [...nucleo, ...carrera].map((g, i) => ({
            '@type': 'ListItem', position: i + 1, name: g.nombre, url: `https://tesipedia.com/guias/${g.id}`,
          })),
        })}</script>
      </Helmet>

      <header className="gi-hero">
        <span className="ds-label"><FaBookOpen /> Guías descargables · Tesipedia</span>
        <h1>Guías-taller para hacer tu tesis, paso a paso</h1>
        <p>PDFs prácticos que te llevan de la mano en cada parte de la tesis, con ejemplos y ejercicios. Descarga inmediata y pago seguro con MercadoPago.</p>
      </header>

      {PAQUETES.length > 0 && (
        <section className="gi-sec">
          <h2 className="gi-h2"><FaLayerGroup /> Paquetes (ahorra más)</h2>
          <div className="gi-paks">
            {PAQUETES.map((p) => (
              <Link key={p.id} to={`/guias/${p.id}`} className={`gi-pak ${p.destacado ? 'is-top' : ''}`}>
                {p.destacado && <span className="gi-pak-flag"><FaStar /> Mejor valor</span>}
                <h3>{p.nombre}</h3>
                <p>{p.resumen}</p>
                <div className="gi-pak-foot"><b>${p.precio} MXN</b><span>Ver paquete <FaArrowRight /></span></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="gi-sec">
        <h2 className="gi-h2">Taller de tesis · por sección</h2>
        <div className="gi-grid">{nucleo.map((g) => <GuiaCard key={g.id} id={g.id} />)}</div>
      </section>

      <section className="gi-sec">
        <h2 className="gi-h2">Guías por carrera</h2>
        <p className="gi-sec-sub">Cada una con 60 temas de tesis del área, con población y diseño sugerido.</p>
        <div className="gi-grid">{carrera.map((g) => <GuiaCard key={g.id} id={g.id} />)}</div>
      </section>

      <section className="gi-cta">
        <FaFilePdf />
        <div>
          <h2>¿No sabes por cuál empezar?</h2>
          <p>Descarga una muestra gratis desde cualquier guía o escríbenos y te orientamos.</p>
        </div>
        <a href="https://wa.me/525670071517?text=Hola%2C%20quiero%20ayuda%20para%20elegir%20una%20gu%C3%ADa" target="_blank" rel="noopener noreferrer" className="gi-cta-btn">
          Pedir orientación
        </a>
      </section>
    </div>
  );
}
