import React from 'react';
import { FaFileAlt, FaFilePdf, FaFileWord, FaFilePowerpoint, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import './FinalDeliveryModal.css';

const FinalDeliveryModal = () => {
    return (
        <div className="final-delivery-section">
            <h3 className="delivery-title">Entrega Final</h3>
            <p className="delivery-description">Recibe tu proyecto completo y listo para presentar</p>

            <div className="delivery-features">
                <div className="delivery-feature">
                    <div className="feature-icon">
                        <FaFileAlt />
                    </div>
                    <div className="feature-content">
                        <h4>Documento Principal</h4>
                        <p>Formato profesional en:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Microsoft Word (.docx)</li>
                            <li><FaCheckCircle /> PDF de alta calidad</li>
                            <li><FaCheckCircle /> Versión editable</li>
                        </ul>
                    </div>
                </div>

                <div className="delivery-feature">
                    <div className="feature-icon">
                        <FaFilePowerpoint />
                    </div>
                    <div className="feature-content">
                        <h4>Presentación</h4>
                        <p>Diseño profesional:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> PowerPoint completo</li>
                            <li><FaCheckCircle /> Notas del expositor</li>
                            <li><FaCheckCircle /> Guía de presentación</li>
                        </ul>
                    </div>
                </div>

                <div className="delivery-feature">
                    <div className="feature-icon">
                        <FaShieldAlt />
                    </div>
                    <div className="feature-content">
                        <h4>Reportes de Calidad</h4>
                        <p>Garantía de originalidad:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Reporte antiplagio</li>
                            <li><FaCheckCircle /> Reporte antiIA</li>
                            <li><FaCheckCircle /> Certificado de originalidad</li>
                        </ul>
                    </div>
                </div>

                <div className="delivery-feature">
                    <div className="feature-icon">
                        <FaFileWord />
                    </div>
                    <div className="feature-content">
                        <h4>Documentos Adicionales</h4>
                        <p>Material complementario:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Resumen ejecutivo</li>
                            <li><FaCheckCircle /> Abstract en inglés</li>
                            <li><FaCheckCircle /> Bibliografía completa</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="delivery-guarantee">
                <div className="guarantee-content">
                    <h4>Garantía de Satisfacción</h4>
                    <p>Tu satisfacción es nuestra prioridad:</p>
                    <ul className="feature-list">
                        <li><FaCheckCircle /> Revisión final sin costo</li>
                        <li><FaCheckCircle /> Ajustes según comentarios</li>
                        <li><FaCheckCircle /> Soporte post-entrega</li>
                    </ul>
                </div>
            </div>

            <div className="delivery-cta">
                <a href="/dashboard" className="delivery-button">
                    Ver mis entregas
                </a>
                <p className="delivery-note">Acceso inmediato a todos tus documentos</p>
            </div>
        </div>
    );
};

export default FinalDeliveryModal; 