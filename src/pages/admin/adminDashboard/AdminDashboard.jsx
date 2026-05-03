import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import axiosWithAuth from '../../../utils/axioswithAuth';
import {
  FaFileAlt, FaProjectDiagram, FaCommentDots, FaDollarSign,
  FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
  FaArrowRight, FaChartLine, FaUserGraduate, FaTruck,
  FaExclamationCircle, FaRegCalendarAlt, FaPercent, FaEye,
  FaArrowUp, FaArrowDown, FaUsers, FaWallet, FaPencilAlt,
  FaBolt, FaChartBar, FaWhatsapp, FaMoneyBillWave, FaSyncAlt,
  FaExclamationTriangle, FaUserClock, FaCalendarCheck,
  FaPhoneAlt, FaFunnelDollar, FaBullhorn,
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllQuotes } from '../../../features/quotes/quoteSlice';
import { getAllProjects } from '../../../features/projects/projectSlice';
import { getConversations } from '../../../features/chat/chatSlice';
import { fetchUsers } from '../../../features/auth/userSlice';
import { fetchNotifications } from '../../../features/notifications/notificationSlice';
import './AdminDashboard.css';

const COLORS_PIE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

const AdminDashboard = () => {
  const [paymentsDash, setPaymentsDash] = useState(null);
  const [revenueDash, setRevenueDash] = useState(null);
  const [waStats, setWaStats] = useState(null);
  const [vendedorSales, setVendedorSales] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);

  const quotes = useSelector(state => state.quotes.quotes || []);
  const projects = useSelector(state => state.projects?.projects || []);
  const conversations = useSelector(state => state.chat.conversations || []);
  const notifications = useSelector(state => state.notifications.notifications || []);
  const users = useSelector(state => state.users.users || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchAllData = useCallback(async () => {
    setApiLoading(true);
    dispatch(getAllQuotes());
    dispatch(getAllProjects());
    dispatch(getConversations());
    dispatch(fetchUsers());
    dispatch(fetchNotifications());

    const results = await Promise.allSettled([
      axiosWithAuth.get('/payments/dashboard'),
      axiosWithAuth.get('/revenue/dashboard'),
      axiosWithAuth.get('/api/v1/whatsapp/leads-stats'),
      axiosWithAuth.get('/payments/vendedor-sales?period=thisMonth'),
    ]);

    if (results[0].status === 'fulfilled') setPaymentsDash(results[0].value.data);
    if (results[1].status === 'fulfilled') setRevenueDash(results[1].value.data);
    if (results[2].status === 'fulfilled') setWaStats(results[2].value.data);
    if (results[3].status === 'fulfilled') setVendedorSales(results[3].value.data);
    setApiLoading(false);
  }, [dispatch]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);
  const goTo = (path) => navigate(path, { replace: true });

  // ═══════════════════════════════════════════════════
  // REAL KPIs from /payments/dashboard
  // ═══════════════════════════════════════════════════
  const revenue = useMemo(() => {
    if (!paymentsDash?.summary) return null;
    const s = paymentsDash.summary;
    const monthly = paymentsDash.monthly || [];
    const current = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    const growth = prev?.ingresos > 0
      ? Math.round(((current?.ingresos || 0) - prev.ingresos) / prev.ingresos * 100) : 0;
    return { ...s, growth, thisMonth: current?.ingresos || 0 };
  }, [paymentsDash]);

  // ═══════════════════════════════════════════════════
  // REAL Lead Stats from /whatsapp/leads-stats
  // ═══════════════════════════════════════════════════
  const leadStats = useMemo(() => {
    if (!waStats) return null;
    const g = waStats.general || {};
    const r = waStats.recientes || {};
    const p = waStats.porEstado || {};
    const admins = waStats.porAdmin || {};
    const problemas = waStats.problemas || {};
    const alertas = waStats.alertas || [];
    const embudo = waStats.embudo || [];
    return { g, r, p, admins, problemas, alertas, embudo };
  }, [waStats]);

  // ═══════════════════════════════════════════════════
  // Revenue chart from REAL daily data
  // ═══════════════════════════════════════════════════
  const revenueChart = useMemo(() => {
    if (!paymentsDash?.daily) return [];
    return paymentsDash.daily.slice(-30).map(d => ({
      label: new Date(d.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
      ingresos: d.ingresos || 0,
    }));
  }, [paymentsDash]);

  // ═══════════════════════════════════════════════════
  // ALL pending installments (cobros pendientes)
  // ═══════════════════════════════════════════════════
  const pendingInstallments = useMemo(() => {
    if (!paymentsDash?.payments) return [];
    const pending = [];
    paymentsDash.payments.forEach(p => {
      if (p.schedule && p.schedule.length > 0) {
        // Multi-payment: check each installment
        p.schedule.forEach(inst => {
          if (inst.status === 'pending') {
            pending.push({
              id: `${p._id}-${inst.number}`,
              client: p.clientName || 'Sin nombre',
              title: p.title || '',
              amount: inst.amount || 0,
              dueDate: inst.dueDate,
              label: inst.label || `Pago ${inst.number}`,
              vendedor: p.vendedor,
              esquema: p.esquema,
            });
          }
        });
      } else if (p.status === 'pendiente' || p.status === 'pending') {
        // Single payment without schedule that's still pending
        pending.push({
          id: p._id,
          client: p.clientName || 'Sin nombre',
          title: p.title || '',
          amount: p.amount || 0,
          dueDate: p.dueDate,
          label: 'Pago único',
          vendedor: p.vendedor,
          esquema: p.esquema || 'unico',
        });
      }
    });
    return pending.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [paymentsDash]);

  // ═══════════════════════════════════════════════════
  // Project metrics — ALL projects
  // ═══════════════════════════════════════════════════
  const projectMetrics = useMemo(() => {
    const active = projects.filter(p => p.status === 'in_progress' || p.status === 'review' || p.status === 'revision');
    const pending = projects.filter(p => p.status === 'pending');
    const completed = projects.filter(p => p.status === 'completed');
    const cancelled = projects.filter(p => p.status === 'cancelled');

    // Writer workload
    const writerMap = {};
    active.forEach(p => {
      const wName = p.writer?.name || 'Sin asignar';
      if (!writerMap[wName]) writerMap[wName] = { name: wName, count: 0, projects: [] };
      writerMap[wName].count++;
      writerMap[wName].projects.push(p);
    });
    const writerWorkload = Object.values(writerMap).sort((a, b) => b.count - a.count);

    // Upcoming deadlines
    const upcoming = [...active, ...pending]
      .filter(p => p.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    return { active, pending, completed, cancelled, writerWorkload, upcoming, total: projects.length };
  }, [projects]);

  // ═══════════════════════════════════════════════════
  // Vendedor performance
  // ═══════════════════════════════════════════════════
  const topVendedores = useMemo(() => {
    if (Array.isArray(vendedorSales)) return vendedorSales.slice(0, 5);
    if (vendedorSales?.vendedores) return vendedorSales.vendedores.slice(0, 5);
    if (!paymentsDash?.payments) return [];
    const map = {};
    paymentsDash.payments.forEach(p => {
      if (!p.vendedor) return;
      if (!map[p.vendedor]) map[p.vendedor] = { vendedor: p.vendedor, total: 0, count: 0 };
      map[p.vendedor].total += p.amount || 0;
      map[p.vendedor].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [vendedorSales, paymentsDash]);

  // ═══════════════════════════════════════════════════
  // Expenses from /revenue/dashboard
  // ═══════════════════════════════════════════════════
  const expenses = useMemo(() => {
    if (!revenueDash) return null;
    const monthlyExp = revenueDash.expenses?.monthly?.total || 0;
    const yearlyExp = revenueDash.expenses?.yearly?.total || 0;
    const byCategory = revenueDash.expenses?.monthly?.byCategory || [];
    const profit = revenueDash.profit?.monthly || 0;
    const costPerThesis = revenueDash.costPerThesis || 0;
    return { monthlyExp, yearlyExp, byCategory, profit, costPerThesis };
  }, [revenueDash]);

  // Recent activity
  const recentActivity = useMemo(() => {
    return [...notifications].filter(n => n?.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  }, [notifications]);

  const unreadConvos = useMemo(() => conversations.filter(c => c.unreadCount > 0 || c.hasUnread), [conversations]);

  // ═══════════════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════════════
  const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n || 0);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—';
  const fmtAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return fmtDate(dateStr);
  };

  const getActivityIcon = (type) => {
    const map = {
      cotizacion: { icon: <FaFileAlt />, color: '#60A5FA', bg: 'rgba(59,130,246,0.12)' },
      mensaje: { icon: <FaCommentDots />, color: '#34D399', bg: 'rgba(16,185,129,0.12)' },
      pago: { icon: <FaDollarSign />, color: '#FB923C', bg: 'rgba(249,115,22,0.12)' },
      proyecto: { icon: <FaProjectDiagram />, color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
      entrega: { icon: <FaTruck />, color: '#38BDF8', bg: 'rgba(56,189,248,0.12)' },
      whatsapp: { icon: <FaWhatsapp />, color: '#25D366', bg: 'rgba(37,211,102,0.12)' },
      lead: { icon: <FaWhatsapp />, color: '#25D366', bg: 'rgba(37,211,102,0.12)' },
      alerta: { icon: <FaExclamationCircle />, color: '#F87171', bg: 'rgba(239,68,68,0.12)' },
      info: { icon: <FaChartLine />, color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
    };
    return map[type] || map.info;
  };

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="adm-chart-tooltip">
        <div className="adm-chart-tooltip-label">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="adm-chart-tooltip-value" style={{ color: p.color }}>{fmt(p.value)}</div>
        ))}
      </div>
    );
  };

  const isLoading = apiLoading;

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div className="adm-dash">
      {/* ── Header ── */}
      <div className="adm-dash-header">
        <div>
          <h1 className="adm-dash-title">Dashboard</h1>
          <p className="adm-dash-subtitle">Centro de operaciones — datos en tiempo real</p>
        </div>
        <div className="adm-dash-header-right">
          <button className="adm-refresh-btn" onClick={fetchAllData} disabled={isLoading}>
            <FaSyncAlt className={isLoading ? 'adm-spinning' : ''} />
          </button>
          <div className="adm-dash-date">
            <FaRegCalendarAlt />
            <span>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* ══════════ ROW 1: Revenue KPIs ══════════ */}
      <div className="adm-dash-kpis">
        <div className="adm-kpi-card adm-kpi-highlight" onClick={() => goTo('/admin/revenue')}>
          <div className="adm-kpi-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399' }}><FaWallet /></div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Ingresos totales</span>
            <span className="adm-kpi-value">{isLoading ? <Spinner size="sm" /> : fmt(revenue?.totalIngresos)}</span>
            <span className="adm-kpi-trend">
              {revenue?.growth !== 0 && <span className={revenue?.growth > 0 ? 'trend-up' : 'trend-down'}>{revenue?.growth > 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(revenue?.growth || 0)}%</span>}
              {' vs mes anterior'}
            </span>
          </div>
        </div>

        <div className="adm-kpi-card" onClick={() => goTo('/admin/pagos')}>
          <div className="adm-kpi-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA' }}><FaMoneyBillWave /></div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Cobrado</span>
            <span className="adm-kpi-value">{isLoading ? <Spinner size="sm" /> : fmt(revenue?.cobrado)}</span>
            <span className="adm-kpi-trend">{revenue?.totalPagos || 0} ventas cerradas</span>
          </div>
        </div>

        <div className="adm-kpi-card" onClick={() => goTo('/admin/pagos')}>
          <div className="adm-kpi-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#FBBF24' }}><FaHourglassHalf /></div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Por cobrar</span>
            <span className="adm-kpi-value">{isLoading ? <Spinner size="sm" /> : fmt(revenue?.pendiente)}</span>
            <span className="adm-kpi-trend">{pendingInstallments.length} parcialidades pendientes</span>
          </div>
        </div>

        <div className="adm-kpi-card" onClick={() => goTo('/admin/revenue')}>
          <div className="adm-kpi-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}><FaDollarSign /></div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Neto empresa</span>
            <span className="adm-kpi-value">{isLoading ? <Spinner size="sm" /> : fmt(revenue?.netoEmpresa)}</span>
            <span className="adm-kpi-trend">comisiones: {fmt(revenue?.totalComisiones)}</span>
          </div>
        </div>

        <div className="adm-kpi-card" onClick={() => goTo('/admin/revenue')}>
          <div className="adm-kpi-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}><FaBullhorn /></div>
          <div className="adm-kpi-body">
            <span className="adm-kpi-label">Gastos del mes</span>
            <span className="adm-kpi-value">{isLoading ? <Spinner size="sm" /> : fmt(expenses?.monthlyExp)}</span>
            <span className="adm-kpi-trend">profit: {fmt(expenses?.profit)}</span>
          </div>
        </div>
      </div>

      {/* ══════════ ROW 2: Lead Funnel from /whatsapp/leads-stats ══════════ */}
      <div className="adm-dash-card adm-funnel-card">
        <h3 className="adm-card-title">
          <FaWhatsapp style={{ color: '#25D366' }} /> Embudo de leads — WhatsApp
          <span className="adm-card-count">{leadStats?.g?.total || 0} leads totales</span>
        </h3>

        {/* Top KPIs row */}
        <div className="adm-funnel-metrics">
          <div className="adm-fm" onClick={() => goTo('/admin/whatsapp')}>
            <span className="adm-fm-value" style={{ color: '#25D366' }}>{leadStats?.g?.total || 0}</span>
            <span className="adm-fm-label">Total leads</span>
          </div>
          <div className="adm-fm" onClick={() => goTo('/admin/whatsapp')}>
            <span className="adm-fm-value" style={{ color: '#F87171' }}>{leadStats?.g?.sinAtender || 0}</span>
            <span className="adm-fm-label">Sin atender</span>
          </div>
          <div className="adm-fm">
            <span className="adm-fm-value" style={{ color: '#FBBF24' }}>{leadStats?.g?.tasaConversion || 0}%</span>
            <span className="adm-fm-label">Tasa conversión</span>
          </div>
          <div className="adm-fm">
            <span className="adm-fm-value" style={{ color: '#A78BFA' }}>{leadStats?.g?.tasaCalificacion || 0}%</span>
            <span className="adm-fm-label">Tasa calificación</span>
          </div>
          <div className="adm-fm">
            <span className="adm-fm-value" style={{ color: '#60A5FA' }}>{leadStats?.p?.modo_humano || 0}</span>
            <span className="adm-fm-label">Modo humano</span>
          </div>
        </div>

        {/* Recientes - nuevos leads */}
        <div className="adm-lead-recientes">
          <span className="adm-lr-item">Nuevos 24h: <strong>{leadStats?.r?.h24 || 0}</strong></span>
          <span className="adm-lr-item">7 días: <strong>{leadStats?.r?.d7 || 0}</strong></span>
          <span className="adm-lr-item">30 días: <strong>{leadStats?.r?.d30 || 0}</strong></span>
        </div>

        {/* Real funnel stages */}
        {leadStats?.embudo?.length > 0 && (
          <div className="adm-funnel-stages">
            {leadStats.embudo.filter(s => s.value > 0).map((stage, i) => (
              <div key={stage.etapa} className="adm-funnel-stage-item">
                <div className="adm-funnel-stage-bar" style={{ background: stage.color || COLORS_PIE[i % COLORS_PIE.length], width: `${Math.max(((stage.value / (leadStats.embudo[0]?.value || 1)) * 100), 12)}%` }}>
                  <span>{stage.value}</span>
                </div>
                <span className="adm-funnel-stage-name">{stage.etapa}</span>
              </div>
            ))}
            {/* Lost leads */}
            {waStats?.perdidos?.filter(s => s.value > 0).map((stage, i) => (
              <div key={stage.etapa} className="adm-funnel-stage-item">
                <div className="adm-funnel-stage-bar" style={{ background: stage.color || '#EF4444', width: `${Math.max(((stage.value / (leadStats.embudo[0]?.value || 1)) * 100), 12)}%` }}>
                  <span>{stage.value}</span>
                </div>
                <span className="adm-funnel-stage-name">{stage.etapa}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom row: admin + sources */}
        <div className="adm-lead-bottom">
          <div className="adm-lead-admins">
            <span className="adm-la-title">Por vendedor:</span>
            {leadStats?.admins && Object.entries(leadStats.admins).filter(([k]) => k !== 'sinAtender').map(([name, count]) => (
              <span key={name} className="adm-la-chip">{name}: <strong>{count}</strong></span>
            ))}
          </div>
          <div className="adm-lead-sources">
            <span className="adm-la-chip" style={{ borderColor: 'rgba(37,211,102,0.3)' }}>Regular: <strong>{leadStats?.g?.regular || 0}</strong></span>
            <span className="adm-la-chip" style={{ borderColor: 'rgba(251,191,36,0.3)' }}>ManyChat: <strong>{leadStats?.g?.manychat || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* ══════════ ROW 3: ACCIONES URGENTES — qué hacer ahora ══════════ */}
      {(leadStats?.alertas?.length > 0 || pendingInstallments.length > 0 || projectMetrics.upcoming.some(p => {
        const daysLeft = p.dueDate ? Math.ceil((new Date(p.dueDate) - new Date()) / 86400000) : 999;
        return daysLeft <= 3 && daysLeft >= 0;
      })) && (
        <div className="adm-dash-card adm-actions-urgent">
          <h3 className="adm-card-title">
            <FaExclamationTriangle style={{ color: '#F87171' }} /> Requiere tu atención ahora
          </h3>
          <div className="adm-urgent-grid">
            {/* WhatsApp alerts */}
            {leadStats?.alertas?.map((a, i) => (
              <div key={`wa-${i}`} className={`adm-urgent-item adm-urgent-${a.severidad}`} onClick={() => goTo('/admin/whatsapp')}>
                <div className="adm-urgent-icon"><FaWhatsapp /></div>
                <div className="adm-urgent-body">
                  <span className="adm-urgent-title">{a.titulo}</span>
                  <span className="adm-urgent-desc">{a.descripcion}</span>
                </div>
                <span className="adm-urgent-count">{a.count}</span>
                <span className="adm-urgent-action">Ir a WA →</span>
              </div>
            ))}

            {/* Cotizaciones pendientes de envío */}
            {quotes.filter(q => q.status === 'pending').length > 3 && (
              <div className="adm-urgent-item adm-urgent-media" onClick={() => goTo('/admin/cotizaciones')}>
                <div className="adm-urgent-icon"><FaFileAlt /></div>
                <div className="adm-urgent-body">
                  <span className="adm-urgent-title">Cotizaciones pendientes</span>
                  <span className="adm-urgent-desc">{quotes.filter(q => q.status === 'pending').length} cotizaciones esperan respuesta</span>
                </div>
                <span className="adm-urgent-count">{quotes.filter(q => q.status === 'pending').length}</span>
                <span className="adm-urgent-action">Revisar →</span>
              </div>
            )}

            {/* Proyectos próximos a vencer */}
            {projectMetrics.upcoming.filter(p => {
              const daysLeft = p.dueDate ? Math.ceil((new Date(p.dueDate) - new Date()) / 86400000) : 999;
              return daysLeft <= 3 && daysLeft >= 0;
            }).length > 0 && (
              <div className="adm-urgent-item adm-urgent-alta" onClick={() => goTo('/admin/proyectos')}>
                <div className="adm-urgent-icon"><FaProjectDiagram /></div>
                <div className="adm-urgent-body">
                  <span className="adm-urgent-title">Entregas próximas (&lt;3 días)</span>
                  <span className="adm-urgent-desc">
                    {projectMetrics.upcoming.filter(p => {
                      const dl = p.dueDate ? Math.ceil((new Date(p.dueDate) - new Date()) / 86400000) : 999;
                      return dl <= 3 && dl >= 0;
                    }).map(p => p.taskTitle || p.clientName).join(', ')}
                  </span>
                </div>
                <span className="adm-urgent-action">Ver proyectos →</span>
              </div>
            )}

            {/* Mensajes sin leer */}
            {unreadConvos.length > 0 && (
              <div className="adm-urgent-item adm-urgent-media" onClick={() => goTo('/admin/mensajes')}>
                <div className="adm-urgent-icon"><FaCommentDots /></div>
                <div className="adm-urgent-body">
                  <span className="adm-urgent-title">Mensajes sin leer</span>
                  <span className="adm-urgent-desc">{unreadConvos.length} conversaciones esperan respuesta</span>
                </div>
                <span className="adm-urgent-count">{unreadConvos.length}</span>
                <span className="adm-urgent-action">Responder →</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ ROW 4: Revenue chart + Cobros pendientes ══════════ */}
      <div className="adm-dash-grid">
        <div className="adm-dash-card">
          <h3 className="adm-card-title"><FaChartBar style={{ color: '#34D399' }} /> Ingresos diarios</h3>
          {revenueChart.length > 0 ? (
            <div className="adm-chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1F2937' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="ingresos" stroke="#10B981" fill="url(#gRev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="adm-empty-state"><FaChartLine size={24} /><span>Sin datos</span></div>
          )}
        </div>

        <div className="adm-dash-card">
          <h3 className="adm-card-title">
            <FaCalendarCheck style={{ color: '#FBBF24' }} /> Cobros pendientes
            <span className="adm-card-badge">{pendingInstallments.length}</span>
          </h3>
          <div className="adm-cobros-total">
            Total por cobrar: <strong>{fmt(revenue?.pendiente)}</strong>
          </div>
          {pendingInstallments.length === 0 ? (
            <div className="adm-empty-state"><FaCheckCircle size={24} /><span>Todo cobrado</span></div>
          ) : (
            <div className="adm-installments-list">
              {pendingInstallments.slice(0, 12).map(inst => (
                <div key={inst.id} className="adm-inst-item" onClick={() => goTo('/admin/pagos')}>
                  <div className="adm-inst-info">
                    <span className="adm-inst-client">{inst.client}</span>
                    <span className="adm-inst-detail">{inst.label} · {inst.vendedor || '—'}</span>
                  </div>
                  <div className="adm-inst-right">
                    <span className="adm-inst-amount">{fmt(inst.amount)}</span>
                    <span className="adm-inst-due">{fmtDate(inst.dueDate)}</span>
                  </div>
                </div>
              ))}
              {pendingInstallments.length > 12 && (
                <div className="adm-see-more" onClick={() => goTo('/admin/pagos')}>
                  Ver {pendingInstallments.length - 12} más →
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ ROW 5: Projects overview + Vendedores ══════════ */}
      <div className="adm-dash-grid">
        <div className="adm-dash-card">
          <h3 className="adm-card-title"><FaProjectDiagram style={{ color: '#60A5FA' }} /> Proyectos</h3>
          <div className="adm-project-summary">
            <div className="adm-ps-item" onClick={() => goTo('/admin/proyectos')}>
              <span className="adm-ps-count" style={{ color: '#60A5FA' }}>{projectMetrics.active.length}</span>
              <span className="adm-ps-label">Activos</span>
            </div>
            <div className="adm-ps-item" onClick={() => goTo('/admin/proyectos')}>
              <span className="adm-ps-count" style={{ color: '#FBBF24' }}>{projectMetrics.pending.length}</span>
              <span className="adm-ps-label">Pendientes</span>
            </div>
            <div className="adm-ps-item" onClick={() => goTo('/admin/proyectos')}>
              <span className="adm-ps-count" style={{ color: '#34D399' }}>{projectMetrics.completed.length}</span>
              <span className="adm-ps-label">Completados</span>
            </div>
            <div className="adm-ps-item">
              <span className="adm-ps-count" style={{ color: '#9CA3AF' }}>{projectMetrics.total}</span>
              <span className="adm-ps-label">Total</span>
            </div>
          </div>

          {/* Writer workload */}
          <h4 className="adm-subsection-title">Carga por redactor</h4>
          {projectMetrics.writerWorkload.length === 0 ? (
            <div className="adm-empty-state-sm">Sin redactores con proyectos activos</div>
          ) : (
            <div className="adm-writer-list">
              {projectMetrics.writerWorkload.map(w => (
                <div key={w.name} className="adm-writer-item">
                  <div className="adm-writer-avatar">{w.name.charAt(0).toUpperCase()}</div>
                  <span className="adm-writer-name">{w.name}</span>
                  <span className="adm-writer-count">{w.count} proyecto{w.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming deadlines */}
          {projectMetrics.upcoming.length > 0 && (
            <>
              <h4 className="adm-subsection-title">Próximas entregas</h4>
              <div className="adm-deadlines">
                {projectMetrics.upcoming.map(p => (
                  <div key={p._id} className="adm-deadline-item" onClick={() => goTo('/admin/proyectos')}>
                    <span className="adm-dl-title">{p.taskTitle || p.clientName || 'Proyecto'}</span>
                    <span className="adm-dl-date">{fmtDate(p.dueDate)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="adm-dash-card">
          <h3 className="adm-card-title"><FaUsers style={{ color: '#A78BFA' }} /> Vendedores — este mes</h3>
          {topVendedores.length === 0 ? (
            <div className="adm-empty-state"><FaUsers size={24} /><span>Sin datos</span></div>
          ) : (
            <div className="adm-vendedor-list">
              {topVendedores.map((v, i) => {
                const maxTotal = topVendedores[0]?.total || topVendedores[0]?.ingresos || 1;
                const total = v.total || v.ingresos || 0;
                const count = v.count || v.ventas || 0;
                return (
                  <div key={v.vendedor || v._id || i} className="adm-vendedor-item">
                    <span className="adm-vendedor-pos">{i + 1}</span>
                    <div className="adm-vendedor-info">
                      <span className="adm-vendedor-name">{v.vendedor || v._id || 'Sin asignar'}</span>
                      <div className="adm-vendedor-bar-bg">
                        <div className="adm-vendedor-bar-fill" style={{ width: `${(total / maxTotal) * 100}%` }} />
                      </div>
                    </div>
                    <div className="adm-vendedor-stats">
                      <span className="adm-vendedor-amount">{fmt(total)}</span>
                      <span className="adm-vendedor-count">{count} venta{count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Expenses breakdown if available */}
          {expenses?.byCategory?.length > 0 && (
            <>
              <h4 className="adm-subsection-title" style={{ marginTop: '20px' }}>Gastos del mes por categoría</h4>
              <div className="adm-expense-list">
                {expenses.byCategory.slice(0, 6).map((cat, i) => (
                  <div key={cat._id || i} className="adm-expense-item">
                    <span className="adm-expense-name">{cat._id || 'Otro'}</span>
                    <span className="adm-expense-amount">{fmt(cat.total)}</span>
                  </div>
                ))}
              </div>
              {expenses.costPerThesis > 0 && (
                <div className="adm-cost-per">Costo por tesis: <strong>{fmt(expenses.costPerThesis)}</strong></div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══════════ ROW 6: Messages + Activity ══════════ */}
      <div className="adm-dash-grid">
        <div className="adm-dash-card">
          <h3 className="adm-card-title">
            <FaCommentDots style={{ color: '#34D399' }} /> Comunicación
          </h3>
          <div className="adm-comm-grid">
            <div className="adm-comm-item" onClick={() => goTo('/admin/mensajes')}>
              <FaCommentDots className="adm-comm-icon" style={{ color: '#34D399' }} />
              <span className="adm-comm-value">{unreadConvos.length}</span>
              <span className="adm-comm-label">Msgs sin leer</span>
            </div>
            <div className="adm-comm-item" onClick={() => goTo('/admin/whatsapp')}>
              <FaWhatsapp className="adm-comm-icon" style={{ color: '#25D366' }} />
              <span className="adm-comm-value">{leadStats?.g?.sinAtender || 0}</span>
              <span className="adm-comm-label">WA sin atender</span>
            </div>
            <div className="adm-comm-item" onClick={() => goTo('/admin/cotizaciones')}>
              <FaFileAlt className="adm-comm-icon" style={{ color: '#FBBF24' }} />
              <span className="adm-comm-value">{quotes.filter(q => q.status === 'pending').length}</span>
              <span className="adm-comm-label">Cotiz. pendientes</span>
            </div>
            <div className="adm-comm-item" onClick={() => goTo('/admin/usuarios')}>
              <FaUsers className="adm-comm-icon" style={{ color: '#A78BFA' }} />
              <span className="adm-comm-value">{users.length}</span>
              <span className="adm-comm-label">Usuarios total</span>
            </div>
          </div>
        </div>

        <div className="adm-dash-card">
          <h3 className="adm-card-title">Actividad reciente</h3>
          {recentActivity.length === 0 ? (
            <div className="adm-empty-state"><FaChartLine size={28} /><span>Sin actividad</span></div>
          ) : (
            <div className="adm-activity-list">
              {recentActivity.map(notif => {
                const a = getActivityIcon(notif.type);
                return (
                  <div key={notif._id} className="adm-activity-item">
                    <div className="adm-activity-icon-wrap" style={{ background: a.bg, color: a.color }}>{a.icon}</div>
                    <div className="adm-activity-body">
                      <span className="adm-activity-msg">{notif.message || notif.body}</span>
                      <span className="adm-activity-time">{fmtAgo(notif.createdAt)}</span>
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
