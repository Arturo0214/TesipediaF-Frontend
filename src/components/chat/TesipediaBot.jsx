import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPaperPlane, FaTimes, FaWhatsapp, FaRobot } from 'react-icons/fa';
import './TesipediaBot.css';

// ─── Configuration ───────────────────────────────────────────
const WHATSAPP_NUMBER = '525670071517';
const TYPING_DELAY = 800; // ms before bot "types"
const BOT_NAME = 'Sofia';

// ─── Conversation Flow (state-machine) ──────────────────────
const STEPS = {
  welcome: {
    messages: [
      `¡Hola! 👋 Soy ${BOT_NAME}, asesora virtual de Tesipedia.`,
      '¿En qué puedo ayudarte hoy?',
    ],
    options: [
      { label: 'Necesito ayuda con mi tesis', next: 'nivel' },
      { label: 'Quiero una cotización', next: 'nivel' },
      { label: 'Tengo dudas sobre el servicio', next: 'dudas' },
      { label: 'Ya soy cliente', next: 'cliente' },
    ],
  },
  nivel: {
    messages: ['¡Perfecto! Para darte la mejor asesoría, cuéntame un poco más.', '¿Qué nivel académico es tu trabajo?'],
    options: [
      { label: 'Licenciatura', next: 'tipo_trabajo' },
      { label: 'Maestría', next: 'tipo_trabajo' },
      { label: 'Doctorado', next: 'tipo_trabajo' },
      { label: 'Otro', next: 'tipo_trabajo' },
    ],
  },
  tipo_trabajo: {
    messages: ['¿Qué tipo de trabajo necesitas?'],
    options: [
      { label: 'Tesis completa', next: 'avance' },
      { label: 'Tesina / Monografía', next: 'avance' },
      { label: 'Protocolo de investigación', next: 'avance' },
      { label: 'Corrección / Revisión', next: 'avance' },
      { label: 'Artículo científico', next: 'avance' },
      { label: 'Otro', next: 'avance' },
    ],
  },
  avance: {
    messages: ['¿Cuánto llevas avanzado?'],
    options: [
      { label: 'Nada, empiezo de cero', next: 'urgencia' },
      { label: 'Tengo el tema aprobado', next: 'urgencia' },
      { label: 'Ya tengo avance parcial', next: 'urgencia' },
      { label: 'Solo necesito correcciones', next: 'urgencia' },
    ],
  },
  urgencia: {
    messages: ['¿Para cuándo lo necesitas?'],
    options: [
      { label: 'Menos de 1 mes', next: 'contacto' },
      { label: '1 a 3 meses', next: 'contacto' },
      { label: '3 a 6 meses', next: 'contacto' },
      { label: 'No tengo fecha límite', next: 'contacto' },
    ],
  },
  contacto: {
    messages: [
      '¡Excelente! Con esa información puedo orientarte mejor.',
      'Para enviarte una cotización personalizada, ¿podrías darme tu nombre?',
    ],
    input: 'name',
  },
  contacto_email: {
    messages: (data) => [`Mucho gusto, ${data.name}. ¿Cuál es tu correo electrónico?`],
    input: 'email',
  },
  contacto_telefono: {
    messages: ['¿Y un número de WhatsApp donde pueda contactarte?'],
    input: 'phone',
  },
  resumen: {
    messages: (data) => [
      `¡Listo, ${data.name}! 🎉`,
      `Tengo toda tu información. Un asesor de Tesipedia se comunicará contigo muy pronto para darte una cotización personalizada.`,
      '¿Hay algo más en lo que pueda ayudarte?',
    ],
    options: [
      { label: 'Hablar por WhatsApp ahora', action: 'whatsapp' },
      { label: 'Tengo otra pregunta', next: 'dudas' },
      { label: 'Eso es todo, gracias', next: 'despedida' },
    ],
  },
  dudas: {
    messages: ['¿Sobre qué tema tienes dudas?'],
    options: [
      { label: '¿Es 100% original?', next: 'faq_original' },
      { label: '¿Cuánto cuesta?', next: 'faq_precio' },
      { label: '¿Cuánto tiempo tarda?', next: 'faq_tiempo' },
      { label: '¿Es confidencial?', next: 'faq_confidencial' },
      { label: '¿Tienen garantía?', next: 'faq_garantia' },
      { label: 'Otra pregunta', next: 'otra_pregunta' },
    ],
  },
  faq_original: {
    messages: [
      '¡Por supuesto! Todos nuestros trabajos son 100% originales.',
      'Usamos herramientas profesionales antiplagio y NO utilizamos inteligencia artificial para redactar. Cada tesis es desarrollada por un especialista en tu área.',
      '¿Te puedo ayudar con algo más?',
    ],
    options: [
      { label: 'Quiero cotizar', next: 'nivel' },
      { label: 'Tengo otra duda', next: 'dudas' },
      { label: 'Hablar por WhatsApp', action: 'whatsapp' },
    ],
  },
  faq_precio: {
    messages: [
      'El precio depende de varios factores: nivel académico, extensión, complejidad del tema y tiempo de entrega.',
      'Para darte un precio exacto necesitamos conocer los detalles de tu proyecto. ¡Cotizar es gratis y sin compromiso!',
      '¿Quieres que te cotice?',
    ],
    options: [
      { label: 'Sí, quiero cotizar', next: 'nivel' },
      { label: 'Tengo otra duda', next: 'dudas' },
      { label: 'Hablar por WhatsApp', action: 'whatsapp' },
    ],
  },
  faq_tiempo: {
    messages: [
      'El tiempo de entrega depende del tipo de trabajo y tu avance actual.',
      'Trabajos completos pueden estar listos desde 3 semanas. Revisiones y correcciones en menos tiempo.',
      'Te damos un cronograma detallado al iniciar. ¿Te gustaría cotizar?',
    ],
    options: [
      { label: 'Sí, quiero cotizar', next: 'nivel' },
      { label: 'Tengo otra duda', next: 'dudas' },
      { label: 'Hablar por WhatsApp', action: 'whatsapp' },
    ],
  },
  faq_confidencial: {
    messages: [
      '¡Totalmente! Tu información y proyecto son 100% confidenciales.',
      'Firmamos acuerdos de confidencialidad y nunca compartimos datos de nuestros clientes. Tu privacidad es nuestra prioridad.',
    ],
    options: [
      { label: 'Quiero cotizar', next: 'nivel' },
      { label: 'Tengo otra duda', next: 'dudas' },
      { label: 'Hablar por WhatsApp', action: 'whatsapp' },
    ],
  },
  faq_garantia: {
    messages: [
      '¡Sí! Ofrecemos Garantía de Aprobación Total.',
      'Si tu trabajo no es aprobado, lo corregimos sin costo adicional hasta que sea aceptado. Más de 3,000 estudiantes ya se titularon con nosotros.',
    ],
    options: [
      { label: 'Quiero cotizar', next: 'nivel' },
      { label: 'Tengo otra duda', next: 'dudas' },
      { label: 'Hablar por WhatsApp', action: 'whatsapp' },
    ],
  },
  otra_pregunta: {
    messages: ['Escribe tu pregunta y con gusto te ayudo:'],
    input: 'freetext',
  },
  freetext_response: {
    messages: [
      'Gracias por tu pregunta. Para darte una respuesta precisa, te recomiendo hablar directamente con uno de nuestros asesores.',
      'Puedes contactarnos por WhatsApp para atención inmediata.',
    ],
    options: [
      { label: 'Hablar por WhatsApp', action: 'whatsapp' },
      { label: 'Quiero cotizar', next: 'nivel' },
      { label: 'Eso es todo', next: 'despedida' },
    ],
  },
  cliente: {
    messages: [
      '¡Qué gusto tenerte de vuelta! 😊',
      'Para revisar el estado de tu proyecto o resolver dudas, te recomiendo contactarnos directamente.',
    ],
    options: [
      { label: 'Hablar por WhatsApp', action: 'whatsapp' },
      { label: 'Enviar un mensaje aquí', next: 'otra_pregunta' },
    ],
  },
  despedida: {
    messages: [
      '¡Gracias por contactar a Tesipedia! 🙌',
      'Recuerda que estamos disponibles de Lunes a Sábado de 9:00 a 20:00. ¡Mucho éxito con tu tesis!',
    ],
    options: [
      { label: 'Volver al inicio', next: 'welcome' },
      { label: 'Hablar por WhatsApp', action: 'whatsapp' },
    ],
  },
};

