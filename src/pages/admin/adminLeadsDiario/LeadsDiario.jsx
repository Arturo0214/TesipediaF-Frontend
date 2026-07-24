import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaUserClock, FaSync, FaChevronLeft, FaChevronRight, FaSearch, FaFileCsv,
  FaWhatsapp, FaExclamationTriangle, FaUsers, FaFileInvoiceDollar,
  FaHourglassHalf, FaMoneyBillWave, FaTrophy, FaCommentDots,
} from 'react-icons/fa';
import { getLeadsDiario, updateLeadSeguimiento } from '../../../services/leadsDiarioService';
import './LeadsDiario.css';

const ESTADOS_META = {
  bienvenida: { label: 'Sin respuesta', color: '#9CA3AF' },
  calificando: { label: 'Calificando', color: '#F59E0B' },
  cotizando: { label: 'Cotizando', color: '#3B82F6' },
  cotizacion_iniciada: { label: 'Cotizando', color: '#3B82F6' },
  cotizacion_lista: { label: 'Cotización lista', color: '#60A5FA' },
  cotizacion_enviada: { label: 'Cotización enviada', color: '#8B5CF6' },
  cotizacion_confirmada: { label: 'Cotización confirmada', color: '#A78BFA' },
  esperando_aprobacion: { label: 'Esperando aprobación', color: '#F97316' },
  cliente_acepto: { label: 'Cliente aceptó', color: '#22C55E' },
  pagado: { label: 'Pagado', color: '#10B981' },
  descartado: { label: 'Descartado', color: '#EF4444' },
  no_interesado: { label: 'No interesado', color: '#F87171' },
  modo_humano: { label: 'Modo humano', color: '#38BDF8' },
};

const RAZONES_DESCARTE = [
  { v: '', label: '— Razón de descarte —' },
  { v: 'precio', label: 'Precio' },
  { v: 'dejo_de_responder', label: 'Dejó de responder' },
  { v: 'solo_informacion', label: 'Solo pedía información' },
  { v: 'tiempo_entrega', label: 'Tiempo de entrega' },
  { v: 'desconfianza', label: 'Desconfianza' },
  { v: 'competencia', label: 'Se fue con competencia' },
  { v: 'numero_equivocado', label: 'Número equivocado / spam' },
  { v: 'otro', label: 'Otro (ver observaciones)' },
];

const FILTROS = [
  { v: 'todos', label: 'Todos' },
  { v: 'sin_respuesta', estados: ['bienvenida'], label: 'Sin respuesta' },
  { v: 'en_proceso', estados: ['calificando', 'cotizando', 'cotizacion_iniciada', 'cotizacion_lista', 'modo_humano'], label: 'En proceso' },
  { v: 'cotizados', estados: ['cotizacion_enviada', 'cotizacion_confirmada', 'cliente_acepto'], label: 'Cotizados' },
  { v: 'esperando', estados: ['esperando_aprobacion'], label: 'Esperando aprobación' },
  { v: 'pagados', estados: ['pagado'], label: 'Pagados' },
  { v: 'descartados', estados: ['descartado', 'no_interesado'], label: 'Descartados' },
  { v: 'senales', label: 'Con señales ⚠' },
];

