import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  FaSync, FaCheck, FaTimes, FaSave, FaChevronLeft, FaChevronRight,
  FaCalendarAlt, FaThLarge, FaListUl, FaImage, FaInstagram, FaFacebookF, FaTiktok, FaLinkedin,
  FaCloudUploadAlt, FaRegClock, FaChartLine, FaPaperPlane, FaTrashAlt,
  FaChartBar, FaHeart, FaComment, FaShareAlt, FaUsers,
  FaPlus, FaExclamationTriangle, FaNewspaper, FaEye,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import svc from '../../../services/videoStudioService';
import axiosWithAuth from '../../../utils/axioswithAuth';
import './EstudioRedes.css';

const FORMATO_COLOR = {
  FRASE: '#123661', DICCIONARIO: '#5b6b86', CARRUSEL: '#D4A438', CHECKLIST: '#1F7A5E',
  COMPARATIVA: '#B23A4E', PRUEBA: '#1B4372', OFERTA: '#c78a12', VIDEO: '#7C3AED',
};
const FORMATOS = ['FRASE', 'CARRUSEL', 'CHECKLIST', 'COMPARATIVA', 'DICCIONARIO', 'PRUEBA', 'OFERTA', 'VIDEO'];
const EST = {
  borrador: { lbl: 'Borrador', c: '#9ca3af' },
  programado: { lbl: 'Programado', c: '#1d4ed8' },
  publicado: { lbl: 'Publicado', c: '#15803d' },
  error: { lbl: 'Error', c: '#c0392b' },
};
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const PLAT_ICON = { ig: FaInstagram, fb: FaFacebookF, tiktok: FaTiktok, linkedin: FaLinkedin, x: FaXTwitter };
// Canales de la barra (multi-select). fb/ig/linkedin publican de verdad; tiktok/x = filtro/planeación.
const CANALES = [
  { id: 'fb', lbl: 'Facebook', c: '#1877F2', Icon: FaFacebookF, publica: true },
  { id: 'ig', lbl: 'Instagram', c: '#DD2A7B', Icon: FaInstagram, publica: true },
  { id: 'linkedin', lbl: 'LinkedIn', c: '#0A66C2', Icon: FaLinkedin, publica: true },
  { id: 'tiktok', lbl: 'TikTok', c: '#e5e7eb', Icon: FaTiktok, publica: false },
  { id: 'x', lbl: 'X', c: '#e5e7eb', Icon: FaXTwitter, publica: false },
];
const CANAL_IDS = CANALES.map((c) => c.id);
// Horas recomendadas (hora CDMX) por tipo de contenido, según cuándo hay más alcance.
// Reels/video: tarde-noche (scroll de ocio). Publicaciones (carrusel/frase/imagen): mañana, comida y noche.
const HORAS_RECO = {
  reel: [
    { h: '14:00', t: 'sobremesa' }, { h: '19:00', t: 'pico tarde' },
    { h: '20:00', t: 'prime time' }, { h: '21:00', t: 'scroll noche' }, { h: '22:00', t: 'noche' },
  ],
  post: [
    { h: '08:00', t: 'camino/mañana' }, { h: '12:00', t: 'mediodía' },
    { h: '14:00', t: 'comida' }, { h: '19:00', t: 'tarde' }, { h: '20:00', t: 'prime time' },
  ],
};
const esReel = (fmt) => fmt === 'VIDEO';
const MARCAS = [
  { id: 'Tesipedia', c: '#E0B23C' },
  { id: 'Contratado', c: '#3B82F6' },
  { id: 'FSC', c: '#16A34A' },
  { id: 'Enlace468', c: '#00A99D' },
  { id: 'Spoilers', c: '#A855F7' },
  { id: 'Libro vs Película', c: '#EF4444' },
];

// Fuerza mp4/h264 en URLs de video de Cloudinary para que el navegador SIEMPRE pueda
// reproducirlas (los .mov/HEVC de iPhone/Mac no cargan en Chrome). También arregla videos
// ya subidos con la URL original, sin tener que resubirlos.
const playableVideo = (url) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return url;
  if (url.includes('/upload/f_') || url.includes('/upload/vc_')) return url; // ya transformada
  return url
    .replace('/video/upload/', '/video/upload/f_mp4,vc_h264,ac_aac/')
    .replace(/\.(mov|m4v|avi|mkv|webm|mpeg|mpg|3gp|hevc)$/i, '.mp4');
};

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ── Guías de recorte para redes ─────────────────────────────
// IG/TikTok llenan (cover) la imagen al lienzo del formato destino y recortan el excedente.
// Con esto avisamos ANTES de publicar qué parte se pierde y mostramos las zonas seguras.
const RATIOS = {
  '9:16': { w: 9, h: 16, lbl: 'Reel / Historia / TikTok' },
  '4:5': { w: 4, h: 5, lbl: 'Feed vertical' },
  '1:1': { w: 1, h: 1, lbl: 'Cuadrado' },
};
// Zonas que IG tapa con su interfaz en Historias/Reels (arriba: barra+usuario; abajo: caption+acciones).
const SAFE = { top: 0.14, bottom: 0.20 };
// A qué lienzo publica cada plataforma una imagen estática (para avisar de recortes al publicar).
const PLAT_FMT = { ig: '4:5', fb: '4:5', linkedin: '4:5', tiktok: '9:16' };
const medirImagen = (url) => new Promise((res) => {
  const im = new Image();
  im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight });
  im.onerror = () => res(null);
  im.src = url;
});

