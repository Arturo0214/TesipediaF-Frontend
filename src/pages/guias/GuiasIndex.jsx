import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { trackStoreView } from '../../services/eventService';
import { FaBookOpen, FaArrowRight, FaFilePdf, FaStar, FaShoppingCart, FaCheck, FaSearch, FaTimes, FaBolt, FaLock, FaSlidersH, FaDownload } from 'react-icons/fa';
import { GUIAS, PAQUETES, ALL_PRODUCTOS } from '../../data/guias';
import { useCart } from '../../context/CartContext';
import GuiasCarousel from '../../components/HomeComponents/GuiasCarousel';
import './GuiasIndex.css';

// ALL_PRODUCTOS ya trae las portadas (pages) inyectadas. Paquetes PRIMERO (con montaje de 3 portadas).
const ITEMS = [...ALL_PRODUCTOS].sort((a, b) => (b.tipo === 'paquete') - (a.tipo === 'paquete'));
const BY_ID = Object.fromEntries(ALL_PRODUCTOS.map((p) => [p.id, p]));
// Portada de un paquete = portada de su primera guía incluida (o la suya de fallback).
const portadaDe = (g) => (g.tipo === 'paquete' ? (BY_ID[g.incluyeIds?.[0]]?.pages?.[0]?.src || g.pages?.[0]?.src) : g.pages?.[0]?.src);

const CATS = [
  { key: 'seccion', label: 'Por sección' },
  { key: 'citacion', label: 'Citación' },
  { key: 'carrera', label: 'Por carrera' },
  { key: 'universidad', label: 'Por universidad' },
  { key: 'paquete', label: 'Paquetes' },
];
const CARRERAS = [...new Set(GUIAS.filter((g) => g.tipo === 'carrera').map((g) => g.kicker))];
const UNIVERSIDADES = [...new Set(GUIAS.filter((g) => g.tipo === 'universidad').map((g) => g.kicker))];
const PRECIOS = [
  { key: '0-99', label: 'Hasta $99', test: (p) => p <= 99 },
  { key: '100-199', label: '$100 – $199', test: (p) => p >= 100 && p <= 199 },
  { key: '200-499', label: '$200 – $499', test: (p) => p >= 200 && p <= 499 },
  { key: '500+', label: '$500 o más', test: (p) => p >= 500 },
];

function ProductCard({ g }) {
  const cart = useCart();
  const cover = g.pages?.[0]?.src;
  const esPaquete = g.tipo === 'paquete';
  const inCart = cart?.has(g.id);
  const addToCart = (e) => { e.preventDefault(); e.stopPropagation(); inCart ? cart.setOpen(true) : cart?.add(g.id); };
  return (
    <Link to={`/guias/${g.id}`} className={`gi-card ${esPaquete ? 'is-pak' : ''}`} data-track-cta={`guias_store_${g.id}`}>
      <div className="gi-card-cover">
        {esPaquete ? (
          <div className="gi-card-pakstack">
            {(g.incluyeIds || []).slice(0, 3).map((id, i) => {
              const src = BY_ID[id]?.pages?.[0]?.src;
              return src ? <img key={id} className={`gi-pakthumb gi-pakthumb-${i}`} src={src} alt="" loading="lazy" /> : null;
            })}
            <span className="gi-card-pakn">{(g.incluyeIds || []).length} guías incluidas</span>
          </div>
        ) : cover ? <img src={cover} alt={`Portada — ${g.nombre}`} loading="lazy" /> : <div className="gi-card-noimg"><FaBookOpen /></div>}
        {g.destacado && <span className="gi-card-flag"><FaStar /> Más vendida</span>}
        {esPaquete && !g.destacado && <span className="gi-card-flag gi-flag-save">Ahorra en paquete</span>}
        <span className="gi-card-price">${g.precio} <small>MXN</small></span>
      </div>
      <div className="gi-card-body">
        <span className="gi-card-kicker">{g.kicker}</span>
        <h3>{g.nombre}</h3>
        {g.resumen && <p className="gi-card-desc">{g.resumen}</p>}
        <div className="gi-card-proof">
          <span className="gi-stars"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /> 4.9</span>
          <span className="gi-proof-dot">·</span>
          <span className="gi-proof-dl"><FaDownload /> Descarga inmediata</span>
        </div>
        <div className="gi-card-buy">
          <button type="button" className={`gi-buy-btn ${inCart ? 'is-in' : ''}`} onClick={addToCart}>
            {inCart ? <><FaCheck /> En el carrito</> : <><FaShoppingCart /> Añadir</>}
          </button>
          <span className="gi-card-cta">Ver <FaArrowRight /></span>
        </div>
      </div>
    </Link>
  );
}

