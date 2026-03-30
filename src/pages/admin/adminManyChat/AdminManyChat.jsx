import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Spinner, Alert,
  Form, Table,
} from 'react-bootstrap';
import {
  FaWhatsapp, FaUpload, FaPaperPlane, FaSync, FaEye, FaCheck,
  FaExclamationTriangle, FaChevronDown, FaChevronUp,
  FaComments, FaUser, FaRobot, FaUserTie, FaCircle,
} from 'react-icons/fa';
import {
  getManyChatStatus,
  importManyChatLeads,
  sendManyChatReactivation,
  previewManyChatMessages,
  getManyChatLeads,
  getLeadByWaId,
  parseHistorial,
  sendWhatsAppMessage,
  toggleModoHumano,
} from '../../../services/whatsapp/supabaseWhatsApp';
import { toast } from 'react-hot-toast';
import '../adminCommon.css';

const SEGMENTS = ['SUPER_HOT', 'HOT', 'WARM', 'TIBIO_1', 'TIBIO_2', 'FRIO', 'NEVER'];

const SEGMENT_COLORS = {
  SUPER_HOT: 'danger', HOT: 'warning', WARM: 'info', TIBIO_1: 'secondary',
  TIBIO_2: 'dark', FRIO: 'primary', NEVER: 'light',
};

const SEGMENT_LABELS = {
  SUPER_HOT: 'Super Hot (cotizaron)', HOT: 'Hot (7 días)', WARM: 'Warm (7-14 días)',
  TIBIO_1: 'Tibio 1 (14-30 días)', TIBIO_2: 'Tibio 2 (14-30 días)',
  FRIO: 'Frío (+30 días)', NEVER: 'Never (sin interacción)',
};

