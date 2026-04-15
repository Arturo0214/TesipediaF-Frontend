import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Badge, Button, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import {
  FaWhatsapp,
  FaUser,
  FaRobot,
  FaUserTie,
  FaPaperPlane,
  FaSync,
  FaSearch,
  FaToggleOn,
  FaToggleOff,
  FaPhone,
  FaClock,
  FaTag,
  FaPaperclip,
  FaTimes,
  FaFile,
  FaFileWord,
  FaImage,
  FaArrowLeft,
  FaCalculator,
  FaFilePdf,
  FaDollarSign,
  FaCheck,
  FaCheckDouble,
  FaExclamationTriangle,
  FaTimesCircle,
  FaEnvelope,
  FaEnvelopeOpen,
  FaLock,
  FaStickyNote,
  FaTrash,
  FaMicrophone,
  FaStop,
  FaBan,
  FaUnlock,
  FaCalendarDay,
} from 'react-icons/fa';
import {
  getLeads,
  getLeadByWaId,
  toggleModoHumano,
  updateLeadEstado,
  sendWhatsAppMessage,
  parseHistorial,
  sendTemplateMessage,
  claimLead,
  sendSofiaReminders,
  getAutoReminderStatus,
  configAutoReminder,
  getLeadNotes,
  createLeadNote,
  deleteLeadNote,
  toggleBlockLead,
  updateLeadNotes,
} from '../../../services/whatsapp/supabaseWhatsApp';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { saveGeneratedQuote } from '../../../features/quotes/quoteSlice';
import './AdminWhatsApp.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://tesipedia-backend-service-production.up.railway.app';

/* ── Mapeo de labels internos a legibles ── */
const SERVICIO_MAP = { servicio_1: 'modalidad1', servicio_2: 'correccion', servicio_3: 'modalidad2' };
const SERVICIO_LABEL = { servicio_1: 'Redacción completa', servicio_2: 'Correcciones', servicio_3: 'Asesoría', modalidad1: 'Redacción completa', correccion: 'Correcciones', modalidad2: 'Asesoría' };
const PROYECTO_MAP = { proyecto_1: 'Tesis', proyecto_2: 'Tesina', proyecto_3: 'Otro' };
const NIVEL_MAP = { nivel_1: 'Preparatoria', nivel_2: 'Licenciatura', nivel_3: 'Maestría', nivel_4: 'Especialidad', nivel_5: 'Diplomado', nivel_6: 'Doctorado' };
const AREAS = ['Área 1: Ciencias Físico-Matemáticas y de las Ingenierías', 'Área 2: Ciencias Biológicas, Químicas y de la Salud', 'Área 3: Ciencias Sociales', 'Área 4: Humanidades y Artes'];
const TIPOS_TRABAJO = ['Tesis', 'Tesina', 'Artículo Científico', 'Ensayo Académico', 'Protocolo de Investigación', 'Proyecto de Titulación', 'Reporte', 'Otro'];
const NIVELES = ['Preparatoria', 'Licenciatura', 'Maestría', 'Especialidad', 'Diplomado', 'Doctorado'];

function calcDateISO(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

function mapLeadToQuoteFields(lead) {
  const tipoServicioRaw = lead.tipo_servicio || '';
  const tipoServicio = SERVICIO_MAP[tipoServicioRaw] || tipoServicioRaw || 'modalidad1';
  const tipoTrabajo = PROYECTO_MAP[lead.tipo_proyecto] || lead.tipo_proyecto || 'Tesis';
  const nivel = NIVEL_MAP[lead.nivel] || lead.nivel || 'Licenciatura';
  const hoy = new Date().toISOString().split('T')[0];
  const fechaEntrega3sem = calcDateISO(21); // 3 semanas por defecto
  const fechaAvanceMid = calcDateISO(11); // ~mitad para pago avance
  return {
    clientName: lead.nombre || '',
    clientPhone: lead.wa_id || '',
    tipoServicio,
    tipoTrabajo,
    tituloTrabajo: lead.tema || '',
    nivelAcademico: nivel,
    area: '',
    carrera: lead.carrera || '',
    extensionEstimada: lead.paginas || '',
    fechaEntrega: lead.fecha_entrega || '',
    fechaEntregaDate: fechaEntrega3sem,
    fechaPago1: hoy,
    fechaAvance: fechaAvanceMid,
    tema: lead.tema || '',
    precioManual: '',
    descuentoEfectivo: 0,
    metodoPago: 'tarjeta-nu',
    esquemaTipo: '33-33-34',
  };
}

/* ── Colores por admin ── */
const ADMIN_COLORS = {
  arturo: { color: '#f59e0b', bg: '#fef3c7', label: 'Arturo', border: '#f59e0b' },
  sandy: { color: '#9b8afb', bg: '#ede9fe', label: 'Sandy', border: '#9b8afb' },
  hugo: { color: '#3b82f6', bg: '#dbeafe', label: 'Hugo', border: '#3b82f6' },
  _attended: { color: '#10b981', bg: '#d1fae5', label: 'Atendido', border: '#10b981' },
  _default: { color: '#d1d5db', bg: '#f9fafb', label: 'Sin atender', border: '#d1d5db' },
};

function normalizeAdminName(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  // Match first name from known admins
  if (lower.includes('arturo')) return 'arturo';
  if (lower.includes('sandy')) return 'sandy';
  if (lower.includes('hugo')) return 'hugo';
  return lower.split(' ')[0]; // Fallback: use first name
}

function getLeadAttendedBy(lead) {
  // Primero checar el campo atendido_por de Supabase (más confiable)
  if (lead?.atendido_por) return normalizeAdminName(lead.atendido_por);
  // Fallback: parsear historial para leads viejos sin el campo
  const hist = parseHistorial(lead?.historial_chat);
  for (let i = hist.length - 1; i >= 0; i--) {
    const c = hist[i]?.content || '';
    // Formato nuevo: [HUMANO:Sandy Alvarado] mensaje
    const match = c.match(/^\[HUMANO:([^\]]+)\]/);
    if (match) return normalizeAdminName(match[1]);
    // Formato viejo: [HUMANO] mensaje
    if (c.startsWith('[HUMANO]')) return '_attended';
  }
  return null;
}

function getAttendedColor(lead) {
  const who = getLeadAttendedBy(lead);
  if (!who) return ADMIN_COLORS._default;
  return ADMIN_COLORS[who] || ADMIN_COLORS._attended;
}

/* ── Formatear labels internos a legibles ── */
const LABEL_MAP = {
  servicio_1: 'Redacción completa', servicio_2: 'Correcciones', servicio_3: 'Asesoría',
  proyecto_1: 'Tesis', proyecto_2: 'Tesina', proyecto_3: 'Otro proyecto',
  nivel_1: 'Preparatoria', nivel_2: 'Licenciatura', nivel_3: 'Maestría', nivel_4: 'Especialidad', nivel_5: 'Diplomado', nivel_6: 'Doctorado',
  avance_1: 'Sí tiene avance', avance_2: 'Desde cero',
  trabajo_1: 'Corregir + redactar faltante', trabajo_2: 'Solo redactar faltante', trabajo_3: 'Redactar todo + corregir',
  modalidad1: 'Redacción completa', modalidad2: 'Asesoría', correccion: 'Correcciones',
};
const STATE_KEY_LABELS = {
  etapa: 'Etapa', nombre: 'Nombre', carrera: 'Carrera', nivel: 'Nivel',
  tipoServicio: 'Servicio', tipoProyecto: 'Proyecto', paginas: 'Páginas',
  paginasAvance: 'Págs. avance', tipoTrabajo: 'Tipo trabajo',
  fechaEntrega: 'Entrega', tieneTema: 'Tiene tema', tema: 'Tema',
  tieneAvance: 'Tiene avance', precio: 'Precio', botones: 'Botones',
};

function formatLabel(text) {
  if (!text) return text;
  // Reemplazar IDs internos completos (cuando el msg ES el label)
  if (LABEL_MAP[text]) return LABEL_MAP[text];
  // Reemplazar IDs dentro del texto
  return text.replace(/\b(servicio_[123]|proyecto_[123]|nivel_[123]|avance_[12]|trabajo_[123]|modalidad[12]|correccion)\b/g,
    (match) => LABEL_MAP[match] || match
  );
}

const POLL_INTERVAL = 12000; // 12 segundos — balance entre egress y tiempo real

