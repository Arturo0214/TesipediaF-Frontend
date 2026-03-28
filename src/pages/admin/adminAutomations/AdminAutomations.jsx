import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import {
  getAutoReminderStatus,
  configAutoReminder,
  getRevivalStatus,
  configRevival,
  runRevival,
  getQuoteFollowUpStatus,
  configQuoteFollowUp,
  runQuoteFollowUp,
} from '../../../services/whatsapp/supabaseWhatsApp';
import './AdminAutomations.css';

const AdminAutomations = () => {
  // ─── Auto-Reminder Sofia ───────────────────────────────────
  const [autoReminderConfig, setAutoReminderConfig] = useState({
    active: false, intervalMinutes: 360, staleMinutes: 360, maxPerRun: 50, lastRun: null, lastResult: null,
  });
  const [autoReminderLoading, setAutoReminderLoading] = useState(false);

  // ─── Lead Revival ─────────────────────────────────────────
  const [revivalConfig, setRevivalConfig] = useState({
    active: false, intervalHours: 24, maxPerRun: 30, lastRun: null, lastResult: null,
  });
  const [revivalLoading, setRevivalLoading] = useState(false);
  const [revivalRunning, setRevivalRunning] = useState(false);

  // ─── Quote Follow-up ──────────────────────────────────────
  const [quoteFollowUpConfig, setQuoteFollowUpConfig] = useState({
    active: false, intervalHours: 12, maxPerRun: 40, lastRun: null, lastResult: null,
  });
  const [quoteFollowUpLoading, setQuoteFollowUpLoading] = useState(false);
  const [quoteFollowUpRunning, setQuoteFollowUpRunning] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);

  // ─── Fetch status ─────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [ar, rev, qf] = await Promise.allSettled([
        getAutoReminderStatus(),
        getRevivalStatus(),
        getQuoteFollowUpStatus(),
      ]);
      if (ar.status === 'fulfilled') setAutoReminderConfig(ar.value);
      if (rev.status === 'fulfilled') setRevivalConfig(rev.value);
      if (qf.status === 'fulfilled') setQuoteFollowUpConfig(qf.value);
    } catch { /* silencioso */ }
    setInitialLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Auto-Reminder handlers ───────────────────────────────
  const handleAutoReminderToggle = async () => {
    setAutoReminderLoading(true);
    try {
      const result = await configAutoReminder({ ...autoReminderConfig, active: !autoReminderConfig.active });
      setAutoReminderConfig(prev => ({ ...prev, ...result }));
      toast.success(result.active ? 'Auto-recordatorio ACTIVADO' : 'Auto-recordatorio DESACTIVADO');
    } catch { toast.error('Error al configurar auto-recordatorio'); }
    setAutoReminderLoading(false);
  };

  const handleAutoReminderSave = async () => {
    setAutoReminderLoading(true);
    try {
      const result = await configAutoReminder(autoReminderConfig);
      setAutoReminderConfig(prev => ({ ...prev, ...result }));
      toast.success('Configuración guardada');
    } catch { toast.error('Error al guardar'); }
    setAutoReminderLoading(false);
  };

  // ─── Revival handlers ─────────────────────────────────────
  const handleRevivalToggle = async () => {
    setRevivalLoading(true);
    try {
      const result = await configRevival({ ...revivalConfig, active: !revivalConfig.active });
      setRevivalConfig(prev => ({ ...prev, ...result }));
      toast.success(result.active ? 'Revival de leads ACTIVADO' : 'Revival de leads DESACTIVADO');
    } catch { toast.error('Error al configurar revival'); }
    setRevivalLoading(false);
  };

  const handleRevivalSave = async () => {
    setRevivalLoading(true);
    try {
      const result = await configRevival(revivalConfig);
      setRevivalConfig(prev => ({ ...prev, ...result }));
      toast.success('Configuración de revival guardada');
    } catch { toast.error('Error al guardar'); }
    setRevivalLoading(false);
  };

  const handleRevivalRun = async () => {
    setRevivalRunning(true);
    try {
      const result = await runRevival({ maxPerRun: revivalConfig.maxPerRun });
      if (result.total === 0) {
        toast('No hay leads fríos para revivir', { icon: 'ℹ️' });
      } else {
        toast.success(`Revival: ${result.sent} enviados de ${result.total}${result.failed ? ` (${result.failed} fallidos)` : ''}`);
      }
      setRevivalConfig(prev => ({ ...prev, lastResult: result, lastRun: new Date().toISOString() }));
    } catch (err) { toast.error(err.response?.data?.message || 'Error al ejecutar revival'); }
    setRevivalRunning(false);
  };

  // ─── Quote Follow-up handlers ─────────────────────────────
  const handleQuoteFollowUpToggle = async () => {
    setQuoteFollowUpLoading(true);
    try {
      const result = await configQuoteFollowUp({ ...quoteFollowUpConfig, active: !quoteFollowUpConfig.active });
      setQuoteFollowUpConfig(prev => ({ ...prev, ...result }));
      toast.success(result.active ? 'Seguimiento ACTIVADO' : 'Seguimiento DESACTIVADO');
    } catch { toast.error('Error al configurar seguimiento'); }
    setQuoteFollowUpLoading(false);
  };

  const handleQuoteFollowUpSave = async () => {
    setQuoteFollowUpLoading(true);
    try {
      const result = await configQuoteFollowUp(quoteFollowUpConfig);
      setQuoteFollowUpConfig(prev => ({ ...prev, ...result }));
      toast.success('Configuración de seguimiento guardada');
    } catch { toast.error('Error al guardar'); }
    setQuoteFollowUpLoading(false);
  };

  const handleQuoteFollowUpRun = async () => {
    setQuoteFollowUpRunning(true);
    try {
      const result = await runQuoteFollowUp({ maxPerRun: quoteFollowUpConfig.maxPerRun });
      if (result.total === 0) {
        toast('No hay cotizaciones pendientes de seguimiento', { icon: 'ℹ️' });
      } else {
        toast.success(`Seguimiento: ${result.sent} enviados de ${result.total}${result.failed ? ` (${result.failed} fallidos)` : ''}`);
      }
      setQuoteFollowUpConfig(prev => ({ ...prev, lastResult: result, lastRun: new Date().toISOString() }));
    } catch (err) { toast.error(err.response?.data?.message || 'Error al ejecutar seguimiento'); }
    setQuoteFollowUpRunning(false);
  };

  // ─── Helper: format last run time ─────────────────────────
  const formatTime = (isoStr) => {
    if (!isoStr) return 'Nunca';
    try { return new Date(isoStr).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }); }
    catch { return isoStr; }
  };

  if (initialLoading) {
    return (
      <Container className="auto-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="auto-page" fluid>
      <h4 className="auto-page-title">Automatizaciones</h4>
      <p className="auto-page-subtitle">
        Configura y controla los 3 sistemas de automatización de Sofia para el seguimiento de leads.
      </p>

      {/* ═══ Resumen global ═══ */}
      <div className="auto-summary">
        <div className="auto-summary-item">
          <span className={`auto-dot ${autoReminderConfig.active ? 'active' : ''}`} />
          <span>Auto-recordatorio</span>
        </div>
        <div className="auto-summary-item">
          <span className={`auto-dot ${revivalConfig.active ? 'active' : ''}`} />
          <span>Revival leads</span>
        </div>
        <div className="auto-summary-item">
          <span className={`auto-dot ${quoteFollowUpConfig.active ? 'active' : ''}`} />
          <span>Seguimiento cotizaciones</span>
        </div>
      </div>

      <Row className="g-3">
        {/* ──── 1. Auto-Reminder Sofia ──── */}
        <Col xs={12} lg={4}>
          <div className="auto-card">
            <div className="auto-card-header">
              <div className="auto-card-icon" style={{ background: '#ede9fe' }}>🤖</div>
              <div className="auto-card-title-group">
                <h5 className="auto-card-title">Auto-recordatorio Sofia</h5>
                <span className="auto-card-desc">Leads estancados en bienvenida, calificando o cotizando</span>
              </div>
              <button
                className={`auto-toggle-btn ${autoReminderConfig.active ? 'active' : ''}`}
                onClick={handleAutoReminderToggle}
                disabled={autoReminderLoading}
              >
                {autoReminderLoading ? '...' : autoReminderConfig.active ? 'ACTIVO' : 'INACTIVO'}
              </button>
            </div>

            <div className="auto-card-body">
              <div className="auto-fields">
                <label className="auto-field">
                  <span>Intervalo (min)</span>
                  <input type="number" min="5" max="720" value={autoReminderConfig.intervalMinutes}
                    onChange={e => setAutoReminderConfig(p => ({ ...p, intervalMinutes: Number(e.target.value) }))} />
                </label>
                <label className="auto-field">
                  <span>Inactivo (min)</span>
                  <input type="number" min="5" max="1440" value={autoReminderConfig.staleMinutes}
                    onChange={e => setAutoReminderConfig(p => ({ ...p, staleMinutes: Number(e.target.value) }))} />
                </label>
                <label className="auto-field">
                  <span>Max por ciclo</span>
                  <input type="number" min="1" max="100" value={autoReminderConfig.maxPerRun}
                    onChange={e => setAutoReminderConfig(p => ({ ...p, maxPerRun: Number(e.target.value) }))} />
                </label>
              </div>

              <div className="auto-actions">
                <button className="auto-save-btn" onClick={handleAutoReminderSave} disabled={autoReminderLoading}>
                  Guardar config
                </button>
              </div>

              {autoReminderConfig.lastResult && (
                <div className="auto-last-result">
                  <span className="auto-last-label">Último resultado:</span>
                  <span>{autoReminderConfig.lastResult.sent ?? 0} enviados</span>
                  {autoReminderConfig.lastResult.failed > 0 && (
                    <span className="auto-failed">{autoReminderConfig.lastResult.failed} fallidos</span>
                  )}
                </div>
              )}
              <div className="auto-last-run">
                Última ejecución: {formatTime(autoReminderConfig.lastRun)}
              </div>

              <div className="auto-explanation">
                Detecta leads sin actividad y les envía un mensaje personalizado de Sofia. Funciona con leads en etapa de bienvenida, calificación o cotización.
              </div>
            </div>
          </div>
        </Col>

        {/* ──── 2. Revival de Leads Fríos ──── */}
        <Col xs={12} lg={4}>
          <div className="auto-card">
            <div className="auto-card-header">
              <div className="auto-card-icon" style={{ background: '#fef3c7' }}>🔥</div>
              <div className="auto-card-title-group">
                <h5 className="auto-card-title">Revival de Leads Fríos</h5>
                <span className="auto-card-desc">Re-engancha leads que dejaron de responder</span>
              </div>
              <button
                className={`auto-toggle-btn ${revivalConfig.active ? 'active' : ''}`}
                onClick={handleRevivalToggle}
                disabled={revivalLoading}
              >
                {revivalLoading ? '...' : revivalConfig.active ? 'ACTIVO' : 'INACTIVO'}
              </button>
            </div>

            <div className="auto-card-body">
              <div className="auto-fields">
                <label className="auto-field">
                  <span>Intervalo (horas)</span>
                  <input type="number" min="1" max="168" value={revivalConfig.intervalHours}
                    onChange={e => setRevivalConfig(p => ({ ...p, intervalHours: Number(e.target.value) }))} />
                </label>
                <label className="auto-field">
                  <span>Max por ciclo</span>
                  <input type="number" min="1" max="100" value={revivalConfig.maxPerRun}
                    onChange={e => setRevivalConfig(p => ({ ...p, maxPerRun: Number(e.target.value) }))} />
                </label>
              </div>

              <div className="auto-actions">
                <button className="auto-save-btn" onClick={handleRevivalSave} disabled={revivalLoading}>
                  Guardar config
                </button>
                <button className="auto-run-btn" onClick={handleRevivalRun} disabled={revivalRunning}>
                  {revivalRunning ? <Spinner size="sm" /> : '▶ Ejecutar ahora'}
                </button>
              </div>

              {revivalConfig.lastResult && (
                <div className="auto-last-result">
                  <span className="auto-last-label">Último resultado:</span>
                  <span>{revivalConfig.lastResult.sent ?? 0} enviados</span>
                  <span>{revivalConfig.lastResult.skipped ?? 0} omitidos</span>
                  {revivalConfig.lastResult.failed > 0 && (
                    <span className="auto-failed">{revivalConfig.lastResult.failed} fallidos</span>
                  )}
                </div>
              )}

              {revivalConfig.lastResult?.tierStats && (
                <div className="auto-tiers">
                  {Object.entries(revivalConfig.lastResult.tierStats).map(([tier, count]) => (
                    <span key={tier} className={`auto-tier-badge ${count > 0 ? 'has-data' : ''}`}
                      style={count > 0 ? { background: '#fef3c7', color: '#92400e' } : {}}>
                      {tier}d: {count}
                    </span>
                  ))}
                </div>
              )}

              <div className="auto-last-run">
                Última ejecución: {formatTime(revivalConfig.lastRun)}
              </div>

              <div className="auto-explanation">
                Revive leads fríos en 4 niveles progresivos: 3 días (mensaje suave), 7 días (beneficio), 14 días (oferta especial), 30+ días (último intento).
              </div>
            </div>
          </div>
        </Col>

        {/* ──── 3. Seguimiento de Cotizaciones ──── */}
        <Col xs={12} lg={4}>
          <div className="auto-card">
            <div className="auto-card-header">
              <div className="auto-card-icon" style={{ background: '#dbeafe' }}>💰</div>
              <div className="auto-card-title-group">
                <h5 className="auto-card-title">Seguimiento de Cotizaciones</h5>
                <span className="auto-card-desc">Follow-up a leads con cotización enviada</span>
              </div>
              <button
                className={`auto-toggle-btn ${quoteFollowUpConfig.active ? 'active' : ''}`}
                onClick={handleQuoteFollowUpToggle}
                disabled={quoteFollowUpLoading}
              >
                {quoteFollowUpLoading ? '...' : quoteFollowUpConfig.active ? 'ACTIVO' : 'INACTIVO'}
              </button>
            </div>

            <div className="auto-card-body">
              <div className="auto-fields">
                <label className="auto-field">
                  <span>Intervalo (horas)</span>
                  <input type="number" min="1" max="72" value={quoteFollowUpConfig.intervalHours}
                    onChange={e => setQuoteFollowUpConfig(p => ({ ...p, intervalHours: Number(e.target.value) }))} />
                </label>
                <label className="auto-field">
                  <span>Max por ciclo</span>
                  <input type="number" min="1" max="100" value={quoteFollowUpConfig.maxPerRun}
                    onChange={e => setQuoteFollowUpConfig(p => ({ ...p, maxPerRun: Number(e.target.value) }))} />
                </label>
              </div>

              <div className="auto-actions">
                <button className="auto-save-btn" onClick={handleQuoteFollowUpSave} disabled={quoteFollowUpLoading}>
                  Guardar config
                </button>
                <button className="auto-run-btn" onClick={handleQuoteFollowUpRun} disabled={quoteFollowUpRunning}>
                  {quoteFollowUpRunning ? <Spinner size="sm" /> : '▶ Ejecutar ahora'}
                </button>
              </div>

              {quoteFollowUpConfig.lastResult && (
                <div className="auto-last-result">
                  <span className="auto-last-label">Último resultado:</span>
                  <span>{quoteFollowUpConfig.lastResult.sent ?? 0} enviados</span>
                  <span>{quoteFollowUpConfig.lastResult.skipped ?? 0} omitidos</span>
                  {quoteFollowUpConfig.lastResult.failed > 0 && (
                    <span className="auto-failed">{quoteFollowUpConfig.lastResult.failed} fallidos</span>
                  )}
                </div>
              )}

              {quoteFollowUpConfig.lastResult?.tierStats && (
                <div className="auto-tiers">
                  {Object.entries(quoteFollowUpConfig.lastResult.tierStats).map(([tier, count]) => (
                    <span key={tier} className={`auto-tier-badge ${count > 0 ? 'has-data' : ''}`}
                      style={count > 0 ? { background: '#dbeafe', color: '#1e40af' } : {}}>
                      {tier}d: {count}
                    </span>
                  ))}
                </div>
              )}

              <div className="auto-last-run">
                Última ejecución: {formatTime(quoteFollowUpConfig.lastRun)}
              </div>

              <div className="auto-explanation">
                Da seguimiento automático a leads con cotización enviada: 1 día (recordatorio), 3 días (beneficios), 7 días (urgencia), 14 días (oferta final).
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminAutomations;
