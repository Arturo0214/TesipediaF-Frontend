import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import {
  FaHubspot, FaDollarSign, FaUsers, FaChartLine,
  FaSearch, FaEnvelope, FaPhone, FaBuilding,
  FaSortAmountDown, FaSortAmountUp, FaCalendarAlt,
  FaArrowUp, FaArrowDown, FaSyncAlt, FaExternalLinkAlt,
} from 'react-icons/fa';
import { fetchHubspotSummary, fetchHubspotContacts, fetchHubspotDeals } from '../../../features/hubspot/hubspotSlice';
import './AdminHubSpot.css';

const AdminHubSpot = () => {
  const dispatch = useDispatch();
  const { summary, contacts: rawContacts, deals: rawDeals, loading, error } = useSelector(state => state.hubspot);
  const { isAuthenticated, isAdmin } = useSelector(state => state.auth);

  const [contactSearch, setContactSearch] = useState('');
  const [contactSort, setContactSort] = useState('date-desc');
  const [lifecycleFilter, setLifecycleFilter] = useState('all');
  const [dealSearch, setDealSearch] = useState('');
  const [activeView, setActiveView] = useState('contacts'); // 'contacts' | 'deals'
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

  // Metrics from summary
  const metrics = useMemo(() => {
    if (!summary) return null;
    const d = summary.deals || {};
    const c = summary.contacts || {};
    return {
      totalDeals: d.total || 0,
      totalRevenue: d.totalRevenue || 0,
      dealsThisMonth: d.dealsThisMonth || 0,
      revenueThisMonth: d.revenueThisMonth || 0,
      totalContacts: c.total || 0,
      contactsThisMonth: c.contactsThisMonth || 0,
      byStage: d.byStage || {},
      byLifecycle: c.byLifecycle || {},
      recentDeals: d.recent || [],
      recentContacts: c.recent || [],
      pipelines: summary.pipelines || [],
    };
  }, [summary]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    let list = [...(rawContacts || [])];
    if (contactSearch) {
      const s = contactSearch.toLowerCase();
      list = list.filter(c => {
        const p = c.properties || {};
        const name = `${p.firstname || ''} ${p.lastname || ''}`.toLowerCase();
        return name.includes(s) || (p.email || '').toLowerCase().includes(s) || (p.phone || '').includes(s) || (p.company || '').toLowerCase().includes(s);
      });
    }
    if (lifecycleFilter !== 'all') {
      list = list.filter(c => (c.properties?.lifecyclestage || 'unknown') === lifecycleFilter);
    }
    switch (contactSort) {
      case 'date-desc': list.sort((a, b) => new Date(b.properties?.createdate || 0) - new Date(a.properties?.createdate || 0)); break;
      case 'date-asc': list.sort((a, b) => new Date(a.properties?.createdate || 0) - new Date(b.properties?.createdate || 0)); break;
      case 'name-asc': list.sort((a, b) => (`${a.properties?.firstname || ''} ${a.properties?.lastname || ''}`).localeCompare(`${b.properties?.firstname || ''} ${b.properties?.lastname || ''}`)); break;
      default: break;
    }
    return list;
  }, [rawContacts, contactSearch, lifecycleFilter, contactSort]);

  // Filtered deals
  const filteredDeals = useMemo(() => {
    let list = [...(rawDeals || [])];
    if (dealSearch) {
      const s = dealSearch.toLowerCase();
      list = list.filter(d => (d.properties?.dealname || '').toLowerCase().includes(s));
    }
    list.sort((a, b) => new Date(b.properties?.createdate || 0) - new Date(a.properties?.createdate || 0));
    return list;
  }, [rawDeals, dealSearch]);

  const formatCurrency = (n) => `$${(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : '-';

  const lifecycleLabels = {
    subscriber: 'Suscriptor',
    lead: 'Lead',
    marketingqualifiedlead: 'MQL',
    salesqualifiedlead: 'SQL',
    opportunity: 'Oportunidad',
    customer: 'Cliente',
    evangelist: 'Evangelista',
    other: 'Otro',
    unknown: 'Sin clasificar',
  };

  const lifecycleColors = {
    subscriber: '#6b7280',
    lead: '#f59e0b',
    marketingqualifiedlead: '#8b5cf6',
    salesqualifiedlead: '#3b82f6',
    opportunity: '#10b981',
    customer: '#059669',
    evangelist: '#ec4899',
    other: '#9ca3af',
    unknown: '#d1d5db',
  };

  // Stage label resolver
  const getStageLabel = (stageId) => {
    if (!metrics?.pipelines?.length) return stageId;
    for (const p of metrics.pipelines) {
      const stage = p.stages?.find(s => s.id === stageId);
      if (stage) return stage.label;
    }
    return stageId;
  };

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
            <span className="hs-subtitle">{metrics?.totalContacts || 0} contactos · {metrics?.totalDeals || 0} deals</span>
          </div>
        </div>
        <button className={`hs-refresh ${refreshing ? 'hs-spinning' : ''}`} onClick={handleRefresh} disabled={refreshing}>
          <FaSyncAlt /> Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="hs-kpis">
          <div className="hs-kpi hs-kpi-revenue">
            <div className="hs-kpi-icon"><FaDollarSign /></div>
            <div className="hs-kpi-data">
              <span className="hs-kpi-value">{formatCurrency(metrics.totalRevenue)}</span>
              <span className="hs-kpi-label">Ingreso total</span>
            </div>
            <div className="hs-kpi-badge">
              <FaArrowUp /> {formatCurrency(metrics.revenueThisMonth)} este mes
            </div>
          </div>
          <div className="hs-kpi hs-kpi-deals">
            <div className="hs-kpi-icon"><FaChartLine /></div>
            <div className="hs-kpi-data">
              <span className="hs-kpi-value">{metrics.totalDeals}</span>
              <span className="hs-kpi-label">Deals totales</span>
            </div>
            <div className="hs-kpi-badge">
              +{metrics.dealsThisMonth} este mes
            </div>
          </div>
          <div className="hs-kpi hs-kpi-contacts">
            <div className="hs-kpi-icon"><FaUsers /></div>
            <div className="hs-kpi-data">
              <span className="hs-kpi-value">{metrics.totalContacts}</span>
              <span className="hs-kpi-label">Contactos</span>
            </div>
            <div className="hs-kpi-badge">
              +{metrics.contactsThisMonth} este mes
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Stages */}
      {metrics && Object.keys(metrics.byStage).length > 0 && (
        <div className="hs-pipeline-section">
          <h3 className="hs-section-title">Pipeline de Deals</h3>
          <div className="hs-pipeline">
            {Object.entries(metrics.byStage)
              .sort(([, a], [, b]) => (b.amount || 0) - (a.amount || 0))
              .map(([stageId, data]) => (
                <div key={stageId} className="hs-stage">
                  <div className="hs-stage-header">
                    <span className="hs-stage-name">{data.label || stageId}</span>
                    <span className="hs-stage-count">{data.count}</span>
                  </div>
                  <div className="hs-stage-bar">
                    <div className="hs-stage-fill" style={{
                      width: `${Math.min(100, (data.amount / (metrics.totalRevenue || 1)) * 100)}%`
                    }} />
                  </div>
                  <span className="hs-stage-amount">{formatCurrency(data.amount)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Lifecycle Distribution */}
      {metrics && Object.keys(metrics.byLifecycle).length > 0 && (
        <div className="hs-lifecycle-section">
          <h3 className="hs-section-title">Contactos por Etapa</h3>
          <div className="hs-lifecycle-pills">
            {Object.entries(metrics.byLifecycle)
              .sort(([, a], [, b]) => b - a)
              .map(([key, count]) => (
                <button key={key}
                  className={`hs-lc-pill ${lifecycleFilter === key ? 'hs-lc-active' : ''}`}
                  style={{ '--lc-color': lifecycleColors[key] || '#6b7280' }}
                  onClick={() => { setLifecycleFilter(lifecycleFilter === key ? 'all' : key); }}>
                  <span className="hs-lc-dot" style={{ background: lifecycleColors[key] || '#6b7280' }} />
                  {lifecycleLabels[key] || key}
                  <span className="hs-lc-count">{count}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Tab Switch: Contacts / Deals */}
      <div className="hs-tabs">
        <button className={`hs-tab ${activeView === 'contacts' ? 'hs-tab-active' : ''}`}
          onClick={() => setActiveView('contacts')}>
          <FaUsers /> Contactos ({filteredContacts.length})
        </button>
        <button className={`hs-tab ${activeView === 'deals' ? 'hs-tab-active' : ''}`}
          onClick={() => setActiveView('deals')}>
          <FaChartLine /> Deals ({filteredDeals.length})
        </button>
      </div>

      {/* Contacts View */}
      {activeView === 'contacts' && (
        <>
          <div className="hs-toolbar">
            <div className="hs-search">
              <FaSearch className="hs-search-icon" />
              <input type="text" placeholder="Buscar contacto por nombre, email, empresa..." value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)} />
            </div>
            <div className="hs-sort-group">
              <button className={`hs-sort-btn ${contactSort === 'date-desc' ? 'active' : ''}`}
                onClick={() => setContactSort(contactSort === 'date-desc' ? 'date-asc' : 'date-desc')}>
                {contactSort === 'date-asc' ? <FaSortAmountUp /> : <FaSortAmountDown />} Fecha
              </button>
              <button className={`hs-sort-btn ${contactSort === 'name-asc' ? 'active' : ''}`}
                onClick={() => setContactSort('name-asc')}>
                A-Z
              </button>
            </div>
          </div>

          <div className="hs-contacts-grid">
            {filteredContacts.length === 0 ? (
              <div className="hs-empty">No se encontraron contactos</div>
            ) : filteredContacts.map(contact => {
              const p = contact.properties || {};
              const name = `${p.firstname || ''} ${p.lastname || ''}`.trim() || 'Sin nombre';
              const lc = p.lifecyclestage || 'unknown';
              return (
                <div key={contact.id} className="hs-contact-card">
                  <div className="hs-contact-avatar" style={{ background: lifecycleColors[lc] || '#6b7280' }}>
                    {(p.firstname || 'S')[0].toUpperCase()}{(p.lastname || 'N')[0].toUpperCase()}
                  </div>
                  <div className="hs-contact-info">
                    <div className="hs-contact-name">{name}</div>
                    {p.email && <div className="hs-contact-row"><FaEnvelope /> {p.email}</div>}
                    {p.phone && <div className="hs-contact-row"><FaPhone /> {p.phone}</div>}
                    {p.company && <div className="hs-contact-row"><FaBuilding /> {p.company}</div>}
                    <div className="hs-contact-bottom">
                      <span className="hs-lc-badge" style={{ background: `${lifecycleColors[lc] || '#6b7280'}18`, color: lifecycleColors[lc] || '#6b7280' }}>
                        {lifecycleLabels[lc] || lc}
                      </span>
                      {p.hs_lead_status && <span className="hs-lead-status">{p.hs_lead_status}</span>}
                      <span className="hs-contact-date"><FaCalendarAlt /> {formatDate(p.createdate)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Deals View */}
      {activeView === 'deals' && (
        <>
          <div className="hs-toolbar">
            <div className="hs-search">
              <FaSearch className="hs-search-icon" />
              <input type="text" placeholder="Buscar deal..." value={dealSearch}
                onChange={(e) => setDealSearch(e.target.value)} />
            </div>
          </div>

          <div className="hs-deals-grid">
            {filteredDeals.length === 0 ? (
              <div className="hs-empty">No se encontraron deals</div>
            ) : filteredDeals.map(deal => {
              const p = deal.properties || {};
              return (
                <div key={deal.id} className="hs-deal-card">
                  <div className="hs-deal-top">
                    <span className="hs-deal-name">{p.dealname || 'Sin nombre'}</span>
                    <span className="hs-deal-amount">{formatCurrency(parseFloat(p.amount) || 0)}</span>
                  </div>
                  <div className="hs-deal-meta">
                    <span className="hs-deal-stage">{getStageLabel(p.dealstage)}</span>
                    <span className="hs-deal-date"><FaCalendarAlt /> {formatDate(p.createdate)}</span>
                    {p.closedate && <span className="hs-deal-close">Cierre: {formatDate(p.closedate)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHubSpot;
