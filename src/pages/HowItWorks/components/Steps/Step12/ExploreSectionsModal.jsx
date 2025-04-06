import React from 'react';
import { FaGraduationCap, FaBook, FaUsers, FaQuestionCircle, FaBlog, FaEnvelope, FaCheck, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import './step12.css';

const ExploreSectionsModal = () => {
    const sections = [
        {
            icon: <FaGraduationCap />,
            title: 'Inicio',
            description: 'Página principal con información general y destacados',
            link: '/'
        },
        {
            icon: <FaBook />,
            title: 'Servicios',
            description: 'Descubre todos nuestros servicios de asesoría y apoyo académico',
            link: '/servicios'
        },
        {
            icon: <FaUsers />,
            title: 'Nosotros',
            description: 'Conoce nuestro equipo y nuestra historia',
            link: '/nosotros'
        },
        {
            icon: <FaQuestionCircle />,
            title: 'FAQ',
            description: 'Preguntas frecuentes y respuestas sobre nuestros servicios',
            link: '/faq'
        },
        {
            icon: <FaBlog />,
            title: 'Blog',
            description: 'Artículos y recursos útiles para tu proyecto académico',
            link: '/blog'
        },
        {
            icon: <FaEnvelope />,
            title: 'Contacto',
            description: 'Formulario de contacto y canales de comunicación',
            link: '/contacto'
        }
    ];

    const pricingPlans = [
        {
            title: 'Maestría',
            price: '$380-$420 MXN',
            period: 'Por página',
            features: [
                'Investigación especializada',
                'Metodología avanzada',
                'Análisis profundo de datos',
                'Todo lo de licenciatura'
            ],
            buttonText: 'Cotizar',
            buttonLink: '/cotizar',
            discount: '10% OFF en pago directo'
        },
        {
            title: 'Licenciatura',
            price: '$280-$320 MXN',
            period: 'Por página',
            features: [
                'Corrección de fondo y estilo',
                'Escáner antiplagio profesional',
                'Escáner antiIA incluido',
                'Asesoría personalizada'
            ],
            buttonText: 'Cotizar',
            buttonLink: '/cotizar',
            isPopular: true,
            discount: '10% OFF en pago directo'
        },
        {
            title: 'Doctorado',
            price: '$480-$520 MXN',
            period: 'Por página',
            features: [
                'Investigación doctoral',
                'Análisis avanzado',
                'Publicación científica',
                'Todo lo de maestría'
            ],
            buttonText: 'Cotizar',
            buttonLink: '/cotizar',
            discount: '10% OFF en pago directo'
        }
    ];

    const paymentMethods = [
        {
            logo: 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714159/visa-svgrepo-com_lpwqqd.svg',
            title: 'Visa'
        },
        {
            logo: 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714158/mc_symbol_zpes4d.svg',
            title: 'Mastercard'
        },
        {
            logo: 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714158/amex-svgrepo-com_m3vtdk.svg',
            title: 'Amex'
        },
        {
            logo: 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714159/paypal-svgrepo-com_wl94rq.svg',
            title: 'PayPal'
        },
        {
            logo: 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714158/bank-transfer_shbqgk.png',
            title: 'SPEI',
            hasDiscount: true
        },
        {
            logo: 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743714159/qr-code_bk38y1.png',
            title: 'QR',
            hasDiscount: true
        }
    ];

    return (
        <div className="step12-explore-modal">
            <div className="step12-header">
                <h2 className="step12-title">Explora Nuestras Secciones</h2>
                <p className="step12-description">
                    Descubre todo lo que tenemos para ofrecerte en cada sección de nuestra plataforma.
                    Navega fácilmente y encuentra la información que necesitas.
                </p>
            </div>

            <div className="step12-sections-grid">
                {sections.map((section, index) => (
                    <a
                        key={index}
                        href={section.link}
                        className="step12-section-card"
                    >
                        <div className="step12-section-icon">
                            {section.icon}
                        </div>
                        <h3 className="step12-section-title">{section.title}</h3>
                        <p className="step12-section-description">{section.description}</p>
                    </a>
                ))}
            </div>

            <div className="step12-pricing">
                <div className="step12-header">
                    <h2 className="step12-title">Inversión en tu Futuro Académico</h2>
                    <p className="step12-description">
                        Planes diseñados para garantizar el éxito de tu tesis
                    </p>
                </div>

                <div className="step12-pricing-grid">
                    {pricingPlans.map((plan, index) => (
                        <div key={index} className="step12-price-card">
                            {plan.isPopular && (
                                <span className="step12-popular-badge">Más Popular</span>
                            )}
                            <h3 className="step12-price-title">{plan.title}</h3>
                            <div className="step12-price-amount">
                                {plan.price}
                                <span className="step12-price-period">{plan.period}</span>
                            </div>
                            <ul className="step12-price-features">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="step12-price-feature">
                                        <FaCheck /> {feature}
                                    </li>
                                ))}
                            </ul>
                            <div className="step12-price-guarantee">
                                <FaShieldAlt /> Garantía de satisfacción
                            </div>
                            <div className="step12-price-discount">{plan.discount}</div>
                            <a href={plan.buttonLink} className="step12-price-button">
                                {plan.buttonText}
                            </a>
                        </div>
                    ))}
                </div>

                <div className="step12-payment-section">
                    <div className="step12-header">
                        <h3 className="step12-payment-title">Métodos de Pago</h3>
                        <p className="step12-payment-subtitle">Elige tu forma de pago preferida</p>
                    </div>

                    <div className="step12-payment-grid">
                        {paymentMethods.map((method, index) => (
                            <div key={index} className="step12-payment-method">
                                <img src={method.logo} alt={method.title} className="step12-payment-method-logo" />
                                <span className="step12-payment-method-title">{method.title}</span>
                                {method.hasDiscount && (
                                    <span className="step12-payment-discount-tag">-10%</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="step12-payment-cta">
                        <a href="/cotizar" className="step12-price-button">
                            <FaArrowRight /> Cotizar Ahora
                        </a>
                        <p className="step12-payment-cta-text">Cotización personalizada en 5 minutos</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExploreSectionsModal; 