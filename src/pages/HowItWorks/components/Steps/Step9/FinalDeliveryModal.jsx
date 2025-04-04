import React from 'react';
import { FaFileAlt, FaFilePdf, FaFileWord, FaFilePowerpoint, FaCheckCircle, FaShieldAlt, FaDownload, FaAward, FaRocket } from 'react-icons/fa';
import './FinalDeliveryModal.css';

const FinalDeliveryModal = () => {
    return (
        <div className="final-delivery-section">
            <div className="delivery-header">
                <div className="delivery-animation">
                    <FaRocket className="delivery-icon" />
                </div>
                <h3 className="delivery-title">Entrega Final Profesional</h3>
                <p className="delivery-description">
                    Tu proyecto académico completo y listo para presentar con todos los elementos necesarios
                </p>
            </div>

            <div className="delivery-awards">
                <div className="award-item">
                    <div className="award-badge">
                        <FaAward />
                    </div>
                    <div className="award-label">Calidad Premium</div>
                </div>
                <div className="award-item">
                    <div className="award-badge">
                        <FaShieldAlt />
                    </div>
                    <div className="award-label">100% Original</div>
                </div>
                <div className="award-item">
                    <div className="award-badge">
                        <FaFileAlt />
                    </div>
                    <div className="award-label">Completo</div>
                </div>
            </div>

            <div className="delivery-files">
                <div className="file-card main">
                    <div className="file-icon-wrapper">
                        <FaFilePdf className="file-icon" />
                    </div>
                    <div className="file-content">
                        <h4 className="file-title">Documento Principal</h4>
                        <p className="file-description">Tu trabajo completo con formato académico profesional</p>
                        <div className="file-formats">
                            <span className="format-tag">PDF</span>
                            <span className="format-tag">DOCX</span>
                        </div>
                    </div>
                </div>

                <div className="file-card">
                    <div className="file-icon-wrapper">
                        <FaFilePowerpoint className="file-icon" />
                    </div>
                    <div className="file-content">
                        <h4 className="file-title">Presentación</h4>
                        <p className="file-description">Diseño profesional con notas para el expositor</p>
                        <div className="file-formats">
                            <span className="format-tag">PPT</span>
                            <span className="format-tag">PDF</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="delivery-verification">
                <h4 className="verification-title">Certificados de Calidad</h4>

                <div className="verification-grid">
                    <div className="verification-item">
                        <div className="verification-icon">
                            <FaShieldAlt />
                        </div>
                        <div className="verification-content">
                            <h5>Reporte Antiplagio</h5>
                            <p>Verificación exhaustiva contra millones de documentos académicos</p>
                            <div className="verification-score">
                                <div className="score-bar">
                                    <div className="score-fill"></div>
                                </div>
                                <span className="score-label">100% Original</span>
                            </div>
                        </div>
                    </div>

                    <div className="verification-item">
                        <div className="verification-icon">
                            <FaShieldAlt />
                        </div>
                        <div className="verification-content">
                            <h5>Reporte Anti-IA</h5>
                            <p>Confirmación de autoría humana verificada por especialistas</p>
                            <div className="verification-score">
                                <div className="score-bar">
                                    <div className="score-fill"></div>
                                </div>
                                <span className="score-label">100% Humano</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="delivery-guarantee">
                <div className="guarantee-icon">
                    <FaAward />
                </div>
                <div className="guarantee-content">
                    <h4>Garantía de Satisfacción</h4>
                    <p>Revisión final sin costo y ajustes según comentarios de tus profesores</p>
                </div>
            </div>

            <div className="delivery-cta">
                <a href="/cotizar" className="delivery-button">
                    Solicita tu cotización ahora
                </a>
            </div>
        </div>
    );
};

export default FinalDeliveryModal; 