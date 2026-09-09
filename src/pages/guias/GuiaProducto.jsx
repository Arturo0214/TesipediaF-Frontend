import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import {
  FaBookOpen, FaFilePdf, FaCheckCircle, FaLock, FaArrowRight,
  FaWhatsapp, FaStar, FaShieldAlt, FaRegClock, FaTimes,
} from 'react-icons/fa';
import GuiaPagesShowcase from '../../components/common/GuiaPagesShowcase';
import { getProducto } from '../../data/guias';
import { useCart } from '../../context/CartContext';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';
import './GuiaProducto.css';

const API = (import.meta.env.VITE_SOCKET_URL || import.meta.env.API_URL || '').replace(/\/$/, '') || window.location.origin;
const WA = 'https://wa.me/525670071517?text=Hola%2C%20tengo%20una%20duda%20sobre%20una%20gu%C3%ADa%20de%20Tesipedia';

const FAQS = [
  { q: '¿Cómo recibo la guía?', a: 'En cuanto se confirma tu pago te redirigimos a la descarga y además te la enviamos a tu correo.' },
  { q: '¿En qué formato viene?', a: 'Es un PDF listo para leer en cualquier dispositivo, con ejercicios que resuelves sobre la propia página.' },
  { q: '¿Sirve para mi universidad?', a: 'Sí. Está pensada para tesis de licenciatura, maestría y doctorado en universidades mexicanas (UNAM, IPN, UAM y más).' },
  { q: '¿El pago es seguro?', a: 'Sí. El cobro lo procesa MercadoPago; nosotros no almacenamos los datos de tu tarjeta.' },
];

