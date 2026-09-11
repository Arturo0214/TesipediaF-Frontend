import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  FaNewspaper, FaSync, FaCheck, FaEye, FaEyeSlash, FaTrashAlt, FaTimes,
  FaPlus, FaRss, FaRobot, FaEdit, FaExternalLinkAlt,
} from 'react-icons/fa';
import svc from '../../../services/noticiasService';
import './NoticiasStudio.css';

const CATS = [
  { id: 'tesis', lbl: 'Tesis' }, { id: 'metodologia', lbl: 'Metodología' },
  { id: 'ia-academica', lbl: 'IA académica' }, { id: 'titulacion', lbl: 'Titulación' },
  { id: 'becas', lbl: 'Becas' }, { id: 'vida-universitaria', lbl: 'Vida universitaria' },
];
const catLbl = (id) => CATS.find((c) => c.id === id)?.lbl || id;
const EST = { borrador: { lbl: 'Borrador', c: '#9ca3af' }, publicado: { lbl: 'Publicado', c: '#15803d' } };

export default function NoticiasStudio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fEstado, setFEstado] = useState(null);
  const [fCat, setFCat] = useState(null);
  const [recolectando, setRecolectando] = useState(false);
  const [catRec, setCatRec] = useState('tesis');
  const [abierta, setAbierta] = useState(null);
  const [draft, setDraft] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setItems(await svc.listNoticias()); }
    catch { toast.error('No se pudieron cargar las noticias'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const kpi = items.reduce((a, n) => { a[n.estado] = (a[n.estado] || 0) + 1; return a; }, {});
  const filtrados = items.filter((n) => (!fEstado || n.estado === fEstado) && (!fCat || n.categoria === fCat));

  const recolectar = async () => {
    setRecolectando(true);
    try { await svc.recolectarRSS(catRec); toast.success('Resumen RSS creado (borrador)'); cargar(); }
    catch (e) { toast.error(e?.response?.data?.message || 'No se pudo recolectar'); }
    finally { setRecolectando(false); }
  };
  const publicar = async (n) => {
    try { await svc.publicarNoticia(n.id); toast.success('Publicada'); cargar(); }
    catch { toast.error('Error al publicar'); }
  };
  const despublicar = async (n) => {
    try { await svc.despublicarNoticia(n.id); toast.success('Enviada a borrador'); cargar(); }
    catch { toast.error('Error'); }
  };
  const eliminar = async (n) => {
    if (!window.confirm(`¿Eliminar "${n.titulo}"?`)) return;
    try { await svc.borrarNoticia(n.id); setItems((p) => p.filter((x) => x.id !== n.id)); toast.success('Eliminada'); }
    catch { toast.error('Error al eliminar'); }
  };
  const abrir = async (n) => {
    try {
      const full = await svc.getNoticia(n.id);
      setAbierta(full);
      setDraft({ titulo: full.titulo || '', resumen: full.resumen || '', categoria: full.categoria || 'tesis', imagen: full.imagen || '', cuerpo: full.cuerpo || '' });
    } catch { toast.error('No se pudo abrir'); }
  };
  const nueva = () => {
    setAbierta({ id: null });
    setDraft({ titulo: '', resumen: '', categoria: 'tesis', imagen: '', cuerpo: '' });
  };
  const guardar = async (publicarTras = false) => {
    setGuardando(true);
    try {
      let row;
      if (abierta.id) { row = await svc.actualizarNoticia(abierta.id, draft); }
      else { row = await svc.crearNoticia(draft); }
      if (publicarTras && row?.id) await svc.publicarNoticia(row.id);
      toast.success(publicarTras ? 'Guardada y publicada' : 'Guardada');
      setAbierta(null); setDraft(null); cargar();
    } catch (e) { toast.error(e?.response?.data?.message || 'Error al guardar'); }
    finally { setGuardando(false); }
  };

  return (
    <div className="nt">
      <div className="nt-head">
        <div>
          <h3><FaNewspaper /> Estudio de Noticias · Tesipedia</h3>
          <p className="nt-sub">Artículos SEO de tu nicho. Se generan con tu <b>Claude local</b> (sin costo) y se publican con tu aprobación.</p>
        </div>
        <button className="nt-refresh" onClick={cargar} title="Refrescar"><FaSync className={loading ? 'nt-spin' : ''} /></button>
      </div>

      <div className="nt-kpis">
        <div className="nt-kpi"><span className="nt-kpi-n">{items.length}</span><span className="nt-kpi-l">Total</span></div>
        <div className="nt-kpi"><span className="nt-kpi-n" style={{ color: EST.borrador.c }}>{kpi.borrador || 0}</span><span className="nt-kpi-l">Borradores</span></div>
        <div className="nt-kpi"><span className="nt-kpi-n" style={{ color: EST.publicado.c }}>{kpi.publicado || 0}</span><span className="nt-kpi-l">Publicadas</span></div>
      </div>

      <div className="nt-genbar">
        <div className="nt-gen nt-gen-ia">
          <div className="nt-gen-h"><FaRobot /> Generar con IA (local, gratis)</div>
          <p>En tu Mac, en la carpeta del backend:</p>
          <code>npm run noticia -- tesis 3</code>
          <span className="nt-gen-tip">Crea borradores parafraseando titulares reales con tu Claude CLI. Luego los apruebas aquí.</span>
        </div>
        <div className="nt-gen">
          <div className="nt-gen-h"><FaRss /> Recolectar titulares (resumen, gratis)</div>
          <div className="nt-gen-row">
            <select value={catRec} onChange={(e) => setCatRec(e.target.value)}>
              {CATS.map((c) => <option key={c.id} value={c.id}>{c.lbl}</option>)}
            </select>
            <button className="nt-btn primary" onClick={recolectar} disabled={recolectando}>
              {recolectando ? <FaSync className="nt-spin" /> : <FaRss />} Crear resumen
            </button>
          </div>
          <span className="nt-gen-tip">Arma un digest editorial de la semana (sin IA) como borrador.</span>
        </div>
        <button className="nt-btn nt-newbtn" onClick={nueva}><FaPlus /> Artículo manual</button>
      </div>

      <div className="nt-filtros">
        <select value={fEstado || ''} onChange={(e) => setFEstado(e.target.value || null)}>
          <option value="">Todos los estados</option>
          {Object.keys(EST).map((k) => <option key={k} value={k}>{EST[k].lbl}</option>)}
        </select>
        <select value={fCat || ''} onChange={(e) => setFCat(e.target.value || null)}>
          <option value="">Todas las categorías</option>
          {CATS.map((c) => <option key={c.id} value={c.id}>{c.lbl}</option>)}
        </select>
      </div>

      {loading && <p className="nt-muted">Cargando…</p>}
      {!loading && filtrados.length === 0 && <p className="nt-muted">No hay noticias todavía. Genera con IA local o crea un resumen RSS.</p>}

      <div className="nt-list">
        {filtrados.map((n) => (
          <div key={n.id} className="nt-row">
            {n.imagen ? <img src={n.imagen} alt="" className="nt-thumb" loading="lazy" /> : <div className="nt-thumb nt-thumb-empty"><FaNewspaper /></div>}
            <div className="nt-row-main" onClick={() => abrir(n)}>
              <div className="nt-row-badges">
                <span className="nt-cat">{catLbl(n.categoria)}</span>
                <span className="nt-est" style={{ color: EST[n.estado]?.c, borderColor: EST[n.estado]?.c }}>{EST[n.estado]?.lbl}</span>
                {n.origen === 'auto' && <span className="nt-origen"><FaRobot /> IA</span>}
                {n.origen === 'resumen' && <span className="nt-origen"><FaRss /> RSS</span>}
              </div>
              <p className="nt-titulo">{n.titulo}</p>
              <p className="nt-resumen">{n.resumen}</p>
            </div>
            <div className="nt-row-actions">
              <button onClick={() => abrir(n)} title="Ver / editar"><FaEdit /></button>
              {n.estado === 'publicado'
                ? <button onClick={() => despublicar(n)} title="Despublicar"><FaEyeSlash /></button>
                : <button className="ok" onClick={() => publicar(n)} title="Publicar"><FaCheck /></button>}
              {n.estado === 'publicado' && <a href={`/noticias/${n.slug}`} target="_blank" rel="noopener noreferrer" title="Ver pública"><FaExternalLinkAlt /></a>}
              <button className="danger" onClick={() => eliminar(n)} title="Eliminar"><FaTrashAlt /></button>
            </div>
          </div>
        ))}
      </div>

      {abierta && draft && (
        <div className="nt-modal-bg" onClick={() => { setAbierta(null); setDraft(null); }}>
          <div className="nt-modal" onClick={(e) => e.stopPropagation()}>
            <button className="nt-modal-x" onClick={() => { setAbierta(null); setDraft(null); }}><FaTimes /></button>
            <h3>{abierta.id ? 'Editar artículo' : 'Nuevo artículo'}</h3>
            <label>Título<input value={draft.titulo} onChange={(e) => setDraft({ ...draft, titulo: e.target.value })} /></label>
            <label>Resumen (meta description)<textarea rows={2} value={draft.resumen} onChange={(e) => setDraft({ ...draft, resumen: e.target.value })} /></label>
            <div className="nt-modal-row">
              <label>Categoría<select value={draft.categoria} onChange={(e) => setDraft({ ...draft, categoria: e.target.value })}>{CATS.map((c) => <option key={c.id} value={c.id}>{c.lbl}</option>)}</select></label>
              <label>Imagen (URL)<input value={draft.imagen} onChange={(e) => setDraft({ ...draft, imagen: e.target.value })} placeholder="https://…" /></label>
            </div>
            <label>Cuerpo (HTML)<textarea rows={12} value={draft.cuerpo} onChange={(e) => setDraft({ ...draft, cuerpo: e.target.value })} /></label>
            <div className="nt-preview">
              <span className="nt-preview-lbl">Vista previa</span>
              <div className="nt-preview-body" dangerouslySetInnerHTML={{ __html: draft.cuerpo || '<p style="opacity:.5">(vacío)</p>' }} />
            </div>
            <div className="nt-modal-actions">
              <button className="nt-btn primary" onClick={() => guardar(false)} disabled={guardando}>Guardar borrador</button>
              <button className="nt-btn ok" onClick={() => guardar(true)} disabled={guardando}><FaCheck /> Guardar y publicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
