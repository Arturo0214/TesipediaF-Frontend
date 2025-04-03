import React from 'react';
import { FaClipboardList, FaFileUpload, FaListAlt, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import './QuoteProcessModal.css';

const QuoteProcessModal = () => {
    return (
        <div className="step5-quote-process-section">
            <h3 className="step5-quote-title">Proceso de Cotización</h3>
            <p className="step5-quote-description">Sigue estos pasos para obtener tu cotización personalizada</p>

            <div className="step5-process-grid">
                <div className="step5-process-item">
                    <div className="step5-item-icon">
                        <FaClipboardList />
                    </div>
                    <div className="step5-item-content">
                        <h4 className="step5-item-title">1. Completa el Formulario</h4>
                        <p className="step5-item-description">Proporciona los detalles básicos de tu proyecto de tesis</p>
                        <ul className="step5-item-list">
                            <li className="step5-item-list-point">Información personal</li>
                            <li className="step5-item-list-point">Nivel académico</li>
                            <li className="step5-item-list-point">Área de estudio</li>
                        </ul>
                    </div>
                </div>

                <div className="step5-process-item">
                    <div className="step5-item-icon">
                        <FaFileUpload />
                    </div>
                    <div className="step5-item-content">
                        <h4 className="step5-item-title">2. Adjunta Documentos</h4>
                        <p className="step5-item-description">Sube los archivos relevantes para tu proyecto</p>
                        <ul className="step5-item-list">
                            <li className="step5-item-list-point">Guía de tesis</li>
                            <li className="step5-item-list-point">Avances previos</li>
                            <li className="step5-item-list-point">Referencias importantes</li>
                        </ul>
                    </div>
                </div>

                <div className="step5-process-item">
                    <div className="step5-item-icon">
                        <FaListAlt />
                    </div>
                    <div className="step5-item-content">
                        <h4 className="step5-item-title">3. Especifica Requisitos</h4>
                        <p className="step5-item-description">Detalla los requerimientos específicos</p>
                        <ul className="step5-item-list">
                            <li className="step5-item-list-point">Formato institucional</li>
                            <li className="step5-item-list-point">Estilo de citación</li>
                            <li className="step5-item-list-point">Requisitos especiales</li>
                        </ul>
                    </div>
                </div>

                <div className="step5-process-item">
                    <div className="step5-item-icon">
                        <FaCalendarAlt />
                    </div>
                    <div className="step5-item-content">
                        <h4 className="step5-item-title">4. Elige Fecha de Entrega</h4>
                        <p className="step5-item-description">Selecciona el plazo que necesitas</p>
                        <ul className="step5-item-list">
                            <li className="step5-item-list-point">Fechas disponibles</li>
                            <li className="step5-item-list-point">Entregas parciales</li>
                            <li className="step5-item-list-point">Tiempo de revisión</li>
                        </ul>
                    </div>
                </div>

                <div className="step5-process-item">
                    <div className="step5-item-icon">
                        <FaCheckCircle />
                    </div>
                    <div className="step5-item-content">
                        <h4 className="step5-item-title">5. Revisa y Confirma</h4>
                        <p className="step5-item-description">Verifica los detalles de tu cotización</p>
                        <ul className="step5-item-list">
                            <li className="step5-item-list-point">Resumen del servicio</li>
                            <li className="step5-item-list-point">Precio final</li>
                            <li className="step5-item-list-point">Términos y condiciones</li>
                        </ul>
                    </div>
                </div>

                <div className="step5-process-item step5-cta-item">
                    <div className="step5-action-container">
                        <a href="/cotizar" className="step5-action-button">
                            Comenzar Cotización
                        </a>
                        <p className="step5-action-note">El proceso completo toma menos de 5 minutos</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteProcessModal; 