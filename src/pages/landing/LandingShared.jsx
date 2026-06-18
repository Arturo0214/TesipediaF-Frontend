import { Link } from 'react-router-dom';
import { FaWhatsapp, FaStar } from 'react-icons/fa';

const WA_LINK = 'https://wa.me/5215670071517?text=Hola%2C%20quiero%20cotizar%20mi%20tesis';

// Franja de social proof (igual en todas las landings)
export function LandingStats() {
  const stats = [
    { num: '+3,000', label: 'Titulados' },
    { num: '98%', label: 'Aprobación' },
    { num: '+50', label: 'Asesores' },
    { num: '4.9', label: 'Calificación', star: true },
  ];
  return (
    <div className="landing-stats">
      {stats.map((s, i) => (
        <div className="landing-stat" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
          <span className="landing-stat-num">
            {s.num}{s.star && <FaStar className="stat-star" style={{ fontSize: '1rem', verticalAlign: 'middle', marginLeft: 4 }} />}
          </span>
          <span className="landing-stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// Breadcrumb visible (acompaña al BreadcrumbList schema)
export function LandingBreadcrumb({ items }) {
  return (
    <nav className="landing-breadcrumb" aria-label="Migas de pan">
      {items.map((it, i) => (
        <span key={i}>
          {it.to ? <Link to={it.to}>{it.label}</Link> : <strong>{it.label}</strong>}
          {i < items.length - 1 && <span>›</span>}
        </span>
      ))}
    </nav>
  );
}

// Botón de WhatsApp flotante (conversión)
export function StickyWhatsApp({ onClick }) {
  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="landing-sticky-wa"
      onClick={onClick}
      aria-label="Cotizar por WhatsApp"
    >
      <FaWhatsapp />
      <span className="wa-text">Cotizar gratis</span>
    </a>
  );
}

// Helper: schema HowTo del proceso (resultados enriquecidos en Google)
export function howToSchema(name, steps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
