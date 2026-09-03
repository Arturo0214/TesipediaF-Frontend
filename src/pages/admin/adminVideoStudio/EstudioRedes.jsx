import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  FaSync, FaCheck, FaTimes, FaSave, FaChevronLeft, FaChevronRight,
  FaCalendarAlt, FaThLarge, FaListUl, FaImage, FaInstagram, FaFacebookF, FaTiktok,
  FaCloudUploadAlt, FaRegClock, FaChartLine, FaPaperPlane, FaTrashAlt,
} from 'react-icons/fa';
import svc from '../../../services/videoStudioService';
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

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function EstudioRedes() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('calendario');     // calendario | grid | lista
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

  // ── KPIs ──
  const kpi = useMemo(() => posts.reduce((a, p) => { a[p.estado] = (a[p.estado] || 0) + 1; return a; }, {}), [posts]);
  const hoy = ymd(new Date());
  const proximas = posts.filter((p) => p.fecha >= hoy && p.estado !== 'publicado').length;
  const avance = posts.length ? Math.round(((kpi.publicado || 0) + (kpi.programado || 0)) / posts.length * 100) : 0;

  const filtrados = posts.filter((p) =>
    (!fEstado || p.estado === fEstado) && (!fFormato || p.formato === fFormato));
  const formatos = [...new Set(posts.map((p) => p.formato))];

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
  const reemplazar = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !abierta) return;
    setSubiendo(true);
    try { refrescarPieza(await svc.uploadSocialImage(abierta.id, file, imgIdx)); toast.success('Imagen reemplazada'); }
    catch { toast.error('No se pudo subir la imagen'); }
    finally { setSubiendo(false); if (fileRef.current) fileRef.current.value = ''; }
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
        <button className="er-refresh" onClick={cargar} title="Refrescar"><FaSync className={loading ? 'er-spin' : ''} /></button>
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

      {/* ── CALENDARIO ── */}
      {!loading && vista === 'calendario' && posts.length > 0 && (
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

      {/* ── CUADRÍCULA (feed) ── */}
      {!loading && vista === 'grid' && (
        <div className="er-grid">
          {filtrados.map((p) => (
            <button key={p.id} className="er-tile" onClick={() => abrir(p)}>
              <img src={(p.imagenes || [])[0]} alt={p.tema} loading="lazy" />
              <span className="er-tile-badge" style={{ background: FORMATO_COLOR[p.formato] }}>{p.formato}</span>
              <span className="er-tile-est" style={{ background: EST[p.estado]?.c }} />
              {(p.imagenes || []).length > 1 && <span className="er-tile-multi"><FaImage /> {p.imagenes.length}</span>}
              <span className="er-tile-info"><b>{p.tema}</b><span>{p.fecha} · {p.slot}</span></span>
            </button>
          ))}
        </div>
      )}

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

      {/* ── COMPOSER (modal) ── */}
      {abierta && (
        <div className="er-modal-bg" onClick={() => { setAbierta(null); setDraft(null); }}>
          <div className="er-modal" onClick={(e) => e.stopPropagation()}>
            <button className="er-modal-x" onClick={() => { setAbierta(null); setDraft(null); }}><FaTimes /></button>

            {/* Visor de imágenes */}
            <div className="er-visor">
              <div className="er-visor-main">
                {(abierta.imagenes || []).length > 1 && (
                  <button className="er-visor-arrow left" onClick={() => setImgIdx((i) => (i - 1 + abierta.imagenes.length) % abierta.imagenes.length)}><FaChevronLeft /></button>
                )}
                <img src={(abierta.imagenes || [])[imgIdx]} alt="" />
                {(abierta.imagenes || []).length > 1 && (
                  <button className="er-visor-arrow right" onClick={() => setImgIdx((i) => (i + 1) % abierta.imagenes.length)}><FaChevronRight /></button>
                )}
                <span className="er-visor-count">{imgIdx + 1} / {(abierta.imagenes || []).length}</span>
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
                <span className="er-panel-fecha">{abierta.fecha} · slot {abierta.slot} · {(abierta.hora || '').slice(0, 5)}</span>
              </div>
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
