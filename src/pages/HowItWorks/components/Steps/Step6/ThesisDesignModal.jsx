import React from 'react';
import { FaCreditCard, FaPaypal, FaUniversity, FaClock, FaShieldAlt, FaMoneyBillWave } from 'react-icons/fa';
import './PaymentModal.css';

const PaymentModal = () => {
    return (
        <div className="payment-modal-section">
            <div className="payment-modal-header">
                <h3 className="payment-modal-title">Realizar el Pago</h3>
                <p className="payment-modal-description">Procede a realizar el pago según el método elegido</p>
                <div className="payment-time">
                    <FaClock className="time-icon" />
                    <span>1-2 minutos</span>
                </div>
            </div>

            <div className="payment-methods-grid">
                <div className="payment-method-card">
                    <div className="payment-method-icon">
                        <FaCreditCard />
                    </div>
                    <div className="payment-method-content">
                        <h4>Tarjeta de Crédito/Débito</h4>
                        <p className="centered-text">Pago seguro a meses sin intereses</p>
                        <button className="payment-method-button primary">
                            Pagar con Tarjeta
                        </button>
                    </div>
                </div>

                <div className="payment-method-card">
                    <div className="payment-method-icon">
                        <FaPaypal />
                    </div>
                    <div className="payment-method-content">
                        <h4>PayPal</h4>
                        <p className="centered-text">Pago rápido y seguro con PayPal</p>
                        <button className="payment-method-button paypal">
                            Pagar con PayPal
                        </button>
                    </div>
                </div>

                <div className="payment-method-card">
                    <div className="payment-method-icon">
                        <FaUniversity />
                    </div>
                    <div className="payment-method-content">
                        <h4>Transferencia Bancaria</h4>
                        <p className="centered-text">10% de descuento en transferencias</p>
                        <button className="payment-method-button secondary">
                            Contacta con un asesor
                        </button>
                    </div>
                </div>

                <div className="payment-method-card">
                    <div className="payment-method-icon">
                        <FaMoneyBillWave />
                    </div>
                    <div className="payment-method-content">
                        <h4>Efectivo / Retiro</h4>
                        <p className="centered-text">10% de descuento en pagos sin tarjeta</p>
                        <button className="payment-method-button chat-button">
                            Abrir Chat
                        </button>
                    </div>
                </div>
            </div>

            <div className="payment-info-section">
                <div className="payment-guarantee">
                    <FaShieldAlt className="guarantee-icon" />
                    <div className="guarantee-content">
                        <h4>Pago Seguro Garantizado</h4>
                        <p>Modalidad de pago: 50% al iniciar, 50% al entregar para pagos en efectivo</p>
                    </div>
                </div>
            </div>

            <div className="payment-cta">
                <a href="/contacto" className="payment-support-button">
                    ¿Necesitas ayuda con tu pago?
                </a>
            </div>
        </div>
    );
};

export default PaymentModal; 