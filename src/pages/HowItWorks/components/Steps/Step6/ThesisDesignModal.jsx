import React from 'react';
import { FaFileAlt, FaFont, FaRuler, FaList, FaBook } from 'react-icons/fa';
import './ThesisDesignModal.css';

const ThesisDesignModal = () => {
    return (
        <div className="thesis-design-modal-section">
            <div className="thesis-design-modal-header">
                <h3 className="thesis-design-modal-title">Diseño Profesional de Tesis</h3>
                <p className="thesis-design-modal-description">Cumplimos con los estándares académicos más exigentes para garantizar la presentación perfecta de tu trabajo</p>
            </div>

            <div className="thesis-design-modal-grid">
                <div className="thesis-design-modal-card">
                    <div className="thesis-design-modal-card-icon">
                        <FaFileAlt />
                    </div>
                    <div className="thesis-design-modal-card-content">
                        <h4>Formato Institucional</h4>
                        <ul className="thesis-design-modal-list">
                            <li>Portada oficial según normas</li>
                            <li>Estructura requerida</li>
                            <li>Secciones obligatorias</li>
                        </ul>
                    </div>
                </div>

                <div className="thesis-design-modal-card">
                    <div className="thesis-design-modal-card-icon">
                        <FaFont />
                    </div>
                    <div className="thesis-design-modal-card-content">
                        <h4>Tipografía Profesional</h4>
                        <ul className="thesis-design-modal-list">
                            <li>Fuentes académicas</li>
                            <li>Tamaños apropiados</li>
                            <li>Jerarquía visual</li>
                        </ul>
                    </div>
                </div>

                <div className="thesis-design-modal-card">
                    <div className="thesis-design-modal-card-icon">
                        <FaRuler />
                    </div>
                    <div className="thesis-design-modal-card-content">
                        <h4>Espaciado y Márgenes</h4>
                        <ul className="thesis-design-modal-list">
                            <li>Márgenes exactos</li>
                            <li>Interlineado correcto</li>
                            <li>Espaciado uniforme</li>
                        </ul>
                    </div>
                </div>

                <div className="thesis-design-modal-card">
                    <div className="thesis-design-modal-card-icon">
                        <FaList />
                    </div>
                    <div className="thesis-design-modal-card-content">
                        <h4>Índices Automáticos</h4>
                        <ul className="thesis-design-modal-list">
                            <li>Tabla de contenidos</li>
                            <li>Índice de figuras</li>
                            <li>Índice de tablas</li>
                        </ul>
                    </div>
                </div>

                <div className="thesis-design-modal-card">
                    <div className="thesis-design-modal-card-icon">
                        <FaBook />
                    </div>
                    <div className="thesis-design-modal-card-content">
                        <h4>Referencias Bibliográficas</h4>
                        <ul className="thesis-design-modal-list">
                            <li>Estilos requeridos (APA, Chicago, etc.)</li>
                            <li>Citas en texto</li>
                            <li>Bibliografía completa</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="thesis-design-modal-cta">
                <a href="/cotizar" className="thesis-design-modal-button">
                    Solicitar Diseño Profesional
                </a>
                <p className="thesis-design-modal-note">* Este servicio está incluido en todos nuestros servicios de asesoría</p>
            </div>
        </div>
    );
};

export default ThesisDesignModal; 