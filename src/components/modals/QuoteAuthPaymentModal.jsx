import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { FaCreditCard, FaFileAlt, FaLock, FaCheckCircle, FaClock, FaGraduationCap, FaBook, FaCalendarAlt } from 'react-icons/fa';
import './QuoteAuthPaymentModal.css';

const QuoteAuthPaymentModal = ({ show, onHide, quoteData, onProceedToPayment }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            className="quote-auth-modal"
        >
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="w-100 text-center">
                    <div className="modal-title-icon">
                        <FaCreditCard />
                    </div>
                    <h4>Resumen de tu Cotización</h4>
                    <p className="text-muted mb-0">Revisa los detalles antes de proceder con el pago</p>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row>
                    {/* Columna izquierda: Detalles del proyecto */}
                    <Col md={7} className="border-end">
                        <div className="section-title">
                            <FaFileAlt className="section-icon" />
                            <h5>Detalles del Proyecto</h5>
                        </div>
                        <div className="quote-details">
                            <div className="detail-row">
                                <div className="detail-icon">
                                    <FaBook />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Tipo de Trabajo</span>
                                    <span className="detail-value">{quoteData?.taskType}</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-icon">
                                    <FaGraduationCap />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Área de Estudio</span>
                                    <span className="detail-value">{quoteData?.studyArea}</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-icon">
                                    <FaCheckCircle />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Carrera</span>
                                    <span className="detail-value">{quoteData?.career}</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-icon">
                                    <FaGraduationCap />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Nivel Académico</span>
                                    <span className="detail-value">{quoteData?.educationLevel}</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-icon">
                                    <FaBook />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Número de Páginas</span>
                                    <span className="detail-value">{quoteData?.pages}</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-icon">
                                    <FaCalendarAlt />
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">Fecha de Entrega</span>
                                    <span className="detail-value">
                                        {new Date(quoteData?.dueDate).toLocaleDateString('es-MX')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Columna derecha: Resumen de pago */}
                    <Col md={5}>
                        <div className="section-title">
                            <FaCreditCard className="section-icon" />
                            <h5>Resumen de Pago</h5>
                        </div>
                        <div className="price-details">
                            <div className="price-row">
                                <span className="price-label">Precio Base</span>
                                <span className="price-value">
                                    {formatPrice(quoteData?.priceDetails?.basePrice || 0)}
                                </span>
                            </div>
                            {quoteData?.priceDetails?.urgencyCharge > 0 && (
                                <div className="price-row urgency">
                                    <div className="price-label-group">
                                        <FaClock className="price-icon" />
                                        <span>Cargo por Urgencia</span>
                                    </div>
                                    <span className="price-value highlight">
                                        +{formatPrice(quoteData?.priceDetails?.urgencyCharge || 0)}
                                    </span>
                                </div>
                            )}
                            {quoteData?.priceDetails?.cashDiscount > 0 && (
                                <div className="price-row discount">
                                    <div className="price-label-group">
                                        <FaCheckCircle className="price-icon" />
                                        <span>Descuento Aplicado</span>
                                    </div>
                                    <span className="price-value discount">
                                        -{formatPrice(quoteData?.priceDetails?.cashDiscount || 0)}
                                    </span>
                                </div>
                            )}
                            <div className="price-row total">
                                <span className="price-label">Precio Final</span>
                                <span className="price-value">
                                    {formatPrice(quoteData?.priceDetails?.finalPrice || 0)}
                                </span>
                            </div>
                        </div>

                        <div className="payment-action">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={onProceedToPayment}
                                className="payment-button"
                            >
                                <FaCreditCard className="me-2" />
                                Proceder al Pago
                            </Button>
                            <div className="payment-security">
                                <FaLock className="security-icon" />
                                <span>Pago seguro y encriptado</span>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default QuoteAuthPaymentModal; 