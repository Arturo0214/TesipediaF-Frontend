import React from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';

const ManageQuotes = () => {
  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Gestión de Cotizaciones</h2>
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
          <tr>
            <td>#12345</td>
            <td>Juan Pérez</td>
            <td>Tesis de Grado</td>
            <td>$1,500</td>
            <td>
              <Badge bg="warning">Pendiente</Badge>
            </td>
            <td>2024-04-10</td>
            <td>
              <Button variant="info" size="sm" className="me-2">
                <FaEye />
              </Button>
              <Button variant="success" size="sm" className="me-2">
                <FaCheck />
              </Button>
              <Button variant="danger" size="sm">
                <FaTimes />
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};

export default ManageQuotes;
