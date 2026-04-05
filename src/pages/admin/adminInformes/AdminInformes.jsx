import React, { useState, useEffect, useCallback } from 'react';
import { Spinner, Badge, Button } from 'react-bootstrap';
import {
  FaExclamationTriangle, FaCheckCircle, FaSync, FaRobot,
  FaUserTie, FaChartBar, FaChartPie, FaBan, FaClock,
  FaUsers, FaDollarSign, FaFunnelDollar, FaBolt,
  FaArrowUp, FaArrowDown, FaMinus, FaPlay, FaStop,
  FaCalendarAlt, FaInfoCircle, FaTimes,
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
  Legend,
} from 'recharts';
import { toast } from 'react-hot-toast';
import {
  getLeadsStats,
  getCalificacionFollowUpStatus,
  configCalificacionFollowUp,
  runCalificacionFollowUp,
  getAutoReminderStatus,
  configAutoReminder,
  getRevivalStatus,
  configRevival,
  getQuoteFollowUpStatus,
  configQuoteFollowUp,
} from '../../../services/whatsapp/supabaseWhatsApp';
import './AdminInformes.css';

/* ── Paleta de colores por estado ── */
const ESTADO_COLORS = {
  bienvenida: '#6b7280',
  calificando: '#f59e0b',
  cotizando: '#3b82f6',
  cotizacion_enviada: '#10b981',
  cotizacion_lista: '#8b5cf6',
  descartado: '#ef4444',
  modo_humano: '#0ea5e9',
};

const ADMIN_COLORS = {
  arturo: '#f59e0b',
  sandy: '#9b8afb',
  hugo: '#3b82f6',
  sinAtender: '#e5e7eb',
};

const SEVERIDAD_CONFIG = {
  alta: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', icon: FaExclamationTriangle },
  media: { bg: '#fffbeb', border: '#fcd34d', text: '#d97706', icon: FaExclamationTriangle },
  baja: { bg: '#eff6ff', border: '#93c5fd', text: '#2563eb', icon: FaInfoCircle },
};

/* ── Helpers ── */
function pct(val, total) {
  if (!total) return 0;
  return Math.round((val / total) * 100);
}

function fmt(n) {
  return new Intl.NumberFormat('es-MX').format(n || 0);
}

function fmtMXN(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n || 0);
}

