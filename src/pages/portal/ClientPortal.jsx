import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock, FaLockOpen, FaFileAlt, FaWhatsapp, FaSignOutAlt, FaCheckCircle,
  FaClock, FaExclamationCircle, FaDownload, FaRegFilePdf, FaEye, FaShieldAlt,
  FaArrowLeft, FaSpinner, FaMoneyBillWave, FaRegComments, FaUserCircle,
  FaPaperPlane, FaBars, FaFolderOpen, FaRobot, FaBookOpen, FaExternalLinkAlt,
} from 'react-icons/fa';
import { login, logout } from '../../features/auth/authSlice';
import axiosWithAuth from '../../utils/axioswithAuth';
import './ClientPortal.css';

const mxn = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(n) || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

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
        <p className="pt-auth-lead">Sigue tus pagos, revisa tu documento y deja tus comentarios — todo en un solo lugar.</p>
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
          <h2>Tu documento, protegido</h2>
          <ul>
            <li><FaCheckCircle /> Lee tu trabajo completo en línea</li>
            <li><FaCheckCircle /> Tus pagos siempre claros y al día</li>
            <li><FaCheckCircle /> Escáner anti-IA y guías incluidos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ VISOR PROTEGIDO (scroll continuo: se ve TODO) ═══════════ */
function ProtectedViewer({ docId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axiosWithAuth.get(`/portal/documents/${docId}`);
        if (alive) { setData(data); setLoading(false); }
      } catch { if (alive) { setErr('No se pudo abrir el documento'); setLoading(false); } }
    })();
    return () => { alive = false; };
  }, [docId]);
  const noCtx = (e) => e.preventDefault();
  const pages = data?.pages || [];
  return (
    <motion.div className="pt-viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onContextMenu={noCtx}>
      <div className="pt-viewer-bar">
        <button className="pt-btn pt-btn-ghost" onClick={onClose}><FaArrowLeft /> Volver</button>
        <div className="pt-viewer-title">{data?.title || 'Documento'}</div>
        <div className="pt-viewer-right">
          {data?.locked ? <span className="pt-chip pt-chip-lock"><FaLock /> {pages.length} págs · con marca de agua</span> : <span className="pt-chip pt-chip-open"><FaLockOpen /> Liberado</span>}
          {data?.download && <a className="pt-btn pt-btn-primary" href={data.download}><FaDownload /> Descargar PDF</a>}
        </div>
      </div>
      {loading && <div className="pt-viewer-center"><FaSpinner className="pt-spin pt-big" /></div>}
      {err && <div className="pt-viewer-center pt-err">{err}</div>}
      {!loading && !err && (
        <>
          {data?.locked && <div className="pt-viewer-note"><FaShieldAlt /> Documento completo con marca de agua · la sección de referencias se libera al completar tu pago.</div>}
          <div className="pt-pagewrap" onContextMenu={noCtx}>
            {pages.length ? pages.map((p, i) => (
              <div className="pt-page" key={i}>
                <span className="pt-page-num">Página {p.page}</span>
                <img src={p.url} alt={`Página ${p.page}`} draggable={false} onContextMenu={noCtx} className="pt-page-img" loading="lazy" />
                <div className="pt-page-guard" onContextMenu={noCtx} />
              </div>
            )) : <div className="pt-viewer-center" style={{ color: '#cfe0ff' }}>Este documento aún no tiene páginas disponibles.</div>}
          </div>
        </>
      )}
    </motion.div>
  );
}

/* Anti-captura: oscurece el contenido al salir de la ventana / cambiar de pestaña
   y al detectar PrintScreen o Ctrl/Cmd+P. No es infalible (web), pero disuade. */
function useScreenGuard() {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const vis = () => setHide(document.hidden);
    const onBlur = () => setHide(true);
    const onFocus = () => setHide(false);
    const onKey = (e) => {
      if (e.key === 'PrintScreen') { setHide(true); try { navigator.clipboard.writeText(' '); } catch { /* noop */ } setTimeout(() => setHide(document.hidden), 1600); }
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'p') { e.preventDefault(); setHide(true); setTimeout(() => setHide(document.hidden), 1600); }
    };
    document.addEventListener('visibilitychange', vis);
    window.addEventListener('blur', onBlur); window.addEventListener('focus', onFocus);
    window.addEventListener('keyup', onKey); window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('visibilitychange', vis); window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus); window.removeEventListener('keyup', onKey); window.removeEventListener('keydown', onKey); };
  }, []);
  return hide;
}

