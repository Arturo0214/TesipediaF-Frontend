import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, reset } from '../../features/auth/authSlice';
import { FaLock } from 'react-icons/fa';
import axiosWithAuth from '../../utils/axioswithAuth';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    dispatch(reset());
    validateToken();
  }, [dispatch, token]);

  const validateToken = async () => {
    try {
      const response = await axiosWithAuth.get(`/auth/reset-password/${token}`, {
        withCredentials: true
      });
      console.log('Respuesta de validación:', response.data);

      if (response.data.valid) {
        setIsTokenValid(true);
      } else {
        setErrorMessage('El enlace de restablecimiento es inválido o ha expirado.');
      }
    } catch (error) {
      console.error('Error al validar token:', error);
      setErrorMessage(
        error.response?.data?.message ||
        'Error al validar el enlace de restablecimiento. Por favor, intenta solicitar un nuevo enlace.'
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const response = await dispatch(resetPassword({ token, password })).unwrap();
      setSuccessMessage('Contraseña actualizada exitosamente.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setErrorMessage(error?.message || 'Error al restablecer la contraseña.');
    }
  };

  if (!isTokenValid && !isLoading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-sm">
              <Card.Body className="p-4 text-center">
                <Alert variant="danger">
                  {errorMessage || 'El enlace de restablecimiento es inválido o ha expirado.'}
                </Alert>
                <Button
                  variant="primary"
                  onClick={() => navigate('/forgot-password')}
                  className="mt-3"
                >
                  Solicitar nuevo enlace
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Restablecer Contraseña</h2>

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
                    <FaLock className="me-2" />
                    Nueva Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <FaLock className="me-2" />
                    Confirmar Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
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
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Contraseña'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ResetPassword;
