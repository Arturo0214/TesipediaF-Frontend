import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  getDiscountPromoPreview,
  getDiscountPromoLeads,
  sendDiscountPromo,
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

  // ─── Promo Descuento 10% ───────────────────────────────────
  const [promoPreview, setPromoPreview] = useState({ total: 0, leads: [] });
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSending, setPromoSending] = useState(false);
  const [promoLastResult, setPromoLastResult] = useState(null);
  const [promoMaxPerRun, setPromoMaxPerRun] = useState(50);

  // ─── Modal de selección de leads ──────────────────────────
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [modalLeads, setModalLeads] = useState([]);
  const [modalTotal, setModalTotal] = useState(0);
  const [modalPage, setModalPage] = useState(1);
  const [modalHasMore, setModalHasMore] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [selectedWaIds, setSelectedWaIds] = useState(new Set());
  const [expandedLead, setExpandedLead] = useState(null);
  const modalSearchTimer = useRef(null);
  // Filtros del modal
  const [modalFilters, setModalFilters] = useState({
    estado: '', carrera: '', atendido_por: '', days: 0, include_blocked: false, sort: 'updated_at.desc',
  });
  const [availableCarreras, setAvailableCarreras] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);

  // ─── Fetch status ─────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [ar, rev, qf, dp] = await Promise.allSettled([
        getAutoReminderStatus(),
        getRevivalStatus(),
        getQuoteFollowUpStatus(),
        getDiscountPromoPreview(),
      ]);
      if (ar.status === 'fulfilled') setAutoReminderConfig(ar.value);
      if (rev.status === 'fulfilled') setRevivalConfig(rev.value);
      if (qf.status === 'fulfilled') setQuoteFollowUpConfig(qf.value);
      if (dp.status === 'fulfilled') {
        console.log('✅ Promo preview:', dp.value);
        setPromoPreview(dp.value);
      } else {
        console.error('❌ Promo preview falló:', dp.reason);
      }
    } catch (err) { console.error('❌ fetchAll error:', err); }
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

  // ─── Promo Descuento handlers ──────────────────────────────
  const handlePromoRefresh = async () => {
    setPromoLoading(true);
    try {
      const result = await getDiscountPromoPreview();
      setPromoPreview(result);
    } catch { toast.error('Error al cargar preview de promo'); }
    setPromoLoading(false);
  };

  const handlePromoSend = async () => {
    if (promoPreview.total === 0) {
      toast('No hay leads con cotización lista/enviada', { icon: 'ℹ️' });
      return;
    }
    setPromoSending(true);
    try {
      const result = await sendDiscountPromo({ maxPerRun: promoMaxPerRun });
      if (result.total === 0) {
        toast('No hay leads elegibles para la promo', { icon: 'ℹ️' });
      } else {
        toast.success(`Promo enviada: ${result.sent} de ${result.total}${result.failed ? ` (${result.failed} fallidos)` : ''}`);
      }
      setPromoLastResult(result);
      // Refrescar preview
      handlePromoRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al enviar promo'); }
    setPromoSending(false);
  };

  // ─── Modal: cargar leads ───────────────���──────────────────
  const loadModalLeads = useCallback(async (page = 1, search = '', filters = {}, append = false) => {
    setModalLoading(true);
    try {
      const result = await getDiscountPromoLeads({
        page, limit: 50, search,
        ...filters,
      });
      if (append) {
        setModalLeads(prev => [...prev, ...result.leads]);
      } else {
        setModalLeads(result.leads);
      }
      setModalTotal(result.total);
      setModalPage(result.page);
      setModalHasMore(result.hasMore);
      // Guardar carreras disponibles (solo viene en page 1)
      if (result.carreras) setAvailableCarreras(result.carreras);
    } catch { toast.error('Error al cargar leads'); }
    setModalLoading(false);
  }, []);

  const defaultFilters = { estado: '', carrera: '', atendido_por: '', days: 0, include_blocked: false, sort: 'updated_at.desc' };

  const handleOpenPromoModal = async () => {
    setShowPromoModal(true);
    setModalSearch('');
    setModalFilters(defaultFilters);
    setSelectedWaIds(new Set());
    setExpandedLead(null);
    await loadModalLeads(1, '', defaultFilters);
  };

  const handleModalSearch = (value) => {
    setModalSearch(value);
    clearTimeout(modalSearchTimer.current);
    modalSearchTimer.current = setTimeout(() => {
      loadModalLeads(1, value, modalFilters);
    }, 400);
  };

  const handleModalFilterChange = (key, value) => {
    // Si key es un objeto, es un reset completo de filtros
    if (typeof key === 'object') {
      setModalFilters(key);
      loadModalLeads(1, modalSearch, key);
      return;
    }
    const newFilters = { ...modalFilters, [key]: value };
    setModalFilters(newFilters);
    loadModalLeads(1, modalSearch, newFilters);
  };

  const handleModalLoadMore = () => {
    if (modalHasMore && !modalLoading) {
      loadModalLeads(modalPage + 1, modalSearch, modalFilters, true);
    }
  };

  const toggleSelectLead = (waId) => {
    setSelectedWaIds(prev => {
      const next = new Set(prev);
      if (next.has(waId)) next.delete(waId); else next.add(waId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedWaIds.size === modalLeads.length) {
      setSelectedWaIds(new Set());
    } else {
      setSelectedWaIds(new Set(modalLeads.map(l => l.wa_id)));
    }
  };

  const handleSendToSelected = async () => {
    if (selectedWaIds.size === 0) {
      toast('Selecciona al menos un lead', { icon: '⚠️' });
      return;
    }
    if (!window.confirm(`¿Enviar promo de descuento a ${selectedWaIds.size} leads seleccionados?`)) return;
    setPromoSending(true);
    try {
      const result = await sendDiscountPromo({ waIds: [...selectedWaIds] });
      if (result.total === 0) {
        toast('No se envió a ningún lead', { icon: 'ℹ️' });
      } else {
        toast.success(`Promo enviada: ${result.sent} de ${result.total}${result.failed ? ` (${result.failed} fallidos)` : ''}`);
      }
      setPromoLastResult(result);
      setShowPromoModal(false);
      handlePromoRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al enviar promo'); }
    setPromoSending(false);
  };

  const formatModalDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return d.toLocaleDateString('es-MX', { weekday: 'short' });
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
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
        <div className="auto-summary-item">
          <span className={`auto-dot ${promoPreview.total > 0 ? 'active' : ''}`} />
          <span>Promo 10% ({promoPreview.total})</span>
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

        {/* ──── 4. Promo Descuento 10% ──── */}
        <Col xs={12} lg={4}>
          <div className="auto-card">
            <div className="auto-card-header">
              <div className="auto-card-icon" style={{ background: '#dcfce7' }}>🏷️</div>
              <div className="auto-card-title-group">
                <h5 className="auto-card-title">Promo 10% Descuento</h5>
                <span className="auto-card-desc">Plantilla reactivacion_descuento para leads con cotización lista/enviada</span>
              </div>
              <button
                className="auto-save-btn"
                onClick={handlePromoRefresh}
                disabled={promoLoading}
                style={{ minWidth: 80 }}
              >
                {promoLoading ? '...' : '↻ Refrescar'}
              </button>
            </div>

            <div className="auto-card-body">
              <div className="auto-fields">
                <label className="auto-field">
                  <span>Max por envío</span>
                  <input type="number" min="1" max="200" value={promoMaxPerRun}
                    onChange={e => setPromoMaxPerRun(Number(e.target.value))} />
                </label>
              </div>

              {/* Preview de leads elegibles */}
              <div style={{ margin: '12px 0', padding: '10px', background: '#f0fdf4', borderRadius: 8, fontSize: 14 }}>
                <strong>{promoPreview.total}</strong> lead{promoPreview.total !== 1 ? 's' : ''} elegible{promoPreview.total !== 1 ? 's' : ''}
                {promoPreview.leads && promoPreview.leads.length > 0 && (
                  <div style={{ marginTop: 8, maxHeight: 120, overflowY: 'auto', fontSize: 13 }}>
                    {promoPreview.leads.slice(0, 10).map(l => (
                      <div key={l.wa_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span>{l.nombre || l.wa_id}</span>
                        <span style={{ color: '#6b7280', fontSize: 12 }}>{l.estado}</span>
                      </div>
                    ))}
                    {promoPreview.total > 10 && (
                      <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                        ... y {promoPreview.total - 10} más
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="auto-actions" style={{ display: 'flex', gap: 8 }}>
                <button
                  className="auto-run-btn"
                  onClick={handleOpenPromoModal}
                  disabled={promoSending || promoPreview.total === 0}
                  style={promoPreview.total === 0 ? { opacity: 0.5 } : { background: '#059669' }}
                >
                  {promoSending ? <Spinner size="sm" /> : `📋 Seleccionar leads (${promoPreview.total})`}
                </button>
                <button
                  className="auto-run-btn"
                  onClick={handlePromoSend}
                  disabled={promoSending || promoPreview.total === 0}
                  style={promoPreview.total === 0 ? { opacity: 0.5 } : {}}
                >
                  {promoSending ? <Spinner size="sm" /> : `▶ Enviar a TODOS (${promoPreview.total})`}
                </button>
              </div>

              {promoLastResult && (
                <div className="auto-last-result">
                  <span className="auto-last-label">Último resultado:</span>
                  <span>{promoLastResult.sent ?? 0} enviados</span>
                  {promoLastResult.failed > 0 && (
                    <span className="auto-failed">{promoLastResult.failed} fallidos</span>
                  )}
                </div>
              )}

              <div className="auto-explanation">
                Envía la plantilla aprobada <strong>reactivacion_descuento</strong> con 10% de descuento a leads con estado "cotización lista" o "cotización enviada". El envío es manual — tú decides cuándo dispararlo.
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <PromoLeadModal
        show={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        leads={modalLeads}
        total={modalTotal}
        hasMore={modalHasMore}
        loading={modalLoading}
        search={modalSearch}
        filters={modalFilters}
        carreras={availableCarreras}
        selectedWaIds={selectedWaIds}
        expandedLead={expandedLead}
        onSearch={handleModalSearch}
        onFilterChange={handleModalFilterChange}
        onLoadMore={handleModalLoadMore}
        onToggleSelect={toggleSelectLead}
        onToggleAll={toggleSelectAll}
        onExpand={setExpandedLead}
        onSend={handleSendToSelected}
        sending={promoSending}
        formatDate={formatModalDate}
      />
    </Container>
  );
};

// ─── Modal de selección de leads para promo ─────────────────
const PromoLeadModal = ({
  show, onClose, leads, total, hasMore, loading, search, filters, carreras,
  selectedWaIds, expandedLead,
  onSearch, onFilterChange, onLoadMore, onToggleSelect, onToggleAll, onExpand, onSend,
  sending, formatDate,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  if (!show) return null;
  const allSelected = leads.length > 0 && selectedWaIds.size === leads.length;

  const selectStyle = {
    padding: '5px 8px', borderRadius: 6, border: '1px solid #d1d5db',
    fontSize: 12, outline: 'none', background: '#fff', cursor: 'pointer', minWidth: 0,
  };
  const activeSelect = (val) => val ? { ...selectStyle, borderColor: '#059669', color: '#059669', fontWeight: 600 } : selectStyle;

  const dayOptions = [
    { value: 0, label: 'Cualquier fecha' },
    { value: 7, label: 'Última semana' },
    { value: 14, label: 'Últimos 14 días' },
    { value: 30, label: 'Último mes' },
    { value: 60, label: 'Últimos 2 meses' },
    { value: 90, label: 'Últimos 3 meses' },
  ];

  const activeFilterCount = [
    filters.estado, filters.carrera, filters.atendido_por,
    filters.days > 0, filters.include_blocked,
  ].filter(Boolean).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 12, width: '95%', maxWidth: 750,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#f0fdf4', borderRadius: '12px 12px 0 0',
        }}>
          <div>
            <h5 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#166534' }}>
              Seleccionar leads para promo 10%
            </h5>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              <strong style={{ color: '#059669' }}>{selectedWaIds.size}</strong> seleccionados de <strong>{total}</strong> elegibles
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#6b7280', lineHeight: 1,
          }}>&times;</button>
        </div>

        {/* Search + Filter toggle */}
        <div style={{ padding: '10px 20px 6px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar nombre, tel, carrera, tema..."
            value={search}
            onChange={e => onSearch(e.target.value)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 8,
              border: '1px solid #d1d5db', fontSize: 13, outline: 'none',
            }}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '7px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600,
              border: activeFilterCount > 0 ? '2px solid #059669' : '1px solid #d1d5db',
              background: activeFilterCount > 0 ? '#f0fdf4' : '#fff',
              color: activeFilterCount > 0 ? '#059669' : '#374151',
            }}
          >
            {showFilters ? '▲' : '▼'} Filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={allSelected} onChange={onToggleAll} style={{ width: 16, height: 16 }} />
            Todos
          </label>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div style={{
            padding: '8px 20px 12px', borderBottom: '1px solid #f3f4f6',
            display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
            background: '#fafbfc',
          }}>
            {/* Estado */}
            <select
              value={filters.estado}
              onChange={e => onFilterChange('estado', e.target.value)}
              style={activeSelect(filters.estado)}
            >
              <option value="">Estado: Todos</option>
              <option value="cotizacion_enviada">Cotización enviada</option>
              <option value="cotizacion_lista">Cotización lista</option>
            </select>

            {/* Periodo */}
            <select
              value={filters.days}
              onChange={e => onFilterChange('days', Number(e.target.value))}
              style={activeSelect(filters.days > 0)}
            >
              {dayOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Carrera */}
            <select
              value={filters.carrera}
              onChange={e => onFilterChange('carrera', e.target.value)}
              style={{ ...activeSelect(filters.carrera), maxWidth: 180 }}
            >
              <option value="">Carrera: Todas</option>
              {carreras.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Atendido por */}
            <select
              value={filters.atendido_por}
              onChange={e => onFilterChange('atendido_por', e.target.value)}
              style={activeSelect(filters.atendido_por)}
            >
              <option value="">Atendido: Todos</option>
              <option value="arturo">Arturo</option>
              <option value="sandy">Sandy</option>
              <option value="hugo">Hugo</option>
              <option value="sin_atender">Sin atender</option>
            </select>

            {/* Ordenar */}
            <select
              value={filters.sort}
              onChange={e => onFilterChange('sort', e.target.value)}
              style={selectStyle}
            >
              <option value="updated_at.desc">Más recientes</option>
              <option value="updated_at.asc">Más antiguos</option>
              <option value="nombre.asc">Nombre A-Z</option>
            </select>

            {/* Incluir bloqueados */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', color: filters.include_blocked ? '#dc2626' : '#6b7280' }}>
              <input
                type="checkbox"
                checked={filters.include_blocked}
                onChange={e => onFilterChange('include_blocked', e.target.checked)}
              />
              Bloqueados
            </label>

            {/* Limpiar filtros */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => onFilterChange({ estado: '', carrera: '', atendido_por: '', days: 0, include_blocked: false, sort: 'updated_at.desc' })}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none',
                  background: '#fee2e2', color: '#dc2626', fontSize: 11, cursor: 'pointer', fontWeight: 600,
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        )}

        {/* Lead list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          {leads.length === 0 && !loading && (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
              No se encontraron leads con estos filtros
            </div>
          )}
          {leads.map(lead => {
            const isSelected = selectedWaIds.has(lead.wa_id);
            const isExpanded = expandedLead === lead.wa_id;
            return (
              <div key={lead.wa_id} style={{
                borderBottom: '1px solid #f3f4f6',
                background: isSelected ? '#f0fdf4' : lead.bloqueado ? '#fef2f2' : '#fff',
                transition: 'background 0.15s',
              }}>
                {/* Lead row */}
                <div style={{
                  display: 'flex', alignItems: 'center', padding: '10px 20px', gap: 12, cursor: 'pointer',
                }} onClick={() => onToggleSelect(lead.wa_id)}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(lead.wa_id)}
                    onClick={e => e.stopPropagation()}
                    style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {lead.nombre || 'Sin nombre'}
                        {lead.bloqueado && <span style={{ color: '#dc2626', fontSize: 11, marginLeft: 6 }}>BLOQUEADO</span>}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatDate(lead.updated_at)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 11, padding: '1px 6px', borderRadius: 4, fontWeight: 600,
                        background: lead.estado === 'cotizacion_enviada' ? '#dcfce7' : '#fef9c3',
                        color: lead.estado === 'cotizacion_enviada' ? '#166534' : '#854d0e',
                      }}>
                        {lead.estado?.replace(/_/g, ' ')}
                      </span>
                      {lead.carrera && <span style={{ fontSize: 11, color: '#6b7280' }}>{lead.carrera}</span>}
                      {lead.nivel && <span style={{ fontSize: 10, color: '#9ca3af' }}>({lead.nivel})</span>}
                      {lead.precio && <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>{lead.precio}</span>}
                      {lead.atendido_por && (
                        <span style={{ fontSize: 10, padding: '0 5px', borderRadius: 3, background: '#ede9fe', color: '#7c3aed' }}>
                          {lead.atendido_por}
                        </span>
                      )}
                    </div>
                    {/* Mini preview del último mensaje */}
                    {lead.lastMessages && lead.lastMessages.length > 0 && (
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lead.lastMessages[lead.lastMessages.length - 1].role === 'user' ? '👤 ' : '🤖 '}
                        {lead.lastMessages[lead.lastMessages.length - 1].text || '...'}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onExpand(isExpanded ? null : lead.wa_id); }}
                    style={{
                      background: isExpanded ? '#f0fdf4' : 'none', border: '1px solid #e5e7eb', borderRadius: 6,
                      padding: '4px 8px', fontSize: 11, cursor: 'pointer', color: '#6b7280', flexShrink: 0,
                    }}
                  >
                    {isExpanded ? '▲' : '▼'} Chat
                  </button>
                </div>

                {/* Expanded chat preview */}
                {isExpanded && lead.lastMessages && (
                  <div style={{
                    padding: '0 20px 12px 50px',
                    background: '#f9fafb', borderTop: '1px solid #f3f4f6',
                  }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', padding: '8px 0 4px', fontWeight: 600 }}>
                      Últimos mensajes:
                    </div>
                    {lead.lastMessages.map((msg, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 8, padding: '4px 0',
                        flexDirection: msg.role === 'user' ? 'row' : 'row-reverse',
                      }}>
                        <div style={{
                          maxWidth: '80%', padding: '6px 10px', borderRadius: 8, fontSize: 13,
                          background: msg.role === 'user' ? '#fff' : '#dcfce7',
                          border: '1px solid ' + (msg.role === 'user' ? '#e5e7eb' : '#bbf7d0'),
                        }}>
                          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>
                            {msg.role === 'user' ? '👤 Cliente' : '🤖 Sofia/Admin'}
                            {msg.timestamp && <> — {formatDate(msg.timestamp)}</>}
                          </div>
                          {msg.text || '...'}
                        </div>
                      </div>
                    ))}
                    {lead.lastMessages.length === 0 && (
                      <div style={{ fontSize: 12, color: '#9ca3af', padding: '4px 0' }}>Sin mensajes</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Load more */}
          {hasMore && (
            <div style={{ textAlign: 'center', padding: 12 }}>
              <button
                onClick={onLoadMore}
                disabled={loading}
                style={{
                  background: 'none', border: '1px solid #d1d5db', borderRadius: 8,
                  padding: '6px 16px', fontSize: 13, color: '#6b7280', cursor: 'pointer',
                }}
              >
                {loading ? 'Cargando...' : `Cargar más (${total - leads.length} restantes)`}
              </button>
            </div>
          )}
          {loading && leads.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spinner size="sm" /> Cargando leads...
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fafbfc', borderRadius: '0 0 12px 12px',
        }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            <strong style={{ color: '#059669' }}>{selectedWaIds.size}</strong> de {leads.length} seleccionados
            {leads.length < total && <span style={{ color: '#9ca3af' }}> (mostrando {leads.length} de {total})</span>}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db',
              background: '#fff', fontSize: 14, cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button
              onClick={onSend}
              disabled={selectedWaIds.size === 0 || sending}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: selectedWaIds.size > 0 ? '#059669' : '#d1d5db',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: selectedWaIds.size > 0 ? 'pointer' : 'default',
              }}
            >
              {sending ? <><Spinner size="sm" /> Enviando...</> : `Enviar promo a ${selectedWaIds.size} leads`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAutomations;
