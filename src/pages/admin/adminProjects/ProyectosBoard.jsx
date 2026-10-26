import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  FaProjectDiagram, FaSyncAlt, FaSearch, FaWhatsapp, FaCheckCircle, FaRegClock,
  FaExclamationTriangle, FaStickyNote, FaHandshake, FaPaperclip, FaArrowLeft,
  FaChevronRight, FaChevronLeft, FaUserTie, FaRegCopy, FaFileAlt, FaMicrophone, FaStar,
  FaRegStar, FaCalendarDay, FaCalendarAlt, FaListUl, FaClipboardList, FaReceipt,
  FaCloudUploadAlt, FaTrashAlt, FaUser, FaRegUser, FaFileInvoiceDollar, FaExternalLinkAlt,
} from 'react-icons/fa';
import {
  getSeguimientos, addNota, updateSeguimiento, addAcuerdo,
  uploadComprobante, deleteComprobante, uploadArchivo, deleteArchivo, buscarLead,
} from '../../../services/seguimientoService';
import axiosWithAuth from '../../../utils/axioswithAuth';
import { onSocketEvent, offSocketEvent, isSocketConnected } from '../../../services/socket/socketService';
import './ProyectosBoard.css';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DAY = 24 * 60 * 60 * 1000;

const mxn = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Math.round(n || 0));
const soloDigitos = (s) => String(s || '').replace(/\D/g, '');
const fmtFecha = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtNota = (d) => d ? new Date(d).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
const fmtBytes = (b) => !b ? '' : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

const diasHasta = (d) => {
  if (!d) return null;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const f = new Date(d); f.setHours(0, 0, 0, 0);
  return Math.round((f - hoy) / DAY);
};
const relDias = (d) => {
  const n = diasHasta(d);
  if (n === null) return '';
  if (n === 0) return 'hoy';
  if (n === 1) return 'mañana';
  if (n > 0) return `en ${n}d`;
  return `hace ${-n}d`;
};

// Misma fórmula que Seguimiento: pagos pesan 90%, el switch de correcciones libera el 10% final
const calcAvance = (total, cobrado, correccionesListas) => {
  const frac = total > 0 ? Math.min(1, (cobrado || 0) / total) : 0;
  if (frac >= 0.999) return correccionesListas ? 100 : 90;
  return Math.round(frac * 90);
};

// ── Estatus automático del proyecto: se calcula de pagos + switch ──
const STATUS = {
  falta_pago: { label: 'Falta de pago', color: '#ef4444', bg: 'rgba(239,68,68,0.14)', icon: FaExclamationTriangle },
  en_proceso: { label: 'En proceso', color: '#3b82f6', bg: 'rgba(59,130,246,0.14)', icon: FaRegClock },
  correcciones: { label: 'En correcciones', color: '#a78bfa', bg: 'rgba(167,139,250,0.14)', icon: FaHandshake },
  completado: { label: 'Completado', color: '#10b981', bg: 'rgba(16,185,129,0.14)', icon: FaCheckCircle },
};
const calcStatus = (r) => {
  if (r.entregado || (r.liquidado && r.correccionesListas) || r.projectStatus === 'completed') return 'completado';
  if (r.liquidado) return 'correcciones';
  if (r.nVencidas > 0) return 'falta_pago';
  return 'en_proceso';
};

const cleanNota = (t) => String(t || '').replace(/^↳@[a-f0-9]{6,32}\|\s?/i, '↳ ');

// Normaliza texto para búsqueda: minúsculas y SIN acentos. Paula teclea "ceon" y el
// nombre guardado es "Ceón" — sin esto el .includes() falla por la tilde.
const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// URGENTE: la entrega es de HOY (o ya pasó) y no se ha desahogado —
// si la tarea del día no se cumple, se queda marcada urgente automáticamente
const isUrgente = (r) => r.urgente || (r.status !== 'completado' && !r.entregado && r.fechaEntrega && diasHasta(r.fechaEntrega) <= 0);
const UrgenteTag = () => <span className="pb-urgente">🚨 URGENTE</span>;

// Categorías de entrega para el modal "+ Entrega"
const CATEGORIAS_ENTREGA = [
  { k: 'avance_1', l: '1ª entrega · Avance' },
  { k: 'avance_2', l: '2ª entrega · Avance' },
  { k: 'avance_3', l: '3ª entrega · Avance' },
  { k: 'correcciones', l: 'Correcciones' },
  { k: 'final', l: 'Entrega final' },
  { k: 'otro', l: 'Otro' },
];

// Hilo de notas (mismo formato que Seguimiento): las contestaciones del cliente
// se guardan como "↳@<idDelMensaje>| texto" y se anidan bajo el mensaje enviado.
const REPLY_RE = /^↳@([a-f0-9]{6,32})\|\s?([\s\S]*)$/i;
const buildThread = (notas = []) => {
  const mains = [];
  const repliesByParent = {};
  for (const n of notas) {
    const m = REPLY_RE.exec(n?.texto || '');
    if (m) (repliesByParent[m[1]] = repliesByParent[m[1]] || []).push({ ...n, _clean: m[2] });
    else mains.push({ ...n, _clean: n?.texto || '' });
  }
  return { mains, repliesByParent };
};

const StatusChip = ({ status }) => {
  const meta = STATUS[status];
  const Icon = meta.icon;
  return <span className="pb-chip" style={{ color: meta.color, background: meta.bg }}><Icon /> {meta.label}</span>;
};

const AvanceBar = ({ avance }) => {
  const color = avance >= 100 ? '#10b981' : avance >= 90 ? '#a78bfa' : '#3b82f6';
  return (
    <div className="pb-avance" title={avance >= 100 ? 'Completado' : avance >= 90 ? 'Pagado 100% · correcciones pendientes' : `Avance por pagos: ${avance}%`}>
      <div className="pb-avance-bar"><span style={{ width: `${avance}%`, background: color }} /></div>
      <b style={{ color }}>{avance}%</b>
    </div>
  );
};

