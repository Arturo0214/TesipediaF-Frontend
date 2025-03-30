import { Container, Row, Col, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaFileAlt, FaClipboardList, FaComments, FaCreditCard } from 'react-icons/fa';

function Dashboard() {
    const { user } = useSelector((state) => state.auth);

    return (
        <Container className="py-5">
            <h1 className="mb-4">Dashboard</h1>
            <Row className="g-4">
                <Col md={3}>
                    <Card className="dashboard-card h-100">
                        <Card.Body className="text-center">
                            <FaFileAlt className="dashboard-icon text-primary mb-3" />
                            <Card.Title>Mis Tesis</Card.Title>
                            <h3>2</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="dashboard-card h-100">
                        <Card.Body className="text-center">
                            <FaClipboardList className="dashboard-icon text-success mb-3" />
                            <Card.Title>Cotizaciones</Card.Title>
                            <h3>3</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="dashboard-card h-100">
                        <Card.Body className="text-center">
                            <FaComments className="dashboard-icon text-info mb-3" />
                            <Card.Title>Mensajes</Card.Title>
                            <h3>5</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="dashboard-card h-100">
                        <Card.Body className="text-center">
                            <FaCreditCard className="dashboard-icon text-warning mb-3" />
                            <Card.Title>Pagos</Card.Title>
                            <h3>2</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col md={8}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Actividad Reciente</h5>
                        </Card.Header>
                        <Card.Body>
                            {/* Lista de actividades recientes */}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Próximas Entregas</h5>
                        </Card.Header>
                        <Card.Body>
                            {/* Lista de próximas entregas */}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Dashboard;
