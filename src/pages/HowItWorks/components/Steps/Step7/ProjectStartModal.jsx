import React from 'react';
import { FaRocket, FaClock, FaCalendarCheck, FaShieldAlt, FaUserFriends, FaChartLine } from 'react-icons/fa';
import './ProjectStartModal.css';

const ProjectStartModal = () => {
    return (
        <div className="project-start-section">
            <div className="project-start-header">
                <div className="rocket-animation">
                    <FaRocket className="rocket-icon" />
                </div>
                <h3 className="project-start-title">¡Tu Proyecto está en Marcha!</h3>
                <p className="project-start-description">
                    Seguimiento detallado y comunicación constante desde el primer momento
                </p>
            </div>

            <div className="project-timeline">
                <div className="timeline-line"></div>
                
                <div className="timeline-item">
                    <div className="timeline-icon">
                        <FaClock />
                    </div>
                    <div className="timeline-content">
                        <span className="timeline-tag">Inmediato</span>
                        <h4>Confirmación de Inicio</h4>
                        <p>Recibes la confirmación y acceso a tu portal de cliente</p>
                    </div>
                </div>
                
                <div className="timeline-item">
                    <div className="timeline-icon">
                        <FaUserFriends />
                    </div>
                    <div className="timeline-content">
                        <span className="timeline-tag">24 horas</span>
                        <h4>Reunión de Kick-off</h4>
                        <p>Videollamada para alinear expectativas y metodología</p>
                    </div>
                </div>
                
                <div className="timeline-item">
                    <div className="timeline-icon">
                        <FaCalendarCheck />
                    </div>
                    <div className="timeline-content">
                        <span className="timeline-tag">48 horas</span>
                        <h4>Plan de Trabajo Detallado</h4>
                        <p>Cronograma con fechas de entrega y revisiones</p>
                    </div>
                </div>
                
                <div className="timeline-item">
                    <div className="timeline-icon">
                        <FaChartLine />
                    </div>
                    <div className="timeline-content">
                        <span className="timeline-tag">Semanal</span>
                        <h4>Reportes de Avance</h4>
                        <p>Actualizaciones periódicas sobre el progreso</p>
                    </div>
                </div>
            </div>

            <div className="project-guarantees">
                <div className="guarantee-item">
                    <FaShieldAlt className="guarantee-icon" />
                    <div className="guarantee-content">
                        <h4>Garantía de Satisfacción</h4>
                        <p>Más de 1,500 clientes satisfechos</p>
                    </div>
                </div>
            </div>

            <div className="project-cta">
                <a href="/portal-cliente" className="project-cta-button primary">
                    Ingresar a Mi Portal
                </a>
                <a href="/contacto" className="project-cta-button secondary">
                    Necesito Ayuda
                </a>
            </div>
        </div>
    );
};

export default ProjectStartModal; 