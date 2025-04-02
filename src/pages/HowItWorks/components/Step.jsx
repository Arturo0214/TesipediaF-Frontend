import React, { useState } from 'react';
import { FaClock, FaLink, FaBrain, FaInfoCircle } from 'react-icons/fa';
import Modal from './Modal';
import './Step.css';

const Step = ({ step, index, isActive, showModal }) => {
    const [showLocalModal, setShowLocalModal] = useState(false);

    const handleShowModal = () => {
        setShowLocalModal(true);
        if (showModal) showModal(index);
    };

    const handleHideModal = () => {
        setShowLocalModal(false);
    };

    const getAssistantText = () => {
        switch (index) {
            case 0:
                return "Te ayudo a conocer todos nuestros servicios de asesoría";
            case 1:
                return "¿Quieres saber nuestras tarifas y opciones de pago?";
            case 2:
                return "Te ayudo a realizar tu cotización personalizada";
            case 3:
                return "¿Necesitas hablar con un asesor? Te ayudo";
            case 4:
                return "Revisemos juntos los detalles de tu cotización";
            case 5:
                return "Te explico las formas de pago disponibles";
            case 6:
                return "Conoce a tu asesor especializado";
            case 7:
                return "Te mantendremos informado de todo el proceso";
            case 8:
                return "Te explico qué incluye la entrega final";
            case 9:
                return "Te acompañamos hasta después de la entrega";
            case 10:
                return "¿Necesitas servicios adicionales? Te ayudo";
            default:
                return "¿Necesitas ayuda con este paso?";
        }
    };

    const getModalContent = () => {
        switch (index) {
            case 0:
                return (
                    <div className="how-it-works-modal-section">
                        <h3 className="how-it-works-modal-section-title">Nuestros Servicios</h3>
                        <p className="how-it-works-modal-text">Ofrecemos una amplia gama de servicios para ayudarte con tu tesis:</p>
                        <ul className="how-it-works-modal-list">
                            <li className="how-it-works-modal-list-item">Asesorías personalizadas</li>
                            <li className="how-it-works-modal-list-item">Corrección de fondo y estilo</li>
                            <li className="how-it-works-modal-list-item">Presentaciones profesionales</li>
                            <li className="how-it-works-modal-list-item">Escáner antiplagio</li>
                            <li className="how-it-works-modal-list-item">Escáner antiIA</li>
                        </ul>
                        <a href="/servicios" className="how-it-works-modal-button how-it-works-modal-button-primary">
                            Ver todos los servicios
                        </a>
                    </div>
                );
            case 1:
                return (
                    <div className="how-it-works-modal-section">
                        <h3 className="how-it-works-modal-section-title">Precios por Nivel Académico</h3>
                        <div className="how-it-works-modal-price-card">
                            <h4 className="how-it-works-modal-price-title">Licenciatura</h4>
                            <div className="how-it-works-modal-price">$8,000 - $12,000</div>
                            <p className="how-it-works-modal-price-details">Incluye asesoría completa y correcciones</p>
                            <ul className="how-it-works-modal-price-features">
                                <li className="how-it-works-modal-price-feature">Escáner antiplagio incluido</li>
                                <li className="how-it-works-modal-price-feature">Correcciones sin costo adicional</li>
                                <li className="how-it-works-modal-price-feature">Soporte por WhatsApp</li>
                            </ul>
                        </div>
                        <div className="how-it-works-modal-price-card">
                            <h4 className="how-it-works-modal-price-title">Maestría</h4>
                            <div className="how-it-works-modal-price">$15,000 - $20,000</div>
                            <p className="how-it-works-modal-price-details">Incluye metodología y análisis avanzado</p>
                            <ul className="how-it-works-modal-price-features">
                                <li className="how-it-works-modal-price-feature">Todo lo de licenciatura</li>
                                <li className="how-it-works-modal-price-feature">Metodología específica</li>
                                <li className="how-it-works-modal-price-feature">Análisis estadístico</li>
                            </ul>
                        </div>
                        <div className="how-it-works-modal-price-card">
                            <h4 className="how-it-works-modal-price-title">Doctorado</h4>
                            <div className="how-it-works-modal-price">$25,000 - $35,000</div>
                            <p className="how-it-works-modal-price-details">Investigación profunda y original</p>
                            <ul className="how-it-works-modal-price-features">
                                <li className="how-it-works-modal-price-feature">Todo lo de maestría</li>
                                <li className="how-it-works-modal-price-feature">Investigación original</li>
                                <li className="how-it-works-modal-price-feature">Publicación científica</li>
                            </ul>
                        </div>
                        <a href="/precios" className="how-it-works-modal-button how-it-works-modal-button-primary">
                            Ver precios detallados
                        </a>
                    </div>
                );
            case 2:
                return (
                    <div className="how-it-works-modal-section">
                        <h3 className="how-it-works-modal-section-title">Requisitos para Cotizar</h3>
                        <p className="how-it-works-modal-text">Para realizar tu cotización, necesitaremos los siguientes datos:</p>
                        <ul className="how-it-works-modal-list">
                            <li className="how-it-works-modal-list-item">Nivel académico (Licenciatura/Maestría/Doctorado)</li>
                            <li className="how-it-works-modal-list-item">Área de estudio</li>
                            <li className="how-it-works-modal-list-item">Tema o línea de investigación</li>
                            <li className="how-it-works-modal-list-item">Fecha de entrega requerida</li>
                            <li className="how-it-works-modal-list-item">Extensión aproximada</li>
                            <li className="how-it-works-modal-list-item">Requisitos específicos de tu institución</li>
                        </ul>
                        <a href="/cotizar" className="how-it-works-modal-button how-it-works-modal-button-primary">
                            Realizar cotización
                        </a>
                    </div>
                );
            case 4:
                return (
                    <div className="how-it-works-modal-section">
                        <h3 className="how-it-works-modal-section-title">Contacto y Registro</h3>
                        <div className="how-it-works-modal-buttons">
                            <a href="/register" className="how-it-works-modal-button how-it-works-modal-button-primary">
                                Registrarme
                            </a>
                            <a href="/contacto" className="how-it-works-modal-button how-it-works-modal-button-secondary">
                                Contactar asesor
                            </a>
                            <a href="https://wa.me/TUNUMERO" className="how-it-works-modal-button how-it-works-modal-button-secondary">
                                WhatsApp directo
                            </a>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="how-it-works-modal-section">
                        <h3 className="how-it-works-modal-section-title">Proceso de Cotización</h3>
                        <p className="how-it-works-modal-text">Una vez que hayas iniciado sesión, el proceso es el siguiente:</p>
                        <ul className="how-it-works-modal-list">
                            <li className="how-it-works-modal-list-item">Completa el formulario de cotización</li>
                            <li className="how-it-works-modal-list-item">Adjunta documentos relevantes</li>
                            <li className="how-it-works-modal-list-item">Especifica requisitos especiales</li>
                            <li className="how-it-works-modal-list-item">Selecciona fecha de entrega</li>
                            <li className="how-it-works-modal-list-item">Revisa y confirma tu cotización</li>
                        </ul>
                    </div>
                );
            case 6:
                return (
                    <div className="how-it-works-modal-section">
                        <h3 className="how-it-works-modal-section-title">Diseño de Tesis</h3>
                        <p className="how-it-works-modal-text">Nuestro diseño profesional incluye:</p>
                        <ul className="how-it-works-modal-list">
                            <li className="how-it-works-modal-list-item">Formato según normas de tu institución</li>
                            <li className="how-it-works-modal-list-item">Tipografía profesional</li>
                            <li className="how-it-works-modal-list-item">Espaciado y márgenes correctos</li>
                            <li className="how-it-works-modal-list-item">Índices automáticos</li>
                            <li className="how-it-works-modal-list-item">Referencias bibliográficas</li>
                        </ul>
                    </div>
                );
            case 9:
                return (
                    <div className="how-it-works-modal-section">
                        <h3 className="how-it-works-modal-section-title">Detalles de la Entrega</h3>
                        <p className="how-it-works-modal-text">Tu entrega incluye:</p>
                        <ul className="how-it-works-modal-list">
                            <li className="how-it-works-modal-list-item">Documento principal en formato Word y PDF</li>
                            <li className="how-it-works-modal-list-item">Presentación PowerPoint</li>
                            <li className="how-it-works-modal-list-item">Resumen ejecutivo</li>
                            <li className="how-it-works-modal-list-item">Reporte de escáner antiplagio</li>
                            <li className="how-it-works-modal-list-item">Reporte de escáner antiIA</li>
                        </ul>
                    </div>
                );
            case 10:
                return (
                    <div className="how-it-works-modal-section">
                        <h3 className="how-it-works-modal-section-title">Acompañamiento Post-Entrega</h3>
                        <p className="how-it-works-modal-text">Te apoyamos con:</p>
                        <ul className="how-it-works-modal-list">
                            <li className="how-it-works-modal-list-item">Correcciones de tu asesor o sinodales</li>
                            <li className="how-it-works-modal-list-item">Preparación para defensa</li>
                            <li className="how-it-works-modal-list-item">Asesoría puntual en tu tema</li>
                            <li className="how-it-works-modal-list-item">Soporte por WhatsApp o correo</li>
                        </ul>
                    </div>
                );
            case 11:
                return (
                    <div className="how-it-works-modal-section">
                        <h3 className="how-it-works-modal-section-title">Servicios Adicionales</h3>
                        <div className="how-it-works-modal-price-card">
                            <h4 className="how-it-works-modal-price-title">Corrección de Estilo</h4>
                            <div className="how-it-works-modal-price">$2,000 - $3,000</div>
                            <p className="how-it-works-modal-price-details">Por cada 50 páginas</p>
                        </div>
                        <div className="how-it-works-modal-price-card">
                            <h4 className="how-it-works-modal-price-title">Simulacro de Defensa</h4>
                            <div className="how-it-works-modal-price">$3,000 - $4,000</div>
                            <p className="how-it-works-modal-price-details">Incluye retroalimentación detallada</p>
                        </div>
                        <div className="how-it-works-modal-price-card">
                            <h4 className="how-it-works-modal-price-title">Presentaciones PowerPoint</h4>
                            <div className="how-it-works-modal-price">$1,500 - $2,500</div>
                            <p className="how-it-works-modal-price-details">Diseño profesional y animaciones</p>
                        </div>
                        <a href="/chat" className="how-it-works-modal-button how-it-works-modal-button-primary">
                            Solicitar servicio adicional
                        </a>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`how-it-works-step step-${index + 1} ${isActive ? 'active' : ''}`}>
            <div className="step-header">
                <div className="step-icon">
                    {step.icon}
                </div>
                <button
                    className="step-modal-button"
                    onClick={handleShowModal}
                    style={{ backgroundColor: getStepColor(index) }}
                >
                    Saber más
                </button>
                <div className="step-number">{index + 1}</div>
            </div>
            <div className="step-assistant" onClick={handleShowModal}>
                <div className="assistant-icon">
                    <FaInfoCircle />
                </div>
                <p className="assistant-text">{getAssistantText()}</p>
            </div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
            <div className="step-meta">
                {step.duration && (
                    <span className="step-duration">
                        <FaClock className="me-1" />
                        {step.duration}
                    </span>
                )}
                {step.link && (
                    <a href={step.link} className="step-link">
                        <FaLink className="me-1" />
                        {step.linkText}
                    </a>
                )}
            </div>
            {step.details && (
                <div className="step-details">
                    <FaBrain className="me-2" />
                    {step.details.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
            )}
            <Modal
                show={showLocalModal}
                onHide={handleHideModal}
                title={step.title}
                stepColor={getStepColor(index)}
            >
                {getModalContent()}
            </Modal>
        </div>
    );
};

const getStepColor = (index) => {
    const colors = [
        '#0ea5e9', // Step 1
        '#22c55e', // Step 2
        '#ec4899', // Step 3
        '#eab308', // Step 4
        '#a855f7', // Step 5
        '#f97316', // Step 6
        '#14b8a6', // Step 7
        '#c084fc', // Step 8
        '#f43f5e', // Step 9
        '#06b6d4', // Step 10
        '#64748b'  // Step 11
    ];
    return colors[index] || '#3b82f6';
};

export default Step; 