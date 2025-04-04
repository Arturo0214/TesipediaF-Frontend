import React from 'react';
import { FaComments, FaUserGraduate, FaChalkboardTeacher, FaWhatsapp, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import './PostDeliveryModal.css';

const PostDeliveryModal = ({ onClose }) => {
    return (
        <div className="post-delivery-section">
            <div className="post-delivery-header">
                <div className="post-delivery-animation">
                    <FaComments className="post-delivery-icon" />
                </div>
                <h3 className="post-delivery-title">Acompañamiento Continuo</h3>
                <p className="post-delivery-description">
                    Estamos contigo hasta el final de tu proceso académico
                </p>
            </div>

            <div className="post-delivery-services">
                <div className="service-card">
                    <div className="service-icon">
                        <FaUserGraduate />
                    </div>
                    <div className="service-content">
                        <h4>Correcciones de Asesores</h4>
                        <p>Ajustamos tu trabajo según los comentarios de tu asesor o sinodales</p>
                    </div>
                </div>

                <div className="service-card">
                    <div className="service-icon">
                        <FaChalkboardTeacher />
                    </div>
                    <div className="service-content">
                        <h4>Preparación para Defensa</h4>
                        <p>Te ayudamos a preparar tu presentación y argumentación</p>
                    </div>
                </div>

                <div className="service-card">
                    <div className="service-icon">
                        <FaComments />
                    </div>
                    <div className="service-content">
                        <h4>Asesoría Temática</h4>
                        <p>Resolvemos dudas específicas sobre tu investigación</p>
                    </div>
                </div>
            </div>

            <div className="communication-channels">
                <h4 className="channels-title">Canales de Comunicación</h4>
                <div className="channels-grid">
                    <div className="channel-card whatsapp">
                        <FaWhatsapp className="channel-icon" />
                        <h5>WhatsApp</h5>
                        <p>Respuesta inmediata y seguimiento personalizado</p>
                    </div>
                    <div className="channel-card email">
                        <FaEnvelope className="channel-icon" />
                        <h5>Correo Electrónico</h5>
                        <p>Documentación detallada y seguimiento formal</p>
                    </div>
                </div>
            </div>

            <div className="support-features">
                <div className="feature-item">
                    <FaCheckCircle className="feature-icon" />
                    <span>Soporte ilimitado</span>
                </div>
                <div className="feature-item">
                    <FaCheckCircle className="feature-icon" />
                    <span>Respuesta en 24h</span>
                </div>
                <div className="feature-item">
                    <FaCheckCircle className="feature-icon" />
                    <span>Asesoría personalizada</span>
                </div>
            </div>

            <div className="post-delivery-cta">
                <a href="/chat" className="post-delivery-button">
                    Iniciar Asesoría
                </a>
            </div>
        </div>
    );
};

export default PostDeliveryModal; 