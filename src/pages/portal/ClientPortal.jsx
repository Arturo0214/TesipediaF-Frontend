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

/* ═══════════ DASHBOARD ═══════════ */
const NAV = [
  { k: 'proyecto', label: 'Mi proyecto', icon: FaFolderOpen },
  { k: 'pagos', label: 'Pagos', icon: FaMoneyBillWave },
  { k: 'documentos', label: 'Documentos', icon: FaFileAlt },
  { k: 'comentarios', label: 'Comentarios', icon: FaRegComments },
  { k: 'perfil', label: 'Mi perfil', icon: FaUserCircle },
];
const TOOLS = [
  { label: 'Detector de IA', icon: FaRobot, href: '/detector-ia-tesis' },
  { label: 'Guías de tesis', icon: FaBookOpen, href: '/guias' },
];

function PortalDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [sec, setSec] = useState('proyecto');
  const [projects, setProjects] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDoc, setOpenDoc] = useState(null);
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
          <a key={t.label} className="pt-side-link" href={t.href} target="_blank" rel="noreferrer">
            <t.icon /> {t.label} <FaExternalLinkAlt className="pt-side-ext" />
          </a>
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
          <span className="pt-appbar-title">{NAV.find((n) => n.k === sec)?.label}</span>
          <a className="pt-btn pt-btn-wa pt-appbar-wa" href="https://wa.me/5215583352096" target="_blank" rel="noreferrer"><FaWhatsapp /> <span>WhatsApp</span></a>
        </header>

        <main className="pt-main">
          {loading ? <div className="pt-center"><FaSpinner className="pt-spin pt-big" /></div> : (
            <>
              {/* ── MI PROYECTO ── */}
              {sec === 'proyecto' && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <section className="pt-hero">
                    <div>
                      <span className="pt-hero-hi">Hola, {saludo} 👋</span>
                      <h1>{proj?.taskTitle || 'Tu proyecto'}</h1>
                      {proj && <p>{proj.taskType || ''}{proj.educationLevel ? ` · ${proj.educationLevel}` : ''}{proj.pages ? ` · ${proj.pages} págs.` : ''}</p>}
                    </div>
                    {proj?.dueDate && <div className="pt-hero-due"><small>Entrega acordada</small><b>{fmtDate(proj.dueDate)}</b></div>}
                  </section>
                  <div className="pt-stats">
                    <div className="pt-stat"><span className="pt-stat-ico green"><FaCheckCircle /></span><div><b>{pct}%</b><small>Pagado</small></div></div>
                    <div className="pt-stat"><span className="pt-stat-ico amber"><FaMoneyBillWave /></span><div><b>{nPagados}/{schedule.length}</b><small>Pagos</small></div></div>
                    <div className="pt-stat"><span className="pt-stat-ico purple"><FaRegFilePdf /></span><div><b>{docs.length}</b><small>Archivo{docs.length !== 1 ? 's' : ''}</small></div></div>
                    <div className="pt-stat"><span className="pt-stat-ico blue"><FaFolderOpen /></span><div><b>{proj?.status === 'completed' ? 'Listo' : 'En curso'}</b><small>Estado</small></div></div>
                  </div>
                  <div className="pt-card">
                    <div className="pt-card-head"><h2>Línea de tiempo del proyecto</h2><small>Archivos subidos y entregas acordadas</small></div>
                    {eventos.length ? (
                      <div className="pt-timeline">
                        {eventos.map((e, i) => (
                          <div key={i} className={`pt-tl-item ${e.tipo}`}>
                            <span className="pt-tl-dot">{e.icon}</span>
                            <div className="pt-tl-body">
                              <b>{e.titulo}</b>
                              <small>{fmtDate(e.date)}{e.sub ? ` · ${e.sub}` : ''}</small>
                              {e.docId && <button className="pt-tl-open" onClick={() => setOpenDoc(e.docId)}><FaEye /> Ver documento</button>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="pt-empty">Los eventos de tu proyecto (archivos y entregas) aparecerán aquí.</p>}
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

              {/* ── DOCUMENTOS ── */}
              {sec === 'documentos' && (
                <motion.div className="pt-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="pt-card-head"><h2>Mis documentos</h2><small>Toca para leer tu documento completo</small></div>
                  <div className="pt-doc-list">
                    {docs.length ? docs.map((d) => (
                      <button key={d.id} className="pt-doc" onClick={() => setOpenDoc(d.id)}>
                        <span className="pt-doc-ico"><FaRegFilePdf /></span>
                        <div className="pt-doc-info"><b>{d.title}</b><small>{d.visiblePages} página{d.visiblePages !== 1 ? 's' : ''} · subido {fmtDate(d.createdAt)} · {d.locked ? 'con marca de agua' : 'liberado'}</small></div>
                        <span className={`pt-doc-badge ${d.locked ? 'lock' : 'open'}`}>{d.locked ? <FaLock /> : <FaLockOpen />} <FaEye /></span>
                      </button>
                    )) : <div className="pt-empty-docs"><FaFileAlt /><p>Aún no hay documentos. Cuando tu equipo suba tu avance, aparecerá aquí.</p></div>}
                  </div>
                </motion.div>
              )}

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
                </motion.div>
              )}
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
