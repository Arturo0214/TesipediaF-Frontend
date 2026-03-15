import React, { useState, useEffect, useMemo } from 'react';
import { Spinner, Pagination } from 'react-bootstrap';
import {
  FaSearch, FaCheck, FaTimes, FaTrash, FaFilePdf,
  FaDollarSign, FaEye, FaBan, FaChevronDown,
  FaHourglassHalf, FaCheckCircle, FaTimesCircle,
  FaCreditCard, FaMoneyBillWave, FaSortAmountDown, FaSortAmountUp,
  FaCalendarAlt, FaFileAlt, FaGraduationCap, FaUser, FaGlobe, FaCalculator,
  FaEdit, FaSave, FaPhone,
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
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const quotesPerPage = 12;

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

  const filteredQuotes = useMemo(() => {
    let list = [...allQuotes];
    if (sourceFilter !== 'all') list = list.filter(q => q._source === sourceFilter);
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      list = list.filter(q =>
        q._clientName.toLowerCase().includes(s) ||
        q._title.toLowerCase().includes(s) ||
        q._taskType.toLowerCase().includes(s) ||
        (q._id || '').toLowerCase().includes(s) ||
        (q.publicId || '').toLowerCase().includes(s) ||
        q._email.toLowerCase().includes(s)
      );
    }
    if (filter !== 'all') list = list.filter(q => String(q.status) === filter);
    if (paymentFilter !== 'all') {
      list = list.filter(q => q._paymentKey === paymentFilter);
    }
    switch (sortBy) {
      case 'date-desc': list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'date-asc': list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'price-desc': list.sort((a, b) => b._price - a._price); break;
      case 'price-asc': list.sort((a, b) => a._price - b._price); break;
      default: break;
    }
    return list;
  }, [allQuotes, searchQuery, filter, sourceFilter, paymentFilter, sortBy]);

  const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage);
  const pageQuotes = filteredQuotes.slice((currentPage - 1) * quotesPerPage, currentPage * quotesPerPage);

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
    if (quote._source === 'generated') {
      try { await generateSalesQuotePDF(quote); toast.success('PDF generado'); }
      catch { toast.error('Error al generar PDF'); }
    } else {
      toast.error('PDF solo disponible para cotizaciones del cotizador');
    }
  };

  const handleEditQuote = () => {
    if (!selectedQuote) return;
    setEditMode(true);
    if (selectedQuote._source === 'generated') {
      setEditFields({
        clientName: selectedQuote.clientName || selectedQuote._clientName || '',
        clientEmail: selectedQuote.clientEmail || selectedQuote._email || '',
        clientPhone: selectedQuote.clientPhone || selectedQuote._phone || '',
      });
    } else {
      setEditFields({
        name: selectedQuote.name || selectedQuote._clientName || '',
        email: selectedQuote.email || selectedQuote._email || '',
        phone: selectedQuote.phone || selectedQuote._phone || '',
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedQuote) return;
    setSavingEdit(true);
    try {
      if (selectedQuote._source === 'generated') {
        await dispatch(updateGeneratedQuote({
          quoteId: selectedQuote._id,
          updatedData: editFields,
        })).unwrap();
        dispatch(getGeneratedQuotes());
      } else {
        await dispatch(updateQuote({
          quoteId: selectedQuote._id,
          updatedData: editFields,
        })).unwrap();
        dispatch(getAllQuotes());
      }
      toast.success('Cotización actualizada');
      setEditMode(false);
      setSelectedQuote(null);
    } catch (err) {
      toast.error(err || 'Error al guardar');
    }
    setSavingEdit(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : '-';
  const formatCurrency = (n) => `$${(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;

  const getPaymentInfo = (quote) => {
    const key = quote._paymentKey;
    if (key === 'sin-metodo') return { label: 'N/A', color: '#9ca3af', icon: <FaCreditCard />, border: '#d1d5db' };
    return paymentConfig[key] || paymentConfig['tarjeta'];
  };

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
          <input type="text" placeholder="Buscar por cliente, título, email o ID..." value={searchQuery}
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
      </div>

      {/* Filter Row */}
      <div className="mq-filter-row">
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

      {/* Content */}
      {loading ? (
        <div className="mq-loading"><Spinner animation="border" size="sm" /> Cargando...</div>
      ) : pageQuotes.length === 0 ? (
        <div className="mq-empty">No hay cotizaciones{filter !== 'all' ? ` con estado "${statusConfig[filter]?.label}"` : ''}</div>
      ) : (
        <>
          <div className="mq-grid">
            {pageQuotes.map(quote => {
              const sc = statusConfig[quote.status] || statusConfig.pending;
              const pm = getPaymentInfo(quote);
              return (
                <div key={`${quote._source}-${quote._id}`} className="mq-card"
                  style={{ borderLeftColor: pm.border || '#e5e7eb' }}>
                  {/* Card Header */}
                  <div className="mq-card-head">
                    <div className="mq-card-client">
                      <FaUser className="mq-card-client-icon" />
                      <span className="mq-card-name">{quote._clientName}</span>
                      <span className={`mq-source-tag mq-source-${quote._source}`}>
                        {quote._source === 'generated' ? <FaCalculator /> : <FaGlobe />}
                        {quote._sourceLabel}
                      </span>
                      {quote._createdBy && (
                        <span className="mq-sofia-badge">{quote._createdBy}</span>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
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
                  </div>

                  {/* Card Body */}
                  <div className="mq-card-body" onClick={() => setSelectedQuote(quote)}>
                    <div className="mq-card-title">{quote._title}</div>
                    <div className="mq-card-meta">
                      {quote._service && <span className="mq-card-tag"><FaFileAlt /> {quote._service}</span>}
                      {quote._level && <span className="mq-card-tag"><FaGraduationCap /> {quote._level}</span>}
                      {quote._pages && <span className="mq-card-tag">{quote._pages} págs</span>}
                    </div>
                    {/* Extra info rows */}
                    <div className="mq-card-info">
                      {quote._career && <div className="mq-card-info-row"><span className="mq-card-info-label">Carrera</span><span>{quote._career}</span></div>}
                      {quote._area && <div className="mq-card-info-row"><span className="mq-card-info-label">Área</span><span>{quote._area}</span></div>}
                      {quote._email && <div className="mq-card-info-row"><span className="mq-card-info-label">Email</span><span>{quote._email}</span></div>}
                      {quote._phone && <div className="mq-card-info-row"><span className="mq-card-info-label">Tel</span><span>{quote._phone}</span></div>}
                      {quote._deliveryTime && <div className="mq-card-info-row"><span className="mq-card-info-label">Plazo</span><span>{quote._deliveryTime}</span></div>}
                      {quote._paymentScheme && <div className="mq-card-info-row"><span className="mq-card-info-label">Esquema</span><span>{quote._paymentScheme}</span></div>}
                      {quote.publicId && <div className="mq-card-info-row"><span className="mq-card-info-label">ID</span><span className="mq-card-id">{quote.publicId.slice(0, 8)}...</span></div>}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mq-card-foot">
                    <div className="mq-card-pricing">
                      <span className="mq-card-price">{formatCurrency(quote._price)}</span>
                      {quote._discount > 0 && <span className="mq-card-disc">-{formatCurrency(quote._discount)}</span>}
                      {quote._surcharge > 0 && <span className="mq-card-surch">+{formatCurrency(quote._surcharge)}</span>}
                    </div>
                    <div className="mq-card-foot-right">
                      <span className="mq-card-payment" style={{ color: pm.color }}>{pm.icon} {pm.label}</span>
                      <span className="mq-card-date"><FaCalendarAlt /> {quote._dueDate || formatDate(quote.createdAt)}</span>
                      {quote.createdAt && quote._dueDate && <span className="mq-card-date-sub">Creada: {formatDate(quote.createdAt)}</span>}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mq-card-actions">
                    <button className="mq-act mq-act-view" onClick={() => setSelectedQuote(quote)} title="Ver detalle"><FaEye /></button>
                    {quote._source === 'generated' && (
                      <button className="mq-act mq-act-pdf" onClick={() => handleDownload(quote)} title="Descargar PDF"><FaFilePdf /></button>
                    )}
                    <button className="mq-act mq-act-del" onClick={() => handleDelete(quote)} title="Eliminar"><FaTrash /></button>
                  </div>
                </div>
              );
            })}
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

      {/* Detail Modal */}
      {selectedQuote && (
        <div className="mq-modal-overlay" onClick={() => setSelectedQuote(null)}>
          <div className="mq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mq-modal-header">
              <h3>
                Cotización #{selectedQuote._id?.slice(-6)}
                <span className={`mq-source-tag mq-source-${selectedQuote._source}`} style={{ marginLeft: 8 }}>
                  {selectedQuote._source === 'generated' ? <FaCalculator /> : <FaGlobe />}
                  {selectedQuote._sourceLabel}
                </span>
              </h3>
              <div className="mq-modal-right">
                <span className="mq-status-badge" style={{ background: statusConfig[selectedQuote.status]?.bg, color: statusConfig[selectedQuote.status]?.color, borderColor: `${statusConfig[selectedQuote.status]?.color}40` }}>
                  {statusConfig[selectedQuote.status]?.icon} {statusConfig[selectedQuote.status]?.label}
                </span>
                <button className="mq-close" onClick={() => setSelectedQuote(null)}>&times;</button>
              </div>
            </div>
            <div className="mq-modal-body">
              <div className="mq-modal-cols">
                <div className="mq-modal-col">
                  <h4>Proyecto</h4>
                  <div className="mq-details">
                    {editMode ? (
                      <>
                        <div className="mq-detail-row mq-edit-row">
                          <span className="mq-dlabel">Cliente</span>
                          <input className="mq-edit-input" value={editFields[selectedQuote._source === 'generated' ? 'clientName' : 'name'] || ''}
                            onChange={(e) => setEditFields({ ...editFields, [selectedQuote._source === 'generated' ? 'clientName' : 'name']: e.target.value })} />
                        </div>
                        <div className="mq-detail-row mq-edit-row">
                          <span className="mq-dlabel">Email</span>
                          <input className="mq-edit-input" type="email" value={editFields[selectedQuote._source === 'generated' ? 'clientEmail' : 'email'] || ''}
                            onChange={(e) => setEditFields({ ...editFields, [selectedQuote._source === 'generated' ? 'clientEmail' : 'email']: e.target.value })}
                            placeholder="correo@ejemplo.com" />
                        </div>
                        <div className="mq-detail-row mq-edit-row">
                          <span className="mq-dlabel"><FaPhone /> Teléfono</span>
                          <input className="mq-edit-input" type="tel" value={editFields[selectedQuote._source === 'generated' ? 'clientPhone' : 'phone'] || ''}
                            onChange={(e) => setEditFields({ ...editFields, [selectedQuote._source === 'generated' ? 'clientPhone' : 'phone']: e.target.value })}
                            placeholder="55 1234 5678" />
                        </div>
                      </>
                    ) : (
                      <>
                        {[
                          ['Cliente', selectedQuote._clientName],
                          ['Email', selectedQuote._email],
                          ['Teléfono', selectedQuote._phone],
                          ['Tipo', selectedQuote._taskType],
                          ['Servicio', selectedQuote._service],
                          ['Título', selectedQuote._title],
                          ['Área', selectedQuote._area],
                          ['Carrera', selectedQuote._career],
                          ['Nivel', selectedQuote._level],
                          ['Páginas', selectedQuote._pages],
                          ['Plazo', selectedQuote._deliveryTime],
                          ['Entrega', selectedQuote._dueDate],
                        ].filter(([, val]) => val).map(([label, val]) => (
                          <div key={label} className="mq-detail-row"><span className="mq-dlabel">{label}</span><span>{val}</span></div>
                        ))}
                      </>
                    )}
                    {selectedQuote.publicId && !editMode && (
                      <div className="mq-detail-row"><span className="mq-dlabel">Public ID</span><span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{selectedQuote.publicId}</span></div>
                    )}
                  </div>
                  {selectedQuote._description && !editMode && <p className="mq-desc">{selectedQuote._description}</p>}
                </div>
                <div className="mq-modal-col">
                  <h4>Financiero</h4>
                  <div className="mq-finance">
                    <div className="mq-frow"><span>Precio base</span><span>{formatCurrency(selectedQuote._basePrice)}</span></div>
                    {selectedQuote._discount > 0 && <div className="mq-frow mq-fdisc"><span>Descuento</span><span>-{formatCurrency(selectedQuote._discount)}</span></div>}
                    {selectedQuote._surcharge > 0 && <div className="mq-frow mq-fsurch"><span>Recargo{selectedQuote._surchargePercent ? ` (${selectedQuote._surchargePercent}%)` : ''}</span><span>+{formatCurrency(selectedQuote._surcharge)}</span></div>}
                    <div className="mq-ftotal"><span>Total</span><span>{formatCurrency(selectedQuote._price)}</span></div>
                  </div>
                  <div className="mq-details" style={{ marginTop: 16 }}>
                    {selectedQuote._paymentMethod && (
                      <div className="mq-detail-row">
                        <span className="mq-dlabel">Método</span>
                        <span className="mq-payment-tag" style={{ color: getPaymentInfo(selectedQuote).color }}>{getPaymentInfo(selectedQuote).icon} {getPaymentInfo(selectedQuote).label}</span>
                      </div>
                    )}
                    {selectedQuote._paymentScheme && <div className="mq-detail-row"><span className="mq-dlabel">Esquema</span><span className="mq-scheme">{selectedQuote._paymentScheme}</span></div>}
                    <div className="mq-detail-row"><span className="mq-dlabel">Creada</span><span>{formatDate(selectedQuote.createdAt)}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mq-modal-footer">
              <button className="mq-btn mq-btn-ghost" onClick={() => { setSelectedQuote(null); setEditMode(false); }}>Cerrar</button>
              {editMode ? (
                <>
                  <button className="mq-btn mq-btn-ghost" onClick={() => setEditMode(false)}>Cancelar</button>
                  <button className="mq-btn mq-btn-success" onClick={handleSaveEdit} disabled={savingEdit}>
                    <FaSave /> {savingEdit ? 'Guardando...' : 'Guardar'}
                  </button>
                </>
              ) : (
                <>
                  <button className="mq-btn mq-btn-outline" onClick={handleEditQuote}><FaEdit /> Editar</button>
                  {selectedQuote._source === 'generated' && (
                    <button className="mq-btn mq-btn-outline" onClick={() => handleDownload(selectedQuote)}><FaFilePdf /> PDF</button>
                  )}
                  {selectedQuote.status === 'pending' && (
                    <>
                      <button className="mq-btn mq-btn-success" onClick={() => { handleStatus(selectedQuote, 'approved'); setSelectedQuote(null); }}><FaCheck /> Aprobar</button>
                      <button className="mq-btn mq-btn-danger" onClick={() => { handleStatus(selectedQuote, 'rejected'); setSelectedQuote(null); }}><FaTimes /> Rechazar</button>
                    </>
                  )}
                  <button className="mq-btn mq-btn-del" onClick={() => { handleDelete(selectedQuote); setSelectedQuote(null); }}><FaTrash /></button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuotes;
