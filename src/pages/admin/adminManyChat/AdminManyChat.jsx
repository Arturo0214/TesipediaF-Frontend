import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Spinner, Alert,
  Form, Table,
} from 'react-bootstrap';
import {
  FaWhatsapp, FaUpload, FaPaperPlane, FaSync, FaEye, FaCheck,
  FaExclamationTriangle, FaChevronDown, FaChevronUp,
} from 'react-icons/fa';
import {
  getManyChatStatus,
  importManyChatLeads,
  sendManyChatReactivation,
  previewManyChatMessages,
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
    </Container>
  );
}
