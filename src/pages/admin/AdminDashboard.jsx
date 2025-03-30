import { Container, Row, Col, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaUsers, FaFileAlt, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Container className="py-5">
      <h1 className="mb-4">Panel de Administración</h1>
      <Row className="g-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaUsers className="display-4 text-primary mb-3" />
              <Card.Title>Usuarios</Card.Title>
              <h3>150</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaFileAlt className="display-4 text-success mb-3" />
              <Card.Title>Tesis</Card.Title>
              <h3>75</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaMoneyBillWave className="display-4 text-warning mb-3" />
              <Card.Title>Ingresos</Card.Title>
              <h3>$15,000</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaChartLine className="display-4 text-info mb-3" />
              <Card.Title>Cotizaciones</Card.Title>
              <h3>30</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminDashboard;
