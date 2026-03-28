import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVisits, clearError } from '../../../features/visits/visitsSlice';
import { getEventStats, getEventFeed, getRealtimeData } from '../../../services/eventService';
import { getGADashboard, getGARealtime } from '../../../services/gaService';
import {
  FaGlobe, FaMapMarkerAlt, FaSearch, FaEye, FaTimes,
  FaSyncAlt, FaChartLine, FaCalendarAlt, FaClock,
  FaDesktop, FaMobileAlt, FaArrowUp, FaArrowDown,
  FaBuilding, FaWifi, FaRoute, FaMousePointer,
  FaBolt, FaUsers, FaWhatsapp, FaComments, FaFileAlt,
  FaScroll, FaHandPointer, FaMobile, FaLaptop, FaTabletAlt,
  FaGoogle, FaSignInAlt, FaPercentage, FaChartBar,
  FaFilter, FaChevronDown, FaChevronUp, FaExternalLinkAlt,
} from 'react-icons/fa';
import { SiGoogleanalytics } from 'react-icons/si';
import VisitsMap from './VisitsMap';
import './ManageVisits.css';

const ManageVisits = () => {
  const dispatch = useDispatch();
  const { visits, loading, error } = useSelector(state => state.visits);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Event tracking state
  const [eventStats, setEventStats] = useState(null);
  const [eventFeed, setEventFeed] = useState([]);
  const [eventFeedPage, setEventFeedPage] = useState(1);
  const [eventFeedTotal, setEventFeedTotal] = useState(0);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventPeriod, setEventPeriod] = useState(24);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  // Realtime state
  const [realtimeData, setRealtimeData] = useState(null);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const realtimeInterval = useRef(null);
  // Google Analytics state
  const [gaData, setGaData] = useState(null);
  const [gaLoading, setGaLoading] = useState(false);
  const [gaError, setGaError] = useState(null);
  const [gaPeriod, setGaPeriod] = useState(7);
  const [gaRealtime, setGaRealtime] = useState(null);
  const gaRealtimeInterval = useRef(null);
  // Dashboard expandable sections
  const [expandedSections, setExpandedSections] = useState({
    funnel: true, pages: true, acquisition: true, geo: true, events: true,
  });

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    dispatch(getVisits());
    return () => dispatch(clearError());
  }, [dispatch]);

  // Load everything on mount for dashboard
  useEffect(() => {
    loadGAData();
    loadEventData();
    loadRealtimeData();
    // Realtime refresh every 15s
    realtimeInterval.current = setInterval(loadRealtimeData, 15000);
    gaRealtimeInterval.current = setInterval(async () => {
      try {
        const rt = await getGARealtime();
        setGaRealtime(rt);
      } catch {}
    }, 30000);
    return () => {
      if (realtimeInterval.current) clearInterval(realtimeInterval.current);
      if (gaRealtimeInterval.current) clearInterval(gaRealtimeInterval.current);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(getVisits()),
      loadGAData(),
      loadEventData(),
      loadRealtimeData(),
    ]);
    setRefreshing(false);
  };

  const loadEventData = useCallback(async () => {
    setEventLoading(true);
    try {
      const [stats, feed] = await Promise.all([
        getEventStats(eventPeriod),
        getEventFeed({ limit: 50, page: eventFeedPage, type: eventTypeFilter || undefined }),
      ]);
      setEventStats(stats);
      setEventFeed(feed.events);
      setEventFeedTotal(feed.total);
    } catch (err) {
      console.error('Error loading events:', err);
    }
    setEventLoading(false);
  }, [eventPeriod, eventFeedPage, eventTypeFilter]);

  const loadRealtimeData = useCallback(async () => {
    setRealtimeLoading(true);
    try {
      const data = await getRealtimeData();
      setRealtimeData(data);
    } catch (err) {
      console.error('Error loading realtime:', err);
    }
    setRealtimeLoading(false);
  }, []);

  const loadGAData = useCallback(async () => {
    setGaLoading(true);
    setGaError(null);
    try {
      const [dashboard, realtime] = await Promise.allSettled([
        getGADashboard(gaPeriod),
        getGARealtime(),
      ]);
      if (dashboard.status === 'fulfilled') setGaData(dashboard.value);
      else setGaError(dashboard.reason?.response?.data?.error || dashboard.reason?.message || 'Error cargando datos de GA');
      if (realtime.status === 'fulfilled') setGaRealtime(realtime.value);
    } catch (err) {
      setGaError(err.response?.data?.error || err.message);
    }
    setGaLoading(false);
  }, [gaPeriod]);

  // Reload GA when period changes
  useEffect(() => { loadGAData(); }, [gaPeriod]);
  // Reload events when filters change
  useEffect(() => { loadEventData(); }, [eventPeriod, eventFeedPage, eventTypeFilter]);

  // ── Time helpers ──
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);

  // ── Computed stats ──
  const stats = useMemo(() => {
    const total = visits.length;
    const today = visits.filter(v => new Date(v.createdAt) >= todayStart).length;
    const thisWeek = visits.filter(v => new Date(v.createdAt) >= weekAgo).length;
    const thisMonth = visits.filter(v => new Date(v.createdAt) >= monthAgo).length;
    const countries = new Set(visits.map(v => v.geoLocation?.country).filter(Boolean));
    const cities = new Set(visits.map(v => v.geoLocation?.city).filter(Boolean));

    const byCountry = {};
    const byCity = {};
    visits.forEach(v => {
      const country = v.geoLocation?.country || 'Desconocido';
      const city = v.geoLocation?.city || 'Desconocido';
      byCountry[country] = (byCountry[country] || 0) + 1;
      byCity[city] = (byCity[city] || 0) + 1;
    });
    const topCountries = Object.entries(byCountry).sort(([, a], [, b]) => b - a).slice(0, 10);
    const topCities = Object.entries(byCity).sort(([, a], [, b]) => b - a).slice(0, 10);

    const timeline = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      const count = visits.filter(v => {
        const vd = new Date(v.createdAt);
        return vd.getFullYear() === d.getFullYear() && vd.getMonth() === d.getMonth() && vd.getDate() === d.getDate();
      }).length;
      timeline.push({ key, label, count });
    }

    const hourly = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    visits.forEach(v => { hourly[new Date(v.createdAt).getHours()].count++; });

    const prevWeekStart = new Date(weekAgo); prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeek = visits.filter(v => {
      const d = new Date(v.createdAt);
      return d >= prevWeekStart && d < weekAgo;
    }).length;
    const weekGrowth = prevWeek > 0 ? Math.round(((thisWeek - prevWeek) / prevWeek) * 100) : (thisWeek > 0 ? 100 : 0);

    const byPath = {};
    visits.forEach(v => { byPath[v.path || '/'] = (byPath[v.path || '/'] || 0) + 1; });
    const topPaths = Object.entries(byPath).sort(([, a], [, b]) => b - a).slice(0, 8);

    // Build visitsByCountry with ISO codes for the map
    const visitsByCountryISO = {};
    visits.forEach(v => {
      const code = v.geoLocation?.country;
      if (code && code !== 'Desconocido' && code !== 'Local' && code !== 'XX') {
        const iso = code.length === 2 ? code.toUpperCase() : code;
        visitsByCountryISO[iso] = (visitsByCountryISO[iso] || 0) + 1;
      }
    });

    return {
      total, today, thisWeek, thisMonth, weekGrowth,
      countries: countries.size, cities: cities.size,
      topCountries, topCities, timeline, hourly, topPaths,
      visitsByCountryISO,
    };
  }, [visits]);

  // ── Filtered visits for registro tab ──
  const filteredVisits = useMemo(() => {
    let list = [...visits];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(v =>
        (v.ip || '').includes(s) ||
        (v.geoLocation?.city || '').toLowerCase().includes(s) ||
        (v.geoLocation?.country || '').toLowerCase().includes(s) ||
        (v.path || '').toLowerCase().includes(s) ||
        (v.userAgent || '').toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [visits, searchTerm]);

  const totalPages = Math.ceil(filteredVisits.length / perPage);
  const pagedVisits = filteredVisits.slice((page - 1) * perPage, page * perPage);

  // ── Helpers ──
  const countryName = (code) => {
    if (!code || code === 'Desconocido' || code === 'XX') return 'Desconocido';
    try { return new Intl.DisplayNames(['es'], { type: 'region' }).of(code.toUpperCase()); } catch { return code; }
  };
  const fmtDate = (d) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const fmtFull = (d) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fmtDuration = (s) => {
    if (!s || s < 1) return '0s';
    if (s < 60) return `${Math.round(s)}s`;
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  };

  const maxTimeline = Math.max(...stats.timeline.map(t => t.count), 1);
  const maxHourly = Math.max(...stats.hourly.map(h => h.count), 1);

  const getDeviceType = (ua) => {
    if (!ua) return 'desktop';
    const lower = ua.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) return 'mobile';
    return 'desktop';
  };

  // GA combined metrics
  const gaUsers = gaData?.overview?.current?.activeUsers || 0;
  const gaSessions = gaData?.overview?.current?.sessions || 0;
  const gaPageViews = gaData?.overview?.current?.pageViews || 0;
  const gaBounceRate = gaData?.overview?.current?.bounceRate || 0;
  const gaNewUsers = gaData?.overview?.current?.newUsers || 0;
  const gaAvgDuration = gaData?.overview?.current?.avgSessionDuration || 0;
  const gaEngaged = gaData?.overview?.current?.engagedSessions || 0;
  const realtimeUsers = gaRealtime?.totalActive || 0;
  const ctaClicks = eventStats?.byType?.find(t => t._id === 'cta')?.count || 0;
  const chatEvents = eventStats?.byType?.find(t => t._id === 'chat')?.count || 0;
  const activeSessionsNow = realtimeData?.activeUsers || 0;

  if (loading && visits.length === 0) {
    return <div className="vs"><div className="vs-loading"><div className="vs-spinner" /> Cargando dashboard...</div></div>;
  }

  return (
    <div className="vs">
      {/* Visit Detail Drawer */}
      {selectedVisit && (
        <div className="vs-drawer-overlay" onClick={() => setSelectedVisit(null)}>
          <div className="vs-drawer" onClick={e => e.stopPropagation()}>
            <div className="vs-drawer-header">
              <h3>Detalle de la visita</h3>
              <button className="vs-drawer-close" onClick={() => setSelectedVisit(null)}><FaTimes /></button>
            </div>
            <div className="vs-drawer-body">
              <div className="vs-drawer-section">
                <h4>Ubicacion</h4>
                <div className="vs-drawer-fields">
                  <div className="vs-drawer-field"><FaMapMarkerAlt className="vs-field-icon" /><div><span className="vs-field-label">Ciudad</span><span className="vs-field-value">{selectedVisit.geoLocation?.city || 'N/A'}</span></div></div>
                  <div className="vs-drawer-field"><FaGlobe className="vs-field-icon" /><div><span className="vs-field-label">Pais</span><span className="vs-field-value">{countryName(selectedVisit.geoLocation?.country) || 'N/A'}</span></div></div>
                  <div className="vs-drawer-field"><FaBuilding className="vs-field-icon" /><div><span className="vs-field-label">Region</span><span className="vs-field-value">{selectedVisit.geoLocation?.region || 'N/A'}</span></div></div>
                  <div className="vs-drawer-field"><FaWifi className="vs-field-icon" /><div><span className="vs-field-label">Organizacion / ISP</span><span className="vs-field-value">{selectedVisit.geoLocation?.org || 'N/A'}</span></div></div>
                  {selectedVisit.geoLocation?.location && <div className="vs-drawer-field"><FaMapMarkerAlt className="vs-field-icon" /><div><span className="vs-field-label">Coordenadas</span><span className="vs-field-value">{selectedVisit.geoLocation.location}</span></div></div>}
                </div>
              </div>
              <div className="vs-drawer-section">
                <h4>Conexion</h4>
                <div className="vs-drawer-fields">
                  <div className="vs-drawer-field"><FaGlobe className="vs-field-icon" /><div><span className="vs-field-label">IP</span><span className="vs-field-value mono">{selectedVisit.ip}</span></div></div>
                  <div className="vs-drawer-field"><FaRoute className="vs-field-icon" /><div><span className="vs-field-label">Ruta visitada</span><span className="vs-field-value mono">{selectedVisit.path || '/'}</span></div></div>
                  <div className="vs-drawer-field"><FaDesktop className="vs-field-icon" /><div><span className="vs-field-label">User Agent</span><span className="vs-field-value small">{selectedVisit.userAgent || 'N/A'}</span></div></div>
                </div>
              </div>
              <div className="vs-drawer-section">
                <h4>Tiempo</h4>
                <div className="vs-drawer-fields">
                  <div className="vs-drawer-field"><FaCalendarAlt className="vs-field-icon" /><div><span className="vs-field-label">Fecha y hora</span><span className="vs-field-value">{fmtFull(selectedVisit.createdAt)}</span></div></div>
                </div>
              </div>
              <div className="vs-drawer-section">
                <h4>ID</h4>
                <span className="vs-id-badge">{selectedVisit._id}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HEADER ═══ */}
      <div className="vs-header">
        <div className="vs-header-left">
          <div className="vs-logo-icon"><FaChartBar /></div>
          <div>
            <h2 className="vs-title">Analytics Dashboard</h2>
            <span className="vs-subtitle">Tesipedia · Metricas en tiempo real</span>
          </div>
        </div>
        <div className="vs-header-actions">
          <select className="vs-period-select" value={gaPeriod} onChange={e => setGaPeriod(Number(e.target.value))}>
            <option value={1}>Hoy</option>
            <option value={7}>7 dias</option>
            <option value={14}>14 dias</option>
            <option value={28}>28 dias</option>
            <option value={90}>90 dias</option>
          </select>
          <button className={`vs-refresh ${refreshing ? 'vs-spinning' : ''}`} onClick={handleRefresh} disabled={refreshing}>
            <FaSyncAlt /> {refreshing ? '' : 'Actualizar'}
          </button>
        </div>
      </div>

      {error && <div className="vs-error-bar">{error}</div>}
      {gaError && (
        <div className="vs-ga-error">
          <strong>Error GA4:</strong> {gaError}
          <p className="vs-ga-error-help">Configura <code>GA_CLIENT_EMAIL</code> y <code>GA_PRIVATE_KEY</code> en Railway.</p>
        </div>
      )}

      {/* ═══ TABS — simplificados ═══ */}
      <div className="vs-nav">
        {[
          { key: 'dashboard', icon: <FaChartLine />, label: 'Dashboard' },
          { key: 'eventos', icon: <FaMousePointer />, label: 'Eventos' },
          { key: 'realtime', icon: <FaBolt />, label: 'Tiempo Real' },
          { key: 'registro', icon: <FaEye />, label: `Registro (${stats.total})` },
        ].map(tab => (
          <button key={tab.key} className={`vs-nav-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
           DASHBOARD TAB — Vista unificada profesional
          ═══════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <>
          {/* ── Realtime strip ── */}
          <div className="vs-realtime-strip">
            <div className="vs-rt-item">
              <span className="vs-pulse" />
              <strong>{realtimeUsers}</strong>
              <span>en GA ahora</span>
            </div>
            <div className="vs-rt-divider" />
            <div className="vs-rt-item">
              <span className="vs-pulse-blue" />
              <strong>{activeSessionsNow}</strong>
              <span>sesiones propias</span>
            </div>
            {gaRealtime?.byCountry?.length > 0 && (
              <>
                <div className="vs-rt-divider" />
                <div className="vs-rt-countries">
                  {gaRealtime.byCountry.slice(0, 4).map(c => (
                    <span key={c.country} className="vs-rt-country">{c.country} <strong>{c.activeUsers}</strong></span>
                  ))}
                </div>
              </>
            )}
            {gaLoading && <span className="vs-loading-inline" style={{ marginLeft: 'auto' }}><div className="vs-spinner-sm" /></span>}
          </div>

          {/* ── KPI Row — Las 6 métricas clave ── */}
          <div className="vs-kpi-grid-6">
            <div className="vs-kpi">
              <div className="vs-kpi-top">
                <span className="vs-kpi-icon blue"><FaUsers /></span>
                <GrowthBadge value={gaData?.overview?.growth?.activeUsers} />
              </div>
              <div className="vs-kpi-value">{gaUsers.toLocaleString()}</div>
              <div className="vs-kpi-label">Usuarios</div>
              <div className="vs-kpi-sub">{gaNewUsers} nuevos</div>
            </div>
            <div className="vs-kpi">
              <div className="vs-kpi-top">
                <span className="vs-kpi-icon green"><FaSignInAlt /></span>
                <GrowthBadge value={gaData?.overview?.growth?.sessions} />
              </div>
              <div className="vs-kpi-value">{gaSessions.toLocaleString()}</div>
              <div className="vs-kpi-label">Sesiones</div>
              <div className="vs-kpi-sub">{gaEngaged} comprometidas</div>
            </div>
            <div className="vs-kpi">
              <div className="vs-kpi-top">
                <span className="vs-kpi-icon purple"><FaEye /></span>
                <GrowthBadge value={gaData?.overview?.growth?.pageViews} />
              </div>
              <div className="vs-kpi-value">{gaPageViews.toLocaleString()}</div>
              <div className="vs-kpi-label">Vistas de pagina</div>
            </div>
            <div className="vs-kpi">
              <div className="vs-kpi-top">
                <span className="vs-kpi-icon orange"><FaClock /></span>
              </div>
              <div className="vs-kpi-value">{fmtDuration(gaAvgDuration)}</div>
              <div className="vs-kpi-label">Duracion promedio</div>
            </div>
            <div className="vs-kpi">
              <div className="vs-kpi-top">
                <span className="vs-kpi-icon red"><FaPercentage /></span>
                <GrowthBadge value={gaData?.overview?.growth?.bounceRate} invert />
              </div>
              <div className="vs-kpi-value">{(gaBounceRate * 100).toFixed(1)}%</div>
              <div className="vs-kpi-label">Tasa de rebote</div>
            </div>
            <div className="vs-kpi">
              <div className="vs-kpi-top">
                <span className="vs-kpi-icon teal"><FaHandPointer /></span>
              </div>
              <div className="vs-kpi-value">{ctaClicks}</div>
              <div className="vs-kpi-label">Clicks en CTAs</div>
              <div className="vs-kpi-sub">{chatEvents} chats</div>
            </div>
          </div>

          {/* ── Timeline GA ── */}
          {gaData?.timeline && gaData.timeline.length > 0 && (
            <div className="vs-chart-card full">
              <h4 className="vs-chart-title"><FaChartLine /> Trafico diario (ultimos {gaPeriod} dias)</h4>
              <div className="vs-timeline-chart">
                {gaData.timeline.map((d, i) => {
                  const maxVal = Math.max(...gaData.timeline.map(t => t.users), 1);
                  const dateStr = d.date;
                  const label = dateStr ? `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}` : '';
                  return (
                    <div key={i} className="vs-tl-col" title={`${label}: ${d.users} usuarios, ${d.sessions} sesiones`}>
                      <span className="vs-tl-val">{d.users > 0 ? d.users : ''}</span>
                      <div className="vs-tl-bar" style={{ height: `${Math.max(3, (d.users / maxVal) * 100)}%` }} />
                      <span className="vs-tl-label">{i % Math.max(1, Math.floor(gaData.timeline.length / 10)) === 0 ? label : ''}</span>
                    </div>
                  );
                })}
              </div>
              <div className="vs-timeline-legend">
                <span><span className="vs-legend-dot blue" /> Usuarios activos por dia</span>
              </div>
            </div>
          )}

          {/* ── Fallback: timeline interno si GA no tiene data ── */}
          {(!gaData?.timeline || gaData.timeline.length === 0) && (
            <div className="vs-chart-card full">
              <h4 className="vs-chart-title"><FaChartLine /> Visitas por dia (ultimos 30 dias)</h4>
              <div className="vs-timeline-chart">
                {stats.timeline.map((d, i) => (
                  <div key={d.key} className="vs-tl-col" title={`${d.label}: ${d.count} visitas`}>
                    <span className="vs-tl-val">{d.count > 0 ? d.count : ''}</span>
                    <div className="vs-tl-bar" style={{ height: `${Math.max(2, (d.count / maxTimeline) * 100)}%` }} />
                    <span className="vs-tl-label">{i % 3 === 0 ? d.label : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION: Top Paginas + Canales ── */}
          <SectionHeader title="Paginas & Adquisicion" icon={<FaRoute />} sectionKey="pages" expanded={expandedSections.pages} onToggle={toggleSection} />
          {expandedSections.pages && (
            <div className="vs-charts-row">
              {/* Top pages table */}
              {gaData?.pages && (
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaEye /> Top paginas</h4>
                  <div className="vs-mini-table">
                    <div className="vs-mini-thead">
                      <span className="vs-mt-page">Pagina</span>
                      <span className="vs-mt-num">Vistas</span>
                      <span className="vs-mt-num">Usuarios</span>
                      <span className="vs-mt-num">Rebote</span>
                    </div>
                    {gaData.pages.slice(0, 8).map((p, i) => (
                      <div key={i} className="vs-mini-row">
                        <span className="vs-mt-page" title={p.page}>
                          <span className="vs-mt-pos">{i + 1}</span>
                          {p.page}
                        </span>
                        <span className="vs-mt-num"><strong>{p.views}</strong></span>
                        <span className="vs-mt-num">{p.users}</span>
                        <span className="vs-mt-num">{(p.bounceRate * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Channels */}
              {gaData?.channels && (
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaSignInAlt /> Canales de trafico</h4>
                  <div className="vs-rank-list">
                    {gaData.channels.map((ch, i) => {
                      const maxSessions = gaData.channels[0]?.sessions || 1;
                      const pct = Math.round((ch.sessions / maxSessions) * 100);
                      return (
                        <div key={i} className="vs-rank-item">
                          <span className="vs-rank-pos">{i + 1}</span>
                          <span className="vs-rank-name">{ch.channel}</span>
                          <div className="vs-rank-bar-bg">
                            <div className="vs-rank-bar" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="vs-rank-count">{ch.sessions}</span>
                          <span className="vs-rank-pct">{ch.newUsers} new</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SECTION: Geografia ── */}
          <SectionHeader title="Geografia" icon={<FaGlobe />} sectionKey="geo" expanded={expandedSections.geo} onToggle={toggleSection} />
          {expandedSections.geo && (
            <>
            {/* Mapa mundial de visitas */}
            {Object.keys(stats.visitsByCountryISO).length > 0 && (
              <div className="vs-chart-card full" style={{ marginBottom: 16 }}>
                <VisitsMap visitsByCountry={stats.visitsByCountryISO} />
              </div>
            )}
            <div className="vs-charts-row">
              {gaData?.countries ? (
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaGlobe /> Usuarios por pais (GA)</h4>
                  <div className="vs-rank-list">
                    {gaData.countries.map((c, i) => {
                      const max = gaData.countries[0]?.activeUsers || 1;
                      const pct = Math.round((c.activeUsers / max) * 100);
                      return (
                        <div key={i} className="vs-rank-item">
                          <span className="vs-rank-pos">{i + 1}</span>
                          <span className="vs-rank-name">{c.country}</span>
                          <div className="vs-rank-bar-bg">
                            <div className="vs-rank-bar city" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="vs-rank-count">{c.activeUsers}</span>
                          <span className="vs-rank-pct">{c.newUsers} new</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaGlobe /> Top paises (interno)</h4>
                  <div className="vs-rank-list">
                    {stats.topCountries.map(([name, count], i) => {
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={name} className="vs-rank-item">
                          <span className="vs-rank-pos">{i + 1}</span>
                          <span className="vs-rank-name">{countryName(name)}</span>
                          <div className="vs-rank-bar-bg"><div className="vs-rank-bar" style={{ width: `${pct}%` }} /></div>
                          <span className="vs-rank-count">{count}</span>
                          <span className="vs-rank-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Devices + Hourly heatmap */}
              <div className="vs-chart-card">
                {gaData?.devices ? (
                  <>
                    <h4 className="vs-chart-title"><FaDesktop /> Dispositivos</h4>
                    <div className="vs-device-grid">
                      {gaData.devices.map(d => {
                        const total = gaData.devices.reduce((s, x) => s + x.users, 0) || 1;
                        const pct = Math.round((d.users / total) * 100);
                        const icon = { desktop: <FaLaptop />, mobile: <FaMobile />, tablet: <FaTabletAlt /> }[d.device] || <FaDesktop />;
                        return (
                          <div key={d.device} className="vs-device-card">
                            <div className="vs-device-icon">{icon}</div>
                            <div className="vs-device-pct">{pct}%</div>
                            <div className="vs-device-label">{d.device}</div>
                            <div className="vs-device-count">{d.users} usuarios</div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="vs-chart-title"><FaClock /> Distribucion por hora</h4>
                    <div className="vs-hourly-chart">
                      {stats.hourly.map(h => (
                        <div key={h.hour} className="vs-hr-col" title={`${h.hour}:00 - ${h.count} visitas`}>
                          <span className="vs-hr-val">{h.count > 0 ? h.count : ''}</span>
                          <div className="vs-hr-bar" style={{ height: `${Math.max(2, (h.count / maxHourly) * 100)}%` }} />
                          <span className="vs-hr-label">{h.hour % 3 === 0 ? `${h.hour}h` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            </>
          )}

          {/* ── SECTION: Eventos rapidos ── */}
          <SectionHeader title="Eventos & Acciones" icon={<FaMousePointer />} sectionKey="events" expanded={expandedSections.events} onToggle={toggleSection} />
          {expandedSections.events && eventStats && (
            <div className="vs-charts-row">
              <div className="vs-chart-card">
                <h4 className="vs-chart-title"><FaBolt /> Por tipo de evento</h4>
                <div className="vs-rank-list">
                  {eventStats.byType.map((t) => {
                    const total = eventStats.recentEvents || 1;
                    const pct = Math.round((t.count / total) * 100);
                    const icon = { click: <FaHandPointer />, cta: <FaMousePointer />, pageview: <FaEye />, scroll: <FaScroll />, chat: <FaComments />, form: <FaFileAlt /> }[t._id] || <FaBolt />;
                    return (
                      <div key={t._id} className="vs-rank-item">
                        <span className="vs-rank-pos">{icon}</span>
                        <span className="vs-rank-name">{t._id}</span>
                        <div className="vs-rank-bar-bg"><div className="vs-rank-bar" style={{ width: `${pct}%` }} /></div>
                        <span className="vs-rank-count">{t.count}</span>
                        <span className="vs-rank-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="vs-chart-card">
                <h4 className="vs-chart-title"><FaHandPointer /> Top acciones</h4>
                <div className="vs-rank-list">
                  {eventStats.byAction.slice(0, 8).map((a, i) => (
                    <div key={i} className="vs-rank-item">
                      <span className="vs-rank-pos">{i + 1}</span>
                      <span className="vs-rank-name" title={`${a.action} — ${a.page}`}>
                        {a.label || a.action}
                        <small className="vs-rank-sub">{a.page}</small>
                      </span>
                      <span className="vs-rank-count">{a.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ EVENTOS TAB ═══ */}
      {activeTab === 'eventos' && (
        <>
          <div className="vs-toolbar">
            <select className="vs-period-select" value={eventPeriod} onChange={e => { setEventPeriod(Number(e.target.value)); setEventFeedPage(1); }}>
              <option value={1}>Ultima hora</option>
              <option value={6}>Ultimas 6 horas</option>
              <option value={24}>Ultimas 24 horas</option>
              <option value={168}>Ultima semana</option>
              <option value={720}>Ultimo mes</option>
            </select>
            <select className="vs-period-select" value={eventTypeFilter} onChange={e => { setEventTypeFilter(e.target.value); setEventFeedPage(1); }}>
              <option value="">Todos los tipos</option>
              <option value="click">Clicks</option>
              <option value="cta">CTAs</option>
              <option value="pageview">Page Views</option>
              <option value="scroll">Scroll</option>
              <option value="chat">Chat</option>
              <option value="form">Formularios</option>
            </select>
            {eventLoading && <span className="vs-loading-inline"><div className="vs-spinner-sm" /> Cargando...</span>}
          </div>

          {eventStats && (
            <>
              <div className="vs-kpi-grid">
                <div className="vs-kpi">
                  <div className="vs-kpi-top"><span className="vs-kpi-icon blue"><FaMousePointer /></span></div>
                  <div className="vs-kpi-value">{eventStats.recentEvents.toLocaleString()}</div>
                  <div className="vs-kpi-label">Eventos en periodo</div>
                  <div className="vs-kpi-sub">{eventStats.totalEvents.toLocaleString()} total historico</div>
                </div>
                <div className="vs-kpi">
                  <div className="vs-kpi-top"><span className="vs-kpi-icon green"><FaUsers /></span></div>
                  <div className="vs-kpi-value">{eventStats.activeSessions}</div>
                  <div className="vs-kpi-label">Sesiones activas</div>
                  <div className="vs-kpi-sub">En periodo seleccionado</div>
                </div>
                <div className="vs-kpi">
                  <div className="vs-kpi-top"><span className="vs-kpi-icon purple"><FaHandPointer /></span></div>
                  <div className="vs-kpi-value">{ctaClicks}</div>
                  <div className="vs-kpi-label">Clicks en CTAs</div>
                  <div className="vs-kpi-sub">Conversiones potenciales</div>
                </div>
                <div className="vs-kpi">
                  <div className="vs-kpi-top"><span className="vs-kpi-icon orange"><FaComments /></span></div>
                  <div className="vs-kpi-value">{chatEvents}</div>
                  <div className="vs-kpi-label">Interacciones chat</div>
                  <div className="vs-kpi-sub">Chatbot Sofia</div>
                </div>
              </div>

              <div className="vs-charts-row">
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaBolt /> Por tipo de evento</h4>
                  <div className="vs-rank-list">
                    {eventStats.byType.map((t) => {
                      const total = eventStats.recentEvents || 1;
                      const pct = Math.round((t.count / total) * 100);
                      const icon = { click: <FaHandPointer />, cta: <FaMousePointer />, pageview: <FaEye />, scroll: <FaScroll />, chat: <FaComments />, form: <FaFileAlt /> }[t._id] || <FaBolt />;
                      return (
                        <div key={t._id} className="vs-rank-item">
                          <span className="vs-rank-pos">{icon}</span>
                          <span className="vs-rank-name">{t._id}</span>
                          <div className="vs-rank-bar-bg"><div className="vs-rank-bar" style={{ width: `${pct}%` }} /></div>
                          <span className="vs-rank-count">{t.count}</span>
                          <span className="vs-rank-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaHandPointer /> Top acciones</h4>
                  <div className="vs-rank-list">
                    {eventStats.byAction.slice(0, 10).map((a, i) => (
                      <div key={i} className="vs-rank-item">
                        <span className="vs-rank-pos">{i + 1}</span>
                        <span className="vs-rank-name" title={`${a.action} — ${a.page}`}>
                          {a.label || a.action}
                          <small className="vs-rank-sub">{a.page}</small>
                        </span>
                        <span className="vs-rank-count">{a.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="vs-charts-row">
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaRoute /> Paginas con mas eventos</h4>
                  <div className="vs-rank-list">
                    {eventStats.byPage.map((p, i) => {
                      const maxEvents = eventStats.byPage[0]?.events || 1;
                      const pct = Math.round((p.events / maxEvents) * 100);
                      return (
                        <div key={i} className="vs-rank-item">
                          <span className="vs-rank-pos">{i + 1}</span>
                          <span className="vs-rank-name mono">{p.page}</span>
                          <div className="vs-rank-bar-bg">
                            <div className="vs-rank-bar path" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="vs-rank-count">{p.events}</span>
                          <span className="vs-rank-pct">{p.sessions} ses</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaDesktop /> Dispositivos</h4>
                  <div className="vs-rank-list">
                    {eventStats.byDevice.map((d) => {
                      const total = eventStats.recentEvents || 1;
                      const pct = Math.round((d.count / total) * 100);
                      const icon = { desktop: <FaLaptop />, mobile: <FaMobile />, tablet: <FaTabletAlt /> }[d._id] || <FaDesktop />;
                      return (
                        <div key={d._id} className="vs-rank-item">
                          <span className="vs-rank-pos">{icon}</span>
                          <span className="vs-rank-name">{d._id}</span>
                          <div className="vs-rank-bar-bg"><div className="vs-rank-bar city" style={{ width: `${pct}%` }} /></div>
                          <span className="vs-rank-count">{d.count}</span>
                          <span className="vs-rank-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Event feed table */}
          <div className="vs-chart-card full">
            <h4 className="vs-chart-title"><FaEye /> Feed de eventos recientes</h4>
            <div className="vs-table-wrap">
              <table className="vs-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Accion</th>
                    <th>Pagina</th>
                    <th>Dispositivo</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {eventFeed.length === 0 ? (
                    <tr><td colSpan={5} className="vs-empty-row">
                      {eventLoading ? 'Cargando eventos...' : 'No hay eventos registrados aun.'}
                    </td></tr>
                  ) : eventFeed.map(ev => (
                    <tr key={ev._id}>
                      <td><span className={`vs-event-badge ${ev.type}`}>{ev.type}</span></td>
                      <td>
                        <div className="vs-event-action">
                          <strong>{ev.label || ev.action}</strong>
                          {ev.label && <small className="vs-event-sub">{ev.action}</small>}
                        </div>
                      </td>
                      <td><span className="vs-path">{ev.page}</span></td>
                      <td>{ev.device === 'mobile' ? <FaMobileAlt /> : ev.device === 'tablet' ? <FaTabletAlt /> : <FaDesktop />}</td>
                      <td><span className="vs-time">{fmtTime(ev.createdAt)}</span> <span className="vs-date">{fmtDate(ev.createdAt)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {eventFeedTotal > 50 && (
              <div className="vs-pagination">
                <button className="vs-page-btn" disabled={eventFeedPage <= 1} onClick={() => setEventFeedPage(p => p - 1)}>Anterior</button>
                <span className="vs-page-info">Pagina {eventFeedPage} de {Math.ceil(eventFeedTotal / 50)}</span>
                <button className="vs-page-btn" disabled={eventFeedPage >= Math.ceil(eventFeedTotal / 50)} onClick={() => setEventFeedPage(p => p + 1)}>Siguiente</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ TIEMPO REAL TAB ═══ */}
      {activeTab === 'realtime' && (
        <>
          <div className="vs-toolbar">
            <span className="vs-realtime-indicator"><span className="vs-pulse" /> Actualizando cada 15 segundos</span>
            {realtimeLoading && <span className="vs-loading-inline"><div className="vs-spinner-sm" /></span>}
          </div>

          {/* Big numbers row */}
          <div className="vs-realtime-heroes">
            <div className="vs-realtime-hero">
              <div className="vs-realtime-number">{realtimeUsers}</div>
              <div className="vs-realtime-label">Usuarios en GA</div>
              <div className="vs-realtime-sub">Google Analytics tiempo real</div>
            </div>
            <div className="vs-realtime-hero blue">
              <div className="vs-realtime-number">{activeSessionsNow}</div>
              <div className="vs-realtime-label">Sesiones propias</div>
              <div className="vs-realtime-sub">Tracking interno (5 min)</div>
            </div>
          </div>

          {/* GA Realtime details */}
          {gaRealtime && (
            <div className="vs-charts-row">
              {gaRealtime.byPage?.length > 0 && (
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaRoute /> Paginas activas (GA)</h4>
                  <div className="vs-rank-list">
                    {gaRealtime.byPage.map((p, i) => (
                      <div key={i} className="vs-rank-item">
                        <span className="vs-rank-pos">{i + 1}</span>
                        <span className="vs-rank-name mono">{p.page}</span>
                        <span className="vs-rank-count">{p.activeUsers}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {gaRealtime.byCountry?.length > 0 && (
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaGlobe /> Paises activos (GA)</h4>
                  <div className="vs-rank-list">
                    {gaRealtime.byCountry.map((c, i) => (
                      <div key={i} className="vs-rank-item">
                        <span className="vs-rank-pos">{i + 1}</span>
                        <span className="vs-rank-name">{c.country}</span>
                        <span className="vs-rank-count">{c.activeUsers}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Internal realtime */}
          {realtimeData && (
            <>
              {realtimeData.activeByPage?.length > 0 && (
                <div className="vs-chart-card full">
                  <h4 className="vs-chart-title"><FaRoute /> Paginas activas (interno)</h4>
                  <div className="vs-rank-list">
                    {realtimeData.activeByPage.map((p, i) => (
                      <div key={i} className="vs-rank-item">
                        <span className="vs-rank-pos">{i + 1}</span>
                        <span className="vs-rank-name mono">{p.page}</span>
                        <span className="vs-rank-count">{p.users} {p.users === 1 ? 'usuario' : 'usuarios'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {realtimeData.activeSessions?.length > 0 && (
                <div className="vs-chart-card full">
                  <h4 className="vs-chart-title"><FaUsers /> Sesiones activas</h4>
                  <div className="vs-table-wrap">
                    <table className="vs-table">
                      <thead><tr><th>Sesion</th><th>Pagina actual</th><th>Dispositivo</th><th>Eventos</th><th>Ultima actividad</th></tr></thead>
                      <tbody>
                        {realtimeData.activeSessions.map(s => (
                          <tr key={s._id}>
                            <td><span className="vs-visitor-ip">{s._id.slice(0, 8)}...</span></td>
                            <td><span className="vs-path">{s.page}</span></td>
                            <td>{s.device === 'mobile' ? <FaMobileAlt /> : <FaDesktop />}</td>
                            <td>{s.eventCount}</td>
                            <td><span className="vs-time">{fmtTime(s.lastEvent)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="vs-chart-card full">
                <h4 className="vs-chart-title"><FaBolt /> Actividad reciente (30 min)</h4>
                <div className="vs-event-live-feed">
                  {realtimeData.recentEvents?.length === 0 ? (
                    <p className="vs-empty-text">Sin actividad reciente</p>
                  ) : realtimeData.recentEvents?.map(ev => (
                    <div key={ev._id} className="vs-live-event">
                      <span className={`vs-event-badge ${ev.type}`}>{ev.type}</span>
                      <span className="vs-live-action">{ev.label || ev.action}</span>
                      <span className="vs-live-page">{ev.page}</span>
                      <span className="vs-live-time">{fmtTime(ev.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!realtimeData && !gaRealtime && !realtimeLoading && (
            <div className="vs-empty-state"><FaBolt className="vs-empty-icon" /><p>No hay datos en tiempo real disponibles</p></div>
          )}
        </>
      )}

      {/* ═══ REGISTRO TAB ═══ */}
      {activeTab === 'registro' && (
        <>
          <div className="vs-toolbar">
            <div className="vs-search">
              <FaSearch className="vs-search-icon" />
              <input type="text" placeholder="Buscar por IP, ciudad, pais, ruta..." value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
            </div>
            <span className="vs-result-count">{filteredVisits.length} resultados</span>
          </div>

          <div className="vs-table-wrap">
            <table className="vs-table">
              <thead><tr><th>Visitante</th><th>Ubicacion</th><th>Ruta</th><th>Fecha</th></tr></thead>
              <tbody>
                {pagedVisits.length === 0 ? (
                  <tr><td colSpan={4} className="vs-empty-row">No se encontraron visitas</td></tr>
                ) : pagedVisits.map(v => {
                  const device = getDeviceType(v.userAgent);
                  return (
                    <tr key={v._id} className="vs-clickable-row" onClick={() => setSelectedVisit(v)}>
                      <td>
                        <div className="vs-cell-visitor">
                          <div className="vs-visitor-icon">{device === 'mobile' ? <FaMobileAlt /> : <FaDesktop />}</div>
                          <div>
                            <span className="vs-visitor-ip">{v.ip}</span>
                            <span className="vs-visitor-ua">{(v.userAgent || '').substring(0, 40)}...</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="vs-location">{v.geoLocation?.city || 'N/A'}, {countryName(v.geoLocation?.country) || 'N/A'}</span></td>
                      <td><span className="vs-path">{v.path || '/'}</span></td>
                      <td><div className="vs-date-group"><span className="vs-date">{fmtDate(v.createdAt)}</span><span className="vs-time">{fmtTime(v.createdAt)}</span></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="vs-pagination">
              <button className="vs-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
              <span className="vs-page-info">Pagina {page} de {totalPages}</span>
              <button className="vs-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── Sub-components ── */

const GrowthBadge = ({ value, invert }) => {
  if (value === undefined || value === null) return null;
  const goingUp = value >= 0;
  const isGood = invert ? !goingUp : goingUp;
  return (
    <span className={`vs-badge ${isGood ? 'up' : 'down'}`}>
      {goingUp ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(value)}%
    </span>
  );
};

const SectionHeader = ({ title, icon, sectionKey, expanded, onToggle }) => (
  <div className="vs-section-header" onClick={() => onToggle(sectionKey)}>
    <div className="vs-section-left">
      {icon}
      <span>{title}</span>
    </div>
    {expanded ? <FaChevronUp className="vs-section-chevron" /> : <FaChevronDown className="vs-section-chevron" />}
  </div>
);

export default ManageVisits;
