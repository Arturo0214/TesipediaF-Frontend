import React from 'react';
import { FaCheck, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import './PricingModal.css';

const PricingModal = () => {
    const visaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714159/visa-svgrepo-com_lpwqqd.svg';
    const mastercardLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714158/mc_symbol_zpes4d.svg';
    const amexLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714158/amex-svgrepo-com_m3vtdk.svg';
    const paypalLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714159/paypal-svgrepo-com_wl94rq.svg';
    const bankTransferLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714158/bank-transfer_shbqgk.png';
    const qrCodeLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714159/qr-code_bk38y1.png';

    return (
        <div className="pricing-modal-section">
            <div className="pricing-header">
                <h3 className="pricing-title">Inversión en tu Futuro Académico</h3>
                <p className="pricing-description">Planes diseñados para garantizar el éxito de tu tesis</p>
            </div>

            <div className="pricing-grid">
                <div className="price-card">
                    <div className="price-header">
                        <h4 className="price-title">Maestría</h4>
                        <div className="price-amount">$380-$420 MXN</div>
                        <div className="price-pages">Por página</div>
                    </div>
                    <ul className="price-features">
                        <li className="price-feature">
                            <FaCheck /> Investigación especializada
                        </li>
                        <li className="price-feature">
                            <FaCheck /> Metodología avanzada
                        </li>
                        <li className="price-feature">
                            <FaCheck /> Análisis profundo de datos
                        </li>
                        <li className="price-feature">
                            <FaCheck /> Todo lo de licenciatura
                        </li>
                    </ul>
                    <div className="price-guarantee">
                        <FaShieldAlt /> Garantía de satisfacción
                    </div>
                    <div className="price-discount">10% OFF en pago directo</div>
                </div>

                <div className="price-card featured">
                    <div className="price-header">
                        <h4 className="price-title">Licenciatura</h4>
                        <div className="price-amount">$280-$320 MXN</div>
                        <div className="price-pages">Por página</div>
                    </div>
                    <ul className="price-features">
                        <li className="price-feature">
                            <FaCheck /> Corrección de fondo y estilo
                        </li>
                        <li className="price-feature">
                            <FaCheck /> Escáner antiplagio profesional
                        </li>
                        <li className="price-feature">
                            <FaCheck /> Escáner antiIA incluido
                        </li>
                        <li className="price-feature">
                            <FaCheck /> Asesoría personalizada
                        </li>
                    </ul>
                    <div className="price-guarantee">
                        <FaShieldAlt /> Garantía de satisfacción
                    </div>
                    <div className="price-discount">10% OFF en pago directo</div>
                </div>

                <div className="price-card">
                    <div className="price-header">
                        <h4 className="price-title">Doctorado</h4>
                        <div className="price-amount">$480-$520 MXN</div>
                        <div className="price-pages">Por página</div>
                    </div>
                    <ul className="price-features">
                        <li className="price-feature">
                            <FaCheck /> Investigación doctoral
                        </li>
                        <li className="price-feature">
                            <FaCheck /> Análisis avanzado
                        </li>
                        <li className="price-feature">
                            <FaCheck /> Publicación científica
                        </li>
                        <li className="price-feature">
                            <FaCheck /> Todo lo de maestría
                        </li>
                    </ul>
                    <div className="price-guarantee">
                        <FaShieldAlt /> Garantía de satisfacción
                    </div>
                    <div className="price-discount">10% OFF en pago directo</div>
                </div>
            </div>

            <div className="payment-section">
                <div className="payment-header">
                    <h4 className="payment-title">Métodos de Pago</h4>
                    <p className="payment-subtitle">Elige tu forma de pago preferida</p>
                </div>

                <div className="payment-grid">
                    {/* Primera fila */}
                    <div className="payment-method">
                        <img src={visaLogo} alt="Visa" className="payment-method-logo" />
                        <span className="payment-method-title">Visa</span>
                    </div>

                    <div className="payment-method">
                        <img src={mastercardLogo} alt="Mastercard" className="payment-method-logo" />
                        <span className="payment-method-title">Mastercard</span>
                    </div>

                    <div className="payment-method">
                        <img src={amexLogo} alt="American Express" className="payment-method-logo" />
                        <span className="payment-method-title">Amex</span>
                    </div>

                    {/* Segunda fila */}
                    <div className="payment-method">
                        <img src={paypalLogo} alt="PayPal" className="payment-method-logo" />
                        <span className="payment-method-title">PayPal</span>
                    </div>

                    <div className="payment-method">
                        <img src={bankTransferLogo} alt="Transferencia" className="payment-method-logo" />
                        <span className="payment-method-title">SPEI</span>
                        <span className="payment-discount-tag">-10%</span>
                    </div>

                    <div className="payment-method">
                        <img src={qrCodeLogo} alt="QR" className="payment-method-logo" />
                        <span className="payment-method-title">QR</span>
                        <span className="payment-discount-tag">-10%</span>
                    </div>
                </div>

                <div className="payment-cta">
                    <a href="/cotizar" className="payment-cta-button">
                        <FaArrowRight /> Cotizar Ahora
                    </a>
                    <p className="payment-cta-text">Cotización personalizada en 5 minutos</p>
                </div>
            </div>
        </div>
    );
};

export default PricingModal; 