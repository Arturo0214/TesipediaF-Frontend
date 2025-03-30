import { Container, Table, Badge, Button } from 'react-bootstrap';

function Payments() {
    return (
        <Container className="py-5">
            <h1 className="mb-4">Mis Pagos</h1>
            <Table responsive striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Concepto</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#12345</td>
                        <td>2024-01-15</td>
                        <td>Tesis de Maestría</td>
                        <td>$5,000</td>
                        <td>
                            <Badge bg="success">Completado</Badge>
                        </td>
                        <td>
                            <Button variant="outline-primary" size="sm">
                                Ver Detalles
                            </Button>
                        </td>
                    </tr>
                    {/* Más filas de pagos */}
                </tbody>
            </Table>
        </Container>
    );
}

export default Payments;
