import React, { useState } from 'react';
import { FaPlusCircle, FaEdit, FaBook, FaUserGraduate, FaChalkboardTeacher, FaFilePowerpoint } from 'react-icons/fa';
import ChatPanel from '../../../../../components/chat/ChatPanel';
import './AdditionalServicesModal.css';


const AdditionalServicesModal = ({ onClose }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="step11-modal-section">
            <div className="step11-modal-header">
                <div className="step11-modal-animation">
                    <FaPlusCircle className="step11-modal-icon" />
                </div>
                <h3 className="step11-modal-title">Servicios Adicionales</h3>
                <p className="step11-modal-description">
                    Potencia tu proyecto con nuestros servicios especializados
                </p>
            </div>

            <div className="step11-modal-grid">
                <div className="step11-modal-item">
                    <div className="step11-modal-icon-container">
                        <FaEdit />
                    </div>
                    <div className="step11-modal-content">
                        <h4>Corrección de Estilo</h4>
                        <p>Mejora la redacción y coherencia de tu texto</p>
                        <ul className="step11-modal-features">
                            <li>Revisión ortográfica</li>
                            <li>Mejora de sintaxis</li>
                            <li>Coherencia narrativa</li>
                        </ul>
                    </div>
                </div>

                <div className="step11-modal-item">
                    <div className="step11-modal-icon-container">
                        <FaBook />
                    </div>
                    <div className="step11-modal-content">
                        <h4>Corrección de Fondo</h4>
                        <p>Fortalece la base teórica de tu investigación</p>
                        <ul className="step11-modal-features">
                            <li>Revisión de referencias</li>
                            <li>Estructura metodológica</li>
                            <li>Análisis de contenido</li>
                        </ul>
                    </div>
                </div>

                <div className="step11-modal-item">
                    <div className="step11-modal-icon-container">
                        <FaUserGraduate />
                    </div>
                    <div className="step11-modal-content">
                        <h4>Simulacro de Defensa</h4>
                        <p>Prepárate para tu presentación final</p>
                        <ul className="step11-modal-features">
                            <li>Preguntas frecuentes</li>
                            <li>Técnicas de presentación</li>
                            <li>Retroalimentación</li>
                        </ul>
                    </div>
                </div>

                <div className="step11-modal-item">
                    <div className="step11-modal-icon-container">
                        <FaChalkboardTeacher />
                    </div>
                    <div className="step11-modal-content">
                        <h4>Asesoría Académica</h4>
                        <p>Apoyo personalizado en tu investigación</p>
                        <ul className="step11-modal-features">
                            <li>Orientación metodológica</li>
                            <li>Revisión de avances</li>
                            <li>Consultas especializadas</li>
                        </ul>
                    </div>
                </div>

                <div className="step11-modal-item">
                    <div className="step11-modal-icon-container">
                        <FaFilePowerpoint />
                    </div>
                    <div className="step11-modal-content">
                        <h4>Presentaciones PowerPoint</h4>
                        <p>Diseño profesional de diapositivas</p>
                        <ul className="step11-modal-features">
                            <li>Diseño moderno</li>
                            <li>Contenido estructurado</li>
                            <li>Elementos visuales</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="step11-modal-contact">
                <h4 className="step11-modal-contact-title">¿Necesitas alguno de estos servicios?</h4>
                <p className="step11-modal-contact-description">
                    Escríbenos directamente y te ayudamos a elegir la mejor opción para tu proyecto
                </p>
                <div className="step11-modal-contact-buttons">
                    <button onClick={() => setIsChatOpen(true)} className="step11-modal-contact-button chat">
                        Chatear Ahora
                    </button>
                    <a href="https://wa.me/1234567890" className="step11-modal-contact-button whatsapp">
                        WhatsApp Directo
                    </a>
                </div>
            </div>

            <ChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                isPublic={true}
            />
        </div>
    );
};

export default AdditionalServicesModal; 