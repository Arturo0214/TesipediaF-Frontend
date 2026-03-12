import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Badge, Button, Spinner, Alert, Form } from 'react-bootstrap';
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
import './AdminWhatsApp.css';

const POLL_INTERVAL = 8000; // 8 segundos

const AdminWhatsApp = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [togglingHuman, setTogglingHuman] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);

  // Cargar leads
  const fetchLeads = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getLeads();
      setLeads(data);
      // Actualizar el lead seleccionado si existe
      if (selectedLead) {
        const updated = data.find(l => l.wa_id === selectedLead.wa_id);
        if (updated) setSelectedLead(updated);
      }
      setError(null);
    } catch (err) {
      if (!silent) setError(err.message);
      console.error('Error cargando leads:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedLead]);

  // Polling para actualizaciones en tiempo real
  useEffect(() => {
    fetchLeads();
    pollRef.current = setInterval(() => fetchLeads(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (!message.trim() || !selectedLead || sending) return;
    setSending(true);
    try {
      // Enviar por WhatsApp + guardar en historial (todo vía Backend)
      await sendWhatsAppMessage(selectedLead.wa_id, message.trim());
      toast.success('Mensaje enviado');
      setMessage('');
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

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
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

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), "d MMM, HH:mm", { locale: es });
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
      const content = isHuman ? msg.content.replace('[HUMANO] ', '') : msg.content;

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
            <div className="wa-message-text">{content}</div>
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
          <p className="mb-0">Verifica que las variables de entorno <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> estén configuradas correctamente.</p>
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

      <Row className="wa-body g-0">
        {/* Lista de conversaciones */}
        <Col md={4} className="wa-conversations-col">
          <div className="wa-search-box">
            <FaSearch className="wa-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o estado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="wa-search-input"
            />
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
        </Col>

        {/* Panel de chat */}
        <Col md={8} className="wa-chat-col">
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

              {/* Input de mensaje */}
              <form className="wa-message-input-container" onSubmit={handleSend}>
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
                  disabled={!message.trim() || sending}
                >
                  {sending ? <Spinner size="sm" /> : <FaPaperPlane />}
                </Button>
              </form>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AdminWhatsApp;
