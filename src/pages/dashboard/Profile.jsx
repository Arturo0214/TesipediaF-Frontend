import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useState } from 'react';
import { useSelector } from 'react-redux';

function Profile() {
    const { user } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        university: user?.university || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica para actualizar perfil
    };

    return (
        <Container className="py-5">
            <h1 className="mb-4">Mi Perfil</h1>
            <Row>
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.email}
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Universidad</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="university"
                                        value={formData.university}
                                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                    />
                                </Form.Group>
                                <Button type="submit" variant="primary">
                                    Actualizar Perfil
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body className="text-center">
                            <div className="mb-3">
                                <img
                                    src={user?.avatar || '/default-avatar.png'}
                                    alt="Profile"
                                    className="rounded-circle profile-avatar"
                                />
                            </div>
                            <h5>{user?.name}</h5>
                            <p className="text-muted">{user?.email}</p>
                            <Button variant="outline-primary" size="sm">
                                Cambiar Avatar
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Profile;
