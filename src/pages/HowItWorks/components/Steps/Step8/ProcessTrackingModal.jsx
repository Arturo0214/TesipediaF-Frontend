import React from 'react';
import { FaChartLine, FaCalendarAlt, FaComments, FaFileAlt, FaBell, FaMobile, FaDesktop, FaTabletAlt } from 'react-icons/fa';
import './ProcessTrackingModal.css';

const ProcessTrackingModal = () => {
    return (
        <div className="notification-tracking-section">
            <div className="notification-header">
                <div className="notification-pulse">
                    <FaBell className="notification-bell-icon" />
                </div>
                <h3 className="notification-title">Seguimiento en Tiempo Real</h3>
                <p className="notification-description">
                    Te mantenemos informado en cada fase de tu proyecto académico
                </p>
            </div>

            <div className="notification-channels">
                <div className="channel-item">
                    <div className="channel-icon">
                        <FaMobile />
                    </div>
                    <div className="channel-type">WhatsApp</div>
                </div>
                <div className="channel-item">
                    <div className="channel-icon">
                        <FaDesktop />
                    </div>
                    <div className="channel-type">Email</div>
                </div>
                <div className="channel-item">
                    <div className="channel-icon">
                        <FaTabletAlt />
                    </div>
                    <div className="channel-type">Dashboard</div>
                </div>
            </div>

            <div className="notification-updates">
                <div className="update-message">
                    <span className="update-badge">Nuevo</span>
                    <div className="update-content">
                        <h4>Capítulo 2 completado</h4>
                        <p>Tu asesor ha finalizado la revisión del capítulo 2</p>
                        <span className="update-time">Hace 2 horas</span>
                    </div>
                </div>

                <div className="update-message">
                    <span className="update-badge pending">Pendiente</span>
                    <div className="update-content">
                        <h4>Revisión programada</h4>
                        <p>Videollamada para revisar el marco teórico</p>
                        <span className="update-time">Mañana, 10:00 AM</span>
                    </div>
                </div>

                <div className="update-message">
                    <span className="update-badge progress">En progreso</span>
                    <div className="update-content">
                        <h4>Desarrollo de metodología</h4>
                        <p>Tu asesor está trabajando en el capítulo 3</p>
                        <span className="update-time">Avance: 65%</span>
                    </div>
                </div>
            </div>

            <div className="notification-features">
                <div className="feature-column">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FaChartLine />
                        </div>
                        <div className="feature-content">
                            <h4>Seguimiento detallado</h4>
                            <p>Visualiza el progreso de cada sección de tu proyecto en tiempo real</p>
                        </div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FaCalendarAlt />
                        </div>
                        <div className="feature-content">
                            <h4>Calendario integrado</h4>
                            <p>Todas las fechas importantes y reuniones programadas en un solo lugar</p>
                        </div>
                    </div>
                </div>

                <div className="feature-column">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FaComments />
                        </div>
                        <div className="feature-content">
                            <h4>Comunicación directa</h4>
                            <p>Mensajería instantánea con tu asesor para resolver dudas y comentarios</p>
                        </div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FaFileAlt />
                        </div>
                        <div className="feature-content">
                            <h4>Historial de versiones</h4>
                            <p>Accede a todas las versiones anteriores de tu documento con control de cambios</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="notification-cta">
                <a href="/cotizar" className="notification-button quote">
                    Solicita tu cotización ahora
                </a>
            </div>
        </div>
    );
};

export default ProcessTrackingModal; 