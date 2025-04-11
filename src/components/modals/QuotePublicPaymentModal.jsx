import React, { useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaSignInAlt, FaUserPlus, FaUserSecret, FaShieldAlt, FaLock, FaCreditCard, FaExclamationCircle } from 'react-icons/fa';
import { clearPaymentState } from '../../features/payments/guestPaymentSlice';
import './QuotePublicPaymentModal.css';

const QuotePublicPaymentModal = ({ show, onHide, quoteData, onGuestPayment }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const paymentState = useSelector(state => state.payment) || {};
    const { loading = false, error = null, sessionUrl = null } = paymentState;

    useEffect(() => {
        if (sessionUrl) {
            window.location.href = sessionUrl;
        }
    }, [sessionUrl]);

    useEffect(() => {
        return () => {
            dispatch(clearPaymentState());
        };
    }, [dispatch]);

    const handleLogin = () => {
        if (quoteData) {
            localStorage.setItem('pendingQuote', JSON.stringify(quoteData));
        }
        navigate('/login');
    };

    const handleRegister = () => {
        if (quoteData) {
            localStorage.setItem('pendingQuote', JSON.stringify(quoteData));
        }
        navigate('/register');
    };

    const handleGuestPayment = () => {
        onHide();
        if (onGuestPayment) {
            onGuestPayment();
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            className="quote-publicpayment-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaCreditCard className="me-2" />
                    Opciones de Pago
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" className="mb-3">
                        <FaExclamationCircle className="me-2" />
                        {error}
                    </Alert>
                )}

                {loading && (
                    <div className="text-center mb-3">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </div>
                )}

                <div className="payment-options-container">
                    <div className="payment-intro-text">
                        <FaShieldAlt className="me-2" style={{ color: '#3498db' }} />
                        <p>Selecciona cómo deseas continuar</p>
                    </div>

                    <div className="payment-option-item">
                        <Button
                            variant="primary"
                            className="payment-option-button login-button"
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            <div className="option-icon">
                                <FaSignInAlt />
                            </div>
                            <div className="option-content">
                                <h5>Iniciar Sesión</h5>
                                <p>Accede a tu cuenta existente</p>
                            </div>
                        </Button>
                    </div>

                    <div className="payment-option-item">
                        <Button
                            variant="success"
                            className="payment-option-button register-button"
                            onClick={handleRegister}
                            disabled={loading}
                        >
                            <div className="option-icon">
                                <FaUserPlus />
                            </div>
                            <div className="option-content">
                                <h5>Crear Cuenta</h5>
                                <p>Registra una cuenta nueva</p>
                            </div>
                        </Button>
                    </div>

                    <div className="payment-option-item">
                        <Button
                            variant="secondary"
                            className="payment-option-button guest-button"
                            onClick={handleGuestPayment}
                            disabled={loading}
                        >
                            <div className="option-icon">
                                <FaUserSecret />
                            </div>
                            <div className="option-content">
                                <h5>Pago como Invitado</h5>
                                <p>Continuar sin registro</p>
                            </div>
                        </Button>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="modal-footer-info">
                    <FaLock className="me-2" style={{ color: '#3498db' }} />
                    <small>Transacciones seguras y encriptadas</small>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default QuotePublicPaymentModal; 