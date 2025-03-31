import { Container, Row, Col } from 'react-bootstrap';
import { FaShieldAlt, FaAward, FaClock } from 'react-icons/fa';
import './GuaranteeSection.css';

const GuaranteeSection = () => {
    return (
        <section className="guarantee-section py-5">
            <Container>
                <h2 className="text-center mb-5">¿Por qué Elegirnos?</h2>
                <Row className="g-4">
                    <Col md={4}>
                        <div className="guarantee-item text-center">
                            <FaShieldAlt className="guarantee-icon mb-3" />
                            <h4>100% Confidencial</h4>
                            <p>Tu información personal está protegida</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="guarantee-item text-center">
                            <FaAward className="guarantee-icon mb-3" />
                            <h4>Garantía de Calidad</h4>
                            <p>Aseguramos la aprobación de tu tesis</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="guarantee-item text-center">
                            <FaClock className="guarantee-icon mb-3" />
                            <h4>Entregas a Tiempo</h4>
                            <p>Cumplimos con los plazos establecidos</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default GuaranteeSection;
