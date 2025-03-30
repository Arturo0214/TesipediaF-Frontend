import { Container, Table, Button } from 'react-bootstrap';

function ManageQuotes() {
  return (
    <Container className="py-5">
      <h2 className="mb-4">Gestión de Cotizaciones</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Tipo</th>
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

export default ManageQuotes;
