import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
    FaClipboardList,
    FaChartLine,
    FaTag,
    FaBookReader,
    FaHeadset,
    FaUserGraduate
} from 'react-icons/fa';
import './ServicesSection.css';

const sections = [
    {
        title: "Servicios",
        description: "Descubre nuestra gama completa de servicios académicos especializados en desarrollo y asesoría de tesis.",
        icon: <FaClipboardList />,
        path: "/servicios",
        color: "#2563eb",
        gradient: "linear-gradient(135deg, #3b82f6, #2563eb)"
    },
    {
        title: "Cómo Funciona",
        description: "Conoce nuestro proceso paso a paso y metodología para garantizar el éxito de tu proyecto académico.",
        icon: <FaChartLine />,
        path: "/como-funciona",
        color: "#7c3aed",
        gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)"
    },
    {
        title: "Precios",
        description: "Planes flexibles y transparentes adaptados a tus necesidades académicas y presupuesto.",
        icon: <FaTag />,
        color: "#059669",
        gradient: "linear-gradient(135deg, #10b981, #059669)",
        isPricing: true,
        buttons: [
            { text: "Ver Precios", path: "/precios", primary: true },
            { text: "Cotizar Tesis", path: "/cotizar", primary: false }
        ]
    },
    {
        title: "Blog",
        description: "Recursos, consejos y guías para potenciar tu desarrollo académico y profesional.",
        icon: <FaBookReader />,
        path: "/blog",
        color: "#dc2626",
        gradient: "linear-gradient(135deg, #ef4444, #dc2626)"
    },
    {
        title: "Contacto",
        description: "Estamos aquí para responder tus dudas y ayudarte a iniciar tu proyecto de tesis.",
        icon: <FaHeadset />,
        path: "/contacto",
        color: "#0891b2",
        gradient: "linear-gradient(135deg, #06b6d4, #0891b2)"
    },
    {
        title: "Área de Estudiantes",
        description: "Accede a tu cuenta o regístrate para comenzar tu proyecto de tesis con nosotros. ¡Tu éxito académico comienza aquí!",
        icon: <FaUserGraduate />,
        color: "#6366f1",
        gradient: "linear-gradient(135deg, #818cf8, #6366f1)",
        isStudentArea: true
    }
];

const ServicesSection = () => {
    return (
        <section className="sections-overview">
            <Container>
                <div className="section-header">
                    <h2 className="section-subtitle">NAVEGACIÓN</h2>
                    <h3 className="section-title">
                        Descubre todo lo que <span className="highlight">ofrecemos</span>
                    </h3>
                </div>
                <div className="sections-grid">
                    {sections.map((section, index) => (
                        <div key={index} className="section-link-wrapper">
                            <Card
                                className="section-card"
                                style={{
                                    '--card-gradient': section.gradient,
                                    '--card-color': section.color
                                }}
                            >
                                <div className="card-content">
                                    <div className="icon-wrapper">
                                        <span className="icon">{section.icon}</span>
                                    </div>
                                    <h3 className="card-title">{section.title}</h3>
                                    <p className="card-description">{section.description}</p>

                                    {section.isStudentArea ? (
                                        <div className="action-buttons">
                                            <Button
                                                as={Link}
                                                to="/login"
                                                variant="primary"
                                                className="action-btn"
                                            >
                                                Iniciar Sesión
                                            </Button>
                                            <Button
                                                as={Link}
                                                to="/register"
                                                variant="outline-primary"
                                                className="action-btn"
                                            >
                                                Registrarse
                                            </Button>
                                        </div>
                                    ) : section.isPricing ? (
                                        <div className="action-buttons">
                                            <Button
                                                as={Link}
                                                to="/precios"
                                                variant="primary"
                                                className="action-btn"
                                            >
                                                Ver Precios
                                            </Button>
                                            <Button
                                                as={Link}
                                                to="/cotizar"
                                                variant="outline-primary"
                                                className="action-btn"
                                            >
                                                Cotizar Tesis
                                            </Button>
                                        </div>
                                    ) : (
                                        <Link to={section.path} className="explore-link">
                                            Explorar
                                            <span className="arrow">→</span>
                                        </Link>
                                    )}
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default ServicesSection;
