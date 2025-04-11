import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { FaTimesCircle, FaHome } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { clearPaymentState, setPaymentStatus } from '../../features/payments/guestPaymentSlice';
import './PaymentCancel.css';

const PaymentCancel = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    // Obtener parámetros de consulta (si existen)
    const sessionId = searchParams.get('session_id');
    const trackingToken = searchParams.get('tracking_token');

    // Seleccionar datos del estado de Redux
    const { currentPayment, paymentStatus } = useSelector((state) => state.payments);

    // Actualizar el estado del pago al cargar el componente
    useEffect(() => {
        // Registrar la cancelación en el estado de Redux
        dispatch(setPaymentStatus('cancelled'));

        // Limpiar el estado de pago al desmontar
        return () => {
            // Solo limpiar si navegamos fuera de las páginas de pago
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/payment')) {
                dispatch(clearPaymentState());
            }
        };
    }, [dispatch]);

    // Ir a la página de inicio
    const handleHome = () => {
        console.log("Botón Volver al inicio clickeado");
        // Limpiar el estado de pago
        dispatch(clearPaymentState());
        navigate('/');
    };

    // Obtener mensaje de estado
    const getStatusMessage = () => {
        if (paymentStatus === 'cancelled') {
            return 'Has cancelado el proceso de pago.';
        }
        return 'El proceso de pago no se ha completado.';
    };

    return (
        <Container fluid className="payment-cancel-container">
            <div className="cancel-card">
                <div className="text-center">
                    <div className="cancel-icon-wrapper">
                        <FaTimesCircle className="cancel-icon" />
                    </div>
                    <h3 className="mb-3">Pago Cancelado</h3>
                    <p className="lead mb-4">{getStatusMessage()}</p>
                </div>

                <div className="payment-details">
                    <p className="text-muted">
                        {trackingToken ? (
                            <>Token de seguimiento: <span className="fw-bold">{trackingToken}</span></>
                        ) : sessionId ? (
                            <>ID de sesión: <span className="fw-bold">{sessionId}</span></>
                        ) : (
                            'No se ha proporcionado un identificador de pago.'
                        )}
                    </p>
                </div>

                <div className="confirmation-message">
                    <small className="text-muted">
                        Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
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
        </Container>
    );
};

export default PaymentCancel; 