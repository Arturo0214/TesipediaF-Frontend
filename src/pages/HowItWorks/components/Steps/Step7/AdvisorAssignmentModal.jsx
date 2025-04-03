import React from 'react';
import { FaUserTie, FaGraduationCap, FaBook, FaStar, FaCheckCircle } from 'react-icons/fa';
import './AdvisorAssignmentModal.css';

const AdvisorAssignmentModal = () => {
    return (
        <div className="advisor-assignment-section">
            <h3 className="advisor-title">Asignación de Asesor Especializado</h3>
            <p className="advisor-description">Te conectamos con el experto ideal para tu proyecto</p>

            <div className="advisor-features">
                <div className="advisor-feature">
                    <div className="feature-icon">
                        <FaUserTie />
                    </div>
                    <div className="feature-content">
                        <h4>Perfilamiento del Asesor</h4>
                        <p>Selección basada en:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Experiencia en tu área</li>
                            <li><FaCheckCircle /> Nivel académico</li>
                            <li><FaCheckCircle /> Especialización específica</li>
                        </ul>
                    </div>
                </div>

                <div className="advisor-feature">
                    <div className="feature-icon">
                        <FaGraduationCap />
                    </div>
                    <div className="feature-content">
                        <h4>Calificación y Experiencia</h4>
                        <p>Nuestros asesores cuentan con:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Maestría o Doctorado</li>
                            <li><FaCheckCircle /> +5 años de experiencia</li>
                            <li><FaCheckCircle /> Publicaciones científicas</li>
                        </ul>
                    </div>
                </div>

                <div className="advisor-feature">
                    <div className="feature-icon">
                        <FaBook />
                    </div>
                    <div className="feature-content">
                        <h4>Áreas de Especialización</h4>
                        <p>Cobertura en múltiples disciplinas:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Ciencias Sociales</li>
                            <li><FaCheckCircle /> Ingenierías</li>
                            <li><FaCheckCircle /> Ciencias de la Salud</li>
                        </ul>
                    </div>
                </div>

                <div className="advisor-feature">
                    <div className="feature-icon">
                        <FaStar />
                    </div>
                    <div className="feature-content">
                        <h4>Proceso de Asignación</h4>
                        <p>Pasos para garantizar la mejor elección:</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Análisis de tu proyecto</li>
                            <li><FaCheckCircle /> Match con especialista</li>
                            <li><FaCheckCircle /> Confirmación mutua</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="advisor-cta">
                <a href="/asesores" className="advisor-button">
                    Conoce a nuestros asesores
                </a>
                <p className="advisor-note">La asignación se realiza en menos de 24 horas hábiles</p>
            </div>
        </div>
    );
};

export default AdvisorAssignmentModal; 