import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Spinner } from 'react-bootstrap';
import {
  FaFilter, FaWhatsapp, FaRocket, FaUsers, FaExclamationTriangle,
  FaSync, FaChartBar, FaArrowRight, FaDollarSign, FaBan, FaClock,
  FaUserTie, FaUser, FaChevronDown, FaChevronUp, FaPhone,
  FaEnvelope, FaGraduationCap, FaFileAlt, FaTimes, FaCheckCircle,
  FaTimesCircle, FaArrowDown, FaArrowUp, FaEye, FaColumns,
  FaThLarge, FaList, FaSearch,
} from 'react-icons/fa';
import { getLeadsStats, getLeads, updateLeadEstado } from '../../../services/whatsapp/supabaseWhatsApp';
import { toast } from 'react-hot-toast';
import './AdminFunnel.css';

/* ── Constants ── */
const ESTADO_CONFIG = {
  bienvenida:            { label: 'Bienvenida',           color: '#94a3b8', icon: '👋', order: 0 },
  calificando:           { label: 'Calificando',          color: '#3b82f6', icon: '🔍', order: 1 },
  cotizando:             { label: 'Cotizando',            color: '#8b5cf6', icon: '📝', order: 2 },
  cotizacion_lista:      { label: 'Cotización lista',     color: '#a855f7', icon: '📋', order: 3 },
  cotizacion_enviada:    { label: 'Cotización enviada',   color: '#f59e0b', icon: '📤', order: 4 },
  cotizacion_confirmada: { label: 'Cotización confirmada',color: '#22c55e', icon: '✅', order: 5 },
  esperando_aprobacion:  { label: 'Esperando aprobación', color: '#06b6d4', icon: '⏳', order: 6 },
  cliente_acepto:        { label: 'Cliente aceptó',       color: '#10b981', icon: '🤝', order: 7 },
  pagado:                { label: 'Pagado',               color: '#059669', icon: '💰', order: 8 },
  descartado:            { label: 'Descartado',           color: '#ef4444', icon: '❌', order: 90 },
  no_interesado:         { label: 'No interesado',        color: '#6b7280', icon: '🚫', order: 91 },
};

const PIPELINE_ESTADOS = [
  'bienvenida', 'calificando', 'cotizando', 'cotizacion_lista',
  'cotizacion_enviada', 'cotizacion_confirmada', 'esperando_aprobacion',
  'cliente_acepto', 'pagado',
];

const LOST_ESTADOS = ['descartado', 'no_interesado'];

const ADMIN_COLORS = {
  arturo: { color: '#f59e0b', bg: '#fef3c7', label: 'Arturo' },
  sandy:  { color: '#9b8afb', bg: '#ede9fe', label: 'Sandy' },
  hugo:   { color: '#3b82f6', bg: '#dbeafe', label: 'Hugo' },
};

const SERVICIO_LABEL = {
  servicio_1: 'Redacción', servicio_2: 'Correcciones', servicio_3: 'Asesoría',
};
const NIVEL_MAP = {
  nivel_1: 'Prepa', nivel_2: 'Lic.', nivel_3: 'Mtría.',
  nivel_4: 'Esp.', nivel_5: 'Dipl.', nivel_6: 'Doc.',
};

