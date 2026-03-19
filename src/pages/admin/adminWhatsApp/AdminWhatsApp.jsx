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
  FaArrowLeft,
  FaCalculator,
  FaFilePdf,
  FaDollarSign,
} from 'react-icons/fa';
import {
  getLeads,
  getLeadByWaId,
  toggleModoHumano,
  sendWhatsAppMessage,
  parseHistorial,
} from '../../../services/whatsapp/supabaseWhatsApp';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { saveGeneratedQuote } from '../../../features/quotes/quoteSlice';
import './AdminWhatsApp.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://tesipedia-backend-service-production.up.railway.app';

/* ── Mapeo de labels internos a legibles ── */
const SERVICIO_MAP = { servicio_1: 'modalidad1', servicio_2: 'correccion', servicio_3: 'modalidad2' };
const SERVICIO_LABEL = { servicio_1: 'Redacción completa', servicio_2: 'Correcciones', servicio_3: 'Asesoría', modalidad1: 'Redacción completa', correccion: 'Correcciones', modalidad2: 'Asesoría' };
const PROYECTO_MAP = { proyecto_1: 'Tesis', proyecto_2: 'Tesina', proyecto_3: 'Otro' };
const NIVEL_MAP = { nivel_1: 'Licenciatura', nivel_2: 'Maestría', nivel_3: 'Doctorado' };
const AREAS = ['Área 1: Ciencias Físico-Matemáticas y de las Ingenierías', 'Área 2: Ciencias Biológicas, Químicas y de la Salud', 'Área 3: Ciencias Sociales', 'Área 4: Humanidades y Artes'];
const TIPOS_TRABAJO = ['Tesis', 'Tesina', 'Artículo Científico', 'Ensayo Académico', 'Protocolo de Investigación', 'Proyecto de Titulación', 'Reporte', 'Otro'];
const NIVELES = ['Licenciatura', 'Maestría', 'Especialidad', 'Doctorado'];

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

const POLL_INTERVAL = 3000; // 3 segundos para mejor tiempo real

