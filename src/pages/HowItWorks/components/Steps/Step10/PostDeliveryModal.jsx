import React from 'react';
import { FaHeadset, FaComments, FaGraduationCap, FaCheckCircle, FaClock, FaFileAlt } from 'react-icons/fa';
import './PostDeliveryModal.css';

const PostDeliveryModal = () => {
    return (
        <div className="post-delivery-section">
            <h3 className="post-delivery-title">Acompañamiento Post-Entrega</h3>
            <p className="post-delivery-description">Te apoyamos hasta la presentación de tu examen profesional</p>

            <div className="post-delivery-features">
                <div className="post-delivery-feature">
                    <div className="feature-icon">
                        <FaHeadset />
                    </div>
                    <div className="feature-content">
                        <h4>Soporte Continuo</h4>
                        <p>Asistencia personalizada:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Consultas ilimitadas</li>
                            <li><FaCheckCircle /> Respuesta en 24h</li>
                            <li><FaCheckCircle /> Asesoría por WhatsApp</li>
                        </ul>
                    </div>
                </div>

                <div className="post-delivery-feature">
                    <div className="feature-icon">
                        <FaFileAlt />
                    </div>
                    <div className="feature-content">
                        <h4>Revisiones y Ajustes</h4>
                        <p>Modificaciones sin costo:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Correcciones de sinodales</li>
                            <li><FaCheckCircle /> Ajustes de formato</li>
                            <li><FaCheckCircle /> Actualizaciones de contenido</li>
                        </ul>
                    </div>
                </div>

                <div className="post-delivery-feature">
                    <div className="feature-icon">
                        <FaGraduationCap />
                    </div>
                    <div className="feature-content">
                        <h4>Preparación para Defensa</h4>
                        <p>Apoyo en tu presentación:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Simulacro de defensa</li>
                            <li><FaCheckCircle /> Guía de preguntas frecuentes</li>
                            <li><FaCheckCircle /> Técnicas de presentación</li>
                        </ul>
                    </div>
                </div>

                <div className="post-delivery-feature">
                    <div className="feature-icon">
                        <FaComments />
                    </div>
                    <div className="feature-content">
                        <h4>Retroalimentación</h4>
                        <p>Mejora continua:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Evaluación de la defensa</li>
                            <li><FaCheckCircle /> Sugerencias de mejora</li>
                            <li><FaCheckCircle /> Certificado de calidad</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="post-delivery-timeline">
                <div className="timeline-content">
                    <h4>Periodo de Acompañamiento</h4>
                    <p>Disfruta de nuestro apoyo por:</p>
                    <ul className="feature-list">
                        <li><FaClock /> 30 días después de la entrega</li>
                        <li><FaClock /> Extensión disponible</li>
                        <li><FaClock /> Soporte prioritario</li>
                    </ul>
                </div>
            </div>

            <div className="post-delivery-cta">
                <a href="/soporte" className="post-delivery-button">
                    Solicitar soporte
                </a>
                <p className="post-delivery-note">Nuestro equipo está listo para ayudarte</p>
            </div>
        </div>
    );
};

export default PostDeliveryModal; 