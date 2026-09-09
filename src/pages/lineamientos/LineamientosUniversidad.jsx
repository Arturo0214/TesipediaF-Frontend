import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { trackVisit } from '../../features/visits/visitsSlice';
import { trackCTA, trackGoogleAdsConversion } from '../../services/eventService';
import { getLineamientoBySlug } from '../../data/lineamientos';
import { getGuia } from '../../data/guias';
import { LandingBreadcrumb, StickyWhatsApp, howToSchema } from '../landing/LandingShared';
import {
  FaWhatsapp, FaCheckCircle, FaFileAlt, FaClock, FaExclamationTriangle,
  FaExternalLinkAlt, FaArrowRight, FaBookOpen, FaUniversity, FaListUl,
} from 'react-icons/fa';
import '../landing/Landing.css';
import './Lineamientos.css';

const WA_LINK = 'https://wa.me/5215670071517?text=Hola%2C%20quiero%20asesor%C3%ADa%20para%20titularme';
const SITE = 'https://tesipedia.com';

export default function LineamientosUniversidad({ slug }) {
  const dispatch = useDispatch();
  const l = getLineamientoBySlug(slug);

  useEffect(() => {
    if (!l) return;
    dispatch(trackVisit({ path: `/${slug}`, referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
    window.scrollTo(0, 0);
  }, [dispatch, slug, l]);

  if (!l) return null;
  const guia = getGuia(l.guiaId);
  const canonical = `${SITE}/${l.lineSlug}`;
  const handleWA = (name) => { trackCTA(name, 'WhatsApp Lineamientos'); trackGoogleAdsConversion(); };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: l.titulo,
    description: l.metaDescription,
    author: { '@type': 'Organization', name: 'Tesipedia' },
    publisher: { '@type': 'Organization', name: 'Tesipedia', logo: { '@type': 'ImageObject', url: 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  };
  const procesoSchema = howToSchema(
    `Cómo titularte en la ${l.sigla}`,
    (l.proceso || []).map((p, i) => ({ name: `Paso ${i + 1}`, text: p })),
  );

  return (
    <div className="landing-page">
      <Helmet>
        <title>{l.metaTitle}</title>
        <meta name="description" content={l.metaDescription} />
        <meta name="keywords" content={l.keywords} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={l.metaTitle} />
        <meta property="og:description" content={l.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(procesoSchema)}</script>
      </Helmet>

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-badges">
            <span className="landing-hero-badge"><FaUniversity /> {l.sigla}</span>
            <span className="landing-hero-badge">Guía gratuita · Consulta {l.fechaConsulta}</span>
          </div>
          <h1>{l.titulo}</h1>
          <p className="landing-hero-sub">{l.intro}</p>
          <div className="landing-hero-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary" onClick={() => handleWA(`lin_${l.lineSlug}_hero`)}>
              <FaWhatsapp /> Asesoría para titularte
            </a>
            {guia && (
              <Link to={`/guias/${l.guiaId}`} className="landing-cta-secondary" onClick={() => handleWA(`lin_${l.lineSlug}_guia_hero`)}>
                Guía completa del trámite <FaArrowRight />
              </Link>
            )}
          </div>
        </div>
      </section>

      <LandingBreadcrumb items={[
        { label: 'Inicio', to: '/' },
        { label: 'Titulación', to: '/comprar-tesis' },
        { label: `Titulación ${l.sigla}` },
      ]} />

      {/* RESUMEN + AVISO */}
      <section className="landing-section">
        <p className="lin-resumen">{l.resumen}</p>
        <p className="lin-aviso">
          <FaExclamationTriangle /> Material informativo independiente, con fecha de consulta de {l.fechaConsulta}.
          No es un documento oficial de la {l.sigla}: confirma siempre los detalles en tu facultad o en servicios escolares.
        </p>
      </section>

      {/* OPCIONES */}
      <section className="landing-section">
        <h2>Opciones de titulación en la {l.sigla}</h2>
        <div className="lin-cards">
          {l.opciones.map((o, i) => (
            <div className="lin-card" key={i}>
              <h3>{o.nombre}</h3>
              {o.detalle && <p>{o.detalle}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* REQUISITOS + DOCUMENTOS */}
      <section className="landing-section-alt">
        <div className="lin-two">
          <div>
            <h2><FaCheckCircle /> Requisitos</h2>
            <ul className="lin-list">{l.requisitos.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
          <div>
            <h2><FaFileAlt /> Documentos</h2>
            <ul className="lin-list">{l.documentos.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="landing-section">
        <h2>El trámite paso a paso</h2>
        <ol className="lin-steps">{l.proceso.map((p, i) => <li key={i}>{p}</li>)}</ol>
      </section>

      {/* TIEMPOS + NOTAS */}
      <section className="landing-section landing-section-alt">
        <h2><FaClock /> Tiempos y vigencias</h2>
        <p className="landing-section-intro" style={{ marginBottom: l.notas.length ? 24 : 0 }}>{l.tiempos}</p>
        {l.notas.length > 0 && (
          <>
            <h3 className="lin-h3">Diferencias y advertencias</h3>
            <ul className="lin-list lin-list-center">{l.notas.map((n, i) => <li key={i}>{n}</li>)}</ul>
          </>
        )}
      </section>

      {/* CTA GUÍA DE PAGA */}
      {guia && (
        <section className="landing-section">
          <div className="car-guia">
            <div className="car-guia-copy">
              <span className="car-guia-kicker"><FaBookOpen /> Guía descargable · {guia.kicker}</span>
              <h2>{guia.nombre}</h2>
              <p>{guia.resumen}</p>
              <div className="car-guia-actions">
                <Link to={`/guias/${guia.id}`} className="landing-cta-primary" onClick={() => handleWA(`lin_${l.lineSlug}_guia`)}>
                  Ver la guía · ${guia.precio} MXN <FaArrowRight />
                </Link>
                {guia.muestraUrl && (
                  <a href={guia.muestraUrl} target="_blank" rel="noopener noreferrer" className="car-guia-sample">
                    <FaFileAlt /> Muestra gratis
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FUENTES + SIN CONFIRMAR */}
      <section className="landing-section-alt">
        <div className="lin-inner">
          <h2><FaListUl /> De dónde salió cada dato</h2>
          <ul className="lin-fuentes">
            {l.fuentes.map((f, i) => (
              <li key={i}>
                <a href={f.url} target="_blank" rel="noopener noreferrer">{f.label} <FaExternalLinkAlt /></a>
              </li>
            ))}
          </ul>
          {l.sinConfirmar.length > 0 && (
            <>
              <h3 className="lin-h3">Lo que conviene confirmar en tu facultad</h3>
              <ul className="lin-list">{l.sinConfirmar.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </>
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="landing-final-cta">
        <h2>¿Te ayudamos a titularte en la {l.sigla}?</h2>
        <p>Te asesoramos para hacer tu trabajo recepcional original y con la citación correcta, y te acompañamos con el trámite. Cotización gratis por WhatsApp.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary landing-cta-big" onClick={() => handleWA(`lin_${l.lineSlug}_final`)}>
          <FaWhatsapp /> Cotizar Mi Asesoría
        </a>
        <p className="landing-final-sub">
          También puedes ver la <Link to={`/${l.landingSlug}`}>asesoría de tesis para la {l.sigla}</Link>.
        </p>
      </section>

      <StickyWhatsApp onClick={() => handleWA(`lin_${l.lineSlug}_sticky`)} />
    </div>
  );
}
