import {
  FaWhatsapp, FaComments, FaArrowDown, FaStar,
} from 'react-icons/fa';
import HeroCarousel from './HeroCarousel';
import './HeroSection.css';

const WA = 'https://wa.me/525670071517?text=Hola%2C%20quiero%20cotizar%20la%20asesor%C3%ADa%20para%20mi%20tesis';

const SERVICES = [
  'Marco teórico', 'Metodología', 'Análisis de datos', 'Redacción con tu voz',
  'Normas APA', 'Revisión de originalidad', 'Preparación de defensa',
];

const HeroSection = ({ onOpenChat }) => {
  return (
    <section className="edh" aria-label="Asesoría de tesis en México">
      <div className="edh-grain" aria-hidden="true" />
      <span className="edh-watermark" aria-hidden="true">Tesis</span>

      <div className="edh-inner">
        {/* Masthead editorial */}
        <div className="edh-masthead edh-in">
          <span className="edh-kicker">Asesoría de Tesis · México</span>
          <span className="edh-meta">Desde 2019 — +3,000 estudiantes asesorados</span>
        </div>
        <hr className="edh-rule edh-in" />

        <div className="edh-grid">
          {/* Columna editorial */}
          <div className="edh-lead">
            <h1 className="edh-title edh-in">
              Te ayudamos a redactar
              {' '}<span className="edh-dash">—y a defender—</span>{' '}
              tu <span className="edh-emph">proyecto</span>.
            </h1>

            <p className="edh-sub edh-in edh-d1">
              Investigadores con posgrado te acompañan a redactar tu tesis de
              <strong> licenciatura, maestría y doctorado</strong>. Te guiamos capítulo por capítulo
              —metodología, citación correcta y revisión de originalidad— para que el resultado sea
              <strong> 100% tuyo</strong> y llegues con seguridad a tu examen profesional.
            </p>

            <div className="edh-stats edh-in edh-d2">
              <div className="edh-stat">
                <strong>4.9<span>/5</span></strong>
                <em><FaStar /> valoración</em>
              </div>
              <span className="edh-stat-sep" />
              <div className="edh-stat">
                <strong>3,000<span>+</span></strong>
                <em>estudiantes asesorados</em>
              </div>
              <span className="edh-stat-sep" />
              <div className="edh-stat">
                <strong>30<span>+</span></strong>
                <em>universidades</em>
              </div>
            </div>

            <div className="edh-ctas edh-in edh-d3">
              <a href={WA} target="_blank" rel="noopener noreferrer"
                className="edh-btn edh-btn-primary"
                data-track-cta="hero_whatsapp" data-track-label="Cotizar asesoría - Hero">
                <FaWhatsapp /> Quiero atención por WhatsApp
              </a>
              <a href="#como-funciona" className="edh-btn edh-btn-ghost" data-track-cta="hero_como">
                Cómo te acompañamos <FaArrowDown />
              </a>
            </div>

            <button onClick={onOpenChat} className="edh-chat edh-in edh-d3" data-track-cta="hero_chat">
              <FaComments /> o habla ahora con un asesor — respuesta en minutos
            </button>
          </div>

          {/* Carrusel dinámico: escáner, cómo te apoyamos, qué ofrecemos */}
          <aside className="edh-plate edh-in edh-d2">
            <HeroCarousel />
          </aside>
        </div>
      </div>

      {/* Ticker editorial de servicios */}
      <div className="edh-ticker edh-in edh-d3" aria-label="Áreas en las que te asesoramos">
        <span className="edh-ticker-label">Te acompañamos en</span>
        <div className="edh-ticker-mask">
          <div className="edh-ticker-track">
            {[...SERVICES, ...SERVICES].map((s, i) => (
              <span className="edh-ticker-item" key={i}><i /> {s}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
