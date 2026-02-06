import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner,
} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../../features/auth/authSlice';
import { linkQuoteToUser } from '../../features/quotes/quoteSlice';
import Swal from 'sweetalert2';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    }

    // Si el login es exitoso
    if (isSuccess && user) {
      // Verificar si hay un publicId en la URL
      const urlParams = new URLSearchParams(location.search);
      const publicId = urlParams.get('public_id');

      if (publicId) {
        // Intentar vincular la cotización al usuario
        dispatch(linkQuoteToUser(publicId))
          .unwrap()
          .then(() => {
            // Redirigir a /cotizar con el mismo publicId
            navigate(`/cotizar?public_id=${publicId}`);
          })
          .catch((error) => {
            console.error('Error al vincular cotización:', error);
            // Si hay error, igual redirigimos a /cotizar
            navigate('/cotizar');
          });
      } else {
        // Si no hay publicId, redirigir a la ruta original
        const { from } = location.state || { from: { pathname: '/dashboard' } };
        navigate(from.pathname);
      }
      dispatch(reset());
    }
  }, [user, isError, isSuccess, message, navigate, dispatch, location]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
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

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaEnvelope className="me-2" />
                    Correo Electrónico
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="tu@email.com"
                    name="email"
                    value={email}
                    onChange={onChange}
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
                    name="password"
                    value={password}
                    onChange={onChange}
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
