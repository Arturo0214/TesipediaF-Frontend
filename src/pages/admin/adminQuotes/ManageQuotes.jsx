import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, Pagination } from 'react-bootstrap';
import { FaEye, FaCheck, FaTimes, FaSearch, FaFilter, FaExclamationCircle, FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaFileAlt, FaTasks, FaDollarSign, FaTrash, FaMoneyBillWave, FaCreditCard, FaFilePdf } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { getGeneratedQuotes, updateGeneratedQuote, deleteGeneratedQuote, resetQuoteState } from '../../../features/quotes/quoteSlice';
import { toast } from 'react-hot-toast';
import { generateSalesQuotePDF } from '../../../utils/generateSalesQuotePDF';
import './ManageQuotes.css';

const ManageQuotes = () => {
  const dispatch = useDispatch();
  const { generatedQuotes, loading, error } = useSelector((state) => state.quotes);
  const { isAuthenticated, isAdmin } = useSelector((state) => state.auth);

  // Estado para la interfaz
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [priceOrder, setPriceOrder] = useState('none'); // 'none', 'asc', 'desc'
  const [orderRecentFirst, setOrderRecentFirst] = useState(true); // true = más recientes primero
  const [currentPage, setCurrentPage] = useState(1);
  const quotesPerPage = 9;
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [statusSuccessId, setStatusSuccessId] = useState(null);

  // Verificar si el usuario actual tiene permisos de administrador
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Necesitas iniciar sesión para acceder a esta página.");
    } else if (!isAdmin) {
      toast.error("No tienes permisos para acceder a esta página. Se requieren permisos de administrador.");
    }
  }, [isAuthenticated, isAdmin]);

  // Cargar cotizaciones GENERADAS al montar
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      dispatch(getGeneratedQuotes());
    }
  }, [dispatch, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetQuoteState());
    }
  }, [error]);

  // Filtrar cotizaciones GENERADAS
  const filteredQuotes = useMemo(() => {
    if (!generatedQuotes || !Array.isArray(generatedQuotes)) return [];
    let filtered = [...generatedQuotes];
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quote =>
        (quote.clientName || '').toLowerCase().includes(query) ||
        (quote.tituloTrabajo || '').toLowerCase().includes(query) ||
        (quote.tipoTrabajo || '').toLowerCase().includes(query) ||
        (quote._id || '').toLowerCase().includes(query)
      );
    }
    // Filtrar por estado
    if (filter !== 'all') {
      filtered = filtered.filter(quote => String(quote.status) === String(filter));
    }
    // Ordenar por precio si corresponde
    if (priceOrder === 'asc') {
      filtered.sort((a, b) => (Number(a.precioConDescuento) || 0) - (Number(b.precioConDescuento) || 0));
    } else if (priceOrder === 'desc') {
      filtered.sort((a, b) => (Number(b.precioConDescuento) || 0) - (Number(a.precioConDescuento) || 0));
    } else {
      // Ordenar por fecha
      filtered.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        const diff = new Date(b.createdAt) - new Date(a.createdAt);
        return orderRecentFirst ? diff : -diff;
      });
    }
    return filtered;
  }, [generatedQuotes, searchQuery, filter, priceOrder, orderRecentFirst]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!generatedQuotes || !Array.isArray(generatedQuotes)) return {
      totalQuotes: 0,
      pendingQuotes: 0,
      approvedQuotes: 0,
      rejectedQuotes: 0
    };

    const pendingQuotes = generatedQuotes.filter(quote => String(quote.status).trim().toLowerCase() === 'pending').length;
    const approvedQuotes = generatedQuotes.filter(quote => String(quote.status).trim().toLowerCase() === 'approved').length;
    const rejectedQuotes = generatedQuotes.filter(quote => String(quote.status).trim().toLowerCase() === 'rejected').length;

    return {
      totalQuotes: generatedQuotes.length,
      pendingQuotes,
      approvedQuotes,
      rejectedQuotes
    };
  }, [generatedQuotes]);

  // Paginación
  const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage);
  const paginatedQuotes = filteredQuotes.slice((currentPage - 1) * quotesPerPage, currentPage * quotesPerPage);

  // Manejar selección de cotización
  const handleQuoteSelect = (quote) => {
    setSelectedQuote(quote);
    setShowQuoteDetails(true);
  };

  // Manejar aprobación de cotización
  const handleApproveQuote = async (quoteId) => {
    try {
      await dispatch(updateGeneratedQuote({
        quoteId,
        updatedData: { status: 'approved' }
      })).unwrap();
      toast.success('Cotización aprobada correctamente');
      dispatch(getGeneratedQuotes());
    } catch (error) {
      toast.error(error || 'Error al aprobar la cotización');
    }
  };

  // Manejar rechazo de cotización
  const handleRejectQuote = async (quoteId) => {
    try {
      await dispatch(updateGeneratedQuote({
        quoteId,
        updatedData: { status: 'rejected' }
      })).unwrap();
      toast.success('Cotización rechazada correctamente');
      dispatch(getGeneratedQuotes());
    } catch (error) {
      toast.error(error || 'Error al rechazar la cotización');
    }
  };

  // Manejar actualización de estado de cotización (GENERADA)
  const handleUpdateQuoteStatus = async (quoteId, newStatus) => {
    setUpdatingStatusId(String(quoteId));
    try {
      await dispatch(updateGeneratedQuote({
        quoteId,
        updatedData: { status: newStatus }
      })).unwrap();
      toast.success(`Estado actualizado a ${newStatus}`);
      setStatusSuccessId(String(quoteId));
      setTimeout(() => setStatusSuccessId(null), 1500);
      // Refresca la lista
      dispatch(getGeneratedQuotes());
    } catch (error) {
      toast.error(error || 'Error al actualizar el estado');
    }
    setUpdatingStatusId(null);
  };

  /* Delete functionality */
  const handleDeleteQuote = async (quoteId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cotización?')) {
      try {
        await dispatch(deleteGeneratedQuote(quoteId)).unwrap();
        toast.success('Cotización eliminada correctamente');
      } catch (error) {
        toast.error(error || 'Error al eliminar la cotización');
      }
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lógica de paginación tipo Visits
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let items = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
            {i}
          </Pagination.Item>
        );
      }
    } else {
      // Siempre mostrar 1, 2, 3, ..., última
      for (let i = 1; i <= 3; i++) {
        items.push(
          <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
            {i}
          </Pagination.Item>
        );
      }
      if (currentPage > 4 && currentPage < totalPages - 2) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(
            <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
              {i}
            </Pagination.Item>
          );
        }
        items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      } else if (currentPage >= totalPages - 2) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        for (let i = totalPages - 3; i < totalPages; i++) {
          if (i > 3) {
            items.push(
              <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
                {i}
              </Pagination.Item>
            );
          }
        }
      } else if (currentPage > 3) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
      }
      items.push(
        <Pagination.Item key={totalPages} active={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }
    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>{items}</Pagination>
      </div>
    );
  };

  // Renderizar filtros y búsqueda
  const renderFiltersSection = () => (
    <>
      {/* Primera fila: solo búsqueda */}
      <Row className="mb-2">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Buscar</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="Buscar por cliente, servicio o ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline-secondary" className="ms-2">
                <FaSearch />
              </Button>
            </div>
          </Form.Group>
        </Col>
      </Row>
      {/* Segunda fila: estado, precio, fecha */}
      <Row className="mb-4 align-items-end">
        <Col md={4} sm={12} className="mb-2 mb-md-0">
          <Form.Group>
            <Form.Label>Estado</Form.Label>
            <Form.Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="paid">Pagadas</option>
              <option value="cancelled">Canceladas</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} sm={12} className="mb-2 mb-md-0">
          <Form.Group>
            <Form.Label>Ordenar por precio</Form.Label>
            <Form.Select
              value={priceOrder}
              onChange={(e) => setPriceOrder(e.target.value)}
            >
              <option value="none">Sin orden</option>
              <option value="asc">Más bajo a más alto</option>
              <option value="desc">Más alto a más bajo</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} sm={12} className="d-flex flex-column flex-md-row align-items-center gap-2">
          <Form.Label className="mb-0 me-2">Ordenar por fecha</Form.Label>
          <Form.Check
            type="switch"
            id="order-switch"
            label={orderRecentFirst ? 'Más recientes' : 'Más antiguos'}
            checked={orderRecentFirst}
            onChange={() => setOrderRecentFirst(!orderRecentFirst)}
            disabled={priceOrder !== 'none'}
          />
        </Col>
      </Row>
    </>
  );

  // Helper to determine payment style
  const getPaymentStyle = (quote) => {
    const metodo = quote.metodoPago;

    if (metodo === 'tarjeta-nu') {
      return { bg: 'custom-nu', text: 'Tarjeta Nu', style: { backgroundColor: '#820ad1', color: 'white' }, headerStyle: { backgroundColor: '#820ad1', color: 'white' } };
    }
    if (metodo === 'tarjeta-bbva') {
      return { bg: 'primary', text: 'Tarjeta BBVA', style: {}, headerStyle: { backgroundColor: '#0d6efd', color: 'white' } };
    }
    if (metodo === 'efectivo') {
      return { bg: 'success', text: 'Efectivo (Desc. 10%)', style: {}, headerStyle: { backgroundColor: '#198754', color: 'white' } };
    }

    // Fallbacks para datos antiguos
    if (metodo === 'tarjeta') return { bg: 'dark', text: 'Stripe/PayPal', style: {}, headerStyle: { backgroundColor: '#343a40', color: 'white' } };

    // Inferencia por descuento si no hay metodo específico
    if (!quote.descuentoMonto || quote.descuentoMonto === 0) {
      // Sin descuento -> Probablemente tarjeta antigua o Nu implícito
      return { bg: 'custom-nu', text: 'Tarjeta Nu', style: { backgroundColor: '#820ad1', color: 'white' }, headerStyle: { backgroundColor: '#820ad1', color: 'white' } };
    }
    // Con descuento -> Efectivo
    return { bg: 'success', text: 'Efectivo (Desc. 10%)', style: {}, headerStyle: { backgroundColor: '#198754', color: 'white' } };
  };

  const handleDownloadQuote = async (quote) => {
    try {
      await generateSalesQuotePDF(quote);
      toast.success('PDF descargado nuevamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el PDF');
    }
  };

  // Renderizar tarjetas de cotizaciones
  const renderQuoteCards = () => (
    <>
      <Row className="g-4">
        {paginatedQuotes.map((quote) => {
          const paymentStyle = getPaymentStyle(quote);
          return (
            <Col key={quote._id} md={6} lg={4}>
              <Card className="h-100 quote-card position-relative">
                <Card.Header className="d-flex justify-content-between align-items-center" style={paymentStyle.headerStyle}>
                  <div className="d-flex align-items-center gap-2">
                    {/* Payment Method Badge in Header */}
                    <Badge
                      bg={paymentStyle.bg === 'custom-nu' ? null : paymentStyle.bg}
                      style={paymentStyle.style}
                      title="Método de Pago Sugerido"
                      className="payment-badge border border-white"
                    >
                      {paymentStyle.text}
                    </Badge>
                  </div>

                  <div className="dropdown">
                    <Badge
                      bg={
                        quote.status === 'pending' ? 'warning' :
                          quote.status === 'approved' ? 'success' :
                            quote.status === 'rejected' ? 'danger' :
                              quote.status === 'paid' ? 'info' :
                                quote.status === 'cancelled' ? 'secondary' : 'primary'
                      }
                      className="status-badge"
                      onClick={(e) => {
                        e.stopPropagation();
                        const dropdown = e.target.nextElementSibling;
                        dropdown.classList.toggle('show');
                      }}
                      style={{ minWidth: 80, cursor: 'pointer' }}
                    >
                      {String(updatingStatusId) === String(quote._id) ? (
                        <ImSpinner2 className="spin" />
                      ) : String(statusSuccessId) === String(quote._id) ? (
                        <FaCheck />
                      ) : (
                        quote.status === 'pending' ? 'Pendiente' :
                          quote.status === 'approved' ? 'Aprobada' :
                            quote.status === 'rejected' ? 'Rechazada' :
                              quote.status === 'paid' ? 'Pagada' :
                                quote.status === 'cancelled' ? 'Cancelada' : quote.status
                      )}
                    </Badge>
                    <div className="dropdown-menu">
                      <button className="dropdown-item" onClick={() => handleApproveQuote(quote._id)}>Aprobar</button>
                      <button className="dropdown-item" onClick={() => handleRejectQuote(quote._id)}>Rechazar</button>
                      <button className="dropdown-item" onClick={() => handleUpdateQuoteStatus(quote._id, 'paid')}>Marcar como Pagada</button>
                      <button className="dropdown-item" onClick={() => handleUpdateQuoteStatus(quote._id, 'cancelled')}>Cancelar</button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Card.Title className="mb-3 h6 text-primary">{quote.tituloTrabajo || quote.tipoTrabajo}</Card.Title>

                  <div className="quote-details-detailed small">
                    <div className="row g-1 mb-2">
                      <div className="col-12"><strong>Cliente:</strong> {quote.clientName}</div>
                      <div className="col-6"><strong>Trabajo:</strong> {quote.tipoTrabajo}</div>
                      <div className="col-6"><strong>Servicio:</strong> {quote.tipoServicio}</div>
                      <div className="col-6"><strong>Área:</strong> {quote.area || '-'}</div>
                      <div className="col-6"><strong>Carrera:</strong> {quote.carrera}</div>
                      <div className="col-6"><strong>Páginas:</strong> {quote.extensionEstimada}</div>
                      <div className="col-6"><strong>Plazo:</strong> {quote.tiempoEntrega}</div>
                    </div>
                    <div className="mb-2">
                      <strong>Fecha Entrega:</strong> {quote.fechaEntrega}
                    </div>
                    <div className="mb-2 text-truncate" title={quote.esquemaPago}>
                      <strong>Esquema:</strong> {quote.esquemaPago ? (quote.esquemaPago.length > 50 ? quote.esquemaPago.substring(0, 50) + '...' : quote.esquemaPago) : 'N/A'}
                    </div>
                  </div>

                  <div className="quote-financials mt-2 pt-2 border-top bg-light p-2 rounded">
                    <div className="d-flex justify-content-between small">
                      <span>Precio Base:</span>
                      <span>${quote.precioBase?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {quote.descuentoMonto > 0 && (
                      <div className="d-flex justify-content-between small text-success">
                        <span>Descuento:</span>
                        <span>-${quote.descuentoMonto?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {quote.recargoMonto > 0 && (
                      <div className="d-flex justify-content-between small text-danger">
                        <span>Recargo ({quote.recargoPorcentaje}%):</span>
                        <span>+${quote.recargoMonto?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between fw-bold mt-1 text-dark border-top border-secondary pt-1">
                      <span>Total Final:</span>
                      <span>${quote.precioConDescuento?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="w-100"
                    onClick={() => handleDownloadQuote(quote)}
                  >
                    <FaFilePdf className="me-2" /> PDF
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteQuote(quote._id)}
                    title="Eliminar"
                  >
                    <FaTrash />
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>
      {renderPagination()}
    </>
  );

  // Renderizar detalles de la cotización
  const renderQuoteDetails = () => {
    if (!selectedQuote) return null;

    return (
      <div className="quote-details-modal">
        <div className="quote-details-content modal-lg">
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
            <h3 className="m-0">Cotización #{selectedQuote._id.slice(-6)}</h3>
            <Badge
              bg={
                selectedQuote.status === 'pending' ? 'warning' :
                  selectedQuote.status === 'approved' ? 'success' :
                    selectedQuote.status === 'rejected' ? 'danger' :
                      selectedQuote.status === 'paid' ? 'info' :
                        selectedQuote.status === 'cancelled' ? 'secondary' : 'primary'
              }
              className="px-3 py-2"
            >
              {selectedQuote.status === 'pending' ? 'Pendiente' :
                selectedQuote.status === 'approved' ? 'Aprobada' :
                  selectedQuote.status === 'rejected' ? 'Rechazada' :
                    selectedQuote.status === 'paid' ? 'Pagada' :
                      selectedQuote.status === 'cancelled' ? 'Cancelada' : selectedQuote.status}
            </Badge>
          </div>

          <div className="row g-4">
            {/* Columna Izquierda: Información del Proyecto */}
            <div className="col-md-6 border-end">
              <h5 className="text-primary mb-3"><FaFileAlt className="me-2" />Detalles del Proyecto</h5>
              <div className="quote-details-list">
                <p><strong>Cliente:</strong> {selectedQuote.clientName}</p>
                <p><strong>Tipo Trabajo:</strong> {selectedQuote.tipoTrabajo}</p>
                <p><strong>Servicio:</strong> {selectedQuote.tipoServicio}</p>
                <p><strong>Título/Tema:</strong> {selectedQuote.tituloTrabajo || 'N/A'}</p>
                <p><strong>Área:</strong> {selectedQuote.area || 'N/A'}</p>
                <p><strong>Carrera:</strong> {selectedQuote.carrera}</p>
                <p><strong>Páginas:</strong> {selectedQuote.extensionEstimada}</p>
                <p><strong>Plazo:</strong> {selectedQuote.tiempoEntrega}</p>
                <p><strong>Fecha Entrega:</strong> {selectedQuote.fechaEntrega}</p>
                <p><strong>Descripción:</strong> {selectedQuote.descripcionServicio || 'Sin descripción'}</p>
              </div>
            </div>

            {/* Columna Derecha: Financiero y Pagos */}
            <div className="col-md-6">
              <h5 className="text-success mb-3"><FaMoneyBillWave className="me-2" />Información Financiera</h5>
              <div className="bg-light p-3 rounded mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Precio Base:</span>
                  <strong>${selectedQuote.precioBase?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                </div>
                {(selectedQuote.descuentoMonto > 0) && (
                  <div className="d-flex justify-content-between mb-1 text-success">
                    <span>Descuento:</span>
                    <strong>-${selectedQuote.descuentoMonto?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                  </div>
                )}
                {(selectedQuote.recargoMonto > 0) && (
                  <div className="d-flex justify-content-between mb-1 text-danger">
                    <span>Recargo ({selectedQuote.recargoPorcentaje || 0}%):</span>
                    <strong>+${selectedQuote.recargoMonto?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                  </div>
                )}
                <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                  <span className="h5 mb-0">Total Final:</span>
                  <span className="h5 mb-0 text-primary">${selectedQuote.precioConDescuento?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <h5 className="text-info mb-3"><FaCreditCard className="me-2" />Método y Esquema</h5>
              <div className="p-3 border rounded">
                <p className="mb-2">
                  <strong>Método Seleccionado:</strong>{' '}
                  {(() => {
                    const style = getPaymentStyle(selectedQuote);
                    return (
                      <Badge
                        bg={style.bg === 'custom-nu' ? null : style.bg}
                        style={style.style}
                      >
                        {style.text}
                      </Badge>
                    );
                  })()}
                </p>

                <p className="mb-1"><strong>Esquema de Pago:</strong></p>
                <div className="bg-secondary bg-opacity-10 p-2 rounded text-muted small">
                  {selectedQuote.esquemaPago || 'No especificado'}
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end align-items-center mt-4 pt-3 border-top gap-2">
            <div className="text-muted small me-auto">
              Creada: {formatDate(selectedQuote.createdAt)}
            </div>
            <div className="quote-details-actions d-flex">
              {/* Botones de acción existentes */}
              <Button variant="secondary" onClick={() => setShowQuoteDetails(false)}>
                Cerrar
              </Button>
              {selectedQuote.status === 'pending' && (
                <>
                  <Button
                    variant="success"
                    className="ms-2"
                    onClick={() => {
                      handleApproveQuote(selectedQuote._id);
                      setShowQuoteDetails(false);
                    }}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="danger"
                    className="ms-2"
                    onClick={() => {
                      handleRejectQuote(selectedQuote._id);
                      setShowQuoteDetails(false);
                    }}
                  >
                    Rechazar
                  </Button>
                </>
              )}
              <Button
                variant="outline-danger"
                className="ms-2"
                onClick={() => {
                  handleDeleteQuote(selectedQuote._id);
                  setShowQuoteDetails(false);
                }}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar mensaje de error
  const renderError = () => {
    if (!error) return null;

    return (
      <Alert variant="danger" className="mb-4">
        <Alert.Heading>
          <FaExclamationCircle className="me-2" />
          Error
        </Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  };

  // Renderizar spinner de carga
  const renderLoading = () => {
    if (!loading) return null;

    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary" />
        <p className="mt-2">Cargando cotizaciones...</p>
      </div>
    );
  };

  return (
    <div className="manage-quotes-container">
      <div className="stats-horizontal-section">
        <div className="stats-block total">
          <div className="stats-block-content">
            <span className="stats-block-title">Total Generadas (Admin)</span>
            <span className="stats-block-number">{generatedQuotes?.length || 0}</span>
          </div>
        </div>
        <div className="stats-block pending">
          <div className="stats-block-content">
            <span className="stats-block-title">Pendientes</span>
            <span className="stats-block-number">{generatedQuotes?.filter(q => String(q.status).trim().toLowerCase() === 'pending').length || 0}</span>
          </div>
        </div>
        <div className="stats-block approved">
          <div className="stats-block-content">
            <span className="stats-block-title">Aprobadas</span>
            <span className="stats-block-number">{generatedQuotes?.filter(q => String(q.status).trim().toLowerCase() === 'approved').length || 0}</span>
          </div>
        </div>
        <div className="stats-block rejected">
          <div className="stats-block-content">
            <span className="stats-block-title">Rechazadas</span>
            <span className="stats-block-number">{generatedQuotes?.filter(q => String(q.status).trim().toLowerCase() === 'rejected').length || 0}</span>
          </div>
        </div>
        <div className="stats-block paid">
          <div className="stats-block-content">
            <span className="stats-block-title">Pagadas</span>
            <span className="stats-block-number">{generatedQuotes?.filter(q => String(q.status).trim().toLowerCase() === 'paid').length || 0}</span>
          </div>
        </div>
        <div className="stats-block cancelled">
          <div className="stats-block-content">
            <span className="stats-block-title">Canceladas</span>
            <span className="stats-block-number">{generatedQuotes?.filter(q => String(q.status).trim().toLowerCase() === 'cancelled').length || 0}</span>
          </div>
        </div>
      </div>

      {renderError()}

      {loading ? (
        renderLoading()
      ) : (
        <>
          {renderFiltersSection()}
          {renderQuoteCards()}
        </>
      )}

      {showQuoteDetails && selectedQuote && renderQuoteDetails()}
    </div>
  );
};

export default ManageQuotes;
