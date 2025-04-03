import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaCheckCircle, FaShieldAlt, FaClock, FaUserGraduate, FaHandshake, FaChartLine, FaPercent, FaMoneyBillWave, FaCreditCard, FaArrowRight } from 'react-icons/fa';
import './GuaranteeSection.css';

const GuaranteeSection = () => {
    const guarantees = [
        {
            icon: <FaShieldAlt />,
            title: "Garantía de Calidad",
            description: "Cada tesis es revisada por expertos académicos con más de 10 años de experiencia en investigación.",
            highlight: "100% Original",
            color: "#4F46E5"
        },
        {
            icon: <FaClock />,
            title: "Entrega Puntual",
            description: "Cumplimos con los plazos establecidos. Tu tesis estará lista cuando la necesites.",
            highlight: "A tiempo",
            color: "#10B981"
        },
        {
            icon: <FaUserGraduate />,
            title: "Asesoría Personalizada",
            description: "Trabajamos contigo en cada paso, adaptándonos a tus necesidades específicas.",
            highlight: "Dedicación Total",
            color: "#F59E0B"
        },
        {
            icon: <FaHandshake />,
            title: "Satisfacción Garantizada",
            description: "Si no estás completamente satisfecho, trabajaremos hasta que lo estés.",
            highlight: "Sin compromiso",
            color: "#EF4444"
        },
        {
            icon: <FaCheckCircle />,
            title: "Rigor Académico",
            description: "Cada tesis cumple con los más altos estándares académicos y metodológicos.",
            highlight: "Excelencia",
            color: "#8B5CF6"
        },
        {
            icon: <FaChartLine />,
            title: "Resultados Comprobados",
            description: "Más de 1000 estudiantes han logrado su título con nuestras tesis.",
            highlight: "Éxito Garantizado",
            color: "#3B82F6"
        }
    ];

    return (
        <section className="tesi-guarantee-section">
            <div className="tesi-guarantee-container">
                <div className="tesi-guarantee-header">
                    <h2 className="tesi-guarantee-title">
                        ¿Por qué elegir <span className="tesi-highlight">Tesipedia</span>?
                    </h2>
                    <p className="tesi-guarantee-subtitle">
                        La diferencia que marca el éxito en tu tesis
                    </p>
                </div>

                <div className="tesi-guarantee-grid">
                    {guarantees.map((guarantee, index) => (
                        <div
                            key={index}
                            className="tesi-guarantee-item"
                            style={{ '--item-color': guarantee.color }}
                        >
                            <div className="tesi-guarantee-icon-wrapper">
                                <div className="tesi-guarantee-icon" style={{ backgroundColor: `${guarantee.color}15` }}>
                                    {guarantee.icon}
                                </div>
                            </div>
                            <div className="tesi-guarantee-content">
                                <h3 className="tesi-guarantee-item-title">{guarantee.title}</h3>
                                <p className="tesi-guarantee-item-description">{guarantee.description}</p>
                                <div className="tesi-guarantee-highlight">
                                    <FaCheckCircle className="tesi-check-icon" />
                                    <span>{guarantee.highlight}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="tesi-guarantee-cta">
                    <div className="tesi-guarantee-cta-left">
                        <div className="tesi-guarantee-cta-header">
                            <h2 className="tesi-guarantee-cta-title">¡Oferta Especial por Tiempo Limitado!</h2>
                            <div className="tesi-guarantee-discount-tag">
                                <FaPercent className="discount-icon" />
                                10% DE DESCUENTO
                            </div>
                        </div>
                        <div className="tesi-guarantee-benefits">
                            <div className="tesi-guarantee-benefit-item">
                                <FaCheck className="benefit-icon" />
                                Asesoría inicial gratuita
                            </div>
                        </div>
                        <p className="tesi-guarantee-cta-text">
                            Ahorra 10% de tu tesis al pagar con:
                        </p>
                    </div>
                    <div className="tesi-guarantee-cta-right">
                        <div className="tesi-guarantee-payment-methods">
                            <div className="payment-method">
                                <FaMoneyBillWave className="payment-icon" />
                                <div className="payment-info">
                                    <span>Transferencia Bancaria</span>
                                    <span className="payment-discount">10% de descuento</span>
                                </div>
                            </div>
                            <div className="payment-method">
                                <FaCreditCard className="payment-icon" />
                                <div className="payment-info">
                                    <span>Retiro sin Tarjeta</span>
                                    <span className="payment-discount">10% de descuento</span>
                                </div>
                            </div>
                        </div>
                        <Link to="/cotizar" className="tesi-guarantee-cta-button">
                            Cotizar Ahora <FaArrowRight className="arrow-icon" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GuaranteeSection;
