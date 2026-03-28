import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { trackVisit } from '../../features/visits/visitsSlice';
import { trackCTA } from '../../services/eventService';
import {
  FaWhatsapp, FaCheckCircle, FaClock, FaLaptop,
  FaUserGraduate, FaStar, FaShieldAlt, FaGraduationCap,
  FaPhoneAlt, FaPaperPlane
} from 'react-icons/fa';
import './Landing.css';
import './CotizarLanding.css';

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_COTIZAR_URL || 'https://primary-production-73558.up.railway.app/webhook/1b8bd3b7-14f4-474f-b513-cd180620578e';
const WA_LINK = 'https://wa.me/5215670071517?text=Hola%2C%20quiero%20cotizar%20mi%20tesis';
const LOGO_URL = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';
const PREVIEW_IMG = 'https://tesipedia.com/preview.jpg';

const TIPOS_PROYECTO = [
  'Tesis de Licenciatura',
  'Tesis de Maestría',
  'Tesis de Doctorado',
  'Tesina',
  'Ensayo',
  'Artículo de investigación',
  'Protocolo de investigación',
  'Proyecto de titulación',
  'Otro'
];

/** Normaliza un teléfono mexicano a E.164 */
function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  // Si viene con 52 al inicio (código país)
  if (digits.startsWith('52') && digits.length === 12) {
    return { clean: digits.slice(2), e164: `+${digits}` };
  }
  // Si viene con 521 (formato viejo móvil)
  if (digits.startsWith('521') && digits.length === 13) {
    return { clean: digits.slice(3), e164: `+52${digits.slice(3)}` };
  }
  // 10 dígitos nacionales
  if (digits.length === 10) {
    return { clean: digits, e164: `+52${digits}` };
  }
  return null; // inválido
}

