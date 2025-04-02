import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para manejar el envío del formulario
  };

  return (
    <Container className="contact-container">
      <h1 className="text-center mb-5">Contacto</h1>
      <Row className="g-4">
        <Col md={6}>
          <h2 className="mb-4">Envíanos un mensaje</h2>
          <div className="contact-form">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" placeholder="Tu nombre" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" placeholder="tu@email.com" required />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Mensaje</Form.Label>
                <Form.Control as="textarea" rows={5} placeholder="¿En qué podemos ayudarte?" required />
              </Form.Group>
              <Button type="submit" variant="primary">Enviar Mensaje</Button>
            </Form>
          </div>
        </Col>
        <Col md={6}>
          <h2 className="mb-4">Información de Contacto</h2>
          <div className="contact-details">
            <p><FaEnvelope /> info@tesipedia.com</p>
            <p><FaPhone /> +52 (123) 456-7890</p>
            <p><FaMapMarkerAlt /> Ciudad de México, CDMX</p>
            <h3>Horario de Atención</h3>
            <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
            <p>Sábados: 9:00 AM - 2:00 PM</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Contact;
