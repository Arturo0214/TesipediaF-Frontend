import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  FaMagic, FaSyncAlt, FaGlobe, FaEyeSlash, FaTrash, FaExternalLinkAlt, FaBookOpen,
} from 'react-icons/fa';
import contentGuideService from '../../../services/contentGuideService';
import './AdminContent.css';

const money = (n) =>
  n == null ? '—' : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

function AdminContent() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setGuides(await contentGuideService.list()); }
    catch { toast.error('No se pudieron cargar las guías'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generar = async () => {
    setBusy(true);
    try {
      const r = await contentGuideService.generate();
      toast.success(`${r.creadas} creadas · ${r.actualizadas} actualizadas · ${r.omitidas} omitidas (pocas ventas)`);
      await load();
    } catch { toast.error('Error al generar guías'); }
    finally { setBusy(false); }
  };

  const togglePublish = async (g) => {
    try {
      await contentGuideService.publish(g._id, g.status !== 'published');
      toast.success(g.status === 'published' ? 'Despublicada' : 'Publicada — ya aparece en su landing');
      await load();
    } catch { toast.error('Error al cambiar publicación'); }
  };

  const eliminar = async (g) => {
    if (!window.confirm(`¿Eliminar la guía de ${g.carrera}?`)) return;
    try { await contentGuideService.remove(g._id); await load(); }
    catch { toast.error('Error al eliminar'); }
  };

  const publicadas = guides.filter((g) => g.status === 'published').length;

  return (
    <div className="ac-page">
      <div className="ac-header">
        <div>
          <h2><FaBookOpen /> Contenido · Loop SEO</h2>
          <p className="ac-sub">
            Cada carrera con trabajo vendido genera una guía anonimizada que alimenta su landing programática.
            {' '}<strong>{publicadas}</strong> publicadas de {guides.length}.
          </p>
        </div>
        <div className="ac-actions">
          <button className="ac-btn" onClick={load} disabled={loading}><FaSyncAlt className={loading ? 'ac-spin' : ''} /></button>
          <button className="ac-btn ac-btn--primary" onClick={generar} disabled={busy}>
            <FaMagic className={busy ? 'ac-spin' : ''} /> Generar desde ventas
          </button>
        </div>
      </div>

      {loading && !guides.length ? (
        <div className="ac-loading">Cargando guías…</div>
      ) : !guides.length ? (
        <div className="ac-empty">
          Aún no hay guías. Pulsa <strong>Generar desde ventas</strong> para crear un borrador por cada carrera con 3+ trabajos vendidos.
        </div>
      ) : (
        <div className="ac-list">
          {guides.map((g) => (
            <div className={`ac-card ${g.status === 'published' ? 'ac-card--pub' : ''}`} key={g._id}>
              <div className="ac-card__main">
                <div className="ac-card__top">
                  <span className="ac-carrera">{g.carrera}</span>
                  <span className={`ac-badge ac-badge--${g.status}`}>
                    {g.status === 'published' ? 'Publicada' : 'Borrador'}
                  </span>
                </div>
                <div className="ac-card__title">{g.title}</div>
                <div className="ac-card__meta">
                  <span>{g.stats?.quotesVendidas ?? 0} vendidas</span>
                  <span>·</span>
                  <span>ticket {money(g.stats?.ticketMediana)}</span>
                  <span>·</span>
                  <span>{g.sections?.length || 0} secciones · {g.faqs?.length || 0} FAQs</span>
                </div>
              </div>
              <div className="ac-card__side">
                <a className="ac-link" href={`/${g.slug}`} target="_blank" rel="noopener noreferrer" title="Ver landing">
                  <FaExternalLinkAlt /> /{g.slug}
                </a>
                <div className="ac-card__btns">
                  <button className={`ac-toggle ${g.status === 'published' ? 'is-pub' : ''}`} onClick={() => togglePublish(g)}>
                    {g.status === 'published' ? <><FaEyeSlash /> Despublicar</> : <><FaGlobe /> Publicar</>}
                  </button>
                  <button className="ac-del" onClick={() => eliminar(g)} title="Eliminar"><FaTrash /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminContent;
