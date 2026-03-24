import { useState, useEffect, lazy, Suspense } from 'react';
import {
  FaUserGraduate,
  FaGraduationCap,
  FaAward,
  FaHandshake
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackVisit } from '../../features/visits/visitsSlice';
import { Helmet } from 'react-helmet-async';

// Critical above-the-fold component loaded eagerly
import HeroSection from '../../components/HomeComponents/HeroSection/HeroSection';

// Lazy load below-the-fold components for performance
const TestimonialsSection = lazy(() => import('../../components/HomeComponents/TestimonialsSection/TestimonialsSection'));
const ServicesSection = lazy(() => import('../../components/HomeComponents/ServicesSection/ServicesSection'));
const GuaranteeSection = lazy(() => import('../../components/HomeComponents/GuaranteeSection/GuaranteeSection'));
const SuccessCasesSection = lazy(() => import('../../components/HomeComponents/SuccessCasesSection/SuccessCasesSection'));

import './Home.css';

function Home() {
  const dispatch = useDispatch();
  const [currentStat, setCurrentStat] = useState(0);
  // Chat state is managed by FixedButtons via custom event

  const stats = [
    {
      number: "+3,000",
      text: "Estudiantes Titulados",
      icon: <FaUserGraduate />
    },
    {
      number: "+3,000",
      text: "Tesis Aprobadas",
      icon: <FaGraduationCap />
    },
    {
      number: "98%",
      text: "Índice de Aprobación",
      icon: <FaAward />
    },
    {
      number: "+50",
      text: "Asesores Expertos",
      icon: <FaHandshake />
    }
  ];

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

    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 2000);

    // Registrar visita usando el slice
    dispatch(trackVisit({
      path: window.location.pathname,
      referrer: document.referrer || 'Direct',
      userAgent: navigator.userAgent
    }));

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleOpenChat = () => {
    window.dispatchEvent(new Event('tesipedia:open-chat'));
  };

  // Schema.org structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Tesipedia",
    "url": "https://tesipedia.com",
    "logo": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "description": "¿Necesitas hacer tu tesis? Tesipedia te hace tu tesis de licenciatura, maestría y doctorado en México. Compra tu tesis 100% original, libre de plagio e IA. +3,000 titulados.",
    "alternateName": "Hacemos Tesis - Tesipedia",
    "telephone": "+52-56-7007-1517",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ciudad de México",
      "addressRegion": "CDMX",
      "addressCountry": "MX"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "3000",
      "bestRating": "5"
    },
    "priceRange": "$$"
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Hacer Tesis Profesional",
    "name": "Te Hacemos Tu Tesis — Servicio de Elaboración de Tesis en México",
    "provider": {
      "@type": "ProfessionalService",
      "name": "Tesipedia",
      "url": "https://tesipedia.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "México"
    },
    "description": "Servicio integral de desarrollo de tesis: elaboración completa, acompañamiento o corrección. Incluye antiplagio Turnitin, detección anti-IA y asesoría personalizada.",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "MXN",
      "lowPrice": "60",
      "highPrice": "120",
      "priceCurrency": "MXN",
      "unitText": "por página",
      "offerCount": "3"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Modalidades de Servicio",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Desarrollo Completo de Tesis (Hacemos Todo)",
            "description": "Elaboramos tu tesis de inicio a fin. Incluye escáner antiplagio, anti-IA, correcciones y asesoría 1:1."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Acompañamiento de Tesis",
            "description": "Trabajo conjunto con el estudiante. Incluye escáner antiplagio, anti-IA y acompañamiento continuo."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Corrección de Tesis",
            "description": "Revisión y corrección de trabajo existente. Incluye escáner antiplagio y anti-IA."
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

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Tesipedia",
    "url": "https://tesipedia.com",
    "description": "Servicio profesional de desarrollo de tesis en México",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tesipedia.com/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Helmet>
        <title>Hacer Tesis en México | Tesipedia — Te Hacemos Tu Tesis de Licenciatura, Maestría y Doctorado</title>
        <meta name="description" content="¿Necesitas hacer tu tesis? En Tesipedia te hacemos tu tesis de licenciatura, maestría o doctorado. Compra tu tesis 100% original, sin plagio ni IA. +3,000 titulados en México. Cotiza gratis por WhatsApp." />
        <meta name="keywords" content="hacer tesis, comprar tesis, hacer mi tesis, te hacemos tu tesis, hacemos tesis, quien me hace mi tesis, comprar tesis México, hacer tesis licenciatura, hacer tesis maestría, hacer tesis doctorado, tesis por encargo, encargar tesis, elaboración de tesis, desarrollo de tesis México, asesoría de tesis, cuánto cuesta una tesis, tesis UNAM, tesis IPN, tesis ITESM, tesis UAM, Tesipedia" />
        <meta property="og:title" content="Hacer Tesis en México | Tesipedia — Te Hacemos Tu Tesis 100% Original" />
        <meta property="og:description" content="¿Necesitas hacer tu tesis? +3,000 estudiantes ya se titularon con Tesipedia. Te hacemos tu tesis 100% original. Cotiza gratis." />
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
      </Helmet>

      <HeroSection
        stats={stats}
        currentStat={currentStat}
        onOpenChat={handleOpenChat}
      />
      <Suspense fallback={<div style={{ minHeight: '200px' }} />}>
        <SuccessCasesSection />
        <TestimonialsSection />
        <ServicesSection onOpenChat={handleOpenChat} />
        <GuaranteeSection />
      </Suspense>
    </>
  );
}

export default Home;
