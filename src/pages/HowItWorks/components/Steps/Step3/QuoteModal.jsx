import React from 'react';
import './QuoteModal.css';

const QuoteModal = () => {
    return (
        <div className="quote-modal-section">
            <h3 className="quote-title">Requisitos para Cotizar</h3>
            <p className="quote-description">Para realizar tu cotización, necesitaremos los siguientes datos:</p>

            <div className="quote-requirements">
                <div className="quote-requirement">
                    <div className="requirement-number">1</div>
                    <div className="requirement-content">
                        <h4>Nivel académico</h4>
                        <p>Licenciatura, Maestría o Doctorado</p>
                    </div>
                </div>

                <div className="quote-requirement">
                    <div className="requirement-number">2</div>
                    <div className="requirement-content">
                        <h4>Área de estudio</h4>
                        <p>Campo específico de tu investigación</p>
                    </div>
                </div>

                <div className="quote-requirement">
                    <div className="requirement-number">3</div>
                    <div className="requirement-content">
                        <h4>Tema o línea de investigación</h4>
                        <p>Título o descripción breve de tu tesis</p>
                    </div>
                </div>

                <div className="quote-requirement">
                    <div className="requirement-number">4</div>
                    <div className="requirement-content">
                        <h4>Fecha de entrega requerida</h4>
                        <p>Plazo estimado para completar el trabajo</p>
                    </div>
                </div>

                <div className="quote-requirement">
                    <div className="requirement-number">5</div>
                    <div className="requirement-content">
                        <h4>Extensión aproximada</h4>
                        <p>Número de páginas o palabras requeridas</p>
                    </div>
                </div>

                <div className="quote-requirement">
                    <div className="requirement-number">6</div>
                    <div className="requirement-content">
                        <h4>Requisitos específicos</h4>
                        <p>Normas y lineamientos de tu institución</p>
                    </div>
                </div>
            </div>

            <div className="quote-cta">
                <a href="/cotizar" className="quote-button">
                    Realizar cotización
                </a>
                <p className="quote-note">Obtén tu cotización personalizada en menos de 5 minutos</p>
            </div>
        </div>
    );
};

export default QuoteModal; 