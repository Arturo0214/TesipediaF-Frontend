import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaTimes, FaTrashAlt, FaShoppingCart, FaLock, FaArrowRight, FaGift, FaShieldAlt,
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { trackInitiateCheckout } from '../../services/eventService';
import './CartDrawer.css';

const API = (import.meta.env.VITE_SOCKET_URL || import.meta.env.API_URL || '').replace(/\/$/, '') || window.location.origin;

export default function CartDrawer() {
  const cart = useCart();
  const authEmail = useSelector((s) => s?.auth?.user?.correo || s?.auth?.user?.email || '');
  const [email, setEmail] = useState(authEmail || '');
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState('');

  if (!cart) return null;
  const { items, total, count, remove, open, setOpen, suggestion, applyBundle } = cart;

  const pagar = async () => {
    setErr('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Escribe un correo válido para enviarte las guías.'); return; }
    setPaying(true);
    try {
      trackInitiateCheckout('carrito', total, { items: cart.ids, count });
      const res = await fetch(`${API}/guias/checkout-cart`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.ids, email: email.trim().toLowerCase(), metodo: 'mercadopago' }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo iniciar el pago.');
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message);
      setPaying(false);
    }
  };

  return (
    <>
      <div className={`cd-overlay ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} aria-hidden={!open} />
      <aside className={`cd ${open ? 'is-open' : ''}`} role="dialog" aria-label="Carrito" aria-modal="true">
        <header className="cd-head">
          <span className="cd-head-title"><FaShoppingCart /> Tu carrito {count > 0 && <b>({count})</b>}</span>
          <button className="cd-close" onClick={() => setOpen(false)} aria-label="Cerrar"><FaTimes /></button>
        </header>

        {count === 0 ? (
          <div className="cd-empty">
            <FaShoppingCart />
            <p>Tu carrito está vacío.</p>
            <Link to="/guias" className="cd-empty-btn" onClick={() => setOpen(false)}>Ver guías</Link>
          </div>
        ) : (
          <>
            <div className="cd-body">
              {suggestion && (
                <div className="cd-sug">
                  <span className="cd-sug-ico"><FaGift /></span>
                  <div className="cd-sug-txt">
                    {suggestion.missing.length === 0 ? (
                      <p>Estas guías arman el <b>{suggestion.paq.nombre}</b>. Cámbialas y <b>ahorra ${suggestion.ahorro}</b>.</p>
                    ) : (
                      <p>Te falta <b>{suggestion.missingNombre}</b> para el <b>{suggestion.paq.nombre}</b>. Añádelo y <b>ahorra ${suggestion.ahorro}</b> (pagas ${suggestion.paq.precio} en vez de ${suggestion.sumNeed}).</p>
                    )}
                    <button className="cd-sug-btn" onClick={() => applyBundle(suggestion)}>
                      {suggestion.missing.length === 0 ? 'Cambiar al paquete' : 'Añadir y ahorrar'} <FaArrowRight />
                    </button>
                  </div>
                </div>
              )}

              <ul className="cd-items">
                {items.map((p) => (
                  <li className="cd-item" key={p.id}>
                    <span className="cd-item-cover" style={p.pages?.[0]?.src ? { backgroundImage: `url(${p.pages[0].src})` } : {}} />
                    <div className="cd-item-info">
                      <span className="cd-item-kicker">{p.tipo === 'paquete' ? 'Paquete' : p.kicker}</span>
                      <strong>{p.nombre}</strong>
                    </div>
                    <span className="cd-item-price">${p.precio}</span>
                    <button className="cd-item-del" onClick={() => remove(p.id)} aria-label={`Quitar ${p.nombre}`}><FaTrashAlt /></button>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="cd-foot">
              <div className="cd-total"><span>Total</span><b>${total} MXN</b></div>
              <label className="cd-email-label" htmlFor="cd-email">Tu correo (te enviamos las descargas)</label>
              <input
                id="cd-email" type="email" inputMode="email" autoComplete="email"
                className="cd-email" placeholder="tucorreo@ejemplo.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
              {err && <p className="cd-err">{err}</p>}
              <button className="cd-pay" onClick={pagar} disabled={paying}>
                {paying ? 'Redirigiendo…' : (<><FaLock /> Pagar ${total} MXN</>)}
              </button>
              <p className="cd-secure"><FaShieldAlt /> Pago seguro con MercadoPago · descarga inmediata</p>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
