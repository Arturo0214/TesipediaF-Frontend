import React, { useMemo, useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import axiosWithAuth from '../../../utils/axioswithAuth';
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
  FaHandshake,
  FaAddressBook,
  FaFunnelDollar,
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllQuotes } from '../../../features/quotes/quoteSlice';
import { getAllProjects } from '../../../features/projects/projectSlice';
import { getConversations } from '../../../features/chat/chatSlice';
import { fetchUsers } from '../../../features/auth/userSlice';
import { getVisits } from '../../../features/visits/visitsSlice';
import { fetchNotifications } from '../../../features/notifications/notificationSlice';
import { fetchHubspotSummary } from '../../../features/hubspot/hubspotSlice';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [paymentsDash, setPaymentsDash] = useState(null);
  const quotes = useSelector(state => state.quotes.quotes || []);
  const quotesLoading = useSelector(state => state.quotes.loading);
  const projects = useSelector(state => state.projects?.projects || []);
  const projectsLoading = useSelector(state => state.projects?.isLoading);
  const conversations = useSelector(state => state.chat.conversations || []);
  const messagesLoading = useSelector(state => state.chat.loading);
  const notifications = useSelector(state => state.notifications.notifications || []);
  const users = useSelector(state => state.users.users || []);
  const visits = useSelector(state => state.visits.visits || []);
  const hubspot = useSelector(state => state.hubspot?.summary);
  const hubspotLoading = useSelector(state => state.hubspot?.loading);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch all data on mount
  useEffect(() => {
    dispatch(getAllQuotes());
    dispatch(getAllProjects());
    dispatch(getConversations());
    dispatch(fetchUsers());
    dispatch(getVisits());
    dispatch(fetchNotifications());
    dispatch(fetchHubspotSummary());
    // Fetch real payments dashboard
    axiosWithAuth.get('/payments/dashboard').then(res => setPaymentsDash(res.data)).catch(() => {});
  }, [dispatch]);

  // ── Navigation helper ─────────────────────────────
  const goTo = (path) => {
    navigate(path, { replace: true });
  };

  // ── Computed metrics ──────────────────────────────
  const metrics = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const pendingQuotes = quotes.filter(q => q.status === 'pending');
    const approvedQuotes = quotes.filter(q => q.status === 'approved');
    const paidQuotes = quotes.filter(q => q.status === 'paid');
    const rejectedQuotes = quotes.filter(q => q.status === 'rejected');

    const thisMonthQuotes = quotes.filter(q => new Date(q.createdAt) >= thisMonth);
    const lastMonthQuotes = quotes.filter(q => {
      const d = new Date(q.createdAt);
      return d >= lastMonth && d <= lastMonthEnd;
    });

    const revenueThisMonth = paidQuotes
      .filter(q => new Date(q.updatedAt || q.createdAt) >= thisMonth)
      .reduce((sum, q) => sum + (q.priceDetails?.finalPrice || q.estimatedPrice || 0), 0);

    const revenueLastMonth = paidQuotes
      .filter(q => {
        const d = new Date(q.updatedAt || q.createdAt);
        return d >= lastMonth && d <= lastMonthEnd;
      })
      .reduce((sum, q) => sum + (q.priceDetails?.finalPrice || q.estimatedPrice || 0), 0);

    const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'review');
    const completedProjects = projects.filter(p => p.status === 'completed');
    const unreadConvos = conversations.filter(c => c.unreadCount > 0 || c.hasUnread);

    const totalFinished = paidQuotes.length + rejectedQuotes.length;
    const conversionRate = totalFinished > 0 ? Math.round((paidQuotes.length / totalFinished) * 100) : 0;

    const weekVisits = visits.filter(v => new Date(v.createdAt || v.date) >= sevenDaysAgo);
    const newUsersMonth = users.filter(u => new Date(u.createdAt) >= thisMonth);

    return {
      pendingQuotes, approvedQuotes, paidQuotes, rejectedQuotes,
      thisMonthQuotes, lastMonthQuotes, revenueThisMonth, revenueLastMonth,
      activeProjects, completedProjects, unreadConvos, conversionRate,
      weekVisits, newUsersMonth,
    };
  }, [quotes, projects, conversations, visits, users]);

  // ── Recent activity ───────────────────────────────
  const recentActivity = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  }, [notifications]);

  // ── Pending actions ───────────────────────────────
  const pendingActions = useMemo(() => {
    const actions = [];

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
        link: '/admin/cotizaciones',
      });
    });

    projects.filter(p => p.status === 'review').slice(0, 3).forEach(p => {
      actions.push({
        id: p._id,
        type: 'proyecto',
        icon: <FaProjectDiagram />,
        color: '#6c5ce7',
        title: p.taskTitle || 'Proyecto',
        subtitle: `Progreso: ${p.progress || 0}%`,
        detail: 'En revisión',
        date: p.updatedAt || p.createdAt,
        badge: 'Revisión',
        badgeColor: '#8b5cf6',
        link: '/admin/proyectos',
      });
    });

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
        link: '/admin/pagos',
      });
    });

    return actions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  }, [metrics, projects]);

  // ── HubSpot pipeline stages ───────────────────────
  const hubspotPipeline = useMemo(() => {
    if (!hubspot?.deals?.byStage) return [];
    const stages = Object.entries(hubspot.deals.byStage)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return stages;
  }, [hubspot]);

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

  const stageColors = ['#f59e0b', '#4a6cf7', '#6c5ce7', '#00b894', '#e17055', '#ef4444', '#8b5cf6', '#fdcb6e'];

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

      {/* ── KPI Cards (clickable) ── */}
      <div className="adm-dash-kpis">
        <div className="adm-kpi-card adm-kpi-clickable" onClick={() => goTo('/admin/cotizaciones')}>
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

        <div className="adm-kpi-card adm-kpi-clickable" onClick={() => goTo('/admin/proyectos')}>
          <div className="adm-kpi-icon" style={{ background: '#f0eeff', color: '#6c5ce7' }}>
            <FaProjectDiagram />
          </div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Proyectos activos</span>
            <span className="adm-kpi-value">
              {isLoading ? <Spinner size="sm" /> : metrics.activeProjects.length}
            </span>
            <span className="adm-kpi-trend">{metrics.completedProjects.length} completados</span>
          </div>
        </div>

        <div className="adm-kpi-card adm-kpi-clickable" onClick={() => goTo('/admin/mensajes')}>
          <div className="adm-kpi-icon" style={{ background: '#e6f9f3', color: '#00b894' }}>
            <FaCommentDots />
          </div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Mensajes sin leer</span>
            <span className="adm-kpi-value">
              {isLoading ? <Spinner size="sm" /> : metrics.unreadConvos.length}
            </span>
            <span className="adm-kpi-trend">{conversations.length} conversaciones</span>
          </div>
        </div>

        <div className="adm-kpi-card adm-kpi-clickable" onClick={() => goTo('/admin/pagos')}>
          <div className="adm-kpi-icon" style={{ background: '#fef0ec', color: '#e17055' }}>
            <FaDollarSign />
          </div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Ingresos totales</span>
            <span className="adm-kpi-value">
              {isLoading ? <Spinner size="sm" /> : formatCurrency(paymentsDash?.summary?.totalIngresos || metrics.revenueThisMonth)}
            </span>
            <span className="adm-kpi-trend">
              {paymentsDash?.summary
                ? `${paymentsDash.summary.totalPagos} ventas · Comisión: ${formatCurrency(paymentsDash.summary.totalComisiones)}`
                : (metrics.revenueLastMonth > 0 ? `${formatCurrency(metrics.revenueLastMonth)} mes anterior` : 'Sin datos previos')
              }
            </span>
          </div>
        </div>
      </div>

      {/* ── Pipeline (Tesipedia) + Stats Row ── */}
      <div className="adm-dash-grid">
        <div className="adm-dash-card adm-pipeline-card">
          <h3 className="adm-card-title">Pipeline de cotizaciones</h3>
          <div className="adm-pipeline">
            <div className="adm-pipeline-stage" onClick={() => goTo('/admin/cotizaciones')} style={{ cursor: 'pointer' }}>
              <div className="adm-pipeline-bar" style={{ background: '#f59e0b' }}>
                <FaHourglassHalf />
                <span className="adm-pipeline-count">{metrics.pendingQuotes.length}</span>
              </div>
              <span className="adm-pipeline-label">Pendientes</span>
            </div>
            <FaArrowRight className="adm-pipeline-arrow" />
            <div className="adm-pipeline-stage" onClick={() => goTo('/admin/cotizaciones')} style={{ cursor: 'pointer' }}>
              <div className="adm-pipeline-bar" style={{ background: '#4a6cf7' }}>
                <FaCheckCircle />
                <span className="adm-pipeline-count">{metrics.approvedQuotes.length}</span>
              </div>
              <span className="adm-pipeline-label">Aprobadas</span>
            </div>
            <FaArrowRight className="adm-pipeline-arrow" />
            <div className="adm-pipeline-stage" onClick={() => goTo('/admin/pagos')} style={{ cursor: 'pointer' }}>
              <div className="adm-pipeline-bar" style={{ background: '#00b894' }}>
                <FaDollarSign />
                <span className="adm-pipeline-count">{metrics.paidQuotes.length}</span>
              </div>
              <span className="adm-pipeline-label">Pagadas</span>
            </div>
            <FaArrowRight className="adm-pipeline-arrow" />
            <div className="adm-pipeline-stage" onClick={() => goTo('/admin/cotizaciones')} style={{ cursor: 'pointer' }}>
              <div className="adm-pipeline-bar" style={{ background: '#ef4444' }}>
                <FaTimesCircle />
                <span className="adm-pipeline-count">{metrics.rejectedQuotes.length}</span>
              </div>
              <span className="adm-pipeline-label">Rechazadas</span>
            </div>
          </div>
          <div className="adm-pipeline-total">Total: {quotes.length} cotizaciones</div>
        </div>

        <div className="adm-dash-card adm-stats-card">
          <h3 className="adm-card-title">Métricas clave</h3>
          <div className="adm-quick-stats">
            <div className="adm-stat-row" onClick={() => goTo('/admin/cotizaciones')} style={{ cursor: 'pointer' }}>
              <div className="adm-stat-icon" style={{ background: '#e6f9f3', color: '#00b894' }}><FaPercent /></div>
              <div className="adm-stat-info">
                <span className="adm-stat-name">Tasa de conversión</span>
                <span className="adm-stat-val">{metrics.conversionRate}%</span>
              </div>
            </div>
            <div className="adm-stat-row" onClick={() => goTo('/admin/visitas')} style={{ cursor: 'pointer' }}>
              <div className="adm-stat-icon" style={{ background: '#eef1ff', color: '#4a6cf7' }}><FaEye /></div>
              <div className="adm-stat-info">
                <span className="adm-stat-name">Visitas esta semana</span>
                <span className="adm-stat-val">{metrics.weekVisits.length}</span>
              </div>
            </div>
            <div className="adm-stat-row" onClick={() => goTo('/admin/usuarios')} style={{ cursor: 'pointer' }}>
              <div className="adm-stat-icon" style={{ background: '#f0eeff', color: '#6c5ce7' }}><FaUserGraduate /></div>
              <div className="adm-stat-info">
                <span className="adm-stat-name">Usuarios nuevos (mes)</span>
                <span className="adm-stat-val">{metrics.newUsersMonth.length}</span>
              </div>
            </div>
            <div className="adm-stat-row" onClick={() => goTo('/admin/proyectos')} style={{ cursor: 'pointer' }}>
              <div className="adm-stat-icon" style={{ background: '#fef9e7', color: '#fdcb6e' }}><FaClock /></div>
              <div className="adm-stat-info">
                <span className="adm-stat-name">Proyectos completados</span>
                <span className="adm-stat-val">{metrics.completedProjects.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── HubSpot Section ── */}
      <div className="adm-dash-section-label">
        <FaHandshake /> HubSpot CRM
      </div>
      <div className="adm-dash-kpis adm-hubspot-kpis">
        <div className="adm-kpi-card adm-kpi-hubspot">
          <div className="adm-kpi-icon" style={{ background: '#fff3e0', color: '#ff7043' }}>
            <FaFunnelDollar />
          </div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Deals totales</span>
            <span className="adm-kpi-value">
              {hubspotLoading ? <Spinner size="sm" /> : (hubspot?.deals?.total || 0)}
            </span>
            <span className="adm-kpi-trend">{hubspot?.deals?.dealsThisMonth || 0} este mes</span>
          </div>
        </div>

        <div className="adm-kpi-card adm-kpi-hubspot">
          <div className="adm-kpi-icon" style={{ background: '#e8f5e9', color: '#43a047' }}>
            <FaDollarSign />
          </div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Revenue total</span>
            <span className="adm-kpi-value">
              {hubspotLoading ? <Spinner size="sm" /> : formatCurrency(hubspot?.deals?.totalRevenue || 0)}
            </span>
            <span className="adm-kpi-trend">{formatCurrency(hubspot?.deals?.revenueThisMonth || 0)} este mes</span>
          </div>
        </div>

        <div className="adm-kpi-card adm-kpi-hubspot">
          <div className="adm-kpi-icon" style={{ background: '#e3f2fd', color: '#1e88e5' }}>
            <FaAddressBook />
          </div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Contactos</span>
            <span className="adm-kpi-value">
              {hubspotLoading ? <Spinner size="sm" /> : (hubspot?.contacts?.total || 0)}
            </span>
            <span className="adm-kpi-trend">{hubspot?.contacts?.contactsThisMonth || 0} nuevos este mes</span>
          </div>
        </div>
      </div>

      {/* HubSpot Pipeline + Recent Deals */}
      {hubspot && (
        <div className="adm-dash-grid">
          <div className="adm-dash-card">
            <h3 className="adm-card-title"><FaFunnelDollar style={{ color: '#ff7043' }} /> Pipeline de deals</h3>
            {hubspotPipeline.length > 0 ? (
              <div className="adm-hs-pipeline">
                {hubspotPipeline.map((stage, idx) => (
                  <div key={stage.id} className="adm-hs-stage">
                    <div className="adm-hs-stage-bar" style={{ background: stageColors[idx % stageColors.length] }}>
                      <span className="adm-hs-stage-count">{stage.count}</span>
                    </div>
                    <span className="adm-hs-stage-label">{stage.label}</span>
                    <span className="adm-hs-stage-amount">{formatCurrency(stage.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="adm-empty-state">
                <FaFunnelDollar size={24} />
                <span>Sin datos de pipeline</span>
              </div>
            )}
          </div>

          <div className="adm-dash-card">
            <h3 className="adm-card-title"><FaHandshake style={{ color: '#ff7043' }} /> Deals recientes</h3>
            {hubspot.deals?.recent?.length > 0 ? (
              <div className="adm-actions-list">
                {hubspot.deals.recent.map(deal => (
                  <div key={deal.id} className="adm-action-item">
                    <div className="adm-action-icon" style={{ color: '#ff7043' }}><FaHandshake /></div>
                    <div className="adm-action-body">
                      <span className="adm-action-title">{deal.name}</span>
                      <span className="adm-action-sub">{deal.stage}</span>
                    </div>
                    <div className="adm-action-meta">
                      <span className="adm-action-badge" style={{ background: '#ff7043' }}>
                        {formatCurrency(deal.amount)}
                      </span>
                      <span className="adm-action-time">{formatTimeAgo(deal.created)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="adm-empty-state">
                <FaHandshake size={24} />
                <span>Sin deals recientes</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Pending Actions + Activity ── */}
      <div className="adm-dash-grid">
        <div className="adm-dash-card adm-actions-card">
          <h3 className="adm-card-title">
            Acciones pendientes
            {pendingActions.length > 0 && <span className="adm-card-badge">{pendingActions.length}</span>}
          </h3>
          {pendingActions.length === 0 ? (
            <div className="adm-empty-state">
              <FaCheckCircle size={28} />
              <span>Todo al día — no hay acciones pendientes</span>
            </div>
          ) : (
            <div className="adm-actions-list">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="adm-action-item adm-action-clickable"
                  onClick={() => goTo(action.link)}
                >
                  <div className="adm-action-icon" style={{ color: action.color }}>{action.icon}</div>
                  <div className="adm-action-body">
                    <span className="adm-action-title">{action.title}</span>
                    <span className="adm-action-sub">
                      {action.subtitle}
                      {action.detail && <> · {action.detail}</>}
                    </span>
                  </div>
                  <div className="adm-action-meta">
                    <span className="adm-action-badge" style={{ background: action.badgeColor }}>{action.badge}</span>
                    <span className="adm-action-time">{formatTimeAgo(action.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
