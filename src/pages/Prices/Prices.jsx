import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
    FaGraduationCap, FaFileAlt, FaCheck, FaSearchPlus, FaPencilAlt,
    FaCreditCard, FaPaypal, FaUniversity, FaHandHoldingUsd, FaUserGraduate, FaLock, FaPercent, FaQrcode, FaInfoCircle, FaMoneyBillWave, FaArrowRight, FaClock, FaStar, FaBolt, FaShieldAlt
} from 'react-icons/fa';
import './Prices.css';
import visaLogo from '../../assets/images/visa-svgrepo-com.svg';
import mastercardLogo from '../../assets/images/mc_symbol.svg';
import amexLogo from '../../assets/images/amex-svgrepo-com.svg';
import paypalLogo from '../../assets/images/paypal-svgrepo-com.svg';
import bankTransferLogo from '../../assets/images/bank-transfer.png';
import qrCodeLogo from '../../assets/images/qr-code.png';
import { useEffect, useRef } from 'react';

function Prices() {
    const caracteristicasComunes = [
        { icon: <FaCheck />, text: "1 corrección de fondo" },
        { icon: <FaPencilAlt />, text: "1 corrección de estilo" },
        { icon: <FaSearchPlus />, text: "1 escáner anti-plagio" },
        { icon: <FaSearchPlus />, text: "1 escáner anti-IA" },
        { icon: <FaUserGraduate />, text: "Acompañamiento hasta tu titulación" }
    ];

    const ctaSectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.2 } // Se activará cuando el 20% de la sección sea visible
        );

        if (ctaSectionRef.current) {
            observer.observe(ctaSectionRef.current);
        }

        return () => {
            if (ctaSectionRef.current) {
                observer.unobserve(ctaSectionRef.current);
            }
        };
    }, []);

    return (
        <Container className="py-3">
            <div className="text-center mb-4">
                <h2 className="prices-title">
                    <span className="prices-title-decoration">
                        Precios y Planes
                    </span>
                </h2>
                <div className="prices-subtitle">Inversión en tu futuro académico</div>
            </div>

            <Row className="justify-content-center mb-4">
                <Col md={6} lg={4} className="mb-3">
                    <Card className="price-card h-100 border-0 shadow-sm hover-featured">
                        <Card.Body className="p-4">
                            <div className="text-center mb-3">
                                <FaGraduationCap className="price-icon mb-2" />
                                <h3 className="fw-bold">Maestría</h3>
                                <div className="price-amount">
                                    <div className="base-price">Base desde $380-$420</div>
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
                                <li><FaCheck className="text-success me-2" />Investigación especializada</li>
                                <li><FaCheck className="text-success me-2" />Asesoría personalizada</li>
                            </ul>
                            <Button as={Link} to="/cotizar" variant="outline-primary" className="w-100 mt-3 hover-primary">
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
                                    <div className="base-price">Base desde $280-$320</div>
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
                    <Card className="price-card h-100 border-0 shadow-sm hover-featured">
                        <Card.Body className="p-4">
                            <div className="text-center mb-3">
                                <FaGraduationCap className="price-icon mb-2" />
                                <h3 className="fw-bold">Doctorado</h3>
                                <div className="price-amount">
                                    <div className="base-price">Base desde $480-$520</div>
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
                                <li><FaCheck className="text-success me-2" />Investigación doctoral</li>
                                <li><FaCheck className="text-success me-2" />Análisis avanzado</li>
                            </ul>
                            <Button as={Link} to="/cotizar" variant="outline-primary" className="w-100 mt-3 hover-primary">
                                Cotizar Ahora
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4 g-3">
                <Col lg={8}>
                    <div className="pricing-details bg-white p-4 rounded-3 shadow-sm border h-100">
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
                                            <h5 className="price-value">$320</h5>
                                            <p className="text-muted mb-0">Precio Base</p>
                                        </div>
                                        <div className="area-details">
                                            <div className="area-description mb-2">
                                                <small className="text-muted">
                                                    <strong>Área 1:</strong> Ciencias Físico-Matemáticas e Ingenierías<br />
                                                    <strong>Área 2:</strong> Ciencias Biológicas, Químicas y de la Salud
                                                </small>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Licenciatura</span>
                                                <span className="detail-value">$320 base</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Maestría</span>
                                                <span className="detail-value">$420 base</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Doctorado</span>
                                                <span className="detail-value">$520 base</span>
                                            </div>
                                            <div className="detail-note mt-2">
                                                <small className="text-muted">
                                                    * Precios finales sin cargos adicionales por página
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="area-price-card">
                                        <div className="area-header">
                                            <span className="area-badge">Áreas 3 y 4</span>
                                            <h5 className="price-value">$280</h5>
                                            <p className="text-muted mb-0">Precio Base</p>
                                        </div>
                                        <div className="area-details">
                                            <div className="area-description mb-2">
                                                <small className="text-muted">
                                                    <strong>Área 3:</strong> Ciencias Sociales<br />
                                                    <strong>Área 4:</strong> Humanidades y Artes
                                                </small>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Licenciatura</span>
                                                <span className="detail-value">$280 base</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Maestría</span>
                                                <span className="detail-value">$380 base</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Doctorado</span>
                                                <span className="detail-value">$480 base</span>
                                            </div>
                                            <div className="detail-note mt-2">
                                                <small className="text-muted">
                                                    * Precios finales sin cargos adicionales por página
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        <div className="discount-section mt-4">
                            <div className="discount-container animate-fade-in">
                                <div className="discount-banner">
                                    <div className="discount-offer">
                                        <div className="offer-text">
                                            <span className="save-text">AHORRA</span>
                                            <div className="percentage-container">
                                                <span className="percentage">10</span>
                                                <div className="percentage-symbols">
                                                    <span className="percentage-symbol">%</span>
                                                    <span className="off-text">OFF</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="discount-description">
                                        <h4>Descuento Especial en Pagos Directos</h4>
                                        <p>Obtén un descuento inmediato al usar estos métodos de pago</p>
                                    </div>
                                </div>

                                <div className="payment-methods-container">
                                    <div className="payment-method">
                                        <div className="method-icon-wrapper">
                                            <FaUniversity className="method-icon" />
                                        </div>
                                        <div className="method-details">
                                            <h5>Transferencia Bancaria</h5>
                                            <p>Transferencia SPEI o depósito directo</p>
                                            <span className="savings-tag">¡Ahorra desde $2,240!</span>
                                        </div>
                                    </div>

                                    <div className="payment-method">
                                        <div className="method-icon-wrapper">
                                            <FaQrcode className="method-icon" />
                                        </div>
                                        <div className="method-details">
                                            <h5>Retiro sin Tarjeta</h5>
                                            <p>Pago con código QR o referencia</p>
                                            <span className="savings-tag">¡Ahorra desde $2,240!</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="discount-footer">
                                    <FaInfoCircle className="info-icon" />
                                    <p>El descuento se aplica automáticamente al seleccionar estos métodos de pago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col lg={4}>
                    <div className="payment-methods-section h-100">
                        <div className="section-header mb-4">
                            <h4 className="payment-title">
                                <FaMoneyBillWave className="section-icon me-2" />
                                Métodos de Pago
                            </h4>
                            <p className="text-muted mb-0">Opciones flexibles y seguras</p>
                        </div>

                        <div className="payment-methods-list">
                            <div className="payment-card">
                                <div className="payment-card-header">
                                    <h5>Tarjetas de Crédito y Débito</h5>
                                    <p>Pago seguro con tarjetas principales</p>
                                </div>
                                <div className="payment-card-logos">
                                    <img src={visaLogo} alt="Visa" className="card-logo" />
                                    <img src={mastercardLogo} alt="Mastercard" className="card-logo" />
                                    <img src={amexLogo} alt="American Express" className="card-logo" />
                                </div>
                            </div>

                            <div className="payment-card">
                                <div className="payment-card-header">
                                    <h5>PayPal</h5>
                                    <p>Pago seguro online</p>
                                </div>
                                <div className="payment-card-logos single-logo">
                                    <img src={paypalLogo} alt="PayPal" className="payment-logo" />
                                </div>
                            </div>

                            <div className="payment-card discount-card">
                                <div className="discount-tag">10% OFF</div>
                                <div className="payment-card-header">
                                    <h5>Transferencia Bancaria</h5>
                                    <p>Transferencia SPEI o depósito directo</p>
                                </div>
                                <div className="payment-card-logos single-logo">
                                    <img src={bankTransferLogo} alt="Transferencia" className="payment-logo" />
                                </div>
                            </div>

                            <div className="payment-card discount-card">
                                <div className="discount-tag">10% OFF</div>
                                <div className="payment-card-header">
                                    <h5>Retiro sin Tarjeta</h5>
                                    <p>Pago con código QR o referencia</p>
                                </div>
                                <div className="payment-card-logos single-logo">
                                    <img src={qrCodeLogo} alt="Retiro sin Tarjeta" className="payment-logo" />
                                </div>
                            </div>
                        </div>

                        <div className="payment-security">
                            <FaLock className="security-icon" />
                            <span>Pagos seguros y verificados</span>
                        </div>
                    </div>
                </Col>
            </Row>

            <div className="cta-section my-4" ref={ctaSectionRef}>
                <Row className="justify-content-center align-items-center">
                    <Col lg={10}>
                        <div className="cta-container animate-slide-up">
                            <Row className="align-items-center">
                                <Col md={7}>
                                    <div className="cta-content">
                                        <span className="success-tag animate-bounce">
                                            <FaStar className="star-icon" />
                                            Más de 1,500 tesis exitosas
                                        </span>
                                        <h2 className="cta-title animate-fade-in">¿Listo para Iniciar tu Tesis?</h2>
                                        <div className="trust-indicators animate-slide-right">
                                            <div className="trust-item">
                                                <FaBolt className="trust-icon speed" />
                                                <span>Respuesta Inmediata</span>
                                            </div>
                                            <div className="trust-item">
                                                <FaShieldAlt className="trust-icon security" />
                                                <span>100% Confidencial</span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={5} className="">
                                    <div className="text-center">
                                        <Button
                                            as={Link}
                                            to="/cotizar"
                                            className="quote-cta-button quote-cta-pulse"
                                        >
                                            Solicitar Cotización
                                        </Button>
                                        <span className="response-time animate-fade-in">Cotización en menos de 5 minutos</span>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>

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