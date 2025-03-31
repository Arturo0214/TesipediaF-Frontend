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
        text: "Estaba muy estresado por mi tesis, llevaba meses estancado. Con la asesoría logré terminar en 8 semanas y obtuve mención honorífica. El escáner antiplagio me dio la tranquilidad de que mi trabajo era 100% original. Lo mejor fue que mi investigación llamó la atención de una empresa alemana y ahora trabajo como gerente de optimización de procesos. ¡La inversión valió muchísimo más de lo que esperaba!",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    },
    {
        name: "Ana",
        degree: "Psicología - ITESM",
        text: "Al principio dudaba en contratar el servicio, pero fue la mejor decisión. Mi asesora me guió paso a paso y me sorprendió la calidad del trabajo. Ahora ya tengo mi título y no podría estar más feliz.",
        rating: 5,
        badges: {
            type: "Tesina",
            level: "Licenciatura"
        }
    },
    {
        name: "Roberto",
        degree: "Administración - IBERO",
        text: "Increíble el nivel de profesionalismo. Me asignaron un asesor experto en mi tema que me ayudó a desarrollar una tesis que superó las expectativas de mi comité. El proceso fue muy claro y sin complicaciones. La metodología y el rigor académico fueron excepcionales.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Doctorado"
        }
    },
    {
        name: "María",
        degree: "Derecho - UAM",
        text: "Como estudiante que también trabaja, no tenía tiempo para mi tesis. Este servicio me salvó literalmente. En 3 meses ya estaba presentando mi trabajo. La metodología es excelente y el apoyo constante.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    },
    {
        name: "Axel",
        degree: "Arquitectura - UNAM",
        text: "Tesipedia no solo me ayudó a estructurar mi tesis, sino que también me enseñó cómo defenderla con seguridad. El acompañamiento fue tan humano como profesional. Lo recomiendo sin dudar.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    },
    {
        name: "Antonio",
        degree: "Ingeniería Mecánica - IPN",
        text: "Me preocupaba la originalidad de mi investigación, especialmente con toda la IA disponible hoy en día. El escáner antiIA y antiplagio de Tesipedia me dio la seguridad que necesitaba. Mi sinodal incluso felicitó la autenticidad del trabajo. El proceso fue claro y el apoyo excepcional.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    },
    {
        name: "Mauricio",
        degree: "Medicina - La Salle",
        text: "Mi proyecto requería mucha investigación y datos clínicos. El equipo de Tesipedia me ayudó a integrar todo con rigor académico y ética. Hoy ya tengo mi cédula profesional.",
        rating: 5,
        badges: {
            type: "Proyecto",
            level: "Licenciatura"
        }
    },
    {
        name: "Alexandra",
        degree: "Psicología - Anáhuac",
        text: "Lo que más me impresionó fue su compromiso con la originalidad. Cada capítulo pasó por su sistema antiplagio y antiIA, lo que me dio total confianza en mi defensa. Mi comité quedó impresionado con la calidad y autenticidad de la investigación. Tesipedia hizo la diferencia.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Maestría"
        }
    },
    {
        name: "Vanessa",
        degree: "Economía - UNAM",
        text: "Buscaba alguien que entendiera lo que mi universidad pedía. Aquí encontré eso y más. Me ayudaron con las normas APA, la redacción, y la parte estadística. Todo impecable.",
        rating: 5,
        badges: {
            type: "Tesis",
            level: "Licenciatura"
        }
    },
    {
        name: "Maximiliano",
        degree: "Nutrición - EDN-ISSSTE",
        text: "Estoy profundamente agradecido. Mi asesor fue paciente, preciso y profesional. Me ayudaron a construir una tesis sólida, bien argumentada y con fuentes actualizadas. Una experiencia excelente.",
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
                                                {"★".repeat(rating)}
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