export default function GuiasIndex() {
  useEffect(() => { trackStoreView('/guias'); }, []);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(null);
  const [carrera, setCarrera] = useState('');
  const [uni, setUni] = useState('');
  const [precio, setPrecio] = useState(null);
  const [showFiltros, setShowFiltros] = useState(false);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ITEMS.filter((g) => {
      if (term && !`${g.nombre} ${g.kicker} ${g.resumen || ''}`.toLowerCase().includes(term)) return false;
      if (cat && g.tipo !== cat) return false;
      if (carrera && g.kicker !== carrera) return false;
      if (uni && g.kicker !== uni) return false;
      if (precio) { const r = PRECIOS.find((x) => x.key === precio); if (r && !r.test(g.precio)) return false; }
      return true;
    });
  }, [q, cat, carrera, uni, precio]);

  const hayFiltros = q || cat || carrera || uni || precio;
  const limpiar = () => { setQ(''); setCat(null); setCarrera(''); setUni(''); setPrecio(null); };

  return (
    <div className="gi gi-store">
      <Helmet>
        <title>Tienda de guías de tesis en PDF — APA 7, por carrera y por universidad | Tesipedia</title>
        <meta name="description" content="Guías-taller en PDF para hacer tu tesis paso a paso: busca y filtra por sección, carrera (Medicina, Derecho, Psicología…) o universidad (UNAM, IPN, UAM…). Descarga inmediata, pago seguro." />
        <link rel="canonical" href="https://tesipedia.com/guias" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'ItemList',
          itemListElement: ITEMS.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.nombre, url: `https://tesipedia.com/guias/${g.id}` })),
        })}</script>
      </Helmet>

      {/* ── Hero + carrusel de portadas (diferenciador) ── */}
      <header className="gi-store-hero">
        <span className="ds-label"><FaBookOpen /> Tienda de guías · Tesipedia</span>
        <h1>Guías-taller para hacer tu tesis, paso a paso</h1>
        <p>PDFs prácticos con ejemplos y plantillas. Busca la tuya por carrera o universidad. Descarga inmediata, pago seguro con MercadoPago.</p>
        <div className="gi-store-meta">
          <span><FaBolt /> Descarga inmediata</span>
          <span><FaLock /> Pago seguro</span>
          <span><FaFilePdf /> {GUIAS.length}+ guías y {PAQUETES.length} paquetes</span>
        </div>
      </header>

      <div className="gi-carousel-wrap">
        <GuiasCarousel ctaLabel="Ver esta guía" trackPrefix="guias_store_carousel" />
      </div>

      {/* ── Buscador ── */}
      <div className="gi-searchbar">
        <div className="gi-search">
          <FaSearch />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca una guía: APA, marco teórico, Medicina, UNAM…"
            aria-label="Buscar guías"
          />
          {q && <button type="button" className="gi-search-clear" onClick={() => setQ('')} aria-label="Limpiar búsqueda"><FaTimes /></button>}
        </div>
        <button type="button" className="gi-filtros-toggle" onClick={() => setShowFiltros((s) => !s)}>
          <FaSlidersH /> Filtros{hayFiltros ? ' ·' : ''}
        </button>
      </div>

      <div className="gi-store-layout">
        {/* ── Sidebar de filtros ── */}
        <aside className={`gi-filtros ${showFiltros ? 'is-open' : ''}`}>
          <div className="gi-filtros-head">
            <strong>Filtrar</strong>
            {hayFiltros && <button type="button" className="gi-filtros-clear" onClick={limpiar}>Limpiar</button>}
          </div>

          <div className="gi-fgroup">
            <span className="gi-fgroup-t">Categoría</span>
            <div className="gi-chips">
              <button className={`gi-chip ${!cat ? 'on' : ''}`} onClick={() => setCat(null)}>Todas</button>
              {CATS.map((c) => (
                <button key={c.key} className={`gi-chip ${cat === c.key ? 'on' : ''}`} onClick={() => setCat(cat === c.key ? null : c.key)}>{c.label}</button>
              ))}
            </div>
          </div>

          <div className="gi-fgroup">
            <label className="gi-fgroup-t" htmlFor="f-carrera">Carrera</label>
            <select id="f-carrera" className="gi-select" value={carrera} onChange={(e) => { setCarrera(e.target.value); if (e.target.value) setCat(null); }}>
              <option value="">Todas las carreras</option>
              {CARRERAS.map((c) => <option key={c} value={c}>{c.replace(/^Tesis de /, '')}</option>)}
            </select>
          </div>

          <div className="gi-fgroup">
            <label className="gi-fgroup-t" htmlFor="f-uni">Universidad / escuela</label>
            <select id="f-uni" className="gi-select" value={uni} onChange={(e) => { setUni(e.target.value); if (e.target.value) setCat(null); }}>
              <option value="">Todas las universidades</option>
              {UNIVERSIDADES.map((u) => <option key={u} value={u}>{u.replace(/^Titulación |^Proyecto terminal |^Tesis posgrado /, '')}</option>)}
            </select>
          </div>

          <div className="gi-fgroup">
            <span className="gi-fgroup-t">Precio</span>
            <div className="gi-chips">
              {PRECIOS.map((p) => (
                <button key={p.key} className={`gi-chip ${precio === p.key ? 'on' : ''}`} onClick={() => setPrecio(precio === p.key ? null : p.key)}>{p.label}</button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Resultados ── */}
        <section className="gi-results">
          <div className="gi-results-head">
            <span>{filtrados.length} {filtrados.length === 1 ? 'resultado' : 'resultados'}{hayFiltros ? ' con tus filtros' : ''}</span>
            {hayFiltros && <button type="button" className="gi-results-clear" onClick={limpiar}><FaTimes /> Quitar filtros</button>}
          </div>
          {filtrados.length ? (
            <div className="gi-grid">{filtrados.map((g) => <ProductCard key={g.id} g={g} />)}</div>
          ) : (
            <div className="gi-empty">
              <FaSearch />
              <p>No encontramos guías con esos filtros.</p>
              <button type="button" onClick={limpiar}>Ver todas las guías</button>
            </div>
          )}
        </section>
      </div>

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
