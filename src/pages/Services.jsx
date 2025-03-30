import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaGraduationCap, FaUserTie, FaEdit, FaChartLine } from 'react-icons/fa';

function Services() {
  const services = [
    {
      icon: <FaGraduationCap />,
      title: 'Desarrollo de Tesis',
      description: 'Desarrollo completo de tesis con metodología profesional y garantía de aprobación.'
    },
    {
      icon: <FaUserTie />,
      title: 'Asesoría Personalizada',
      description: 'Acompañamiento personalizado durante todo el proceso de tu tesis.'
    },
    {
      icon: <FaEdit />,
      title: 'Revisión y Corrección',
      description: 'Revisión detallada y corrección de estilo, formato y contenido.'
    },
    {
      icon: <FaChartLine />,
      title: 'Análisis Estadístico',
      description: 'Procesamiento y análisis de datos para tu investigación.'
    }
  ];

  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">Nuestros Servicios</h1>
      <Row className="g-4">
        {services.map((service, index) => (
          <Col key={index} md={6} lg={3}>
            <Card className="h-100 service-card text-center">
              <Card.Body>
                <div className="service-icon mb-3">
                  {service.icon}
                </div>
                <Card.Title>{service.title}</Card.Title>
                <Card.Text>{service.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Services;
