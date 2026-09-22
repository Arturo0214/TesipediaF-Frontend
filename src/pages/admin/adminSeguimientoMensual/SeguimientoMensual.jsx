import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaCalendarCheck, FaSyncAlt, FaSearch, FaWhatsapp, FaCheckCircle, FaExclamationTriangle,
  FaRegClock, FaBan, FaChevronDown, FaChevronRight, FaFileCsv, FaStickyNote, FaTrashAlt,
  FaRegCircle, FaUserTie, FaMoneyBillWave, FaPaperclip, FaCloudUploadAlt, FaFileAlt,
  FaPencilAlt, FaCheck, FaTimes, FaHandshake, FaMicrophone, FaShippingFast, FaListAlt,
  FaFileInvoiceDollar, FaStar, FaRegStar,
} from 'react-icons/fa';
import axiosWithAuth from '../../../utils/axioswithAuth';
import revenueService from '../../../services/revenueService';
import {
  getSeguimientos, addNota, deleteNota, updateSeguimiento, uploadArchivo, deleteArchivo,
  addAcuerdo, deleteAcuerdo, syncFireflies,
} from '../../../services/seguimientoService';
import './SeguimientoMensual.css';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const ESTADO_GESTION = [
  { value: 'sin_gestion', label: 'Sin gestión' },
  { value: 'en_gestion', label: 'En gestión' },
  { value: 'promesa_pago', label: 'Promesa de pago' },
  { value: 'al_corriente', label: 'Al corriente' },
  { value: 'liquidado', label: 'Liquidado' },
  { value: 'incobrable', label: 'Incobrable' },
];

// Las contestaciones se guardan como notas con un prefijo que las liga a su mensaje padre:
//   "↳@<idDelMensaje>| <texto de la contestación>"
// Así la respuesta del cliente aparece anidada debajo del mensaje que enviaste.
const REPLY_RE = /^↳@([a-f0-9]{6,32})\|\s?([\s\S]*)$/i;
const parseNota = (n) => {
  const m = REPLY_RE.exec(n?.texto || '');
  if (m) return { isReply: true, parentId: m[1], texto: m[2] };
  return { isReply: false, parentId: null, texto: n?.texto || '' };
};
const tagReply = (parentId, texto) => `↳@${parentId}| ${texto.trim()}`;
// Armar hilo: mensajes principales + sus contestaciones agrupadas por id de padre
const buildThread = (notas = []) => {
  const mains = [];
  const repliesByParent = {};
  for (const n of notas) {
    const p = parseNota(n);
    if (p.isReply && p.parentId) {
      (repliesByParent[p.parentId] = repliesByParent[p.parentId] || []).push({ ...n, _clean: p.texto });
    } else {
      mains.push({ ...n, _clean: p.texto });
    }
  }
  return { mains, repliesByParent };
};
// Fecha y hora prominentes: "jue 28 jun · 6:00 p.m."
const fmtNotaFecha = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const dia = date.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' });
  const hora = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return `${dia} · ${hora}`;
};

const fmtBytes = (b) => {
  if (!b && b !== 0) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};
// Comprime imágenes client-side (canvas). Otros tipos se devuelven tal cual.
const compressImage = (file) => new Promise((resolve) => {
  if (!file || !file.type?.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return resolve(file);
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    const MAX = 1600; // lado máximo
    let { width, height } = img;
    if (width > MAX || height > MAX) {
      const scale = Math.min(MAX / width, MAX / height);
      width = Math.round(width * scale); height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (!blob || blob.size >= file.size) return resolve(file); // sin ganancia → original
      const nombre = file.name.replace(/\.(png|jpe?g|webp|bmp|tiff?)$/i, '') + '.jpg';
      resolve(new File([blob], nombre, { type: 'image/jpeg', lastModified: file.lastModified || Date.now() }));
    }, 'image/jpeg', 0.72);
  };
  img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
  img.src = url;
});

const mxn = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Math.round(n || 0));
const mxnExact = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
const soloDigitos = (s) => String(s || '').replace(/\D/g, '');
const fmtFecha = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : '—';
const fmtFechaFull = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const DAY = 24 * 60 * 60 * 1000;
// Días (enteros) desde/hasta una fecha, medidos por día calendario
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
  if (n > 0) return `en ${n}d`;
  return `hace ${-n}d`;
};

// Estado de pago de un renglón según sus parcialidades del periodo seleccionado
function calcEstadoPago({ montoSel, cobradoSel, porCobrarSel, perdidoSel, vencidoSel }) {
  if (montoSel < 0.5) return 'sin_cobro';
  if (porCobrarSel < 0.5 && perdidoSel < 0.5) return 'pagado';
  if (vencidoSel > 0.5) return 'vencido';
  if (porCobrarSel > 0.5) return 'por_cobrar';
  if (perdidoSel > 0.5) return 'perdido';
  return 'pagado';
}

const ESTADO_META = {
  pagado: { label: 'Pagado', cls: 'sm-chip-green', icon: FaCheckCircle },
  por_cobrar: { label: 'Por cobrar', cls: 'sm-chip-amber', icon: FaRegClock },
  vencido: { label: 'Vencido', cls: 'sm-chip-red', icon: FaExclamationTriangle },
  perdido: { label: 'Perdido', cls: 'sm-chip-gray', icon: FaBan },
  sin_cobro: { label: '—', cls: 'sm-chip-gray', icon: FaRegCircle },
};

const PROJ_STATUS = {
  pending: { label: 'Pendiente', color: '#9CA3AF' },
  in_progress: { label: 'En proceso', color: '#3B82F6' },
  review: { label: 'Revisión', color: '#A78BFA' },
  completed: { label: 'Entregado', color: '#10B981' },
  cancelled: { label: 'Cancelado', color: '#EF4444' },
};

const COT_STATUS = {
  paid: { label: 'Pagada', cls: 'sm-chip-green' },
  pending: { label: 'Pendiente', cls: 'sm-chip-amber' },
  approved: { label: 'Aprobada', cls: 'sm-chip-amber' },
  rejected: { label: 'Rechazada', cls: 'sm-chip-gray' },
  cancelled: { label: 'Cancelada', cls: 'sm-chip-gray' },
};

// Señal de atención del lead: ¿le respondimos? ¿hace cuánto fue el último seguimiento?
const AtencionChip = ({ atencion }) => {
  if (!atencion) return null;
  if (atencion.sinRespuesta) {
    return (
      <span className="sm-att-chip red pulse" title={`El lead escribió y nadie le ha contestado (${atencion.diasSinRespuesta ?? '?'} días)`}>
        <FaExclamationTriangle /> Sin responder al lead · {atencion.diasSinRespuesta ?? '?'}d
      </span>
    );
  }
  if (atencion.lastSeguimientoAt) {
    const d = atencion.diasSinSeguimiento ?? 0;
    const cls = d <= 3 ? 'green' : d <= 7 ? 'amber' : 'red';
    return (
      <span className={`sm-att-chip ${cls}`} title={`Último seguimiento: ${fmtNotaFecha(atencion.lastSeguimientoAt)}`}>
        <FaCheckCircle /> {d === 0 ? 'Atendido hoy' : `Seguimiento hace ${d}d`}
      </span>
    );
  }
  return (
    <span className="sm-att-chip red pulse" title="No hay respuestas de WhatsApp ni notas registradas para este lead">
      <FaRegCircle /> Sin seguimiento
    </span>
  );
};

