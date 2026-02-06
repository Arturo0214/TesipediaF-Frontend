import { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal } from 'react-bootstrap';
import { FaEye, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from '../../utils/axioswithAuth';

function MyQuotes() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await axios.get('/quotes/my-quotes');
      setQuotes(response.data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Error al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (quoteId) => {
    try {
      const response = await axios.post(`/quotes/${quoteId}/convert`, {
        quoteId
      });

      // Redirect to Stripe checkout or handle payment flow
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      const errorMessage = error.response?.data?.message || 'Error al procesar el pago';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (quoteId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cotización?')) {
      return;
    }

    try {
      await axios.delete(`/quotes/${quoteId}`);
      toast.success('Cotización eliminada exitosamente');
      fetchQuotes(); // Refresh quotes list
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Error al eliminar la cotización');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pendiente: 'warning',
      aprobada: 'success',
      rechazada: 'danger',
      en_revision: 'info'
    };
    return badges[status] || 'secondary';
  };

  const handleShowDetails = (quote) => {
    setSelectedQuote(quote);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Mis Cotizaciones</h1>

      {quotes.length === 0 ? (
        <div className="alert alert-info">
          No tienes cotizaciones actualmente.
        </div>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote._id}>
                <td>#{quote._id.slice(-6)}</td>
                <td>{quote.title}</td>
                <td>{quote.type}</td>
                <td>
                  <Badge bg={getStatusBadge(quote.status)}>
                    {quote.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </td>
                <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                <td>${quote.price}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowDetails(quote)}
                  >
                    <FaEye /> Ver
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(quote._id)}
                  >
                    <FaTrash /> Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal de Detalles */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Cotización</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuote && (
            <div>
              <h4>{selectedQuote.title}</h4>
              <p><strong>Tipo:</strong> {selectedQuote.type}</p>
              <p><strong>Descripción:</strong> {selectedQuote.description}</p>
              <p><strong>Número de Páginas:</strong> {selectedQuote.pages}</p>
              <p><strong>Tiempo de Entrega:</strong> {selectedQuote.deadline}</p>
              <p><strong>Precio:</strong> ${selectedQuote.price}</p>
              <p><strong>Estado:</strong>
                <Badge
                  bg={getStatusBadge(selectedQuote.status)}
                  className="ms-2"
                >
                  {selectedQuote.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedQuote?.status === 'pendiente' && (
            <Button
              variant="success"
              className="me-2"
              onClick={() => handlePayment(selectedQuote._id)}
            >
              Proceder al Pago
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MyQuotes;
