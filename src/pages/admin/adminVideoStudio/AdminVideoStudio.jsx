import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  FaSync, FaMagic, FaPlus, FaTrash, FaCheck, FaRocket,
  FaSave, FaTimes, FaCopy, FaToggleOn, FaToggleOff,
} from 'react-icons/fa';
import svc from '../../../services/videoStudioService';
import './AdminVideoStudio.css';

const ESTADO_LABEL = {
  idea: 'Idea', guion_listo: 'Guion listo', aprobado: 'Aprobado',
  renderizando: 'Renderizando', render_ok: 'Renderizado',
  publicado: 'Publicado', error: 'Error',
};

const canalNombre = (c) => (c ? `${c.marca} · ${c.plataforma} · ${c.idioma}` : '—');

function AdminVideoStudio() {
  const [canales, setCanales] = useState([]);
  const [filtro, setFiltro] = useState(null);   // canal_id o null = todos
  const [genCanal, setGenCanal] = useState('');  // canal_id para generar
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tema, setTema] = useState('');
  const [generando, setGenerando] = useState(false);
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(null);

  const cargarCanales = useCallback(async () => {
    try {
      const cs = await svc.getChannels();
      setCanales(cs);
      if (cs.length && !genCanal) setGenCanal(String(cs[0].id));
    } catch {
      toast.error('No se pudieron cargar los destinos (¿SUPABASE_SERVICE_ROLE_KEY?)');
    }
  }, [genCanal]);

  const cargarItems = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await svc.getVideos(filtro ? { canal_id: filtro } : {}));
    } catch {
      toast.error('No se pudo cargar la cola de contenido');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => { cargarCanales(); }, [cargarCanales]);
  useEffect(() => { cargarItems(); }, [cargarItems]);

  const toggleCanal = async (c) => {
    try {
      const upd = await svc.updateChannel(c.id, { activo: !c.activo });
      setCanales((prev) => prev.map((x) => (x.id === upd.id ? { ...x, activo: upd.activo } : x)));
      toast.success(`${canalNombre(c)} ${upd.activo ? 'ENCENDIDO' : 'apagado'}`);
    } catch {
      toast.error('No se pudo cambiar el canal');
    }
  };

  const generar = async () => {
    if (!genCanal) { toast.warn('Elige un destino'); return; }
    if (!tema.trim()) { toast.warn('Escribe un tema'); return; }
    setGenerando(true);
    try {
      await svc.generateScript({ canal_id: Number(genCanal), tema: tema.trim() });
      toast.success('Guion generado con IA');
      setTema('');
      cargarItems();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al generar (¿ANTHROPIC_API_KEY?)');
    } finally {
      setGenerando(false);
    }
  };

  const crearManual = async () => {
    if (!genCanal) { toast.warn('Elige un destino'); return; }
    try {
      const v = await svc.createVideo({ canal_id: Number(genCanal) });
      toast.success('Pieza creada');
      cargarItems();
      abrirEditor(v);
    } catch {
      toast.error('Error al crear');
    }
  };

  const abrirEditor = (v) => {
    setEditId(v.id);
    setDraft({
      tema: v.tema || '',
      guion: v.guion || '',
      programado_para: v.programado_para ? v.programado_para.slice(0, 16) : '',
    });
  };

  const guardar = async () => {
    try {
      const payload = {
        tema: draft.tema,
        guion: draft.guion,
        programado_para: draft.programado_para || null,
      };
      // si tenía idea y ahora hay guion, súbelo a guion_listo
      const actual = items.find((x) => x.id === editId);
      if (actual && actual.estado === 'idea' && draft.guion.trim()) payload.estado = 'guion_listo';
      await svc.updateVideo(editId, payload);
      toast.success('Guardado');
      setEditId(null); setDraft(null);
      cargarItems();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const accion = async (fn, id, okMsg) => {
    try { await fn(id); toast.success(okMsg); cargarItems(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const eliminar = (id) => {
    if (!window.confirm('¿Eliminar esta pieza?')) return;
    accion(svc.deleteVideo, id, 'Eliminada');
  };

  const copiar = (v) => {
    navigator.clipboard.writeText(v.guion || '');
    toast.success('Guion copiado');
  };

  const activos = canales.filter((c) => c.activo).length;

  return (
    <div className="avs">
      <div className="avs-head">
        <h2>🎬 Estudio de Contenido</h2>
        <button className="avs-icon" onClick={() => { cargarCanales(); cargarItems(); }} title="Refrescar">
          <FaSync className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* ── Destinos (13 canales) ── */}
      <div className="avs-section-title">
        Destinos <span className="avs-muted">({activos} de {canales.length} encendidos)</span>
      </div>
      <div className="avs-canal-grid">
        <button
          className={`avs-canal-chip ${filtro === null ? 'sel' : ''}`}
          onClick={() => setFiltro(null)}
        >Todos</button>
        {canales.map((c) => (
          <div key={c.id} className={`avs-canal-chip ${filtro === c.id ? 'sel' : ''} ${c.activo ? 'on' : 'off'}`}>
            <button className="avs-canal-name" onClick={() => setFiltro(c.id)}>
              <strong>{c.marca}</strong>
              <span>{c.plataforma} · {c.idioma}</span>
            </button>
            <button
              className={`avs-sw ${c.activo ? 'on' : ''}`}
              onClick={() => toggleCanal(c)}
              title={c.activo ? 'Encendido (publica)' : 'Apagado'}
            >
              {c.activo ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </div>
        ))}
      </div>

      {/* ── Generar / crear ── */}
      <div className="avs-gen">
        <select value={genCanal} onChange={(e) => setGenCanal(e.target.value)}>
          {canales.map((c) => (
            <option key={c.id} value={c.id}>{canalNombre(c)}</option>
          ))}
        </select>
        <input
          placeholder="Tema (ej. 'el final de Attack on Titan')"
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
      {!loading && !items.length && (
        <p className="avs-muted">Sin piezas todavía. Genera una con IA arriba.</p>
      )}

      {/* ── Cola de contenido ── */}
      <div className="avs-list">
        {items.map((v) => (
          <div key={v.id} className={`avs-card st-${v.estado}`}>
            <div className="avs-card-top">
              <span className={`avs-badge st-${v.estado}`}>{ESTADO_LABEL[v.estado] || v.estado}</span>
              <span className="avs-meta">{canalNombre(v.canal)}</span>
            </div>
            <h4>{v.tema || '(sin tema)'}</h4>

            {v.guion && editId !== v.id && (
              <p className="avs-guion">{v.guion.length > 220 ? `${v.guion.slice(0, 220)}…` : v.guion}</p>
            )}
            {v.ruta_mp4 && (
              <video className="avs-video" src={v.ruta_mp4} controls preload="metadata" />
            )}
            {v.estado === 'error' && v.error && <p className="avs-error">⚠ {v.error}</p>}

            <div className="avs-actions">
              {['idea', 'guion_listo', 'error'].includes(v.estado) && (
                <button className="avs-btn sm" onClick={() => abrirEditor(v)}>Editar</button>
              )}
              {['guion_listo', 'error'].includes(v.estado) && v.guion && (
                <button className="avs-btn sm primary" onClick={() => accion(svc.approveVideo, v.id, 'Aprobado → a la cola de render')}>
                  <FaCheck /> Aprobar
                </button>
              )}
              {v.estado === 'aprobado' && <span className="avs-hint">⏳ En cola de render</span>}
              {v.estado === 'renderizando' && <span className="avs-hint">🎞️ Renderizando…</span>}
              {v.guion && (
                <button className="avs-btn sm" onClick={() => copiar(v)}><FaCopy /> Guion</button>
              )}
              {v.estado === 'render_ok' && (
                <button className="avs-btn sm primary" onClick={() => accion(svc.publishVideo, v.id, 'Marcado como publicado')}>
                  <FaRocket /> Publicado
                </button>
              )}
              <button className="avs-btn sm danger" onClick={() => eliminar(v.id)}><FaTrash /></button>
            </div>

            {editId === v.id && draft && (
              <div className="avs-editor">
                <label>Tema
                  <input value={draft.tema} onChange={(e) => setDraft({ ...draft, tema: e.target.value })} />
                </label>
                <label>Guion (lo que dice la voz)
                  <textarea rows={8} value={draft.guion}
                    onChange={(e) => setDraft({ ...draft, guion: e.target.value })} />
                </label>
                <label>Programar para (opcional)
                  <input type="datetime-local" value={draft.programado_para}
                    onChange={(e) => setDraft({ ...draft, programado_para: e.target.value })} />
                </label>
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
