import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Aquí irá la lógica para enviar el email de recuperación
      setSuccess(true);
    } catch (error) {
      setError('Error al enviar el email de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Recuperar Contraseña</h2>
              
              {error && (
                <Alert variant="danger">{error}</Alert>
              )}

              {success ? (
                <Alert variant="success">
                  Se ha enviado un enlace de recuperación a tu email.
                  Por favor, revisa tu bandeja de entrada.
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>
                      <FaEnvelope className="me-2" />
                      Correo Electrónico
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Link de Recuperación'}
                  </Button>
                </Form>
              )}

              <div className="text-center mt-3">
                <Link 
                  to="/login" 
                  className="text-decoration-none"
                >
                  Volver a Iniciar Sesión
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPassword;
