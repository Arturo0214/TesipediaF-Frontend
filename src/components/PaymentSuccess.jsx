import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spinner, Alert, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { checkGuestPaymentStatus } from '../../store/slices/paymentSlice';
import * as paymentService from '../../services/paymentService';

// Selectores memoizados
const selectPaymentStatus = state => state.payment?.paymentStatus;
const selectLoading = state => state.payment?.loading;
const selectError = state => state.payment?.error;

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const trackingToken = searchParams.get('tracking_token');
    const dispatch = useDispatch();

    // Usar selectores memoizados
    const paymentStatus = useSelector(selectPaymentStatus);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const [localError, setLocalError] = useState(null);
    const [localPaymentStatus, setLocalPaymentStatus] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 5;
    const RETRY_INTERVAL = 3000; // 3 segundos

    // Memoizar la función de verificación para evitar recreaciones innecesarias
    const verifyPaymentStatus = useMemo(() => async () => {
        if (!trackingToken) {
            setLocalError('Token de seguimiento no encontrado');
            return;
        }

        try {
            console.log("🔍 Verificando estado del pago...");

            // Intentar primero con el servicio directo
            try {
                const response = await paymentService.checkGuestPaymentStatus(trackingToken);
                console.log("✅ Respuesta del servicio:", response);

                // Actualizar el estado local con la respuesta del servicio
                if (response && response.status) {
                    console.log("📊 Estado del pago:", response.status);
                    setLocalPaymentStatus(response.status);

                    // Si el pago está pendiente y no hemos alcanzado el máximo de reintentos, programar otro intento
                    if (response.status === 'pending' && retryCount < MAX_RETRIES) {
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                        }, RETRY_INTERVAL);
                    }
                }

                return;
            } catch (serviceError) {
                console.error("❌ Error con el servicio directo:", serviceError);
            }

            // Si falla, intentar con Redux
            console.log("🔄 Intentando con Redux...");
            const result = await dispatch(checkGuestPaymentStatus(trackingToken)).unwrap();
            console.log("✅ Resultado de Redux:", result);

            // Si el pago está pendiente y no hemos alcanzado el máximo de reintentos, programar otro intento
            if (result && result.status === 'pending' && retryCount < MAX_RETRIES) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                }, RETRY_INTERVAL);
            }
        } catch (err) {
            console.error("❌ Error al verificar el estado del pago:", err);
            setLocalError('No se pudo verificar el estado del pago');
        }
    }, [trackingToken, dispatch, retryCount]);

    // Efecto para verificar el estado del pago
    useEffect(() => {
        verifyPaymentStatus();
    }, [verifyPaymentStatus, retryCount]);

    // Usar el estado local si el estado de Redux no está disponible
    const currentPaymentStatus = paymentStatus || localPaymentStatus;
    console.log("🔍 Estado actual del pago:", currentPaymentStatus);

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" />
                <p>Verificando el estado de tu pago...</p>
            </Container>
        );
    }

    if (error || localError) {
        return (
            <Container className="text-center my-5">
                <Alert variant="danger">
                    <h4>❌ Error</h4>
                    <p>{error || localError}</p>
                    <p>Token: {trackingToken}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="text-center my-5">
            {currentPaymentStatus === 'completed' ? (
                <Alert variant="success">
                    <h4>✅ ¡Pago Confirmado!</h4>
                    <p>Gracias por tu pago. Hemos registrado tu cotización correctamente.</p>
                </Alert>
            ) : currentPaymentStatus === 'pending' ? (
                <Alert variant="warning">
                    <h4>⏳ Pago Pendiente</h4>
                    <p>Tu pago todavía se está procesando. Recibirás una confirmación por correo.</p>
                    <p>Intentos de verificación: {retryCount}/{MAX_RETRIES}</p>
                </Alert>
            ) : currentPaymentStatus === 'failed' ? (
                <Alert variant="danger">
                    <h4>❌ Pago Fallido</h4>
                    <p>Tu pago no pudo completarse. Intenta nuevamente o contacta a soporte.</p>
                </Alert>
            ) : (
                <Alert variant="info">
                    <h4>ℹ️ Estado Desconocido</h4>
                    <p>El estado de tu pago es: {currentPaymentStatus || 'No disponible'}</p>
                    <p>Por favor, contacta a soporte si tienes alguna pregunta.</p>
                </Alert>
            )}
        </Container>
    );
};

export default PaymentSuccess; 