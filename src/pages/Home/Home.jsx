import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { trackVisit } from '../../features/visits/visitsSlice';
import { Helmet } from 'react-helmet-async';

// Critical above-the-fold component loaded eagerly
import HeroSection from '../../components/HomeComponents/HeroSection/HeroSection';
import {
  TrustBar, HowItWorks, RealTimeTracking, WhyTesipedia, LevelsPricing,
  SuccessStories, SpecialOffer, ExploreLinks, SeoBlock, HomeFAQ, FinalCTA,
} from '../../components/HomeComponents/HomeSections';

import './Home.css';

function Home() {
  const dispatch = useDispatch();
  // Chat state is managed by FixedButtons via custom event

  useEffect(() => {
    // Lazy load AOS after initial render for performance
    const loadAOS = async () => {
      const [AOS, aosCSS] = await Promise.all([
        import('aos'),
        import('aos/dist/aos.css')
      ]);
      AOS.default.init({
        duration: 500,
        once: true,
        disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      });
    };
    // Defer AOS initialization
    requestAnimationFrame(() => {
      loadAOS();
    });

    // Registrar visita usando el slice
    dispatch(trackVisit({
      path: window.location.pathname,
      referrer: document.referrer || 'Direct',
      userAgent: navigator.userAgent
    }));
  }, [dispatch]);

  const handleOpenChat = () => {
    window.dispatchEvent(new Event('tesipedia:open-chat'));
  };

  // Schema.org structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Servicio de Asesoría de Tesis — Tesipedia",
    "description": "¿Necesitas hacer tu tesis? Tesipedia te asesora para hacer tu tesis de licenciatura, maestría y doctorado en México. Acompañamiento académico para que redactes tu propia tesis, original y libre de plagio. +3,000 estudiantes asesorados.",
    "brand": { "@type": "Brand", "name": "Tesipedia" },
    "image": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "offers": { "@type": "AggregateOffer", "priceCurrency": "MXN", "lowPrice": "5500", "highPrice": "50000", "offerCount": "3" }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Asesoría de Tesis Profesional",
    "name": "Te Asesoramos para Hacer Tu Tesis — Servicio de Asesoría de Tesis en México",
    "provider": {
      "@type": "ProfessionalService",
      "name": "Tesipedia",
      "url": "https://tesipedia.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "México"
    },
    "description": "Servicio integral de asesoría de tesis: acompañamiento en la elaboración, tutoría o revisión de tu borrador. Incluye revisión de originalidad, guía en la redacción y asesoría personalizada para que termines tu propia tesis.",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "MXN",
      "lowPrice": "110",
      "highPrice": "250",
      "unitText": "por página",
      "offerCount": "3"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Modalidades de Asesoría",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Asesoría Integral de Tesis (Te Guiamos de Principio a Fin)",
            "description": "Te asesoramos en la elaboración de tu tesis de inicio a fin. Incluye revisión de originalidad, guía en la redacción, correcciones y asesoría 1:1."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Acompañamiento de Tesis",
            "description": "Tutoría continua para que avances tu tesis con seguridad. Incluye revisión de originalidad y acompañamiento en cada etapa."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Revisión y Corrección de Tesis",
            "description": "Revisamos y mejoramos tu borrador: estilo, formato y citación. Incluye revisión de originalidad."
          }
        }
      ]
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://tesipedia.com/"
      }
    ]
  };

  // FAQ Schema para Homepage - preguntas más buscadas
  const homeFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta hacer una tesis en México?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El costo de la asesoría de tesis en México varía según el nivel académico y la modalidad de acompañamiento. Para una tesis de licenciatura de 100 páginas, la asesoría va desde $9,900 MXN (revisión y corrección) hasta $19,800 MXN (asesoría integral). Para maestría y doctorado la asesoría es mayor según la complejidad. En Tesipedia ofrecemos cotización gratuita y planes de pago flexibles."
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde puedo obtener asesoría de tesis en México de forma segura?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tesipedia es el servicio de asesoría de tesis más confiable de México. Con más de 3,000 estudiantes asesorados, te acompañamos para que redactes tu propia tesis, original y con revisión de originalidad. Puedes cotizar gratis por WhatsApp al +52 56 7007 1517."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo lleva terminar una tesis con asesoría?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Con un buen acompañamiento, una tesis de licenciatura suele avanzarse en 3 a 4 semanas por etapas de asesoría. Para maestría y doctorado, de 4 a 8 semanas según la complejidad. También ofrecemos asesoría acelerada para casos urgentes."
        }
      },
      {
        "@type": "Question",
        "name": "¿La asesoría es con investigadores humanos y el trabajo queda original?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, te asesoran investigadores humanos con maestría y doctorado. Tu tesis la redactas tú con nuestra guía, así que es un trabajo original; te apoyamos con revisión de originalidad en cada etapa."
        }
      },
      {
        "@type": "Question",
        "name": "¿Dan asesoría de tesis para cualquier universidad de México?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, asesoramos a estudiantes de cualquier universidad de México: UNAM, IPN, ITESM, UAM, UVM, UNITEC, La Salle, Anáhuac, Iberoamericana, BUAP, UdeG, UANL y más. Conocemos los lineamientos y formatos de cada institución."
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Cómo te asesoramos para hacer tu tesis en México",
    "step": [
      { "@type": "HowToStep", "position": 1, "name": "Cotiza gratis", "text": "Escríbenos por WhatsApp con tu tema, nivel, número de páginas y fecha objetivo. Te cotizamos la asesoría en minutos." },
      { "@type": "HowToStep", "position": 2, "name": "Asesor especializado", "text": "Te asignamos un investigador con posgrado en tu área y un plan de pago flexible." },
      { "@type": "HowToStep", "position": 3, "name": "Avances y revisiones", "text": "Trabajas tu tesis por capítulos con nuestra guía y revisamos tus avances en cada etapa del proceso." },
      { "@type": "HowToStep", "position": 4, "name": "Preparación para tu defensa", "text": "Tu tesis queda original y bien citada, con revisiones y preparación para tu examen profesional." }
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Tesipedia",
    "url": "https://tesipedia.com",
    "description": "Servicio profesional de asesoría de tesis en México",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tesipedia.com/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Helmet>
        <title>¿Comprar Tesis en México? Mejor Asesórate y Termínala | Tesipedia — Asesoría de Tesis de Licenciatura, Maestría y Doctorado</title>
        <meta name="description" content="¿Buscas comprar tesis en México? Mejor te asesoramos para hacer tu tesis de licenciatura, maestría y doctorado. Acompañamiento para que la redactes tú, original y con revisión. Desde $110/página. +3,000 estudiantes asesorados. Cotiza gratis por WhatsApp." />
        <meta name="keywords" content="comprar tesis, comprar tesis México, hacer tesis, hacer mi tesis, te asesoramos para hacer tu tesis, asesoría de tesis, quien me ayuda con mi tesis, asesoría tesis licenciatura, asesoría tesis maestría, asesoría tesis doctorado, tesis por encargo, elaboración de tesis, desarrollo de tesis México, tutoría de tesis, cuánto cuesta una tesis, tesis UNAM, tesis IPN, tesis ITESM, tesis UAM, Tesipedia" />
        <meta property="og:title" content="¿Comprar Tesis en México? Mejor Asesórate | Tesipedia — Asesoría de Tesis Desde $110/pág" />
        <meta property="og:description" content="¿Buscas comprar tesis? Mejor asesórate con Tesipedia: +3,000 estudiantes asesorados. Te guiamos para que redactes tu propia tesis, original. Desde $110/página. Cotiza gratis." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tesipedia.com" />
        <meta property="og:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
        <meta property="og:locale" content="es_MX" />
        <link rel="canonical" href="https://tesipedia.com" />

        {/* Schema.org structured data */}
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(homeFaqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
      </Helmet>

      <HeroSection onOpenChat={handleOpenChat} />
      <TrustBar />
      <HowItWorks />
      <RealTimeTracking />
      <WhyTesipedia />
      <LevelsPricing />
      <SuccessStories />
      <SpecialOffer />
      <ExploreLinks />
      <SeoBlock />
      <HomeFAQ faqs={homeFaqSchema.mainEntity} />
      <FinalCTA />
    </>
  );
}

export default Home;
