import { Container } from 'react-bootstrap';
import {
    FaFileAlt,
    FaSearch,
    FaRobot,
    FaCalendarCheck,
    FaUserTie,
    FaGraduationCap,
    FaWhatsapp,
    FaComments,
    FaArrowRight
} from 'react-icons/fa';
import './ServicesSection.css';

const services = [
    {
        icon: <FaFileAlt />,
        title: "Desarrollo Completo de Tesis",
        description: "Desde la selección del tema hasta las conclusiones. Cubrimos tesis, tesinas, ensayos y trabajos de investigación para todos los niveles académicos.",
        color: "#2563eb",
    },
    {
        icon: <FaSearch />,
        title: "Escáner Anti-Plagio (Turnitin)",
        description: "Cada trabajo pasa por Turnitin para garantizar 100% de originalidad. Recibe tu reporte de autenticidad como respaldo.",
        color: "#10b981",
    },
    {
        icon: <FaRobot />,
        title: "Escáner Anti-IA",
        description: "Verificamos que el contenido sea completamente humano. Pasamos los detectores de IA más exigentes del mercado.",
        color: "#8b5cf6",
    },
    {
        icon: <FaCalendarCheck />,
        title: "Entrega Puntual Garantizada",
        description: "Entrega desde 3 semanas con seguimiento en tiempo real. Cumplimos plazos sin excepción, tu tranquilidad es nuestra prioridad.",
        color: "#f59e0b",
    },
    {
        icon: <FaUserTie />,
        title: "Asesoría Personalizada",
        description: "Un asesor dedicado te acompaña durante todo el proceso. Resolvemos dudas, ajustamos cambios y te preparamos para tu defensa.",
        color: "#ef4444",
    },
    {
        icon: <FaGraduationCap />,
        title: "Acompañamiento hasta Titulación",
        description: "No terminamos con la entrega. Te apoyamos con correcciones, preparación de defensa y todo lo necesario hasta que tengas tu título.",
        color: "#0891b2",
    },
];

const processSteps = [
    { step: "01", title: "Contáctanos", desc: "Escríbenos por WhatsApp o chat para contarnos tu proyecto." },
    { step: "02", title: "Recibe tu plan", desc: "Te damos un plan personalizado con tiempos, costos y alcance." },
    { step: "03", title: "Desarrollo", desc: "Nuestro equipo trabaja tu tesis con seguimiento constante." },
    { step: "04", title: "Entrega y titulación", desc: "Recibes tu trabajo listo y te acompañamos hasta la defensa." },
];

