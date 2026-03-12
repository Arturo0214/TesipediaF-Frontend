import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import {
  FaHubspot, FaDollarSign, FaUsers, FaChartLine, FaSearch,
  FaEnvelope, FaPhone, FaBuilding, FaSyncAlt, FaCalendarAlt,
  FaArrowUp, FaArrowDown, FaPercentage, FaTrophy, FaTimesCircle,
  FaUserPlus, FaMoneyBillWave, FaChartBar, FaExchangeAlt,
} from 'react-icons/fa';
import { fetchHubspotSummary, fetchHubspotContacts, fetchHubspotDeals } from '../../../features/hubspot/hubspotSlice';
import './AdminHubSpot.css';

const AdminHubSpot = () => {
  const dispatch = useDispatch();
  const { summary, contacts: rawContacts, deals: rawDeals, loading, error } = useSelector(state => state.hubspot);
  const { isAuthenticated, isAdmin } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [contactSearch, setContactSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      dispatch(fetchHubspotSummary());
      dispatch(fetchHubspotContacts({ limit: 100 }));
      dispatch(fetchHubspotDeals({ limit: 100 }));
    }
  }, [dispatch, isAuthenticated, isAdmin]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchHubspotSummary()),
      dispatch(fetchHubspotContacts({ limit: 100 })),
      dispatch(fetchHubspotDeals({ limit: 100 })),
    ]);
    setRefreshing(false);
  };

  const kpis = summary?.kpis || {};
  const charts = summary?.charts || {};
  const dealData = summary?.deals || {};
  const contactData = summary?.contacts || {};
  const pipelinesData = summary?.pipelines || [];

  const filteredContacts = useMemo(() => {
    let list = [...(rawContacts || [])];
    if (contactSearch) {
      const s = contactSearch.toLowerCase();
      list = list.filter(c => {
        const p = c.properties || {};
        const name = `${p.firstname || ''} ${p.lastname || ''}`.toLowerCase();
        return name.includes(s) || (p.email || '').toLowerCase().includes(s) || (p.company || '').toLowerCase().includes(s);
      });
    }
    return list.sort((a, b) => new Date(b.properties?.createdate || 0) - new Date(a.properties?.createdate || 0));
  }, [rawContacts, contactSearch]);

  const filteredDeals = useMemo(() => {
    return [...(rawDeals || [])].sort((a, b) => new Date(b.properties?.createdate || 0) - new Date(a.properties?.createdate || 0));
  }, [rawDeals]);

  const fmt = (n) => `$${(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : '-';

  const getStageLabel = (stageId) => {
    for (const p of pipelinesData) {
      const stage = p.stages?.find(s => s.id === stageId);
      if (stage) return stage.label;
    }
    return stageId;
  };

  const lifecycleLabels = {
    subscriber: 'Suscriptor', lead: 'Lead', marketingqualifiedlead: 'MQL',
    salesqualifiedlead: 'SQL', opportunity: 'Oportunidad', customer: 'Cliente',
    evangelist: 'Evangelista', other: 'Otro', unknown: 'Sin clasificar',
  };

  const lifecycleColors = {
    subscriber: '#6b7280', lead: '#f59e0b', marketingqualifiedlead: '#8b5cf6',
    salesqualifiedlead: '#3b82f6', opportunity: '#10b981', customer: '#059669',
    evangelist: '#ec4899', other: '#9ca3af', unknown: '#d1d5db',
  };

  // Bar chart max for scaling
  const maxWeekly = Math.max(...(charts.weeklyContacts || []).map(w => w.count), 1);
  const maxMonthlyRev = Math.max(...(charts.monthlyRevenue || []).map(m => m.revenue), 1);

  if (loading && !summary) {
    return <div className="hs"><div className="hs-loading"><Spinner animation="border" size="sm" /> Conectando con HubSpot...</div></div>;
  }

  if (error) {
    return (
      <div className="hs">
        <div className="hs-error">
          <FaHubspot className="hs-error-icon" />
          <p>Error al conectar con HubSpot</p>
          <span>{error}</span>
          <button className="hs-retry-btn" onClick={handleRefresh}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="hs">
      {/* Header */}
      <div className="hs-header">
        <div className="hs-header-left">
          <FaHubspot className="hs-logo" />
          <div>
            <h2 className="hs-title">HubSpot CRM</h2>
            <span className="hs-subtitle">{kpis.totalContacts || 0} contactos · {kpis.totalDeals || 0} deals</span>
          </div>
        </div>
        <button className={`hs-refresh ${refreshing ? 'hs-spinning' : ''}`} onClick={handleRefresh} disabled={refreshing}>
          <FaSyncAlt /> Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="hs-nav">
        {['overview', 'contacts', 'deals'].map(tab => (
          <button key={tab} className={`hs-nav-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'overview' && <><FaChartBar /> Resumen</>}
            {tab === 'contacts' && <><FaUsers /> Contactos ({kpis.totalContacts || 0})</>}
            {tab === 'deals' && <><FaDollarSign /> Deals ({kpis.totalDeals || 0})</>}
          </button>
        ))}
      </div>

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Row 1: Revenue & Deals */}
          <div className="hs-kpi-grid">
            <div className="hs-kpi">
              <div className="hs-kpi-top">
                <span className="hs-kpi-icon green"><FaDollarSign /></span>
                <GrowthBadge value={kpis.revenueGrowth} />
              </div>
              <div className="hs-kpi-value">{fmt(kpis.totalRevenue)}</div>
              <div className="hs-kpi-label">Ingreso total</div>
              <div className="hs-kpi-sub">{fmt(kpis.revenueThisMonth)} este mes</div>
            </div>

            <div className="hs-kpi">
              <div className="hs-kpi-top">
                <span className="hs-kpi-icon blue"><FaChartLine /></span>
                <span className="hs-kpi-badge neutral">Promedio: {fmt(kpis.avgDealSize)}</span>
              </div>
              <div className="hs-kpi-value">{kpis.totalDeals || 0}</div>
              <div className="hs-kpi-label">Deals totales</div>
              <div className="hs-kpi-sub">+{kpis.dealsThisMonth || 0} este mes</div>
            </div>

            <div className="hs-kpi">
              <div className="hs-kpi-top">
                <span className="hs-kpi-icon purple"><FaUsers /></span>
                <GrowthBadge value={kpis.contactGrowth} />
              </div>
              <div className="hs-kpi-value">{kpis.totalContacts || 0}</div>
              <div className="hs-kpi-label">Contactos</div>
              <div className="hs-kpi-sub">+{kpis.contactsThisMonth || 0} este mes · {kpis.contactsThisWeek || 0} esta semana</div>
            </div>

            <div className="hs-kpi">
              <div className="hs-kpi-top">
                <span className="hs-kpi-icon orange"><FaExchangeAlt /></span>
              </div>
              <div className="hs-kpi-value">{kpis.conversionRate || 0}%</div>
              <div className="hs-kpi-label">Tasa de conversión</div>
              <div className="hs-kpi-sub">{kpis.customersCount || 0} clientes de {kpis.totalContacts || 0} leads</div>
            </div>
          </div>

          {/* KPI Row 2: Win/Loss */}
          <div className="hs-kpi-row-small">
            <div className="hs-kpi-mini won">
              <FaTrophy />
              <div>
                <span className="hs-kpi-mini-val">{kpis.dealsWon || 0}</span>
                <span className="hs-kpi-mini-label">Deals ganados</span>
              </div>
              <span className="hs-kpi-mini-amt">{fmt(kpis.totalRevenue)}</span>
            </div>
            <div className="hs-kpi-mini lost">
              <FaTimesCircle />
              <div>
                <span className="hs-kpi-mini-val">{kpis.dealsLost || 0}</span>
                <span className="hs-kpi-mini-label">Deals perdidos</span>
              </div>
            </div>
            <div className="hs-kpi-mini rate">
              <FaPercentage />
              <div>
                <span className="hs-kpi-mini-val">{kpis.winRate || 0}%</span>
                <span className="hs-kpi-mini-label">Win rate</span>
              </div>
            </div>
            <div className="hs-kpi-mini new-contacts">
              <FaUserPlus />
              <div>
                <span className="hs-kpi-mini-val">{kpis.contactsThisWeek || 0}</span>
                <span className="hs-kpi-mini-label">Nuevos esta semana</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="hs-charts-row">
            {/* Weekly contacts */}
            <div className="hs-chart-card">
              <h4 className="hs-chart-title">Contactos por semana</h4>
              <div className="hs-bar-chart">
                {(charts.weeklyContacts || []).map((w, i) => (
                  <div key={i} className="hs-bar-col">
                    <span className="hs-bar-val">{w.count}</span>
                    <div className="hs-bar" style={{ height: `${Math.max(4, (w.count / maxWeekly) * 100)}%` }} />
                    <span className="hs-bar-label">{w.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly revenue */}
            <div className="hs-chart-card">
              <h4 className="hs-chart-title">Ingresos mensuales</h4>
              <div className="hs-bar-chart">
                {(charts.monthlyRevenue || []).map((m, i) => (
                  <div key={i} className="hs-bar-col">
                    <span className="hs-bar-val">{m.revenue > 0 ? fmt(m.revenue) : '—'}</span>
                    <div className="hs-bar revenue" style={{ height: `${Math.max(4, (m.revenue / maxMonthlyRev) * 100)}%` }} />
                    <span className="hs-bar-label">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lifecycle funnel */}
          {Object.keys(contactData.byLifecycle || {}).length > 0 && (
            <div className="hs-funnel-card">
              <h4 className="hs-chart-title">Embudo de contactos</h4>
              <div className="hs-funnel">
                {Object.entries(contactData.byLifecycle)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, count]) => {
                    const pct = kpis.totalContacts > 0 ? Math.round((count / kpis.totalContacts) * 100) : 0;
                    return (
                      <div key={key} className="hs-funnel-row">
                        <span className="hs-funnel-label" style={{ color: lifecycleColors[key] || '#6b7280' }}>
                          {lifecycleLabels[key] || key}
                        </span>
                        <div className="hs-funnel-bar-bg">
                          <div className="hs-funnel-bar-fill" style={{ width: `${pct}%`, background: lifecycleColors[key] || '#6b7280' }} />
                        </div>
                        <span className="hs-funnel-count">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Pipeline stages */}
          {Object.keys(dealData.byStage || {}).length > 0 && (
            <div className="hs-funnel-card">
              <h4 className="hs-chart-title">Pipeline de Deals</h4>
              <div className="hs-funnel">
                {Object.entries(dealData.byStage)
                  .sort(([, a], [, b]) => (b.amount || 0) - (a.amount || 0))
                  .map(([stageId, data]) => {
                    const pct = kpis.totalRevenue > 0 ? Math.round((data.amount / kpis.totalRevenue) * 100) : 0;
                    return (
                      <div key={stageId} className="hs-funnel-row">
                        <span className="hs-funnel-label">{data.label || stageId}</span>
                        <div className="hs-funnel-bar-bg">
                          <div className="hs-funnel-bar-fill" style={{ width: `${pct}%`, background: '#ff7a59' }} />
                        </div>
                        <span className="hs-funnel-count">{data.count} · {fmt(data.amount)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Recent contacts */}
          {(contactData.recent || []).length > 0 && (
            <div className="hs-recent-card">
              <h4 className="hs-chart-title">Contactos recientes</h4>
              <div className="hs-recent-list">
                {contactData.recent.map(c => (
                  <div key={c.id} className="hs-recent-item">
                    <div className="hs-avatar" style={{ background: lifecycleColors[c.lifecycle] || '#6b7280' }}>
                      {(c.name || 'S')[0].toUpperCase()}
                    </div>
                    <div className="hs-recent-info">
                      <span className="hs-recent-name">{c.name}</span>
                      {c.email && <span className="hs-recent-detail">{c.email}</span>}
                    </div>
                    <span className="hs-recent-badge" style={{ color: lifecycleColors[c.lifecycle] || '#6b7280' }}>
                      {lifecycleLabels[c.lifecycle] || c.lifecycle}
                    </span>
                    <span className="hs-recent-date">{fmtDate(c.created)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════ CONTACTS TAB ═══════════════ */}
      {activeTab === 'contacts' && (
        <>
          <div className="hs-toolbar">
            <div className="hs-search">
              <FaSearch className="hs-search-icon" />
              <input type="text" placeholder="Buscar por nombre, email, empresa..." value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)} />
            </div>
          </div>
          <div className="hs-table-wrap">
            <table className="hs-table">
              <thead>
                <tr>
                  <th>Contacto</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Empresa</th>
                  <th>Etapa</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr><td colSpan={6} className="hs-empty-row">No se encontraron contactos</td></tr>
                ) : filteredContacts.map(c => {
                  const p = c.properties || {};
                  const name = `${p.firstname || ''} ${p.lastname || ''}`.trim() || 'Sin nombre';
                  const lc = p.lifecyclestage || 'unknown';
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="hs-cell-name">
                          <div className="hs-avatar-sm" style={{ background: lifecycleColors[lc] || '#6b7280' }}>
                            {(p.firstname || 'S')[0].toUpperCase()}
                          </div>
                          {name}
                        </div>
                      </td>
                      <td>{p.email || '—'}</td>
                      <td>{p.phone || '—'}</td>
                      <td>{p.company || '—'}</td>
                      <td>
                        <span className="hs-lifecycle-tag" style={{ background: `${lifecycleColors[lc]}18`, color: lifecycleColors[lc] }}>
                          {lifecycleLabels[lc] || lc}
                        </span>
                      </td>
                      <td className="hs-date-cell">{fmtDate(p.createdate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ═══════════════ DEALS TAB ═══════════════ */}
      {activeTab === 'deals' && (
        <>
          {filteredDeals.length === 0 ? (
            <div className="hs-empty-state">
              <FaMoneyBillWave className="hs-empty-icon" />
              <p>No hay deals registrados en HubSpot</p>
              <span>Los deals se crearán automáticamente cuando se confirmen pagos</span>
            </div>
          ) : (
            <div className="hs-table-wrap">
              <table className="hs-table">
                <thead>
                  <tr>
                    <th>Deal</th>
                    <th>Monto</th>
                    <th>Etapa</th>
                    <th>Creado</th>
                    <th>Cierre</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map(d => {
                    const p = d.properties || {};
                    const stageLabel = getStageLabel(p.dealstage);
                    const isWon = p.dealstage === 'closedwon';
                    const isLost = p.dealstage === 'closedlost';
                    return (
                      <tr key={d.id}>
                        <td className="hs-deal-name-cell">{p.dealname || 'Sin nombre'}</td>
                        <td className="hs-amount-cell">{fmt(parseFloat(p.amount) || 0)}</td>
                        <td>
                          <span className={`hs-stage-tag ${isWon ? 'won' : isLost ? 'lost' : ''}`}>
                            {stageLabel}
                          </span>
                        </td>
                        <td className="hs-date-cell">{fmtDate(p.createdate)}</td>
                        <td className="hs-date-cell">{fmtDate(p.closedate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* Small helper component */
const GrowthBadge = ({ value }) => {
  if (value === undefined || value === null) return null;
  const positive = value >= 0;
  return (
    <span className={`hs-kpi-badge ${positive ? 'up' : 'down'}`}>
      {positive ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(value)}%
    </span>
  );
};

export default AdminHubSpot;
