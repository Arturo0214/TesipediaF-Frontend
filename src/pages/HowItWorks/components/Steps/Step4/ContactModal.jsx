import React from 'react';
import { FaWhatsapp, FaEnvelope, FaUserPlus, FaHeadset } from 'react-icons/fa';
import './ContactModal.css';

const ContactModal = () => {
    return (
        <div className="contact-modal-section">
            <h3 className="contact-title">Contacto y Registro</h3>
            <p className="contact-description">Elige la opción que mejor se adapte a ti para comenzar</p>

            <div className="contact-options">
                <div className="contact-option">
                    <div className="contact-icon">
                        <FaUserPlus />
                    </div>
                    <div className="contact-content">
                        <h4>Registro Rápido</h4>
                        <p>Crea tu cuenta en menos de 2 minutos</p>
                        <a href="/register" className="contact-button primary">
                            Registrarme ahora
                        </a>
                    </div>
                </div>

                <div className="contact-option">
                    <div className="contact-icon" style={{ color: '#25D366' }}>
                        <FaWhatsapp />
                    </div>
                    <div className="contact-content">
                        <h4>WhatsApp Directo</h4>
                        <p>Respuesta inmediata vía WhatsApp</p>
                        <a href="https://wa.me/TUNUMERO" className="contact-button whatsapp">
                            Chatear ahora
                        </a>
                    </div>
                </div>

                <div className="contact-option">
                    <div className="contact-icon">
                        <FaHeadset />
                    </div>
                    <div className="contact-content">
                        <h4>Asesor Especializado</h4>
                        <p>Atención personalizada para tu caso</p>
                        <a href="/contacto" className="contact-button secondary">
                            Contactar asesor
                        </a>
                    </div>
                </div>

                <div className="contact-option">
                    <div className="contact-icon">
                        <FaEnvelope />
                    </div>
                    <div className="contact-content">
                        <h4>Correo Electrónico</h4>
                        <p>Envíanos tus dudas por email</p>
                        <a href="mailto:info@tesipedia.com" className="contact-button secondary">
                            Enviar correo
                        </a>
                    </div>
                </div>
            </div>

            <div className="contact-guarantee">
                <div className="guarantee-content">
                    <h4>Garantía de Respuesta Rápida</h4>
                    <p>Nos comprometemos a responder en menos de 2 horas en horario laboral</p>
                </div>
            </div>
        </div>
    );
};

export default ContactModal; 