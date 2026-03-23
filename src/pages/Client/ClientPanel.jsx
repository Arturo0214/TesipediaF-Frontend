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
  FaBars, FaHome
} from 'react-icons/fa';
import { logout } from '../../features/auth/authSlice';
import axiosWithAuth from '../../utils/axioswithAuth';
import Profile from '../dashboard/Profile';
import './ClientPanel.css';

/* ── Status helpers ── */
const STATUS_MAP = {
  pending:     { label: 'Pendiente',   icon: <FaHourglassHalf />, class: 'cp-status-pending' },
  in_progress: { label: 'En progreso', icon: <FaSpinner />,       class: 'cp-status-in_progress' },
  review:      { label: 'En revisión', icon: <FaSearch />,        class: 'cp-status-review' },
  completed:   { label: 'Completado',  icon: <FaCheck />,         class: 'cp-status-completed' },
  cancelled:   { label: 'Cancelado',   icon: <FaTimes />,         class: 'cp-status-cancelled' },
};

const TIMELINE_STEPS = [
  { key: 'pending',     label: 'Recibido' },
  { key: 'in_progress', label: 'En desarrollo' },
  { key: 'review',      label: 'Revisión' },
  { key: 'completed',   label: 'Entregado' },
];

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtMoney = (n) => {
  if (n == null) return '$0';
  return `$${Number(n).toLocaleString('es-MX')}`;
};

/* ── Componente principal ── */
const ClientPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [activeTab, setActiveTab] = useState('proyecto');
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);

  const TesipediaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';

  /* ── Nav items ── */
  const navItems = [
    { key: 'proyecto',   icon: FaClipboardList,     label: 'Mi Proyecto' },
    { key: 'timeline',   icon: FaClock,             label: 'Línea de tiempo' },
    { key: 'pagos',      icon: FaMoneyBillWave,     label: 'Pagos' },
    { key: 'documentos', icon: FaFileAlt,           label: 'Documentos' },
    { key: 'mensajes',   icon: FaComments,          label: 'Mensajes' },
    { key: 'perfil',     icon: FaUser,              label: 'Mi Perfil' },
  ];

  /* ── Fetch projects ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosWithAuth.get('/projects/client');
        setProjects(data);
        if (data.length > 0) setActiveProject(data[0]);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const getStepStatus = (stepKey, projectStatus) => {
    const order = ['pending', 'in_progress', 'review', 'completed'];
    const currentIdx = order.indexOf(projectStatus);
    const stepIdx = order.indexOf(stepKey);
    if (projectStatus === 'cancelled') return 'pending';
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
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
    return (
      <div className="cp-content-inner">
        <h2 className="cp-section-heading">Línea de tiempo</h2>
        <div className="cp-timeline">
          {TIMELINE_STEPS.map((step) => {
            const stepStatus = getStepStatus(step.key, p.status);
            const dotClass =
              stepStatus === 'completed' ? 'cp-dot-completed' :
              stepStatus === 'current'   ? 'cp-dot-current' :
              'cp-dot-pending';
            return (
              <div key={step.key} className="cp-timeline-item">
                <div className={`cp-timeline-dot ${dotClass}`}>
                  {stepStatus === 'completed' ? <FaCheck /> :
                   stepStatus === 'current'   ? <FaSpinner /> :
                   <FaHourglassHalf />}
                </div>
                <div className={`cp-timeline-content ${stepStatus === 'current' ? 'cp-tl-active' : ''}`}>
                  <div className="cp-timeline-title">{step.label}</div>
                  <div className="cp-timeline-date">
                    {stepStatus === 'completed' ? 'Completado' :
                     stepStatus === 'current'   ? 'En curso' :
                     'Pendiente'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
            <p>Sin plan de pagos registrado.</p>
          </div>
        )}
      </div>
    );
  };

  const renderDocumentsSection = () => {
    if (!p) return renderEmptyState();
    return (
      <div className="cp-content-inner">
        <h2 className="cp-section-heading">Documentos</h2>
        {(p.deliverables && p.deliverables.length > 0) || p.requirements?.file?.url ? (
          <div className="cp-docs-list">
            {p.deliverables?.map((doc, i) => (
              <div key={i} className="cp-doc-item">
                <div className="cp-doc-icon"><FaFileAlt /></div>
                <div className="cp-doc-info">
                  <div className="cp-doc-name">{doc.fileName || `Archivo ${i + 1}`}</div>
                  <div className="cp-doc-date">{fmtDate(doc.uploadedAt)}</div>
                </div>
                {doc.fileUrl && (
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="cp-doc-download">
                    <FaDownload />
                  </a>
                )}
              </div>
            ))}
            {p.requirements?.file?.url && (
              <div className="cp-doc-item">
                <div className="cp-doc-icon cp-doc-icon-req"><FaFileAlt /></div>
                <div className="cp-doc-info">
                  <div className="cp-doc-name">{p.requirements.file.originalName || 'Archivo de requisitos'}</div>
                  <div className="cp-doc-date">Requisitos del proyecto</div>
                </div>
                <a href={p.requirements.file.url} target="_blank" rel="noopener noreferrer" className="cp-doc-download">
                  <FaDownload />
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="cp-empty-section">
            <FaFileAlt className="cp-empty-section-icon" />
            <p>Los archivos se mostrarán aquí cuando estén listos.</p>
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
      <div className="cp-empty-icon"><FaClipboardList /></div>
      <h2>Aún no tienes proyectos</h2>
      <p>Cuando solicites un servicio y sea aprobado, podrás dar seguimiento aquí.</p>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <div className="cp-loading"><FaSpinner className="cp-loading-spinner" /> Cargando...</div>;
    }
    switch (activeTab) {
      case 'proyecto':    return renderProjectSection();
      case 'timeline':    return renderTimelineSection();
      case 'pagos':       return renderPaymentsSection();
      case 'documentos':  return renderDocumentsSection();
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
      </div>

      {/* Container */}
      <div className="cp-container">
        {/* Sidebar */}
        <aside className={`cp-sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <nav className="cp-nav">
            <div className="cp-nav-section">
              <div className="cp-nav-section-title">Mi cuenta</div>
              {navItems.map(({ key, icon: Icon, label }) => (
                <Nav.Link
                  key={key}
                  active={activeTab === key}
                  onClick={() => handleTabSelect(key)}
                  className="cp-nav-link"
                >
                  <Icon />
                  <span>{label}</span>
                </Nav.Link>
              ))}
            </div>

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
