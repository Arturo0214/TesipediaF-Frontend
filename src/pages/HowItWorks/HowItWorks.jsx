import React from 'react';
import { useState, useEffect } from 'react';
import {
  FaInfoCircle, FaMoneyBillWave, FaFileAlt, FaUserTie, FaLock, FaCreditCard,
  FaUserCheck, FaBell, FaFileExport, FaComments, FaPlusCircle
} from 'react-icons/fa';
import Hero from './components/Hero';
import StepsList from './components/StepsList';
import './styles/main.css';
import './styles/button.css';
import './styles/steps.css';
import './styles/step-colors.css';

function HowItWorks() {
  const [showSteps, setShowSteps] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    if (showSteps) {
      const interval = setInterval(() => {
        setActiveStep((prevStep) => {
          if (prevStep >= steps.length - 1) {
            clearInterval(interval);
            return prevStep;
          }
          return prevStep + 1;
        });
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setActiveStep(0);
    }
  }, [showSteps]);

  const steps = [
    {
      icon: <FaInfoCircle />,
      title: 'Conocer nuestros servicios',
      description: 'Antes de empezar, es importante que sepas todo lo que podemos hacer por ti.',
      duration: '1 minuto',
      link: '/servicios',
      linkText: 'Ver servicios',
      details: 'Ofrecemos desde asesorías personalizadas hasta corrección de fondo, estilo, presentaciones, escáner antiplagio y antiIA.'
    },
    {
      icon: <FaMoneyBillWave />,
      title: 'Consultar los precios',
      description: 'Cada proyecto es único, pero aquí puedes ver nuestras tarifas base.',
      duration: '1 minuto',
      link: '/precios',
      linkText: 'Ver precios',
      details: 'Todos los proyectos incluyen escáner antiplagio y antiIA profesional.'
    },
    {
      icon: <FaFileAlt />,
      title: 'Realizar tu cotización',
      description: 'Haz tu cotización personalizada con los detalles de tu proyecto.',
      duration: '2-3 minutos',
      link: '/cotizar',
      linkText: 'Cotizar tesis',
      details: 'La fecha mínima de entrega es de 3 semanas. Si necesitas entrega urgente, tendrá un costo adicional.'
    },
    {
      icon: <FaUserTie />,
      title: 'Contactar con un asesor o registrarte',
      description: 'Resolvemos tus dudas y te ayudamos a afinar tu cotización.',
      duration: '1 minuto',
      link: '/contacto',
      linkText: 'Contactar con asesor o Registrarme'
    },
    {
      icon: <FaLock />,
      title: 'Confirmar tu cotización',
      description: 'Revisamos y validamos todos los detalles contigo.',
      duration: '1 minuto'
    },
    {
      icon: <FaCreditCard />,
      title: 'Realizar el pago',
      description: 'Procede a realizar el pago según el método elegido.',
      duration: '1-2 minutos',
      details: 'Aceptamos tarjeta de crédito/débito a meses sin intereses, PayPal, o pagos por transferencia / retiro sin tarjeta con 10% de descuento. Modalidad de pago: 50% al iniciar, 50% al entregar.'
    },
    {
      icon: <FaUserCheck />,
      title: 'Se te asigna un asesor',
      description: 'Un profesional de tu área comenzará tu proyecto.',
      details: 'La fecha de entrega queda establecida en tu cotización.'
    },
    {
      icon: <FaBell />,
      title: 'Recibirás notificaciones',
      description: 'Te avisamos por WhatsApp y correo de cada avance o actualización.'
    },
    {
      icon: <FaFileExport />,
      title: 'Entrega de tu proyecto final',
      description: 'Tu entrega incluye:',
      details: '• Escáner antiplagio profesional\n• Escáner anti inteligencia artificial'
    },
    {
      icon: <FaComments />,
      title: 'Acompañamiento post-entrega',
      description: 'Seguimos en contacto para ayudarte con:',
      details: '• Correcciones de tu asesor o sinodales\n• Preparación para defensa o presentación\n• Asesoría puntual en tu tema\n\nTú eliges si prefieres comunicarte por WhatsApp o correo.'
    },
    {
      icon: <FaPlusCircle />,
      title: 'Cotiza servicios adicionales',
      description: '¿Necesitas apoyo extra? Escríbenos directamente y lo evaluamos contigo.',
      details: 'Ejemplos de servicios adicionales:\n• Corrección de estilo u ortografía\n• Corrección de fondo teórico\n• Simulacro de defensa profesional\n• Presentaciones PowerPoint\n• Asesorías académicas personalizadas',
      link: '/chat',
      linkText: 'Chatear ahora o WhatsApp directo'
    }
  ];

  const handleShowModal = (stepIndex) => {
    setActiveModal(stepIndex);
  };

  const handleHideModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="how-it-works-container">
      <div className="how-it-works-content">
        <Hero showSteps={showSteps} onToggleSteps={() => setShowSteps(!showSteps)} />
        <div className="steps-wrapper">
          <StepsList
            steps={steps}
            activeStep={activeStep}
            showSteps={showSteps}
            activeModal={activeModal}
            onShowModal={handleShowModal}
            onHideModal={handleHideModal}
          />
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;