/* ═══════════ VISOR INLINE (dentro de Documentos) ═══════════ */
function DocViewerInline({ docId, clientName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const guard = useScreenGuard();
  useEffect(() => {
    let alive = true;
    (async () => {
      try { const { data } = await axiosWithAuth.get(`/portal/documents/${docId}`); if (alive) { setData(data); setLoading(false); } }
      catch { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [docId]);
  const noCtx = (e) => e.preventDefault();
  const pages = data?.pages || [];
  const wm = (clientName || 'TESIPEDIA').toUpperCase();
  if (loading) return <div className="pt-center"><FaSpinner className="pt-spin pt-big" /></div>;

  // Candado por pago: si no ha pagado, no puede ver
  if (data?.cannotView) {
    return (
      <div className="pt-doc-locked">
        <FaLock />
        <h3>Documento bloqueado</h3>
        <p>{data.message || 'Realiza tu primer pago para desbloquear la lectura de tu documento.'}</p>
      </div>
    );
  }
  return (
    <div className="pt-inlinedoc" onContextMenu={noCtx}>
      {data?.locked
        ? <div className="pt-legend"><FaLock /> <span>Lo ves con marca de agua y la sección de referencias oculta. Una vez que estés al corriente con tus pagos podrás <b>descargar el documento completo con su bibliografía</b> y revisarlo sin marca de agua.</span></div>
        : <div className="pt-legend open"><FaLockOpen /> <span>¡Documento liberado! Ya puedes descargarlo completo con su bibliografía.</span>{data?.download && <a className="pt-btn pt-btn-primary pt-legend-dl" href={data.download}><FaDownload /> Descargar PDF</a>}</div>}
      <div className={`pt-doc-pages ${guard ? 'guarded' : ''}`}>
        {guard && <div className="pt-guard-overlay"><FaShieldAlt /> Contenido protegido</div>}
        {pages.length ? pages.map((p, i) => (
          <div className="pt-docpage" key={i}>
            <span className="pt-page-num">Página {p.page}</span>
            <img src={p.url} alt={`Página ${p.page}`} draggable={false} onContextMenu={noCtx} loading="lazy" />
            <div className="pt-wm" aria-hidden>{Array.from({ length: 10 }).map((_, k) => <span key={k}>{wm} · MUESTRA</span>)}</div>
            <div className="pt-page-guard" onContextMenu={noCtx} />
          </div>
        )) : <p className="pt-empty">Tu documento aún no tiene páginas disponibles.</p>}
      </div>
    </div>
  );
}

/* ═══════════ COMENTARIOS ═══════════ */
function Comentarios() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const load = useCallback(async () => {
    try { const { data } = await axiosWithAuth.get('/portal/messages'); setItems(data || []); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [items]);
  const enviar = async () => {
    const t = text.trim(); if (!t) return;
    setSending(true);
    try { const { data } = await axiosWithAuth.post('/portal/messages', { text: t }); setItems((p) => [...p, data]); setText(''); }
    finally { setSending(false); }
  };
  return (
    <div className="pt-card pt-com-card">
      <div className="pt-card-head"><h2>Comentarios</h2><small>Deja aquí tus observaciones; tu equipo las verá y responderá.</small></div>
      <div className="pt-com-list">
        {loading ? <div className="pt-center"><FaSpinner className="pt-spin" /></div>
          : items.length ? items.map((m) => (
            <div key={m.id} className={`pt-com ${m.from === 'client' ? 'mine' : 'team'}`}>
              <div className="pt-com-bubble">
                <div className="pt-com-meta">{m.from === 'client' ? 'Tú' : (m.authorName || 'Equipo Tesipedia')} · {fmtDateTime(m.createdAt)}</div>
                <div className="pt-com-text">{m.text}</div>
              </div>
            </div>
          )) : <p className="pt-empty">Aún no hay comentarios. Escribe el primero 👇</p>}
        <div ref={endRef} />
      </div>
      <div className="pt-com-input">
        <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un comentario para tu equipo…"
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) enviar(); }} />
        <button className="pt-btn pt-btn-primary" disabled={sending || !text.trim()} onClick={enviar}>
          {sending ? <FaSpinner className="pt-spin" /> : <><FaPaperPlane /> Enviar</>}
        </button>
      </div>
    </div>
  );
}

/* Cambiar contraseña */
function ChangePassword() {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [conf, setConf] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const submit = async () => {
    setMsg(null);
    if (nueva.length < 6) { setMsg({ err: true, t: 'La nueva contraseña debe tener al menos 6 caracteres' }); return; }
    if (nueva !== conf) { setMsg({ err: true, t: 'Las contraseñas no coinciden' }); return; }
    setSaving(true);
    try { await axiosWithAuth.post('/portal/change-password', { actual, nueva }); setMsg({ err: false, t: '¡Contraseña actualizada! ✅' }); setActual(''); setNueva(''); setConf(''); }
    catch (e) { setMsg({ err: true, t: e.response?.data?.message || 'No se pudo cambiar la contraseña' }); }
    finally { setSaving(false); }
  };
  return (
    <div className="pt-pwd">
      <h3>Cambiar contraseña</h3>
      <div className="pt-pwd-grid">
        <input type="password" placeholder="Contraseña actual" value={actual} onChange={(e) => setActual(e.target.value)} autoComplete="current-password" />
        <input type="password" placeholder="Nueva contraseña" value={nueva} onChange={(e) => setNueva(e.target.value)} autoComplete="new-password" />
        <input type="password" placeholder="Confirmar nueva contraseña" value={conf} onChange={(e) => setConf(e.target.value)} autoComplete="new-password" />
      </div>
      {msg && <div className={`pt-pwd-msg ${msg.err ? 'err' : 'ok'}`}>{msg.t}</div>}
      <button className="pt-btn pt-btn-primary" disabled={saving || !nueva} onClick={submit}>
        {saving ? <><FaSpinner className="pt-spin" /> Guardando…</> : 'Actualizar contraseña'}
      </button>
    </div>
  );
}

/* ═══════════ ESCÁNER (anti-IA / antiplagio) ═══════════ */
function EscanerSection() {
  const [sent, setSent] = useState('');
  const [busy, setBusy] = useState('');
  const solicitar = async (tipo, precio) => {
    setBusy(tipo);
    try {
      await axiosWithAuth.post('/portal/messages', { text: `🔍 Solicito *${tipo}* — $${precio} MXN. Por favor envíenme el enlace de pago y las instrucciones para mi revisión.` });
      setSent(tipo);
    } catch { /* noop */ } finally { setBusy(''); }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="pt-card">
        <div className="pt-card-head"><h2>Escáner anti-IA y antiplagio</h2><small>Revisa tu documento antes de entregarlo</small></div>
        <p className="pt-empty" style={{ marginBottom: 18 }}>Elige el tipo de revisión. Al solicitarla, tu equipo te envía el enlace de pago y procesa tu escaneo.</p>
        <div className="pt-tools-grid">
          <div className="pt-tool-card">
            <div className="pt-tool-ico blue"><FaRobot /></div>
            <h3>Escáner local</h3>
            <p>Detección anti-IA + antiplagio con nuestro motor. Revisión rápida y confiable.</p>
            <div className="pt-tool-price">$100 <small>MXN</small></div>
            {sent === 'Escáner local'
              ? <div className="pt-tool-done">✅ Solicitud enviada. Te contactamos con el pago.</div>
              : <button className="pt-btn pt-btn-primary pt-btn-block" disabled={!!busy} onClick={() => solicitar('Escáner local', 100)}>{busy === 'Escáner local' ? 'Enviando…' : 'Solicitar — $100'}</button>}
          </div>
          <div className="pt-tool-card">
            <div className="pt-tool-ico purple"><FaShieldAlt /></div>
            <h3>Compilatio Studium</h3>
            <p>Revisión profesional con Compilatio Studium: reporte oficial de similitud.</p>
            <div className="pt-tool-price">$500 <small>MXN / revisión</small></div>
            {sent === 'Compilatio Studium'
              ? <div className="pt-tool-done">✅ Solicitud enviada. Te contactamos con el pago.</div>
              : <button className="pt-btn pt-btn-primary pt-btn-block" disabled={!!busy} onClick={() => solicitar('Compilatio Studium', 500)}>{busy === 'Compilatio Studium' ? 'Enviando…' : 'Solicitar — $500'}</button>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════ GUÍAS (tienda con MercadoPago) ═══════════ */
function GuiasSection({ email }) {
  const [prods, setProds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  useEffect(() => {
    axiosWithAuth.get('/guias/productos')
      .then((r) => setProds(Array.isArray(r.data) ? r.data : (r.data?.productos || [])))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);
  const comprar = async (id) => {
    setBusy(id);
    try {
      const { data } = await axiosWithAuth.post('/guias/checkout', { productId: id, email: email || '' });
      if (data?.url) window.location.href = data.url;
      else setBusy('');
    } catch { setBusy(''); }
  };
  return (
    <motion.div className="pt-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="pt-card-head"><h2>Guías de tesis</h2><small>Paga seguro con MercadoPago y descárgalas al instante</small></div>
      {loading ? <div className="pt-center"><FaSpinner className="pt-spin pt-big" /></div>
        : prods.length ? (
          <div className="pt-guias-grid">
            {prods.map((p) => {
              const id = p.id || p._id; const nombre = p.nombre || p.titulo || p.name || 'Guía';
              const precio = p.precio ?? p.price ?? p.monto;
              return (
                <div key={id} className="pt-guia-card">
                  <div className="pt-guia-ico"><FaBookOpen /></div>
                  <div className="pt-guia-info"><b>{nombre}</b>{p.descripcion && <small>{p.descripcion}</small>}</div>
                  <div className="pt-guia-foot">
                    <span className="pt-guia-price">{precio != null ? mxn(precio) : ''}</span>
                    <button className="pt-btn pt-btn-primary" disabled={busy === id} onClick={() => comprar(id)}>{busy === id ? 'Abriendo…' : 'Comprar'}</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="pt-empty">Pronto habrá guías disponibles aquí.</p>}
    </motion.div>
  );
}

/* Anillo de progreso animado */
function Ring({ pct = 0, size = 118, stroke = 11 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, pct)) / 100) * c;
  const mid = size / 2;
  return (
    <svg width={size} height={size} className="pt-ring" viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="ptRingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <circle cx={mid} cy={mid} r={r} stroke="rgba(255,255,255,.16)" strokeWidth={stroke} fill="none" />
      <circle cx={mid} cy={mid} r={r} stroke="url(#ptRingGrad)" strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${mid} ${mid})`} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="26" fontWeight="800">{pct}%</text>
      <text x="50%" y="63%" textAnchor="middle" dominantBaseline="central" fill="#cfe0ff" fontSize="11" fontWeight="600">pagado</text>
    </svg>
  );
}

/* ═══════════ DASHBOARD ═══════════ */
const NAV = [
  { k: 'proyecto', label: 'Mi proyecto', icon: FaFolderOpen },
  { k: 'pagos', label: 'Pagos', icon: FaMoneyBillWave },
  { k: 'documentos', label: 'Documentos', icon: FaFileAlt },
  { k: 'comentarios', label: 'Comentarios', icon: FaRegComments },
  { k: 'perfil', label: 'Mi perfil', icon: FaUserCircle },
];
const TOOLS = [
  { k: 'escaner', label: 'Escáner anti-IA', icon: FaRobot },
  { k: 'guias', label: 'Guías de tesis', icon: FaBookOpen },
];
const ALL_NAV = [...NAV, ...TOOLS];

function PortalDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [sec, setSec] = useState('proyecto');
  const [projects, setProjects] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDoc, setOpenDoc] = useState(null);
  const [docSel, setDocSel] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, d] = await Promise.all([
        axiosWithAuth.get('/projects/client').catch(() => ({ data: [] })),
        axiosWithAuth.get('/portal/documents').catch(() => ({ data: [] })),
      ]);
      setProjects(p.data || []); setDocs(d.data || []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const proj = projects[0] || null;
  const schedule = projects.flatMap((p) => (p.payment?.schedule || []).map((s) => ({ ...s })));
  const total = projects.reduce((t, p) => t + (p.payment?.amount || 0), 0);
  const pagado = schedule.filter((s) => s.status === 'paid').reduce((t, s) => t + (s.amount || 0), 0);
  const pct = total ? Math.round((pagado / total) * 100) : 0;
  const nPagados = schedule.filter((s) => s.status === 'paid').length;
  const saludo = (user?.name || 'Cliente').split(' ')[0];

  // Línea de tiempo: entregas acordadas + archivos subidos (con sus fechas)
  const eventos = [];
  if (proj?.createdAt) eventos.push({ date: proj.createdAt, tipo: 'inicio', icon: '🚀', titulo: 'Proyecto iniciado', sub: '' });
  for (const d of docs) eventos.push({ date: d.createdAt, tipo: 'archivo', icon: '📄', titulo: d.title, sub: `Archivo subido · ${d.locked ? 'vista previa' : 'liberado'}`, docId: d.id });
  for (const p of projects) for (const r of (p.revisions || [])) eventos.push({ date: r.createdAt, tipo: 'entrega', icon: '📦', titulo: r.label || `Entrega v${r.version}`, sub: r.status || '' });
  if (proj?.dueDate) eventos.push({ date: proj.dueDate, tipo: 'acordada', icon: '📅', titulo: 'Entrega acordada', sub: 'Fecha pactada de entrega' });
  eventos.sort((a, b) => new Date(a.date) - new Date(b.date));

  const Nav = () => (
    <nav className={`pt-side ${navOpen ? 'open' : ''}`}>
      <div className="pt-side-brand"><span className="pt-logo">Tesipedia</span></div>
      <div className="pt-side-user">
        <FaUserCircle className="pt-side-avatar" />
        <div><b>{user?.name || 'Cliente'}</b>{user?.clientNumber && <small>Cliente #{user.clientNumber}</small>}</div>
      </div>
      <div className="pt-side-nav">
        {NAV.map((n) => (
          <button key={n.k} className={`pt-side-link ${sec === n.k ? 'active' : ''}`} onClick={() => { setSec(n.k); setNavOpen(false); }}>
            <n.icon /> {n.label}
          </button>
        ))}
        <div className="pt-side-group">Herramientas</div>
        {TOOLS.map((t) => (
          <button key={t.k} className={`pt-side-link ${sec === t.k ? 'active' : ''}`} onClick={() => { setSec(t.k); setNavOpen(false); }}>
            <t.icon /> {t.label}
          </button>
        ))}
      </div>
      <button className="pt-side-logout" onClick={() => dispatch(logout())}><FaSignOutAlt /> Cerrar sesión</button>
    </nav>
  );

  return (
    <div className="pt-app">
      <Nav />
      {navOpen && <div className="pt-side-backdrop" onClick={() => setNavOpen(false)} />}
      <div className="pt-content">
        <header className="pt-appbar">
          <button className="pt-hamb" onClick={() => setNavOpen(true)}><FaBars /></button>
          <span className="pt-appbar-title">{ALL_NAV.find((n) => n.k === sec)?.label}</span>
          <a className="pt-btn pt-btn-wa pt-appbar-wa" href="https://wa.me/5215583352096" target="_blank" rel="noreferrer"><FaWhatsapp /> <span>WhatsApp</span></a>
        </header>

        <main className="pt-main">
          {loading ? <div className="pt-center"><FaSpinner className="pt-spin pt-big" /></div> : (
            <>
              {/* ── MI PROYECTO ── */}
              {sec === 'proyecto' && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <section className="pt-hero">
                    <div className="pt-hero-glow" />
                    <div className="pt-hero-main">
                      <span className="pt-hero-hi">Hola, {saludo} 👋</span>
                      <h1>{proj?.taskTitle || 'Tu proyecto'}</h1>
                      {proj && <p>{proj.taskType || ''}{proj.educationLevel ? ` · ${proj.educationLevel}` : ''}{proj.pages ? ` · ${proj.pages} págs.` : ''}</p>}
                      <div className="pt-hero-chips">
                        {proj?.dueDate && <span className="pt-hero-chip">📅 Entrega acordada · {fmtDate(proj.dueDate)}</span>}
                        <span className="pt-hero-chip">{proj?.status === 'completed' ? '✅ Terminado' : '⏳ En curso'}</span>
                      </div>
                    </div>
                    <div className="pt-hero-ring"><Ring pct={pct} /></div>
                  </section>
                  <div className="pt-stats">
                    <div className="pt-stat"><span className="pt-stat-ico green"><FaCheckCircle /></span><div><b>{pct}%</b><small>Pagado</small></div></div>
                    <div className="pt-stat"><span className="pt-stat-ico amber"><FaMoneyBillWave /></span><div><b>{nPagados}/{schedule.length}</b><small>Pagos</small></div></div>
                    <div className="pt-stat"><span className="pt-stat-ico purple"><FaRegFilePdf /></span><div><b>{docs.length}</b><small>Archivo{docs.length !== 1 ? 's' : ''}</small></div></div>
                    <div className="pt-stat"><span className="pt-stat-ico blue"><FaFolderOpen /></span><div><b>{proj?.status === 'completed' ? 'Listo' : 'En curso'}</b><small>Estado</small></div></div>
                  </div>
                  <div className="pt-card pt-cta">
                    <div>
                      <h2>Tu documento y avances</h2>
                      <p className="pt-empty">Revisa tu documento completo (con marca de agua) y la línea de tiempo de tus archivos y entregas en la sección Documentos.</p>
                    </div>
                    <button className="pt-btn pt-btn-primary" onClick={() => setSec('documentos')}><FaFolderOpen /> Ir a Documentos</button>
                  </div>
                </motion.div>
              )}

              {/* ── PAGOS ── */}
              {sec === 'pagos' && (
                <motion.div className="pt-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="pt-card-head"><h2>Mis pagos</h2><span className="pt-pct">{pct}% pagado</span></div>
                  <div className="pt-prog"><div className="pt-prog-fill" style={{ width: `${pct}%` }} /></div>
                  <div className="pt-pay-totals"><div><small>Pagado</small><b>{mxn(pagado)}</b></div><div><small>Total</small><b>{mxn(total)}</b></div></div>
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
              )}

              {/* ── DOCUMENTOS (línea de tiempo + visor inline con marca de agua + leyenda) ── */}
              {sec === 'documentos' && (() => {
                const selId = docSel || docs[0]?.id;
                const selMeta = docs.find((d) => d.id === selId);
                return (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Línea de tiempo: archivos subidos vs entregas acordadas */}
                    <div className="pt-card">
                      <div className="pt-card-head"><h2>Línea de tiempo</h2><small>Cada archivo subido y las entregas acordadas</small></div>
                      {eventos.length ? (
                        <div className="pt-timeline">
                          {eventos.map((e, i) => (
                            <div key={i} className={`pt-tl-item ${e.tipo}`}>
                              <span className="pt-tl-dot">{e.icon}</span>
                              <div className="pt-tl-body">
                                <b>{e.titulo}</b>
                                <small>{fmtDate(e.date)}{e.sub ? ` · ${e.sub}` : ''}</small>
                                {e.docId && <button className="pt-tl-open" onClick={() => { setDocSel(e.docId); }}><FaEye /> Ver este archivo</button>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="pt-empty">Los archivos subidos y las entregas acordadas aparecerán aquí.</p>}
                    </div>

                    {/* Documento con visor inline (marca de agua + leyenda) */}
                    <div className="pt-card">
                      <div className="pt-card-head">
                        <h2>{selMeta?.title || 'Mi documento'}</h2>
                        {selMeta && <small>{selMeta.visiblePages} páginas · subido {fmtDate(selMeta.createdAt)}</small>}
                      </div>
                      {docs.length ? (
                        <>
                          {docs.length > 1 && (
                            <div className="pt-doc-tabs">
                              {docs.map((d) => (
                                <button key={d.id} className={`pt-doc-tab ${selId === d.id ? 'active' : ''}`} onClick={() => setDocSel(d.id)}>
                                  <FaRegFilePdf /> {d.title}
                                </button>
                              ))}
                            </div>
                          )}
                          {selId && <DocViewerInline docId={selId} clientName={user?.name} />}
                        </>
                      ) : <div className="pt-empty-docs"><FaFileAlt /><p>Aún no hay documentos. Cuando tu equipo suba tu avance, aparecerá aquí para que lo revises.</p></div>}
                    </div>
                  </motion.div>
                );
              })()}

              {/* ── COMENTARIOS ── */}
              {sec === 'comentarios' && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><Comentarios /></motion.div>}

              {/* ── PERFIL ── */}
              {sec === 'perfil' && (
                <motion.div className="pt-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="pt-card-head"><h2>Mi perfil</h2></div>
                  <div className="pt-profile">
                    <div className="pt-profile-row"><small>Nombre</small><b>{user?.name || '—'}</b></div>
                    {user?.clientNumber && <div className="pt-profile-row"><small>Número de cliente</small><b>#{user.clientNumber}</b></div>}
                    <div className="pt-profile-row"><small>Correo / usuario</small><b>{user?.email || '—'}</b></div>
                    {user?.phone && <div className="pt-profile-row"><small>Teléfono</small><b>{user.phone}</b></div>}
                  </div>
                  <p className="pt-empty" style={{ marginTop: 12 }}>¿Necesitas cambiar un dato? Escríbenos por WhatsApp o déjalo en Comentarios.</p>
                  <div className="pt-divider" />
                  <ChangePassword />
                </motion.div>
              )}

              {/* ── ESCÁNER ── */}
              {sec === 'escaner' && <EscanerSection />}

              {/* ── GUÍAS ── */}
              {sec === 'guias' && <GuiasSection email={user?.email} />}
            </>
          )}
        </main>
      </div>

      <AnimatePresence>{openDoc && <ProtectedViewer docId={openDoc} onClose={() => setOpenDoc(null)} />}</AnimatePresence>
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
