import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';

function ManageWriters() {
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentWriter, setCurrentWriter] = useState({
    id: '',
    name: '',
    specialty: '',
    projects: 0,
    rating: 0
  });

  // Mock data - replace with real API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setWriters([
        { id: 1, name: 'Ana García', specialty: 'Tesis de Psicología', projects: 15, rating: 4.8 },
        { id: 2, name: 'Carlos Pérez', specialty: 'Ensayos Académicos', projects: 23, rating: 4.5 },
        { id: 3, name: 'Sofia Martínez', specialty: 'Investigación Científica', projects: 10, rating: 4.9 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleShow = (writer) => {
    setCurrentWriter(writer || {
      id: '',
      name: '',
      specialty: '',
      projects: 0,
      rating: 0
    });
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentWriter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission - would be an API call in a real app
    console.log('Submitting writer data:', currentWriter);

    if (currentWriter.id) {
      // Update existing writer
      setWriters(writers.map(w =>
        w.id === currentWriter.id ? currentWriter : w
      ));
    } else {
      // Add new writer
      setWriters([...writers, { ...currentWriter, id: Date.now() }]);
    }

    handleClose();
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 4.0) return 'primary';
    if (rating >= 3.5) return 'warning';
    return 'danger';
  };

  if (loading) return <Container className="py-5"><p>Cargando escritores...</p></Container>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Escritores</h2>
        <Button variant="primary" onClick={() => handleShow()}>Añadir Escritor</Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr className="bg-light">
            <th>ID</th>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Proyectos</th>
            <th>Calificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {writers.length > 0 ? (
            writers.map(writer => (
              <tr key={writer.id}>
                <td>{writer.id}</td>
                <td>{writer.name}</td>
                <td>{writer.specialty}</td>
                <td>{writer.projects}</td>
                <td>
                  <Badge bg={getRatingColor(writer.rating)}>
                    {writer.rating}/5.0
                  </Badge>
                </td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShow(writer)}>
                    Editar
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No hay escritores disponibles</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal for Adding/Editing Writers */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{currentWriter.id ? 'Editar Escritor' : 'Añadir Nuevo Escritor'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentWriter.name || ''}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Especialidad</Form.Label>
              <Form.Control
                type="text"
                name="specialty"
                value={currentWriter.specialty || ''}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {currentWriter.id && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Proyectos Completados</Form.Label>
                  <Form.Control
                    type="number"
                    name="projects"
                    value={currentWriter.projects || 0}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Calificación</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    name="rating"
                    value={currentWriter.rating || 0}
                    onChange={handleChange}
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {currentWriter.id ? 'Actualizar' : 'Añadir'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default ManageWriters;
