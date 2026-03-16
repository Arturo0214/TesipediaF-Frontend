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

  return (
    <>
      <Helmet>
        <title>Tesipedia — Desarrollo de Tesis Profesional en México | +3,000 Titulados</title>
        <meta name="description" content="Servicio #1 en México para desarrollo de tesis de licenciatura, maestría y doctorado. 100% original, libre de plagio e IA. Entrega desde 3 semanas. Más de 3,000 estudiantes titulados. Garantía de aprobación." />
        <meta name="keywords" content="tesis profesional México, desarrollo de tesis, hacer mi tesis, tesis licenciatura, tesis maestría, tesis doctorado, asesoría de tesis, tesis UNAM, tesis IPN, tesis ITESM, tesis UAM, tesina, trabajo de investigación, titulación, Tesipedia" />
        <meta property="og:title" content="Tesipedia — Desarrollo de Tesis Profesional | Garantía de Aprobación" />
        <meta property="og:description" content="Más de 3,000 estudiantes titulados confían en Tesipedia. Desarrollo de tesis 100% original con asesoría personalizada y entrega puntual." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tesipedia.com" />
        <link rel="canonical" href="https://tesipedia.com" />

        {/* Schema.org structured data for SEO */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Tesipedia",
            "url": "https://tesipedia.com",
            "description": "Servicio profesional de desarrollo de tesis en México. Más de 3,000 estudiantes titulados.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "MX"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "reviewCount": "3000",
              "bestRating": "5"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+52-55-8335-2096",
              "contactType": "customer service",
              "availableLanguage": "Spanish"
            }
          }
        `}</script>
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
