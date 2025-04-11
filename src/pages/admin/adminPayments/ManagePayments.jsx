import React from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';

// Explicitly define as a regular function component for clarity
function ManagePayments() {
    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">Gestión de Pagos</h2>
            <Table responsive striped hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Monto</th>
                        <th>Método</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#PAY001</td>
                        <td>Carlos López</td>
                        <td>$2,500</td>
                        <td>Tarjeta de Crédito</td>
                        <td>
                            <Badge bg="success">Completado</Badge>
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
}

// Make sure component is properly exported
export default ManagePayments; 