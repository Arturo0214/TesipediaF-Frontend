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

// Importaciones de componentes
import HeroSection from '../../components/HomeComponents/HeroSection/HeroSection';
import TestimonialsSection from '../../components/HomeComponents/TestimonialsSection/TestimonialsSection';
import ServicesSection from '../../components/HomeComponents/ServicesSection/ServicesSection';
import GuaranteeSection from '../../components/HomeComponents/GuaranteeSection/GuaranteeSection';
import ChatPanel from '../../components/chat/ChatPanel';

import './Home.css';

function Home() {
  const dispatch = useDispatch();
  const [currentStat, setCurrentStat] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const stats = [
    {
      number: "+1,500",
      text: "Estudiantes Titulados",
      icon: <FaUserGraduate />
    },
    {
      number: "+1,500",
      text: "Tesis Aprobadas",
      icon: <FaGraduationCap />
    },
    {
      number: "100%",
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
      <HeroSection
        stats={stats}
        currentStat={currentStat}
        onOpenChat={handleOpenChat}
      />
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
