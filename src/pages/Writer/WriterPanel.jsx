import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FaClipboardList, FaClock, FaGraduationCap, FaFileAlt,
  FaCheck, FaSpinner, FaHourglassHalf, FaTimes,
  FaComments, FaPaperPlane, FaCalendarAlt, FaUser,
  FaBook, FaSearch, FaSlidersH, FaChevronRight,
  FaSignOutAlt, FaMoneyBillWave, FaChevronLeft,
  FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import { logout } from '../../features/auth/authSlice';
import axiosWithAuth from '../../utils/axioswithAuth';
import './WriterPanel.css';

/* ── Status helpers ── */
const STATUS_MAP = {
  pending:     { label: 'Pendiente',   icon: <FaHourglassHalf />, class: 'wp-st-pending' },
  in_progress: { label: 'En progreso', icon: <FaSpinner />,       class: 'wp-st-in_progress' },
  review:      { label: 'En revisión', icon: <FaSearch />,        class: 'wp-st-review' },
  completed:   { label: 'Completado',  icon: <FaCheck />,         class: 'wp-st-completed' },
  cancelled:   { label: 'Cancelado',   icon: <FaTimes />,         class: 'wp-st-pending' },
};

const TABS = [
  { key: 'all',         label: 'Todos' },
  { key: 'in_progress', label: 'En progreso' },
  { key: 'review',      label: 'Revisión' },
  { key: 'completed',   label: 'Completados' },
];

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getDaysLeft = (dueDate) => {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};

