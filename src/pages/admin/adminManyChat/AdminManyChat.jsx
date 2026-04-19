import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  FaWhatsapp, FaUpload, FaPaperPlane, FaSync, FaEye, FaCheck,
  FaExclamationTriangle, FaChevronDown, FaChevronUp,
  FaComments, FaUser, FaRobot, FaUserTie, FaFilter,
  FaUsers, FaReply, FaClock, FaInbox, FaSearch,
  FaCalendarDay, FaTimes, FaLock, FaTag,
  FaPauseCircle, FaEnvelope, FaBan, FaUnlock,
  FaStickyNote, FaTrash, FaMicrophone, FaStop,
} from 'react-icons/fa';
import {
  getManyChatStatus, importManyChatLeads, sendManyChatReactivation,
  previewManyChatMessages, getManyChatLeads, getLeadByWaId,
  parseHistorial, sendWhatsAppMessage, toggleModoHumano,
  updateLeadEstado, claimLead, updateLeadNotes, toggleBlockLead,
} from '../../../services/whatsapp/supabaseWhatsApp';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import './AdminManyChat.css';

/* ── Constantes ── */
const SEGMENTS = ['SUPER_HOT', 'HOT', 'WARM', 'TIBIO_1', 'TIBIO_2', 'FRIO', 'NEVER'];
const SEG_COLOR = {
  SUPER_HOT: '#ef4444', HOT: '#f59e0b', WARM: '#06b6d4', TIBIO_1: '#6b7280',
  TIBIO_2: '#374151', FRIO: '#3b82f6', NEVER: '#d1d5db',
};
const SEG_LABEL = {
  SUPER_HOT: 'Super Hot', HOT: 'Hot', WARM: 'Warm',
  TIBIO_1: 'Tibio 1', TIBIO_2: 'Tibio 2', FRIO: 'Frío', NEVER: 'Never',
};

const ESTADO_COLOR = {
  bienvenida: '#94a3b8', calificando: '#3b82f6', cotizando: '#8b5cf6',
  cotizacion_lista: '#a855f7', cotizacion_enviada: '#f59e0b', cotizacion_confirmada: '#22c55e',
  esperando_aprobacion: '#06b6d4', cliente_acepto: '#10b981', pagado: '#059669',
  descartado: '#ef4444', no_interesado: '#6b7280',
};

const ESTADOS_LIST = [
  'bienvenida', 'calificando', 'cotizando', 'cotizacion_lista',
  'cotizacion_enviada', 'cotizacion_confirmada', 'esperando_aprobacion',
  'cliente_acepto', 'pagado', 'descartado', 'no_interesado',
];

const ADMIN_COLORS = {
  arturo: { color: '#f59e0b', bg: '#fef3c7', label: 'Arturo', border: '#f59e0b' },
  sandy: { color: '#9b8afb', bg: '#ede9fe', label: 'Sandy', border: '#9b8afb' },
  hugo: { color: '#3b82f6', bg: '#dbeafe', label: 'Hugo', border: '#3b82f6' },
  _attended: { color: '#10b981', bg: '#d1fae5', label: 'Atendido', border: '#10b981' },
  _default: { color: '#d1d5db', bg: '#f9fafb', label: 'Sin atender', border: '#d1d5db' },
};

const SERVICIO_LABEL = {
  servicio_1: 'Redacción completa', servicio_2: 'Correcciones', servicio_3: 'Asesoría',
  modalidad1: 'Redacción completa', correccion: 'Correcciones', modalidad2: 'Asesoría',
};
const PROYECTO_MAP = { proyecto_1: 'Tesis', proyecto_2: 'Tesina', proyecto_3: 'Otro' };
const NIVEL_MAP = {
  nivel_1: 'Preparatoria', nivel_2: 'Licenciatura', nivel_3: 'Maestría',
  nivel_4: 'Especialidad', nivel_5: 'Diplomado', nivel_6: 'Doctorado',
};

const POLL_INTERVAL = 60000;

/* ── Helpers ── */
function normalizeAdminName(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  if (lower.includes('arturo')) return 'arturo';
  if (lower.includes('sandy')) return 'sandy';
  if (lower.includes('hugo')) return 'hugo';
  return lower.split(' ')[0];
}

function getLeadAttendedBy(lead) {
  if (lead?.atendido_por) return normalizeAdminName(lead.atendido_por);
  const hist = parseHistorial(lead?.historial_chat);
  for (let i = hist.length - 1; i >= 0; i--) {
    const c = hist[i]?.content || '';
    const match = c.match(/^\[HUMANO:([^\]]+)\]/);
    if (match) return normalizeAdminName(match[1]);
    if (c.startsWith('[HUMANO]')) return '_attended';
  }
  return null;
}

function getAttendedColor(lead) {
  const who = getLeadAttendedBy(lead);
  if (!who) return ADMIN_COLORS._default;
  return ADMIN_COLORS[who] || ADMIN_COLORS._attended;
}

