import { useState } from 'react';
import { Container, Table, Badge, Button, Modal } from 'react-bootstrap';
import { FaEye, FaTrash } from 'react-icons/fa';

function MyQuotes() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const quotes = [
    {
      id: '1',
      title: 'Tesis de Maestría en Administración',
      type: 'Tesis',
      status: 'pendiente',
      date: '2024-01-20',
      price: 6000,
      description: 'Investigación sobre el impacto de la transformación digital en PyMEs',
      pages: 120,
      deadline: '3 meses'
    },
    // Más cotizaciones...
  ];

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

  return (
    <Container className="py-5">
      <h1 className="mb-4">Mis Cotizaciones</h1>

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
            <tr key={quote.id}>
              <td>#{quote.id}</td>
              <td>{quote.title}</td>
              <td>{quote.type}</td>
              <td>
                <Badge bg={getStatusBadge(quote.status)}>
                  {quote.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </td>
              <td>{new Date(quote.date).toLocaleDateString()}</td>
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
                >
                  <FaTrash /> Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

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
            <Button variant="success" className="me-2">
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