export default function ProyectosBoard() {
  // Solo Arturo y Paula pueden marcar PERSONAL / Prioritario
  const { user, isSuperAdmin } = useSelector((s) => s.auth || {});
  const uname = (user?.name || '').toLowerCase();
  const canMark = isSuperAdmin || uname.includes('arturo') || uname.includes('paula');
  const canDesahogar = isSuperAdmin || uname.includes('arturo'); // Paula carga, Arturo desahoga

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flagFilter, setFlagFilter] = useState(null); // 'personal' | 'prioritario'
  const [replyFor, setReplyFor] = useState(null);     // nota a la que se agrega contestación
  const [replyInput, setReplyInput] = useState('');
  const fileRefs = useRef({});
  const [view, setView] = useState('lista'); // lista | calendario | detalle (via detailId)
  const [detailId, setDetailId] = useState(null);
  // Filtros lista
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('activos');
  const [yearFilter, setYearFilter] = useState('todos');
  const [monthFilter, setMonthFilter] = useState('todos');
  const [entregaFilter, setEntregaFilter] = useState(null);
  // Calendario de entregas
  const [calMonth, setCalMonth] = useState(new Date());
  const [calFilter, setCalFilter] = useState('todas'); // todas|vencidas|hoy|semana|quincena|entregadas
  // Detalle: inputs
  const [notaInput, setNotaInput] = useState('');
  const [acuerdoTexto, setAcuerdoTexto] = useState('');
  const [acuerdoFecha, setAcuerdoFecha] = useState('');
  const [entregaHora, setEntregaHora] = useState('10:00');
  const [agendando, setAgendando] = useState(false);
  const [saving, setSaving] = useState(false);
  // Nueva entrega manual (botón + Entrega)
  const [showNueva, setShowNueva] = useState(false);
  const [nueva, setNueva] = useState({ rowId: null, query: '', categoria: '', quePidio: '', cuandoPidio: '', paraCuando: '', hora: '10:00', nota: '', leadInfo: null });
  const [nuevaFiles, setNuevaFiles] = useState([]); // archivos adjuntos de la entrega
  const [leadRemoto, setLeadRemoto] = useState([]); // resultados de búsqueda server-side (cualquier status)
  const [buscandoLead, setBuscandoLead] = useState(false);
  // Acceso del cliente al portal (credenciales reveladas por el admin)
  const [acceso, setAcceso] = useState({ loading: false, data: null }); // data: {userId,loginId,password,clientNumber,...}
  // Comentarios del cliente (mini-hilo del portal, visible/respondible desde aquí)
  const [chat, setChat] = useState({ open: false, loading: false, messages: [], text: '', sending: false });
  // Documentos protegidos del cliente (subir/liberar/borrar desde Proyectos)
  const [docs, setDocs] = useState({ loaded: false, uploading: false, items: [] });
  const [entregaModalId, setEntregaModalId] = useState(null); // modal compacto de una entrega
  const [msgCliente, setMsgCliente] = useState(''); // nota de Arturo para Paula al desahogar: qué decirle al cliente
  // Filtro por rango de fechas de entrega (todas las fechas, no solo hoy/mañana)
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  const fetchAll = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { rows: data } = await getSeguimientos();
      setRows((data || []).map((r) => ({
        ...r,
        status: calcStatus(r),
        avance: calcAvance(r.montoTotal, r.pagado, r.correccionesListas),
      })));
    } catch (err) {
      if (!silent) toast.error('No se pudieron cargar los proyectos');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Refresco EN VIVO: cuando Arturo o Paula cambian algo (nota, archivo, desahogo,
  // envío, flags) el backend emite 'proyectos:update' y la sección se actualiza sola.
  useEffect(() => {
    const handler = (data) => {
      fetchAll({ silent: true });
      if (data?.por) toast(`🔄 ${data.por} ${data.accion || 'actualizó proyectos'}`, { duration: 3500 });
    };
    let tries = 0;
    const timer = setInterval(() => {
      if (isSocketConnected() || tries++ > 20) {
        clearInterval(timer);
        onSocketEvent('proyectos:update', handler);
      }
    }, 500);
    return () => { clearInterval(timer); offSocketEvent('proyectos:update', handler); };
  }, [fetchAll]);

  const patchRow = (id, patch) => setRows((prev) => prev.map((r) => {
    if (String(r.id) !== String(id)) return r;
    const next = { ...r, ...patch };
    next.status = calcStatus(next);
    next.avance = calcAvance(next.montoTotal, next.pagado, next.correccionesListas);
    return next;
  }));

  // Búsqueda server-side de leads para "+ Entrega": encuentra clientes de CUALQUIER
  // status (no solo cotizaciones pagadas), para agendar entregas a quienes pagaron
  // por fuera del flujo online. Con debounce para no pegarle al backend en cada tecla.
  useEffect(() => {
    if (!showNueva || nueva.rowId) { setLeadRemoto([]); setBuscandoLead(false); return; }
    const q = nueva.query.trim();
    if (q.length < 2) { setLeadRemoto([]); setBuscandoLead(false); return; }
    setBuscandoLead(true);
    const t = setTimeout(async () => {
      try { setLeadRemoto(await buscarLead(q)); }
      catch { setLeadRemoto([]); }
      finally { setBuscandoLead(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [nueva.query, nueva.rowId, showNueva]);

  const detail = useMemo(() => rows.find((r) => String(r.id) === String(detailId)) || null, [rows, detailId]);
  // Limpiar credenciales reveladas al cambiar de proyecto (no filtrar entre clientes)
  useEffect(() => { setAcceso({ loading: false, data: null }); setChat({ open: false, loading: false, messages: [], text: '', sending: false }); setDocs({ loaded: false, uploading: false, items: [] }); }, [detailId]);

  // ── 📄 Documentos protegidos del cliente ──
  const cargarDocs = async (row) => {
    try { const { data } = await axiosWithAuth.get('/client-docs', { params: { quoteId: row.id } }); setDocs((d) => ({ ...d, loaded: true, items: data || [] })); }
    catch { setDocs((d) => ({ ...d, loaded: true })); }
  };
  const subirDoc = async (row, file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('El documento debe ser PDF'); return; }
    setDocs((d) => ({ ...d, uploading: true }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('clientName', row.cliente); fd.append('clientEmail', row.email || ''); fd.append('clientPhone', row.celular || '');
      fd.append('quoteId', row.id); fd.append('title', row.title || file.name.replace(/\.pdf$/i, ''));
      await axiosWithAuth.post('/client-docs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Documento subido y protegido ✅ — el cliente ya lo ve (si pagó)');
      await cargarDocs(row);
    } catch (e) { toast.error(e.response?.data?.message || 'No se pudo subir el documento'); }
    finally { setDocs((d) => ({ ...d, uploading: false })); }
  };
  const liberarDoc = async (id, row) => {
    try { await axiosWithAuth.post(`/client-docs/${id}/unlock`); toast.success('Documento LIBERADO (sin marca de agua + descargable) ✅'); await cargarDocs(row); }
    catch (e) { toast.error(e.response?.data?.message || 'No se pudo liberar'); }
  };
  const borrarDoc = async (id, row) => {
    if (!window.confirm('¿Borrar este documento del portal del cliente?')) return;
    try { await axiosWithAuth.delete(`/client-docs/${id}`); toast.success('Documento borrado'); await cargarDocs(row); }
    catch { toast.error('No se pudo borrar'); }
  };
  const entregaModal = useMemo(() => rows.find((r) => String(r.id) === String(entregaModalId)) || null, [rows, entregaModalId]);

  // ── Dashboard de entregas (solo proyectos no completados) ──
  const entregas = useMemo(() => {
    const activos = rows.filter((r) => r.status !== 'completado');
    const bucket = { atrasadas: [], hoy: [], manana: [], pasado: [], semana: [], sin_fecha: [], desahogados: [] };
    // Desahogados: Arturo ya adjuntó el FINAL, falta que Paula los envíe al cliente
    for (const r of rows) if (r.entregado && !r.entregaEnviada) bucket.desahogados.push(r);
    for (const r of activos) {
      const d = diasHasta(r.fechaEntrega);
      if (d === null) bucket.sin_fecha.push(r);
      else if (d < 0) {
        bucket.atrasadas.push(r);
        // Toda entrega AGENDADA (tiene acuerdo) que venció sin desahogarse se queda en
        // HOY hasta resolverse — no desaparece al día siguiente. Las vencidas de ayer
        // se arrastran aunque no tengan acuerdo (fecha puesta a mano).
        if ((r.acuerdos || []).length > 0 || d === -1) bucket.hoy.push(r);
      }
      else if (d === 0) bucket.hoy.push(r);
      else if (d === 1) bucket.manana.push(r);
      else if (d === 2) bucket.pasado.push(r);
      else if (d <= 7) bucket.semana.push(r);
    }
    const byFecha = (a, b) => new Date(a.fechaEntrega || 0) - new Date(b.fechaEntrega || 0);
    Object.values(bucket).forEach((arr) => arr.sort(byFecha));
    // Atrasadas: la vencida más RECIENTE arriba (lo de ayer es lo accionable;
    // los proyectos viejos con fecha pasada se van al fondo, no la entierran)
    bucket.atrasadas.reverse();
    return bucket;
  }, [rows]);

  const years = useMemo(() => {
    const s = new Set();
    rows.forEach((r) => { if (r.fechaEntrega) s.add(new Date(r.fechaEntrega).getFullYear()); });
    return [...s].sort((a, b) => b - a);
  }, [rows]);

  const filtered = useMemo(() => {
    const q = norm(search.trim());
    let arr = rows.filter((r) => {
      if (flagFilter === 'personal' && !r.personal) return false;
      if (flagFilter === 'prioritario' && !r.prioritario) return false;
      if (rangeFrom || rangeTo) {
        if (!r.fechaEntrega) return false;
        const f = new Date(r.fechaEntrega);
        if (rangeFrom && f < new Date(`${rangeFrom}T00:00:00`)) return false;
        if (rangeTo && f > new Date(`${rangeTo}T23:59:59`)) return false;
      }
      if (entregaFilter === 'desahogados') {
        if (!r.entregado) return false; // historial completo: pendientes de envío + ya enviados
      } else {
      if (statusFilter === 'activos' && r.status === 'completado') return false;
      if (statusFilter !== 'activos' && statusFilter !== 'todos' && r.status !== statusFilter) return false;
      if (yearFilter !== 'todos') {
        if (!r.fechaEntrega) return false;
        const f = new Date(r.fechaEntrega);
        if (f.getFullYear() !== Number(yearFilter)) return false;
        if (monthFilter !== 'todos' && f.getMonth() !== Number(monthFilter)) return false;
      }
      if (entregaFilter) {
        const d = diasHasta(r.fechaEntrega);
        if (r.status === 'completado') return false;
        if (entregaFilter === 'atrasadas' && !(d !== null && d < 0)) return false;
        if (entregaFilter === 'hoy' && !(d === 0 || (d !== null && d < 0 && ((r.acuerdos || []).length > 0 || d === -1)))) return false;
        if (entregaFilter === 'manana' && d !== 1) return false;
        if (entregaFilter === 'pasado' && d !== 2) return false;
        if (entregaFilter === 'semana' && !(d !== null && d >= 3 && d <= 7)) return false;
        if (entregaFilter === 'sin_fecha' && d !== null) return false;
      }
      }
      if (q) {
        const hay = norm(`${r.cliente} ${r.title} ${r.celular} ${r.vendedor}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const rank = { falta_pago: 0, en_proceso: 1, correcciones: 2, completado: 3 };
    arr.sort((a, b) => {
      if (entregaFilter === 'desahogados') {
        const ea = a.entregaEnviada ? 1 : 0, eb = b.entregaEnviada ? 1 : 0;
        if (ea !== eb) return ea - eb;
        return new Date(b.entregadoEn || 0) - new Date(a.entregadoEn || 0);
      }
      if (entregaFilter === 'atrasadas') {
        // Orden estricto por fecha: la vencida más reciente primero (ayer arriba)
        return new Date(b.fechaEntrega || 0) - new Date(a.fechaEntrega || 0);
      }
      if (!!a.prioritario !== !!b.prioritario) return !!b.prioritario - !!a.prioritario;
      const da = diasHasta(a.fechaEntrega); const db = diasHasta(b.fechaEntrega);
      const fa = da === null ? 9999 : da; const fb = db === null ? 9999 : db;
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
      return fa - fb;
    });
    return arr;
  }, [rows, search, statusFilter, yearFilter, monthFilter, entregaFilter, flagFilter, rangeFrom, rangeTo]);

  const statusCounts = useMemo(() => rows.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {}), [rows]);

  // ── Calendario de entregas: indicadores + filtro por días/semanas ──
  const calStats = useMemo(() => {
    const activos = rows.filter((r) => r.fechaEntrega);
    const stat = { vencidas: 0, hoy: 0, semana: 0, quincena: 0, entregadas: 0, porEntregar: 0 };
    for (const r of activos) {
      const d = diasHasta(r.fechaEntrega);
      if (r.status === 'completado') { stat.entregadas++; continue; }
      stat.porEntregar++;
      if (d < 0) { stat.vencidas++; if ((r.acuerdos || []).length > 0 || d === -1) stat.hoy++; }
      else if (d === 0) { stat.hoy++; stat.semana++; stat.quincena++; }
      else if (d <= 7) { stat.semana++; stat.quincena++; }
      else if (d <= 14) stat.quincena++;
    }
    return stat;
  }, [rows]);

  const matchCalFilter = useCallback((r) => {
    const d = diasHasta(r.fechaEntrega);
    switch (calFilter) {
      case 'vencidas': return r.status !== 'completado' && d !== null && d < 0;
      case 'hoy': return r.status !== 'completado' && (d === 0 || (d !== null && d < 0 && ((r.acuerdos || []).length > 0 || d === -1))); // + vencidas agendadas sin desahogar
      case 'semana': return r.status !== 'completado' && d !== null && d >= 0 && d <= 7;
      case 'quincena': return r.status !== 'completado' && d !== null && d >= 0 && d <= 14;
      case 'entregadas': return r.status === 'completado';
      default: return true;
    }
  }, [calFilter]);

  const conFecha = useMemo(() => rows.filter((r) => r.fechaEntrega && matchCalFilter(r)), [rows, matchCalFilter]);

  // Agenda agrupada por día (para ver "por días / por semanas" en lista)
  const agenda = useMemo(() => {
    const byDay = new Map();
    for (const r of conFecha) {
      const key = new Date(r.fechaEntrega).toISOString().slice(0, 10);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(r);
    }
    // Orden por URGENCIA: días con pendientes primero (vencidos más viejos arriba),
    // días donde ya todo se entregó se van al final.
    const entries = [...byDay.entries()];
    const done = ([, list]) => list.every((r) => r.status === 'completado') ? 1 : 0;
    // Con filtro "Vencidas": el día vencido más RECIENTE primero (ayer arriba)
    entries.sort((a, b) => done(a) - done(b) || (calFilter === 'vencidas' ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0])));
    for (const [, list] of entries) {
      list.sort((x, y) => ((x.status === 'completado') - (y.status === 'completado')) || (!!y.prioritario - !!x.prioritario));
    }
    return entries;
  }, [conFecha, calFilter]);

  // ── Acciones ──
  const handleCorrecciones = async (row, valor) => {
    patchRow(row.id, { correccionesListas: valor });
    try {
      await updateSeguimiento('quote', row.id, { correccionesListas: valor });
      toast.success(valor ? 'Correcciones terminadas ✅' : 'Proyecto reabierto');
    } catch { toast.error('No se pudo guardar'); patchRow(row.id, { correccionesListas: !valor }); }
  };

  const handleEntregado = async (row, valor) => {
    patchRow(row.id, { entregado: valor });
    try {
      const resp = await updateSeguimiento('quote', row.id, { entregado: valor });
      patchRow(row.id, { entregadoEn: resp.entregadoEn });
      // Al marcar entregado, si hay mensaje para el cliente, lo guarda como nota
      if (valor && msgCliente.trim()) {
        try { const { notas } = await addNota('quote', row.id, `📨 Mensaje para el cliente: ${msgCliente.trim()}`); patchRow(row.id, { notas }); setMsgCliente(''); } catch { /* noop */ }
      }
      toast.success(valor ? 'Entrega marcada como completada ✅' : 'Entrega desmarcada');
    } catch { toast.error('No se pudo guardar'); patchRow(row.id, { entregado: !valor }); }
  };

  const handleFechaEntrega = async (row, fecha) => {
    const prev = row.fechaEntrega;
    patchRow(row.id, { fechaEntrega: fecha ? `${fecha}T12:00:00` : null });
    try { await updateSeguimiento('quote', row.id, { fechaEntrega: fecha ? `${fecha}T12:00:00` : null }); toast.success('Fecha de entrega actualizada'); }
    catch { toast.error('No se pudo guardar la fecha'); patchRow(row.id, { fechaEntrega: prev }); }
  };

  const handleAddNota = async (row) => {
    const t = notaInput.trim();
    if (!t) return;
    setSaving(true);
    try {
      const { notas } = await addNota('quote', row.id, t);
      patchRow(row.id, { notas });
      setNotaInput('');
    } catch { toast.error('No se pudo agregar la nota'); }
    finally { setSaving(false); }
  };

  const handleAddAcuerdo = async (row) => {
    if (!acuerdoTexto.trim() && !acuerdoFecha) { toast.error('Escribe el acuerdo o pon fecha'); return; }
    setSaving(true);
    try {
      const { acuerdos, fechaEntrega } = await addAcuerdo('quote', row.id, { texto: acuerdoTexto, fechaEntrega: acuerdoFecha || null });
      patchRow(row.id, { acuerdos, ultimoAcuerdo: acuerdos[acuerdos.length - 1] || null, fechaEntrega: fechaEntrega || row.fechaEntrega });
      setAcuerdoTexto(''); setAcuerdoFecha('');
      toast.success('Acuerdo guardado ✅');
    } catch { toast.error('No se pudo guardar el acuerdo'); }
    finally { setSaving(false); }
  };

  const copiar = async (texto, msg) => {
    try { await navigator.clipboard.writeText(texto); toast.success(msg); } catch { /* noop */ }
  };

  // ── Marcas PERSONAL / Prioritario (solo Arturo y Paula) ──
  const handleFlag = async (row, campo, valor) => {
    patchRow(row.id, { [campo]: valor });
    try {
      await updateSeguimiento('quote', row.id, { [campo]: valor });
      toast.success(campo === 'personal'
        ? (valor ? 'Marcado como PERSONAL 👤' : 'Ya no es personal')
        : (valor ? 'Marcado como Prioritario ⭐' : 'Ya no es prioritario'));
    } catch { toast.error('No se pudo guardar'); patchRow(row.id, { [campo]: !valor }); }
  };

  // ── 🔑 Acceso del cliente al portal: revelar / regenerar / reenviar credenciales ──
  const handleRevelarAcceso = async (row) => {
    setAcceso({ loading: true, data: null });
    try {
      const { data } = await axiosWithAuth.post('/client-access/reveal', {
        clientName: row.cliente, clientEmail: row.email, clientPhone: row.celular, projectTitle: row.title,
      });
      setAcceso({ loading: false, data });
    } catch (e) {
      setAcceso({ loading: false, data: null });
      toast.error(e.response?.data?.message || 'No se pudo obtener el acceso del cliente');
    }
  };
  const handleRegenerarAcceso = async () => {
    if (!acceso.data?.userId) return;
    setAcceso((p) => ({ ...p, loading: true }));
    try {
      const { data } = await axiosWithAuth.post('/client-access/regenerate', { userId: acceso.data.userId });
      setAcceso({ loading: false, data });
      toast.success('Nueva contraseña generada 🔄');
    } catch (e) { setAcceso((p) => ({ ...p, loading: false })); toast.error(e.response?.data?.message || 'No se pudo regenerar'); }
  };
  const handleReenviarAcceso = async () => {
    if (!acceso.data?.userId) return;
    try {
      const { data } = await axiosWithAuth.post('/client-access/resend', { userId: acceso.data.userId });
      toast.success(data?.sent ? 'Acceso reenviado por WhatsApp 📲' : 'No hay teléfono para reenviar');
    } catch (e) { toast.error(e.response?.data?.message || 'No se pudo reenviar'); }
  };
  const copiarAcceso = () => {
    const a = acceso.data; if (!a) return;
    const txt = [
      `Hola ${a.nombre || ''} 👋 Aquí das seguimiento a tu proyecto en Tesipedia:`,
      `${a.portalUrl}`,
      `Usuario: ${a.loginId}`,
      `Contraseña: ${a.password}`,
    ].join('\n');
    copiar(txt, 'Mensaje de acceso copiado — pégalo al cliente');
  };

  // ── 💬 Comentarios del cliente (mini-hilo del portal) ──
  const cargarChat = async (row) => {
    setChat((p) => ({ ...p, open: true, loading: true }));
    try {
      const { data } = await axiosWithAuth.get('/client-chat', { params: { clientEmail: row.email, clientPhone: row.celular } });
      setChat((p) => ({ ...p, loading: false, messages: data.messages || [], clientId: data.clientId }));
    } catch { setChat((p) => ({ ...p, loading: false })); toast.error('No se pudieron cargar los comentarios'); }
  };
  const enviarChat = async (row) => {
    const t = (chat.text || '').trim(); if (!t) return;
    setChat((p) => ({ ...p, sending: true }));
    try {
      const { data } = await axiosWithAuth.post('/client-chat', { clientEmail: row.email, clientPhone: row.celular, text: t });
      setChat((p) => ({ ...p, sending: false, text: '', messages: [...p.messages, data.message] }));
    } catch { setChat((p) => ({ ...p, sending: false })); toast.error('No se pudo enviar'); }
  };

  // ── 🔒 Candado de venta PERSONAL: mismo flag global de Cotizaciones/Revenue/Seguimiento ──
  const handleTogglePrivado = async (row) => {
    try {
      const { data } = await axiosWithAuth.post('/revenue/privado', { source: 'sofia', id: row.id, privado: !row.privado });
      patchRow(row.id, { privado: data.privado });
      toast.success(data.privado
        ? `🔒 ${data.clientName || 'Proyecto'}: ahora solo tú y Paula lo ven`
        : `🔓 ${data.clientName || 'Proyecto'}: visible para todos`);
    } catch (e) { toast.error(e.response?.data?.message || 'No se pudo cambiar la visibilidad'); }
  };

  // ── 📦 Último pago CONTRA ENTREGA: ese pago deja de contar como vencido en cobranza ──
  const handleTogglePagoFinal = async (row) => {
    try {
      const { data } = await axiosWithAuth.post('/revenue/pago-final-entrega', { source: 'sofia', id: row.id, pagoFinalEntrega: !row.pagoFinalEntrega });
      patchRow(row.id, { pagoFinalEntrega: data.pagoFinalEntrega });
      toast.success(data.pagoFinalEntrega
        ? `📦 ${data.clientName || 'Proyecto'}: último pago contra entrega`
        : `${data.clientName || 'Proyecto'}: último pago vuelve a cobranza`);
    } catch (e) { toast.error(e.response?.data?.message || 'No se pudo cambiar'); }
  };

  // ── Comprobante de pago por parcialidad ──
  const handleUploadComprobante = async (row, idx, file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast.error('Máximo 15 MB'); return; }
    setSaving(true);
    try {
      const { comprobantes } = await uploadComprobante('quote', row.id, file, idx);
      patchRow(row.id, { comprobantes });
      toast.success('Comprobante adjuntado 🧾');
    } catch { toast.error('No se pudo subir el comprobante'); }
    finally { setSaving(false); }
  };

  const handleDelComprobante = async (row, compId) => {
    if (!window.confirm('¿Eliminar este comprobante?')) return;
    try {
      const { comprobantes } = await deleteComprobante('quote', row.id, compId);
      patchRow(row.id, { comprobantes });
    } catch { toast.error('No se pudo borrar el comprobante'); }
  };

  // Contestación del cliente anidada bajo un mensaje
  const handleAddReply = async (row, parentId) => {
    const t = replyInput.trim();
    if (!t) return;
    setSaving(true);
    try {
      const { notas } = await addNota('quote', row.id, `↳@${parentId}| ${t}`);
      patchRow(row.id, { notas });
      setReplyInput(''); setReplyFor(null);
    } catch { toast.error('No se pudo agregar la contestación'); }
    finally { setSaving(false); }
  };

  // Agendar la entrega como evento con horario en el Google Calendar de Arturo
  const handleAgendarEntrega = async (row) => {
    if (!row.fechaEntrega) { toast.error('Primero pon la fecha de entrega'); return; }
    setAgendando(true);
    try {
      const fecha = new Date(row.fechaEntrega).toISOString().slice(0, 10);
      const ultimo = row.ultimoAcuerdo?.texto || (row.acuerdos || []).slice(-1)[0]?.texto || '';
      await axiosWithAuth.post('/google/events', {
        adminKey: 'arturo',
        summary: `📦 Entrega: ${row.cliente} — ${row.title || 'Proyecto'}`,
        description: [
          row.celular ? `Tel: ${row.celular}` : '',
          row.celular ? `WhatsApp: https://wa.me/${soloDigitos(row.celular)}` : '',
          ultimo ? `Acuerdo: ${ultimo}` : '',
          'Agendado desde Proyectos',
        ].filter(Boolean).join('\n'),
        startDate: fecha,
        startTime: entregaHora || '10:00',
        colorId: '6',
      });
      toast.success(`Entrega agendada: ${fmtFecha(row.fechaEntrega)} ${entregaHora} 📅`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo agendar en el calendario');
    } finally { setAgendando(false); }
  };

  const abrirProyecto = (id) => { setDetailId(id); window.scrollTo({ top: 0 }); };

  // ── Entregable: Paula CARGA el archivo, Arturo DESAHOGA (marca entregado) ──
  // Acepta VARIOS archivos; con rol 'final' el primer lote desahoga la entrega
  const handleUploadEntregables = async (row, fileList, rol = 'soporte') => {
    const files = [...(fileList || [])].filter((f) => {
      if (f.size > 15 * 1024 * 1024) { toast.error(`${f.name} pasa de 15 MB`); return false; }
      return true;
    });
    if (!files.length) return;
    setSaving(true);
    try {
      let subidos = 0;
      for (const f of files) {
        try {
          const { archivos } = await uploadArchivo('quote', row.id, f, rol);
          patchRow(row.id, { archivos });
          subidos++;
        } catch (e) { toast.error(e.response?.data?.message || `No se pudo subir ${f.name}`); }
      }
      if (!subidos) return;
      // NO marca entregado automáticamente: sube los archivos y ya. El equipo
      // agrega comentarios/notas y luego marca "completada" con su botón.
      toast.success(rol === 'final'
        ? `${subidos} archivo${subidos !== 1 ? 's' : ''} FINAL adjuntado${subidos !== 1 ? 's' : ''} ✅`
        : `${subidos} archivo${subidos !== 1 ? 's' : ''} de soporte cargado${subidos !== 1 ? 's' : ''} 📎`);
    } finally { setSaving(false); }
  };
  const handleUploadEntregable = (row, file, rol = 'soporte') => handleUploadEntregables(row, file ? [file] : [], rol);

  // Borrar un archivo de la entrega
  const handleBorrarArchivo = async (row, archivoId) => {
    if (!archivoId) { toast.error('No se puede borrar este archivo'); return; }
    if (!window.confirm('¿Borrar este archivo de la entrega?')) return;
    try {
      const { archivos } = await deleteArchivo('quote', row.id, archivoId);
      patchRow(row.id, { archivos });
      toast.success('Archivo borrado 🗑️');
    } catch (e) { toast.error(e.response?.data?.message || 'No se pudo borrar el archivo'); }
  };

  // Paula marca si el archivo final ya se le envió al cliente
  const handleEnviado = async (row, valor) => {
    patchRow(row.id, { entregaEnviada: valor });
    try {
      await updateSeguimiento('quote', row.id, { entregaEnviada: valor });
      toast.success(valor ? 'Marcado como ENVIADO al cliente 📤✅' : 'Marcado como NO enviado');
    } catch { toast.error('No se pudo guardar'); patchRow(row.id, { entregaEnviada: !valor }); }
  };

  // ── Nueva entrega manual: acuerdo + fecha de entrega + nota + evento en el calendario de Arturo ──
  const handleGuardarNueva = async () => {
    // El lead puede estar en el board (cotización pagada) o ser un lead remoto sin
    // cotización pagada (leadInfo) que agendamos solo para rastrear su entrega.
    const row = rows.find((r) => String(r.id) === String(nueva.rowId)) || nueva.leadInfo;
    if (!row || !nueva.rowId) { toast.error('Selecciona el lead'); return; }
    if (!nueva.paraCuando) { toast.error('Pon la fecha de entrega (¿para cuándo es?)'); return; }
    const esRemoto = !rows.some((r) => String(r.id) === String(nueva.rowId));
    setSaving(true);
    try {
      const catLbl = CATEGORIAS_ENTREGA.find((c) => c.k === nueva.categoria)?.l || '';
      const texto = [
        catLbl ? `[${catLbl}]` : '',
        nueva.quePidio ? `Pidió: ${nueva.quePidio}` : 'Entrega agendada',
        nueva.cuandoPidio ? `(lo pidió el ${fmtFecha(`${nueva.cuandoPidio}T12:00:00`)})` : '',
      ].filter(Boolean).join(' ');
      const { acuerdos, fechaEntrega } = await addAcuerdo('quote', nueva.rowId, { texto, fechaEntrega: nueva.paraCuando });
      patchRow(nueva.rowId, { acuerdos, ultimoAcuerdo: acuerdos[acuerdos.length - 1] || null, fechaEntrega: fechaEntrega || `${nueva.paraCuando}T12:00:00` });
      if (nueva.nota.trim()) {
        const { notas } = await addNota('quote', nueva.rowId, nueva.nota.trim());
        patchRow(nueva.rowId, { notas });
      }
      // Archivos adjuntos de la entrega → archivos del proyecto
      let subidos = 0;
      for (const f of nuevaFiles) {
        try {
          const { archivos } = await uploadArchivo('quote', nueva.rowId, f, 'soporte');
          patchRow(nueva.rowId, { archivos });
          subidos++;
        } catch { toast.error(`No se pudo subir ${f.name}`); }
      }
      if (subidos) toast.success(`${subidos} archivo${subidos !== 1 ? 's' : ''} adjuntado${subidos !== 1 ? 's' : ''} 📎`);
      // Evento con horario en el Google Calendar de Arturo
      try {
        await axiosWithAuth.post('/google/events', {
          adminKey: 'arturo',
          summary: `📦 ${catLbl || 'Entrega'}: ${row.cliente} — ${nueva.quePidio || row.title || 'Proyecto'}`,
          description: [
            row.celular ? `Tel: ${row.celular}` : '',
            nueva.quePidio ? `Pidió: ${nueva.quePidio}` : '',
            nueva.cuandoPidio ? `Lo pidió el: ${nueva.cuandoPidio}` : '',
            nueva.nota.trim() ? `Nota: ${nueva.nota.trim()}` : '',
            'Agendado desde Proyectos',
          ].filter(Boolean).join('\n'),
          startDate: nueva.paraCuando,
          startTime: nueva.hora || '10:00',
          colorId: '6',
        });
        toast.success(`Entrega agendada y en el calendario: ${fmtFecha(`${nueva.paraCuando}T12:00:00`)} ${nueva.hora} 📅`);
      } catch {
        toast('Entrega guardada, pero no se pudo crear el evento en Google Calendar', { icon: '⚠️' });
      }
      // Un lead remoto (cotización no pagada) no estaba en el board: recárgalo para
      // que su entrega recién agendada aparezca en Hoy/Próximos.
      if (esRemoto) await fetchAll({ silent: true });
      setShowNueva(false);
      setNueva({ rowId: null, query: '', categoria: '', quePidio: '', cuandoPidio: '', paraCuando: '', hora: '10:00', nota: '', leadInfo: null });
      setNuevaFiles([]);
      setLeadRemoto([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo guardar la entrega');
    } finally { setSaving(false); }
  };

  const ENTREGA_CARDS = [
    { k: 'atrasadas', lbl: 'Atrasadas', cls: 'red' },
    { k: 'hoy', lbl: 'Hoy', cls: 'amber' },
    { k: 'manana', lbl: 'Mañana', cls: 'blue' },
    { k: 'pasado', lbl: 'Pasado mañana', cls: 'blue' },
    { k: 'semana', lbl: 'Próximos 7 días', cls: '' },
    { k: 'sin_fecha', lbl: 'Sin fecha', cls: 'gray' },
    { k: 'desahogados', lbl: 'Desahogados', cls: 'green' },
  ];

  /* ═══════════ PÁGINA COMPLETA DEL PROYECTO ═══════════ */
  if (detail) {
    const d = diasHasta(detail.fechaEntrega);
    const atraso = (detail.status !== 'completado' && d !== null && d < 0) ? -d : 0;
    const sigPago = (detail.schedule || []).find((s) => s.status !== 'paid' && s.status !== 'lost');
    // Checklist automático: todo lo que debe hacerse en este proyecto
    const pendientes = [];
    if (detail.nVencidas > 0) pendientes.push({ icon: '💸', txt: `Cobrar ${mxn(detail.porCobrarActivo)} vencido (${detail.nVencidas} parcialidad${detail.nVencidas !== 1 ? 'es' : ''})`, cls: 'red' });
    else if (sigPago) pendientes.push({ icon: '🗓', txt: `Siguiente pago: ${mxn(sigPago.amount)} el ${fmtFecha(sigPago.dueDate)}`, cls: '' });
    if (detail.atencion?.sinRespuesta) pendientes.push({ icon: '📩', txt: `El cliente escribió hace ${detail.atencion.diasSinRespuesta ?? '?'}d y nadie le ha respondido`, cls: 'red' });
    if (!detail.fechaEntrega && detail.status !== 'completado') pendientes.push({ icon: '📦', txt: 'Sin fecha de entrega — agéndala abajo', cls: 'amber' });
    if (atraso > 0) pendientes.push({ icon: '⏰', txt: `Entrega atrasada ${atraso} día${atraso !== 1 ? 's' : ''} (era el ${fmtFecha(detail.fechaEntrega)})`, cls: 'red' });
    else if (detail.fechaEntrega && detail.status !== 'completado') pendientes.push({ icon: '📦', txt: `Entregar el ${fmtFecha(detail.fechaEntrega)} (${relDias(detail.fechaEntrega)})`, cls: d <= 2 ? 'amber' : '' });
    if (detail.liquidado && !detail.correccionesListas) pendientes.push({ icon: '✏️', txt: 'Correcciones pendientes de cerrar (el avance está en 90%)', cls: 'amber' });
    const ultimoAcuerdoPend = detail.ultimoAcuerdo?.texto;
    if (ultimoAcuerdoPend && detail.status !== 'completado') pendientes.push({ icon: '🤝', txt: `Último acuerdo: ${ultimoAcuerdoPend}`, cls: '' });
    if (!pendientes.length) pendientes.push({ icon: '✅', txt: 'Nada pendiente en este proyecto', cls: 'green' });

    return (
      <div className="pb-wrap">
        <div className="pb-head">
          <div>
            <button className="pb-back" onClick={() => setDetailId(null)}><FaArrowLeft /> Proyectos</button>
            <div className="pb-dp-title">
              <h2>{detail.cliente}</h2>
              <StatusChip status={detail.status} />
              {isUrgente(detail) && <UrgenteTag />}
              {canMark ? (
                <>
                  <button className={`pb-flag prio ${detail.prioritario ? 'on' : ''}`}
                    onClick={() => handleFlag(detail, 'prioritario', !detail.prioritario)}
                    title="Prioritario = atención especial">
                    {detail.prioritario ? <FaStar /> : <FaRegStar />} Prioritario
                  </button>
                  <button className={`pb-flag pers ${detail.personal ? 'on' : ''}`}
                    onClick={() => handleFlag(detail, 'personal', !detail.personal)}
                    title="PERSONAL = proyecto de Arturo">
                    {detail.personal ? <FaUser /> : <FaRegUser />} Personal
                  </button>
                  <button className={`pb-flag urg ${detail.urgente ? 'on' : ''}`}
                    onClick={() => handleFlag(detail, 'urgente', !detail.urgente)}
                    title="Marcar/desmarcar URGENTE a mano (el automático por fecha se calcula solo)">
                    🚨 Urgente
                  </button>
                  <button className={`pb-flag priv ${detail.privado ? 'on' : ''}`}
                    onClick={() => handleTogglePrivado(detail)}
                    title={detail.privado
                      ? 'Venta PERSONAL: solo tú y Paula la ven en todo el panel — click para hacerla visible'
                      : 'Candado: Hugo deja de verla en Cotizaciones, Seguimiento, Revenue, Pagos y leads'}>
                    {detail.privado ? '🔒' : '🔓'} Candado
                  </button>
                  <button className={`pb-flag pfe ${detail.pagoFinalEntrega ? 'on' : ''}`}
                    onClick={() => handleTogglePagoFinal(detail)}
                    title={detail.pagoFinalEntrega
                      ? 'Último pago CONTRA ENTREGA: no cuenta como vencido en cobranza — click para quitarlo'
                      : 'Marcar: el último pago se hace al terminar el proyecto (sale de cobranza vencida)'}>
                    📦 Pago al entregar
                  </button>
                </>
              ) : (
                <>
                  {detail.prioritario && <span className="pb-flag prio on static"><FaStar /> Prioritario</span>}
                  {detail.personal && <span className="pb-flag pers on static"><FaUser /> Personal</span>}
                </>
              )}
            </div>
            <p className="pb-sub">{detail.title || 'Proyecto'}</p>
          </div>
          <button className="pb-btn" onClick={() => fetchAll({ silent: true })} title="Actualizar"><FaSyncAlt /></button>
        </div>

        {/* Indicadores del proyecto */}
        <div className="pb-indicadores">
          <div className="pb-ind"><span>Avance</span><AvanceBar avance={detail.avance} /></div>
          <div className={`pb-ind ${atraso > 0 ? 'red' : ''}`}><span>Días de atraso</span><b>{atraso > 0 ? `${atraso}d` : '0'}</b></div>
          <div className={`pb-ind ${detail.porCobrarActivo > 0.5 ? 'amber' : 'green'}`}><span>Por cobrar</span><b>{mxn(detail.porCobrarActivo)}</b></div>
          <div className={`pb-ind ${detail.nVencidas > 0 ? 'red' : ''}`}><span>Pagos vencidos</span><b>{detail.nVencidas || 0}</b></div>
          <div className="pb-ind"><span>Entrega</span><b>{detail.fechaEntrega ? `${fmtFecha(detail.fechaEntrega)}` : 'Sin fecha'}</b>{detail.fechaEntrega && <small>{relDias(detail.fechaEntrega)}</small>}</div>
          <div className="pb-ind"><span>Pagado</span><b>{mxn(detail.pagado)} <em>/ {mxn(detail.montoTotal)}</em></b></div>
        </div>

        <div className="pb-contact">
          {detail.celular && (
            <>
              <a className="pb-btn pb-btn-wa" href={`https://wa.me/${soloDigitos(detail.celular)}`} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp /> {detail.celular}
              </a>
              <button className="pb-btn" onClick={() => copiar(soloDigitos(detail.celular), 'Número copiado')}><FaRegCopy /></button>
            </>
          )}
          {detail.vendedor && <span className="pb-chip pb-chip-gray"><FaUserTie /> {detail.vendedor}</span>}
          {detail.modalidad && <span className="pb-chip pb-chip-gray">{detail.modalidad}</span>}
          {detail.email && <span className="pb-chip pb-chip-gray">{detail.email}</span>}
          {canMark && !acceso.data && (
            <button className="pb-btn pb-btn-key" disabled={acceso.loading} onClick={() => handleRevelarAcceso(detail)}
              title="Ver/crear el usuario y contraseña del portal del cliente">
              🔑 {acceso.loading ? 'Cargando…' : 'Acceso del cliente'}
            </button>
          )}
        </div>

        {/* 🔑 Credenciales del portal del cliente */}
        {canMark && acceso.data && (
          <div className="pb-acceso">
            <div className="pb-acceso-head">
              <span>🔑 Acceso del cliente al portal</span>
              {acceso.data.clientNumber && <span className="pb-acceso-num">Cliente #{acceso.data.clientNumber}</span>}
            </div>
            <div className="pb-acceso-grid">
              <div className="pb-acceso-field">
                <small>Usuario</small>
                <code>{acceso.data.loginId}</code>
                <button className="pb-fchip" onClick={() => copiar(acceso.data.loginId, 'Usuario copiado')}><FaRegCopy /></button>
              </div>
              <div className="pb-acceso-field">
                <small>Contraseña</small>
                <code>{acceso.data.password}</code>
                <button className="pb-fchip" onClick={() => copiar(acceso.data.password, 'Contraseña copiada')}><FaRegCopy /></button>
              </div>
            </div>
            <div className="pb-acceso-actions">
              <button className="pb-btn pb-btn-blue" onClick={copiarAcceso}><FaRegCopy /> Copiar mensaje</button>
              {detail.celular && <button className="pb-btn pb-btn-wa" onClick={handleReenviarAcceso}><FaWhatsapp /> Reenviar por WhatsApp</button>}
              <button className="pb-btn" disabled={acceso.loading} onClick={handleRegenerarAcceso}><FaSyncAlt /> Regenerar</button>
              <button className="pb-btn" onClick={() => setAcceso({ loading: false, data: null })}>Ocultar</button>
            </div>
            <small className="pb-acceso-hint">Portal: {acceso.data.portalUrl} — el cliente ve sus pagos, documentos y deja comentarios.</small>
          </div>
        )}

        {/* 📄 Documentos protegidos del cliente */}
        {canMark && (
          <div className="pb-docs">
            {!docs.loaded ? (
              <button className="pb-btn" onClick={() => cargarDocs(detail)}>📄 Documentos del cliente</button>
            ) : (
              <div className="pb-docs-box">
                <div className="pb-docs-head">
                  <span>📄 Documentos protegidos de {detail.cliente}</span>
                  <label className={`pb-btn pb-btn-blue ${docs.uploading ? 'is-disabled' : ''}`}>
                    {docs.uploading ? 'Subiendo…' : '⬆️ Subir PDF'}
                    <input type="file" accept="application/pdf" hidden disabled={docs.uploading}
                      onChange={(e) => { subirDoc(detail, e.target.files?.[0]); e.target.value = ''; }} />
                  </label>
                </div>
                {docs.items.length ? (
                  <div className="pb-docs-list">
                    {docs.items.map((d) => (
                      <div key={d.id} className="pb-docs-item">
                        <div className="pb-docs-info">
                          <b>{d.title}</b>
                          <small>{d.numPages} págs · {d.status === 'unlocked' ? '🔓 liberado' : `🔒 ${d.previewPages} en vista previa`}</small>
                        </div>
                        <div className="pb-docs-actions">
                          {d.status !== 'unlocked' && <button className="pb-fchip" onClick={() => liberarDoc(d.id, detail)}>Liberar</button>}
                          <button className="pb-fchip" onClick={() => borrarDoc(d.id, detail)}>Borrar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="pb-docs-empty">Sube el PDF del trabajo. El cliente lo verá con marca de agua, censurado y sin referencias (y solo si pagó). Al liberarlo, lo descarga completo.</div>}
              </div>
            )}
          </div>
        )}

        {/* 💬 Comentarios del cliente (mini-hilo del portal) */}
        {canMark && (
          <div className="pb-chat">
            {!chat.open ? (
              <button className="pb-btn" onClick={() => cargarChat(detail)}>💬 Comentarios del cliente</button>
            ) : (
              <div className="pb-chat-box">
                <div className="pb-chat-head"><span>💬 Comentarios con {detail.cliente}</span>
                  <button className="pb-fchip" onClick={() => cargarChat(detail)}>Actualizar</button>
                </div>
                <div className="pb-chat-list">
                  {chat.loading ? <div className="pb-chat-loading">Cargando…</div>
                    : chat.messages.length ? chat.messages.map((m) => (
                      <div key={m.id} className={`pb-chat-msg ${m.from === 'team' ? 'team' : 'client'}`}>
                        <div className="pb-chat-bubble"><div className="pb-chat-meta">{m.from === 'team' ? (m.authorName || 'Equipo') : detail.cliente} · {fmtFecha(m.createdAt)}</div>{m.text}</div>
                      </div>
                    )) : <div className="pb-chat-empty">Sin comentarios todavía.</div>}
                </div>
                <div className="pb-chat-input">
                  <input value={chat.text} onChange={(e) => setChat((p) => ({ ...p, text: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') enviarChat(detail); }} placeholder="Responder al cliente…" />
                  <button className="pb-btn pb-btn-blue" disabled={chat.sending || !chat.text.trim()} onClick={() => enviarChat(detail)}>Enviar</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pb-dp-grid">
          <div className="pb-dp-col">
            {/* Qué debe hacerse */}
            <div className="pb-panel">
              <h4><FaClipboardList /> Qué sigue en este proyecto</h4>
              <div className="pb-todo">
                {pendientes.map((p, i) => (
                  <div key={i} className={`pb-todo-item ${p.cls}`}><span>{p.icon}</span> {p.txt}</div>
                ))}
              </div>
            </div>

            {/* Entrega + switches */}
            <div className="pb-panel">
              <h4>📦 Entrega</h4>
              <div className="pb-panel-row pb-entrega-row">
                <label className="pb-date-lbl">Fecha:
                  <input type="date" value={detail.fechaEntrega ? new Date(detail.fechaEntrega).toISOString().slice(0, 10) : ''}
                    onChange={(e) => handleFechaEntrega(detail, e.target.value)} />
                </label>
                <label className="pb-date-lbl">Hora:
                  <input type="time" value={entregaHora} onChange={(e) => setEntregaHora(e.target.value)} />
                </label>
                <button className="pb-btn pb-btn-blue" disabled={agendando || !detail.fechaEntrega}
                  onClick={() => handleAgendarEntrega(detail)}
                  title="Crea el evento de entrega con horario en el Google Calendar de Arturo">
                  {agendando ? 'Agendando…' : '📅 Agendar en calendario'}
                </button>
              </div>
              <div className="pb-panel-row pb-switches">
                <label className={`pb-switch ${detail.correccionesListas ? 'on' : ''}`}>
                  <input type="checkbox" checked={!!detail.correccionesListas} onChange={() => handleCorrecciones(detail, !detail.correccionesListas)} />
                  <span className="pb-track"><span className="pb-knob" /></span>
                  Correcciones terminadas
                </label>
                <label className={`pb-switch ${detail.entregado ? 'on' : ''}`}>
                  <input type="checkbox" checked={!!detail.entregado} onChange={() => handleEntregado(detail, !detail.entregado)} />
                  <span className="pb-track"><span className="pb-knob" /></span>
                  Entregado {detail.entregadoEn ? `(${fmtFecha(detail.entregadoEn)})` : ''}
                </label>
              </div>
            </div>

            {/* Pagos */}
            <div className="pb-panel">
              <h4>💰 Pagos — {mxn(detail.pagado)} de {mxn(detail.montoTotal)} {detail.porCobrarActivo > 0.5 && <span className="pb-vencidas">debe {mxn(detail.porCobrarActivo)}</span>}</h4>
              <div className="pb-sched">
                {(detail.schedule || []).map((s) => {
                  const vencida = s.status !== 'paid' && s.status !== 'lost' && s.dueDate && new Date(s.dueDate) < new Date();
                  const idx = s.number - 1; // installmentIdx real (0-based)
                  const comps = (detail.comprobantes || []).filter((c) => c.installmentIdx === idx);
                  const refKey = `comp-${detail.id}-${idx}`;
                  return (
                    <div key={s.number} className="pb-sched-item">
                      <div className="pb-sched-row">
                        <span>{s.label}</span>
                        <span>{fmtFecha(s.dueDate)}</span>
                        <b>{mxn(s.amount)}</b>
                        {s.status === 'paid'
                          ? <span className="pb-chip" style={{ color: '#10b981', background: 'rgba(16,185,129,0.14)' }}><FaCheckCircle /> Pagado</span>
                          : s.status === 'lost'
                            ? <span className="pb-chip pb-chip-gray">Perdido</span>
                            : vencida
                              ? <span className="pb-chip" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.14)' }}><FaExclamationTriangle /> Vencido</span>
                              : <span className="pb-chip" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.14)' }}><FaRegClock /> Pendiente</span>}
                      </div>
                      {/* Comprobante de pago de ESTA parcialidad (contabilidad) */}
                      <div className="pb-comps">
                        {comps.map((c) => (
                          <span key={c._id} className="pb-comp">
                            <a href={c.url} target="_blank" rel="noopener noreferrer" title={`${c.nombre} · ${c.subidoPor || ''}`}>
                              <FaReceipt /> {c.nombre || 'comprobante'}
                            </a>
                            <button onClick={() => handleDelComprobante(detail, c._id)} title="Eliminar comprobante"><FaTrashAlt /></button>
                          </span>
                        ))}
                        <button className="pb-comp-add" disabled={saving} onClick={() => fileRefs.current[refKey]?.click()}>
                          <FaCloudUploadAlt /> {comps.length ? 'Otro comprobante' : 'Adjuntar comprobante'}
                        </button>
                        <input type="file" hidden accept="image/*,.pdf" ref={(el) => { fileRefs.current[refKey] = el; }}
                          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleUploadComprobante(detail, idx, f); }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pb-hint">Para marcar pagos usa <b>Seguimiento → Flujo de caja</b> (mismo registro). Las imágenes de comprobantes se comprimen solas.</div>
            </div>

            {/* Visor de la cotización (PDF) */}
            <div className="pb-panel">
              <h4><FaFileInvoiceDollar /> Cotización {detail.folio && <span className="pb-chip pb-chip-gray">{detail.folio}</span>}
                {detail.pdfUrl && (
                  <a className="pb-btn pb-btn-sm-link" href={detail.pdfUrl} target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /> Abrir</a>
                )}
              </h4>
              {detail.pdfUrl
                ? <iframe className="pb-pdf" src={detail.pdfUrl} title={`Cotización ${detail.folio || detail.cliente}`} />
                : <div className="pb-faint">Esta cotización no tiene PDF guardado.</div>}
            </div>

          </div>

          <div className="pb-dp-col">
            {/* Acuerdos */}
            <div className="pb-panel">
              <h4><FaHandshake /> Acuerdos y correcciones</h4>
              {(detail.acuerdos || []).length === 0 && <div className="pb-faint">Sin acuerdos registrados.</div>}
              {[...(detail.acuerdos || [])].reverse().map((a) => (
                <div key={a._id || a.creadoEn} className="pb-acuerdo">
                  {a.fuente === 'fireflies' ? <FaMicrophone className="pb-acuerdo-ico ff" /> : <FaHandshake className="pb-acuerdo-ico" />}
                  <span>
                    {a.texto || <em>Sin texto</em>}
                    {a.fechaEntrega && <b> · Entrega: {fmtFecha(a.fechaEntrega)}</b>}
                    <small> ({fmtFecha(a.meetingDate || a.creadoEn)})</small>
                  </span>
                </div>
              ))}
              <div className="pb-add-row">
                <input type="date" value={acuerdoFecha} onChange={(e) => setAcuerdoFecha(e.target.value)} title="Fecha de entrega acordada" />
                <input placeholder="Nuevo acuerdo / correcciones pactadas…" value={acuerdoTexto}
                  onChange={(e) => setAcuerdoTexto(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAcuerdo(detail)} />
                <button className="pb-btn pb-btn-blue" disabled={saving} onClick={() => handleAddAcuerdo(detail)}>Guardar</button>
              </div>
            </div>

            {/* Notas — hilo tipo chat: lo que ENVIAMOS (azul, derecha) vs lo que CONTESTÓ el cliente (verde, izquierda) */}
            <div className="pb-panel">
              <h4><FaStickyNote /> Notas de seguimiento ({(detail.notas || []).length})</h4>
              <div className="pb-chat pb-notas-page">
                {(() => {
                  const { mains, repliesByParent } = buildThread(detail.notas);
                  if (!mains.length) return <div className="pb-faint">Sin notas todavía. Escribe tu mensaje abajo.</div>;
                  return mains.map((n) => {
                    const replies = repliesByParent[n._id] || [];
                    return (
                      <div key={n._id || n.fecha} className="pb-thread">
                        <div className="pb-msg mine">
                          <div className="pb-msg-bubble">
                            <span className="pb-msg-who">📤 {n.autor || 'Nosotros'}</span>
                            <div className="pb-msg-txt">{n._clean}</div>
                            <span className="pb-msg-time">{fmtNota(n.fecha)}</span>
                          </div>
                        </div>
                        {replies.map((rep) => (
                          <div key={rep._id || rep.fecha} className="pb-msg client">
                            <div className="pb-msg-bubble">
                              <span className="pb-msg-who">💬 Contestación del cliente</span>
                              <div className="pb-msg-txt">{rep._clean}</div>
                              <span className="pb-msg-time">{fmtNota(rep.fecha)}</span>
                            </div>
                          </div>
                        ))}
                        {replyFor === n._id ? (
                          <div className="pb-add-row pb-reply-row">
                            <input autoFocus placeholder="¿Qué contestó el cliente?" value={replyInput}
                              onChange={(e) => setReplyInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddReply(detail, n._id); if (e.key === 'Escape') setReplyFor(null); }} />
                            <button className="pb-btn pb-btn-blue" disabled={saving} onClick={() => handleAddReply(detail, n._id)}>Guardar</button>
                            <button className="pb-btn" onClick={() => setReplyFor(null)}>✕</button>
                          </div>
                        ) : (
                          <button className="pb-reply-btn" onClick={() => { setReplyFor(n._id); setReplyInput(''); }}>↳ Agregar contestación del cliente</button>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="pb-add-row">
                <input placeholder="Escribe tu mensaje / nota de seguimiento…" value={notaInput}
                  onChange={(e) => setNotaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNota(detail)} />
                <button className="pb-btn pb-btn-blue" disabled={saving} onClick={() => handleAddNota(detail)}>Enviar</button>
              </div>
            </div>

            {/* Archivos — todos */}
            <div className="pb-panel">
              <h4><FaPaperclip /> Archivos del proyecto ({(detail.archivos || []).length})</h4>
              {(detail.archivos || []).length === 0 && <div className="pb-faint">Sin archivos. Se cargan desde Seguimiento.</div>}
              <div className="pb-files">
                {[...(detail.archivos || [])].reverse().map((a, i) => (
                  <a key={a._id || a.url} className={`pb-file ${i === 0 ? 'latest' : ''}`} href={a.url} target="_blank" rel="noopener noreferrer">
                    <FaFileAlt />
                    <span className="pb-file-info">
                      <b>{a.nombre || 'archivo'}</b>
                      <small>{a.subidoPor || 'Admin'} · {a.subidoEn ? fmtFecha(a.subidoEn) : ''} {a.size ? `· ${fmtBytes(a.size)}` : ''}</small>
                    </span>
                    {i === 0 && <span className="pb-file-badge">último</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════ VISTA PRINCIPAL (Lista / Calendario) ═══════════ */
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calDays = [];
  for (let i = 0; i < firstDow; i++) calDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calDays.push(new Date(year, month, i));

  const entregaColor = (r) => {
    if (r.status === 'completado') return '#10b981';
    const d = diasHasta(r.fechaEntrega);
    if (d < 0) return '#ef4444';
    if (d <= 2) return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <div className="pb-wrap">
      <div className="pb-head">
        <div>
          <h2><FaProjectDiagram /> Proyectos</h2>
          <p className="pb-sub">Todos tus proyectos con sus pagos, notas y entregas — misma base que Seguimiento.</p>
        </div>
        <div className="pb-head-actions">
          <div className="pb-views">
            <button className={`pb-view-tab ${view === 'lista' ? 'active' : ''}`} onClick={() => setView('lista')}><FaListUl /> Lista</button>
            <button className={`pb-view-tab ${view === 'calendario' ? 'active' : ''}`} onClick={() => setView('calendario')}><FaCalendarAlt /> Calendario de entregas</button>
          </div>
          <button className="pb-btn pb-btn-blue" onClick={() => setShowNueva(true)}>+ Entrega</button>
          <button className="pb-btn" onClick={() => fetchAll()} disabled={loading} title="Actualizar">
            <FaSyncAlt className={loading ? 'pb-spin' : ''} />
          </button>
        </div>
      </div>

      {view === 'calendario' ? (
        /* ═══ CALENDARIO DE ENTREGAS (para Paula) ═══ */
        <>
          <div className="pb-calstats">
            {[
              { k: 'vencidas', lbl: 'Vencidas', val: calStats.vencidas, cls: 'red' },
              { k: 'hoy', lbl: 'Hoy', val: calStats.hoy, cls: 'amber' },
              { k: 'semana', lbl: 'Esta semana', val: calStats.semana, cls: 'blue' },
              { k: 'quincena', lbl: 'Próx. 14 días', val: calStats.quincena, cls: 'blue' },
              { k: 'entregadas', lbl: 'Entregadas', val: calStats.entregadas, cls: 'green' },
              { k: 'todas', lbl: 'Por entregar', val: calStats.porEntregar, cls: '' },
            ].map((c) => (
              <button key={c.k} className={`pb-calstat ${c.cls} ${calFilter === c.k ? 'active' : ''}`}
                onClick={() => setCalFilter((prev) => prev === c.k ? 'todas' : c.k)}
                title="Filtrar calendario y agenda">
                <b>{c.val}</b><span>{c.lbl}</span>
              </button>
            ))}
          </div>

          <div className="pb-cal-nav">
            <button className="pb-btn" onClick={() => setCalMonth(new Date(year, month - 1))}><FaChevronLeft /></button>
            <h3>{MESES[month]} {year}</h3>
            <button className="pb-btn" onClick={() => setCalMonth(new Date(year, month + 1))}><FaChevronRight /></button>
            <span className="pb-cal-leyenda">
              <i style={{ background: '#ef4444' }} /> Vencida
              <i style={{ background: '#f59e0b' }} /> Próxima
              <i style={{ background: '#3b82f6' }} /> Programada
              <i style={{ background: '#10b981' }} /> Entregada
            </span>
          </div>

          <div className="pb-cal-grid">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => <div key={d} className="pb-cal-dow">{d}</div>)}
            {calDays.map((day, idx) => {
              const dayEntregas = day ? conFecha.filter((r) => new Date(r.fechaEntrega).toDateString() === day.toDateString()) : [];
              const isToday = day && day.toDateString() === new Date().toDateString();
              return (
                <div key={idx} className={`pb-cal-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}>
                  {day && <span className="pb-cal-num">{day.getDate()}</span>}
                  <div className="pb-cal-chips">
                    {dayEntregas.map((r) => (
                      <button key={r.id} className="pb-cal-chip" title={`${r.cliente} — ${r.title}`}
                        style={{ borderLeftColor: entregaColor(r), background: `${entregaColor(r)}22` }}
                        onClick={() => setEntregaModalId(r.id)}>
                        {r.status === 'completado' ? '✓ ' : isUrgente(r) ? '🚨 ' : ''}{r.cliente}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agenda por días (respeta el filtro de arriba) */}
          <h3 className="pb-agenda-title">Agenda de entregas {calFilter !== 'todas' ? `· ${calFilter}` : ''} ({conFecha.length})</h3>
          {!agenda.length ? <div className="pb-empty">Nada con este filtro.</div> : (
            <div className="pb-agenda">
              {agenda.map(([key, list]) => {
                const date = new Date(`${key}T12:00:00`);
                const d = diasHasta(date);
                return (
                  <div key={key} className="pb-agenda-day">
                    <div className={`pb-agenda-fecha ${d < 0 ? 'red' : d <= 2 ? 'amber' : ''}`}>
                      <FaCalendarDay /> {date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                      <small>{relDias(date)}</small>
                    </div>
                    {list.map((r) => {
                      const nArch = r.archivos?.length || 0;
                      const done = r.status === 'completado' || r.entregado;
                      return (
                        <div key={r.id} className="pb-agenda-item" onClick={() => setEntregaModalId(r.id)}>
                          <span className="pb-agenda-dot" style={{ background: entregaColor(r) }} />
                          <b>{r.cliente}{isUrgente(r) && <> <UrgenteTag /></>}</b>
                          <span className="pb-title">{r.title}</span>
                          {done
                            ? (r.entregaEnviada
                              ? <span className="pb-ent-estado done"><FaCheckCircle /> Entregado · enviado</span>
                              : <span className="pb-ent-estado loaded"><FaCheckCircle /> Entregado · falta enviar</span>)
                            : nArch > 0
                              ? <span className="pb-ent-estado loaded"><FaPaperclip /> Cargado ({nArch}) · falta desahogar</span>
                              : <span className="pb-ent-estado none"><FaPaperclip /> Sin archivo</span>}
                          <div className="pb-agenda-actions" onClick={(e) => e.stopPropagation()}>
                            {!done && (
                              <>
                                <button className="pb-btn pb-btn-sm-link" disabled={saving}
                                  onClick={() => fileRefs.current[`ent-${r.id}`]?.click()} title="Paula: cargar el entregable">
                                  <FaCloudUploadAlt /> Cargar
                                </button>
                                <input type="file" hidden multiple ref={(el) => { fileRefs.current[`ent-${r.id}`] = el; }}
                                  onChange={(e) => { const fs = e.target.files; handleUploadEntregables(r, fs, 'soporte'); e.target.value = ''; }} />
                                {canDesahogar && nArch > 0 && (
                                  <button className="pb-btn pb-btn-sm-link pb-btn-desahogar" disabled={saving}
                                    onClick={() => handleEntregado(r, true)} title="Arturo: marcar como entregado">
                                    <FaCheckCircle /> Desahogar
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          <FaChevronRight className="pb-open" />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ═══ VISTA LISTA ═══ */
        <>
          <div className="pb-entregas">
            {ENTREGA_CARDS.map((c) => {
              const list = entregas[c.k];
              return (
                <button key={c.k}
                  className={`pb-ent-card ${c.cls} ${entregaFilter === c.k ? 'active' : ''} ${list.length === 0 ? 'empty' : ''}`}
                  onClick={() => setEntregaFilter((prev) => prev === c.k ? null : c.k)}
                  title={entregaFilter === c.k ? 'Quitar filtro' : 'Filtrar la lista por estas entregas'}>
                  <span className="pb-ent-lbl"><FaCalendarDay /> {c.lbl}</span>
                  <span className="pb-ent-num">{list.length}</span>
                  <span className="pb-ent-names" onClick={(e) => e.stopPropagation()}>
                    {list.length === 0 && '—'}
                    {list.slice(0, 3).map((r, i) => (
                      <React.Fragment key={r.id}>
                        {i > 0 && ' · '}
                        <a className="pb-ent-name" onClick={() => setEntregaModalId(r.id)} title="Ver la entrega">{r.cliente}</a>
                      </React.Fragment>
                    ))}
                    {list.length > 3 ? ` +${list.length - 3}` : ''}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pb-toolbar">
            <div className="pb-search">
              <FaSearch />
              <input placeholder="Buscar cliente, proyecto, número…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="pb-fchips">
              {[
                { k: 'activos', l: `Activos (${rows.length - (statusCounts.completado || 0)})` },
                { k: 'todos', l: `Todos (${rows.length})` },
                { k: 'falta_pago', l: `Falta de pago (${statusCounts.falta_pago || 0})`, c: '#ef4444' },
                { k: 'en_proceso', l: `En proceso (${statusCounts.en_proceso || 0})`, c: '#3b82f6' },
                { k: 'correcciones', l: `Correcciones (${statusCounts.correcciones || 0})`, c: '#a78bfa' },
                { k: 'completado', l: `Completados (${statusCounts.completado || 0})`, c: '#10b981' },
              ].map((c) => (
                <button key={c.k} className={`pb-fchip ${statusFilter === c.k ? 'active' : ''}`}
                  style={statusFilter === c.k && c.c ? { borderColor: c.c, color: c.c } : {}}
                  onClick={() => setStatusFilter(c.k)}>{c.l}</button>
              ))}
              <button className={`pb-fchip flag ${flagFilter === 'prioritario' ? 'active prio' : ''}`}
                onClick={() => setFlagFilter((p) => p === 'prioritario' ? null : 'prioritario')}>
                ⭐ Prioritarios ({rows.filter((r) => r.prioritario).length})
              </button>
              <button className={`pb-fchip flag ${flagFilter === 'personal' ? 'active pers' : ''}`}
                onClick={() => setFlagFilter((p) => p === 'personal' ? null : 'personal')}>
                👤 Personales ({rows.filter((r) => r.personal).length})
              </button>
            </div>
            <div className="pb-period">
              <label className="pb-date-lbl">Entrega del:
                <input type="date" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} />
              </label>
              <label className="pb-date-lbl">al:
                <input type="date" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} />
              </label>
              {(rangeFrom || rangeTo) && (
                <button className="pb-fchip" onClick={() => { setRangeFrom(''); setRangeTo(''); }}>✕ Quitar rango</button>
              )}
              <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setMonthFilter('todos'); }}>
                <option value="todos">Todos los años</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {yearFilter !== 'todos' && (
                <div className="pb-months">
                  <button className={`pb-mchip ${monthFilter === 'todos' ? 'active' : ''}`} onClick={() => setMonthFilter('todos')}>Todo</button>
                  {MESES_CORTO.map((m, i) => (
                    <button key={m} className={`pb-mchip ${monthFilter === String(i) ? 'active' : ''}`} onClick={() => setMonthFilter(String(i))}>{m}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="pb-empty">Cargando proyectos…</div>
          ) : !filtered.length ? (
            <div className="pb-empty">No hay proyectos con estos filtros.</div>
          ) : (
            <div className="pb-list">
              <div className="pb-row pb-row-head">
                <span>Cliente / Proyecto</span>
                <span>Estatus</span>
                <span>Avance</span>
                <span>Pagos</span>
                <span>Entrega</span>
                <span>Última nota / acuerdo</span>
              </div>
              {filtered.map((r) => {
                const d = diasHasta(r.fechaEntrega);
                const entCls = d === null ? 'faint' : d < 0 ? 'red' : d <= 2 ? 'amber' : '';
                const lastNota = r.notas?.length ? r.notas[r.notas.length - 1] : null;
                const lastAcuerdo = r.ultimoAcuerdo;
                // 💬 Comentario NUEVO: nota de las últimas 48h escrita por alguien que no soy yo
                const miNombre = (user?.name || '').split(' ')[0].toLowerCase();
                const notaNueva = !!(lastNota && lastNota.fecha
                  && (Date.now() - new Date(lastNota.fecha).getTime()) < 48 * 3600 * 1000
                  && !(miNombre && String(lastNota.autor || '').toLowerCase().includes(miNombre)));
                return (
                  <div key={r.id} className={`pb-row ${r.prioritario ? 'prio' : ''} ${notaNueva ? 'nota-nueva' : ''}`}
                    onClick={() => entregaFilter ? setEntregaModalId(r.id) : abrirProyecto(r.id)}
                    title={entregaFilter ? 'Ver la entrega (solo requisitos, notas y archivos)' : 'Abrir proyecto completo'}>
                    <div className="pb-cell-client" data-label="Cliente">
                      <div className="pb-client-line">
                        {r.prioritario && <FaStar className="pb-star" title="Prioritario" />}
                        {r.personal && <span className="pb-badge-pers" title="Proyecto PERSONAL de Arturo"><FaUser /></span>}
                        {isUrgente(r) && <UrgenteTag />}
                        {r.celular && (
                          <a className="pb-wa" href={`https://wa.me/${soloDigitos(r.celular)}`} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} title={r.celular}><FaWhatsapp /></a>
                        )}
                        <b>{r.cliente}</b>
                      </div>
                      <span className="pb-title">{r.title || 'Proyecto'}</span>
                    </div>
                    <div data-label="Estatus">
                      <StatusChip status={r.status} />
                      {r.entregado && (
                        r.entregaEnviada
                          ? <small className="pb-envio ok">✅ enviado {r.entregaEnviadaEn ? `el ${fmtFecha(r.entregaEnviadaEn)}` : ''}</small>
                          : <small className="pb-envio pend">📤 pendiente de envío</small>
                      )}
                    </div>
                    <div data-label="Avance"><AvanceBar avance={r.avance} /></div>
                    <div className="pb-cell-pagos" data-label="Pagos">
                      <b>{mxn(r.pagado)}</b> <span className="pb-faint">/ {mxn(r.montoTotal)}</span>
                      {r.nVencidas > 0 && <span className="pb-vencidas">{r.nVencidas} vencida{r.nVencidas !== 1 ? 's' : ''}</span>}
                    </div>
                    <div className={`pb-cell-fecha ${entCls}`} data-label="Entrega">
                      {r.fechaEntrega ? <>{fmtFecha(r.fechaEntrega)}<small>{relDias(r.fechaEntrega)}</small></> : '—'}
                    </div>
                    <div className="pb-cell-nota" data-label="Nota">
                      {notaNueva && <span className="pb-chip-nuevo" title={`Comentario de ${lastNota.autor || 'equipo'} · ${fmtNota(lastNota.fecha)}`}>💬 nuevo</span>}
                      {lastAcuerdo?.texto
                        ? <span title={lastAcuerdo.texto}><FaHandshake /> {lastAcuerdo.texto}</span>
                        : lastNota
                          ? <span title={lastNota.texto}><FaStickyNote /> {cleanNota(lastNota.texto)}</span>
                          : <span className="pb-faint">Sin notas</span>}
                      <FaChevronRight className="pb-open" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══ MODAL: DETALLE DE UNA ENTREGA (requisitos + notas + archivos, sin todo el expediente) ══ */}
      {entregaModal && (() => {
        const r = entregaModal;
        const done = r.status === 'completado' || r.entregado;
        const d = diasHasta(r.fechaEntrega);
        // La ENTREGA VIGENTE = el último acuerdo agendado. El modal solo muestra lo
        // capturado desde entonces (nota de Paula + archivos de ESTA entrega), no el
        // historial completo del lead (ese vive en el proyecto).
        const acuerdoRef = [...(r.acuerdos || [])].pop() || null;
        // Sin acuerdo agendado (fecha puesta a mano): la entrega vigente se ancla al
        // PRIMER archivo de entrega (soporte/final) — si no, el modal salía vacío
        // aunque hubiera archivos FINAL y mensaje para el cliente (caso Ross).
        let desde = acuerdoRef?.creadoEn ? new Date(acuerdoRef.creadoEn) : null;
        if (!desde) {
          const deEntrega = (r.archivos || []).filter((a) => (a.rol === 'soporte' || a.rol === 'final') && a.subidoEn);
          if (deEntrega.length) desde = new Date(Math.min(...deEntrega.map((a) => new Date(a.subidoEn).getTime())) - 60 * 1000);
        }
        const notasEntrega = desde ? (r.notas || []).filter((n) => n.fecha && new Date(n.fecha) >= desde) : [];
        const archivosEntrega = desde ? (r.archivos || []).filter((a) => a.subidoEn && new Date(a.subidoEn) >= desde) : [];
        const nArch = archivosEntrega.length;
        return (
          <div className="pb-modal-overlay" onClick={() => setEntregaModalId(null)}>
            <div className="pb-modal pb-modal-entrega" onClick={(e) => e.stopPropagation()}>
              <div className="pb-modal-head">
                <h3>📦 Entrega · {r.cliente}</h3>
                <button className="pb-x" onClick={() => setEntregaModalId(null)}>✕</button>
              </div>
              <div className="pb-modal-body">
                <div className="pb-ent-meta">
                  <span className={`pb-chip`} style={{ color: entregaColor(r), background: `${entregaColor(r)}22` }}>
                    <FaCalendarDay /> {fmtFecha(r.fechaEntrega)} · {relDias(r.fechaEntrega)}
                  </span>
                  {done
                    ? <span className="pb-ent-estado done"><FaCheckCircle /> Entregado{r.entregadoEn ? ` el ${fmtFecha(r.entregadoEn)}` : ''}</span>
                    : nArch > 0
                      ? <span className="pb-ent-estado loaded"><FaPaperclip /> Cargado · falta desahogar</span>
                      : <span className="pb-ent-estado none"><FaPaperclip /> Sin archivo</span>}
                  {isUrgente(r) && <UrgenteTag />}
                  {d !== null && d < 0 && !done && <span className="pb-vencidas">atrasada {-d}d</span>}
                  {canMark && (
                    <button className={`pb-flag urg sm ${r.urgente ? 'on' : ''}`}
                      onClick={() => handleFlag(r, 'urgente', !r.urgente)}
                      title={r.urgente ? 'Quitar la marca manual de urgente' : 'Marcar esta entrega como URGENTE'}>
                      🚨 {r.urgente ? 'Quitar urgente' : 'Marcar urgente'}
                    </button>
                  )}
                </div>

                {/* Requisitos de la entrega (acuerdos) */}
                <div className="pb-field">Requisitos de la entrega
                  <div className="pb-ent-reqs">
                    {!acuerdoRef && <div className="pb-faint">Sin entrega agendada — usa "+ Entrega" para registrarla.</div>}
                    {acuerdoRef && (
                      <div className="pb-todo-item">
                        <span>{acuerdoRef.fuente === 'fireflies' ? '🎙' : '🤝'}</span>
                        <div>
                          {acuerdoRef.texto || <em>Sin texto</em>}
                          {acuerdoRef.fechaEntrega && <b> · para el {fmtFecha(acuerdoRef.fechaEntrega)}</b>}
                          <small className="pb-faint"> (agendada el {fmtFecha(acuerdoRef.creadoEn)})</small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notas (últimas) */}
                <div className="pb-field">Notas de esta entrega
                  <div className="pb-ent-reqs">
                    {notasEntrega.length === 0 && <div className="pb-faint">Sin notas de esta entrega. (El historial completo está en el proyecto.)</div>}
                    {[...notasEntrega].reverse().map((n) => (
                      <div key={n._id || n.fecha} className={`pb-nota ${String(n.texto || '').startsWith('📨') ? 'msg-cliente' : ''}`}>
                        <div className="pb-nota-txt">{cleanNota(n.texto)}</div>
                        <div className="pb-nota-meta">{n.autor || 'Admin'} · {fmtNota(n.fecha)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Archivos: soporte (Paula) y FINAL (Arturo al desahogar) */}
                {(() => {
                  const soporte = archivosEntrega.filter((a) => a.rol !== 'final');
                  const finales = archivosEntrega.filter((a) => a.rol === 'final');
                  const renderFile = (a, esFinal) => (
                    <div key={a._id || a.url} className={`pb-file ${esFinal ? 'final' : ''}`}>
                      <a className="pb-file-main" href={a.url} target="_blank" rel="noopener noreferrer">
                        <FaFileAlt />
                        <span className="pb-file-info">
                          <b>{a.nombre || 'archivo'}</b>
                          <small>{a.subidoPor || 'Admin'} · {a.subidoEn ? fmtFecha(a.subidoEn) : ''} {a.size ? `· ${fmtBytes(a.size)}` : ''}</small>
                        </span>
                      </a>
                      <span className={`pb-file-badge ${esFinal ? 'final' : ''}`}>{esFinal ? 'FINAL' : 'soporte'}</span>
                      {canMark && <button className="pb-file-del" title="Borrar archivo" onClick={() => handleBorrarArchivo(r, a._id)}><FaTrashAlt /></button>}
                    </div>
                  );
                  return (
                    <>
                      <div className="pb-field">Soporte de la entrega ({soporte.length}) — lo carga Paula
                        <div className="pb-files">
                          {soporte.length === 0 && <div className="pb-faint">Sin archivos de soporte todavía.</div>}
                          {[...soporte].reverse().map((a) => renderFile(a, false))}
                        </div>
                        <div className="pb-agenda-actions" style={{ marginTop: 8 }}>
                          <button className="pb-btn" disabled={saving} onClick={() => fileRefs.current[`entm-${r.id}`]?.click()}>
                            <FaCloudUploadAlt /> Cargar soporte
                          </button>
                          <input type="file" hidden multiple ref={(el) => { fileRefs.current[`entm-${r.id}`] = el; }}
                            onChange={(e) => { const fs = e.target.files; handleUploadEntregables(r, fs, 'soporte'); e.target.value = ''; }} />
                        </div>
                      </div>
                      <div className="pb-field">Archivo FINAL ({finales.length}) — lo adjunta Arturo al desahogar
                        <div className="pb-files">
                          {finales.length === 0 && <div className="pb-faint">{done ? 'Entregado sin archivo final adjunto.' : 'Pendiente de desahogo.'}</div>}
                          {[...finales].reverse().map((a) => renderFile(a, true))}
                        </div>
                        <div className="pb-agenda-actions" style={{ marginTop: 8 }}>
                          {canDesahogar && !done && (
                            <textarea className="pb-msg-cliente" rows="2"
                              placeholder="📨 Mensaje para el cliente (nota para Paula: qué decirle al enviar los archivos)…"
                              value={msgCliente} onChange={(e) => setMsgCliente(e.target.value)} />
                          )}
                          {canDesahogar && (
                            <>
                              <button className="pb-btn pb-btn-desahogar" disabled={saving} onClick={() => fileRefs.current[`entf-${r.id}`]?.click()}
                                title="Adjunta uno o varios archivos finales (no marca la entrega; eso lo haces con el botón de abajo)">
                                <FaCloudUploadAlt /> {finales.length ? 'Agregar otro archivo FINAL' : 'Adjuntar archivo FINAL'}
                              </button>
                              <input type="file" hidden multiple ref={(el) => { fileRefs.current[`entf-${r.id}`] = el; }}
                                onChange={(e) => { const fs = e.target.files; handleUploadEntregables(r, fs, 'final'); e.target.value = ''; }} />
                            </>
                          )}
                          {/* Botón explícito: Arturo marca su parte lista (handoff a Paula) */}
                          {canMark && (
                            done
                              ? <button className="pb-btn" disabled={saving} onClick={() => handleEntregado(r, false)} title="Desmarcar: mi parte ya no está lista">
                                  ↩️ Desmarcar mi parte {r.entregadoEn ? `(${fmtFecha(r.entregadoEn)})` : ''}
                                </button>
                              : <button className="pb-btn pb-btn-enviar" disabled={saving} onClick={() => handleEntregado(r, true)} title="Marca que TU parte está lista; Paula lo envía al cliente">
                                  ✅ Marcar mi parte lista (para Paula)
                                </button>
                          )}
                          {done && (
                            r.entregaEnviada
                              ? <button className="pb-btn pb-btn-desahogar" disabled={saving} onClick={() => handleEnviado(r, false)} title="Clic para desmarcar">
                                  <FaCheckCircle /> Enviado al cliente ✅ {r.entregaEnviadaEn ? `(${fmtFecha(r.entregaEnviadaEn)})` : ''}
                                </button>
                              : <button className="pb-btn pb-btn-enviar" disabled={saving} onClick={() => handleEnviado(r, true)} title="Paula: marca cuando ya se lo mandaste al cliente">
                                  📤 Marcar como ENVIADO al cliente
                                </button>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="pb-modal-foot">
                <button className="pb-btn" onClick={() => { setEntregaModalId(null); abrirProyecto(r.id); }}>
                  Ver proyecto completo <FaChevronRight />
                </button>
                <div style={{ flex: 1 }} />
                <button className="pb-btn pb-btn-blue" onClick={() => setEntregaModalId(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══ MODAL: NUEVA ENTREGA MANUAL ══ */}
      {showNueva && (() => {
        const q = norm(nueva.query.trim());
        // Candidatos del board (cotización pagada, instantáneos)…
        const localMatches = q
          ? rows.filter((r) => norm(`${r.cliente} ${r.title} ${r.celular}`).includes(q)).slice(0, 6)
              .map((r) => ({ id: r.id, cliente: r.cliente, title: r.title, celular: r.celular, paid: true }))
          : [];
        const localIds = new Set(localMatches.map((m) => String(m.id)));
        // …+ candidatos del servidor (cualquier status: pagados por fuera del flujo online)
        const remoteMatches = (leadRemoto || []).filter((r) => !localIds.has(String(r.id))).slice(0, 8);
        const picks = [...localMatches, ...remoteMatches];
        const sel = rows.find((r) => String(r.id) === String(nueva.rowId))
          || (nueva.leadInfo && String(nueva.leadInfo.id) === String(nueva.rowId) ? nueva.leadInfo : null);
        const selRemoto = !!sel && !rows.some((r) => String(r.id) === String(nueva.rowId));
        return (
          <div className="pb-modal-overlay" onClick={() => setShowNueva(false)}>
            <div className="pb-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pb-modal-head">
                <h3>📦 Agendar entrega</h3>
                <button className="pb-x" onClick={() => setShowNueva(false)}>✕</button>
              </div>
              <div className="pb-modal-body">
                <label className="pb-field">¿De qué lead es? *
                  {sel ? (
                    <>
                      <div className="pb-sel-lead">
                        <b>{sel.cliente}</b>
                        <span className="pb-title">{sel.title}</span>
                        <button className="pb-fchip" onClick={() => setNueva({ ...nueva, rowId: null, query: '', leadInfo: null })}>Cambiar</button>
                      </div>
                      {/* Desglose: en qué estatus va el proyecto (solo si está en el board) */}
                      {selRemoto ? (
                        <div className="pb-sel-status">
                          <span className="pb-sel-dato">📦 Solo rastreo de entrega — su cotización no está marcada como pagada. La entrega aparecerá en Hoy/Próximos igual.</span>
                        </div>
                      ) : (
                        <div className="pb-sel-status">
                          <StatusChip status={sel.status} />
                          <AvanceBar avance={sel.avance} />
                          <span className="pb-sel-dato">💰 {mxn(sel.pagado)} / {mxn(sel.montoTotal)} ({sel.nPagadas}/{sel.nParcialidades} pagos)</span>
                          <span className="pb-sel-dato">📎 {sel.archivos?.length || 0} entrega{(sel.archivos?.length || 0) !== 1 ? 's' : ''} previa{(sel.archivos?.length || 0) !== 1 ? 's' : ''}</span>
                          {sel.fechaEntrega && <span className="pb-sel-dato">📦 última fecha: {fmtFecha(sel.fechaEntrega)}</span>}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <input autoFocus placeholder="Busca por nombre, proyecto o teléfono…" value={nueva.query}
                        onChange={(e) => setNueva({ ...nueva, query: e.target.value })} />
                      {picks.length > 0 && (
                        <div className="pb-lead-list">
                          {picks.map((r) => (
                            /* pointerdown SOLO evita el blur (teclado abierto); la selección va en
                               click: si se selecciona en pointerdown, el re-render pone "Cambiar"
                               bajo el dedo y el click del mismo tap la deshace al instante */
                            <button key={r.id} type="button"
                              onPointerDown={(e) => e.preventDefault()}
                              onClick={(e) => { e.preventDefault(); setNueva({ ...nueva, rowId: r.id, query: '', leadInfo: { id: r.id, cliente: r.cliente, title: r.title, celular: r.celular } }); }}>
                              <b>{r.cliente}</b>
                              <span>{r.title || 'Proyecto'}{!r.paid ? ' · sin cotización pagada' : ''}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {q.length >= 2 && !picks.length && (
                        <small className="pb-faint">{buscandoLead ? 'Buscando…' : 'Sin resultados — revisa el nombre o el teléfono.'}</small>
                      )}
                    </>
                  )}
                </label>
                <label className="pb-field">Categoría de la entrega
                  <select value={nueva.categoria} onChange={(e) => setNueva({ ...nueva, categoria: e.target.value })}>
                    <option value="">Selecciona categoría…</option>
                    {CATEGORIAS_ENTREGA.map((c) => <option key={c.k} value={c.k}>{c.l}</option>)}
                  </select>
                </label>
                <label className="pb-field">¿Qué pidió?
                  <input placeholder="Ej: Capítulo 3 corregido, avance de metodología…" value={nueva.quePidio}
                    onChange={(e) => setNueva({ ...nueva, quePidio: e.target.value })} />
                </label>
                <div className="pb-field-row">
                  <label className="pb-field">¿Cuándo lo pidió?
                    <input type="date" value={nueva.cuandoPidio} onChange={(e) => setNueva({ ...nueva, cuandoPidio: e.target.value })} />
                  </label>
                  <label className="pb-field">¿Para cuándo es? *
                    <input type="date" value={nueva.paraCuando} onChange={(e) => setNueva({ ...nueva, paraCuando: e.target.value })} />
                  </label>
                  <label className="pb-field">Hora
                    <input type="time" value={nueva.hora} onChange={(e) => setNueva({ ...nueva, hora: e.target.value })} />
                  </label>
                </div>
                <label className="pb-field">Nota de Paula (opcional)
                  <textarea rows="2" placeholder="Detalles, acuerdos, contexto…" value={nueva.nota}
                    onChange={(e) => setNueva({ ...nueva, nota: e.target.value })} />
                </label>
                <div className="pb-field">Archivos de la entrega (opcional)
                  <div className="pb-nueva-files">
                    {nuevaFiles.map((f, i) => (
                      <span key={`${f.name}-${i}`} className="pb-comp">
                        <a><FaFileAlt /> {f.name.length > 28 ? f.name.slice(0, 26) + '…' : f.name} <small>({fmtBytes(f.size)})</small></a>
                        <button type="button" onClick={() => setNuevaFiles((prev) => prev.filter((_, j) => j !== i))} title="Quitar"><FaTrashAlt /></button>
                      </span>
                    ))}
                    <button type="button" className="pb-comp-add" onClick={() => fileRefs.current['nueva-ent']?.click()}>
                      <FaCloudUploadAlt /> {nuevaFiles.length ? 'Agregar otro archivo' : 'Adjuntar archivos'}
                    </button>
                    <input type="file" hidden multiple ref={(el) => { fileRefs.current['nueva-ent'] = el; }}
                      onChange={(e) => {
                        const files = [...(e.target.files || [])].filter((f) => {
                          if (f.size > 15 * 1024 * 1024) { toast.error(`${f.name} pasa de 15 MB`); return false; }
                          return true;
                        });
                        e.target.value = '';
                        if (files.length) setNuevaFiles((prev) => [...prev, ...files]);
                      }} />
                  </div>
                </div>
                <div className="pb-hint">Se guarda como acuerdo + fecha de entrega del proyecto, aparece en el Calendario de entregas y crea el evento con hora en el Google Calendar de Arturo.</div>
              </div>
              <div className="pb-modal-foot">
                <button className="pb-btn" onClick={() => setShowNueva(false)}>Cancelar</button>
                <button className="pb-btn pb-btn-blue" disabled={saving} onClick={handleGuardarNueva}>
                  {saving ? 'Guardando…' : '📅 Agendar entrega'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
