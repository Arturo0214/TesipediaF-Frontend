import { Container } from 'react-bootstrap';
import {
  FaStar,
  FaCheckCircle,
  FaUniversity,
  FaQuoteLeft,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import './SuccessCasesSection.css';

const successCases = [
  {
    name: "Carlos M.",
    university: "UNAM",
    career: "Ingeniería Industrial",
    level: "Licenciatura",
    location: "CDMX",
    quote: "Llevaba meses estancado. En 8 semanas ya tenía mi tesis terminada, aprobada y hasta me llegó una oferta de trabajo en Alemania gracias a ella.",
    highlight: "Tesis terminada en 8 semanas",
    avatar: "CM",
  },
  {
    name: "Ana R.",
    university: "ITESM",
    career: "Psicología",
    level: "Maestría",
    location: "Monterrey",
    quote: "Desde la primera reunión sentí confianza total. Mi asesora fue cercana, clara y profesional. Hoy ya tengo mi título en manos.",
    highlight: "Título de maestría obtenido",
    avatar: "AR",
  },
  {
    name: "Roberto L.",
    university: "IBERO",
    career: "Administración",
    level: "Doctorado",
    location: "CDMX",
    quote: "Me ayudaron a estructurar desde cero. El seguimiento fue constante y superé las expectativas de mi comité evaluador.",
    highlight: "Comité evaluador superado",
    avatar: "RL",
  },
  {
    name: "María G.",
    university: "UAM",
    career: "Derecho",
    level: "Licenciatura",
    location: "CDMX",
    quote: "Trabajando y estudiando era imposible avanzar. Me apoyaron paso a paso. En 3 meses ya estaba lista para titularme.",
    highlight: "Lista en 3 meses",
    avatar: "MG",
  },
  {
    name: "Mauricio P.",
    university: "La Salle",
    career: "Medicina",
    level: "Licenciatura",
    location: "CDMX",
    quote: "Mi tesis requería datos clínicos delicados. Me guiaron con ética y precisión. Ya tengo mi cédula profesional.",
    highlight: "Cédula profesional obtenida",
    avatar: "MP",
  },
  {
    name: "Alexandra V.",
    university: "Anáhuac",
    career: "Psicología",
    level: "Maestría",
    location: "Estado de México",
    quote: "El comité reconoció la calidad del trabajo. Cada capítulo fue revisado a fondo. Fue una gran diferencia tener este respaldo.",
    highlight: "Reconocimiento del comité",
    avatar: "AV",
  },
];

const universities = [
  "UNAM", "IPN", "ITESM", "UAM", "IBERO", "La Salle",
  "Anáhuac", "BUAP", "UdeG", "UANL", "UV", "ITAM"
];

const SuccessCasesSection = () => {
  return (
    <section className="success-cases-section" id="casos-exito">
      <Container>
        {/* ── Header ── */}
        <div className="sc-header" data-aos="fade-up">
          <span className="sc-badge">CASOS DE ÉXITO REALES</span>
          <h2 className="sc-title">
            Estudiantes que ya se <span className="sc-highlight">titularon</span> con nosotros
          </h2>
          <p className="sc-subtitle">
            Conoce las historias de quienes confiaron en Tesipedia para lograr
            su título profesional de licenciatura, maestría y doctorado.
          </p>
        </div>

        {/* ── Cases Grid ── */}
        <div className="sc-grid" data-aos="fade-up">
          {successCases.map((c, i) => (
            <article key={i} className="sc-card">
              <div className="sc-card-top">
                <div className="sc-avatar">{c.avatar}</div>
                <div className="sc-card-info">
                  <h4 className="sc-card-name">{c.name}</h4>
                  <span className="sc-card-career">{c.career}</span>
                </div>
                <span className={`sc-level-badge sc-level-${c.level.toLowerCase()}`}>
                  {c.level}
                </span>
              </div>

              <div className="sc-card-uni">
                <FaUniversity className="sc-card-uni-icon" />
                <span>{c.university}</span>
                <FaMapMarkerAlt className="sc-card-loc-icon" />
                <span>{c.location}</span>
              </div>

              <div className="sc-card-quote">
                <FaQuoteLeft className="sc-quote-icon" />
                <p>{c.quote}</p>
              </div>

              <div className="sc-card-highlight">
                <FaCheckCircle className="sc-check" />
                <span>{c.highlight}</span>
              </div>

              <div className="sc-card-rating">
                {[...Array(5)].map((_, j) => (
                  <FaStar key={j} className="sc-star" />
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* ── Universities Strip ── */}
        <div className="sc-universities" data-aos="fade-up">
          <p className="sc-uni-label">Trabajamos con estudiantes de las mejores universidades de México</p>
          <div className="sc-uni-list">
            {universities.map((u, i) => (
              <span key={i} className="sc-uni-tag">{u}</span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default SuccessCasesSection;
