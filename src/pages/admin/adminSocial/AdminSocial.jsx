import React, { useState, useEffect } from 'react';
import {
    FaInstagram, FaFacebookF, FaTiktok, FaTwitter, FaLinkedinIn,
    FaGlobe, FaExternalLinkAlt, FaChartLine, FaHashtag,
    FaSync, FaHeart, FaComment, FaShare,
    FaImage, FaVideo, FaPaperPlane, FaTrophy, FaFire,
    FaEye, FaClock, FaChartBar, FaClipboardList,
    FaSearch, FaCheckCircle, FaPlus, FaTimes,
    FaBookmark, FaUsers, FaArrowUp, FaArrowDown, FaBullseye,
    FaPenNib, FaCopy, FaTrash, FaEdit, FaMagic
} from 'react-icons/fa';
import { Badge, Modal } from 'react-bootstrap';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axioswithAuth from '../../../utils/axioswithAuth';
import './AdminSocial.css';

const fmt = (n) => {
    if (n === '—' || n == null) return '—';
    if (typeof n === 'string') return n;
    const num = Number(n);
    if (isNaN(num)) return n;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
};

const PLATFORMS = [
    { id: 'overview', name: 'Resumen', icon: FaChartBar, color: '#60A5FA' },
    { id: 'content', name: 'Contenido', icon: FaPenNib, color: '#A78BFA' },
    { id: 'radar', name: 'Competencia', icon: FaSearch, color: '#F97316' },
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: '#E4405F', gradient: 'linear-gradient(135deg, #833AB4, #E4405F, #FCAF45)', handle: '@tesipediaoficial', url: 'https://instagram.com/tesipediaoficial', connected: true },
    { id: 'facebook', name: 'Facebook', icon: FaFacebookF, color: '#1877F2', gradient: '#1877F2', handle: 'Tesipedia', url: 'https://facebook.com/profile.php?id=61582053080466', connected: true },
    { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: '#FF0050', gradient: 'linear-gradient(135deg, #00F2EA, #FF0050)', handle: '@tesipedia', url: '', connected: false },
    { id: 'threads', name: 'Threads', icon: FaHashtag, color: '#888', gradient: 'linear-gradient(135deg, #333, #888)', handle: '@tesipediaoficial', url: '', connected: false },
    { id: 'x', name: 'X', icon: FaTwitter, color: '#000', gradient: '#000', handle: '@tesipedia', url: '', connected: false },
    { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedinIn, color: '#0A66C2', gradient: '#0A66C2', handle: 'Tesipedia', url: '', connected: false },
    { id: 'web', name: 'Web', icon: FaGlobe, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', handle: 'tesipedia.com', url: 'https://tesipedia.com', connected: true },
];

const CONTENT_STATUSES = [
    { key: 'idea', label: 'Ideas', color: '#6B7280' },
    { key: 'draft', label: 'Borrador', color: '#F59E0B' },
    { key: 'ready', label: 'Listo para publicar', color: '#10B981' },
    { key: 'published', label: 'Publicado', color: '#3B82F6' },
];
const CONTENT_TYPES = [
    { key: 'reel', label: 'Reel / Video' },
    { key: 'carousel', label: 'Carrusel' },
    { key: 'post', label: 'Post / Imagen' },
    { key: 'story', label: 'Story' },
    { key: 'text', label: 'Solo texto' },
];
const CONTENT_GUIDES = {
    reel: [
        { step: 1, title: 'Graba el hook (0-3s)', desc: 'Los primeros 3 segundos definen si la gente se queda. Usa texto grande en pantalla + expresión facial exagerada.' },
        { step: 2, title: 'Desarrollo (3-15s)', desc: 'Ritmo rápido, cortes cada 2-3 segundos. Texto en pantalla legible (fuente grande, centrado).' },
        { step: 3, title: 'CTA final (15-20s)', desc: 'Pantalla de marca (morado #7C3AED). "Link en bio" o "Síguenos". No pases de 30s.' },
        { step: 4, title: 'Audio y hashtags', desc: 'Audio trending. Hashtags en primer comentario, máximo 15.' },
        { step: 5, title: 'Publica en horario pico', desc: 'IG: 12-14h o 19-21h. Responde comentarios los primeros 30 min.' },
    ],
    carousel: [
        { step: 1, title: 'Portada que enganche', desc: 'Slide 1 = lo más importante. Pregunta o dato impactante. Fondo morado #7C3AED, texto blanco.' },
        { step: 2, title: 'Contenido de valor (slides 2-5)', desc: 'Un punto por slide. Texto grande. Iconos/emojis para romper monotonía.' },
        { step: 3, title: 'CTA final', desc: '"Guarda este post", "Comparte con alguien", "Link en bio". Logo Tesipedia.' },
        { step: 4, title: 'Genera las imágenes', desc: 'Copia el prompt de Midjourney. Tamaño 1080x1080. Texto legible sobre el fondo.' },
        { step: 5, title: 'Optimiza para guardados', desc: 'Carruseles buscan GUARDADOS. Incluye info que quieran revisar después.' },
    ],
    post: [
        { step: 1, title: 'Genera la imagen', desc: 'Copia el prompt. Formato 1080x1080. Colores: morado #7C3AED, blanco, negro.' },
        { step: 2, title: 'Escribe el caption', desc: 'Primera línea = hook. 2-3 líneas de valor. CTA al final.' },
        { step: 3, title: 'Publica y engage', desc: 'Responde TODOS los comentarios en los primeros 30 min.' },
    ],
    story: [
        { step: 1, title: 'Crea la story', desc: 'Fondo morado. Stickers interactivos: encuesta, pregunta, cuenta regresiva.' },
        { step: 2, title: 'Incluye CTA', desc: 'Sticker de link o "DM para info" / "Link en bio".' },
    ],
    text: [
        { step: 1, title: 'Escribe y publica', desc: 'Copy directo. Emojis moderados. CTA claro al final.' },
    ],
};
const CONTENT_TIPS = {
    reel: ['Reels <15s tienen 2x más replay', 'Texto en pantalla +40% retención', 'Audio trending = +3x alcance', 'Publica 12-14h para máximo reach', 'Responde comments en primeros 30 min'],
    carousel: ['Carruseles = 3x más guardados', 'Portada controversial = más deslizamientos', 'Máx 7 slides', 'Incluye "Desliza →" en portada', 'Educativos posicionan como experto'],
    post: ['Imágenes con caras = 38% más engagement', 'Primera línea decide si leen', 'Posts con pregunta = 2x comments'],
    story: ['Stories con encuestas = 3x interacción', 'Máx 3 stories seguidas', 'Cuenta regresiva genera anticipación'],
    text: ['Textos <150 chars en FB = más alcance'],
};

