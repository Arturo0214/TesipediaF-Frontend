import React from 'react';
import { FaClock, FaLink, FaBrain, FaInfoCircle, FaUserTie, FaFileAlt, FaDesktop, FaShieldAlt, FaRobot, FaUniversity, FaArrowRight, FaHeadset, FaCheck, FaCreditCard, FaPercent } from 'react-icons/fa';
import Modal from '../Modal';
import ServiceModal from './Step1/ServiceModal';
import PricingModal from './Step2/PricingModal';
import QuoteModal from './Step3/QuoteModal';
import ContactModal from './Step4/ContactModal';
import QuoteProcessModal from './Step5/QuoteProcessModal';
import ThesisDesignModal from './Step6/ThesisDesignModal';
import ProjectStartModal from './Step7/ProjectStartModal';
import ProcessTrackingModal from './Step8/ProcessTrackingModal';
import FinalDeliveryModal from './Step9/FinalDeliveryModal';
import PostDeliveryModal from './Step10/PostDeliveryModal';
import '../../styles/Step.css';

const Step = ({ step, index, isActive, isModalOpen, onShowModal, onHideModal }) => {

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
                return "¡Tu proyecto ya está en marcha! Te muestro los siguientes pasos";
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
                return <ServiceModal />;
            case 1:
                return <PricingModal />;
            case 2:
                return <QuoteModal />;
            case 3:
                return <ContactModal />;
            case 4:
                return <QuoteProcessModal />;
            case 5:
                return <ThesisDesignModal />;
            case 6:
                return <ProjectStartModal />;
            case 7:
                return <ProcessTrackingModal />;
            case 8:
                return <FinalDeliveryModal />;
            case 9:
                return <PostDeliveryModal />;
            case 10:
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
                    onClick={() => onShowModal(index)}
                    style={{ backgroundColor: getStepColor(index) }}
                >
                    Saber más
                </button>
                <div className="step-number">{index + 1}</div>
            </div>
            <div className="step-assistant" onClick={() => onShowModal(index)}>
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
            {isModalOpen && (
                <Modal
                    show={isModalOpen}
                    onHide={onHideModal}
                    title={step.title}
                    stepColor={getStepColor(index)}
                >
                    {getModalContent()}
                </Modal>
            )}
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