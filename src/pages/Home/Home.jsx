import { useState, useEffect } from 'react';
import {
  FaUserGraduate,
  FaGraduationCap,
  FaAward,
  FaHandshake
} from 'react-icons/fa';
import 'aos/dist/aos.css';
import AOS from 'aos';

// Importaciones de componentes
import HeroSection from '../../components/HomeComponents/HeroSection/HeroSection';
import TestimonialsSection from '../../components/HomeComponents/TestimonialsSection/TestimonialsSection';
import ServicesSection from '../../components/HomeComponents/ServicesSection/ServicesSection';
import GuaranteeSection from '../../components/HomeComponents/GuaranteeSection/GuaranteeSection';

import './Home.css';

function Home() {
  const [currentStat, setCurrentStat] = useState(0);

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

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <HeroSection stats={stats} currentStat={currentStat} />
      <TestimonialsSection />
      <ServicesSection />
      <GuaranteeSection />
    </>
  );
}

export default Home;