function CotizarLanding() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(trackVisit({ path: '/cotizar', referrer: document.referrer || 'Direct', userAgent: navigator.userAgent }));
    window.scrollTo(0, 0);
  }, [dispatch]);

  // Form state
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    carrera: '',
    tipo_proyecto: '',
    fecha_entrega: ''
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const validate = useCallback(() => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'Ingresa tu nombre completo';
    if (!form.telefono.trim()) {
      errs.telefono = 'Ingresa tu número de WhatsApp';
    } else if (!normalizePhone(form.telefono)) {
      errs.telefono = 'Ingresa un número válido de 10 dígitos (ej: 5512345678)';
    }
    if (!form.carrera.trim()) errs.carrera = 'Ingresa tu carrera';
    if (!form.tipo_proyecto) errs.tipo_proyecto = 'Selecciona el tipo de proyecto';
    if (!form.fecha_entrega) errs.fecha_entrega = 'Selecciona una fecha aproximada';
    return errs;
  }, [form]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStatus('loading');
    const phone = normalizePhone(form.telefono);

    const payload = {
      nombre: form.nombre.trim(),
      telefono: phone.clean,
      telefono_e164: phone.e164,
      carrera: form.carrera.trim(),
      tipo_proyecto: form.tipo_proyecto,
      fecha_entrega: form.fecha_entrega,
      source: 'landing_tesipedia_instagram',
      page: '/cotizar',
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error al enviar');
      setStatus('success');
      trackCTA('cotizar_form_submit', 'Landing Cotizar');

      // Reset form
      setForm({ nombre: '', telefono: '', carrera: '', tipo_proyecto: '', fecha_entrega: '' });
    } catch {
      setStatus('error');
    }
  }, [form, validate]);

  // Schema.org Service
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Asesoría Tesipedia",
    "description": "Servicio de asesoría y cotización para tesis, tesinas, tareas y proyectos de titulación.",
    "provider": {
      "@type": "Organization",
      "name": "Tesipedia",
      "url": "https://tesipedia.com",
      "logo": LOGO_URL
    },
    "areaServed": "MX",
    "url": "https://tesipedia.com/cotizar",
    "serviceType": "Asesoría de tesis",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "MXN",
      "lowPrice": "110",
      "highPrice": "250",
      "unitText": "por página"
    }
  };

  // Mínimo de fecha: mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="landing-page cotizar-landing">
      <Helmet>
        <title>Cotiza tu tesis con Tesipedia | Asesoría profesional para titulación</title>
        <meta name="description" content="Asesoría personalizada para tu titulación. Agenda o cotiza en menos de 2 minutos. Tesis, tesinas, tareas y proyectos de titulación." />
        <meta name="keywords" content="cotizar tesis, cotización tesis México, asesoría tesis, hacer mi tesis, comprar tesis, Tesipedia cotizar" />
        <link rel="canonical" href="https://tesipedia.com/cotizar" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tesipedia.com/cotizar" />
        <meta property="og:title" content="Cotiza tu tesis con Tesipedia" />
        <meta property="og:description" content="Asesoría personalizada para tu titulación. Agenda o cotiza en menos de 2 minutos." />
        <meta property="og:image" content={PREVIEW_IMG} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Cotiza tu tesis con Tesipedia - Asesoría profesional" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:site_name" content="Tesipedia" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cotiza tu tesis con Tesipedia" />
        <meta name="twitter:description" content="Asesoría personalizada para tu titulación. Agenda o cotiza en menos de 2 minutos." />
        <meta name="twitter:image" content={PREVIEW_IMG} />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
      </Helmet>

      {/* ===== HERO ===== */}
      <section className="landing-hero cotizar-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <FaStar className="star-icon" /> +3,000 estudiantes titulados
          </div>

          <h1>Cotiza tu tesis en 2 minutos</h1>
          <p className="landing-hero-sub">
            Asesoría profesional con expertos en todas las áreas. Tesis, tesinas, tareas y proyectos de titulación.
          </p>

          {/* Booking-style badges */}
          <div className="cotizar-booking-badges">
            <span className="booking-badge">
              <FaClock /> 15–30 min de asesoría
            </span>
            <span className="booking-badge">
              <FaLaptop /> 100% Online
            </span>
            <span className="booking-badge">
              <FaShieldAlt /> Confidencial
            </span>
          </div>

          <div className="landing-hero-ctas">
            <a href="#cotizar-form" className="landing-cta-primary cotizar-cta-pulse">
              <FaPaperPlane /> Cotizar ahora
            </a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-secondary"
              onClick={() => trackCTA('cotizar_hero_wa', 'WhatsApp CTA')}>
              <FaWhatsapp /> Escribir por WhatsApp
            </a>
          </div>

          <div className="landing-hero-trust">
            <span><FaCheckCircle /> 100% Original</span>
            <span><FaCheckCircle /> Sin plagio ni IA</span>
            <span><FaCheckCircle /> Desde $110/página</span>
          </div>
        </div>
      </section>

      {/* ===== FORM SECTION ===== */}
      <section className="landing-section cotizar-form-section" id="cotizar-form">
        <h2>Solicita tu cotización gratuita</h2>
        <p className="landing-section-intro">
          Llena el formulario y un asesor experto te contactará en menos de 2 horas con tu cotización personalizada.
        </p>

        {status === 'success' ? (
          <div className="cotizar-success-msg">
            <FaCheckCircle />
            <h3>¡Recibimos tu solicitud!</h3>
            <p>Un asesor te contactará por WhatsApp en los próximos minutos. Mientras, puedes escribirnos directamente:</p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-primary">
              <FaWhatsapp /> Ir a WhatsApp
            </a>
          </div>
        ) : (
          <form className="cotizar-form" onSubmit={handleSubmit} noValidate>
            <div className="cotizar-form-grid">
              {/* Nombre */}
              <div className="cotizar-field">
                <label htmlFor="nombre">Nombre completo *</label>
                <input
                  type="text" id="nombre" name="nombre"
                  placeholder="Ej: María García López"
                  value={form.nombre} onChange={handleChange}
                  className={errors.nombre ? 'has-error' : ''}
                  autoComplete="name"
                />
                {errors.nombre && <span className="field-error">{errors.nombre}</span>}
              </div>

              {/* Teléfono */}
              <div className="cotizar-field">
                <label htmlFor="telefono">
                  <FaPhoneAlt style={{ marginRight: 6, fontSize: '0.85em' }} />
                  Número de WhatsApp *
                </label>
                <div className="phone-input-wrap">
                  <span className="phone-prefix">+52</span>
                  <input
                    type="tel" id="telefono" name="telefono"
                    placeholder="5512345678"
                    value={form.telefono} onChange={handleChange}
                    className={errors.telefono ? 'has-error' : ''}
                    maxLength={15}
                    autoComplete="tel-national"
                  />
                </div>
                {errors.telefono && <span className="field-error">{errors.telefono}</span>}
              </div>

              {/* Carrera */}
              <div className="cotizar-field">
                <label htmlFor="carrera">Carrera *</label>
                <input
                  type="text" id="carrera" name="carrera"
                  placeholder="Ej: Psicología, Derecho, Ingeniería..."
                  value={form.carrera} onChange={handleChange}
                  className={errors.carrera ? 'has-error' : ''}
                />
                {errors.carrera && <span className="field-error">{errors.carrera}</span>}
              </div>

              {/* Tipo de proyecto */}
              <div className="cotizar-field">
                <label htmlFor="tipo_proyecto">Tipo de proyecto *</label>
                <select
                  id="tipo_proyecto" name="tipo_proyecto"
                  value={form.tipo_proyecto} onChange={handleChange}
                  className={errors.tipo_proyecto ? 'has-error' : ''}
                >
                  <option value="">Selecciona una opción</option>
                  {TIPOS_PROYECTO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.tipo_proyecto && <span className="field-error">{errors.tipo_proyecto}</span>}
              </div>

              {/* Fecha de entrega */}
              <div className="cotizar-field cotizar-field-full">
                <label htmlFor="fecha_entrega">Fecha aproximada de entrega *</label>
                <input
                  type="date" id="fecha_entrega" name="fecha_entrega"
                  value={form.fecha_entrega} onChange={handleChange}
                  min={minDate}
                  className={errors.fecha_entrega ? 'has-error' : ''}
                />
                {errors.fecha_entrega && <span className="field-error">{errors.fecha_entrega}</span>}
              </div>
            </div>

            <button
              type="submit"
              className="cotizar-submit-btn"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <span className="cotizar-spinner" /> Enviando...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Solicitar cotización gratuita
                </>
              )}
            </button>

            {status === 'error' && (
              <p className="cotizar-error-msg">
                Hubo un error al enviar. Intenta de nuevo o escríbenos por{' '}
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer">WhatsApp</a>.
              </p>
            )}

            <p className="cotizar-form-note">
              <FaShieldAlt /> Tu información es 100% confidencial. No compartimos tus datos.
            </p>
          </form>
        )}
      </section>

      {/* ===== CÓMO FUNCIONA ===== */}
      <section className="landing-section-alt">
        <h2>¿Cómo funciona?</h2>
        <p className="landing-section-intro" style={{ maxWidth: 1100 }}>
          En 3 simples pasos obtienes tu cotización y empezamos a trabajar en tu proyecto.
        </p>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="step-number">1</div>
            <h3>Llena el formulario</h3>
            <p>Cuéntanos sobre tu proyecto, carrera y fecha de entrega. Toma menos de 2 minutos.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">2</div>
            <h3>Recibe tu cotización</h3>
            <p>Un asesor experto te contacta por WhatsApp con precio, tiempos y plan de trabajo.</p>
          </div>
          <div className="landing-step">
            <div className="step-number">3</div>
            <h3>Empieza tu proyecto</h3>
            <p>Aprueba y comenzamos. Recibes avances parciales y comunicación directa con tu asesor.</p>
          </div>
        </div>
        <div className="landing-cta-center">
          <a href="#cotizar-form" className="landing-cta-card">
            <FaPaperPlane style={{ marginRight: 6 }} /> Cotizar ahora
          </a>
        </div>
      </section>

      {/* ===== POR QUÉ ELEGIRNOS ===== */}
      <section className="landing-section">
        <h2>¿Por qué elegir Tesipedia?</h2>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>+3,000 titulados</h3>
            <p>Miles de estudiantes ya se titularon con nuestra ayuda en todo México y LATAM.</p>
          </div>
          <div className="landing-feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>100% original</h3>
            <p>Cada trabajo se elabora desde cero. Verificado con Turnitin y escáner anti-IA.</p>
          </div>
          <div className="landing-feature-card">
            <FaGraduationCap className="feature-icon" />
            <h3>+50 expertos</h3>
            <p>Asesores con maestría y doctorado en todas las áreas del conocimiento.</p>
          </div>
          <div className="landing-feature-card">
            <FaClock className="feature-icon" />
            <h3>Entrega desde 3 semanas</h3>
            <p>Plazos flexibles con avances parciales. También trabajamos proyectos urgentes.</p>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="landing-final-cta">
        <h2>¿Listo para titularte?</h2>
        <p>Más de 3,000 estudiantes ya lo lograron. Tú puedes ser el siguiente.</p>
        <div className="landing-hero-ctas">
          <a href="#cotizar-form" className="landing-cta-primary landing-cta-big">
            <FaPaperPlane /> Cotizar ahora — es gratis
          </a>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="landing-cta-secondary"
            onClick={() => trackCTA('cotizar_final_wa', 'WhatsApp CTA')}>
            <FaWhatsapp /> Hablar por WhatsApp
          </a>
        </div>
        <p className="landing-final-sub">
          <FaShieldAlt style={{ marginRight: 4 }} /> 100% confidencial · Sin compromiso · Respuesta en menos de 2 horas
        </p>
      </section>
    </div>
  );
}

export default CotizarLanding;
