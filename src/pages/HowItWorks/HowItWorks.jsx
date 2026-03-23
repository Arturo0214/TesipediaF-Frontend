import React from 'react';
import { useState, useEffect } from 'react';
import {
  FaInfoCircle, FaMoneyBillWave, FaFileAlt, FaUserTie, FaLock, FaCreditCard,
  FaUserCheck, FaBell, FaFileExport, FaComments, FaPlusCircle, FaCompass
} from 'react-icons/fa';
import Hero from './components/Hero';
import StepsList from './components/StepsList';
import { Helmet } from 'react-helmet-async';
import './styles/main.css';
import './styles/button.css';
import './styles/steps.css';
import './styles/step-colors.css';

function HowItWorks() {
  const [showSteps, setShowSteps] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showSteps && isAnimating) {
      const interval = setInterval(() => {
        setActiveStep((prevStep) => {
          if (prevStep >= steps.length - 1) {
            setIsAnimating(false);
            clearInterval(interval);
            return prevStep;
          }
          return prevStep + 1;
        });
      }, 3000);

      return () => clearInterval(interval);
    } else if (!showSteps) {
      setActiveStep(0);
      setIsAnimating(false);
    }
  }, [showSteps, isAnimating]);

  const handleToggleSteps = () => {
    setShowSteps(!showSteps);
    if (!showSteps) {
      setIsAnimating(true);
      setActiveModal(null);
    } else {
      setActiveModal(null);
      setIsAnimating(false);
    }
  };

  const steps = [
    {
      icon: <FaInfoCircle />,
      title: 'Conocer nuestros servicios',
      description: 'Antes de empezar, es importante que sepas todo lo que podemos hacer por ti.',
      duration: '1 minuto',
      link: '/servicios',
      linkText: 'Ver servicios',
      details: 'Ofrecemos desde asesorías personalizadas hasta corrección de fondo, estilo, presentaciones, escáner antiplagio y anti-IA.'
    },
    {
      icon: <FaMoneyBillWave />,
      title: 'Consultar los precios',
      description: 'Cada proyecto es único, pero aquí puedes ver nuestras tarifas base.',
      duration: '1 minuto',
      link: '/precios',
      linkText: 'Ver precios',
      details: 'Todos los proyectos incluyen escáner antiplagio y anti-IA profesional.'
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
      title: '¡Tu Proyecto está en Marcha!',
      description: 'Seguimiento detallado y comunicación constante desde el primer momento',
      details: 'Cronograma con fechas de entrega, reuniones de alineación y reportes periódicos de avance.'
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
      details: 'Escáner antiplagio profesional\nEscáner anti inteligencia artificial'
    },
    {
      icon: <FaComments />,
      title: 'Acompañamiento post-entrega',
      description: 'Seguimos en contacto para ayudarte con:',
      details: 'Correcciones de tu asesor o sinodales\nPreparación para defensa o presentación\nAsesoría puntual en tu tema\n\nTú eliges si prefieres comunicarte por WhatsApp o correo.'
    },
    {
      icon: <FaPlusCircle />,
      title: 'Cotiza servicios adicionales',
      description: '¿Necesitas apoyo extra? Escríbenos directamente y lo evaluamos contigo.',
      details: 'Ejemplos de servicios adicionales:\nCorrección de estilo u ortografía\nCorrección de fondo teórico\nSimulacro de defensa profesional\nPresentaciones PowerPoint\nAsesorías académicas personalizadas',
      link: '/chat',
      linkText: 'Chatear ahora o WhatsApp directo'
    },
    {
      icon: <FaCompass />,
      title: 'Explora las secciones de la página',
      description: 'Descubre todas las secciones que tenemos para ti.',
      duration: '2-3 minutos',
      details: 'Secciones disponibles:\nInicio - Información general y destacados\n Precios - Tarifas y opciones de pago\nServicios - Catálogo completo de asesorías\nNosotros - Conoce nuestro equipo\nFAQ - Preguntas frecuentes\nBlog - Recursos y artículos\nContacto - Canales de comunicación'
    }
  ];

  const handleShowModal = (stepIndex) => {
    setActiveModal(stepIndex);
    setIsAnimating(false);
    setActiveStep(stepIndex);
  };

  const handleHideModal = () => {
    setActiveModal(null);
  };

  const howItWorksSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Cómo Funciona el Servicio de Tesis de Tesipedia",
    "description": "Guía paso a paso del proceso para obtener tu tesis profesional con Tesipedia, desde la cotización hasta la entrega final.",
    "step": [
      { "@type": "HowToStep", "position": 1, "name": "Solicita tu Cotización", "text": "Envíanos los detalles de tu tesis y recibe una cotización personalizada sin compromiso." },
      { "@type": "HowToStep", "position": 2, "name": "Realiza tu Pago", "text": "Elige tu plan y método de pago. Aceptamos tarjetas, PayPal y transferencia bancaria." },
      { "@type": "HowToStep", "position": 3, "name": "Asignamos tu Asesor", "text": "Te asignamos un asesor experto en tu área de estudio para desarrollar tu tesis." },
      { "@type": "HowToStep", "position": 4, "name": "Desarrollo y Entregas", "text": "Recibe avances parciales y comunícate directamente con tu asesor." },
      { "@type": "HowToStep", "position": 5, "name": "Entrega Final", "text": "Recibe tu tesis completa con certificado antiplagio Turnitin y detección anti-IA." }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com" },
      { "@type": "ListItem", "position": 2, "name": "Cómo Funciona", "item": "https://tesipedia.com/como-funciona" }
    ]
  };

  return (
    <>
    <Helmet>
      <title>¿Cómo Funciona Nuestro Servicio de Tesis? | Paso a Paso — Tesipedia</title>
      <meta name="description" content="Conoce el proceso paso a paso para obtener tu tesis profesional con Tesipedia. Desde la cotización hasta la entrega final con certificado antiplagio Turnitin. Proceso 100% en línea, seguro y confidencial." />
      <meta name="keywords" content="cómo funciona servicio de tesis, proceso elaboración tesis, pasos para hacer tesis, asesoría tesis en línea, cómo pedir tesis México, servicio tesis paso a paso" />
      <meta property="og:title" content="¿Cómo Funciona? — Tesipedia | Servicio de Tesis #1 en México" />
      <meta property="og:description" content="Proceso simple y transparente: cotiza, paga, recibe tu tesis. 100% en línea con asesor dedicado." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://tesipedia.com/como-funciona" />
      <meta property="og:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
      <meta property="og:locale" content="es_MX" />
      <link rel="canonical" href="https://tesipedia.com/como-funciona" />
      <script type="application/ld+json">{JSON.stringify(howItWorksSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
    <div className="how-it-works-container">
      <div className="how-it-works-content">
        <Hero showSteps={showSteps} onToggleSteps={handleToggleSteps} />
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
    </>
  );
}

export default HowItWorks;