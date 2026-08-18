import {
  FaCheckCircle, FaShieldAlt, FaClock, FaWhatsapp, FaComments,
  FaStar, FaArrowRight, FaUserGraduate, FaGraduationCap, FaFileAlt, FaPenFancy, FaUserTie,
  FaSearch, FaRobot, FaChartBar, FaBookOpen, FaFlask, FaChalkboardTeacher,
} from 'react-icons/fa';
import './HeroSection.css';

const WA = 'https://wa.me/525670071517?text=Hola%2C%20quiero%20cotizar%20mi%20tesis';
const HERO_IMG = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&q=72&auto=format&fit=crop';

const MARQUEE = [
  { i: <FaFileAlt />, t: 'Asesoría en tesis completa' },
  { i: <FaPenFancy />, t: 'Revisión y estilo' },
  { i: <FaUserTie />, t: 'Asesoría y acompañamiento' },
  { i: <FaSearch />, t: 'Revisión de originalidad' },
  { i: <FaRobot />, t: 'Trabajo 100% tuyo, con guía' },
  { i: <FaBookOpen />, t: 'Marco teórico' },
  { i: <FaFlask />, t: 'Metodología' },
  { i: <FaChartBar />, t: 'Análisis de datos' },
  { i: <FaChalkboardTeacher />, t: 'Preparación de defensa' },
  { i: <FaGraduationCap />, t: 'Hasta tu examen' },
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
            <FaStar /> +3,000 estudiantes asesorados · Asesoría 100% humana
          </span>
          <h1 className="hx-title">
            ¿Buscas quién te haga la tesis? Te asesoramos para hacer tu <span className="hx-grad">tesis profesional</span> y titularte sin estrés
          </h1>
          <p className="hx-sub">
            Te asesoramos en tu tesis de licenciatura, maestría y doctorado en México: te guiamos
            en la redacción con citación correcta y revisión de originalidad, para que sea 100% tuya.
            Desde <strong>$110 por página</strong>, avances desde 3 semanas.
          </p>

          <div className="hx-chips">
            <span><FaCheckCircle /> Acompañamiento hasta tu defensa</span>
            <span><FaShieldAlt /> Trabajo original, redactado por ti con nuestra guía</span>
            <span><FaClock /> Primeros avances desde 3 semanas</span>
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
              alt="Estudiantes celebrando su titulación tras la asesoría de tesis en México"
              width="900"
              height="600"
              loading="eager"
              fetchpriority="high"
            />
            <div className="hx-visual-shade" />

            {/* tarjeta flotante: acompañamiento */}
            <div className="hx-float hx-float-rating">
              <div className="hx-float-stars">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <div>
                <strong>Asesoría cercana</strong>
                <span>Acompañamiento en cada etapa</span>
              </div>
            </div>

            {/* tarjeta flotante: titulados */}
            <div className="hx-float hx-float-grad">
              <span className="hx-float-ico"><FaUserGraduate /></span>
              <div>
                <strong>+3,000 estudiantes asesorados</strong>
                <span>en las mejores universidades de México</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cinta de servicios (auto-scroll) */}
      <div className="hx-marquee hx-reveal" aria-label="Lo que ofrecemos">
        <span className="hx-marquee-label">Así te acompañamos en tu tesis</span>
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
