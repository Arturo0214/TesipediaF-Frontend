import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaFileInvoiceDollar, FaSearch, FaSync, FaChevronDown, FaChevronRight,
  FaPaperclip, FaTrash, FaDownload, FaPlus, FaExclamationTriangle,
  FaCheckCircle, FaUsers, FaMoneyBillWave, FaHourglassHalf, FaFileCsv,
} from 'react-icons/fa';
import {
  getSeguimientos, addNota, deleteNota, updateSeguimiento, uploadArchivo, deleteArchivo,
} from '../../../services/seguimientoService';
import './ManageSeguimientos.css';

const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 });
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : '—');

const ESTADOS = [
  { v: 'sin_gestion', label: 'Sin gestión' },
  { v: 'en_gestion', label: 'En gestión' },
  { v: 'promesa_pago', label: 'Promesa de pago' },
  { v: 'al_corriente', label: 'Al corriente' },
  { v: 'liquidado', label: 'Liquidado' },
  { v: 'incobrable', label: 'Incobrable' },
];
const estadoLabel = (v) => ESTADOS.find((e) => e.v === v)?.label || v;
const clientKey = (r) => (r.celular ? String(r.celular).replace(/\D/g, '').slice(-10) : '') || (r.cliente || '').toLowerCase().trim();

const COLSPAN = 13;

