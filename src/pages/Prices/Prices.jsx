import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
    FaGraduationCap, FaFileAlt, FaCheck, FaSearchPlus, FaPencilAlt,
    FaCreditCard, FaPaypal, FaUniversity, FaHandHoldingUsd, FaUserGraduate, FaLock
} from 'react-icons/fa';
import './Prices.css';

function Prices() {
    const caracteristicasComunes = [
        { icon: <FaCheck />, text: "1 corrección de fondo" },
        { icon: <FaPencilAlt />, text: "1 corrección de estilo" },
        { icon: <FaSearchPlus />, text: "1 escáner anti-plagio" },
        { icon: <FaSearchPlus />, text: "1 escáner anti-IA" },
        { icon: <FaUserGraduate />, text: "Acompañamiento hasta titulación" }
    ];

    return (
        <Container className="py-3">
            <div className="text-center mb-4">
                <h2 className="fw-bold">Precios y Planes</h2>
                <p className="text-muted">Inversión en tu futuro académico</p>
            </div>

            <Row className="justify-content-center mb-4">
                <Col md={6} lg={4} className="mb-3">
                    <Card className="price-card h-100 border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="text-center mb-3">
                                <FaGraduationCap className="price-icon mb-2" />
                                <h3 className="fw-bold">Doctorado</h3>
                                <div className="price-amount">
                                    <div className="base-price">Base desde $220-$240</div>
                                    <div className="per-page">+$40/página</div>
                                </div>
                            </div>
                            <ul className="price-features">
                                {caracteristicasComunes.map((item, index) => (
                                    <li key={index}>
                                        <span className="text-success me-2">{item.icon}</span>
                                        {item.text}
                                    </li>
                                ))}
                                <li><FaCheck className="text-success me-2" />Investigación doctoral</li>
                                <li><FaCheck className="text-success me-2" />Análisis avanzado</li>
                            </ul>
                            <Button as={Link} to="/cotizar" variant="outline-primary" className="w-100 mt-3">
                                Cotizar Ahora
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={4} className="mb-3">
                    <Card className="price-card h-100 border-0 shadow featured">
                        <div className="featured-badge">Más Solicitado</div>
                        <Card.Body className="p-4">
                            <div className="text-center mb-3">
                                <FaFileAlt className="price-icon mb-2" />
                                <h3 className="fw-bold">Licenciatura</h3>
                                <div className="price-amount">
                                    <div className="base-price">Base desde $220-$240</div>
                                    <div className="per-page">Sin costo adicional por página</div>
                                </div>
                            </div>
                            <ul className="price-features">
                                {caracteristicasComunes.map((item, index) => (
                                    <li key={index}>
                                        <span className="text-success me-2">{item.icon}</span>
                                        {item.text}
                                    </li>
                                ))}
                                <li><FaCheck className="text-success me-2" />Metodología estándar</li>
                                <li><FaCheck className="text-success me-2" />Asesoría incluida</li>
                            </ul>
                            <Button as={Link} to="/cotizar" variant="primary" className="w-100 mt-3">
                                Cotizar Ahora
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={4} className="mb-3">
                    <Card className="price-card h-100 border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="text-center mb-3">
                                <FaGraduationCap className="price-icon mb-2" />
                                <h3 className="fw-bold">Maestría</h3>
                                <div className="price-amount">
                                    <div className="base-price">Base desde $220-$240</div>
                                    <div className="per-page">+$20/página</div>
                                </div>
                            </div>
                            <ul className="price-features">
                                {caracteristicasComunes.map((item, index) => (
                                    <li key={index}>
                                        <span className="text-success me-2">{item.icon}</span>
                                        {item.text}
                                    </li>
                                ))}
                                <li><FaCheck className="text-success me-2" />Investigación especializada</li>
                                <li><FaCheck className="text-success me-2" />Asesoría personalizada</li>
                            </ul>
                            <Button as={Link} to="/cotizar" variant="outline-primary" className="w-100 mt-3">
                                Cotizar Ahora
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4 g-3">
                <Col lg={8}>
                    <div className="pricing-details bg-white p-4 rounded-3 shadow-sm border">
                        <div className="section-header d-flex align-items-center mb-4">
                            <div className="section-icon-wrapper me-3">
                                <FaFileAlt className="section-icon" />
                            </div>
                            <div>
                                <h4 className="mb-1">Detalles de Precios por Área</h4>
                                <p className="text-muted mb-0 small">Precios según área de conocimiento UNAM</p>
                            </div>
                        </div>

                        <div className="price-cards-container mb-4">
                            <Row className="g-3">
                                <Col md={6}>
                                    <div className="area-price-card">
                                        <div className="area-header">
                                            <span className="area-badge">Áreas 1 y 2</span>
                                            <h5 className="price-value">$240</h5>
                                            <p className="text-muted mb-0">Precio Base</p>
                                        </div>
                                        <div className="area-details">
                                            <div className="area-description mb-2">
                                                <small className="text-muted">
                                                    • Ciencias Físico-Matemáticas e Ingenierías<br />
                                                    • Ciencias Biológicas, Químicas y de la Salud
                                                </small>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Licenciatura</span>
                                                <span className="detail-value">Sin cargo adicional</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Maestría</span>
                                                <span className="detail-value">+$20 por página</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Doctorado</span>
                                                <span className="detail-value">+$40 por página</span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="area-price-card">
                                        <div className="area-header">
                                            <span className="area-badge">Áreas 3 y 4</span>
                                            <h5 className="price-value">$220</h5>
                                            <p className="text-muted mb-0">Precio Base</p>
                                        </div>
                                        <div className="area-details">
                                            <div className="area-description mb-2">
                                                <small className="text-muted">
                                                    • Ciencias Sociales<br />
                                                    • Humanidades y Artes
                                                </small>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Licenciatura</span>
                                                <span className="detail-value">Sin cargo adicional</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Maestría</span>
                                                <span className="detail-value">+$20 por página</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Doctorado</span>
                                                <span className="detail-value">+$40 por página</span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>

                <Col lg={4}>
                    <div className="payment-section bg-white p-4 rounded-3 shadow-sm border h-100">
                        <div className="section-header d-flex align-items-center mb-4">
                            <div className="section-icon-wrapper me-3">
                                <FaHandHoldingUsd className="section-icon" />
                            </div>
                            <div>
                                <h4 className="mb-1">Métodos de Pago</h4>
                                <p className="text-muted mb-0 small">Opciones flexibles y seguras</p>
                            </div>
                        </div>

                        <div className="payment-methods-container">
                            <div className="payment-method-card">
                                <FaCreditCard className="payment-icon" />
                                <div className="payment-info">
                                    <h6 className="mb-1">Tarjetas</h6>
                                    <p className="small mb-0">Crédito y Débito</p>
                                </div>
                            </div>

                            <div className="payment-method-card">
                                <FaPaypal className="payment-icon" />
                                <div className="payment-info">
                                    <h6 className="mb-1">PayPal</h6>
                                    <p className="small mb-0">Pago seguro online</p>
                                </div>
                            </div>

                            <div className="payment-method-card">
                                <FaUniversity className="payment-icon" />
                                <div className="payment-info">
                                    <h6 className="mb-1">Transferencia</h6>
                                    <p className="small mb-0">Bancaria directa</p>
                                </div>
                            </div>

                            <div className="payment-method-card">
                                <FaHandHoldingUsd className="payment-icon" />
                                <div className="payment-info">
                                    <h6 className="mb-1">Sin Tarjeta</h6>
                                    <p className="small mb-0">Retiro en efectivo</p>
                                </div>
                            </div>
                        </div>

                        <div className="payment-security mt-4 pt-3 border-top">
                            <p className="small text-center text-muted mb-0">
                                <FaLock className="me-1" /> Pagos seguros y verificados
                            </p>
                        </div>
                    </div>
                </Col>
            </Row>

            <div className="support-banner mt-4 bg-primary text-white p-4 rounded-3">
                <Row className="align-items-center">
                    <Col md={2} className="text-center">
                        <FaUserGraduate className="support-icon" />
                    </Col>
                    <Col md={10}>
                        <h4 className="mb-2">Acompañamiento Garantizado hasta tu Titulación</h4>
                        <p className="mb-0">Nuestro compromiso es tu éxito académico. Te acompañamos en cada paso del proceso hasta lograr tu objetivo.</p>
                    </Col>
                </Row>
            </div>
        </Container>
    );
}

export default Prices; 