const SeguimientoMensual = () => {
  const now = new Date();
  const [view, setView] = useState('entregas'); // entregas | flujo | pendientes
  const [year, setYear] = useState(now.getFullYear());
  const [selKey, setSelKey] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [cf, setCf] = useState(null);          // { monthly, yearTotals, projects }
  const [segRows, setSegRows] = useState([]);  // filas completas de /seguimientos (globales)
  const [segTotales, setSegTotales] = useState(null);
  const [segMap, setSegMap] = useState(new Map()); // quoteId -> capa manual + atención
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [notaInput, setNotaInput] = useState({});   // rowId -> texto (mensaje nuevo)
  const [replyInput, setReplyInput] = useState({}); // noteId -> texto (contestación)
  const [openReply, setOpenReply] = useState(null); // noteId con el input de contestación abierto
  const [editName, setEditName] = useState(null);   // rowId cuyo nombre se está editando
  const [nameInput, setNameInput] = useState('');    // texto del nombre en edición
  const [dragRow, setDragRow] = useState(null);      // rowId sobre el que se arrastra un archivo
  const fileInputsRef = useRef({});                  // rowId -> <input type=file>
  // Acuerdos (correcciones + fecha de entrega)
  const [acuerdoOpen, setAcuerdoOpen] = useState(null); // rowId con el editor abierto
  const [acuerdoTexto, setAcuerdoTexto] = useState('');
  const [acuerdoFecha, setAcuerdoFecha] = useState('');
  const [syncingFF, setSyncingFF] = useState(false);
  const [cotOpen, setCotOpen] = useState(new Set());    // rowIds con cotizaciones desplegadas
  const [showEntregadas, setShowEntregadas] = useState(false); // lista de entregadas colapsada
  const [pendFilter, setPendFilter] = useState('todos'); // filtro activo de la pestaña Pendientes
  // Filtros (pestaña flujo)
  const [search, setSearch] = useState('');
  const [vendedorFilter, setVendedorFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [soloActivos, setSoloActivos] = useState(false);

  const hoy = useMemo(() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; }, []);

  // Evitar que el navegador abra el archivo si se suelta fuera de la zona exacta
  useEffect(() => {
    const prevent = (e) => { e.preventDefault(); };
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => { window.removeEventListener('dragover', prevent); window.removeEventListener('drop', prevent); };
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cfData, seg] = await Promise.all([
        revenueService.getCashflow(year),
        getSeguimientos().catch(() => ({ rows: [], totales: null })),
      ]);
      setCf(cfData);
      setSegRows(seg?.rows || []);
      setSegTotales(seg?.totales || null);
      const map = new Map();
      for (const r of (seg?.rows || [])) {
        map.set(String(r.id), {
          notas: r.notas || [], estado: r.estado || 'sin_gestion', vendedor: r.vendedor || '',
          archivos: r.archivos || [], nombre: r.nombre || '', prioritario: !!r.prioritario,
          atencion: r.atencion || null, acuerdos: r.acuerdos || [], cotizaciones: r.cotizaciones || [],
        });
      }
      setSegMap(map);
    } catch (err) {
      toast.error('No se pudo cargar el seguimiento');
      console.error('Seguimiento fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Al cambiar de año, si el mes seleccionado no es del año, pasar a "año"
  useEffect(() => {
    if (selKey !== 'year' && !selKey.startsWith(String(year))) {
      const isCurrentYear = year === now.getFullYear();
      setSelKey(isCurrentYear ? `${year}-${String(now.getMonth() + 1).padStart(2, '0')}` : 'year');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  // ── Meses del año (12) con agregados ──
  const months = useMemo(() => {
    const byKey = new Map((cf?.monthly || []).map((m) => [m.key, m]));
    return Array.from({ length: 12 }, (_, i) => {
      const key = `${year}-${String(i + 1).padStart(2, '0')}`;
      const m = byKey.get(key) || { vendido: 0, cobrado: 0, porCobrar: 0, perdido: 0, gastos: 0, ganancia: 0 };
      return { key, i, label: MESES[i], corto: MESES_CORTO[i], ...m };
    });
  }, [cf, year]);

  // ── Construir renglón por proyecto para el periodo seleccionado ──
  const buildRow = useCallback((p) => {
    const insts = (p.installments || []).filter((it) => selKey === 'year' ? String(it.mes).startsWith(String(year)) : it.mes === selKey);
    let montoSel = 0, cobradoSel = 0, porCobrarSel = 0, perdidoSel = 0, vencidoSel = 0;
    for (const it of insts) {
      montoSel += it.amount || 0;
      if (it.status === 'paid') cobradoSel += it.amount || 0;
      else if (it.status === 'lost') perdidoSel += it.amount || 0;
      else {
        porCobrarSel += it.amount || 0;
        if (it.fecha && new Date(it.fecha) < hoy) vencidoSel += it.amount || 0;
      }
    }
    const estadoPago = calcEstadoPago({ montoSel, cobradoSel, porCobrarSel, perdidoSel, vencidoSel });
    const seg = segMap.get(String(p.id)) || {};
    const nombreRaw = (p.client || '').trim();
    const sinNombre = !nombreRaw || /^(s\/t|s\/n|sin nombre|cliente|lead)$/i.test(nombreRaw);
    return {
      ...p,
      insts,
      montoSel, cobradoSel, porCobrarSel, perdidoSel, vencidoSel,
      estadoPago,
      notas: seg.notas || [],
      archivos: seg.archivos || [],
      estadoGestion: seg.estado || 'sin_gestion',
      vendedorFinal: p.vendedor || seg.vendedor || '',
      client: seg.nombre || p.client || 'Cliente',
      sinNombre: sinNombre && !seg.nombre,
      atencion: seg.atencion || null,
      acuerdos: seg.acuerdos || [],
      prioritario: !!seg.prioritario,
    };
  }, [selKey, year, segMap, hoy]);

  const rowsAll = useMemo(() => {
    if (!cf?.projects) return [];
    return cf.projects.map(buildRow).filter((r) => r.insts.length > 0);
  }, [cf, buildRow]);

  const vendedores = useMemo(() => {
    const s = new Set();
    rowsAll.forEach((r) => { if (r.vendedorFinal) s.add(r.vendedorFinal); });
    return [...s].sort();
  }, [rowsAll]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = rowsAll.filter((r) => {
      if (soloActivos && (r.projectStatus === 'completed' || r.projectStatus === 'cancelled')) return false;
      if (vendedorFilter !== 'todos' && r.vendedorFinal !== vendedorFilter) return false;
      if (estadoFilter !== 'todos' && r.estadoPago !== estadoFilter) return false;
      if (q) {
        const hay = `${r.client} ${r.title} ${r.phone} ${r.vendedorFinal}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const rank = { vencido: 0, por_cobrar: 1, pagado: 2, perdido: 3, sin_cobro: 4 };
    arr.sort((a, b) => {
      if (a.prioritario !== b.prioritario) return b.prioritario - a.prioritario;
      if (rank[a.estadoPago] !== rank[b.estadoPago]) return rank[a.estadoPago] - rank[b.estadoPago];
      return (b.montoSel || 0) - (a.montoSel || 0);
    });
    return arr;
  }, [rowsAll, search, vendedorFilter, estadoFilter, soloActivos]);

  // KPIs del periodo (sobre rowsAll, sin filtros de texto)
  const kpis = useMemo(() => {
    if (selKey === 'year') {
      const yt = cf?.yearTotals || { vendido: 0, cobrado: 0, porCobrar: 0, perdido: 0, gastos: 0, ganancia: 0 };
      const vencido = rowsAll.reduce((a, r) => a + r.vencidoSel, 0);
      return { ...yt, vencido, label: `Año ${year}` };
    }
    const m = months.find((x) => x.key === selKey) || { vendido: 0, cobrado: 0, porCobrar: 0, perdido: 0, gastos: 0, ganancia: 0 };
    const vencido = rowsAll.reduce((a, r) => a + r.vencidoSel, 0);
    const idx = Number(selKey.split('-')[1]) - 1;
    return { ...m, vencido, label: `${MESES[idx]} ${year}` };
  }, [selKey, months, cf, rowsAll, year]);

  const totalesTabla = useMemo(() => rows.reduce((a, r) => ({
    monto: a.monto + r.montoSel, cobrado: a.cobrado + r.cobradoSel,
    porCobrar: a.porCobrar + r.porCobrarSel, vencido: a.vencido + r.vencidoSel,
  }), { monto: 0, cobrado: 0, porCobrar: 0, vencido: 0 }), [rows]);

  // ── Pestaña ENTREGAS ──
  // Regla de negocio: si el cliente ya pagó el 100%, el proyecto ya se entregó
  // (se corrobora con los archivos cargados). Solo son "por entregar" los que
  // aún deben. Un liquidado SIN archivos queda como "terminado, falta cargar".
  const entregasData = useMemo(() => {
    const porEntregar = [], sinArchivos = [], entregadas = [];
    for (const r of segRows) {
      if (r.projectStatus === 'cancelled' || r.estado === 'incobrable') continue;
      const tieneArchivos = (r.archivos?.length || 0) > 0;
      if (r.entregado || r.projectStatus === 'completed' || (r.liquidado && tieneArchivos)) entregadas.push(r);
      else if (r.liquidado) sinArchivos.push(r);
      else porEntregar.push(r);
    }
    const byFecha = (a, b) => {
      if (!!a.prioritario !== !!b.prioritario) return !!b.prioritario - !!a.prioritario;
      const fa = a.fechaEntrega ? new Date(a.fechaEntrega).getTime() : Infinity;
      const fb = b.fechaEntrega ? new Date(b.fechaEntrega).getTime() : Infinity;
      return fa - fb;
    };
    porEntregar.sort(byFecha);
    sinArchivos.sort(byFecha);
    entregadas.sort((a, b) => new Date(b.entregadoEn || b.fechaEntrega || 0) - new Date(a.entregadoEn || a.fechaEntrega || 0));
    const vencidas = porEntregar.filter((r) => { const d = diasHasta(r.fechaEntrega); return d !== null && d < 0; }).length;
    return { porEntregar, sinArchivos, entregadas, vencidas };
  }, [segRows]);

  // ── Pestaña PENDIENTES: los KPIs de arriba funcionan como filtros ──
  const pendientesRows = useMemo(() => {
    let arr;
    switch (pendFilter) {
      case 'sin_respuesta':
        arr = segRows.filter((r) => r.atencion?.sinRespuesta);
        break;
      case 'vencido':
        arr = segRows.filter((r) => r.nVencidas > 0 && (r.porCobrarActivo || 0) > 0.5);
        break;
      case 'atraso':
        arr = segRows.filter((r) => (r.cobradoConAtraso || 0) > 0);
        break;
      case 'entregas7':
        arr = segRows.filter((r) => {
          if (r.projectStatus === 'completed' || r.projectStatus === 'cancelled' || r.entregado || r.liquidado) return false;
          const d = diasHasta(r.fechaEntrega);
          return d !== null && d >= 0 && d <= 7;
        });
        break;
      default:
        arr = segRows.filter((r) => (r.porCobrarActivo || 0) > 0.5 || r.atencion?.sinRespuesta);
    }
    return [...arr].sort((a, b) => {
      if (!!a.prioritario !== !!b.prioritario) return !!b.prioritario - !!a.prioritario;
      const sa = a.atencion?.sinRespuesta ? 0 : 1;
      const sb = b.atencion?.sinRespuesta ? 0 : 1;
      if (sa !== sb) return sa - sb;
      if ((b.nVencidas > 0) !== (a.nVencidas > 0)) return (b.nVencidas > 0) - (a.nVencidas > 0);
      return (b.porCobrarActivo || 0) - (a.porCobrarActivo || 0);
    });
  }, [segRows, pendFilter]);

  const pendKpis = useMemo(() => {
    const sinRespuesta = segRows.filter((r) => r.atencion?.sinRespuesta).length;
    const vencidoActivo = segRows.reduce((a, r) => a + (r.nVencidas > 0 ? (r.porCobrarActivo || 0) : 0), 0);
    const cobradoConAtraso = segTotales?.cobradoConAtraso || 0;
    const entregas7d = segRows.filter((r) => {
      if (r.projectStatus === 'completed' || r.projectStatus === 'cancelled' || r.entregado || r.liquidado) return false;
      const d = diasHasta(r.fechaEntrega);
      return d !== null && d >= 0 && d <= 7;
    }).length;
    return { sinRespuesta, vencidoActivo, cobradoConAtraso, entregas7d };
  }, [segRows, segTotales]);

  // ── Acciones ──
  const toggleExpand = (id) => setExpanded((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleCot = (id) => setCotOpen((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const patchInstallment = async (quoteId, idx, status) => {
    const key = `${quoteId}-${idx}`;
    setSaving(key);
    try {
      const { data } = await axiosWithAuth.patch(`/payments/dashboard/${quoteId}/installment?source=sofia`, { installmentIndex: idx, status });
      const paidAtMap = data?.installmentPaidAt || {};
      // Actualizar localmente sin recargar todo (incluida la fecha real de pago)
      setCf((prev) => {
        if (!prev) return prev;
        const projects = prev.projects.map((p) => {
          if (String(p.id) !== String(quoteId)) return p;
          return { ...p, installments: p.installments.map((it) => it.idx === idx ? { ...it, status, paidAt: paidAtMap[String(idx)] || null } : it) };
        });
        return { ...prev, projects };
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar el cobro');
    } finally {
      setSaving(null);
    }
  };

  const marcarMesCobrado = async (row) => {
    const pend = row.insts.filter((it) => it.status !== 'paid' && it.status !== 'lost');
    if (!pend.length) return;
    setSaving(`row-${row.id}`);
    try {
      for (const it of pend) {
        await axiosWithAuth.patch(`/payments/dashboard/${row.id}/installment?source=sofia`, { installmentIndex: it.idx, status: 'paid' });
      }
      toast.success(`Cobro registrado para ${row.client} ✅`);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar el cobro');
    } finally {
      setSaving(null);
    }
  };

  const startEditName = (row) => { setEditName(row.id); setNameInput(row.sinNombre ? '' : row.client); };
  const handleSaveName = async (row) => {
    const nombre = nameInput.trim();
    if (!nombre) { setEditName(null); return; }
    setSegMap((prev) => { const n = new Map(prev); n.set(String(row.id), { ...(n.get(String(row.id)) || {}), nombre }); return n; });
    setEditName(null);
    try { await updateSeguimiento('quote', row.id, { nombre }); toast.success('Nombre actualizado'); }
    catch { toast.error('No se pudo guardar el nombre'); fetchAll(); }
  };

  const handleEstadoGestion = async (row, estado) => {
    setSegMap((prev) => { const n = new Map(prev); n.set(String(row.id), { ...(n.get(String(row.id)) || {}), estado }); return n; });
    try { await updateSeguimiento('quote', row.id, { estado }); }
    catch { toast.error('No se pudo actualizar el estado'); }
  };

  // Registrar una nota cuenta como atender al lead: el chip pasa a "Atendido hoy"
  // sin esperar a recargar (el backend llega a la misma conclusión en el próximo fetch).
  const marcarAtendidoLocal = (rowId) => {
    const ahora = new Date().toISOString();
    const patch = (at) => ({
      ...(at || {}),
      lastSeguimientoAt: ahora,
      sinRespuesta: false,
      diasSinRespuesta: null,
      diasSinSeguimiento: 0,
    });
    setSegMap((prev) => { const n = new Map(prev); const e = n.get(String(rowId)) || {}; n.set(String(rowId), { ...e, atencion: patch(e.atencion) }); return n; });
    setSegRows((prev) => prev.map((r) => String(r.id) === String(rowId) ? { ...r, atencion: patch(r.atencion) } : r));
  };

  const addNotaText = async (row, texto) => {
    const t = (texto || '').trim();
    if (!t) return;
    setSaving(`nota-${row.id}`);
    try {
      const { notas } = await addNota('quote', row.id, t);
      setSegMap((prev) => { const n = new Map(prev); n.set(String(row.id), { ...(n.get(String(row.id)) || {}), notas }); return n; });
      setNotaInput((prev) => ({ ...prev, [row.id]: '' }));
      marcarAtendidoLocal(row.id);
    } catch { toast.error('No se pudo agregar la nota'); }
    finally { setSaving(null); }
  };
  const handleAddNota = (row) => addNotaText(row, notaInput[row.id]);

  // Agregar la contestación del cliente debajo de un mensaje específico
  const handleAddReply = async (row, parentNoteId) => {
    const texto = (replyInput[parentNoteId] || '').trim();
    if (!texto) return;
    await addNotaText(row, tagReply(parentNoteId, texto));
    setReplyInput((prev) => ({ ...prev, [parentNoteId]: '' }));
    setOpenReply(null);
  };

  const handleDelNota = async (row, notaId) => {
    try {
      const { notas } = await deleteNota('quote', row.id, notaId);
      setSegMap((prev) => { const n = new Map(prev); n.set(String(row.id), { ...(n.get(String(row.id)) || {}), notas }); return n; });
    } catch { toast.error('No se pudo borrar la nota'); }
  };

  const handleUploadArchivo = async (row, file) => {
    if (!file) return;
    setSaving(`file-${row.id}`);
    try {
      const original = file.size;
      const f = await compressImage(file).catch(() => file);
      if (f.size > 15 * 1024 * 1024) { toast.error('Máximo 15 MB (aún comprimido)'); return; }
      const { archivos } = await uploadArchivo('quote', row.id, f);
      setSegMap((prev) => { const n = new Map(prev); n.set(String(row.id), { ...(n.get(String(row.id)) || {}), archivos }); return n; });
      // También en las filas globales: con archivo cargado un liquidado pasa a "entregada"
      setSegRows((prev) => prev.map((x) => String(x.id) === String(row.id) ? { ...x, archivos } : x));
      if (f.size < original * 0.95) toast.success(`Subido y comprimido: ${fmtBytes(original)} → ${fmtBytes(f.size)} ✅`);
      else toast.success('Archivo subido ✅');
    } catch { toast.error('No se pudo subir el archivo'); }
    finally { setSaving(null); }
  };

  const handleDelArchivo = async (row, archivoId) => {
    if (!window.confirm('¿Eliminar este archivo?')) return;
    try {
      const { archivos } = await deleteArchivo('quote', row.id, archivoId);
      setSegMap((prev) => { const n = new Map(prev); n.set(String(row.id), { ...(n.get(String(row.id)) || {}), archivos }); return n; });
    } catch { toast.error('No se pudo borrar el archivo'); }
  };

  // ── Prioritario: estrella que sube el lead al inicio de todas las pestañas ──
  const handleTogglePrioritario = async (rowId, actual) => {
    const nuevo = !actual;
    setSegRows((prev) => prev.map((r) => String(r.id) === String(rowId) ? { ...r, prioritario: nuevo } : r));
    setSegMap((prev) => { const n = new Map(prev); n.set(String(rowId), { ...(n.get(String(rowId)) || {}), prioritario: nuevo }); return n; });
    try { await updateSeguimiento('quote', rowId, { prioritario: nuevo }); }
    catch {
      toast.error('No se pudo cambiar la prioridad');
      setSegRows((prev) => prev.map((r) => String(r.id) === String(rowId) ? { ...r, prioritario: actual } : r));
      setSegMap((prev) => { const n = new Map(prev); n.set(String(rowId), { ...(n.get(String(rowId)) || {}), prioritario: actual }); return n; });
    }
  };

  // ── Marcar entregada (a mano, para proyectos que no siguen la regla de pago) ──
  const handleMarcarEntregada = async (rowId, valor) => {
    setSaving(`ent-${rowId}`);
    try {
      const resp = await updateSeguimiento('quote', rowId, { entregado: valor });
      setSegRows((prev) => prev.map((r) => String(r.id) === String(rowId)
        ? { ...r, entregado: resp.entregado, entregadoEn: resp.entregadoEn }
        : r));
      toast.success(valor ? 'Marcada como entregada ✅' : 'Entrega desmarcada');
    } catch { toast.error('No se pudo actualizar la entrega'); }
    finally { setSaving(null); }
  };

  const PrioBtn = ({ row }) => (
    <button
      className={`sm-prio-btn ${row.prioritario ? 'on' : ''}`}
      onClick={(e) => { e.stopPropagation(); handleTogglePrioritario(row.id, !!row.prioritario); }}
      title={row.prioritario ? 'Quitar prioridad' : 'Marcar como prioritario'}
    >
      {row.prioritario ? <FaStar /> : <FaRegStar />}
    </button>
  );

  // ── Acuerdos: correcciones + fecha de entrega ──
  const openAcuerdo = (rowId) => { setAcuerdoOpen(rowId); setAcuerdoTexto(''); setAcuerdoFecha(''); };
  const handleAddAcuerdo = async (rowId) => {
    if (!acuerdoTexto.trim() && !acuerdoFecha) { toast.error('Escribe las correcciones o pon una fecha de entrega'); return; }
    setSaving(`acuerdo-${rowId}`);
    try {
      const { acuerdos, fechaEntrega } = await addAcuerdo('quote', rowId, { texto: acuerdoTexto, fechaEntrega: acuerdoFecha || null });
      setSegRows((prev) => prev.map((r) => String(r.id) === String(rowId)
        ? { ...r, acuerdos, ultimoAcuerdo: acuerdos[acuerdos.length - 1] || null, fechaEntrega: fechaEntrega || r.fechaEntrega }
        : r));
      setSegMap((prev) => { const n = new Map(prev); n.set(String(rowId), { ...(n.get(String(rowId)) || {}), acuerdos }); return n; });
      setAcuerdoOpen(null); setAcuerdoTexto(''); setAcuerdoFecha('');
      marcarAtendidoLocal(rowId); // registrar un acuerdo también cuenta como atención
      toast.success('Acuerdo guardado ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo guardar el acuerdo');
    } finally { setSaving(null); }
  };
  const handleDelAcuerdo = async (rowId, acuerdoId) => {
    if (!window.confirm('¿Eliminar este acuerdo?')) return;
    try {
      const { acuerdos } = await deleteAcuerdo('quote', rowId, acuerdoId);
      setSegRows((prev) => prev.map((r) => String(r.id) === String(rowId)
        ? { ...r, acuerdos, ultimoAcuerdo: acuerdos[acuerdos.length - 1] || null }
        : r));
      setSegMap((prev) => { const n = new Map(prev); n.set(String(rowId), { ...(n.get(String(rowId)) || {}), acuerdos }); return n; });
    } catch { toast.error('No se pudo borrar el acuerdo'); }
  };

  // ── Borrar cotizaciones duplicadas del lead (no permite borrar pagadas) ──
  const handleDeleteCotizacion = async (cot) => {
    if (cot.status === 'paid') {
      toast.error('Esa cotización está PAGADA y vive en el tablero; bórrala desde la sección Cotizaciones solo si estás seguro.');
      return;
    }
    if (!window.confirm(`¿Borrar la cotización "${cot.titulo}" (${mxn(cot.precio)})?\nEsto no se puede deshacer.`)) return;
    setSaving(`cot-${cot.id}`);
    try {
      await axiosWithAuth.delete(`/quotes/generated/${cot.id}`);
      const quitar = (list) => (list || []).filter((c) => String(c.id) !== String(cot.id));
      setSegRows((prev) => prev.map((r) => r.cotizaciones?.length ? { ...r, cotizaciones: quitar(r.cotizaciones) } : r));
      setSegMap((prev) => {
        const n = new Map(prev);
        for (const [k, v] of n) if (v.cotizaciones?.length) n.set(k, { ...v, cotizaciones: quitar(v.cotizaciones) });
        return n;
      });
      toast.success('Cotización duplicada eliminada 🗑');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo borrar la cotización');
    } finally { setSaving(null); }
  };

  const handleSyncFireflies = async () => {
    setSyncingFF(true);
    try {
      const r = await syncFireflies(21);
      if (r.nuevos > 0) toast.success(`🎙 ${r.nuevos} acuerdo(s) importados de ${r.procesadas} sesión(es)`);
      else toast(r.nota || `Sin acuerdos nuevos (${r.meetings} sesiones revisadas)`);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo sincronizar Fireflies');
    } finally { setSyncingFF(false); }
  };

  const exportCsv = () => {
    const headers = ['Cliente', 'Proyecto', 'Número', 'Monto periodo', 'Cobrado', 'Por cobrar', 'Vencido', 'Estado pago', 'Atención', 'Avance', 'Entrega', 'Gestión', 'Última nota'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = rows.map((r) => [
      r.client, r.title, r.phone, r.montoSel, r.cobradoSel, r.porCobrarSel, r.vencidoSel,
      ESTADO_META[r.estadoPago]?.label, r.vendedorFinal,
      r.progress != null ? `${r.progress}%` : '', r.dueDate ? new Date(r.dueDate).toISOString().slice(0, 10) : '',
      ESTADO_GESTION.find((e) => e.value === r.estadoGestion)?.label,
      r.notas?.length ? r.notas[r.notas.length - 1].texto : (r.nota || ''),
    ].map(esc).join(','));
    const csv = [headers.map(esc).join(','), ...lines].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `seguimiento-${kpis.label.replace(/\s/g, '-').toLowerCase()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Incluye el año siguiente para poder programar cobros/entregas a futuro
  const yearOptions = [now.getFullYear() + 1, now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  // Editor inline de acuerdo (se usa en Entregas y en el detalle del flujo)
  const renderAcuerdoEditor = (rowId) => (
    <div className="sm-acuerdo-form" onClick={(e) => e.stopPropagation()}>
      <input
        type="date"
        value={acuerdoFecha}
        onChange={(e) => setAcuerdoFecha(e.target.value)}
        title="Fecha de entrega acordada"
      />
      <input
        autoFocus
        placeholder="Correcciones / acuerdo con el lead…"
        value={acuerdoTexto}
        onChange={(e) => setAcuerdoTexto(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleAddAcuerdo(rowId); if (e.key === 'Escape') setAcuerdoOpen(null); }}
      />
      <button className="sm-btn sm-btn-pay sm-btn-sm" disabled={saving === `acuerdo-${rowId}`} onClick={() => handleAddAcuerdo(rowId)}>
        {saving === `acuerdo-${rowId}` ? '…' : 'Guardar'}
      </button>
      <button className="sm-btn sm-btn-ghost sm-btn-sm" onClick={() => setAcuerdoOpen(null)}>✕</button>
    </div>
  );

  const renderAcuerdosList = (row, limit = 3) => {
    const acuerdos = row.acuerdos || [];
    if (!acuerdos.length) return null;
    return (
      <div className="sm-acuerdos-list">
        {[...acuerdos].reverse().slice(0, limit).map((a) => (
          <div key={a._id || a.creadoEn} className={`sm-acuerdo ${a.fuente === 'fireflies' ? 'ff' : ''}`}>
            <span className="sm-acuerdo-src" title={a.fuente === 'fireflies' ? `Fireflies: ${a.meetingTitle || 'sesión'}` : `Manual · ${a.autor || ''}`}>
              {a.fuente === 'fireflies' ? <FaMicrophone /> : <FaHandshake />}
            </span>
            <span className="sm-acuerdo-txt">
              {a.texto || <em>Sin correcciones</em>}
              {a.fechaEntrega && <b> · Entrega: {fmtFechaFull(a.fechaEntrega)}</b>}
              <span className="sm-acuerdo-meta"> ({fmtFecha(a.meetingDate || a.creadoEn)})</span>
            </span>
            <button className="sm-nota-del" onClick={(e) => { e.stopPropagation(); handleDelAcuerdo(row.id, a._id); }} title="Eliminar acuerdo"><FaTrashAlt /></button>
          </div>
        ))}
      </div>
    );
  };

  const renderCotizaciones = (row) => {
    const cots = row.cotizaciones || [];
    const abierto = cotOpen.has(row.id);
    return (
      <div className="sm-cots">
        <button className="sm-cots-toggle" onClick={(e) => { e.stopPropagation(); toggleCot(row.id); }}>
          <FaFileInvoiceDollar /> {cots.length} cotización{cots.length !== 1 ? 'es' : ''} {abierto ? <FaChevronDown /> : <FaChevronRight />}
        </button>
        {abierto && (
          <div className="sm-cots-list" onClick={(e) => e.stopPropagation()}>
            {cots.length === 0 && <div className="sm-faint">Sin cotizaciones registradas para este contacto.</div>}
            {cots.map((c) => {
              const meta = COT_STATUS[c.status] || { label: c.status, cls: 'sm-chip-gray' };
              const esActual = String(c.id) === String(row.id);
              return (
                <div key={c.id} className={`sm-cot ${esActual ? 'is-current' : ''}`}>
                  {c.folio && <span className="sm-cot-folio" title={`ID: ${c.id}`}>{c.folio}</span>}
                  <span className="sm-cot-title" title={c.titulo}>{c.titulo}</span>
                  <span className="sm-cot-precio">{mxn(c.precio)}</span>
                  <span className={`sm-chip ${meta.cls}`}>{meta.label}</span>
                  <span className="sm-cot-fecha">{fmtFechaFull(c.fecha)}</span>
                  {esActual && <span className="sm-cot-badge">en tablero</span>}
                  {!esActual && c.status !== 'paid' && (
                    <button
                      className="sm-nota-del"
                      disabled={saving === `cot-${c.id}`}
                      onClick={(e) => { e.stopPropagation(); handleDeleteCotizacion(c); }}
                      title="Borrar cotización duplicada"
                    >
                      {saving === `cot-${c.id}` ? '…' : <FaTrashAlt />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sm-wrap">
      {/* Header */}
      <div className="sm-head">
        <div>
          <h2><FaCalendarCheck /> Seguimiento</h2>
          <p className="sm-sub">Entregas, flujo de caja y pendientes de todos tus proyectos activos.</p>
        </div>
        <div className="sm-head-actions">
          <select className="sm-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {view === 'flujo' && (
            <button className="sm-btn sm-btn-ghost" onClick={exportCsv} disabled={!rows.length} title="Exportar a CSV">
              <FaFileCsv /> CSV
            </button>
          )}
          <button className="sm-btn sm-btn-ghost" onClick={fetchAll} disabled={loading} title="Actualizar">
            <FaSyncAlt className={loading ? 'sm-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Pestañas de la sección */}
      <div className="sm-tabs">
        <button className={`sm-tab ${view === 'entregas' ? 'active' : ''}`} onClick={() => setView('entregas')}>
          <FaShippingFast /> Entregas
          {entregasData.porEntregar.length > 0 && (
            <span className={`sm-tab-badge ${entregasData.vencidas > 0 ? 'red' : ''}`}>{entregasData.porEntregar.length}</span>
          )}
        </button>
        <button className={`sm-tab ${view === 'flujo' ? 'active' : ''}`} onClick={() => setView('flujo')}>
          <FaMoneyBillWave /> Flujo de caja
        </button>
        <button className={`sm-tab ${view === 'pendientes' ? 'active' : ''}`} onClick={() => setView('pendientes')}>
          <FaListAlt /> Pendientes
          {(pendKpis.sinRespuesta > 0) && <span className="sm-tab-badge red">{pendKpis.sinRespuesta}</span>}
        </button>
      </div>

      {loading ? (
        <div className="sm-empty">Cargando seguimiento…</div>
      ) : view === 'entregas' ? (
        /* ═══════════════ PESTAÑA ENTREGAS ═══════════════ */
        <>
          <div className="sm-toolbar sm-toolbar-entregas">
            <div className="sm-entregas-hint">
              Solo entregas <b>activas</b> (clientes que aún deben). Si un cliente ya pagó el 100%,
              su proyecto cuenta como entregado — y si no tiene archivos cargados aparece abajo
              como <b>terminado, falta cargar archivos</b>.
            </div>
            <button className="sm-btn sm-btn-ff" onClick={handleSyncFireflies} disabled={syncingFF} title="Lee tus sesiones de Fireflies y extrae con IA las fechas y correcciones acordadas">
              <FaMicrophone className={syncingFF ? 'sm-spin' : ''} /> {syncingFF ? 'Leyendo sesiones…' : 'Sincronizar Fireflies'}
            </button>
          </div>

          {/* ── Por entregar (activas: próximas o vencidas) ── */}
          {!entregasData.porEntregar.length ? (
            <div className="sm-empty">No tienes entregas activas pendientes. 🎉</div>
          ) : (
            <div className="sm-table-wrap">
              <table className="sm-table">
                <thead>
                  <tr>
                    <th>Cliente / Proyecto</th>
                    <th className="sm-col-estado">Entrega</th>
                    <th className="sm-col-prog">Avance</th>
                    <th className="sm-col-fecha">Fecha</th>
                    <th>Último acuerdo</th>
                    <th className="sm-col-act-lg"></th>
                  </tr>
                </thead>
                <tbody>
                  {entregasData.porEntregar.map((r) => {
                    const ps = PROJ_STATUS[r.projectStatus];
                    const dEnt = diasHasta(r.fechaEntrega);
                    const entCls = dEnt === null ? 'sm-faint' : dEnt < 0 ? 'sm-red' : dEnt <= 3 ? 'sm-amber' : '';
                    return (
                      <tr key={r.id} className={`sm-row ${dEnt !== null && dEnt < 0 ? 'vencido' : ''} ${r.prioritario ? 'sm-prio' : ''}`}>
                        <td className="sm-cell-client">
                          <div className="sm-client-line">
                            <PrioBtn row={r} />
                            {r.celular && (
                              <a className="sm-wa-ico" href={`https://wa.me/${soloDigitos(r.celular)}`} target="_blank" rel="noopener noreferrer" title={`WhatsApp ${r.celular}`}><FaWhatsapp /></a>
                            )}
                            <span className="sm-client">{r.cliente}</span>
                          </div>
                          <div className="sm-title">{r.title}</div>
                          <AtencionChip atencion={r.atencion} />
                        </td>
                        <td className="sm-col-estado">
                          {dEnt === null ? <span className="sm-chip sm-chip-gray"><FaRegClock /> Sin fecha</span>
                            : dEnt < 0 ? <span className="sm-chip sm-chip-red"><FaExclamationTriangle /> Vencida {relDias(r.fechaEntrega)}</span>
                              : dEnt <= 7 ? <span className="sm-chip sm-chip-amber"><FaRegClock /> Próxima · {relDias(r.fechaEntrega)}</span>
                                : <span className="sm-chip sm-chip-gray"><FaRegClock /> {relDias(r.fechaEntrega)}</span>}
                        </td>
                        <td className="sm-col-prog">
                          {ps ? (
                            <div className="sm-prog" title={`${ps.label}${r.progress != null ? ` · ${r.progress}%` : ''}`}>
                              <div className="sm-prog-bar"><span style={{ width: `${r.progress ?? 0}%`, background: ps.color }} /></div>
                              <span className="sm-prog-lbl" style={{ color: ps.color }}>{r.progress != null ? `${r.progress}%` : ps.label}</span>
                            </div>
                          ) : <span className="sm-faint">Sin proyecto</span>}
                        </td>
                        <td className={`sm-fecha sm-col-fecha ${entCls}`}>
                          {r.fechaEntrega ? fmtFechaFull(r.fechaEntrega) : '—'}
                        </td>
                        <td className="sm-cell-acuerdo">
                          {r.ultimoAcuerdo ? renderAcuerdosList(r, 2) : <span className="sm-faint">Sin acuerdos registrados</span>}
                        </td>
                        <td className="sm-col-act-lg">
                          {acuerdoOpen === r.id ? renderAcuerdoEditor(r.id) : (
                            <div className="sm-ent-actions">
                              <button className="sm-btn sm-btn-ghost sm-btn-sm" onClick={() => openAcuerdo(r.id)} title="Registrar correcciones y/o fecha de entrega acordada">
                                <FaHandshake /> Correcciones / entrega
                              </button>
                              <button className="sm-btn sm-btn-pay sm-btn-sm" disabled={saving === `ent-${r.id}`}
                                onClick={() => handleMarcarEntregada(r.id, true)} title="Marcar este proyecto como ya entregado">
                                {saving === `ent-${r.id}` ? '…' : <><FaCheck /> Entregada</>}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Terminados (pagados 100%) pero sin archivos cargados ── */}
          {entregasData.sinArchivos.length > 0 && (
            <div className="sm-ent-group warn">
              <h4><FaExclamationTriangle /> Proyecto terminado, falta cargar archivos ({entregasData.sinArchivos.length})</h4>
              <div className="sm-ent-group-hint">Pagados al 100% pero sin el entregable en el historial. Sube el archivo o márcalos entregados.</div>
              {entregasData.sinArchivos.map((r) => (
                <div key={r.id} className="sm-ent-item">
                  <div className="sm-ent-item-info">
                    <div className="sm-client-line">
                      <PrioBtn row={r} />
                      {r.celular && (
                        <a className="sm-wa-ico" href={`https://wa.me/${soloDigitos(r.celular)}`} target="_blank" rel="noopener noreferrer" title={`WhatsApp ${r.celular}`}><FaWhatsapp /></a>
                      )}
                      <span className="sm-client">{r.cliente}</span>
                      <span className="sm-chip sm-chip-amber"><FaCheckCircle /> Pagado 100% · sin archivos</span>
                    </div>
                    <div className="sm-title">{r.title}</div>
                  </div>
                  <div className="sm-ent-actions">
                    <button className="sm-btn sm-btn-ghost sm-btn-sm" disabled={saving === `file-${r.id}`}
                      onClick={() => fileInputsRef.current[`ent-${r.id}`]?.click()} title="Cargar el entregable final">
                      <FaCloudUploadAlt /> {saving === `file-${r.id}` ? 'Subiendo…' : 'Cargar archivo'}
                    </button>
                    <input type="file" hidden ref={(el) => { fileInputsRef.current[`ent-${r.id}`] = el; }}
                      onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleUploadArchivo(r, f); }} />
                    <button className="sm-btn sm-btn-pay sm-btn-sm" disabled={saving === `ent-${r.id}`}
                      onClick={() => handleMarcarEntregada(r.id, true)} title="Marcar como entregada sin subir archivo">
                      {saving === `ent-${r.id}` ? '…' : <><FaCheck /> Entregada</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Entregadas (pagadas con archivos, marcadas a mano o proyecto completado) ── */}
          {entregasData.entregadas.length > 0 && (
            <div className="sm-ent-group done">
              <button className="sm-ent-group-toggle" onClick={() => setShowEntregadas((v) => !v)}>
                <FaCheckCircle /> {entregasData.entregadas.length} entregada{entregasData.entregadas.length !== 1 ? 's' : ''}
                {showEntregadas ? <FaChevronDown /> : <FaChevronRight />}
              </button>
              {showEntregadas && entregasData.entregadas.map((r) => (
                <div key={r.id} className="sm-ent-item">
                  <div className="sm-ent-item-info">
                    <div className="sm-client-line">
                      <span className="sm-client">{r.cliente}</span>
                      <span className="sm-chip sm-chip-green">
                        <FaCheckCircle /> {r.entregado ? `Entregada${r.entregadoEn ? ` el ${fmtFecha(r.entregadoEn)}` : ''}`
                          : r.projectStatus === 'completed' ? 'Proyecto completado'
                            : 'Pagado 100% + archivos'}
                      </span>
                      {(r.archivos?.length || 0) > 0 && <span className="sm-faint"><FaPaperclip /> {r.archivos.length}</span>}
                    </div>
                    <div className="sm-title">{r.title}</div>
                  </div>
                  {r.entregado && (
                    <button className="sm-mini" disabled={saving === `ent-${r.id}`} onClick={() => handleMarcarEntregada(r.id, false)}>
                      Desmarcar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : view === 'pendientes' ? (
        /* ═══════════════ PESTAÑA PENDIENTES ═══════════════ */
        <>
          <div className="sm-kpis">
            {[
              { k: 'sin_respuesta', lbl: 'Leads sin respuesta', val: pendKpis.sinRespuesta, cls: pendKpis.sinRespuesta ? 'red' : 'green' },
              { k: 'vencido', lbl: 'Vencido por cobrar', val: mxn(pendKpis.vencidoActivo), cls: 'red' },
              { k: 'atraso', lbl: 'Cobrado con atraso', val: mxn(pendKpis.cobradoConAtraso), cls: 'amber' },
              { k: 'entregas7', lbl: 'Entregas próximos 7 días', val: pendKpis.entregas7d, cls: '' },
            ].map((c) => (
              <button
                key={c.k}
                className={`sm-kpi clickable ${c.cls} ${pendFilter === c.k ? 'active' : ''}`}
                onClick={() => setPendFilter((prev) => prev === c.k ? 'todos' : c.k)}
                title={pendFilter === c.k ? 'Quitar filtro' : 'Filtrar la tabla por este indicador'}
              >
                <span className="sm-kpi-lbl">{c.lbl}</span>
                <span className="sm-kpi-val">{c.val}</span>
                {pendFilter === c.k && <span className="sm-kpi-filter-tag">filtrando ✕</span>}
              </button>
            ))}
          </div>
          {!pendientesRows.length ? (
            <div className="sm-empty">
              {pendFilter === 'todos'
                ? 'Nada pendiente: sin saldos por cobrar ni leads sin respuesta. 🎉'
                : 'Nada con este filtro. Haz clic de nuevo en la tarjeta para quitarlo.'}
            </div>
          ) : (
            <div className="sm-table-wrap">
              <table className="sm-table">
                <thead>
                  <tr>
                    <th>Cliente / Proyecto</th>
                    <th>Atención</th>
                    <th className="sm-col-fecha">Próx. vencimiento</th>
                    <th className="sm-col-fecha">Entrega</th>
                    <th className="sm-num">Pendiente</th>
                    <th>Cotizaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendientesRows.map((r) => {
                    const dVen = diasHasta(r.proximoVencimiento);
                    const venCls = dVen === null ? 'sm-faint' : dVen < 0 ? 'sm-red' : dVen <= 3 ? 'sm-amber' : '';
                    const dEnt = diasHasta(r.fechaEntrega);
                    const entCls = dEnt === null ? 'sm-faint' : dEnt < 0 ? 'sm-red' : dEnt <= 3 ? 'sm-amber' : '';
                    return (
                      <tr key={r.id} className={`sm-row ${r.nVencidas > 0 ? 'vencido' : ''} ${r.prioritario ? 'sm-prio' : ''}`}>
                        <td className="sm-cell-client">
                          <div className="sm-client-line">
                            <PrioBtn row={r} />
                            {r.celular && (
                              <a className="sm-wa-ico" href={`https://wa.me/${soloDigitos(r.celular)}`} target="_blank" rel="noopener noreferrer" title={`WhatsApp ${r.celular}`}><FaWhatsapp /></a>
                            )}
                            <span className="sm-client">{r.cliente}</span>
                          </div>
                          <div className="sm-title">{r.title}</div>
                        </td>
                        <td>
                          <AtencionChip atencion={r.atencion} />
                          {r.atencion?.lastSeguimientoAt && (
                            <div className="sm-att-detail">Último seguimiento: {fmtNotaFecha(r.atencion.lastSeguimientoAt)}</div>
                          )}
                          {r.atencion?.sinRespuesta && r.atencion?.lastLeadMsgAt && (
                            <div className="sm-att-detail sm-red">El lead escribió: {fmtNotaFecha(r.atencion.lastLeadMsgAt)}</div>
                          )}
                        </td>
                        <td className={`sm-fecha sm-col-fecha ${venCls}`}>
                          {r.proximoVencimiento ? (
                            <>
                              <div>{fmtFechaFull(r.proximoVencimiento)}</div>
                              <div className="sm-fecha-rel">{dVen < 0 ? `vencido ${relDias(r.proximoVencimiento)}` : relDias(r.proximoVencimiento)}</div>
                            </>
                          ) : '—'}
                          {r.nVencidas > 0 && <div className="sm-red sm-fecha-rel">{r.nVencidas} vencida{r.nVencidas !== 1 ? 's' : ''}</div>}
                        </td>
                        <td className={`sm-fecha sm-col-fecha ${entCls}`}>
                          {r.fechaEntrega ? (
                            <>
                              <div>{fmtFechaFull(r.fechaEntrega)}</div>
                              <div className="sm-fecha-rel">{relDias(r.fechaEntrega)}</div>
                            </>
                          ) : '—'}
                        </td>
                        <td className="sm-num">
                          <div className="sm-strong sm-amber">{mxn(r.porCobrarActivo)}</div>
                          {r.cobradoConAtraso > 0 && <div className="sm-fecha-rel" title="Pagos que entraron después de su fecha">↺ {mxn(r.cobradoConAtraso)} cobrado tarde</div>}
                        </td>
                        <td>{renderCotizaciones(r)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* ═══════════════ PESTAÑA FLUJO DE CAJA ═══════════════ */
        <>
          {/* Pestañas de mes */}
          <div className="sm-months">
            <button className={`sm-month ${selKey === 'year' ? 'active' : ''}`} onClick={() => setSelKey('year')}>
              <span className="sm-month-name">Todo {year}</span>
              <span className="sm-month-amt">{mxn(cf?.yearTotals?.porCobrar || 0)} <em>x cobrar</em></span>
            </button>
            {months.map((m) => {
              const activo = selKey === m.key;
              const tiene = m.vendido > 0 || m.cobrado > 0 || m.porCobrar > 0;
              return (
                <button key={m.key} className={`sm-month ${activo ? 'active' : ''} ${tiene ? 'has' : 'empty'}`} onClick={() => setSelKey(m.key)}>
                  <span className="sm-month-name">{m.corto}</span>
                  {m.porCobrar > 0
                    ? <span className="sm-month-amt amber">{mxn(m.porCobrar)} <em>x cobrar</em></span>
                    : m.cobrado > 0
                      ? <span className="sm-month-amt green">{mxn(m.cobrado)} <em>cobrado</em></span>
                      : <span className="sm-month-amt faint">—</span>}
                </button>
              );
            })}
          </div>

          {/* KPIs del periodo */}
          <div className="sm-kpis">
            <div className="sm-kpi"><span className="sm-kpi-lbl">Vendido · {kpis.label}</span><span className="sm-kpi-val">{mxn(kpis.vendido)}</span></div>
            <div className="sm-kpi green"><span className="sm-kpi-lbl">Cobrado</span><span className="sm-kpi-val">{mxn(kpis.cobrado)}</span></div>
            <div className="sm-kpi amber"><span className="sm-kpi-lbl">Por cobrar</span><span className="sm-kpi-val">{mxn(kpis.porCobrar)}</span></div>
            <div className="sm-kpi red"><span className="sm-kpi-lbl">Vencido</span><span className="sm-kpi-val">{mxn(kpis.vencido)}</span></div>
            <div className="sm-kpi gray"><span className="sm-kpi-lbl">Perdido</span><span className="sm-kpi-val">{mxn(kpis.perdido)}</span></div>
          </div>

          {/* Toolbar de filtros */}
          <div className="sm-toolbar">
            <div className="sm-search">
              <FaSearch />
              <input placeholder="Buscar cliente, proyecto, número…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="sm-select" value={vendedorFilter} onChange={(e) => setVendedorFilter(e.target.value)}>
              <option value="todos">Atención: Todos</option>
              {vendedores.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <div className="sm-estado-chips">
              {[
                { k: 'todos', l: 'Todos' },
                { k: 'vencido', l: 'Vencidos' },
                { k: 'por_cobrar', l: 'Por cobrar' },
                { k: 'pagado', l: 'Pagados' },
                { k: 'perdido', l: 'Perdidos' },
              ].map((c) => (
                <button key={c.k} className={`sm-fchip ${estadoFilter === c.k ? 'active' : ''}`} onClick={() => setEstadoFilter(c.k)}>{c.l}</button>
              ))}
            </div>
            <label className="sm-toggle">
              <input type="checkbox" checked={soloActivos} onChange={(e) => setSoloActivos(e.target.checked)} />
              Solo activos
            </label>
          </div>

          {/* Tabla */}
          {!rows.length ? (
            <div className="sm-empty">No hay proyectos con cobros en {kpis.label}.</div>
          ) : (
            <div className="sm-table-wrap">
              <table className="sm-table">
                <thead>
                  <tr>
                    <th className="sm-col-exp"></th>
                    <th>Cliente / Proyecto</th>
                    <th className="sm-num sm-col-monto">Monto {selKey === 'year' ? 'año' : 'mes'}</th>
                    <th className="sm-col-estado">Estado</th>
                    <th className="sm-col-vend">Atención</th>
                    <th className="sm-col-prog">Avance</th>
                    <th className="sm-col-fecha">Entrega</th>
                    <th className="sm-col-act"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isOpen = expanded.has(r.id);
                    const meta = ESTADO_META[r.estadoPago];
                    const Icon = meta.icon;
                    const ps = PROJ_STATUS[r.projectStatus];
                    const rowSaving = saving === `row-${r.id}`;
                    const lastNota = r.notas?.length ? r.notas[r.notas.length - 1].texto : '';
                    return (
                      <React.Fragment key={r.id}>
                        <tr className={`sm-row ${r.estadoPago} ${r.prioritario ? 'sm-prio' : ''}`} onClick={() => toggleExpand(r.id)}>
                          <td className="sm-col-exp">
                            <button className="sm-exp-btn" title="Ver detalle">
                              {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                            </button>
                          </td>
                          <td className="sm-cell-client">
                            <div className="sm-client-line">
                              <PrioBtn row={r} />
                              {r.phone && (
                                <a className="sm-wa-ico" href={`https://wa.me/${soloDigitos(r.phone)}`} target="_blank" rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()} title={`WhatsApp ${r.phone}`}><FaWhatsapp /></a>
                              )}
                              {editName === r.id ? (
                                <span className="sm-name-edit" onClick={(e) => e.stopPropagation()}>
                                  <input autoFocus value={nameInput} placeholder="Nombre del cliente"
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(r); if (e.key === 'Escape') setEditName(null); }} />
                                  <button className="sm-name-ok" onClick={() => handleSaveName(r)} title="Guardar"><FaCheck /></button>
                                  <button className="sm-name-cancel" onClick={() => setEditName(null)} title="Cancelar"><FaTimes /></button>
                                </span>
                              ) : (
                                <>
                                  {r.sinNombre
                                    ? <button className="sm-name-set" onClick={(e) => { e.stopPropagation(); startEditName(r); }}><FaPencilAlt /> Poner nombre</button>
                                    : <span className="sm-client">{r.client}</span>}
                                  {!r.sinNombre && (
                                    <button className="sm-name-edit-btn" onClick={(e) => { e.stopPropagation(); startEditName(r); }} title="Editar nombre"><FaPencilAlt /></button>
                                  )}
                                </>
                              )}
                              {r.archivos?.length > 0 && <FaPaperclip className="sm-clip" title={`${r.archivos.length} archivo(s)`} />}
                            </div>
                            <div className="sm-title">{r.title}</div>
                            <AtencionChip atencion={r.atencion} />
                            {lastNota && <div className="sm-lastnote" title={lastNota}><FaStickyNote /> {lastNota}</div>}
                          </td>
                          <td className="sm-num sm-col-monto">
                            <div className="sm-strong">{mxn(r.montoSel)}</div>
                            <div className="sm-mini-break">
                              {r.cobradoSel > 0 && <span className="sm-green">✓{mxn(r.cobradoSel)}</span>}
                              {r.porCobrarSel > 0 && <span className="sm-amber">●{mxn(r.porCobrarSel)}</span>}
                            </div>
                          </td>
                          <td className="sm-col-estado">
                            <span className={`sm-chip ${meta.cls}`}><Icon /> {meta.label}</span>
                          </td>
                          <td className="sm-col-vend">{r.vendedorFinal ? <span className="sm-vend"><FaUserTie /> {r.vendedorFinal}</span> : <span className="sm-faint">—</span>}</td>
                          <td className="sm-col-prog">
                            {ps ? (
                              <div className="sm-prog" title={`${ps.label}${r.progress != null ? ` · ${r.progress}%` : ''}`}>
                                <div className="sm-prog-bar"><span style={{ width: `${r.progress ?? 0}%`, background: ps.color }} /></div>
                                <span className="sm-prog-lbl" style={{ color: ps.color }}>{r.progress != null ? `${r.progress}%` : ps.label}</span>
                              </div>
                            ) : <span className="sm-faint">—</span>}
                          </td>
                          <td className="sm-fecha sm-col-fecha">{fmtFecha(r.dueDate)}</td>
                          <td className="sm-col-act">
                            {(r.porCobrarSel > 0.5) && (
                              <button className="sm-btn sm-btn-pay sm-btn-sm" disabled={rowSaving}
                                onClick={(e) => { e.stopPropagation(); marcarMesCobrado(r); }} title="Marcar cobrado el mes">
                                {rowSaving ? '…' : <FaMoneyBillWave />}
                              </button>
                            )}
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="sm-detail-row">
                            <td colSpan={8}>
                              <div className="sm-detail-contact">
                                <span className="sm-contact-name">{r.client}</span>
                                {r.phone ? (
                                  <a className="sm-wa-btn" href={`https://wa.me/${soloDigitos(r.phone)}`} target="_blank" rel="noopener noreferrer">
                                    <FaWhatsapp /> {r.phone}
                                  </a>
                                ) : <span className="sm-faint">Sin número</span>}
                                {r.email && <a className="sm-contact-mail" href={`mailto:${r.email}`}>{r.email}</a>}
                                {acuerdoOpen === r.id ? renderAcuerdoEditor(r.id) : (
                                  <button className="sm-btn sm-btn-ghost sm-btn-sm" onClick={(e) => { e.stopPropagation(); openAcuerdo(r.id); }} title="Registrar correcciones y/o fecha de entrega acordada">
                                    <FaHandshake /> Correcciones / entrega
                                  </button>
                                )}
                              </div>
                              {r.acuerdos?.length > 0 && renderAcuerdosList(r, 3)}
                              <div className="sm-detail">
                                {/* Parcialidades */}
                                <div className="sm-detail-col">
                                  <h4>Parcialidades {selKey === 'year' ? `de ${year}` : `de ${MESES[Number(selKey.split('-')[1]) - 1]}`}</h4>
                                  <table className="sm-sched">
                                    <tbody>
                                      {r.insts.map((it) => {
                                        const k = `${r.id}-${it.idx}`;
                                        const vencida = it.status !== 'paid' && it.status !== 'lost' && it.fecha && new Date(it.fecha) < hoy;
                                        const atraso = it.status === 'paid' && it.paidAt && it.fecha
                                          ? Math.max(0, Math.round((new Date(it.paidAt) - new Date(it.fecha)) / DAY)) : null;
                                        return (
                                          <tr key={it.idx}>
                                            <td>{fmtFecha(it.fecha)}</td>
                                            <td className="sm-num">{mxnExact(it.amount)}</td>
                                            <td>
                                              {it.status === 'paid' ? (
                                                <>
                                                  <span className="sm-chip sm-chip-green"><FaCheckCircle /> Pagado</span>
                                                  {it.paidAt && (
                                                    <div className="sm-paid-date">
                                                      el {fmtFecha(it.paidAt)}
                                                      {atraso > 0 && <span className="sm-late" title="Días de atraso vs la fecha programada"> · +{atraso}d tarde</span>}
                                                    </div>
                                                  )}
                                                </>
                                              )
                                                : it.status === 'lost' ? <span className="sm-chip sm-chip-gray"><FaBan /> Perdido</span>
                                                  : vencida ? <span className="sm-chip sm-chip-red"><FaExclamationTriangle /> Vencido</span>
                                                    : <span className="sm-chip sm-chip-amber"><FaRegClock /> Pendiente</span>}
                                            </td>
                                            <td className="sm-sched-act">
                                              <button className="sm-mini" disabled={saving === k || it.status === 'lost'}
                                                onClick={() => patchInstallment(r.id, it.idx, it.status === 'paid' ? 'pending' : 'paid')}>
                                                {it.status === 'paid' ? 'Desmarcar' : 'Marcar pagado'}
                                              </button>
                                              <button className="sm-mini sm-mini-danger" disabled={saving === k || it.status === 'paid'}
                                                onClick={() => patchInstallment(r.id, it.idx, it.status === 'lost' ? 'pending' : 'lost')}>
                                                {it.status === 'lost' ? 'Restaurar' : 'Perdido'}
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                  {r.porCobrarSel > 0.5 ? (
                                    <button className="sm-btn sm-btn-pay sm-btn-block" disabled={saving === `row-${r.id}`} onClick={() => marcarMesCobrado(r)}>
                                      {saving === `row-${r.id}` ? 'Guardando…' : <><FaMoneyBillWave /> Marcar como pagado ({mxn(r.porCobrarSel)})</>}
                                    </button>
                                  ) : r.montoSel > 0.5 && (
                                    <div className="sm-paid-ok"><FaCheckCircle /> Cobrado al 100% en este periodo</div>
                                  )}
                                  <div className="sm-sync-note">🔗 Al marcar pagado se refleja en <b>Pagos</b> y <b>Revenue</b> (mismo registro).</div>
                                  <div className="sm-gestion">
                                    <span>Gestión:</span>
                                    <select value={r.estadoGestion} onChange={(e) => handleEstadoGestion(r, e.target.value)}>
                                      {ESTADO_GESTION.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                                    </select>
                                  </div>
                                </div>
                                {/* Notas / contestación — hilo con respuesta por mensaje */}
                                <div className="sm-detail-col">
                                  <h4><FaStickyNote /> Notas y contestación</h4>
                                  <div className="sm-chat">
                                    {(() => {
                                      const { mains, repliesByParent } = buildThread(r.notas);
                                      if (!mains.length) return <div className="sm-faint">Sin notas todavía. Escribe tu mensaje abajo.</div>;
                                      return mains.map((n) => {
                                        const replies = repliesByParent[n._id] || [];
                                        const isOpenReply = openReply === n._id;
                                        return (
                                          <div key={n._id || n.fecha} className="sm-thread">
                                            {/* Mensaje que enviaste */}
                                            <div className="sm-msg main">
                                              <div className="sm-msg-bubble">
                                                <div className="sm-msg-text">{n._clean}</div>
                                                <div className="sm-msg-foot">
                                                  <span className="sm-msg-time">{n.autor || 'Yo'} · {fmtNotaFecha(n.fecha)}</span>
                                                  <button className="sm-nota-del" onClick={() => handleDelNota(r, n._id)} title="Eliminar"><FaTrashAlt /></button>
                                                </div>
                                              </div>
                                            </div>
                                            {/* Contestaciones del cliente, anidadas */}
                                            {replies.map((rep) => (
                                              <div key={rep._id || rep.fecha} className="sm-msg reply">
                                                <div className="sm-msg-bubble">
                                                  <div className="sm-msg-label">Contestación</div>
                                                  <div className="sm-msg-text">{rep._clean}</div>
                                                  <div className="sm-msg-foot">
                                                    <span className="sm-msg-time">{fmtNotaFecha(rep.fecha)}</span>
                                                    <button className="sm-nota-del" onClick={() => handleDelNota(r, rep._id)} title="Eliminar"><FaTrashAlt /></button>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                            {/* Agregar contestación a ESTE mensaje */}
                                            {isOpenReply ? (
                                              <div className="sm-reply-add">
                                                <input
                                                  autoFocus
                                                  placeholder="Contestación del cliente…"
                                                  value={replyInput[n._id] || ''}
                                                  onChange={(e) => setReplyInput((prev) => ({ ...prev, [n._id]: e.target.value }))}
                                                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddReply(r, n._id); if (e.key === 'Escape') setOpenReply(null); }}
                                                />
                                                <button className="sm-btn sm-btn-pay sm-btn-sm" disabled={saving === `nota-${r.id}`} onClick={() => handleAddReply(r, n._id)}>Guardar</button>
                                                <button className="sm-btn sm-btn-ghost sm-btn-sm" onClick={() => setOpenReply(null)}>✕</button>
                                              </div>
                                            ) : (
                                              <button className="sm-reply-btn" onClick={() => setOpenReply(n._id)}>↳ Agregar contestación</button>
                                            )}
                                          </div>
                                        );
                                      });
                                    })()}
                                  </div>
                                  {/* Nuevo mensaje tuyo */}
                                  <div className="sm-nota-add">
                                    <input
                                      placeholder="Escribe tu mensaje (lo que le mandaste)…"
                                      value={notaInput[r.id] || ''}
                                      onChange={(e) => setNotaInput((prev) => ({ ...prev, [r.id]: e.target.value }))}
                                      onKeyDown={(e) => e.key === 'Enter' && handleAddNota(r)}
                                    />
                                    <button className="sm-btn sm-btn-pay" disabled={saving === `nota-${r.id}`} onClick={() => handleAddNota(r)}>Enviar</button>
                                  </div>
                                </div>
                                {/* Historial de archivos — toda la columna es zona de arrastre */}
                                <div
                                  className={`sm-detail-col sm-dropzone ${dragRow === r.id ? 'drag' : ''}`}
                                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; if (dragRow !== r.id) setDragRow(r.id); }}
                                  onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragRow(r.id); }}
                                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); if (!e.currentTarget.contains(e.relatedTarget)) setDragRow(null); }}
                                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDragRow(null); const f = e.dataTransfer?.files?.[0]; if (f) handleUploadArchivo(r, f); }}
                                >
                                  <h4><FaPaperclip /> Historial de archivos {r.archivos?.length > 0 && <span className="sm-count">({r.archivos.length})</span>}</h4>
                                  <button
                                    type="button"
                                    className={`sm-upload ${saving === `file-${r.id}` ? 'busy' : ''} ${dragRow === r.id ? 'drag' : ''}`}
                                    disabled={saving === `file-${r.id}`}
                                    onClick={() => fileInputsRef.current[r.id]?.click()}
                                  >
                                    <FaCloudUploadAlt />
                                    {saving === `file-${r.id}` ? 'Subiendo…' : dragRow === r.id ? '⬇ Suelta el archivo aquí' : 'Arrastra un archivo aquí o haz clic'}
                                  </button>
                                  <input
                                    type="file"
                                    hidden
                                    ref={(el) => { fileInputsRef.current[r.id] = el; }}
                                    disabled={saving === `file-${r.id}`}
                                    onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleUploadArchivo(r, f); }}
                                  />
                                  <div className="sm-upload-hint">PDF, Word, imágenes… (imágenes se comprimen · máx 15 MB)</div>
                                  {r.archivos?.length > 0 ? (
                                    <div className="sm-files">
                                      {[...r.archivos].map((a, i) => ({ a, i })).reverse().map(({ a, i }) => (
                                        <div key={a._id || a.url} className={`sm-file ${i === r.archivos.length - 1 ? 'is-latest' : ''}`}>
                                          <a href={a.url} target="_blank" rel="noopener noreferrer" className="sm-file-link" title={a.nombre}>
                                            <FaFileAlt /> <span className="sm-file-name">{a.nombre || 'archivo'}</span>
                                            {i === r.archivos.length - 1 && <span className="sm-file-badge">último</span>}
                                          </a>
                                          <div className="sm-file-meta">
                                            <span>{a.subidoPor || 'Admin'} · {a.subidoEn ? new Date(a.subidoEn).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}{a.size ? ` · ${fmtBytes(a.size)}` : ''}</span>
                                            <button className="sm-nota-del" onClick={() => handleDelArchivo(r, a._id)} title="Eliminar"><FaTrashAlt /></button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : <div className="sm-faint">Sin archivos todavía.</div>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td></td>
                    <td className="sm-strong">{rows.length} proyecto{rows.length !== 1 ? 's' : ''}</td>
                    <td className="sm-num sm-col-monto">
                      <div className="sm-strong">{mxn(totalesTabla.monto)}</div>
                      <div className="sm-mini-break">
                        {totalesTabla.cobrado > 0 && <span className="sm-green">✓{mxn(totalesTabla.cobrado)}</span>}
                        {totalesTabla.porCobrar > 0 && <span className="sm-amber">●{mxn(totalesTabla.porCobrar)}</span>}
                      </div>
                    </td>
                    <td className="sm-num sm-red" colSpan={5}>{totalesTabla.vencido > 0 ? `${mxn(totalesTabla.vencido)} vencido` : ''}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SeguimientoMensual;