const hoyCdmx = () => new Date(Date.now() - 6 * 3600e3).toISOString().slice(0, 10);
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
const fmtHora = (d) => (d ? new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' }) : '—');
const fmtHace = (h) => {
  if (h == null) return '—';
  if (h < 1) return `hace ${Math.max(1, Math.round(h * 60))} min`;
  if (h < 48) return `hace ${Math.round(h)}h`;
  return `hace ${Math.round(h / 24)} días`;
};

const origenLead = (l) => {
  if (l.ad_campaign_name) return l.ad_campaign_name;
  if (l.ad_source === 'facebook' || l.ad_id) return 'Campaña Face';
  if (l.origen === 'manychat') return 'ManyChat';
  return 'Directo';
};

function LeadsDiario() {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState(hoyCdmx());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [fDueno, setFDueno] = useState('');
  const [obsDraft, setObsDraft] = useState({}); // wa_id → texto en edición
  const fechaRef = useRef(fecha);
  fechaRef.current = fecha;

  const fetchData = useCallback(async (f, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const d = await getLeadsDiario(f);
      // Evitar pisar la vista si el usuario ya cambió de día
      if (fechaRef.current === f) setData(d);
    } catch {
      if (!silent) toast.error('Error al cargar el tablero de leads');
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => { fetchData(fecha); }, [fecha, fetchData]);

  // Auto-refresh silencioso cada 60s (tablero dinámico)
  useEffect(() => {
    const t = setInterval(() => fetchData(fechaRef.current, true), 60000);
    return () => clearInterval(t);
  }, [fetchData]);

  const moverDia = (delta) => {
    const d = new Date(`${fecha}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + delta);
    const nueva = d.toISOString().slice(0, 10);
    if (nueva <= hoyCdmx()) setFecha(nueva);
  };

  const leads = data?.leads || [];
  const stats = data?.stats || null;
  const bench = data?.patronCompradores || null;

  const duenos = useMemo(
    () => [...new Set(leads.map((l) => (l.atendido_por || '').toLowerCase().trim()).filter(Boolean))].sort(),
    [leads]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fDef = FILTROS.find((f) => f.v === filtro);
    return leads.filter((l) => {
      if (q && !((l.nombre || '').toLowerCase().includes(q) || (l.wa_id || '').includes(q)
        || (l.tema || '').toLowerCase().includes(q) || (l.carrera || '').toLowerCase().includes(q))) return false;
      if (filtro === 'senales' && !(l.senales?.length > 0)) return false;
      if (fDef?.estados && !fDef.estados.includes(l.estado_sofia)) return false;
      if (fDueno === 'sin_asignar' && l.atendido_por) return false;
      if (fDueno && fDueno !== 'sin_asignar' && (l.atendido_por || '').toLowerCase().trim() !== fDueno) return false;
      return true;
    });
  }, [leads, search, filtro, fDueno]);

  const patchLead = (waId, patch) =>
    setData((prev) => prev ? { ...prev, leads: prev.leads.map((l) => (l.wa_id === waId ? { ...l, ...patch } : l)) } : prev);

  const saveObs = async (l) => {
    const texto = obsDraft[l.wa_id];
    if (texto === undefined || texto === (l.notas_admin || '')) return;
    patchLead(l.wa_id, { notas_admin: texto });
    try { await updateLeadSeguimiento(l.wa_id, { notas_admin: texto }); toast.success('Observación guardada'); }
    catch { toast.error('No se pudo guardar'); }
  };

  const saveRazon = async (l, razon) => {
    patchLead(l.wa_id, { razon_descarte: razon });
    try { await updateLeadSeguimiento(l.wa_id, { razon_descarte: razon }); toast.success('Razón guardada'); }
    catch { toast.error('No se pudo guardar'); }
  };

  const abrirChat = (l) => {
    try { sessionStorage.setItem('wa_jump_search', l.wa_id); } catch { /* no-op */ }
    navigate('/admin/whatsapp');
  };

  const exportCsv = () => {
    const headers = ['No', 'Nombre', 'Teléfono', 'Fecha de llegada', 'Dueño', 'Origen', 'Estatus', 'Último mensaje', 'De quién', 'Hace', 'Señales', 'Observaciones', 'Razón de descarte', 'Precio'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = filtered.map((l, i) => [
      i + 1, l.nombre || 'Sin nombre', l.wa_id, `${fecha} ${fmtHora(l.created_at)}`,
      cap(l.atendido_por) || 'Sin asignar', origenLead(l),
      ESTADOS_META[l.estado_sofia]?.label || l.estado_sofia || '—',
      l.ultimoMensaje?.texto || '', l.ultimoMensaje?.de === 'cliente' ? 'Cliente' : (l.ultimoMensaje?.de ? 'Nosotros' : ''),
      fmtHace(l.ultimoMensaje?.horasDesde),
      (l.senales || []).map((s) => s.texto).join(' | '),
      l.notas_admin || '', RAZONES_DESCARTE.find((r) => r.v === l.razon_descarte)?.label || '', l.precio || '',
    ].map(esc).join(','));
    const csv = '﻿' + [headers.map(esc).join(','), ...lines].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = `leads-${fecha}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const kpis = stats ? [
    { icon: FaUsers, n: stats.total, l: 'Leads del día', cls: '', f: 'todos' },
    { icon: FaCommentDots, n: `${stats.contestaron} (${stats.total ? Math.round((stats.contestaron / stats.total) * 100) : 0}%)`, l: 'Contestaron', cls: '', f: 'todos' },
    { icon: FaFileInvoiceDollar, n: `${stats.cotizados} (${stats.tasaCotizacion}%)`, l: 'Cotizados · tasa conversión', cls: 'ld-kpi-violet', f: 'cotizados' },
    { icon: FaHourglassHalf, n: stats.esperandoAprobacion, l: 'Esperando aprobación', cls: 'ld-kpi-amber', f: 'esperando' },
    { icon: FaMoneyBillWave, n: `${stats.pagados} (${stats.tasaPago}%)`, l: 'Pagados · tasa de pago', cls: 'ld-kpi-green', f: 'pagados' },
    { icon: FaTrophy, n: `${stats.tasaCierre}%`, l: 'Cierre (pagados / cotizados)', cls: 'ld-kpi-green', f: 'pagados' },
    { icon: FaExclamationTriangle, n: stats.conSenales, l: 'Con señales de riesgo', cls: 'ld-kpi-red', f: 'senales' },
  ] : [];

  return (
    <div className="ld-wrap">
      <div className="ld-head">
        <h2><FaUserClock /> Leads del Día</h2>
        <div className="ld-head-btns">
          <button className="ld-btn ld-btn-ghost" onClick={exportCsv} disabled={!filtered.length}><FaFileCsv /> CSV</button>
          <button className="ld-btn ld-btn-primary" onClick={() => fetchData(fecha)} disabled={loading}>
            <FaSync className={loading ? 'ld-spin' : ''} /> Actualizar
          </button>
        </div>
      </div>
      <p className="ld-sub">
        Qué pasó con cada lead que llegó en el día: dueño, origen, estatus, último mensaje y señales de por qué
        no ha comprado, comparado contra el patrón de los que sí pagan. Se actualiza solo cada minuto.
      </p>

      <div className="ld-datenav">
        <button className="ld-btn ld-btn-ghost" onClick={() => moverDia(-1)} title="Día anterior"><FaChevronLeft /></button>
        <input
          type="date" className="ld-date" value={fecha} max={hoyCdmx()}
          onChange={(e) => e.target.value && setFecha(e.target.value)}
        />
        <button className="ld-btn ld-btn-ghost" onClick={() => moverDia(1)} disabled={fecha >= hoyCdmx()} title="Día siguiente"><FaChevronRight /></button>
        {fecha !== hoyCdmx() && (
          <button className="ld-btn ld-btn-ghost" onClick={() => setFecha(hoyCdmx())}>Hoy</button>
        )}
      </div>

      {stats && (
        <div className="ld-kpis">
          {kpis.map((k) => (
            <button key={k.l} className={`ld-kpi ${k.cls}${filtro === k.f && k.f !== 'todos' ? ' ld-kpi-active' : ''}`}
              onClick={() => setFiltro(filtro === k.f ? 'todos' : k.f)}>
              <span className="ld-kpi-ic"><k.icon /></span>
              <span><span className="ld-kpi-n">{k.n}</span><span className="ld-kpi-l">{k.l}</span></span>
            </button>
          ))}
        </div>
      )}

      {bench && (
        <div className="ld-bench">
          <span className="ld-bench-title"><FaTrophy /> Patrón de los que compran (90 días, {bench.n} pagados):</span>
          {bench.precioMediana > 0 && <span>ticket típico <b>${Number(bench.precioMediana).toLocaleString('es-MX')}</b></span>}
          {bench.diasCierreMediana != null && <span>cierran en <b>~{bench.diasCierreMediana} día(s)</b></span>}
          {bench.topDueno && <span>quien más cierra: <b>{cap(bench.topDueno.nombre)}</b> ({bench.topDueno.cierres})</span>}
          {bench.topCampania && <span>campaña top: <b>{bench.topCampania.nombre}</b> ({bench.topCampania.cierres})</span>}
          <span>{bench.conDueno}/{bench.n} tenían dueño asignado</span>
        </div>
      )}

      <div className="ld-toolbar">
        <div className="ld-searchbox">
          <FaSearch />
          <input placeholder="Buscar por nombre, teléfono, tema o carrera…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ld-filters">
          {FILTROS.map((f) => (
            <button key={f.v} className={`ld-chip${filtro === f.v ? ' active' : ''}`} onClick={() => setFiltro(f.v)}>{f.label}</button>
          ))}
        </div>
        <select className="ld-select" value={fDueno} onChange={(e) => setFDueno(e.target.value)}>
          <option value="">Dueño: todos</option>
          {duenos.map((d) => <option key={d} value={d}>{cap(d)}</option>)}
          <option value="sin_asignar">Sin asignar</option>
        </select>
        <span className="ld-count">{filtered.length} de {leads.length} leads</span>
      </div>

      <div className="ld-table-wrap">
        <table className="ld-table">
          <thead>
            <tr>
              <th className="ld-c">#</th>
              <th>Lead</th>
              <th>Llegada</th>
              <th>Dueño</th>
              <th>Origen</th>
              <th>Estatus</th>
              <th>Último mensaje</th>
              <th>Señales / por qué no compra</th>
              <th>Observaciones</th>
              <th>Razón de descarte</th>
              <th className="ld-c">Chat</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <tr><td colSpan={11} className="ld-empty">Cargando…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={11} className="ld-empty">Sin leads {leads.length ? 'con este filtro' : 'este día'}</td></tr>
            ) : filtered.map((l, i) => {
              const em = ESTADOS_META[l.estado_sofia] || { label: l.estado_sofia || '—', color: '#9CA3AF' };
              const um = l.ultimoMensaje || {};
              const alerta = (l.senales || []).some((s) => s.severidad === 'alta');
              return (
                <tr key={l.wa_id} className={alerta ? 'ld-row-alert' : ''}>
                  <td className="ld-c ld-faint">{i + 1}</td>
                  <td>
                    <div className="ld-nombre">{l.nombre || 'Sin nombre'}</div>
                    <div className="ld-sub2">{l.wa_id}{l.precio > 0 ? ` · $${Number(l.precio).toLocaleString('es-MX')}` : ''}</div>
                  </td>
                  <td className="ld-nowrap">{fmtHora(l.created_at)}</td>
                  <td>{l.atendido_por ? cap(l.atendido_por) : <span className="ld-badge ld-badge-gray">Sin asignar</span>}</td>
                  <td className="ld-origen" title={l.ad_name || ''}>{origenLead(l)}</td>
                  <td><span className="ld-badge" style={{ background: `${em.color}26`, color: em.color }}>{em.label}</span></td>
                  <td className="ld-msg">
                    {um.texto ? (
                      <>
                        {um.de && (
                          <span className={`ld-msg-de ${um.de === 'cliente' ? 'ld-msg-cliente' : 'ld-msg-nos'}`}>
                            {um.de === 'cliente' ? 'Cliente' : 'Nosotros'}
                          </span>
                        )}
                        <span className="ld-msg-txt" title={um.texto}>{um.texto}</span>
                        <span className="ld-msg-hace">{fmtHace(um.horasDesde)}</span>
                      </>
                    ) : <span className="ld-faint">—</span>}
                  </td>
                  <td className="ld-senales">
                    {(l.senales || []).length === 0 ? <span className="ld-faint">—</span> :
                      l.senales.map((s, j) => (
                        <span key={j} className={`ld-senal ld-senal-${s.severidad}`} title={s.texto}>{s.texto}</span>
                      ))}
                  </td>
                  <td className="ld-obs">
                    <textarea
                      rows={1}
                      placeholder="Anotar…"
                      value={obsDraft[l.wa_id] !== undefined ? obsDraft[l.wa_id] : (l.notas_admin || '')}
                      onChange={(e) => setObsDraft((p) => ({ ...p, [l.wa_id]: e.target.value }))}
                      onBlur={() => saveObs(l)}
                    />
                  </td>
                  <td>
                    <select className="ld-select ld-select-sm" value={l.razon_descarte || ''} onChange={(e) => saveRazon(l, e.target.value)}>
                      {RAZONES_DESCARTE.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
                    </select>
                  </td>
                  <td className="ld-c">
                    <button className="ld-chatbtn" onClick={() => abrirChat(l)} title="Ver conversación"><FaWhatsapp /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeadsDiario;
