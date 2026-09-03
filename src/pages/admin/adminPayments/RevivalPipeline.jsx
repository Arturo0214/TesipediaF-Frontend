import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import axiosWithAuth from '../../../utils/axioswithAuth';
import SalesQuote from '../../SalesQuote/SalesQuote';
import {
    FaSync, FaPhone, FaWhatsapp, FaEnvelope, FaSearch,
    FaFilter, FaChevronDown, FaChevronUp, FaStickyNote,
    FaUserTag, FaCheckCircle, FaClock, FaTimesCircle,
    FaFireAlt, FaExclamationTriangle, FaCalendarAlt,
    FaPaperclip, FaFileAlt, FaTrashAlt, FaFileInvoiceDollar, FaDownload,
    FaCalculator, FaFilePdf, FaChevronLeft, FaChevronRight, FaTimes, FaPlus
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const REVIVAL_STATUSES = {
    pendiente: { label: 'Pendiente', color: '#f59e0b', icon: <FaClock /> },
    contactado: { label: 'Contactado', color: '#3b82f6', icon: <FaPhone /> },
    interesado: { label: 'Interesado', color: '#8b5cf6', icon: <FaFireAlt /> },
    negociando: { label: 'Negociando', color: '#06b6d4', icon: <FaExclamationTriangle /> },
    convertido: { label: 'Convertido', color: '#10b981', icon: <FaCheckCircle /> },
    descartado: { label: 'Descartado', color: '#ef4444', icon: <FaTimesCircle /> },
};

const ESTADO_LABELS = {
    cotizacion_enviada: { label: 'Cotizacion enviada', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    esperando_aprobacion: { label: 'Esperando aprobacion', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
    calificando: { label: 'Calificando (avanzado)', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    descartado: { label: 'Descartado', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

const VENDOR_NAMES = {
    arturo: 'Arturo', sandy: 'Sandy', hugo: 'Hugo', 'adrian nava': 'Adrian', tania: 'Tania',
};

// Personas asignables en revival (incluye a Tania y Arturo para reactivación manual)
const ASIGNABLES = [
    { value: 'tania', label: 'Tania' },
    { value: 'arturo', label: 'Arturo' },
    { value: 'sandy', label: 'Sandy' },
    { value: 'hugo', label: 'Hugo' },
    { value: 'adrian nava', label: 'Adrian Nava' },
];

// Pestañas: caliente (en juego) + los 2 buckets de descartados reactivables
const TABS = [
    { key: 'activo', label: 'Calientes', icon: <FaFireAlt />, endpoint: '/api/v1/whatsapp/revival-pipeline', live: true },
    { key: 'con_datos', label: 'Con datos', icon: <FaUserTag />, endpoint: '/api/v1/whatsapp/reactivation-pipeline?bucket=con_datos', live: true },
    { key: 'solo_hola', label: 'Solo "hola"', icon: <FaEnvelope />, endpoint: '/api/v1/whatsapp/reactivation-pipeline?bucket=solo_hola', live: false },
];

// Parseo tolerante del historial_chat (mismo espíritu que el backend): quita el "=" inicial,
// intenta JSON.parse; si truena, sanea caracteres de control y reintenta; si no, [].
const parseHistorialChat = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw !== 'string') return [];
    const s = raw.replace(/^=/, '');
    if (!s.trim()) return [];
    try { return JSON.parse(s); } catch { /* recuperar */ }
    try { return JSON.parse(s.replace(new RegExp('[\u0000-\u001F]', 'g'), '')); } catch { /* irrecuperable */ }
    return [];
};

// Normaliza un mensaje del historial a { isUser, who, content, mediaUrl, timestamp }.
// Limpia prefijos [TEMPLATE:...], [HUMANO]/[HUMANO:nombre] y bloques [STATE:{...}].
const normalizeMsg = (msg) => {
    const isUser = msg.role === 'user';
    let content = msg.content || '';
    let who = isUser ? 'Cliente' : 'Sofia';
    if (!isUser) {
        if (msg.isTemplate || content.startsWith('[TEMPLATE:')) {
            content = content.replace(/^\[TEMPLATE:[^\]]*\]\s*/, '');
            who = 'Plantilla';
        }
        const h = content.match(/^\[HUMANO:([^\]]+)\]\s*/);
        if (h) { who = h[1]; content = content.replace(h[0], ''); }
        else if (content.startsWith('[HUMANO]')) { who = 'Agente'; content = content.replace('[HUMANO] ', ''); }
        content = content.replace(/\[STATE:[\s\S]*?\]/g, '').trim();
    }
    return { isUser, who, content, mediaUrl: msg.mediaUrl, timestamp: msg.timestamp };
};

// Convierte el precio (string "$6,390.00" o número) a número. 0 si no hay.
const parsePrecio = (val) => {
    if (val == null || val === '') return 0;
    if (typeof val === 'number') return val;
    const n = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
};

// Hora corta tolerante (unix seg/ms o ISO). '' si no parsea.
const fmtMsgTime = (ts) => {
    if (!ts) return '';
    const d = typeof ts === 'number' ? new Date(ts < 1e12 ? ts * 1000 : ts) : new Date(ts);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('es-MX', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// Hook responsive: true en pantallas de celular (≤640px)
function useIsMobile() {
    const [m, setM] = useState(typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 640px)');
        const on = () => setM(mq.matches);
        mq.addEventListener('change', on);
        return () => mq.removeEventListener('change', on);
    }, []);
    return m;
}

function RevivalPipeline() {
    const isMobile = useIsMobile();
    const [tab, setTab] = useState('activo');
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('all');
    const [filterRevival, setFilterRevival] = useState('all');
    const [filterAsignado, setFilterAsignado] = useState('all');
    const [expandedLead, setExpandedLead] = useState(null);
    const [modalLead, setModalLead] = useState(null);
    const [saving, setSaving] = useState({});
    const [lastSync, setLastSync] = useState(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef(null);
    const [conversations, setConversations] = useState({}); // { [waId]: mensajes normalizados[] }
    const [loadingConv, setLoadingConv] = useState(null);   // waId cuya conversación se está cargando

    // Usuario actual (para estampar "atendido por" en las notas)
    const { user: authUser } = useSelector((s) => s.auth || {});
    const currentUserName = authUser?.name || authUser?.nombre || authUser?.email || 'Admin';

    // Paginación (client-side, 50 por página)
    const PAGE_SIZE = 50;
    const [page, setPage] = useState(1);

    // Filtros extra
    const [filterCarrera, setFilterCarrera] = useState('all');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [precioMin, setPrecioMin] = useState('');
    const [precioMax, setPrecioMax] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Modales
    const [pdfViewer, setPdfViewer] = useState(null); // url del PDF a ver inline
    const [calcLead, setCalcLead] = useState(null);   // lead que se está cotizando
    const [newNote, setNewNote] = useState({});       // { [waId]: texto en edición }
    const [savingNote, setSavingNote] = useState({}); // { [waId]: bool }

    const tabConfig = TABS.find(t => t.key === tab) || TABS[0];

    // Carga la pestaña actual. silent=true para auto-refresh sin spinner ni perder scroll.
    const fetchPipeline = async ({ silent = false, offset = 0 } = {}) => {
        if (!silent) setLoading(true);
        try {
            const url = tabConfig.endpoint + (offset ? (tabConfig.endpoint.includes('?') ? '&' : '?') + `offset=${offset}` : '');
            const res = await axiosWithAuth.get(url);
            // /revival-pipeline devuelve array; /reactivation-pipeline devuelve { leads, total }
            const rows = Array.isArray(res.data) ? res.data : (res.data.leads || []);
            const tot = Array.isArray(res.data) ? res.data.length : (res.data.total ?? rows.length);
            setLeads(prev => offset ? [...prev, ...rows] : rows);
            setTotal(tot);
            setLastSync(new Date());
        } catch (err) {
            if (!silent) toast.error('Error cargando pipeline');
        }
        if (!silent) setLoading(false);
    };

    const loadMore = async () => {
        setLoadingMore(true);
        await fetchPipeline({ silent: true, offset: leads.length });
        setLoadingMore(false);
    };

    // Recargar al cambiar de pestaña
    useEffect(() => {
        setLeads([]); setTotal(0); setExpandedLead(null);
        fetchPipeline();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    // Auto-refresh en vivo (solo buckets ligeros) — para que tú y Tania vean el estatus al instante.
    useEffect(() => {
        if (!tabConfig.live) return;
        const id = setInterval(() => fetchPipeline({ silent: true }), 45000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    const updateRevival = async (waId, data) => {
        setSaving(prev => ({ ...prev, [waId]: true }));
        try {
            await axiosWithAuth.patch(`/api/v1/whatsapp/leads/${waId}/revival`, data);
            setLeads(prev => prev.map(l => l.wa_id === waId ? { ...l, ...data, revival_last_contact: new Date().toISOString() } : l));
            toast.success('Actualizado');
        } catch {
            toast.error('Error al actualizar');
        }
        setSaving(prev => ({ ...prev, [waId]: false }));
    };

    // Persiste el array de archivos del lead (Supabase) y refleja en UI (lista + modal abierto).
    const persistFiles = async (waId, nextFiles) => {
        await axiosWithAuth.patch(`/api/v1/whatsapp/leads/${waId}/revival`, { revival_files: nextFiles });
        setLeads(prev => prev.map(l => l.wa_id === waId ? { ...l, revival_files: nextFiles } : l));
        setModalLead(prev => (prev && prev.wa_id === waId) ? { ...prev, revival_files: nextFiles } : prev);
    };

    // Sube un archivo a Cloudinary vía backend y lo anexa al lead.
    const handleUploadFile = async (waId, e) => {
        const file = e.target.files?.[0];
        if (e.target) e.target.value = '';
        if (!file) return;
        setUploadingFile(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const up = await axiosWithAuth.post('/api/v1/whatsapp/revival-upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const current = Array.isArray(modalLead?.revival_files) ? modalLead.revival_files : [];
            await persistFiles(waId, [...current, up.data]);
            toast.success('Archivo adjuntado');
        } catch {
            toast.error('Error subiendo archivo');
        }
        setUploadingFile(false);
    };

    const handleDeleteFile = async (waId, publicId) => {
        const current = Array.isArray(modalLead?.revival_files) ? modalLead.revival_files : [];
        const next = current.filter(f => f.publicId !== publicId);
        try {
            await persistFiles(waId, next);
            toast.success('Archivo eliminado');
        } catch {
            toast.error('Error eliminando archivo');
        }
    };

    // Agrega una nota a la bitácora del lead (revival_notes_log) con texto, usuario y timestamp.
    const addNote = async (waId, currentLog) => {
        const text = (newNote[waId] || '').trim();
        if (!text) return;
        setSavingNote(prev => ({ ...prev, [waId]: true }));
        const entry = { text, by: currentUserName, at: new Date().toISOString() };
        const nextLog = [...(Array.isArray(currentLog) ? currentLog : []), entry];
        try {
            await axiosWithAuth.patch(`/api/v1/whatsapp/leads/${waId}/revival`, { revival_notes_log: nextLog });
            setLeads(prev => prev.map(l => l.wa_id === waId ? { ...l, revival_notes_log: nextLog, revival_last_contact: new Date().toISOString() } : l));
            setNewNote(prev => ({ ...prev, [waId]: '' }));
            toast.success('Nota guardada');
        } catch {
            toast.error('Error al guardar la nota');
        }
        setSavingNote(prev => ({ ...prev, [waId]: false }));
    };

    // Expande/colapsa un lead. Al expandir, carga SU conversación de WhatsApp (una sola vez).
    const toggleExpand = async (waId) => {
        const willExpand = expandedLead !== waId;
        setExpandedLead(willExpand ? waId : null);
        if (!willExpand || conversations[waId]) return;
        setLoadingConv(waId);
        try {
            const res = await axiosWithAuth.get(`/api/v1/whatsapp/leads/${waId}`);
            const msgs = parseHistorialChat(res.data?.historial_chat)
                .map(normalizeMsg)
                .filter(m => m.content || m.mediaUrl);
            setConversations(prev => ({ ...prev, [waId]: msgs }));
        } catch {
            setConversations(prev => ({ ...prev, [waId]: [] }));
        }
        setLoadingConv(null);
    };

    const daysSince = (dateStr) => {
        if (!dateStr) return null;
        const diff = Date.now() - new Date(dateStr).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatMoney = (val) => {
        if (!val) return '-';
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(val);
    };

    const filtered = useMemo(() => {
        const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
        return leads.filter(l => {
            // La regla "3+ días sin actividad" solo aplica a leads calientes.
            // Los descartados (reactivación) son viejos por definición: se muestran todos.
            if (tab === 'activo') {
                const lastActivity = new Date(l.updated_at || l.created_at).getTime();
                if (lastActivity > threeDaysAgo) return false;
            }
            // Un lead marcado como DESCARTADO en revival ya no aparece en la lista
            // (salvo que se esté filtrando explícitamente por ese estado).
            if ((l.revival_status || 'pendiente') === 'descartado' && filterRevival !== 'descartado') return false;
            if (filterEstado !== 'all' && l.estado_sofia !== filterEstado) return false;
            if (filterRevival !== 'all' && (l.revival_status || 'pendiente') !== filterRevival) return false;
            if (filterAsignado !== 'all') {
                const asig = (l.revival_assigned_to || '').toLowerCase();
                if (filterAsignado === 'sin' ? asig !== '' : asig !== filterAsignado) return false;
            }
            if (filterCarrera !== 'all' && (l.carrera || '') !== filterCarrera) return false;
            // Filtro por fecha (primer contacto / created_at)
            if (fechaDesde && new Date(l.created_at) < new Date(fechaDesde)) return false;
            if (fechaHasta && new Date(l.created_at) > new Date(fechaHasta + 'T23:59:59')) return false;
            // Filtro por precio de la cotización
            if (precioMin !== '' || precioMax !== '') {
                const p = parsePrecio(l.precio);
                if (precioMin !== '' && p < parseFloat(precioMin)) return false;
                if (precioMax !== '' && p > parseFloat(precioMax)) return false;
            }
            if (searchTerm) {
                const q = searchTerm.toLowerCase();
                const name = (l.nombre || '').toLowerCase();
                const carrera = (l.carrera || '').toLowerCase();
                const tema = (l.tema || '').toLowerCase();
                if (!name.includes(q) && !carrera.includes(q) && !tema.includes(q) && !(l.wa_id || '').includes(q)) return false;
            }
            return true;
        });
    }, [leads, filterEstado, filterRevival, filterAsignado, filterCarrera, fechaDesde, fechaHasta, precioMin, precioMax, searchTerm, tab]);

    // Carreras/áreas distintas para el filtro
    const carreras = useMemo(() => {
        const set = new Set();
        for (const l of leads) if (l.carrera) set.add(l.carrera);
        return [...set].sort((a, b) => a.localeCompare(b));
    }, [leads]);

    // Paginación: 50 por página sobre la lista ya filtrada
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageClamped = Math.min(page, totalPages);
    const paged = useMemo(
        () => filtered.slice((pageClamped - 1) * PAGE_SIZE, pageClamped * PAGE_SIZE),
        [filtered, pageClamped]
    );

    // Volver a la página 1 cuando cambian filtros/pestaña/búsqueda
    useEffect(() => { setPage(1); }, [tab, filterEstado, filterRevival, filterAsignado, filterCarrera, fechaDesde, fechaHasta, precioMin, precioMax, searchTerm]);

    // Stats
    const stats = useMemo(() => {
        const total = leads.length;
        const byRevival = {};
        const byEstado = {};
        let totalPrecio = 0;
        for (const l of leads) {
            const rs = l.revival_status || 'pendiente';
            byRevival[rs] = (byRevival[rs] || 0) + 1;
            byEstado[l.estado_sofia] = (byEstado[l.estado_sofia] || 0) + 1;
            totalPrecio += parsePrecio(l.precio);
        }
        return { total, byRevival, byEstado, totalPrecio };
    }, [leads]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FaFireAlt style={{ color: '#f59e0b' }} /> Pipeline de Revivals
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '4px 0 0' }}>
                        {tab === 'activo'
                            ? <>{stats.total} leads calientes &middot; {formatMoney(stats.totalPrecio)} en pipeline</>
                            : tab === 'con_datos'
                                ? <>{total} descartados que SÍ dieron datos &middot; prospectos reales para reactivar</>
                                : <>{total} descartados que solo mandaron "hola" &middot; baja prioridad / acción masiva</>}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {tabConfig.live && lastSync && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                            En vivo &middot; {lastSync.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    <button
                        onClick={() => fetchPipeline()}
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                            background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8,
                            fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                        }}
                    >
                        <FaSync className={loading ? 'spinning' : ''} /> Actualizar
                    </button>
                </div>
            </div>

            {/* Tabs: Calientes | Con datos | Solo "hola" */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #1F2937', paddingBottom: 2 }}>
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                            background: tab === t.key ? '#f59e0b' : 'transparent',
                            color: tab === t.key ? '#fff' : '#9ca3af',
                            border: 'none', borderRadius: '8px 8px 0 0',
                            fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                        }}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                {Object.entries(REVIVAL_STATUSES).map(([key, { label, color, icon }]) => (
                    <div
                        key={key}
                        onClick={() => setFilterRevival(filterRevival === key ? 'all' : key)}
                        style={{
                            background: filterRevival === key ? color + '20' : '#111827',
                            border: `1px solid ${filterRevival === key ? color : '#1F2937'}`,
                            borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: '0.75rem', fontWeight: 600 }}>
                            {icon} {label}
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F9FAFB', marginTop: 4 }}>
                            {stats.byRevival[key] || 0}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? 0 : 200 }}>
                    <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, carrera, tema..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #1F2937',
                            borderRadius: 8, fontSize: '0.85rem', outline: 'none',
                            background: '#111827', color: '#F9FAFB',
                        }}
                    />
                </div>
                {tab === 'activo' && (
                    <select
                        value={filterEstado}
                        onChange={e => setFilterEstado(e.target.value)}
                        style={{
                            padding: '8px 12px', border: '1px solid #1F2937', borderRadius: 8,
                            fontSize: '0.85rem', background: '#111827', color: '#F9FAFB', cursor: 'pointer',
                        }}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="cotizacion_enviada">Cotizacion enviada</option>
                        <option value="esperando_aprobacion">Esperando aprobacion</option>
                        <option value="calificando">Calificando (avanzado)</option>
                    </select>
                )}
                {/* Filtro por persona: cada quien ve su cola (tú y Tania) */}
                <select
                    value={filterAsignado}
                    onChange={e => setFilterAsignado(e.target.value)}
                    title="Filtrar por persona asignada"
                    style={{
                        padding: '8px 12px', border: '1px solid #1F2937', borderRadius: 8,
                        fontSize: '0.85rem', background: '#111827', color: '#F9FAFB', cursor: 'pointer',
                    }}
                >
                    <option value="all">Todas las personas</option>
                    <option value="sin">Sin asignar</option>
                    {ASIGNABLES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
                <button
                    onClick={() => setShowFilters(v => !v)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                        background: showFilters ? '#f59e0b' : '#111827', color: showFilters ? '#fff' : '#9ca3af',
                        border: '1px solid #1F2937', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    }}
                >
                    <FaFilter /> Filtros
                </button>
            </div>

            {/* Filtros avanzados: carrera/área, fecha, precio */}
            {showFilters && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', background: '#0B0F1A', border: '1px solid #1F2937', borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <label style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Carrera / Área</label>
                        <select value={filterCarrera} onChange={e => setFilterCarrera(e.target.value)}
                            style={{ padding: '7px 10px', border: '1px solid #1F2937', borderRadius: 8, fontSize: '0.82rem', background: '#111827', color: '#F9FAFB', cursor: 'pointer', maxWidth: 260 }}>
                            <option value="all">Todas</option>
                            {carreras.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <label style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Primer contacto desde</label>
                        <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
                            style={{ padding: '7px 10px', border: '1px solid #1F2937', borderRadius: 8, fontSize: '0.82rem', background: '#111827', color: '#F9FAFB' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <label style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Hasta</label>
                        <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
                            style={{ padding: '7px 10px', border: '1px solid #1F2937', borderRadius: 8, fontSize: '0.82rem', background: '#111827', color: '#F9FAFB' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <label style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Precio cotización</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="number" placeholder="mín" value={precioMin} onChange={e => setPrecioMin(e.target.value)}
                                style={{ width: 90, padding: '7px 10px', border: '1px solid #1F2937', borderRadius: 8, fontSize: '0.82rem', background: '#111827', color: '#F9FAFB' }} />
                            <span style={{ color: '#6b7280' }}>–</span>
                            <input type="number" placeholder="máx" value={precioMax} onChange={e => setPrecioMax(e.target.value)}
                                style={{ width: 90, padding: '7px 10px', border: '1px solid #1F2937', borderRadius: 8, fontSize: '0.82rem', background: '#111827', color: '#F9FAFB' }} />
                        </div>
                    </div>
                    {(filterCarrera !== 'all' || fechaDesde || fechaHasta || precioMin !== '' || precioMax !== '') && (
                        <button
                            onClick={() => { setFilterCarrera('all'); setFechaDesde(''); setFechaHasta(''); setPrecioMin(''); setPrecioMax(''); }}
                            style={{ padding: '7px 12px', background: '#1F2937', color: '#F9FAFB', border: '1px solid #374151', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                            <FaTimes /> Limpiar
                        </button>
                    )}
                </div>
            )}

            {/* Leads List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    <FaSync className="spinning" style={{ fontSize: '1.5rem', marginBottom: 8 }} />
                    <p>Cargando pipeline...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    <p>No se encontraron leads con los filtros actuales</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {paged.map(lead => {
                        const revStatus = lead.revival_status || 'pendiente';
                        const revConfig = REVIVAL_STATUSES[revStatus] || REVIVAL_STATUSES.pendiente;
                        const estadoConfig = ESTADO_LABELS[lead.estado_sofia] || { label: lead.estado_sofia, color: '#6b7280', bg: 'rgba(107,114,128,0.15)' };
                        const days = daysSince(lead.updated_at);
                        const isExpanded = expandedLead === lead.wa_id;
                        const isSaving = saving[lead.wa_id];

                        return (
                            <div
                                key={lead.wa_id}
                                style={{
                                    background: '#111827', borderRadius: 10, border: '1px solid #1F2937',
                                    borderLeft: `4px solid ${revConfig.color}`, overflow: 'hidden',
                                }}
                            >
                                {/* Main Row */}
                                <div
                                    onClick={() => toggleExpand(lead.wa_id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 16px', cursor: 'pointer', gap: 12, flexWrap: 'wrap',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: isMobile ? 0 : 200 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F9FAFB' }}>
                                                {lead.nombre || 'Sin nombre'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                                                {lead.wa_id && <span style={{ color: '#9CA3AF' }}>+{lead.wa_id}</span>}
                                                {lead.carrera && <span>&middot; {lead.carrera}</span>}
                                                {lead.tipo_servicio && <span>&middot; {lead.tipo_servicio}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        {/* Estado Sofia badge */}
                                        <span style={{
                                            background: estadoConfig.bg, color: estadoConfig.color,
                                            fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px',
                                            borderRadius: 6, whiteSpace: 'nowrap',
                                        }}>
                                            {estadoConfig.label}
                                        </span>

                                        {/* Revival status badge */}
                                        <span style={{
                                            background: revConfig.color + '18', color: revConfig.color,
                                            fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px',
                                            borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4,
                                        }}>
                                            {revConfig.icon} {revConfig.label}
                                        </span>

                                        {/* Days since update */}
                                        {days !== null && (
                                            <span style={{
                                                fontSize: '0.65rem', color: days > 7 ? '#ef4444' : days > 3 ? '#f59e0b' : '#6b7280',
                                                fontWeight: 600,
                                            }}>
                                                {days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days}d`}
                                            </span>
                                        )}

                                        {/* Atendido por */}
                                        {lead.atendido_por && (
                                            <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>
                                                <FaUserTag style={{ marginRight: 3 }} />
                                                {VENDOR_NAMES[lead.atendido_por.toLowerCase()] || lead.atendido_por}
                                            </span>
                                        )}

                                        <button
                                            onClick={(e) => { e.stopPropagation(); setModalLead(lead); }}
                                            style={{
                                                padding: '3px 10px', background: '#3b82f6', color: '#fff',
                                                border: 'none', borderRadius: 5, fontSize: '0.68rem',
                                                fontWeight: 600, cursor: 'pointer',
                                            }}
                                        >Ver</button>

                                        {isExpanded ? <FaChevronUp style={{ color: '#9ca3af' }} /> : <FaChevronDown style={{ color: '#9ca3af' }} />}
                                    </div>
                                </div>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid #1F2937' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 12 }}>
                                            {/* Info Column */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Datos del Lead</div>
                                                {lead.wa_id && <div style={{ fontSize: '0.8rem', color: '#D1D5DB' }}><strong>Telefono:</strong> +{lead.wa_id}</div>}
                                                {lead.tema && <div style={{ fontSize: '0.8rem', color: '#D1D5DB' }}><strong>Tema:</strong> {lead.tema}</div>}
                                                {lead.nivel && <div style={{ fontSize: '0.8rem', color: '#D1D5DB' }}><strong>Nivel:</strong> {lead.nivel}</div>}
                                                {lead.paginas && <div style={{ fontSize: '0.8rem', color: '#D1D5DB' }}><strong>Paginas:</strong> {lead.paginas}</div>}
                                                {lead.fecha_entrega && <div style={{ fontSize: '0.8rem', color: '#D1D5DB' }}><strong>Entrega:</strong> {lead.fecha_entrega}</div>}
                                                <div style={{ fontSize: '0.8rem', color: '#D1D5DB' }}><strong>Primer contacto:</strong> {formatDate(lead.created_at)}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#D1D5DB' }}><strong>Ultimo movimiento:</strong> {formatDate(lead.updated_at)}</div>
                                                {lead.ultimo_mensaje_preview && (
                                                    <div style={{ fontSize: '0.78rem', color: '#9CA3AF', fontStyle: 'italic', background: '#0B0F1A', padding: 8, borderRadius: 6, marginTop: 4 }}>
                                                        "{lead.ultimo_mensaje_preview}"
                                                    </div>
                                                )}

                                                {/* Contact buttons */}
                                                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                                                    <a
                                                        href={`https://wa.me/${lead.wa_id}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: 4,
                                                            padding: '6px 12px', background: '#25d366', color: '#fff',
                                                            borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                                                            textDecoration: 'none',
                                                        }}
                                                    >
                                                        <FaWhatsapp /> WhatsApp
                                                    </a>
                                                    <button
                                                        onClick={() => setCalcLead(lead)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: 4,
                                                            padding: '6px 12px', background: '#f59e0b', color: '#fff',
                                                            border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                                        }}
                                                    >
                                                        <FaCalculator /> Cotizar
                                                    </button>
                                                    {lead.pdf_url && (
                                                        <button
                                                            onClick={() => setPdfViewer(lead.pdf_url)}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 4,
                                                                padding: '6px 12px', background: '#6366f1', color: '#fff',
                                                                border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                                            }}
                                                        >
                                                            <FaFilePdf /> Ver Cotización
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* CRM Column */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Gestion Revival</div>

                                                {/* Revival Status */}
                                                <div>
                                                    <label style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>Estado Revival</label>
                                                    <select
                                                        value={revStatus}
                                                        disabled={isSaving}
                                                        onChange={e => updateRevival(lead.wa_id, { revival_status: e.target.value })}
                                                        style={{
                                                            width: '100%', padding: '7px 10px', border: '1px solid #1F2937',
                                                            borderRadius: 6, fontSize: '0.82rem', background: '#0B0F1A', color: '#F9FAFB', marginTop: 3,
                                                        }}
                                                    >
                                                        {Object.entries(REVIVAL_STATUSES).map(([k, v]) => (
                                                            <option key={k} value={k}>{v.label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Assigned To */}
                                                <div>
                                                    <label style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>Asignado a</label>
                                                    <select
                                                        value={lead.revival_assigned_to || ''}
                                                        disabled={isSaving}
                                                        onChange={e => updateRevival(lead.wa_id, { revival_assigned_to: e.target.value })}
                                                        style={{
                                                            width: '100%', padding: '7px 10px', border: '1px solid #1F2937',
                                                            borderRadius: 6, fontSize: '0.82rem', background: '#0B0F1A', color: '#F9FAFB', marginTop: 3,
                                                        }}
                                                    >
                                                        <option value="">Sin asignar</option>
                                                        {ASIGNABLES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                                    </select>
                                                </div>

                                                {/* Bitácora de Notas (con fecha, hora y usuario) */}
                                                <div>
                                                    <label style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>Notas de seguimiento</label>
                                                    {/* Historial de notas */}
                                                    {(() => {
                                                        const log = Array.isArray(lead.revival_notes_log) ? lead.revival_notes_log : [];
                                                        const legacy = (lead.revival_notes || '').trim();
                                                        if (!log.length && !legacy) return (
                                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic', margin: '4px 0' }}>Sin notas todavía.</div>
                                                        );
                                                        return (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '5px 0', maxHeight: 180, overflowY: 'auto' }}>
                                                                {legacy && !log.length && (
                                                                    <div style={{ background: '#0B0F1A', border: '1px solid #1F2937', borderRadius: 6, padding: '6px 9px' }}>
                                                                        <div style={{ fontSize: '0.8rem', color: '#F9FAFB', whiteSpace: 'pre-wrap' }}>{legacy}</div>
                                                                        <div style={{ fontSize: '0.62rem', color: '#6b7280', marginTop: 3 }}>nota previa (sin autor)</div>
                                                                    </div>
                                                                )}
                                                                {log.map((n, i) => (
                                                                    <div key={i} style={{ background: '#0B0F1A', border: '1px solid #1F2937', borderRadius: 6, padding: '6px 9px' }}>
                                                                        <div style={{ fontSize: '0.8rem', color: '#F9FAFB', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.text}</div>
                                                                        <div style={{ fontSize: '0.62rem', color: '#6b7280', marginTop: 3, display: 'flex', gap: 6, alignItems: 'center' }}>
                                                                            <FaUserTag /> {n.by || 'Admin'} &middot; {fmtMsgTime(n.at)}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                    {/* Agregar nota */}
                                                    <textarea
                                                        value={newNote[lead.wa_id] || ''}
                                                        onChange={e => setNewNote(prev => ({ ...prev, [lead.wa_id]: e.target.value }))}
                                                        placeholder="Escribe una nota… (se guarda con tu nombre, fecha y hora)"
                                                        rows={2}
                                                        style={{
                                                            width: '100%', padding: '7px 10px', border: '1px solid #1F2937',
                                                            borderRadius: 6, fontSize: '0.82rem', resize: 'vertical', marginTop: 3,
                                                            background: '#0B0F1A', color: '#F9FAFB', fontFamily: 'inherit',
                                                        }}
                                                    />
                                                    {(newNote[lead.wa_id] || '').trim() && (
                                                        <button
                                                            onClick={() => addNote(lead.wa_id, lead.revival_notes_log)}
                                                            disabled={savingNote[lead.wa_id]}
                                                            style={{
                                                                marginTop: 4, padding: '5px 12px', background: '#10b981',
                                                                color: '#fff', border: 'none', borderRadius: 6,
                                                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', gap: 5,
                                                            }}
                                                        >
                                                            <FaPlus size={10} /> {savingNote[lead.wa_id] ? 'Guardando...' : 'Agregar nota'}
                                                        </button>
                                                    )}
                                                </div>

                                                {lead.revival_last_contact && (
                                                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                                                        <FaCalendarAlt style={{ marginRight: 4 }} />
                                                        Ultimo contacto revival: {formatDate(lead.revival_last_contact)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Conversación WhatsApp (solo este lead) */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: isMobile ? 0 : 240 }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <FaWhatsapp style={{ color: '#25d366' }} /> Conversación WhatsApp
                                                </div>
                                                <div style={{ background: '#0B0F1A', border: '1px solid #1F2937', borderRadius: 8, padding: 10, maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {loadingConv === lead.wa_id ? (
                                                        <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Cargando conversación...</div>
                                                    ) : (conversations[lead.wa_id]?.length ? (
                                                        conversations[lead.wa_id].slice(-50).map((m, i) => (
                                                            <div key={i} style={{ alignSelf: m.isUser ? 'flex-start' : 'flex-end', maxWidth: '88%' }}>
                                                                <div style={{ fontSize: '0.6rem', color: '#6b7280', marginBottom: 2, textAlign: m.isUser ? 'left' : 'right' }}>
                                                                    {m.who}{fmtMsgTime(m.timestamp) ? ` · ${fmtMsgTime(m.timestamp)}` : ''}
                                                                </div>
                                                                <div style={{ background: m.isUser ? '#1F2937' : '#065f46', color: '#F9FAFB', padding: '6px 10px', borderRadius: 8, fontSize: '0.78rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                                    {m.mediaUrl && <a href={m.mediaUrl} target="_blank" rel="noreferrer" style={{ color: '#93C5FD', display: 'block', marginBottom: 4 }}>📎 Archivo adjunto</a>}
                                                                    {m.content || (m.mediaUrl ? '' : '—')}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div style={{ fontSize: '0.78rem', color: '#6b7280', fontStyle: 'italic' }}>Sin conversación registrada para este lead.</div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Paginación (50 por página) */}
            {!loading && filtered.length > PAGE_SIZE && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '6px 0' }}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={pageClamped <= 1}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                            background: '#1F2937', color: '#F9FAFB', border: '1px solid #374151', borderRadius: 8,
                            fontSize: '0.8rem', fontWeight: 600, cursor: pageClamped <= 1 ? 'not-allowed' : 'pointer', opacity: pageClamped <= 1 ? 0.5 : 1,
                        }}
                    >
                        <FaChevronLeft size={11} /> Anterior
                    </button>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>
                        Página {pageClamped} de {totalPages} &middot; {filtered.length} leads
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={pageClamped >= totalPages}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                            background: '#1F2937', color: '#F9FAFB', border: '1px solid #374151', borderRadius: 8,
                            fontSize: '0.8rem', fontWeight: 600, cursor: pageClamped >= totalPages ? 'not-allowed' : 'pointer', opacity: pageClamped >= totalPages ? 0.5 : 1,
                        }}
                    >
                        Siguiente <FaChevronRight size={11} />
                    </button>
                </div>
            )}

            {/* Cargar más (bucket paginado, p.ej. solo "hola") */}
            {!loading && leads.length < total && (
                <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        style={{
                            padding: '8px 20px', background: '#1F2937', color: '#F9FAFB',
                            border: '1px solid #374151', borderRadius: 8, fontSize: '0.8rem',
                            fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        {loadingMore ? 'Cargando...' : `Cargar más (${leads.length} de ${total})`}
                    </button>
                </div>
            )}

            {/* ===== MODAL DETALLE ===== */}
            {modalLead && (() => {
                const ml = modalLead;
                const revStatus = ml.revival_status || 'pendiente';
                const revConfig = REVIVAL_STATUSES[revStatus] || REVIVAL_STATUSES.pendiente;
                const estadoConfig = ESTADO_LABELS[ml.estado_sofia] || { label: ml.estado_sofia, color: '#6b7280', bg: 'rgba(107,114,128,0.15)' };
                const days = daysSince(ml.updated_at);
                const datos = (() => {
                    try {
                        if (!ml.datos_cotizacion) return null;
                        return typeof ml.datos_cotizacion === 'string' ? JSON.parse(ml.datos_cotizacion) : ml.datos_cotizacion;
                    } catch { return null; }
                })();

                return (
                    <div
                        onClick={() => setModalLead(null)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                        }}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: '#111827', borderRadius: 14, width: '100%', maxWidth: 640,
                                maxHeight: '90vh', overflow: 'auto', border: '1px solid #1F2937',
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '18px 24px', borderBottom: '1px solid #1F2937',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#F9FAFB' }}>
                                        {ml.nombre || 'Sin nombre'}
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>+{ml.wa_id}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ background: estadoConfig.bg, color: estadoConfig.color, fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>
                                        {estadoConfig.label}
                                    </span>
                                    <span style={{ background: revConfig.color + '18', color: revConfig.color, fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>
                                        {revConfig.label}
                                    </span>
                                    <button onClick={() => setModalLead(null)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.3rem', cursor: 'pointer' }}>&times;</button>
                                </div>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {/* Datos del lead */}
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px 20px' }}>
                                    {[
                                        ['Carrera', ml.carrera],
                                        ['Nivel', ml.nivel || datos?.nivel],
                                        ['Tipo Servicio', ml.tipo_servicio || datos?.tipoServicio],
                                        ['Tipo Proyecto', ml.tipo_proyecto || datos?.tipoProyecto],
                                        ['Paginas', ml.paginas || datos?.paginas],
                                        ['Avance', datos?.paginasAvance ? `${datos.paginasAvance} págs` : null],
                                        ['Fecha Entrega', ml.fecha_entrega || datos?.fechaEntrega],
                                        ['Atendido por', ml.atendido_por],
                                        ['Primer contacto', formatDate(ml.created_at)],
                                        ['Ultima actividad', `${formatDate(ml.updated_at)}${days !== null ? ` (hace ${days}d)` : ''}`],
                                    ].filter(([, v]) => v && v !== '-').map(([label, value]) => (
                                        <div key={label}>
                                            <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#F9FAFB', marginTop: 2 }}>{value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tema */}
                                {(ml.tema || datos?.tema) && (
                                    <div>
                                        <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Tema</div>
                                        <div style={{ fontSize: '0.85rem', color: '#F9FAFB', marginTop: 2 }}>{ml.tema || datos?.tema}</div>
                                    </div>
                                )}

                                {/* Precio estimado */}
                                {ml.precio && ml.precio !== '' && (
                                    <div style={{ background: '#0B0F1A', borderRadius: 8, padding: '10px 14px', border: '1px solid #1F2937' }}>
                                        <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Precio estimado (calculadora)</div>
                                        <div style={{ fontSize: '1rem', color: '#F59E0B', fontWeight: 700, marginTop: 2 }}>{ml.precio}</div>
                                    </div>
                                )}

                                {/* ===== COTIZACIÓN enviada por WhatsApp ===== */}
                                <div>
                                    <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Cotización (WhatsApp)</div>
                                    {(ml.cotizacion_enviada || ml.pdf_url) ? (
                                        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <FaFileInvoiceDollar style={{ color: '#10b981', fontSize: '1.2rem' }} />
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', color: '#F9FAFB', fontWeight: 600 }}>Cotización enviada por WhatsApp</div>
                                                    {ml.precio && <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>{ml.precio}</div>}
                                                </div>
                                            </div>
                                            {ml.pdf_url && (
                                                <button onClick={() => setPdfViewer(ml.pdf_url)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                                                    <FaFilePdf /> Ver PDF
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <FaExclamationTriangle style={{ color: '#f59e0b', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.82rem', color: '#FCD34D' }}>Aún no se ha enviado cotización a este lead.</span>
                                        </div>
                                    )}
                                </div>

                                {/* ===== ARCHIVOS adjuntos (CRM) ===== */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Archivos adjuntos</div>
                                        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={(e) => handleUploadFile(ml.wa_id, e)} />
                                        <button onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
                                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#1F2937', color: '#F9FAFB', border: '1px solid #374151', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: uploadingFile ? 'wait' : 'pointer' }}>
                                            <FaPaperclip /> {uploadingFile ? 'Subiendo...' : 'Adjuntar archivo'}
                                        </button>
                                    </div>
                                    {Array.isArray(ml.revival_files) && ml.revival_files.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {ml.revival_files.map((f) => (
                                                <div key={f.publicId || f.url} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: '#0B0F1A', border: '1px solid #1F2937', borderRadius: 8, padding: '8px 12px' }}>
                                                    <a href={f.url} target="_blank" rel="noreferrer"
                                                        style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#93C5FD', fontSize: '0.8rem', textDecoration: 'none', overflow: 'hidden' }}>
                                                        <FaFileAlt style={{ flexShrink: 0 }} />
                                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name || 'archivo'}</span>
                                                    </a>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                                        {f.uploadedAt && <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>{formatDate(f.uploadedAt)}</span>}
                                                        <button onClick={() => handleDeleteFile(ml.wa_id, f.publicId)} title="Quitar"
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            <FaTrashAlt />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.78rem', color: '#6B7280', fontStyle: 'italic' }}>Sin archivos. Adjunta documentos, comprobantes o material del cliente.</div>
                                    )}
                                </div>

                                {/* Ultimo mensaje */}
                                {ml.ultimo_mensaje_preview && (
                                    <div>
                                        <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Ultimo mensaje</div>
                                        <div style={{ fontSize: '0.82rem', color: '#9CA3AF', fontStyle: 'italic', background: '#0B0F1A', padding: 10, borderRadius: 6, marginTop: 4 }}>
                                            "{ml.ultimo_mensaje_preview}"
                                        </div>
                                    </div>
                                )}

                                {/* Notas admin */}
                                {ml.notas_admin && (
                                    <div>
                                        <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Notas Admin</div>
                                        <div style={{ fontSize: '0.82rem', color: '#D1D5DB', marginTop: 4 }}>{ml.notas_admin}</div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    <a href={`https://wa.me/${ml.wa_id}`} target="_blank" rel="noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', background: '#25d366', color: '#fff', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                                        <FaWhatsapp /> WhatsApp
                                    </a>
                                    <button onClick={() => setCalcLead(ml)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                        <FaCalculator /> Cotizar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ===== VISOR DE PDF (inline, misma página) ===== */}
            {pdfViewer && (
                <div
                    onClick={() => setPdfViewer(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                >
                    <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 900, height: '92vh', background: '#111827', borderRadius: 12, border: '1px solid #1F2937', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #1F2937' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#F9FAFB' }}><FaFilePdf style={{ color: '#6366f1' }} /> Cotización</span>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <a href={pdfViewer} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#1F2937', color: '#F9FAFB', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                                    <FaDownload /> Abrir / Descargar
                                </a>
                                <button onClick={() => setPdfViewer(null)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
                            </div>
                        </div>
                        <iframe title="Cotización PDF" src={pdfViewer} style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }} />
                    </div>
                </div>
            )}

            {/* ===== CALCULADORA / COTIZADOR (embebido) ===== */}
            {calcLead && (
                <div
                    onClick={() => setCalcLead(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}
                >
                    <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 1100, background: '#f8f9fa', borderRadius: 12, overflow: 'hidden', margin: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#111827', borderBottom: '1px solid #1F2937', position: 'sticky', top: 0, zIndex: 2 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#F9FAFB' }}>
                                <FaCalculator style={{ color: '#f59e0b' }} /> Cotizar — {calcLead.nombre || calcLead.wa_id}
                            </span>
                            <button onClick={() => setCalcLead(null)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#374151', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                <FaTimes /> Cerrar
                            </button>
                        </div>
                        <SalesQuote
                            embedded
                            onClose={() => setCalcLead(null)}
                            initialData={{
                                clientName: calcLead.nombre || '',
                                clientPhone: calcLead.wa_id || '',
                                carrera: calcLead.carrera || '',
                                extensionEstimada: calcLead.paginas || '',
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default RevivalPipeline;