const AdminWhatsApp = () => {
  const dispatch = useDispatch();
  const { user: authUser, isSuperAdmin } = useSelector((state) => state.auth || {});
  const currentAdminKey = normalizeAdminName(authUser?.name || authUser?.nombre || '');
  const [leads, setLeads] = useState([]);
  const leadsLengthRef = useRef(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const hasMoreRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const PAGE_SIZE = 100;
  // "Leídos" — wa_ids que el admin ha marcado como leídos en esta sesión
  const [readLeads, setReadLeads] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('wa_read_leads') || '[]')); } catch { return new Set(); }
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [togglingHuman, setTogglingHuman] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatNumber, setNewChatNumber] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [attendedFilter, setAttendedFilter] = useState('all'); // 'all' | 'atendido' | 'sin_atender'
  const [dateFilter, setDateFilter] = useState(''); // '' = all, 'YYYY-MM-DD' = specific day
  const [origenFilter, setOrigenFilter] = useState('regular'); // 'all' | 'regular' | 'manychat'
  const [windowExpired, setWindowExpired] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState(false);
  const [sendingReengagement, setSendingReengagement] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteFields, setQuoteFields] = useState({});
  const [quotePrice, setQuotePrice] = useState(null);
  const [quotePriceLoading, setQuotePriceLoading] = useState(false);
  const [quoteGenerating, setQuoteGenerating] = useState(false);
  const [quotePdfUrl, setQuotePdfUrl] = useState(null);
  // Notas del lead
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectedLeadRef = useRef(null); // ref para evitar stale closure en polling
  const prevMsgCountRef = useRef(0); // para detectar mensajes nuevos y hacer scroll

  // ─── Auto-reminder Sofia ─────────────────────────────────────
  const [showAutoReminder, setShowAutoReminder] = useState(false);
  const [autoReminderConfig, setAutoReminderConfig] = useState({
    active: false, intervalMinutes: 360, staleMinutes: 360, maxPerRun: 50, lastRun: null, lastResult: null,
  });
  const [autoReminderLoading, setAutoReminderLoading] = useState(false);
  const prevLeadIdRef = useRef(null); // para scroll solo al cambiar de conversación
  const prevLeadsMapRef = useRef(new Map()); // para detectar mensajes nuevos entre polls

  // ─── Notificaciones para mensajes nuevos ───
  useEffect(() => {
    // Pedir permiso de notificaciones del navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playNotifSound = useCallback(() => {
    try {
      // Generar sonido de notificación con Web Audio API (dos tonos cortos)
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = ctx.currentTime;
      playTone(880, now, 0.15);       // primer tono
      playTone(1100, now + 0.18, 0.15); // segundo tono más agudo
    } catch (_) {}
  }, []);

  const showBrowserNotification = useCallback((title, body) => {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico', tag: 'tesipedia-msg' });
      }
    } catch (_) {}
  }, []);

  // Detectar mensajes nuevos comparando con el poll anterior
  const checkNewMessages = useCallback((newLeads) => {
    if (prevLeadsMapRef.current.size === 0) {
      // Primera carga: guardar sin notificar
      const map = new Map();
      newLeads.forEach(l => map.set(l.wa_id, l.updated_at));
      prevLeadsMapRef.current = map;
      return;
    }
    const newMsgs = [];
    newLeads.forEach(lead => {
      const prevUpdated = prevLeadsMapRef.current.get(lead.wa_id);
      // Si el lead tiene updated_at más reciente Y el último mensaje es del usuario
      if (prevUpdated && lead.updated_at !== prevUpdated) {
        const hist = parseHistorial(lead.historial_chat);
        if (hist.length > 0 && hist[hist.length - 1].role === 'user') {
          newMsgs.push(lead);
        }
      } else if (!prevUpdated) {
        // Lead completamente nuevo con mensaje del user
        const hist = parseHistorial(lead.historial_chat);
        if (hist.length > 0 && hist[hist.length - 1].role === 'user') {
          newMsgs.push(lead);
        }
      }
    });
    // Actualizar mapa
    const map = new Map();
    newLeads.forEach(l => map.set(l.wa_id, l.updated_at));
    prevLeadsMapRef.current = map;
    // Notificar
    if (newMsgs.length > 0) {
      playNotifSound();
      const mcLeads = newMsgs.filter(l => l.origen === 'manychat');
      const regularLeads = newMsgs.filter(l => l.origen !== 'manychat');
      if (mcLeads.length > 0) {
        const names = mcLeads.slice(0, 3).map(l => l.nombre || l.wa_id).join(', ');
        toast(`💬 ManyChat: ${mcLeads.length} mensaje${mcLeads.length > 1 ? 's' : ''} nuevo${mcLeads.length > 1 ? 's' : ''} — ${names}`, {
          icon: '🟣', duration: 8000,
          style: { background: '#f3f0ff', color: '#7c3aed', fontWeight: 600, border: '2px solid #7c3aed' },
        });
        showBrowserNotification(`ManyChat: ${mcLeads.length} nuevo${mcLeads.length > 1 ? 's' : ''}`, names);
      }
      if (regularLeads.length > 0) {
        const names = regularLeads.slice(0, 3).map(l => l.nombre || l.wa_id).join(', ');
        toast(`💬 ${regularLeads.length} mensaje${regularLeads.length > 1 ? 's' : ''} nuevo${regularLeads.length > 1 ? 's' : ''} — ${names}`, {
          icon: '💬', duration: 6000,
          style: { background: '#ecfdf5', color: '#065f46', fontWeight: 500 },
        });
        showBrowserNotification(`WhatsApp: ${regularLeads.length} nuevo${regularLeads.length > 1 ? 's' : ''}`, names);
      }
    }
  }, [playNotifSound, showBrowserNotification]);

  // Mantener el ref sincronizado con el state
  useEffect(() => {
    selectedLeadRef.current = selectedLead;
  }, [selectedLead]);

  // Cargar leads — usa el ref para siempre tener el selectedLead actual
  const origenRef = useRef(origenFilter);
  useEffect(() => { origenRef.current = origenFilter; }, [origenFilter]);

  // Refs para filtros server-side (evitar stale closures en polling)
  const estadoFilterRef = useRef(estadoFilter);
  const attendedFilterRef = useRef(attendedFilter);
  const dateFilterRef = useRef(dateFilter);
  const searchQueryRef = useRef(searchQuery);
  useEffect(() => { estadoFilterRef.current = estadoFilter; }, [estadoFilter]);
  useEffect(() => { attendedFilterRef.current = attendedFilter; }, [attendedFilter]);
  useEffect(() => { dateFilterRef.current = dateFilter; }, [dateFilter]);
  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);

  const buildFilters = useCallback(() => ({
    estado: estadoFilterRef.current,
    atendido: attendedFilterRef.current,
    fecha: dateFilterRef.current,
    search: searchQueryRef.current,
  }), []);

  const fetchLeads = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const filters = buildFilters();
      let allData;
      let totalCount;
      let moreAvailable;

      if (silent) {
        // Polling silencioso: traer solo la primera página para detectar nuevos mensajes
        // No traer todo lo que está cargado para evitar egress excesivo
        const result = await getLeads(origenRef.current, PAGE_SIZE, 0, filters);
        const freshData = Array.isArray(result) ? result : (result.leads || []);
        totalCount = result.total || freshData.length;
        moreAvailable = result.hasMore || false;
        checkNewMessages(freshData);

        // Merge: actualizar los leads que ya tenemos con datos frescos, sin perder los extras del "cargar más"
        const freshMap = new Map(freshData.map(l => [l.wa_id, l]));
        const currentLeads = leadsRef.current;
        if (leadsLengthRef.current > PAGE_SIZE) {
          allData = currentLeads.map(l => freshMap.get(l.wa_id) || l);
          // Agregar leads nuevos que no existían antes
          for (const fl of freshData) {
            if (!allData.find(l => l.wa_id === fl.wa_id)) {
              allData.unshift(fl);
            }
          }
        } else {
          allData = freshData;
        }
      } else {
        const hasActiveFilter = filters.estado !== 'all' || filters.atendido !== 'all' || filters.fecha || filters.search;

        if (hasActiveFilter) {
          // Con filtro activo: cargar TODAS las páginas para que el filtro client-side tenga todos los datos
          const limit = PAGE_SIZE;
          let offset = 0;
          allData = [];
          let keepLoading = true;
          while (keepLoading) {
            const result = await getLeads(origenRef.current, limit, offset, filters);
            const page = Array.isArray(result) ? result : (result.leads || []);
            allData = [...allData, ...page];
            totalCount = result.total || allData.length;
            offset += page.length;
            if (!result.hasMore || page.length === 0) keepLoading = false;
          }
          moreAvailable = false;
        } else {
          // Sin filtro: solo traer la primera página (100 leads)
          const result = await getLeads(origenRef.current, PAGE_SIZE, 0, filters);
          allData = Array.isArray(result) ? result : (result.leads || []);
          totalCount = result.total || allData.length;
          moreAvailable = result.hasMore || false;
        }

        // Inicializar mapa sin notificar (primera carga)
        const map = new Map();
        allData.forEach(l => map.set(l.wa_id, l.updated_at));
        prevLeadsMapRef.current = map;
      }

      setLeads(allData);
      setTotalLeads(totalCount);
      hasMoreRef.current = moreAvailable;
      setHasMore(moreAvailable);

      // Actualizar el lead seleccionado usando el REF
      const currentSelected = selectedLeadRef.current;
      if (currentSelected) {
        const updated = allData.find(l => l.wa_id === currentSelected.wa_id);
        if (updated) {
          const metaChanged = updated.estado_sofia !== currentSelected.estado_sofia
            || updated.modo_humano !== currentSelected.modo_humano
            || updated.precio !== currentSelected.precio
            || updated.nombre !== currentSelected.nombre
            || updated.atendido_por !== currentSelected.atendido_por;
          const hasNewMessages = updated.updated_at !== currentSelected.updated_at
            || (updated.ultimo_mensaje_preview && updated.ultimo_mensaje_preview !== currentSelected.ultimo_mensaje_preview);

          if (hasNewMessages) {
            // Invalidar read status — hay mensajes nuevos
            setReadLeads(prev => {
              const next = new Set(prev);
              next.delete(currentSelected.wa_id);
              localStorage.setItem('wa_read_leads', JSON.stringify([...next]));
              return next;
            });
            try {
              const fresh = await getLeadByWaId(currentSelected.wa_id);
              if (fresh) setSelectedLead(fresh);
            } catch (e) {
              console.warn('Error refrescando historial completo:', e);
            }
          } else if (metaChanged) {
            setSelectedLead(prev => ({
              ...prev,
              ...updated,
              historial_chat: prev.historial_chat,
            }));
          }
        }
      }
      setError(null);
    } catch (err) {
      if (!silent) setError(err.message);
      console.error('Error cargando leads:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [buildFilters]);

  // Mantener refs sincronizados con leads
  const leadsRef = useRef(leads);
  useEffect(() => { leadsLengthRef.current = leads.length; leadsRef.current = leads; }, [leads]);

  // Helper: refrescar sidebar después de acciones (enviar, bloquear, etc.)
  const refreshSidebar = useCallback(async () => {
    try {
      const limit = Math.max(PAGE_SIZE, leadsLengthRef.current);
      const filters = buildFilters();
      const r = await getLeads(origenRef.current, limit, 0, filters);
      setLeads(Array.isArray(r) ? r : (r.leads || []));
      setTotalLeads(r.total || 0);
      hasMoreRef.current = r.hasMore || false;
      setHasMore(hasMoreRef.current);
    } catch (_) {}
  }, [buildFilters]);

  // Marcar lead como leído
  const markAsRead = useCallback((waId) => {
    setReadLeads(prev => {
      const next = new Set(prev);
      next.add(waId);
      localStorage.setItem('wa_read_leads', JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Marcar como no leído
  const markAsUnread = useCallback((waId) => {
    setReadLeads(prev => {
      const next = new Set(prev);
      next.delete(waId);
      localStorage.setItem('wa_read_leads', JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Auto-marcar como leído al seleccionar un lead
  const handleSelectLeadWithRead = useCallback((lead) => {
    handleSelectLead(lead);
    markAsRead(lead.wa_id);
  }, [markAsRead]);

  // Cargar más leads (infinite scroll)
  const loadMoreLeads = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    try {
      loadingMoreRef.current = true;
      setLoadingMore(true);
      const filters = buildFilters();
      const result = await getLeads(origenRef.current, PAGE_SIZE, leadsLengthRef.current, filters);
      const moreData = Array.isArray(result) ? result : (result.leads || []);
      if (moreData.length > 0) {
        setLeads(prev => [...prev, ...moreData]);
        setTotalLeads(result.total || leadsLengthRef.current + moreData.length);
      }
      const more = result.hasMore || false;
      hasMoreRef.current = more;
      setHasMore(more);
    } catch (err) {
      console.error('Error cargando más leads:', err);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  const handleReengagement = async () => {
    const hoursStr = window.prompt(
      'Sofia enviara recordatorios personalizados a los leads estancados.\n\n¿De cuantas horas atras quieres incluir leads?\n(Ejemplo: 24 = ultimas 24h, 2 = ultimas 2h)',
      '24'
    );
    if (!hoursStr) return;
    const hours = Number(hoursStr) || 24;

    setSendingReengagement(true);
    try {
      const result = await sendSofiaReminders(hours);
      if (result.total === 0) {
        toast('No se encontraron leads para enviar recordatorio', { icon: 'ℹ️' });
      } else {
        toast.success(`Sofia envio recordatorio a ${result.sent} de ${result.total} leads${result.failed ? ` (${result.failed} fallidos)` : ''}`);
      }
      fetchLeads(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar recordatorios de Sofia');
    }
    setSendingReengagement(false);
  };

  // Auto-reminder: cargar estado inicial
  const fetchAutoReminderStatus = useCallback(async () => {
    try {
      const status = await getAutoReminderStatus();
      setAutoReminderConfig(status);
    } catch { /* silencioso si el backend aun no soporta */ }
  }, []);

  const handleAutoReminderToggle = async () => {
    setAutoReminderLoading(true);
    try {
      const result = await configAutoReminder({
        ...autoReminderConfig,
        active: !autoReminderConfig.active,
      });
      setAutoReminderConfig(prev => ({ ...prev, ...result }));
      toast.success(result.active ? 'Auto-recordatorio de Sofia ACTIVADO' : 'Auto-recordatorio de Sofia DESACTIVADO');
    } catch (err) {
      toast.error('Error al configurar auto-recordatorio');
    }
    setAutoReminderLoading(false);
  };

  const handleAutoReminderSave = async () => {
    setAutoReminderLoading(true);
    try {
      const result = await configAutoReminder(autoReminderConfig);
      setAutoReminderConfig(prev => ({ ...prev, ...result }));
      toast.success('Configuracion guardada');
    } catch (err) {
      toast.error('Error al guardar configuracion');
    }
    setAutoReminderLoading(false);
  };

  // Polling para actualizaciones en tiempo real + re-cargar al cambiar filtros
  useEffect(() => {
    fetchLeads();
    fetchAutoReminderStatus();
    pollRef.current = setInterval(() => fetchLeads(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [origenFilter, estadoFilter, attendedFilter, dateFilter]);

  // Debounce para búsqueda por texto (evitar spam al backend)
  const searchTimerRef = useRef(null);
  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchLeads();
    }, 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  // Scroll inteligente: al cambiar de lead, al cargar historial completo, o al llegar mensajes nuevos
  useEffect(() => {
    if (!selectedLead) {
      prevLeadIdRef.current = null;
      prevMsgCountRef.current = 0;
      return;
    }

    const hist = parseHistorial(selectedLead.historial_chat);
    const msgCount = hist.length;
    const isNewLead = selectedLead.wa_id !== prevLeadIdRef.current;
    // Detectar cuando el historial completo llega (salta de ≤3 a muchos más)
    const fullHistoryJustLoaded = msgCount > 3 && prevMsgCountRef.current <= 3 && !isNewLead;
    // Detectar mensajes nuevos durante polling
    const newMessagesArrived = !isNewLead && !fullHistoryJustLoaded && msgCount > prevMsgCountRef.current;

    prevLeadIdRef.current = selectedLead.wa_id;
    prevMsgCountRef.current = msgCount;

    if (isNewLead || fullHistoryJustLoaded || newMessagesArrived) {
      // Usar timeout para dar tiempo a React de pintar todos los mensajes en el DOM
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: isNewLead ? 'smooth' : 'auto' });
      }, 100);
    }
  }, [selectedLead]);

  // Helper: calcular si la ventana de 24h expiró usando updated_at del lead
  const calcWindowExpired = (leadData) => {
    if (!leadData) return true;
    const HOURS_24 = 24 * 60 * 60 * 1000;
    // Intentar usar timestamp del último mensaje del usuario
    const historial = parseHistorial(leadData.historial_chat);
    const lastUserMsg = [...historial].reverse().find(m => m.role === 'user');
    if (lastUserMsg?.timestamp) {
      return (Date.now() - new Date(lastUserMsg.timestamp).getTime()) > HOURS_24;
    }
    // Fallback: usar updated_at del lead (se actualiza cada vez que llega un mensaje)
    if (leadData.updated_at) {
      return (Date.now() - new Date(leadData.updated_at).getTime()) > HOURS_24;
    }
    return true;
  };

  // Cargar notas de un lead
  const fetchNotes = async (waId) => {
    try {
      setNotesLoading(true);
      const data = await getLeadNotes(waId);
      setNotes(data);
    } catch (err) {
      console.error('Error cargando notas:', err);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    try {
      const note = await createLeadNote(selectedLead.wa_id, newNote.trim());
      setNotes(prev => [note, ...prev]);
      setNewNote('');
    } catch (err) {
      toast.error('Error al guardar nota');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteLeadNote(noteId);
      setNotes(prev => prev.filter(n => n._id !== noteId));
    } catch (err) {
      toast.error('Error al eliminar nota');
    }
  };

  // Seleccionar una conversación
  const handleSelectLead = async (lead) => {
    setSelectedLead(lead); // Mostrar inmediatamente con datos del listado (últimos 3 msgs)
    setWindowExpired(false);
    setShowNotes(false);
    setNotes([]);
    // Cargar notas en paralelo
    fetchNotes(lead.wa_id);
    // Refrescar datos del lead seleccionado (obtener historial COMPLETO)
    try {
      const fresh = await getLeadByWaId(lead.wa_id);
      if (fresh) {
        setSelectedLead(fresh);
        setWindowExpired(calcWindowExpired(fresh));
      } else {
        setWindowExpired(calcWindowExpired(lead));
      }
    } catch (err) {
      console.error('Error refrescando lead:', err);
    }
  };

  // La propiedad del lead es solo para comisiones — NO bloquea acceso.
  // Cualquier admin puede ver y contestar cualquier conversación.
  const isOwnedByOther = () => false;

  const getOwnerLabel = (lead) => {
    const owner = getLeadAttendedBy(lead);
    if (!owner) return null;
    return ADMIN_COLORS[owner]?.label || owner;
  };

  // Toggle modo humano
  const handleToggleHuman = async () => {
    if (!selectedLead || togglingHuman) return;
    setTogglingHuman(true);
    try {
      const nuevoModo = !selectedLead.modo_humano;
      await toggleModoHumano(selectedLead.wa_id, nuevoModo);
      setSelectedLead(prev => ({ ...prev, modo_humano: nuevoModo }));
      toast.success(nuevoModo ? 'Modo humano activado — Sofía no responderá' : 'Modo bot activado — Sofía responderá');
      fetchLeads(true);
    } catch (err) {
      toast.error('Error al cambiar modo: ' + err.message);
    } finally {
      setTogglingHuman(false);
    }
  };

  // Enviar mensaje
  // ═══ AUDIO RECORDING ═══
  const startRecording = async () => {
    try {
      // Verificar contexto seguro (HTTPS o localhost)
      if (!window.isSecureContext) {
        toast.error('La grabación de audio requiere HTTPS o localhost.');
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Tu navegador no soporta grabación de audio.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        }
      });

      // Verificar que el stream tiene tracks activos
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks.length || audioTracks[0].readyState !== 'live') {
        toast.error('No se detectó un micrófono activo.');
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      console.log('🎤 Micrófono activo:', audioTracks[0].label);

      // Seleccionar MIME type: preferir ogg/opus, luego webm/opus, luego webm, luego sin especificar
      let mimeType = '';
      const candidates = [
        'audio/ogg; codecs=opus',
        'audio/webm; codecs=opus',
        'audio/webm',
        'audio/mp4',
      ];
      for (const candidate of candidates) {
        if (MediaRecorder.isTypeSupported(candidate)) {
          mimeType = candidate;
          break;
        }
      }
      console.log('🎤 MIME type seleccionado:', mimeType || '(default del navegador)');

      const recorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, recorderOptions);
      const finalMime = recorder.mimeType || mimeType || 'audio/webm';
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (audioChunksRef.current.length === 0) {
          console.warn('🎤 No se capturaron datos de audio');
          toast.error('No se capturó audio. Verifica que tu micrófono funcione correctamente.');
          setIsRecording(false);
          clearInterval(recordingTimerRef.current);
          return;
        }
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        console.log('🎤 Audio grabado:', blob.size, 'bytes,', audioChunksRef.current.length, 'chunks, tipo:', finalMime);
        if (blob.size < 100) {
          toast.error('La grabación está vacía. Verifica los permisos del micrófono.');
          setIsRecording(false);
          clearInterval(recordingTimerRef.current);
          return;
        }
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        clearInterval(recordingTimerRef.current);
      };

      recorder.onerror = (event) => {
        console.error('🎤 MediaRecorder error:', event.error);
        toast.error('Error durante la grabación: ' + (event.error?.message || 'desconocido'));
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        clearInterval(recordingTimerRef.current);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(500); // Collect data every 500ms
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('🎤 Grabación iniciada, estado:', recorder.state);
    } catch (err) {
      console.error('🎤 Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Permiso de micrófono denegado. Haz clic en el ícono de candado en la barra de dirección y permite el micrófono.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast.error('No se encontró micrófono. Conecta uno e intenta de nuevo.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        toast.error('El micrófono está en uso por otra aplicación. Ciérrala e intenta de nuevo.');
      } else {
        toast.error('No se pudo acceder al micrófono: ' + err.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Pedir los datos restantes antes de detener
      try { mediaRecorderRef.current.requestData(); } catch (_) {}
      mediaRecorderRef.current.stop();
      console.log('🎤 Grabación detenida, chunks acumulados:', audioChunksRef.current.length);
    }
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setAudioBlob(null);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
    setRecordingTime(0);
    clearInterval(recordingTimerRef.current);
  };

  const sendAudioNote = async () => {
    console.log('🎤 sendAudioNote llamado. audioBlob:', !!audioBlob, 'selectedLead:', !!selectedLead, 'sending:', sending);
    if (!audioBlob || !selectedLead || sending) {
      console.warn('🎤 sendAudioNote abortado:', !audioBlob ? 'sin audioBlob' : !selectedLead ? 'sin selectedLead' : 'ya enviando');
      return;
    }
    setSending(true);
    try {
      const blobType = audioBlob.type || 'audio/webm';
      const ext = blobType.includes('ogg') ? 'ogg' : blobType.includes('mp4') ? 'mp4' : 'webm';
      const audioFile = new File([audioBlob], `nota_de_voz_${Date.now()}.${ext}`, { type: blobType });
      console.log('🎤 Enviando audio:', audioFile.name, audioFile.size, 'bytes, tipo:', blobType);

      // Auto-reclamar lead si no tiene dueño
      const currentOwner = getLeadAttendedBy(selectedLead);
      if (!currentOwner && currentAdminKey) {
        try { await claimLead(selectedLead.wa_id, authUser?.name || authUser?.nombre || currentAdminKey); } catch (_) {}
      }

      // Optimistic update: mostrar nota de voz inmediatamente
      const adminName = authUser?.name || authUser?.nombre || 'Admin';
      setSelectedLead(prev => {
        if (!prev) return prev;
        const currentHist = parseHistorial(prev.historial_chat);
        const optimisticAudio = {
          role: 'assistant',
          content: `[HUMANO:${adminName}] (Nota de voz)`,
          timestamp: new Date().toISOString(),
          delivery_status: 'sending',
        };
        return { ...prev, historial_chat: JSON.stringify([...currentHist, optimisticAudio]), updated_at: new Date().toISOString() };
      });

      // Limpiar audio inmediatamente
      setAudioBlob(null);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
      setRecordingTime(0);

      const sendResult = await sendWhatsAppMessage(selectedLead.wa_id, '', audioFile);
      if (sendResult?.delivery_status === 'sent') {
        toast.success('Nota de voz enviada');
      } else if (sendResult?.pendingMessage) {
        toast('Plantilla enviada. Tu nota de voz se enviará cuando el cliente responda.', { icon: '⏳', duration: 6000 });
      } else {
        toast.success('Nota de voz enviada');
      }

      // Refrescar con datos reales
      try {
        const fresh = await getLeadByWaId(selectedLead.wa_id);
        if (fresh) setSelectedLead(fresh);
      } catch (refreshErr) {
        console.warn('No se pudo refrescar después de audio:', refreshErr);
      }
      await refreshSidebar();
    } catch (err) {
      toast.error('Error al enviar nota de voz: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const formatRecordingTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // ═══ BLOCK / UNBLOCK CONTACT ═══
  const handleBlockToggle = async () => {
    if (!selectedLead) return;
    const isBlocked = !!selectedLead.bloqueado;
    const action = isBlocked ? 'desbloquear' : 'bloquear';
    if (!window.confirm(`¿Estás seguro de ${action} a ${selectedLead.nombre || selectedLead.wa_id}?`)) return;
    try {
      await toggleBlockLead(selectedLead.wa_id, !isBlocked);
      setSelectedLead(prev => ({ ...prev, bloqueado: !isBlocked }));
      toast.success(isBlocked ? 'Contacto desbloqueado' : 'Contacto bloqueado');
      fetchLeads(true);
    } catch (err) {
      toast.error(`Error al ${action}: ` + err.message);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || !selectedLead || sending) return;
    setSending(true);
    try {
      // Auto-reclamar lead si no tiene dueño
      const currentOwner = getLeadAttendedBy(selectedLead);
      if (!currentOwner && currentAdminKey) {
        try {
          await claimLead(selectedLead.wa_id, authUser?.name || authUser?.nombre || currentAdminKey);
        } catch (claimErr) {
          console.warn('No se pudo reclamar lead (endpoint pendiente?):', claimErr.message);
        }
      }

      // ── ACTUALIZACIÓN OPTIMISTA: mostrar el mensaje inmediatamente en el UI ──
      const adminName = authUser?.name || authUser?.nombre || 'Admin';
      const msgText = message.trim();
      const fileToSend = selectedFile; // Guardar referencia antes de limpiar
      const optimisticMsg = {
        role: 'assistant',
        content: msgText ? `[HUMANO:${adminName}] ${msgText}` : `[HUMANO:${adminName}] (Archivo)`,
        timestamp: new Date().toISOString(),
        delivery_status: 'sending',
      };
      // Agregar el mensaje optimista al historial local ANTES de enviar
      setSelectedLead(prev => {
        if (!prev) return prev;
        const currentHist = parseHistorial(prev.historial_chat);
        const updatedHist = [...currentHist, optimisticMsg];
        return { ...prev, historial_chat: JSON.stringify(updatedHist), updated_at: new Date().toISOString() };
      });

      // Limpiar inputs inmediatamente para UX fluida
      setMessage('');
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Enviar por WhatsApp + guardar en historial (todo vía Backend)
      const sendResult = await sendWhatsAppMessage(selectedLead.wa_id, msgText, fileToSend);
      if (sendResult?.delivery_status === 'failed') {
        toast.error('El mensaje NO se pudo enviar por WhatsApp');
      } else if (sendResult?.pendingMessage) {
        toast('Plantilla enviada. Tu mensaje se enviará automáticamente cuando el cliente responda.', {
          icon: '⏳',
          duration: 6000,
          style: { background: '#fef3c7', color: '#92400e', fontWeight: 500 },
        });
        setWindowExpired(false);
      } else if (sendResult?.delivery_status === 'sent') {
        toast.success(hadFile ? 'Archivo enviado por WhatsApp' : 'Mensaje enviado por WhatsApp');
      } else {
        toast.success(hadFile ? 'Mensaje con archivo enviado' : 'Mensaje enviado');
      }

      // Refrescar con datos reales del servidor (reemplaza el optimistic)
      try {
        const fresh = await getLeadByWaId(selectedLead.wa_id);
        if (fresh) setSelectedLead(fresh);
      } catch (refreshErr) {
        console.warn('No se pudo refrescar después de enviar, mensaje optimista se mantiene:', refreshErr);
      }
      // Actualizar sidebar sin tocar selectedLead
      await refreshSidebar();
      inputRef.current?.focus();
    } catch (err) {
      toast.error('Error al enviar: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  // Enviar solo plantilla para revivir conversación
  const handleSendTemplate = async () => {
    if (!selectedLead || sendingTemplate) return;
    setSendingTemplate(true);
    try {
      await sendTemplateMessage(selectedLead.wa_id);
      toast.success('Plantilla de seguimiento enviada — esperando respuesta del cliente');
      setWindowExpired(false);
      // Refrescar historial completo + sidebar
      const fresh = await getLeadByWaId(selectedLead.wa_id);
      if (fresh) setSelectedLead(fresh);
      await refreshSidebar();
    } catch (err) {
      toast.error('Error al enviar plantilla: ' + err.message);
    } finally {
      setSendingTemplate(false);
    }
  };

  const [filePreviewUrl, setFilePreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Generar preview si es imagen
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const clearFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Drag & Drop para documentos ──
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(file));
      } else {
        setFilePreviewUrl(null);
      }
      toast.success(`Archivo "${file.name}" listo para enviar`);
      e.dataTransfer.clearData();
    }
  }, []);

  // Iniciar nueva conversación con un número
  const handleNewChat = async () => {
    const cleaned = newChatNumber.replace(/\D/g, '');
    if (cleaned.length < 10) {
      toast.error('Ingresa un número válido (mínimo 10 dígitos)');
      return;
    }
    // Verificar si ya existe en la lista
    const existing = leads.find(l => l.wa_id === cleaned);
    if (existing) {
      handleSelectLead(existing);
      setShowNewChat(false);
      setNewChatNumber('');
      return;
    }
    // Enviar un mensaje inicial para crear el lead en el backend
    try {
      await sendWhatsAppMessage(cleaned, '¡Hola! Iniciando conversación desde el panel admin.');
      toast.success('Conversación creada');
      setShowNewChat(false);
      setNewChatNumber('');
      await fetchLeads();
      // Seleccionar el nuevo lead
      const fresh = await getLeadByWaId(cleaned);
      if (fresh) setSelectedLead(fresh);
    } catch (err) {
      toast.error('Error al crear conversación: ' + err.message);
    }
  };

  // ── Cotización rápida desde lead ──
  const openQuoteModal = () => {
    if (!selectedLead) return;
    const fields = mapLeadToQuoteFields(selectedLead);
    setQuoteFields(fields);
    setQuotePrice(null);
    setQuotePdfUrl(null);
    setShowQuoteModal(true);
    // Auto-calcular precio si hay datos suficientes
    if (fields.nivelAcademico && fields.extensionEstimada && fields.carrera) {
      fetchPrice(fields);
    }
  };

  const fetchPrice = async (fields) => {
    const f = fields || quoteFields;
    if (!f.nivelAcademico || !f.extensionEstimada || !f.carrera) return;
    setQuotePriceLoading(true);
    try {
      const resp = await fetch(`${API_URL}/quotes/calculate-sales-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          educationLevel: f.nivelAcademico,
          pages: parseInt(f.extensionEstimada) || 30,
          serviceType: f.tipoServicio || 'modalidad1',
          taskType: f.tipoTrabajo || 'Tesis',
          career: f.carrera,
          studyArea: f.area || '',
        }),
      });
      const data = await resp.json();
      if (data.success && data.pricing) {
        // Normalizar respuesta del API al formato que usa el modal
        setQuotePrice({
          precioPorPagina: data.pricing.pricePerPage || 0,
          precioBase: data.pricing.totalPrice || 0,
          precioTotal: data.pricing.totalPrice || 0,
          cargoUrgencia: 0,
          area: data.pricing.studyArea || '',
        });
        // Si el API auto-detectó el área, actualizar el campo
        if (data.pricing.studyAreaAutoDetected && data.pricing.studyArea) {
          setQuoteFields(prev => ({ ...prev, area: prev.area || data.pricing.studyArea }));
        }
      } else if (data.precioBase) {
        setQuotePrice(data);
      }
    } catch (err) {
      console.error('Error calculando precio:', err);
    }
    setQuotePriceLoading(false);
  };

  const handleQuoteFieldChange = (key, value) => {
    const updated = { ...quoteFields, [key]: value };
    setQuoteFields(updated);
    // Re-calcular precio si cambian campos relevantes
    if (['nivelAcademico', 'extensionEstimada', 'carrera', 'tipoServicio', 'tipoTrabajo', 'area'].includes(key)) {
      if (updated.nivelAcademico && updated.extensionEstimada && updated.carrera) {
        fetchPrice(updated);
      }
    }
  };

  const handleGenerateQuotePDF = async () => {
    const f = quoteFields;
    if (!f.clientName || !f.extensionEstimada || !f.nivelAcademico || !f.carrera) {
      toast.error('Completa al menos: nombre, páginas, nivel y carrera');
      return;
    }
    const precioBase = f.precioManual ? Number(f.precioManual) : (quotePrice?.precioBase || 0);
    if (precioBase <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }
    setQuoteGenerating(true);
    try {
      // 1. Generar PDF via backend (con retry automático)
      const fechaEntregaLegible = f.fechaEntregaDate
        ? new Date(f.fechaEntregaDate + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
        : (f.fechaEntrega || 'Por definir');
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      // Limpiar emojis y caracteres especiales del nombre para el filename/publicId de Cloudinary
      const clientShort = (f.clientName || 'Cliente').split(' ')[0].replace(/[^\w\s\-áéíóúñÁÉÍÓÚÑ]/gi, '').trim() || 'Cliente';
      const pdfFilename = `Tesipedia-Cotizacion-${clientShort}-${dd}${mm}`;

      const pdfBody = JSON.stringify({
        clientName: f.clientName,
        nombre: f.clientName,
        tituloTrabajo: f.tituloTrabajo || f.tema || '',
        tipoTrabajo: f.tipoTrabajo || 'Tesis',
        tipoServicio: f.tipoServicio || 'modalidad1',
        extensionEstimada: String(f.extensionEstimada || '0'),
        carrera: f.carrera || '',
        tiempoEntrega: fechaEntregaLegible,
        fechaEntregaRaw: f.fechaEntregaDate || '',
        precioBase: Number(precioBase) || 0,
        descuentoEfectivo: Number(f.descuentoEfectivo) || 0,
        recargoPorcentaje: 0,
        metodoPago: f.metodoPago || 'tarjeta-nu',
        esquemaTipo: f.esquemaTipo || '33-33-34',
        fechaPago1: f.fechaPago1 || '',
        fechaAvance: f.fechaAvance || '',
        fechaPagoFinal: f.fechaPagoFinal || f.fechaEntregaDate || '',
        pdfFilename,
      });

      // Intentar hasta 2 veces (el servidor puede tardar en cold start)
      let pdfData = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const pdfResp = await fetch(`${API_URL}/quotes/generate-quote-pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: pdfBody,
          });
          pdfData = await pdfResp.json();
          if (pdfData.success) break;
          if (attempt < 2) {
            console.warn(`[QuotePDF] Intento ${attempt} falló (${pdfData.step || 'unknown'}), reintentando...`);
            toast('Reintentando generar PDF...', { icon: '🔄' });
            await new Promise(r => setTimeout(r, 2000));
          }
        } catch (fetchErr) {
          if (attempt < 2) {
            console.warn(`[QuotePDF] Intento ${attempt} error de red, reintentando...`);
            toast('Error de conexión, reintentando...', { icon: '🔄' });
            await new Promise(r => setTimeout(r, 3000));
          } else {
            throw new Error('No se pudo conectar al servidor para generar el PDF. Verifica tu conexión.');
          }
        }
      }
      if (!pdfData?.success) throw new Error(pdfData?.message || 'Error generando PDF después de 2 intentos');

      const pdfUrl = pdfData.pdfUrl || pdfData.fallbackUrl;
      const pdfPublicId = pdfData.publicId || '';

      // 2. Guardar cotización en MongoDB via Redux (usa axiosWithAuth con cookies)
      const descuento = Number(f.descuentoEfectivo) || 0;
      const descuentoMonto = Math.round(precioBase * descuento / 100);
      const precioConDescuento = precioBase - descuentoMonto;
      try {
        const saveResult = await dispatch(saveGeneratedQuote({
          clientName: f.clientName,
          clientPhone: f.clientPhone,
          tituloTrabajo: f.tituloTrabajo || f.tema || '',
          tipoTrabajo: f.tipoTrabajo || 'Tesis',
          tipoServicio: f.tipoServicio || 'modalidad1',
          extensionEstimada: String(f.extensionEstimada),
          carrera: f.carrera,
          area: f.area || quotePrice?.area || '',
          tiempoEntrega: f.fechaEntrega || 'Por definir',
          fechaEntrega: f.fechaEntregaDate || f.fechaEntrega || '',
          precioBase,
          descuentoEfectivo: descuento,
          descuentoMonto,
          precioConDescuento,
          metodoPago: f.metodoPago || 'tarjeta-nu',
          esquemaPago: f.esquemaTipo || '33-33-34',
          pdfUrl: pdfUrl || null,
          pdfPublicId: pdfPublicId || null,
          status: 'pending',
        })).unwrap();
        console.log('✅ Cotización guardada en BD:', saveResult?.quote?._id || saveResult?._id);
      } catch (saveErr) {
        console.error('⚠️ Error al guardar cotización en BD:', saveErr);
      }

      // 3. Actualizar estado del lead a cotizacion_enviada
      const waId = f.clientPhone || selectedLead?.wa_id;
      if (waId) {
        try {
          await updateLeadEstado(waId, 'cotizacion_enviada');
          console.log('✅ Estado actualizado a cotizacion_enviada para:', waId);
          // Actualizar lead local para reflejar el cambio inmediatamente
          setLeads(prev => prev.map(l => l.wa_id === waId ? { ...l, estado_sofia: 'cotizacion_enviada' } : l));
          if (selectedLead?.wa_id === waId) {
            setSelectedLead(prev => prev ? { ...prev, estado_sofia: 'cotizacion_enviada' } : prev);
          }
        } catch (e) {
          console.error('❌ Error actualizando estado a cotizacion_enviada:', e);
          toast.error('No se pudo marcar como cotización enviada');
        }
      } else {
        console.error('❌ No hay wa_id para actualizar estado');
      }

      // 4. Abrir el PDF — en mobile usamos un link en vez de window.open (que se bloquea)
      if (pdfUrl) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          // En mobile, window.open dentro de async se bloquea; usamos enlace directo
          setQuotePdfUrl(pdfUrl);
          toast.success('PDF generado — toca el botón para verlo');
        } else {
          window.open(pdfUrl, '_blank');
          toast.success('PDF generado y cotización guardada');
          setShowQuoteModal(false);
        }
      } else {
        toast.success('Cotización guardada (sin PDF)');
        setShowQuoteModal(false);
      }
      fetchLeads(true);
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
    setQuoteGenerating(false);
  };

  // Obtener estados únicos para el filtro (hardcoded para no depender de datos cargados)
  const estadosUnicos = ['bienvenida', 'cotizando', 'cotizacion_iniciada', 'cotizacion_lista', 'cotizacion_enviada', 'cotizacion_confirmada', 'esperando_aprobacion', 'cliente_acepto', 'pagado', 'descartado', 'no_interesado', 'sin_estado'];

  // Filtros aplicados server-side — client-side solo para atendido_por (que depende de historial parsing)
  const filteredLeads = leads.filter(lead => {
    // Estado y fecha ya se filtran en el servidor, no duplicar
    // Solo filtrar atendido client-side como fallback por si atendido_por no está en Supabase
    if (attendedFilter !== 'all') {
      const who = getLeadAttendedBy(lead);
      if (attendedFilter === 'atendido' && !who) return false;
      if (attendedFilter === 'sin_atender' && who) return false;
      if (!['all', 'atendido', 'sin_atender'].includes(attendedFilter)) {
        if (who !== attendedFilter) return false;
      }
    }
    return true;
  }).sort((a, b) => {
    // ── PRIORIDAD 1: Mensajes nuevos del cliente (no leídos) SIEMPRE arriba ──
    const countUnread = (lead) => {
      const hist = parseHistorial(lead.historial_chat);
      let c = 0;
      for (let i = hist.length - 1; i >= 0; i--) {
        if (hist[i].role === 'user') c++; else break;
      }
      return c;
    };
    const unreadA = countUnread(a);
    const unreadB = countUnread(b);
    if (unreadA > 0 && unreadB === 0) return -1;
    if (unreadA === 0 && unreadB > 0) return 1;
    // Ambos con mensajes nuevos → el más reciente primero
    if (unreadA > 0 && unreadB > 0) {
      const dateA = new Date(a.updated_at || 0).getTime();
      const dateB = new Date(b.updated_at || 0).getTime();
      return dateB - dateA;
    }

    // ── PRIORIDAD 2: Leads esperando aprobación ──
    const PRIORITY_ESTADOS = ['esperando_aprobacion', 'cotizacion_enviada', 'cotizacion_confirmada', 'cliente_acepto'];
    const isPriorityA = PRIORITY_ESTADOS.includes(a.estado_sofia);
    const isPriorityB = PRIORITY_ESTADOS.includes(b.estado_sofia);
    if (isPriorityA && !isPriorityB) return -1;
    if (!isPriorityA && isPriorityB) return 1;

    // ── PRIORIDAD 3: Modo humano activo (alguien está atendiendo) ──
    const humanoA = a.modo_humano ? 1 : 0;
    const humanoB = b.modo_humano ? 1 : 0;
    if (humanoA !== humanoB) return humanoB - humanoA;

    // ── Dentro de cada grupo, ordenar por updated_at más reciente ──
    const dateA = new Date(a.updated_at || 0).getTime();
    const dateB = new Date(b.updated_at || 0).getTime();
    return dateB - dateA;
  });

  // Formatear teléfono
  const formatPhone = (waId) => {
    if (!waId) return '';
    if (waId.startsWith('52') && waId.length >= 12) {
      return `+${waId.slice(0, 2)} ${waId.slice(2, 5)} ${waId.slice(5, 8)} ${waId.slice(8)}`;
    }
    return `+${waId}`;
  };

  // Helper de UTC para arreglar fechas de Supabase sin 'Z'
  const parseUTCDate = (dateStr) => {
    if (!dateStr) return null;
    const isUTC = dateStr.endsWith('Z') || dateStr.match(/[+\-]\d{2}(:\d{2})?$/);
    const safeDateStr = isUTC ? dateStr : `${dateStr}Z`;
    return new Date(safeDateStr);
  };

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(parseUTCDate(dateStr), "d MMM, HH:mm", { locale: es });
    } catch {
      return dateStr;
    }
  };

  // Obtener último mensaje de un lead (limpio, sin tags internos)
  const getLastMessage = (lead) => {
    // Usar preview pre-calculado del backend si existe
    if (lead.ultimo_mensaje_preview) return lead.ultimo_mensaje_preview;

    const hist = parseHistorial(lead.historial_chat);
    if (hist.length === 0) {
      // Fallback: mostrar estado
      const estadoLabels = {
        bienvenida: 'Nuevo lead',
        calificando: 'En calificación',
        cotizando: 'Cotizando',
        cotizacion_enviada: 'Cotización enviada',
        esperando_aprobacion: 'Esperando aprobación',
        modo_humano: 'Modo humano',
        descartado: 'Descartado',
      };
      return estadoLabels[lead.estado_sofia] || lead.estado_sofia || 'Sin mensajes';
    }
    const last = hist[hist.length - 1];
    let content = last.content || '';
    // Limpiar tags [HUMANO:Name] y [HUMANO]
    content = content.replace(/^\[HUMANO:[^\]]*\]\s*/, '').replace(/^\[HUMANO\]\s*/, '');
    // Limpiar [STATE:{...}] y [CALCULAR_COTIZACION]
    content = content.replace(/\[STATE:[\s\S]*?\]/g, '').replace(/\[CALCULAR_COTIZACION\]/g, '').trim();
    // Formatear labels internos
    content = formatLabel(content);
    return content.length > 50 ? content.slice(0, 50) + '...' : content;
  };

  // Contar mensajes no leídos (simple: mensajes del usuario después del último del bot)
  const getUnreadCount = (lead) => {
    const hist = parseHistorial(lead.historial_chat);
    let count = 0;
    for (let i = hist.length - 1; i >= 0; i--) {
      if (hist[i].role === 'user') count++;
      else break;
    }
    return count;
  };

  // Color de estado — mejorado con diferenciación de envío
  const getEstadoBadge = (estado) => {
    const map = {
      'bienvenida': 'info',
      'recopilando_datos': 'primary',
      'cotizando': 'primary',
      'cotizacion_iniciada': 'warning',
      'cotizacion_calculada': 'warning',
      'cotizacion_lista': 'warning',
      'cotizacion_enviada': 'success',
      'cotizacion_confirmada': 'success',
      'esperando_aprobacion': 'warning',
      'cliente_acepto': 'success',
      'pagado': 'success',
      'modo_humano': 'dark',
      'descartado': 'danger',
      'no_interesado': 'danger',
    };
    return map[estado] || 'secondary';
  };

  // Ícono para cada estado — indica visualmente si se envió algo o no
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'cotizacion_enviada': return <FaCheck className="me-1" />;
      case 'cotizacion_confirmada': return <FaCheckDouble className="me-1" />;
      case 'cliente_acepto': return <FaCheckDouble className="me-1" />;
      case 'pagado': return <FaDollarSign className="me-1" />;
      case 'cotizacion_lista': return <FaExclamationTriangle className="me-1" />;
      case 'esperando_aprobacion': return <FaClock className="me-1" />;
      case 'cotizacion_iniciada': return <FaClock className="me-1" />;
      case 'cotizacion_calculada': return <FaClock className="me-1" />;
      case 'descartado': return <FaTimes className="me-1" />;
      case 'no_interesado': return <FaTimes className="me-1" />;
      default: return null;
    }
  };

  // Validar si el estado del lead tiene coherencia con lo enviado
  const getEstadoValidation = (lead) => {
    const estado = lead.estado_sofia;
    const hist = parseHistorial(lead.historial_chat);

    // Si no hay historial cargado (listado sin historial_chat), no validar
    if (hist.length === 0 && !lead.historial_chat) return [];

    // Verificar si hay archivos enviados en el historial (cotizaciones)
    const hasFileSent = hist.some(m => m.role === 'assistant' && m.mediaUrl);
    // Verificar si hay mensajes humanos
    const hasHumanMsg = hist.some(m => m.role === 'assistant' && m.content?.includes('[HUMANO'));
    // Verificar mensajes con delivery fallido
    const hasFailedDelivery = hist.some(m => m.delivery_status === 'failed');
    // Último mensaje saliente
    const lastOutgoing = [...hist].reverse().find(m => m.role === 'assistant');
    const lastOutgoingFailed = lastOutgoing?.delivery_status === 'failed';

    const warnings = [];

    // Estado dice "enviada" pero no hay archivo en historial
    if (estado === 'cotizacion_enviada' && !hasFileSent && !hasHumanMsg) {
      warnings.push({ type: 'warning', text: 'Estado "enviada" pero no hay mensajes enviados en el chat' });
    }

    // Estado dice "lista" — recordar enviar
    if (estado === 'cotizacion_lista') {
      warnings.push({ type: 'action', text: 'Cotización lista — pendiente de enviar al cliente' });
    }

    // Estado esperando aprobación — recordar aprobar
    if (estado === 'esperando_aprobacion') {
      warnings.push({ type: 'action', text: 'Esperando aprobación del owner para enviar cotización' });
    }

    // Hay mensajes con delivery fallido
    if (hasFailedDelivery) {
      warnings.push({ type: 'error', text: 'Hay mensajes que no se pudieron entregar por WhatsApp' });
    }

    // El último mensaje saliente falló
    if (lastOutgoingFailed) {
      warnings.push({ type: 'error', text: 'El último mensaje NO se entregó al cliente' });
    }

    return warnings;
  };

  // Renderizar mensajes del chat
  const renderMessages = () => {
    if (!selectedLead) return null;
    const historial = parseHistorial(selectedLead.historial_chat);

    if (historial.length === 0) {
      return (
        <div className="wa-no-messages">
          <FaWhatsapp size={48} />
          <p>No hay mensajes aún</p>
        </div>
      );
    }

    // Helper: obtener la fecha (solo dia) de un mensaje para agrupar
    const getMsgDateKey = (msg, idx) => {
      let ts = msg.timestamp;
      if (!ts && msg.role === 'user' && idx + 1 < historial.length && historial[idx + 1].timestamp) {
        ts = historial[idx + 1].timestamp;
      }
      if (!ts) return null;
      const d = parseUTCDate(ts);
      if (!d || isNaN(d.getTime())) return null;
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    };

    const formatDateDivider = (ts) => {
      if (!ts) return '';
      const d = parseUTCDate(ts);
      if (!d || isNaN(d.getTime())) return '';
      const today = new Date();
      const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
      const isToday = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
      const isYesterday = d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate();
      if (isToday) return 'Hoy';
      if (isYesterday) return 'Ayer';
      return format(d, "d 'de' MMMM, yyyy", { locale: es });
    };

    let lastDateKey = null;
    const elements = [];

    historial.forEach((msg, idx) => {
      // Insertar separador de fecha cuando cambia el día
      const dateKey = getMsgDateKey(msg, idx);
      if (dateKey && dateKey !== lastDateKey) {
        lastDateKey = dateKey;
        const ts = msg.timestamp || (msg.role === 'user' && idx + 1 < historial.length ? historial[idx + 1].timestamp : null);
        elements.push(
          <div key={`date-${dateKey}`} className="wa-date-divider">
            <span>{formatDateDivider(ts)}</span>
          </div>
        );
      }

      const isUser = msg.role === 'user';
      const isTemplate = !isUser && (msg.isTemplate || msg.content?.startsWith('[TEMPLATE:'));
      const isHuman = !isUser && !isTemplate && (msg.content?.startsWith('[HUMANO]') || msg.content?.startsWith('[HUMANO:'));
      const isBot = !isUser && !isHuman && !isTemplate;
      // Extraer nombre del admin y limpiar el prefijo
      let humanName = '';
      let content = msg.content;
      // Limpiar prefijo de plantilla
      if (isTemplate) {
        content = content.replace(/^\[TEMPLATE:[^\]]*\]\s*/, '');
      }
      if (isHuman) {
        const nameMatch = content.match(/^\[HUMANO:([^\]]+)\]\s*/);
        if (nameMatch) {
          humanName = nameMatch[1];
          content = content.replace(nameMatch[0], '');
        } else {
          content = content.replace('[HUMANO] ', '');
        }
      }
      // Inferir timestamp de mensajes de usuario sin hora: usar el del msg siguiente (bot)
      let msgTimestamp = msg.timestamp;
      if (!msgTimestamp && isUser && idx + 1 < historial.length && historial[idx + 1].timestamp) {
        msgTimestamp = historial[idx + 1].timestamp;
      }
      let stateData = null;

      // Extraer y limpiar [STATE:{...}] si es un mensaje del bot
      if (isBot && content) {
        const stateMatch = content.match(/\[STATE:([\s\S]*?)\]/);
        if (stateMatch) {
          content = content.replace(stateMatch[0], '').trim();
          try {
            // El JSON a veces viene incrustado con secuencias de escape
            let parsedStr = stateMatch[1];
            // Ignorar valores no-JSON como "REDACTED", strings vacíos, etc.
            if (parsedStr && parsedStr.trim().startsWith('{')) {
              if (typeof parsedStr === 'string' && parsedStr.includes('\\"')) {
                parsedStr = parsedStr.replace(/\\"/g, '"');
              }
              stateData = JSON.parse(parsedStr);
            }
          } catch(e) {
            // Silenciar — stateData queda null y no afecta rendering
          }
        }
        
        // Limpiar [CALCULAR_COTIZACION] visualmente
        content = content.replace(/\[CALCULAR_COTIZACION\]/g, '').trim();
      }

      elements.push(
        <div
          key={idx}
          className={`wa-message ${isUser ? 'wa-message-user' : 'wa-message-bot'} ${isHuman ? 'wa-message-human' : ''} ${isTemplate ? 'wa-message-template' : ''}`}
        >
          <div className="wa-message-avatar">
            {isUser ? <FaUser /> : isTemplate ? <FaWhatsapp /> : isHuman ? <FaUserTie /> : <FaRobot />}
          </div>
          <div className="wa-message-bubble">
            <div className="wa-message-sender">
              {isUser ? (selectedLead.nombre || 'Cliente') : isTemplate ? 'Plantilla WhatsApp' : isHuman ? (humanName ? `${humanName} (Humano)` : 'Humano') : 'Sofía (Bot)'}
            </div>

            {/* Si hay archivo/media */}
            {msg.mediaUrl && (() => {
              const isImage = msg.mimetype?.startsWith('image/') || msg.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
              const isAudio = msg.mimetype?.startsWith('audio/') || msg.mediaUrl.match(/\.(ogg|mp3|wav|webm|aac|opus|m4a)$/i);
              const isVideo = msg.mimetype?.startsWith('video/') || msg.mediaUrl.match(/\.(mp4|mov|avi|mkv)$/i);
              return (
                <div className="wa-message-media mt-2 mb-2">
                  {isImage ? (
                    <a href={msg.mediaUrl} target="_blank" rel="noreferrer">
                      <img src={msg.mediaUrl} alt="Adjunto" className="wa-media-img" loading="lazy" />
                    </a>
                  ) : isAudio ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <audio controls preload="metadata" style={{ width: '100%', maxWidth: 280 }}>
                        <source src={msg.mediaUrl} type={msg.mimetype || 'audio/ogg'} />
                      </audio>
                      <a href={msg.mediaUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#0066cc' }}>
                        <FaMicrophone size={10} className="me-1" />Descargar audio
                      </a>
                    </div>
                  ) : isVideo ? (
                    <video controls preload="metadata" style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8 }}>
                      <source src={msg.mediaUrl} type={msg.mimetype || 'video/mp4'} />
                    </video>
                  ) : (
                    <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="wa-media-doc">
                      <FaFile className="me-2" /> {msg.filename || 'Descargar archivo'}
                    </a>
                  )}
                </div>
              );
            })()}

            {content && <div className="wa-message-text">{formatLabel(content)}</div>}

            {stateData && (
              <div className="wa-bot-state">
                <div className="wa-bot-state-title">
                  <FaTag className="me-1" /> Datos recopilados
                </div>
                <div className="wa-bot-state-grid">
                  {Object.entries(stateData)
                    .filter(([k, v]) => v && k !== 'botones' && k !== 'etapa')
                    .map(([k, v]) => (
                    <div className="wa-state-item" key={k}>
                      <span className="wa-state-key">{STATE_KEY_LABELS[k] || k}:</span>
                      <span className="wa-state-value">{formatLabel(String(v))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="wa-message-time">
               {msgTimestamp ? format(parseUTCDate(msgTimestamp), "HH:mm") : ''}
               {/* Delivery status para mensajes salientes */}
               {!isUser && (
                 msg.delivery_status === 'sent' ? (
                   <span className="wa-delivery-sent" title="Enviado por WhatsApp"><FaCheck /></span>
                 ) : msg.delivery_status === 'failed' ? (
                   <span className="wa-delivery-failed" title="No se pudo enviar"><FaTimesCircle /></span>
                 ) : msg.delivery_status === 'pending' ? (
                   <span className="wa-delivery-pending" title="Pendiente — se enviará cuando el cliente responda"><FaClock /></span>
                 ) : msg.delivery_status === 'template_only' ? (
                   <span className="wa-delivery-template" title="Solo se envió plantilla"><FaExclamationTriangle /></span>
                 ) : msg.wa_message_id ? (
                   <span className="wa-delivery-sent" title="Enviado"><FaCheck /></span>
                 ) : null
               )}
            </div>
          </div>
        </div>
      );
    });

    return elements;
  };

  if (error && !leads.length) {
    return (
      <Container className="wa-panel">
        <Alert variant="danger">
          <Alert.Heading>Error de conexión</Alert.Heading>
          <p>{error}</p>
          <p className="mb-0">Asegúrate de que el Backend de pago esté corriendo o desplegado, y de haber iniciado sesión como administrador.</p>
          <Button variant="outline-danger" className="mt-2" onClick={() => fetchLeads()}>
            <FaSync className="me-2" /> Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="wa-panel">
      <div className="wa-body">
        {/* Lista de conversaciones */}
        <div className="wa-conversations-col">
          {/* Header verde solo en columna izquierda */}
          <div className="wa-left-header">
            <FaWhatsapp style={{ fontSize: '1.1rem' }} />
            <span className="wa-left-header-title">WhatsApp</span>
            <Button
              variant="outline-warning"
              size="sm"
              className="ms-auto wa-reengagement-btn"
              onClick={handleReengagement}
              disabled={sendingReengagement}
              title="Sofia: enviar recordatorios a leads estancados"
            >
              {sendingReengagement ? <FaSync className="fa-spin" /> : '📣'}
            </Button>
            <Button
              variant={autoReminderConfig.active ? 'success' : 'outline-light'}
              size="sm"
              className="ms-1"
              onClick={() => setShowAutoReminder(!showAutoReminder)}
              title="Auto-recordatorio Sofia"
              style={{ fontSize: '0.7rem', padding: '2px 7px', position: 'relative', fontWeight: 600 }}
            >
              🤖
              {autoReminderConfig.active && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#22c55e', border: '1px solid #fff',
                }} />
              )}
            </Button>
            <Button variant="outline-light" size="sm" className="wa-refresh-btn ms-1" onClick={() => fetchLeads()}>
              <FaSync className={loading ? 'fa-spin' : ''} />
            </Button>
          </div>

          {/* ═══ Panel Auto-Reminder Sofia (colapsable) ═══ */}
          {showAutoReminder && (
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '10px 12px', margin: '8px 10px', fontSize: '0.78rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong style={{ fontSize: '0.82rem' }}>🤖 Auto-recordatorio Sofia</strong>
                <button
                  onClick={handleAutoReminderToggle}
                  disabled={autoReminderLoading}
                  style={{
                    background: autoReminderConfig.active ? '#22c55e' : '#94a3b8',
                    color: '#fff', border: 'none', borderRadius: 12,
                    padding: '3px 12px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  {autoReminderLoading ? '...' : autoReminderConfig.active ? 'ACTIVO' : 'INACTIVO'}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 6 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: '#64748b', fontSize: '0.68rem' }}>Intervalo (min)</span>
                  <input type="number" min="5" max="720" value={autoReminderConfig.intervalMinutes}
                    onChange={e => setAutoReminderConfig(p => ({ ...p, intervalMinutes: Number(e.target.value) }))}
                    style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '3px 6px', fontSize: '0.78rem', width: '100%' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: '#64748b', fontSize: '0.68rem' }}>Inactivo (min)</span>
                  <input type="number" min="5" max="1440" value={autoReminderConfig.staleMinutes}
                    onChange={e => setAutoReminderConfig(p => ({ ...p, staleMinutes: Number(e.target.value) }))}
                    style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '3px 6px', fontSize: '0.78rem', width: '100%' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: '#64748b', fontSize: '0.68rem' }}>Max/ciclo</span>
                  <input type="number" min="1" max="100" value={autoReminderConfig.maxPerRun}
                    onChange={e => setAutoReminderConfig(p => ({ ...p, maxPerRun: Number(e.target.value) }))}
                    style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '3px 6px', fontSize: '0.78rem', width: '100%' }}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={handleAutoReminderSave} disabled={autoReminderLoading}
                  style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
                  Guardar
                </button>
                {autoReminderConfig.lastResult && (
                  <span style={{ color: '#64748b', fontSize: '0.67rem' }}>
                    Último: {autoReminderConfig.lastResult.sent ?? 0} env.
                    {autoReminderConfig.lastResult.failed ? ` / ${autoReminderConfig.lastResult.failed} fall.` : ''}
                    {autoReminderConfig.lastResult.time && <> — {new Date(autoReminderConfig.lastResult.time).toLocaleTimeString('es-MX')}</>}
                  </span>
                )}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.63rem', marginTop: 4 }}>
                Detecta leads en bienvenida/calificando/cotizando sin actividad y les envía mensaje personalizado.
              </div>
            </div>
          )}

          <div className="wa-search-box">
            <FaSearch className="wa-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, tema, carrera, mensaje..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="wa-search-input"
            />
            <Button
              variant="success"
              size="sm"
              className="wa-new-chat-btn ms-2"
              onClick={() => setShowNewChat(!showNewChat)}
              title="Nueva conversación"
            >
              +
            </Button>
          </div>
          {showNewChat && (
            <div className="wa-new-chat-box">
              <input
                type="text"
                placeholder="Número con código país (ej: 525583352096)"
                value={newChatNumber}
                onChange={(e) => setNewChatNumber(e.target.value)}
                className="wa-search-input"
                onKeyDown={(e) => e.key === 'Enter' && handleNewChat()}
              />
              <Button variant="success" size="sm" onClick={handleNewChat} className="ms-2">
                <FaPaperPlane />
              </Button>
            </div>
          )}

          {/* Filtros compactos — 2 rows */}
          <div className="wa-filters">
            <select
              className="wa-filter-select"
              value={origenFilter}
              onChange={(e) => setOrigenFilter(e.target.value)}
              style={origenFilter === 'manychat' ? { borderColor: '#7c3aed', color: '#7c3aed', fontWeight: 600 } : origenFilter === 'regular' ? { borderColor: '#25d366', color: '#25d366', fontWeight: 600 } : {}}
            >
              <option value="regular">WhatsApp ({filteredLeads.length} de {totalLeads})</option>
              <option value="manychat">ManyChat ({filteredLeads.length} de {totalLeads})</option>
              <option value="all">Todos ({filteredLeads.length} de {totalLeads})</option>
            </select>
            <select
              className="wa-filter-select"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              style={estadoFilter !== 'all' ? { borderColor: '#3b82f6', color: '#3b82f6', fontWeight: 600 } : {}}
            >
              <option value="all">Estado: Todos ({leads.length})</option>
              {estadosUnicos.map(est => {
                const count = leads.filter(l => (l.estado_sofia || 'sin_estado') === est).length;
                if (count === 0) return null;
                return (
                  <option key={est} value={est}>{est.replace(/_/g, ' ')} ({count})</option>
                );
              })}
            </select>
            <select
              className="wa-filter-select"
              value={attendedFilter}
              onChange={(e) => setAttendedFilter(e.target.value)}
              style={attendedFilter && ADMIN_COLORS[attendedFilter] ? { borderColor: ADMIN_COLORS[attendedFilter].color, color: ADMIN_COLORS[attendedFilter].color, fontWeight: 600 } : {}}
            >
              <option value="all">Atención: Todos</option>
              <option value="sin_atender">Sin atender ({leads.filter(l => !getLeadAttendedBy(l)).length})</option>
              <option value="atendido">Atendidos ({leads.filter(l => getLeadAttendedBy(l)).length})</option>
              <option disabled>──────────</option>
              {['arturo', 'sandy', 'hugo'].map(admin => {
                const count = leads.filter(l => getLeadAttendedBy(l) === admin).length;
                return (
                  <option key={admin} value={admin}>{ADMIN_COLORS[admin].label} ({count})</option>
                );
              })}
            </select>
            <div className="wa-date-filter">
              <FaCalendarDay className="wa-date-icon" style={{ color: dateFilter ? '#25d366' : '#888' }} />
              <input
                type="date"
                className="wa-filter-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ color: dateFilter ? '#333' : '#888' }}
                title="Filtrar por día de creación"
              />
              {dateFilter && (
                <button className="wa-date-clear" onClick={() => setDateFilter('')} title="Quitar filtro de fecha">
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div className="wa-conversations-list">
            {loading && leads.length === 0 ? (
              <div className="wa-loading">
                <Spinner animation="border" variant="success" />
                <p>Cargando conversaciones...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="wa-empty">
                <p>No hay conversaciones</p>
              </div>
            ) : (
              <>
                {(() => {
                  const APPROVAL_ESTADOS = ['esperando_aprobacion', 'cotizacion_enviada', 'cotizacion_confirmada', 'cliente_acepto'];
                  const elements = [];
                  let shownNewHdr = false, shownApprovalHdr = false, shownRestHdr = false;

                  filteredLeads.forEach((lead) => {
                    const unread = getUnreadCount(lead);
                    const isPriority = APPROVAL_ESTADOS.includes(lead.estado_sofia);

                    if (unread > 0 && !readLeads.has(lead.wa_id) && !shownNewHdr) {
                      shownNewHdr = true;
                      elements.push(<div key="__hdr_new" className="wa-section-header wa-section-new"><FaEnvelope /> Mensajes nuevos</div>);
                    }
                    if ((unread === 0 || readLeads.has(lead.wa_id)) && isPriority && !shownApprovalHdr) {
                      shownApprovalHdr = true;
                      elements.push(<div key="__hdr_approval" className="wa-section-header wa-section-approval"><FaClock /> Esperando aprobación / respuesta</div>);
                    }
                    if ((unread === 0 || readLeads.has(lead.wa_id)) && !isPriority && !shownRestHdr) {
                      shownRestHdr = true;
                      elements.push(<div key="__hdr_rest" className="wa-section-header wa-section-rest"><FaWhatsapp /> Otras conversaciones</div>);
                    }

                    const isSelected = selectedLead?.wa_id === lead.wa_id;
                    const attendedInfo = getAttendedColor(lead);
                    elements.push(
                      <div
                        key={lead.wa_id}
                        className={`wa-conversation-item ${isSelected ? 'wa-selected' : ''} ${lead.modo_humano ? 'wa-human-mode' : ''} ${lead.bloqueado ? 'wa-blocked' : ''}`}
                        style={{ borderLeftColor: attendedInfo.color, borderLeftWidth: 3, borderLeftStyle: 'solid', background: attendedInfo.bg }}
                        onClick={() => handleSelectLeadWithRead(lead)}
                      >
                        <div className="wa-conv-avatar">
                          <FaUser />
                          {lead.modo_humano && (
                            <span className="wa-human-badge" title="Modo humano activo">
                              <FaUserTie />
                            </span>
                          )}
                        </div>
                        <div className="wa-conv-info">
                          <div className="wa-conv-header">
                            <span className="wa-conv-name">{lead.nombre || 'Sin nombre'}</span>
                            <span className="wa-conv-time">{formatDate(lead.updated_at)}</span>
                          </div>
                          <div className="wa-conv-preview">
                            <span className="wa-conv-last-msg">{getLastMessage(lead)}</span>
                            {unread > 0 && !readLeads.has(lead.wa_id) && (
                              <Badge bg="success" pill className="wa-unread-badge">{unread}</Badge>
                            )}
                          </div>
                          <div className="wa-conv-meta">
                            <Badge bg={getEstadoBadge(lead.estado_sofia)} className="wa-estado-badge">
                              {getEstadoIcon(lead.estado_sofia)}{lead.estado_sofia || 'nuevo'}
                            </Badge>
                            {attendedInfo.label !== 'Sin atender' && (
                              <span className="wa-attended-tag" style={{ color: attendedInfo.color, background: attendedInfo.bg }}>
                                <FaLock style={{ fontSize: '0.55rem', marginRight: 3, opacity: 0.7 }} />
                                {attendedInfo.label}
                              </span>
                            )}
                            {lead.origen === 'manychat' && (
                              <Badge bg="light" text="dark" style={{ fontSize: '0.55rem', border: '1px solid #c4b5fd', color: '#7c3aed' }}>
                                MC{lead.manychat_segment ? `: ${lead.manychat_segment}` : ''}
                              </Badge>
                            )}
                            {lead.bloqueado && (
                              <Badge bg="danger" className="wa-blocked-badge">
                                <FaBan className="me-1" />Bloqueado
                              </Badge>
                            )}
                            {lead.estado_sofia === 'cotizacion_lista' && (
                              <span className="wa-pending-send-tag">
                                <FaExclamationTriangle className="me-1" />Sin enviar
                              </span>
                            )}
                            {(lead.etiquetas || []).slice(0, 2).map((tag, ti) => (
                              <span key={ti} className="wa-lead-tag-mini">{tag}</span>
                            ))}
                            {(lead.etiquetas || []).length > 2 && <span className="wa-lead-tag-mini wa-lead-tag-more">+{lead.etiquetas.length - 2}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  });
                  return elements;
                })()}
                {/* Load more button */}
                {hasMore && (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <button
                      onClick={loadMoreLeads}
                      disabled={loadingMore}
                      style={{
                        background: 'none', border: '1px solid #e5e7eb', borderRadius: 8,
                        padding: '6px 16px', fontSize: '0.75rem', color: '#6b7280',
                        cursor: loadingMore ? 'wait' : 'pointer',
                      }}
                    >
                      {loadingMore ? 'Cargando...' : `Cargar más (${totalLeads - leads.length} restantes)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Panel de chat */}
        <div
          className={`wa-chat-col ${selectedLead ? 'wa-chat-active' : ''} ${isDragging ? 'wa-dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!selectedLead ? (
            <div className="wa-no-chat-selected">
              <FaWhatsapp size={64} />
              <h4>Selecciona una conversación</h4>
              <p>Elige un contacto de la lista para ver los mensajes</p>
            </div>
          ) : (
            <>
              {/* Row 1: Contacto + acciones principales */}
              <div className="wa-chat-row1">
                <div className="wa-chat-header-info">
                  <button className="wa-back-btn" onClick={() => setSelectedLead(null)}>
                    <FaArrowLeft />
                  </button>
                  <div className="wa-chat-header-avatar"><FaUser /></div>
                  <div>
                    <div className="wa-chat-header-name">{selectedLead.nombre || 'Cliente'}</div>
                    <div className="wa-chat-header-phone">
                      <FaPhone size={10} /> {formatPhone(selectedLead.wa_id)}
                    </div>
                  </div>
                </div>
                <div className="wa-chat-header-actions">
                  <Button variant="warning" size="sm" onClick={openQuoteModal} className="wa-quote-btn" title="Cotizar">
                    <FaCalculator className="me-1" /> Cotizar
                  </Button>
                  <select className="wa-estado-select" value={selectedLead.estado_sofia || ''}
                    onChange={async (e) => {
                      try {
                        await updateLeadEstado(selectedLead.wa_id, e.target.value);
                        setSelectedLead(prev => ({ ...prev, estado_sofia: e.target.value }));
                        toast.success(`Estado: ${e.target.value.replace(/_/g, ' ')}`);
                        fetchLeads(true);
                      } catch (err) { toast.error('Error al cambiar estado'); }
                    }}>
                    <option value="bienvenida">Bienvenida</option>
                    <option value="cotizando">Cotizando</option>
                    <option value="cotizacion_iniciada">Cotización iniciada</option>
                    <option value="cotizacion_lista">⚠ Cotización lista (sin enviar)</option>
                    <option value="cotizacion_enviada">✓ Cotización enviada</option>
                    <option value="cotizacion_confirmada">✓✓ Cotización confirmada</option>
                    <option value="esperando_aprobacion">⏳ Esperando aprobación</option>
                    <option value="cliente_acepto">✓ Cliente aceptó</option>
                    <option value="pagado">💰 Pagado</option>
                    <option value="descartado">❌ Descartado</option>
                    <option value="no_interesado">🚫 No interesado</option>
                  </select>
                  <Button variant={selectedLead.modo_humano ? 'success' : 'outline-secondary'} size="sm"
                    onClick={handleToggleHuman} disabled={togglingHuman} className="wa-human-toggle"
                    title={selectedLead.modo_humano ? 'Desactivar modo humano' : 'Activar modo humano'}>
                    {togglingHuman ? <Spinner size="sm" /> : selectedLead.modo_humano ? <><FaToggleOn className="me-1" /> Humano</> : <><FaToggleOff className="me-1" /> Bot</>}
                  </Button>
                  <Button
                    variant={readLeads.has(selectedLead.wa_id) ? 'outline-warning' : 'outline-info'}
                    size="sm"
                    onClick={() => readLeads.has(selectedLead.wa_id) ? markAsUnread(selectedLead.wa_id) : markAsRead(selectedLead.wa_id)}
                    title={readLeads.has(selectedLead.wa_id) ? 'Marcar como no leído' : 'Marcar como leído'}
                    style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                  >
                    {readLeads.has(selectedLead.wa_id) ? <><FaEnvelope className="me-1" /> No leído</> : <><FaEnvelopeOpen className="me-1" /> Leído</>}
                  </Button>
                </div>
              </div>

              {/* Row 2: Etiquetas del lead */}
              <div className="wa-chat-row2">
                <div className="wa-lead-info-pills">
                  {selectedLead.estado_sofia && (
                    <Badge bg={getEstadoBadge(selectedLead.estado_sofia)}>
                      {getEstadoIcon(selectedLead.estado_sofia) || <FaTag className="me-1" />} {selectedLead.estado_sofia.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {selectedLead.tipo_servicio && (
                    <Badge bg="outline-secondary" className="wa-pill">{SERVICIO_LABEL[selectedLead.tipo_servicio] || selectedLead.tipo_servicio}</Badge>
                  )}
                  {selectedLead.precio && (
                    <Badge bg="outline-success" className="wa-pill">${selectedLead.precio}</Badge>
                  )}
                  {/* SuperAdmin: reasignar dueño del lead */}
                  {isSuperAdmin && (
                    <select
                      className="wa-reassign-select"
                      style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: 6, border: '1px solid #d1d5db', marginLeft: 8, cursor: 'pointer' }}
                      value={getLeadAttendedBy(selectedLead) || ''}
                      onChange={async (e) => {
                        const newOwner = e.target.value;
                        try {
                          await claimLead(selectedLead.wa_id, newOwner || '');
                          const fresh = await getLeadByWaId(selectedLead.wa_id);
                          if (fresh) setSelectedLead(fresh);
                          fetchLeads(true);
                          toast.success(newOwner ? `Lead reasignado a ${newOwner}` : 'Lead desasignado');
                        } catch (err) {
                          toast.error('Error al reasignar: ' + err.message);
                        }
                      }}
                    >
                      <option value="">Sin asignar</option>
                      <option value="arturo">Arturo</option>
                      <option value="sandy">Sandy</option>
                      <option value="hugo">Hugo</option>
                    </select>
                  )}
                  <Button
                    variant={showNotes ? 'warning' : 'outline-secondary'}
                    size="sm"
                    className="wa-notes-toggle-btn"
                    onClick={() => setShowNotes(!showNotes)}
                    title="Notas del lead"
                  >
                    <FaStickyNote className="me-1" />
                    Notas {notes.length > 0 && `(${notes.length})`}
                  </Button>
                  <Button
                    variant={selectedLead.bloqueado ? 'danger' : 'outline-danger'}
                    size="sm"
                    className="wa-block-toggle-btn"
                    onClick={handleBlockToggle}
                    title={selectedLead.bloqueado ? 'Desbloquear contacto' : 'Bloquear contacto'}
                  >
                    {selectedLead.bloqueado ? <><FaUnlock className="me-1" /> Desbloquear</> : <><FaBan className="me-1" /> Bloquear</>}
                  </Button>
                </div>
              </div>

              {/* Panel de notas y etiquetas colapsable */}
              {showNotes && (
                <div className="wa-notes-panel">
                  <div className="wa-notes-header">
                    <span><FaStickyNote className="me-1" /> Notas y Etiquetas</span>
                    <button className="wa-notes-close" onClick={() => setShowNotes(false)}>&times;</button>
                  </div>

                  {/* Etiquetas */}
                  <div className="wa-tags-section">
                    <div className="wa-tags-list">
                      {(selectedLead.etiquetas || []).map((tag, i) => (
                        <span key={i} className="wa-tag">
                          {tag}
                          <button className="wa-tag-remove" onClick={async () => {
                            const updated = (selectedLead.etiquetas || []).filter((_, j) => j !== i);
                            try {
                              await updateLeadNotes(selectedLead.wa_id, { etiquetas: updated });
                              setSelectedLead(prev => ({ ...prev, etiquetas: updated }));
                              setLeads(prev => prev.map(l => l.wa_id === selectedLead.wa_id ? { ...l, etiquetas: updated } : l));
                            } catch (err) { toast.error('Error al quitar etiqueta'); }
                          }}>&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="wa-tags-add">
                      <input
                        type="text"
                        className="wa-tags-input"
                        placeholder="Nueva etiqueta + Enter"
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            const tag = e.target.value.trim();
                            const current = selectedLead.etiquetas || [];
                            if (current.includes(tag)) { toast.error('Etiqueta ya existe'); return; }
                            const updated = [...current, tag];
                            try {
                              await updateLeadNotes(selectedLead.wa_id, { etiquetas: updated });
                              setSelectedLead(prev => ({ ...prev, etiquetas: updated }));
                              setLeads(prev => prev.map(l => l.wa_id === selectedLead.wa_id ? { ...l, etiquetas: updated } : l));
                              e.target.value = '';
                            } catch (err) { toast.error('Error al agregar etiqueta'); }
                          }
                        }}
                      />
                      <div className="wa-tags-presets">
                        {['VIP', 'Urgente', 'Referido', 'Seguimiento', 'Pagó parcial'].map(preset => (
                          <button key={preset} className="wa-tag-preset"
                            onClick={async () => {
                              const current = selectedLead.etiquetas || [];
                              if (current.includes(preset)) return;
                              const updated = [...current, preset];
                              try {
                                await updateLeadNotes(selectedLead.wa_id, { etiquetas: updated });
                                setSelectedLead(prev => ({ ...prev, etiquetas: updated }));
                                setLeads(prev => prev.map(l => l.wa_id === selectedLead.wa_id ? { ...l, etiquetas: updated } : l));
                              } catch (err) { toast.error('Error al agregar etiqueta'); }
                            }}>{preset}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="wa-notes-add">
                    <textarea
                      className="wa-notes-input"
                      placeholder="Escribe una nota interna..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddNote();
                        }
                      }}
                    />
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="wa-notes-add-btn"
                    >
                      Agregar
                    </Button>
                  </div>
                  <div className="wa-notes-list">
                    {notesLoading ? (
                      <div className="wa-notes-loading"><Spinner size="sm" /> Cargando notas...</div>
                    ) : notes.length === 0 ? (
                      <div className="wa-notes-empty">No hay notas para este lead</div>
                    ) : (
                      notes.map((note) => (
                        <div key={note._id} className="wa-note-item">
                          <div className="wa-note-header">
                            <span className="wa-note-author">{note.author}</span>
                            <span className="wa-note-date">
                              {note.createdAt ? format(new Date(note.createdAt), "d MMM HH:mm", { locale: es }) : ''}
                            </span>
                            <button
                              className="wa-note-delete"
                              onClick={() => handleDeleteNote(note._id)}
                              title="Eliminar nota"
                            >
                              <FaTrash />
                            </button>
                          </div>
                          <div className="wa-note-content">{note.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Alertas de validación por estado */}
              {(() => {
                const validations = getEstadoValidation(selectedLead);
                if (validations.length === 0) return null;
                return (
                  <div className="wa-validation-alerts">
                    {validations.map((v, i) => (
                      <div key={i} className={`wa-validation-alert wa-validation-${v.type}`}>
                        {v.type === 'error' ? <FaTimesCircle className="me-2" /> :
                         v.type === 'warning' ? <FaExclamationTriangle className="me-2" /> :
                         <FaClock className="me-2" />}
                        {v.text}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Mensajes */}
              <div className="wa-messages-container">
                {/* Info de quién atiende este lead (solo informativo, no bloquea) */}
                {getLeadAttendedBy(selectedLead) && (
                  <div style={{
                    background: '#f0fdf4', color: '#166534', padding: '5px 16px',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: '0.78rem', fontWeight: 500, borderBottom: '1px solid #bbf7d0'
                  }}>
                    <FaUserTie style={{ fontSize: '0.65rem' }} />
                    Comisión: {getOwnerLabel(selectedLead)}
                  </div>
                )}
                {selectedLead.modo_humano && (
                  <div className="wa-human-mode-banner">
                    <FaUserTie className="me-2" />
                    Modo humano activo — Sofía no responderá automáticamente
                  </div>
                )}
                {renderMessages()}
                <div ref={messagesEndRef} />
              </div>

              {/* Overlay de drag & drop */}
              {isDragging && (
                <div className="wa-drop-overlay">
                  <div className="wa-drop-content">
                    <FaPaperclip size={40} />
                    <p>Suelta el archivo aquí</p>
                  </div>
                </div>
              )}

              {/* Preview de archivo seleccionado — estilo WhatsApp */}
              {selectedFile && filePreviewUrl && (
                <div className="wa-img-preview-overlay">
                  <div className="wa-img-preview-header">
                    <button className="wa-img-preview-close" onClick={clearFile} disabled={sending}>
                      <FaTimes />
                    </button>
                    <span className="wa-img-preview-filename">{selectedFile.name}</span>
                  </div>
                  <div className="wa-img-preview-body">
                    <img src={filePreviewUrl} alt="Preview" className="wa-img-preview-image" />
                  </div>
                  <div className="wa-img-preview-footer">
                    <textarea
                      ref={inputRef}
                      className="wa-img-preview-caption"
                      placeholder="Agregar comentario..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      disabled={sending}
                      rows={1}
                    />
                    <button className="wa-img-preview-send" onClick={handleSend} disabled={sending}>
                      {sending ? <Spinner size="sm" /> : <FaPaperPlane />}
                    </button>
                  </div>
                </div>
              )}

              {selectedFile && !filePreviewUrl && (
                <div className="wa-doc-preview">
                  <div className="wa-doc-preview-icon">
                    {selectedFile.type === 'application/pdf' ? <FaFilePdf /> :
                     selectedFile.type?.includes('word') || selectedFile.name?.endsWith('.docx') ? <FaFileWord /> :
                     selectedFile.type?.startsWith('image/') ? <FaImage /> : <FaFile />}
                  </div>
                  <div className="wa-doc-preview-info">
                    <span className="wa-doc-preview-name">{selectedFile.name}</span>
                    <span className="wa-doc-preview-meta">
                      {selectedFile.type?.split('/').pop()?.toUpperCase() || 'FILE'} · {(selectedFile.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <button className="wa-doc-preview-close" onClick={clearFile} disabled={sending}>
                    <FaTimes />
                  </button>
                </div>
              )}

              {/* Input genérico para archivos (oculto) */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={sending}
              />

              {/* Aviso de ventana 24h expirada + botón para revivir */}
              {windowExpired && (
                <div className="wa-window-expired-banner">
                  <div className="wa-window-expired-text">
                    <FaClock style={{ marginRight: 6 }} />
                    Ventana de 24h expirada — envía la plantilla para retomar la conversación
                  </div>
                  <Button
                    variant="warning"
                    size="sm"
                    className="wa-revive-btn"
                    onClick={handleSendTemplate}
                    disabled={sendingTemplate}
                  >
                    {sendingTemplate ? <Spinner size="sm" /> : <><FaWhatsapp style={{ marginRight: 4 }} /> Revivir conversación</>}
                  </Button>
                </div>
              )}

              {/* Banner de contacto bloqueado */}
              {selectedLead.bloqueado && (
                <div className="wa-blocked-banner">
                  <FaBan className="me-2" />
                  Este contacto está bloqueado. No puedes enviar ni recibir mensajes.
                  <Button variant="outline-light" size="sm" className="ms-3" onClick={handleBlockToggle}>
                    <FaUnlock className="me-1" /> Desbloquear
                  </Button>
                </div>
              )}

              {/* Audio recording UI */}
              {isRecording && (
                <div className="wa-recording-bar">
                  <button className="wa-recording-cancel" onClick={cancelRecording} title="Cancelar">
                    <FaTrash />
                  </button>
                  <div className="wa-recording-indicator">
                    <span className="wa-recording-dot" />
                    <span className="wa-recording-time">{formatRecordingTime(recordingTime)}</span>
                  </div>
                  <button className="wa-recording-stop" onClick={stopRecording} title="Detener y previsualizar">
                    <FaStop />
                  </button>
                </div>
              )}

              {/* Audio preview (after recording, before sending) */}
              {audioBlob && !isRecording && (
                <div className="wa-audio-preview">
                  <button type="button" className="wa-audio-preview-cancel" onClick={cancelRecording} title="Descartar">
                    <FaTrash />
                  </button>
                  <div className="wa-audio-player-wrapper">
                    <audio
                      controls
                      src={audioPreviewUrl}
                      className="wa-audio-player"
                      onError={(e) => {
                        // En algunos navegadores móviles el preview no reproduce el blob
                        // Reemplazar con indicador visual sin bloquear el envío
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:6px 12px;color:#666;font-size:0.8rem;">🎤 Audio listo para enviar</div>';
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="wa-audio-preview-send"
                    onClick={() => sendAudioNote()}
                    disabled={sending}
                    title="Enviar nota de voz"
                  >
                    {sending ? <Spinner size="sm" /> : <FaPaperPlane />}
                  </button>
                </div>
              )}

              {/* Input de mensaje (oculto si está grabando/previsualizando audio o contacto bloqueado) */}
              {!isRecording && !audioBlob && !selectedLead.bloqueado && (
              <form className="wa-message-input-container" onSubmit={handleSend}>
                <Button
                  variant="light"
                  className="wa-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  title="Adjuntar archivo o imagen"
                >
                  <FaPaperclip />
                </Button>
                <textarea
                  ref={inputRef}
                  className="wa-message-input"
                  placeholder={selectedLead.modo_humano ? "Escribe tu mensaje como humano..." : "Escribe un mensaje (se enviará como humano)..."}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    // Auto-resize: crecer hacia arriba (como Claude)
                    e.target.style.height = 'auto';
                    const newH = Math.min(e.target.scrollHeight, 160);
                    e.target.style.height = newH + 'px';
                    e.target.style.overflowY = newH >= 160 ? 'auto' : 'hidden';
                  }}
                  onKeyDown={(e) => {
                    // Enter envía, Shift+Enter nueva línea
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (message.trim() || selectedFile) handleSend(e);
                    }
                  }}
                  disabled={sending}
                  rows={1}
                />
                {/* Botón de micrófono / enviar */}
                {message.trim() || selectedFile ? (
                  <Button
                    type="submit"
                    variant="success"
                    className="wa-send-btn"
                    disabled={(!message.trim() && !selectedFile) || sending}
                  >
                    {sending ? <Spinner size="sm" /> : <FaPaperPlane />}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="success"
                    className="wa-send-btn wa-mic-btn"
                    onClick={startRecording}
                    disabled={sending}
                    title="Grabar nota de voz"
                  >
                    <FaMicrophone />
                  </Button>
                )}
              </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Modal de Cotización Rápida ── */}
      {showQuoteModal && (
        <div className="wq-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowQuoteModal(false); }}
          onTouchMove={(e) => e.stopPropagation()}>
          <div className="wq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wq-header">
              <h3><FaCalculator className="me-2" />Cotización Rápida</h3>
              <button className="wq-close" onClick={() => setShowQuoteModal(false)}>&times;</button>
            </div>
            <div className="wq-body">
              <Form>
                <Row className="g-3">
                  {/* COLUMNA IZQUIERDA */}
                  <Col md={6}>
                    <div className="wq-form-section">
                      <div className="wq-section-title">Cliente y Proyecto</div>
                      <Row className="g-2">
                        <Col xs={7}>
                          <div className="wq-micro-label">Cliente *</div>
                          <Form.Control size="sm" value={quoteFields.clientName || ''} onChange={(e) => handleQuoteFieldChange('clientName', e.target.value)} placeholder="Nombre" />
                        </Col>
                        <Col xs={5}>
                          <div className="wq-micro-label">Teléfono</div>
                          <Form.Control size="sm" value={quoteFields.clientPhone || ''} onChange={(e) => handleQuoteFieldChange('clientPhone', e.target.value)} />
                        </Col>
                        <Col xs={6}>
                          <div className="wq-micro-label">Tipo de Trabajo *</div>
                          <Form.Select size="sm" value={quoteFields.tipoTrabajo || ''} onChange={(e) => handleQuoteFieldChange('tipoTrabajo', e.target.value)}>
                            <option value="">Seleccionar...</option>
                            {TIPOS_TRABAJO.map(t => <option key={t} value={t}>{t}</option>)}
                          </Form.Select>
                        </Col>
                        <Col xs={6}>
                          <div className="wq-micro-label">Nivel Académico *</div>
                          <Form.Select size="sm" value={quoteFields.nivelAcademico || ''} onChange={(e) => handleQuoteFieldChange('nivelAcademico', e.target.value)}>
                            <option value="">Seleccionar...</option>
                            {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                          </Form.Select>
                        </Col>
                        <Col xs={12}>
                          <div className="wq-micro-label">Área de Estudio</div>
                          <Form.Select size="sm" value={quoteFields.area || ''} onChange={(e) => handleQuoteFieldChange('area', e.target.value)}>
                            <option value="">Seleccionar...</option>
                            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                          </Form.Select>
                        </Col>
                        <Col xs={8}>
                          <div className="wq-micro-label">Carrera *</div>
                          <Form.Control size="sm" value={quoteFields.carrera || ''} onChange={(e) => handleQuoteFieldChange('carrera', e.target.value)} placeholder="Nombre de la carrera" />
                        </Col>
                        <Col xs={4}>
                          <div className="wq-micro-label">Páginas *</div>
                          <Form.Control size="sm" type="number" min="1" value={quoteFields.extensionEstimada || ''} onChange={(e) => handleQuoteFieldChange('extensionEstimada', e.target.value)} placeholder="Cant." />
                        </Col>
                        <Col xs={6}>
                          <div className="wq-micro-label">Tipo de Servicio</div>
                          <Form.Select size="sm" value={quoteFields.tipoServicio || 'modalidad1'} onChange={(e) => handleQuoteFieldChange('tipoServicio', e.target.value)}>
                            <option value="modalidad1">Modalidad 1 - Hacemos todo (100%)</option>
                            <option value="modalidad2">Modalidad 2 - Acompañamiento (75%)</option>
                            <option value="correccion">Solo Corrección (50%)</option>
                          </Form.Select>
                        </Col>
                        <Col xs={6}>
                          <div className="wq-micro-label">Fecha Entrega</div>
                          <Form.Control size="sm" value={quoteFields.fechaEntrega || ''} onChange={(e) => handleQuoteFieldChange('fechaEntrega', e.target.value)} placeholder="Ej: 15 de mayo" />
                        </Col>
                        <Col xs={12}>
                          <div className="wq-micro-label">Título del Trabajo</div>
                          <Form.Control size="sm" value={quoteFields.tituloTrabajo || ''} onChange={(e) => handleQuoteFieldChange('tituloTrabajo', e.target.value)} placeholder="Nombre del trabajo" />
                        </Col>
                      </Row>
                    </div>
                  </Col>

                  {/* COLUMNA DERECHA */}
                  <Col md={6}>
                    <div className="wq-form-section">
                      <div className="wq-section-title"><FaDollarSign className="me-1" /> Inversión y Entrega</div>
                      <Row className="g-2">
                        <Col xs={6}>
                          <div className="wq-micro-label">Precio Base (auto)</div>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text">$</span>
                            <Form.Control type="number" value={quotePrice?.precioBase || ''} disabled className="bg-light" />
                          </div>
                          {quotePriceLoading && <div style={{ fontSize: '0.65rem', color: '#6b7280' }}><Spinner size="sm" style={{ width: 10, height: 10 }} /> Calculando...</div>}
                        </Col>
                        <Col xs={6}>
                          <div className="wq-micro-label">Precio Manual (sobrescribe)</div>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text">$</span>
                            <Form.Control type="number" min="0" step="1" value={quoteFields.precioManual}
                              onChange={(e) => handleQuoteFieldChange('precioManual', e.target.value)}
                              placeholder={quotePrice ? String(quotePrice.precioBase) : '0'} />
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="wq-micro-label">Descuento (%)</div>
                          <div className="input-group input-group-sm">
                            <Form.Control type="number" min="0" max="100" value={quoteFields.descuentoEfectivo || 0}
                              onChange={(e) => handleQuoteFieldChange('descuentoEfectivo', e.target.value)} />
                            <span className="input-group-text">%</span>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="wq-micro-label">Método de Pago</div>
                          <Form.Select size="sm" value={quoteFields.metodoPago || 'tarjeta-nu'} onChange={(e) => handleQuoteFieldChange('metodoPago', e.target.value)}>
                            <option value="tarjeta-nu">Tarjeta Nu</option>
                            <option value="tarjeta-bbva">Tarjeta BBVA</option>
                            <option value="efectivo">Efectivo</option>
                          </Form.Select>
                        </Col>
                        <Col xs={12}>
                          <div className="wq-micro-label">Esquema de Pago</div>
                          <Form.Select size="sm" value={quoteFields.esquemaTipo || '33-33-34'} onChange={(e) => handleQuoteFieldChange('esquemaTipo', e.target.value)}>
                            <option value="50-50">50% inicio / 50% final</option>
                            <option value="33-33-34">33% inicio / 33% avance / 34% final</option>
                            <option value="6-quincenales">6 Pagos Quincenales</option>
                            <option value="6-mensuales">6 Pagos Mensuales</option>
                            <option value="unico">Pago único</option>
                          </Form.Select>
                        </Col>
                        <Col xs={6}>
                          <div className="wq-micro-label">Fecha Entrega</div>
                          <Form.Control size="sm" type="date" value={quoteFields.fechaEntregaDate || ''}
                            onChange={(e) => handleQuoteFieldChange('fechaEntregaDate', e.target.value)} />
                        </Col>
                        <Col xs={6}>
                          <div className="wq-micro-label">Pago Inicio</div>
                          <Form.Control size="sm" type="date" value={quoteFields.fechaPago1 || ''}
                            onChange={(e) => handleQuoteFieldChange('fechaPago1', e.target.value)} />
                        </Col>
                        {quoteFields.esquemaTipo === '33-33-34' && (
                          <Col xs={6}>
                            <div className="wq-micro-label">Pago Avance</div>
                            <Form.Control size="sm" type="date" value={quoteFields.fechaAvance || ''}
                              onChange={(e) => handleQuoteFieldChange('fechaAvance', e.target.value)} />
                          </Col>
                        )}
                        <Col xs={6}>
                          <div className="wq-micro-label">Pago Final</div>
                          <Form.Control size="sm" type="date" value={quoteFields.fechaPagoFinal || quoteFields.fechaEntregaDate || ''}
                            onChange={(e) => handleQuoteFieldChange('fechaPagoFinal', e.target.value)} />
                        </Col>
                      </Row>
                    </div>

                    {/* Resumen de precio */}
                    {(quotePrice || quoteFields.precioManual) && (
                      <div className="wq-price-summary">
                        <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
                          <span>Base:</span>
                          <strong>${(quoteFields.precioManual ? Number(quoteFields.precioManual) : (quotePrice?.precioBase || 0)).toLocaleString('es-MX')}</strong>
                        </div>
                        {quotePrice?.cargoUrgencia > 0 && !quoteFields.precioManual && (
                          <div className="d-flex justify-content-between mb-1 text-warning" style={{ fontSize: '0.75rem' }}>
                            <span>Urgencia:</span>
                            <strong>+${quotePrice.cargoUrgencia.toLocaleString('es-MX')}</strong>
                          </div>
                        )}
                        {Number(quoteFields.descuentoEfectivo) > 0 && (
                          <div className="d-flex justify-content-between mb-1 text-success" style={{ fontSize: '0.75rem' }}>
                            <span>Desc ({quoteFields.descuentoEfectivo}%):</span>
                            <strong>-${Math.round((quoteFields.precioManual ? Number(quoteFields.precioManual) : (quotePrice?.precioBase || 0)) * Number(quoteFields.descuentoEfectivo) / 100).toLocaleString('es-MX')}</strong>
                          </div>
                        )}
                        <div className="d-flex justify-content-between pt-2 border-top" style={{ fontSize: '0.9rem' }}>
                          <strong>Total:</strong>
                          <strong className="text-primary fs-5">
                            ${(() => {
                              const base = quoteFields.precioManual ? Number(quoteFields.precioManual) : (quotePrice?.precioBase || 0);
                              const desc = Math.round(base * Number(quoteFields.descuentoEfectivo || 0) / 100);
                              return (base - desc).toLocaleString('es-MX');
                            })()} MXN
                          </strong>
                        </div>
                      </div>
                    )}

                    {/* Botón Generar */}
                    <div className="mt-3">
                      <Button className="w-100 wq-generate-btn" onClick={handleGenerateQuotePDF} disabled={quoteGenerating}>
                        {quoteGenerating ? (<><Spinner size="sm" className="me-2" />Generando...</>) : (<><FaFilePdf className="me-2" />Generar PDF</>)}
                      </Button>
                      {quotePdfUrl && (
                        <a href={quotePdfUrl} target="_blank" rel="noopener noreferrer" className="wq-pdf-link mt-2">
                          <FaFilePdf /> Ver / Descargar PDF
                        </a>
                      )}
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWhatsApp;
