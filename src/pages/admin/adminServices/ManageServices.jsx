import React from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const ManageServices = () => {
    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Catálogo de Servicios</h2>
                <Button variant="primary">
                    <FaPlus className="me-2" />
                    Nuevo Servicio
                </Button>
            </div>
            <Table responsive striped hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Precio Base</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#SRV001</td>
                        <td>Tesis de Grado</td>
                        <td>Servicio de redacción de tesis de grado</td>
                        <td>$1,500</td>
                        <td>
                            <Badge bg="success">Activo</Badge>
                        </td>
                        <td>
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
};

export default ManageServices; 