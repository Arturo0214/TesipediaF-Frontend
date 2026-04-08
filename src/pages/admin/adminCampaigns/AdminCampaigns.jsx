import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FaFacebookF, FaPlay, FaPause, FaSync, FaEdit, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaChartBar,
  FaMousePointer, FaEye, FaBullseye, FaDollarSign,
  FaSave, FaTimes, FaArrowUp, FaArrowDown,
  FaAngleDown, FaAngleUp, FaStar, FaPercent,
  FaExclamationCircle, FaChartLine, FaInfoCircle,
  FaLightbulb, FaFire, FaBolt, FaChevronRight,
  FaThumbsUp, FaThumbsDown, FaMinus, FaShieldAlt,
  FaMoon, FaSun, FaWhatsapp, FaLink, FaClock, FaUsers,
} from 'react-icons/fa';
import axiosWithAuth from '../../../utils/axioswithAuth';
import './AdminCampaigns.css';

/* ═══════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ═══════════════════════════════════════════════════ */
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const STATUS_MAP = {
  ACTIVE:      { label: 'Activa',     color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  PAUSED:      { label: 'Pausada',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  DELETED:     { label: 'Eliminada',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  ARCHIVED:    { label: 'Archivada',  color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  IN_PROCESS:  { label: 'En proceso', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  WITH_ISSUES: { label: 'Con issues', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const fmt = (n, d = 0) => {
  if (n == null || isNaN(n)) return '—';
  return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
};
const fmtN = n => (n == null ? '—' : Number(n).toLocaleString('es-MX'));
const fmtPct = n => (n == null || isNaN(n) ? '—' : Number(n).toFixed(2) + '%');

/* ═══════════════════════════════════════════════════
   RULES ENGINE — Expert Meta Ads Analysis
   Analiza cada campaña y genera diagnóstico + acciones
   ═══════════════════════════════════════════════════ */

// Thresholds calibrados para mercado MX / servicios educativos
const THRESHOLDS = {
  ctr: { critical: 0.5, low: 1.0, good: 2.0, excellent: 3.5 },
  cpc: { excellent: 3, good: 8, high: 15, critical: 25 },       // MXN
  cpm: { excellent: 30, good: 80, high: 150, critical: 250 },   // MXN
  cpl: { excellent: 50, good: 150, high: 300, critical: 500 },  // MXN
  frequency: { optimal: 2.5, high: 4, fatigue: 6 },
  spend_no_leads: 500, // MXN gastados sin conversiones = alerta
};

function analyzeCampaign(campaign) {
  const ins = campaign.insights;
  if (!ins) return { score: null, alerts: [], actions: [], strengths: [], weaknesses: [] };

  const alerts = [];
  const actions = [];
  const strengths = [];
  const weaknesses = [];
  let score = 70; // base score

  const ctr = ins.ctr || 0;
  const cpc = ins.cpc || 0;
  const cpm = ins.cpm || 0;
  const spend = ins.spend || 0;
  const clicks = ins.clicks || 0;
  const impressions = ins.impressions || 0;
  const conversions = ins.conversions || 0;
  const cpl = ins.costPerLead || 0;
  const frequency = ins.frequency || 0;
  const reach = ins.reach || 0;

  // ── CTR Analysis ──
  if (ctr >= THRESHOLDS.ctr.excellent) {
    score += 15;
    strengths.push('CTR excelente (' + fmtPct(ctr) + ') — el anuncio genera alto interés');
  } else if (ctr >= THRESHOLDS.ctr.good) {
    score += 8;
    strengths.push('CTR bueno (' + fmtPct(ctr) + ') — por encima del promedio');
  } else if (ctr < THRESHOLDS.ctr.critical && impressions > 500) {
    score -= 20;
    alerts.push({ type: 'error', title: 'CTR crítico: ' + fmtPct(ctr), detail: 'Muy por debajo del mínimo (0.5%). El anuncio no genera interés. Cambiar creativos o segmentación urgentemente.' });
    actions.push({ action: 'Cambiar creativos y copy del anuncio', impact: 'alto', urgency: 'inmediata', detail: 'El CTR indica que el anuncio no conecta con la audiencia. Probar nuevos ángulos de mensaje.' });
    weaknesses.push('CTR muy bajo — el anuncio no genera clics');
  } else if (ctr < THRESHOLDS.ctr.low && impressions > 500) {
    score -= 10;
    alerts.push({ type: 'warning', title: 'CTR bajo: ' + fmtPct(ctr), detail: 'Por debajo del benchmark de 1%. Revisar segmentación y creativos.' });
    actions.push({ action: 'Optimizar creativos y segmentación', impact: 'medio', urgency: 'esta-semana', detail: 'Probar A/B testing con diferentes imágenes y textos.' });
    weaknesses.push('CTR bajo — necesita optimización de creativos');
  }

  // ── CPC Analysis ──
  if (cpc > 0 && cpc <= THRESHOLDS.cpc.excellent) {
    score += 10;
    strengths.push('CPC muy eficiente (' + fmt(cpc, 2) + ') — costo por clic muy bajo');
  } else if (cpc > THRESHOLDS.cpc.critical) {
    score -= 15;
    alerts.push({ type: 'error', title: 'CPC excesivo: ' + fmt(cpc, 2), detail: 'Cada clic cuesta más de ' + fmt(THRESHOLDS.cpc.critical) + '. La campaña no es rentable con este CPC.' });
    actions.push({ action: 'Reducir presupuesto o pausar campaña', impact: 'alto', urgency: 'inmediata', detail: 'CPC demasiado alto. Reducir presupuesto diario 50% o pausar para reevaluar.' });
    weaknesses.push('CPC excesivamente alto — no es rentable');
  } else if (cpc > THRESHOLDS.cpc.high) {
    score -= 8;
    alerts.push({ type: 'warning', title: 'CPC alto: ' + fmt(cpc, 2), detail: 'Por encima del benchmark de ' + fmt(THRESHOLDS.cpc.high) + '. Optimizar para reducir costos.' });
    weaknesses.push('CPC por encima del promedio');
  }

  // ── CPL Analysis ──
  if (conversions > 0) {
    if (cpl <= THRESHOLDS.cpl.excellent) {
      score += 15;
      strengths.push('CPL excelente (' + fmt(cpl, 2) + ') — costo por lead muy eficiente');
    } else if (cpl <= THRESHOLDS.cpl.good) {
      score += 5;
      strengths.push('CPL aceptable (' + fmt(cpl, 2) + ')');
    } else if (cpl > THRESHOLDS.cpl.critical) {
      score -= 15;
      alerts.push({ type: 'error', title: 'CPL crítico: ' + fmt(cpl, 2), detail: 'Cada lead cuesta más de ' + fmt(THRESHOLDS.cpl.critical) + '. No es sostenible.' });
      actions.push({ action: 'Reestructurar campaña completa', impact: 'alto', urgency: 'inmediata', detail: 'El costo por lead es insostenible. Revisar landing page, formulario y audiencia.' });
      weaknesses.push('Costo por lead insostenible');
    } else if (cpl > THRESHOLDS.cpl.high) {
      score -= 8;
      alerts.push({ type: 'warning', title: 'CPL alto: ' + fmt(cpl, 2), detail: 'Por encima de ' + fmt(THRESHOLDS.cpl.high) + '. Optimizar embudo de conversión.' });
      weaknesses.push('Costo por lead elevado');
    }
  } else if (spend > THRESHOLDS.spend_no_leads) {
    score -= 12;
    const isWhatsApp = /whatsapp|wa\b|ctwa/i.test(campaign.name || '') || /MESSAGES/i.test(campaign.objective || '');
    if (isWhatsApp) {
      alerts.push({ type: 'error', title: 'Sin conversiones con ' + fmt(spend, 0) + ' gastados', detail: 'La campaña ha gastado significativamente sin generar leads vía WhatsApp. Revisar segmentación, creativos y horarios de publicación.' });
      actions.push({ action: 'Revisar segmentación y creativos', impact: 'alto', urgency: 'inmediata', detail: 'Los clics no se convierten en conversaciones de WhatsApp. Probar nuevos creativos, ajustar audiencia o cambiar horarios (horario laboral MX genera mejor respuesta).' });
      actions.push({ action: 'Verificar integración WhatsApp–Meta', impact: 'alto', urgency: 'inmediata', detail: 'Confirmar que la página de Facebook tiene WhatsApp Business vinculado correctamente y que el número está activo.' });
    } else {
      alerts.push({ type: 'error', title: 'Sin conversiones con ' + fmt(spend, 0) + ' gastados', detail: 'La campaña ha gastado significativamente sin generar leads. Revisar landing page y formulario de contacto.' });
      actions.push({ action: 'Revisar landing page y formulario', impact: 'alto', urgency: 'inmediata', detail: 'Los clics llegan pero no convierten. Verificar que la landing page carga correctamente y que el formulario/CTA funciona.' });
    }
    weaknesses.push('Sin conversiones a pesar del gasto');
  }

  // ── Frequency Analysis ──
  if (frequency > THRESHOLDS.frequency.fatigue) {
    score -= 12;
    alerts.push({ type: 'error', title: 'Fatiga de audiencia: frecuencia ' + frequency.toFixed(1) + 'x', detail: 'La audiencia ha visto el anuncio demasiadas veces. Los costos subirán y la efectividad bajará.' });
    actions.push({ action: 'Ampliar audiencia o rotar creativos', impact: 'alto', urgency: 'inmediata', detail: 'Frecuencia > 6x indica saturación. Crear nuevos segmentos o cambiar creativos.' });
    weaknesses.push('Audiencia saturada por alta frecuencia');
  } else if (frequency > THRESHOLDS.frequency.high) {
    score -= 5;
    alerts.push({ type: 'warning', title: 'Frecuencia elevada: ' + frequency.toFixed(1) + 'x', detail: 'Se acerca al punto de fatiga. Monitorear de cerca.' });
    weaknesses.push('Frecuencia acercándose al límite');
  } else if (frequency > 0 && frequency <= THRESHOLDS.frequency.optimal) {
    strengths.push('Frecuencia óptima (' + frequency.toFixed(1) + 'x)');
  }

  // ── CPM Analysis ──
  if (cpm > 0 && cpm <= THRESHOLDS.cpm.excellent) {
    score += 5;
    strengths.push('CPM muy bajo (' + fmt(cpm, 2) + ') — impresiones baratas');
  } else if (cpm > THRESHOLDS.cpm.critical) {
    score -= 8;
    alerts.push({ type: 'warning', title: 'CPM muy alto: ' + fmt(cpm, 2), detail: 'El costo por 1000 impresiones es excesivo. Revisar competencia de la audiencia.' });
    weaknesses.push('CPM elevado — audiencia muy competida');
  }

  // ── Spend efficiency ──
  if (spend > 0 && clicks > 0 && conversions > 0) {
    const convRate = (conversions / clicks) * 100;
    if (convRate > 5) {
      strengths.push('Tasa de conversión alta (' + convRate.toFixed(1) + '%)');
      score += 8;
    } else if (convRate < 1 && clicks > 50) {
      const isWA = /whatsapp|wa\b|ctwa/i.test(campaign.name || '') || /MESSAGES/i.test(campaign.objective || '');
      weaknesses.push('Tasa de conversión baja (' + convRate.toFixed(1) + '%)' + (isWA ? ' — pocos inician conversación' : ' — revisar landing page'));
      actions.push({ action: isWA ? 'Optimizar mensaje inicial y creativos' : 'Optimizar landing page', impact: 'medio', urgency: 'esta-semana', detail: isWA ? 'Los clics llegan pero pocos inician conversación en WhatsApp. Probar mensajes de bienvenida más directos y creativos que generen urgencia.' : 'Los clics llegan pero no convierten. Mejorar la página de destino, CTA y formulario.' });
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // ── Generate recommendation ──
  let recommendation = '';
  let recommendedAction = null; // { type: 'pause' | 'resume' | 'budget_down' | 'budget_up', value? }

  if (score >= 80) {
    recommendation = 'Campaña con excelente rendimiento. Considerar aumentar presupuesto para escalar resultados.';
    if (campaign.dailyBudget) {
      recommendedAction = { type: 'budget_up', value: Math.round(campaign.dailyBudget * 1.3), reason: 'Buen rendimiento — escalar +30%' };
    }
  } else if (score >= 60) {
    recommendation = 'Rendimiento aceptable. Aplicar las optimizaciones sugeridas para mejorar métricas.';
  } else if (score >= 40) {
    recommendation = 'Rendimiento deficiente. Se recomienda reducir presupuesto y optimizar antes de seguir gastando.';
    if (campaign.dailyBudget) {
      recommendedAction = { type: 'budget_down', value: Math.round(campaign.dailyBudget * 0.5), reason: 'Bajo rendimiento — reducir 50%' };
    }
  } else {
    recommendation = 'Rendimiento crítico. Se recomienda pausar la campaña y reestructurar completamente antes de reactivar.';
    if (campaign.status === 'ACTIVE') {
      recommendedAction = { type: 'pause', reason: 'Score crítico — pausar para evitar más gasto ineficiente' };
    }
  }

  return { score, alerts, actions, strengths, weaknesses, recommendation, recommendedAction };
}

function analyzePortfolio(campaigns) {
  const active = campaigns.filter(c => c.status === 'ACTIVE');
  const withInsights = campaigns.filter(c => c.insights);
  if (withInsights.length === 0) return null;

  const totalSpend = withInsights.reduce((s, c) => s + (c.insights?.spend || 0), 0);
  const totalClicks = withInsights.reduce((s, c) => s + (c.insights?.clicks || 0), 0);
  const totalConversions = withInsights.reduce((s, c) => s + (c.insights?.conversions || 0), 0);
  const totalImpressions = withInsights.reduce((s, c) => s + (c.insights?.impressions || 0), 0);

  const globalCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const globalCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const globalCPL = totalConversions > 0 ? totalSpend / totalConversions : 0;

  const alerts = [];

  // No conversions at all
  if (totalConversions === 0 && totalSpend > 1000) {
    alerts.push({ type: 'error', title: 'Sin conversiones totales', detail: `Se han gastado ${fmt(totalSpend, 0)} sin generar ningún lead. Revisar toda la estrategia de campañas, pixel y landing pages.` });
  }

  // Budget concentration
  if (withInsights.length > 1) {
    const topSpend = Math.max(...withInsights.map(c => c.insights?.spend || 0));
    if (topSpend / totalSpend > 0.7) {
      const topCampaign = withInsights.find(c => c.insights?.spend === topSpend);
      alerts.push({ type: 'warning', title: 'Presupuesto concentrado', detail: `El ${((topSpend / totalSpend) * 100).toFixed(0)}% del gasto está en "${topCampaign?.name}". Diversificar para reducir riesgo.` });
    }
  }

  // All campaigns paused
  if (active.length === 0 && campaigns.length > 0) {
    alerts.push({ type: 'info', title: 'Todas las campañas pausadas', detail: 'No hay campañas activas. No se está generando alcance ni leads.' });
  }

  return { globalCTR, globalCPC, globalCPL, totalSpend, totalClicks, totalConversions, totalImpressions, alerts };
}


/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
const AdminCampaigns = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const [campaigns, setCampaigns] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState({});
  const [actionResult, setActionResult] = useState({});
  const [editBudget, setEditBudget] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showDiag, setShowDiag] = useState(false);
  const [showWA, setShowWA] = useState(false);
  const detailRef = useRef(null);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('mc-theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('mc-theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  /* ── Fetch campaigns ── */
  const fetchCampaigns = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await axiosWithAuth.get('/revenue/campaigns/meta/detail', { params: { year, month } });
      setCampaigns(res.data.campaigns || []);
      setTotals(res.data.totals || null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  // Scroll to detail card when opened
  useEffect(() => {
    if (expandedId && detailRef.current) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [expandedId]);

  /* ── Campaign actions ── */
  const handleStatusToggle = async (campaign) => {
    const action = campaign.status === 'ACTIVE' ? 'pause' : 'resume';
    setActionLoading(p => ({ ...p, [campaign.id]: 'status' }));
    setActionResult(p => ({ ...p, [campaign.id]: null }));
    try {
      const res = await axiosWithAuth.post(`/revenue/campaigns/meta/${campaign.id}/status`, { action }, { withCredentials: true });
      setActionResult(p => ({ ...p, [campaign.id]: { ok: true, msg: res.data.message } }));
      setCampaigns(p => p.map(c => c.id === campaign.id ? { ...c, status: res.data.newStatus, effectiveStatus: res.data.newStatus } : c));
    } catch (err) {
      setActionResult(p => ({ ...p, [campaign.id]: { ok: false, msg: err.response?.data?.error || err.message } }));
    } finally { setActionLoading(p => ({ ...p, [campaign.id]: null })); }
  };

  const handleBudgetSave = async (id) => {
    const value = editBudget?.value;
    if (!value || isNaN(value)) return;
    setActionLoading(p => ({ ...p, [id]: 'budget' }));
    try {
      const res = await axiosWithAuth.post(`/revenue/campaigns/meta/${id}/budget`, { dailyBudget: parseFloat(value) }, { withCredentials: true });
      setActionResult(p => ({ ...p, [id]: { ok: true, msg: res.data.message } }));
      setCampaigns(p => p.map(c => c.id === id ? { ...c, dailyBudget: res.data.newDailyBudget } : c));
      setEditBudget(null);
    } catch (err) {
      setActionResult(p => ({ ...p, [id]: { ok: false, msg: err.response?.data?.error || err.message } }));
    } finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleApplyRecommendation = async (campaign, rec) => {
    if (rec.type === 'pause') {
      await handleStatusToggle(campaign);
    } else if (rec.type === 'resume') {
      await handleStatusToggle(campaign);
    } else if (rec.type === 'budget_up' || rec.type === 'budget_down') {
      setActionLoading(p => ({ ...p, [campaign.id]: 'budget' }));
      try {
        const res = await axiosWithAuth.post(`/revenue/campaigns/meta/${campaign.id}/budget`, { dailyBudget: rec.value }, { withCredentials: true });
        setActionResult(p => ({ ...p, [campaign.id]: { ok: true, msg: res.data.message } }));
        setCampaigns(p => p.map(c => c.id === campaign.id ? { ...c, dailyBudget: res.data.newDailyBudget } : c));
      } catch (err) {
        setActionResult(p => ({ ...p, [campaign.id]: { ok: false, msg: err.response?.data?.error || err.message } }));
      } finally { setActionLoading(p => ({ ...p, [campaign.id]: null })); }
    }
  };

  /* ── Computed ── */
  const totalSpend = totals?.spend || 0;
  const totalImpressions = totals?.impressions || 0;
  const totalClicks = totals?.clicks || 0;
  const totalConversions = totals?.conversions || 0;
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
  const avgCPC = totalClicks > 0 ? (totalSpend / totalClicks) : 0;
  const avgCPL = totalConversions > 0 ? (totalSpend / totalConversions) : 0;
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
  const pausedCampaigns = campaigns.filter(c => c.status === 'PAUSED').length;
  const sorted = [...campaigns].sort((a, b) => (b.insights?.spend || 0) - (a.insights?.spend || 0));

  // Run analysis engine
  const campaignAnalysis = useMemo(() => {
    const map = {};
    campaigns.forEach(c => { map[c.id] = analyzeCampaign(c); });
    return map;
  }, [campaigns]);

  const portfolio = useMemo(() => analyzePortfolio(campaigns), [campaigns]);

  // Count total alerts
  const totalAlerts = useMemo(() => {
    let count = (portfolio?.alerts?.length || 0);
    Object.values(campaignAnalysis).forEach(a => { count += (a.alerts?.length || 0); });
    return count;
  }, [campaignAnalysis, portfolio]);

  // Campaigns that need action
  const criticalCampaigns = useMemo(() =>
    sorted.filter(c => campaignAnalysis[c.id]?.score != null && campaignAnalysis[c.id].score < 40),
  [sorted, campaignAnalysis]);

  // WhatsApp Integration Analysis (client-side, no backend needed)
  const waAnalysis = useMemo(() => {
    if (campaigns.length === 0) return null;
    const waCampaigns = campaigns.filter(c => /whatsapp|wa\b|ctwa/i.test(c.name || '') || /MESSAGES/i.test(c.objective || ''));
    const otherCampaigns = campaigns.filter(c => !waCampaigns.includes(c));
    const waActive = waCampaigns.filter(c => c.status === 'ACTIVE');
    const waWithInsights = waCampaigns.filter(c => c.insights);
    const waSpend = waWithInsights.reduce((s, c) => s + (c.insights?.spend || 0), 0);
    const waLeads = waWithInsights.reduce((s, c) => s + (c.insights?.conversions || 0), 0);
    const waClicks = waWithInsights.reduce((s, c) => s + (c.insights?.clicks || 0), 0);
    const waImpressions = waWithInsights.reduce((s, c) => s + (c.insights?.impressions || 0), 0);
    const waCPL = waLeads > 0 ? waSpend / waLeads : 0;
    const waCTR = waImpressions > 0 ? (waClicks / waImpressions) * 100 : 0;
    const waConvRate = waClicks > 0 ? (waLeads / waClicks) * 100 : 0;

    const checks = [];
    // 1. ¿Hay campañas de WhatsApp?
    checks.push({
      pass: waCampaigns.length > 0,
      label: 'Campañas de WhatsApp detectadas',
      detail: waCampaigns.length > 0 ? `${waCampaigns.length} campaña(s) de WhatsApp encontradas` : 'No se detectaron campañas Click-to-WhatsApp',
    });
    // 2. ¿Al menos una activa?
    if (waCampaigns.length > 0) {
      checks.push({
        pass: waActive.length > 0,
        label: 'Campañas activas',
        detail: waActive.length > 0 ? `${waActive.length} campaña(s) activa(s) generando leads` : 'Todas las campañas de WhatsApp están pausadas — no se están generando leads',
      });
    }
    // 3. ¿Están generando leads?
    if (waWithInsights.length > 0) {
      checks.push({
        pass: waLeads > 0,
        label: 'Conversiones registradas',
        detail: waLeads > 0 ? `${waLeads} lead(s) generados vía WhatsApp con CPL ${fmt(waCPL, 2)}` : `Se han gastado ${fmt(waSpend, 0)} sin registrar conversiones — verificar que Meta está contando las conversaciones`,
      });
    }
    // 4. Tasa de conversión click→lead
    if (waClicks > 50) {
      const convOk = waConvRate > 2;
      checks.push({
        pass: convOk,
        label: 'Tasa click → conversación',
        detail: convOk
          ? `${waConvRate.toFixed(1)}% de los clics inician conversación en WhatsApp — buena tasa`
          : `Solo ${waConvRate.toFixed(1)}% de los clics inician conversación — revisar mensaje de bienvenida y creativos`,
      });
    }
    // 5. Diversificación
    if (waCampaigns.length > 0 && otherCampaigns.length === 0) {
      checks.push({
        pass: false,
        label: 'Diversificación de canales',
        detail: 'Todas las campañas dependen de WhatsApp. Considera probar landing page con formulario como canal alternativo.',
        warn: true,
      });
    }

    const tips = [];
    if (waLeads > 0 && waCPL > THRESHOLDS.cpl.high) {
      tips.push('Tu CPL de WhatsApp (' + fmt(waCPL, 2) + ') está alto. Considera segmentar mejor o probar nuevos creativos.');
    }
    if (waCTR > 0 && waCTR < 1.0) {
      tips.push('El CTR de campañas WhatsApp (' + fmtPct(waCTR) + ') es bajo. Los creativos no generan suficiente interés.');
    }
    if (waActive.length > 0 && waLeads === 0 && waSpend > 200) {
      tips.push('Campañas activas gastando sin leads. Verifica que WhatsApp Business esté correctamente vinculado a tu página de Facebook.');
    }
    if (waLeads > 0 && waCPL <= THRESHOLDS.cpl.good) {
      tips.push('Buen CPL (' + fmt(waCPL, 2) + '). Considera escalar presupuesto en las campañas con mejor rendimiento.');
    }

    return { waCampaigns, waActive, waSpend, waLeads, waCPL, waCTR, waConvRate, waClicks, checks, tips };
  }, [campaigns]);

  return (
    <div className={`mc ${dark ? 'mc-dark' : 'mc-light'}`}>

      {/* ═══════════════ TOP BAR ═══════════════ */}
      <div className="mc-topbar">
        <div className="mc-topbar-left">
          <div className="mc-logo"><FaFacebookF /></div>
          <div>
            <h1 className="mc-h1">Campañas Meta Ads</h1>
            <p className="mc-subtitle">Rendimiento, control y optimización automática</p>
          </div>
        </div>
        <div className="mc-topbar-right">
          <button className="mc-theme-toggle" onClick={() => setDark(!dark)} title={dark ? 'Modo claro' : 'Modo oscuro'}>
            {dark ? <FaSun /> : <FaMoon />}
          </button>
          <div className="mc-period-sel">
            <select value={month} onChange={e => setMonth(+e.target.value)} className="mc-select">
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(+e.target.value)} className="mc-select">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button className="mc-btn mc-btn-ghost" onClick={fetchCampaigns} disabled={loading}>
            <FaSync className={loading ? 'mc-spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {/* ═══════════════ ERROR ═══════════════ */}
      {error && (
        <div className="mc-alert mc-alert-error">
          <FaExclamationTriangle />
          <div className="mc-alert-body">
            <strong>Error al cargar campañas</strong>
            <span>{error}</span>
          </div>
          <button className="mc-btn mc-btn-sm mc-btn-ghost" onClick={fetchCampaigns}>Reintentar</button>
        </div>
      )}

      {/* ═══════════════ KPIs ═══════════════ */}
      {!loading && campaigns.length > 0 && (
        <>
          <div className="mc-kpis">
            <div className="mc-kpi">
              <div className="mc-kpi-top">
                <span className="mc-kpi-icon" style={{background:'rgba(24,119,242,0.1)',color:'#1877F2'}}><FaDollarSign /></span>
                <span className="mc-kpi-label">Gasto total</span>
              </div>
              <div className="mc-kpi-value">{fmt(totalSpend, 2)}</div>
              <div className="mc-kpi-sub">{MONTHS[month]} {year}</div>
            </div>
            <div className="mc-kpi">
              <div className="mc-kpi-top">
                <span className="mc-kpi-icon" style={{background:'rgba(139,92,246,0.1)',color:'#8B5CF6'}}><FaEye /></span>
                <span className="mc-kpi-label">Impresiones</span>
              </div>
              <div className="mc-kpi-value">{fmtN(totalImpressions)}</div>
              <div className="mc-kpi-sub">alcance del período</div>
            </div>
            <div className="mc-kpi">
              <div className="mc-kpi-top">
                <span className="mc-kpi-icon" style={{background:'rgba(16,185,129,0.1)',color:'#10b981'}}><FaMousePointer /></span>
                <span className="mc-kpi-label">Clics / CTR</span>
              </div>
              <div className="mc-kpi-value">{fmtN(totalClicks)}</div>
              <div className="mc-kpi-sub">CTR {fmtPct(avgCTR)} · CPC {fmt(avgCPC, 2)}</div>
            </div>
            <div className="mc-kpi">
              <div className="mc-kpi-top">
                <span className="mc-kpi-icon" style={{background:'rgba(245,158,11,0.1)',color:'#f59e0b'}}><FaBullseye /></span>
                <span className="mc-kpi-label">Leads / Conv.</span>
              </div>
              <div className="mc-kpi-value">{fmtN(totalConversions)}</div>
              <div className="mc-kpi-sub">{avgCPL > 0 ? `CPL ${fmt(avgCPL, 2)}` : 'Sin leads registrados'}</div>
            </div>
            <div className="mc-kpi">
              <div className="mc-kpi-top">
                <span className="mc-kpi-icon" style={{background:'rgba(16,185,129,0.1)',color:'#10b981'}}><FaChartBar /></span>
                <span className="mc-kpi-label">Campañas</span>
              </div>
              <div className="mc-kpi-value">{activeCampaigns}<small style={{fontSize:'0.6em',color:'#9ca3af'}}>/{campaigns.length}</small></div>
              <div className="mc-kpi-sub">{activeCampaigns} activas · {pausedCampaigns} pausadas</div>
            </div>
          </div>

          {/* ═══════════════ DIAGNOSTICS TOGGLE ═══════════════ */}
          <div className="mc-diag-toggle-bar">
            <button className={`mc-diag-toggle ${showDiag ? 'active' : ''}`} onClick={() => setShowDiag(!showDiag)}>
              <FaShieldAlt /> Diagnóstico automático
              {totalAlerts > 0 && <span className="mc-diag-badge">{totalAlerts}</span>}
              {showDiag ? <FaAngleUp /> : <FaAngleDown />}
            </button>
          </div>

          {/* ═══════════════ DIAGNOSTIC PANEL ═══════════════ */}
          {showDiag && (
            <div className="mc-diag-panel">
              {/* Portfolio-level alerts */}
              {portfolio?.alerts?.length > 0 && (
                <div className="mc-diag-section">
                  <h3><FaExclamationCircle /> Alertas generales</h3>
                  <div className="mc-diag-alerts">
                    {portfolio.alerts.map((a, i) => (
                      <div key={i} className={`mc-diag-alert ${a.type}`}>
                        {a.type === 'error' ? <FaExclamationCircle /> : a.type === 'warning' ? <FaExclamationTriangle /> : <FaInfoCircle />}
                        <div><strong>{a.title}</strong><p>{a.detail}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Critical campaigns */}
              {criticalCampaigns.length > 0 && (
                <div className="mc-diag-section">
                  <h3><FaFire /> Campañas que requieren acción inmediata</h3>
                  <div className="mc-diag-criticals">
                    {criticalCampaigns.map(c => {
                      const a = campaignAnalysis[c.id];
                      return (
                        <div key={c.id} className="mc-diag-critical-card">
                          <div className="mc-diag-critical-head">
                            <span className="mc-diag-critical-name">{c.name}</span>
                            <span className={`mc-score-pill bad`}>{a.score}/100</span>
                          </div>
                          <p className="mc-diag-critical-rec">{a.recommendation}</p>
                          {a.recommendedAction && (
                            <button
                              className={`mc-btn mc-btn-sm ${a.recommendedAction.type === 'pause' ? 'mc-btn-warn' : 'mc-btn-danger'}`}
                              onClick={() => handleApplyRecommendation(c, a.recommendedAction)}
                              disabled={!!actionLoading[c.id]}
                            >
                              {a.recommendedAction.type === 'pause' && <><FaPause /> Pausar campaña</>}
                              {a.recommendedAction.type === 'budget_down' && <><FaArrowDown /> Reducir a {fmt(a.recommendedAction.value)}/día</>}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Per-campaign scores summary */}
              <div className="mc-diag-section">
                <h3><FaChartLine /> Score por campaña</h3>
                <div className="mc-diag-scores">
                  {sorted.map(c => {
                    const a = campaignAnalysis[c.id];
                    if (a.score == null) return null;
                    const pct = a.score;
                    const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
                    return (
                      <div key={c.id} className="mc-diag-score-row">
                        <span className="mc-diag-score-name">{c.name}</span>
                        <div className="mc-diag-score-bar-wrap">
                          <div className="mc-diag-score-bar" style={{width: pct + '%', background: color}} />
                        </div>
                        <span className="mc-diag-score-val" style={{color}}>{pct}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {totalAlerts === 0 && (
                <div className="mc-diag-ok">
                  <FaCheckCircle /> Todas las campañas están dentro de los parámetros normales. Sin alertas.
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ WHATSAPP INTEGRATION TOGGLE ═══════════════ */}
          {waAnalysis && (
            <>
              <div className="mc-diag-toggle-bar">
                <button className={`mc-diag-toggle mc-wa-toggle ${showWA ? 'active' : ''}`} onClick={() => setShowWA(!showWA)}>
                  <FaWhatsapp /> Integración WhatsApp
                  <span className={`mc-wa-badge ${waAnalysis.waLeads > 0 ? 'ok' : waAnalysis.waCampaigns.length > 0 ? 'warn' : 'off'}`}>
                    {waAnalysis.waLeads > 0 ? '●' : waAnalysis.waCampaigns.length > 0 ? '◐' : '○'}
                  </span>
                  {showWA ? <FaAngleUp /> : <FaAngleDown />}
                </button>
              </div>

              {showWA && (
                <div className="mc-pixel-panel">
                  <div className="mc-pixel-content">

                    {/* WA KPI mini cards */}
                    <div className="mc-wa-kpis">
                      <div className="mc-wa-kpi">
                        <FaWhatsapp className="mc-wa-kpi-icon" />
                        <div>
                          <span className="mc-wa-kpi-value">{waAnalysis.waCampaigns.length}</span>
                          <span className="mc-wa-kpi-label">Campañas WA</span>
                        </div>
                      </div>
                      <div className="mc-wa-kpi">
                        <FaUsers className="mc-wa-kpi-icon" />
                        <div>
                          <span className="mc-wa-kpi-value">{waAnalysis.waLeads}</span>
                          <span className="mc-wa-kpi-label">Leads WhatsApp</span>
                        </div>
                      </div>
                      <div className="mc-wa-kpi">
                        <FaDollarSign className="mc-wa-kpi-icon" />
                        <div>
                          <span className="mc-wa-kpi-value">{waAnalysis.waCPL > 0 ? fmt(waAnalysis.waCPL, 2) : '—'}</span>
                          <span className="mc-wa-kpi-label">CPL WhatsApp</span>
                        </div>
                      </div>
                      <div className="mc-wa-kpi">
                        <FaMousePointer className="mc-wa-kpi-icon" />
                        <div>
                          <span className="mc-wa-kpi-value">{waAnalysis.waConvRate > 0 ? waAnalysis.waConvRate.toFixed(1) + '%' : '—'}</span>
                          <span className="mc-wa-kpi-label">Click → Lead</span>
                        </div>
                      </div>
                    </div>

                    {/* Health checks */}
                    <div className="mc-pixel-landing">
                      <h4><FaCheckCircle /> Verificación de integración</h4>
                      <div className="mc-pixel-landing-grid">
                        {waAnalysis.checks.map((ck, i) => (
                          <div key={i} className={`mc-pixel-check ${ck.pass ? 'pass' : ck.warn ? 'warn-check' : 'fail'}`}>
                            {ck.pass ? <FaCheckCircle /> : ck.warn ? <FaExclamationTriangle /> : <FaTimesCircle />}
                            <span>{ck.label}</span>
                            <small>{ck.detail}</small>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    {waAnalysis.tips.length > 0 && (
                      <div className="mc-pixel-recs">
                        <h4><FaLightbulb /> Recomendaciones WhatsApp</h4>
                        {waAnalysis.tips.map((tip, i) => (
                          <div key={i} className="mc-diag-alert warning">
                            <FaLightbulb />
                            <div><p>{tip}</p></div>
                          </div>
                        ))}
                      </div>
                    )}

                    {waAnalysis.checks.every(c => c.pass) && waAnalysis.tips.length === 0 && (
                      <div className="mc-diag-ok">
                        <FaCheckCircle /> La integración WhatsApp–Meta está funcionando correctamente. Tus campañas generan leads.
                      </div>
                    )}

                    {/* Quick links */}
                    <div className="mc-pixel-footer">
                      <a href="https://business.facebook.com/latest/whatsapp_manager/phone_numbers" target="_blank" rel="noreferrer" className="mc-btn mc-btn-primary" style={{background:'#25D366'}}>
                        <FaWhatsapp /> WhatsApp Manager
                      </a>
                      <a href="https://business.facebook.com/latest/settings/whatsapp_business_accounts" target="_blank" rel="noreferrer" className="mc-btn mc-btn-ghost">
                        <FaLink /> Configuración WA Business
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════
           CAMPAIGN TABLE
         ═══════════════════════════════════════ */}
      <div className="mc-card">
        <div className="mc-card-head">
          <h2>Todas las campañas <span className="mc-badge-count">{campaigns.length}</span></h2>
          <span className="mc-pill-period">{MONTHS[month]} {year}</span>
        </div>

        {loading ? (
          <div className="mc-loader"><div className="mc-spinner" /> Cargando campañas...</div>
        ) : campaigns.length === 0 && !error ? (
          <div className="mc-empty">
            <FaFacebookF />
            <p>No se encontraron campañas para este período</p>
            <span>Cambia el mes/año o verifica tu cuenta de Meta Ads</span>
          </div>
        ) : (
          <div className="mc-table-wrap">
            <table className="mc-table">
              <thead>
                <tr>
                  <th className="mc-th-name">Campaña</th>
                  <th>Estado</th>
                  <th>Score</th>
                  <th>Presupuesto</th>
                  <th>Gasto</th>
                  <th>Impresiones</th>
                  <th>Clics</th>
                  <th>CTR</th>
                  <th>CPC</th>
                  <th>Leads</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(c => {
                  const ins = c.insights;
                  const isExp = expandedId === c.id;
                  const isEditing = editBudget?.campaignId === c.id;
                  const loadingStatus = actionLoading[c.id] === 'status';
                  const loadingBudget = actionLoading[c.id] === 'budget';
                  const result = actionResult[c.id];
                  const st = STATUS_MAP[c.effectiveStatus || c.status] || STATUS_MAP.PAUSED;
                  const diag = campaignAnalysis[c.id];

                  return (
                    <React.Fragment key={c.id}>
                      <tr className={isExp ? 'mc-row-active' : ''}>
                        <td className="mc-td-name">
                          <button className="mc-name-btn" onClick={() => setExpandedId(isExp ? null : c.id)}>
                            <span className="mc-name-row">
                              {isExp ? <FaAngleDown className="mc-chevron" /> : <FaChevronRight className="mc-chevron" />}
                              <span>
                                <span className="mc-name-text">{c.name}</span>
                                <span className="mc-name-id">ID: {c.id}</span>
                              </span>
                            </span>
                          </button>
                        </td>
                        <td><span className="mc-status" style={{color:st.color,background:st.bg}}>{st.label}</span></td>
                        <td>
                          {diag?.score != null && (
                            <span className={`mc-score-pill ${diag.score >= 75 ? 'good' : diag.score >= 50 ? 'ok' : 'bad'}`}>
                              <FaStar /> {diag.score}
                            </span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="mc-budget-edit">
                              <input type="number" value={editBudget.value}
                                onChange={e => setEditBudget({campaignId:c.id, value:e.target.value})}
                                min="10" step="50" className="mc-budget-input" />
                              <button className="mc-ibtn mc-ibtn-ok" onClick={() => handleBudgetSave(c.id)} disabled={loadingBudget}>
                                {loadingBudget ? <span className="mc-spinner-xs"/> : <FaSave />}
                              </button>
                              <button className="mc-ibtn mc-ibtn-cancel" onClick={() => setEditBudget(null)}><FaTimes /></button>
                            </div>
                          ) : (
                            <div className="mc-budget-show">
                              <span>{c.dailyBudget ? fmt(c.dailyBudget,0)+'/día' : c.lifetimeBudget ? fmt(c.lifetimeBudget,0)+' total' : '—'}</span>
                              {(c.dailyBudget || c.lifetimeBudget) && (
                                <button className="mc-ibtn mc-ibtn-edit" onClick={() => setEditBudget({campaignId:c.id, value:c.dailyBudget||''})}>
                                  <FaEdit />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="mc-td-spend">{ins ? fmt(ins.spend,2) : '—'}</td>
                        <td>{ins ? fmtN(ins.impressions) : '—'}</td>
                        <td>{ins ? fmtN(ins.clicks) : '—'}</td>
                        <td><span className={ins?.ctr > 2 ? 'mc-good' : ins?.ctr > 0.5 ? 'mc-warn' : ins?.ctr > 0 ? 'mc-bad' : ''}>{ins ? fmtPct(ins.ctr) : '—'}</span></td>
                        <td>{ins ? fmt(ins.cpc,2) : '—'}</td>
                        <td>
                          <span className={ins?.conversions > 0 ? 'mc-good' : ''}>{ins?.conversions || '—'}</span>
                          {ins?.costPerLead > 0 && <div className="mc-sub">{fmt(ins.costPerLead,2)} CPL</div>}
                        </td>
                        <td>
                          <div className="mc-actions-cell">
                            {(c.status === 'ACTIVE' || c.status === 'PAUSED') && (
                              <button
                                className={`mc-action-btn ${c.status === 'ACTIVE' ? 'pause' : 'play'}`}
                                onClick={() => handleStatusToggle(c)} disabled={loadingStatus}>
                                {loadingStatus ? <span className="mc-spinner-xs"/> :
                                  c.status === 'ACTIVE' ? <><FaPause /> Pausar</> : <><FaPlay /> Activar</>}
                              </button>
                            )}
                            {/* Quick recommended action */}
                            {diag?.recommendedAction && diag.recommendedAction.type !== 'pause' && (
                              <button
                                className="mc-action-btn rec"
                                onClick={() => handleApplyRecommendation(c, diag.recommendedAction)}
                                disabled={!!actionLoading[c.id]}
                                title={diag.recommendedAction.reason}
                              >
                                {diag.recommendedAction.type === 'budget_up' && <><FaArrowUp /> Escalar</>}
                                {diag.recommendedAction.type === 'budget_down' && <><FaArrowDown /> Reducir</>}
                              </button>
                            )}
                          </div>
                          {result && (
                            <div className={`mc-result ${result.ok ? 'ok' : 'err'}`}>
                              {result.ok ? <FaCheckCircle /> : <FaTimesCircle />} {result.msg}
                            </div>
                          )}
                        </td>
                      </tr>

                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════ EXPANDED DETAIL (outside table) ═══════════════ */}
      {expandedId && (() => {
        const c = campaigns.find(x => x.id === expandedId);
        if (!c) return null;
        const ins = c.insights;
        const diag = campaignAnalysis[c.id];
        return (
          <div className="mc-detail-card" ref={detailRef}>
            <div className="mc-detail-card-head">
              <h3>{c.name}</h3>
              <button className="mc-ibtn mc-ibtn-cancel" onClick={() => setExpandedId(null)}><FaTimes /></button>
            </div>
            <div className="mc-detail-grid">
              {/* General info */}
              <div className="mc-detail-block">
                <h4>Información general</h4>
                <dl className="mc-dl">
                  <div><dt>Objetivo</dt><dd>{c.objective || '—'}</dd></div>
                  <div><dt>Estado</dt><dd>{c.effectiveStatus}</dd></div>
                  <div><dt>Creada</dt><dd>{c.createdTime ? new Date(c.createdTime).toLocaleDateString('es-MX') : '—'}</dd></div>
                  {c.startTime && <div><dt>Inicio</dt><dd>{new Date(c.startTime).toLocaleDateString('es-MX')}</dd></div>}
                  {c.stopTime && <div><dt>Fin</dt><dd>{new Date(c.stopTime).toLocaleDateString('es-MX')}</dd></div>}
                  {c.budgetRemaining != null && <div><dt>Restante</dt><dd>{fmt(c.budgetRemaining,2)}</dd></div>}
                </dl>
              </div>

              {/* Metrics */}
              {ins && (
                <div className="mc-detail-block">
                  <h4>Métricas del período</h4>
                  <dl className="mc-dl">
                    <div><dt>Gasto</dt><dd className="mc-td-spend">{fmt(ins.spend,2)} MXN</dd></div>
                    <div><dt>Alcance</dt><dd>{fmtN(ins.reach)} personas</dd></div>
                    <div><dt>Frecuencia</dt><dd>{ins.frequency?.toFixed(2) || '—'}x</dd></div>
                    <div><dt>CTR</dt><dd>{fmtPct(ins.ctr)}</dd></div>
                    <div><dt>CPC</dt><dd>{fmt(ins.cpc,2)}</dd></div>
                    <div><dt>CPM</dt><dd>{fmt(ins.cpm,2)}</dd></div>
                    {ins.conversions > 0 && <div><dt>Conversiones</dt><dd>{ins.conversions}</dd></div>}
                    {ins.costPerLead > 0 && <div><dt>CPL</dt><dd>{fmt(ins.costPerLead,2)}</dd></div>}
                  </dl>
                </div>
              )}

              {/* Diagnosis */}
              {diag && diag.score != null && (
                <div className="mc-detail-block mc-detail-analysis">
                  <h4><FaChartLine /> Diagnóstico</h4>
                  <div className="mc-diag-inline-score">
                    <div className={`mc-score-big ${diag.score >= 75 ? 'good' : diag.score >= 50 ? 'ok' : 'bad'}`}>
                      {diag.score}<small>/100</small>
                    </div>
                    <span className="mc-diag-inline-label">
                      {diag.score >= 75 ? 'Buen rendimiento' : diag.score >= 50 ? 'Rendimiento regular' : 'Rendimiento crítico'}
                    </span>
                  </div>
                  <p className="mc-diag-rec">{diag.recommendation}</p>
                </div>
              )}
            </div>

            {/* Full width sections below the grid */}
            {diag && diag.score != null && (
              <div className="mc-detail-full">
                {/* Strengths & Weaknesses */}
                {(diag.strengths.length > 0 || diag.weaknesses.length > 0) && (
                  <div className="mc-sw-grid">
                    {diag.strengths.length > 0 && (
                      <div className="mc-sw mc-sw-good">
                        <h5><FaThumbsUp /> Fortalezas</h5>
                        <ul>{diag.strengths.map((s,i) => <li key={i}>{s}</li>)}</ul>
                      </div>
                    )}
                    {diag.weaknesses.length > 0 && (
                      <div className="mc-sw mc-sw-bad">
                        <h5><FaThumbsDown /> Debilidades</h5>
                        <ul>{diag.weaknesses.map((w,i) => <li key={i}>{w}</li>)}</ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Alerts */}
                {diag.alerts.length > 0 && (
                  <div className="mc-detail-alerts">
                    {diag.alerts.map((a,i) => (
                      <div key={i} className={`mc-diag-alert ${a.type}`}>
                        {a.type === 'error' ? <FaExclamationCircle /> : <FaExclamationTriangle />}
                        <div><strong>{a.title}</strong><p>{a.detail}</p></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended actions */}
                {diag.actions.length > 0 && (
                  <div className="mc-detail-actions-list">
                    <h5>Acciones recomendadas</h5>
                    {diag.actions.map((a,i) => (
                      <div key={i} className="mc-detail-action-item">
                        <span className={`mc-impact-badge ${a.impact}`}>
                          {a.impact === 'alto' ? <FaFire /> : a.impact === 'medio' ? <FaBolt /> : <FaChevronRight />}
                          {a.impact}
                        </span>
                        <div>
                          <strong>{a.action}</strong>
                          {a.detail && <p>{a.detail}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Apply recommendation */}
                {diag.recommendedAction && (
                  <div className="mc-detail-apply">
                    <button
                      className={`mc-btn ${diag.recommendedAction.type === 'budget_up' ? 'mc-btn-success' : 'mc-btn-warn'}`}
                      onClick={() => handleApplyRecommendation(c, diag.recommendedAction)}
                      disabled={!!actionLoading[c.id]}
                    >
                      {diag.recommendedAction.type === 'pause' && <><FaPause /> Pausar campaña</>}
                      {diag.recommendedAction.type === 'budget_up' && <><FaArrowUp /> Aumentar a {fmt(diag.recommendedAction.value)}/día</>}
                      {diag.recommendedAction.type === 'budget_down' && <><FaArrowDown /> Reducir a {fmt(diag.recommendedAction.value)}/día</>}
                    </button>
                    <span className="mc-detail-apply-reason">{diag.recommendedAction.reason}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══════════════ PERMISSIONS NOTE ═══════════════ */}
      <div className="mc-permissions">
        <FaInfoCircle />
        <span>
          Para pausar/activar campañas y cambiar presupuestos, el system user <code>tsprevenue</code> necesita <strong>ads_management</strong> en Meta Business.
          {' '}<a href="https://business.facebook.com/latest/settings/system_users?business_id=1427930065561956" target="_blank" rel="noreferrer">Configurar permisos →</a>
        </span>
      </div>
    </div>
  );
};

export default AdminCampaigns;