const COMPETITORS = {
    instagram: [
        { name: '@tesilandia', followers: '~5K', strengths: 'Publica diario, reels de humor', weakness: 'Poca interacción en comentarios', action: 'Crear serie de reels de humor sobre tesis — publicar 5/semana' },
        { name: '@tesisymastesis', followers: '~3K', strengths: 'Carruseles educativos de alta calidad', weakness: 'No usa stories ni reels', action: 'Crear carruseles informativos de "Tips para tu tesis" — 2/semana' },
        { name: '@redactoresexpertos', followers: '~2K', strengths: 'Testimonios de clientes reales', weakness: 'Feed desordenado sin branding', action: 'Publicar 1 testimonio semanal con diseño de marca' },
    ],
    facebook: [
        { name: 'Tesilandia MX', followers: '~1K', strengths: 'Ads con ofertas directas', weakness: 'Bajo engagement orgánico', action: 'Publicar 3 posts orgánicos/semana con CTAs al WhatsApp' },
        { name: 'Tesis Express', followers: '~500', strengths: 'Precios bajos como gancho', weakness: 'Sin contenido de valor', action: 'Posicionar calidad vs precio con casos de éxito' },
    ],
    tiktok: [
        { name: '@tesistiktok', followers: '~10K', strengths: 'Humor + tips = viralidad', weakness: 'No convierte a ventas', action: 'Crear cuenta y publicar 3 reels/semana adaptados de IG' },
    ],
    threads: [],
    x: [{ name: '@tesismexico', followers: '~200', strengths: 'Presencia temprana', weakness: 'Bajo engagement', action: 'Crear cuenta y republicar contenido de IG adaptado' }],
    linkedin: [{ name: 'Tesis Profesionales MX', followers: '~500', strengths: 'Audiencia de posgrado', weakness: 'Contenido genérico', action: 'Publicar artículos de expertise en investigación' }],
};

const loadTasks = () => { try { return JSON.parse(localStorage.getItem('social_tasks') || '{}'); } catch { return {}; } };
const saveTasks = (t) => localStorage.setItem('social_tasks', JSON.stringify(t));

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return <div style={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8, padding: '8px 12px', fontSize: '0.75rem' }}>
        <p style={{ color: '#9CA3AF', margin: 0 }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color, margin: '2px 0 0', fontWeight: 700 }}>{fmt(p.value)}</p>)}
    </div>;
};

