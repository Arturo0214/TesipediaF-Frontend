import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaCalendarCheck, FaSyncAlt, FaSearch, FaWhatsapp, FaCheckCircle, FaExclamationTriangle,
  FaRegClock, FaBan, FaChevronDown, FaChevronRight, FaFileCsv, FaStickyNote, FaTrashAlt,
  FaRegCircle, FaUserTie, FaMoneyBillWave, FaPaperclip, FaCloudUploadAlt, FaFileAlt,
  FaPencilAlt, FaCheck, FaTimes,
} from 'react-icons/fa';
import axiosWithAuth from '../../../utils/axioswithAuth';
import revenueService from '../../../services/revenueService';
import { getSeguimientos, addNota, deleteNota, updateSeguimiento, uploadArchivo, deleteArchivo } from '../../../services/seguimientoService';
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

const SeguimientoMensual = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [selKey, setSelKey] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [cf, setCf] = useState(null);          // { monthly, yearTotals, projects }
  const [segMap, setSegMap] = useState(new Map()); // quoteId -> { notas, estado, vendedor }
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
  // Filtros
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
        getSeguimientos().catch(() => ({ rows: [] })),
      ]);
      setCf(cfData);
      const map = new Map();
      for (const r of (seg?.rows || [])) {
        map.set(String(r.id), { notas: r.notas || [], estado: r.estado || 'sin_gestion', vendedor: r.vendedor || '', archivos: r.archivos || [], nombre: r.nombre || '' });
      }
      setSegMap(map);
    } catch (err) {
      toast.error('No se pudo cargar el seguimiento');
      console.error('SeguimientoMensual fetch:', err);
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

  // ── Acciones ──
  const toggleExpand = (id) => setExpanded((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const patchInstallment = async (quoteId, idx, status) => {
    const key = `${quoteId}-${idx}`;
    setSaving(key);
    try {
      await axiosWithAuth.patch(`/payments/dashboard/${quoteId}/installment?source=sofia`, { installmentIndex: idx, status });
      // Actualizar localmente sin recargar todo
      setCf((prev) => {
        if (!prev) return prev;
        const projects = prev.projects.map((p) => {
          if (String(p.id) !== String(quoteId)) return p;
          return { ...p, installments: p.installments.map((it) => it.idx === idx ? { ...it, status } : it) };
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

  const addNotaText = async (row, texto) => {
    const t = (texto || '').trim();
    if (!t) return;
    setSaving(`nota-${row.id}`);
    try {
      const { notas } = await addNota('quote', row.id, t);
      setSegMap((prev) => { const n = new Map(prev); n.set(String(row.id), { ...(n.get(String(row.id)) || {}), notas }); return n; });
      setNotaInput((prev) => ({ ...prev, [row.id]: '' }));
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

  const yearOptions = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  return (
    <div className="sm-wrap">
      {/* Header */}
      <div className="sm-head">
        <div>
          <h2><FaCalendarCheck /> Seguimiento Mensual</h2>
          <p className="sm-sub">Todos tus proyectos activos, empatados con Revenue, en flujo de caja mes a mes.</p>
        </div>
        <div className="sm-head-actions">
          <select className="sm-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="sm-btn sm-btn-ghost" onClick={exportCsv} disabled={!rows.length} title="Exportar a CSV">
            <FaFileCsv /> CSV
          </button>
          <button className="sm-btn sm-btn-ghost" onClick={fetchAll} disabled={loading} title="Actualizar">
            <FaSyncAlt className={loading ? 'sm-spin' : ''} />
          </button>
        </div>
      </div>

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
      {loading ? (
        <div className="sm-empty">Cargando seguimiento…</div>
      ) : !rows.length ? (
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
                    <tr className={`sm-row ${r.estadoPago}`} onClick={() => toggleExpand(r.id)}>
                      <td className="sm-col-exp">
                        <button className="sm-exp-btn" title="Ver detalle">
                          {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                        </button>
                      </td>
                      <td className="sm-cell-client">
                        <div className="sm-client-line">
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
                          </div>
                          <div className="sm-detail">
                            {/* Parcialidades */}
                            <div className="sm-detail-col">
                              <h4>Parcialidades {selKey === 'year' ? `de ${year}` : `de ${MESES[Number(selKey.split('-')[1]) - 1]}`}</h4>
                              <table className="sm-sched">
                                <tbody>
                                  {r.insts.map((it) => {
                                    const k = `${r.id}-${it.idx}`;
                                    const vencida = it.status !== 'paid' && it.status !== 'lost' && it.fecha && new Date(it.fecha) < hoy;
                                    return (
                                      <tr key={it.idx}>
                                        <td>{fmtFecha(it.fecha)}</td>
                                        <td className="sm-num">{mxnExact(it.amount)}</td>
                                        <td>
                                          {it.status === 'paid' ? <span className="sm-chip sm-chip-green"><FaCheckCircle /> Pagado</span>
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
    </div>
  );
};

export default SeguimientoMensual;
