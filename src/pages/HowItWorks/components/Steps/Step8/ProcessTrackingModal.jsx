import React from 'react';
import { FaChartLine, FaCalendarAlt, FaComments, FaFileAlt, FaBell, FaCheckCircle } from 'react-icons/fa';
import './ProcessTrackingModal.css';

const ProcessTrackingModal = () => {
    return (
        <div className="process-tracking-section">
            <h3 className="process-title">Seguimiento del Proceso</h3>
            <p className="process-description">Mantente informado en cada etapa de tu proyecto</p>

            <div className="process-features">
                <div className="process-feature">
                    <div className="feature-icon">
                        <FaChartLine />
                    </div>
                    <div className="feature-content">
                        <h4>Panel de Progreso</h4>
                        <p>Accede a información detallada:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Avance por capítulos</li>
                            <li><FaCheckCircle /> Tiempo estimado restante</li>
                            <li><FaCheckCircle /> Porcentaje de completado</li>
                        </ul>
                    </div>
                </div>

                <div className="process-feature">
                    <div className="feature-icon">
                        <FaCalendarAlt />
                    </div>
                    <div className="feature-content">
                        <h4>Calendario de Entregas</h4>
                        <p>Planificación transparente:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Fechas de revisión</li>
                            <li><FaCheckCircle /> Entregas parciales</li>
                            <li><FaCheckCircle /> Plazos ajustables</li>
                        </ul>
                    </div>
                </div>

                <div className="process-feature">
                    <div className="feature-icon">
                        <FaComments />
                    </div>
                    <div className="feature-content">
                        <h4>Comunicación Directa</h4>
                        <p>Múltiples canales de contacto:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Chat en tiempo real</li>
                            <li><FaCheckCircle /> Videollamadas programadas</li>
                            <li><FaCheckCircle /> Correo electrónico</li>
                        </ul>
                    </div>
                </div>

                <div className="process-feature">
                    <div className="feature-icon">
                        <FaFileAlt />
                    </div>
                    <div className="feature-content">
                        <h4>Documentación</h4>
                        <p>Acceso a todos los archivos:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Versiones del documento</li>
                            <li><FaCheckCircle /> Comentarios y correcciones</li>
                            <li><FaCheckCircle /> Recursos adicionales</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="process-notifications">
                <div className="notification-icon">
                    <FaBell />
                </div>
                <div className="notification-content">
                    <h4>Notificaciones Automáticas</h4>
                    <p>Recibe alertas sobre:</p>
                    <ul className="feature-list">
                        <li><FaCheckCircle /> Nuevas entregas</li>
                        <li><FaCheckCircle /> Comentarios del asesor</li>
                        <li><FaCheckCircle /> Próximas revisiones</li>
                    </ul>
                </div>
            </div>

            <div className="process-cta">
                <a href="/dashboard" className="process-button">
                    Acceder a mi panel
                </a>
                <p className="process-note">Disponible 24/7 desde cualquier dispositivo</p>
            </div>
        </div>
    );
};

export default ProcessTrackingModal; 