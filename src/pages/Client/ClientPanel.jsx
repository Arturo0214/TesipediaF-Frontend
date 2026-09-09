import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import {
  FaClipboardList, FaClock, FaGraduationCap, FaFileAlt,
  FaCheck, FaSpinner, FaHourglassHalf, FaTimes,
  FaMoneyBillWave, FaComments, FaDownload, FaPaperPlane,
  FaCalendarAlt, FaUser, FaBook, FaSearch,
  FaCheckCircle, FaExclamationCircle, FaSignOutAlt,
  FaBars, FaHome, FaRobot, FaStore, FaShoppingCart,
  FaArrowRight, FaLayerGroup, FaStar, FaBookOpen
} from 'react-icons/fa';
import { logout } from '../../features/auth/authSlice';
import axiosWithAuth from '../../utils/axioswithAuth';
import Profile from '../dashboard/Profile';
import ScannerWidget from '../../components/tools/ScannerWidget';
import CartButton from '../../components/cart/CartButton';
import { useCart } from '../../context/CartContext';
import { GUIAS, PAQUETES, getGuia } from '../../data/guias';
import './ClientPanel.css';

/* ── Status helpers ── */
const STATUS_MAP = {
  pending:     { label: 'Pendiente',   icon: <FaHourglassHalf />, class: 'cp-status-pending' },
  in_progress: { label: 'En progreso', icon: <FaSpinner />,       class: 'cp-status-in_progress' },
  review:      { label: 'En revisión', icon: <FaSearch />,        class: 'cp-status-review' },
  completed:   { label: 'Completado',  icon: <FaCheck />,         class: 'cp-status-completed' },
  cancelled:   { label: 'Cancelado',   icon: <FaTimes />,         class: 'cp-status-cancelled' },
};

