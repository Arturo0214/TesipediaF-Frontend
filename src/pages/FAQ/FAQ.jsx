import React from 'react';
import { Container, Row, Col, Accordion } from 'react-bootstrap';
import './FAQ.css';

function FAQ() {
    return (
        <Container className="faq-container py-5">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <h1 className="text-center mb-5">Dudas Frecuentes</h1>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>¿Cómo funciona el servicio de desarrollo de tesis?</Accordion.Header>
                            <Accordion.Body>
                                Nuestro servicio de desarrollo de tesis es un proceso personalizado que comienza con una consulta inicial para entender tus necesidades específicas. Asignamos un asesor especializado en tu área de estudio quien te guiará durante todo el proceso, desde la conceptualización hasta la entrega final.
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="1">
                            <Accordion.Header>¿Cuál es el tiempo promedio de entrega?</Accordion.Header>
                            <Accordion.Body>
                                El tiempo estándar de entrega es de 3 semanas para una tesis completa. Sin embargo, este plazo puede variar según la complejidad del proyecto y los requisitos específicos de tu institución. También ofrecemos servicios express para casos urgentes.
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="2">
                            <Accordion.Header>¿Cómo garantizan la originalidad del trabajo?</Accordion.Header>
                            <Accordion.Body>
                                Utilizamos Turnitin® y otras herramientas especializadas para garantizar la originalidad de cada trabajo. Además, nuestro equipo de investigadores desarrolla cada proyecto desde cero, asegurando contenido único y personalizado según tus requerimientos.
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="3">
                            <Accordion.Header>¿Qué métodos de pago aceptan?</Accordion.Header>
                            <Accordion.Body>
                                Aceptamos diversos métodos de pago incluyendo tarjetas de crédito/débito, PayPal, transferencias bancarias y pagos en efectivo a través de OXXO. Ofrecemos planes de pago flexibles adaptados a tus necesidades.
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="4">
                            <Accordion.Header>¿Ofrecen garantía de aprobación?</Accordion.Header>
                            <Accordion.Body>
                                Sí, ofrecemos una garantía de aprobación del 100%. Si tu trabajo requiere modificaciones después de la revisión del comité académico, las realizaremos sin costo adicional hasta obtener la aprobación.
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Col>
            </Row>
        </Container>
    );
}

export default FAQ; 