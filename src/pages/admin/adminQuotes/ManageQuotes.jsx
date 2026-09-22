import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Spinner, Pagination } from 'react-bootstrap';
import {
  FaSearch, FaCheck, FaTimes, FaTrash, FaFilePdf,
  FaDollarSign, FaBan, FaChevronDown,
  FaHourglassHalf, FaCheckCircle, FaTimesCircle,
  FaCreditCard, FaMoneyBillWave, FaSortAmountDown, FaSortAmountUp,
  FaCalculator, FaGlobe, FaWhatsapp,
  FaEdit, FaSave, FaSyncAlt,
} from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllQuotes, updateQuote, deleteQuote,
  getGeneratedQuotes, updateGeneratedQuote, deleteGeneratedQuote,
  resetQuoteState,
} from '../../../features/quotes/quoteSlice';
import { toast } from 'react-hot-toast';
import { generateSalesQuotePDF } from '../../../utils/generateSalesQuotePDF';
import './ManageQuotes.css';

const statusConfig = {
  pending:   { label: 'Pendiente',  color: '#f59e0b', bg: '#fef3c7', icon: <FaHourglassHalf /> },
  approved:  { label: 'Aprobada',   color: '#10b981', bg: '#d1fae5', icon: <FaCheckCircle /> },
  rejected:  { label: 'Rechazada',  color: '#ef4444', bg: '#fee2e2', icon: <FaTimesCircle /> },
  paid:      { label: 'Pagada',     color: '#3b82f6', bg: '#dbeafe', icon: <FaDollarSign /> },
  cancelled: { label: 'Cancelada',  color: '#6b7280', bg: '#f3f4f6', icon: <FaBan /> },
};

const paymentConfig = {
  'tarjeta-nu':   { label: 'Nu',      color: '#820ad1', icon: <FaCreditCard />,    border: '#820ad1' },
  'tarjeta-bbva': { label: 'BBVA',    color: '#0d6efd', icon: <FaCreditCard />,    border: '#0d6efd' },
  'efectivo':     { label: 'Efectivo', color: '#16a34a', icon: <FaMoneyBillWave />, border: '#16a34a' },
  'tarjeta':      { label: 'Tarjeta', color: '#374151', icon: <FaCreditCard />,    border: '#374151' },
};

/* ── Resolve payment method key (same logic for filter + display) ── */
const resolvePaymentKey = (source, rawMethod, discount) => {
  if (rawMethod && paymentConfig[rawMethod]) return rawMethod;
  if (source === 'regular') return 'sin-metodo';
  // Generated quotes: infer from discount
  if (discount > 0) return 'efectivo';
  return 'tarjeta-nu';
};

/* ── Normalize both quote types into a unified shape ── */
const normalizeGenerated = (q) => {
  const _paymentKey = resolvePaymentKey('generated', q.metodoPago, q.descuentoMonto || 0);
  return {
    ...q,
    _source: 'generated',
    _sourceLabel: 'Cotizador',
    _folio: q.folio || (q.publicId ? `COT-${String(q.publicId).slice(0, 8).toUpperCase()}` : ''),
    _createdBy: q.generatedBy?.name || '',
    _clientName: q.clientName || 'Sin nombre',
    _title: q.tituloTrabajo || q.tipoTrabajo || 'Sin título',
    _service: q.tipoServicio || '',
    _level: q.nivelAcademico || '',
    _pages: q.extensionEstimada || '',
    _career: q.carrera || '',
    _area: q.area || '',
    _taskType: q.tipoTrabajo || '',
    _price: q.precioConDescuento || 0,
    _basePrice: q.precioBase || 0,
    _discount: q.descuentoMonto || 0,
    _surcharge: q.recargoMonto || 0,
    _surchargePercent: q.recargoPorcentaje || 0,
    _dueDate: q.fechaEntrega || '',
    _deliveryTime: q.tiempoEntrega || '',
    _paymentMethod: q.metodoPago || '',
    _paymentKey,
    _paymentScheme: q.esquemaPago || '',
    _description: q.descripcionServicio || '',
    _email: q.clientEmail || '',
    _phone: q.clientPhone || '',
  };
};

