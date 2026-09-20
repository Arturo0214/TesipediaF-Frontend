import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaFileInvoiceDollar, FaSyncAlt, FaSearch, FaChevronDown, FaChevronRight, FaWhatsapp,
  FaCheckCircle, FaExclamationTriangle, FaRegClock, FaBan, FaCloudUploadAlt, FaTrashAlt,
  FaReceipt, FaCompressArrowsAlt,
} from 'react-icons/fa';
import { getSeguimientos, uploadComprobante, deleteComprobante } from '../../../services/seguimientoService';
import './Contabilidad.css';

const mxn = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Math.round(n || 0));
const mxnExact = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
const soloDigitos = (s) => String(s || '').replace(/\D/g, '');
const fmtFecha = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtBytes = (b) => {
  if (!b && b !== 0) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const Contabilidad = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [search, setSearch] = useState('');
  const [soloSinComprobante, setSoloSinComprobante] = useState(false);
  const fileInputsRef = useRef({}); // `${rowId}-${idx}` -> <input type=file>

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSeguimientos();
      setRows(data?.rows || []);
    } catch (err) {
      toast.error('No se pudo cargar contabilidad');
      console.error('Contabilidad fetch:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Por parcialidad pagada: ¿tiene comprobante adjunto?
  const enrich = useCallback((r) => {
    const compsByIdx = new Map();
    for (const c of (r.comprobantes || [])) {
      const k = Number(c.installmentIdx);
      if (!compsByIdx.has(k)) compsByIdx.set(k, []);
      compsByIdx.get(k).push(c);
    }
    const pagos = (r.schedule || []).map((s, idx) => ({ ...s, idx, comprobantes: compsByIdx.get(idx) || [] }));
    const pagados = pagos.filter((p) => p.status === 'paid');
    const conComprobante = pagados.filter((p) => p.comprobantes.length > 0).length;
    return { ...r, pagos, nPagados: pagados.length, conComprobante, sinComprobante: pagados.length - conComprobante };
  }, []);

  const enriched = useMemo(() => rows.map(enrich), [rows, enrich]);

  const visibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = enriched;
    if (soloSinComprobante) arr = arr.filter((r) => r.sinComprobante > 0);
    if (q) arr = arr.filter((r) => `${r.cliente} ${r.title} ${r.celular}`.toLowerCase().includes(q));
    return [...arr].sort((a, b) => {
      if ((b.sinComprobante > 0) !== (a.sinComprobante > 0)) return (b.sinComprobante > 0) - (a.sinComprobante > 0);
      return (b.pagado || 0) - (a.pagado || 0);
    });
  }, [enriched, search, soloSinComprobante]);

  const kpis = useMemo(() => enriched.reduce((a, r) => ({
    cobrado: a.cobrado + (r.pagado || 0),
    pagos: a.pagos + r.nPagados,
    conComprobante: a.conComprobante + r.conComprobante,
    sinComprobante: a.sinComprobante + r.sinComprobante,
  }), { cobrado: 0, pagos: 0, conComprobante: 0, sinComprobante: 0 }), [enriched]);

  const toggleExpand = (id) => setExpanded((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const handleUpload = async (row, idx, file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { toast.error('Máximo 25 MB'); return; }
    const key = `${row.id}-${idx}`;
    setSaving(key);
    try {
      const { comprobantes } = await uploadComprobante('quote', row.id, file, idx);
      setRows((prev) => prev.map((r) => String(r.id) === String(row.id) ? { ...r, comprobantes } : r));
      const nuevo = comprobantes[comprobantes.length - 1];
      if (nuevo?.sizeOriginal && nuevo.size < nuevo.sizeOriginal * 0.95) {
        toast.success(`Comprobante subido y comprimido: ${fmtBytes(nuevo.sizeOriginal)} → ${fmtBytes(nuevo.size)} ✅`);
      } else {
        toast.success('Comprobante subido ✅');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo subir el comprobante');
    } finally { setSaving(null); }
  };

  const handleDelete = async (row, comprobanteId) => {
    if (!window.confirm('¿Eliminar este comprobante?')) return;
    try {
      const { comprobantes } = await deleteComprobante('quote', row.id, comprobanteId);
      setRows((prev) => prev.map((r) => String(r.id) === String(row.id) ? { ...r, comprobantes } : r));
    } catch { toast.error('No se pudo borrar el comprobante'); }
  };

  const estadoChip = (p) => {
    const vencida = p.status !== 'paid' && p.status !== 'lost' && p.dueDate && new Date(p.dueDate) < new Date();
    if (p.status === 'paid') return <span className="ct-chip green"><FaCheckCircle /> Pagado</span>;
    if (p.status === 'lost') return <span className="ct-chip gray"><FaBan /> Perdido</span>;
    if (vencida) return <span className="ct-chip red"><FaExclamationTriangle /> Vencido</span>;
    return <span className="ct-chip amber"><FaRegClock /> Pendiente</span>;
  };

  return (
    <div className="ct-wrap">
      <div className="ct-head">
        <div>
          <h2><FaFileInvoiceDollar /> Contabilidad</h2>
          <p className="ct-sub">Cada pago con su comprobante adjunto. Las imágenes se comprimen automáticamente al subirlas.</p>
        </div>
        <button className="ct-btn ghost" onClick={fetchAll} disabled={loading} title="Actualizar">
          <FaSyncAlt className={loading ? 'ct-spin' : ''} />
        </button>
      </div>

      <div className="ct-kpis">
        <div className="ct-kpi green"><span className="ct-kpi-lbl">Cobrado</span><span className="ct-kpi-val">{mxn(kpis.cobrado)}</span></div>
        <div className="ct-kpi"><span className="ct-kpi-lbl">Pagos registrados</span><span className="ct-kpi-val">{kpis.pagos}</span></div>
        <div className="ct-kpi green"><span className="ct-kpi-lbl">Con comprobante</span><span className="ct-kpi-val">{kpis.conComprobante}</span></div>
        <div className={`ct-kpi ${kpis.sinComprobante ? 'red' : 'green'}`}><span className="ct-kpi-lbl">Sin comprobante</span><span className="ct-kpi-val">{kpis.sinComprobante}</span></div>
      </div>

      <div className="ct-toolbar">
        <div className="ct-search">
          <FaSearch />
          <input placeholder="Buscar cliente, proyecto, número…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <label className="ct-toggle">
          <input type="checkbox" checked={soloSinComprobante} onChange={(e) => setSoloSinComprobante(e.target.checked)} />
          Solo pagos sin comprobante
        </label>
      </div>

      {loading ? (
        <div className="ct-empty">Cargando contabilidad…</div>
      ) : !visibles.length ? (
        <div className="ct-empty">{soloSinComprobante ? 'Todos los pagos tienen comprobante. 🎉' : 'Sin registros.'}</div>
      ) : (
        <div className="ct-table-wrap">
          <table className="ct-table">
            <thead>
              <tr>
                <th className="ct-col-exp"></th>
                <th>Cliente / Proyecto</th>
                <th className="ct-num">Cobrado</th>
                <th className="ct-num">Pendiente</th>
                <th>Comprobantes</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((r) => {
                const isOpen = expanded.has(r.id);
                return (
                  <React.Fragment key={r.id}>
                    <tr className={`ct-row ${r.sinComprobante > 0 ? 'warn' : ''}`} onClick={() => toggleExpand(r.id)}>
                      <td className="ct-col-exp">
                        <button className="ct-exp-btn">{isOpen ? <FaChevronDown /> : <FaChevronRight />}</button>
                      </td>
                      <td>
                        <div className="ct-client-line">
                          {r.celular && (
                            <a className="ct-wa" href={`https://wa.me/${soloDigitos(r.celular)}`} target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()} title={`WhatsApp ${r.celular}`}><FaWhatsapp /></a>
                          )}
                          <span className="ct-client">{r.cliente}</span>
                        </div>
                        <div className="ct-title">{r.title}</div>
                      </td>
                      <td className="ct-num ct-green">{mxn(r.pagado)}</td>
                      <td className="ct-num ct-amber">{r.porCobrarActivo > 0 ? mxn(r.porCobrarActivo) : '—'}</td>
                      <td>
                        {r.nPagados === 0 ? <span className="ct-faint">Sin pagos aún</span>
                          : r.sinComprobante === 0
                            ? <span className="ct-chip green"><FaReceipt /> {r.conComprobante}/{r.nPagados} completos</span>
                            : <span className="ct-chip red"><FaReceipt /> Faltan {r.sinComprobante} de {r.nPagados}</span>}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="ct-detail-row">
                        <td colSpan={5}>
                          <table className="ct-sched">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Fecha programada</th>
                                <th className="ct-num">Monto</th>
                                <th>Estado</th>
                                <th>Pagado el</th>
                                <th>Comprobante</th>
                              </tr>
                            </thead>
                            <tbody>
                              {r.pagos.map((p) => {
                                const key = `${r.id}-${p.idx}`;
                                return (
                                  <tr key={p.idx}>
                                    <td>{p.number}</td>
                                    <td>{fmtFecha(p.dueDate)}</td>
                                    <td className="ct-num">{mxnExact(p.amount)}</td>
                                    <td>{estadoChip(p)}</td>
                                    <td>
                                      {p.status === 'paid' ? (
                                        p.paidAt ? (
                                          <>
                                            {fmtFecha(p.paidAt)}
                                            {p.diasAtraso > 0 && <span className="ct-late" title="Días de atraso vs la fecha programada"> +{p.diasAtraso}d tarde</span>}
                                          </>
                                        ) : <span className="ct-faint" title="Pago marcado antes de que se registrara la fecha real">sin fecha registrada</span>
                                      ) : <span className="ct-faint">—</span>}
                                    </td>
                                    <td className="ct-comp-cell">
                                      {p.comprobantes.map((c) => (
                                        <div key={c._id || c.url} className="ct-comp">
                                          <a href={c.url} target="_blank" rel="noopener noreferrer" title={c.nombre}>
                                            <FaReceipt /> <span className="ct-comp-name">{c.nombre || 'comprobante'}</span>
                                          </a>
                                          <span className="ct-comp-meta">
                                            {fmtBytes(c.size)}
                                            {c.sizeOriginal > 0 && c.size < c.sizeOriginal * 0.95 && (
                                              <span className="ct-comp-saved" title={`Comprimido de ${fmtBytes(c.sizeOriginal)}`}>
                                                <FaCompressArrowsAlt /> −{Math.round((1 - c.size / c.sizeOriginal) * 100)}%
                                              </span>
                                            )}
                                          </span>
                                          <button className="ct-del" onClick={() => handleDelete(r, c._id)} title="Eliminar comprobante"><FaTrashAlt /></button>
                                        </div>
                                      ))}
                                      {p.status === 'paid' && (
                                        <>
                                          <button
                                            className={`ct-upload ${saving === key ? 'busy' : ''} ${p.comprobantes.length ? 'ghost' : ''}`}
                                            disabled={saving === key}
                                            onClick={() => fileInputsRef.current[key]?.click()}
                                          >
                                            <FaCloudUploadAlt /> {saving === key ? 'Subiendo…' : p.comprobantes.length ? 'Agregar otro' : 'Adjuntar comprobante'}
                                          </button>
                                          <input
                                            type="file"
                                            hidden
                                            accept="image/*,application/pdf"
                                            ref={(el) => { fileInputsRef.current[key] = el; }}
                                            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleUpload(r, p.idx, f); }}
                                          />
                                        </>
                                      )}
                                      {p.status !== 'paid' && !p.comprobantes.length && <span className="ct-faint">Se adjunta al pagar</span>}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Contabilidad;
