import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Aquí irá la lógica para resetear la contraseña
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setError('Error al restablecer la contraseña');
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
                            <h2 className="text-center mb-4">Restablecer Contraseña</h2>

                            {error && (
                                <Alert variant="danger">{error}</Alert>
                            )}

                            {success ? (
                                <Alert variant="success">
                                    Contraseña restablecida exitosamente.
                                    Serás redirigido al inicio de sesión...
                                </Alert>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <FaLock className="me-2" />
                                            Nueva Contraseña
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>
                                            <FaLock className="me-2" />
                                            Confirmar Nueva Contraseña
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 mb-3"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
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

export default ResetPassword;