const normalizeRegular = (q) => {
  const priceDetails = q.priceDetails || {};
  const finalPrice = priceDetails.finalPrice || q.estimatedPrice || 0;
  const basePrice = priceDetails.basePrice || q.estimatedPrice || 0;
  const cashDiscount = priceDetails.cashDiscount || 0;
  const urgencyCharge = priceDetails.urgencyCharge || 0;
  const userName = q.user?.name || q.name || 'Sin nombre';
  const _paymentKey = resolvePaymentKey('regular', '', cashDiscount);
  return {
    ...q,
    _source: 'regular',
    _sourceLabel: 'Endpoint',
    _folio: '',
    _createdBy: 'Sofia',
    _clientName: userName,
    _title: q.taskTitle || q.taskType || 'Sin título',
    _service: q.taskType || '',
    _level: q.educationLevel || '',
    _pages: q.pages ? String(q.pages) : '',
    _career: q.career || '',
    _area: q.studyArea || '',
    _taskType: q.taskType || '',
    _price: finalPrice,
    _basePrice: basePrice,
    _discount: cashDiscount,
    _surcharge: urgencyCharge,
    _surchargePercent: 0,
    _dueDate: q.dueDate ? new Date(q.dueDate).toLocaleDateString('es-MX') : '',
    _deliveryTime: '',
    _paymentMethod: '',
    _paymentKey,
    _paymentScheme: '',
    _description: q.requirements || '',
    _email: q.email || q.user?.email || '',
    _phone: q.phone || '',
  };
};

// Campos editables desde el visor (cotizaciones del cotizador)
const editableFromQuote = (q) => ({
  clientName: q.clientName || q._clientName || '',
  clientEmail: q.clientEmail || q._email || '',
  clientPhone: q.clientPhone || q._phone || '',
  tituloTrabajo: q.tituloTrabajo || '',
  carrera: q.carrera || '',
  area: q.area || '',
  extensionEstimada: q.extensionEstimada || '',
  tiempoEntrega: q.tiempoEntrega || '',
  fechaEntrega: q.fechaEntrega || '',
  vendedor: q.vendedor || '',
  precioBase: q.precioBase || 0,
  descuentoMonto: q.descuentoMonto || 0,
  recargoMonto: q.recargoMonto || 0,
  precioConDescuento: q.precioConDescuento || 0,
});

