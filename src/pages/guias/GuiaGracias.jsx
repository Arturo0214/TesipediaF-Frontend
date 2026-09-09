import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FaCheckCircle, FaDownload, FaEnvelope, FaSpinner, FaWhatsapp, FaArrowLeft, FaFilePdf, FaFileArchive,
} from 'react-icons/fa';
import './GuiaGracias.css';

const API = (import.meta.env.VITE_SOCKET_URL || import.meta.env.API_URL || '').replace(/\/$/, '') || window.location.origin;
const WA = 'https://wa.me/525670071517?text=Hola%2C%20compr%C3%A9%20una%20gu%C3%ADa%20y%20necesito%20ayuda%20con%20mi%20descarga';

const iconFor = (label = '') => (/zip|láminas|plantilla|editable/i.test(label) ? <FaFileArchive /> : <FaFilePdf />);

export default function GuiaGracias() {
  const [params] = useSearchParams();
  const [state, setState] = useState('loading'); // loading | ok | pending | error
  const [data, setData] = useState(null);

  useEffect(() => {
    // MercadoPago regresa payment_id / status; Stripe manda ref. También aceptamos token directo (del correo).
    const token = params.get('token');
    const proveedor = params.get('proveedor') === 'stripe' ? 'stripe' : 'mp';
    const ref = params.get('ref') || params.get('payment_id') || params.get('collection_id') || params.get('preference_id');
    const status = params.get('status') || params.get('collection_status');

    if (!token && !ref) { setState('error'); return; }

    const qs = token ? `token=${encodeURIComponent(token)}` : `proveedor=${proveedor}&ref=${encodeURIComponent(ref)}&product=${encodeURIComponent(params.get('product') || '')}`;
    let tries = 0;
    let timer = null;

    const poll = () => {
      fetch(`${API}/guias/verificar?${qs}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.pagado) { setData(d); setState('ok'); return; }
          // El webhook puede tardar unos segundos en confirmar. Reintentamos un par de veces.
          if (tries < 4 && status !== 'rejected' && status !== 'failure') {
            tries += 1; timer = setTimeout(poll, 2500);
          } else {
            setState('pending');
          }
        })
        .catch(() => setState('error'));
    };
    poll();
    return () => timer && clearTimeout(timer);
  }, [params]);

  return (
    <div className="gg">
      <Helmet><title>Tu descarga — Tesipedia</title><meta name="robots" content="noindex" /></Helmet>

      <div className="gg-card">
        {state === 'loading' && (
          <div className="gg-center">
            <FaSpinner className="gg-spin" />
            <h1>Confirmando tu pago…</h1>
            <p>Un momento, estamos verificando la transacción de forma segura.</p>
          </div>
        )}

        {state === 'ok' && data && (
          <>
            <span className="gg-check"><FaCheckCircle /></span>
            <h1>¡Listo! Tu guía está aquí 🎓</h1>
            <p className="gg-sub">
              Gracias por tu compra de <strong>{data.productName}</strong>.
              {data.emailed && <> También te la enviamos a <strong>{data.email}</strong>.</>}
            </p>

            <div className="gg-files">
              {(data.archivos || []).map((a) => (
                <a key={a.url} className="gg-file" href={a.url} target="_blank" rel="noopener noreferrer">
                  <span className="gg-file-ico">{iconFor(a.label)}</span>
                  <span className="gg-file-label">{a.label}</span>
                  <FaDownload className="gg-file-dl" />
                </a>
              ))}
            </div>

            <p className="gg-mail"><FaEnvelope /> Guarda el correo: tus enlaces siguen activos 30 días.</p>
            <Link to="/" className="gg-back"><FaArrowLeft /> Volver al inicio</Link>
          </>
        )}

        {state === 'pending' && (
          <div className="gg-center">
            <span className="gg-check gg-check-wait"><FaCheckCircle /></span>
            <h1>Tu pago se está confirmando</h1>
            <p>En cuanto se acredite (suele ser inmediato) te enviaremos la guía a tu correo. Si pagaste en efectivo, puede tardar un poco más.</p>
            <a className="gg-wa" href={WA} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> Avísanos si necesitas ayuda</a>
            <Link to="/" className="gg-back"><FaArrowLeft /> Volver al inicio</Link>
          </div>
        )}

        {state === 'error' && (
          <div className="gg-center">
            <h1>No pudimos confirmar tu descarga</h1>
            <p>Si ya realizaste el pago, escríbenos y te la enviamos enseguida. Ten a la mano tu correo de compra.</p>
            <a className="gg-wa" href={WA} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> Recuperar mi descarga</a>
            <Link to="/guias/apa-7" className="gg-back"><FaArrowLeft /> Ver la guía</Link>
          </div>
        )}
      </div>
    </div>
  );
}
