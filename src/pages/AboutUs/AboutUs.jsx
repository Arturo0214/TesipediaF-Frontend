import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
    FaUserGraduate,
    FaStar,
    FaChartLine,
    FaUsers,
    FaHandshake,
    FaArrowRight,
    FaWhatsapp,
    FaCalculator
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import './AboutUs.css';

function AboutUs() {
    const TesipediaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';

    const aboutSchema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "mainEntity": {
            "@type": "ProfessionalService",
            "name": "Tesipedia",
            "description": "Plataforma de referencia en habla hispana para la elaboración de tesis y asesoría académica profesional.",
            "foundingLocation": "Ciudad de México, México",
            "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 50, "unitText": "asesores" }
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com/" },
            { "@type": "ListItem", "position": 2, "name": "Sobre Nosotros", "item": "https://tesipedia.com/sobre-nosotros" }
        ]
    };

    return (
        <div className="page-aboutUs">
            <Helmet>
                <title>Sobre Nosotros | Tesipedia — +3,000 Estudiantes Titulados en México</title>
                <meta name="description" content="Conoce a Tesipedia: la plataforma #1 en México para desarrollo de tesis profesional. +3,000 titulados, 50+ asesores especializados, 98% de aprobación. Facilitamos tu titulación." />
                <meta name="keywords" content="quiénes somos Tesipedia, equipo Tesipedia, asesores de tesis México, empresa de tesis confiable, servicio de tesis profesional CDMX" />
                <meta property="og:title" content="Sobre Nosotros | Tesipedia — +3,000 Estudiantes Titulados" />
                <meta property="og:description" content="50+ asesores especializados y +3,000 estudiantes titulados. Conoce nuestra historia." />
                <meta property="og:url" content="https://tesipedia.com/sobre-nosotros" />
                <link rel="canonical" href="https://tesipedia.com/sobre-nosotros" />
                <script type="application/ld+json">{JSON.stringify(aboutSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </Helmet>
            <div className="page-aboutUs__hero">
                <Container>
                    <Row className="page-aboutUs__heroRow">
                        <Col lg={4} className="page-aboutUs__logoColumn">
                            <div className="page-aboutUs__logoContainer">
                                <img src={TesipediaLogo} alt="Tesipedia" className="page-aboutUs__logo" />
                            </div>
                        </Col>
                        <Col lg={8} className="page-aboutUs__contentColumn">
                            <div className="page-aboutUs__headerContent">
                                <h1 className="page-aboutUs__title">
                                    <span className="page-aboutUs__titleText">
                                        SOBRE NOSOTROS
                                    </span>
                                </h1>
                                <p className="page-aboutUs__subtitle">
                                    TRANSFORMANDO SUEÑOS ACADÉMICOS EN REALIDAD
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <section className="page-aboutUs__info-section">
                <Container>
                    <Row className="page-aboutUs__info-row">
                        <Col lg={4}>
                            <div className="page-aboutUs__info-card description">
                                <div className="page-aboutUs__info-icon">
                                    <FaUserGraduate />
                                </div>
                                <div className="page-aboutUs__info-content">
                                    <h3>¿Quiénes Somos?</h3>
                                    <p>
                                        En Tesipedia entendemos lo que implica estudiar, trabajar y al mismo tiempo intentar titularse. La presión del tiempo, la falta de orientación y el miedo a no cumplir con los estándares académicos son más comunes de lo que imaginas.
                                        Por eso, creamos Tesipedia: una plataforma diseñada para acompañarte en cada paso del proceso de titulación, con un equipo de especialistas que realmente comprende tus retos.
                                    </p>
                                </div>
                            </div>
                        </Col>
                        <Col lg={4}>
                            <div className="page-aboutUs__info-card mission">
                                <div className="page-aboutUs__info-icon">
                                    <FaStar />
                                </div>
                                <div className="page-aboutUs__info-content">
                                    <h3>Nuestra Misión</h3>
                                    <p>
                                        Facilitar el camino hacia la titulación mediante asesorías, herramientas tecnológicas y acompañamiento personalizado que se adapte al ritmo de vida de quienes estudian y trabajan.
                                    </p>
                                </div>
                            </div>
                        </Col>
                        <Col lg={4}>
                            <div className="page-aboutUs__info-card vision">
                                <div className="page-aboutUs__info-icon">
                                    <FaChartLine />
                                </div>
                                <div className="page-aboutUs__info-content">
                                    <h3>Nuestra Visión</h3>
                                    <p>
                                        Ser la plataforma de referencia en habla hispana para la elaboración de tesis y asesoría académica profesional, impulsando la educación de calidad y la culminación exitosa de estudios superiores.
                                    </p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="page-aboutUs__advisors-section">
                <Container>
                    <Row className="page-aboutUs__advisors-row">
                        <Col lg={7} className="page-aboutUs__advisors-col">
                            <div className="page-aboutUs__advisors-header text-center">
                                <h2 className="page-aboutUs__advisors-title">
                                    Nuestro Equipo de Expertos
                                </h2>
                                <p className="page-aboutUs__advisors-subtitle">
                                    Más de 50 asesores especializados listos para guiarte
                                </p>
                            </div>
                            <div className="page-aboutUs__advisors-content">
                                <div className="page-aboutUs__advisor-feature expertise">
                                    <div className="page-aboutUs__advisor-icon">
                                        <FaUsers />
                                    </div>
                                    <div className="page-aboutUs__advisor-text">
                                        <h3>Experiencia Multidisciplinaria</h3>
                                        <p>
                                            Nuestro equipo de más de 50 asesores especializados combina experiencia académica con conocimiento práctico en diversas áreas, garantizando un acompañamiento integral en tu proceso de titulación.
                                        </p>
                                    </div>
                                </div>
                                <div className="page-aboutUs__advisor-feature success">
                                    <div className="page-aboutUs__advisor-icon">
                                        <FaHandshake />
                                    </div>
                                    <div className="page-aboutUs__advisor-text">
                                        <h3>Compromiso con tu Éxito</h3>
                                        <p>
                                            Creamos un ambiente de aprendizaje óptimo donde cada estudiante recibe atención personalizada y apoyo continuo, asegurando la culminación exitosa de su proceso académico.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col lg={5} className="page-aboutUs__cta-col">
                            <div className="page-aboutUs__cta-content">
                                <h3 className="page-aboutUs__cta-title">
                                    ¿Listo para Comenzar?
                                </h3>
                                <p className="page-aboutUs__cta-text">
                                    Únete a los cientos de estudiantes que ya han alcanzado su meta académica con nosotros. Nuestros asesores están listos para guiarte en tu proceso de titulación.
                                </p>
                                <div className="page-aboutUs__cta-buttons">
                                    <a href="/contacto" className="page-aboutUs__cta-button blue-btn">
                                        Contactar con asesor
                                        <FaArrowRight />
                                    </a>
                                    <a href="https://wa.me/525670071517?text=Hola%2C%20quiero%20información%20sobre%20el%20servicio%20de%20tesis" target="_blank" rel="noopener noreferrer" className="page-aboutUs__cta-button green-btn">
                                        Contacto por WhatsApp
                                        <FaWhatsapp />
                                    </a>
                                    <a href="/contacto" className="page-aboutUs__cta-button orange-btn">
                                        Cotiza tu proyecto ahora
                                        <FaCalculator />
                                    </a>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
}

export default AboutUs; 