const ManageQuotes = () => {
  const dispatch = useDispatch();
  const { quotes, generatedQuotes, loading, error } = useSelector((state) => state.quotes);
  const { isAuthenticated, isAdmin } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'generated' | 'regular'
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [vendedorFilter, setVendedorFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [editBaseline, setEditBaseline] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const quotesPerPage = 20;

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      dispatch(getGeneratedQuotes());
      dispatch(getAllQuotes());
    }
  }, [dispatch, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(resetQuoteState()); }
  }, [error]);

  useEffect(() => {
    const handleClick = () => { setOpenDropdown(null); setPaymentDropdownOpen(false); };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  /* ── Merge & normalize both sources ── */
  const allQuotes = useMemo(() => {
    const gen = (generatedQuotes || []).map(normalizeGenerated);
    const reg = (quotes || []).map(normalizeRegular);
    return [...gen, ...reg];
  }, [generatedQuotes, quotes]);

  const stats = useMemo(() => {
    if (!allQuotes.length) return { total: 0, pending: 0, approved: 0, rejected: 0, paid: 0, cancelled: 0, revenue: 0, genCount: 0, regCount: 0 };
    const s = { total: allQuotes.length, pending: 0, approved: 0, rejected: 0, paid: 0, cancelled: 0, revenue: 0, genCount: 0, regCount: 0 };
    allQuotes.forEach(q => {
      const status = String(q.status).trim().toLowerCase();
      if (s[status] !== undefined) s[status]++;
      if (status === 'paid') s.revenue += (q._price || 0);
      if (q._source === 'generated') s.genCount++;
      else s.regCount++;
    });
    return s;
  }, [allQuotes]);

  const vendedores = useMemo(() => {
    const set = new Set();
    allQuotes.forEach((q) => { const v = (q.vendedor || '').trim(); if (v) set.add(v); });
    return [...set].sort();
  }, [allQuotes]);

  /* ── Todos los filtros SE COMBINAN entre sí (estado + origen + método + vendedor + precio + búsqueda) ── */
  const filteredQuotes = useMemo(() => {
    let list = [...allQuotes];
    if (sourceFilter !== 'all') list = list.filter(q => q._source === sourceFilter);
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      // Si la búsqueda trae 4+ dígitos, también se compara contra el teléfono
      // (solo dígitos en ambos lados: "55 8335-2096" encuentra a 5215583352096).
      const sDigits = s.replace(/\D/g, '');
      list = list.filter(q =>
        q._clientName.toLowerCase().includes(s) ||
        q._title.toLowerCase().includes(s) ||
        q._taskType.toLowerCase().includes(s) ||
        (q._id || '').toLowerCase().includes(s) ||
        (q._folio || '').toLowerCase().includes(s) ||
        (q.publicId || '').toLowerCase().includes(s) ||
        (q.leadId || '').toLowerCase().includes(s) ||
        (q.waId || '').includes(sDigits.length >= 4 ? sDigits : s) ||
        q._email.toLowerCase().includes(s) ||
        (sDigits.length >= 4 && String(q._phone || '').replace(/\D/g, '').includes(sDigits))
      );
    }
    if (filter !== 'all') list = list.filter(q => String(q.status) === filter);
    if (paymentFilter !== 'all') {
      list = list.filter(q => q._paymentKey === paymentFilter);
    }
    if (vendedorFilter !== 'all') list = list.filter(q => (q.vendedor || '').trim() === vendedorFilter);
    const pMin = parseFloat(priceMin);
    const pMax = parseFloat(priceMax);
    if (!Number.isNaN(pMin)) list = list.filter(q => (q._price || 0) >= pMin);
    if (!Number.isNaN(pMax)) list = list.filter(q => (q._price || 0) <= pMax);
    switch (sortBy) {
      case 'date-desc': list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'date-asc': list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'price-desc': list.sort((a, b) => b._price - a._price); break;
      case 'price-asc': list.sort((a, b) => a._price - b._price); break;
      default: break;
    }
    return list;
  }, [allQuotes, searchQuery, filter, sourceFilter, paymentFilter, sortBy, vendedorFilter, priceMin, priceMax]);

  const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage);
  const pageQuotes = filteredQuotes.slice((currentPage - 1) * quotesPerPage, currentPage * quotesPerPage);

  /* ── Visor de PDF: genera la vista previa desde los datos actuales ── */
  const buildPreview = useCallback(async (data) => {
    setPdfLoading(true);
    try {
      const blob = await generateSalesQuotePDF(data, { output: 'blob' });
      setPdfBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
    } catch (e) {
      console.error('[QuotePDF preview]', e);
      setPdfBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    } finally {
      setPdfLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedQuote) buildPreview(selectedQuote);
    else setPdfBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuote?._id]);

  /* ── Guardia de cambios sin guardar ── */
  const isDirty = editMode && JSON.stringify(editFields) !== JSON.stringify(editBaseline);

  useEffect(() => {
    const h = (e) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isDirty]);

  const closeModal = () => {
    if (isDirty && !window.confirm('Tienes cambios sin guardar en la cotización.\n¿Salir sin guardar?')) return;
    setSelectedQuote(null);
    setEditMode(false);
    setEditFields({});
    setEditBaseline({});
  };

  const cancelEdit = () => {
    if (isDirty && !window.confirm('Tienes cambios sin guardar.\n¿Descartar los cambios?')) return;
    setEditMode(false);
    setEditFields({});
    setEditBaseline({});
    buildPreview(selectedQuote);
  };

  const startEdit = () => {
    if (!selectedQuote) return;
    if (selectedQuote._source !== 'generated') { toast.error('Solo las cotizaciones del cotizador se editan aquí'); return; }
    const base = editableFromQuote(selectedQuote);
    setEditFields(base);
    setEditBaseline(base);
    setEditMode(true);
  };

  const setField = (k, v) => setEditFields((prev) => {
    const next = { ...prev, [k]: v };
    // Total = base − descuento + recargo (recalculado en vivo)
    if (['precioBase', 'descuentoMonto', 'recargoMonto'].includes(k)) {
      next.precioConDescuento = (Number(next.precioBase) || 0) - (Number(next.descuentoMonto) || 0) + (Number(next.recargoMonto) || 0);
    }
    return next;
  });

  const previewEdits = () => buildPreview({ ...selectedQuote, ...editFields });

  const handleSaveEdit = async () => {
    if (!selectedQuote) return;
    setSavingEdit(true);
    try {
      await dispatch(updateGeneratedQuote({ quoteId: selectedQuote._id, updatedData: editFields })).unwrap();
      dispatch(getGeneratedQuotes());
      const merged = normalizeGenerated({ ...selectedQuote, ...editFields });
      setSelectedQuote(merged);
      setEditMode(false);
      setEditFields({});
      setEditBaseline({});
      buildPreview(merged);
      toast.success('Cotización guardada ✅');
    } catch (err) {
      toast.error(err || 'Error al guardar');
    }
    setSavingEdit(false);
  };

  const handleStatus = async (quote, newStatus) => {
    setUpdatingId(quote._id); setOpenDropdown(null);
    try {
      let result;
      if (quote._source === 'generated') {
        result = await dispatch(updateGeneratedQuote({ quoteId: quote._id, updatedData: { status: newStatus } })).unwrap();
        dispatch(getGeneratedQuotes());
      } else {
        result = await dispatch(updateQuote({ quoteId: quote._id, updatedData: { status: newStatus } })).unwrap();
        dispatch(getAllQuotes());
      }

      // Si se marcó como pagada, mostrar feedback de auto-creación
      if (newStatus === 'paid' && result?._autoCreated) {
        const ac = result._autoCreated;
        const msgs = [`✅ Cotización marcada como pagada`];
        if (ac.project) msgs.push(`📁 Proyecto creado`);
        if (ac.payment) msgs.push(`💰 Pago registrado`);
        if (ac.clientCreated) msgs.push(`👤 Usuario cliente creado y credenciales enviadas por WhatsApp`);
        if (ac.projectError) msgs.push(`⚠️ Error en proyecto: ${ac.projectError}`);
        toast.success(msgs.join('\n'), { duration: 8000, style: { whiteSpace: 'pre-line' } });
      } else {
        toast.success(`Estado: ${statusConfig[newStatus]?.label || newStatus}`);
      }
      if (selectedQuote && String(selectedQuote._id) === String(quote._id)) {
        setSelectedQuote((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch (err) { toast.error(err || 'Error'); }
    setUpdatingId(null);
  };

  const handleDelete = async (quote) => {
    if (!window.confirm('¿Eliminar esta cotización?')) return;
    try {
      if (quote._source === 'generated') {
        await dispatch(deleteGeneratedQuote(quote._id)).unwrap();
      } else {
        await dispatch(deleteQuote(quote._id)).unwrap();
      }
      toast.success('Eliminada');
    } catch (err) { toast.error(err || 'Error'); }
  };

  const handleDownload = async (quote) => {
    if (quote._source !== 'generated') { toast.error('PDF solo disponible para cotizaciones del cotizador'); return; }
    try { await generateSalesQuotePDF(quote); toast.success('PDF descargado'); }
    catch { toast.error('Error al generar PDF'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : '-';
  const formatCurrency = (n) => `$${(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;
  const soloDigitos = (s) => String(s || '').replace(/\D/g, '');

  const StatusBadge = ({ quote }) => {
    const sc = statusConfig[quote.status] || statusConfig.pending;
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button className="mq-status-badge"
          style={{ background: sc.bg, color: sc.color, borderColor: `${sc.color}40` }}
          onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === quote._id ? null : quote._id); }}
          disabled={!!updatingId}>
          {updatingId === quote._id ? <ImSpinner2 className="mq-spin" /> : <>{sc.icon} {sc.label}</>}
          <FaChevronDown className="mq-chevron" />
        </button>
        {openDropdown === quote._id && (
          <div className="mq-dropdown" onClick={(e) => e.stopPropagation()}>
            {Object.entries(statusConfig).filter(([k]) => k !== quote.status).map(([k, v]) => (
              <button key={k} className="mq-dropdown-item" onClick={() => handleStatus(quote, k)}>
                <span style={{ color: v.color }}>{v.icon}</span> {v.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const editInput = (label, key, type = 'text', extra = {}) => (
    <label className="mq-edit-field">
      <span>{label}</span>
      <input
        type={type}
        value={editFields[key] ?? ''}
        onChange={(e) => setField(key, type === 'number' ? e.target.value : e.target.value)}
        {...extra}
      />
    </label>
  );

  return (
    <div className="mq">
      {/* Stats Pills */}
      <div className="mq-stats">
        {[
          { key: 'total', label: 'Total', val: stats.total, color: '#4a6cf7' },
          { key: 'pending', label: 'Pendientes', val: stats.pending, color: '#f59e0b' },
          { key: 'approved', label: 'Aprobadas', val: stats.approved, color: '#10b981' },
          { key: 'paid', label: 'Pagadas', val: stats.paid, color: '#3b82f6' },
          { key: 'rejected', label: 'Rechazadas', val: stats.rejected, color: '#ef4444' },
          { key: 'cancelled', label: 'Canceladas', val: stats.cancelled, color: '#6b7280' },
        ].map(s => (
          <button
            key={s.key}
            className={`mq-stat-pill ${filter === s.key || (filter === 'all' && s.key === 'total') ? 'mq-stat-active' : ''}`}
            style={{ '--pill-color': s.color }}
            onClick={() => { setFilter(s.key === 'total' ? 'all' : s.key); setCurrentPage(1); }}
          >
            <span className="mq-stat-num">{s.val}</span>
            <span className="mq-stat-label">{s.label}</span>
          </button>
        ))}
        <div className="mq-stat-pill mq-stat-revenue">
          <span className="mq-stat-num">{formatCurrency(stats.revenue)}</span>
          <span className="mq-stat-label">Ingreso</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mq-toolbar">
        <div className="mq-search">
          <FaSearch className="mq-search-icon" />
          <input type="text" placeholder="Buscar por cliente, título, email, teléfono, folio COT o ID..." value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="mq-sort-group">
          <button className={`mq-sort-btn ${sortBy.startsWith('date') ? 'active' : ''}`}
            onClick={() => setSortBy(sortBy === 'date-desc' ? 'date-asc' : 'date-desc')}>
            {sortBy === 'date-asc' ? <FaSortAmountUp /> : <FaSortAmountDown />} Fecha
          </button>
          <button className={`mq-sort-btn ${sortBy.startsWith('price') ? 'active' : ''}`}
            onClick={() => setSortBy(sortBy === 'price-desc' ? 'price-asc' : 'price-desc')}>
            {sortBy === 'price-asc' ? <FaSortAmountUp /> : <FaSortAmountDown />} Precio
          </button>
        </div>
        <div className="mq-price-range" title="Filtrar por rango de precio">
          <span className="mq-filter-label">Precio</span>
          <input type="number" min="0" placeholder="mín" value={priceMin}
            onChange={(e) => { setPriceMin(e.target.value); setCurrentPage(1); }} />
          <span className="mq-price-sep">–</span>
          <input type="number" min="0" placeholder="máx" value={priceMax}
            onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(1); }} />
          {(priceMin || priceMax) && (
            <button className="mq-price-clear" onClick={() => { setPriceMin(''); setPriceMax(''); setCurrentPage(1); }} title="Quitar filtro de precio">✕</button>
          )}
        </div>
        {vendedores.length > 0 && (
          <select className="mq-vend-select" value={vendedorFilter}
            onChange={(e) => { setVendedorFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">Vendedor: Todos</option>
            {vendedores.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        )}
      </div>

      {/* Filter Row — todos los filtros se combinan entre sí */}
      <div className="mq-filter-row">
        {/* Estado (lo más usado: Pendientes / Pagadas) */}
        <div className="mq-filter-group">
          <span className="mq-filter-label">Estado</span>
          <div className="mq-filter-pills">
            <button className={`mq-fpill ${filter === 'all' ? 'mq-fpill-active' : ''}`}
              onClick={() => { setFilter('all'); setCurrentPage(1); }}>
              Todas <span className="mq-fpill-count">{stats.total}</span>
            </button>
            {['pending', 'paid', 'approved', 'rejected', 'cancelled'].map((k) => (
              <button key={k}
                className={`mq-fpill mq-fpill-status ${filter === k ? 'mq-fpill-active' : ''}`}
                style={{ '--st-color': statusConfig[k].color }}
                onClick={() => { setFilter(filter === k ? 'all' : k); setCurrentPage(1); }}>
                {statusConfig[k].icon} {statusConfig[k].label}s <span className="mq-fpill-count">{stats[k === 'pending' ? 'pending' : k]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Source filter */}
        <div className="mq-filter-group">
          <span className="mq-filter-label">Origen</span>
          <div className="mq-filter-pills">
            <button className={`mq-fpill ${sourceFilter === 'all' ? 'mq-fpill-active' : ''}`}
              onClick={() => { setSourceFilter('all'); setCurrentPage(1); }}>
              Todas <span className="mq-fpill-count">{stats.total}</span>
            </button>
            <button className={`mq-fpill mq-fpill-sofia ${sourceFilter === 'regular' ? 'mq-fpill-active' : ''}`}
              onClick={() => { setSourceFilter('regular'); setCurrentPage(1); }}>
              Sofia <span className="mq-fpill-count">{stats.regCount}</span>
            </button>
            <button className={`mq-fpill mq-fpill-cotizador ${sourceFilter === 'generated' ? 'mq-fpill-active' : ''}`}
              onClick={() => { setSourceFilter('generated'); setCurrentPage(1); }}>
              <FaCalculator /> Cotizador <span className="mq-fpill-count">{stats.genCount}</span>
            </button>
          </div>
        </div>

        {/* Payment method filter */}
        <div className="mq-filter-group" style={{ position: 'relative' }}>
          <span className="mq-filter-label">Método de pago</span>
          <button className={`mq-fpill mq-fpill-dropdown ${paymentFilter !== 'all' ? 'mq-fpill-active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setPaymentDropdownOpen(!paymentDropdownOpen); }}>
            {paymentFilter === 'all' ? 'Todos' : (
              paymentFilter === 'sin-metodo' ? 'Sin método' :
              paymentConfig[paymentFilter]?.label || paymentFilter
            )}
            <FaChevronDown className="mq-chevron" />
          </button>
          {paymentDropdownOpen && (
            <div className="mq-pay-dropdown" onClick={(e) => e.stopPropagation()}>
              {[
                { key: 'all', label: 'Todos los métodos', color: '#374151', icon: null },
                { key: 'tarjeta-nu', label: 'Tarjeta Nu', color: '#820ad1', icon: <FaCreditCard /> },
                { key: 'tarjeta-bbva', label: 'Tarjeta BBVA', color: '#0d6efd', icon: <FaCreditCard /> },
                { key: 'efectivo', label: 'Efectivo', color: '#16a34a', icon: <FaMoneyBillWave /> },
                { key: 'tarjeta', label: 'Tarjeta (otro)', color: '#374151', icon: <FaCreditCard /> },
                { key: 'sin-metodo', label: 'Sin método', color: '#9ca3af', icon: null },
              ].map(opt => (
                <button key={opt.key}
                  className={`mq-pay-dropdown-item ${paymentFilter === opt.key ? 'mq-pay-dropdown-active' : ''}`}
                  onClick={() => { setPaymentFilter(opt.key); setPaymentDropdownOpen(false); setCurrentPage(1); }}>
                  {opt.icon && <span style={{ color: opt.color }}>{opt.icon}</span>}
                  <span>{opt.label}</span>
                  {paymentFilter === opt.key && <FaCheck className="mq-pay-check" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content — tabla profesional */}
      {loading ? (
        <div className="mq-loading"><Spinner animation="border" size="sm" /> Cargando...</div>
      ) : pageQuotes.length === 0 ? (
        <div className="mq-empty">No hay cotizaciones con estos filtros</div>
      ) : (
        <>
          <div className="mq-tablewrap">
            <table className="mq-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Cliente</th>
                  <th>Proyecto</th>
                  <th>Plazo</th>
                  <th>Esquema</th>
                  <th>Vendedor</th>
                  <th className="mq-th-num">Precio</th>
                  <th>Estado</th>
                  <th>Creada</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageQuotes.map(quote => (
                  <tr key={`${quote._source}-${quote._id}`}
                    className={`mq-trow mq-trow-${quote.status}`}
                    onClick={() => setSelectedQuote(quote)}
                    title="Ver PDF de la cotización">
                    <td className="mq-td-folio">
                      {quote._folio
                        ? <span className="mq-card-folio" title={`ID cliente: ${quote.leadId || '—'}`}>{quote._folio}</span>
                        : <span className={`mq-source-tag mq-source-${quote._source}`}>{quote._source === 'generated' ? <FaCalculator /> : <FaGlobe />} {quote._sourceLabel}</span>}
                    </td>
                    <td className="mq-td-client">
                      <div className="mq-td-name">{quote._clientName}</div>
                      {quote._phone && (
                        <a className="mq-td-phone" href={`https://wa.me/${soloDigitos(quote._phone)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <FaWhatsapp /> {quote._phone}
                        </a>
                      )}
                    </td>
                    <td className="mq-td-title">
                      <div className="mq-td-titletext" title={quote._title}>{quote._title}</div>
                      <div className="mq-td-sub">
                        {[quote._career, quote._pages && `${quote._pages} págs`, quote._service].filter(Boolean).join(' · ')}
                      </div>
                    </td>
                    <td className="mq-td-plazo">{quote._dueDate || '—'}</td>
                    <td className="mq-td-esquema" title={quote._paymentScheme}>{quote._paymentScheme ? `${quote._paymentScheme.slice(0, 34)}${quote._paymentScheme.length > 34 ? '…' : ''}` : '—'}</td>
                    <td className="mq-td-vend">{quote.vendedor || quote._createdBy || '—'}</td>
                    <td className="mq-td-price">
                      <span className="mq-td-price-val">{formatCurrency(quote._price)}</span>
                      {quote._discount > 0 && <span className="mq-card-disc">-{formatCurrency(quote._discount)}</span>}
                    </td>
                    <td className="mq-td-status" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge quote={quote} />
                    </td>
                    <td className="mq-td-date">{formatDate(quote.createdAt)}</td>
                    <td className="mq-td-actions" onClick={(e) => e.stopPropagation()}>
                      {quote._source === 'generated' && (
                        <button className="mq-act mq-act-pdf" onClick={() => handleDownload(quote)} title="Descargar PDF"><FaFilePdf /></button>
                      )}
                      <button className="mq-act mq-act-del" onClick={() => handleDelete(quote)} title="Eliminar"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mq-pagination">
              <span className="mq-page-info">{filteredQuotes.length} cotizaciones · Pág {currentPage}/{totalPages}</span>
              <Pagination size="sm">
                <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  return <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>{page}</Pagination.Item>;
                })}
                <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Visor de PDF + edición */}
      {selectedQuote && (
        <div className="mq-modal-overlay" onClick={closeModal}>
          <div className="mq-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="mq-viewer-head">
              <div className="mq-viewer-title">
                {selectedQuote._folio && <span className="mq-card-folio">{selectedQuote._folio}</span>}
                <h3>{selectedQuote._clientName}</h3>
                <span className="mq-viewer-sub">{selectedQuote._title}</span>
                {isDirty && <span className="mq-dirty-tag">● Cambios sin guardar</span>}
              </div>
              <div className="mq-modal-right">
                <StatusBadge quote={selectedQuote} />
                <button className="mq-close" onClick={closeModal}>&times;</button>
              </div>
            </div>

            <div className="mq-viewer-body">
              {/* Panel del PDF */}
              <div className="mq-pdf-pane">
                {pdfLoading ? (
                  <div className="mq-pdf-loading"><ImSpinner2 className="mq-spin" /> Generando vista previa…</div>
                ) : pdfBlobUrl ? (
                  <iframe className="mq-pdf-frame" src={`${pdfBlobUrl}#view=FitH`} title="Cotización PDF" />
                ) : (
                  <div className="mq-pdf-loading">No se pudo generar la vista previa del PDF.</div>
                )}
              </div>

              {/* Panel lateral: datos o edición */}
              <div className="mq-side-pane">
                {editMode ? (
                  <>
                    <h4><FaEdit /> Editar cotización</h4>
                    <div className="mq-edit-form">
                      {editInput('Cliente', 'clientName')}
                      {editInput('Teléfono', 'clientPhone', 'tel')}
                      {editInput('Email', 'clientEmail', 'email')}
                      {editInput('Título del trabajo', 'tituloTrabajo')}
                      {editInput('Carrera', 'carrera')}
                      {editInput('Área', 'area')}
                      <div className="mq-edit-grid2">
                        {editInput('Páginas', 'extensionEstimada')}
                        {editInput('Vendedor', 'vendedor')}
                      </div>
                      {editInput('Plazo (texto)', 'tiempoEntrega', 'text', { placeholder: 'ej. 10 de octubre de 2026' })}
                      {editInput('Fecha de entrega (texto)', 'fechaEntrega', 'text', { placeholder: 'ej. 15 de febrero de 2026' })}
                      <div className="mq-edit-seclabel"><FaDollarSign /> Precio</div>
                      <div className="mq-edit-grid2">
                        {editInput('Base', 'precioBase', 'number', { min: 0, step: 50 })}
                        {editInput('Descuento', 'descuentoMonto', 'number', { min: 0, step: 50 })}
                      </div>
                      <div className="mq-edit-grid2">
                        {editInput('Recargo', 'recargoMonto', 'number', { min: 0, step: 50 })}
                        {editInput('Total final', 'precioConDescuento', 'number', { min: 0, step: 50 })}
                      </div>
                      {selectedQuote.status !== 'paid' && (
                        <div className="mq-edit-hint">Al guardar con precio nuevo, el esquema de pago se recalcula solo.</div>
                      )}
                    </div>
                    <div className="mq-side-actions">
                      <button className="mq-btn mq-btn-outline" onClick={previewEdits} disabled={pdfLoading} title="Ver los cambios reflejados en el PDF">
                        <FaSyncAlt /> Ver cambios en PDF
                      </button>
                      <button className="mq-btn mq-btn-success" onClick={handleSaveEdit} disabled={savingEdit || !isDirty}>
                        <FaSave /> {savingEdit ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                      <button className="mq-btn mq-btn-ghost" onClick={cancelEdit}>Cancelar</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h4>Detalle</h4>
                    <div className="mq-details">
                      {[
                        ['Cliente', selectedQuote._clientName],
                        ['Teléfono', selectedQuote._phone],
                        ['Email', selectedQuote._email],
                        ['Título', selectedQuote._title],
                        ['Carrera', selectedQuote._career],
                        ['Área', selectedQuote._area],
                        ['Páginas', selectedQuote._pages],
                        ['Plazo', selectedQuote._deliveryTime],
                        ['Entrega', selectedQuote._dueDate],
                        ['Vendedor', selectedQuote.vendedor || selectedQuote._createdBy],
                        ['Esquema', selectedQuote._paymentScheme],
                        ['Creada', formatDate(selectedQuote.createdAt)],
                      ].filter(([, v]) => v).map(([label, val]) => (
                        <div key={label} className="mq-detail-row"><span className="mq-dlabel">{label}</span><span>{val}</span></div>
                      ))}
                      {selectedQuote.leadId && (
                        <div className="mq-detail-row"><span className="mq-dlabel">ID cliente</span><span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{selectedQuote.leadId}</span></div>
                      )}
                    </div>
                    <div className="mq-finance">
                      <div className="mq-frow"><span>Precio base</span><span>{formatCurrency(selectedQuote._basePrice)}</span></div>
                      {selectedQuote._discount > 0 && <div className="mq-frow mq-fdisc"><span>Descuento</span><span>-{formatCurrency(selectedQuote._discount)}</span></div>}
                      {selectedQuote._surcharge > 0 && <div className="mq-frow mq-fsurch"><span>Recargo</span><span>+{formatCurrency(selectedQuote._surcharge)}</span></div>}
                      <div className="mq-ftotal"><span>Total</span><span>{formatCurrency(selectedQuote._price)}</span></div>
                    </div>
                    <div className="mq-side-actions">
                      {selectedQuote._source === 'generated' && (
                        <button className="mq-btn mq-btn-outline" onClick={startEdit}><FaEdit /> Editar cotización</button>
                      )}
                      {selectedQuote._source === 'generated' && (
                        <button className="mq-btn mq-btn-outline" onClick={() => handleDownload(selectedQuote)}><FaFilePdf /> Descargar PDF</button>
                      )}
                      {selectedQuote.status === 'pending' && (
                        <button className="mq-btn mq-btn-success" onClick={() => handleStatus(selectedQuote, 'paid')}><FaDollarSign /> Marcar pagada</button>
                      )}
                      <button className="mq-btn mq-btn-del" onClick={() => { handleDelete(selectedQuote); setSelectedQuote(null); }}><FaTrash /> Eliminar</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuotes;
