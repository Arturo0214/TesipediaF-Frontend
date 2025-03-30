import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { FaEnvelope, FaLock } from 'react-icons/fa';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, isError, message } = useSelector(state => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(login(formData)).unwrap();
            navigate('/dashboard');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
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
                                <Alert variant="danger">{message}</Alert>
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
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 mb-3"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                </Button>

                                <div className="text-center">
                                    <Link
                                        to="/olvide-password"
                                        className="text-decoration-none"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                            </Form>
                        </Card.Body>
                        <Card.Footer className="text-center bg-light py-3">
                            ¿No tienes una cuenta?{' '}
                            <Link
                                to="/register"
                                className="text-decoration-none"
                            >
                                Regístrate
                            </Link>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;
