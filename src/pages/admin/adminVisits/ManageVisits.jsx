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
  FaGoogle, FaSignInAlt, FaPercentage,
} from 'react-icons/fa';
import { SiGoogleanalytics } from 'react-icons/si';
import './ManageVisits.css';

const ManageVisits = () => {
  const dispatch = useDispatch();
  const { visits, loading, error } = useSelector(state => state.visits);
  const [activeTab, setActiveTab] = useState('resumen');
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
  const [eventPeriod, setEventPeriod] = useState(24); // hours
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

  useEffect(() => {
    dispatch(getVisits());
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(getVisits());
    if (activeTab === 'eventos') loadEventData();
    if (activeTab === 'realtime') loadRealtimeData();
    if (activeTab === 'analytics') loadGAData();
    setRefreshing(false);
  };

  // ── Load event analytics ──
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

  // Load events when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'eventos') loadEventData();
  }, [activeTab, loadEventData]);

  // Realtime auto-refresh every 10 seconds
  useEffect(() => {
    if (activeTab === 'realtime') {
      loadRealtimeData();
      realtimeInterval.current = setInterval(loadRealtimeData, 10000);
    }
    return () => {
      if (realtimeInterval.current) clearInterval(realtimeInterval.current);
    };
  }, [activeTab, loadRealtimeData]);

  // Load GA data when tab or period changes
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

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadGAData();
      gaRealtimeInterval.current = setInterval(async () => {
        try {
          const rt = await getGARealtime();
          setGaRealtime(rt);
        } catch {}
      }, 30000); // Refresh realtime every 30s
    }
    return () => {
      if (gaRealtimeInterval.current) clearInterval(gaRealtimeInterval.current);
    };
  }, [activeTab, loadGAData]);

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

    // By country
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

    // Timeline: last 30 days
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

    // Hourly distribution (24h)
    const hourly = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    visits.forEach(v => {
      const h = new Date(v.createdAt).getHours();
      hourly[h].count++;
    });

    // Weekly comparison
    const prevWeekStart = new Date(weekAgo); prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeek = visits.filter(v => {
      const d = new Date(v.createdAt);
      return d >= prevWeekStart && d < weekAgo;
    }).length;
    const weekGrowth = prevWeek > 0 ? Math.round(((thisWeek - prevWeek) / prevWeek) * 100) : (thisWeek > 0 ? 100 : 0);

    // Top paths
    const byPath = {};
    visits.forEach(v => {
      const path = v.path || '/';
      byPath[path] = (byPath[path] || 0) + 1;
    });
    const topPaths = Object.entries(byPath).sort(([, a], [, b]) => b - a).slice(0, 8);

    return {
      total, today, thisWeek, thisMonth, weekGrowth,
      countries: countries.size, cities: cities.size,
      topCountries, topCities, timeline, hourly, topPaths,
    };
  }, [visits]);

  // ── Filtered visits for table ──
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
  const fmtDate = (d) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const fmtFull = (d) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const maxTimeline = Math.max(...stats.timeline.map(t => t.count), 1);
  const maxHourly = Math.max(...stats.hourly.map(h => h.count), 1);

  const getDeviceType = (ua) => {
    if (!ua) return 'desktop';
    const lower = ua.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) return 'mobile';
    return 'desktop';
  };

  if (loading && visits.length === 0) {
    return <div className="vs"><div className="vs-loading"><div className="vs-spinner" /> Cargando visitas...</div></div>;
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
                  <div className="vs-drawer-field">
                    <FaMapMarkerAlt className="vs-field-icon" />
                    <div>
                      <span className="vs-field-label">Ciudad</span>
                      <span className="vs-field-value">{selectedVisit.geoLocation?.city || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="vs-drawer-field">
                    <FaGlobe className="vs-field-icon" />
                    <div>
                      <span className="vs-field-label">Pais</span>
                      <span className="vs-field-value">{selectedVisit.geoLocation?.country || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="vs-drawer-field">
                    <FaBuilding className="vs-field-icon" />
                    <div>
                      <span className="vs-field-label">Region</span>
                      <span className="vs-field-value">{selectedVisit.geoLocation?.region || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="vs-drawer-field">
                    <FaWifi className="vs-field-icon" />
                    <div>
                      <span className="vs-field-label">Organizacion / ISP</span>
                      <span className="vs-field-value">{selectedVisit.geoLocation?.org || 'N/A'}</span>
                    </div>
                  </div>
                  {selectedVisit.geoLocation?.location && (
                    <div className="vs-drawer-field">
                      <FaMapMarkerAlt className="vs-field-icon" />
                      <div>
                        <span className="vs-field-label">Coordenadas</span>
                        <span className="vs-field-value">{selectedVisit.geoLocation.location}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="vs-drawer-section">
                <h4>Conexion</h4>
                <div className="vs-drawer-fields">
                  <div className="vs-drawer-field">
                    <FaGlobe className="vs-field-icon" />
                    <div>
                      <span className="vs-field-label">IP</span>
                      <span className="vs-field-value mono">{selectedVisit.ip}</span>
                    </div>
                  </div>
                  <div className="vs-drawer-field">
                    <FaRoute className="vs-field-icon" />
                    <div>
                      <span className="vs-field-label">Ruta visitada</span>
                      <span className="vs-field-value mono">{selectedVisit.path || '/'}</span>
                    </div>
                  </div>
                  <div className="vs-drawer-field">
                    <FaDesktop className="vs-field-icon" />
                    <div>
                      <span className="vs-field-label">User Agent</span>
                      <span className="vs-field-value small">{selectedVisit.userAgent || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="vs-drawer-section">
                <h4>Tiempo</h4>
                <div className="vs-drawer-fields">
                  <div className="vs-drawer-field">
                    <FaCalendarAlt className="vs-field-icon" />
                    <div>
                      <span className="vs-field-label">Fecha y hora</span>
                      <span className="vs-field-value">{fmtFull(selectedVisit.createdAt)}</span>
                    </div>
                  </div>
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

      {/* Header */}
      <div className="vs-header">
        <div className="vs-header-left">
          <FaGlobe className="vs-logo" />
          <div>
            <h2 className="vs-title">Analisis de Visitas</h2>
            <span className="vs-subtitle">{stats.total} visitas totales · {stats.countries} paises</span>
          </div>
        </div>
        <button className={`vs-refresh ${refreshing ? 'vs-spinning' : ''}`} onClick={handleRefresh} disabled={refreshing}>
          <FaSyncAlt /> Actualizar
        </button>
      </div>

      {error && <div className="vs-error-bar">{error}</div>}

      {/* Tabs */}
      <div className="vs-nav">
        {['resumen', 'analytics', 'eventos', 'realtime', 'evolucion', 'registro'].map(tab => (
          <button key={tab} className={`vs-nav-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setPage(1); }}>
            {tab === 'resumen' && <><FaChartLine /> Resumen</>}
            {tab === 'analytics' && <><SiGoogleanalytics /> Google Analytics</>}
            {tab === 'eventos' && <><FaMousePointer /> Eventos</>}
            {tab === 'realtime' && <><FaBolt /> Tiempo Real</>}
            {tab === 'evolucion' && <><FaCalendarAlt /> Evolucion</>}
            {tab === 'registro' && <><FaEye /> Registro ({stats.total})</>}
          </button>
        ))}
      </div>

      {/* ═══ RESUMEN TAB ═══ */}
      {activeTab === 'resumen' && (
        <>
          {/* KPI cards */}
          <div className="vs-kpi-grid">
            <div className="vs-kpi">
              <div className="vs-kpi-top">
                <span className="vs-kpi-icon blue"><FaGlobe /></span>
                <GrowthBadge value={stats.weekGrowth} />
              </div>
              <div className="vs-kpi-value">{stats.total.toLocaleString()}</div>
              <div className="vs-kpi-label">Visitas totales</div>
              <div className="vs-kpi-sub">{stats.thisMonth} este mes</div>
            </div>
            <div className="vs-kpi">
              <div className="vs-kpi-top">
                <span className="vs-kpi-icon green"><FaCalendarAlt /></span>
              </div>
              <div className="vs-kpi-value">{stats.today}</div>
              <div className="vs-kpi-label">Hoy</div>
              <div className="vs-kpi-sub">{stats.thisWeek} esta semana</div>
            </div>
            <div className="vs-kpi">
              <div className="vs-kpi-top">
                <span className="vs-kpi-icon purple"><FaMapMarkerAlt /></span>
              </div>
              <div className="vs-kpi-value">{stats.countries}</div>
              <div className="vs-kpi-label">Paises</div>
              <div className="vs-kpi-sub">{stats.cities} ciudades</div>
            </div>
            <div className="vs-kpi">
              <div className="vs-kpi-top">
                <span className="vs-kpi-icon orange"><FaChartLine /></span>
              </div>
              <div className="vs-kpi-value">{stats.thisMonth > 0 ? Math.round(stats.total / 30) : 0}</div>
              <div className="vs-kpi-label">Promedio diario</div>
              <div className="vs-kpi-sub">Ultimos 30 dias</div>
            </div>
          </div>

          {/* Top Countries + Cities */}
          <div className="vs-charts-row">
            <div className="vs-chart-card">
              <h4 className="vs-chart-title"><FaGlobe /> Top paises</h4>
              <div className="vs-rank-list">
                {stats.topCountries.map(([name, count], i) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={name} className="vs-rank-item">
                      <span className="vs-rank-pos">{i + 1}</span>
                      <span className="vs-rank-name">{name}</span>
                      <div className="vs-rank-bar-bg">
                        <div className="vs-rank-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="vs-rank-count">{count}</span>
                      <span className="vs-rank-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="vs-chart-card">
              <h4 className="vs-chart-title"><FaMapMarkerAlt /> Top ciudades</h4>
              <div className="vs-rank-list">
                {stats.topCities.map(([name, count], i) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={name} className="vs-rank-item">
                      <span className="vs-rank-pos">{i + 1}</span>
                      <span className="vs-rank-name">{name}</span>
                      <div className="vs-rank-bar-bg">
                        <div className="vs-rank-bar city" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="vs-rank-count">{count}</span>
                      <span className="vs-rank-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Paths */}
          <div className="vs-chart-card full">
            <h4 className="vs-chart-title"><FaRoute /> Paginas mas visitadas</h4>
            <div className="vs-rank-list">
              {stats.topPaths.map(([path, count], i) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={path} className="vs-rank-item">
                    <span className="vs-rank-pos">{i + 1}</span>
                    <span className="vs-rank-name mono">{path}</span>
                    <div className="vs-rank-bar-bg">
                      <div className="vs-rank-bar path" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="vs-rank-count">{count}</span>
                    <span className="vs-rank-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ═══ GOOGLE ANALYTICS TAB ═══ */}
      {activeTab === 'analytics' && (
        <>
          <div className="vs-toolbar">
            <div className="vs-ga-header-row">
              <SiGoogleanalytics className="vs-ga-logo" />
              <span className="vs-ga-title">Google Analytics</span>
            </div>
            <select className="vs-period-select" value={gaPeriod} onChange={e => setGaPeriod(Number(e.target.value))}>
              <option value={1}>Hoy</option>
              <option value={7}>Últimos 7 días</option>
              <option value={14}>Últimos 14 días</option>
              <option value={28}>Últimos 28 días</option>
              <option value={90}>Últimos 90 días</option>
            </select>
            <button className={`vs-refresh-sm ${gaLoading ? 'vs-spinning' : ''}`} onClick={loadGAData} disabled={gaLoading}>
              <FaSyncAlt />
            </button>
          </div>

          {gaError && (
            <div className="vs-ga-error">
              <strong>Error conectando con Google Analytics:</strong> {gaError}
              <p className="vs-ga-error-help">
                Asegurate de configurar las variables de entorno <code>GA_CLIENT_EMAIL</code> y <code>GA_PRIVATE_KEY</code> en Railway (o <code>GOOGLE_APPLICATION_CREDENTIALS</code> local) con las credenciales de una Service Account de Google Cloud con acceso a tu propiedad GA4.
              </p>
            </div>
          )}

          {gaLoading && !gaData && (
            <div className="vs-loading"><div className="vs-spinner" /> Cargando datos de Google Analytics...</div>
          )}

          {/* Realtime banner */}
          {gaRealtime && (
            <div className="vs-ga-realtime-bar">
              <span className="vs-pulse" />
              <strong>{gaRealtime.totalActive}</strong> usuarios activos ahora
              {gaRealtime.byCountry.length > 0 && (
                <span className="vs-ga-rt-countries">
                  — {gaRealtime.byCountry.slice(0, 3).map(c => `${c.country} (${c.activeUsers})`).join(', ')}
                </span>
              )}
            </div>
          )}

          {gaData && (
            <>
              {/* KPIs */}
              {gaData.overview && (
                <div className="vs-kpi-grid">
                  <div className="vs-kpi">
                    <div className="vs-kpi-top">
                      <span className="vs-kpi-icon blue"><FaUsers /></span>
                      <GrowthBadge value={gaData.overview.growth?.activeUsers} />
                    </div>
                    <div className="vs-kpi-value">{gaData.overview.current?.activeUsers?.toLocaleString() || 0}</div>
                    <div className="vs-kpi-label">Usuarios activos</div>
                    <div className="vs-kpi-sub">{gaData.overview.current?.newUsers || 0} nuevos</div>
                  </div>
                  <div className="vs-kpi">
                    <div className="vs-kpi-top">
                      <span className="vs-kpi-icon green"><FaSignInAlt /></span>
                      <GrowthBadge value={gaData.overview.growth?.sessions} />
                    </div>
                    <div className="vs-kpi-value">{gaData.overview.current?.sessions?.toLocaleString() || 0}</div>
                    <div className="vs-kpi-label">Sesiones</div>
                    <div className="vs-kpi-sub">{gaData.overview.current?.engagedSessions || 0} comprometidas</div>
                  </div>
                  <div className="vs-kpi">
                    <div className="vs-kpi-top">
                      <span className="vs-kpi-icon purple"><FaEye /></span>
                      <GrowthBadge value={gaData.overview.growth?.pageViews} />
                    </div>
                    <div className="vs-kpi-value">{gaData.overview.current?.pageViews?.toLocaleString() || 0}</div>
                    <div className="vs-kpi-label">Vistas de página</div>
                  </div>
                  <div className="vs-kpi">
                    <div className="vs-kpi-top">
                      <span className="vs-kpi-icon orange"><FaPercentage /></span>
                      <GrowthBadge value={gaData.overview.growth?.bounceRate} invert />
                    </div>
                    <div className="vs-kpi-value">{((gaData.overview.current?.bounceRate || 0) * 100).toFixed(1)}%</div>
                    <div className="vs-kpi-label">Tasa de rebote</div>
                    <div className="vs-kpi-sub">Duración prom: {Math.round(gaData.overview.current?.avgSessionDuration || 0)}s</div>
                  </div>
                </div>
              )}

              {/* Channels + Countries */}
              <div className="vs-charts-row">
                {gaData.channels && (
                  <div className="vs-chart-card">
                    <h4 className="vs-chart-title"><FaRoute /> Canales de adquisicion</h4>
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
                            <span className="vs-rank-count">{ch.sessions} ses</span>
                            <span className="vs-rank-pct">{ch.newUsers} nuevos</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {gaData.countries && (
                  <div className="vs-chart-card">
                    <h4 className="vs-chart-title"><FaGlobe /> Usuarios por pais</h4>
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
                            <span className="vs-rank-pct">{c.newUsers} nuevos</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Top pages */}
              {gaData.pages && (
                <div className="vs-chart-card full">
                  <h4 className="vs-chart-title"><FaEye /> Paginas mas visitadas (GA4)</h4>
                  <div className="vs-table-wrap">
                    <table className="vs-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Pagina</th>
                          <th>Vistas</th>
                          <th>Usuarios</th>
                          <th>Sesiones</th>
                          <th>Rebote</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gaData.pages.map((p, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td><span className="vs-path">{p.page}</span></td>
                            <td><strong>{p.views}</strong></td>
                            <td>{p.users}</td>
                            <td>{p.sessions}</td>
                            <td>{(p.bounceRate * 100).toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Events + Devices */}
              <div className="vs-charts-row">
                {gaData.events && (
                  <div className="vs-chart-card">
                    <h4 className="vs-chart-title"><FaMousePointer /> Eventos (GA4)</h4>
                    <div className="vs-rank-list">
                      {gaData.events.map((ev, i) => (
                        <div key={i} className="vs-rank-item">
                          <span className="vs-rank-pos">{i + 1}</span>
                          <span className="vs-rank-name">{ev.event}</span>
                          <span className="vs-rank-count">{ev.count.toLocaleString()}</span>
                          <GrowthBadge value={ev.growth} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {gaData.devices && (
                  <div className="vs-chart-card">
                    <h4 className="vs-chart-title"><FaDesktop /> Dispositivos (GA4)</h4>
                    <div className="vs-rank-list">
                      {gaData.devices.map((d, i) => {
                        const total = gaData.devices.reduce((s, x) => s + x.users, 0) || 1;
                        const pct = Math.round((d.users / total) * 100);
                        const icon = { desktop: <FaLaptop />, mobile: <FaMobile />, tablet: <FaTabletAlt /> }[d.device] || <FaDesktop />;
                        return (
                          <div key={i} className="vs-rank-item">
                            <span className="vs-rank-pos">{icon}</span>
                            <span className="vs-rank-name">{d.device}</span>
                            <div className="vs-rank-bar-bg">
                              <div className="vs-rank-bar path" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="vs-rank-count">{d.users} usuarios</span>
                            <span className="vs-rank-pct">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Realtime detail */}
              {gaRealtime && gaRealtime.byPage.length > 0 && (
                <div className="vs-chart-card full">
                  <h4 className="vs-chart-title"><FaBolt /> Paginas activas ahora (Tiempo Real GA)</h4>
                  <div className="vs-rank-list">
                    {gaRealtime.byPage.map((p, i) => (
                      <div key={i} className="vs-rank-item">
                        <span className="vs-rank-pos">{i + 1}</span>
                        <span className="vs-rank-name">{p.page}</span>
                        <span className="vs-rank-count">{p.activeUsers} activos</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ═══ EVENTOS TAB ═══ */}
      {activeTab === 'eventos' && (
        <>
          {/* Period selector */}
          <div className="vs-toolbar">
            <select className="vs-period-select" value={eventPeriod} onChange={e => { setEventPeriod(Number(e.target.value)); setEventFeedPage(1); }}>
              <option value={1}>Última hora</option>
              <option value={6}>Últimas 6 horas</option>
              <option value={24}>Últimas 24 horas</option>
              <option value={168}>Última semana</option>
              <option value={720}>Último mes</option>
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
              {/* Event KPIs */}
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
                  <div className="vs-kpi-value">{eventStats.byType.find(t => t._id === 'cta')?.count || 0}</div>
                  <div className="vs-kpi-label">Clicks en CTAs</div>
                  <div className="vs-kpi-sub">Conversiones potenciales</div>
                </div>
                <div className="vs-kpi">
                  <div className="vs-kpi-top"><span className="vs-kpi-icon orange"><FaComments /></span></div>
                  <div className="vs-kpi-value">{eventStats.byType.find(t => t._id === 'chat')?.count || 0}</div>
                  <div className="vs-kpi-label">Interacciones chat</div>
                  <div className="vs-kpi-sub">Chatbot Sofia</div>
                </div>
              </div>

              {/* Event type breakdown + Top actions */}
              <div className="vs-charts-row">
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaBolt /> Por tipo de evento</h4>
                  <div className="vs-rank-list">
                    {eventStats.byType.map((t, i) => {
                      const total = eventStats.recentEvents || 1;
                      const pct = Math.round((t.count / total) * 100);
                      const icon = { click: <FaHandPointer />, cta: <FaMousePointer />, pageview: <FaEye />, scroll: <FaScroll />, chat: <FaComments />, form: <FaFileAlt /> }[t._id] || <FaBolt />;
                      return (
                        <div key={t._id} className="vs-rank-item">
                          <span className="vs-rank-pos">{icon}</span>
                          <span className="vs-rank-name">{t._id}</span>
                          <div className="vs-rank-bar-bg">
                            <div className="vs-rank-bar" style={{ width: `${pct}%` }} />
                          </div>
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

              {/* Pages with most events + Device breakdown */}
              <div className="vs-charts-row">
                <div className="vs-chart-card">
                  <h4 className="vs-chart-title"><FaRoute /> Paginas con mas eventos</h4>
                  <div className="vs-rank-list">
                    {eventStats.byPage.map((p, i) => (
                      <div key={i} className="vs-rank-item">
                        <span className="vs-rank-pos">{i + 1}</span>
                        <span className="vs-rank-name mono">{p.page}</span>
                        <span className="vs-rank-count">{p.events} eventos</span>
                        <span className="vs-rank-pct">{p.sessions} sesiones</span>
                      </div>
                    ))}
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
                          <div className="vs-rank-bar-bg">
                            <div className="vs-rank-bar city" style={{ width: `${pct}%` }} />
                          </div>
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
                      {eventLoading ? 'Cargando eventos...' : 'No hay eventos registrados aun. Los eventos se registraran automaticamente cuando los usuarios interactuen con tu pagina.'}
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
            <span className="vs-realtime-indicator">
              <span className="vs-pulse" /> Actualizando cada 10 segundos
            </span>
            {realtimeLoading && <span className="vs-loading-inline"><div className="vs-spinner-sm" /></span>}
          </div>

          {realtimeData && (
            <>
              {/* Big realtime number */}
              <div className="vs-realtime-hero">
                <div className="vs-realtime-number">{realtimeData.activeUsers}</div>
                <div className="vs-realtime-label">Usuarios activos ahora</div>
                <div className="vs-realtime-sub">En los ultimos 5 minutos</div>
              </div>

              {/* Active pages */}
              {realtimeData.activeByPage.length > 0 && (
                <div className="vs-chart-card full">
                  <h4 className="vs-chart-title"><FaRoute /> Paginas activas ahora</h4>
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

              {/* Active sessions */}
              {realtimeData.activeSessions.length > 0 && (
                <div className="vs-chart-card full">
                  <h4 className="vs-chart-title"><FaUsers /> Sesiones activas</h4>
                  <div className="vs-table-wrap">
                    <table className="vs-table">
                      <thead>
                        <tr>
                          <th>Sesion</th>
                          <th>Pagina actual</th>
                          <th>Dispositivo</th>
                          <th>Eventos</th>
                          <th>Ultima actividad</th>
                        </tr>
                      </thead>
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

              {/* Recent events live feed */}
              <div className="vs-chart-card full">
                <h4 className="vs-chart-title"><FaBolt /> Actividad reciente (30 min)</h4>
                <div className="vs-event-live-feed">
                  {realtimeData.recentEvents.length === 0 ? (
                    <p className="vs-empty-text">Sin actividad reciente</p>
                  ) : realtimeData.recentEvents.map(ev => (
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

          {!realtimeData && !realtimeLoading && (
            <div className="vs-empty-state">
              <FaBolt className="vs-empty-icon" />
              <p>No hay datos en tiempo real disponibles</p>
            </div>
          )}
        </>
      )}

      {/* ═══ EVOLUCION TAB ═══ */}
      {activeTab === 'evolucion' && (
        <>
          {/* 30-day timeline */}
          <div className="vs-chart-card full">
            <h4 className="vs-chart-title">Visitas por dia (ultimos 30 dias)</h4>
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

          {/* Hourly distribution */}
          <div className="vs-chart-card full">
            <h4 className="vs-chart-title"><FaClock /> Distribucion por hora del dia</h4>
            <div className="vs-hourly-chart">
              {stats.hourly.map(h => (
                <div key={h.hour} className="vs-hr-col" title={`${h.hour}:00 - ${h.count} visitas`}>
                  <span className="vs-hr-val">{h.count > 0 ? h.count : ''}</span>
                  <div className="vs-hr-bar" style={{ height: `${Math.max(2, (h.count / maxHourly) * 100)}%` }} />
                  <span className="vs-hr-label">{h.hour % 3 === 0 ? `${h.hour}h` : ''}</span>
                </div>
              ))}
            </div>
          </div>
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
              <thead>
                <tr>
                  <th>Visitante</th>
                  <th>Ubicacion</th>
                  <th>Ruta</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pagedVisits.length === 0 ? (
                  <tr><td colSpan={4} className="vs-empty-row">No se encontraron visitas</td></tr>
                ) : pagedVisits.map(v => {
                  const device = getDeviceType(v.userAgent);
                  const city = v.geoLocation?.city || 'N/A';
                  const country = v.geoLocation?.country || 'N/A';
                  return (
                    <tr key={v._id} className="vs-clickable-row" onClick={() => setSelectedVisit(v)}>
                      <td>
                        <div className="vs-cell-visitor">
                          <div className="vs-visitor-icon">
                            {device === 'mobile' ? <FaMobileAlt /> : <FaDesktop />}
                          </div>
                          <div>
                            <span className="vs-visitor-ip">{v.ip}</span>
                            <span className="vs-visitor-ua">{(v.userAgent || '').substring(0, 40)}...</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="vs-location">{city}, {country}</span>
                      </td>
                      <td><span className="vs-path">{v.path || '/'}</span></td>
                      <td>
                        <div className="vs-date-group">
                          <span className="vs-date">{fmtDate(v.createdAt)}</span>
                          <span className="vs-time">{fmtTime(v.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

export default ManageVisits;