function ManageSeguimientos() {
  const [rows, setRows] = useState([]);
  const [totales, setTotales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [fVendedor, setFVendedor] = useState('');
  const [fEstado, setFEstado] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [notaInput, setNotaInput] = useState('');
  const [busy, setBusy] = useState(false);

  const rowKey = (r) => `${r.type}:${r.id}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSeguimientos();
      setRows(data.rows || []);
      setTotales(data.totales || null);
    } catch {
      toast.error('Error al cargar seguimientos');
    }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const vendedores = useMemo(() => [...new Set(rows.map((r) => (r.vendedor || '').trim()).filter(Boolean))].sort(), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !((r.cliente || '').toLowerCase().includes(q) || (r.celular || '').includes(q)
        || (r.vendedor || '').toLowerCase().includes(q) || (r.title || '').toLowerCase().includes(q))) return false;
      if (filtro === 'pendientes' && !(r.pendiente > 0)) return false;
      if (filtro === 'vencidas' && !(r.nVencidas > 0)) return false;
      if (filtro === 'liquidados' && !r.liquidado) return false;
      if (fVendedor && (r.vendedor || '').trim() !== fVendedor) return false;
      if (fEstado && r.estado !== fEstado) return false;
      return true;
    });
  }, [rows, search, filtro, fVendedor, fEstado]);

  // Agrupar por cliente (un cliente puede tener varios planes de pago)
  const groups = useMemo(() => {
    const m = new Map();
    for (const r of filtered) {
      const k = clientKey(r);
      if (!m.has(k)) m.set(k, { key: k, cliente: r.cliente, celular: r.celular, rows: [] });
      m.get(k).rows.push(r);
    }
    const arr = [...m.values()].map((g) => {
      const agg = g.rows.reduce((a, r) => ({
        monto: a.monto + (r.montoTotal || 0), pagado: a.pagado + (r.pagado || 0),
        pendiente: a.pendiente + (r.pendiente || 0), venc: a.venc + (r.nVencidas || 0),
      }), { monto: 0, pagado: 0, pendiente: 0, venc: 0 });
      return { ...g, ...agg };
    });
    arr.sort((a, b) => {
      if ((b.venc > 0) !== (a.venc > 0)) return (b.venc > 0) - (a.venc > 0);
      if ((b.pendiente > 0) !== (a.pendiente > 0)) return (b.pendiente > 0) - (a.pendiente > 0);
      return (a.cliente || '').localeCompare(b.cliente || '');
    });
    return arr;
  }, [filtered]);

  const patchRow = (key, patch) => setRows((prev) => prev.map((r) => (rowKey(r) === key ? { ...r, ...patch } : r)));

  const handleEstado = async (r, estado) => {
    patchRow(rowKey(r), { estado });
    try { await updateSeguimiento(r.type, r.id, { estado }); }
    catch { toast.error('No se pudo actualizar'); fetchData(); }
  };
  const handleField = async (r, field, value) => {
    patchRow(rowKey(r), { [field]: value });
    try { await updateSeguimiento(r.type, r.id, { [field]: value }); toast.success('Guardado'); }
    catch { toast.error('No se pudo guardar'); }
  };
  const handleAddNota = async (r) => {
    const texto = notaInput.trim();
    if (!texto) return;
    setBusy(true);
    try { const { notas } = await addNota(r.type, r.id, texto); patchRow(rowKey(r), { notas }); setNotaInput(''); }
    catch { toast.error('No se pudo agregar la nota'); }
    setBusy(false);
  };
  const handleDelNota = async (r, notaId) => {
    try { const { notas } = await deleteNota(r.type, r.id, notaId); patchRow(rowKey(r), { notas }); }
    catch { toast.error('No se pudo borrar'); }
  };
  const handleUpload = async (r, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Máximo 10 MB'); return; }
    setBusy(true);
    try { const { archivos } = await uploadArchivo(r.type, r.id, file); patchRow(rowKey(r), { archivos }); toast.success('Archivo subido'); }
    catch { toast.error('Error al subir'); }
    setBusy(false);
  };
  const handleDelArchivo = async (r, archivoId) => {
    if (!window.confirm('¿Eliminar este archivo?')) return;
    try { const { archivos } = await deleteArchivo(r.type, r.id, archivoId); patchRow(rowKey(r), { archivos }); }
    catch { toast.error('No se pudo borrar'); }
  };

  const exportCsv = () => {
    const headers = ['Cliente', 'Celular', 'Vendedor', 'Modalidad', 'Método', 'Monto total', 'Pagado', 'Pendiente', 'Parcialidades', 'Próx. vencimiento', 'Vencidas', 'Fecha entrega', 'Estado', 'Última nota'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = filtered.map((r) => [
      r.cliente, r.celular, r.vendedor, r.modalidad, r.metodo,
      r.montoTotal, r.pagado, r.pendiente,
      r.nParcialidades ? `${r.nPagadas}/${r.nParcialidades}` : '',
      r.proximoVencimiento ? new Date(r.proximoVencimiento).toISOString().slice(0, 10) : '',
      r.nVencidas || 0,
      r.fechaEntrega ? new Date(r.fechaEntrega).toISOString().slice(0, 10) : '',
      estadoLabel(r.estado),
      (r.notas || []).slice(-1)[0]?.texto || '',
    ].map(esc).join(','));
    const csv = '﻿' + [headers.map(esc).join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Seguimientos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const estadoBadge = (r) => {
    if (r.nVencidas > 0) return <span className="seg-badge seg-badge-red"><FaExclamationTriangle /> {r.nVencidas} venc.</span>;
    if (r.liquidado) return <span className="seg-badge seg-badge-green"><FaCheckCircle /> Liquidado</span>;
    if (r.pendiente > 0) return <span className="seg-badge seg-badge-amber">Con saldo</span>;
    return <span className="seg-badge seg-badge-gray">—</span>;
  };

  const renderDetail = (r) => (
    <div className="seg-detail">
      <div className="seg-detail-col">
        <h4>Parcialidades (conciliación)</h4>
        {r.schedule?.length ? (
          <table className="seg-sched">
            <thead><tr><th>#</th><th>Concepto</th><th className="seg-r">Monto</th><th>Vence</th><th>Estado</th></tr></thead>
            <tbody>
              {r.schedule.map((s, i) => {
                const venc = s.status === 'pending' && s.dueDate && new Date(s.dueDate) < new Date();
                return (
                  <tr key={i}>
                    <td>{s.number || i + 1}</td>
                    <td>{s.label}</td>
                    <td className="seg-r">{fmt(s.amount)}</td>
                    <td className={venc ? 'seg-red' : ''}>{fmtDate(s.dueDate)}</td>
                    <td>{s.status === 'paid'
                      ? <span className="seg-badge seg-badge-green">Cobrado</span>
                      : s.status === 'lost'
                        ? <span className="seg-badge seg-badge-gray">Perdido</span>
                        : <span className={`seg-badge ${venc ? 'seg-badge-red' : 'seg-badge-amber'}`}>{venc ? 'Vencido' : 'Por cobrar'}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <p className="seg-muted">Sin parcialidades registradas (pago único o sin plan).</p>}

        <div className="seg-overrides">
          <label>Vendedor
            <input defaultValue={r.vendedor || ''} onBlur={(e) => { if (e.target.value !== (r.vendedor || '')) handleField(r, 'vendedor', e.target.value); }} />
          </label>
          <label>Fecha de entrega
            <input type="date" defaultValue={r.fechaEntrega ? new Date(r.fechaEntrega).toISOString().slice(0, 10) : ''} onBlur={(e) => handleField(r, 'fechaEntrega', e.target.value)} />
          </label>
          <label>Estado
            <select value={r.estado} onChange={(e) => handleEstado(r, e.target.value)}>
              {ESTADOS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="seg-detail-col">
        <h4>Notas de seguimiento</h4>
        <div className="seg-add-nota">
          <input placeholder="Nueva nota…" value={notaInput} onChange={(e) => setNotaInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddNota(r); }} />
          <button className="seg-btn seg-btn-primary" onClick={() => handleAddNota(r)} disabled={busy}><FaPlus /></button>
        </div>
        <div className="seg-notas">
          {(r.notas || []).slice().reverse().map((n) => (
            <div className="seg-nota" key={n._id}>
              <div className="seg-nota-txt">{n.texto}</div>
              <div className="seg-nota-meta">
                <span>{n.autor || 'admin'} · {fmtDate(n.fecha)}</span>
                <button onClick={() => handleDelNota(r, n._id)} title="Borrar"><FaTrash /></button>
              </div>
            </div>
          ))}
          {(!r.notas || r.notas.length === 0) && <p className="seg-muted">Sin notas todavía.</p>}
        </div>

        <h4>Archivos de conciliación</h4>
        <label className="seg-upload">
          <FaPaperclip /> Subir archivo (comprobante, estado de cuenta, Excel…)
          <input type="file" hidden disabled={busy} onChange={(e) => { handleUpload(r, e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        <div className="seg-archivos">
          {(r.archivos || []).map((a) => (
            <div className="seg-archivo" key={a._id}>
              <a href={a.url} target="_blank" rel="noreferrer" className="seg-archivo-name"><FaDownload /> {a.nombre || 'archivo'}</a>
              <span className="seg-archivo-meta">{a.subidoPor} · {fmtDate(a.subidoEn)}</span>
              <button onClick={() => handleDelArchivo(r, a._id)} title="Borrar"><FaTrash /></button>
            </div>
          ))}
          {(!r.archivos || r.archivos.length === 0) && <p className="seg-muted">Sin archivos.</p>}
        </div>
      </div>
    </div>
  );

  const planRow = (r, isMember) => {
    const key = rowKey(r);
    const open = expanded === key;
    return (
      <React.Fragment key={key}>
        <tr className={`seg-row ${open ? 'open' : ''} ${r.nVencidas > 0 ? 'seg-row-alert' : ''} ${isMember ? 'seg-member' : ''}`}
          onClick={() => { setExpanded(open ? null : key); setNotaInput(''); }}>
          <td className="seg-caret">{open ? <FaChevronDown /> : <FaChevronRight />}</td>
          <td>
            {isMember
              ? <div className="seg-sub2">↳ {r.title || r.modalidad || 'Plan'}</div>
              : <><div className="seg-cliente">{r.cliente}</div><div className="seg-sub2">{r.celular || 's/tel'}{r.title ? ` · ${r.title}` : ''}</div></>}
          </td>
          <td>{r.vendedor || '—'}</td>
          <td>{r.modalidad || '—'}</td>
          <td>{r.metodo || '—'}</td>
          <td className="seg-r">{fmt(r.montoTotal)}</td>
          <td className="seg-r seg-green">{fmt(r.pagado)}</td>
          <td className="seg-r seg-amber">{r.pendiente > 0 ? fmt(r.pendiente) : '—'}</td>
          <td className="seg-c">{r.nParcialidades ? `${r.nPagadas}/${r.nParcialidades}` : '—'}</td>
          <td className={r.nVencidas > 0 ? 'seg-red' : ''}>{fmtDate(r.proximoVencimiento)}</td>
          <td>{fmtDate(r.fechaEntrega)}</td>
          <td>{estadoBadge(r)}</td>
          <td className="seg-c">
            {(r.notas?.length > 0) && <span className="seg-mini" title="Notas">📝{r.notas.length}</span>}
            {(r.archivos?.length > 0) && <span className="seg-mini" title="Archivos"><FaPaperclip />{r.archivos.length}</span>}
          </td>
        </tr>
        {open && (
          <tr className="seg-detail-row"><td colSpan={COLSPAN}>{renderDetail(r)}</td></tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="seg-wrap">
      <div className="seg-head">
        <h2><FaFileInvoiceDollar /> Seguimientos</h2>
        <div className="seg-head-btns">
          <button className="seg-btn seg-btn-ghost" onClick={exportCsv} disabled={loading}><FaFileCsv /> Exportar</button>
          <button className="seg-btn seg-btn-ghost" onClick={fetchData} disabled={loading}><FaSync className={loading ? 'seg-spin' : ''} /> Actualizar</button>
        </div>
      </div>
      <p className="seg-sub">Cobranza y conciliación contable — cada cliente con su plan de pago, parcialidades pagadas/pendientes, notas de seguimiento y archivos.</p>

      {totales && (
        <div className="seg-kpis">
          <div className="seg-kpi"><span className="seg-kpi-ic"><FaUsers /></span><div><span className="seg-kpi-n">{totales.clientes}</span><span className="seg-kpi-l">Clientes</span></div></div>
          <div className="seg-kpi"><span className="seg-kpi-ic"><FaMoneyBillWave /></span><div><span className="seg-kpi-n">{fmt(totales.montoTotal)}</span><span className="seg-kpi-l">Vendido total</span></div></div>
          <div className="seg-kpi seg-kpi-green"><span className="seg-kpi-ic"><FaCheckCircle /></span><div><span className="seg-kpi-n">{fmt(totales.pagado)}</span><span className="seg-kpi-l">Cobrado</span></div></div>
          <div className="seg-kpi seg-kpi-amber"><span className="seg-kpi-ic"><FaHourglassHalf /></span><div><span className="seg-kpi-n">{fmt(totales.pendiente)}</span><span className="seg-kpi-l">Por cobrar</span></div></div>
          <div className="seg-kpi seg-kpi-red"><span className="seg-kpi-ic"><FaExclamationTriangle /></span><div><span className="seg-kpi-n">{totales.conVencidas}</span><span className="seg-kpi-l">Con vencidas</span></div></div>
        </div>
      )}

      <div className="seg-toolbar">
        <div className="seg-searchbox">
          <FaSearch />
          <input placeholder="Buscar cliente, teléfono, vendedor…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="seg-filters">
          {[['todos', 'Todos'], ['pendientes', 'Con saldo'], ['vencidas', 'Vencidas'], ['liquidados', 'Liquidados']].map(([v, l]) => (
            <button key={v} className={`seg-chip ${filtro === v ? 'active' : ''}`} onClick={() => setFiltro(v)}>{l}</button>
          ))}
        </div>
        <select className="seg-select" value={fVendedor} onChange={(e) => setFVendedor(e.target.value)}>
          <option value="">Vendedor: todos</option>
          {vendedores.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select className="seg-select" value={fEstado} onChange={(e) => setFEstado(e.target.value)}>
          <option value="">Estado: todos</option>
          {ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
        </select>
        <span className="seg-count">{filtered.length} registros · {groups.length} clientes</span>
      </div>

      {loading ? (
        <div className="seg-loading">Cargando…</div>
      ) : (
        <div className="seg-table-wrap">
          <table className="seg-table">
            <thead>
              <tr>
                <th></th><th>Cliente</th><th>Vendedor</th><th>Modalidad</th><th>Método</th>
                <th className="seg-r">Vendido</th><th className="seg-r">Cobrado</th><th className="seg-r">Por cobrar</th>
                <th className="seg-c">Parc.</th><th>Próx. venc.</th><th>Entrega</th><th>Estado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                if (g.rows.length === 1) return planRow(g.rows[0], false);
                // Cliente con varios planes → encabezado agrupado + planes
                return (
                  <React.Fragment key={g.key}>
                    <tr className="seg-group-head">
                      <td></td>
                      <td>
                        <div className="seg-cliente">{g.cliente}</div>
                        <div className="seg-sub2">{g.celular || 's/tel'} · {g.rows.length} planes</div>
                      </td>
                      <td colSpan={2}></td>
                      <td></td>
                      <td className="seg-r">{fmt(g.monto)}</td>
                      <td className="seg-r seg-green">{fmt(g.pagado)}</td>
                      <td className="seg-r seg-amber">{g.pendiente > 0 ? fmt(g.pendiente) : '—'}</td>
                      <td colSpan={5}>{g.venc > 0 && <span className="seg-badge seg-badge-red"><FaExclamationTriangle /> {g.venc} venc.</span>}</td>
                    </tr>
                    {g.rows.map((r) => planRow(r, true))}
                  </React.Fragment>
                );
              })}
              {groups.length === 0 && (
                <tr><td colSpan={COLSPAN} className="seg-empty">Sin resultados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageSeguimientos;