function fmt(ts) {
  if (!ts) return '';
  const d = new Date(ts), diff = Date.now() - d;
  if (diff < 86400000) return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  if (diff < 172800000) return 'Ayer';
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function fmtFull(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getLastMessage(lead) {
  const hist = parseHistorial(lead?.historial_chat);
  if (hist.length === 0) return lead?.ultimo_mensaje_preview || '';
  const last = hist[hist.length - 1];
  let content = last?.content || '';
  content = content.replace(/\[HUMANO:.*?\]\s*/, '').replace(/\[STATE:\{.*?\}\]/g, '').trim();
  if (content.length > 60) content = content.slice(0, 60) + '...';
  return content;
}

function getUnreadCount(lead) {
  const hist = parseHistorial(lead?.historial_chat);
  let count = 0;
  for (let i = hist.length - 1; i >= 0; i--) {
    if (hist[i]?.role === 'user') count++;
    else break;
  }
  return count;
}

export default function AdminManyChat() {
  const { user: authUser } = useSelector((state) => state.auth || {});
  const currentAdminKey = normalizeAdminName(authUser?.name || authUser?.nombre || '');

  /* ── Status / Campaign state ── */
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [previews, setPreviews] = useState(null);
  const [selectedSegments, setSelectedSegments] = useState(['SUPER_HOT']);
  const [maxPerRun, setMaxPerRun] = useState(30);
  const [dryRun, setDryRun] = useState(true);
  const [previewSegment, setPreviewSegment] = useState('SUPER_HOT');
  const [showCampaign, setShowCampaign] = useState(false);

  /* ── Leads / Chat state ── */
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsStats, setLeadsStats] = useState({});
  const [selectedLead, setSelectedLead] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [togglingHumano, setTogglingHumano] = useState(false);
  const chatEndRef = useRef(null);
  const msgInputRef = useRef(null);
  const pollRef = useRef(null);

  /* ── Filters ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [attendedFilter, setAttendedFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  /* ── Lead detail state ── */
  const [updatingEstado, setUpdatingEstado] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [leadInfoOpen, setLeadInfoOpen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [blocking, setBlocking] = useState(false);

  /* ── Read tracking ── */
  const [readLeads, setReadLeads] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('mc_read_leads') || '[]')); } catch { return new Set(); }
  });

  /* ── Fetch helpers ── */
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getManyChatStatus();
      setStatus(data);
    } catch (err) { toast.error('Error: ' + err.message); }
    finally { setLoading(false); }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      setLeadsLoading(true);
      // Fetch ALL ManyChat leads (we filter client-side for rich filtering)
      const data = await getManyChatLeads('todos', 1, 500);
      setLeads(data.leads || data || []);
      if (data.stats) setLeadsStats(data.stats);
    } catch (err) { toast.error('Error cargando leads: ' + err.message); }
    finally { setLeadsLoading(false); }
  }, []);

  useEffect(() => { fetchStatus(); fetchLeads(); }, []); // eslint-disable-line

  // Polling
  useEffect(() => {
    pollRef.current = setInterval(() => { fetchLeads(); }, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchLeads]);

  // Persist read state
  useEffect(() => {
    localStorage.setItem('mc_read_leads', JSON.stringify([...readLeads]));
  }, [readLeads]);

  /* ── Client-side filtering & sorting ── */
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => {
        const name = (l.nombre || '').toLowerCase();
        const phone = (l.wa_id || '').toLowerCase();
        const tema = (l.tema || '').toLowerCase();
        const carrera = (l.carrera || '').toLowerCase();
        const preview = (l.ultimo_mensaje_preview || '').toLowerCase();
        return name.includes(q) || phone.includes(q) || tema.includes(q) || carrera.includes(q) || preview.includes(q);
      });
    }

    // Estado filter
    if (estadoFilter !== 'all') {
      result = result.filter(l => (l.estado_sofia || 'sin_estado') === estadoFilter);
    }

    // Attended filter
    if (attendedFilter !== 'all') {
      if (attendedFilter === 'sin_atender') {
        result = result.filter(l => !getLeadAttendedBy(l));
      } else if (attendedFilter === 'atendido') {
        result = result.filter(l => !!getLeadAttendedBy(l));
      } else {
        result = result.filter(l => getLeadAttendedBy(l) === attendedFilter);
      }
    }

    // Segment filter
    if (segmentFilter !== 'all') {
      result = result.filter(l => l.manychat_segment === segmentFilter);
    }

    // Date filter
    if (dateFilter) {
      result = result.filter(l => {
        if (!l.created_at) return false;
        return l.created_at.startsWith(dateFilter);
      });
    }

    // Sort: unread first, then by updated_at desc
    result.sort((a, b) => {
      const aUnread = getUnreadCount(a) > 0 && !readLeads.has(a.wa_id) ? 1 : 0;
      const bUnread = getUnreadCount(b) > 0 && !readLeads.has(b.wa_id) ? 1 : 0;
      if (bUnread !== aUnread) return bUnread - aUnread;
      // Priority estados
      const PRIORITY = ['esperando_aprobacion', 'cotizacion_enviada', 'cotizacion_confirmada', 'cliente_acepto'];
      const aPri = PRIORITY.includes(a.estado_sofia) ? 1 : 0;
      const bPri = PRIORITY.includes(b.estado_sofia) ? 1 : 0;
      if (bPri !== aPri) return bPri - aPri;
      // Human mode active = higher priority
      if (a.modo_humano && !b.modo_humano) return -1;
      if (!a.modo_humano && b.modo_humano) return 1;
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });

    return result;
  }, [leads, searchQuery, estadoFilter, attendedFilter, segmentFilter, dateFilter, readLeads]);

  /* ── Derived data for filters ── */
  const estadosUnicos = useMemo(() => {
    const set = new Set(leads.map(l => l.estado_sofia || 'sin_estado'));
    return ESTADOS_LIST.filter(e => set.has(e));
  }, [leads]);

  const segmentsPresent = useMemo(() => {
    const set = new Set(leads.map(l => l.manychat_segment).filter(Boolean));
    return SEGMENTS.filter(s => set.has(s));
  }, [leads]);

  /* ── Campaign actions ── */
  const toggleSegment = (seg) => setSelectedSegments(p => p.includes(seg) ? p.filter(s => s !== seg) : [...p, seg]);

  const handleImport = async () => {
    try {
      setImporting(true);
      const r = await importManyChatLeads({ segments: selectedSegments.length > 0 ? selectedSegments : undefined, dryRun });
      setImportResult(r);
      toast.success(`${dryRun ? '(Sim) ' : ''}${r.created} creados, ${r.updated} actualizados`);
      fetchStatus(); fetchLeads();
    } catch (err) { toast.error(err.message); }
    finally { setImporting(false); }
  };

  const handleSend = async () => {
    try {
      setSending(true);
      const r = await sendManyChatReactivation({ segments: selectedSegments.length > 0 ? selectedSegments : undefined, maxPerRun, dryRun });
      setSendResult(r);
      toast.success(`${dryRun ? '(Sim) ' : ''}${r.sent} enviados, ${r.skipped} saltados`);
      fetchStatus(); fetchLeads();
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  const handlePreview = async () => {
    try { setPreviewing(true); setPreviews(await previewManyChatMessages(previewSegment, 5)); }
    catch (err) { toast.error(err.message); }
    finally { setPreviewing(false); }
  };

  /* ── Chat / Lead actions ── */
  const handleSelectLead = async (lead) => {
    setSelectedLead(lead);
    setChatLoading(true);
    setLeadInfoOpen(false);
    setShowNotes(false);
    // Mark as read
    setReadLeads(prev => {
      const next = new Set(prev);
      next.add(lead.wa_id);
      return next;
    });
    try {
      const data = await getLeadByWaId(lead.wa_id);
      const ld = data.lead || data;
      setSelectedLead(ld);
      setChatMessages(parseHistorial(ld.historial_chat));
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { setChatMessages([]); }
    finally { setChatLoading(false); }
  };

  const handleToggleHumano = async () => {
    if (!selectedLead) return;
    try {
      setTogglingHumano(true);
      const nv = !selectedLead.modo_humano;
      await toggleModoHumano(selectedLead.wa_id, nv);
      setSelectedLead(p => ({ ...p, modo_humano: nv }));
      setLeads(p => p.map(l => l.wa_id === selectedLead.wa_id ? { ...l, modo_humano: nv } : l));
      toast.success(nv ? 'Modo humano activado' : 'Modo humano desactivado');
    } catch (err) { toast.error(err.message); }
    finally { setTogglingHumano(false); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim() || !selectedLead || sendingMsg) return;
    try {
      setSendingMsg(true);
      await sendWhatsAppMessage(selectedLead.wa_id, msgText.trim());
      setChatMessages(p => [...p, { role: 'assistant', content: `[HUMANO:Admin] ${msgText.trim()}`, timestamp: new Date().toISOString() }]);
      setMsgText('');
      toast.success('Mensaje enviado');
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) { toast.error(err.message); }
    finally { setSendingMsg(false); msgInputRef.current?.focus(); }
  };

  const handleUpdateEstado = async (nuevoEstado) => {
    if (!selectedLead || updatingEstado) return;
    try {
      setUpdatingEstado(true);
      await updateLeadEstado(selectedLead.wa_id, nuevoEstado);
      setSelectedLead(p => ({ ...p, estado_sofia: nuevoEstado }));
      setLeads(p => p.map(l => l.wa_id === selectedLead.wa_id ? { ...l, estado_sofia: nuevoEstado } : l));
      toast.success(`Estado → ${nuevoEstado.replace(/_/g, ' ')}`);
    } catch (err) { toast.error(err.message); }
    finally { setUpdatingEstado(false); }
  };

  const handleClaimLead = async () => {
    if (!selectedLead || claiming) return;
    const adminName = authUser?.name || authUser?.nombre || 'Admin';
    try {
      setClaiming(true);
      await claimLead(selectedLead.wa_id, adminName);
      setSelectedLead(p => ({ ...p, atendido_por: adminName }));
      setLeads(p => p.map(l => l.wa_id === selectedLead.wa_id ? { ...l, atendido_por: adminName } : l));
      toast.success(`Lead asignado a ${adminName}`);
    } catch (err) { toast.error(err.message); }
    finally { setClaiming(false); }
  };

  const handleToggleBlock = async () => {
    if (!selectedLead || blocking) return;
    try {
      setBlocking(true);
      const newVal = !selectedLead.bloqueado;
      await toggleBlockLead(selectedLead.wa_id, newVal);
      setSelectedLead(p => ({ ...p, bloqueado: newVal }));
      setLeads(p => p.map(l => l.wa_id === selectedLead.wa_id ? { ...l, bloqueado: newVal } : l));
      toast.success(newVal ? 'Contacto bloqueado' : 'Contacto desbloqueado');
    } catch (err) { toast.error(err.message); }
    finally { setBlocking(false); }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    try {
      await updateLeadNotes(selectedLead.wa_id, {
        notas_admin: selectedLead.notas_admin || '',
        etiquetas: selectedLead.etiquetas || [],
      });
      toast.success('Notas guardadas');
    } catch (err) { toast.error(err.message); }
  };

  /* ── Render helpers ── */
  const isHuman = (c) => c?.startsWith?.('[HUMANO');

  const segBadge = (seg) => {
    if (!seg) return null;
    return (
      <span className="mc-badge" style={{ background: SEG_COLOR[seg] || '#ccc', color: seg === 'NEVER' ? '#333' : '#fff' }}>
        {SEG_LABEL[seg] || seg}
      </span>
    );
  };

  const estadoBadge = (estado) => {
    if (!estado) return null;
    return (
      <span className="mc-badge" style={{ background: ESTADO_COLOR[estado] || '#94a3b8', color: '#fff' }}>
        {estado.replace(/_/g, ' ')}
      </span>
    );
  };

  const hasActiveFilters = estadoFilter !== 'all' || attendedFilter !== 'all' || segmentFilter !== 'all' || dateFilter || searchQuery.trim();

  const clearAllFilters = () => {
    setEstadoFilter('all');
    setAttendedFilter('all');
    setSegmentFilter('all');
    setDateFilter('');
    setSearchQuery('');
  };

  if (loading && leads.length === 0) {
    return (
      <div className="mc-loading-screen">
        <div className="mc-spinner" />
        <p>Cargando ManyChat...</p>
      </div>
    );
  }

  return (
    <div className="mc-panel">
      {/* ═══ LEFT HEADER ═══ */}
      <div className="mc-header">
        <FaWhatsapp className="mc-header-icon" />
        <span className="mc-header-title">ManyChat</span>
        <span className="mc-header-count">
          {filteredLeads.length} de {leads.length} leads
        </span>
        <div className="mc-header-actions">
          <button
            className="mc-header-btn mc-campaign-toggle"
            onClick={() => setShowCampaign(!showCampaign)}
            title="Panel de campaña"
          >
            <FaPaperPlane /> Campaña {showCampaign ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
          </button>
          <button className="mc-header-btn" onClick={() => { fetchStatus(); fetchLeads(); }} title="Refrescar">
            <FaSync size={12} />
          </button>
        </div>
      </div>

      {/* ═══ CAMPAIGN PANEL (collapsible) ═══ */}
      {showCampaign && (
        <div className="mc-campaign-panel">
          <div className="mc-campaign-inner">
            <div className="mc-campaign-segments">
              <div className="mc-campaign-section-title">SEGMENTOS</div>
              <div className="mc-segments-grid">
                {SEGMENTS.map(seg => (
                  <span
                    key={seg}
                    className={`mc-seg-chip ${selectedSegments.includes(seg) ? 'on' : 'off'}`}
                    style={{
                      '--seg-color': SEG_COLOR[seg],
                      background: selectedSegments.includes(seg) ? SEG_COLOR[seg] + '18' : '#f1f5f9',
                      color: SEG_COLOR[seg],
                    }}
                    onClick={() => toggleSegment(seg)}
                  >
                    {selectedSegments.includes(seg) && <FaCheck size={9} />}
                    {SEG_LABEL[seg]} ({status?.segmentCounts?.[seg] || 0})
                  </span>
                ))}
              </div>
            </div>
            <div className="mc-campaign-controls">
              <div className="mc-campaign-row">
                <label className="mc-campaign-label">Max:</label>
                <input type="number" value={maxPerRun} onChange={e => setMaxPerRun(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1} max={200} className="mc-campaign-input" />
                <label className="mc-campaign-checkbox">
                  <input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)} />
                  {dryRun ? 'Sim' : <span className="mc-real-label">REAL</span>}
                </label>
              </div>
              <div className="mc-campaign-row">
                <button className="mc-btn mc-btn-outline" onClick={handleImport} disabled={importing || selectedSegments.length === 0}>
                  {importing ? '...' : <><FaUpload size={11} /> Importar</>}
                </button>
                <button className={`mc-btn ${dryRun ? 'mc-btn-outline' : 'mc-btn-primary'}`} onClick={handleSend} disabled={sending || selectedSegments.length === 0}>
                  {sending ? '...' : <><FaPaperPlane size={11} /> Enviar</>}
                </button>
              </div>
              <div className="mc-campaign-row">
                <select value={previewSegment} onChange={e => setPreviewSegment(e.target.value)} className="mc-campaign-select">
                  {SEGMENTS.map(s => <option key={s} value={s}>{SEG_LABEL[s]}</option>)}
                </select>
                <button className="mc-btn mc-btn-outline" onClick={handlePreview} disabled={previewing}>
                  <FaEye size={11} /> Preview
                </button>
              </div>
              {importResult && <div className="mc-result-badge">{importResult.created} creados, {importResult.updated} actualizados</div>}
              {sendResult && <div className="mc-result-badge">{sendResult.sent} enviados, {sendResult.skipped} saltados</div>}
            </div>
          </div>
          {previews && (
            <div className="mc-preview-panel">
              <div className="mc-preview-header">
                <span>Preview: {SEG_LABEL[previews.segment]}</span>
                <button className="mc-btn mc-btn-sm" onClick={() => setPreviews(null)}>Cerrar</button>
              </div>
              {previews.previews.map((p, i) => (
                <div key={i} className="mc-preview-card">
                  <strong>{p.nombre || p.wa_id}</strong>
                  <div className="mc-preview-msg">{p.message || '(no se enviaría)'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ MAIN BODY ═══ */}
      <div className="mc-body">
        {/* ── LEFT COLUMN: Search + Filters + Lead List ── */}
        <div className={`mc-left-col ${selectedLead ? 'mc-hide-mobile' : ''}`}>
          {/* Search */}
          <div className="mc-search-box">
            <FaSearch className="mc-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, tema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mc-search-input"
            />
            {searchQuery && (
              <button className="mc-search-clear" onClick={() => setSearchQuery('')}>
                <FaTimes size={10} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mc-filters">
            <select
              className="mc-filter-select"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              style={estadoFilter !== 'all' ? { borderColor: '#3b82f6', color: '#3b82f6', fontWeight: 600 } : {}}
            >
              <option value="all">Estado: Todos ({leads.length})</option>
              {estadosUnicos.map(est => {
                const count = leads.filter(l => (l.estado_sofia || 'sin_estado') === est).length;
                return <option key={est} value={est}>{est.replace(/_/g, ' ')} ({count})</option>;
              })}
            </select>
            <select
              className="mc-filter-select"
              value={attendedFilter}
              onChange={(e) => setAttendedFilter(e.target.value)}
              style={attendedFilter !== 'all' && ADMIN_COLORS[attendedFilter] ? { borderColor: ADMIN_COLORS[attendedFilter].color, color: ADMIN_COLORS[attendedFilter].color, fontWeight: 600 } : {}}
            >
              <option value="all">Atención: Todos</option>
              <option value="sin_atender">Sin atender ({leads.filter(l => !getLeadAttendedBy(l)).length})</option>
              <option value="atendido">Atendidos ({leads.filter(l => !!getLeadAttendedBy(l)).length})</option>
              <option disabled>──────────</option>
              {['arturo', 'sandy', 'hugo'].map(admin => {
                const count = leads.filter(l => getLeadAttendedBy(l) === admin).length;
                return <option key={admin} value={admin}>{ADMIN_COLORS[admin].label} ({count})</option>;
              })}
            </select>
            <select
              className="mc-filter-select"
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              style={segmentFilter !== 'all' ? { borderColor: SEG_COLOR[segmentFilter] || '#7c3aed', color: SEG_COLOR[segmentFilter] || '#7c3aed', fontWeight: 600 } : {}}
            >
              <option value="all">Segmento: Todos</option>
              {segmentsPresent.map(seg => {
                const count = leads.filter(l => l.manychat_segment === seg).length;
                return <option key={seg} value={seg}>{SEG_LABEL[seg]} ({count})</option>;
              })}
            </select>
            <div className="mc-date-filter">
              <FaCalendarDay className="mc-date-icon" style={{ color: dateFilter ? '#7c3aed' : '#888' }} />
              <input
                type="date"
                className="mc-filter-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ color: dateFilter ? '#333' : '#888' }}
                title="Filtrar por día de creación"
              />
              {dateFilter && (
                <button className="mc-date-clear" onClick={() => setDateFilter('')}><FaTimes size={9} /></button>
              )}
            </div>
          </div>

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <div className="mc-active-filters">
              <span>{filteredLeads.length} resultado{filteredLeads.length !== 1 ? 's' : ''}</span>
              <button className="mc-clear-filters" onClick={clearAllFilters}>
                <FaTimes size={9} /> Limpiar filtros
              </button>
            </div>
          )}

          {/* Lead List */}
          <div className="mc-lead-list">
            {leadsLoading && leads.length === 0 ? (
              <div className="mc-loading-inline"><div className="mc-spinner" /></div>
            ) : filteredLeads.length === 0 ? (
              <div className="mc-empty-state">
                <FaFilter size={28} />
                <p>Sin leads{hasActiveFilters ? ' con estos filtros' : ''}</p>
                {hasActiveFilters && <button className="mc-btn mc-btn-outline" onClick={clearAllFilters}>Limpiar filtros</button>}
              </div>
            ) : (
              <>
                {(() => {
                  const elements = [];
                  let shownNewHdr = false, shownPriorityHdr = false, shownRestHdr = false;
                  const PRIORITY_ESTADOS = ['esperando_aprobacion', 'cotizacion_enviada', 'cotizacion_confirmada', 'cliente_acepto'];

                  filteredLeads.forEach((lead) => {
                    const unread = getUnreadCount(lead);
                    const isPriority = PRIORITY_ESTADOS.includes(lead.estado_sofia);
                    const isRead = readLeads.has(lead.wa_id);

                    // Section headers
                    if (unread > 0 && !isRead && !shownNewHdr) {
                      shownNewHdr = true;
                      elements.push(
                        <div key="__hdr_new" className="mc-section-header mc-section-new">
                          <FaEnvelope /> Mensajes nuevos
                        </div>
                      );
                    }
                    if ((unread === 0 || isRead) && isPriority && !shownPriorityHdr) {
                      shownPriorityHdr = true;
                      elements.push(
                        <div key="__hdr_priority" className="mc-section-header mc-section-priority">
                          <FaClock /> Esperando respuesta
                        </div>
                      );
                    }
                    if ((unread === 0 || isRead) && !isPriority && !shownRestHdr) {
                      shownRestHdr = true;
                      elements.push(
                        <div key="__hdr_rest" className="mc-section-header mc-section-rest">
                          <FaComments /> Otras conversaciones
                        </div>
                      );
                    }

                    const isSelected = selectedLead?.wa_id === lead.wa_id;
                    const attendedInfo = getAttendedColor(lead);
                    const colors = ['#7c3aed', '#0088E0', '#ef4444', '#F59E0B', '#10B981', '#8B5CF6', '#3B82F6', '#25D366'];
                    const avCol = colors[(lead.nombre || lead.wa_id || '?').charCodeAt(0) % colors.length];

                    elements.push(
                      <div
                        key={lead.wa_id}
                        className={`mc-lead-item ${isSelected ? 'mc-selected' : ''} ${lead.modo_humano ? 'mc-human-mode' : ''} ${lead.bloqueado ? 'mc-blocked' : ''}`}
                        style={{ borderLeftColor: attendedInfo.color }}
                        onClick={() => handleSelectLead(lead)}
                      >
                        <div className="mc-lead-avatar" style={{ background: avCol }}>
                          {(lead.nombre || lead.wa_id || '?')[0].toUpperCase()}
                          {lead.modo_humano && <span className="mc-human-badge"><FaUserTie size={8} /></span>}
                        </div>
                        <div className="mc-lead-info">
                          <div className="mc-lead-header">
                            <span className="mc-lead-name">{lead.nombre || lead.wa_id}</span>
                            <span className="mc-lead-time">{fmt(lead.updated_at)}</span>
                          </div>
                          <div className="mc-lead-preview">
                            <span className="mc-lead-last-msg">{getLastMessage(lead)}</span>
                            {unread > 0 && !isRead && (
                              <span className="mc-unread-badge">{unread}</span>
                            )}
                          </div>
                          <div className="mc-lead-meta">
                            {segBadge(lead.manychat_segment)}
                            {estadoBadge(lead.estado_sofia)}
                            {attendedInfo.label !== 'Sin atender' && (
                              <span className="mc-attended-tag" style={{ color: attendedInfo.color, background: attendedInfo.bg }}>
                                <FaLock style={{ fontSize: '0.5rem', marginRight: 2 }} />
                                {attendedInfo.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                  return elements;
                })()}
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Chat Panel ── */}
        <div className={`mc-right-col ${!selectedLead ? 'mc-hide-mobile' : ''}`}>
          {!selectedLead ? (
            <div className="mc-empty-chat">
              <FaComments size={48} className="mc-empty-icon" />
              <p className="mc-empty-title">Selecciona un lead</p>
              <p className="mc-empty-subtitle">Elige un contacto de la lista para ver su conversación</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="mc-chat-header">
                <button className="mc-back-btn" onClick={() => setSelectedLead(null)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                  </svg>
                </button>
                <div className="mc-chat-lead-info">
                  <div className="mc-chat-name-row">
                    <span className="mc-chat-name">{selectedLead.nombre || selectedLead.wa_id}</span>
                    <span className="mc-chat-phone">+{selectedLead.wa_id}</span>
                  </div>
                  <div className="mc-chat-badges">
                    {segBadge(selectedLead.manychat_segment)}
                    {estadoBadge(selectedLead.estado_sofia)}
                    {selectedLead.bloqueado && <span className="mc-badge mc-badge-blocked"><FaBan size={8} /> Bloqueado</span>}
                  </div>
                </div>
                <div className="mc-chat-actions">
                  {/* Estado dropdown */}
                  <select
                    className="mc-estado-select"
                    value={selectedLead.estado_sofia || ''}
                    onChange={(e) => handleUpdateEstado(e.target.value)}
                    disabled={updatingEstado}
                    title="Cambiar estado"
                  >
                    {ESTADOS_LIST.map(est => (
                      <option key={est} value={est}>{est.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  {/* Claim button */}
                  {!selectedLead.atendido_por && (
                    <button className="mc-btn mc-btn-claim" onClick={handleClaimLead} disabled={claiming} title="Reclamar lead">
                      {claiming ? '...' : <><FaLock size={10} /> Reclamar</>}
                    </button>
                  )}
                  {/* Human/AI toggle */}
                  <button
                    className={`mc-btn ${selectedLead.modo_humano ? 'mc-btn-human-active' : 'mc-btn-outline'}`}
                    onClick={handleToggleHumano}
                    disabled={togglingHumano}
                    title={selectedLead.modo_humano ? 'Modo humano activo' : 'Sofia atendiendo'}
                  >
                    {togglingHumano ? '...' : selectedLead.modo_humano ? <><FaUserTie size={11} /> Humano</> : <><FaRobot size={11} /> AI</>}
                  </button>
                  {/* Info toggle */}
                  <button
                    className={`mc-btn mc-btn-outline ${leadInfoOpen ? 'mc-btn-active' : ''}`}
                    onClick={() => setLeadInfoOpen(!leadInfoOpen)}
                    title="Info del lead"
                  >
                    <FaUser size={11} />
                  </button>
                </div>
              </div>

              {/* Lead info sidebar (collapsible) */}
              {leadInfoOpen && (
                <div className="mc-lead-detail">
                  <div className="mc-detail-section">
                    <div className="mc-detail-title">Información del lead</div>
                    <div className="mc-detail-grid">
                      <div className="mc-detail-item">
                        <span className="mc-detail-label">Teléfono</span>
                        <span className="mc-detail-value">+{selectedLead.wa_id}</span>
                      </div>
                      {selectedLead.carrera && (
                        <div className="mc-detail-item">
                          <span className="mc-detail-label">Carrera</span>
                          <span className="mc-detail-value">{selectedLead.carrera}</span>
                        </div>
                      )}
                      {selectedLead.tema && (
                        <div className="mc-detail-item">
                          <span className="mc-detail-label">Tema</span>
                          <span className="mc-detail-value">{selectedLead.tema}</span>
                        </div>
                      )}
                      {selectedLead.tipo_servicio && (
                        <div className="mc-detail-item">
                          <span className="mc-detail-label">Servicio</span>
                          <span className="mc-detail-value">{SERVICIO_LABEL[selectedLead.tipo_servicio] || selectedLead.tipo_servicio}</span>
                        </div>
                      )}
                      {selectedLead.tipo_proyecto && (
                        <div className="mc-detail-item">
                          <span className="mc-detail-label">Proyecto</span>
                          <span className="mc-detail-value">{PROYECTO_MAP[selectedLead.tipo_proyecto] || selectedLead.tipo_proyecto}</span>
                        </div>
                      )}
                      {selectedLead.nivel && (
                        <div className="mc-detail-item">
                          <span className="mc-detail-label">Nivel</span>
                          <span className="mc-detail-value">{NIVEL_MAP[selectedLead.nivel] || selectedLead.nivel}</span>
                        </div>
                      )}
                      {selectedLead.paginas && (
                        <div className="mc-detail-item">
                          <span className="mc-detail-label">Páginas</span>
                          <span className="mc-detail-value">{selectedLead.paginas}</span>
                        </div>
                      )}
                      {selectedLead.precio && (
                        <div className="mc-detail-item">
                          <span className="mc-detail-label">Precio</span>
                          <span className="mc-detail-value">${selectedLead.precio?.toLocaleString?.() || selectedLead.precio}</span>
                        </div>
                      )}
                      {selectedLead.fecha_entrega && (
                        <div className="mc-detail-item">
                          <span className="mc-detail-label">Entrega</span>
                          <span className="mc-detail-value">{selectedLead.fecha_entrega}</span>
                        </div>
                      )}
                      <div className="mc-detail-item">
                        <span className="mc-detail-label">Segmento</span>
                        <span className="mc-detail-value">{segBadge(selectedLead.manychat_segment)}</span>
                      </div>
                      <div className="mc-detail-item">
                        <span className="mc-detail-label">Creado</span>
                        <span className="mc-detail-value">{fmtFull(selectedLead.created_at)}</span>
                      </div>
                      {selectedLead.atendido_por && (
                        <div className="mc-detail-item">
                          <span className="mc-detail-label">Atendido por</span>
                          <span className="mc-detail-value">{selectedLead.atendido_por}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mc-detail-section">
                    <div className="mc-detail-title" style={{ cursor: 'pointer' }} onClick={() => setShowNotes(!showNotes)}>
                      <FaStickyNote size={11} /> Notas {showNotes ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                    </div>
                    {showNotes && (
                      <div className="mc-notes-area">
                        <textarea
                          className="mc-notes-textarea"
                          value={selectedLead.notas_admin || ''}
                          onChange={(e) => setSelectedLead(p => ({ ...p, notas_admin: e.target.value }))}
                          placeholder="Escribe notas sobre este lead..."
                          rows={3}
                        />
                        <button className="mc-btn mc-btn-sm mc-btn-primary" onClick={handleSaveNotes}>Guardar notas</button>
                      </div>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="mc-detail-section">
                    <div className="mc-detail-title">Acciones</div>
                    <div className="mc-detail-actions">
                      <button
                        className={`mc-btn mc-btn-sm ${selectedLead.bloqueado ? 'mc-btn-danger' : 'mc-btn-outline'}`}
                        onClick={handleToggleBlock}
                        disabled={blocking}
                      >
                        {selectedLead.bloqueado ? <><FaUnlock size={10} /> Desbloquear</> : <><FaBan size={10} /> Bloquear</>}
                      </button>
                      <button
                        className="mc-btn mc-btn-sm mc-btn-danger"
                        onClick={() => handleUpdateEstado('descartado')}
                        disabled={updatingEstado || selectedLead.estado_sofia === 'descartado'}
                      >
                        <FaTimes size={10} /> Descartar
                      </button>
                      <button
                        className="mc-btn mc-btn-sm mc-btn-outline"
                        onClick={() => handleUpdateEstado('no_interesado')}
                        disabled={updatingEstado || selectedLead.estado_sofia === 'no_interesado'}
                      >
                        No interesado
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="mc-messages">
                {chatLoading ? (
                  <div className="mc-loading-inline"><div className="mc-spinner" /></div>
                ) : chatMessages.length === 0 ? (
                  <div className="mc-empty-messages">
                    <FaComments size={28} />
                    <p>Sin mensajes</p>
                  </div>
                ) : chatMessages.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  const isH = isHuman(msg.content);
                  const content = msg.content || '';
                  if (content.startsWith('[STATE:')) return null;
                  const cleanContent = isH ? content.replace(/\[HUMANO:.*?\]\s*/, '') : content.replace(/\[STATE:\{.*?\}\]/g, '').trim();
                  if (!cleanContent) return null;
                  return (
                    <div key={i} className={`mc-msg ${isUser ? 'mc-msg-user' : isH ? 'mc-msg-human' : 'mc-msg-ai'}`}>
                      <div className="mc-msg-sender" style={{ color: isUser ? '#2e7d32' : isH ? '#e65100' : '#1565c0' }}>
                        {isUser ? <><FaUser size={9} /> {selectedLead.nombre || 'Lead'}</> : isH ? <><FaUserTie size={9} /> {content.match(/\[HUMANO:(.*?)\]/)?.[1] || 'Admin'}</> : <><FaRobot size={9} /> Sofia</>}
                      </div>
                      {cleanContent}
                      {msg.mediaUrl && msg.mimetype?.includes('audio') && <audio controls src={msg.mediaUrl} style={{ width: '100%', maxWidth: 260, marginTop: 4 }} />}
                      {msg.mediaUrl && msg.mimetype?.includes('image') && <img src={msg.mediaUrl} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, marginTop: 4 }} />}
                      <div className="mc-msg-time">{fmt(msg.timestamp)}</div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="mc-input-bar">
                {!selectedLead.modo_humano ? (
                  <div className="mc-sofia-notice">
                    <FaRobot /> Sofia atiende este lead. Activa <strong>modo humano</strong> para responder.
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="mc-input-form">
                    <input
                      ref={msgInputRef}
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={msgText}
                      onChange={e => setMsgText(e.target.value)}
                      disabled={sendingMsg}
                      className="mc-msg-input"
                    />
                    <button type="submit" className="mc-send-btn" disabled={sendingMsg || !msgText.trim()}>
                      <FaPaperPlane size={14} />
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
