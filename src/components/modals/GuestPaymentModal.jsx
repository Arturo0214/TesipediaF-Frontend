import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserSecret, FaCreditCard, FaExclamationCircle, FaShieldAlt, FaFileAlt } from 'react-icons/fa';
import { processGuestPayment, clearPaymentState } from '../../features/payments/guestPaymentSlice';
import './GuestPaymentModal.css';

// Selectores memoizados
const selectSessionUrl = state => state.payment?.sessionUrl;
const selectLoading = state => state.payment?.loading;
const selectError = state => state.payment?.error;

const GuestPaymentModal = ({ show, onHide, quoteData }) => {
    const dispatch = useDispatch();
    const sessionUrl = useSelector(selectSessionUrl);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const [guestInfo, setGuestInfo] = useState({
        nombres: '',
        apellidos: '',
        correo: '',
        confirmaCorreo: '',
    });
    const [validationError, setValidationError] = useState(null);
    const [stripeUrl, setStripeUrl] = useState(null);

    // Función para formatear el precio para mostrar
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX').format(price);
    };

    useEffect(() => {
        return () => {
            dispatch(clearPaymentState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (sessionUrl && sessionUrl.startsWith('https://checkout.stripe.com/')) {
            window.open(sessionUrl, '_blank');
            onHide(); // Cierra el modal después de abrir la nueva pestaña
        }
    }, [sessionUrl, onHide]);

    const handleGuestInfoChange = (e) => {
        const { name, value } = e.target;
        setGuestInfo(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const { nombres, apellidos, correo, confirmaCorreo } = guestInfo;
        if (!nombres.trim() || nombres.trim().length < 2) return "El nombre debe tener al menos 2 caracteres.";
        if (!apellidos.trim() || apellidos.trim().length < 2) return "El apellido debe tener al menos 2 caracteres.";
        if (!correo.trim() || !correo.includes('@')) return "El correo electrónico no es válido.";
        if (correo !== confirmaCorreo) return "Los correos electrónicos no coinciden.";
        return null;
    };

    const handleGuestPayment = async () => {
        const quoteId = quoteData?._id || quoteData?.id;
        if (!quoteId) {
            alert("No se puede procesar el pago sin un ID de cotización válido.");
            return;
        }

        const validationMsg = validateForm();
        if (validationMsg) {
            setValidationError(validationMsg);
            return;
        }

        setValidationError(null);

        // Obtener el monto de la cotización sin manipulación
        const amount = quoteData?.estimatedPrice || quoteData?.price || 5000;

        const { nombres, apellidos, correo } = guestInfo;
        const paymentData = {
            quoteId,
            amount,
            nombres,
            apellidos,
            correo,
            confirmaCorreo: correo,
            description: `Pago por cotización: ${quoteData?.taskTitle || quoteData?.title || 'Cotización personalizada'}`,
            metadata: {
                quoteTitle: quoteData?.taskTitle || quoteData?.title || 'Cotización personalizada',
                quoteDescription: quoteData?.requirements?.text || quoteData?.description || 'Solicitud personalizada'
            }
        };

        try {
            const result = await dispatch(processGuestPayment(paymentData)).unwrap();

            // Solución directa y robusta para la redirección
            const stripeUrl = result.url || result.sessionUrl;
            setStripeUrl(stripeUrl); // Guardar la URL en el estado

            if (stripeUrl && stripeUrl.startsWith('https://checkout.stripe.com/')) {
                // Intentar múltiples métodos de redirección
                try {
                    // Método 1: window.open
                    const newWindow = window.open(stripeUrl, '_blank');

                    // Si window.open falla (devuelve null), intentar otro método
                    if (!newWindow) {
                        window.location.href = stripeUrl;
                    }

                    // Cerrar el modal después de intentar la redirección
                    onHide();
                } catch (redirectError) {
                    if (import.meta.env.MODE !== 'production') {
                        console.error("Error al redirigir:", redirectError);
                    }

                    // Método de respaldo: mostrar un botón para que el usuario haga clic
                    setValidationError(
                        <div>
                            <p>No se pudo redirigir automáticamente. Por favor, haga clic en el siguiente enlace:</p>
                            <Button variant="primary" onClick={handleManualRedirect}>
                                Ir a la página de pago
                            </Button>
                        </div>
                    );
                }
            } else {
                setValidationError("Error: URL de pago inválida");
            }
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {
                console.error("Error en el pago:", error);
            }
            setValidationError(error.message || "Ocurrió un error al procesar el pago.");
        }
    };

    const isFormIncomplete = () => {
        const { nombres, apellidos, correo, confirmaCorreo } = guestInfo;
        return !nombres || !apellidos || !correo || !confirmaCorreo || correo !== confirmaCorreo;
    };

    // Función para manejar la redirección manual
    const handleManualRedirect = () => {
        if (stripeUrl && stripeUrl.startsWith('https://checkout.stripe.com/')) {
            window.open(stripeUrl, '_blank');
            onHide();
        } else {
            setValidationError("URL de pago inválida");
        }
    };

    // Obtener el precio para mostrar (en MXN, no en centavos)
    const displayPrice = quoteData?.estimatedPrice || quoteData?.price || 5000;

    return (
        <Modal show={show} onHide={onHide} centered className="guest-payment-modal" size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaUserSecret /> Pago como Invitado
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {(error || validationError) && (
                    <Alert variant="danger" className="mb-3">
                        <FaExclamationCircle className="me-2" />
                        {typeof validationError === 'string' ? validationError : null}
                    </Alert>
                )}

                {typeof validationError !== 'string' && validationError && (
                    <div className="mb-3">
                        {validationError}
                    </div>
                )}

                {loading ? (
                    <div className="text-center my-5">
                        <Spinner animation="border" role="status" className="mb-3" />
                        <h5>Procesando, por favor espera...</h5>
                    </div>
                ) : (
                    <div className="guest-payment-container">
                        <div className="payment-intro-text">
                            <FaShieldAlt style={{ color: '#3498db', fontSize: '1.5rem' }} />
                            <p>Ingresa tus datos para continuar con el pago de forma segura</p>
                        </div>

                        <div className="quote-summary">
                            <h5><FaFileAlt /> Resumen de la Cotización</h5>
                            <p><strong>Título:</strong> {quoteData?.taskTitle || quoteData?.title || 'Cotización personalizada'}</p>
                            <p><strong>Área de estudio:</strong> {quoteData?.studyArea || 'No especificada'}</p>
                            <p><strong>Nivel académico:</strong> {quoteData?.educationLevel || 'No especificado'}</p>
                            <p><strong>Precio estimado:</strong> ${formatPrice(displayPrice)}</p>
                        </div>

                        <Form className="guest-info-form">
                            <Form.Group className="mb-3">
                                <Form.Label>Nombres</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nombres"
                                    placeholder="Nombre(s)"
                                    value={guestInfo.nombres}
                                    onChange={handleGuestInfoChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Apellidos</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="apellidos"
                                    placeholder="Apellidos"
                                    value={guestInfo.apellidos}
                                    onChange={handleGuestInfoChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Correo electrónico</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="correo"
                                    placeholder="Correo electrónico"
                                    value={guestInfo.correo}
                                    onChange={handleGuestInfoChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Confirmar correo electrónico</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="confirmaCorreo"
                                    placeholder="Confirma tu correo electrónico"
                                    value={guestInfo.confirmaCorreo}
                                    onChange={handleGuestInfoChange}
                                    required
                                />
                            </Form.Group>
                        </Form>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={handleGuestPayment}
                    disabled={loading || isFormIncomplete()}
                >
                    <FaCreditCard /> Proceder al Pago
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GuestPaymentModal;