function tdiff(isoStr) {
  if (!isoStr) return '—';
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

/* ── Tarjeta KPI ── */
function KpiCard({ icon: Icon, label, value, sub, color = '#10b981', trend, fmt: fmtFn = fmt }) {
  return (
    <div className="inf-kpi-card" style={{ borderTopColor: color }}>
      <div className="inf-kpi-icon" style={{ background: color + '1a', color }}>
        <Icon />
      </div>
      <div className="inf-kpi-body">
        <div className="inf-kpi-value">{fmtFn(value)}</div>
        <div className="inf-kpi-label">{label}</div>
        {sub && <div className="inf-kpi-sub">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`inf-kpi-trend ${trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat'}`}>
          {trend > 0 ? <FaArrowUp /> : trend < 0 ? <FaArrowDown /> : <FaMinus />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta de alerta ── */
function AlertCard({ alerta }) {
  const cfg = SEVERIDAD_CONFIG[alerta.severidad] || SEVERIDAD_CONFIG.baja;
  const Icon = cfg.icon;
  return (
    <div className="inf-alert-card" style={{ background: cfg.bg, borderColor: cfg.border }}>
      <div className="inf-alert-icon" style={{ color: cfg.text }}>
        <Icon />
      </div>
      <div className="inf-alert-body">
        <div className="inf-alert-title" style={{ color: cfg.text }}>{alerta.titulo}</div>
        <div className="inf-alert-desc">{alerta.descripcion}</div>
      </div>
      <div className="inf-alert-count" style={{ color: cfg.text }}>{alerta.count}</div>
    </div>
  );
}

/* ── Toggle de automatización ── */
function AutomationRow({ label, icon: Icon, status, onToggle, onRun, loading, color = '#10b981' }) {
  return (
    <div className="inf-auto-row">
      <div className="inf-auto-info">
        <Icon style={{ color, marginRight: 8, fontSize: '0.95rem' }} />
        <span className="inf-auto-label">{label}</span>
        <span className={`inf-auto-badge ${status?.active ? 'active' : 'inactive'}`}>
          {status?.active ? 'Activo' : 'Inactivo'}
        </span>
      </div>
      <div className="inf-auto-meta">
        {status?.lastRun && <span className="inf-auto-last">Último: {tdiff(status.lastResult?.time || status.lastRun)}</span>}
        {status?.lastResult?.sent !== undefined && (
          <span className="inf-auto-sent">{status.lastResult.sent} enviados</span>
        )}
      </div>
      <div className="inf-auto-actions">
        <button
          className={`inf-auto-btn run`}
          onClick={onRun}
          disabled={loading}
          title="Ejecutar ahora"
        >
          {loading ? <Spinner size="sm" animation="border" /> : <FaPlay />}
        </button>
        <button
          className={`inf-auto-btn ${status?.active ? 'stop' : 'start'}`}
          onClick={onToggle}
          disabled={loading}
          title={status?.active ? 'Desactivar' : 'Activar'}
        >
          {status?.active ? <FaStop /> : <FaBolt />}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════ */
const AdminInformes = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Estados de automatizaciones
  const [calStatus, setCalStatus] = useState(null);
  const [reminderStatus, setReminderStatus] = useState(null);
  const [revivalStatus, setRevivalStatus] = useState(null);
  const [quoteStatus, setQuoteStatus] = useState(null);
  const [autoLoading, setAutoLoading] = useState({});

  const fetchAll = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [s, cs, rs, rvs, qs] = await Promise.all([
        getLeadsStats(),
        getCalificacionFollowUpStatus().catch(() => null),
        getAutoReminderStatus().catch(() => null),
        getRevivalStatus().catch(() => null),
        getQuoteFollowUpStatus().catch(() => null),
      ]);
      setStats(s);
      setCalStatus(cs);
      setReminderStatus(rs);
      setRevivalStatus(rvs);
      setQuoteStatus(qs);
      setLastFetch(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(() => fetchAll(true), 60000); // refresca cada minuto
    return () => clearInterval(t);
  }, [fetchAll]);

  // Toggle automatización
  const toggleAuto = async (key, currentStatus, configFn, getStatusFn, setFn) => {
    setAutoLoading(p => ({ ...p, [key]: true }));
    try {
      await configFn({ active: !currentStatus?.active });
      const fresh = await getStatusFn();
      setFn(fresh);
      toast.success(!currentStatus?.active ? `${key} activado` : `${key} desactivado`);
    } catch {
      toast.error('Error al cambiar estado');
    }
    setAutoLoading(p => ({ ...p, [key]: false }));
  };

  const runAuto = async (key, runFn, getStatusFn, setFn) => {
    setAutoLoading(p => ({ ...p, [key]: true }));
    try {
      const res = await runFn({ maxPerRun: 20 });
      const fresh = await getStatusFn();
      setFn(fresh);
      toast.success(`Ejecutado: ${res.result?.sent ?? res.sent ?? 0} enviados`);
      fetchAll(true);
    } catch {
      toast.error('Error al ejecutar');
    }
    setAutoLoading(p => ({ ...p, [key]: false }));
  };

  if (loading) {
    return (
      <div className="inf-loading">
        <Spinner animation="border" variant="success" />
        <p>Analizando datos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inf-error">
        <FaExclamationTriangle />
        <p>{error}</p>
        <Button variant="outline-danger" size="sm" onClick={() => fetchAll()}>
          <FaSync className="me-1" /> Reintentar
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  const { general, porEstado, porAdmin, recientes, alertas, embudo } = stats;

  /* ── Datos para gráficas ── */
  const estadoData = Object.entries(porEstado || {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v, color: ESTADO_COLORS[k] || '#94a3b8' }));

  const adminData = [
    { name: 'Arturo', value: porAdmin.arturo || 0, color: ADMIN_COLORS.arturo },
    { name: 'Sandy', value: porAdmin.sandy || 0, color: ADMIN_COLORS.sandy },
    { name: 'Hugo', value: porAdmin.hugo || 0, color: ADMIN_COLORS.hugo },
    { name: 'Sin atender', value: porAdmin.sinAtender || 0, color: ADMIN_COLORS.sinAtender },
  ].filter(d => d.value > 0);

  const recientesData = [
    { name: 'Hoy (24h)', value: recientes.h24 || 0 },
    { name: 'Esta semana', value: recientes.d7 || 0 },
    { name: 'Este mes', value: recientes.d30 || 0 },
  ];

  const alertasAltas = (alertas || []).filter(a => a.severidad === 'alta');
  const alertasMedias = (alertas || []).filter(a => a.severidad === 'media');
  const sinProblemas = alertas?.length === 0;

  const totalActivos = (general.total || 0) - (porEstado.descartado || 0) - (general.bloqueados || 0);

  return (
    <div className="inf-wrapper">
      {/* ── Header ── */}
      <div className="inf-header">
        <div className="inf-header-left">
          <FaChartBar className="inf-header-icon" />
          <div>
            <h2 className="inf-title">Panel de Informes</h2>
            <p className="inf-subtitle">Análisis completo de conversaciones, rendimiento y automatizaciones</p>
          </div>
        </div>
        <div className="inf-header-right">
          {lastFetch && <span className="inf-last-update">Actualizado {tdiff(lastFetch.toISOString())}</span>}
          <Button variant="outline-success" size="sm" onClick={() => fetchAll()} className="inf-refresh-btn">
            <FaSync className="me-1" /> Actualizar
          </Button>
        </div>
      </div>

      {/* ── Alertas críticas ── */}
      {alertasAltas.length > 0 && (
        <div className="inf-section">
          <div className="inf-section-header">
            <FaExclamationTriangle style={{ color: '#dc2626' }} />
            <h3>Problemas críticos ({alertasAltas.length})</h3>
          </div>
          <div className="inf-alerts-grid">
            {alertasAltas.map(a => <AlertCard key={a.id} alerta={a} />)}
          </div>
        </div>
      )}

      {alertasMedias.length > 0 && (
        <div className="inf-section">
          <div className="inf-section-header">
            <FaExclamationTriangle style={{ color: '#d97706' }} />
            <h3>Advertencias ({alertasMedias.length})</h3>
          </div>
          <div className="inf-alerts-grid">
            {alertasMedias.map(a => <AlertCard key={a.id} alerta={a} />)}
          </div>
        </div>
      )}

      {sinProblemas && (
        <div className="inf-ok-banner">
          <FaCheckCircle />
          <span>Todo en orden — no se detectaron problemas activos</span>
        </div>
      )}

      {/* ── KPIs principales ── */}
      <div className="inf-section">
        <div className="inf-section-header">
          <FaChartPie />
          <h3>Métricas principales</h3>
        </div>
        <div className="inf-kpi-grid">
          <KpiCard icon={FaUsers} label="Total leads" value={general.total} color="#10b981" sub={`${general.regular} WhatsApp · ${general.manychat} ManyChat`} />
          <KpiCard icon={FaUsers} label="Activos ahora" value={totalActivos} color="#3b82f6" sub={`${pct(totalActivos, general.total)}% del total`} />
          <KpiCard icon={FaChartBar} label="Tasa de cotización" value={`${general.tasaConversion}%`} color="#8b5cf6" sub="Llegaron a cotización enviada" fmt={v => v} />
          <KpiCard icon={FaChartBar} label="Tasa de calificación" value={`${general.tasaCalificacion}%`} color="#f59e0b" sub="Pasaron de bienvenida" fmt={v => v} />
          <KpiCard icon={FaDollarSign} label="Precio promedio" value={general.precioPromedio} color="#10b981" fmt={fmtMXN} sub={`Rango: ${fmtMXN(general.precioMin)} – ${fmtMXN(general.precioMax)}`} />
          <KpiCard icon={FaUserTie} label="Sin atender" value={general.sinAtender} color={general.sinAtender > 5 ? '#ef4444' : '#6b7280'} sub="Leads sin admin asignado" />
          <KpiCard icon={FaBan} label="Bloqueados" value={general.bloqueados} color="#ef4444" sub="Contactos bloqueados" />
          <KpiCard icon={FaRobot} label="Modo humano" value={porEstado.modo_humano || 0} color="#0ea5e9" sub="Admin al frente" />
        </div>
      </div>

      {/* ── Nuevos leads ── */}
      <div className="inf-section">
        <div className="inf-section-header">
          <FaCalendarAlt />
          <h3>Nuevos leads</h3>
        </div>
        <div className="inf-kpi-grid-3">
          <div className="inf-reciente-card" style={{ borderColor: '#10b981' }}>
            <div className="inf-reciente-value" style={{ color: '#10b981' }}>{recientes.h24}</div>
            <div className="inf-reciente-label">Últimas 24h</div>
          </div>
          <div className="inf-reciente-card" style={{ borderColor: '#3b82f6' }}>
            <div className="inf-reciente-value" style={{ color: '#3b82f6' }}>{recientes.d7}</div>
            <div className="inf-reciente-label">Últimos 7 días</div>
          </div>
          <div className="inf-reciente-card" style={{ borderColor: '#8b5cf6' }}>
            <div className="inf-reciente-value" style={{ color: '#8b5cf6' }}>{recientes.d30}</div>
            <div className="inf-reciente-label">Últimos 30 días</div>
          </div>
        </div>
      </div>

      {/* ── Embudo de conversión + Gráficas ── */}
      <div className="inf-charts-row">
        {/* Embudo */}
        <div className="inf-chart-card inf-chart-card--funnel">
          <div className="inf-chart-title">Embudo de conversión</div>
          <div className="inf-funnel">
            {(embudo || []).map((e, i) => {
              const maxVal = embudo[0]?.value || 1;
              const widthPct = Math.max(20, Math.round((e.value / maxVal) * 100));
              return (
                <div key={i} className="inf-funnel-step">
                  <div className="inf-funnel-bar" style={{ width: `${widthPct}%`, background: e.color }}>
                    <span className="inf-funnel-label">{e.etapa}</span>
                    <span className="inf-funnel-count">{e.value}</span>
                  </div>
                  <span className="inf-funnel-pct">{pct(e.value, embudo[0]?.value)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución por estado */}
        <div className="inf-chart-card">
          <div className="inf-chart-title">Por estado</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={estadoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${value}`}>
                {estadoData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              <Legend iconSize={10} formatter={(v) => <span style={{ fontSize: '0.72rem' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por admin */}
        <div className="inf-chart-card">
          <div className="inf-chart-title">Por admin</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={adminData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {adminData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Estado detallado ── */}
      <div className="inf-section">
        <div className="inf-section-header">
          <FaFunnelDollar />
          <h3>Desglose por estado</h3>
        </div>
        <div className="inf-estado-table">
          {Object.entries(porEstado || {}).map(([estado, count]) => (
            <div key={estado} className="inf-estado-row">
              <div className="inf-estado-dot" style={{ background: ESTADO_COLORS[estado] || '#94a3b8' }} />
              <div className="inf-estado-name">{estado.replace(/_/g, ' ')}</div>
              <div className="inf-estado-bar-wrap">
                <div className="inf-estado-bar" style={{ width: `${pct(count, general.total)}%`, background: ESTADO_COLORS[estado] || '#94a3b8' }} />
              </div>
              <div className="inf-estado-count">{count}</div>
              <div className="inf-estado-pct">{pct(count, general.total)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Rendimiento por admin ── */}
      <div className="inf-section">
        <div className="inf-section-header">
          <FaUsers />
          <h3>Rendimiento por admin</h3>
        </div>
        <div className="inf-admin-grid">
          {[
            { key: 'arturo', label: 'Arturo', color: '#f59e0b', bg: '#fef3c7' },
            { key: 'sandy', label: 'Sandy', color: '#9b8afb', bg: '#ede9fe' },
            { key: 'hugo', label: 'Hugo', color: '#3b82f6', bg: '#dbeafe' },
          ].map(({ key, label, color, bg }) => {
            const count = porAdmin[key] || 0;
            const share = pct(count, general.total - (porAdmin.sinAtender || 0) || 1);
            return (
              <div key={key} className="inf-admin-card" style={{ borderColor: color, background: bg }}>
                <div className="inf-admin-name" style={{ color }}>{label}</div>
                <div className="inf-admin-count" style={{ color }}>{count}</div>
                <div className="inf-admin-label">leads atendidos</div>
                <div className="inf-admin-bar-wrap">
                  <div className="inf-admin-bar" style={{ width: `${share}%`, background: color }} />
                </div>
                <div className="inf-admin-share">{share}% del total atendido</div>
              </div>
            );
          })}
          <div className="inf-admin-card" style={{ borderColor: '#d1d5db', background: '#f9fafb' }}>
            <div className="inf-admin-name" style={{ color: '#6b7280' }}>Sin atender</div>
            <div className="inf-admin-count" style={{ color: general.sinAtender > 5 ? '#ef4444' : '#6b7280' }}>{porAdmin.sinAtender || 0}</div>
            <div className="inf-admin-label">esperando admin</div>
            <div className="inf-admin-bar-wrap">
              <div className="inf-admin-bar" style={{ width: `${pct(porAdmin.sinAtender, general.total)}%`, background: '#d1d5db' }} />
            </div>
            <div className="inf-admin-share">{pct(porAdmin.sinAtender, general.total)}% del total</div>
          </div>
        </div>
      </div>

      {/* ── Automatizaciones ── */}
      <div className="inf-section">
        <div className="inf-section-header">
          <FaBolt />
          <h3>Automatizaciones activas</h3>
        </div>
        <div className="inf-auto-panel">
          <AutomationRow
            label="Seguimiento calificación/cotización"
            icon={FaFunnelDollar}
            status={calStatus}
            color="#8b5cf6"
            loading={autoLoading['calificacion']}
            onToggle={() => toggleAuto('calificacion', calStatus, configCalificacionFollowUp, getCalificacionFollowUpStatus, setCalStatus)}
            onRun={() => runAuto('calificacion', runCalificacionFollowUp, getCalificacionFollowUpStatus, setCalStatus)}
          />
          <AutomationRow
            label="Recordatorio Sofia (auto-reminder)"
            icon={FaRobot}
            status={reminderStatus}
            color="#10b981"
            loading={autoLoading['reminder']}
            onToggle={() => toggleAuto('reminder', reminderStatus, configAutoReminder, getAutoReminderStatus, setReminderStatus)}
            onRun={async () => {
              setAutoLoading(p => ({ ...p, reminder: true }));
              try {
                const { sendSofiaReminders } = await import('../../../services/whatsapp/supabaseWhatsApp');
                await sendSofiaReminders(24);
                const fresh = await getAutoReminderStatus();
                setReminderStatus(fresh);
                toast.success('Recordatorios enviados');
              } catch { toast.error('Error'); }
              setAutoLoading(p => ({ ...p, reminder: false }));
            }}
          />
          <AutomationRow
            label="Revival de leads fríos"
            icon={FaArrowUp}
            status={revivalStatus}
            color="#f59e0b"
            loading={autoLoading['revival']}
            onToggle={() => toggleAuto('revival', revivalStatus, configRevival, getRevivalStatus, setRevivalStatus)}
            onRun={async () => {
              setAutoLoading(p => ({ ...p, revival: true }));
              try {
                const { runRevival } = await import('../../../services/whatsapp/supabaseWhatsApp');
                const res = await runRevival({ maxPerRun: 20 });
                const fresh = await getRevivalStatus();
                setRevivalStatus(fresh);
                toast.success(`Revival: ${res.sent ?? 0} enviados`);
              } catch { toast.error('Error'); }
              setAutoLoading(p => ({ ...p, revival: false }));
            }}
          />
          <AutomationRow
            label="Seguimiento de cotizaciones"
            icon={FaDollarSign}
            status={quoteStatus}
            color="#3b82f6"
            loading={autoLoading['quote']}
            onToggle={() => toggleAuto('quote', quoteStatus, configQuoteFollowUp, getQuoteFollowUpStatus, setQuoteStatus)}
            onRun={async () => {
              setAutoLoading(p => ({ ...p, quote: true }));
              try {
                const { runQuoteFollowUp } = await import('../../../services/whatsapp/supabaseWhatsApp');
                const res = await runQuoteFollowUp({ maxPerRun: 20 });
                const fresh = await getQuoteFollowUpStatus();
                setQuoteStatus(fresh);
                toast.success(`Quote follow-up: ${res.sent ?? 0} enviados`);
              } catch { toast.error('Error'); }
              setAutoLoading(p => ({ ...p, quote: false }));
            }}
          />
        </div>

        {/* Config rápida de Calificación Follow-Up */}
        {calStatus && (
          <div className="inf-auto-config">
            <div className="inf-auto-config-title">Configuración: Seguimiento calificación/cotización</div>
            <div className="inf-auto-config-row">
              <label>
                Cada
                <input
                  type="number" min={30} max={1440}
                  value={calStatus.intervalMinutes}
                  onChange={e => setCalStatus(p => ({ ...p, intervalMinutes: Number(e.target.value) }))}
                  className="inf-config-input"
                />
                min
              </label>
              <label>
                Inactividad mín.
                <input
                  type="number" min={30} max={1440}
                  value={calStatus.staleMinutes}
                  onChange={e => setCalStatus(p => ({ ...p, staleMinutes: Number(e.target.value) }))}
                  className="inf-config-input"
                />
                min
              </label>
              <label>
                Máx. por ciclo
                <input
                  type="number" min={1} max={100}
                  value={calStatus.maxPerRun}
                  onChange={e => setCalStatus(p => ({ ...p, maxPerRun: Number(e.target.value) }))}
                  className="inf-config-input"
                />
              </label>
              <button
                className="inf-config-save"
                onClick={async () => {
                  try {
                    await configCalificacionFollowUp({ intervalMinutes: calStatus.intervalMinutes, staleMinutes: calStatus.staleMinutes, maxPerRun: calStatus.maxPerRun });
                    toast.success('Configuración guardada');
                  } catch { toast.error('Error al guardar'); }
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Resumen de lo que mejorar ── */}
      <div className="inf-section inf-insights">
        <div className="inf-section-header">
          <FaInfoCircle />
          <h3>Qué mejorar</h3>
        </div>
        <div className="inf-insights-grid">
          {/* Insight 1: Sin atender */}
          {(general.sinAtender || 0) > 0 && (
            <div className="inf-insight-card inf-insight--warning">
              <div className="inf-insight-icon">👀</div>
              <div>
                <div className="inf-insight-title">{general.sinAtender} leads sin admin asignado</div>
                <div className="inf-insight-body">
                  Los leads sin admin tienen menor probabilidad de cerrar. Activa el auto-claim o asigna manualmente en la sección WhatsApp.
                </div>
              </div>
            </div>
          )}

          {/* Insight 2: Tasa de conversión baja */}
          {(general.tasaConversion || 0) < 20 && (
            <div className="inf-insight-card inf-insight--danger">
              <div className="inf-insight-icon">📉</div>
              <div>
                <div className="inf-insight-title">Tasa de cotización baja ({general.tasaConversion}%)</div>
                <div className="inf-insight-body">
                  Menos del 20% de leads activos llegan a cotización. Activa el seguimiento de calificación para acelerar el embudo.
                </div>
              </div>
            </div>
          )}

          {/* Insight 3: Muchos en bienvenida */}
          {pct(porEstado.bienvenida, general.total) > 30 && (
            <div className="inf-insight-card inf-insight--warning">
              <div className="inf-insight-icon">🚪</div>
              <div>
                <div className="inf-insight-title">{pct(porEstado.bienvenida, general.total)}% en bienvenida sin avanzar</div>
                <div className="inf-insight-body">
                  Demasiados leads se quedan en la primera etapa. Sofia debería retomar esas conversaciones con el auto-reminder.
                </div>
              </div>
            </div>
          )}

          {/* Insight 4: Cotizaciones sin enviar */}
          {(porEstado.cotizacion_lista || 0) > 0 && (
            <div className="inf-insight-card inf-insight--danger">
              <div className="inf-insight-icon">📨</div>
              <div>
                <div className="inf-insight-title">{porEstado.cotizacion_lista} cotizaciones listas sin enviar</div>
                <div className="inf-insight-body">
                  Hay cotizaciones generadas que no se han enviado al cliente. Revisa en WhatsApp los leads con estado "cotización lista".
                </div>
              </div>
            </div>
          )}

          {/* Insight 5: Distribución de admins desbalanceada */}
          {(() => {
            const vals = [porAdmin.arturo || 0, porAdmin.sandy || 0, porAdmin.hugo || 0].filter(v => v > 0);
            const max = Math.max(...vals);
            const min = Math.min(...vals);
            return vals.length > 1 && max > min * 3;
          })() && (
            <div className="inf-insight-card inf-insight--info">
              <div className="inf-insight-icon">⚖️</div>
              <div>
                <div className="inf-insight-title">Carga desbalanceada entre admins</div>
                <div className="inf-insight-body">
                  La distribución de leads entre admins tiene una diferencia grande. Considera redistribuir leads activos.
                </div>
              </div>
            </div>
          )}

          {/* Insight 6: Todo bien */}
          {(general.sinAtender || 0) === 0 && (general.tasaConversion || 0) >= 20 && (porEstado.cotizacion_lista || 0) === 0 && (
            <div className="inf-insight-card inf-insight--ok">
              <div className="inf-insight-icon">✅</div>
              <div>
                <div className="inf-insight-title">Operación en buen estado</div>
                <div className="inf-insight-body">
                  No se detectaron problemas operativos críticos. Sigue monitoreando los tiempos de respuesta.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInformes;
