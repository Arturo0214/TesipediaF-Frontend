import React, { useState, useEffect, useMemo } from 'react';
import axiosWithAuth from '../../../utils/axioswithAuth';
import {
    FaSync, FaPhone, FaWhatsapp, FaEnvelope, FaSearch,
    FaFilter, FaChevronDown, FaChevronUp, FaStickyNote,
    FaUserTag, FaCheckCircle, FaClock, FaTimesCircle,
    FaFireAlt, FaExclamationTriangle, FaCalendarAlt
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
};

const VENDOR_NAMES = {
    arturo: 'Arturo', sandy: 'Sandy', hugo: 'Hugo', 'adrian nava': 'Adrian',
};

function RevivalPipeline() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('all');
    const [filterRevival, setFilterRevival] = useState('all');
    const [expandedLead, setExpandedLead] = useState(null);
    const [modalLead, setModalLead] = useState(null);
    const [editingNotes, setEditingNotes] = useState({});
    const [saving, setSaving] = useState({});

    const fetchPipeline = async () => {
        setLoading(true);
        try {
            const res = await axiosWithAuth.get('/api/v1/whatsapp/revival-pipeline');
            setLeads(res.data);
        } catch (err) {
            toast.error('Error cargando pipeline de revivals');
        }
        setLoading(false);
    };

    useEffect(() => { fetchPipeline(); }, []);

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
            // Solo leads con 3+ días sin actividad
            const lastActivity = new Date(l.updated_at || l.created_at).getTime();
            if (lastActivity > threeDaysAgo) return false;
            if (filterEstado !== 'all' && l.estado_sofia !== filterEstado) return false;
            if (filterRevival !== 'all' && (l.revival_status || 'pendiente') !== filterRevival) return false;
            if (searchTerm) {
                const q = searchTerm.toLowerCase();
                const name = (l.nombre || '').toLowerCase();
                const carrera = (l.carrera || '').toLowerCase();
                const tema = (l.tema || '').toLowerCase();
                if (!name.includes(q) && !carrera.includes(q) && !tema.includes(q) && !(l.wa_id || '').includes(q)) return false;
            }
            return true;
        });
    }, [leads, filterEstado, filterRevival, searchTerm]);

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
            if (l.precio) totalPrecio += l.precio;
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
                        {stats.total} leads con potencial de cierre &middot; {formatMoney(stats.totalPrecio)} en pipeline
                    </p>
                </div>
                <button
                    onClick={fetchPipeline}
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
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
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
            </div>

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
                    {filtered.map(lead => {
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
                                    onClick={() => setExpandedLead(isExpanded ? null : lead.wa_id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 16px', cursor: 'pointer', gap: 12, flexWrap: 'wrap',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
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
                                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
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
                                                    {lead.pdf_url && (
                                                        <a
                                                            href={lead.pdf_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 4,
                                                                padding: '6px 12px', background: '#6366f1', color: '#fff',
                                                                borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                                                                textDecoration: 'none',
                                                            }}
                                                        >
                                                            Ver Cotizacion
                                                        </a>
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
                                                        <option value="adrian nava">Adrian Nava</option>
                                                        <option value="arturo">Arturo</option>
                                                        <option value="sandy">Sandy</option>
                                                        <option value="hugo">Hugo</option>
                                                    </select>
                                                </div>

                                                {/* Revival Notes */}
                                                <div>
                                                    <label style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>Notas Revival</label>
                                                    <textarea
                                                        value={editingNotes[lead.wa_id] !== undefined ? editingNotes[lead.wa_id] : (lead.revival_notes || '')}
                                                        onChange={e => setEditingNotes(prev => ({ ...prev, [lead.wa_id]: e.target.value }))}
                                                        placeholder="Ej: Se contacto por WhatsApp, queda de llamar manana..."
                                                        rows={3}
                                                        style={{
                                                            width: '100%', padding: '7px 10px', border: '1px solid #1F2937',
                                                            borderRadius: 6, fontSize: '0.82rem', resize: 'vertical', marginTop: 3,
                                                            background: '#0B0F1A', color: '#F9FAFB',
                                                            fontFamily: 'inherit',
                                                        }}
                                                    />
                                                    {editingNotes[lead.wa_id] !== undefined && editingNotes[lead.wa_id] !== (lead.revival_notes || '') && (
                                                        <button
                                                            onClick={() => {
                                                                updateRevival(lead.wa_id, { revival_notes: editingNotes[lead.wa_id] });
                                                                setEditingNotes(prev => { const n = { ...prev }; delete n[lead.wa_id]; return n; });
                                                            }}
                                                            disabled={isSaving}
                                                            style={{
                                                                marginTop: 4, padding: '5px 12px', background: '#10b981',
                                                                color: '#fff', border: 'none', borderRadius: 6,
                                                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                                            }}
                                                        >
                                                            {isSaving ? 'Guardando...' : 'Guardar notas'}
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
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
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
                                    {ml.pdf_url && (
                                        <a href={ml.pdf_url} target="_blank" rel="noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', background: '#6366f1', color: '#fff', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                                            Ver Cotizacion PDF
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default RevivalPipeline;
