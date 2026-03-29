import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, Table, ProgressBar } from 'react-bootstrap';
import { FaWhatsapp, FaUpload, FaPaperPlane, FaSync, FaEye, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import {
  getManyChatStatus,
  importManyChatLeads,
  sendManyChatReactivation,
  previewManyChatMessages,
} from '../../../services/whatsapp/supabaseWhatsApp';
import { toast } from 'react-hot-toast';
import '../adminCommon.css';

const SEGMENTS = ['SUPER_HOT', 'HOT', 'WARM', 'TIBIO_1', 'TIBIO_2'];

const SEGMENT_COLORS = {
  SUPER_HOT: 'danger',
  HOT: 'warning',
  WARM: 'info',
  TIBIO_1: 'secondary',
  TIBIO_2: 'dark',
};

const SEGMENT_LABELS = {
  SUPER_HOT: 'Super Hot (cotizaron)',
  HOT: 'Hot (7 días)',
  WARM: 'Warm (7-14 días)',
  TIBIO_1: 'Tibio 1 (14-30 días)',
  TIBIO_2: 'Tibio 2 (14-30 días)',
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

  // Opciones de envío
  const [selectedSegments, setSelectedSegments] = useState(['SUPER_HOT']);
  const [maxPerRun, setMaxPerRun] = useState(30);
  const [dryRun, setDryRun] = useState(true);
  const [previewSegment, setPreviewSegment] = useState('SUPER_HOT');

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getManyChatStatus();
      setStatus(data);
    } catch (err) {
      toast.error('Error al cargar status ManyChat: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleImport = async () => {
    try {
      setImporting(true);
      const result = await importManyChatLeads({
        segments: selectedSegments.length > 0 ? selectedSegments : undefined,
        dryRun,
      });
      setImportResult(result);
      toast.success(`Importación ${dryRun ? '(simulación)' : ''}: ${result.created} creados, ${result.updated} actualizados`);
      fetchStatus();
    } catch (err) {
      toast.error('Error al importar: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleSend = async () => {
    try {
      setSending(true);
      const result = await sendManyChatReactivation({
        segments: selectedSegments.length > 0 ? selectedSegments : undefined,
        maxPerRun,
        dryRun,
      });
      setSendResult(result);
      toast.success(`Envío ${dryRun ? '(simulación)' : ''}: ${result.sent} enviados, ${result.skipped} saltados`);
      fetchStatus();
    } catch (err) {
      toast.error('Error al enviar: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handlePreview = async () => {
    try {
      setPreviewing(true);
      const data = await previewManyChatMessages(previewSegment, 5);
      setPreviews(data);
    } catch (err) {
      toast.error('Error al previsualizar: ' + err.message);
    } finally {
      setPreviewing(false);
    }
  };

  const toggleSegment = (seg) => {
    setSelectedSegments(prev =>
      prev.includes(seg) ? prev.filter(s => s !== seg) : [...prev, seg]
    );
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-2">Cargando datos de ManyChat...</p>
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
          <p className="text-muted mb-0">
            Importa contactos de ManyChat y envía mensajes personalizados usando la plantilla aprobada de WhatsApp Business.
          </p>
        </Col>
      </Row>

      {/* Stats Cards */}
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

      {/* Segment Breakdown */}
      <Row className="mb-3">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <strong>Contactos por Segmento</strong>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                {SEGMENTS.map(seg => (
                  <Badge
                    key={seg}
                    bg={selectedSegments.includes(seg) ? SEGMENT_COLORS[seg] : 'light'}
                    text={selectedSegments.includes(seg) ? 'white' : 'dark'}
                    className="p-2 fs-6"
                    style={{ cursor: 'pointer', border: '1px solid #dee2e6' }}
                    onClick={() => toggleSegment(seg)}
                  >
                    {selectedSegments.includes(seg) && <FaCheck className="me-1" />}
                    {SEGMENT_LABELS[seg]} ({status?.segmentCounts?.[seg] || 0})
                  </Badge>
                ))}
              </div>
              <small className="text-muted mt-2 d-block">
                Haz clic para seleccionar/deseleccionar segmentos
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Row className="mb-3 g-3">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <strong>Configuración de Envío</strong>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Máximo por ejecución</Form.Label>
                <Form.Control
                  type="number"
                  value={maxPerRun}
                  onChange={e => setMaxPerRun(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={200}
                />
                <Form.Text className="text-muted">
                  Recomendado: 30-50 por ejecución para no saturar la API de Meta
                </Form.Text>
              </Form.Group>

              <Form.Check
                type="switch"
                id="dryRun"
                label={dryRun ? '🧪 Modo simulación (no envía nada)' : '🚀 Modo REAL (enviará mensajes)'}
                checked={dryRun}
                onChange={e => setDryRun(e.target.checked)}
                className="mb-3"
              />

              {!dryRun && (
                <Alert variant="warning" className="py-2">
                  <FaExclamationTriangle className="me-1" />
                  <strong>Atención:</strong> Los mensajes se enviarán de verdad via WhatsApp Business API
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <strong>Acciones</strong>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-2">
              <Button
                variant="outline-primary"
                onClick={handleImport}
                disabled={importing || selectedSegments.length === 0}
              >
                {importing ? <Spinner size="sm" className="me-1" /> : <FaUpload className="me-1" />}
                {importing ? 'Importando...' : `Importar a Supabase ${dryRun ? '(simulación)' : ''}`}
              </Button>

              <Button
                variant={dryRun ? 'outline-success' : 'success'}
                onClick={handleSend}
                disabled={sending || selectedSegments.length === 0}
              >
                {sending ? <Spinner size="sm" className="me-1" /> : <FaPaperPlane className="me-1" />}
                {sending ? 'Enviando...' : `Enviar Reactivación ${dryRun ? '(simulación)' : ''}`}
              </Button>

              <hr className="my-1" />

              <div className="d-flex gap-2 align-items-center">
                <Form.Select
                  size="sm"
                  value={previewSegment}
                  onChange={e => setPreviewSegment(e.target.value)}
                  style={{ maxWidth: 200 }}
                >
                  {SEGMENTS.map(seg => (
                    <option key={seg} value={seg}>{SEGMENT_LABELS[seg]}</option>
                  ))}
                </Form.Select>
                <Button variant="outline-info" size="sm" onClick={handlePreview} disabled={previewing}>
                  {previewing ? <Spinner size="sm" /> : <FaEye className="me-1" />}
                  Preview
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Preview Results */}
      {previews && (
        <Row className="mb-3">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 d-flex justify-content-between">
                <strong>Preview: {SEGMENT_LABELS[previews.segment]}</strong>
                <Button variant="link" size="sm" onClick={() => setPreviews(null)}>Cerrar</Button>
              </Card.Header>
              <Card.Body>
                {previews.previews.map((p, i) => (
                  <div key={i} className="mb-3 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between mb-1">
                      <strong>{p.nombre || p.wa_id}</strong>
                      <div>
                        {p.existsInSupabase ? (
                          <Badge bg="success" className="me-1">En Supabase</Badge>
                        ) : (
                          <Badge bg="secondary" className="me-1">Nuevo</Badge>
                        )}
                        {p.estadoSofia && <Badge bg="info">{p.estadoSofia}</Badge>}
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded border" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                      {p.message || '(no se enviaría)'}
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Import Results */}
      {importResult && (
        <Row className="mb-3">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 d-flex justify-content-between">
                <strong>Resultado de Importación {importResult.dryRun ? '(simulación)' : ''}</strong>
                <Button variant="link" size="sm" onClick={() => setImportResult(null)}>Cerrar</Button>
              </Card.Header>
              <Card.Body>
                <Row className="text-center mb-3">
                  <Col><h4 className="text-success">{importResult.created}</h4><small>Creados</small></Col>
                  <Col><h4 className="text-primary">{importResult.updated}</h4><small>Actualizados</small></Col>
                  <Col><h4 className="text-muted">{importResult.skipped}</h4><small>Sin cambios</small></Col>
                  <Col><h4 className="text-danger">{importResult.failed}</h4><small>Fallidos</small></Col>
                </Row>
                {importResult.details && importResult.details.length > 0 && (
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    <Table size="sm" striped>
                      <thead>
                        <tr>
                          <th>WA ID</th>
                          <th>Nombre</th>
                          <th>Segmento</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.details.slice(0, 50).map((d, i) => (
                          <tr key={i}>
                            <td><code>{d.wa_id}</code></td>
                            <td>{d.nombre || '-'}</td>
                            <td><Badge bg={SEGMENT_COLORS[d.segment] || 'secondary'} size="sm">{d.segment}</Badge></td>
                            <td>
                              <Badge bg={d.action === 'created' ? 'success' : d.action === 'updated' ? 'primary' : d.action === 'error' ? 'danger' : 'secondary'}>
                                {d.action}
                              </Badge>
                              {d.reason && <small className="text-muted ms-1">{d.reason}</small>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {importResult.details.length > 50 && (
                      <p className="text-muted text-center">...y {importResult.details.length - 50} más</p>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Send Results */}
      {sendResult && (
        <Row className="mb-3">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 d-flex justify-content-between">
                <strong>Resultado de Envío {sendResult.dryRun ? '(simulación)' : ''}</strong>
                <Button variant="link" size="sm" onClick={() => setSendResult(null)}>Cerrar</Button>
              </Card.Header>
              <Card.Body>
                <Row className="text-center mb-3">
                  <Col><h4 className="text-success">{sendResult.sent}</h4><small>Enviados</small></Col>
                  <Col><h4 className="text-danger">{sendResult.failed}</h4><small>Fallidos</small></Col>
                  <Col><h4 className="text-muted">{sendResult.skipped}</h4><small>Saltados</small></Col>
                  <Col><h4>{sendResult.total}</h4><small>Total elegibles</small></Col>
                </Row>

                {sendResult.segmentStats && (
                  <div className="mb-3">
                    <small className="text-muted">Enviados por segmento:</small>
                    <div className="d-flex gap-2 mt-1">
                      {Object.entries(sendResult.segmentStats).map(([seg, count]) => (
                        <Badge key={seg} bg={SEGMENT_COLORS[seg] || 'secondary'}>{seg}: {count}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {sendResult.nextIndex > 0 && (
                  <Alert variant="info" className="py-2">
                    Siguiente ejecución: usar startIndex = {sendResult.nextIndex} para continuar donde se quedó
                  </Alert>
                )}

                {sendResult.results && sendResult.results.length > 0 && (
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    <Table size="sm" striped>
                      <thead>
                        <tr>
                          <th>WA ID</th>
                          <th>Nombre</th>
                          <th>Segmento</th>
                          <th>Status</th>
                          <th>Detalle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sendResult.results.map((r, i) => (
                          <tr key={i}>
                            <td><code>{r.wa_id}</code></td>
                            <td>{r.nombre || '-'}</td>
                            <td><Badge bg={SEGMENT_COLORS[r.segment] || 'secondary'}>{r.segment}</Badge></td>
                            <td>
                              {r.success
                                ? <Badge bg="success">{r.dryRun ? 'Simulado' : 'Enviado'}</Badge>
                                : <Badge bg="danger">Falló</Badge>
                              }
                            </td>
                            <td>
                              <small className="text-muted">
                                {r.reason || r.method || (r.queuedMessage ? r.queuedMessage.substring(0, 60) + '...' : '')}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Info */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6>¿Cómo funciona?</h6>
              <ol className="mb-0" style={{ fontSize: '0.9rem' }}>
                <li><strong>Importar:</strong> Crea los leads en Supabase con etiqueta <code>origen: manychat</code> y su segmento.</li>
                <li><strong>Preview:</strong> Muestra los mensajes personalizados que se enviarían, basados en los datos del lead.</li>
                <li><strong>Enviar:</strong> Manda la plantilla <code>seguimiento_tesipedia</code> aprobada por Meta, y guarda un mensaje personalizado como pendiente.</li>
                <li><strong>Sofia responde:</strong> Cuando el lead conteste, Sofia enviará el mensaje personalizado automáticamente.</li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