const fmtMoney = (n) => {
  if (n == null) return '$0';
  return `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;
};

const WRITER_CUT = 0.45;

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

/* ── Main Component ── */
const WriterPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const TesipediaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [activeView, setActiveView] = useState('proyectos'); // 'proyectos' | 'calendario' | 'pagos'
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState(null);
  const [progressValue, setProgressValue] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const chatEndRef = useRef(null);

  /* ── Fetch projects ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosWithAuth.get('/projects/writer');
        setProjects(data);
      } catch (err) {
        console.error('Error fetching writer projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedProject?.comments]);

  /* ── Filter projects ── */
  const filtered = activeTab === 'all'
    ? projects
    : projects.filter((p) => p.status === activeTab);

  /* ── Counts ── */
  const counts = {
    all: projects.length,
    in_progress: projects.filter((p) => p.status === 'in_progress').length,
    review: projects.filter((p) => p.status === 'review').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };

  const activeProjects = projects.filter((p) =>
    p.status === 'in_progress' || p.status === 'pending'
  ).length;

  /* ── Update progress ── */
  const handleSaveProgress = async () => {
    if (!selectedProject) return;
    setSavingProgress(true);
    try {
      const { data } = await axiosWithAuth.put(
        `/projects/${selectedProject._id}/progress`,
        { progress: progressValue }
      );
      setProjects((prev) =>
        prev.map((p) => (p._id === data._id ? { ...p, progress: data.progress } : p))
      );
      setSelectedProject((prev) => ({ ...prev, progress: data.progress }));
    } catch (err) {
      console.error('Error updating progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  /* ── Send comment ── */
  const handleSendComment = async () => {
    if (!commentText.trim() || !selectedProject) return;
    setSendingComment(true);
    try {
      const { data } = await axiosWithAuth.post(
        `/projects/${selectedProject._id}/comments`,
        { text: commentText.trim() }
      );
      setSelectedProject(data);
      setProjects((prev) =>
        prev.map((p) => (p._id === data._id ? data : p))
      );
      setCommentText('');
    } catch (err) {
      console.error('Error sending comment:', err);
    } finally {
      setSendingComment(false);
    }
  };

  /* ── Open detail ── */
  const openDetail = (project) => {
    setSelectedProject(project);
    setProgressValue(project.progress || 0);
    setCommentText('');
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="wp">
        <div className="wp-topbar">
          <img src={TesipediaLogo} alt="Tesipedia" className="wp-topbar-logo" />
          <span className="wp-topbar-label">Panel de Redactor</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: '#64748b' }}>
          <FaSpinner className="wp-loading-spinner" /> &nbsp;Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="wp">
      {/* ── Topbar ── */}
      <div className="wp-topbar">
        <img src={TesipediaLogo} alt="Tesipedia" className="wp-topbar-logo" />
        <span className="wp-topbar-label">Panel de Redactor</span>
        <div className="wp-topbar-actions">
          <span className="wp-topbar-user"><FaUser /> {user?.name}</span>
          <button className="wp-topbar-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Salir
          </button>
        </div>
      </div>

      <div className="wp-scroll">
      {/* ── Hero ── */}
      <div className="wp-hero">
        <div className="wp-hero-content">
          <div className="wp-hero-left">
            <h1>Hola, {user?.name || 'Redactor'}</h1>
            <p>Panel de proyectos asignados</p>
          </div>
          <div className="wp-hero-right">
            <div className="wp-hero-stat">
              <span className="wp-hero-stat-value">{projects.length}</span>
              <span className="wp-hero-stat-label">Total</span>
            </div>
            <div className="wp-hero-stat">
              <span className="wp-hero-stat-value">{activeProjects}</span>
              <span className="wp-hero-stat-label">Activos</span>
            </div>
            <div className="wp-hero-stat">
              <span className="wp-hero-stat-value">{counts.completed}</span>
              <span className="wp-hero-stat-label">Completados</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wp-main">
        {/* ── View Switcher ── */}
        <div className="wp-view-switcher">
          {[
            { key: 'proyectos',  icon: <FaClipboardList />, label: 'Proyectos' },
            { key: 'calendario', icon: <FaCalendarAlt />,   label: 'Calendario' },
            { key: 'pagos',      icon: <FaMoneyBillWave />, label: 'Mis Pagos' },
          ].map(v => (
            <button
              key={v.key}
              className={`wp-view-btn ${activeView === v.key ? 'wp-view-btn-active' : ''}`}
              onClick={() => setActiveView(v.key)}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        {/* ══════════ CALENDAR VIEW ══════════ */}
        {activeView === 'calendario' && (() => {
          const year = calendarMonth.getFullYear();
          const month = calendarMonth.getMonth();
          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const today = new Date();
          const cells = [];
          for (let i = 0; i < firstDay; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);

          const getProjectsForDay = (day) => {
            if (!day) return [];
            return projects.filter(p => {
              if (!p.dueDate) return false;
              const dd = new Date(p.dueDate);
              return dd.getFullYear() === year && dd.getMonth() === month && dd.getDate() === day;
            });
          };

          return (
            <div className="wp-calendar">
              <div className="wp-cal-header">
                <button className="wp-cal-nav" onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}>
                  <FaChevronLeft />
                </button>
                <h3 className="wp-cal-title">{MONTH_NAMES[month]} {year}</h3>
                <button className="wp-cal-nav" onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}>
                  <FaChevronRight />
                </button>
              </div>
              <div className="wp-cal-grid">
                {DAY_NAMES.map(d => (
                  <div key={d} className="wp-cal-day-name">{d}</div>
                ))}
                {cells.map((day, i) => {
                  const dayProjects = getProjectsForDay(day);
                  const isToday = day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                  return (
                    <div key={i} className={`wp-cal-cell ${!day ? 'wp-cal-empty' : ''} ${isToday ? 'wp-cal-today' : ''}`}>
                      {day && <span className="wp-cal-day-num">{day}</span>}
                      {dayProjects.map(pr => (
                        <div
                          key={pr._id}
                          className={`wp-cal-event wp-cal-ev-${pr.status}`}
                          title={pr.taskTitle}
                          onClick={() => openDetail(pr)}
                        >
                          {pr.taskTitle.length > 18 ? pr.taskTitle.slice(0, 18) + '…' : pr.taskTitle}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
              {/* Upcoming deadlines */}
              <div className="wp-cal-upcoming">
                <h4 className="wp-cal-upcoming-title"><FaClock /> Próximas entregas</h4>
                {projects
                  .filter(p => p.dueDate && p.status !== 'completed' && p.status !== 'cancelled')
                  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                  .slice(0, 5)
                  .map(p => {
                    const dl = getDaysLeft(p.dueDate);
                    return (
                      <div key={p._id} className="wp-cal-upcoming-item" onClick={() => openDetail(p)}>
                        <div className={`wp-cal-upcoming-dot ${dl < 0 ? 'overdue' : dl <= 3 ? 'urgent' : 'normal'}`} />
                        <div className="wp-cal-upcoming-info">
                          <span className="wp-cal-upcoming-name">{p.taskTitle}</span>
                          <span className="wp-cal-upcoming-date">{fmtDate(p.dueDate)}</span>
                        </div>
                        <span className={`wp-cal-upcoming-days ${dl < 0 ? 'overdue' : dl <= 3 ? 'urgent' : ''}`}>
                          {dl < 0 ? `${Math.abs(dl)}d vencido` : dl === 0 ? 'Hoy' : `${dl}d`}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })()}

        {/* ══════════ PAYMENTS VIEW ══════════ */}
        {activeView === 'pagos' && (() => {
          const projectPayments = projects.map(p => {
            const total = p.payment?.amount || 0;
            const writerTotal = Math.round(total * WRITER_CUT);
            const schedule = (p.payment?.schedule || []).map(s => ({
              ...s,
              writerAmount: Math.round((s.amount || 0) * WRITER_CUT),
            }));
            const writerPaid = schedule.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.writerAmount, 0);
            const writerPending = writerTotal - writerPaid;
            return { ...p, writerTotal, writerPaid, writerPending, schedule };
          });
          const totalEarned = projectPayments.reduce((s, p) => s + p.writerPaid, 0);
          const totalPending = projectPayments.reduce((s, p) => s + p.writerPending, 0);
          const totalAll = projectPayments.reduce((s, p) => s + p.writerTotal, 0);

          return (
            <div className="wp-payments">
              {/* Summary cards */}
              <div className="wp-pay-summary">
                <div className="wp-pay-sum-card wp-pay-sum-green">
                  <div className="wp-pay-sum-icon"><FaCheckCircle /></div>
                  <div>
                    <div className="wp-pay-sum-value">{fmtMoney(totalEarned)}</div>
                    <div className="wp-pay-sum-label">Cobrado</div>
                  </div>
                </div>
                <div className="wp-pay-sum-card wp-pay-sum-amber">
                  <div className="wp-pay-sum-icon"><FaClock /></div>
                  <div>
                    <div className="wp-pay-sum-value">{fmtMoney(totalPending)}</div>
                    <div className="wp-pay-sum-label">Pendiente</div>
                  </div>
                </div>
                <div className="wp-pay-sum-card wp-pay-sum-blue">
                  <div className="wp-pay-sum-icon"><FaMoneyBillWave /></div>
                  <div>
                    <div className="wp-pay-sum-value">{fmtMoney(totalAll)}</div>
                    <div className="wp-pay-sum-label">Total (45%)</div>
                  </div>
                </div>
              </div>

              {/* Per-project breakdown */}
              {projectPayments.map(pp => (
                <div key={pp._id} className="wp-pay-project">
                  <div className="wp-pay-project-header" onClick={() => openDetail(pp)}>
                    <div>
                      <h4 className="wp-pay-project-title">{pp.taskTitle}</h4>
                      <span className="wp-pay-project-type">{pp.taskType} &bull; {pp.educationLevel}</span>
                    </div>
                    <div className="wp-pay-project-total">
                      <span className="wp-pay-label">Tu parte</span>
                      <span className="wp-pay-amount">{fmtMoney(pp.writerTotal)}</span>
                    </div>
                  </div>
                  {pp.schedule.length > 0 ? (
                    <div className="wp-pay-schedule">
                      {pp.schedule.map((inst, i) => {
                        const isPaid = inst.status === 'paid';
                        const isOverdue = !isPaid && inst.dueDate && new Date(inst.dueDate) < new Date();
                        return (
                          <div key={i} className="wp-pay-inst">
                            <div className={`wp-pay-inst-icon ${isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending'}`}>
                              {isPaid ? <FaCheckCircle /> : isOverdue ? <FaExclamationCircle /> : <FaClock />}
                            </div>
                            <div className="wp-pay-inst-info">
                              <span className="wp-pay-inst-label">{inst.label || `Pago ${inst.number}`}</span>
                              <span className="wp-pay-inst-date">{fmtDate(inst.dueDate)}</span>
                            </div>
                            <div className="wp-pay-inst-amounts">
                              <span className="wp-pay-inst-client">Cliente: {fmtMoney(inst.amount)}</span>
                              <span className={`wp-pay-inst-writer ${isPaid ? 'paid' : ''}`}>
                                Tú: {fmtMoney(inst.writerAmount)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="wp-pay-no-schedule">Sin esquema de pagos definido — Tu parte estimada: {fmtMoney(pp.writerTotal)}</div>
                  )}
                </div>
              ))}

              {projectPayments.length === 0 && (
                <div className="wp-empty">
                  <div className="wp-empty-icon"><FaMoneyBillWave /></div>
                  <h2>Sin pagos registrados</h2>
                  <p>Los pagos aparecerán cuando tengas proyectos asignados con pagos.</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* ══════════ PROJECTS VIEW ══════════ */}
        {activeView === 'proyectos' && <>
        {/* ── Tabs ── */}
        <div className="wp-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`wp-tab ${activeTab === tab.key ? 'wp-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="wp-tab-count">{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        {/* ── Cards Grid ── */}
        {filtered.length === 0 ? (
          <div className="wp-empty">
            <div className="wp-empty-icon"><FaClipboardList /></div>
            <h2>
              {activeTab === 'all'
                ? 'No tienes proyectos asignados'
                : `No hay proyectos en "${TABS.find((t) => t.key === activeTab)?.label}"`}
            </h2>
            <p>Los proyectos aparecerán aquí cuando te sean asignados.</p>
          </div>
        ) : (
          <div className="wp-cards">
            {filtered.map((project) => {
              const statusInfo = STATUS_MAP[project.status] || STATUS_MAP.pending;
              const daysLeft = getDaysLeft(project.dueDate);
              return (
                <div
                  key={project._id}
                  className={`wp-card wp-card-priority-${project.priority || 'medium'}`}
                  onClick={() => openDetail(project)}
                >
                  <div className="wp-card-header">
                    <h3 className="wp-card-title">{project.taskTitle}</h3>
                    <span className={`wp-card-status ${statusInfo.class}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>

                  <div className="wp-card-meta">
                    <span className="wp-card-tag"><FaBook /> {project.taskType}</span>
                    <span className="wp-card-tag"><FaGraduationCap /> {project.educationLevel}</span>
                    {project.pages && (
                      <span className="wp-card-tag"><FaFileAlt /> {project.pages} págs.</span>
                    )}
                    <span className="wp-card-tag">
                      <FaCalendarAlt />
                      {daysLeft !== null ? (
                        daysLeft < 0
                          ? <span style={{ color: '#dc2626' }}>Vencido ({Math.abs(daysLeft)}d)</span>
                          : daysLeft === 0
                          ? <span style={{ color: '#f59e0b' }}>Hoy</span>
                          : `${daysLeft} días`
                      ) : '—'}
                    </span>
                  </div>

                  <div className="wp-card-progress">
                    <div className="wp-card-progress-header">
                      <span>Progreso</span>
                      <span>{project.progress || 0}%</span>
                    </div>
                    <div className="wp-card-progress-track">
                      <div
                        className="wp-card-progress-fill"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {project.client?.name && (
                    <div className="wp-card-client">
                      <div className="wp-card-client-avatar">
                        {project.client.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{project.client.name}</span>
                      <FaChevronRight style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#cbd5e1' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </>}
      </div>{/* end wp-main */}

      </div>{/* end wp-scroll */}

      {/* ── Detail Side Panel ── */}
      {selectedProject && (
        <div className="wp-detail-overlay" onClick={() => setSelectedProject(null)}>
          <div className="wp-detail-panel" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="wp-detail-header">
              <button className="wp-detail-close" onClick={() => setSelectedProject(null)}>
                <FaTimes />
              </button>
              <div className="wp-detail-title">{selectedProject.taskTitle}</div>
              <div className="wp-detail-subtitle">
                {selectedProject.taskType} &bull; {selectedProject.educationLevel}
              </div>
            </div>

            <div className="wp-detail-body">
              {/* Info Grid */}
              <div className="wp-detail-section">
                <h4 className="wp-detail-section-title"><FaClipboardList /> Detalles</h4>
                <div className="wp-detail-info-grid">
                  <div className="wp-detail-info-item">
                    <div className="wp-detail-info-label">Estado</div>
                    <div className="wp-detail-info-value">
                      {(STATUS_MAP[selectedProject.status] || STATUS_MAP.pending).label}
                    </div>
                  </div>
                  <div className="wp-detail-info-item">
                    <div className="wp-detail-info-label">Fecha entrega</div>
                    <div className="wp-detail-info-value">{fmtDate(selectedProject.dueDate)}</div>
                  </div>
                  <div className="wp-detail-info-item">
                    <div className="wp-detail-info-label">Páginas</div>
                    <div className="wp-detail-info-value">{selectedProject.pages || '—'}</div>
                  </div>
                  <div className="wp-detail-info-item">
                    <div className="wp-detail-info-label">Cliente</div>
                    <div className="wp-detail-info-value">
                      {selectedProject.client?.name || selectedProject.clientName || '—'}
                    </div>
                  </div>
                  <div className="wp-detail-info-item">
                    <div className="wp-detail-info-label">Área</div>
                    <div className="wp-detail-info-value">{selectedProject.studyArea || '—'}</div>
                  </div>
                  <div className="wp-detail-info-item">
                    <div className="wp-detail-info-label">Carrera</div>
                    <div className="wp-detail-info-value">{selectedProject.career || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {selectedProject.requirements?.text && (
                <div className="wp-detail-section">
                  <h4 className="wp-detail-section-title"><FaFileAlt /> Requisitos</h4>
                  <div className="wp-detail-requirements">
                    {selectedProject.requirements.text}
                  </div>
                </div>
              )}

              {/* Progress Update */}
              <div className="wp-detail-section">
                <h4 className="wp-detail-section-title"><FaSlidersH /> Actualizar progreso</h4>
                <div className="wp-progress-update">
                  <input
                    type="range"
                    className="wp-progress-slider"
                    min="0"
                    max="100"
                    step="5"
                    value={progressValue}
                    onChange={(e) => setProgressValue(Number(e.target.value))}
                  />
                  <span className="wp-progress-value">{progressValue}%</span>
                  <button
                    className="wp-progress-save"
                    onClick={handleSaveProgress}
                    disabled={savingProgress || progressValue === selectedProject.progress}
                  >
                    {savingProgress ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>

              {/* Comments / Chat */}
              <div className="wp-detail-section">
                <h4 className="wp-detail-section-title"><FaComments /> Mensajes</h4>
                <div className="wp-detail-chat">
                  {(!selectedProject.comments || selectedProject.comments.length === 0) ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: 20, fontSize: '0.82rem' }}>
                      Sin mensajes aún
                    </div>
                  ) : (
                    selectedProject.comments.map((c, i) => {
                      const isMe = c.user === user?._id || c.user?._id === user?._id;
                      return (
                        <div key={i} className={`wp-chat-msg ${isMe ? 'wp-chat-me' : 'wp-chat-them'}`}>
                          {!isMe && (
                            <div className="wp-chat-sender">{c.user?.name || 'Cliente'}</div>
                          )}
                          <div>{c.text}</div>
                          <div className="wp-chat-time">{fmtDate(c.createdAt)}</div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="wp-chat-input">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  />
                  <button
                    className="wp-chat-send"
                    onClick={handleSendComment}
                    disabled={sendingComment || !commentText.trim()}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WriterPanel;