const ServicesSection = ({ onOpenChat }) => {
    return (
        <section className="sections-overview" id="servicios">
            <Container>
                {/* ── What we do ── */}
                <div className="section-header">
                    <span className="section-subtitle">SERVICIOS DE TESIS PROFESIONAL EN MÉXICO</span>
                    <h2 className="section-title">
                        Todo lo que necesitas para{' '}<span className="highlight">hacer tu tesis y titularte</span>
                    </h2>
                    <p className="section-description">
                        ¿No sabes por dónde empezar tu tesis? Ofrecemos un servicio integral de desarrollo de tesis profesional
                        para licenciatura, maestría y doctorado. Cada proyecto es único, 100% original y recibe asesoría personalizada.
                        Incluye antiplagio Turnitin y detección anti-IA.
                    </p>
                </div>

                <div className="sections-grid">
                    {services.map((service, index) => (
                        <div key={index} className="section-link-wrapper">
                            <div
                                className="section-card"
                                style={{ '--card-color': service.color }}
                            >
                                <div className="card-content">
                                    <div className="icon-wrapper" style={{ background: `${service.color}15`, color: service.color }}>
                                        {service.icon}
                                    </div>
                                    <h3 className="card-title">{service.title}</h3>
                                    <p className="card-description">{service.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── How it works (process) ── */}
                <div className="section-header" style={{ marginTop: '5rem' }}>
                    <span className="section-subtitle">PROCESO PASO A PASO</span>
                    <h2 className="section-title">
                        ¿Cómo funciona el servicio de tesis de{' '}<span className="highlight">Tesipedia</span>?
                    </h2>
                </div>

                <div className="process-strip">
                    {processSteps.map((ps, i) => (
                        <div key={i} className="process-step-card">
                            <div className="process-step-number">{ps.step}</div>
                            <h4 className="process-step-title">{ps.title}</h4>
                            <p className="process-step-desc">{ps.desc}</p>
                            {i < processSteps.length - 1 && <FaArrowRight className="process-arrow" />}
                        </div>
                    ))}
                </div>

                {/* ── SEO Content Section ── */}
                <div className="seo-content-section" style={{ marginTop: '4rem', textAlign: 'left', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
                    <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <span className="highlight">Hacer Tesis en México</span> — El Servicio #1 del País
                    </h2>
                    <div style={{ color: '#666', lineHeight: '1.8', fontSize: '1rem' }}>
                        <p>
                            <strong>¿Necesitas hacer tu tesis?</strong> En Tesipedia somos el servicio líder en México para hacer tesis de licenciatura, maestría y doctorado.
                            Con más de 3,000 estudiantes titulados y un 98% de índice de aprobación, te hacemos tu tesis con la calidad que tu universidad exige.
                        </p>
                        <p>
                            Nuestro equipo de más de 50 asesores expertos cubre todas las áreas del conocimiento: derecho, administración, ingeniería, psicología,
                            educación, medicina, contaduría, arquitectura, ciencias sociales, humanidades y más. Hacemos tesis para estudiantes de la UNAM, IPN, ITESM,
                            UAM, UVM, UNITEC, La Salle, Anáhuac, Iberoamericana, BUAP, UdeG, UANL y todas las universidades públicas y privadas de México.
                        </p>
                        <p>
                            <strong>¿Por qué comprar tu tesis con Tesipedia?</strong> A diferencia de otros servicios, cada tesis que hacemos es 100% original,
                            elaborada por investigadores humanos y verificada con Turnitin y escáner anti-IA. No usamos plantillas ni reciclamos trabajos.
                            Tu tesis se desarrolla desde cero siguiendo los lineamientos específicos de tu universidad.
                        </p>
                        <p>
                            Ofrecemos tres modalidades: <strong>Desarrollo Completo</strong> (te hacemos toda tu tesis de inicio a fin),
                            <strong> Acompañamiento</strong> (trabajo conjunto con tu asesor asignado) y <strong>Corrección</strong> (revisión profesional de tu trabajo existente).
                            Todas incluyen escáner antiplagio Turnitin, detección anti-IA y correcciones de tu asesor universitario.
                        </p>
                        <p>
                            Los precios para hacer tu tesis van desde $6,300 MXN para artículos científicos hasta $19,800 MXN para tesis de licenciatura completas.
                            Aceptamos tarjetas de crédito, débito, transferencias, PayPal y OXXO. También manejamos pagos en parcialidades para tu comodidad.
                        </p>
                    </div>
                </div>

                {/* ── CTA ── */}
                <div className="services-cta">
                    <h3 className="services-cta-title">¿Listo para hacer tu tesis?</h3>
                    <p className="services-cta-desc">Te hacemos tu tesis con garantía de aprobación. Cotiza gratis hoy.</p>
                    <div className="services-cta-buttons">
                        <a
                            href="https://wa.me/525670071517?text=Hola%2C%20quiero%20información%20sobre%20el%20servicio%20de%20tesis"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="services-cta-btn services-cta-wa"
                        >
                            <FaWhatsapp /> Escribir por WhatsApp
                        </a>
                        <button onClick={onOpenChat} className="services-cta-btn services-cta-chat">
                            <FaComments /> Chat en Línea
                        </button>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default ServicesSection;