function normalizeAdmin(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  if (lower.includes('arturo')) return 'arturo';
  if (lower.includes('sandy')) return 'sandy';
  if (lower.includes('hugo')) return 'hugo';
  return lower.split(' ')[0];
}

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mes`;
}

/* ═══════════════════════════════════════════════
   CRM Dashboard Component
   ═══════════════════════════════════════════════ */
const AdminFunnel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [origen, setOrigen] = useState('all');
  const [allLeads, setAllLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [view, setView] = useState('kanban'); // kanban | funnel | table
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedColumns, setExpandedColumns] = useState({});
  const [selectedLead, setSelectedLead] = useState(null);
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverEstado, setDragOverEstado] = useState(null);
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [filterAd, setFilterAd] = useState('all');

  /* ── Fetch stats ── */
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeadsStats(origen);
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  }, [origen]);

  /* ── Fetch all leads for Kanban ── */
  const fetchAllLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      // Fetch leads from both origins
      const origenParam = origen === 'ads' ? 'all' : (origen === 'all' ? 'all' : origen);
      const result = await getLeads(origenParam, 500, 0, {});
      let leads = result.leads || [];
      if (origen === 'ads') leads = leads.filter(l => l.ad_source);
      setAllLeads(leads);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLeadsLoading(false);
    }
  }, [origen]);

  useEffect(() => { fetchStats(); fetchAllLeads(); }, [fetchStats, fetchAllLeads]);

  /* ── Derived data ── */
  // Unique campaigns and adsets for filter dropdowns
  const { campaigns, adsets } = useMemo(() => {
    const campSet = new Set();
    const adsetSet = new Set();
    allLeads.forEach(l => {
      if (l.ad_campaign_name) campSet.add(l.ad_campaign_name);
      if (l.ad_adset_name) adsetSet.add(l.ad_adset_name);
    });
    return { campaigns: [...campSet].sort(), adsets: [...adsetSet].sort() };
  }, [allLeads]);

  const filteredLeads = useMemo(() => {
    let result = allLeads;
    if (filterCampaign !== 'all') {
      result = result.filter(l => l.ad_campaign_name === filterCampaign);
    }
    if (filterAd !== 'all') {
      result = result.filter(l => l.ad_adset_name === filterAd);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => {
        return (l.nombre || '').toLowerCase().includes(q)
          || (l.wa_id || '').includes(q)
          || (l.tema || '').toLowerCase().includes(q)
          || (l.carrera || '').toLowerCase().includes(q);
      });
    }
    return result;
  }, [allLeads, searchQuery, filterCampaign, filterAd]);

  const leadsByEstado = useMemo(() => {
    const map = {};
    PIPELINE_ESTADOS.forEach(e => { map[e] = []; });
    LOST_ESTADOS.forEach(e => { map[e] = []; });
    map['sin_estado'] = [];

    filteredLeads.forEach(lead => {
      const estado = lead.estado_sofia || 'sin_estado';
      if (!map[estado]) map[estado] = [];
      map[estado].push(lead);
    });

    // Sort each column by updated_at desc
    Object.keys(map).forEach(k => {
      map[k].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
    });

    return map;
  }, [filteredLeads]);

  // Pipeline value estimation
  const pipelineValue = useMemo(() => {
    let total = 0;
    const CLOSING_ESTADOS = ['cotizacion_enviada', 'cotizacion_confirmada', 'esperando_aprobacion', 'cliente_acepto', 'pagado'];
    filteredLeads.forEach(l => {
      if (CLOSING_ESTADOS.includes(l.estado_sofia) && l.precio) {
        total += Number(l.precio) || 0;
      }
    });
    return total;
  }, [filteredLeads]);

  // Admin workload
  const adminWorkload = useMemo(() => {
    const map = { sinAtender: 0 };
    Object.keys(ADMIN_COLORS).forEach(k => { map[k] = 0; });
    filteredLeads.forEach(l => {
      if (!LOST_ESTADOS.includes(l.estado_sofia)) {
        const admin = normalizeAdmin(l.atendido_por);
        if (admin && map[admin] !== undefined) map[admin]++;
        else if (admin) { map[admin] = (map[admin] || 0) + 1; }
        else map.sinAtender++;
      }
    });
    return map;
  }, [filteredLeads]);

  const toggleColumnExpand = (estado) => {
    setExpandedColumns(prev => ({ ...prev, [estado]: !prev[estado] }));
  };

  // ── Drag & Drop handlers ──
  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.wa_id);
  };

  const handleDragOver = (e, estado) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverEstado !== estado) setDragOverEstado(estado);
  };

  const handleDragLeave = () => {
    setDragOverEstado(null);
  };

  const handleDrop = async (e, nuevoEstado) => {
    e.preventDefault();
    setDragOverEstado(null);
    if (!draggedLead || draggedLead.estado_sofia === nuevoEstado) {
      setDraggedLead(null);
      return;
    }
    const lead = draggedLead;
    const estadoAnterior = lead.estado_sofia;
    setDraggedLead(null);

    // Optimistic update
    setAllLeads(prev => prev.map(l =>
      l.wa_id === lead.wa_id ? { ...l, estado_sofia: nuevoEstado } : l
    ));

    try {
      await updateLeadEstado(lead.wa_id, nuevoEstado);
      const cfg = ESTADO_CONFIG[nuevoEstado];
      toast.success(`${lead.nombre || lead.wa_id} → ${cfg?.icon || ''} ${cfg?.label || nuevoEstado}`);
    } catch (err) {
      console.error('Error updating estado:', err);
      toast.error('Error al mover lead');
      // Rollback
      setAllLeads(prev => prev.map(l =>
        l.wa_id === lead.wa_id ? { ...l, estado_sofia: estadoAnterior } : l
      ));
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchAllLeads();
  };

  if (loading && !stats) {
    return (
      <div className="crm-loading">
        <Spinner animation="border" variant="primary" />
        <p>Cargando CRM...</p>
      </div>
    );
  }

  if (!stats) return <div className="crm-error">Error al cargar datos</div>;

  const { general, porEstado, porAdmin, recientes, embudo, perdidos, alertas } = stats;
  const maxFunnel = Math.max(...(embudo || []).map(e => e.value), 1);

  return (
    <div className="crm">
      {/* ═══ HEADER ═══ */}
      <div className="crm-header">
        <div className="crm-header-left">
          <FaChartBar className="crm-header-icon" />
          <h2>CRM Dashboard</h2>
        </div>
        <div className="crm-header-center">
          <div className="crm-origin-filter">
            <button className={`crm-origin-btn ${origen === 'all' ? 'active' : ''}`} onClick={() => setOrigen('all')}>
              <FaUsers size={11} /> Todos
            </button>
            <button className={`crm-origin-btn crm-origin-wa ${origen === 'regular' ? 'active' : ''}`} onClick={() => setOrigen('regular')}>
              <FaWhatsapp size={11} /> WhatsApp
            </button>
            <button className={`crm-origin-btn crm-origin-mc ${origen === 'manychat' ? 'active' : ''}`} onClick={() => setOrigen('manychat')}>
              <FaRocket size={11} /> ManyChat
            </button>
            <button className={`crm-origin-btn ${origen === 'ads' ? 'active' : ''}`} onClick={() => setOrigen('ads')} style={origen === 'ads' ? {background: '#1877f2', color: '#fff'} : {}}>
              📣 Ads
            </button>
          </div>
        </div>
        <div className="crm-header-right">
          <div className="crm-view-toggle">
            <button className={`crm-view-btn ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')} title="Kanban">
              <FaColumns size={12} />
            </button>
            <button className={`crm-view-btn ${view === 'funnel' ? 'active' : ''}`} onClick={() => setView('funnel')} title="Funnel">
              <FaFilter size={12} />
            </button>
            <button className={`crm-view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')} title="Tabla">
              <FaList size={12} />
            </button>
          </div>
          <button className="crm-refresh-btn" onClick={handleRefresh} disabled={loading || leadsLoading}>
            <FaSync className={loading || leadsLoading ? 'crm-spin' : ''} size={12} />
          </button>
        </div>
      </div>

      {/* ═══ KPI STRIP ═══ */}
      <div className="crm-kpis">
        <div className="crm-kpi">
          <div className="crm-kpi-icon" style={{ background: '#eff6ff' }}><FaUsers style={{ color: '#3b82f6' }} /></div>
          <div className="crm-kpi-data">
            <span className="crm-kpi-value">{general.total}</span>
            <span className="crm-kpi-label">Total leads</span>
          </div>
        </div>
        <div className="crm-kpi">
          <div className="crm-kpi-icon" style={{ background: '#f0fdf4' }}><FaArrowUp style={{ color: '#16a34a' }} /></div>
          <div className="crm-kpi-data">
            <span className="crm-kpi-value crm-kpi-green">{recientes.h24}</span>
            <span className="crm-kpi-label">Nuevos 24h</span>
          </div>
        </div>
        <div className="crm-kpi">
          <div className="crm-kpi-icon" style={{ background: '#faf5ff' }}><FaClock style={{ color: '#7c3aed' }} /></div>
          <div className="crm-kpi-data">
            <span className="crm-kpi-value">{recientes.d7}</span>
            <span className="crm-kpi-label">Nuevos 7d</span>
          </div>
        </div>
        <div className="crm-kpi">
          <div className="crm-kpi-icon" style={{ background: '#ecfdf5' }}><FaCheckCircle style={{ color: '#10b981' }} /></div>
          <div className="crm-kpi-data">
            <span className="crm-kpi-value crm-kpi-blue">{general.tasaConversion}%</span>
            <span className="crm-kpi-label">Conversión</span>
          </div>
        </div>
        <div className="crm-kpi">
          <div className="crm-kpi-icon" style={{ background: '#fffbeb' }}><FaDollarSign style={{ color: '#d97706' }} /></div>
          <div className="crm-kpi-data">
            <span className="crm-kpi-value crm-kpi-gold">${general.precioPromedio?.toLocaleString() || 0}</span>
            <span className="crm-kpi-label">Precio prom.</span>
          </div>
        </div>
        <div className="crm-kpi crm-kpi-highlight">
          <div className="crm-kpi-icon" style={{ background: '#f0fdf4' }}><FaDollarSign style={{ color: '#059669' }} /></div>
          <div className="crm-kpi-data">
            <span className="crm-kpi-value crm-kpi-green">${pipelineValue.toLocaleString()}</span>
            <span className="crm-kpi-label">Pipeline</span>
          </div>
        </div>
      </div>

      {/* ═══ SEARCH BAR (for kanban/table) ═══ */}
      {(view === 'kanban' || view === 'table') && (
        <div className="crm-search-bar">
          <FaSearch className="crm-search-icon" />
          <input
            type="text"
            className="crm-search-input"
            placeholder="Buscar por nombre, teléfono, tema, carrera..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="crm-search-clear" onClick={() => setSearchQuery('')}><FaTimes size={11} /></button>
          )}
          <span className="crm-search-count">{filteredLeads.length} leads</span>
        </div>
      )}

      {/* ── Campaign & Ad Filters ── */}
      {campaigns.length > 0 && (
        <div className="crm-campaign-filter">
          <label>📣 Campaña:</label>
          <select value={filterCampaign} onChange={e => { setFilterCampaign(e.target.value); setFilterAd('all'); }}>
            <option value="all">Todas</option>
            {campaigns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label style={{marginLeft: 8}}>🎯 Adset:</label>
          <select value={filterAd} onChange={e => setFilterAd(e.target.value)}>
            <option value="all">Todos</option>
            {adsets.filter(a => filterCampaign === 'all' || allLeads.some(l => l.ad_adset_name === a && l.ad_campaign_name === filterCampaign)).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {(filterCampaign !== 'all' || filterAd !== 'all') && (
            <button onClick={() => { setFilterCampaign('all'); setFilterAd('all'); }} style={{fontSize: '0.7rem', padding: '3px 8px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer', color: '#6b7280'}}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* ═══ ADMIN WORKLOAD BAR ═══ */}
      <div className="crm-workload-bar">
        <span className="crm-workload-title"><FaUserTie size={11} /> Carga de trabajo:</span>
        <div className="crm-workload-items">
          {Object.entries(adminWorkload).map(([admin, count]) => {
            if (count === 0 && admin !== 'sinAtender') return null;
            const info = ADMIN_COLORS[admin];
            const isUnattended = admin === 'sinAtender';
            return (
              <div
                key={admin}
                className={`crm-workload-chip ${isUnattended ? 'crm-workload-unattended' : ''}`}
                style={info ? { background: info.bg, color: info.color, borderColor: info.color } : {}}
              >
                <span className="crm-workload-name">{info ? info.label : isUnattended ? 'Sin atender' : admin}</span>
                <span className="crm-workload-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      {view === 'kanban' && (
        <div className="crm-kanban-wrapper">
          <div className="crm-kanban">
            {PIPELINE_ESTADOS.map(estado => {
              const config = ESTADO_CONFIG[estado];
              const leads = leadsByEstado[estado] || [];
              const isFullyExpanded = expandedColumns[estado] === true;
              const SHOW_LIMIT = 8;
              const visibleLeads = isFullyExpanded ? leads : leads.slice(0, SHOW_LIMIT);
              const hasMore = leads.length > SHOW_LIMIT;
              const colValue = leads.reduce((sum, l) => sum + (Number(l.precio) || 0), 0);
              const isDragOver = dragOverEstado === estado;

              return (
                <div
                  key={estado}
                  className={`crm-kanban-col ${isDragOver ? 'crm-kanban-col-dragover' : ''}`}
                  onDragOver={(e) => handleDragOver(e, estado)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, estado)}
                >
                  <div className="crm-kanban-header" style={{ borderTopColor: config.color }}>
                    <div className="crm-kanban-header-top">
                      <span className="crm-kanban-icon">{config.icon}</span>
                      <span className="crm-kanban-title">{config.label}</span>
                      <span className="crm-kanban-count" style={{ background: config.color }}>{leads.length}</span>
                    </div>
                    {colValue > 0 && (
                      <div className="crm-kanban-value">${colValue.toLocaleString()}</div>
                    )}
                  </div>
                  <div className="crm-kanban-cards">
                    {leads.length === 0 ? (
                      <div className="crm-kanban-empty">Sin leads</div>
                    ) : (
                      <>
                        {visibleLeads.map(lead => (
                          <LeadCard key={lead.wa_id} lead={lead} onSelect={setSelectedLead} onDragStart={handleDragStart} />
                        ))}
                        {hasMore && (
                          <button className="crm-kanban-more" onClick={() => toggleColumnExpand(estado)}>
                            {isFullyExpanded ? 'Mostrar menos' : `+${leads.length - SHOW_LIMIT} más`}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Lost column */}
            {(() => {
              const lostLeads = [...(leadsByEstado['descartado'] || []), ...(leadsByEstado['no_interesado'] || [])];
              if (lostLeads.length === 0) return null;
              const isFullyExpanded = expandedColumns['_lost'] === true;
              const visibleLost = isFullyExpanded ? lostLeads : lostLeads.slice(0, 5);
              const isDragOver = dragOverEstado === 'descartado';
              return (
                <div
                  className={`crm-kanban-col crm-kanban-col-lost ${isDragOver ? 'crm-kanban-col-dragover' : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'descartado')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'descartado')}
                >
                  <div className="crm-kanban-header" style={{ borderTopColor: '#ef4444' }}>
                    <div className="crm-kanban-header-top">
                      <span className="crm-kanban-icon">❌</span>
                      <span className="crm-kanban-title">Perdidos</span>
                      <span className="crm-kanban-count" style={{ background: '#ef4444' }}>{lostLeads.length}</span>
                    </div>
                  </div>
                  <div className="crm-kanban-cards">
                    {visibleLost.map(lead => (
                      <LeadCard key={lead.wa_id} lead={lead} onSelect={setSelectedLead} onDragStart={handleDragStart} compact />
                    ))}
                    {lostLeads.length > 5 && (
                      <button className="crm-kanban-more" onClick={() => toggleColumnExpand('_lost')}>
                        {isFullyExpanded ? 'Mostrar menos' : `+${lostLeads.length - 5} más`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {view === 'funnel' && (
        <div className="crm-funnel-view">
          {/* Visual funnel */}
          <div className="crm-funnel-card">
            <h3>Embudo de conversión</h3>
            <div className="crm-funnel">
              {(embudo || []).map((step, i) => {
                const widthPct = Math.max((step.value / maxFunnel) * 100, 6);
                const dropOff = i > 0 && embudo[i - 1].value > 0
                  ? Math.round(((embudo[i - 1].value - step.value) / embudo[i - 1].value) * 100)
                  : null;
                const convFromTop = i > 0 && embudo[0].value > 0
                  ? Math.round((step.value / embudo[0].value) * 100)
                  : 100;
                return (
                  <div key={step.etapa} className="crm-funnel-row">
                    <div className="crm-funnel-label">
                      <span className="crm-funnel-emoji">{ESTADO_CONFIG[step.etapa]?.icon || '📊'}</span>
                      <span className="crm-funnel-name">{ESTADO_CONFIG[step.etapa]?.label || step.etapa}</span>
                    </div>
                    <div className="crm-funnel-bar-area">
                      <div className="crm-funnel-bar-track">
                        <div
                          className="crm-funnel-bar"
                          style={{ width: `${widthPct}%`, background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}
                        >
                          <span className="crm-funnel-bar-count">{step.value}</span>
                        </div>
                      </div>
                      <div className="crm-funnel-metrics">
                        {dropOff !== null && dropOff > 0 && (
                          <span className="crm-funnel-dropoff"><FaArrowDown size={8} /> {dropOff}%</span>
                        )}
                        <span className="crm-funnel-conv">{convFromTop}% del total</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lost breakdown */}
          {perdidos && perdidos.length > 0 && (
            <div className="crm-lost-card">
              <h3><FaBan /> Leads perdidos</h3>
              <div className="crm-lost-grid">
                {perdidos.map(p => (
                  <div key={p.etapa} className="crm-lost-item">
                    <span className="crm-lost-value" style={{ color: p.color }}>{p.value}</span>
                    <span className="crm-lost-label">{p.etapa}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breakdowns row */}
          <div className="crm-breakdown-row">
            <div className="crm-breakdown-card">
              <h3>Desglose por estado</h3>
              <div className="crm-estado-list">
                {Object.entries(porEstado).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([estado, count]) => {
                  const cfg = ESTADO_CONFIG[estado];
                  const pct = general.total > 0 ? Math.round((count / general.total) * 100) : 0;
                  return (
                    <div key={estado} className="crm-estado-row">
                      <span className="crm-estado-dot" style={{ background: cfg?.color || '#94a3b8' }} />
                      <span className="crm-estado-name">{cfg?.label || estado.replace(/_/g, ' ')}</span>
                      <div className="crm-estado-bar-wrap">
                        <div className="crm-estado-bar" style={{ width: `${pct}%`, background: cfg?.color || '#94a3b8' }} />
                      </div>
                      <span className="crm-estado-count">{count}</span>
                      <span className="crm-estado-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="crm-breakdown-card">
              <h3>Por asignación</h3>
              <div className="crm-admin-list">
                {Object.entries(porAdmin).map(([admin, count]) => {
                  const info = ADMIN_COLORS[admin];
                  const pct = general.total > 0 ? Math.round((count / general.total) * 100) : 0;
                  return (
                    <div key={admin} className="crm-admin-row">
                      <div className="crm-admin-avatar" style={{ background: info?.bg || '#f3f4f6', color: info?.color || '#6b7280' }}>
                        <FaUserTie size={10} />
                      </div>
                      <span className="crm-admin-name">{admin === 'sinAtender' ? 'Sin atender' : info?.label || admin}</span>
                      <div className="crm-admin-bar-wrap">
                        <div className="crm-admin-bar" style={{ width: `${pct}%`, background: info?.color || '#d1d5db' }} />
                      </div>
                      <span className="crm-admin-count">{count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="crm-origin-breakdown">
                <h4>Por origen</h4>
                <div className="crm-origin-row">
                  <FaWhatsapp style={{ color: '#25d366' }} />
                  <span>WhatsApp</span>
                  <span className="crm-origin-count">{general.regular}</span>
                </div>
                <div className="crm-origin-row">
                  <FaRocket style={{ color: '#7c3aed' }} />
                  <span>ManyChat</span>
                  <span className="crm-origin-count">{general.manychat}</span>
                </div>
                <div className="crm-origin-row">
                  <span style={{fontSize: 14}}>📣</span>
                  <span>Desde Ads</span>
                  <span className="crm-origin-count">{allLeads.filter(l => l.ad_source).length}</span>
                </div>
              </div>
              {(() => {
                const adLeads = allLeads.filter(l => l.ad_source);
                if (adLeads.length === 0) return null;
                const byCampaign = {};
                adLeads.forEach(l => {
                  const camp = l.ad_campaign_name || 'Sin nombre';
                  if (!byCampaign[camp]) byCampaign[camp] = { total: 0, adsets: {} };
                  byCampaign[camp].total++;
                  const adset = l.ad_adset_name || l.ad_name || 'Sin nombre';
                  if (!byCampaign[camp].adsets[adset]) byCampaign[camp].adsets[adset] = 0;
                  byCampaign[camp].adsets[adset]++;
                });
                return (
                  <div className="crm-origin-breakdown" style={{marginTop: 8}}>
                    <h4>📣 Desglose por campaña</h4>
                    {Object.entries(byCampaign).map(([camp, info]) => (
                      <div key={camp} style={{marginBottom: 8}}>
                        <div className="crm-origin-row" style={{fontWeight: 600}}>
                          <span style={{fontSize: 12, color: '#1a73e8'}}>🎯</span>
                          <span style={{fontSize: '0.8rem', color: '#1a73e8'}}>{camp}</span>
                          <span className="crm-origin-count">{info.total}</span>
                        </div>
                        {Object.entries(info.adsets).map(([adset, count]) => (
                          <div key={adset} className="crm-origin-row" style={{paddingLeft: 20}}>
                            <span style={{fontSize: 11, color: '#9ca3af'}}>↳</span>
                            <span style={{fontSize: '0.75rem', color: '#6b7280'}}>{adset}</span>
                            <span className="crm-origin-count" style={{fontSize: '0.7rem'}}>{count}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {view === 'table' && (
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Servicio</th>
                <th>Nivel</th>
                <th>Precio</th>
                <th>Atendido por</th>
                <th>Origen</th>
                <th>Campaña</th>
                <th>Adset</th>
                <th>Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr><td colSpan={11} className="crm-table-empty">Sin leads</td></tr>
              ) : filteredLeads.slice(0, 200).map(lead => {
                const cfg = ESTADO_CONFIG[lead.estado_sofia];
                const adminKey = normalizeAdmin(lead.atendido_por);
                const adminInfo = ADMIN_COLORS[adminKey];
                return (
                  <tr key={lead.wa_id} className="crm-table-row" onClick={() => setSelectedLead(lead)}>
                    <td className="crm-table-name">{lead.nombre || 'Sin nombre'}</td>
                    <td className="crm-table-phone">+{lead.wa_id}</td>
                    <td>
                      <span className="crm-table-estado" style={{ background: cfg?.color || '#94a3b8' }}>
                        {cfg?.label || lead.estado_sofia || 'nuevo'}
                      </span>
                    </td>
                    <td className="crm-table-service">{SERVICIO_LABEL[lead.tipo_servicio] || lead.tipo_servicio || '-'}</td>
                    <td>{NIVEL_MAP[lead.nivel] || lead.nivel || '-'}</td>
                    <td className="crm-table-price">{lead.precio ? `$${Number(lead.precio).toLocaleString()}` : '-'}</td>
                    <td>
                      {lead.atendido_por ? (
                        <span className="crm-table-admin" style={{ color: adminInfo?.color || '#374151', background: adminInfo?.bg || '#f3f4f6' }}>
                          {adminInfo?.label || lead.atendido_por}
                        </span>
                      ) : (
                        <span className="crm-table-unattended">Sin atender</span>
                      )}
                    </td>
                    <td>
                      {lead.origen === 'manychat' ? (
                        <span className="crm-table-origin-mc"><FaRocket size={9} /> MC</span>
                      ) : (
                        <span className="crm-table-origin-wa"><FaWhatsapp size={9} /> WA</span>
                      )}
                    </td>
                    <td>
                      {lead.ad_campaign_name ? (
                        <span style={{fontSize: '0.7rem', background: '#e8f0fe', color: '#1a73e8', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap'}}>{lead.ad_campaign_name}</span>
                      ) : lead.ad_source ? (
                        <span style={{fontSize: '0.7rem', background: '#e8f0fe', color: '#1a73e8', padding: '2px 6px', borderRadius: 4}}>📣 Ad</span>
                      ) : (
                        <span style={{fontSize: '0.7rem', color: '#9ca3af'}}>—</span>
                      )}
                    </td>
                    <td>
                      {lead.ad_adset_name ? (
                        <span style={{fontSize: '0.7rem', color: '#6b7280'}}>{lead.ad_adset_name}</span>
                      ) : lead.ad_name ? (
                        <span style={{fontSize: '0.7rem', color: '#6b7280'}}>{lead.ad_name}</span>
                      ) : (
                        <span style={{fontSize: '0.7rem', color: '#9ca3af'}}>—</span>
                      )}
                    </td>
                    <td className="crm-table-time">{timeAgo(lead.updated_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredLeads.length > 200 && (
            <div className="crm-table-footer">Mostrando 200 de {filteredLeads.length} leads</div>
          )}
        </div>
      )}

      {/* ═══ ALERTS ═══ */}
      {alertas && alertas.length > 0 && (
        <div className="crm-alerts">
          <h3><FaExclamationTriangle /> Alertas ({alertas.length})</h3>
          <div className="crm-alerts-grid">
            {alertas.map(a => (
              <div key={a.id} className={`crm-alert crm-alert-${a.severidad}`}>
                <div className="crm-alert-left">
                  <span className="crm-alert-count">{a.count}</span>
                </div>
                <div className="crm-alert-right">
                  <span className="crm-alert-title">{a.titulo}</span>
                  <span className="crm-alert-desc">{a.descripcion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ LEAD DETAIL MODAL ═══ */}
      {selectedLead && (
        <div className="crm-modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="crm-modal" onClick={e => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h3>{selectedLead.nombre || 'Sin nombre'}</h3>
              <button className="crm-modal-close" onClick={() => setSelectedLead(null)}><FaTimes /></button>
            </div>
            <div className="crm-modal-body">
              <div className="crm-modal-grid">
                <div className="crm-modal-field">
                  <label><FaPhone size={10} /> Teléfono</label>
                  <span>+{selectedLead.wa_id}</span>
                </div>
                <div className="crm-modal-field">
                  <label>Estado</label>
                  <span className="crm-table-estado" style={{ background: ESTADO_CONFIG[selectedLead.estado_sofia]?.color || '#94a3b8' }}>
                    {ESTADO_CONFIG[selectedLead.estado_sofia]?.icon} {ESTADO_CONFIG[selectedLead.estado_sofia]?.label || selectedLead.estado_sofia}
                  </span>
                </div>
                {selectedLead.tipo_servicio && (
                  <div className="crm-modal-field">
                    <label><FaFileAlt size={10} /> Servicio</label>
                    <span>{SERVICIO_LABEL[selectedLead.tipo_servicio] || selectedLead.tipo_servicio}</span>
                  </div>
                )}
                {selectedLead.nivel && (
                  <div className="crm-modal-field">
                    <label><FaGraduationCap size={10} /> Nivel</label>
                    <span>{NIVEL_MAP[selectedLead.nivel] || selectedLead.nivel}</span>
                  </div>
                )}
                {selectedLead.carrera && (
                  <div className="crm-modal-field crm-modal-field-full">
                    <label>Carrera</label>
                    <span>{selectedLead.carrera}</span>
                  </div>
                )}
                {selectedLead.tema && (
                  <div className="crm-modal-field crm-modal-field-full">
                    <label>Tema</label>
                    <span>{selectedLead.tema}</span>
                  </div>
                )}
                {selectedLead.paginas && (
                  <div className="crm-modal-field">
                    <label>Páginas</label>
                    <span>{selectedLead.paginas}</span>
                  </div>
                )}
                {selectedLead.precio && (
                  <div className="crm-modal-field">
                    <label><FaDollarSign size={10} /> Precio</label>
                    <span className="crm-modal-price">${Number(selectedLead.precio).toLocaleString()}</span>
                  </div>
                )}
                {selectedLead.fecha_entrega && (
                  <div className="crm-modal-field">
                    <label>Fecha entrega</label>
                    <span>{selectedLead.fecha_entrega}</span>
                  </div>
                )}
                <div className="crm-modal-field">
                  <label>Atendido por</label>
                  <span>{selectedLead.atendido_por || 'Sin atender'}</span>
                </div>
                <div className="crm-modal-field">
                  <label>Origen</label>
                  <span>{selectedLead.origen === 'manychat' ? 'ManyChat' : 'WhatsApp'}</span>
                </div>
                {selectedLead.manychat_segment && (
                  <div className="crm-modal-field">
                    <label>Segmento MC</label>
                    <span>{selectedLead.manychat_segment}</span>
                  </div>
                )}
                {selectedLead.ad_source && (
                  <div className="crm-modal-field">
                    <label>📣 Campaña</label>
                    <span style={{color: '#1a73e8', fontWeight: 500}}>{selectedLead.ad_campaign_name || 'Anuncio Meta'}</span>
                  </div>
                )}
                {selectedLead.ad_name && (
                  <div className="crm-modal-field">
                    <label>Anuncio</label>
                    <span style={{fontSize: '0.75rem'}}>{selectedLead.ad_name}</span>
                  </div>
                )}
                <div className="crm-modal-field">
                  <label>Creado</label>
                  <span>{selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                </div>
                <div className="crm-modal-field">
                  <label>Último contacto</label>
                  <span>{selectedLead.updated_at ? new Date(selectedLead.updated_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                </div>
              </div>
              {selectedLead.notas_admin && (
                <div className="crm-modal-notes">
                  <label>Notas</label>
                  <p>{selectedLead.notas_admin}</p>
                </div>
              )}
              <div className="crm-modal-actions">
                <a
                  href={`/admin/whatsapp`}
                  className="crm-modal-action-btn"
                  onClick={(e) => { e.preventDefault(); window.open(`/admin/whatsapp`, '_blank'); }}
                >
                  <FaWhatsapp /> Ver en WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══ Lead Card Component ═══ */
const LeadCard = React.memo(({ lead, onSelect, onDragStart, compact = false }) => {
  const adminKey = normalizeAdmin(lead.atendido_por);
  const adminInfo = ADMIN_COLORS[adminKey];

  return (
    <div
      className={`crm-lead-card ${compact ? 'crm-lead-compact' : ''}`}
      onClick={() => onSelect(lead)}
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, lead)}
      style={{ cursor: 'grab' }}
    >
      <div className="crm-lead-card-header">
        <span className="crm-lead-card-name">{lead.nombre || 'Sin nombre'}</span>
        <span className="crm-lead-card-time">{timeAgo(lead.updated_at)}</span>
      </div>
      {!compact && (
        <>
          {lead.tema && <div className="crm-lead-card-tema">{lead.tema.length > 45 ? lead.tema.slice(0, 45) + '...' : lead.tema}</div>}
          <div className="crm-lead-card-meta">
            {lead.precio && <span className="crm-lead-card-price">${Number(lead.precio).toLocaleString()}</span>}
            {lead.tipo_servicio && <span className="crm-lead-card-service">{SERVICIO_LABEL[lead.tipo_servicio] || ''}</span>}
            {lead.nivel && <span className="crm-lead-card-nivel">{NIVEL_MAP[lead.nivel] || ''}</span>}
          </div>
        </>
      )}
      <div className="crm-lead-card-footer">
        {lead.atendido_por ? (
          <span className="crm-lead-card-admin" style={{ color: adminInfo?.color || '#6b7280', background: adminInfo?.bg || '#f3f4f6' }}>
            {adminInfo?.label || lead.atendido_por}
          </span>
        ) : (
          <span className="crm-lead-card-unattended">Sin atender</span>
        )}
        {lead.origen === 'manychat' && <span className="crm-lead-card-mc">MC</span>}
        {lead.ad_source && <span style={{fontSize: '0.6rem', background: '#e8f0fe', color: '#1a73e8', padding: '1px 4px', borderRadius: 3, marginLeft: 4}}>📣</span>}
        {lead.modo_humano && <span className="crm-lead-card-human">H</span>}
      </div>
    </div>
  );
});

export default AdminFunnel;
