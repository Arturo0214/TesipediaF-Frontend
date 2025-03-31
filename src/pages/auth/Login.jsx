import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../../features/auth/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isAuthenticated, message } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(reset()); // 🔄 Limpiar estado al cargar
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      // El redireccionamiento ocurre en el useEffect
    } catch (error) {
      // Error ya está manejado por el slice
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Iniciar Sesión</h2>

              {isError && (
                <Alert variant="danger" className="text-center">
                  {message || 'Ocurrió un error al iniciar sesión'}
                </Alert>
              )}

              {isLoading && (
                <div className="text-center my-3">
                  <Spinner animation="border" variant="primary" />
                  <div className="mt-2">Iniciando sesión...</div>
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
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

                <Form.Group className="mb-4">
                  <Form.Label>
                    <FaLock className="me-2" />
                    Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>

                <div className="text-center">
                  <Link to="/forgot-password" className="text-decoration-none">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </Form>
            </Card.Body>

            <Card.Footer className="text-center bg-light py-3">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-decoration-none">
                Regístrate
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
