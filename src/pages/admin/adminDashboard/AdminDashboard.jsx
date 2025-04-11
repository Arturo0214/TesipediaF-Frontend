import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaFileAlt, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {
  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Dashboard</h2>
      <Row>
        <Col md={3} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Usuarios Totales</h6>
                  <h3 className="mb-0">1,234</h3>
                </div>
                <FaUsers className="text-primary" size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Proyectos Activos</h6>
                  <h3 className="mb-0">56</h3>
                </div>
                <FaFileAlt className="text-success" size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Ingresos Mensuales</h6>
                  <h3 className="mb-0">$45,678</h3>
                </div>
                <FaMoneyBillWave className="text-warning" size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Visitas Totales</h6>
                  <h3 className="mb-0">8,901</h3>
                </div>
                <FaChartLine className="text-info" size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
