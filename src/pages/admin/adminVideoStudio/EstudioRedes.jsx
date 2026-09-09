import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  FaSync, FaCheck, FaTimes, FaSave, FaChevronLeft, FaChevronRight,
  FaCalendarAlt, FaThLarge, FaListUl, FaImage, FaInstagram, FaFacebookF, FaTiktok,
  FaCloudUploadAlt, FaRegClock, FaChartLine, FaPaperPlane, FaTrashAlt,
  FaChartBar, FaHeart, FaComment, FaShareAlt, FaUsers,
  FaPlus, FaExclamationTriangle,
} from 'react-icons/fa';
import svc from '../../../services/videoStudioService';
import axiosWithAuth from '../../../utils/axioswithAuth';
import './EstudioRedes.css';

const FORMATO_COLOR = {
  FRASE: '#123661', DICCIONARIO: '#5b6b86', CARRUSEL: '#D4A438', CHECKLIST: '#1F7A5E',
  COMPARATIVA: '#B23A4E', PRUEBA: '#1B4372', OFERTA: '#c78a12',
};
const EST = {
  borrador: { lbl: 'Borrador', c: '#9ca3af' },
  programado: { lbl: 'Programado', c: '#1d4ed8' },
  publicado: { lbl: 'Publicado', c: '#15803d' },
  error: { lbl: 'Error', c: '#c0392b' },
};
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const PLAT_ICON = { ig: FaInstagram, fb: FaFacebookF, tiktok: FaTiktok };
const MARCAS = [
  { id: 'Tesipedia', c: '#E0B23C' },
  { id: 'Contratado', c: '#3B82F6' },
  { id: 'FSC', c: '#16A34A' },
  { id: 'Enlace468', c: '#00A99D' },
  { id: 'Spoilers', c: '#A855F7' },
  { id: 'Libro vs Película', c: '#EF4444' },
];

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function EstudioRedes() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('calendario');     // calendario | grid | lista
  const [fMarca, setFMarca] = useState(null);
  const [fEstado, setFEstado] = useState(null);
  const [fFormato, setFFormato] = useState(null);
  const [mesRef, setMesRef] = useState(null);           // Date del mes visible
  const [abierta, setAbierta] = useState(null);         // pieza en el composer
  const [imgIdx, setImgIdx] = useState(0);
  const [draft, setDraft] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [sug, setSug] = useState(null);
  const [cargandoSug, setCargandoSug] = useState(false);
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  // Switch de auto-publicación
  const [autoPub, setAutoPub] = useState(false);
  const [autoPubBusy, setAutoPubBusy] = useState(false);
  useEffect(() => { svc.getAutopublish().then((d) => setAutoPub(!!d.enabled)).catch(() => {}); }, []);
  const toggleAutoPub = async () => {
    const next = !autoPub;
    if (next && !window.confirm('¿Encender la publicación automática? Las piezas PROGRAMADAS se publicarán solas en Instagram y Facebook a su hora.')) return;
    setAutoPubBusy(true);
    try { const d = await svc.setAutopublish(next); setAutoPub(!!d.enabled); toast.success(d.enabled ? 'Auto-publicación ENCENDIDA' : 'Auto-publicación apagada'); }
    catch { toast.error('No se pudo cambiar el switch'); }
    finally { setAutoPubBusy(false); }
  };
  // Rendimiento (métricas FB/IG — reutiliza /social/*)
  const [rend, setRend] = useState(null);
  const [rendLoad, setRendLoad] = useState(false);
  const cargarRend = useCallback(async () => {
    setRendLoad(true);
    try {
      const [m, ig, fb] = await Promise.all([
        axiosWithAuth.get('/social/metrics').then((r) => r.data?.data || r.data).catch(() => null),
        axiosWithAuth.get('/social/posts/instagram').then((r) => r.data?.data || []).catch(() => []),
        axiosWithAuth.get('/social/posts/facebook').then((r) => r.data?.data || []).catch(() => []),
      ]);
      setRend({ metrics: m, ig, fb });
    } catch { toast.error('No se pudieron cargar las métricas'); }
    finally { setRendLoad(false); }
  }, []);
  useEffect(() => { if (vista === 'rendimiento' && !rend && !rendLoad) cargarRend(); }, [vista]); // eslint-disable-line

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await svc.getSocial();
      setPosts(data);
      if (data.length && !mesRef) {
        const f = data[0].fecha;
        setMesRef(new Date(`${f}T12:00:00`));
      }
    } catch {
      toast.error('No se pudo cargar el contenido (¿SUPABASE_SERVICE_KEY en el backend?)');
    } finally { setLoading(false); }
  }, [mesRef]);
  useEffect(() => { cargar(); }, []); // eslint-disable-line

  // ── filtro de marca (multi-página) ──
  const marca = (p) => p.marca || 'Tesipedia';
  const base = fMarca ? posts.filter((p) => marca(p) === fMarca) : posts;
  const conteoMarca = useMemo(() => posts.reduce((a, p) => { a[marca(p)] = (a[marca(p)] || 0) + 1; return a; }, {}), [posts]);

  // ── KPIs (sobre la marca seleccionada) ──
  const kpi = base.reduce((a, p) => { a[p.estado] = (a[p.estado] || 0) + 1; return a; }, {});
  const hoy = ymd(new Date());
  const proximas = base.filter((p) => p.fecha >= hoy && p.estado !== 'publicado').length;
  const avance = base.length ? Math.round(((kpi.publicado || 0) + (kpi.programado || 0)) / base.length * 100) : 0;

  const filtrados = base.filter((p) =>
    (!fEstado || p.estado === fEstado) && (!fFormato || p.formato === fFormato));
  const formatos = [...new Set(base.map((p) => p.formato))];

  // ── validación de una pieza (para avisos en la cuadrícula) ──
  const avisos = (p) => {
    const out = [];
    if (!(p.imagenes || []).length) out.push('Falta imagen');
    if (!(p.copy || '').trim()) out.push('Falta texto');
    if (!(p.hashtags || '').trim()) out.push('Faltan hashtags');
    if (p.estado === 'borrador') out.push('Sin aprobar');
    return out;
  };

  // ── agregar una publicación a un día (3ª, 4ª…) ──
  const [agregando, setAgregando] = useState(null);   // fecha en curso
  const agregarPost = async (fecha) => {
    setAgregando(fecha);
    try {
      const row = await svc.createSocial({ fecha, marca: fMarca || 'Tesipedia' });
      setPosts((prev) => [...prev, row]);
      toast.success(`Publicación agregada (slot ${row.slot})`);
      abrir(row);
    } catch (e) {
      toast.error(e.response?.data?.message || 'No se pudo agregar');
    } finally { setAgregando(null); }
  };

  // ── acciones ──
  const refrescarPieza = (row) => {
    setPosts((prev) => prev.map((x) => (x.id === row.id ? row : x)));
    if (abierta && abierta.id === row.id) setAbierta(row);
  };
  const aprobar = async (p) => { try { refrescarPieza(await svc.approveSocial(p.id)); toast.success('Aprobada → programada'); } catch { toast.error('Error'); } };
  const descartar = async (p) => { try { refrescarPieza(await svc.discardSocial(p.id)); toast.success('Enviada a borrador'); } catch { toast.error('Error'); } };
  const guardar = async () => {
    try { refrescarPieza(await svc.updateSocial(abierta.id, draft)); toast.success('Cambios guardados'); }
    catch { toast.error('Error al guardar'); }
  };
  const publicar = async () => {
    if (!window.confirm('¿Publicar esta pieza AHORA en las redes seleccionadas?')) return;
    setPublicando(true);
    try { refrescarPieza(await svc.publishSocial(abierta.id)); toast.success('¡Publicada!'); }
    catch (e) { toast.error(e.response?.data?.message || 'No se pudo publicar'); }
    finally { setPublicando(false); }
  };
  const eliminar = async () => {
    if (!window.confirm('¿Eliminar esta publicación? Si ya está publicada en Facebook, se intentará borrar también de la página.')) return;
    try { await svc.deleteSocial(abierta.id); setPosts((prev) => prev.filter((x) => x.id !== abierta.id)); setAbierta(null); toast.success('Eliminada'); }
    catch { toast.error('Error al eliminar'); }
  };
  const sugerir = async () => {
    setCargandoSug(true);
    try { setSug(await svc.sugerenciasSocial(abierta.id)); }
    catch { toast.error('No se pudieron traer sugerencias'); }
    finally { setCargandoSug(false); }
  };
  const addTag = (tag) => setDraft((d) => ({ ...d, hashtags: `${d.hashtags || ''} ${tag}`.trim() }));
  const abrir = (p) => {
    setAbierta(p); setImgIdx(0); setSug(null);
    setDraft({ titular: p.titular || '', copy: p.copy || '', hashtags: p.hashtags || '', cta: p.cta || '' });
  };
  const subirImagen = async (file) => {
    if (!file || !abierta) return;
    setSubiendo(true);
    try { refrescarPieza(await svc.uploadSocialImage(abierta.id, file, imgIdx)); toast.success('Imagen reemplazada'); }
    catch { toast.error('No se pudo subir la imagen'); }
    finally { setSubiendo(false); if (fileRef.current) fileRef.current.value = ''; }
  };
  const reemplazar = (e) => subirImagen(e.target.files?.[0]);
  const onDropImagen = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const n = (abierta.imagenes || []).length ? imgIdx + 1 : 1;
    if (window.confirm(`¿Reemplazar la imagen ${n} con «${file.name}»?`)) subirImagen(file);
  };

  // ── Calendario ──
  const calRef = mesRef || new Date();
  const y = calRef.getFullYear();
  const m = calRef.getMonth();
  const primero = new Date(y, m, 1);
  const offset = (primero.getDay() + 6) % 7;       // lunes = 0
  const diasMes = new Date(y, m + 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= diasMes; d++) celdas.push(d);
  const porDia = useMemo(() => {
    const map = {};
    filtrados.forEach((p) => { (map[p.fecha] = map[p.fecha] || []).push(p); });
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.slot || '').localeCompare(b.slot || '')));
    return map;
  }, [filtrados]);
  const cambiarMes = (delta) => setMesRef(new Date(y, m + delta, 1));

  return (
    <div className="er">
      {/* Header */}
      <div className="er-head">
        <div>
          <h2>Estudio de Contenido</h2>
          <p className="er-sub">Planea, revisa y aprueba lo que sale en Instagram, Facebook y TikTok.</p>
        </div>
        <div className="er-head-actions">
          <button className={`er-autopub ${autoPub ? 'on' : ''}`} onClick={toggleAutoPub} disabled={autoPubBusy} title="Publicación automática de las piezas programadas">
            <span className="er-autopub-label">Auto-publicar</span>
            <span className="er-switch"><span className="er-switch-knob" /></span>
            <span className="er-autopub-state">{autoPub ? 'ON' : 'OFF'}</span>
          </button>
          <button className="er-refresh" onClick={cargar} title="Refrescar"><FaSync className={loading ? 'er-spin' : ''} /></button>
        </div>
      </div>

      {/* Marcas (multi-página) */}
      <div className="er-marcas">
        <button className={`er-marca ${!fMarca ? 'on' : ''}`} onClick={() => setFMarca(null)}>
          Todas <span>{posts.length}</span>
        </button>
        {MARCAS.map((mk) => (
          <button
            key={mk.id}
            className={`er-marca ${fMarca === mk.id ? 'on' : ''}`}
            style={fMarca === mk.id ? { borderColor: mk.c, color: mk.c } : {}}
            onClick={() => setFMarca(mk.id)}
          >
            <i style={{ background: mk.c }} /> {mk.id} <span>{conteoMarca[mk.id] || 0}</span>
          </button>
        ))}
      </div>

      {/* KPIs + avance */}
      <div className="er-kpis">
        <div className="er-kpi"><span className="er-kpi-n">{posts.length}</span><span className="er-kpi-l">Piezas</span></div>
        <div className="er-kpi"><span className="er-kpi-n" style={{ color: EST.programado.c }}>{kpi.programado || 0}</span><span className="er-kpi-l">Programadas</span></div>
        <div className="er-kpi"><span className="er-kpi-n" style={{ color: EST.publicado.c }}>{kpi.publicado || 0}</span><span className="er-kpi-l">Publicadas</span></div>
        <div className="er-kpi"><span className="er-kpi-n" style={{ color: EST.borrador.c }}>{kpi.borrador || 0}</span><span className="er-kpi-l">Borrador</span></div>
        <div className="er-kpi er-kpi-prox"><span className="er-kpi-n" style={{ color: '#D4A438' }}>{proximas}</span><span className="er-kpi-l">Próximas por salir</span></div>
        <div className="er-kpi er-avance">
          <div className="er-avance-top"><span>Avance del mes</span><b>{avance}%</b></div>
          <div className="er-avance-bar"><i style={{ width: `${avance}%` }} /></div>
        </div>
      </div>

      {/* Controles: vista + filtros */}
      <div className="er-controls">
        <div className="er-vistas">
          <button className={vista === 'calendario' ? 'on' : ''} onClick={() => setVista('calendario')}><FaCalendarAlt /> Calendario</button>
          <button className={vista === 'grid' ? 'on' : ''} onClick={() => setVista('grid')}><FaThLarge /> Cuadrícula</button>
          <button className={vista === 'lista' ? 'on' : ''} onClick={() => setVista('lista')}><FaListUl /> Lista</button>
          <button className={vista === 'rendimiento' ? 'on' : ''} onClick={() => setVista('rendimiento')}><FaChartBar /> Rendimiento</button>
        </div>
        <div className="er-filtros">
          <select value={fEstado || ''} onChange={(e) => setFEstado(e.target.value || null)}>
            <option value="">Todos los estados</option>
            {Object.keys(EST).map((k) => <option key={k} value={k}>{EST[k].lbl}</option>)}
          </select>
          <select value={fFormato || ''} onChange={(e) => setFFormato(e.target.value || null)}>
            <option value="">Todos los formatos</option>
            {formatos.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      {loading && <p className="er-muted">Cargando contenido…</p>}
      {!loading && !posts.length && <p className="er-muted">No hay contenido cargado todavía.</p>}
      {!loading && posts.length > 0 && base.length === 0 && (
        <p className="er-muted">Aún no hay contenido para <b>{fMarca}</b>. Sus canales de Instagram/Facebook se llenarán cuando generes su contenido.</p>
      )}

      {/* ── CALENDARIO ── */}
      {!loading && vista === 'calendario' && base.length > 0 && (
        <div className="er-cal">
          <div className="er-cal-nav">
            <button onClick={() => cambiarMes(-1)}><FaChevronLeft /></button>
            <h3>{MESES[m]} {y}</h3>
            <button onClick={() => cambiarMes(1)}><FaChevronRight /></button>
          </div>
          <div className="er-cal-grid">
            {DIAS.map((d) => <div key={d} className="er-cal-dow">{d}</div>)}
            {celdas.map((d, i) => {
              const fecha = d ? ymd(new Date(y, m, d)) : null;
              const items = fecha ? (porDia[fecha] || []) : [];
              return (
                <div key={i} className={`er-cal-cell ${!d ? 'empty' : ''} ${fecha === hoy ? 'today' : ''}`}>
                  {d && <span className="er-cal-num">{d}</span>}
                  {items.map((p) => (
                    <button key={p.id} className="er-cal-chip" onClick={() => abrir(p)}
                      style={{ borderLeftColor: EST[p.estado]?.c }} title={p.tema}>
                      <span className="er-cal-slot" style={{ background: FORMATO_COLOR[p.formato] }}>{p.slot}</span>
                      <span className="er-cal-tema">{p.tema}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CUADRÍCULA (feed) — un renglón por día, todos los días del mes ── */}
      {!loading && vista === 'grid' && (() => {
        const DOW = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const byDay = {};
        filtrados.forEach((p) => {
          const d = new Date(p.fecha + 'T12:00:00');
          if (d.getFullYear() === y && d.getMonth() === m) (byDay[p.fecha] = byDay[p.fecha] || []).push(p);
        });
        Object.values(byDay).forEach((a) => a.sort((x, z) => (x.slot || '').localeCompare(z.slot || '')));
        const totalDias = new Date(y, m + 1, 0).getDate();
        return (
          <div>
            <div className="er-cal-nav">
              <button onClick={() => cambiarMes(-1)}><FaChevronLeft /></button>
              <h3>{MESES[m]} {y}</h3>
              <button onClick={() => cambiarMes(1)}><FaChevronRight /></button>
            </div>
            <p className="er-muted er-grid-tip">Cada día admite hasta 6 publicaciones. Usa <b>+ Agregar</b> para sumar una y las flechas para llenar cualquier mes/año.</p>
            {Array.from({ length: totalDias }, (_, i) => i + 1).map((dnum) => {
              const f = ymd(new Date(y, m, dnum));
              const dd = new Date(f + 'T12:00:00');
              const items = byDay[f] || [];
              return (
                <div key={f} className="er-day-group">
                  <div className={`er-day-head ${f === hoy ? 'today' : ''}`}>
                    <span className="er-day-num">{dnum}</span>
                    <span className="er-day-dow">{DOW[dd.getDay()]}</span>
                    {f === hoy && <span className="er-day-today">HOY</span>}
                    <span className="er-day-count">{items.length}/6</span>
                  </div>
                  <div className="er-grid">
                    {items.map((p) => {
                      const avs = avisos(p);
                      return (
                        <button key={p.id} className="er-tile" onClick={() => abrir(p)}>
                          {(p.imagenes || [])[0]
                            ? <img src={(p.imagenes || [])[0]} alt={p.tema} loading="lazy" />
                            : <div className="er-tile-empty"><FaCloudUploadAlt /><span>Vacío</span></div>}
                          <span className="er-tile-badge" style={{ background: FORMATO_COLOR[p.formato] || '#4b5563' }}>{p.formato}</span>
                          <span className="er-tile-est" style={{ background: EST[p.estado]?.c }} />
                          {avs.length > 0 && <span className="er-tile-warn" title={avs.join(' · ')}><FaExclamationTriangle /> {avs.length}</span>}
                          {(p.imagenes || []).length > 1 && <span className="er-tile-multi"><FaImage /> {p.imagenes.length}</span>}
                          <span className="er-tile-info"><b>{p.tema}</b><span>{(p.hora || '').slice(0, 5)} · slot {p.slot}</span></span>
                        </button>
                      );
                    })}
                    {items.length < 6 && (
                      <button className="er-tile er-tile-add" disabled={agregando === f} onClick={() => agregarPost(f)}>
                        <div className="er-tile-empty er-add-box">
                          {agregando === f ? <FaSync className="er-spin" /> : <FaPlus />}
                          <span>{agregando === f ? 'Agregando…' : 'Agregar'}</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── LISTA ── */}
      {!loading && vista === 'lista' && (
        <div className="er-lista">
          {filtrados.map((p) => (
            <div key={p.id} className="er-row" onClick={() => abrir(p)}>
              <img src={(p.imagenes || [])[0]} alt="" loading="lazy" />
              <div className="er-row-main">
                <div className="er-row-top">
                  <span className="er-chip-fmt" style={{ background: FORMATO_COLOR[p.formato] }}>{p.formato}</span>
                  <span className="er-chip-est" style={{ color: EST[p.estado]?.c, borderColor: EST[p.estado]?.c }}>{EST[p.estado]?.lbl}</span>
                  <span className="er-row-fecha"><FaRegClock /> {p.fecha} · {(p.hora || '').slice(0, 5)}</span>
                </div>
                <h4>{p.tema}</h4>
                <p>{(p.copy || '').slice(0, 130)}{(p.copy || '').length > 130 ? '…' : ''}</p>
              </div>
              <div className="er-row-plats">
                {(p.plataformas || []).map((pl) => { const I = PLAT_ICON[pl]; return I ? <I key={pl} /> : null; })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── RENDIMIENTO ── */}
      {!loading && vista === 'rendimiento' && (
        <div className="er-rend">
          <div className="er-rend-head">
            <p className="er-muted" style={{ margin: 0 }}>Cuánto han jalado tus publicaciones en Instagram y Facebook.</p>
            <button className="er-mini-btn" onClick={cargarRend} disabled={rendLoad}>{rendLoad ? <FaSync className="er-spin" /> : <FaSync />} Actualizar</button>
          </div>
          {rendLoad && !rend && <p className="er-muted">Cargando métricas de FB/IG…</p>}
          {rend && (() => {
            const num = (n) => (n == null ? '—' : Number(n).toLocaleString('es-MX'));
            const ig = rend.metrics?.instagram; const fb = rend.metrics?.facebook;
            const all = [
              ...(rend.ig || []).map((p) => ({ ...p, plat: 'ig' })),
              ...(rend.fb || []).map((p) => ({ ...p, plat: 'fb' })),
            ].sort((a, b) => ((b.likes || 0) + (b.comments || 0)) - ((a.likes || 0) + (a.comments || 0))).slice(0, 12);
            const KPI = (label, value) => (<div className="er-kpi"><span className="er-kpi-n">{value}</span><span className="er-kpi-l">{label}</span></div>);
            return (
              <>
                <div className="er-rend-cards">
                  <div className="er-rend-card ig">
                    <div className="er-rend-card-h"><FaInstagram /> Instagram {ig?.profilePic && <img src={ig.profilePic} alt="" />}</div>
                    {ig ? (
                      <div className="er-kpis">
                        {KPI('Seguidores', num(ig.followers))}
                        {KPI('Engagement', ig.engagement || '—')}
                        {KPI('Likes/post', num(ig.avgLikes))}
                        {KPI('Coment./post', num(ig.avgComments))}
                      </div>
                    ) : <p className="er-muted">Sin datos de Instagram.</p>}
                  </div>
                  <div className="er-rend-card fb">
                    <div className="er-rend-card-h"><FaFacebookF /> Facebook</div>
                    {fb ? (
                      <div className="er-kpis">
                        {KPI('Seguidores', num(fb.followers))}
                        {KPI('Interacc./post', num(fb.engagement))}
                        {KPI('Reacciones', num(fb.totalReactions))}
                        {KPI('Comentarios', num(fb.totalComments))}
                      </div>
                    ) : <p className="er-muted">Sin datos de Facebook.</p>}
                  </div>
                </div>

                <h3 className="er-rend-title"><FaChartLine /> Publicaciones que más jalaron</h3>
                {all.length === 0 && <p className="er-muted">Aún no hay publicaciones con métricas. Publica desde aquí y vuelve en unas horas.</p>}
                <div className="er-rend-posts">
                  {all.map((p) => (
                    <a key={`${p.plat}-${p.id}`} className="er-rend-post" href={p.url || '#'} target="_blank" rel="noopener noreferrer">
                      {p.mediaUrl ? <img src={p.mediaUrl} alt="" loading="lazy" /> : <div className="er-rend-post-noimg">{p.plat === 'ig' ? <FaInstagram /> : <FaFacebookF />}</div>}
                      <div className="er-rend-post-body">
                        <span className="er-rend-post-plat">{p.plat === 'ig' ? <FaInstagram /> : <FaFacebookF />} {new Date(p.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                        <p>{(p.caption || '(sin texto)').slice(0, 70)}</p>
                        <div className="er-rend-post-stats">
                          <span><FaHeart /> {num(p.likes)}</span>
                          <span><FaComment /> {num(p.comments)}</span>
                          {p.shares ? <span><FaShareAlt /> {num(p.shares)}</span> : null}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ── COMPOSER (modal) ── */}
      {abierta && (
        <div className="er-modal-bg" onClick={() => { setAbierta(null); setDraft(null); }}>
          <div className="er-modal" onClick={(e) => e.stopPropagation()}>
            <button className="er-modal-x" onClick={() => { setAbierta(null); setDraft(null); }}><FaTimes /></button>

            {/* Visor de imágenes */}
            <div className="er-visor">
              <div className={`er-visor-main ${dragOver ? 'er-drag' : ''}`}
                onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
                onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }}
                onDrop={onDropImagen}>
                {(abierta.imagenes || []).length > 1 && (
                  <button className="er-visor-arrow left" onClick={() => setImgIdx((i) => (i - 1 + abierta.imagenes.length) % abierta.imagenes.length)}><FaChevronLeft /></button>
                )}
                {(abierta.imagenes || [])[imgIdx]
                  ? <img src={(abierta.imagenes || [])[imgIdx]} alt="" />
                  : <div className="er-visor-empty"><FaCloudUploadAlt /><span>Slot vacío — arrastra una imagen aquí</span></div>}
                {(abierta.imagenes || []).length > 1 && (
                  <button className="er-visor-arrow right" onClick={() => setImgIdx((i) => (i + 1) % abierta.imagenes.length)}><FaChevronRight /></button>
                )}
                {(abierta.imagenes || []).length > 0 && <span className="er-visor-count">{imgIdx + 1} / {(abierta.imagenes || []).length}</span>}
                {dragOver && <div className="er-drop-hint"><FaCloudUploadAlt /> Suelta para reemplazar</div>}
              </div>
              <div className="er-thumbs">
                {(abierta.imagenes || []).map((u, i) => (
                  <button key={i} className={i === imgIdx ? 'on' : ''} onClick={() => setImgIdx(i)}>
                    <img src={u} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
              <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={reemplazar} />
              <button className="er-replace" disabled={subiendo} onClick={() => fileRef.current?.click()}>
                <FaCloudUploadAlt /> {subiendo ? 'Subiendo…' : `Reemplazar imagen ${imgIdx + 1}`}
              </button>
            </div>

            {/* Panel de edición */}
            <div className="er-panel">
              <div className="er-panel-top">
                <span className="er-chip-fmt" style={{ background: FORMATO_COLOR[abierta.formato] }}>{abierta.formato}</span>
                <span className="er-chip-est" style={{ color: EST[abierta.estado]?.c, borderColor: EST[abierta.estado]?.c }}>{EST[abierta.estado]?.lbl}</span>
                <span className="er-panel-fecha">{abierta.fecha} · slot {abierta.slot}</span>
              </div>
              <div className="er-panel-hora"><FaRegClock /> Se publica a las <b>{(abierta.hora || '10:00').slice(0, 5)} h</b> {autoPub ? '· auto-publicación ON' : '· (auto-publicación apagada)'}</div>
              {avisos(abierta).length > 0 && (
                <div className="er-panel-avisos"><FaExclamationTriangle /> <span>{avisos(abierta).join(' · ')}</span></div>
              )}
              <div className="er-panel-plats">
                {(abierta.plataformas || []).map((pl) => { const I = PLAT_ICON[pl]; return I ? <span key={pl} className={`er-plat pl-${pl}`}><I /> {pl.toUpperCase()}</span> : null; })}
                {abierta.pilar && <span className="er-pilar">{abierta.pilar}</span>}
              </div>
              <h3>{abierta.tema}</h3>

              <label>Pie de foto (lo que va en la publicación)
                <textarea rows={6} value={draft?.copy || ''} onChange={(e) => setDraft({ ...draft, copy: e.target.value })} />
              </label>
              <label>Hashtags
                <textarea rows={2} value={draft?.hashtags || ''} onChange={(e) => setDraft({ ...draft, hashtags: e.target.value })} />
              </label>

              {/* Sugerencias por tendencia (IA) */}
              <div className="er-sug">
                <button className="er-sug-btn" onClick={sugerir} disabled={cargandoSug}>
                  <FaChartLine /> {cargandoSug ? 'Analizando tendencias…' : 'Sugerencias por tendencia'}
                </button>
                {sug && (
                  <div className="er-sug-out">
                    {sug.hashtags?.length > 0 && (
                      <>
                        <span className="er-sug-lbl">Hashtags de tendencia · toca para agregar</span>
                        <div className="er-sug-tags">
                          {sug.hashtags.map((h) => <button key={h} onClick={() => addTag(h)}>{h}</button>)}
                        </div>
                      </>
                    )}
                    {sug.tips?.length > 0 && (
                      <>
                        <span className="er-sug-lbl">Tips para el gancho</span>
                        <ul className="er-sug-tips">{sug.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="er-panel-actions">
                <button className="er-btn primary" onClick={guardar}><FaSave /> Guardar</button>
                <button className="er-btn er-pub" onClick={publicar} disabled={publicando}><FaPaperPlane /> {publicando ? 'Publicando…' : 'Publicar ahora'}</button>
                {abierta.estado !== 'programado' && <button className="er-btn" onClick={() => aprobar(abierta)}><FaCheck /> Aprobar</button>}
                {abierta.estado !== 'borrador' && <button className="er-btn" onClick={() => descartar(abierta)}><FaTimes /> Descartar</button>}
                <button className="er-btn danger" onClick={eliminar}><FaTrashAlt /> Eliminar</button>
              </div>
              <p className="er-hint">El texto DENTRO de la imagen se re-renderiza desde el editor de la Mac; aquí editas la publicación, reemplazas imágenes y publicas.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
