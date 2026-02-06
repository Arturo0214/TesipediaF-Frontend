import React, { useState } from 'react';
import { Container, Row, Col, Card, ProgressBar, Button, Badge, Tab, Tabs, Form } from 'react-bootstrap';
import { FaDownload, FaUpload, FaComments, FaCalendarAlt, FaUserGraduate, FaFileAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const MyProject = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [message, setMessage] = useState('');
    const { user } = useSelector((state) => state.auth);

    // Datos de ejemplo para mostrar el diseño
    const projectData = {
        title: "Análisis del impacto de la inteligencia artificial en la educación superior",
        status: "en_proceso",
        progress: 65,
        startDate: "2024-02-15",
        dueDate: "2024-05-15",
        advisor: {
            name: "Dr. Juan Pérez",
            title: "PhD en Educación",
            avatar: "https://via.placeholder.com/150"
        },
        nextMilestone: {
            title: "Entrega de Capítulo 3",
            date: "2024-03-30"
        },
        recentFiles: [
            { name: "Capítulo_2_Final.pdf", date: "2024-03-10", type: "pdf" },
            { name: "Referencias_Actualizadas.docx", date: "2024-03-08", type: "doc" }
        ],
        messages: [
            {
                id: 1,
                sender: "Dr. Juan Pérez",
                content: "He revisado el último capítulo. Excelente trabajo en la metodología.",
                timestamp: "2024-03-10T14:30:00",
                isAdvisor: true
            },
            {
                id: 2,
                sender: "Tú",
                content: "Gracias por la retroalimentación. Implementaré los cambios sugeridos.",
                timestamp: "2024-03-10T15:00:00",
                isAdvisor: false
            }
        ]
    };

    const getStatusBadge = (status) => {
        const badges = {
            pendiente: 'warning',
            en_proceso: 'primary',
            revision: 'info',
            completado: 'success',
            pausado: 'secondary'
        };
        return badges[status] || 'secondary';
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        console.log('Enviando mensaje:', message);
        setMessage('');
    };

    return (
        <Container className="pt-3 pb-5">
            <div className="alert alert-info mb-4">
                <h5>🎓 Ejemplo de Visualización</h5>
                <p className="mb-0">
                    Actualmente no tienes proyectos activos. Esta es una vista de ejemplo de cómo se verá tu proyecto una vez que inicies uno.
                    Para comenzar un nuevo proyecto, primero debes realizar una cotización.
                </p>
            </div>

            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Row>
                                <Col md={8}>
                                    <h2>{projectData.title}</h2>
                                    <Badge bg={getStatusBadge(projectData.status)} className="mb-3">
                                        {projectData.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    <div className="mb-3">
                                        <strong>Progreso General:</strong>
                                        <ProgressBar
                                            now={projectData.progress}
                                            label={`${projectData.progress}%`}
                                            className="mt-2"
                                        />
                                    </div>
                                </Col>
                                <Col md={4} className="text-md-end">
                                    <Button variant="primary" className="me-2" disabled>
                                        <FaDownload className="me-2" />
                                        Descargar Archivos
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-4"
                    >
                        <Tab eventKey="overview" title="Vista General">
                            <Row>
                                <Col md={8}>
                                    <Card className="mb-4">
                                        <Card.Body>
                                            <h4>Detalles del Proyecto</h4>
                                            <Row className="mt-3">
                                                <Col md={6}>
                                                    <p>
                                                        <FaCalendarAlt className="me-2" />
                                                        <strong>Fecha de Inicio:</strong><br />
                                                        {new Date(projectData.startDate).toLocaleDateString()}
                                                    </p>
                                                </Col>
                                                <Col md={6}>
                                                    <p>
                                                        <FaCalendarAlt className="me-2" />
                                                        <strong>Fecha de Entrega:</strong><br />
                                                        {new Date(projectData.dueDate).toLocaleDateString()}
                                                    </p>
                                                </Col>
                                            </Row>
                                            <div className="mt-3">
                                                <h5>Próximo Hito</h5>
                                                <p>
                                                    <strong>{projectData.nextMilestone.title}</strong><br />
                                                    {new Date(projectData.nextMilestone.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </Card.Body>
                                    </Card>

                                    <Card>
                                        <Card.Body>
                                            <h4>Archivos Recientes</h4>
                                            <div className="mt-3">
                                                {projectData.recentFiles.map((file, index) => (
                                                    <div key={index} className="d-flex align-items-center mb-3 p-2 border rounded">
                                                        <FaFileAlt className="me-3 text-primary" />
                                                        <div className="flex-grow-1">
                                                            <div>{file.name}</div>
                                                            <small className="text-muted">
                                                                {new Date(file.date).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                        <Button variant="outline-primary" size="sm" disabled>
                                                            <FaDownload />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button variant="outline-primary" className="mt-3" disabled>
                                                <FaUpload className="me-2" />
                                                Subir Archivo
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={4}>
                                    <Card className="mb-4">
                                        <Card.Body>
                                            <h4>Asesor Asignado</h4>
                                            <div className="text-center mt-3">
                                                <img
                                                    src={projectData.advisor.avatar}
                                                    alt={projectData.advisor.name}
                                                    className="rounded-circle mb-3"
                                                    style={{ width: '100px', height: '100px' }}
                                                />
                                                <h5>{projectData.advisor.name}</h5>
                                                <p className="text-muted">{projectData.advisor.title}</p>
                                                <Button variant="outline-primary" disabled>
                                                    <FaComments className="me-2" />
                                                    Contactar
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Tab>

                        <Tab eventKey="messages" title="Mensajes">
                            <Card>
                                <Card.Body>
                                    <div className="messages-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {projectData.messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`d-flex mb-3 ${msg.isAdvisor ? '' : 'flex-row-reverse'}`}
                                            >
                                                <div
                                                    className={`message-bubble p-3 rounded ${msg.isAdvisor ? 'bg-light' : 'bg-primary text-white'}`}
                                                    style={{ maxWidth: '75%' }}
                                                >
                                                    <div className="mb-1">
                                                        <strong>{msg.sender}</strong>
                                                    </div>
                                                    <div>{msg.content}</div>
                                                    <small className={msg.isAdvisor ? 'text-muted' : 'text-white-50'}>
                                                        {new Date(msg.timestamp).toLocaleString()}
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Form onSubmit={handleSendMessage} className="mt-4">
                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Escribe tu mensaje..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                disabled
                                            />
                                        </Form.Group>
                                        <Button type="submit" variant="primary" disabled>
                                            Enviar Mensaje
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </Container>
    );
};

export default MyProject; 