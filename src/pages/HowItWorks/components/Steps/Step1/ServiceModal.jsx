import React from 'react';
import { FaUserTie, FaFileAlt, FaDesktop, FaShieldAlt, FaRobot, FaUniversity, FaArrowRight, FaHeadset } from 'react-icons/fa';
import './ServiceModal.css';

const ServiceModal = () => {
    return (
        <div className="service-modal-section">
            <div className="service-modal-header">
                <h3 className="service-modal-title">Nuestros Servicios</h3>
                <p className="service-modal-description">Ofrecemos una amplia gama de servicios profesionales para ayudarte con tu tesis:</p>
            </div>
            <div className="service-modal-grid">
                <div className="service-modal-card">
                    <div className="service-modal-card-icon">
                        <FaUserTie />
                    </div>
                    <div className="service-modal-card-content">
                        <h4>Asesorías Personalizadas</h4>
                        <p>Apoyo individualizado con expertos en tu área de estudio</p>
                    </div>
                </div>
                <div className="service-modal-card">
                    <div className="service-modal-card-icon">
                        <FaFileAlt />
                    </div>
                    <div className="service-modal-card-content">
                        <h4>Corrección de Fondo y Estilo</h4>
                        <p>Revisión exhaustiva de contenido y redacción</p>
                    </div>
                </div>
                <div className="service-modal-card">
                    <div className="service-modal-card-icon">
                        <FaDesktop />
                    </div>
                    <div className="service-modal-card-content">
                        <h4>Presentaciones Profesionales</h4>
                        <p>Diseño de diapositivas para tu defensa</p>
                    </div>
                </div>
                <div className="service-modal-card">
                    <div className="service-modal-card-icon">
                        <FaShieldAlt />
                    </div>
                    <div className="service-modal-card-content">
                        <h4>Escáner Antiplagio</h4>
                        <p>Análisis profesional de originalidad</p>
                    </div>
                </div>
                <div className="service-modal-card">
                    <div className="service-modal-card-icon">
                        <FaRobot />
                    </div>
                    <div className="service-modal-card-content">
                        <h4>Escáner AntiIA</h4>
                        <p>Detección de contenido generado por IA</p>
                    </div>
                </div>
                <div className="service-modal-card">
                    <div className="service-modal-card-icon">
                        <FaUniversity />
                    </div>
                    <div className="service-modal-card-content">
                        <h4>Formato Institucional</h4>
                        <p>Ajuste a las normas de tu universidad</p>
                    </div>
                </div>
            </div>
            <div className="service-modal-actions">
                <a href="/servicios" className="service-modal-btn service-modal-btn-primary">
                    <FaArrowRight /> Ver todos los servicios
                </a>
                <a href="/contacto" className="service-modal-btn service-modal-btn-secondary">
                    <FaHeadset /> Contactar asesor
                </a>
            </div>
        </div>
    );
};

export default ServiceModal; 