// ─── Component ───────────────────────────────────────────────
const TesipediaBot = ({ isOpen, onClose }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [userData, setUserData] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initializedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  // Add bot messages with typing animation
  const addBotMessages = useCallback((msgs, callback) => {
    let index = 0;
    const addNext = () => {
      if (index >= msgs.length) {
        setIsTyping(false);
        if (callback) callback();
        return;
      }
      setIsTyping(true);
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now() + index, text: msgs[index], sender: 'bot' },
        ]);
        setIsTyping(false);
        index++;
        scrollToBottom();
        if (index < msgs.length) {
          setTimeout(addNext, 400);
        } else if (callback) {
          callback();
        }
      }, TYPING_DELAY);
    };
    addNext();
  }, [scrollToBottom]);

  // Navigate to a step
  const goToStep = useCallback((stepKey, data = userData) => {
    const step = STEPS[stepKey];
    if (!step) return;

    setCurrentStep(stepKey);
    const msgs = typeof step.messages === 'function' ? step.messages(data) : step.messages;
    addBotMessages(msgs, () => {
      if (step.input) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    });
  }, [userData, addBotMessages]);

  // Initialize on open (ref prevents StrictMode double-fire)
  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      initializedRef.current = true;
      goToStep('welcome');
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // Handle option click
  const handleOptionClick = useCallback((option) => {
    // Add user message
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), text: option.label, sender: 'user' },
    ]);

    if (option.action === 'whatsapp') {
      const text = encodeURIComponent(
        `Hola, soy ${userData.name || 'un interesado'}. Me gustaría información sobre el servicio de tesis.`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
      return;
    }

    if (option.next) {
      setTimeout(() => goToStep(option.next), 300);
    }
  }, [userData, goToStep]);

  // Handle text input submit
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const step = STEPS[currentStep];
    if (!step?.input) return;

    const value = inputValue.trim();
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), text: value, sender: 'user' },
    ]);
    setInputValue('');

    const field = step.input;

    if (field === 'freetext') {
      setTimeout(() => goToStep('freetext_response'), 300);
      return;
    }

    const newData = { ...userData, [field]: value };
    setUserData(newData);

    // Navigate to next contact step
    if (field === 'name') {
      setTimeout(() => goToStep('contacto_email', newData), 300);
    } else if (field === 'email') {
      setTimeout(() => goToStep('contacto_telefono', newData), 300);
    } else if (field === 'phone') {
      // All contact data collected — could send to backend here
      sendLeadToBackend(newData);
      setTimeout(() => goToStep('resumen', newData), 300);
    }
  }, [inputValue, currentStep, userData, goToStep]);

  // Send lead data to backend (fire-and-forget)
  const sendLeadToBackend = (data) => {
    const API_URL = import.meta.env.VITE_BASE_URL || 'https://tesipedia-backend-service-production.up.railway.app';
    try {
      fetch(`${API_URL}/api/leads/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          source: 'chatbot_web',
          answers: data,
        }),
      }).catch(() => {
        // Silently fail — lead capture is best-effort
      });
    } catch {
      // Silently fail
    }
  };

  // Reset chat
  const handleReset = useCallback(() => {
    setChatMessages([]);
    setUserData({});
    setCurrentStep(null);
    setInputValue('');
    initializedRef.current = false;
    setTimeout(() => {
      initializedRef.current = true;
      goToStep('welcome');
    }, 100);
  }, [goToStep]);

  const step = currentStep ? STEPS[currentStep] : null;
  const showOptions = step?.options && !isTyping;
  const showInput = step?.input && !isTyping;

  return (
    <div className={`tesipedia-bot ${isOpen ? 'open' : ''}`} role="dialog" aria-label="Chat con asesora virtual Sofia">
      {/* Header */}
      <div className="bot-header">
        <div className="bot-header-info">
          <div className="bot-avatar">
            <FaRobot aria-hidden="true" />
          </div>
          <div>
            <h3 className="bot-header-name">{BOT_NAME}</h3>
            <span className="bot-header-status">Asesora Virtual • En línea</span>
          </div>
        </div>
        <button className="bot-close-btn" onClick={onClose} aria-label="Cerrar chat">
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div className="bot-messages" role="log" aria-live="polite">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`bot-msg ${msg.sender}`}>
            {msg.sender === 'bot' && (
              <div className="bot-msg-avatar">
                <FaRobot aria-hidden="true" />
              </div>
            )}
            <div className="bot-msg-bubble">
              <p>{msg.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="bot-msg bot">
            <div className="bot-msg-avatar">
              <FaRobot aria-hidden="true" />
            </div>
            <div className="bot-msg-bubble typing">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}

        {/* Quick reply options */}
        {showOptions && (
          <div className="bot-options">
            {step.options.map((opt, i) => (
              <button
                key={i}
                className={`bot-option-btn ${opt.action === 'whatsapp' ? 'whatsapp' : ''}`}
                onClick={() => handleOptionClick(opt)}
              >
                {opt.action === 'whatsapp' && <FaWhatsapp aria-hidden="true" />}
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {showInput ? (
        <form onSubmit={handleSubmit} className="bot-input-form">
          <input
            ref={inputRef}
            type={step.input === 'email' ? 'email' : step.input === 'phone' ? 'tel' : 'text'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              step.input === 'name' ? 'Tu nombre...'
                : step.input === 'email' ? 'Tu correo electrónico...'
                  : step.input === 'phone' ? 'Tu número de WhatsApp...'
                    : 'Escribe tu mensaje...'
            }
            className="bot-input"
            autoComplete={step.input === 'email' ? 'email' : step.input === 'phone' ? 'tel' : 'off'}
          />
          <button type="submit" className="bot-send-btn" disabled={!inputValue.trim()} aria-label="Enviar mensaje">
            <FaPaperPlane />
          </button>
        </form>
      ) : (
        <div className="bot-input-form bot-input-disabled">
          <span>Selecciona una opción arriba</span>
        </div>
      )}
    </div>
  );
};

export default TesipediaBot;
