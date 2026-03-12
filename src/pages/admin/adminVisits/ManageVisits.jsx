import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVisits, clearError } from '../../../features/visits/visitsSlice';
import {
  FaGlobe, FaMapMarkerAlt, FaSearch, FaEye, FaTimes,
  FaSyncAlt, FaChartLine, FaCalendarAlt, FaClock,
  FaDesktop, FaMobileAlt, FaArrowUp, FaArrowDown,
  FaBuilding, FaWifi, FaRoute,
} from 'react-icons/fa';
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

  useEffect(() => {
    dispatch(getVisits());
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(getVisits());
    setRefreshing(false);
  };

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
        {['resumen', 'evolucion', 'registro'].map(tab => (
          <button key={tab} className={`vs-nav-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setPage(1); }}>
            {tab === 'resumen' && <><FaChartLine /> Resumen</>}
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

const GrowthBadge = ({ value }) => {
  if (value === undefined || value === null) return null;
  const positive = value >= 0;
  return (
    <span className={`vs-badge ${positive ? 'up' : 'down'}`}>
      {positive ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(value)}%
    </span>
  );
};

export default ManageVisits;
