import { Container } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FaUser, FaQuoteLeft } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './TestimonialsSection.css';

const testimonials = [
    {
        name: "Carlos",
        degree: "Ingeniería Industrial - UNAM",
        text: "Estaba muy estresado por mi tesis, llevaba meses sin avanzar. Con el apoyo del equipo logré terminarla en solo 8 semanas. El escáner antiplagio me dio tranquilidad total. Gracias a este proyecto, incluso conseguí una oferta de trabajo en Alemania. Fue mucho más que una asesoría.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    },
    {
        name: "Ana",
        degree: "Psicología - ITESM",
        text: "Al principio dudaba, pero desde la primera reunión sentí confianza. Mi asesora fue cercana, clara y profesional. Hoy ya tengo mi título en manos y un gran recuerdo del proceso.",
        rating: 5,
        badges: {
            type: "Tesina",
            level: "Maestría"
        }
    },
    {
        name: "Roberto",
        degree: "Administración - IBERO",
        text: "Me ayudaron a estructurar desde cero y presentar con argumentos sólidos. El seguimiento fue constante, y cada corrección sumó muchísimo al resultado final. Superé las expectativas del comité.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Doctorado"
        }
    },
    {
        name: "María",
        degree: "Derecho - UAM",
        text: "Trabajando y estudiando era casi imposible avanzar. Me apoyaron paso a paso, entendiendo mis tiempos y necesidades. En 3 meses ya estaba lista para titularme. Todo fue muy humano y eficiente.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    },
    {
        name: "Axel",
        degree: "Arquitectura - UNAM",
        text: "Más que una asesoría, fue un acompañamiento real. Me ayudaron a ordenar mis ideas y darles forma profesional. Además, aprendí cómo defenderla con seguridad.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    },
    {
        name: "Antonio",
        degree: "Ingeniería Mecánica - IPN",
        text: "Me preocupaba la originalidad por tanto contenido en internet. El escáner antiIA y antiplagio me dieron la certeza de que mi tesis era mía y única. Excelente experiencia.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    },
    {
        name: "Mauricio",
        degree: "Medicina - La Salle",
        text: "Mi tesis requería datos clínicos delicados. Me guiaron con ética y precisión. Nunca me sentí solo en el proceso. Ya tengo mi cédula y mucho agradecimiento.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    },
    {
        name: "Alexandra",
        degree: "Psicología - Anáhuac",
        text: "Lo que más valoro es su enfoque en la autenticidad. Cada capítulo fue revisado a fondo. El comité reconoció la calidad del trabajo. Fue una gran diferencia tener este respaldo.",
        rating: 5,
        badges: {
            type: "Tesina",
            level: "Maestría"
        }
    },
    {
        name: "Vanessa",
        degree: "Economía - UNAM",
        text: "No solo entendieron mis necesidades, también me apoyaron con normas APA, redacción y análisis estadístico. Todo muy claro y profesional.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    },
    {
        name: "Maximiliano",
        degree: "Nutrición - EDN-ISSSTE",
        text: "Gracias a la paciencia de mi asesor, pude construir un trabajo sólido. Me guiaron con empatía, profesionalismo y mucha dedicación.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    }
];

const TestimonialsSection = () => {
    return (
        <section className="testimonials-section">
            <Container>
                <div className="testimonials-header">
                    <div className="section-subtitle">Testimonios</div>
                    <h2 className="section-title">
                        <span className="section-title-decoration">
                            Lo que dicen nuestros graduados
                        </span>
                    </h2>
                </div>
                <div className="testimonials-wrapper" data-aos="fade-up">
                    <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={30}
                        slidesPerView={1}
                        centeredSlides={true}
                        loop={true}
                        autoplay={{
                            delay: 3500,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true
                        }}
                        pagination={{
                            clickable: true,
                        }}
                        navigation={true}
                        breakpoints={{
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 40,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 50,
                            },
                        }}
                        className="testimonials-swiper"
                    >
                        {testimonials.map((testimonial, index) => {
                            const { name, degree, text, rating, badges = {} } = testimonial;
                            const { type = "", level = "" } = badges;

                            return (
                                <SwiperSlide key={index}>
                                    <div
                                        className="testimonial-card"
                                        onMouseEnter={(e) => {
                                            const swiperInstance = e.currentTarget.closest('.swiper').swiper;
                                            swiperInstance.autoplay.stop();
                                        }}
                                        onMouseLeave={(e) => {
                                            const swiperInstance = e.currentTarget.closest('.swiper').swiper;
                                            swiperInstance.autoplay.start();
                                        }}
                                    >
                                        <div className="testimonial-content">
                                            {(type || level) && (
                                                <div className="testimonial-badges mb-2">
                                                    {type && <span className="badge-type">{type}</span>}
                                                    {level && <span className="badge-level" data-level={level}>{level}</span>}
                                                </div>
                                            )}
                                            <div className="testimonial-rating mb-3">
                                                {Array.from({ length: rating }).map((_, i) => (
                                                    <span key={i}>★</span>
                                                ))}
                                            </div>
                                            <div className="testimonial-quote">
                                                <FaQuoteLeft className="quote-icon" />
                                            </div>
                                            <p className="testimonial-text">{text}</p>
                                            <div className="testimonial-author">
                                                <div className="author-icon">
                                                    <FaUser />
                                                </div>
                                                <div className="author-info">
                                                    <h5 className="author-name">{name}</h5>
                                                    <p className="author-degree">{degree}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </Container>
        </section>
    );
};

export default TestimonialsSection;
