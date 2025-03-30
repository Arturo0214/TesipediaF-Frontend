import { Container, Table, Button } from 'react-bootstrap';

function ManageUsers() {
  return (
    <Container className="py-5">
      <h2 className="mb-4">Gestión de Usuarios</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
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

export default ManageUsers;
