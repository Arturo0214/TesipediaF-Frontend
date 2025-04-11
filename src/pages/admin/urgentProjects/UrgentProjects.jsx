import React from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { FaEye, FaEdit, FaExclamationTriangle } from 'react-icons/fa';

const UrgentProjects = () => {
    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">
                <FaExclamationTriangle className="text-danger me-2" />
                Proyectos Urgentes
            </h2>
            <Table responsive striped hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Servicio</th>
                        <th>Fecha Límite</th>
                        <th>Estado</th>
                        <th>Prioridad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#URG001</td>
                        <td>Ana Martínez</td>
                        <td>Tesis Doctoral</td>
                        <td>2024-04-15</td>
                        <td>
                            <Badge bg="warning">Pendiente</Badge>
                        </td>
                        <td>
                            <Badge bg="danger">Crítico</Badge>
                        </td>
                        <td>
                            <Button variant="info" size="sm" className="me-2">
                                <FaEye />
                            </Button>
                            <Button variant="warning" size="sm">
                                <FaEdit />
                            </Button>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </Container>
    );
};

export default UrgentProjects; 