export default function GuiaProducto() {
  const { id } = useParams();
  const productId = id || 'apa-7';
  const producto = getProducto(productId);
  const cart = useCart();
  const enCarrito = cart?.has(productId);

  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState('');
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState('');

  const comprar = useCallback(async (e) => {
    e.preventDefault();
    setPayErr('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setPayErr('Escribe un correo válido para enviarte la guía.'); return; }
    setPaying(true);
    try {
      const res = await fetch(`${API}/guias/checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email: email.trim().toLowerCase(), metodo: 'mercadopago' }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo iniciar el pago.');
      window.location.href = data.url; // → MercadoPago
    } catch (err) {
      setPayErr(`${err.message} Escríbenos por WhatsApp y te ayudamos.`);
      setPaying(false);
    }
  }, [email, productId]);

  if (!producto) {
    return (
      <div className="gp gp-404">
        <Helmet><title>Guía no encontrada — Tesipedia</title><meta name="robots" content="noindex" /></Helmet>
        <h1>Esa guía no existe (todavía)</h1>
        <p>Revisa el catálogo completo de guías de tesis.</p>
        <Link to="/guias" className="gp-buy"><FaBookOpen /> Ver todas las guías</Link>
      </div>
    );
  }

  const { precio, nombre, resumen, kicker, muestraUrl, pages, incluye, tipo } = producto;
  const canonical = `https://tesipedia.com/guias/${productId}`;
  const esGuia = tipo !== 'paquete';

  return (
    <div className="gp">
      <Helmet>
        <title>{`${nombre} (PDF) — Guía de Tesis | Tesipedia`}</title>
        <meta name="description" content={`${resumen} Descarga inmediata en PDF, pago seguro con MercadoPago.`} />
        <meta name="keywords" content={`${kicker.toLowerCase()}, guía de tesis pdf, ${nombre.toLowerCase()}, tesis méxico`} />
        <meta property="og:title" content={`${nombre} — Tesipedia`} />
        <meta property="og:description" content={resumen} />
        <meta property="og:type" content="product" />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Product', name: nombre, description: resumen,
          brand: { '@type': 'Brand', name: 'Tesipedia' },
          ...(precio ? { offers: { '@type': 'Offer', price: precio, priceCurrency: 'MXN', availability: 'https://schema.org/InStock', url: canonical } } : {}),
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '128' },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        })}</script>
      </Helmet>

      {/* HERO */}
      <section className="gp-hero">
        <div className="gp-hero-inner">
          <div className="gp-hero-copy">
            <span className="ds-label"><FaBookOpen /> {esGuia ? 'Guía descargable' : 'Paquete de guías'} · {kicker}</span>
            <h1 className="gp-title">{nombre}</h1>
            <p className="gp-sub">{resumen}</p>

            <ul className="gp-trust">
              <li><FaCheckCircle /> Descarga inmediata en PDF</li>
              <li><FaStar /> 4.9/5 · +3,000 estudiantes</li>
              <li><FaShieldAlt /> Pago seguro con MercadoPago</li>
            </ul>

            <div className="gp-cta-row">
              <button className="gp-buy" onClick={() => setModal(true)} data-track-cta={`guia_${productId}_comprar`}>
                <FaLock /> {esGuia ? 'Comprar guía' : 'Comprar paquete'}{precio ? ` · $${precio} MXN` : ''}
              </button>
              <button
                className={`gp-cart ${enCarrito ? 'is-in' : ''}`}
                onClick={() => (enCarrito ? cart.setOpen(true) : cart?.add(productId))}
                data-track-cta={`guia_${productId}_carrito`}
              >
                {enCarrito ? (<><FaCheck /> En el carrito</>) : (<><FaShoppingCart /> Añadir al carrito</>)}
              </button>
            </div>
            {muestraUrl && (
              <a className="gp-sample gp-sample-inline" href={muestraUrl} target="_blank" rel="noopener noreferrer" data-track-cta={`guia_${productId}_muestra`}>
                <FaFilePdf /> Ver muestra gratis
              </a>
            )}
            <p className="gp-note"><FaWhatsapp /> ¿Dudas antes de comprar? <a href={WA} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a>.</p>
          </div>

          {/* showcase animado con las páginas reales de la guía */}
          <GuiaPagesShowcase pages={pages} chip={kicker} />
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section className="gp-sec">
        <h2 className="gp-h2">{esGuia ? 'Qué incluye tu guía' : 'Qué incluye el paquete'}</h2>
        <div className="gp-grid">
          {incluye.map((it) => (
            <div className="gp-card" key={it}>
              <span className="gp-card-ico"><FaCheckCircle /></span>
              <div><strong>{it}</strong></div>
            </div>
          ))}
        </div>
      </section>

      {/* MUESTRA */}
      {muestraUrl && (
        <section className="gp-sample-band">
          <div>
            <h2 className="gp-h2">Míralo antes de comprar</h2>
            <p>Descarga una <strong>muestra gratis</strong> con las primeras páginas y decide con confianza.</p>
          </div>
          <a className="gp-sample gp-sample-lg" href={muestraUrl} target="_blank" rel="noopener noreferrer">
            <FaFilePdf /> Descargar muestra gratis
          </a>
        </section>
      )}

      {/* FAQ */}
      <section className="gp-sec">
        <h2 className="gp-h2">Preguntas frecuentes</h2>
        <div className="gp-faq">
          {FAQS.map((f) => (
            <details className="gp-faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <div className="gp-final">
          <h3>Avanza tu tesis hoy</h3>
          <button className="gp-buy" onClick={() => setModal(true)}>
            <FaLock /> {esGuia ? 'Obtener la guía' : 'Obtener el paquete'}{precio ? ` · $${precio} MXN` : ''} <FaArrowRight />
          </button>
          <p className="gp-final-links">
            <Link to="/guias">Todas las guías</Link> · <Link to="/detector-ia-tesis">Detector de IA</Link> · <Link to="/blog">Blog gratis</Link>
          </p>
        </div>
      </section>

      {/* MODAL DE COMPRA */}
      {modal && (
        <div className="gp-modal" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="gp-modal-card">
            <button className="gp-modal-x" onClick={() => setModal(false)} aria-label="Cerrar"><FaTimes /></button>
            <span className="gp-modal-ico"><FaBookOpen /></span>
            <h3>Comprar {nombre}</h3>
            <p className="gp-modal-sub">Te enviaremos la descarga a tu correo y te llevaremos al pago seguro.</p>
            <form onSubmit={comprar}>
              <label className="gp-modal-label" htmlFor="gp-email">Tu correo</label>
              <input
                id="gp-email" type="email" inputMode="email" autoComplete="email" required
                placeholder="tucorreo@ejemplo.com" value={email}
                onChange={(e) => setEmail(e.target.value)} className="gp-modal-input"
              />
              {payErr && <p className="gp-modal-err">{payErr} <a href={WA} target="_blank" rel="noopener noreferrer">WhatsApp</a></p>}
              <button type="submit" className="gp-buy gp-modal-buy" disabled={paying}>
                {paying ? 'Redirigiendo…' : (<><FaLock /> Pagar{precio ? ` $${precio} MXN` : ''}</>)}
              </button>
              <p className="gp-modal-secure"><FaShieldAlt /> Pago protegido por MercadoPago · <FaRegClock /> acceso inmediato</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
