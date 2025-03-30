import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

function Messages() {
    return (
        <Container className="py-5">
            <h1 className="mb-4">Mensajes</h1>
            <Row>
                <Col md={4}>
                    <Card className="messages-sidebar">
                        <Card.Body>
                            <div className="messages-list">
                                {/* Lista de conversaciones */}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card className="messages-content">
                        <Card.Body>
                            <div className="messages-container">
                                {/* Mensajes de la conversación */}
                            </div>
                            <Form className="message-form mt-3">
                                <Form.Group>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Escribe tu mensaje..."
                                    />
                                </Form.Group>
                                <Button variant="primary" className="mt-2">
                                    Enviar
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Messages;