export default function AdminManyChat() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [previews, setPreviews] = useState(null);
  const [selectedSegments, setSelectedSegments] = useState(['SUPER_HOT']);
  const [maxPerRun, setMaxPerRun] = useState(30);
  const [dryRun, setDryRun] = useState(true);
  const [previewSegment, setPreviewSegment] = useState('SUPER_HOT');
  const [showConfig, setShowConfig] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getManyChatStatus();
      setStatus(data);
    } catch (err) {
      toast.error('Error al cargar status: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleImport = async () => {
    try {
      setImporting(true);
      const result = await importManyChatLeads({ segments: selectedSegments.length > 0 ? selectedSegments : undefined, dryRun });
      setImportResult(result);
      toast.success(`Importación ${dryRun ? '(sim)' : ''}: ${result.created} creados, ${result.updated} actualizados`);
      fetchStatus();
    } catch (err) { toast.error('Error: ' + err.message); }
    finally { setImporting(false); }
  };

  const handleSend = async () => {
    try {
      setSending(true);
      const result = await sendManyChatReactivation({ segments: selectedSegments.length > 0 ? selectedSegments : undefined, maxPerRun, dryRun });
      setSendResult(result);
      toast.success(`Envío ${dryRun ? '(sim)' : ''}: ${result.sent} enviados, ${result.skipped} saltados`);
      fetchStatus();
    } catch (err) { toast.error('Error: ' + err.message); }
    finally { setSending(false); }
  };

  const handlePreview = async () => {
    try {
      setPreviewing(true);
      const data = await previewManyChatMessages(previewSegment, 5);
      setPreviews(data);
    } catch (err) { toast.error('Error: ' + err.message); }
    finally { setPreviewing(false); }
  };

  const toggleSegment = (seg) => {
    setSelectedSegments(prev => prev.includes(seg) ? prev.filter(s => s !== seg) : [...prev, seg]);
  };

  /* ─── Chat state ─────────────────────────────────────────── */
  const [chatLeads, setChatLeads] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatDetailLoading, setChatDetailLoading] = useState(false);
  const chatEndRef = useRef(null);

  const fetchChatLeads = useCallback(async () => {
    try {
      setChatLoading(true);
      const data = await getManyChatLeads('todos', 1, 50);
      setChatLeads(data.leads || data || []);
    } catch (err) {
      toast.error('Error cargando leads ManyChat: ' + err.message);
    } finally {
      setChatLoading(false);
    }
  }, []);

  useEffect(() => { fetchChatLeads(); }, [fetchChatLeads]);

  const handleSelectLead = async (lead) => {
    setSelectedLead(lead);
    setChatDetailLoading(true);
    try {
      const data = await getLeadByWaId(lead.wa_id);
      const leadData = data.lead || data;
      const msgs = parseHistorial(leadData.historial_chat);
      setChatMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error('Error cargando chat: ' + err.message);
      setChatMessages([]);
    } finally {
      setChatDetailLoading(false);
    }
  };

  const getLastUserMsg = (lead) => {
    if (lead.lastUserMsg?.content) return lead.lastUserMsg.content;
    return null;
  };

  const isHumanMessage = (content) => content?.startsWith?.('[HUMANO');
  const isBotMessage = (role) => role === 'assistant';

  /* ─── Send message state ─────────────────────────────────── */
  const [msgText, setMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [togglingHumano, setTogglingHumano] = useState(false);
  const msgInputRef = useRef(null);

  const handleToggleHumano = async () => {
    if (!selectedLead) return;
    try {
      setTogglingHumano(true);
      const newVal = !selectedLead.modo_humano;
      await toggleModoHumano(selectedLead.wa_id, newVal);
      setSelectedLead(prev => ({ ...prev, modo_humano: newVal }));
      setChatLeads(prev => prev.map(l => l.wa_id === selectedLead.wa_id ? { ...l, modo_humano: newVal } : l));
      toast.success(newVal ? 'Modo humano activado' : 'Modo humano desactivado');
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setTogglingHumano(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim() || !selectedLead || sendingMsg) return;
    try {
      setSendingMsg(true);
      await sendWhatsAppMessage(selectedLead.wa_id, msgText.trim());
      // Add optimistic message
      const adminName = 'Arturo Suárez';
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `[HUMANO:${adminName}] ${msgText.trim()}`,
        timestamp: new Date().toISOString(),
      }]);
      setMsgText('');
      toast.success('Mensaje enviado');
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error('Error enviando: ' + err.message);
    } finally {
      setSendingMsg(false);
      msgInputRef.current?.focus();
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-2">Cargando ManyChat...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      <Row className="mb-3">
        <Col>
          <h4 className="d-flex align-items-center gap-2">
            <FaWhatsapp className="text-success" />
            Reactivación ManyChat
            <Button variant="outline-secondary" size="sm" onClick={fetchStatus} className="ms-auto">
              <FaSync /> Actualizar
            </Button>
          </h4>
          <Alert variant="info" className="py-2 mt-2" style={{ fontSize: '0.85rem' }}>
            Los contactos de ManyChat aparecen en el panel de <strong>WhatsApp</strong> con la etiqueta <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>manychat</Badge>.
            Usa el filtro <strong>"Origen"</strong> en WhatsApp para verlos separados.
          </Alert>
        </Col>
      </Row>

      {/* Stats */}
      <Row className="mb-3 g-3">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h2 className="mb-0 text-success">{status?.totalContacts || 0}</h2>
              <small className="text-muted">Contactos ManyChat</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h2 className="mb-0 text-primary">{status?.importedToSupabase || 0}</h2>
              <small className="text-muted">Importados a Supabase</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h2 className="mb-0 text-warning">{status?.sendResult?.sent || 0}</h2>
              <small className="text-muted">Último envío</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <small className="text-muted d-block">Último envío</small>
              <small>{status?.lastSend ? new Date(status.lastSend).toLocaleString('es-MX') : 'Nunca'}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Segments + Config (collapsible) */}
      <Row className="mb-3">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }} onClick={() => setShowConfig(!showConfig)}>
              <strong><FaPaperPlane className="me-2 text-success" />Importar y Enviar Reactivación</strong>
              {showConfig ? <FaChevronUp /> : <FaChevronDown />}
            </Card.Header>
            {showConfig && (
              <Card.Body>
                {/* Segment badges */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {SEGMENTS.map(seg => (
                    <Badge
                      key={seg}
                      bg={selectedSegments.includes(seg) ? SEGMENT_COLORS[seg] : 'light'}
                      text={selectedSegments.includes(seg) ? 'white' : 'dark'}
                      className="p-2" style={{ cursor: 'pointer', border: '1px solid #dee2e6', fontSize: '0.8rem' }}
                      onClick={() => toggleSegment(seg)}
                    >
                      {selectedSegments.includes(seg) && <FaCheck className="me-1" />}
                      {SEGMENT_LABELS[seg]} ({status?.segmentCounts?.[seg] || 0})
                    </Badge>
                  ))}
                </div>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small">Máximo por ejecución</Form.Label>
                      <Form.Control type="number" value={maxPerRun} onChange={e => setMaxPerRun(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={200} size="sm" />
                    </Form.Group>
                    <Form.Check type="switch" id="dryRun" label={dryRun ? '🧪 Simulación' : '🚀 REAL'} checked={dryRun} onChange={e => setDryRun(e.target.checked)} className="mb-2" />
                    {!dryRun && <Alert variant="warning" className="py-1 px-2" style={{ fontSize: '0.8rem' }}><FaExclamationTriangle className="me-1" />Modo REAL</Alert>}
                  </Col>
                  <Col md={6} className="d-flex flex-column gap-2">
                    <Button variant="outline-primary" size="sm" onClick={handleImport} disabled={importing || selectedSegments.length === 0}>
                      {importing ? <Spinner size="sm" className="me-1" /> : <FaUpload className="me-1" />}
                      {importing ? 'Importando...' : `Importar ${dryRun ? '(sim)' : ''}`}
                    </Button>
                    <Button variant={dryRun ? 'outline-success' : 'success'} size="sm" onClick={handleSend} disabled={sending || selectedSegments.length === 0}>
                      {sending ? <Spinner size="sm" className="me-1" /> : <FaPaperPlane className="me-1" />}
                      {sending ? 'Enviando...' : `Enviar ${dryRun ? '(sim)' : ''}`}
                    </Button>
                    <hr className="my-1" />
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Select size="sm" value={previewSegment} onChange={e => setPreviewSegment(e.target.value)} style={{ maxWidth: 180 }}>
                        {SEGMENTS.map(seg => <option key={seg} value={seg}>{SEGMENT_LABELS[seg]}</option>)}
                      </Form.Select>
                      <Button variant="outline-info" size="sm" onClick={handlePreview} disabled={previewing}>
                        {previewing ? <Spinner size="sm" /> : <FaEye className="me-1" />}Preview
                      </Button>
                    </div>
                  </Col>
                </Row>

                {/* Results */}
                {previews && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between mb-2">
                      <strong>Preview: {SEGMENT_LABELS[previews.segment]}</strong>
                      <Button variant="link" size="sm" onClick={() => setPreviews(null)}>Cerrar</Button>
                    </div>
                    {previews.previews.map((p, i) => (
                      <div key={i} className="mb-2 p-2 bg-light rounded border">
                        <strong style={{ fontSize: '0.85rem' }}>{p.nombre || p.wa_id}</strong>
                        <div className="p-2 bg-white rounded mt-1" style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>{p.message || '(no se enviaría)'}</div>
                      </div>
                    ))}
                  </div>
                )}
                {importResult && <div className="mt-2"><Alert variant="success" className="py-1" style={{ fontSize: '0.8rem' }}>{importResult.created} creados, {importResult.updated} actualizados, {importResult.skipped} sin cambios</Alert></div>}
                {sendResult && <div className="mt-2"><Alert variant="success" className="py-1" style={{ fontSize: '0.8rem' }}>{sendResult.sent} enviados, {sendResult.skipped} saltados, {sendResult.failed} fallidos</Alert></div>}
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>
      {/* ─── Chat Section ─────────────────────────────────────────── */}
      <Row className="mb-3">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 d-flex align-items-center gap-2">
              <FaComments className="text-success" />
              <strong>Conversaciones ManyChat</strong>
              <Badge bg="secondary" className="ms-1">{chatLeads.length}</Badge>
              <Button variant="outline-secondary" size="sm" className="ms-auto" onClick={fetchChatLeads} disabled={chatLoading}>
                <FaSync className={chatLoading ? 'spin' : ''} /> Actualizar
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ display: 'flex', height: '520px' }}>
                {/* Lead list */}
                <div style={{ width: '320px', borderRight: '1px solid #dee2e6', overflowY: 'auto', flexShrink: 0 }}>
                  {chatLoading ? (
                    <div className="text-center py-4"><Spinner size="sm" /></div>
                  ) : chatLeads.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <small>No hay leads ManyChat importados</small>
                    </div>
                  ) : (
                    chatLeads.map(lead => {
                      const lastUser = getLastUserMsg(lead);
                      const isActive = selectedLead?.wa_id === lead.wa_id;
                      return (
                        <div
                          key={lead.wa_id}
                          onClick={() => handleSelectLead(lead)}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0',
                            backgroundColor: isActive ? '#e8f5e9' : 'transparent',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className="d-flex align-items-center gap-1">
                                <strong style={{ fontSize: '0.9rem' }}>{lead.nombre || lead.wa_id}</strong>
                                {lead.manychat_segment && (
                                  <Badge bg={SEGMENT_COLORS[lead.manychat_segment] || 'secondary'} style={{ fontSize: '0.6rem' }}>
                                    {lead.manychat_segment}
                                  </Badge>
                                )}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {lead.ultimo_mensaje_preview || lastUser || lead.estado_sofia || ''}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#999', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                              {lead.totalMsgs || 0} msgs
                            </div>
                          </div>
                          <div className="d-flex gap-1 mt-1">
                            <Badge bg={lead.estado_sofia === 'descartado' ? 'danger' : lead.estado_sofia === 'cotizacion_enviada' ? 'success' : 'info'} style={{ fontSize: '0.65rem' }}>
                              {lead.estado_sofia || 'sin etapa'}
                            </Badge>
                            {lead.modo_humano && <Badge bg="warning" text="dark" style={{ fontSize: '0.65rem' }}>Humano</Badge>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  {!selectedLead ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                      <FaComments size={48} className="mb-2 opacity-25" />
                      <p>Selecciona un lead para ver su conversación</p>
                    </div>
                  ) : (
                    <>
                      {/* Chat header */}
                      <div style={{ padding: '10px 16px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
                        <div className="d-flex align-items-center gap-2">
                          <strong>{selectedLead.nombre || selectedLead.wa_id}</strong>
                          <small className="text-muted">+{selectedLead.wa_id}</small>
                          <Badge bg={SEGMENT_COLORS[selectedLead.manychat_segment] || 'secondary'}>
                            {selectedLead.manychat_segment}
                          </Badge>
                          <Button
                            variant={selectedLead.modo_humano ? 'success' : 'outline-secondary'}
                            size="sm"
                            className="ms-auto d-flex align-items-center gap-1"
                            onClick={handleToggleHumano}
                            disabled={togglingHumano}
                          >
                            {togglingHumano ? <Spinner size="sm" /> : <FaUserTie />}
                            {selectedLead.modo_humano ? 'Humano' : 'Activar Humano'}
                          </Button>
                        </div>
                      </div>

                      {/* Messages */}
                      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', backgroundColor: '#ece5dd' }}>
                        {chatDetailLoading ? (
                          <div className="text-center py-4"><Spinner size="sm" /> Cargando chat...</div>
                        ) : chatMessages.length === 0 ? (
                          <div className="text-center py-4 text-muted">Sin mensajes</div>
                        ) : (
                          chatMessages.map((msg, i) => {
                            const isUser = msg.role === 'user';
                            const isHuman = isHumanMessage(msg.content);
                            const content = msg.content || '';
                            if (content.startsWith('[STATE:')) return null;

                            return (
                              <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-start' : 'flex-end', marginBottom: '6px' }}>
                                <div style={{
                                  maxWidth: '75%',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  backgroundColor: isUser ? '#fff' : isHuman ? '#dcf8c6' : '#d4edff',
                                  boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                                  fontSize: '0.85rem',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}>
                                  {isHuman && (
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#e65100', marginBottom: '2px' }}>
                                      <FaUserTie className="me-1" />{content.match(/\[HUMANO:(.*?)\]/)?.[1] || 'Humano'}
                                    </div>
                                  )}
                                  {!isUser && !isHuman && (
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1565c0', marginBottom: '2px' }}>
                                      <FaRobot className="me-1" />Sofia
                                    </div>
                                  )}
                                  {isUser && (
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#2e7d32', marginBottom: '2px' }}>
                                      <FaUser className="me-1" />{selectedLead.nombre || 'Lead'}
                                    </div>
                                  )}
                                  {isHuman ? content.replace(/\[HUMANO:.*?\]\s*/, '') : content.replace(/\[STATE:\{.*?\}\]/, '').trim()}
                                  {msg.timestamp && (
                                    <div style={{ fontSize: '0.65rem', color: '#999', textAlign: 'right', marginTop: '2px' }}>
                                      {new Date(msg.timestamp).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Message input */}
                      <div style={{ borderTop: '1px solid #dee2e6', padding: '10px 12px', backgroundColor: '#f0f0f0' }}>
                        {!selectedLead.modo_humano ? (
                          <div className="text-center text-muted" style={{ fontSize: '0.8rem', padding: '6px 0' }}>
                            <FaRobot className="me-1" /> Sofia está atendiendo. Activa <strong>modo humano</strong> para responder.
                          </div>
                        ) : (
                          <form onSubmit={handleSendMessage} className="d-flex gap-2">
                            <Form.Control
                              ref={msgInputRef}
                              type="text"
                              placeholder="Escribe tu mensaje como humano..."
                              value={msgText}
                              onChange={e => setMsgText(e.target.value)}
                              disabled={sendingMsg}
                              size="sm"
                              style={{ borderRadius: '20px' }}
                            />
                            <Button
                              type="submit"
                              variant="success"
                              size="sm"
                              disabled={sendingMsg || !msgText.trim()}
                              style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
                            >
                              {sendingMsg ? <Spinner size="sm" /> : <FaPaperPlane />}
                            </Button>
                          </form>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
