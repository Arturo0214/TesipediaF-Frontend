import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock, FaLockOpen, FaFileAlt, FaWhatsapp, FaSignOutAlt, FaCheckCircle,
  FaClock, FaExclamationCircle, FaChevronLeft, FaChevronRight, FaDownload,
  FaRegFilePdf, FaEye, FaShieldAlt, FaArrowLeft, FaSpinner,
} from 'react-icons/fa';
import { login, logout } from '../../features/auth/authSlice';
import axiosWithAuth from '../../utils/axioswithAuth';
import './ClientPortal.css';

const mxn = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(n) || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ═══════════ LOGIN ═══════════ */
function PortalLogin() {
  const dispatch = useDispatch();
  const { isLoading, isError, message } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="pt-auth">
      <motion.div className="pt-auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="pt-auth-brand"><span className="pt-logo">Tesipedia</span><span className="pt-auth-sub">Portal del cliente</span></div>
        <h1>Tu proyecto, en vivo</h1>
        <p className="pt-auth-lead">Sigue tus pagos, revisa tus documentos y habla con tu equipo — todo en un solo lugar.</p>
        <form onSubmit={(e) => { e.preventDefault(); dispatch(login({ email: email.trim(), password })); }}>
          <label>Usuario (correo o teléfono)
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu teléfono o correo" autoComplete="username" autoFocus />
          </label>
          <label>Contraseña
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </label>
          {isError && message && <div className="pt-auth-err">{message}</div>}
          <button type="submit" className="pt-btn pt-btn-primary pt-btn-block" disabled={isLoading || !email || !password}>
            {isLoading ? <><FaSpinner className="pt-spin" /> Entrando…</> : 'Entrar a mi portal'}
          </button>
        </form>
        <p className="pt-auth-help">¿No tienes tu acceso? Escríbenos por WhatsApp y te lo damos.</p>
      </motion.div>
      <div className="pt-auth-aside">
        <div className="pt-aside-inner">
          <FaShieldAlt className="pt-aside-ico" />
          <h2>Tus documentos, protegidos</h2>
          <ul>
            <li><FaCheckCircle /> Revisa tu trabajo en línea cuando quieras</li>
            <li><FaCheckCircle /> Tus pagos siempre claros y al día</li>
            <li><FaCheckCircle /> Contacto directo con tu equipo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ VISOR PROTEGIDO ═══════════ */
function ProtectedViewer({ docId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axiosWithAuth.get(`/portal/documents/${docId}`);
        if (alive) { setData(data); setLoading(false); }
      } catch (e) { if (alive) { setErr('No se pudo abrir el documento'); setLoading(false); } }
    })();
    return () => { alive = false; };
  }, [docId]);

  // Bloquear menú contextual / arrastre dentro del visor
  const noCtx = (e) => e.preventDefault();

  const pages = data?.pages || [];
  const go = (d) => setIdx((i) => Math.max(0, Math.min(pages.length - 1, i + d)));

  return (
    <motion.div className="pt-viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onContextMenu={noCtx}>
      <div className="pt-viewer-bar">
        <button className="pt-btn pt-btn-ghost" onClick={onClose}><FaArrowLeft /> Volver</button>
        <div className="pt-viewer-title">{data?.title || 'Documento'}</div>
        <div className="pt-viewer-right">
          {data?.locked
            ? <span className="pt-chip pt-chip-lock"><FaLock /> Vista previa</span>
            : <span className="pt-chip pt-chip-open"><FaLockOpen /> Liberado</span>}
          {data?.download && <a className="pt-btn pt-btn-primary" href={data.download}><FaDownload /> Descargar PDF</a>}
        </div>
      </div>

      {loading && <div className="pt-viewer-center"><FaSpinner className="pt-spin pt-big" /></div>}
      {err && <div className="pt-viewer-center pt-err">{err}</div>}

      {!loading && !err && (
        <>
          {data?.locked && (
            <div className="pt-viewer-note">
              <FaShieldAlt /> Vista previa protegida · las referencias se liberan al completar tu pago.
            </div>
          )}
          <div className="pt-pagewrap" onContextMenu={noCtx}>
            {pages.length ? (
              <div className="pt-page">
                <img src={pages[idx].url} alt={`Página ${pages[idx].page}`} draggable={false} onContextMenu={noCtx} className="pt-page-img" />
                <div className="pt-page-guard" onContextMenu={noCtx} />
              </div>
            ) : <div className="pt-viewer-center">Este documento aún no tiene páginas disponibles.</div>}
          </div>
          {pages.length > 1 && (
            <div className="pt-pager">
              <button className="pt-btn pt-btn-ghost" onClick={() => go(-1)} disabled={idx === 0}><FaChevronLeft /></button>
              <span>{idx + 1} / {pages.length}</span>
              <button className="pt-btn pt-btn-ghost" onClick={() => go(1)} disabled={idx === pages.length - 1}><FaChevronRight /></button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

/* ═══════════ DASHBOARD ═══════════ */
function PortalDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [projects, setProjects] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDoc, setOpenDoc] = useState(null);

  const load = useCallback(async () => {
    try {
      const [p, d] = await Promise.all([
        axiosWithAuth.get('/projects/client').catch(() => ({ data: [] })),
        axiosWithAuth.get('/portal/documents').catch(() => ({ data: [] })),
      ]);
      setProjects(p.data || []);
      setDocs(d.data || []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  // Pagos agregados de todos los proyectos
  const schedule = projects.flatMap((p) => (p.payment?.schedule || []).map((s) => ({ ...s, proyecto: p.taskTitle })));
  const total = projects.reduce((t, p) => t + (p.payment?.amount || 0), 0);
  const pagado = schedule.filter((s) => s.status === 'paid').reduce((t, s) => t + (s.amount || 0), 0);
  const pct = total ? Math.round((pagado / total) * 100) : 0;

  const saludo = (user?.name || 'Cliente').split(' ')[0];

  return (
    <div className="pt-shell">
      <header className="pt-top">
        <div className="pt-top-brand"><span className="pt-logo">Tesipedia</span></div>
        <div className="pt-top-right">
          <span className="pt-top-user">Hola, {saludo}</span>
          <button className="pt-btn pt-btn-ghost" onClick={() => dispatch(logout())}><FaSignOutAlt /> Salir</button>
        </div>
      </header>

      <main className="pt-main">
        <motion.section className="pt-hero" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1>Tu proyecto</h1>
            <p>{projects[0]?.taskTitle || 'Bienvenido a tu portal'}</p>
          </div>
          <a className="pt-btn pt-btn-wa" href="https://wa.me/5215583352096" target="_blank" rel="noreferrer"><FaWhatsapp /> Chatear con mi equipo</a>
        </motion.section>

        {loading ? (
          <div className="pt-center"><FaSpinner className="pt-spin pt-big" /></div>
        ) : (
          <div className="pt-grid">
            {/* Pagos */}
            <motion.div className="pt-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="pt-card-head"><h2>Mis pagos</h2><span className="pt-pct">{pct}% pagado</span></div>
              <div className="pt-prog"><div className="pt-prog-fill" style={{ width: `${pct}%` }} /></div>
              <div className="pt-pay-totals">
                <div><small>Pagado</small><b>{mxn(pagado)}</b></div>
                <div><small>Total</small><b>{mxn(total)}</b></div>
              </div>
              <div className="pt-pay-list">
                {schedule.length ? schedule.map((s, i) => {
                  const paid = s.status === 'paid';
                  const overdue = !paid && s.dueDate && new Date(s.dueDate) < new Date();
                  const cls = paid ? 'paid' : overdue ? 'overdue' : 'pending';
                  return (
                    <div key={i} className={`pt-pay-item ${cls}`}>
                      <span className="pt-pay-ico">{paid ? <FaCheckCircle /> : overdue ? <FaExclamationCircle /> : <FaClock />}</span>
                      <div className="pt-pay-info"><b>{s.label || `Pago ${s.number}`}</b><small>{paid ? 'Pagado' : `Vence ${fmtDate(s.dueDate)}`}</small></div>
                      <span className="pt-pay-amt">{mxn(s.amount)}</span>
                    </div>
                  );
                }) : <p className="pt-empty">Tu plan de pagos aparecerá aquí.</p>}
              </div>
            </motion.div>

            {/* Documentos */}
            <motion.div className="pt-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="pt-card-head"><h2>Mis documentos</h2></div>
              <div className="pt-doc-list">
                {docs.length ? docs.map((d) => (
                  <button key={d.id} className="pt-doc" onClick={() => setOpenDoc(d.id)}>
                    <span className="pt-doc-ico"><FaRegFilePdf /></span>
                    <div className="pt-doc-info">
                      <b>{d.title}</b>
                      <small>{d.visiblePages} página{d.visiblePages !== 1 ? 's' : ''} · {d.locked ? 'Vista previa' : 'Liberado'}</small>
                    </div>
                    <span className={`pt-doc-badge ${d.locked ? 'lock' : 'open'}`}>{d.locked ? <FaLock /> : <FaLockOpen />} <FaEye /></span>
                  </button>
                )) : (
                  <div className="pt-empty-docs">
                    <FaFileAlt />
                    <p>Aún no hay documentos. Cuando tu equipo suba tu avance, aparecerá aquí para que lo revises.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {openDoc && <ProtectedViewer docId={openDoc} onClose={() => setOpenDoc(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ ENTRADA ═══════════ */
export default function ClientPortal() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  return (
    <>
      <Helmet><title>Portal del cliente — Tesipedia</title><meta name="robots" content="noindex" /></Helmet>
      {isAuthenticated && user ? <PortalDashboard /> : <PortalLogin />}
    </>
  );
}
