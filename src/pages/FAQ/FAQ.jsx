import React from 'react';
import { Container, Row, Col, Accordion } from 'react-bootstrap';
import './FAQ.css';

function FAQ() {
    return (
        <div className="faq-page">
            <Container className="faq-container py-5">
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <div className="faq-header text-center mb-5">
                            <h1>Dudas Frecuentes</h1>
                            <p className="faq-subtitle">Encuentra respuestas a las preguntas más comunes sobre nuestros servicios</p>
                        </div>
                        <Accordion className="faq-accordion">
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
                                    Sí, ofrecemos una garantía de aprobación del 100%. Si tu trabajo requiere modificaciones después de la revisión de fondo y estilo incluidas en el paquete, las realizaremos con un costo adicional hasta obtener la aprobación.
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>¿Cuántas correcciones incluye mi paquete?</Accordion.Header>
                                <Accordion.Body>
                                    Todos nuestros paquetes incluyen una corrección gratuita. En caso de requerir correcciones adicionales no contempladas en la cotización inicial, se puede aplicar un cargo adicional dependiendo de la magnitud del cambio solicitado.
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>¿Puedo solicitar un reembolso si hubo un error en la cotización?</Accordion.Header>
                                <Accordion.Body>
                                    En caso de existir un error comprobable en la cotización debido a información incorrecta proporcionada por el cliente o por parte del equipo, revisaremos cada caso de forma individual. Podemos ofrecer reembolsos parciales o ajustes en el servicio para garantizar tu satisfacción.
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="7">
                                <Accordion.Header>¿Brindan atención los fines de semana?</Accordion.Header>
                                <Accordion.Body>
                                    Nuestro horario de atención es exclusivamente en días hábiles, de lunes a viernes. Si envías una solicitud durante el fin de semana o un día festivo, será atendida el siguiente día hábil en orden de llegada. Te garantizamos respuesta oportuna y seguimiento dedicado dentro de nuestro horario establecido.
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default FAQ;
