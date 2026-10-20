import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FaBook, FaFileAlt, FaChartBar, FaStar, FaProjectDiagram, FaFolderOpen,
  FaRobot, FaSync, FaCopy, FaCheck, FaTrash, FaPlus, FaSearch, FaExternalLinkAlt,
  FaLock, FaRegStar, FaDownload,
} from 'react-icons/fa';
import {
  getResumen, getCotizaciones, getProyectos, getArchivos,
  getResenas, createResena, updateResena, deleteResena, getContextoIA,
} from '../../../services/bibliotecaService';
import './AdminBiblioteca.css';

const money = (n) => `$${Math.round(Number(n) || 0).toLocaleString('es-MX')}`;
const fecha = (d) => (d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const TABS = [
  { key: 'metricas', label: 'Métricas', icon: FaChartBar },
  { key: 'cotizaciones', label: 'Cotizaciones', icon: FaFileAlt },
  { key: 'proyectos', label: 'Proyectos', icon: FaProjectDiagram },
  { key: 'resenas', label: 'Reseñas', icon: FaStar },
  { key: 'archivos', label: 'Archivos', icon: FaFolderOpen },
  { key: 'contexto', label: 'Contexto IA', icon: FaRobot },
];

const ORIGEN_LABEL = {
  cotizacion: '📄 Cotización', entrega: '📦 Entrega', soporte: '📎 Soporte',
  comprobante: '🧾 Comprobante', revision: '✏️ Revisión',
};

const Estrellas = ({ n, onChange }) => (
  <span className="bib-stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <button key={i} type="button" className="bib-star-btn" onClick={() => onChange && onChange(i)} disabled={!onChange}>
        {i <= (n || 0) ? <FaStar /> : <FaRegStar />}
      </button>
    ))}
  </span>
);

