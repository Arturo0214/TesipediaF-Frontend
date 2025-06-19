import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, Pagination } from 'react-bootstrap';
import { FaEye, FaCheck, FaTimes, FaSearch, FaFilter, FaExclamationCircle, FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaFileAlt, FaTasks, FaDollarSign, FaTrash } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { getAllQuotes, updateQuote, deleteQuote, resetQuoteState } from '../../../features/quotes/quoteSlice';
import { toast } from 'react-hot-toast';
import './ManageQuotes.css';

const ManageQuotes = () => {
  const dispatch = useDispatch();
  const { quotes, loading, error } = useSelector((state) => state.quotes);
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

  // Cargar cotizaciones al montar el componente
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      dispatch(getAllQuotes());
    }
  }, [dispatch, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetQuoteState());
    }
  }, [error]);

  // Filtrar cotizaciones según el filtro seleccionado
  const filteredQuotes = useMemo(() => {
    if (!quotes || !Array.isArray(quotes)) return [];
    let filtered = [...quotes];
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quote =>
        (quote.name || '').toLowerCase().includes(query) ||
        (quote.taskTitle || '').toLowerCase().includes(query) ||
        (quote._id || '').toLowerCase().includes(query)
      );
    }
    // Filtrar por estado
    if (filter !== 'all') {
      filtered = filtered.filter(quote => String(quote.status) === String(filter));
    }
    // Ordenar por precio si corresponde
    if (priceOrder === 'asc') {
      filtered.sort((a, b) => (Number(a.estimatedPrice) || 0) - (Number(b.estimatedPrice) || 0));
    } else if (priceOrder === 'desc') {
      filtered.sort((a, b) => (Number(b.estimatedPrice) || 0) - (Number(a.estimatedPrice) || 0));
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
  }, [quotes, searchQuery, filter, priceOrder, orderRecentFirst]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!quotes || !Array.isArray(quotes)) return {
      totalQuotes: 0,
      pendingQuotes: 0,
      approvedQuotes: 0,
      rejectedQuotes: 0
    };

    const pendingQuotes = quotes.filter(quote => String(quote.status).trim().toLowerCase() === 'pending').length;
    const approvedQuotes = quotes.filter(quote => String(quote.status).trim().toLowerCase() === 'approved').length;
    const rejectedQuotes = quotes.filter(quote => String(quote.status).trim().toLowerCase() === 'rejected').length;

    return {
      totalQuotes: quotes.length,
      pendingQuotes,
      approvedQuotes,
      rejectedQuotes
    };
  }, [quotes]);

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
      await dispatch(updateQuote({
        quoteId,
        updatedData: { status: 'approved' },
        adminAction: true
      })).unwrap();
      toast.success('Cotización aprobada correctamente');
    } catch (error) {
      toast.error(error || 'Error al aprobar la cotización');
    }
  };

  // Manejar rechazo de cotización
  const handleRejectQuote = async (quoteId) => {
    try {
      await dispatch(updateQuote({
        quoteId,
        updatedData: { status: 'rejected' },
        adminAction: true
      })).unwrap();
      toast.success('Cotización rechazada correctamente');
    } catch (error) {
      toast.error(error || 'Error al rechazar la cotización');
    }
  };

  // Manejar actualización de estado de cotización
  const handleUpdateQuoteStatus = async (quoteId, newStatus) => {
    const quote = quotes.find(q => String(q._id) === String(quoteId));
    if (newStatus === 'paid') {
      if (!quote.priceDetails || !quote.priceDetails.basePrice || !quote.priceDetails.finalPrice) {
        toast.error('No se puede marcar como pagada: falta información de precio.');
        dispatch(resetQuoteState());
        return;
      }
      if (new Date(quote.dueDate) < new Date()) {
        toast.error('No se puede marcar como pagada: la fecha de entrega debe ser futura.');
        dispatch(resetQuoteState());
        return;
      }
    }
    setUpdatingStatusId(String(quoteId));
    try {
      await dispatch(updateQuote({
        quoteId,
        updatedData: { status: newStatus },
        adminAction: true
      })).unwrap();
      toast.success(`Estado actualizado a ${newStatus}`);
      setStatusSuccessId(String(quoteId));
      setTimeout(() => setStatusSuccessId(null), 1500);
      // Refresca la lista de cotizaciones tras actualizar
      await dispatch(getAllQuotes());
    } catch (error) {
      toast.error(error || 'Error al actualizar el estado');
      dispatch(resetQuoteState());
    }
    setUpdatingStatusId(null);
  };

  // Manejar eliminación de cotización
  const handleDeleteQuote = async (quoteId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cotización?')) {
      try {
        await dispatch(deleteQuote(quoteId)).unwrap();
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

  // Renderizar tarjetas de cotizaciones
  const renderQuoteCards = () => (
    <>
      <Row className="g-4">
        {paginatedQuotes.map((quote) => (
          <Col key={quote._id} md={6} lg={4}>
            <Card className="h-100 quote-card position-relative">
              <Card.Header className="d-flex justify-content-between align-items-center">
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
                    style={{ minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {String(updatingStatusId) === String(quote._id) ? (
                      <ImSpinner2 className="spin" style={{ fontSize: 18 }} />
                    ) : String(statusSuccessId) === String(quote._id) ? (
                      <FaCheck style={{ color: 'white', fontSize: 18 }} />
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
                <small className="text-muted">#{quote._id.slice(-6)}</small>
              </Card.Header>
              <Card.Body>
                <Card.Title className="mb-3">{quote.taskTitle}</Card.Title>
                <div className="quote-info">
                  <p><FaUser className="me-2" /> {quote.name}</p>
                  <p><FaEnvelope className="me-2" /> {quote.email}</p>
                  <p><FaPhone className="me-2" /> {quote.phone}</p>
                  <p><FaFileAlt className="me-2" /> {quote.taskType}</p>
                  <p><FaCalendarAlt className="me-2" /> {formatDate(quote.createdAt)}</p>
                </div>
                <div className="quote-price mt-3">
                  <h4>${quote.estimatedPrice?.toLocaleString() || '0'}</h4>
                </div>
                {/* Botón de eliminar en la esquina inferior derecha */}
                <button
                  className="delete-quote-btn"
                  title="Eliminar cotización"
                  onClick={() => handleDeleteQuote(quote._id)}
                >
                  <FaTrash />
                </button>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between">
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleQuoteSelect(quote)}
                >
                  <FaEye className="me-1" /> Ver
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
      {renderPagination()}
    </>
  );

  // Renderizar detalles de la cotización
  const renderQuoteDetails = () => {
    if (!selectedQuote) return null;

    return (
      <div className="quote-details-modal">
        <div className="quote-details-content">
          <h3>Detalles de la Cotización #{selectedQuote._id.slice(-6)}</h3>
          <div className="quote-details-info">
            <p><strong>Cliente:</strong> {selectedQuote.name}</p>
            <p><strong>Email:</strong> {selectedQuote.email}</p>
            <p><strong>Teléfono:</strong> {selectedQuote.phone}</p>
            <p><strong>Tipo de Tesis:</strong> {selectedQuote.taskType}</p>
            <p><strong>Nivel Académico:</strong> {selectedQuote.educationLevel}</p>
            <p><strong>Tema:</strong> {selectedQuote.taskTitle}</p>
            <p><strong>Área de Estudio:</strong> {selectedQuote.studyArea}</p>
            <p><strong>Carrera:</strong> {selectedQuote.career}</p>
            <p><strong>Páginas:</strong> {selectedQuote.pages}</p>
            <p><strong>Fecha de Entrega:</strong> {formatDate(selectedQuote.dueDate)}</p>
            <p><strong>Descripción:</strong> {selectedQuote.requirements?.text}</p>
            <p><strong>Precio Estimado:</strong> ${selectedQuote.estimatedPrice?.toLocaleString() || '0'}</p>
            <p><strong>Estado:</strong> {
              selectedQuote.status === 'pending' ? 'Pendiente' :
                selectedQuote.status === 'approved' ? 'Aprobada' : 'Rechazada'
            }</p>
            <p><strong>Fecha de Creación:</strong> {formatDate(selectedQuote.createdAt)}</p>
          </div>
          <div className="quote-details-actions">
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
      <h3 className="main-title mb-3">Gestión de Cotizaciones</h3>
      {/* Estadísticas en fila horizontal compacta */}
      <div className="stats-horizontal-section">
        <div className="stats-block total">
          <div className="stats-block-content">
            <span className="stats-block-title">Total</span>
            <span className="stats-block-number">{quotes.length}</span>
          </div>
        </div>
        <div className="stats-block pending">
          <div className="stats-block-content">
            <span className="stats-block-title">Pendientes</span>
            <span className="stats-block-number">{quotes.filter(q => String(q.status).trim().toLowerCase() === 'pending').length}</span>
          </div>
        </div>
        <div className="stats-block approved">
          <div className="stats-block-content">
            <span className="stats-block-title">Aprobadas</span>
            <span className="stats-block-number">{quotes.filter(q => String(q.status).trim().toLowerCase() === 'approved').length}</span>
          </div>
        </div>
        <div className="stats-block rejected">
          <div className="stats-block-content">
            <span className="stats-block-title">Rechazadas</span>
            <span className="stats-block-number">{quotes.filter(q => String(q.status).trim().toLowerCase() === 'rejected').length}</span>
          </div>
        </div>
        <div className="stats-block paid">
          <div className="stats-block-content">
            <span className="stats-block-title">Pagadas</span>
            <span className="stats-block-number">{quotes.filter(q => String(q.status).trim().toLowerCase() === 'paid').length}</span>
          </div>
        </div>
        <div className="stats-block cancelled">
          <div className="stats-block-content">
            <span className="stats-block-title">Canceladas</span>
            <span className="stats-block-number">{quotes.filter(q => String(q.status).trim().toLowerCase() === 'cancelled').length}</span>
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
