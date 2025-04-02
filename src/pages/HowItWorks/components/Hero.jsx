import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function Hero({ showSteps, onToggleSteps }) {
    return (
        <section className="how-it-works-hero">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={8} className="text-center">
                        <h1 className="how-it-works-title">¿Cómo Funciona?</h1>
                        <p className="how-it-works-subtitle">
                            Te guiamos paso a paso en el proceso de obtener tu tesis profesional
                        </p>
                        <Button
                            className={`how-it-works-button ${showSteps ? 'active' : ''}`}
                            onClick={onToggleSteps}
                        >
                            {showSteps ? (
                                <>
                                    Ocultar Proceso <FaChevronUp className="ms-2" />
                                </>
                            ) : (
                                <>
                                    Ver Proceso <FaChevronDown className="ms-2" />
                                </>
                            )}
                        </Button>
                    </Col>
                </Row>
            </Container>
        </section>
    );
}

export default Hero; 