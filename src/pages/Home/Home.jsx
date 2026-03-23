import { useState, useEffect } from 'react';
import {
  FaUserGraduate,
  FaGraduationCap,
  FaAward,
  FaHandshake
} from 'react-icons/fa';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useDispatch } from 'react-redux';
import { trackVisit } from '../../features/visits/visitsSlice';
import { Helmet } from 'react-helmet-async';

// Importaciones de componentes
import HeroSection from '../../components/HomeComponents/HeroSection/HeroSection';
import TestimonialsSection from '../../components/HomeComponents/TestimonialsSection/TestimonialsSection';
import ServicesSection from '../../components/HomeComponents/ServicesSection/ServicesSection';
import GuaranteeSection from '../../components/HomeComponents/GuaranteeSection/GuaranteeSection';
import SuccessCasesSection from '../../components/HomeComponents/SuccessCasesSection/SuccessCasesSection';
import ChatPanel from '../../components/chat/ChatPanel';

import './Home.css';

function Home() {
  const dispatch = useDispatch();
  const [currentStat, setCurrentStat] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
    AOS.init({
      duration: 500,
      once: true
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
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // Schema.org structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Tesipedia",
    "url": "https://tesipedia.com",
    "logo": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png",
    "description": "Servicio profesional #1 en México para desarrollo de tesis de licenciatura, maestría y doctorado. 100% original, libre de plagio e IA.",
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
    "serviceType": "Desarrollo de Tesis Profesional",
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
      "lowPrice": "6300",
      "highPrice": "22000",
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
        <title>Tesipedia — ¿Necesitas ayuda con tu tesis? Servicio #1 en México | +3,000 Titulados</title>
        <meta name="description" content="¿No sabes cómo hacer tu tesis? Tesipedia es el servicio #1 en México para desarrollo de tesis de licenciatura, maestría y doctorado. 100% original, sin plagio ni IA. Entrega desde 3 semanas. +3,000 estudiantes titulados. Cotiza gratis por WhatsApp." />
        <meta name="keywords" content="hacer mi tesis, ayuda con mi tesis, quién me hace mi tesis México, cuánto cuesta una tesis, desarrollo de tesis profesional, tesis licenciatura, tesis maestría, tesis doctorado, asesoría de tesis CDMX, tesis UNAM, tesis IPN, tesis ITESM, tesis UAM, tesina, trabajo de investigación, titulación universitaria, corrección de tesis, antiplagio Turnitin, Tesipedia" />
        <meta property="og:title" content="Tesipedia — ¿Necesitas ayuda con tu tesis? Servicio #1 en México" />
        <meta property="og:description" content="Más de 3,000 estudiantes titulados confían en Tesipedia. Desarrollo de tesis 100% original con asesoría personalizada. Cotiza gratis." />
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
      <SuccessCasesSection />
      <TestimonialsSection />
      <ServicesSection onOpenChat={handleOpenChat} />
      <GuaranteeSection />
      <ChatPanel
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        orderId="public-chat"
        isPublic={true}
      />
    </>
  );
}

export default Home;