const AdminBiblioteca = () => {
  const { user } = useSelector((s) => s.auth || {});
  const [tab, setTab] = useState('metricas');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [resumen, setResumen] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [contexto, setContexto] = useState(null);

  const [q, setQ] = useState('');
  const [origenF, setOrigenF] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [nueva, setNueva] = useState({ cliente: '', texto: '', calificacion: 5, fuente: 'whatsapp', servicio: '', destacada: false });
  const [guardando, setGuardando] = useState(false);

  const cargar = async (t = tab, force = false) => {
    setErr('');
    try {
      setLoading(true);
      if (t === 'metricas' && (force || !resumen)) setResumen(await getResumen());
      if (t === 'cotizaciones' && (force || !cotizaciones.length)) setCotizaciones((await getCotizaciones({ limit: 500 })).cotizaciones);
      if (t === 'proyectos' && (force || !proyectos.length)) setProyectos((await getProyectos()).proyectos);
      if (t === 'archivos' && (force || !archivos.length)) setArchivos((await getArchivos()).archivos);
      if (t === 'resenas' && (force || !resenas.length)) setResenas((await getResenas()).resenas);
      if (t === 'contexto' && (force || !contexto)) setContexto(await getContextoIA());
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(tab); /* eslint-disable-next-line */ }, [tab]);

  const filtroTexto = (items, campos) => {
    if (!q.trim()) return items;
    const needle = q.trim().toLowerCase();
    return items.filter((it) => campos.some((c) => String(it[c] || '').toLowerCase().includes(needle)));
  };

  const cotFiltradas = useMemo(
    () => filtroTexto(cotizaciones, ['clientName', 'folio', 'tituloTrabajo', 'carrera', 'area', 'vendedor']),
    [cotizaciones, q]
  );
  const proyFiltrados = useMemo(
    () => filtroTexto(proyectos, ['cliente', 'title', 'folio', 'vendedor', 'estado']),
    [proyectos, q]
  );
  const archFiltrados = useMemo(() => {
    let items = filtroTexto(archivos, ['cliente', 'nombre', 'origen']);
    if (origenF) items = items.filter((a) => a.origen === origenF);
    return items;
  }, [archivos, q, origenF]);

  const copiarContexto = async () => {
    if (!contexto?.textoPlano) return;
    try {
      await navigator.clipboard.writeText(contexto.textoPlano);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* clipboard no disponible */ }
  };

  const guardarResena = async () => {
    if (!nueva.cliente.trim() || !nueva.texto.trim()) return;
    try {
      setGuardando(true);
      await createResena(nueva);
      setNueva({ cliente: '', texto: '', calificacion: 5, fuente: 'whatsapp', servicio: '', destacada: false });
      setShowForm(false);
      setResenas((await getResenas()).resenas);
      setContexto(null); // el contexto IA cambia con las reseñas
    } catch (e) {
      setErr(e?.response?.data?.message || 'Error guardando reseña');
    } finally {
      setGuardando(false);
    }
  };

  const toggleDestacada = async (r) => {
    await updateResena(r._id, { destacada: !r.destacada });
    setResenas((await getResenas()).resenas);
    setContexto(null);
  };

  const borrarResena = async (r) => {
    if (!window.confirm(`¿Borrar la reseña de ${r.cliente}?`)) return;
    await deleteResena(r._id);
    setResenas((prev) => prev.filter((x) => x._id !== r._id));
    setContexto(null);
  };

  const statusChip = (s) => {
    const map = { paid: ['Pagada', 'ok'], pending: ['Pendiente', 'warn'], approved: ['Aprobada', 'info'], rejected: ['Rechazada', 'bad'], cancelled: ['Cancelada', 'bad'] };
    const [label, cls] = map[s] || [s || '—', 'info'];
    return <span className={`bib-chip bib-chip-${cls}`}>{label}</span>;
  };

  return (
    <div className="bib-wrap">
      <div className="bib-head">
        <div>
          <h2><FaBook /> Biblioteca</h2>
          <p className="bib-sub">Todo el conocimiento del negocio en un solo lugar — cotizaciones, métricas, reseñas, proyectos y archivos. Alimenta a la IA de Tesipedia.</p>
        </div>
        <button className="bib-btn bib-btn-ghost" onClick={() => cargar(tab, true)} disabled={loading}>
          <FaSync className={loading ? 'bib-spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="bib-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`bib-tab ${tab === t.key ? 'active' : ''}`} onClick={() => { setTab(t.key); setQ(''); }}>
            <t.icon /> {t.label}
          </button>
        ))}
      </div>

      {err && <div className="bib-error">{err}</div>}
      {loading && <div className="bib-loading">Cargando…</div>}

      {/* ══════════ MÉTRICAS ══════════ */}
      {tab === 'metricas' && resumen && (
        <div className="bib-section">
          <div className="bib-kpis">
            <div className="bib-kpi"><span className="bib-kpi-lbl">Ventas históricas</span><span className="bib-kpi-val">{money(resumen.cotizaciones.ventasHistoricas)}</span><span className="bib-kpi-sub">{resumen.cotizaciones.pagadas} proyectos cerrados</span></div>
            <div className="bib-kpi"><span className="bib-kpi-lbl">Ventas este mes</span><span className="bib-kpi-val">{money(resumen.cotizaciones.ventasEsteMes)}</span><span className="bib-kpi-sub">{resumen.cotizaciones.pagadasEsteMes} cierres</span></div>
            <div className="bib-kpi"><span className="bib-kpi-lbl">Ticket mediano</span><span className="bib-kpi-val">{money(resumen.cotizaciones.ticketMediano)}</span><span className="bib-kpi-sub">{money(resumen.cotizaciones.precioPorPaginaMediano)}/página</span></div>
            <div className="bib-kpi"><span className="bib-kpi-lbl">Cotizaciones</span><span className="bib-kpi-val">{resumen.cotizaciones.total}</span><span className="bib-kpi-sub">{resumen.proyectos.activos} proyectos activos</span></div>
            <div className="bib-kpi"><span className="bib-kpi-lbl">Archivos</span><span className="bib-kpi-val">{resumen.archivos.total}</span><span className="bib-kpi-sub">{resumen.archivos.pdfsCotizacion} PDFs + {resumen.archivos.seguimiento} de seguimiento</span></div>
            <div className="bib-kpi"><span className="bib-kpi-lbl">Reseñas</span><span className="bib-kpi-val">{resumen.resenas.total}</span><span className="bib-kpi-sub">capturadas</span></div>
          </div>
          <div className="bib-cols">
            <div className="bib-card">
              <h4>Trabajos más vendidos</h4>
              {resumen.topTipos.map((t) => (
                <div key={t.nombre} className="bib-bar-row">
                  <span className="bib-bar-lbl">{t.nombre}</span>
                  <div className="bib-bar"><div className="bib-bar-fill" style={{ width: `${(t.veces / (resumen.topTipos[0]?.veces || 1)) * 100}%` }} /></div>
                  <span className="bib-bar-n">{t.veces}</span>
                </div>
              ))}
              {!resumen.topTipos.length && <p className="bib-empty">Sin datos aún</p>}
            </div>
            <div className="bib-card">
              <h4>Áreas más atendidas</h4>
              {resumen.topAreas.map((t) => (
                <div key={t.nombre} className="bib-bar-row">
                  <span className="bib-bar-lbl">{t.nombre}</span>
                  <div className="bib-bar"><div className="bib-bar-fill alt" style={{ width: `${(t.veces / (resumen.topAreas[0]?.veces || 1)) * 100}%` }} /></div>
                  <span className="bib-bar-n">{t.veces}</span>
                </div>
              ))}
              {!resumen.topAreas.length && <p className="bib-empty">Sin datos aún</p>}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ COTIZACIONES ══════════ */}
      {tab === 'cotizaciones' && (
        <div className="bib-section">
          <div className="bib-toolbar">
            <div className="bib-search"><FaSearch /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente, folio, título, carrera…" /></div>
            <span className="bib-count">{cotFiltradas.length} cotizaciones</span>
          </div>
          <div className="bib-table-wrap">
            <table className="bib-table">
              <thead><tr><th>Folio</th><th>Cliente</th><th>Trabajo</th><th>Precio</th><th>Estado</th><th>Vendedor</th><th>Fecha</th><th>PDF</th></tr></thead>
              <tbody>
                {cotFiltradas.map((c) => (
                  <tr key={c._id}>
                    <td className="bib-mono">{c.folio || '—'}{c.privado && <FaLock className="bib-lock" title="Venta personal" />}</td>
                    <td>{c.clientName}</td>
                    <td className="bib-title-cell" title={c.tituloTrabajo}>{c.tipoTrabajo}{c.tituloTrabajo ? ` — ${c.tituloTrabajo}` : ''}</td>
                    <td className="bib-mono">{money(c.precioConDescuento)}</td>
                    <td>{statusChip(c.status)}</td>
                    <td>{c.vendedor || '—'}</td>
                    <td>{fecha(c.paidAt || c.createdAt)}</td>
                    <td>{c.pdfUrl ? <a href={c.pdfUrl} target="_blank" rel="noreferrer" className="bib-link"><FaExternalLinkAlt /></a> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!cotFiltradas.length && !loading && <p className="bib-empty">Sin resultados</p>}
          </div>
        </div>
      )}

      {/* ══════════ PROYECTOS ══════════ */}
      {tab === 'proyectos' && (
        <div className="bib-section">
          <div className="bib-toolbar">
            <div className="bib-search"><FaSearch /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente, título, folio…" /></div>
            <span className="bib-count">{proyFiltrados.length} proyectos</span>
          </div>
          <div className="bib-table-wrap">
            <table className="bib-table">
              <thead><tr><th>Cliente</th><th>Proyecto</th><th>Estado</th><th>Entrega</th><th>Pagado</th><th>Pendiente</th><th>📎</th><th>💬</th><th>Vendedor</th></tr></thead>
              <tbody>
                {proyFiltrados.map((p) => (
                  <tr key={`${p.type}-${p.id}`}>
                    <td>{p.cliente}{p.privado && <FaLock className="bib-lock" title="Venta personal" />}</td>
                    <td className="bib-title-cell" title={p.title}>{p.title || '—'}</td>
                    <td>{p.entregado ? <span className="bib-chip bib-chip-ok">Entregado</span> : <span className="bib-chip bib-chip-warn">{p.estado || 'En curso'}</span>}</td>
                    <td>{fecha(p.fechaEntrega)}</td>
                    <td className="bib-mono">{money(p.pagado)}</td>
                    <td className="bib-mono">{p.pendiente > 0 ? <span className="bib-rojo">{money(p.pendiente)}</span> : '—'}</td>
                    <td>{(p.nArchivos || 0) + (p.nComprobantes || 0) || '—'}</td>
                    <td>{p.nNotas || '—'}</td>
                    <td>{p.vendedor || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!proyFiltrados.length && !loading && <p className="bib-empty">Sin resultados</p>}
          </div>
        </div>
      )}

      {/* ══════════ RESEÑAS ══════════ */}
      {tab === 'resenas' && (
        <div className="bib-section">
          <div className="bib-toolbar">
            <button className="bib-btn bib-btn-primary" onClick={() => setShowForm((v) => !v)}><FaPlus /> Nueva reseña</button>
            <span className="bib-count">{resenas.length} reseñas · las ⭐ destacadas entran al contexto de la IA</span>
          </div>
          {showForm && (
            <div className="bib-card bib-form">
              <div className="bib-form-row">
                <input placeholder="Cliente (nombre)" value={nueva.cliente} onChange={(e) => setNueva({ ...nueva, cliente: e.target.value })} />
                <input placeholder="Servicio (ej. Tesis de maestría)" value={nueva.servicio} onChange={(e) => setNueva({ ...nueva, servicio: e.target.value })} />
                <select value={nueva.fuente} onChange={(e) => setNueva({ ...nueva, fuente: e.target.value })}>
                  <option value="whatsapp">WhatsApp</option><option value="google">Google</option><option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option><option value="sitio">Sitio web</option><option value="otro">Otro</option>
                </select>
              </div>
              <textarea rows={3} placeholder="Texto de la reseña (copia el mensaje real del cliente)" value={nueva.texto} onChange={(e) => setNueva({ ...nueva, texto: e.target.value })} />
              <div className="bib-form-row">
                <Estrellas n={nueva.calificacion} onChange={(n) => setNueva({ ...nueva, calificacion: n })} />
                <label className="bib-check"><input type="checkbox" checked={nueva.destacada} onChange={(e) => setNueva({ ...nueva, destacada: e.target.checked })} /> Destacada (va al contexto IA)</label>
                <button className="bib-btn bib-btn-primary" onClick={guardarResena} disabled={guardando || !nueva.cliente.trim() || !nueva.texto.trim()}>
                  {guardando ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          )}
          <div className="bib-resenas">
            {resenas.map((r) => (
              <div key={r._id} className={`bib-resena ${r.destacada ? 'destacada' : ''}`}>
                <div className="bib-resena-head">
                  <strong>{r.cliente}</strong>
                  <Estrellas n={r.calificacion} />
                  <span className="bib-resena-meta">{r.fuente}{r.servicio ? ` · ${r.servicio}` : ''} · {fecha(r.fecha)}</span>
                  <div className="bib-resena-actions">
                    <button className="bib-icon-btn" title={r.destacada ? 'Quitar de destacadas' : 'Destacar (entra al contexto IA)'} onClick={() => toggleDestacada(r)}>
                      {r.destacada ? <FaStar style={{ color: '#FBBF24' }} /> : <FaRegStar />}
                    </button>
                    <button className="bib-icon-btn bib-danger" title="Borrar" onClick={() => borrarResena(r)}><FaTrash /></button>
                  </div>
                </div>
                <p className="bib-resena-texto">“{r.texto}”</p>
              </div>
            ))}
            {!resenas.length && !loading && (
              <p className="bib-empty">Aún no hay reseñas. Captura los mensajes reales de agradecimiento de tus clientes — las destacadas se inyectan al contexto de Sofia para dar confianza en ventas.</p>
            )}
          </div>
        </div>
      )}

      {/* ══════════ ARCHIVOS ══════════ */}
      {tab === 'archivos' && (
        <div className="bib-section">
          <div className="bib-toolbar">
            <div className="bib-search"><FaSearch /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente o archivo…" /></div>
            <select className="bib-select" value={origenF} onChange={(e) => setOrigenF(e.target.value)}>
              <option value="">Todos los orígenes</option>
              <option value="cotizacion">Cotizaciones (PDF)</option>
              <option value="entrega">Entregas</option>
              <option value="soporte">Soporte</option>
              <option value="comprobante">Comprobantes</option>
              <option value="revision">Revisiones</option>
            </select>
            <span className="bib-count">{archFiltrados.length} archivos</span>
          </div>
          <div className="bib-table-wrap">
            <table className="bib-table">
              <thead><tr><th>Origen</th><th>Cliente</th><th>Archivo</th><th>Fecha</th><th>Abrir</th></tr></thead>
              <tbody>
                {archFiltrados.slice(0, 400).map((a, i) => (
                  <tr key={i}>
                    <td>{ORIGEN_LABEL[a.origen] || a.origen}</td>
                    <td>{a.cliente || '—'}</td>
                    <td className="bib-title-cell" title={a.nombre}>{a.nombre || '—'}</td>
                    <td>{fecha(a.fecha)}</td>
                    <td>{a.url ? <a href={a.url} target="_blank" rel="noreferrer" className="bib-link"><FaDownload /></a> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {archFiltrados.length > 400 && <p className="bib-empty">Mostrando los 400 más recientes — usa el buscador para encontrar el resto.</p>}
            {!archFiltrados.length && !loading && <p className="bib-empty">Sin archivos</p>}
          </div>
        </div>
      )}

      {/* ══════════ CONTEXTO IA ══════════ */}
      {tab === 'contexto' && (
        <div className="bib-section">
          <div className="bib-card bib-ia-intro">
            <h4><FaRobot /> Paquete de contexto para la IA</h4>
            <p>
              Este bloque se genera en vivo con los datos reales de la Biblioteca (ventas, demanda, esquemas de pago y reseñas destacadas),
              <strong> anonimizado</strong> — sin teléfonos, correos ni precios exactos de clientes. Úsalo para alimentar a <strong>Sofia</strong>:
              cópialo al prompt del agente en n8n, o conéctalo directo con el endpoint
              <code> GET /biblioteca/contexto-ia</code> (header <code>x-biblioteca-token</code>).
            </p>
            <div className="bib-ia-actions">
              <button className="bib-btn bib-btn-primary" onClick={copiarContexto} disabled={!contexto}>
                {copiado ? <><FaCheck /> Copiado</> : <><FaCopy /> Copiar contexto</>}
              </button>
              <button className="bib-btn bib-btn-ghost" onClick={() => { setContexto(null); cargar('contexto', true); }} disabled={loading}>
                <FaSync className={loading ? 'bib-spin' : ''} /> Regenerar
              </button>
            </div>
          </div>
          {contexto && (
            <>
              <pre className="bib-contexto">{contexto.textoPlano}</pre>
              <p className="bib-ia-meta">Generado: {new Date(contexto.generadoEn).toLocaleString('es-MX')} · {contexto.ventas?.proyectosCerradosHistoricos} proyectos cerrados · {contexto.resenas?.length || 0} reseñas incluidas</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBiblioteca;
