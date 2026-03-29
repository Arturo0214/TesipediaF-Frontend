import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVisits, clearError } from '../../../features/visits/visitsSlice';
import { getEventStats, getEventFeed, getRealtimeData } from '../../../services/eventService';
import { getGADashboard, getGARealtime } from '../../../services/gaService';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from 'recharts';
import {
  FaGlobe, FaMapMarkerAlt, FaSearch, FaEye, FaTimes,
  FaSyncAlt, FaChartLine, FaCalendarAlt, FaClock,
  FaDesktop, FaMobileAlt, FaArrowUp, FaArrowDown,
  FaBuilding, FaWifi, FaRoute, FaMousePointer,
  FaBolt, FaUsers, FaComments, FaFileAlt,
  FaScroll, FaHandPointer, FaMobile, FaLaptop, FaTabletAlt,
  FaSignInAlt, FaPercentage, FaChartBar,
  FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaLink,
  FaGoogle, FaSearchPlus, FaAd,
} from 'react-icons/fa';
import VisitsMap from './VisitsMap';
import './ManageVisits.css';

// ── Color palette ──
const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
const CHART_BLUE = '#3b82f6';
const CHART_PURPLE = '#8b5cf6';
const CHART_GREEN = '#10b981';

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
    funnel: true, pages: true, acquisition: true, geo: true, events: true, sources: true, search: true,
  });

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    dispatch(getVisits());
    return () => dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    loadGAData();
    loadEventData();
    loadRealtimeData();
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

  useEffect(() => { loadGAData(); }, [gaPeriod]);
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

    const hourly = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, count: 0 }));
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

    // Referrer breakdown from internal visits
    const byReferrer = {};
    visits.forEach(v => {
      const ref = v.referrer || '(directo)';
      byReferrer[ref] = (byReferrer[ref] || 0) + 1;
    });
    const topReferrers = Object.entries(byReferrer).sort(([, a], [, b]) => b - a).slice(0, 10);

    return {
      total, today, thisWeek, thisMonth, weekGrowth,
      countries: countries.size, cities: cities.size,
      topCountries, topCities, timeline, hourly, topPaths,
      visitsByCountryISO, topReferrers,
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

  // GA timeline data for Recharts (hourly when 1 day, daily otherwise)
  const gaTimelineData = useMemo(() => {
    if (!gaData?.timeline) return null;
    const { type, rows } = gaData.timeline;
    if (!rows || rows.length === 0) return null;

    if (type === 'hourly') {
      // dateHour format: "2026032814" → hour "14:00"
      return rows.map(d => {
        const dh = d.dateHour || '';
        const hour = dh.length >= 10 ? dh.slice(8, 10) : dh;
        const label = `${hour}:00`;
        return { label, usuarios: d.users, sesiones: d.sessions, vistas: d.pageViews || 0 };
      });
    }

    // Daily view
    return rows.map(d => {
      const dateStr = d.date;
      const label = dateStr ? `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}` : '';
      return { label, usuarios: d.users, sesiones: d.sessions, vistas: d.pageViews || 0 };
    });
  }, [gaData]);

  // Channels pie data
  const channelsPieData = useMemo(() => {
    if (!gaData?.channels) return [];
    return gaData.channels.map((ch, i) => ({
      name: ch.channel, value: ch.sessions, fill: COLORS[i % COLORS.length],
    }));
  }, [gaData]);

  // Devices pie data
  const devicesPieData = useMemo(() => {
    if (!gaData?.devices) return [];
    const deviceColors = { desktop: '#3b82f6', mobile: '#8b5cf6', tablet: '#06b6d4' };
    return gaData.devices.map(d => ({
      name: d.device, value: d.users, fill: deviceColors[d.device] || '#9ca3af',
    }));
  }, [gaData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="vs-recharts-tooltip">
        <p className="vs-tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="vs-tooltip-value">
            {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
          </p>
        ))}
      </div>
    );
  };

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

      {/* ═══ TABS ═══ */}
      <div className="vs-nav">
        {[
          { key: 'dashboard', icon: <FaChartLine />, label: 'Dashboard' },
          { key: 'eventos', icon: <FaMousePointer />, label: 'Eventos' },
          { key: 'realtime', icon: <FaBolt />, label: 'Tiempo Real' },
          { key: 'geografia', icon: <FaGlobe />, label: 'Geografia' },
          { key: 'registro', icon: <FaEye />, label: `Registro (${stats.total})` },
        ].map(tab => (
          <button key={tab.key} className={`vs-nav-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}>
            {tab.icon} <span className="vs-nav-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
           DASHBOARD TAB
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

          {/* ── KPI Row ── */}
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

          {/* ── Google Traffic Section ── */}
          {gaData?.googleTraffic && (
            <div className="vs-google-traffic-section">
              <div className="vs-google-traffic-header">
                <div className="vs-google-traffic-title">
                  <FaGoogle className="vs-google-icon" />
                  <h3>Tráfico desde Google</h3>
                  <GrowthBadge value={gaData.googleTraffic.growth} />
                </div>
                <div className="vs-google-traffic-total">
                  <span className="vs-google-total-number">{gaData.googleTraffic.total.sessions.toLocaleString()}</span>
                  <span className="vs-google-total-label">sesiones totales</span>
                </div>
              </div>

              <div className="vs-google-kpi-row">
                <div className="vs-google-kpi">
                  <div className="vs-google-kpi-value">{gaData.googleTraffic.total.users.toLocaleString()}</div>
                  <div className="vs-google-kpi-label">Usuarios</div>
                </div>
                <div className="vs-google-kpi">
                  <div className="vs-google-kpi-value">{gaData.googleTraffic.total.newUsers.toLocaleString()}</div>
                  <div className="vs-google-kpi-label">Nuevos</div>
                </div>
                <div className="vs-google-kpi">
                  <div className="vs-google-kpi-value">{gaData.googleTraffic.total.pageViews.toLocaleString()}</div>
                  <div className="vs-google-kpi-label">Vistas</div>
                </div>
                <div className="vs-google-kpi">
                  <div className="vs-google-kpi-value">{(gaData.googleTraffic.total.bounceRate * 100).toFixed(1)}%</div>
                  <div className="vs-google-kpi-label">Rebote</div>
                </div>
                <div className="vs-google-kpi">
                  <div className="vs-google-kpi-value">{fmtDuration(gaData.googleTraffic.total.avgDuration)}</div>
                  <div className="vs-google-kpi-label">Duración prom.</div>
                </div>
              </div>

              {/* Breakdown by medium */}
              <div className="vs-google-breakdown">
                <h4 className="vs-google-breakdown-title">Desglose por tipo</h4>
                <div className="vs-google-medium-grid">
                  {gaData.googleTraffic.byMedium.map((m, i) => (
                    <div key={m.medium} className={`vs-google-medium-card ${m.medium === 'organic' ? 'organic' : m.medium === 'cpc' ? 'cpc' : 'other'}`}>
                      <div className="vs-google-medium-icon">
                        {m.medium === 'organic' ? <FaSearchPlus /> : m.medium === 'cpc' ? <FaAd /> : <FaLink />}
                      </div>
                      <div className="vs-google-medium-info">
                        <div className="vs-google-medium-label">{m.label}</div>
                        <div className="vs-google-medium-sessions">
                          <strong>{m.sessions.toLocaleString()}</strong> sesiones
                          <GrowthBadge value={m.growth} />
                        </div>
                        <div className="vs-google-medium-detail">
                          {m.users} usuarios · {m.newUsers} nuevos · {m.pageViews} vistas
                        </div>
                      </div>
                      <div className="vs-google-medium-bar">
                        <div
                          className="vs-google-medium-bar-fill"
                          style={{ width: `${gaData.googleTraffic.total.sessions > 0 ? Math.round((m.sessions / gaData.googleTraffic.total.sessions) * 100) : 0}%` }}
                        />
                        <span className="vs-google-medium-pct">
                          {gaData.googleTraffic.total.sessions > 0 ? Math.round((m.sessions / gaData.googleTraffic.total.sessions) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Traffic Timeline */}
              {gaData.googleTraffic.timeline?.rows?.length > 0 && (
                <div className="vs-google-timeline">
                  <h4 className="vs-google-breakdown-title"><FaChartLine /> Tendencia de tráfico de Google</h4>
                  <div className="vs-chart-container">
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={gaData.googleTraffic.timeline.rows.map(r => {
                        const raw = r.date || r.dateHour || '';
                        const label = gaData.googleTraffic.timeline.type === 'hourly'
                          ? `${raw.slice(8, 10)}:00`
                          : `${raw.slice(6, 8)}/${raw.slice(4, 6)}`;
                        return { label, sesiones: r.sessions, usuarios: r.users };
                      })} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradGoogleSessions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4285F4" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#4285F4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Area type="monotone" dataKey="sesiones" stroke="#4285F4" fill="url(#gradGoogleSessions)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                        <Area type="monotone" dataKey="usuarios" stroke="#34A853" fill="transparent" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Comparison with total traffic */}
              {gaSessions > 0 && (
                <div className="vs-google-share">
                  <div className="vs-google-share-bar">
                    <div
                      className="vs-google-share-fill"
                      style={{ width: `${Math.round((gaData.googleTraffic.total.sessions / gaSessions) * 100)}%` }}
                    />
                  </div>
                  <div className="vs-google-share-text">
                    Google representa el <strong>{Math.round((gaData.googleTraffic.total.sessions / gaSessions) * 100)}%</strong> de todo tu tráfico ({gaData.googleTraffic.total.sessions.toLocaleString()} de {gaSessions.toLocaleString()} sesiones)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Timeline Chart (Recharts) ── */}
          {gaTimelineData && gaTimelineData.length > 0 ? (
            <div className="vs-chart-card full">
              <h4 className="vs-chart-title"><FaChartLine /> {gaPeriod <= 1 ? 'Trafico por hora (hoy)' : `Trafico diario (ultimos ${gaPeriod} dias)`}</h4>
              <div className="vs-chart-container">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={gaTimelineData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_BLUE} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_BLUE} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_PURPLE} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={CHART_PURPLE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="usuarios" stroke={CHART_BLUE} fill="url(#gradUsers)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                    <Area type="monotone" dataKey="sesiones" stroke={CHART_PURPLE} fill="url(#gradSessions)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="vs-chart-card full">
              <h4 className="vs-chart-title">
                <FaChartLine /> {gaPeriod <= 1 ? 'Visitas por hora (hoy)' : `Visitas por dia (ultimos ${gaPeriod <= 1 ? 1 : Math.min(gaPeriod, 30)} dias)`}
              </h4>
              <div className="vs-chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={gaPeriod <= 1 ? stats.hourly : stats.timeline.slice(Math.max(0, 30 - gaPeriod))}
                    margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey={gaPeriod <= 1 ? 'hour' : 'label'} tick={{ fontSize: 10, fill: '#9ca3af' }} interval={gaPeriod <= 1 ? 2 : Math.max(0, Math.floor(gaPeriod / 10))} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="visitas" fill={CHART_BLUE} radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── SECTION: Fuentes de Trafico ── */}
          <SectionHeader title="Fuentes de Trafico" icon={<FaLink />} sectionKey="sources" expanded={expandedSections.sources} onToggle={toggleSection} />
          {expandedSections.sources && (
            <div className="vs-charts-row">
              {/* Traffic Sources from GA */}
              {gaData?.sources && gaData.sources.length > 0 ? (
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaExternalLinkAlt /> Fuentes / Medio (GA)</h4>
                  <div className="vs-sources-table">
                    <div className="vs-sources-thead">
                      <span className="vs-src-name">Fuente</span>
                      <span className="vs-src-medium">Medio</span>
                      <span className="vs-src-num">Sesiones</span>
                      <span className="vs-src-num">Usuarios</span>
                      <span className="vs-src-num">Rebote</span>
                    </div>
                    {gaData.sources.slice(0, 10).map((s, i) => (
                      <div key={i} className="vs-sources-row">
                        <span className="vs-src-name" title={s.source}>
                          <span className="vs-src-pos">{i + 1}</span>
                          {s.source}
                        </span>
                        <span className="vs-src-medium">
                          <span className={`vs-medium-badge ${s.medium}`}>{s.medium}</span>
                        </span>
                        <span className="vs-src-num"><strong>{s.sessions}</strong></span>
                        <span className="vs-src-num">{s.users}</span>
                        <span className="vs-src-num">{(s.bounceRate * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaExternalLinkAlt /> Referrers (interno)</h4>
                  <div className="vs-rank-list">
                    {stats.topReferrers.map(([name, count], i) => {
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={name} className="vs-rank-item">
                          <span className="vs-rank-pos">{i + 1}</span>
                          <span className="vs-rank-name mono" title={name}>{name}</span>
                          <div className="vs-rank-bar-bg"><div className="vs-rank-bar" style={{ width: `${pct}%` }} /></div>
                          <span className="vs-rank-count">{count}</span>
                          <span className="vs-rank-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Channels Pie Chart */}
              {channelsPieData.length > 0 ? (
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaSignInAlt /> Canales de trafico</h4>
                  <div className="vs-chart-container" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ResponsiveContainer width="50%" height={220}>
                      <PieChart>
                        <Pie
                          data={channelsPieData}
                          cx="50%" cy="50%"
                          outerRadius={80} innerRadius={40}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {channelsPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="vs-pie-legend">
                      {channelsPieData.map((ch, i) => (
                        <div key={i} className="vs-pie-legend-item">
                          <span className="vs-pie-dot" style={{ background: ch.fill }} />
                          <span className="vs-pie-label">{ch.name}</span>
                          <span className="vs-pie-val">{ch.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaSignInAlt /> Canales de trafico</h4>
                  <div className="vs-empty-text">No hay datos de canales disponibles</div>
                </div>
              )}
            </div>
          )}

          {/* ── SECTION: Busqueda Organica (Search Console) ── */}
          {gaData?.searchConsole && (gaData.searchConsole.queries?.length > 0 || gaData.searchConsole.summary) && (
            <>
              <SectionHeader title="Busqueda Organica (Search Console)" icon={<FaSearch />} sectionKey="search" expanded={expandedSections.search} onToggle={toggleSection} />
              {expandedSections.search && (
                <>
                  {/* Summary KPIs */}
                  {gaData.searchConsole.summary && (
                    <div className="vs-kpi-grid-4">
                      <div className="vs-kpi">
                        <div className="vs-kpi-top"><span className="vs-kpi-icon blue"><FaMousePointer /></span></div>
                        <div className="vs-kpi-value">{(gaData.searchConsole.summary.totalClicks || 0).toLocaleString()}</div>
                        <div className="vs-kpi-label">Clics organicos</div>
                      </div>
                      <div className="vs-kpi">
                        <div className="vs-kpi-top"><span className="vs-kpi-icon purple"><FaEye /></span></div>
                        <div className="vs-kpi-value">{(gaData.searchConsole.summary.totalImpressions || 0).toLocaleString()}</div>
                        <div className="vs-kpi-label">Impresiones</div>
                      </div>
                      <div className="vs-kpi">
                        <div className="vs-kpi-top"><span className="vs-kpi-icon green"><FaPercentage /></span></div>
                        <div className="vs-kpi-value">{gaData.searchConsole.summary.avgCTR || 0}%</div>
                        <div className="vs-kpi-label">CTR promedio</div>
                      </div>
                      <div className="vs-kpi">
                        <div className="vs-kpi-top"><span className="vs-kpi-icon orange"><FaChartLine /></span></div>
                        <div className="vs-kpi-value">{gaData.searchConsole.summary.avgPosition || 0}</div>
                        <div className="vs-kpi-label">Posicion promedio</div>
                      </div>
                    </div>
                  )}

                  <div className="vs-charts-row">
                    {/* Top Queries */}
                    {gaData.searchConsole.queries?.length > 0 && (
                      <div className="vs-chart-card">
                        <h4 className="vs-chart-title"><FaSearch /> Consultas de busqueda organica</h4>
                        <div className="vs-sources-table">
                          <div className="vs-sources-thead">
                            <span className="vs-src-name">Consulta</span>
                            <span className="vs-src-num">Clics</span>
                            <span className="vs-src-num">Impresiones</span>
                            <span className="vs-src-num">CTR</span>
                            <span className="vs-src-num">Posicion</span>
                          </div>
                          {gaData.searchConsole.queries.slice(0, 15).map((q, i) => (
                            <div key={i} className="vs-sources-row">
                              <span className="vs-src-name" title={q.query}>
                                <span className="vs-src-pos">{i + 1}</span>
                                {q.query}
                              </span>
                              <span className="vs-src-num"><strong>{q.clicks}</strong></span>
                              <span className="vs-src-num">{q.impressions.toLocaleString()}</span>
                              <span className="vs-src-num">{q.ctr}%</span>
                              <span className="vs-src-num">{q.position}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Pages from Search */}
                    {gaData.searchConsole.pages?.length > 0 && (
                      <div className="vs-chart-card">
                        <h4 className="vs-chart-title"><FaFileAlt /> Paginas en busqueda organica</h4>
                        <div className="vs-sources-table">
                          <div className="vs-sources-thead">
                            <span className="vs-src-name">Pagina</span>
                            <span className="vs-src-num">Clics</span>
                            <span className="vs-src-num">Impresiones</span>
                            <span className="vs-src-num">CTR</span>
                            <span className="vs-src-num">Posicion</span>
                          </div>
                          {gaData.searchConsole.pages.slice(0, 10).map((p, i) => (
                            <div key={i} className="vs-sources-row">
                              <span className="vs-src-name mono" title={p.page}>
                                <span className="vs-src-pos">{i + 1}</span>
                                {p.page}
                              </span>
                              <span className="vs-src-num"><strong>{p.clicks}</strong></span>
                              <span className="vs-src-num">{p.impressions.toLocaleString()}</span>
                              <span className="vs-src-num">{p.ctr}%</span>
                              <span className="vs-src-num">{p.position}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── SECTION: Top Paginas ── */}
          <SectionHeader title="Top Paginas & Rendimiento" icon={<FaRoute />} sectionKey="pages" expanded={expandedSections.pages} onToggle={toggleSection} />
          {expandedSections.pages && (
            <div className="vs-charts-row">
              {gaData?.pages ? (
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
              ) : (
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaEye /> Top rutas (interno)</h4>
                  <div className="vs-rank-list">
                    {stats.topPaths.map(([path, count], i) => {
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={path} className="vs-rank-item">
                          <span className="vs-rank-pos">{i + 1}</span>
                          <span className="vs-rank-name mono">{path}</span>
                          <div className="vs-rank-bar-bg"><div className="vs-rank-bar path" style={{ width: `${pct}%` }} /></div>
                          <span className="vs-rank-count">{count}</span>
                          <span className="vs-rank-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Devices donut + Hourly bar */}
              <div className="vs-chart-card">
                {devicesPieData.length > 0 ? (
                  <>
                    <h4 className="vs-chart-title"><FaDesktop /> Dispositivos</h4>
                    <div className="vs-chart-container" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <ResponsiveContainer width="50%" height={200}>
                        <PieChart>
                          <Pie data={devicesPieData} cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3} dataKey="value">
                            {devicesPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="vs-pie-legend">
                        {devicesPieData.map((d, i) => {
                          const total = devicesPieData.reduce((s, x) => s + x.value, 0) || 1;
                          const pct = Math.round((d.value / total) * 100);
                          const icon = { desktop: <FaLaptop />, mobile: <FaMobile />, tablet: <FaTabletAlt /> }[d.name] || <FaDesktop />;
                          return (
                            <div key={i} className="vs-pie-legend-item">
                              <span className="vs-pie-dot" style={{ background: d.fill }} />
                              <span className="vs-pie-icon">{icon}</span>
                              <span className="vs-pie-label">{d.name}</span>
                              <span className="vs-pie-val">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="vs-chart-title"><FaClock /> Distribucion por hora</h4>
                    <div className="vs-chart-container">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.hourly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={2} />
                          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" name="visitas" fill={CHART_PURPLE} radius={[3, 3, 0, 0]} maxBarSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>
            </div>
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

      {/* ═══ GEOGRAFIA TAB ═══ */}
      {activeTab === 'geografia' && (
        <>
          {/* Map */}
          {Object.keys(stats.visitsByCountryISO).length > 0 && (
            <div className="vs-chart-card full">
              <VisitsMap visitsByCountry={stats.visitsByCountryISO} gaCountries={gaData?.countries || []} />
            </div>
          )}

          {/* Countries + Cities row */}
          <div className="vs-charts-row">
            {/* Countries */}
            <div className="vs-chart-card">
              <h4 className="vs-chart-title"><FaGlobe /> Usuarios por pais</h4>
              {gaData?.countries ? (
                <>
                  <div className="vs-chart-container">
                    <ResponsiveContainer width="100%" height={Math.min(gaData.countries.length * 38, 400)}>
                      <BarChart data={gaData.countries.slice(0, 10)} layout="vertical" margin={{ top: 0, right: 10, left: 5, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                        <YAxis type="category" dataKey="country" tick={{ fontSize: 11, fill: '#374151' }} width={90} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="activeUsers" name="usuarios" fill={CHART_BLUE} radius={[0, 4, 4, 0]} maxBarSize={24}>
                          {gaData.countries.slice(0, 10).map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="vs-geo-table" style={{ marginTop: 16 }}>
                    <div className="vs-mini-thead">
                      <span className="vs-mt-page">Pais</span>
                      <span className="vs-mt-num">Usuarios</span>
                      <span className="vs-mt-num">Nuevos</span>
                      <span className="vs-mt-num">Sesiones</span>
                    </div>
                    {gaData.countries.map((c, i) => (
                      <div key={i} className="vs-mini-row">
                        <span className="vs-mt-page">
                          <span className="vs-mt-pos">{i + 1}</span>
                          {c.country}
                        </span>
                        <span className="vs-mt-num"><strong>{c.activeUsers}</strong></span>
                        <span className="vs-mt-num">{c.newUsers}</span>
                        <span className="vs-mt-num">{c.sessions}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
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
              )}
            </div>

            {/* Cities */}
            <div className="vs-chart-card">
              <h4 className="vs-chart-title"><FaMapMarkerAlt /> Top ciudades</h4>
              <div className="vs-rank-list">
                {stats.topCities.map(([name, count], i) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={name} className="vs-rank-item">
                      <span className="vs-rank-pos">{i + 1}</span>
                      <span className="vs-rank-name">{name}</span>
                      <div className="vs-rank-bar-bg"><div className="vs-rank-bar city" style={{ width: `${pct}%` }} /></div>
                      <span className="vs-rank-count">{count}</span>
                      <span className="vs-rank-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Devices */}
          {devicesPieData.length > 0 && (
            <div className="vs-chart-card full">
              <h4 className="vs-chart-title"><FaDesktop /> Dispositivos por region</h4>
              <div className="vs-chart-container" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie data={devicesPieData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3} dataKey="value">
                      {devicesPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="vs-pie-legend">
                  {devicesPieData.map((d, i) => {
                    const total = devicesPieData.reduce((s, x) => s + x.value, 0) || 1;
                    const pct = Math.round((d.value / total) * 100);
                    const icon = { desktop: <FaLaptop />, mobile: <FaMobile />, tablet: <FaTabletAlt /> }[d.name] || <FaDesktop />;
                    return (
                      <div key={i} className="vs-pie-legend-item">
                        <span className="vs-pie-dot" style={{ background: d.fill }} />
                        <span className="vs-pie-icon">{icon}</span>
                        <span className="vs-pie-label">{d.name}</span>
                        <span className="vs-pie-val">{pct}% ({d.value})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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