// ── Diagnóstico de desempeño: qué se hace bien / mal, a partir de las métricas REALES ──
function analizarDesempeno(piezas, metrics) {
  const eng = (p) => (p.reacciones || 0) + (p.comentarios || 0);
  const con = (piezas || []).filter((p) => p.reacciones != null || p.vistas != null);
  if (!con.length) return null;
  const followers = metrics?.instagram?.followers || 0;
  const avgEng = con.reduce((s, p) => s + eng(p), 0) / con.length;
  const engRate = followers ? (avgEng / followers) * 100 : null;

  const grupo = (key) => {
    const m = {};
    con.forEach((p) => { const k = key(p); if (k == null) return; (m[k] = m[k] || []).push(eng(p)); });
    return Object.entries(m).map(([k, arr]) => ({ k, n: arr.length, avg: arr.reduce((a, b) => a + b, 0) / arr.length })).sort((a, b) => b.avg - a.avg);
  };
  const porFormato = grupo((p) => p.formato);
  const porHora = grupo((p) => (p.fecha ? new Date(p.fecha).getHours() : null));
  const mejorFmt = porFormato[0];
  const peorFmt = porFormato.length > 1 ? porFormato[porFormato.length - 1] : null;
  const mejorHora = porHora[0];

  const reels = con.filter((p) => p.formato === 'VIDEO');
  const estat = con.filter((p) => p.formato !== 'VIDEO');
  const prom = (arr) => (arr.length ? arr.reduce((s, p) => s + eng(p), 0) / arr.length : null);
  const avgReels = prom(reels); const avgEstat = prom(estat);

  const ahora = Date.now();
  const ult14 = con.filter((p) => p.fecha && (ahora - new Date(p.fecha).getTime()) < 14 * 864e5).length;
  const orden = [...con].sort((a, b) => eng(b) - eng(a));
  const top = orden[0]; const flop = orden[orden.length - 1];

  const aciertos = []; const mejoras = []; const recomendaciones = [];
  if (engRate != null) {
    if (engRate >= 2) aciertos.push(`Interacción sana: ~${engRate.toFixed(1)}% de tus seguidores reacciona (bueno ≥2%).`);
    else if (engRate < 1) mejoras.push(`Interacción baja (~${engRate.toFixed(1)}%, meta ≥2%): mejora el gancho y agrega un CTA claro.`);
  }
  if (mejorFmt) aciertos.push(`Formato estrella: ${mejorFmt.k} (${Math.round(mejorFmt.avg)} interacciones/post en promedio).`);
  if (peorFmt && peorFmt.k !== mejorFmt?.k) mejoras.push(`${peorFmt.k} rinde poco (${Math.round(peorFmt.avg)}/post): publícalo menos o reinvéntalo.`);
  if (mejorHora) recomendaciones.push(`Tu mejor hora hasta ahora ≈ ${String(mejorHora.k).padStart(2, '0')}:00 h — concentra ahí.`);
  if (avgReels != null && avgEstat != null) {
    if (avgReels > avgEstat * 1.3) aciertos.push(`Los reels jalan más que los estáticos (${Math.round(avgReels)} vs ${Math.round(avgEstat)}): sube más video.`);
    else if (avgEstat > avgReels * 1.3) recomendaciones.push(`Tus estáticos rinden más que los reels; equilibra el mix.`);
  }
  if (ult14 < 3) mejoras.push(`Poca frecuencia: ${ult14} publicaciones en 14 días. Apunta a 3–4/semana para crecer alcance.`);
  else aciertos.push(`Buena constancia: ${ult14} publicaciones en las últimas 2 semanas.`);

  return { n: con.length, avgEng: Math.round(avgEng), engRate, followers, mejorFmt, peorFmt, mejorHora, avgReels, avgEstat, ult14, top, flop, porFormato, aciertos, mejoras, recomendaciones };
}

function analizarRecorte(natW, natH, key) {
  if (!natW || !natH) return null;
  const t = RATIOS[key]; const rt = t.w / t.h; const r = natW / natH;
  let cropX = 0, cropY = 0;                    // fracción recortada por CADA lado (0–0.5)
  if (r > rt + 0.002) cropX = (1 - rt / r) / 2;      // imagen más ancha → corta izq/der
  else if (r < rt - 0.002) cropY = (1 - r / rt) / 2; // imagen más alta → corta arriba/abajo
  const perdida = 1 - (1 - 2 * cropX) * (1 - 2 * cropY);
  return { rt, r, cropX, cropY, perdida, corta: perdida > 0.01 };
}

