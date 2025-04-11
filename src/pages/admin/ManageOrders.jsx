import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap';

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [filter, setFilter] = useState('all');

  // Mock data - replace with real API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders([
        {
          id: 101,
          client: 'Miguel Ángel Rodriguez',
          title: 'Tesis de Economía',
          status: 'pendiente',
          date: '2023-10-15',
          priority: 'alta',
          deadline: '2023-11-30',
          price: 4500
        },
        {
          id: 102,
          client: 'Laura Gómez',
          title: 'Ensayo de Filosofía',
          status: 'en_progreso',
          date: '2023-10-10',
          priority: 'media',
          deadline: '2023-11-15',
          price: 2800
        },
        {
          id: 103,
          client: 'Antonio Pérez',
          title: 'Estudio de Mercado',
          status: 'completado',
          date: '2023-09-25',
          priority: 'baja',
          deadline: '2023-10-25',
          price: 3200
        },
        {
          id: 104,
          client: 'María Sánchez',
          title: 'Proyecto de Investigación',
          status: 'cancelado',
          date: '2023-09-20',
          priority: 'alta',
          deadline: '2023-10-20',
          price: 5000
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleViewOrder = (order) => {
    setCurrentOrder(order);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleUpdateStatus = (id, newStatus) => {
    setOrders(orders.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendiente':
        return <Badge bg="warning">Pendiente</Badge>;
      case 'en_progreso':
        return <Badge bg="primary">En Progreso</Badge>;
      case 'completado':
        return <Badge bg="success">Completado</Badge>;
      case 'cancelado':
        return <Badge bg="danger">Cancelado</Badge>;
      default:
        return <Badge bg="secondary">Desconocido</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'alta':
        return <Badge bg="danger">Alta</Badge>;
      case 'media':
        return <Badge bg="warning">Media</Badge>;
      case 'baja':
        return <Badge bg="info">Baja</Badge>;
      default:
        return <Badge bg="secondary">Normal</Badge>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  if (loading) return <Container className="py-5"><p>Cargando pedidos...</p></Container>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Pedidos</h2>
        <div>
          <Form.Select
            className="d-inline-block me-2"
            style={{ width: 'auto' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todos los pedidos</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completado">Completados</option>
            <option value="cancelado">Cancelados</option>
          </Form.Select>
          <Button variant="primary">Nuevo Pedido</Button>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr className="bg-light">
            <th>ID</th>
            <th>Cliente</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.client}</td>
                <td>{order.title}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{getPriorityBadge(order.priority)}</td>
                <td>{formatDate(order.date)}</td>
                <td>
                  <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleViewOrder(order)}>
                    Ver Detalles
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-2"
                    disabled={order.status === 'completado' || order.status === 'cancelado'}
                    onClick={() => handleUpdateStatus(order.id, 'completado')}
                  >
                    Completar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">No hay pedidos que coincidan con el filtro actual</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal para ver detalles del pedido */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Pedido #{currentOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrder && (
            <Row>
              <Col md={6}>
                <p><strong>Cliente:</strong> {currentOrder.client}</p>
                <p><strong>Título:</strong> {currentOrder.title}</p>
                <p><strong>Estado:</strong> {getStatusBadge(currentOrder.status)}</p>
                <p><strong>Fecha de creación:</strong> {formatDate(currentOrder.date)}</p>
              </Col>
              <Col md={6}>
                <p><strong>Prioridad:</strong> {getPriorityBadge(currentOrder.priority)}</p>
                <p><strong>Fecha límite:</strong> {formatDate(currentOrder.deadline)}</p>
                <p><strong>Precio:</strong> ${currentOrder.price.toLocaleString()}</p>
              </Col>
              <Col xs={12} className="mt-3">
                <h5>Cambiar estado</h5>
                <div className="d-flex gap-2 mt-2">
                  <Button
                    variant={currentOrder.status === 'pendiente' ? 'warning' : 'outline-warning'}
                    onClick={() => handleUpdateStatus(currentOrder.id, 'pendiente')}
                  >
                    Pendiente
                  </Button>
                  <Button
                    variant={currentOrder.status === 'en_progreso' ? 'primary' : 'outline-primary'}
                    onClick={() => handleUpdateStatus(currentOrder.id, 'en_progreso')}
                  >
                    En Progreso
                  </Button>
                  <Button
                    variant={currentOrder.status === 'completado' ? 'success' : 'outline-success'}
                    onClick={() => handleUpdateStatus(currentOrder.id, 'completado')}
                  >
                    Completado
                  </Button>
                  <Button
                    variant={currentOrder.status === 'cancelado' ? 'danger' : 'outline-danger'}
                    onClick={() => handleUpdateStatus(currentOrder.id, 'cancelado')}
                  >
                    Cancelado
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageOrders;
