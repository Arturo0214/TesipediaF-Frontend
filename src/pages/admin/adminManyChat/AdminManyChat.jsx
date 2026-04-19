import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaWhatsapp, FaUpload, FaPaperPlane, FaSync, FaEye, FaCheck,
  FaExclamationTriangle, FaChevronDown, FaChevronUp,
  FaComments, FaUser, FaRobot, FaUserTie, FaFilter,
  FaUsers, FaReply, FaClock, FaInbox,
} from 'react-icons/fa';
import {
  getManyChatStatus, importManyChatLeads, sendManyChatReactivation,
  previewManyChatMessages, getManyChatLeads, getLeadByWaId,
  parseHistorial, sendWhatsAppMessage, toggleModoHumano,
} from '../../../services/whatsapp/supabaseWhatsApp';
import { toast } from 'react-hot-toast';

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
const FILTERS = [
  { key: 'respondieron', label: 'Respondieron', icon: FaReply, color: '#22c55e' },
  { key: 'enviados', label: 'Enviados (sin respuesta)', icon: FaClock, color: '#f59e0b' },
  { key: 'pendientes', label: 'Pendientes', icon: FaInbox, color: '#94a3b8' },
  { key: 'todos', label: 'Todos', icon: FaUsers, color: '#6366f1' },
];

