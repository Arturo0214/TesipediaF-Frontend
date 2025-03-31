import { useState } from 'react';
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
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../features/auth/authSlice';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const { password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      await dispatch(resetPassword({ token, password })).unwrap();
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setErrorMessage(error.message || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-lg border-0 rounded">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Restablecer Contraseña</h2>

              {errorMessage && (
                <Alert variant="danger" className="text-center">
                  {errorMessage}
                </Alert>
              )}

              {success ? (
                <Alert variant="success" className="text-center">
                  Contraseña restablecida exitosamente.
                  <br /> Serás redirigido al inicio de sesión...
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>
                      <FaLock className="me-2" />
                      Nueva Contraseña
                    </Form.Label>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className="border border-primary rounded-pill pe-5"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="position-absolute d-flex align-items-center justify-content-center h-100"
                      style={{
                        right: '15px',
                        top: '15px',
                        cursor: 'pointer',
                        width: '2rem',
                      }}
                    >
                      {showPassword ? (
                        <FaEyeSlash color="#007bff" />
                      ) : (
                        <FaEye color="#007bff" />
                      )}
                    </span>
                  </Form.Group>

                  <Form.Group className="mb-4 position-relative">
                    <Form.Label>
                      <FaLock className="me-2" />
                      Confirmar Nueva Contraseña
                    </Form.Label>
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      required
                      className="border border-primary rounded-pill pe-5"
                    />
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="position-absolute d-flex align-items-center justify-content-center h-100"
                      style={{
                        right: '15px',
                        top: '15px',
                        cursor: 'pointer',
                        width: '2rem',
                      }}
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash color="#007bff" />
                      ) : (
                        <FaEye color="#007bff" />
                      )}
                    </span>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3 rounded-pill"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Restableciendo...
                      </>
                    ) : (
                      'Restablecer Contraseña'
                    )}
                  </Button>
                </Form>
              )}

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

export default ResetPassword;