const AdminSocial = () => {
    const [metrics, setMetrics] = useState(null);
    const [igPosts, setIgPosts] = useState([]);
    const [fbPosts, setFbPosts] = useState([]);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isMock, setIsMock] = useState(false);
    const [showPublish, setShowPublish] = useState(false);
    const [publishPlatform, setPublishPlatform] = useState('facebook');
    const [publishMsg, setPublishMsg] = useState('');
    const [publishImg, setPublishImg] = useState('');
    const [publishing, setPublishing] = useState(false);
    const [tasks, setTasks] = useState(loadTasks());
    const [newTask, setNewTask] = useState('');
    const [addingTaskPlatform, setAddingTaskPlatform] = useState(null);
    // Content board (persistido en Mongo vía /social/content)
    const [contentItems, setContentItems] = useState([]);
    const [showContentForm, setShowContentForm] = useState(false);
    const [editingContent, setEditingContent] = useState(null);
    const [contentForm, setContentForm] = useState({ platform: 'instagram', type: 'reel', caption: '', hashtags: '', imagePrompt: '', reelIdea: '', scheduledDate: '', status: 'idea', imageUrl: '', notes: '' });
    const [viewingContent, setViewingContent] = useState(null);
    const [generating, setGenerating] = useState(false);
    // Radar de competencia
    const [radar, setRadar] = useState(null);
    const [radarLoading, setRadarLoading] = useState(false);
    const [competitorsList, setCompetitorsList] = useState([]);
    const [newCompUsername, setNewCompUsername] = useState('');

    const fetchContent = async () => {
        try {
            const { data } = await axioswithAuth.get('/social/content');
            let items = data.data || [];
            // Migración one-shot: piezas que quedaron en localStorage
            let legacy = [];
            try { legacy = JSON.parse(localStorage.getItem('social_content') || '[]'); } catch { legacy = []; }
            if (legacy.length) {
                await axioswithAuth.post('/social/content/import', { items: legacy });
                localStorage.removeItem('social_content');
                const r2 = await axioswithAuth.get('/social/content');
                items = r2.data.data || [];
            }
            setContentItems(items);
        } catch { /* endpoint aún no desplegado */ }
    };
    const addContent = async () => {
        if (!contentForm.caption && !contentForm.reelIdea && !contentForm.imagePrompt) return;
        try {
            if (editingContent) {
                const { data } = await axioswithAuth.put(`/social/content/${editingContent}`, contentForm);
                setContentItems(prev => prev.map(c => c._id === editingContent ? data.data : c));
            } else {
                const { data } = await axioswithAuth.post('/social/content', contentForm);
                setContentItems(prev => [data.data, ...prev]);
            }
        } catch (err) { alert('Error guardando: ' + (err.response?.data?.message || err.message)); return; }
        setContentForm({ platform: 'instagram', type: 'reel', caption: '', hashtags: '', imagePrompt: '', reelIdea: '', scheduledDate: '', status: 'idea' });
        setShowContentForm(false); setEditingContent(null);
    };
    const patchContent = async (id, patch) => {
        setContentItems(prev => prev.map(c => c._id === id ? { ...c, ...patch } : c));
        try { await axioswithAuth.put(`/social/content/${id}`, patch); } catch { /* optimista */ }
    };
    const moveContent = (id, newStatus) => patchContent(id, { status: newStatus });
    const deleteContent = async (id) => {
        setContentItems(prev => prev.filter(c => c._id !== id));
        try { await axioswithAuth.delete(`/social/content/${id}`); } catch { /* optimista */ }
    };
    const editContent = (item) => {
        setContentForm({ platform: item.platform, type: item.type, caption: item.caption || '', hashtags: item.hashtags || '', imagePrompt: item.imagePrompt || '', reelIdea: item.reelIdea || '', scheduledDate: item.scheduledDate || '', status: item.status, imageUrl: item.imageUrl || '', notes: item.notes || '' });
        setEditingContent(item._id); setShowContentForm(true);
    };

    const fetchRadar = async (force = false) => {
        setRadarLoading(true);
        try {
            const [compsRes, scanRes] = await Promise.all([
                axioswithAuth.get('/social/competitors'),
                axioswithAuth.get(`/social/competitors/scan${force ? '?force=true' : ''}`),
            ]);
            setCompetitorsList(compsRes.data.data || []);
            setRadar(scanRes.data.data);
        } catch (err) { alert('Error del radar: ' + (err.response?.data?.message || err.message)); }
        setRadarLoading(false);
    };
    const addComp = async () => {
        const u = newCompUsername.trim();
        if (!u) return;
        try {
            await axioswithAuth.post('/social/competitors', { username: u });
            setNewCompUsername('');
            fetchRadar(true);
        } catch (err) { alert(err.response?.data?.message || err.message); }
    };
    const removeComp = async (id) => {
        setCompetitorsList(prev => prev.filter(c => c._id !== id));
        try { await axioswithAuth.delete(`/social/competitors/${id}`); } catch { /* optimista */ }
    };
    // Convierte un post ganador de la competencia en una idea del board
    const radarToIdea = async (post) => {
        try {
            const { data } = await axioswithAuth.post('/social/content', {
                platform: 'instagram',
                type: post.type === 'VIDEO' ? 'reel' : post.type === 'CAROUSEL_ALBUM' ? 'carousel' : 'post',
                status: 'idea',
                source: 'radar',
                reelIdea: `Adaptar a Tesipedia — referencia @${post.username} (${post.likes} likes, ${post.comments} comments):\n"${post.caption}"\n${post.url}`,
                sourceRef: { username: post.username, permalink: post.url, likes: post.likes, comments: post.comments },
            });
            setContentItems(prev => [data.data, ...prev]);
            alert('Agregado como idea al board de contenido');
        } catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
    };

    const fetchAll = async () => {
        setLoading(true);
        const [metricsRes, igRes, fbRes, insightsRes] = await Promise.allSettled([
            axioswithAuth.get('/social/metrics'),
            axioswithAuth.get('/social/posts/instagram'),
            axioswithAuth.get('/social/posts/facebook'),
            axioswithAuth.get('/social/insights/instagram?days=14'),
        ]);
        if (metricsRes.status === 'fulfilled' && metricsRes.value.data.success) { setMetrics(metricsRes.value.data.data); setIsMock(!!metricsRes.value.data.mock); }
        if (igRes.status === 'fulfilled') setIgPosts(igRes.value.data.data || []);
        if (fbRes.status === 'fulfilled') setFbPosts(fbRes.value.data.data || []);
        if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value.data.data);
        setLoading(false);
    };

    useEffect(() => { fetchAll(); fetchContent(); }, []);
    // Cargar el radar la primera vez que se abre el tab
    useEffect(() => {
        if (activeTab === 'radar' && !radar && !radarLoading) fetchRadar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handlePublish = async () => {
        if (!publishMsg && !publishImg) return;
        setPublishing(true);
        try {
            const { data } = await axioswithAuth.post('/social/publish', { platform: publishPlatform, message: publishMsg, imageUrl: publishImg || undefined });
            if (data.success) { alert(`Publicado en ${publishPlatform}`); setShowPublish(false); setPublishMsg(''); setPublishImg(''); fetchAll(); }
        } catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
        setPublishing(false);
    };

    const addTask = (pid) => { if (!newTask.trim()) return; const u = { ...tasks }; if (!u[pid]) u[pid] = []; u[pid].push({ text: newTask, done: false, date: new Date().toISOString() }); setTasks(u); saveTasks(u); setNewTask(''); setAddingTaskPlatform(null); };
    const toggleTask = (pid, i) => { const u = { ...tasks }; if (u[pid]?.[i]) { u[pid][i].done = !u[pid][i].done; setTasks(u); saveTasks(u); } };
    const removeTask = (pid, i) => { const u = { ...tasks }; u[pid]?.splice(i, 1); setTasks(u); saveTasks(u); };
    const addCompetitorTask = (pid, text) => { const u = { ...tasks }; if (!u[pid]) u[pid] = []; if (u[pid].some(t => t.text === text)) return; u[pid].push({ text, done: false, date: new Date().toISOString(), fromCompetitor: true }); setTasks(u); saveTasks(u); };

    const ig = metrics?.instagram;
    const fb = metrics?.facebook;
    const web = metrics?.web;
    const igTotals = insights?.totals || {};

    const renderTasksSection = (pid) => {
        const platformTasks = tasks[pid] || [];
        return (
            <div className="social-section-box">
                <h4><FaClipboardList style={{ color: '#A78BFA' }} /> Tareas de contenido {platformTasks.filter(t => !t.done).length > 0 && <Badge bg="danger" style={{ fontSize: '0.6rem' }}>{platformTasks.filter(t => !t.done).length}</Badge>}</h4>
                <div className="social-tasks-list">
                    {platformTasks.map((t, i) => (
                        <div key={i} className={`social-task-item ${t.done ? 'done' : ''}`}>
                            <button className="social-task-check" onClick={() => toggleTask(pid, i)}>{t.done ? <FaCheckCircle style={{ color: '#10B981' }} /> : <span className="social-task-circle" />}</button>
                            <span className="social-task-text">{t.text} {t.fromCompetitor && <Badge bg="warning" text="dark" style={{ fontSize: '0.5rem' }}>Competencia</Badge>}</span>
                            <button className="social-task-remove" onClick={() => removeTask(pid, i)}><FaTimes /></button>
                        </div>
                    ))}
                    {addingTaskPlatform === pid ? (
                        <div className="social-task-add-input">
                            <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Nueva tarea..." autoFocus onKeyDown={e => { if (e.key === 'Enter') addTask(pid); if (e.key === 'Escape') setAddingTaskPlatform(null); }} />
                            <button onClick={() => addTask(pid)}><FaCheckCircle /></button>
                        </div>
                    ) : (
                        <button className="social-task-add-btn" onClick={() => { setAddingTaskPlatform(pid); setNewTask(''); }}><FaPlus /> Agregar tarea</button>
                    )}
                </div>
            </div>
        );
    };

    const renderCompetitors = (pid) => {
        const comps = COMPETITORS[pid] || [];
        if (!comps.length) return null;
        return (
            <div className="social-section-box">
                <h4><FaSearch style={{ color: '#F97316' }} /> Análisis de competencia</h4>
                {comps.map((c, i) => (
                    <div key={i} className="social-competitor-card">
                        <div className="social-competitor-header">
                            <strong>{c.name}</strong><span className="social-competitor-followers">{c.followers}</span>
                        </div>
                        <div className="social-competitor-analysis">
                            <div className="social-competitor-row"><FaArrowUp style={{ color: '#10B981' }} /> <span><strong>Fortaleza:</strong> {c.strengths}</span></div>
                            <div className="social-competitor-row"><FaArrowDown style={{ color: '#EF4444' }} /> <span><strong>Debilidad:</strong> {c.weakness}</span></div>
                            <div className="social-competitor-row"><FaBullseye style={{ color: '#F59E0B' }} /> <span><strong>Acción:</strong> {c.action}</span></div>
                        </div>
                        <button className="social-competitor-assign" onClick={() => addCompetitorTask(pid, c.action)}>
                            <FaPlus /> Asignar como tarea
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const renderPostsTable = (posts, hasFbShares) => {
        if (!posts?.length) return null;
        return (
            <div className="social-section-box">
                <h4><FaChartBar style={{ color: '#60A5FA' }} /> Rendimiento de posts ({posts.length})</h4>
                <div className="social-posts-table">
                    <div className="social-posts-header">
                        <span>Tipo</span><span>Contenido</span><span><FaHeart /></span><span><FaComment /></span>{hasFbShares && <span><FaShare /></span>}<span>Fecha</span><span></span>
                    </div>
                    {posts.map((p, i) => (
                        <div key={i} className="social-posts-row">
                            <span className="social-post-type-badge">{p.type === 'VIDEO' ? <><FaVideo /> Reel</> : p.type ? <><FaImage /> Post</> : ''}</span>
                            <span className="social-post-caption-cell">{(p.caption || '—').slice(0, 50)}{(p.caption || '').length > 50 ? '...' : ''}</span>
                            <span className="social-post-metric"><FaHeart style={{ color: '#E4405F' }} /> {p.likes}</span>
                            <span className="social-post-metric"><FaComment style={{ color: '#60A5FA' }} /> {p.comments}</span>
                            {hasFbShares && <span className="social-post-metric"><FaShare style={{ color: '#10B981' }} /> {p.shares || 0}</span>}
                            <span className="social-post-date">{new Date(p.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                            <span>{p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="social-post-link"><FaExternalLinkAlt /></a>}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="social-dashboard">
            <div className="social-header">
                <div><h2 className="social-title"><FaChartLine /> Centro de Redes Sociales</h2><p className="social-subtitle">Métricas, rendimiento, competencia y contenido</p></div>
                <div className="social-header-right">
                    <button className="social-publish-btn" onClick={() => setShowPublish(true)}><FaPaperPlane /> Publicar</button>
                    <button className="social-refresh-btn" onClick={fetchAll} disabled={loading}><FaSync className={loading ? 'social-spin' : ''} /></button>
                </div>
            </div>

            {/* KPIs */}
            {!isMock && metrics && (
                <div className="social-kpis">
                    <div className="social-kpi"><FaInstagram className="social-kpi-icon" style={{ color: '#E4405F' }} /><div><span className="social-kpi-num">{fmt(ig?.followers)}</span><span className="social-kpi-label">IG Seguidores</span></div></div>
                    <div className="social-kpi"><FaFacebookF className="social-kpi-icon" style={{ color: '#1877F2' }} /><div><span className="social-kpi-num">{fmt(fb?.followers)}</span><span className="social-kpi-label">FB Seguidores</span></div></div>
                    <div className="social-kpi"><FaFire className="social-kpi-icon" style={{ color: '#F97316' }} /><div><span className="social-kpi-num">{fmt(igTotals.total_interactions)}</span><span className="social-kpi-label">Interacciones 14d</span></div></div>
                    <div className="social-kpi"><FaEye className="social-kpi-icon" style={{ color: '#A78BFA' }} /><div><span className="social-kpi-num">{fmt(igTotals.profile_views)}</span><span className="social-kpi-label">Visitas perfil 14d</span></div></div>
                    <div className="social-kpi"><FaBookmark className="social-kpi-icon" style={{ color: '#10B981' }} /><div><span className="social-kpi-num">{fmt(igTotals.saves)}</span><span className="social-kpi-label">Guardados 14d</span></div></div>
                    <div className="social-kpi"><FaShare className="social-kpi-icon" style={{ color: '#60A5FA' }} /><div><span className="social-kpi-num">{fmt(igTotals.shares)}</span><span className="social-kpi-label">Compartidos 14d</span></div></div>
                </div>
            )}

            {/* Tabs */}
            <div className="social-tabs">
                {PLATFORMS.map(p => {
                    const Icon = p.icon;
                    const pending = (tasks[p.id] || []).filter(t => !t.done).length;
                    return <button key={p.id} className={`social-tab ${activeTab === p.id ? 'active' : ''}`} style={activeTab === p.id ? { background: p.color, borderColor: p.color } : {}} onClick={() => setActiveTab(p.id)}>
                        <Icon /> {p.name} {pending > 0 && <span className="social-tab-badge">{pending}</span>} {p.connected === false && <span className="social-tab-dot" />}
                    </button>;
                })}
            </div>

            {/* ═══ CONTENT BOARD ═══ */}
            {activeTab === 'content' && (() => {
                const STATUSES = CONTENT_STATUSES.map(s => ({
                    ...s,
                    icon: s.key === 'idea' ? <FaMagic /> : s.key === 'draft' ? <FaPenNib /> : s.key === 'ready' ? <FaCheckCircle /> : <FaPaperPlane />,
                }));
                const TYPES = CONTENT_TYPES.map(t => ({
                    ...t,
                    icon: t.key === 'reel' ? <FaVideo /> : t.key === 'carousel' ? <FaCopy /> : t.key === 'post' ? <FaImage /> : t.key === 'story' ? <FaClock /> : <FaPenNib />,
                }));
                const platformIcon = (pid) => {
                    const p = PLATFORMS.find(x => x.id === pid);
                    if (!p) return null;
                    const I = p.icon;
                    return <I style={{ color: p.color }} />;
                };

                return (
                    <div className="social-content-board">
                        <div className="social-content-header">
                            <h3><FaPenNib /> Board de Contenido</h3>
                            <p>Planifica, redacta y publica desde un solo lugar. Los agentes CM + Content pueden poblar esto.</p>
                            <button className="social-content-add-btn" onClick={() => { setShowContentForm(true); setEditingContent(null); setContentForm({ platform: 'instagram', type: 'reel', caption: '', hashtags: '', imagePrompt: '', reelIdea: '', scheduledDate: '', status: 'idea' }); }}>
                                <FaPlus /> Nueva pieza de contenido
                            </button>
                        </div>

                        {/* Kanban columns */}
                        <div className="social-kanban">
                            {STATUSES.map(status => {
                                const items = contentItems.filter(c => c.status === status.key);
                                return (
                                    <div key={status.key} className="social-kanban-col">
                                        <div className="social-kanban-col-header" style={{ borderTopColor: status.color }}>
                                            {status.icon} {status.label} <Badge bg="dark" style={{ fontSize: '0.6rem' }}>{items.length}</Badge>
                                        </div>
                                        <div className="social-kanban-cards">
                                            {items.map(item => {
                                                const typeInfo = TYPES.find(t => t.key === item.type);
                                                return (
                                                    <div key={item._id} className="social-kanban-card" onClick={() => setViewingContent(item)} style={{ cursor: 'pointer' }}>
                                                        <div className="social-kanban-card-top">
                                                            {platformIcon(item.platform)}
                                                            <span className="social-kanban-type">{typeInfo?.icon} {typeInfo?.label}</span>
                                                            {item.source === 'radar' && <Badge bg="warning" text="dark" style={{ fontSize: '0.5rem' }}>Radar</Badge>}
                                                            {item.imageUrl && <FaImage style={{ color: '#10B981', fontSize: '0.7rem' }} title="Imagen lista" />}
                                                        </div>
                                                        {(item.caption || item.reelIdea) && <p className="social-kanban-caption">{(item.caption || item.reelIdea).slice(0, 100)}{(item.caption || item.reelIdea).length > 100 ? '...' : ''}</p>}
                                                        {item.hashtags && <p className="social-kanban-hashtags">{item.hashtags.slice(0, 60)}</p>}
                                                        {item.scheduledDate && <span className="social-kanban-date"><FaClock /> {new Date(item.scheduledDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>}
                                                        <div className="social-kanban-move">
                                                            {status.key !== 'idea' && <button onClick={(e) => { e.stopPropagation(); moveContent(item._id, STATUSES[STATUSES.findIndex(s => s.key === status.key) - 1]?.key || 'idea'); }}>←</button>}
                                                            {status.key !== 'published' && <button onClick={(e) => { e.stopPropagation(); moveContent(item._id, STATUSES[STATUSES.findIndex(s => s.key === status.key) + 1]?.key || 'published'); }}>→</button>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {items.length === 0 && <div className="social-kanban-empty">Sin contenido aquí</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Content form modal */}
                        <Modal show={showContentForm} onHide={() => { setShowContentForm(false); setEditingContent(null); }} centered size="lg">
                            <Modal.Header closeButton style={{ background: '#111827', borderColor: '#1F2937', color: '#F9FAFB' }}>
                                <Modal.Title>{editingContent ? 'Editar contenido' : 'Nueva pieza de contenido'}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ background: '#111827', color: '#F9FAFB' }}>
                                <div className="social-content-form">
                                    <div className="social-content-form-row">
                                        <div>
                                            <label>Plataforma</label>
                                            <div className="social-publish-platforms">
                                                {['instagram', 'facebook', 'tiktok', 'threads', 'x', 'linkedin'].map(pid => {
                                                    const p = PLATFORMS.find(x => x.id === pid);
                                                    if (!p) return null;
                                                    const I = p.icon;
                                                    return <button key={pid} className={contentForm.platform === pid ? 'active' : ''} onClick={() => setContentForm({ ...contentForm, platform: pid })} style={contentForm.platform === pid ? { borderColor: p.color, background: `${p.color}20` } : {}}>
                                                        <I /> {p.name}
                                                    </button>;
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <label>Tipo</label>
                                            <div className="social-publish-platforms">
                                                {TYPES.map(t => (
                                                    <button key={t.key} className={contentForm.type === t.key ? 'active' : ''} onClick={() => setContentForm({ ...contentForm, type: t.key })}>
                                                        {t.icon} {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <label>Caption / Copy</label>
                                    <textarea value={contentForm.caption} onChange={e => setContentForm({ ...contentForm, caption: e.target.value })} placeholder="El copy que se publicará..." rows={3} />
                                    <label>Hashtags</label>
                                    <input value={contentForm.hashtags} onChange={e => setContentForm({ ...contentForm, hashtags: e.target.value })} placeholder="#tesis #tesipedia #fyp #viral..." />

                                    {(contentForm.type === 'post' || contentForm.type === 'carousel') && <>
                                        <label><FaMagic /> Prompt para generar imagen (Midjourney / DALL-E / Canva)</label>
                                        <textarea value={contentForm.imagePrompt} onChange={e => setContentForm({ ...contentForm, imagePrompt: e.target.value })} placeholder="Ej: Carrusel minimalista con fondo gradiente morado, texto blanco 'Tips para tu tesis', estilo profesional, para Instagram..." rows={3} />
                                    </>}

                                    {(contentForm.type === 'reel' || contentForm.type === 'story') && <>
                                        <label><FaVideo /> Idea / guión del reel</label>
                                        <textarea value={contentForm.reelIdea} onChange={e => setContentForm({ ...contentForm, reelIdea: e.target.value })} placeholder="Ej: Hook: 'POV cuando te dicen que tu tesis está mal'. Desarrollo: mostrar cara de sorpresa, luego escribiendo furiosamente. CTA: 'En Tesipedia te ayudamos'..." rows={3} />
                                    </>}

                                    <div className="social-content-form-row">
                                        <div>
                                            <label>Fecha sugerida</label>
                                            <input type="date" value={contentForm.scheduledDate} onChange={e => setContentForm({ ...contentForm, scheduledDate: e.target.value })} />
                                        </div>
                                        <div>
                                            <label>Estado</label>
                                            <select value={contentForm.status} onChange={e => setContentForm({ ...contentForm, status: e.target.value })} style={{ background: '#0B0F1A', border: '1px solid #374151', color: '#F9FAFB', padding: '8px', borderRadius: '8px', width: '100%' }}>
                                                <option value="idea">Idea</option>
                                                <option value="draft">Borrador</option>
                                                <option value="ready">Listo</option>
                                                <option value="published">Publicado</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button className="social-publish-submit" onClick={addContent} disabled={!contentForm.caption && !contentForm.reelIdea && !contentForm.imagePrompt}>
                                        {editingContent ? 'Guardar cambios' : 'Agregar al board'}
                                    </button>
                                </div>
                            </Modal.Body>
                        </Modal>

                    </div>
                );
            })()}

            {/* ═══ RADAR DE COMPETENCIA ═══ */}
            {activeTab === 'radar' && (
                <div className="social-content-board">
                    <div className="social-content-header">
                        <h3><FaSearch style={{ color: '#F97316' }} /> Radar de Competencia</h3>
                        <p>Qué está funcionando en el nicho (Business Discovery API, últimos 14 días). Convierte lo mejor en ideas para tu board.</p>
                        <button className="social-content-add-btn" onClick={() => fetchRadar(true)} disabled={radarLoading}>
                            <FaSync className={radarLoading ? 'social-spin' : ''} /> {radarLoading ? 'Escaneando...' : 'Escanear ahora'}
                        </button>
                    </div>

                    {/* Watchlist */}
                    <div className="social-section-box">
                        <h4><FaUsers style={{ color: '#F97316' }} /> Cuentas vigiladas ({competitorsList.length})</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                            {competitorsList.map(c => (
                                <span key={c._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1F2937', borderRadius: 20, padding: '4px 10px', fontSize: '0.75rem' }}>
                                    @{c.username}
                                    {c.lastScan?.followers != null && <strong style={{ color: '#F97316' }}>{fmt(c.lastScan.followers)}</strong>}
                                    <button onClick={() => removeComp(c._id)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 0 }}><FaTimes /></button>
                                </span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input value={newCompUsername} onChange={e => setNewCompUsername(e.target.value)} placeholder="@usuario (cuenta business/creator)"
                                onKeyDown={e => { if (e.key === 'Enter') addComp(); }}
                                style={{ background: '#0B0F1A', border: '1px solid #374151', color: '#F9FAFB', padding: '6px 10px', borderRadius: 8, fontSize: '0.8rem', flex: '0 1 280px' }} />
                            <button className="social-task-add-btn" onClick={addComp} style={{ width: 'auto' }}><FaPlus /> Vigilar</button>
                        </div>
                    </div>

                    {radar && (
                        <>
                            {/* Resumen por cuenta */}
                            <div className="social-section-box">
                                <h4><FaChartBar style={{ color: '#60A5FA' }} /> Actividad por cuenta (14 días)</h4>
                                <div className="social-posts-table">
                                    <div className="social-posts-header">
                                        <span>Cuenta</span><span>Seguidores</span><span>Posts 14d</span><span>Eng. promedio</span><span></span>
                                    </div>
                                    {radar.accounts.map(a => (
                                        <div key={a.username} className="social-posts-row">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {a.profilePic && <img src={a.profilePic} alt="" style={{ width: 22, height: 22, borderRadius: '50%' }} />}
                                                <strong>@{a.username}</strong>
                                            </span>
                                            <span>{fmt(a.followers)}</span>
                                            <span>{a.postsLast14d}</span>
                                            <span><FaFire style={{ color: '#F97316' }} /> {fmt(a.avgEngagement)}</span>
                                            <span><a href={`https://instagram.com/${a.username}`} target="_blank" rel="noopener noreferrer" className="social-post-link"><FaExternalLinkAlt /></a></span>
                                        </div>
                                    ))}
                                </div>
                                {radar.errors?.length > 0 && (
                                    <p style={{ color: '#F59E0B', fontSize: '0.7rem', marginTop: 8 }}>
                                        Sin datos: {radar.errors.map(e => '@' + e.username).join(', ')} (cuenta no business o inaccesible)
                                    </p>
                                )}
                            </div>

                            {/* Top posts */}
                            {[['topByVirality', 'Más virales (engagement por 1K seguidores)', FaFire, '#EF4444'],
                              ['topByVolume', 'Más engagement absoluto', FaTrophy, '#F59E0B']].map(([key, title, TIcon, color]) => (
                                <div key={key} className="social-section-box">
                                    <h4><TIcon style={{ color }} /> {title}</h4>
                                    {(radar[key] || []).map((post, i) => (
                                        <div key={i} className="social-competitor-card">
                                            <div className="social-competitor-header">
                                                <strong>@{post.username}</strong>
                                                <span style={{ display: 'flex', gap: 10, fontSize: '0.75rem' }}>
                                                    <span><FaHeart style={{ color: '#E4405F' }} /> {fmt(post.likes)}</span>
                                                    <span><FaComment style={{ color: '#60A5FA' }} /> {fmt(post.comments)}</span>
                                                    {key === 'topByVirality' && <span style={{ color: '#EF4444' }}>{post.engagementPerK}/1K</span>}
                                                    <Badge bg={post.type === 'VIDEO' ? 'danger' : 'primary'} style={{ fontSize: '0.55rem' }}>{post.type === 'VIDEO' ? 'Reel' : post.type === 'CAROUSEL_ALBUM' ? 'Carrusel' : 'Post'}</Badge>
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.78rem', color: '#D1D5DB', margin: '6px 0' }}>{post.caption || '(sin caption)'}</p>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="social-competitor-assign" onClick={() => radarToIdea(post)}><FaPlus /> Idea al board</button>
                                                <a href={post.url} target="_blank" rel="noopener noreferrer" className="social-kanban-copy-btn" style={{ textDecoration: 'none' }}><FaExternalLinkAlt /> Ver post</a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <p style={{ color: '#6B7280', fontSize: '0.7rem' }}>Último escaneo: {new Date(radar.scannedAt).toLocaleString('es-MX')} · cache 6h</p>
                        </>
                    )}
                    {!radar && radarLoading && <div className="social-kanban-empty" style={{ padding: 40 }}>Escaneando {competitorsList.length || 11} cuentas vía Business Discovery...</div>}
                </div>
            )}

            {/* ═══ OVERVIEW ═══ */}
            {activeTab === 'overview' && (
                <div className="social-overview">
                    {/* Charts row */}
                    {insights?.charts?.reach && (
                        <div className="social-charts-row">
                            <div className="social-chart-card">
                                <h4>Alcance diario (IG)</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={insights.charts.reach}>
                                        <defs><linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E4405F" stopOpacity={0.3} /><stop offset="95%" stopColor="#E4405F" stopOpacity={0} /></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                                        <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                        <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="value" stroke="#E4405F" fill="url(#reachGrad)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="social-chart-card">
                                <h4>Nuevos seguidores/día (IG)</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={insights.charts.follower_count}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                                        <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                        <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Totals breakdown */}
                    {igTotals.total_interactions > 0 && (
                        <div className="social-totals-row">
                            <h4><FaFire style={{ color: '#F97316' }} /> Desglose de interacciones IG (últimos 14 días)</h4>
                            <div className="social-totals-grid">
                                <div className="social-total-card"><FaHeart style={{ color: '#E4405F' }} /><strong>{fmt(igTotals.likes)}</strong><span>Likes</span></div>
                                <div className="social-total-card"><FaComment style={{ color: '#60A5FA' }} /><strong>{fmt(igTotals.comments)}</strong><span>Comentarios</span></div>
                                <div className="social-total-card"><FaShare style={{ color: '#10B981' }} /><strong>{fmt(igTotals.shares)}</strong><span>Compartidos</span></div>
                                <div className="social-total-card"><FaBookmark style={{ color: '#F59E0B' }} /><strong>{fmt(igTotals.saves)}</strong><span>Guardados</span></div>
                                <div className="social-total-card"><FaEye style={{ color: '#A78BFA' }} /><strong>{fmt(igTotals.profile_views)}</strong><span>Visitas perfil</span></div>
                                <div className="social-total-card"><FaUsers style={{ color: '#06B6D4' }} /><strong>{fmt(igTotals.accounts_engaged)}</strong><span>Cuentas activas</span></div>
                            </div>
                        </div>
                    )}

                    {/* Best post */}
                    {ig?.bestPost && (
                        <div className="social-best-post">
                            <h4><FaTrophy style={{ color: '#F59E0B' }} /> Mejor post</h4>
                            <div className="social-best-content">
                                <div className="social-best-stats"><span><FaHeart /> {ig.bestPost.likes}</span><span><FaComment /> {ig.bestPost.comments}</span><Badge bg={ig.bestPost.type === 'VIDEO' ? 'danger' : 'primary'}>{ig.bestPost.type === 'VIDEO' ? 'Reel' : 'Post'}</Badge></div>
                                <p>{ig.bestPost.caption}</p>
                                {ig.bestPost.url && <a href={ig.bestPost.url} target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /> Ver</a>}
                            </div>
                        </div>
                    )}

                    {/* Platform overview cards */}
                    <div className="social-compare-grid">
                        {PLATFORMS.filter(p => !['overview', 'content', 'radar'].includes(p.id)).map(p => {
                            const Icon = p.icon; const d = metrics?.[p.id]; const pending = (tasks[p.id] || []).filter(t => !t.done).length;
                            return <div key={p.id} className="social-compare-card" onClick={() => setActiveTab(p.id)} style={{ cursor: 'pointer' }}>
                                <div className="social-compare-header" style={{ background: p.gradient || p.color }}><Icon /> {p.name} {!p.connected && <Badge bg="dark" style={{ fontSize: '0.5rem', marginLeft: 'auto' }}>Pendiente</Badge>}</div>
                                <div className="social-compare-body">
                                    {p.connected && d ? <>
                                        <div className="social-compare-row"><span>Seguidores</span><strong>{fmt(d.followers || d.visitors)}</strong></div>
                                        <div className="social-compare-row"><span>Engagement</span><strong>{d.engagement || d.bounce || '—'}</strong></div>
                                    </> : <div className="social-compare-row"><span style={{ color: '#6B7280' }}>Por conectar</span><strong>—</strong></div>}
                                    {pending > 0 && <div className="social-compare-row"><span style={{ color: '#EF4444' }}>Tareas</span><strong style={{ color: '#EF4444' }}>{pending}</strong></div>}
                                </div>
                            </div>;
                        })}
                    </div>
                </div>
            )}

            {/* ═══ PLATFORM TABS ═══ */}
            {PLATFORMS.filter(p => !['overview', 'content', 'radar'].includes(p.id)).map(p => {
                if (activeTab !== p.id) return null;
                const Icon = p.icon;
                const platformMetrics = metrics?.[p.id];
                const posts = p.id === 'instagram' ? igPosts : p.id === 'facebook' ? fbPosts : [];

                const metricsConfig = {
                    instagram: [['followers', 'Seguidores'], ['posts', 'Posts'], ['engagement', 'Engagement'], ['avgLikes', 'Likes/post'], ['avgComments', 'Comments/post'], ['totalLikes', 'Total likes'], ['totalComments', 'Total comments']],
                    facebook: [['followers', 'Seguidores'], ['likes', 'Likes página'], ['posts', 'Posts'], ['engagement', 'Eng/post'], ['totalReactions', 'Reacciones'], ['totalComments', 'Comentarios'], ['totalShares', 'Compartidos']],
                    web: [['visitors', 'Visitantes 7d'], ['pageviews', 'Pageviews'], ['bounce', 'Bounce Rate'], ['avgTime', 'Duración prom.']],
                    tiktok: [], threads: [], x: [], linkedin: [],
                }[p.id] || [];

                return (
                    <div key={p.id} className="social-platform-detail">
                        {/* Header */}
                        <div className="social-platform-header" style={{ background: `${p.color}10` }}>
                            <Icon style={{ color: p.color, fontSize: '2rem' }} />
                            <div>
                                <h3>{p.handle} {!p.connected && <Badge bg="warning" text="dark" style={{ fontSize: '0.6rem' }}>API pendiente</Badge>}</h3>
                                <p>{platformMetrics?.bio || p.name}</p>
                            </div>
                            {p.connected && platformMetrics && (
                                <div className="social-platform-quick-stats">
                                    {metricsConfig.slice(0, 3).map(([k, l]) => <div key={k}><strong>{fmt(platformMetrics[k])}</strong><span>{l}</span></div>)}
                                </div>
                            )}
                        </div>

                        {/* Charts for IG */}
                        {p.id === 'instagram' && insights?.charts?.reach && (
                            <div className="social-charts-row">
                                <div className="social-chart-card">
                                    <h4>Alcance diario</h4>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <AreaChart data={insights.charts.reach}>
                                            <defs><linearGradient id="igReach" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E4405F" stopOpacity={0.3} /><stop offset="95%" stopColor="#E4405F" stopOpacity={0} /></linearGradient></defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" /><XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 10 }} /><YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                                            <Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="value" stroke="#E4405F" fill="url(#igReach)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="social-chart-card">
                                    <h4>Nuevos seguidores/día</h4>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={insights.charts.follower_count}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" /><XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 10 }} /><YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                                            <Tooltip content={<ChartTooltip />} /><Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Metrics + detailed breakdown */}
                        {p.connected && platformMetrics ? (
                            <div className="social-metrics-grid">
                                {metricsConfig.map(([k, l]) => (
                                    <div key={k} className="social-metric-card"><span className="social-metric-label-sm">{l}</span><strong>{fmt(platformMetrics[k])}</strong></div>
                                ))}
                            </div>
                        ) : !p.connected && (
                            <div className="social-empty-state"><p>Conecta la API de {p.name} para ver métricas, comportamiento y rendimiento en tiempo real.</p></div>
                        )}

                        {/* Posts performance */}
                        {renderPostsTable(posts, p.id === 'facebook')}

                        {/* Tasks + Competitors side by side */}
                        <div className="social-two-cols">
                            {renderTasksSection(p.id)}
                            {renderCompetitors(p.id)}
                        </div>
                    </div>
                );
            })}

            {/* Publish Modal */}
            <Modal show={showPublish} onHide={() => setShowPublish(false)} centered>
                <Modal.Header closeButton style={{ background: '#111827', borderColor: '#1F2937', color: '#F9FAFB' }}><Modal.Title><FaPaperPlane /> Publicar</Modal.Title></Modal.Header>
                <Modal.Body style={{ background: '#111827', color: '#F9FAFB' }}>
                    <div className="social-publish-form">
                        <label>Plataforma</label>
                        <div className="social-publish-platforms">
                            <button className={publishPlatform === 'facebook' ? 'active' : ''} onClick={() => setPublishPlatform('facebook')}><FaFacebookF /> Facebook</button>
                            <button className={publishPlatform === 'instagram' ? 'active' : ''} onClick={() => setPublishPlatform('instagram')}><FaInstagram /> Instagram</button>
                        </div>
                        <label>Caption</label>
                        <textarea value={publishMsg} onChange={e => setPublishMsg(e.target.value)} placeholder="Escribe..." rows={4} />
                        <label>URL imagen {publishPlatform === 'instagram' && <span style={{ color: '#EF4444' }}>*</span>}</label>
                        <input value={publishImg} onChange={e => setPublishImg(e.target.value)} placeholder="https://..." />
                        <button className="social-publish-submit" onClick={handlePublish} disabled={publishing || (!publishMsg && !publishImg) || (publishPlatform === 'instagram' && !publishImg)}>
                            {publishing ? 'Publicando...' : `Publicar en ${publishPlatform}`}
                        </button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* ═══ CONTENT DETAIL MODAL (outside IIFE so it always renders) ═══ */}
            {viewingContent && (() => {
                const vc = viewingContent;
                const typeLabel = (CONTENT_TYPES.find(t => t.key === vc.type) || {}).label || 'Post';
                const plat = PLATFORMS.find(p => p.id === vc.platform);
                const platName = plat?.name || vc.platform || '';
                const statusInfo = CONTENT_STATUSES.find(s => s.key === vc.status) || CONTENT_STATUSES[0];
                const guide = CONTENT_GUIDES[vc.type] || CONTENT_GUIDES.post;
                const tips = CONTENT_TIPS[vc.type] || CONTENT_TIPS.post;

                return (
                    <div className="sd-overlay" onClick={() => setViewingContent(null)}>
                        <div className="sd-overlay-content" onClick={e => e.stopPropagation()}>
                            <div className="sd-overlay-header">
                                <h3>{typeLabel} — {platName} <Badge style={{ background: statusInfo.color, fontSize: '0.6rem', marginLeft: 8 }}>{statusInfo.label}</Badge></h3>
                                <button className="sd-overlay-close" onClick={() => setViewingContent(null)}><FaTimes /></button>
                            </div>
                            <div className="sd-overlay-body">
                                {/* Image */}
                                <div className="social-detail-preview"
                                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('sd-drag-over'); }}
                                    onDragLeave={e => { e.currentTarget.classList.remove('sd-drag-over'); }}
                                    onDrop={async e => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('sd-drag-over');
                                        // Handle dropped image file
                                        const file = e.dataTransfer.files?.[0];
                                        if (file && file.type.startsWith('image/')) {
                                            setGenerating(true);
                                            try {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                // Upload via existing upload endpoint or convert to base64 URL
                                                const reader = new FileReader();
                                                reader.onload = async () => {
                                                    try {
                                                        const { data } = await axioswithAuth.post('/social/upload-image', { imageUrl: reader.result });
                                                        if (data.success) {
                                                            setViewingContent({ ...vc, imageUrl: data.url });
                                                            patchContent(vc._id, { imageUrl: data.url });
                                                        }
                                                    } catch (err) { alert('Error al subir: ' + err.message); }
                                                    setGenerating(false);
                                                };
                                                reader.readAsDataURL(file);
                                            } catch { setGenerating(false); }
                                        }
                                        // Handle dropped image URL (from browser)
                                        const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
                                        if (url && (url.startsWith('http') && (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.webp') || url.includes('image')))) {
                                            setGenerating(true);
                                            try {
                                                const { data } = await axioswithAuth.post('/social/upload-image', { imageUrl: url });
                                                if (data.success) {
                                                    setViewingContent({ ...vc, imageUrl: data.url });
                                                    patchContent(vc._id, { imageUrl: data.url });
                                                }
                                            } catch (err) { alert('Error: ' + err.message); }
                                            setGenerating(false);
                                        }
                                    }}
                                >
                                    {vc.imageUrl ? (
                                        <div className="social-detail-image-wrap">
                                            <img src={vc.imageUrl} alt="" className="social-detail-image" />
                                            <p style={{ fontSize: '0.68rem', color: '#10B981', marginTop: 6 }}>Guardada en Cloudinary</p>
                                        </div>
                                    ) : (
                                        <div className="social-detail-no-image sd-drop-zone">
                                            <FaImage style={{ fontSize: '2.5rem', color: '#374151' }} />
                                            <p>Arrastra tu imagen aquí</p>
                                            <p style={{ fontSize: '0.68rem', color: '#6B7280' }}>o genera en Google Flow con el prompt de abajo</p>
                                        </div>
                                    )}
                                    {generating && <div className="sd-uploading"><FaSync className="social-spin" /> Subiendo a Cloudinary...</div>}
                                    <div className="social-detail-image-input">
                                        <label>O pega URL</label>
                                        <input value={vc.imageUrl || ''} onChange={e => { setViewingContent({ ...vc, imageUrl: e.target.value }); patchContent(vc._id, { imageUrl: e.target.value }); }} placeholder="https://..." />
                                    </div>
                                </div>

                                {/* Caption */}
                                <div className="social-detail-section">
                                    <h5><FaPenNib /> Caption / Copy</h5>
                                    <div className="social-detail-text-box"><pre>{vc.caption || 'Sin caption'}</pre></div>
                                    <button className="social-kanban-copy-btn" onClick={() => navigator.clipboard.writeText(vc.caption || '')}><FaCopy /> Copiar copy</button>
                                </div>

                                {vc.hashtags && <div className="social-detail-section"><h5><FaHashtag /> Hashtags</h5><p style={{ color: '#60A5FA', fontSize: '0.8rem', wordBreak: 'break-all' }}>{vc.hashtags}</p><button className="social-kanban-copy-btn" onClick={() => navigator.clipboard.writeText(vc.hashtags)}><FaCopy /> Copiar</button></div>}

                                {vc.imagePrompt && <div className="social-detail-section">
                                    <h5><FaMagic style={{ color: '#F59E0B' }} /> Prompt para Google Flow / Gemini</h5>
                                    <div className="social-detail-prompt-box"><pre>{vc.imagePrompt}</pre></div>
                                    <div className="sd-prompt-actions">
                                        <button className="social-kanban-copy-btn" style={{ borderColor: '#F59E0B40', color: '#F59E0B' }} onClick={() => navigator.clipboard.writeText(vc.imagePrompt)}><FaCopy /> Copiar prompt</button>
                                        <a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer" className="sd-open-gemini-btn">
                                            <FaExternalLinkAlt /> Abrir Gemini
                                        </a>
                                    </div>
                                    <p className="sd-prompt-hint">1. Copia el prompt → 2. Pégalo en Gemini / Google Flow → 3. Genera la imagen → 4. Arrastra la imagen de vuelta aquí</p>
                                </div>}

                                {vc.reelIdea && vc.reelIdea.length > 3 && <div className="social-detail-section"><h5><FaVideo style={{ color: '#E4405F' }} /> Guión del Reel</h5><div className="social-detail-text-box"><pre>{vc.reelIdea}</pre></div></div>}

                                {/* Guide */}
                                <div className="social-detail-section">
                                    <h5><FaClipboardList style={{ color: '#A78BFA' }} /> Guía paso a paso</h5>
                                    <div className="social-detail-guide">{guide.map(g => <div key={g.step} className="social-guide-step"><div className="social-guide-num">{g.step}</div><div><strong>{g.title}</strong><p>{g.desc}</p></div></div>)}</div>
                                </div>

                                {/* Tips */}
                                <div className="social-detail-section">
                                    <h5><FaFire style={{ color: '#F97316' }} /> Tips de rendimiento</h5>
                                    <ul className="social-detail-tips">{tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                                </div>

                                {/* Notes */}
                                <div className="social-detail-section">
                                    <h5><FaEdit /> Notas</h5>
                                    <textarea value={vc.notes || ''} onChange={e => { setViewingContent({ ...vc, notes: e.target.value }); patchContent(vc._id, { notes: e.target.value }); }} placeholder="Notas..." rows={2} />
                                </div>

                                {/* Actions */}
                                <div className="social-detail-actions">
                                    <button className="social-detail-edit-btn" onClick={() => { editContent(vc); setViewingContent(null); }}><FaEdit /> Editar</button>
                                    {vc.status !== 'published' && <button className="social-detail-advance-btn" onClick={() => { const idx = CONTENT_STATUSES.findIndex(s => s.key === vc.status); const next = CONTENT_STATUSES[idx + 1]?.key; if (next) { moveContent(vc._id, next); setViewingContent({ ...vc, status: next }); } }}><FaCheckCircle /> Avanzar</button>}
                                    <button className="social-detail-delete-btn" onClick={() => { deleteContent(vc._id); setViewingContent(null); }}><FaTrash /> Eliminar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default AdminSocial;