export default function AdminManyChat() {
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
  const [activeFilter, setActiveFilter] = useState('respondieron');
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

  /* ── Fetch helpers ── */
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getManyChatStatus();
      setStatus(data);
    } catch (err) { toast.error('Error: ' + err.message); }
    finally { setLoading(false); }
  }, []);

  const fetchLeads = useCallback(async (filter) => {
    try {
      setLeadsLoading(true);
      const data = await getManyChatLeads(filter || activeFilter, 1, 100);
      setLeads(data.leads || data || []);
      if (data.stats) setLeadsStats(data.stats);
    } catch (err) { toast.error('Error: ' + err.message); }
    finally { setLeadsLoading(false); }
  }, [activeFilter]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  useEffect(() => { fetchLeads(activeFilter); }, [activeFilter]); // eslint-disable-line

  const handleFilterChange = (f) => { setActiveFilter(f); setSelectedLead(null); setChatMessages([]); };

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

  /* ── Chat actions ── */
  const handleSelectLead = async (lead) => {
    setSelectedLead(lead); setChatLoading(true);
    try {
      const data = await getLeadByWaId(lead.wa_id);
      const ld = data.lead || data;
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

  const isHuman = (c) => c?.startsWith?.('[HUMANO');
  const fmt = (ts) => {
    if (!ts) return '';
    const d = new Date(ts), diff = Date.now() - d;
    if (diff < 86400000) return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    if (diff < 172800000) return 'Ayer';
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const segBadge = (seg) => {
    if (!seg) return null;
    return <span style={{ background: SEG_COLOR[seg] || '#ccc', color: seg === 'NEVER' ? '#333' : '#fff', padding: '1px 6px', borderRadius: 8, fontSize: '0.6rem', fontWeight: 700 }}>{SEG_LABEL[seg] || seg}</span>;
  };

  const estadoBadge = (estado) => {
    if (!estado) return null;
    const label = estado.replace(/_/g, ' ');
    return <span style={{ background: ESTADO_COLOR[estado] || '#94a3b8', color: '#fff', padding: '1px 6px', borderRadius: 8, fontSize: '0.6rem', fontWeight: 600 }}>{label}</span>;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="mc-spin" /><style>{`.mc-spin{width:28px;height:28px;border:3px solid #e5e7eb;border-top-color:#22c55e;border-radius:50%;animation:mcs .7s linear infinite}@keyframes mcs{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <>
      <style>{`
        .mc{display:flex;flex-direction:column;height:100%;background:#f8fafc;overflow:hidden}
        .mc-top{padding:12px 16px;border-bottom:1px solid #e2e8f0;background:#fff;flex-shrink:0}
        .mc-top h4{margin:0;font-size:1.1rem;font-weight:700;color:#0f172a;display:flex;align-items:center;gap:8px}
        .mc-top-acts{display:flex;gap:6px;margin-left:auto;align-items:center}
        .mc-stats{display:flex;gap:8px;padding:10px 16px;border-bottom:1px solid #e2e8f0;background:#fff;flex-shrink:0;overflow-x:auto}
        .mc-stat{display:flex;flex-direction:column;align-items:center;padding:8px 14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;min-width:90px;cursor:pointer;transition:all .15s}
        .mc-stat.active{background:#f0fdf4;border-color:#22c55e;box-shadow:0 0 0 2px rgba(34,197,94,.15)}
        .mc-stat:hover{border-color:#22c55e}
        .mc-stat-num{font-size:1.4rem;font-weight:800;line-height:1}
        .mc-stat-label{font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.3px;margin-top:2px;text-align:center}
        .mc-body{display:flex;flex:1;overflow:hidden}
        .mc-left{width:320px;min-width:260px;display:flex;flex-direction:column;border-right:1px solid #e2e8f0;background:#fff;flex-shrink:0}
        .mc-list{flex:1;overflow-y:auto}
        .mc-item{display:flex;gap:8px;padding:10px 12px;cursor:pointer;border-bottom:1px solid #f1f5f9;transition:background .12s}
        .mc-item:hover{background:#f8fafc}
        .mc-item.sel{background:#f0fdf4;border-left:3px solid #22c55e}
        .mc-item-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:.8rem;flex-shrink:0}
        .mc-item-info{flex:1;min-width:0;overflow:hidden}
        .mc-item-name{font-weight:600;font-size:.85rem;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .mc-item-preview{font-size:.72rem;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .mc-item-meta{display:flex;gap:4px;margin-top:3px;align-items:center;flex-wrap:wrap}
        .mc-item-time{font-size:.65rem;color:#94a3b8;white-space:nowrap;margin-left:auto}
        .mc-right{flex:1;display:flex;flex-direction:column;overflow:hidden;background:#e5ddd5;background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5cec4' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}
        .mc-ch-head{background:#fff;padding:8px 12px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap}
        .mc-ch-name{font-weight:700;font-size:.9rem;color:#0f172a}
        .mc-ch-sub{font-size:.7rem;color:#64748b}
        .mc-msgs{flex:1;overflow-y:auto;padding:12px 20px;display:flex;flex-direction:column;gap:4px}
        .mc-m{max-width:70%;padding:7px 11px;border-radius:8px;font-size:.84rem;line-height:1.4;word-wrap:break-word;box-shadow:0 1px 1px rgba(0,0,0,.08);white-space:pre-wrap;word-break:break-word;margin-bottom:1px}
        .mc-m.u{align-self:flex-start;background:#fff;border-top-left-radius:2px}
        .mc-m.a{align-self:flex-end;background:#d4edff;border-top-right-radius:2px}
        .mc-m.h{align-self:flex-end;background:#dcf8c6;border-top-right-radius:2px}
        .mc-m-sender{font-size:.66rem;font-weight:600;margin-bottom:1px}
        .mc-m-time{font-size:.6rem;color:#888;text-align:right;margin-top:2px}
        .mc-input{background:#f0f2f5;padding:6px 12px;display:flex;gap:8px;align-items:center;flex-shrink:0}
        .mc .mc-input input{flex:1;border:none;border-radius:20px;padding:8px 14px;font-size:.84rem;outline:none;background:#fff;font-family:inherit}
        .mc-send-btn{background:#25D366;color:#fff;border:none;border-radius:50%;width:34px;height:34px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .mc-send-btn:disabled{background:#cbd5e1;cursor:not-allowed}
        .mc-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#94a3b8;text-align:center;padding:16px}
        .mc-campaign{border-bottom:1px solid #e2e8f0;background:#fefce8;flex-shrink:0}
        .mc-campaign-hdr{padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:6px;font-weight:600;font-size:.85rem;color:#92400e}
        .mc-campaign-body{padding:0 16px 12px;display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start}
        .mc-seg{padding:3px 10px;border-radius:16px;font-size:.75rem;font-weight:600;cursor:pointer;border:2px solid transparent;transition:all .12s;display:inline-flex;align-items:center;gap:4px}
        .mc-seg.on{border-color:currentColor;opacity:1}
        .mc-seg.off{opacity:.45}
        .mc-btn{padding:5px 12px;border-radius:8px;font-size:.78rem;font-weight:600;border:1px solid #d1d5db;background:#fff;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all .15s;font-family:inherit}
        .mc-btn:hover{border-color:#22c55e;color:#22c55e}
        .mc-btn:disabled{opacity:.5;cursor:not-allowed}
        .mc-btn.primary{background:#22c55e;color:#fff;border-color:#22c55e}
        .mc-btn.primary:hover{background:#16a34a}
        .mc-result{font-size:.78rem;padding:4px 10px;border-radius:6px;background:#f0fdf4;color:#166534;border:1px solid #bbf7d0}
        .mc-back-btn{display:none;background:none;border:none;cursor:pointer;color:#0f172a;padding:4px}
        @media(max-width:768px){
          .mc-body{flex-direction:column}
          .mc-left{display:${selectedLead ? 'none' : 'flex'} !important;width:100% !important;min-width:auto !important;border-right:none;height:100%}
          .mc-right{display:${selectedLead ? 'flex' : 'none'} !important;width:100% !important;height:100%}
          .mc-back-btn{display:flex !important}
          .mc-stats{gap:6px;padding:8px 12px}
          .mc-stat{padding:6px 10px;min-width:70px}
          .mc-stat-num{font-size:1.1rem}
          .mc-stat-label{font-size:.58rem}
          .mc-m{max-width:85%}
          .mc-campaign-body{flex-direction:column;gap:8px}
          .mc-item{padding:8px 10px}
        }
        @media(max-width:480px){
          .mc-top{padding:8px 12px}
          .mc-top h4{font-size:.95rem}
          .mc-stats{flex-wrap:nowrap}
        }
      `}</style>

      <div className="mc">
        {/* Header */}
        <div className="mc-top">
          <h4>
            <FaWhatsapp style={{ color: '#25D366' }} />
            ManyChat
            <span style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 400 }}>
              {status?.importedToSupabase || 0} importados de {status?.totalContacts || 0}
            </span>
            <div className="mc-top-acts">
              <button className="mc-btn" onClick={() => setShowCampaign(!showCampaign)} style={{ fontSize: '.72rem' }}>
                <FaPaperPlane /> Campaña {showCampaign ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
              </button>
              <button className="mc-btn" onClick={() => { fetchStatus(); fetchLeads(); }}>
                <FaSync size={12} />
              </button>
            </div>
          </h4>
        </div>

        {/* Campaign panel (collapsible) */}
        {showCampaign && (
          <div className="mc-campaign">
            <div className="mc-campaign-body" style={{ paddingTop: 10 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: '.72rem', fontWeight: 600, color: '#92400e', marginBottom: 6 }}>SEGMENTOS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {SEGMENTS.map(seg => (
                    <span key={seg} className={`mc-seg ${selectedSegments.includes(seg) ? 'on' : 'off'}`}
                      style={{ color: SEG_COLOR[seg], background: selectedSegments.includes(seg) ? SEG_COLOR[seg] + '18' : '#f1f5f9' }}
                      onClick={() => toggleSegment(seg)}>
                      {selectedSegments.includes(seg) && <FaCheck size={9} />}
                      {SEG_LABEL[seg]} ({status?.segmentCounts?.[seg] || 0})
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <label style={{ fontSize: '.72rem', fontWeight: 600, color: '#92400e', whiteSpace: 'nowrap' }}>Max:</label>
                  <input type="number" value={maxPerRun} onChange={e => setMaxPerRun(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1} max={200} style={{ width: 60, padding: '3px 6px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '.8rem', fontFamily: 'inherit' }} />
                  <label style={{ fontSize: '.72rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)} />
                    {dryRun ? 'Sim' : <span style={{ color: '#dc2626', fontWeight: 700 }}>REAL</span>}
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="mc-btn" onClick={handleImport} disabled={importing || selectedSegments.length === 0}>
                    {importing ? '...' : <><FaUpload size={11} /> Importar</>}
                  </button>
                  <button className={`mc-btn ${dryRun ? '' : 'primary'}`} onClick={handleSend} disabled={sending || selectedSegments.length === 0}>
                    {sending ? '...' : <><FaPaperPlane size={11} /> Enviar</>}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <select value={previewSegment} onChange={e => setPreviewSegment(e.target.value)}
                    style={{ fontSize: '.72rem', padding: '3px 6px', borderRadius: 6, border: '1px solid #d1d5db', fontFamily: 'inherit' }}>
                    {SEGMENTS.map(s => <option key={s} value={s}>{SEG_LABEL[s]}</option>)}
                  </select>
                  <button className="mc-btn" onClick={handlePreview} disabled={previewing} style={{ fontSize: '.72rem' }}>
                    <FaEye size={11} /> Preview
                  </button>
                </div>
                {importResult && <span className="mc-result">{importResult.created} creados, {importResult.updated} actualizados</span>}
                {sendResult && <span className="mc-result">{sendResult.sent} enviados, {sendResult.skipped} saltados</span>}
              </div>
            </div>
            {previews && (
              <div style={{ padding: '0 16px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '.8rem' }}>Preview: {SEG_LABEL[previews.segment]}</span>
                  <button className="mc-btn" onClick={() => setPreviews(null)} style={{ fontSize: '.7rem', padding: '2px 8px' }}>Cerrar</button>
                </div>
                {previews.previews.map((p, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 8, padding: 8, marginBottom: 4, border: '1px solid #e5e7eb', fontSize: '.78rem' }}>
                    <strong>{p.nombre || p.wa_id}</strong>
                    <div style={{ whiteSpace: 'pre-wrap', marginTop: 4, color: '#374151' }}>{p.message || '(no se enviaría)'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filter tabs */}
        <div className="mc-stats">
          {FILTERS.map(f => {
            const Icon = f.icon;
            const count = f.key === 'todos' ? (leadsStats.total || leads.length)
              : f.key === 'respondieron' ? (leadsStats.respondieron || 0)
              : f.key === 'enviados' ? (leadsStats.enviados || 0)
              : (leadsStats.pendientes || 0);
            return (
              <div key={f.key} className={`mc-stat ${activeFilter === f.key ? 'active' : ''}`} onClick={() => handleFilterChange(f.key)}>
                <span className="mc-stat-num" style={{ color: f.color }}>{count}</span>
                <span className="mc-stat-label"><Icon size={9} style={{ marginRight: 2 }} />{f.label}</span>
              </div>
            );
          })}
        </div>

        {/* Main body: list + chat */}
        <div className="mc-body">
          {/* Lead list */}
          <div className="mc-left">
            <div className="mc-list">
              {leadsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><div className="mc-spin" /></div>
              ) : leads.length === 0 ? (
                <div className="mc-empty" style={{ padding: 40 }}>
                  <FaFilter size={28} style={{ opacity: .3 }} />
                  <p style={{ margin: 0, fontSize: '.85rem' }}>Sin leads en "{FILTERS.find(f => f.key === activeFilter)?.label}"</p>
                </div>
              ) : leads.map(lead => {
                const sel = selectedLead?.wa_id === lead.wa_id;
                const colors = ['#25D366','#0088E0','#7C3AED','#F59E0B','#EF4444','#10B981','#8B5CF6','#3B82F6'];
                const avCol = colors[(lead.nombre || lead.wa_id || '?').charCodeAt(0) % colors.length];
                return (
                  <div key={lead.wa_id} className={`mc-item${sel ? ' sel' : ''}`} onClick={() => handleSelectLead(lead)}>
                    <div className="mc-item-av" style={{ background: avCol }}>{(lead.nombre || lead.wa_id || '?')[0].toUpperCase()}</div>
                    <div className="mc-item-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="mc-item-name">{lead.nombre || lead.wa_id}</span>
                        <span className="mc-item-time">{fmt(lead.updated_at)}</span>
                      </div>
                      <div className="mc-item-preview">{lead.ultimo_mensaje_preview || lead.estado_sofia || ''}</div>
                      <div className="mc-item-meta">
                        {segBadge(lead.manychat_segment)}
                        {estadoBadge(lead.estado_sofia)}
                        {lead.modo_humano && <span style={{ background: '#ff9800', color: '#fff', padding: '1px 5px', borderRadius: 8, fontSize: '.58rem', fontWeight: 700 }}>H</span>}
                        {lead.atendido_por && <span style={{ fontSize: '.58rem', color: '#64748b' }}>{lead.atendido_por}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat panel */}
          <div className="mc-right">
            {!selectedLead ? (
              <div className="mc-empty">
                <FaComments size={40} style={{ color: '#25D366', opacity: .4 }} />
                <p style={{ margin: 0, fontWeight: 600, color: '#0f172a', fontSize: '.95rem' }}>Selecciona un lead</p>
                <p style={{ margin: 0, fontSize: '.8rem', color: '#64748b' }}>Elige un contacto de la lista</p>
              </div>
            ) : (
              <>
                <div className="mc-ch-head">
                  <button className="mc-back-btn" onClick={() => setSelectedLead(null)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="mc-ch-name">{selectedLead.nombre || selectedLead.wa_id}</span>
                    <span className="mc-ch-sub" style={{ marginLeft: 6 }}>+{selectedLead.wa_id}</span>
                    <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>{segBadge(selectedLead.manychat_segment)} {estadoBadge(selectedLead.estado_sofia)}</div>
                  </div>
                  <button className={`mc-btn ${selectedLead.modo_humano ? 'primary' : ''}`} onClick={handleToggleHumano} disabled={togglingHumano} style={{ fontSize: '.72rem' }}>
                    {togglingHumano ? '...' : <>{selectedLead.modo_humano ? <><FaUserTie size={11} /> Humano</> : <><FaRobot size={11} /> AI</>}</>}
                  </button>
                </div>

                <div className="mc-msgs">
                  {chatLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}><div className="mc-spin" /></div>
                  ) : chatMessages.length === 0 ? (
                    <div className="mc-empty"><FaComments size={28} style={{ opacity: .3 }} /><p style={{ margin: 0 }}>Sin mensajes</p></div>
                  ) : chatMessages.map((msg, i) => {
                    const isUser = msg.role === 'user';
                    const isH = isHuman(msg.content);
                    const content = msg.content || '';
                    if (content.startsWith('[STATE:')) return null;
                    const cleanContent = isH ? content.replace(/\[HUMANO:.*?\]\s*/, '') : content.replace(/\[STATE:\{.*?\}\]/g, '').trim();
                    if (!cleanContent) return null;
                    return (
                      <div key={i} className={`mc-m ${isUser ? 'u' : isH ? 'h' : 'a'}`}>
                        <div className="mc-m-sender" style={{ color: isUser ? '#2e7d32' : isH ? '#e65100' : '#1565c0' }}>
                          {isUser ? <><FaUser size={9} /> {selectedLead.nombre || 'Lead'}</> : isH ? <><FaUserTie size={9} /> {content.match(/\[HUMANO:(.*?)\]/)?.[1] || 'Admin'}</> : <><FaRobot size={9} /> Sofia</>}
                        </div>
                        {cleanContent}
                        {msg.mediaUrl && msg.mimetype?.includes('audio') && <audio controls src={msg.mediaUrl} style={{ width: '100%', maxWidth: 260, marginTop: 4 }} />}
                        {msg.mediaUrl && msg.mimetype?.includes('image') && <img src={msg.mediaUrl} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, marginTop: 4 }} />}
                        <div className="mc-m-time">{fmt(msg.timestamp)}</div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                <div className="mc-input">
                  {!selectedLead.modo_humano ? (
                    <div style={{ flex: 1, textAlign: 'center', fontSize: '.78rem', color: '#64748b', padding: '4px 0' }}>
                      <FaRobot style={{ marginRight: 4 }} /> Sofia atiende. Activa <strong>modo humano</strong> para responder.
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center' }}>
                      <input ref={msgInputRef} type="text" placeholder="Escribe un mensaje..." value={msgText}
                        onChange={e => setMsgText(e.target.value)} disabled={sendingMsg} />
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
    </>
  );
}
