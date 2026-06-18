import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaFileAlt, FaCheckCircle, FaCreditCard, FaShieldAlt, FaSpinner,
  FaExclamationTriangle, FaLock, FaRegClock,
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'https://tesipedia-backend-service-production.up.railway.app';
const LOGO_URL = 'https://res.cloudinary.com/dbowaer8j/image/upload/f_auto,q_auto,w_200/v1743713944/Tesipedia-logo_n1liaw.png';

const fmt = (n) => '$' + new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);

const S = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg,#f8f9ff 0%,#eef1ff 100%)', fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: '#1a1a2e', padding: '0 0 60px' },
  header: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', display: 'flex', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 10 },
  logo: { height: '36px' },
  wrap: { maxWidth: '860px', margin: '0 auto', padding: '32px 16px 0' },
  card: { background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '28px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(15,12,41,0.04)' },
  title: { fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' },
  muted: { color: '#64748b', fontSize: '0.92rem' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', marginTop: '8px', borderTop: '2px solid #e2e8f0' },
  totalAmount: { fontSize: '2rem', fontWeight: 800, color: '#4F46E5' },
  sectionH: { fontSize: '1.05rem', fontWeight: 700, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' },
  li: { display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '6px 0', fontSize: '0.92rem', color: '#475569' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', margin: '0 0 6px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', marginBottom: '14px', boxSizing: 'border-box', fontFamily: 'inherit' },
  btnStripe: { width: '100%', padding: '15px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg,#4F46E5 0%,#7c3aed 100%)', color: '#fff', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px', boxShadow: '0 8px 22px rgba(79,70,229,0.3)' },
  btnPaypal: { width: '100%', padding: '15px', borderRadius: '14px', border: '1px solid #ffc439', background: '#ffc439', color: '#003087', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' },
  btnMp: { width: '100%', padding: '15px', borderRadius: '14px', border: 'none', background: '#009ee3', color: '#fff', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  trust: { display: 'flex', gap: '18px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px', fontSize: '0.82rem', color: '#64748b' },
  alert: (bg, color) => ({ background: bg, color, borderRadius: '12px', padding: '14px 16px', fontSize: '0.92rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }),
  center: { textAlign: 'center', padding: '80px 20px' },
};

function PublicQuote() {
  const { id: publicId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [guest, setGuest] = useState({ nombres: '', apellidos: '', correo: '' });
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState(null);
  const [status, setStatus] = useState(null); // 'success' | 'cancelled' | 'capturing'

  // Cargar la cotización pública
  const loadQuote = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/quotes/generated/public/${publicId}`);
      if (!res.ok) throw new Error(res.status === 404 ? 'Esta cotización no existe o el enlace es incorrecto.' : 'No se pudo cargar la cotización.');
      const data = await res.json();
      setQuote(data);
      if (data.status === 'paid') setStatus('success');
    } catch (e) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  useEffect(() => { loadQuote(); }, [loadQuote]);

  // Manejar el retorno de Stripe / PayPal
  useEffect(() => {
    const pago = searchParams.get('pago');
    const paypal = searchParams.get('paypal');
    const mp = searchParams.get('mp');
    const tt = searchParams.get('tt');

    if (pago === 'exitoso') {
      setStatus('success');
    } else if (pago === 'cancelado') {
      setStatus('cancelled');
    } else if (paypal === 'capturar' && tt) {
      // Capturar el pago de PayPal tras la aprobación
      setStatus('capturing');
      fetch(`${API_URL}/quotes/generated/paypal/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingToken: tt }),
      })
        .then((r) => r.json())
        .then((d) => setStatus(d.status === 'COMPLETED' || d.alreadyCaptured ? 'success' : 'cancelled'))
        .catch(() => setStatus('cancelled'));
    } else if (mp === 'retorno' && tt) {
      // Confirmar el pago de Mercado Pago tras el retorno (verificación server-side)
      setStatus('capturing');
      const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
      fetch(`${API_URL}/quotes/generated/mercadopago/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingToken: tt, paymentId }),
      })
        .then((r) => r.json())
        .then((d) => setStatus(d.status === 'approved' || d.alreadyConfirmed ? 'success' : 'cancelled'))
        .catch(() => setStatus('cancelled'));
    }
    // Limpiar los query params una vez procesados
    if (pago || paypal || mp) {
      const sp = new URLSearchParams(searchParams);
      ['pago', 'paypal', 'mp', 'tt', 'token', 'PayerID',
        'payment_id', 'collection_id', 'collection_status', 'status', 'external_reference',
        'merchant_order_id', 'preference_id', 'site_id', 'processing_mode', 'merchant_account_id'].forEach((k) => sp.delete(k));
      setSearchParams(sp, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formInvalid =
    guest.nombres.trim().length < 2 ||
    guest.apellidos.trim().length < 2 ||
    !guest.correo.includes('@');

  const startPayment = async (provider) => {
    if (formInvalid) { setPayError('Completa tus datos para continuar.'); return; }
    setPayError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/quotes/generated/public/${publicId}/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guest),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'No se pudo iniciar el pago.');
      const redirectUrl = data.sessionUrl || data.approvalUrl || data.initPoint;
      if (!redirectUrl) throw new Error('No se recibió la URL de pago.');
      window.location.href = redirectUrl;
    } catch (e) {
      setPayError(e.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.center}><FaSpinner className="fa-spin" style={{ fontSize: '2rem', color: '#4F46E5' }} /><p style={S.muted}>Cargando tu cotización…</p></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={S.page}>
        <header style={S.header}><img src={LOGO_URL} alt="Tesipedia" style={S.logo} /></header>
        <div style={S.center}>
          <FaExclamationTriangle style={{ fontSize: '2.4rem', color: '#f59e0b', marginBottom: '12px' }} />
          <h2 style={{ fontWeight: 800 }}>No encontramos tu cotización</h2>
          <p style={S.muted}>{loadError}</p>
        </div>
      </div>
    );
  }

  const isPaid = status === 'success';

  return (
    <div style={S.page}>
      <Helmet>
        <title>Tu Cotización — Tesipedia</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <header style={S.header}><img src={LOGO_URL} alt="Tesipedia" style={S.logo} /></header>

      <div style={S.wrap}>
        {status === 'cancelled' && (
          <div style={S.alert('#fef3c7', '#92400e')}><FaExclamationTriangle /> El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.</div>
        )}
        {status === 'capturing' && (
          <div style={S.alert('#e0e7ff', '#3730a3')}><FaSpinner className="fa-spin" /> Confirmando tu pago de PayPal…</div>
        )}
        {isPaid && (
          <div style={S.alert('#dcfce7', '#166534')}><FaCheckCircle /> ¡Pago confirmado! Recibirás un correo con los siguientes pasos. Gracias por confiar en Tesipedia.</div>
        )}

        {/* Resumen de la cotización */}
        <div style={S.card}>
          <h1 style={S.title}>{quote.tipoTrabajo || 'Cotización'}{quote.tituloTrabajo ? `: ${quote.tituloTrabajo}` : ''}</h1>
          <p style={S.muted}>Cotización para <strong>{quote.clientName}</strong></p>

          <div style={{ marginTop: '18px' }}>
            {quote.carrera && <div style={S.row}><span style={S.muted}>Carrera</span><span>{quote.carrera}</span></div>}
            {quote.area && <div style={S.row}><span style={S.muted}>Área</span><span>{quote.area}</span></div>}
            {quote.extensionEstimada && <div style={S.row}><span style={S.muted}>Extensión</span><span>{quote.extensionEstimada} págs.</span></div>}
            {quote.tiempoEntrega && <div style={S.row}><span style={S.muted}>Tiempo de entrega</span><span>{quote.tiempoEntrega}</span></div>}
            {quote.fechaEntrega && <div style={S.row}><span style={S.muted}>Fecha de entrega</span><span>{quote.fechaEntrega}</span></div>}
          </div>

          {quote.descripcionServicio && (
            <p style={{ ...S.muted, marginTop: '16px', lineHeight: 1.6 }}>{quote.descripcionServicio}</p>
          )}

          <div style={S.totalRow}>
            <div>
              <div style={S.muted}>Total</div>
              {quote.esquemaPago && <div style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '420px' }}>{quote.esquemaPago}</div>}
            </div>
            <div style={S.totalAmount}>{fmt(quote.precioConDescuento)} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>MXN</span></div>
          </div>
        </div>

        {/* Servicios incluidos */}
        {Array.isArray(quote.serviciosIncluidos) && quote.serviciosIncluidos.length > 0 && (
          <div style={S.card}>
            <h2 style={S.sectionH}><FaFileAlt style={{ color: '#4F46E5' }} /> Incluye</h2>
            {quote.serviciosIncluidos.map((s, i) => (
              <div key={i} style={S.li}><FaCheckCircle style={{ color: '#25d366', marginTop: '3px', flexShrink: 0 }} /> {s}</div>
            ))}
          </div>
        )}

        {/* Pago */}
        {!isPaid && (
          <div style={S.card}>
            <h2 style={S.sectionH}><FaLock style={{ color: '#4F46E5' }} /> Realiza tu pago de forma segura</h2>
            {payError && <div style={S.alert('#fee2e2', '#991b1b')}><FaExclamationTriangle /> {payError}</div>}

            <label style={S.label}>Nombre(s)</label>
            <input style={S.input} type="text" value={guest.nombres} onChange={(e) => setGuest({ ...guest, nombres: e.target.value })} placeholder="Tu nombre" />
            <label style={S.label}>Apellidos</label>
            <input style={S.input} type="text" value={guest.apellidos} onChange={(e) => setGuest({ ...guest, apellidos: e.target.value })} placeholder="Tus apellidos" />
            <label style={S.label}>Correo electrónico</label>
            <input style={S.input} type="email" value={guest.correo} onChange={(e) => setGuest({ ...guest, correo: e.target.value })} placeholder="correo@ejemplo.com" />

            <button
              style={{ ...S.btnStripe, ...(submitting || formInvalid ? S.btnDisabled : {}) }}
              disabled={submitting || formInvalid}
              onClick={() => startPayment('stripe')}>
              {submitting ? <FaSpinner className="fa-spin" /> : <FaCreditCard />} Pagar con tarjeta · {fmt(quote.precioConDescuento)}
            </button>
            <button
              style={{ ...S.btnPaypal, ...(submitting || formInvalid ? S.btnDisabled : {}) }}
              disabled={submitting || formInvalid}
              onClick={() => startPayment('paypal')}>
              {submitting ? <FaSpinner className="fa-spin" /> : null} Pagar con PayPal
            </button>
            <button
              style={{ ...S.btnMp, ...(submitting || formInvalid ? S.btnDisabled : {}) }}
              disabled={submitting || formInvalid}
              onClick={() => startPayment('mercadopago')}>
              {submitting ? <FaSpinner className="fa-spin" /> : null} Pagar con Mercado Pago
            </button>

            <div style={S.trust}>
              <span><FaShieldAlt style={{ color: '#25d366' }} /> Pago cifrado</span>
              <span><FaCreditCard style={{ color: '#4F46E5' }} /> Stripe · PayPal · Mercado Pago</span>
              <span><FaRegClock style={{ color: '#94a3b8' }} /> Confirmación inmediata</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicQuote;
