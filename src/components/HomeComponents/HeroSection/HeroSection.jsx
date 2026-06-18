import {
  FaCheckCircle, FaShieldAlt, FaClock, FaWhatsapp, FaComments,
  FaStar, FaUserGraduate, FaArrowRight
} from 'react-icons/fa';
import './HeroSection.css';

const WA = 'https://wa.me/525670071517?text=Hola%2C%20quiero%20cotizar%20mi%20tesis';

const HeroSection = ({ stats = [], currentStat = 0, onOpenChat }) => {
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

        {/* DERECHA — tarjeta glass + stat rotativo */}
        <div className="hx-hero-right hx-reveal hx-reveal-2">
          <div className="hx-card">
            <div className="hx-card-head">
              <FaUserGraduate />
              <div>
                <strong>Cotización gratis en minutos</strong>
                <span>Sin compromiso · respuesta por WhatsApp</span>
              </div>
            </div>

            <div className="hx-stat-rotator" aria-live="polite">
              {stats.map((s, i) => (
                <div key={i} className={`hx-stat ${currentStat === i ? 'is-active' : ''}`}>
                  <span className="hx-stat-ico">{s.icon}</span>
                  <span className="hx-stat-num">{s.number}</span>
                  <span className="hx-stat-txt">{s.text}</span>
                </div>
              ))}
            </div>

            <div className="hx-card-grid">
              <div><strong>$110</strong><span>por página</span></div>
              <div><strong>98%</strong><span>aprobación</span></div>
              <div><strong>+50</strong><span>asesores</span></div>
            </div>

            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="hx-btn hx-btn-primary hx-btn-block"
              data-track-cta="hero_card_whatsapp"
              data-track-label="Cotizar gratis - Hero card"
            >
              <FaWhatsapp /> Cotizar ahora
            </a>
            <p className="hx-card-foot">Atendemos UNAM, IPN, UAM, Tec, UANL y todas las universidades de México</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