/* Revision type icons & labels */
const REVISION_STATUS_MAP = {
  delivered:              { label: 'Entregado',                 color: '#2563eb' },
  pending_review:         { label: 'En revisión por tu asesor', color: '#d97706' },
  corrections_requested:  { label: 'Correcciones solicitadas',  color: '#dc2626' },
  approved:               { label: 'Aprobado',                  color: '#16a34a' },
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

const fmtMoney = (n) => {
  if (n == null) return '$0';
  return `$${Number(n).toLocaleString('es-MX')}`;
};

/* ── Tarjeta de guía para la tienda dentro del panel ── */
const TiendaGuiaCard = ({ id }) => {
  const g = getGuia(id);
  const cart = useCart();
  if (!g) return null;
  const cover = g.pages?.[0]?.src;
  const inCart = cart?.has(g.id);
  return (
    <div className="cp-shop-card">
      <a href={`/guias/${g.id}`} className="cp-shop-cover" target="_blank" rel="noopener noreferrer">
        {cover ? <img src={cover} alt={g.nombre} loading="lazy" /> : <FaBookOpen />}
        <span className="cp-shop-price">${g.precio}</span>
      </a>
      <div className="cp-shop-body">
        <span className="cp-shop-kicker">{g.kicker}</span>
        <h4>{g.nombre}</h4>
        <button
          type="button"
          className={`cp-shop-add ${inCart ? 'is-in' : ''}`}
          onClick={() => (inCart ? cart.setOpen(true) : cart?.add(g.id))}
        >
          {inCart ? <><FaCheck /> En el carrito</> : <><FaShoppingCart /> Añadir</>}
        </button>
      </div>
    </div>
  );
};

/* ── Componente principal ── */
const ClientPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useCart();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [activeTab, setActiveTab] = useState('proyecto');
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [misGuias, setMisGuias] = useState([]);
  const [guiasLoading, setGuiasLoading] = useState(true);
  const chatEndRef = useRef(null);

  const TesipediaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';

  /* ── Nav (agrupado) ── */
  const navGroups = [
    {
      title: 'Mi proyecto',
      items: [
        { key: 'proyecto',   icon: FaClipboardList, label: 'Mi Proyecto' },
        { key: 'timeline',   icon: FaClock,         label: 'Línea de tiempo' },
        { key: 'pagos',      icon: FaMoneyBillWave, label: 'Pagos' },
        { key: 'documentos', icon: FaFileAlt,       label: 'Documentos' },
        { key: 'mensajes',   icon: FaComments,      label: 'Mensajes' },
      ],
    },
    {
      title: 'Herramientas',
      items: [
        { key: 'detector', icon: FaRobot,  label: 'Detector de IA' },
        { key: 'tienda',   icon: FaStore,  label: 'Comprar guías' },
        { key: 'guias',    icon: FaBook,   label: 'Mis guías' },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        { key: 'perfil', icon: FaUser, label: 'Mi Perfil' },
      ],
    },
  ];

  /* ── Fetch projects ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchError(null);
        const { data } = await axiosWithAuth.get('/projects/client');
        setProjects(data);
        if (data.length > 0) setActiveProject(data[0]);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setFetchError(
          err.response?.status === 401
            ? 'Tu sesión expiró. Por favor cierra sesión e inicia de nuevo.'
            : 'No pudimos cargar tus proyectos. Intenta recargar la página.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Fetch guías compradas ── */
  useEffect(() => {
    let alive = true;
    axiosWithAuth.get('/guias/mis-compras')
      .then(({ data }) => { if (alive) setMisGuias(Array.isArray(data) ? data : []); })
      .catch(() => { if (alive) setMisGuias([]); })
      .finally(() => { if (alive) setGuiasLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeProject?.comments]);

  /* ── Handlers ── */
  const handleSendComment = async () => {
    if (!commentText.trim() || !activeProject) return;
    setSendingComment(true);
    try {
      const { data } = await axiosWithAuth.post(
        `/projects/${activeProject._id}/comments`,
        { text: commentText.trim() }
      );
      setActiveProject(data);
      setProjects((prev) => prev.map((p) => (p._id === data._id ? data : p)));
      setCommentText('');
    } catch (err) {
      console.error('Error sending comment:', err);
    } finally {
      setSendingComment(false);
    }
  };

  const handleTabSelect = (key) => {
    setActiveTab(key);
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  /** Calculate delivery deadline: 7 days after payment date */
  const getDeliveryDeadline = (paidDate) => {
    if (!paidDate) return null;
    const d = new Date(paidDate);
    d.setDate(d.getDate() + 7);
    return d;
  };

  /** Determine delivery status for a paid installment */
  const getDeliveryStatus = (installment, projectStatus, isLastPayment, allPaid) => {
    if (installment.status !== 'paid') return 'locked'; // not paid yet
    // If project is completed and this is the last payment
    if (projectStatus === 'completed' && isLastPayment) return 'delivered';
    // If all payments before this are paid and project is completed
    if (projectStatus === 'completed') return 'delivered';
    // Check if there's a delivery associated (for now, use progress heuristic)
    // The payment is done, delivery is either in progress or delivered
    if (isLastPayment && allPaid && projectStatus === 'review') return 'in_review';
    if (isLastPayment && allPaid) return 'in_progress';
    // For non-last payments that are paid — assume delivered (earlier phases)
    return 'delivered';
  };

  const getPaymentSchedule = (project) => project?.payment?.schedule || [];
  const getPaymentTotal = (project) => project?.payment?.amount || 0;

  /* ── Derived data ── */
  const p = activeProject || projects[0];
  const statusInfo = p ? (STATUS_MAP[p.status] || STATUS_MAP.pending) : STATUS_MAP.pending;
  const schedule = p ? getPaymentSchedule(p) : [];
  const totalAmount = p ? getPaymentTotal(p) : 0;
  const paidAmount = schedule
    .filter((s) => s.status === 'paid')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  /* ── Section renderers ── */
  const renderProjectSection = () => {
    if (!p) return renderEmptyState();
    return (
      <div className="cp-content-inner">
        {/* Project selector */}
        {projects.length > 1 && (
          <div className="cp-project-selector">
            {projects.map((proj) => (
              <button
                key={proj._id}
                className={`cp-proj-btn ${proj._id === p._id ? 'cp-proj-btn-active' : ''}`}
                onClick={() => setActiveProject(proj)}
              >
                {proj.taskTitle}
              </button>
            ))}
          </div>
        )}

        {/* Project Card */}
        <div className="cp-project-card">
          <div className="cp-project-header">
            <div>
              <h2 className="cp-project-title">{p.taskTitle}</h2>
              <div className="cp-project-meta">
                <span className="cp-meta-tag"><FaBook /> {p.taskType}</span>
                <span className="cp-meta-tag"><FaGraduationCap /> {p.educationLevel}</span>
                <span className="cp-meta-tag"><FaCalendarAlt /> Entrega: {fmtDate(p.dueDate)}</span>
                {p.pages && <span className="cp-meta-tag"><FaFileAlt /> {p.pages} págs.</span>}
                {p.writer?.name && <span className="cp-meta-tag"><FaUser /> {p.writer.name}</span>}
              </div>
            </div>
            <span className={`cp-status-badge ${statusInfo.class}`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>
          <div className="cp-progress-section">
            <div className="cp-progress-header">
              <span className="cp-progress-label">Progreso general</span>
              <span className="cp-progress-value">{p.progress || 0}%</span>
            </div>
            <div className="cp-progress-track">
              <div className="cp-progress-fill" style={{ width: `${p.progress || 0}%` }} />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="cp-stats-row">
          <div className="cp-stat-card">
            <div className="cp-stat-icon cp-stat-blue"><FaClipboardList /></div>
            <div className="cp-stat-info">
              <span className="cp-stat-value">{projects.length}</span>
              <span className="cp-stat-label">Proyectos</span>
            </div>
          </div>
          <div className="cp-stat-card">
            <div className="cp-stat-icon cp-stat-green"><FaCheck /></div>
            <div className="cp-stat-info">
              <span className="cp-stat-value">{p.progress || 0}%</span>
              <span className="cp-stat-label">Avance</span>
            </div>
          </div>
          <div className="cp-stat-card">
            <div className="cp-stat-icon cp-stat-amber"><FaMoneyBillWave /></div>
            <div className="cp-stat-info">
              <span className="cp-stat-value">{schedule.filter(s => s.status === 'paid').length}/{schedule.length || 0}</span>
              <span className="cp-stat-label">Pagos</span>
            </div>
          </div>
          <div className="cp-stat-card">
            <div className="cp-stat-icon cp-stat-purple"><FaCalendarAlt /></div>
            <div className="cp-stat-info">
              <span className="cp-stat-value">{fmtDate(p.dueDate)}</span>
              <span className="cp-stat-label">Entrega</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimelineSection = () => {
    if (!p) return renderEmptyState();

    const sched = getPaymentSchedule(p);
    const totalPayments = sched.length;
    const paidCount = sched.filter(s => s.status === 'paid').length;
    const allPaid = paidCount === totalPayments && totalPayments > 0;

    // Revisions from backend (sorted by version)
    const revisions = (p.revisions || []).slice().sort((a, b) => a.version - b.version);
    const hasRevisions = revisions.length > 0;
    const latestRevision = hasRevisions ? revisions[revisions.length - 1] : null;
    const isApproved = latestRevision?.status === 'approved';
    const hasPreliminary = revisions.some(r => r.type === 'preliminary');

    // Compute overall progress: payments weight 40%, revisions weight 60%
    const paymentProgress = totalPayments > 0 ? (paidCount / totalPayments) : 0;
    const revisionProgress = isApproved ? 1 : hasRevisions ? 0.5 : (paidCount > 0 ? 0.15 : 0);
    const overallPct = Math.round((paymentProgress * 40) + (revisionProgress * 60));

    return (
      <div className="cp-content-inner">
        <h2 className="cp-section-heading">Línea de tiempo del proyecto</h2>

        {/* Summary card */}
        <div className="cp-tl-summary">
          <div className="cp-tl-summary-left">
            <div className="cp-tl-summary-title">Progreso general</div>
            <div className="cp-tl-summary-sub">
              {paidCount} de {totalPayments} pagos · {revisions.length} {revisions.length === 1 ? 'versión' : 'versiones'} entregadas
              {isApproved && ' · Versión final aprobada'}
            </div>
          </div>
          <div className="cp-tl-summary-pct">{overallPct}%</div>
        </div>
        <div className="cp-tl-progress-track">
          <div className="cp-tl-progress-fill" style={{ width: `${overallPct}%` }} />
        </div>

        {totalPayments > 0 ? (
          <div className="cp-timeline">

            {/* ── PHASE 1: Payments ── */}
            {sched.map((inst, idx) => {
              const isPaid = inst.status === 'paid';
              const isOverdue = !isPaid && inst.dueDate && new Date(inst.dueDate) < new Date();
              return (
                <div key={`pay-${idx}`} className="cp-timeline-item">
                  <div className={`cp-timeline-dot ${isPaid ? 'cp-dot-completed' : 'cp-dot-pending'}`}>
                    {isPaid ? <FaCheck /> : <FaMoneyBillWave />}
                  </div>
                  <div className="cp-timeline-content">
                    <div className="cp-tl-phase-header">
                      <div className="cp-tl-phase-title">{inst.label || `Pago ${idx + 1}`}</div>
                      <span className={`cp-tl-pay-badge ${isPaid ? 'cp-tl-pay-done' : isOverdue ? 'cp-tl-pay-overdue' : 'cp-tl-pay-pending'}`}>
                        {isPaid ? <><FaCheckCircle /> Pagado</> : isOverdue ? <><FaExclamationCircle /> Vencido</> : <><FaClock /> Pendiente</>}
                        {' · '}{fmtMoney(inst.amount)}
                      </span>
                    </div>
                    <div className="cp-tl-phase-footer">
                      {isPaid && inst.paidDate && (
                        <span className="cp-tl-deadline"><FaCalendarAlt /> Pagado el {fmtDate(inst.paidDate)}</span>
                      )}
                      {!isPaid && inst.dueDate && (
                        <span className="cp-tl-deadline"><FaCalendarAlt /> Fecha de pago: {fmtDate(inst.dueDate)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── PHASE 2: Versión preliminar ── */}
            {paidCount > 0 && (
              <div className="cp-timeline-item">
                <div className={`cp-timeline-dot ${hasPreliminary ? 'cp-dot-completed' : 'cp-dot-current'}`}>
                  {hasPreliminary ? <FaCheck /> : <FaSpinner />}
                </div>
                <div className={`cp-timeline-content ${!hasPreliminary ? 'cp-tl-active' : ''}`}>
                  <div className="cp-tl-phase-header">
                    <div className="cp-tl-phase-title">
                      {hasPreliminary ? 'Versión preliminar entregada' : 'Versión preliminar en desarrollo'}
                    </div>
                  </div>
                  <div className="cp-tl-phase-desc">
                    {hasPreliminary
                      ? 'Se entregó el primer avance de tu proyecto. En cuanto tu asesor envíe correcciones, se irán agregando aquí abajo.'
                      : 'Estamos trabajando en la primera versión de tu proyecto — se entrega dentro de la 1ª semana después del pago.'}
                  </div>
                  {!hasPreliminary && paidCount > 0 && (
                    <div className="cp-tl-phase-footer">
                      <span className="cp-tl-status" style={{ color: '#2563eb' }}>En desarrollo</span>
                      <span className="cp-tl-deadline">
                        <FaCalendarAlt /> Fecha límite: {fmtDate(getDeliveryDeadline(sched[0]?.paidDate || sched[0]?.dueDate))}
                      </span>
                    </div>
                  )}
                  {hasPreliminary && (
                    <div className="cp-tl-phase-footer">
                      <span className="cp-tl-delivered-tag"><FaCheckCircle /> Entregado</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── PHASE 3: Dynamic correction/revision nodes ── */}
            {revisions.filter(r => r.type !== 'preliminary').map((rev, idx) => {
              const revStatus = REVISION_STATUS_MAP[rev.status] || REVISION_STATUS_MAP.delivered;
              const isCurrent = rev.status === 'pending_review' || rev.status === 'corrections_requested';
              const isRevApproved = rev.status === 'approved';
              const dotClass = isRevApproved ? 'cp-dot-completed' :
                               isCurrent ? 'cp-dot-current' : 'cp-dot-completed';
              const icon = rev.type === 'correction'
                ? (rev.status === 'corrections_requested' ? <FaExclamationCircle /> : <FaSearch />)
                : (isRevApproved ? <FaCheck /> : <FaSpinner />);

              return (
                <div key={`rev-${rev.version}`} className="cp-timeline-item">
                  <div className={`cp-timeline-dot ${dotClass}`}>
                    {icon}
                  </div>
                  <div className={`cp-timeline-content ${isCurrent ? 'cp-tl-active' : ''} ${isRevApproved ? 'cp-tl-final-done' : ''}`}>
                    <div className="cp-tl-phase-header">
                      <div className="cp-tl-phase-title">
                        {rev.label || (rev.type === 'correction' ? `Corrección ${idx + 1}` : `Revisión ${idx + 1}`)}
                      </div>
                      <span className="cp-tl-rev-badge" style={{ color: revStatus.color, borderColor: revStatus.color }}>
                        {revStatus.label}
                      </span>
                    </div>
                    {(rev.notes || rev.correctionNotes) && (
                      <div className="cp-tl-phase-desc">
                        {rev.type === 'correction' && rev.correctionNotes
                          ? `Correcciones del asesor: ${rev.correctionNotes}`
                          : rev.notes}
                      </div>
                    )}
                    <div className="cp-tl-phase-footer">
                      <span className="cp-tl-deadline"><FaCalendarAlt /> {fmtDate(rev.createdAt)}</span>
                      {rev.file?.path && (
                        <a href={rev.file.path} target="_blank" rel="noopener noreferrer" className="cp-tl-download-link">
                          <FaDownload /> Ver documento
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Placeholder: Awaiting corrections (when preliminary delivered but no corrections yet) ── */}
            {hasPreliminary && !isApproved && revisions.filter(r => r.type !== 'preliminary').length === 0 && (
              <div className="cp-timeline-item">
                <div className="cp-timeline-dot cp-dot-pending cp-dot-dashed">
                  <FaSearch />
                </div>
                <div className="cp-timeline-content cp-tl-placeholder">
                  <div className="cp-tl-phase-title">Esperando correcciones de tu asesor</div>
                  <div className="cp-tl-phase-desc">
                    En cuanto tu asesor revise la versión preliminar y envíe correcciones, aparecerán aquí como nuevos nodos. Este proceso se repite hasta llegar a la versión final aprobada.
                  </div>
                </div>
              </div>
            )}

            {/* ── Placeholder: Next correction cycle (when there are corrections but not approved yet) ── */}
            {hasPreliminary && !isApproved && revisions.filter(r => r.type !== 'preliminary').length > 0 && (
              <div className="cp-timeline-item">
                <div className="cp-timeline-dot cp-dot-pending cp-dot-dashed">
                  <FaHourglassHalf />
                </div>
                <div className="cp-timeline-content cp-tl-placeholder">
                  <div className="cp-tl-phase-title">Próxima revisión</div>
                  <div className="cp-tl-phase-desc">
                    Se seguirán abriendo nodos conforme haya nuevas correcciones, hasta llegar a la versión final aprobada.
                  </div>
                </div>
              </div>
            )}

            {/* ── PHASE 4: Versión final ── */}
            <div className="cp-timeline-item">
              <div className={`cp-timeline-dot ${p.status === 'completed' || isApproved ? 'cp-dot-completed' : 'cp-dot-pending'}`}>
                <FaGraduationCap />
              </div>
              <div className={`cp-timeline-content ${p.status === 'completed' || isApproved ? 'cp-tl-final-done' : ''}`}>
                <div className="cp-tl-phase-header">
                  <div className="cp-tl-phase-title">Versión final aprobada</div>
                </div>
                <div className="cp-tl-phase-desc">
                  {p.status === 'completed' || isApproved
                    ? 'Tu proyecto ha sido aprobado y entregado exitosamente.'
                    : 'Una vez que tu asesor apruebe la última revisión sin correcciones, tu proyecto se marcará como finalizado.'}
                </div>
                <div className="cp-tl-phase-footer">
                  <span className="cp-tl-status" style={{ color: p.status === 'completed' || isApproved ? '#16a34a' : '#94a3b8' }}>
                    {p.status === 'completed' || isApproved ? 'Completado' : 'Pendiente'}
                  </span>
                  {p.dueDate && (
                    <span className="cp-tl-deadline">
                      <FaCalendarAlt /> Fecha final: {fmtDate(p.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="cp-empty-section" style={{ marginTop: '20px' }}>
            <FaClock className="cp-empty-section-icon" />
            <p>La línea de tiempo se mostrará aquí una vez que se registren tus pagos.</p>
          </div>
        )}
      </div>
    );
  };

  const renderPaymentsSection = () => {
    if (!p) return renderEmptyState();
    return (
      <div className="cp-content-inner">
        <h2 className="cp-section-heading">Plan de pagos</h2>
        {schedule.length > 0 ? (
          <div className="cp-payments-list">
            {schedule.map((inst, i) => {
              const isPaid = inst.status === 'paid';
              const isOverdue = !isPaid && inst.dueDate && new Date(inst.dueDate) < new Date();
              const payClass = isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending';
              return (
                <div key={i} className="cp-payment-item">
                  <div className="cp-payment-left">
                    <div className={`cp-payment-icon cp-pay-${payClass}`}>
                      {isPaid ? <FaCheckCircle /> :
                       isOverdue ? <FaExclamationCircle /> :
                       <FaClock />}
                    </div>
                    <div className="cp-payment-info">
                      <div className="cp-payment-label">{inst.label || `Pago ${inst.number}`}</div>
                      <div className="cp-payment-date">{fmtDate(inst.dueDate)}</div>
                    </div>
                  </div>
                  <span className={`cp-payment-amount cp-amount-${payClass}`}>
                    {fmtMoney(inst.amount)}
                  </span>
                </div>
              );
            })}
            <div className="cp-payment-total">
              <span className="cp-payment-total-label">Pagado: {fmtMoney(paidAmount)} / Total</span>
              <span className="cp-payment-total-amount">{fmtMoney(totalAmount)}</span>
            </div>
          </div>
        ) : (
          <div className="cp-empty-section">
            <FaMoneyBillWave className="cp-empty-section-icon" />
            <p>El plan de pagos se mostrará aquí una vez que se confirme tu esquema de pago.</p>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
              Si ya realizaste un pago, contáctanos para que actualicemos tu información.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderDocumentsSection = () => {
    if (!p) return renderEmptyState();

    const revisions = (p.revisions || []).slice().sort((a, b) => a.version - b.version);
    const hasRevisions = revisions.length > 0;
    const hasRequirements = p.requirements?.file?.url || p.requirements?.file?.path;
    const hasDeliverables = p.deliverables && p.deliverables.length > 0;

    return (
      <div className="cp-content-inner">
        <h2 className="cp-section-heading">Documentos y versiones</h2>

        {/* Requirements file */}
        {hasRequirements && (
          <div className="cp-doc-section-label">Archivo de requisitos</div>
        )}
        {hasRequirements && (
          <div className="cp-doc-item" style={{ marginBottom: '20px' }}>
            <div className="cp-doc-icon cp-doc-icon-req"><FaFileAlt /></div>
            <div className="cp-doc-info">
              <div className="cp-doc-name">{p.requirements.file.originalname || p.requirements.file.originalName || 'Archivo de requisitos'}</div>
              <div className="cp-doc-date">Documento base del proyecto</div>
            </div>
            <a href={p.requirements.file.url || p.requirements.file.path} target="_blank" rel="noopener noreferrer" className="cp-doc-download">
              <FaDownload />
            </a>
          </div>
        )}

        {/* Version timeline */}
        {hasRevisions ? (
          <>
            <div className="cp-doc-section-label">Historial de versiones</div>
            <div className="cp-doc-timeline">
              {revisions.map((rev, idx) => {
                const revStatus = REVISION_STATUS_MAP[rev.status] || REVISION_STATUS_MAP.delivered;
                const isLatest = idx === revisions.length - 1;
                const typeLabel =
                  rev.type === 'preliminary' ? 'Versión preliminar' :
                  rev.type === 'correction'  ? 'Corrección' :
                  rev.type === 'final'       ? 'Versión final' :
                  'Revisión';

                return (
                  <div key={rev.version} className={`cp-doc-version-item ${isLatest ? 'cp-doc-version-latest' : ''}`}>
                    <div className="cp-doc-version-dot">
                      <div className={`cp-doc-dot ${rev.status === 'approved' ? 'cp-doc-dot-approved' : rev.status === 'corrections_requested' ? 'cp-doc-dot-correction' : 'cp-doc-dot-default'}`}>
                        {rev.status === 'approved' ? <FaCheck /> :
                         rev.status === 'corrections_requested' ? <FaExclamationCircle /> :
                         <FaFileAlt />}
                      </div>
                    </div>
                    <div className="cp-doc-version-content">
                      <div className="cp-doc-version-header">
                        <div>
                          <span className="cp-doc-version-label">v{rev.version}</span>
                          <span className="cp-doc-version-type">{typeLabel}</span>
                          {rev.label && <span className="cp-doc-version-custom"> — {rev.label}</span>}
                        </div>
                        <span className="cp-doc-version-status" style={{ color: revStatus.color }}>
                          {revStatus.label}
                        </span>
                      </div>
                      {rev.notes && (
                        <div className="cp-doc-version-notes">{rev.notes}</div>
                      )}
                      {rev.correctionNotes && (
                        <div className="cp-doc-version-correction">
                          <strong>Correcciones del asesor:</strong> {rev.correctionNotes}
                        </div>
                      )}
                      <div className="cp-doc-version-footer">
                        <span className="cp-doc-version-date"><FaCalendarAlt /> {fmtDate(rev.createdAt)}</span>
                        {rev.file?.path && (
                          <a href={rev.file.path} target="_blank" rel="noopener noreferrer" className="cp-doc-version-download">
                            <FaDownload /> Descargar
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : hasDeliverables ? (
          <>
            <div className="cp-doc-section-label">Archivos entregados</div>
            <div className="cp-docs-list">
              {p.deliverables.map((doc, i) => (
                <div key={i} className="cp-doc-item">
                  <div className="cp-doc-icon"><FaFileAlt /></div>
                  <div className="cp-doc-info">
                    <div className="cp-doc-name">{doc.originalname || doc.fileName || `Archivo ${i + 1}`}</div>
                    <div className="cp-doc-date">{fmtDate(doc.uploadedAt)}</div>
                  </div>
                  {(doc.path || doc.fileUrl) && (
                    <a href={doc.path || doc.fileUrl} target="_blank" rel="noopener noreferrer" className="cp-doc-download">
                      <FaDownload />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="cp-empty-section">
            <FaFileAlt className="cp-empty-section-icon" />
            <p>Las versiones de tu proyecto aparecerán aquí conforme se vayan entregando y revisando.</p>
          </div>
        )}
      </div>
    );
  };

  const renderMessagesSection = () => {
    if (!p) return renderEmptyState();
    return (
      <div className="cp-content-inner cp-messages-tab">
        <h2 className="cp-section-heading">Mensajes</h2>
        <div className="cp-chat-container">
          <div className="cp-chat-messages">
            {(!p.comments || p.comments.length === 0) ? (
              <div className="cp-chat-empty">
                <FaComments style={{ fontSize: '2rem', marginBottom: 12 }} />
                <p>No hay mensajes aún. Envía el primero.</p>
              </div>
            ) : (
              p.comments.map((c, i) => {
                const isMe = c.user === user?._id || c.user?._id === user?._id;
                return (
                  <div key={i} className={`cp-chat-msg ${isMe ? 'cp-msg-me' : 'cp-msg-them'}`}>
                    {!isMe && (
                      <div className="cp-msg-sender">{c.user?.name || 'Equipo Tesipedia'}</div>
                    )}
                    <div>{c.text}</div>
                    <div className="cp-msg-time">{fmtDate(c.createdAt)}</div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="cp-chat-input">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
            />
            <button
              className="cp-chat-send"
              onClick={handleSendComment}
              disabled={sendingComment || !commentText.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="cp-empty-state">
      {fetchError ? (
        <>
          <div className="cp-empty-icon" style={{ color: '#e74c3c' }}><FaExclamationCircle /></div>
          <h2>Error al cargar</h2>
          <p>{fetchError}</p>
          <button
            className="cp-btn-retry"
            onClick={() => { setLoading(true); setFetchError(null); window.location.reload(); }}
            style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '0.95rem' }}
          >
            Reintentar
          </button>
        </>
      ) : (
        <>
          <div className="cp-empty-icon"><FaClipboardList /></div>
          <h2>Tu proyecto se está preparando</h2>
          <p>Estamos configurando los detalles de tu proyecto. Si acabas de registrarte, los datos aparecerán pronto.</p>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '8px' }}>
            Si ya pasaron más de 24 horas, contáctanos por WhatsApp para ayudarte.
          </p>
        </>
      )}
    </div>
  );

  /* ── Mis guías (productos digitales comprados) ── */
  const renderGuiasSection = () => (
    <div className="cp-content-inner">
      <h2 className="cp-section-heading"><FaBook style={{ marginRight: 8 }} /> Mis guías descargables</h2>
      {guiasLoading ? (
        <div className="cp-loading"><FaSpinner className="cp-loading-spinner" /> Cargando…</div>
      ) : misGuias.length === 0 ? (
        <div className="cp-guias-empty">
          <FaBook />
          <h3>Aún no has comprado guías</h3>
          <p>Nuestras guías-taller en PDF te llevan paso a paso por cada parte de la tesis.</p>
          <a href="/guias" className="cp-guias-cta">Ver guías disponibles</a>
        </div>
      ) : (
        <div className="cp-guias-list">
          {misGuias.map((g, i) => (
            <div className="cp-guia-card" key={`${g.productId}-${i}`}>
              <div className="cp-guia-head">
                <div>
                  <strong>{g.productName}</strong>
                  <span className="cp-guia-date">Comprada el {fmtDate(g.fecha)}</span>
                </div>
                <FaBook className="cp-guia-ico" />
              </div>
              <div className="cp-guia-files">
                {g.archivos.map((a) => (
                  <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="cp-guia-dl">
                    <FaDownload /> {a.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
          <a href="/guias" className="cp-guias-more">Ver más guías →</a>
        </div>
      )}
    </div>
  );

  /* ── Detector de IA (escáner dentro de la cuenta) ── */
  const renderDetectorSection = () => (
    <div className="cp-content-inner">
      <h2 className="cp-section-heading"><FaRobot style={{ marginRight: 8 }} /> Detector de IA</h2>
      <p className="cp-tool-sub">
        Sube tu borrador en Word y mide qué tan “humano” suena antes de entregarlo a tu sínodo.
        Confidencial y calibrado para escritura académica en español.
      </p>
      <div className="cp-tool-panel">
        <ScannerWidget />
      </div>
      <div className="cp-tool-note">
        <FaSearch />
        <span>¿Marcó indicios de IA? En la sección <b onClick={() => handleTabSelect('tienda')} className="cp-inline-link">Comprar guías</b> tienes la guía para reescribir con tu propia voz, o escríbele a tu asesor en <b onClick={() => handleTabSelect('mensajes')} className="cp-inline-link">Mensajes</b>.</span>
      </div>
    </div>
  );

  /* ── Tienda de guías (comprar desde la cuenta) ── */
  const renderTiendaSection = () => {
    const nucleo = GUIAS.filter((g) => g.tipo !== 'carrera');
    const carrera = GUIAS.filter((g) => g.tipo === 'carrera');
    return (
      <div className="cp-content-inner">
        <h2 className="cp-section-heading"><FaStore style={{ marginRight: 8 }} /> Comprar guías</h2>
        <p className="cp-tool-sub">
          Guías-taller en PDF que te llevan paso a paso por cada parte de la tesis. Añádelas al carrito
          {cart?.count ? ` (tienes ${cart.count} en el carrito)` : ''} y págalas seguro con MercadoPago; quedan en <b>Mis guías</b>.
        </p>

        {cart?.suggestion && (
          <div className="cp-shop-sug">
            <FaLayerGroup />
            <div>
              <p>Te falta <b>{cart.suggestion.missingNombre}</b> para el <b>{cart.suggestion.paq.nombre}</b>. Añádelo y ahorra <b>${cart.suggestion.ahorro}</b> (pagas ${cart.suggestion.paq.precio} en vez de ${cart.suggestion.sumNeed}).</p>
              <button type="button" onClick={() => { cart.applyBundle(cart.suggestion); cart.setOpen(true); }}>Añadir y ahorrar</button>
            </div>
          </div>
        )}

        <h3 className="cp-shop-h3"><FaStar /> Paquetes (ahorra más)</h3>
        <div className="cp-shop-paks">
          {PAQUETES.map((pk) => {
            const inCart = cart?.has(pk.id);
            return (
              <div key={pk.id} className={`cp-shop-pak ${pk.destacado ? 'is-top' : ''}`}>
                {pk.destacado && <span className="cp-shop-flag"><FaStar /> Mejor valor</span>}
                <h4>{pk.nombre}</h4>
                <p>{pk.resumen}</p>
                <div className="cp-shop-pak-foot">
                  <b>${pk.precio}</b>
                  <button type="button" className={`cp-shop-add ${inCart ? 'is-in' : ''}`} onClick={() => (inCart ? cart.setOpen(true) : cart?.add(pk.id))}>
                    {inCart ? <><FaCheck /> En el carrito</> : <><FaShoppingCart /> Añadir</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="cp-shop-h3">Taller de tesis · por sección</h3>
        <div className="cp-shop-grid">{nucleo.map((g) => <TiendaGuiaCard key={g.id} id={g.id} />)}</div>

        <h3 className="cp-shop-h3">Guías por carrera</h3>
        <div className="cp-shop-grid">{carrera.map((g) => <TiendaGuiaCard key={g.id} id={g.id} />)}</div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <div className="cp-loading"><FaSpinner className="cp-loading-spinner" /> Cargando...</div>;
    }
    switch (activeTab) {
      case 'proyecto':    return renderProjectSection();
      case 'timeline':    return renderTimelineSection();
      case 'pagos':       return renderPaymentsSection();
      case 'documentos':  return renderDocumentsSection();
      case 'detector':    return renderDetectorSection();
      case 'tienda':      return renderTiendaSection();
      case 'guias':       return renderGuiasSection();
      case 'mensajes':    return renderMessagesSection();
      case 'perfil':      return <div className="cp-content-inner"><Profile /></div>;
      default:            return renderProjectSection();
    }
  };

  return (
    <div className="cp-panel">
      {/* Mobile toggle */}
      <button
        className={`cp-sidebar-toggle ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="cp-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Topbar */}
      <div className="cp-topbar">
        <img src={TesipediaLogo} alt="Tesipedia" className="cp-topbar-logo" loading="lazy" />
        <span className="cp-topbar-label">Panel de Cliente</span>
        <span className="cp-topbar-user"><FaUser /> {user?.name}</span>
        <CartButton className="cp-topbar-cart" />
      </div>

      {/* Container */}
      <div className="cp-container">
        {/* Sidebar */}
        <aside className={`cp-sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <nav className="cp-nav">
            {navGroups.map((group) => (
              <div className="cp-nav-section" key={group.title}>
                <div className="cp-nav-section-title">{group.title}</div>
                {group.items.map(({ key, icon: Icon, label }) => (
                  <Nav.Link
                    key={key}
                    active={activeTab === key}
                    onClick={() => handleTabSelect(key)}
                    className="cp-nav-link"
                  >
                    <Icon />
                    <span>{label}</span>
                    {key === 'tienda' && cart?.count > 0 && (
                      <span className="cp-nav-badge">{cart.count}</span>
                    )}
                  </Nav.Link>
                ))}
              </div>
            ))}

            <button className="cp-logout" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Cerrar Sesión</span>
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="cp-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ClientPanel;
