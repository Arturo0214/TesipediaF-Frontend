import { Container, Row, Col } from 'react-bootstrap';
import './ProcessSection.css';

const ProcessSection = () => {
    return (
        <section className="process-section bg-light py-5">
            <Container>
                <h2 className="text-center mb-5">¿Cómo Funciona?</h2>
                <Row className="g-4">
                    <Col md={3}>
                        <div className="process-step text-center">
                            <div className="step-number">1</div>
                            <h4>Cotiza tu Tesis</h4>
                            <p>Llena el formulario con los detalles de tu proyecto</p>
                        </div>
                    </Col>
                    <Col md={3}>
                        <div className="process-step text-center">
                            <div className="step-number">2</div>
                            <h4>Realiza el Pago</h4>
                            <p>Elige tu método de pago preferido</p>
                        </div>
                    </Col>
                    <Col md={3}>
                        <div className="process-step text-center">
                            <div className="step-number">3</div>
                            <h4>Seguimiento</h4>
                            <p>Mantente en contacto con tu asesor asignado</p>
                        </div>
                    </Col>
                    <Col md={3}>
                        <div className="process-step text-center">
                            <div className="step-number">4</div>
                            <h4>Recibe tu Tesis</h4>
                            <p>Obtén tu trabajo listo para presentar</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default ProcessSection;
