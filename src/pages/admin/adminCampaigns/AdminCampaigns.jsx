import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaFacebookF, FaPlay, FaPause, FaSync, FaEdit, FaCheckCircle,
  FaTimesCircle, FaClock, FaExclamationTriangle, FaChartBar,
  FaMousePointer, FaEye, FaBullseye, FaDollarSign, FaUsers,
  FaSave, FaTimes, FaRobot, FaLightbulb, FaArrowUp, FaArrowDown,
  FaMinus, FaFire, FaThumbsDown, FaThumbsUp, FaBolt, FaAngleDown,
  FaAngleUp, FaChevronRight, FaSpinner, FaInfoCircle, FaStar,
  FaExclamationCircle, FaChartLine, FaBrain, FaClipboardList,
} from 'react-icons/fa';
import axios from 'axios';
import './AdminCampaigns.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://tesipedia.onrender.com';
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const STATUS_CONFIG = {
  ACTIVE:     { label: 'Activa',    color: '#10b981', bg: '#d1fae5' },
  PAUSED:     { label: 'Pausada',   color: '#f59e0b', bg: '#fef3c7' },
  DELETED:    { label: 'Eliminada', color: '#ef4444', bg: '#fee2e2' },
  ARCHIVED:   { label: 'Archivada',  color: '#6b7280', bg: '#f3f4f6' },
  IN_PROCESS: { label: 'En proceso', color: '#3b82f6', bg: '#dbeafe' },
  WITH_ISSUES:{ label: 'Con issues', color: '#ef4444', bg: '#fee2e2' },
};

const IMPACT_CONFIG = {
  alto:  { label: 'Alto impacto', color: '#ef4444', bg: '#fee2e2', icon: FaFire },
  medio: { label: 'Impacto medio', color: '#f59e0b', bg: '#fef3c7', icon: FaBolt },
  bajo:  { label: 'Impacto bajo',  color: '#6b7280', bg: '#f3f4f6', icon: FaChevronRight },
};
const URGENCY_CONFIG = {
  'inmediata':   { label: 'Urgente', color: '#ef4444' },
  'esta-semana': { label: 'Esta semana', color: '#f59e0b' },
  'este-mes':    { label: 'Este mes', color: '#3b82f6' },
};

const fmt = (n, d = 0) => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
};
const fmtN = n => { if (!n && n !== 0) return '—'; return Number(n).toLocaleString('es-MX'); };
const fmtPct = n => { if (!n) return '—'; return Number(n).toFixed(2) + '%'; };

// ── Sub-components ──────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className="ac-kpi-card" style={{ borderTop: `3px solid ${color}` }}>
    <div className="ac-kpi-icon" style={{ color }}><Icon /></div>
    <div className="ac-kpi-body">
      <div className="ac-kpi-value">{value}</div>
      <div className="ac-kpi-label">{label}</div>
      {sub && <div className="ac-kpi-sub">{sub}</div>}
    </div>
  </div>
);

const ScoreRing = ({ score }) => {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Bueno' : score >= 50 ? 'Regular' : 'Crítico';
  return (
    <div className="ac-score-ring" style={{ '--score-color': color }}>
      <div className="ac-score-value" style={{ color }}>{score}</div>
      <div className="ac-score-label" style={{ color }}>{label}</div>
    </div>
  );
};

