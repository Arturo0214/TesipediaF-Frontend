import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spinner, Container, Button } from 'react-bootstrap';
import { usePaymentStatus } from '../../hooks/usepaymentStatus';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaInfoCircle, FaHome } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { clearPaymentState } from '../../features/payments/guestPaymentSlice';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const trackingToken = searchParams.get('tracking_token');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Usar el hook personalizado para manejar el estado del pago
    const { paymentStatus, loading, error, paymentDetails } = usePaymentStatus(trackingToken);

    // Función para formatear el monto en pesos mexicanos
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "$0.00";

        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Ir a la página de inicio
    const handleHome = () => {
        // Limpiar el estado de pago
        dispatch(clearPaymentState());
        navigate('/');
    };

    const renderPaymentDetails = () => {
        if (!paymentDetails) return null;

        return (
            <div className="payment-details">
                <h4>Detalles del Pago</h4>
                <div className="details-content">
                    {paymentDetails.amount !== undefined && (
                        <div className="detail-row">
                            <span className="detail-label">Monto:</span>
                            <span className="detail-value">{formatCurrency(paymentDetails.amount)}</span>
                        </div>
                    )}
                    {paymentDetails.createdAt && (
                        <div className="detail-row">
                            <span className="detail-label">Fecha:</span>
                            <span className="detail-value">{new Date(paymentDetails.createdAt).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderStatusContent = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" size="lg" className="spinner mb-3" />
                    <h4 className="mb-3">Verificando el estado de tu pago</h4>
                    <p className="text-muted">Esto puede tomar unos momentos...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="error-card">
                    <div className="d-flex align-items-center mb-3">
                        <FaTimesCircle size={24} className="me-2" />
                        <h4 className="mb-0">Error en la verificación</h4>
                    </div>
                    <p>{error}</p>
                    <div className="bg-light p-3 rounded mb-3">
                    </div>
                    <p className="text-muted small">
                        Si el problema persiste, por favor contacta a soporte.
                    </p>
                    <div className="button-group mt-4 d-flex justify-content-center">
                        <Button
                            variant="primary"
                            onClick={handleHome}
                            className="rounded-pill px-4"
                            type="button"
                        >
                            <FaHome className="me-2" />
                            Volver al inicio
                        </Button>
                    </div>
                </div>
            );
        }

        switch (paymentStatus) {
            case 'completed':
                return (
                    <div className="success-card">
                        <div className="text-center">
                            <div className="success-icon-wrapper">
                                <FaCheckCircle className="success-icon" />
                            </div>
                            <h3 className="mb-3">¡Pago Confirmado!</h3>
                        </div>

                        {renderPaymentDetails()}

                        <div className="confirmation-message">
                            <small className="text-muted">
                                Recibirás un correo de confirmación en breve con los detalles de tu transacción.
                            </small>
                        </div>

                        <div className="button-group mt-4 d-flex justify-content-center">
                            <Button
                                variant="primary"
                                onClick={handleHome}
                                className="rounded-pill px-4"
                                type="button"
                            >
                                <FaHome className="me-2" />
                                Volver al inicio
                            </Button>
                        </div>
                    </div>
                );
            case 'pending':
                return (
                    <div className="error-card">
                        <div className="d-flex align-items-center mb-3">
                            <FaExclamationTriangle size={24} className="me-2" />
                            <h4 className="mb-0">Pago Pendiente</h4>
                        </div>
                        <p>Estamos verificando tu pago. Este proceso puede tardar unos minutos.</p>
                        <div className="d-flex align-items-center mb-3">
                            <Spinner animation="border" size="sm" className="spinner me-2" />
                            <span>Procesando...</span>
                        </div>
                        {renderPaymentDetails()}
                        <div className="confirmation-message">
                            <small className="text-muted">
                                Si has completado el pago, por favor espera unos minutos mientras confirmamos la transacción.
                            </small>
                        </div>
                        <div className="button-group mt-4 d-flex justify-content-center">
                            <Button
                                variant="primary"
                                onClick={handleHome}
                                className="rounded-pill px-4"
                                type="button"
                            >
                                <FaHome className="me-2" />
                                Volver al inicio
                            </Button>
                        </div>
                    </div>
                );
            case 'failed':
                return (
                    <div className="error-card">
                        <div className="d-flex align-items-center mb-3">
                            <FaTimesCircle size={24} className="me-2" />
                            <h4 className="mb-0">Pago Fallido</h4>
                        </div>
                        <p>Lo sentimos, hubo un problema con tu pago.</p>
                        {renderPaymentDetails()}
                        <div className="mt-3 p-3 bg-light rounded">
                            <p className="mb-2">Por favor contacta a soporte.</p>
                        </div>
                        <div className="button-group mt-4 d-flex justify-content-center">
                            <Button
                                variant="primary"
                                onClick={handleHome}
                                className="rounded-pill px-4"
                                type="button"
                            >
                                <FaHome className="me-2" />
                                Volver al inicio
                            </Button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="error-card">
                        <div className="d-flex align-items-center mb-3">
                            <FaInfoCircle size={24} className="me-2" />
                            <h4 className="mb-0">Estado Desconocido</h4>
                        </div>
                        <p>No pudimos determinar el estado de tu pago.</p>
                        <div className="mt-3 p-3 bg-light rounded">
                            <p className="mb-2">Por favor, contacta a soporte.</p>
                        </div>
                        <div className="button-group mt-4 d-flex justify-content-center">
                            <Button
                                variant="primary"
                                onClick={handleHome}
                                className="rounded-pill px-4"
                                type="button"
                            >
                                <FaHome className="me-2" />
                                Volver al inicio
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Container fluid className="payment-success-container">
            {renderStatusContent()}
        </Container>
    );
};

export default PaymentSuccess;