import React from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

// Explicitly define as a regular function component for clarity
function ManageProjects() {
    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">Gestión de Proyectos</h2>
            <Table responsive striped hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Servicio</th>
                        <th>Estado</th>
                        <th>Fecha de Entrega</th>
                        <th>Prioridad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#PRJ001</td>
                        <td>María García</td>
                        <td>Tesis Doctoral</td>
                        <td>
                            <Badge bg="success">En Progreso</Badge>
                        </td>
                        <td>2024-05-15</td>
                        <td>
                            <Badge bg="danger">Urgente</Badge>
                        </td>
                        <td>
                            <Button variant="info" size="sm" className="me-2">
                                <FaEye />
                            </Button>
                            <Button variant="warning" size="sm" className="me-2">
                                <FaEdit />
                            </Button>
                            <Button variant="danger" size="sm">
                                <FaTrash />
                            </Button>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </Container>
    );
}

// Make sure component is properly exported
export default ManageProjects; 