const AlertBanner = ({ alert }) => {
  const typeConfig = {
    error:   { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', icon: FaExclamationCircle },
    warning: { bg: '#fffbeb', border: '#fcd34d', color: '#d97706', icon: FaExclamationTriangle },
    info:    { bg: '#eff6ff', border: '#93c5fd', color: '#2563eb', icon: FaInfoCircle },
  };
  const cfg = typeConfig[alert.tipo] || typeConfig.info;
  const Icon = cfg.icon;
  return (
    <div className="ac-alert-item" style={{ background: cfg.bg, borderLeft: `4px solid ${cfg.border}` }}>
      <Icon style={{ color: cfg.color, flexShrink: 0 }} />
      <div>
        <strong style={{ color: cfg.color }}>{alert.titulo}</strong>
        <div className="ac-alert-detail">{alert.detalle}</div>
        {alert.campana && <div className="ac-alert-campaign">Campaña: {alert.campana}</div>}
      </div>
    </div>
  );
};

const ActionCard = ({ action }) => {
  const impCfg = IMPACT_CONFIG[action.impacto] || IMPACT_CONFIG.bajo;
  const urgCfg = URGENCY_CONFIG[action.urgencia] || URGENCY_CONFIG['este-mes'];
  const ImpIcon = impCfg.icon;
  return (
    <div className="ac-action-card">
      <div className="ac-action-top">
        <span className="ac-action-badge" style={{ color: impCfg.color, background: impCfg.bg }}>
          <ImpIcon /> {impCfg.label}
        </span>
        <span className="ac-action-urgency" style={{ color: urgCfg.color }}>⏱ {urgCfg.label}</span>
      </div>
      <div className="ac-action-text">{action.accion}</div>
      {action.detalle && <div className="ac-action-detail">{action.detalle}</div>}
    </div>
  );
};

// ── Main Component ──────────────────────────────────

const AdminCampaigns = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Campaign data
  const [campaigns, setCampaigns] = useState([]);
  const [totals, setTotals] = useState(null);
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Campaign actions
  const [actionLoading, setActionLoading] = useState({});
  const [actionResult, setActionResult] = useState({});
  const [editBudget, setEditBudget] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // AI Analysis
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [aiContext, setAiContext] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [expandedCampaignAnalysis, setExpandedCampaignAnalysis] = useState(null);
  const [expandedSection, setExpandedSection] = useState('alertas');

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await axios.get(`${API_BASE}/api/revenue/campaigns/meta/detail`, {
        params: { year: selectedYear, month: selectedMonth },
        withCredentials: true,
      });
      setCampaigns(res.data.campaigns || []);
      setTotals(res.data.totals || null);
      setPeriod(res.data.period || null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleAnalyze = async () => {
    if (!campaigns.length) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    setShowAiPanel(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/revenue/campaigns/meta/analyze`,
        {
          campaigns,
          totals,
          period: { from: `${selectedYear}-${String(selectedMonth + 1).padStart(2,'0')}-01`, to: `${selectedYear}-${String(selectedMonth + 1).padStart(2,'0')}-30` },
          context: aiContext,
        },
        { withCredentials: true }
      );
      setAnalysis(res.data.analysis);
    } catch (err) {
      setAnalyzeError(err.response?.data?.error || err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStatusToggle = async (campaign) => {
    const action = campaign.status === 'ACTIVE' ? 'pause' : 'resume';
    setActionLoading(prev => ({ ...prev, [campaign.id]: 'status' }));
    setActionResult(prev => ({ ...prev, [campaign.id]: null }));
    try {
      const res = await axios.post(
        `${API_BASE}/api/revenue/campaigns/meta/${campaign.id}/status`,
        { action },
        { withCredentials: true }
      );
      setActionResult(prev => ({ ...prev, [campaign.id]: { ok: true, msg: res.data.message } }));
      setCampaigns(prev => prev.map(c =>
        c.id === campaign.id ? { ...c, status: res.data.newStatus, effectiveStatus: res.data.newStatus } : c
      ));
    } catch (err) {
      setActionResult(prev => ({ ...prev, [campaign.id]: { ok: false, msg: err.response?.data?.error || err.message } }));
    } finally {
      setActionLoading(prev => ({ ...prev, [campaign.id]: null }));
    }
  };

  const handleBudgetSave = async (campaignId) => {
    const value = editBudget?.value;
    if (!value || isNaN(value)) return;
    setActionLoading(prev => ({ ...prev, [campaignId]: 'budget' }));
    try {
      const res = await axios.post(
        `${API_BASE}/api/revenue/campaigns/meta/${campaignId}/budget`,
        { dailyBudget: parseFloat(value) },
        { withCredentials: true }
      );
      setActionResult(prev => ({ ...prev, [campaignId]: { ok: true, msg: res.data.message } }));
      setCampaigns(prev => prev.map(c =>
        c.id === campaignId ? { ...c, dailyBudget: res.data.newDailyBudget } : c
      ));
      setEditBudget(null);
    } catch (err) {
      setActionResult(prev => ({ ...prev, [campaignId]: { ok: false, msg: err.response?.data?.error || err.message } }));
    } finally {
      setActionLoading(prev => ({ ...prev, [campaignId]: null }));
    }
  };

  // ── Computed values ──
  const totalSpend = totals?.spend || 0;
  const totalImpressions = totals?.impressions || 0;
  const totalClicks = totals?.clicks || 0;
  const totalConversions = totals?.conversions || 0;
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
  const avgCPL = totalConversions > 0 ? (totalSpend / totalConversions) : 0;
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
  const pausedCampaigns = campaigns.filter(c => c.status === 'PAUSED').length;

  // ── Sort campaigns by spend desc ──
  const sortedCampaigns = [...campaigns].sort((a, b) => (b.insights?.spend || 0) - (a.insights?.spend || 0));

  return (
    <div className="ac-root">

      {/* ─── Header ─── */}
      <div className="ac-header">
        <div className="ac-header-left">
          <div className="ac-header-icon"><FaFacebookF /></div>
          <div>
            <h1 className="ac-title">Campañas Meta Ads</h1>
            <p className="ac-subtitle">Rendimiento, gestión y análisis AI de campañas Facebook & Instagram</p>
          </div>
        </div>
        <div className="ac-header-controls">
          <select value={selectedMonth} onChange={e => setSelectedMonth(+e.target.value)} className="ac-select">
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(+e.target.value)} className="ac-select">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="ac-btn-refresh" onClick={fetchCampaigns} disabled={loading}>
            <FaSync className={loading ? 'spinning' : ''} /> Actualizar
          </button>
          {campaigns.length > 0 && (
            <button className="ac-btn-analyze" onClick={handleAnalyze} disabled={analyzing}>
              <FaRobot /> {analyzing ? 'Analizando...' : 'Analizar con AI'}
            </button>
          )}
        </div>
      </div>

      {/* ─── Error Banner ─── */}
      {error && (
        <div className="ac-error-banner">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* ─── KPIs ─── */}
      {!loading && campaigns.length > 0 && (
        <div className="ac-kpi-grid">
          <KpiCard icon={FaDollarSign}    label="Gasto del período"  value={fmt(totalSpend, 2)}        sub={`${MONTHS[selectedMonth]} ${selectedYear}`} color="#1877F2" />
          <KpiCard icon={FaEye}           label="Impresiones"         value={fmtN(totalImpressions)}    sub="total período"      color="#8B5CF6" />
          <KpiCard icon={FaMousePointer}  label="Clics"               value={fmtN(totalClicks)}         sub={`CTR ${fmtPct(avgCTR)}`} color="#10b981" />
          <KpiCard icon={FaBullseye}      label="Conversiones/Leads"  value={fmtN(totalConversions)}    sub={avgCPL > 0 ? `CPL ${fmt(avgCPL, 2)}` : '—'} color="#f59e0b" />
          <KpiCard icon={FaChartBar}      label="Campañas activas"    value={activeCampaigns}           sub={`${pausedCampaigns} pausadas`} color="#10b981" />
        </div>
      )}

      {/* ─── AI Analysis Panel ─── */}
      {showAiPanel && (
        <div className="ac-ai-panel">
          <div className="ac-ai-panel-header">
            <div className="ac-ai-title">
              <FaBrain /> Análisis AI de Campañas
              <span className="ac-ai-badge">Claude Haiku</span>
            </div>
            <button className="ac-ai-close" onClick={() => setShowAiPanel(false)}><FaTimes /></button>
          </div>

          {/* Context input before analysis */}
          {!analysis && !analyzing && (
            <div className="ac-ai-context">
              <label>Contexto adicional para el análisis (opcional):</label>
              <textarea
                className="ac-ai-textarea"
                placeholder="Ej: Tenemos una promoción activa para abril, el CRM muestra baja en leads orgánicos, el presupuesto máximo mensual es $15,000 MXN..."
                value={aiContext}
                onChange={e => setAiContext(e.target.value)}
                rows={3}
              />
              <button className="ac-btn-analyze ac-btn-analyze-lg" onClick={handleAnalyze}>
                <FaRobot /> Generar análisis completo
              </button>
            </div>
          )}

          {/* Loading state */}
          {analyzing && (
            <div className="ac-ai-loading">
              <div className="ac-ai-loading-dots">
                <span /><span /><span />
              </div>
              <p>Claude está analizando {campaigns.length} campañas y {totalImpressions.toLocaleString()} impresiones...</p>
              <small>Esto tarda entre 10-30 segundos</small>
            </div>
          )}

          {/* Error */}
          {analyzeError && (
            <div className="ac-error-banner">
              <FaTimesCircle />
              <span>Error al analizar: {analyzeError}</span>
              <button className="ac-retry-btn" onClick={handleAnalyze}>Reintentar</button>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && !analysis.parseError && (
            <div className="ac-analysis">

              {/* Resumen ejecutivo + Score */}
              <div className="ac-analysis-overview">
                <div className="ac-analysis-summary">
                  <h3>Resumen Ejecutivo</h3>
                  <p>{analysis.resumenEjecutivo}</p>
                </div>
                {analysis.scoreGeneral !== undefined && (
                  <div className="ac-score-section">
                    <div className="ac-score-label-top">Score General</div>
                    <ScoreRing score={analysis.scoreGeneral} />
                  </div>
                )}
              </div>

              {/* KPIs Objetivo */}
              {analysis.kpisObjetivo && (
                <div className="ac-kpis-objetivo">
                  <h4><FaBullseye /> KPIs Objetivo recomendados</h4>
                  <div className="ac-kpis-obj-grid">
                    {analysis.kpisObjetivo.ctrMeta && <div className="ac-kpi-obj"><span>CTR meta</span><strong>{analysis.kpisObjetivo.ctrMeta}</strong></div>}
                    {analysis.kpisObjetivo.cplMeta && <div className="ac-kpi-obj"><span>CPL meta</span><strong>{analysis.kpisObjetivo.cplMeta}</strong></div>}
                    {analysis.kpisObjetivo.cpcMeta && <div className="ac-kpi-obj"><span>CPC meta</span><strong>{analysis.kpisObjetivo.cpcMeta}</strong></div>}
                    {analysis.kpisObjetivo.frecuenciaMax && <div className="ac-kpi-obj"><span>Frecuencia máx</span><strong>{analysis.kpisObjetivo.frecuenciaMax}x</strong></div>}
                  </div>
                  {analysis.kpisObjetivo.justificacion && <p className="ac-kpis-justif">{analysis.kpisObjetivo.justificacion}</p>}
                </div>
              )}

              {/* Nav tabs */}
              <div className="ac-analysis-tabs">
                {['alertas', 'campañas', 'presupuesto', 'audiencias', 'creativos', 'plan'].map(tab => (
                  <button
                    key={tab}
                    className={`ac-analysis-tab ${expandedSection === tab ? 'active' : ''}`}
                    onClick={() => setExpandedSection(tab)}
                  >
                    {tab === 'alertas' && '🚨 Alertas'}
                    {tab === 'campañas' && '📊 Campañas'}
                    {tab === 'presupuesto' && '💰 Presupuesto'}
                    {tab === 'audiencias' && '👥 Audiencias'}
                    {tab === 'creativos' && '🎨 Creativos'}
                    {tab === 'plan' && '📋 Plan de acción'}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="ac-analysis-tab-content">

                {/* Alertas */}
                {expandedSection === 'alertas' && analysis.alertasCriticas && (
                  <div className="ac-alerts-list">
                    {analysis.alertasCriticas.length === 0 ? (
                      <div className="ac-no-alerts"><FaCheckCircle /> No se detectaron alertas críticas</div>
                    ) : (
                      analysis.alertasCriticas.map((alert, i) => <AlertBanner key={i} alert={alert} />)
                    )}
                  </div>
                )}

                {/* Análisis por campaña */}
                {expandedSection === 'campañas' && analysis.analisisPorCampana && (
                  <div className="ac-campaigns-analysis">
                    {analysis.analisisPorCampana.map((c, i) => (
                      <div key={i} className="ac-campaign-analysis-card">
                        <div
                          className="ac-campaign-analysis-header"
                          onClick={() => setExpandedCampaignAnalysis(expandedCampaignAnalysis === i ? null : i)}
                        >
                          <div className="ac-campaign-analysis-name">
                            {c.nombre}
                          </div>
                          <div className="ac-campaign-analysis-right">
                            <div className={`ac-campaign-score ${c.score >= 75 ? 'good' : c.score >= 50 ? 'ok' : 'bad'}`}>
                              {c.score}/100
                            </div>
                            {expandedCampaignAnalysis === i ? <FaAngleUp /> : <FaAngleDown />}
                          </div>
                        </div>

                        {expandedCampaignAnalysis === i && (
                          <div className="ac-campaign-analysis-body">
                            <p className="ac-campaign-diagnostico">{c.diagnostico}</p>

                            <div className="ac-strengths-weaknesses">
                              {c.fortalezas?.length > 0 && (
                                <div className="ac-strengths">
                                  <h5><FaThumbsUp /> Fortalezas</h5>
                                  <ul>{c.fortalezas.map((f, j) => <li key={j}>{f}</li>)}</ul>
                                </div>
                              )}
                              {c.debilidades?.length > 0 && (
                                <div className="ac-weaknesses">
                                  <h5><FaThumbsDown /> Debilidades</h5>
                                  <ul>{c.debilidades.map((d, j) => <li key={j}>{d}</li>)}</ul>
                                </div>
                              )}
                            </div>

                            {c.recomendacionPrincipal && (
                              <div className="ac-main-recommendation">
                                <FaLightbulb /> <strong>Recomendación principal:</strong> {c.recomendacionPrincipal}
                              </div>
                            )}

                            {c.accionesConcretas?.length > 0 && (
                              <div className="ac-actions-list">
                                <h5>Acciones concretas:</h5>
                                {c.accionesConcretas.map((a, j) => <ActionCard key={j} action={a} />)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Estrategia de presupuesto */}
                {expandedSection === 'presupuesto' && analysis.estrategiaPresupuesto && (
                  <div className="ac-budget-strategy">
                    <p className="ac-budget-analysis">{analysis.estrategiaPresupuesto.analisis}</p>
                    {analysis.estrategiaPresupuesto.redistribucion?.length > 0 && (
                      <div className="ac-redistribucion">
                        <h4>Redistribución recomendada:</h4>
                        <div className="ac-redistrib-list">
                          {analysis.estrategiaPresupuesto.redistribucion.map((r, i) => {
                            const accionConfig = {
                              aumentar: { color: '#10b981', bg: '#d1fae5', icon: FaArrowUp },
                              reducir:  { color: '#ef4444', bg: '#fee2e2', icon: FaArrowDown },
                              pausar:   { color: '#f59e0b', bg: '#fef3c7', icon: FaPause },
                              mantener: { color: '#6b7280', bg: '#f3f4f6', icon: FaMinus },
                            };
                            const cfg = accionConfig[r.accion] || accionConfig.mantener;
                            const Icon = cfg.icon;
                            return (
                              <div key={i} className="ac-redistrib-item">
                                <div className="ac-redistrib-left">
                                  <span className="ac-redistrib-badge" style={{ color: cfg.color, background: cfg.bg }}>
                                    <Icon /> {r.accion.charAt(0).toUpperCase() + r.accion.slice(1)}
                                    {r.porcentaje ? ` ${r.porcentaje}%` : ''}
                                  </span>
                                  <strong>{r.campana}</strong>
                                </div>
                                <p className="ac-redistrib-just">{r.justificacion}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Audiencias */}
                {expandedSection === 'audiencias' && analysis.optimizacionAudiencias && (
                  <div className="ac-audiencias">
                    <p>{analysis.optimizacionAudiencias.observaciones}</p>
                    {analysis.optimizacionAudiencias.recomendaciones?.length > 0 && (
                      <div className="ac-rec-list">
                        <h4>Recomendaciones:</h4>
                        <ul>
                          {analysis.optimizacionAudiencias.recomendaciones.map((r, i) => (
                            <li key={i}><FaChevronRight /> {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Creativos */}
                {expandedSection === 'creativos' && analysis.creativosYMensajes && (
                  <div className="ac-creativos">
                    {analysis.creativosYMensajes.hipotesisDeBaja && (
                      <div className="ac-hipotesis">
                        <h4><FaLightbulb /> Hipótesis sobre el rendimiento</h4>
                        <p>{analysis.creativosYMensajes.hipotesisDeBaja}</p>
                      </div>
                    )}
                    {analysis.creativosYMensajes.recomendaciones?.length > 0 && (
                      <div className="ac-rec-list">
                        <h4>Recomendaciones de creativos:</h4>
                        <ul>
                          {analysis.creativosYMensajes.recomendaciones.map((r, i) => (
                            <li key={i}><FaLightbulb /> {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Plan de acción */}
                {expandedSection === 'plan' && analysis.planDeAccion && (
                  <div className="ac-plan">
                    <div className="ac-plan-list">
                      {analysis.planDeAccion.map((item, i) => (
                        <div key={i} className="ac-plan-item">
                          <div className="ac-plan-num">{item.orden || i + 1}</div>
                          <div className="ac-plan-body">
                            <div className="ac-plan-week">{item.semana}</div>
                            <div className="ac-plan-action">{item.accion}</div>
                            <div className="ac-plan-meta">
                              {item.responsable && <span className="ac-plan-resp">👤 {item.responsable}</span>}
                              {item.metrica && <span className="ac-plan-metric">📈 {item.metrica}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Re-analyze button */}
              <div className="ac-reanalyze-row">
                <button className="ac-btn-refresh" onClick={handleAnalyze} disabled={analyzing}>
                  <FaSync /> Regenerar análisis
                </button>
                <span className="ac-reanalyze-note">El análisis consume ~$0.01 USD de la API de Claude</span>
              </div>
            </div>
          )}

          {/* Raw response fallback */}
          {analysis?.parseError && (
            <div className="ac-ai-raw">
              <p>El análisis fue generado pero no pudo parsearse automáticamente:</p>
              <pre>{analysis.raw}</pre>
            </div>
          )}
        </div>
      )}

      {/* ─── Campaign Table ─── */}
      <div className="ac-table-card">
        <div className="ac-table-header">
          <h2>Campañas ({campaigns.length})</h2>
          <div className="ac-table-header-right">
            <span className="ac-period-label">{MONTHS[selectedMonth]} {selectedYear}</span>
            {!showAiPanel && campaigns.length > 0 && (
              <button className="ac-btn-analyze ac-btn-analyze-sm" onClick={() => { setShowAiPanel(true); }}>
                <FaRobot /> Análisis AI
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="ac-loading"><div className="ac-spinner" /><span>Cargando campañas...</span></div>
        ) : campaigns.length === 0 && !error ? (
          <div className="ac-empty"><FaFacebookF /><p>No se encontraron campañas para este período.</p></div>
        ) : (
          <div className="ac-table-wrapper">
            <table className="ac-table">
              <thead>
                <tr>
                  <th>Campaña</th>
                  <th>Estado</th>
                  <th>Presupuesto/día</th>
                  <th>Gasto</th>
                  <th>Alcance</th>
                  <th>Impresiones</th>
                  <th>Clics</th>
                  <th>CTR</th>
                  <th>CPC</th>
                  <th>CPM</th>
                  <th>Leads</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedCampaigns.map(campaign => {
                  const ins = campaign.insights;
                  const isExpanded = expandedId === campaign.id;
                  const isEditing = editBudget?.campaignId === campaign.id;
                  const isLoadingStatus = actionLoading[campaign.id] === 'status';
                  const isLoadingBudget = actionLoading[campaign.id] === 'budget';
                  const result = actionResult[campaign.id];

                  // Find AI analysis for this campaign
                  const aiData = analysis?.analisisPorCampana?.find(c =>
                    campaign.name.includes(c.nombre) || c.nombre.includes(campaign.name.split(' ')[0])
                  );

                  return (
                    <React.Fragment key={campaign.id}>
                      <tr className={`ac-row ${isExpanded ? 'ac-row-expanded' : ''}`}>
                        <td>
                          <button
                            className="ac-campaign-name-btn"
                            onClick={() => setExpandedId(isExpanded ? null : campaign.id)}
                          >
                            {campaign.name}
                          </button>
                          <div className="ac-campaign-id">ID: {campaign.id}</div>
                          {aiData && (
                            <div className={`ac-ai-score-inline ${aiData.score >= 75 ? 'good' : aiData.score >= 50 ? 'ok' : 'bad'}`}>
                              <FaStar /> Score AI: {aiData.score}/100
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="ac-status-badge"
                            style={{
                              color: (STATUS_CONFIG[campaign.effectiveStatus || campaign.status] || STATUS_CONFIG.PAUSED).color,
                              background: (STATUS_CONFIG[campaign.effectiveStatus || campaign.status] || STATUS_CONFIG.PAUSED).bg,
                            }}>
                            {(STATUS_CONFIG[campaign.effectiveStatus || campaign.status] || STATUS_CONFIG.PAUSED).label}
                          </span>
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="ac-budget-edit">
                              <input type="number" className="ac-budget-input" value={editBudget.value}
                                onChange={e => setEditBudget({ campaignId: campaign.id, value: e.target.value })}
                                min="10" step="50" />
                              <button className="ac-btn-icon ac-btn-save" onClick={() => handleBudgetSave(campaign.id)} disabled={isLoadingBudget}>
                                {isLoadingBudget ? <div className="ac-spinner-sm" /> : <FaSave />}
                              </button>
                              <button className="ac-btn-icon ac-btn-cancel" onClick={() => setEditBudget(null)}><FaTimes /></button>
                            </div>
                          ) : (
                            <div className="ac-budget-display">
                              <span>{campaign.dailyBudget ? fmt(campaign.dailyBudget, 0) + '/día' : campaign.lifetimeBudget ? fmt(campaign.lifetimeBudget, 0) + ' total' : '—'}</span>
                              {(campaign.dailyBudget || campaign.lifetimeBudget) && (
                                <button className="ac-btn-icon ac-btn-edit"
                                  onClick={() => setEditBudget({ campaignId: campaign.id, value: campaign.dailyBudget || '' })}>
                                  <FaEdit />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="ac-metric-spend">{ins ? fmt(ins.spend, 2) : '—'}</td>
                        <td>{ins ? fmtN(ins.reach) : '—'}</td>
                        <td>{ins ? fmtN(ins.impressions) : '—'}</td>
                        <td>{ins ? fmtN(ins.clicks) : '—'}</td>
                        <td className={ins?.ctr > 2 ? 'ac-good' : ins?.ctr > 0.5 ? 'ac-ok' : ''}>{ins ? fmtPct(ins.ctr) : '—'}</td>
                        <td>{ins ? fmt(ins.cpc, 2) : '—'}</td>
                        <td>{ins ? fmt(ins.cpm, 2) : '—'}</td>
                        <td className={ins?.conversions > 0 ? 'ac-good' : ''}>
                          {ins ? (ins.conversions || '—') : '—'}
                          {ins?.costPerLead > 0 && <div className="ac-sub-metric">CPL {fmt(ins.costPerLead, 2)}</div>}
                        </td>
                        <td>
                          <div className="ac-actions">
                            {(campaign.status === 'ACTIVE' || campaign.status === 'PAUSED') && (
                              <button
                                className={`ac-btn-action ${campaign.status === 'ACTIVE' ? 'ac-btn-pause' : 'ac-btn-play'}`}
                                onClick={() => handleStatusToggle(campaign)}
                                disabled={isLoadingStatus}
                              >
                                {isLoadingStatus ? <div className="ac-spinner-sm" /> :
                                  campaign.status === 'ACTIVE' ? <><FaPause /> Pausar</> : <><FaPlay /> Activar</>}
                              </button>
                            )}
                          </div>
                          {result && (
                            <div className={`ac-action-msg ${result.ok ? 'ac-action-ok' : 'ac-action-err'}`}>
                              {result.ok ? <FaCheckCircle /> : <FaTimesCircle />}
                              <span>{result.msg}</span>
                            </div>
                          )}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="ac-detail-row">
                          <td colSpan={12}>
                            <div className="ac-detail-panel">
                              <div className="ac-detail-grid">
                                <div className="ac-detail-section">
                                  <h4>Información general</h4>
                                  <div className="ac-detail-items">
                                    <div><span>Objetivo:</span> {campaign.objective || '—'}</div>
                                    <div><span>Estado efectivo:</span> {campaign.effectiveStatus}</div>
                                    <div><span>Creada:</span> {campaign.createdTime ? new Date(campaign.createdTime).toLocaleDateString('es-MX') : '—'}</div>
                                    {campaign.startTime && <div><span>Inicio:</span> {new Date(campaign.startTime).toLocaleDateString('es-MX')}</div>}
                                    {campaign.stopTime && <div><span>Fin planificado:</span> {new Date(campaign.stopTime).toLocaleDateString('es-MX')}</div>}
                                    {campaign.budgetRemaining != null && <div><span>Presupuesto restante:</span> {fmt(campaign.budgetRemaining, 2)}</div>}
                                  </div>
                                </div>

                                {ins && (
                                  <div className="ac-detail-section">
                                    <h4>Métricas del período</h4>
                                    <div className="ac-detail-items">
                                      <div><span>Gasto:</span> {fmt(ins.spend, 2)} MXN</div>
                                      <div><span>Alcance:</span> {fmtN(ins.reach)} personas</div>
                                      <div><span>Frecuencia:</span> {ins.frequency?.toFixed(2) || '—'}x</div>
                                      <div><span>CTR:</span> {fmtPct(ins.ctr)}</div>
                                      <div><span>CPC:</span> {fmt(ins.cpc, 2)}</div>
                                      <div><span>CPM:</span> {fmt(ins.cpm, 2)}</div>
                                      {ins.conversions > 0 && <div><span>Conversiones:</span> {ins.conversions}</div>}
                                      {ins.costPerLead > 0 && <div><span>Costo por lead:</span> {fmt(ins.costPerLead, 2)}</div>}
                                    </div>
                                  </div>
                                )}

                                {ins?.actions?.length > 0 && (
                                  <div className="ac-detail-section">
                                    <h4>Acciones registradas</h4>
                                    <div className="ac-detail-items">
                                      {ins.actions.map((a, i) => (
                                        <div key={i}><span>{a.action_type.replace(/_/g, ' ')}:</span> {a.value}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {aiData && (
                                  <div className="ac-detail-section ac-detail-ai">
                                    <h4><FaRobot /> Análisis AI</h4>
                                    <div className="ac-detail-items">
                                      <div><span>Score:</span> <strong style={{ color: aiData.score >= 75 ? '#10b981' : aiData.score >= 50 ? '#f59e0b' : '#ef4444' }}>{aiData.score}/100</strong></div>
                                      {aiData.diagnostico && <div style={{ whiteSpace: 'normal' }}><span>Diagnóstico:</span> {aiData.diagnostico}</div>}
                                      {aiData.recomendacionPrincipal && <div style={{ whiteSpace: 'normal' }}><span>Rec. principal:</span> {aiData.recomendacionPrincipal}</div>}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permissions note */}
      <div className="ac-permissions-note">
        <FaExclamationTriangle />
        <div>
          <strong>Permisos requeridos:</strong> Para pausar/activar campañas y cambiar presupuestos, el sistema user <code>tsprevenue</code> necesita el permiso <strong>ads_management</strong> en Meta Business.
          {' '}<a href="https://business.facebook.com/latest/settings/system_users?business_id=1427930065561956" target="_blank" rel="noreferrer">Configurar permisos →</a>
        </div>
      </div>
    </div>
  );
};

export default AdminCampaigns;
