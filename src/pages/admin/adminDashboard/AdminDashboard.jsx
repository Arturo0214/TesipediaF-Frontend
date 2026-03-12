import React, { useMemo, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import {
  FaFileAlt,
  FaProjectDiagram,
  FaCommentDots,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaArrowRight,
  FaChartLine,
  FaUserGraduate,
  FaTruck,
  FaExclamationCircle,
  FaRegCalendarAlt,
  FaPercent,
  FaEye,
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { getAllQuotes } from '../../../features/quotes/quoteSlice';
import { getAllProjects } from '../../../features/projects/projectSlice';
import { getConversations } from '../../../features/chat/chatSlice';
import { fetchUsers } from '../../../features/auth/userSlice';
import { getVisits } from '../../../features/visits/visitsSlice';
import { fetchNotifications } from '../../../features/notifications/notificationSlice';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const quotes = useSelector(state => state.quotes.quotes || []);
  const quotesLoading = useSelector(state => state.quotes.loading);
  const projects = useSelector(state => state.projects?.projects || []);
  const projectsLoading = useSelector(state => state.projects?.isLoading);
  const conversations = useSelector(state => state.chat.conversations || []);
  const messagesLoading = useSelector(state => state.chat.loading);
  const notifications = useSelector(state => state.notifications.notifications || []);
  const users = useSelector(state => state.users.users || []);
  const visits = useSelector(state => state.visits.visits || []);
  const dispatch = useDispatch();

  // Fetch all data on mount
  useEffect(() => {
    dispatch(getAllQuotes());
    dispatch(getAllProjects());
    dispatch(getConversations());
    dispatch(fetchUsers());
    dispatch(getVisits());
    dispatch(fetchNotifications());
  }, [dispatch]);

  // ── Computed metrics ──────────────────────────────
  const metrics = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Quote statuses
    const pendingQuotes = quotes.filter(q => q.status === 'pending');
    const approvedQuotes = quotes.filter(q => q.status === 'approved');
    const paidQuotes = quotes.filter(q => q.status === 'paid');
    const rejectedQuotes = quotes.filter(q => q.status === 'rejected');

    // This month quotes
    const thisMonthQuotes = quotes.filter(q => new Date(q.createdAt) >= thisMonth);
    const lastMonthQuotes = quotes.filter(q => {
      const d = new Date(q.createdAt);
      return d >= lastMonth && d <= lastMonthEnd;
    });

    // Revenue (from paid quotes with priceDetails or estimatedPrice)
    const revenueThisMonth = paidQuotes
      .filter(q => new Date(q.updatedAt || q.createdAt) >= thisMonth)
      .reduce((sum, q) => sum + (q.priceDetails?.finalPrice || q.estimatedPrice || 0), 0);

    const revenueLastMonth = paidQuotes
      .filter(q => {
        const d = new Date(q.updatedAt || q.createdAt);
        return d >= lastMonth && d <= lastMonthEnd;
      })
      .reduce((sum, q) => sum + (q.priceDetails?.finalPrice || q.estimatedPrice || 0), 0);

    // Project statuses
    const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'review');
    const completedProjects = projects.filter(p => p.status === 'completed');

    // Unread conversations
    const unreadConvos = conversations.filter(c => c.unreadCount > 0 || c.hasUnread);

    // Conversion rate
    const totalFinished = paidQuotes.length + rejectedQuotes.length;
    const conversionRate = totalFinished > 0 ? Math.round((paidQuotes.length / totalFinished) * 100) : 0;

    // Visits this week
    const weekVisits = visits.filter(v => new Date(v.createdAt || v.date) >= sevenDaysAgo);

    // New users this month
    const newUsersMonth = users.filter(u => new Date(u.createdAt) >= thisMonth);

    return {
      pendingQuotes,
      approvedQuotes,
      paidQuotes,
      rejectedQuotes,
      thisMonthQuotes,
      lastMonthQuotes,
      revenueThisMonth,
      revenueLastMonth,
      activeProjects,
      completedProjects,
      unreadConvos,
      conversionRate,
      weekVisits,
      newUsersMonth,
    };
  }, [quotes, projects, conversations, visits, users]);

  // ── Recent activity (from notifications) ──────────
  const recentActivity = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  }, [notifications]);

  // ── Pending actions ───────────────────────────────
  const pendingActions = useMemo(() => {
    const actions = [];

    // Pending quotes (need review)
    metrics.pendingQuotes.slice(0, 5).forEach(q => {
      actions.push({
        id: q._id,
        type: 'cotizacion',
        icon: <FaFileAlt />,
        color: '#4a6cf7',
        title: q.taskTitle || q.taskType || 'Cotización',
        subtitle: q.name || q.email || '',
        detail: q.educationLevel || '',
        date: q.createdAt,
        badge: 'Pendiente',
        badgeColor: '#f59e0b',
      });
    });

    // Active projects needing attention (in review)
    projects.filter(p => p.status === 'review').slice(0, 3).forEach(p => {
      actions.push({
        id: p._id,
        type: 'proyecto',
        icon: <FaProjectDiagram />,
        color: '#6c5ce7',
        title: p.taskTitle || 'Proyecto',
        subtitle: `Progreso: ${p.progress || 0}%`,
        detail: p.status === 'review' ? 'En revisión' : '',
        date: p.updatedAt || p.createdAt,
        badge: 'Revisión',
        badgeColor: '#8b5cf6',
      });
    });

    // Approved quotes waiting for payment
    metrics.approvedQuotes.slice(0, 3).forEach(q => {
      actions.push({
        id: q._id,
        type: 'pago',
        icon: <FaDollarSign />,
        color: '#e17055',
        title: q.taskTitle || 'Cotización aprobada',
        subtitle: `$${q.priceDetails?.finalPrice || q.estimatedPrice || 0} MXN`,
        detail: 'Esperando pago',
        date: q.updatedAt || q.createdAt,
        badge: 'Por pagar',
        badgeColor: '#ef4444',
      });
    });

    return actions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  }, [metrics, projects]);

  // ── Format helpers ────────────────────────────────
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(amount);
  };

  const getActivityIcon = (type) => {
    const map = {
      cotizacion: { icon: <FaFileAlt />, color: '#4a6cf7', bg: '#eef1ff' },
      mensaje: { icon: <FaCommentDots />, color: '#00b894', bg: '#e6f9f3' },
      visita: { icon: <FaEye />, color: '#6c5ce7', bg: '#f0eeff' },
      pago: { icon: <FaDollarSign />, color: '#e17055', bg: '#fef0ec' },
      proyecto: { icon: <FaProjectDiagram />, color: '#fdcb6e', bg: '#fef9e7' },
      entrega: { icon: <FaTruck />, color: '#55a3e5', bg: '#ebf4fd' },
      alerta: { icon: <FaExclamationCircle />, color: '#d63031', bg: '#fce4e4' },
      info: { icon: <FaChartLine />, color: '#636e72', bg: '#f0f0f0' },
    };
    return map[type] || map.info;
  };

  // ── Render ────────────────────────────────────────
  const isLoading = quotesLoading || projectsLoading || messagesLoading;

  return (
    <div className="adm-dash">
      {/* ── Header ── */}
      <div className="adm-dash-header">
        <div>
          <h1 className="adm-dash-title">Dashboard</h1>
          <p className="adm-dash-subtitle">Resumen general de tu negocio</p>
        </div>
        <div className="adm-dash-date">
          <FaRegCalendarAlt />
          <span>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="adm-dash-kpis">
        <div className="adm-kpi-card">
          <div className="adm-kpi-icon" style={{ background: '#eef1ff', color: '#4a6cf7' }}>
            <FaFileAlt />
          </div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Cotizaciones pendientes</span>
            <span className="adm-kpi-value">
              {isLoading ? <Spinner size="sm" /> : metrics.pendingQuotes.length}
            </span>
            <span className="adm-kpi-trend">
              {metrics.thisMonthQuotes.length} este mes
              {metrics.lastMonthQuotes.length > 0 && (
                <span className={metrics.thisMonthQuotes.length >= metrics.lastMonthQuotes.length ? 'trend-up' : 'trend-down'}>
                  {metrics.thisMonthQuotes.length >= metrics.lastMonthQuotes.length ? '↑' : '↓'}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-icon" style={{ background: '#f0eeff', color: '#6c5ce7' }}>
            <FaProjectDiagram />
          </div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Proyectos activos</span>
            <span className="adm-kpi-value">
              {isLoading ? <Spinner size="sm" /> : metrics.activeProjects.length}
            </span>
            <span className="adm-kpi-trend">
              {metrics.completedProjects.length} completados
            </span>
          </div>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-icon" style={{ background: '#e6f9f3', color: '#00b894' }}>
            <FaCommentDots />
          </div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Mensajes sin leer</span>
            <span className="adm-kpi-value">
              {isLoading ? <Spinner size="sm" /> : metrics.unreadConvos.length}
            </span>
            <span className="adm-kpi-trend">
              {conversations.length} conversaciones
            </span>
          </div>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-icon" style={{ background: '#fef0ec', color: '#e17055' }}>
            <FaDollarSign />
          </div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Ingresos del mes</span>
            <span className="adm-kpi-value">
              {isLoading ? <Spinner size="sm" /> : formatCurrency(metrics.revenueThisMonth)}
            </span>
            <span className="adm-kpi-trend">
              {metrics.revenueLastMonth > 0
                ? `${formatCurrency(metrics.revenueLastMonth)} mes anterior`
                : 'Sin datos del mes anterior'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Pipeline + Stats Row ── */}
      <div className="adm-dash-grid">
        {/* Pipeline */}
        <div className="adm-dash-card adm-pipeline-card">
          <h3 className="adm-card-title">Pipeline de cotizaciones</h3>
          <div className="adm-pipeline">
            <div className="adm-pipeline-stage">
              <div className="adm-pipeline-bar" style={{ background: '#f59e0b' }}>
                <FaHourglassHalf />
                <span className="adm-pipeline-count">{metrics.pendingQuotes.length}</span>
              </div>
              <span className="adm-pipeline-label">Pendientes</span>
            </div>
            <FaArrowRight className="adm-pipeline-arrow" />
            <div className="adm-pipeline-stage">
              <div className="adm-pipeline-bar" style={{ background: '#4a6cf7' }}>
                <FaCheckCircle />
                <span className="adm-pipeline-count">{metrics.approvedQuotes.length}</span>
              </div>
              <span className="adm-pipeline-label">Aprobadas</span>
            </div>
            <FaArrowRight className="adm-pipeline-arrow" />
            <div className="adm-pipeline-stage">
              <div className="adm-pipeline-bar" style={{ background: '#00b894' }}>
                <FaDollarSign />
                <span className="adm-pipeline-count">{metrics.paidQuotes.length}</span>
              </div>
              <span className="adm-pipeline-label">Pagadas</span>
            </div>
            <FaArrowRight className="adm-pipeline-arrow" />
            <div className="adm-pipeline-stage">
              <div className="adm-pipeline-bar" style={{ background: '#ef4444' }}>
                <FaTimesCircle />
                <span className="adm-pipeline-count">{metrics.rejectedQuotes.length}</span>
              </div>
              <span className="adm-pipeline-label">Rechazadas</span>
            </div>
          </div>
          <div className="adm-pipeline-total">
            Total: {quotes.length} cotizaciones
          </div>
        </div>

        {/* Quick Stats */}
        <div className="adm-dash-card adm-stats-card">
          <h3 className="adm-card-title">Métricas clave</h3>
          <div className="adm-quick-stats">
            <div className="adm-stat-row">
              <div className="adm-stat-icon" style={{ background: '#e6f9f3', color: '#00b894' }}>
                <FaPercent />
              </div>
              <div className="adm-stat-info">
                <span className="adm-stat-name">Tasa de conversión</span>
                <span className="adm-stat-val">{metrics.conversionRate}%</span>
              </div>
            </div>
            <div className="adm-stat-row">
              <div className="adm-stat-icon" style={{ background: '#eef1ff', color: '#4a6cf7' }}>
                <FaEye />
              </div>
              <div className="adm-stat-info">
                <span className="adm-stat-name">Visitas esta semana</span>
                <span className="adm-stat-val">{metrics.weekVisits.length}</span>
              </div>
            </div>
            <div className="adm-stat-row">
              <div className="adm-stat-icon" style={{ background: '#f0eeff', color: '#6c5ce7' }}>
                <FaUserGraduate />
              </div>
              <div className="adm-stat-info">
                <span className="adm-stat-name">Usuarios nuevos (mes)</span>
                <span className="adm-stat-val">{metrics.newUsersMonth.length}</span>
              </div>
            </div>
            <div className="adm-stat-row">
              <div className="adm-stat-icon" style={{ background: '#fef9e7', color: '#fdcb6e' }}>
                <FaClock />
              </div>
              <div className="adm-stat-info">
                <span className="adm-stat-name">Proyectos completados</span>
                <span className="adm-stat-val">{metrics.completedProjects.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pending Actions + Activity ── */}
      <div className="adm-dash-grid">
        {/* Pending Actions */}
        <div className="adm-dash-card adm-actions-card">
          <h3 className="adm-card-title">
            Acciones pendientes
            {pendingActions.length > 0 && (
              <span className="adm-card-badge">{pendingActions.length}</span>
            )}
          </h3>
          {pendingActions.length === 0 ? (
            <div className="adm-empty-state">
              <FaCheckCircle size={28} />
              <span>Todo al día — no hay acciones pendientes</span>
            </div>
          ) : (
            <div className="adm-actions-list">
              {pendingActions.map((action) => (
                <div key={action.id} className="adm-action-item">
                  <div className="adm-action-icon" style={{ color: action.color }}>
                    {action.icon}
                  </div>
                  <div className="adm-action-body">
                    <span className="adm-action-title">{action.title}</span>
                    <span className="adm-action-sub">
                      {action.subtitle}
                      {action.detail && <> · {action.detail}</>}
                    </span>
                  </div>
                  <div className="adm-action-meta">
                    <span className="adm-action-badge" style={{ background: action.badgeColor }}>
                      {action.badge}
                    </span>
                    <span className="adm-action-time">{formatTimeAgo(action.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="adm-dash-card adm-activity-card">
          <h3 className="adm-card-title">Actividad reciente</h3>
          {recentActivity.length === 0 ? (
            <div className="adm-empty-state">
              <FaChartLine size={28} />
              <span>No hay actividad reciente</span>
            </div>
          ) : (
            <div className="adm-activity-list">
              {recentActivity.map((notif) => {
                const actConfig = getActivityIcon(notif.type);
                return (
                  <div key={notif._id} className="adm-activity-item">
                    <div className="adm-activity-dot" style={{ background: actConfig.color }} />
                    <div className="adm-activity-icon-wrap" style={{ background: actConfig.bg, color: actConfig.color }}>
                      {actConfig.icon}
                    </div>
                    <div className="adm-activity-body">
                      <span className="adm-activity-msg">{notif.message || notif.body}</span>
                      <span className="adm-activity-time">{formatTimeAgo(notif.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
