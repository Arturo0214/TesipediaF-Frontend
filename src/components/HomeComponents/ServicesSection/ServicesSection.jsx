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
        title: "Asesoría Integral de Tesis",
        description: "Desde la selección del tema hasta las conclusiones. Te guiamos en tesis, tesinas, ensayos y trabajos de investigación para todos los niveles académicos.",
        color: "#2563eb",
    },
    {
        icon: <FaSearch />,
        title: "Revisión de Originalidad",
        description: "Revisamos la originalidad de tu trabajo y te apoyamos a fortalecer citas y referencias. Recibe orientación para que tu tesis sea sólida y propia.",
        color: "#10b981",
    },
    {
        icon: <FaRobot />,
        title: "Trabajo 100% Tuyo, con Guía",
        description: "Tu tesis la redactas tú con la asesoría de investigadores humanos: un trabajo original, sin plantillas ni contenido genérico.",
        color: "#8b5cf6",
    },
    {
        icon: <FaCalendarCheck />,
        title: "Avances a Tiempo",
        description: "Primeros avances desde 3 semanas con seguimiento en tiempo real. Respetamos tus tiempos, tu tranquilidad es nuestra prioridad.",
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
        title: "Acompañamiento hasta tu Defensa",
        description: "No terminamos con la última revisión. Te apoyamos con ajustes, preparación de defensa y todo lo necesario hasta tu examen profesional.",
        color: "#0891b2",
    },
];

const processSteps = [
    { step: "01", title: "Contáctanos", desc: "Escríbenos por WhatsApp o chat para contarnos tu proyecto." },
    { step: "02", title: "Recibe tu plan", desc: "Te damos un plan de asesoría personalizado con tiempos, costos y alcance." },
    { step: "03", title: "Asesoría y avances", desc: "Avanzas tu tesis con la guía de tu asesor y seguimiento constante." },
    { step: "04", title: "Defensa y titulación", desc: "Tu tesis queda lista y te acompañamos hasta tu examen profesional." },
];

const ServicesSection = ({ onOpenChat }) => {
    return (
        <section className="sections-overview" id="servicios">
            <Container>
                {/* ── What we do ── */}
                <div className="section-header">
                    <span className="section-subtitle">ASESORÍA DE TESIS PROFESIONAL EN MÉXICO</span>
                    <h2 className="section-title">
                        Todo lo que necesitas para{' '}<span className="highlight">hacer tu tesis y titularte</span>
                    </h2>
                    <p className="section-description">
                        ¿No sabes por dónde empezar tu tesis? Ofrecemos un servicio integral de asesoría de tesis profesional
                        para licenciatura, maestría y doctorado. Cada proyecto es único, tu tesis es 100% tuya y recibes asesoría personalizada,
                        con revisión de originalidad en cada etapa.
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
                        ¿Cómo funciona la asesoría de tesis de{' '}<span className="highlight">Tesipedia</span>?
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
                        <span className="highlight">Hacer Tesis en México</span> — La Asesoría #1 del País
                    </h2>
                    <div style={{ color: '#666', lineHeight: '1.8', fontSize: '1rem' }}>
                        <p>
                            <strong>¿Necesitas hacer tu tesis?</strong> En Tesipedia somos la asesoría líder en México para hacer tesis de licenciatura, maestría y doctorado.
                            Con más de 3,000 estudiantes asesorados, te acompañamos para que termines tu tesis con la calidad que tu universidad exige.
                        </p>
                        <p>
                            Nuestro equipo de más de 50 asesores expertos cubre todas las áreas del conocimiento: derecho, administración, ingeniería, psicología,
                            educación, medicina, contaduría, arquitectura, ciencias sociales, humanidades y más. Asesoramos a estudiantes de la UNAM, IPN, ITESM,
                            UAM, UVM, UNITEC, La Salle, Anáhuac, Iberoamericana, BUAP, UdeG, UANL y todas las universidades públicas y privadas de México.
                        </p>
                        <p>
                            <strong>¿Por qué asesorarte con Tesipedia?</strong> A diferencia de otros servicios, tu tesis es 100% tuya:
                            la redactas con la guía de investigadores humanos y te apoyamos con revisión de originalidad. No usamos plantillas ni reciclamos trabajos.
                            Tu tesis se construye desde cero siguiendo los lineamientos específicos de tu universidad.
                        </p>
                        <p>
                            Ofrecemos tres modalidades: <strong>Asesoría Integral</strong> (te guiamos en toda tu tesis de inicio a fin),
                            <strong> Acompañamiento</strong> (tutoría continua con tu asesor asignado) y <strong>Revisión</strong> (revisión profesional de tu borrador existente).
                            Todas incluyen revisión de originalidad y la guía de tu asesor especializado.
                        </p>
                        <p>
                            Los precios de la asesoría de tesis van desde $6,300 MXN para artículos científicos hasta $19,800 MXN para tesis de licenciatura completas.
                            Aceptamos tarjetas de crédito, débito, transferencias, PayPal y OXXO. También manejamos pagos en parcialidades para tu comodidad.
                        </p>
                    </div>
                </div>

                {/* ── CTA ── */}
                <div className="services-cta">
                    <h3 className="services-cta-title">¿Listo para hacer tu tesis?</h3>
                    <p className="services-cta-desc">Te asesoramos en cada etapa para que la termines tú. Cotiza gratis hoy.</p>
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
