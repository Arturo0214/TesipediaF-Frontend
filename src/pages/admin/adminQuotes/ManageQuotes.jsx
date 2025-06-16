import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Table, Button, Badge, Spinner, Alert, Row, Col, Card, Form } from 'react-bootstrap';
import { FaEye, FaCheck, FaTimes, FaSearch, FaFilter, FaExclamationCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

// Simulación de datos para cotizaciones (en un caso real, esto vendría de una API)
const mockQuotes = [
  {
    id: '12345',
    client: 'Juan Pérez',
    service: 'Tesis de Grado',
    amount: 1500,
    status: 'pending',
    date: '2024-04-10',
    email: 'juan.perez@example.com',
    phone: '+1234567890',
    details: 'Necesito una tesis sobre economía digital para mi licenciatura.'
  },
  {
    id: '12346',
    client: 'María López',
    service: 'Trabajo de Investigación',
    amount: 800,
    status: 'approved',
    date: '2024-04-09',
    email: 'maria.lopez@example.com',
    phone: '+1234567891',
    details: 'Investigación sobre impacto ambiental de la industria textil.'
  },
  {
    id: '12347',
    client: 'Carlos Rodríguez',
    service: 'Ensayo Académico',
    amount: 300,
    status: 'rejected',
    date: '2024-04-08',
    email: 'carlos.rodriguez@example.com',
    phone: '+1234567892',
    details: 'Ensayo sobre la evolución de la inteligencia artificial.'
  },
  {
    id: '12348',
    client: 'Ana Martínez',
    service: 'Tesis Doctoral',
    amount: 2500,
    status: 'pending',
    date: '2024-04-07',
    email: 'ana.martinez@example.com',
    phone: '+1234567893',
    details: 'Tesis sobre neurociencia cognitiva y aprendizaje.'
  }
];

const ManageQuotes = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isAdmin } = useSelector((state) => state.auth);

  // Estado para la interfaz
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);

  // Verificar si el usuario actual tiene permisos de administrador
  useEffect(() => {
    if (!isAuthenticated) {
      setError("Necesitas iniciar sesión para acceder a esta página.");
    } else if (!isAdmin) {
      setError("No tienes permisos para acceder a esta página. Se requieren permisos de administrador.");
    } else {
      setError(null);
    }
  }, [isAuthenticated, isAdmin]);

  // Cargar cotizaciones al montar el componente
  const loadQuotes = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;

    try {
      setLoading(true);
      // En un caso real, aquí se haría una llamada a la API
      // await dispatch(getQuotes()).unwrap();

      // Simulación de carga de datos
      setTimeout(() => {
        setQuotes(mockQuotes);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching quotes:", err);
      setError(`Error al cargar cotizaciones: ${err.message || err || 'Error desconocido'}`);
      toast.error(`Error al cargar cotizaciones: ${err.message || 'Error desconocido'}`);
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  // Retry button for loading quotes
  const handleRetryLoadQuotes = () => {
    loadQuotes();
  };

  // Filtrar cotizaciones según el filtro seleccionado
  const filteredQuotes = useMemo(() => {
    if (!quotes || !Array.isArray(quotes)) return [];

    let filtered = [...quotes];

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(quote =>
        (quote.client || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quote.service || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quote.id || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filter !== 'all') {
      filtered = filtered.filter(quote => quote.status === filter);
    }

    // Ordenar por fecha (más recientes primero)
    return filtered.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });
  }, [quotes, searchQuery, filter]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!quotes || !Array.isArray(quotes)) return {
      totalQuotes: 0,
      pendingQuotes: 0,
      approvedQuotes: 0,
      rejectedQuotes: 0
    };

    const pendingQuotes = quotes.filter(quote => quote.status === 'pending').length;
    const approvedQuotes = quotes.filter(quote => quote.status === 'approved').length;
    const rejectedQuotes = quotes.filter(quote => quote.status === 'rejected').length;

    return {
      totalQuotes: quotes.length,
      pendingQuotes,
      approvedQuotes,
      rejectedQuotes
    };
  }, [quotes]);

  // Manejar selección de cotización
  const handleQuoteSelect = (quote) => {
    setSelectedQuote(quote);
    setShowQuoteDetails(true);
  };

  // Manejar aprobación de cotización
  const handleApproveQuote = (quoteId) => {
    // En un caso real, aquí se haría una llamada a la API
    // await dispatch(approveQuote(quoteId)).unwrap();

    // Simulación de aprobación
    setQuotes(prevQuotes =>
      prevQuotes.map(quote =>
        quote.id === quoteId ? { ...quote, status: 'approved' } : quote
      )
    );

    toast.success('Cotización aprobada correctamente');
  };

  // Manejar rechazo de cotización
  const handleRejectQuote = (quoteId) => {
    // En un caso real, aquí se haría una llamada a la API
    // await dispatch(rejectQuote(quoteId)).unwrap();

    // Simulación de rechazo
    setQuotes(prevQuotes =>
      prevQuotes.map(quote =>
        quote.id === quoteId ? { ...quote, status: 'rejected' } : quote
      )
    );

    toast.success('Cotización rechazada correctamente');
  };

  // Renderizar estadísticas
  const renderStatsSection = () => (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="text-center p-3">
          <h5>Total Cotizaciones</h5>
          <h3>{stats.totalQuotes}</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="text-center p-3 bg-warning bg-opacity-10">
          <h5>Pendientes</h5>
          <h3>{stats.pendingQuotes}</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="text-center p-3 bg-success bg-opacity-10">
          <h5>Aprobadas</h5>
          <h3>{stats.approvedQuotes}</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="text-center p-3 bg-danger bg-opacity-10">
          <h5>Rechazadas</h5>
          <h3>{stats.rejectedQuotes}</h3>
        </Card>
      </Col>
    </Row>
  );

  // Renderizar filtros y búsqueda
  const renderFiltersSection = () => (
    <Row className="mb-4">
      <Col md={6}>
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
      <Col md={6}>
        <Form.Group>
          <Form.Label>Filtrar por estado</Form.Label>
          <Form.Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
  );

  // Renderizar tabla de cotizaciones
  const renderQuotesTable = () => (
    <Table responsive striped hover>
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Servicio</th>
          <th>Monto</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {filteredQuotes.length > 0 ? (
          filteredQuotes.map((quote) => (
            <tr key={quote.id}>
              <td>#{quote.id}</td>
              <td>{quote.client}</td>
              <td>{quote.service}</td>
              <td>${quote.amount}</td>
              <td>
                {quote.status === 'pending' && <Badge bg="warning">Pendiente</Badge>}
                {quote.status === 'approved' && <Badge bg="success">Aprobada</Badge>}
                {quote.status === 'rejected' && <Badge bg="danger">Rechazada</Badge>}
              </td>
              <td>{quote.date}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleQuoteSelect(quote)}
                >
                  <FaEye />
                </Button>
                {quote.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleApproveQuote(quote.id)}
                    >
                      <FaCheck />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectQuote(quote.id)}
                    >
                      <FaTimes />
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="text-center">No se encontraron cotizaciones</td>
          </tr>
        )}
      </tbody>
    </Table>
  );

  // Renderizar detalles de la cotización
  const renderQuoteDetails = () => {
    if (!selectedQuote) return null;

    return (
      <div className="quote-details-modal">
        <div className="quote-details-content">
          <h3>Detalles de la Cotización #{selectedQuote.id}</h3>
          <div className="quote-details-info">
            <p><strong>Cliente:</strong> {selectedQuote.client}</p>
            <p><strong>Servicio:</strong> {selectedQuote.service}</p>
            <p><strong>Monto:</strong> ${selectedQuote.amount}</p>
            <p><strong>Estado:</strong> {
              selectedQuote.status === 'pending' ? 'Pendiente' :
                selectedQuote.status === 'approved' ? 'Aprobada' : 'Rechazada'
            }</p>
            <p><strong>Fecha:</strong> {selectedQuote.date}</p>
            <p><strong>Email:</strong> {selectedQuote.email}</p>
            <p><strong>Teléfono:</strong> {selectedQuote.phone}</p>
            <p><strong>Detalles:</strong> {selectedQuote.details}</p>
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
                    handleApproveQuote(selectedQuote.id);
                    setShowQuoteDetails(false);
                  }}
                >
                  Aprobar
                </Button>
                <Button
                  variant="danger"
                  className="ms-2"
                  onClick={() => {
                    handleRejectQuote(selectedQuote.id);
                    setShowQuoteDetails(false);
                  }}
                >
                  Rechazar
                </Button>
              </>
            )}
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
        <hr />
        <div className="d-flex justify-content-end">
          <Button variant="outline-danger" onClick={handleRetryLoadQuotes}>
            Reintentar
          </Button>
        </div>
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
    <Container fluid className="py-4 manage-quotes-container">
      <h2 className="mb-4 admin-section-title">Gestión de Cotizaciones</h2>

      {renderError()}

      {loading ? (
        renderLoading()
      ) : (
        <>
          {renderStatsSection()}
          {renderFiltersSection()}
          {renderQuotesTable()}
        </>
      )}

      {/* Renderizar el modal solo cuando showQuoteDetails es true */}
      {showQuoteDetails && selectedQuote && renderQuoteDetails()}
    </Container>
  );
};

export default ManageQuotes;
