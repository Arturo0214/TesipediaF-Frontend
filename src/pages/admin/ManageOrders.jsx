import { Container, Table, Badge } from 'react-bootstrap';

function ManageOrders() {
  return (
    <Container className="py-5">
      <h2 className="mb-4">Gestión de Pedidos</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Fecha</th>
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

export default ManageOrders;
