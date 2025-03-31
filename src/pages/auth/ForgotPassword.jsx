import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, reset } from '../../features/auth/authSlice';
import { FaEnvelope } from 'react-icons/fa';

function ForgotPassword() {
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await dispatch(forgotPassword(email)).unwrap();
      setSuccessMessage(
        response?.message || 'Enlace de recuperación enviado correctamente.'
      );
    } catch (error) {
      setErrorMessage(
        error?.message || 'Error al enviar el correo de recuperación.'
      );
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Recuperar Contraseña</h2>

              {errorMessage && (
                <Alert variant="danger" className="text-center">
                  {errorMessage}
                </Alert>
              )}

              {successMessage && (
                <Alert variant="success" className="text-center">
                  {successMessage}
                </Alert>
              )}

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
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Link de Recuperación'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none">
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
