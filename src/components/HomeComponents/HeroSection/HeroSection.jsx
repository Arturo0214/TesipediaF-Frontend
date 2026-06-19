import {
  FaCheckCircle, FaShieldAlt, FaClock, FaWhatsapp, FaComments,
  FaStar, FaArrowRight, FaUserGraduate, FaGraduationCap, FaFileAlt, FaPenFancy, FaUserTie,
  FaSearch, FaRobot, FaChartBar, FaBookOpen, FaFlask, FaChalkboardTeacher,
} from 'react-icons/fa';
import './HeroSection.css';

const WA = 'https://wa.me/525670071517?text=Hola%2C%20quiero%20cotizar%20mi%20tesis';
const HERO_IMG = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&q=72&auto=format&fit=crop';

const MARQUEE = [
  { i: <FaFileAlt />, t: 'Tesis completa' },
  { i: <FaPenFancy />, t: 'Corrección y estilo' },
  { i: <FaUserTie />, t: 'Asesoría y acompañamiento' },
  { i: <FaSearch />, t: 'Antiplagio Turnitin' },
  { i: <FaRobot />, t: 'Detección anti-IA' },
  { i: <FaBookOpen />, t: 'Marco teórico' },
  { i: <FaFlask />, t: 'Metodología' },
  { i: <FaChartBar />, t: 'Análisis de datos' },
  { i: <FaChalkboardTeacher />, t: 'Preparación de defensa' },
  { i: <FaGraduationCap />, t: 'Hasta titularte' },
];

const HeroSection = ({ onOpenChat }) => {
  return (
    <section className="hx-hero">
      <div className="hx-hero-glow hx-hero-glow-1" />
      <div className="hx-hero-glow hx-hero-glow-2" />
      <div className="hx-hero-inner">
        {/* IZQUIERDA */}
        <div className="hx-hero-left hx-reveal">
          <span className="hx-eyebrow">
            <FaStar /> 4.9/5 · +3,000 titulados · 100% humano, sin IA
          </span>
          <h1 className="hx-title">
            Hacemos tu <span className="hx-grad">tesis profesional</span> para que te titules sin estrés
          </h1>
          <p className="hx-sub">
            Elaboramos tu tesis de licenciatura, maestría y doctorado en México: 100% original,
            con citación correcta y revisión de originalidad. Desde <strong>$110 por página</strong>,
            entrega desde 3 semanas.
          </p>

          <div className="hx-chips">
            <span><FaCheckCircle /> Garantía de aprobación</span>
            <span><FaShieldAlt /> Sin plagio ni IA</span>
            <span><FaClock /> Entrega desde 3 semanas</span>
          </div>

          <div className="hx-ctas">
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="hx-btn hx-btn-primary"
              data-track-cta="hero_whatsapp"
              data-track-label="Cotizar gratis - Hero"
            >
              <FaWhatsapp /> Cotizar mi tesis gratis
            </a>
            <a href="#precios" className="hx-btn hx-btn-ghost" data-track-cta="hero_precios">
              Ver precios <FaArrowRight />
            </a>
          </div>

          <button onClick={onOpenChat} className="hx-chatlink" data-track-cta="hero_chat">
            <FaComments /> o chatea ahora con un asesor — respuesta inmediata
          </button>
        </div>

        {/* DERECHA — visual humano + prueba social flotante */}
        <div className="hx-hero-right hx-reveal hx-reveal-2">
          <div className="hx-visual">
            <img
              className="hx-visual-img"
              src={HERO_IMG}
              alt="Estudiantes graduados celebrando su titulación en México"
              width="900"
              height="600"
              loading="eager"
              fetchpriority="high"
            />
            <div className="hx-visual-shade" />

            {/* tarjeta flotante: rating */}
            <div className="hx-float hx-float-rating">
              <div className="hx-float-stars">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <div>
                <strong>4.9 / 5</strong>
                <span>Calificación de estudiantes</span>
              </div>
            </div>

            {/* tarjeta flotante: titulados */}
            <div className="hx-float hx-float-grad">
              <span className="hx-float-ico"><FaUserGraduate /></span>
              <div>
                <strong>+3,000 titulados</strong>
                <span>en las mejores universidades de México</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cinta de servicios (auto-scroll) */}
      <div className="hx-marquee hx-reveal" aria-label="Lo que ofrecemos">
        <span className="hx-marquee-label">Todo lo que hacemos por tu tesis</span>
        <div className="hx-marquee-mask">
          <div className="hx-marquee-track">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span className="hx-mq-item" key={i}>{m.i} {m.t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