const AdminWhatsApp = () => {
  const dispatch = useDispatch();
  const [leads, setLeads] = useState([]);
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
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteFields, setQuoteFields] = useState({});
  const [quotePrice, setQuotePrice] = useState(null);
  const [quotePriceLoading, setQuotePriceLoading] = useState(false);
  const [quoteGenerating, setQuoteGenerating] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectedLeadRef = useRef(null); // ref para evitar stale closure en polling
  const prevMsgCountRef = useRef(0); // para detectar mensajes nuevos y hacer scroll
  const prevLeadIdRef = useRef(null); // para scroll solo al cambiar de conversación

  // Mantener el ref sincronizado con el state
  useEffect(() => {
    selectedLeadRef.current = selectedLead;
    // Solo scroll al seleccionar un lead DIFERENTE, no en cada refresh de polling
    if (selectedLead && selectedLead.wa_id !== prevLeadIdRef.current) {
      prevLeadIdRef.current = selectedLead.wa_id;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (!selectedLead) {
      prevLeadIdRef.current = null;
    }
  }, [selectedLead]);

  // Cargar leads — usa el ref para siempre tener el selectedLead actual
  const fetchLeads = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getLeads();
      setLeads(data);
      // Actualizar el lead seleccionado usando el REF (no el state, que puede estar stale)
      const currentSelected = selectedLeadRef.current;
      if (currentSelected) {
        const updated = data.find(l => l.wa_id === currentSelected.wa_id);
        if (updated) {
          // Solo actualizar si los datos realmente cambiaron (evita re-renders y scrolls innecesarios)
          const chatChanged = JSON.stringify(updated.historial_chat) !== JSON.stringify(currentSelected.historial_chat);
          const metaChanged = updated.updated_at !== currentSelected.updated_at
            || updated.estado_sofia !== currentSelected.estado_sofia
            || updated.modo_humano !== currentSelected.modo_humano
            || updated.precio !== currentSelected.precio;
          if (chatChanged || metaChanged) {
            setSelectedLead(updated);
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
  }, []); // sin dependencias — usa ref en vez de state

  // Polling para actualizaciones en tiempo real
  useEffect(() => {
    fetchLeads();
    pollRef.current = setInterval(() => fetchLeads(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchLeads]);

  // Scroll automático cuando llegan mensajes nuevos
  useEffect(() => {
    if (selectedLead) {
      const hist = parseHistorial(selectedLead.historial_chat);
      if (hist.length > prevMsgCountRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      prevMsgCountRef.current = hist.length;
    } else {
      prevMsgCountRef.current = 0;
    }
  }, [selectedLead]);

  // Seleccionar una conversación
  const handleSelectLead = async (lead) => {
    setSelectedLead(lead);
    // Refrescar datos del lead seleccionado
    try {
      const fresh = await getLeadByWaId(lead.wa_id);
      if (fresh) setSelectedLead(fresh);
    } catch (err) {
      console.error('Error refrescando lead:', err);
    }
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
  const handleSend = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || !selectedLead || sending) return;
    setSending(true);
    try {
      // Enviar por WhatsApp + guardar en historial (todo vía Backend)
      await sendWhatsAppMessage(selectedLead.wa_id, message.trim(), selectedFile);
      toast.success(selectedFile ? 'Mensaje con archivo enviado' : 'Mensaje enviado');
      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // 3. Refrescar
      const fresh = await getLeadByWaId(selectedLead.wa_id);
      if (fresh) setSelectedLead(fresh);
      fetchLeads(true);
      inputRef.current?.focus();
    } catch (err) {
      toast.error('Error al enviar: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Validar tamaño u otro detalle si se quiere
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
      // 1. Generar PDF via backend
      // Construir fecha entrega legible para el PDF
      const fechaEntregaLegible = f.fechaEntregaDate
        ? new Date(f.fechaEntregaDate + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
        : (f.fechaEntrega || 'Por definir');
      // Nombre de archivo: Tesipedia-Cotizacion-NombreCliente-DDMM
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const clientShort = (f.clientName || 'Cliente').split(' ')[0];
      const pdfFilename = `Tesipedia-Cotizacion-${clientShort}-${dd}${mm}`;

      const pdfResp = await fetch(`${API_URL}/quotes/generate-quote-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: f.clientName,
          nombre: f.clientName,
          tituloTrabajo: f.tituloTrabajo || f.tema || '',
          tipoTrabajo: f.tipoTrabajo || 'Tesis',
          tipoServicio: f.tipoServicio || 'modalidad1',
          extensionEstimada: String(f.extensionEstimada),
          carrera: f.carrera,
          tiempoEntrega: fechaEntregaLegible,
          fechaEntregaRaw: f.fechaEntregaDate || '',
          precioBase,
          descuentoEfectivo: Number(f.descuentoEfectivo) || 0,
          recargoPorcentaje: 0,
          metodoPago: f.metodoPago || 'tarjeta-nu',
          esquemaTipo: f.esquemaTipo || '33-33-34',
          fechaPago1: f.fechaPago1 || '',
          fechaAvance: f.fechaAvance || '',
          pdfFilename,
        }),
      });
      const pdfData = await pdfResp.json();
      if (!pdfData.success) throw new Error(pdfData.message || 'Error generando PDF');

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

      // 3. Abrir el PDF en nueva pestaña para que el admin lo descargue/envíe manualmente
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }

      toast.success('PDF generado y cotización guardada');
      setShowQuoteModal(false);
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
    setQuoteGenerating(false);
  };

  // Obtener estados únicos para el filtro
  const estadosUnicos = [...new Set(leads.map(l => l.estado_sofia || 'sin_estado').filter(Boolean))];

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    // Filtro por estado
    if (estadoFilter !== 'all') {
      const estado = lead.estado_sofia || 'sin_estado';
      if (estado !== estadoFilter) return false;
    }
    // Filtro por búsqueda
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (lead.nombre || '').toLowerCase().includes(q) ||
      (lead.wa_id || '').includes(q) ||
      (lead.estado_sofia || '').toLowerCase().includes(q)
    );
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

  // Obtener último mensaje de un lead
  const getLastMessage = (lead) => {
    const hist = parseHistorial(lead.historial_chat);
    if (hist.length === 0) return 'Sin mensajes';
    const last = hist[hist.length - 1];
    const content = last.content || '';
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

  // Color de estado
  const getEstadoBadge = (estado) => {
    const map = {
      'bienvenida': 'info',
      'recopilando_datos': 'primary',
      'esperando_aprobacion': 'warning',
      'cotizacion_confirmada': 'success',
      'cotizacion_enviada': 'success',
    };
    return map[estado] || 'secondary';
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

    return historial.map((msg, idx) => {
      const isUser = msg.role === 'user';
      const isHuman = !isUser && msg.content?.startsWith('[HUMANO]');
      const isBot = !isUser && !isHuman;
      let content = isHuman ? msg.content.replace('[HUMANO] ', '') : msg.content;
      let stateData = null;

      // Extraer y limpiar [STATE:{...}] si es un mensaje del bot
      if (isBot && content) {
        const stateMatch = content.match(/\[STATE:([\s\S]*?)\]/);
        if (stateMatch) {
          content = content.replace(stateMatch[0], '').trim();
          try {
            // El JSON a veces viene incrustado con secuencias de escape
            let parsedStr = stateMatch[1];
            if (typeof parsedStr === 'string' && parsedStr.includes('\\"')) {
              parsedStr = parsedStr.replace(/\\"/g, '"');
            }
            stateData = JSON.parse(parsedStr);
          } catch(e) { 
            console.error('Error parseando STATE:', e);
          }
        }
        
        // Limpiar [CALCULAR_COTIZACION] visualmente
        content = content.replace(/\[CALCULAR_COTIZACION\]/g, '').trim();
      }

      return (
        <div
          key={idx}
          className={`wa-message ${isUser ? 'wa-message-user' : 'wa-message-bot'} ${isHuman ? 'wa-message-human' : ''}`}
        >
          <div className="wa-message-avatar">
            {isUser ? <FaUser /> : isHuman ? <FaUserTie /> : <FaRobot />}
          </div>
          <div className="wa-message-bubble">
            <div className="wa-message-sender">
              {isUser ? (selectedLead.nombre || 'Cliente') : isHuman ? 'Tú (Humano)' : 'Sofía (Bot)'}
            </div>
            
            {/* Si hay archivo/media */}
            {msg.mediaUrl && (
              <div className="wa-message-media mt-2 mb-2">
                {msg.mimetype?.startsWith('image/') || msg.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                  <a href={msg.mediaUrl} target="_blank" rel="noreferrer">
                    <img src={msg.mediaUrl} alt="Adjunto" className="wa-media-img" />
                  </a>
                ) : (
                  <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="wa-media-doc">
                    <FaFile className="me-2" /> {msg.filename || 'Ver documento'}
                  </a>
                )}
              </div>
            )}
            
            {content && <div className="wa-message-text">{content}</div>}

            {stateData && (
              <div className="wa-bot-state">
                <div className="wa-bot-state-title">
                  <FaTag className="me-1" /> Estado de la Operación
                </div>
                <div className="wa-bot-state-grid">
                  {Object.entries(stateData).filter(([_, v]) => v).map(([k, v]) => (
                    <div className="wa-state-item" key={k}>
                      <span className="wa-state-key">{k}:</span>
                      <span className="wa-state-value">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="wa-message-time">
               {msg.timestamp ? format(parseUTCDate(msg.timestamp), "HH:mm") : ''}
            </div>
          </div>
        </div>
      );
    });
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
      <div className="wa-header">
        <div className="wa-header-title">
          <FaWhatsapp className="wa-header-icon" />
          <h2>WhatsApp — Panel de Control</h2>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={() => fetchLeads()}>
          <FaSync className={loading ? 'fa-spin' : ''} /> Actualizar
        </Button>
      </div>

      <div className="wa-body">
        {/* Lista de conversaciones */}
        <div className="wa-conversations-col">
          <div className="wa-search-box">
            <FaSearch className="wa-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o estado..."
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

          {/* Filtro por estado */}
          <div className="wa-estado-filter">
            <button
              className={`wa-estado-pill ${estadoFilter === 'all' ? 'wa-estado-pill-active' : ''}`}
              onClick={() => setEstadoFilter('all')}
            >
              Todos ({leads.length})
            </button>
            {estadosUnicos.map(est => {
              const count = leads.filter(l => (l.estado_sofia || 'sin_estado') === est).length;
              return (
                <button
                  key={est}
                  className={`wa-estado-pill ${estadoFilter === est ? 'wa-estado-pill-active' : ''}`}
                  onClick={() => setEstadoFilter(est)}
                >
                  {est.replace(/_/g, ' ')} ({count})
                </button>
              );
            })}
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
              filteredLeads.map((lead) => {
                const unread = getUnreadCount(lead);
                const isSelected = selectedLead?.wa_id === lead.wa_id;
                return (
                  <div
                    key={lead.wa_id}
                    className={`wa-conversation-item ${isSelected ? 'wa-selected' : ''} ${lead.modo_humano ? 'wa-human-mode' : ''}`}
                    onClick={() => handleSelectLead(lead)}
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
                        {unread > 0 && (
                          <Badge bg="success" pill className="wa-unread-badge">{unread}</Badge>
                        )}
                      </div>
                      <div className="wa-conv-meta">
                        <Badge bg={getEstadoBadge(lead.estado_sofia)} className="wa-estado-badge">
                          {lead.estado_sofia || 'nuevo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel de chat */}
        <div className={`wa-chat-col ${selectedLead ? 'wa-chat-active' : ''}`}>
          {!selectedLead ? (
            <div className="wa-no-chat-selected">
              <FaWhatsapp size={64} />
              <h4>Selecciona una conversación</h4>
              <p>Elige un contacto de la lista para ver los mensajes</p>
            </div>
          ) : (
            <>
              {/* Header del chat */}
              <div className="wa-chat-header">
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
                  {/* Info del lead */}
                  <div className="wa-lead-info-pills">
                    {selectedLead.estado_sofia && (
                      <Badge bg={getEstadoBadge(selectedLead.estado_sofia)}>
                        <FaTag className="me-1" /> {selectedLead.estado_sofia}
                      </Badge>
                    )}
                    {selectedLead.tipo_servicio && (
                      <Badge bg="outline-secondary" className="wa-pill">{selectedLead.tipo_servicio}</Badge>
                    )}
                    {selectedLead.precio && (
                      <Badge bg="outline-success" className="wa-pill">${selectedLead.precio}</Badge>
                    )}
                  </div>
                  {/* Botón Cotizar */}
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={openQuoteModal}
                    className="wa-quote-btn"
                    title="Generar cotización desde datos del lead"
                  >
                    <FaCalculator className="me-1" /> Cotizar
                  </Button>
                  {/* Toggle modo humano */}
                  <Button
                    variant={selectedLead.modo_humano ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={handleToggleHuman}
                    disabled={togglingHuman}
                    className="wa-human-toggle"
                    title={selectedLead.modo_humano ? 'Desactivar modo humano (Sofía responderá)' : 'Activar modo humano (Sofía se pausa)'}
                  >
                    {togglingHuman ? (
                      <Spinner size="sm" />
                    ) : selectedLead.modo_humano ? (
                      <><FaToggleOn className="me-1" /> Modo Humano</>
                    ) : (
                      <><FaToggleOff className="me-1" /> Modo Bot</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Mensajes */}
              <div className="wa-messages-container">
                {selectedLead.modo_humano && (
                  <div className="wa-human-mode-banner">
                    <FaUserTie className="me-2" />
                    Modo humano activo — Sofía no responderá automáticamente
                  </div>
                )}
                {renderMessages()}
                <div ref={messagesEndRef} />
              </div>

              {/* Preview de archivo seleccionado */}
              {selectedFile && (
                <div className="wa-file-preview">
                  <div className="wa-file-info">
                    <FaFile className="me-2 text-primary" />
                    <span>{selectedFile.name}</span>
                  </div>
                  <Button variant="link" className="wa-file-remove p-0 text-danger" onClick={clearFile} disabled={sending}>
                    <FaTimes />
                  </Button>
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

              {/* Input de mensaje */}
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
                <input
                  ref={inputRef}
                  type="text"
                  className="wa-message-input"
                  placeholder={selectedLead.modo_humano ? "Escribe tu mensaje como humano..." : "Escribe un mensaje (se enviará como humano)..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  variant="success"
                  className="wa-send-btn"
                  disabled={(!message.trim() && !selectedFile) || sending}
                >
                  {sending ? <Spinner size="sm" /> : <FaPaperPlane />}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── Modal de Cotización Rápida ── */}
      {showQuoteModal && (
        <div className="wq-overlay" onClick={() => setShowQuoteModal(false)}>
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
                          <Form.Control size="sm" type="date" value={quoteFields.fechaEntregaDate || ''} disabled className="bg-light" />
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
