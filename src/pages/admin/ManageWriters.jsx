import { Container, Table, Button } from 'react-bootstrap';

function ManageWriters() {
  return (
    <Container className="py-5">
      <h2 className="mb-4">Gestión de Escritores</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Proyectos</th>
            <th>Calificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Contenido de la tabla */}
        </tbody>
      </Table>
    </Container>
  );
}

export default ManageWriters;
