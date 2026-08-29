import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  FaSync, FaMagic, FaPlus, FaTrash, FaPlay, FaCheck, FaRocket,
  FaSave, FaTimes, FaCopy,
} from 'react-icons/fa';
import svc from '../../../services/videoStudioService';
import './AdminVideoStudio.css';

const CANALES = [
  { key: 'spoilers', label: 'Spoilers' },
  { key: 'libro-vs-pelicula', label: 'Libro vs Película' },
  { key: 'tiktok', label: 'TikTok' },
];

const STATUS_LABEL = {
  idea: 'Idea', guion: 'Guion', render_pending: 'En cola',
  rendering: 'Renderizando', rendered: 'Renderizado', approved: 'Aprobado',
  published: 'Publicado', error: 'Error',
};

function AdminVideoStudio() {
  const [canal, setCanal] = useState('spoilers');
  const [idioma, setIdioma] = useState('es');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tema, setTema] = useState('');
  const [generando, setGenerando] = useState(false);
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setVideos(await svc.getVideos({ canal }));
    } catch {
      toast.error('No se pudieron cargar los videos');
    } finally {
      setLoading(false);
    }
  }, [canal]);

  useEffect(() => { load(); }, [load]);

  const generar = async () => {
    if (!tema.trim()) { toast.warn('Escribe un tema'); return; }
    setGenerando(true);
    try {
      await svc.generateScript({ canal, idioma, tema: tema.trim() });
      toast.success('Guion generado con IA');
      setTema('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al generar (¿ANTHROPIC_API_KEY?)');
    } finally {
      setGenerando(false);
    }
  };

  const crearManual = async () => {
    try {
      const v = await svc.createVideo({ canal, idioma, titulo: 'Nuevo video' });
      toast.success('Video creado');
      setVideos((prev) => [v, ...prev]);
      abrirEditor(v);
    } catch {
      toast.error('Error al crear');
    }
  };

  const abrirEditor = (v) => {
    setEditId(v._id);
    setDraft({
      titulo: v.titulo || '',
      idioma: v.idioma || 'es',
      formato: v.formato || 'vertical',
      descripcion: v.descripcion || '',
      tags: (v.tags || []).join(', '),
      hashtags: (v.hashtags || []).join(' '),
      thumbnailPrompt: v.thumbnailPrompt || '',
      escenas: v.escenas?.length ? v.escenas : [{ narracion: '', imagen: '' }],
    });
  };

  const guardar = async () => {
    try {
      const payload = {
        ...draft,
        tags: draft.tags.split(',').map((s) => s.trim()).filter(Boolean),
        hashtags: draft.hashtags.split(/\s+/).map((s) => s.trim()).filter(Boolean),
        escenas: draft.escenas.filter((e) => e.narracion.trim()),
      };
      const v = await svc.updateVideo(editId, payload);
      toast.success('Guardado');
      setVideos((prev) => prev.map((x) => (x._id === v._id ? v : x)));
      setEditId(null); setDraft(null);
    } catch {
      toast.error('Error al guardar');
    }
  };

  const accion = async (fn, id, okMsg) => {
    try { await fn(id); toast.success(okMsg); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const eliminar = (id) => {
    if (!window.confirm('¿Eliminar este video?')) return;
    accion(svc.deleteVideo, id, 'Eliminado');
  };

  const marcarPublicado = async (id) => {
    const url = window.prompt('URL de publicación (YouTube/TikTok), opcional:') || '';
    accion((i) => svc.publishVideo(i, url), id, 'Marcado como publicado');
  };

  const copiarMeta = (v) => {
    const txt = `${v.titulo}\n\n${v.descripcion}\n\n${(v.hashtags || []).join(' ')}\n\nTags: ${(v.tags || []).join(', ')}`;
    navigator.clipboard.writeText(txt);
    toast.success('Metadata copiada');
  };

  const setEscena = (i, campo, val) => {
    setDraft((d) => {
      const escenas = [...d.escenas];
      escenas[i] = { ...escenas[i], [campo]: val };
      return { ...d, escenas };
    });
  };

  return (
    <div className="avs">
      <div className="avs-head">
        <h2>🎬 Estudio de Video</h2>
        <div className="avs-canales">
          {CANALES.map((c) => (
            <button
              key={c.key}
              className={`avs-tab ${canal === c.key ? 'on' : ''}`}
              onClick={() => setCanal(c.key)}
            >{c.label}</button>
          ))}
        </div>
        <button className="avs-icon" onClick={load} title="Refrescar">
          <FaSync className={loading ? 'spin' : ''} />
        </button>
      </div>

      <div className="avs-gen">
        <select value={idioma} onChange={(e) => setIdioma(e.target.value)}>
          <option value="es">Español</option>
          <option value="en">Inglés</option>
        </select>
        <input
          placeholder="Tema del video (ej. 'el final de Attack on Titan')"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generar()}
        />
        <button className="avs-btn primary" onClick={generar} disabled={generando}>
          <FaMagic /> {generando ? 'Generando…' : 'Generar con IA'}
        </button>
        <button className="avs-btn" onClick={crearManual}>
          <FaPlus /> Manual
        </button>
      </div>

      {loading && <p className="avs-muted">Cargando…</p>}
      {!loading && !videos.length && (
        <p className="avs-muted">Sin videos en este canal. Genera uno con IA arriba.</p>
      )}

      <div className="avs-list">
        {videos.map((v) => (
          <div key={v._id} className={`avs-card st-${v.status}`}>
            <div className="avs-card-top">
              <span className={`avs-badge st-${v.status}`}>{STATUS_LABEL[v.status] || v.status}</span>
              <span className="avs-meta">{v.idioma.toUpperCase()} · {v.formato} · {v.escenas?.length || 0} escenas</span>
            </div>
            <h4>{v.titulo || '(sin título)'}</h4>

            {v.videoUrl && (
              <video className="avs-video" src={v.videoUrl} controls preload="metadata" />
            )}
            {v.status === 'error' && <p className="avs-error">⚠ {v.error}</p>}

            <div className="avs-actions">
              {['idea', 'guion', 'error'].includes(v.status) && (
                <>
                  <button className="avs-btn sm" onClick={() => abrirEditor(v)}>Editar</button>
                  <button className="avs-btn sm primary" onClick={() => accion(svc.enqueueRender, v._id, 'Enviado a render')}>
                    <FaPlay /> Render
                  </button>
                </>
              )}
              {v.status === 'rendered' && (
                <button className="avs-btn sm ok" onClick={() => accion(svc.approveVideo, v._id, 'Aprobado')}>
                  <FaCheck /> Aprobar
                </button>
              )}
              {['rendered', 'approved', 'published'].includes(v.status) && (
                <button className="avs-btn sm" onClick={() => copiarMeta(v)}><FaCopy /> Metadata</button>
              )}
              {v.status === 'approved' && (
                <button className="avs-btn sm primary" onClick={() => marcarPublicado(v._id)}>
                  <FaRocket /> Publicado
                </button>
              )}
              {v.publishedUrl && (
                <a className="avs-btn sm" href={v.publishedUrl} target="_blank" rel="noreferrer">Ver publicado</a>
              )}
              <button className="avs-btn sm danger" onClick={() => eliminar(v._id)}><FaTrash /></button>
            </div>

            {editId === v._id && draft && (
              <div className="avs-editor">
                <label>Título
                  <input value={draft.titulo} onChange={(e) => setDraft({ ...draft, titulo: e.target.value })} />
                </label>
                <div className="avs-row">
                  <label>Idioma
                    <select value={draft.idioma} onChange={(e) => setDraft({ ...draft, idioma: e.target.value })}>
                      <option value="es">ES</option><option value="en">EN</option>
                    </select>
                  </label>
                  <label>Formato
                    <select value={draft.formato} onChange={(e) => setDraft({ ...draft, formato: e.target.value })}>
                      <option value="vertical">Vertical</option><option value="horizontal">Horizontal</option>
                    </select>
                  </label>
                </div>
                <label>Descripción
                  <textarea rows={2} value={draft.descripcion} onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })} />
                </label>
                <div className="avs-row">
                  <label>Tags (coma)
                    <input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
                  </label>
                  <label>Hashtags (espacio)
                    <input value={draft.hashtags} onChange={(e) => setDraft({ ...draft, hashtags: e.target.value })} />
                  </label>
                </div>
                <label>Prompt de miniatura
                  <input value={draft.thumbnailPrompt} onChange={(e) => setDraft({ ...draft, thumbnailPrompt: e.target.value })} />
                </label>

                <div className="avs-escenas">
                  <strong>Escenas</strong>
                  {draft.escenas.map((es, i) => (
                    <div key={i} className="avs-escena">
                      <span className="avs-num">{i + 1}</span>
                      <textarea rows={2} placeholder="Narración (lo que dice la voz)"
                        value={es.narracion} onChange={(e) => setEscena(i, 'narracion', e.target.value)} />
                      <textarea rows={2} placeholder="Prompt de imagen IA (inglés)"
                        value={es.imagen} onChange={(e) => setEscena(i, 'imagen', e.target.value)} />
                      <button className="avs-btn sm danger" onClick={() =>
                        setDraft((d) => ({ ...d, escenas: d.escenas.filter((_, j) => j !== i) }))}>×</button>
                    </div>
                  ))}
                  <button className="avs-btn sm" onClick={() =>
                    setDraft((d) => ({ ...d, escenas: [...d.escenas, { narracion: '', imagen: '' }] }))}>
                    <FaPlus /> Escena
                  </button>
                </div>

                <div className="avs-editor-actions">
                  <button className="avs-btn primary" onClick={guardar}><FaSave /> Guardar</button>
                  <button className="avs-btn" onClick={() => { setEditId(null); setDraft(null); }}><FaTimes /> Cerrar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminVideoStudio;