export default function EstudioRedes() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('calendario');     // calendario | grid | lista
  const [fMarca, setFMarca] = useState('Tesipedia');   // abre por marca (no mezcla); "Todas" es opt-in
  const [fEstado, setFEstado] = useState(null);
  const [fFormato, setFFormato] = useState(null);
  const [fCanales, setFCanales] = useState(CANAL_IDS);   // redes seleccionadas (multi); default todas
  const [modoNoticias, setModoNoticias] = useState(false); // vista Noticias/Artículos
  const [mesRef, setMesRef] = useState(null);           // Date del mes visible
  const [abierta, setAbierta] = useState(null);         // pieza en el composer
  const [imgIdx, setImgIdx] = useState(0);
  const [imgDims, setImgDims] = useState(null);       // { w, h } naturales de la imagen visible
  const [guiaFmt, setGuiaFmt] = useState('9:16');     // formato destino para las guías de recorte
  const [guiasOn, setGuiasOn] = useState(true);       // mostrar/ocultar guías sobre la imagen
  const [draft, setDraft] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [sug, setSug] = useState(null);
  const [cargandoSug, setCargandoSug] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
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
  // Rendimiento de NUESTRAS piezas publicadas (preview + vistas + reacciones reales)
  const [rendPiezas, setRendPiezas] = useState(null);
  const [rendPiezasLoad, setRendPiezasLoad] = useState(false);
  const cargarRendPiezas = useCallback(async (mk) => {
    setRendPiezasLoad(true);
    try { setRendPiezas(await svc.getRendimientoPiezas(mk)); }
    catch { setRendPiezas({ piezas: [] }); }
    finally { setRendPiezasLoad(false); }
  }, []);
  useEffect(() => { if (vista === 'rendimiento' && !modoNoticias) cargarRendPiezas(fMarca); }, [vista, fMarca]); // eslint-disable-line
  const diag = useMemo(() => analizarDesempeno(rendPiezas?.piezas, rend?.metrics), [rendPiezas, rend]);
  // Análisis con IA (opt-in, económico)
  const [diagIA, setDiagIA] = useState(null);
  const [diagIALoad, setDiagIALoad] = useState(false);
  useEffect(() => { setDiagIA(null); }, [fMarca]);
  const analizarIA = async () => {
    setDiagIALoad(true);
    try { setDiagIA(await svc.diagnosticoIA(fMarca)); }
    catch { toast.error('No se pudo generar el análisis con IA'); }
    finally { setDiagIALoad(false); }
  };

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

  // redes de una pieza (por defecto ig+fb si no trae plataformas)
  const platsDe = (p) => (p.plataformas && p.plataformas.length ? p.plataformas : ['ig', 'fb']);
  const enCanal = (p) => fCanales.length === CANAL_IDS.length || platsDe(p).some((pl) => fCanales.includes(pl));
  const toggleCanal = (id) => setFCanales((cur) =>
    cur.includes(id) ? (cur.length === 1 ? cur : cur.filter((x) => x !== id)) : [...cur, id]);
  const filtrados = base.filter((p) =>
    (!fEstado || p.estado === fEstado) && (!fFormato || p.formato === fFormato) && enCanal(p));
  const formatos = [...new Set(base.map((p) => p.formato))];

  // ── validación de una pieza (para avisos en la cuadrícula) ──
  const avisos = (p) => {
    const out = [];
    if (!(p.imagenes || []).length && !p.video_url) out.push(p.formato === 'VIDEO' ? 'Falta video' : 'Falta imagen');
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
      const platsDefault = fCanales.filter((id) => CANALES.find((c) => c.id === id)?.publica);
      const row = await svc.createSocial({ fecha, marca: fMarca || 'Tesipedia', plataformas: platsDefault });
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
  // Revisa cada imagen contra el lienzo de cada plataforma destino y devuelve los recortes fuertes.
  const revisarRecortes = async () => {
    if (abierta.video_url) return [];                       // los reels/videos ya son 9:16
    const plats = abierta.plataformas || [];
    const fmts = [...new Set(plats.map((p) => PLAT_FMT[p]).filter(Boolean))];
    const imgs = abierta.imagenes || [];
    if (!fmts.length || !imgs.length) return [];
    const warns = [];
    for (let i = 0; i < imgs.length; i++) {
      const dim = await medirImagen(imgs[i]);
      if (!dim) continue;
      for (const f of fmts) {
        const a = analizarRecorte(dim.w, dim.h, f);
        if (a?.corta) warns.push({ idx: i + 1, fmt: f, perdida: Math.round(a.perdida * 100), plats: plats.filter((p) => PLAT_FMT[p] === f) });
      }
    }
    return warns;
  };
  const publicar = async () => {
    const warns = await revisarRecortes();
    if (warns.length) {
      const detalle = warns.map((w) => `• Imagen ${w.idx} se recorta ~${w.perdida}% en ${w.fmt} (${w.plats.map((p) => p.toUpperCase()).join(', ')})`).join('\n');
      if (!window.confirm(`⚠️ Ojo: algunas imágenes se RECORTARÁN al publicar:\n\n${detalle}\n\nRevisa las guías de recorte en el visor. ¿Publicar de todos modos?`)) return;
    } else if (!window.confirm('¿Publicar esta pieza AHORA en las redes seleccionadas?')) return;
    setPublicando(true);
    try { refrescarPieza(await svc.publishSocial(abierta.id)); toast.success('¡Publicada!'); }
    catch (e) { toast.error(e.response?.data?.message || 'No se pudo publicar'); }
    finally { setPublicando(false); }
  };
  const eliminar = async () => {
    if (!window.confirm('¿Eliminar esta publicación? Si ya está publicada en Facebook, se intentará borrar también de la página.')) return;
    try { await svc.deleteSocial(abierta.id); setPosts((prev) => prev.filter((x) => x.id !== abierta.id)); setAbierta(null); setDraft(null); toast.success('Eliminada'); }
    catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Error al eliminar'); }
  };
  const sugerir = async () => {
    setCargandoSug(true);
    try { setSug(await svc.sugerenciasSocial(abierta.id)); }
    catch { toast.error('No se pudieron traer sugerencias'); }
    finally { setCargandoSug(false); }
  };
  const addTag = (tag) => setDraft((d) => ({ ...d, hashtags: `${d.hashtags || ''} ${tag}`.trim() }));
  const togglePlat = (pl) => setDraft((d) => {
    const cur = d?.plataformas || [];
    return { ...d, plataformas: cur.includes(pl) ? cur.filter((x) => x !== pl) : [...cur, pl] };
  });
  const abrir = (p) => {
    setAbierta(p); setImgIdx(0); setSug(null);
    setDraft({ titular: p.titular || '', copy: p.copy || '', hashtags: p.hashtags || '', cta: p.cta || '', formato: p.formato || 'CARRUSEL', video_url: p.video_url || '', hora: (p.hora || '10:00').slice(0, 5), plataformas: p.plataformas || ['ig', 'fb'] });
  };
  const subirImagen = async (file, index = imgIdx) => {
    if (!file || !abierta) return;
    setSubiendo(true);
    const total = (abierta.imagenes || []).length;
    const esAgregar = index >= total;
    try {
      const row = await svc.uploadSocialImage(abierta.id, file, index);
      refrescarPieza(row);
      if (esAgregar) setImgIdx((row.imagenes || []).length - 1);
      toast.success(esAgregar ? 'Imagen agregada al carrusel' : 'Imagen reemplazada');
    }
    catch { toast.error('No se pudo subir la imagen'); }
    finally { setSubiendo(false); if (fileRef.current) fileRef.current.value = ''; }
  };
  const reemplazar = (e) => subirImagen(e.target.files?.[0], imgIdx);
  const subirVideo = async (file) => {
    if (!file || !abierta) return;
    if (!file.type.startsWith('video/')) { toast.error('Ese archivo no es un video'); return; }
    setSubiendo(true);
    try {
      const row = await svc.uploadSocialVideo(abierta.id, file);
      refrescarPieza(row);
      setDraft((d) => ({ ...(d || {}), formato: 'VIDEO', video_url: row.video_url }));
      toast.success('Video subido');
    } catch (e) { toast.error(e?.response?.data?.error || 'No se pudo subir el video'); }
    finally { setSubiendo(false); if (videoRef.current) videoRef.current.value = ''; }
  };
  const [dropSlot, setDropSlot] = useState(null);   // índice del slot vacío con drag encima
  const fileFrom = (e) => { const f = e.dataTransfer?.files?.[0]; return f && f.type.startsWith('image/') ? f : null; };
  const videoFrom = (e) => { const f = e.dataTransfer?.files?.[0]; return f && f.type.startsWith('video/') ? f : null; };
  const onDropImagen = (e) => {                       // soltar sobre el visor = reemplaza la lámina actual (o crea la 1ª)
    e.preventDefault(); setDragOver(false);
    const vid = videoFrom(e); if (vid) { subirVideo(vid); return; }  // si sueltan un video, se sube como reel
    const file = fileFrom(e); if (!file) return;
    const total = (abierta.imagenes || []).length;
    if (!total) { subirImagen(file, 0); return; }
    subirImagen(file, imgIdx);
  };
  const onDropSlotVacio = (e) => {                    // soltar sobre un espacio vacío = agrega lámina nueva
    e.preventDefault(); setDropSlot(null);
    const file = fileFrom(e); if (!file) return;
    subirImagen(file, (abierta.imagenes || []).length);
  };
  const onDropThumb = (e, i) => {                      // soltar sobre una miniatura existente = reemplaza esa
    e.preventDefault(); setDropSlot(null);
    const file = fileFrom(e); if (!file) return;
    subirImagen(file, i);
  };

  // Al cambiar la lámina visible (o la pieza), olvidamos las medidas para no analizar con datos viejos.
  useEffect(() => { setImgDims(null); }, [imgIdx, abierta?.id]);
  const recorte = useMemo(() => analizarRecorte(imgDims?.w, imgDims?.h, guiaFmt), [imgDims, guiaFmt]);

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

      {/* Marcas (multi-página) — siempre UNA marca activa; cada marca ve solo su contenido */}
      <div className="er-marcas">
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

      {/* Barra de canales (multi-select) + Noticias */}
      <div className="er-canales">
        <span className="er-canales-lbl">Canales:</span>
        {CANALES.map((cn) => {
          const on = fCanales.includes(cn.id);
          return (
            <button key={cn.id} type="button" className={`er-canal pl-${cn.id} ${on ? 'on' : 'off'} ${modoNoticias ? 'dim' : ''}`}
              onClick={() => { setModoNoticias(false); toggleCanal(cn.id); }}
              title={cn.publica ? `${cn.lbl} · filtra y publica` : `${cn.lbl} · sólo filtro/planeación (no publica aún)`}>
              <cn.Icon /> {cn.lbl}{!cn.publica && <span className="er-canal-soft">·plan</span>}
            </button>
          );
        })}
        <span className="er-canales-sep" />
        <button type="button" className={`er-canal er-canal-news ${modoNoticias ? 'on' : ''}`}
          onClick={() => setModoNoticias((v) => !v)} title="Noticias y artículos SEO">
          <FaNewspaper /> Noticias/Artículos
        </button>
      </div>

      {modoNoticias && (
        <div className="er-noticias-wrap">
          <div className="er-noticias-soon">
            <FaNewspaper />
            <h3>Estudio de Noticias · {fMarca}</h3>
            <p>Generación de artículos SEO, aprobación y publicación. Se activa en la siguiente fase.</p>
          </div>
        </div>
      )}

      {/* KPIs + avance */}
      {!modoNoticias && <div className="er-kpis">
        <div className="er-kpi"><span className="er-kpi-n">{posts.length}</span><span className="er-kpi-l">Piezas</span></div>
        <div className="er-kpi"><span className="er-kpi-n" style={{ color: EST.programado.c }}>{kpi.programado || 0}</span><span className="er-kpi-l">Programadas</span></div>
        <div className="er-kpi"><span className="er-kpi-n" style={{ color: EST.publicado.c }}>{kpi.publicado || 0}</span><span className="er-kpi-l">Publicadas</span></div>
        <div className="er-kpi"><span className="er-kpi-n" style={{ color: EST.borrador.c }}>{kpi.borrador || 0}</span><span className="er-kpi-l">Borrador</span></div>
        <div className="er-kpi er-kpi-prox"><span className="er-kpi-n" style={{ color: '#D4A438' }}>{proximas}</span><span className="er-kpi-l">Próximas por salir</span></div>
        <div className="er-kpi er-avance">
          <div className="er-avance-top"><span>Avance del mes</span><b>{avance}%</b></div>
          <div className="er-avance-bar"><i style={{ width: `${avance}%` }} /></div>
        </div>
      </div>}

      {/* Controles: vista + filtros */}
      {!modoNoticias && <div className="er-controls">
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
      </div>}

      {!modoNoticias && loading && <p className="er-muted">Cargando contenido…</p>}
      {!modoNoticias && !loading && !posts.length && <p className="er-muted">No hay contenido cargado todavía.</p>}
      {!modoNoticias && !loading && posts.length > 0 && base.length === 0 && (
        <p className="er-muted">Aún no hay contenido para <b>{fMarca}</b>. Sus canales de Instagram/Facebook se llenarán cuando generes su contenido.</p>
      )}

      {/* ── CALENDARIO ── */}
      {!modoNoticias && !loading && vista === 'calendario' && base.length > 0 && (
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
      {!modoNoticias && !loading && vista === 'grid' && (() => {
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
            <p className="er-muted er-grid-tip">Hasta 4 publicaciones por día (las agregadas salen a las 17:00). Toca <b>+</b> para agregar y las flechas para cambiar de mes/año.</p>
            <div className="er-days-grid">
            {Array.from({ length: totalDias }, (_, i) => i + 1).map((dnum) => {
              const f = ymd(new Date(y, m, dnum));
              const dd = new Date(f + 'T12:00:00');
              const items = byDay[f] || [];
              return (
                <div key={f} className={`er-day-col ${f === hoy ? 'today' : ''}`}>
                  <div className="er-day-head">
                    <span className="er-day-num">{dnum}</span>
                    <span className="er-day-dow">{DOW[dd.getDay()]}</span>
                    {f === hoy && <span className="er-day-today">HOY</span>}
                    <span className="er-day-count">{items.length}{fMarca ? '/4' : ''}</span>
                    {fMarca && items.length < 4 && (
                      <button className="er-day-add" disabled={agregando === f} onClick={() => agregarPost(f)} title="Agregar publicación a este día">
                        {agregando === f ? <FaSync className="er-spin" /> : <FaPlus />}
                      </button>
                    )}
                  </div>
                  <div className="er-day-posts">
                    {items.map((p) => {
                      const avs = avisos(p);
                      return (
                        <button key={p.id} className="er-tile" onClick={() => abrir(p)}>
                          {(p.imagenes || [])[0]
                            ? <img src={(p.imagenes || [])[0]} alt={p.tema} loading="lazy" />
                            : <div className="er-tile-empty"><FaCloudUploadAlt /><span>Vacío</span></div>}
                          <span className="er-tile-badge" style={{ background: FORMATO_COLOR[p.formato] || '#4b5563' }}>{p.formato}</span>
                          {!fMarca && <span className="er-tile-marca" style={{ background: MARCAS.find((x) => x.id === marca(p))?.c || '#64748b' }}>{marca(p)}</span>}
                          <span className="er-tile-est" style={{ background: EST[p.estado]?.c }} />
                          {avs.length > 0 && <span className="er-tile-warn" title={avs.join(' · ')}><FaExclamationTriangle /> {avs.length}</span>}
                          {(p.imagenes || []).length > 1 && <span className="er-tile-multi"><FaImage /> {p.imagenes.length}</span>}
                          <span className="er-tile-info"><b>{p.tema}</b><span>{(p.hora || '').slice(0, 5)} · {p.slot}</span></span>
                        </button>
                      );
                    })}
                    {items.length === 0 && <div className="er-day-vacio">Sin publicaciones</div>}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        );
      })()}

      {/* ── LISTA ── */}
      {!modoNoticias && !loading && vista === 'lista' && (
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
      {!modoNoticias && !loading && vista === 'rendimiento' && (
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

                {diag && (
                  <div className="er-diag">
                    <div className="er-diag-head">
                      <h3 className="er-rend-title"><FaChartBar /> Diagnóstico · qué haces bien y qué mejorar</h3>
                      <button className="er-diag-ia-btn" onClick={analizarIA} disabled={diagIALoad}>
                        <FaChartLine /> {diagIALoad ? 'Analizando…' : (diagIA ? 'Re-analizar con IA' : 'Análisis con IA')}
                      </button>
                    </div>
                    <div className="er-diag-kpis">
                      <div className="er-diag-kpi"><span className="er-diag-n">{diag.engRate != null ? `${diag.engRate.toFixed(1)}%` : '—'}</span><span className="er-diag-l">Tasa de interacción</span></div>
                      <div className="er-diag-kpi"><span className="er-diag-n">{diag.avgEng}</span><span className="er-diag-l">Interacc./post</span></div>
                      <div className="er-diag-kpi"><span className="er-diag-n">{diag.mejorFmt?.k || '—'}</span><span className="er-diag-l">Formato estrella</span></div>
                      <div className="er-diag-kpi"><span className="er-diag-n">{diag.mejorHora ? `${String(diag.mejorHora.k).padStart(2, '0')}:00` : '—'}</span><span className="er-diag-l">Mejor hora</span></div>
                      <div className="er-diag-kpi"><span className="er-diag-n">{diag.ult14}</span><span className="er-diag-l">Posts / 14 días</span></div>
                    </div>
                    {diag.n < 5 && <p className="er-diag-thin">Diagnóstico preliminar ({diag.n} piezas con métricas). Entre más publiques, más certero.</p>}
                    <div className="er-diag-cols">
                      <div className="er-diag-col ok">
                        <h4><FaCheck /> Lo que va bien</h4>
                        {diag.aciertos.length ? <ul>{diag.aciertos.map((t, i) => <li key={i}>{t}</li>)}</ul> : <p className="er-muted">Aún sin señales claras.</p>}
                      </div>
                      <div className="er-diag-col warn">
                        <h4><FaExclamationTriangle /> A mejorar</h4>
                        {diag.mejoras.length ? <ul>{diag.mejoras.map((t, i) => <li key={i}>{t}</li>)}</ul> : <p className="er-muted">Nada urgente por ahora.</p>}
                      </div>
                      <div className="er-diag-col tip">
                        <h4><FaChartLine /> Recomendaciones</h4>
                        {diag.recomendaciones.length ? <ul>{diag.recomendaciones.map((t, i) => <li key={i}>{t}</li>)}</ul> : <p className="er-muted">Sigue así.</p>}
                      </div>
                    </div>
                    {diagIA && (
                      <div className="er-diag-ia">
                        <h4><FaChartLine /> Análisis con IA</h4>
                        {diagIA.resumen && <p className="er-diag-ia-resumen">{diagIA.resumen}</p>}
                        {(diagIA.acciones || []).length > 0 && (
                          <ol className="er-diag-ia-acciones">{diagIA.acciones.map((a, i) => <li key={i}>{a}</li>)}</ol>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <h3 className="er-rend-title"><FaEye /> Nuestras publicaciones ({fMarca})</h3>
                {rendPiezasLoad && <p className="er-muted">Cargando métricas de tus piezas…</p>}
                {!rendPiezasLoad && rendPiezas?.sinCredenciales && <p className="er-muted">Sin credenciales de Meta para {fMarca}: no se pueden traer métricas por-pieza.</p>}
                {!rendPiezasLoad && rendPiezas && !rendPiezas.sinCredenciales && (rendPiezas.piezas || []).length === 0 &&
                  <p className="er-muted">Aún no hay piezas publicadas desde el estudio para {fMarca}.</p>}
                <div className="er-piezas-grid">
                  {(rendPiezas?.piezas || []).map((p) => {
                    const RI = PLAT_ICON[p.red] || FaChartBar;
                    return (
                      <a key={p.id} className="er-pieza-card" href={p.permalink || '#'} target="_blank" rel="noopener noreferrer">
                        <div className="er-pieza-thumb">
                          {p.preview ? <img src={p.preview} alt={p.tema} loading="lazy" /> : <div className="er-pieza-noimg"><RI /></div>}
                          <span className="er-pieza-fmt" style={{ background: FORMATO_COLOR[p.formato] || '#4b5563' }}>{p.formato}</span>
                          {p.red && <span className={`er-pieza-red pl-${p.red}`}><RI /></span>}
                          {p.vistas != null && <span className="er-pieza-views"><FaEye /> {num(p.vistas)}</span>}
                        </div>
                        <div className="er-pieza-body">
                          <p className="er-pieza-tema">{p.tema || '(sin título)'}</p>
                          <div className="er-pieza-stats">
                            <span title="Me gusta"><FaHeart /> {p.reacciones != null ? num(p.reacciones) : '—'}</span>
                            <span title="Comentarios"><FaComment /> {p.comentarios != null ? num(p.comentarios) : '—'}</span>
                            <span title="Compartidos"><FaShareAlt /> {p.compartidos != null ? num(p.compartidos) : '—'}</span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
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
                {abierta.video_url
                  ? <video src={playableVideo(abierta.video_url)} controls playsInline preload="metadata" className="er-visor-video" />
                  : (abierta.imagenes || [])[imgIdx]
                    ? (
                      <div className="er-visor-frame">
                        <img src={(abierta.imagenes || [])[imgIdx]} alt=""
                          onLoad={(e) => setImgDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })} />
                        {guiasOn && recorte && (
                          <div className="er-guias" aria-hidden>
                            {/* Franjas que IG recorta (cover al formato destino) */}
                            {recorte.cropX > 0 && <><span className="er-cut" style={{ left: 0, top: 0, bottom: 0, width: `${recorte.cropX * 100}%` }} /><span className="er-cut" style={{ right: 0, top: 0, bottom: 0, width: `${recorte.cropX * 100}%` }} /></>}
                            {recorte.cropY > 0 && <><span className="er-cut" style={{ left: 0, right: 0, top: 0, height: `${recorte.cropY * 100}%` }} /><span className="er-cut" style={{ left: 0, right: 0, bottom: 0, height: `${recorte.cropY * 100}%` }} /></>}
                            {/* Marco visible (lo que SÍ se ve en el formato destino) */}
                            <span className="er-keep" style={{ left: `${recorte.cropX * 100}%`, right: `${recorte.cropX * 100}%`, top: `${recorte.cropY * 100}%`, bottom: `${recorte.cropY * 100}%` }}>
                              {guiaFmt === '9:16' && <>
                                <span className="er-safe" style={{ top: `${SAFE.top * 100}%` }}><i>zona segura ↑ (usuario/barra)</i></span>
                                <span className="er-safe er-safe-b" style={{ bottom: `${SAFE.bottom * 100}%` }}><i>zona segura ↓ (caption/acciones)</i></span>
                              </>}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                    : <div className="er-visor-empty"><FaCloudUploadAlt /><span>{(draft?.formato || abierta.formato) === 'VIDEO' ? 'Sin video — arrastra un video aquí o usa «Subir video»' : 'Slot vacío — arrastra una imagen aquí'}</span></div>}
                {(abierta.imagenes || []).length > 1 && (
                  <button className="er-visor-arrow right" onClick={() => setImgIdx((i) => (i + 1) % abierta.imagenes.length)}><FaChevronRight /></button>
                )}
                {(abierta.imagenes || []).length > 0 && <span className="er-visor-count">{imgIdx + 1} / {(abierta.imagenes || []).length}</span>}
                {dragOver && <div className="er-drop-hint"><FaCloudUploadAlt /> Suelta para reemplazar</div>}
              </div>

              {/* Guías de recorte para redes: dice si la imagen se corta y muestra las zonas seguras */}
              {!abierta.video_url && (abierta.imagenes || [])[imgIdx] && (
                <div className="er-guias-bar">
                  <div className="er-guias-fmts">
                    {Object.keys(RATIOS).map((k) => (
                      <button key={k} className={guiaFmt === k ? 'on' : ''} onClick={() => setGuiaFmt(k)} title={RATIOS[k].lbl}>{k}</button>
                    ))}
                    <button className={`er-guias-toggle ${guiasOn ? 'on' : ''}`} onClick={() => setGuiasOn((v) => !v)}>
                      {guiasOn ? 'Ocultar guías' : 'Ver guías'}
                    </button>
                  </div>
                  {recorte && (
                    recorte.corta
                      ? <div className="er-guias-verdict cut"><FaExclamationTriangle /> <span>En <b>{guiaFmt}</b> ({RATIOS[guiaFmt].lbl}) esta imagen <b>se recorta</b>: pierde ~{Math.round(recorte.perdida * 100)}% {recorte.cropX > 0 ? 'por los lados' : 'arriba y abajo'}. Lo rojo es lo que IG corta.</span></div>
                      : <div className="er-guias-verdict ok"><FaCheck /> <span>Encaja en <b>{guiaFmt}</b> ({RATIOS[guiaFmt].lbl}) sin recorte.</span></div>
                  )}
                </div>
              )}

              <div className="er-thumbs">
                {(abierta.imagenes || []).map((u, i) => (
                  <button key={i} className={`er-thumb ${i === imgIdx ? 'on' : ''}`} onClick={() => setImgIdx(i)}
                    onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDropThumb(e, i)} title="Arrastra una imagen para reemplazar esta lámina">
                    <img src={u} alt="" loading="lazy" />
                  </button>
                ))}
                {(abierta.imagenes || []).length < 10 && (
                  <div className={`er-thumb er-thumb-empty ${dropSlot === 'add' ? 'over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); if (dropSlot !== 'add') setDropSlot('add'); }}
                    onDragLeave={(e) => { if (e.currentTarget === e.target) setDropSlot(null); }}
                    onDrop={onDropSlotVacio} title="Arrastra aquí para agregar una lámina">
                    <FaPlus />
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={reemplazar} />
              <input type="file" accept="video/*" ref={videoRef} style={{ display: 'none' }} onChange={(e) => subirVideo(e.target.files?.[0])} />
              <div className="er-img-btns">
                {(abierta.imagenes || []).length > 0 && !abierta.video_url && (
                  <button className="er-replace" disabled={subiendo} onClick={() => fileRef.current?.click()}>
                    <FaCloudUploadAlt /> {subiendo ? 'Subiendo…' : `Reemplazar imagen ${imgIdx + 1}`}
                  </button>
                )}
                {(draft?.formato || abierta.formato) === 'VIDEO' && (
                  <button className="er-replace" disabled={subiendo} onClick={() => videoRef.current?.click()}>
                    <FaCloudUploadAlt /> {subiendo ? 'Subiendo…' : (abierta.video_url ? 'Reemplazar video' : 'Subir video')}
                  </button>
                )}
              </div>
              <p className="er-drop-tip"><FaPlus /> Arrastra una imagen al cuadro punteado para <b>agregar</b> una lámina nueva al carrusel.</p>
            </div>

            {/* Panel de edición */}
            <div className="er-panel">
              <div className="er-panel-top">
                <span className="er-chip-fmt" style={{ background: FORMATO_COLOR[abierta.formato] }}>{abierta.formato}</span>
                <span className="er-chip-est" style={{ color: EST[abierta.estado]?.c, borderColor: EST[abierta.estado]?.c }}>{EST[abierta.estado]?.lbl}</span>
                <span className="er-panel-fecha">{abierta.fecha} · slot {abierta.slot}</span>
              </div>
              <div className="er-hora-edit">
                <div className="er-hora-row">
                  <FaRegClock />
                  <span>Se publica a las</span>
                  <input type="time" className="er-hora-input" value={draft?.hora || '10:00'}
                    onChange={(e) => setDraft({ ...draft, hora: e.target.value })} />
                  <span className="er-hora-tz">CDMX</span>
                  <button type="button" className={`er-autopub-sw ${autoPub ? 'on' : ''}`} onClick={toggleAutoPub} disabled={autoPubBusy}
                    title="Publicación automática de todas las piezas programadas cuando llega su hora">
                    <span className="er-sw-track"><span className="er-sw-thumb" /></span>
                    Autopublicación {autoPub ? 'ON' : 'OFF'}
                  </button>
                </div>
                {(() => {
                  const tipo = esReel(draft?.formato || abierta.formato) ? 'reel' : 'post';
                  return (
                    <div className="er-hora-reco">
                      <span className="er-hora-reco-lbl">Mejores horas para {tipo === 'reel' ? 'reels/video' : 'publicaciones'}:</span>
                      <div className="er-hora-chips">
                        {HORAS_RECO[tipo].map((r) => (
                          <button key={r.h} type="button"
                            className={`er-hora-chip ${draft?.hora === r.h ? 'on' : ''}`}
                            onClick={() => setDraft({ ...draft, hora: r.h })}
                            title={`${r.h} · ${r.t}`}>
                            {r.h} <i>{r.t}</i>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
              {avisos(abierta).length > 0 && (
                <div className="er-panel-avisos"><FaExclamationTriangle /> <span>{avisos(abierta).join(' · ')}</span></div>
              )}
              <div className="er-plats-edit">
                <span className="er-plats-lbl">Publicar en:</span>
                <div className="er-panel-plats">
                  {['ig', 'fb', 'tiktok', 'linkedin'].map((pl) => {
                    const I = PLAT_ICON[pl];
                    const on = (draft?.plataformas || []).includes(pl);
                    return (
                      <button key={pl} type="button" className={`er-plat-toggle pl-${pl} ${on ? 'on' : 'off'}`} onClick={() => togglePlat(pl)}
                        title={on ? `Se publicará en ${pl.toUpperCase()}` : `${pl.toUpperCase()} desactivado`}>
                        <I /> {pl.toUpperCase()} {on ? <FaCheck className="er-plat-mk" /> : <FaPlus className="er-plat-mk" />}
                      </button>
                    );
                  })}
                  {abierta.pilar && <span className="er-pilar">{abierta.pilar}</span>}
                </div>
              </div>
              <h3>{abierta.tema}</h3>

              <label className="er-fmt-sel">Formato de la publicación
                <select value={draft?.formato || abierta.formato || 'CARRUSEL'} onChange={(e) => setDraft({ ...draft, formato: e.target.value })}>
                  {FORMATOS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>

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
