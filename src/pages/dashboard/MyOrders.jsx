import { useState } from 'react';
import { Container, Table, Badge, Button, Modal } from 'react-bootstrap';
import { FaEye, FaDownload, FaComments } from 'react-icons/fa';

function MyOrders() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = [
    {
      id: '1',
      title: 'Tesis de Ingeniería',
      status: 'en_proceso',
      startDate: '2024-01-15',
      dueDate: '2024-03-15',
      progress: 60,
      writer: 'Dr. Juan Pérez',
      price: 5000
    },
    // Más órdenes...
  ];

  const getStatusBadge = (status) => {
    const badges = {
      pendiente: 'warning',
      en_proceso: 'primary',
      revision: 'info',
      completado: 'success',
      cancelado: 'danger'
    };
    return badges[status] || 'secondary';
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Mis Pedidos</h1>

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Fecha Entrega</th>
            <th>Progreso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.title}</td>
              <td>
                <Badge bg={getStatusBadge(order.status)}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </td>
              <td>{new Date(order.dueDate).toLocaleDateString()}</td>
              <td>
                <div className="progress">
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ width: `${order.progress}%` }}
                    aria-valuenow={order.progress} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {order.progress}%
                  </div>
                </div>
              </td>
              <td>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleShowDetails(order)}
                >
                  <FaEye /> Ver
                </Button>
                <Button 
                  variant="outline-success" 
                  size="sm" 
                  className="me-2"
                >
                  <FaDownload /> Archivos
                </Button>
                <Button 
                  variant="outline-info" 
                  size="sm"
                >
                  <FaComments /> Chat
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de Detalles */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <h4>{selectedOrder.title}</h4>
              <p><strong>Asesor:</strong> {selectedOrder.writer}</p>
              <p><strong>Fecha de Inicio:</strong> {new Date(selectedOrder.startDate).toLocaleDateString()}</p>
              <p><strong>Fecha de Entrega:</strong> {new Date(selectedOrder.dueDate).toLocaleDateString()}</p>
              <p><strong>Precio:</strong> ${selectedOrder.price}</p>
              <p><strong>Progreso:</strong></p>
              <div className="progress mb-3">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${selectedOrder.progress}%` }}
                  aria-valuenow={selectedOrder.progress} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  {selectedOrder.progress}%
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MyOrders;
