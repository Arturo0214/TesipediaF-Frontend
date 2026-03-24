import { Container, Row, Col, Card, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './Blog.css';

function Blog() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Imágenes para cada post — Cloudinary (propias) + Picsum (placeholder profesional)
  const images = {
    guiaTesis: 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713698/Estructurar-tesis_t6kiop.png',
    comprarTesis: 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743799333/ChatGPT_Image_4_abr_2025_02_41_53_p.m._hjnfrc.png',
    elegirServicio: 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743800151/WhatsApp_Image_2025-04-04_at_14.55.22_hmlo1d.jpg',
    preciosTesis: 'https://picsum.photos/id/180/800/450',
    estructuraTesis: 'https://picsum.photos/id/24/800/450',
    defensaTesis: 'https://picsum.photos/id/306/800/450',
    metodosInvestigacion: 'https://picsum.photos/id/367/800/450',
  };

  const blogPosts = [
    {
      id: 4,
      title: '¿Dónde Hacer Tu Tesis en México? Guía Completa 2026',
      excerpt: '¿Necesitas hacer tu tesis y no sabes por dónde empezar? Descubre las mejores opciones para hacer tu tesis de licenciatura, maestría o doctorado en México de forma profesional y confiable.',
      image: images.guiaTesis,
      date: '2026-03-20',
      category: 'Guía',
      readTime: '8 min',
      featured: true,
      content: `¿Necesitas hacer tu tesis y no sabes por dónde empezar? Miles de estudiantes en México buscan cada año quién les ayude a hacer su tesis de licenciatura, maestría o doctorado. En esta guía completa te explicamos todo lo que necesitas saber para hacer tu tesis de forma profesional.

📌 ¿Por Qué Hacer Tu Tesis con un Servicio Profesional?

Hacer una tesis es un proceso complejo que puede tomar meses o incluso años. Muchos estudiantes trabajan, tienen familia o simplemente no cuentan con el tiempo necesario para dedicarle a su proyecto de titulación. Un servicio profesional para hacer tesis te permite:

• Ahorrar meses de trabajo y esfuerzo
• Obtener una tesis 100% original y libre de plagio
• Recibir asesoría de expertos en tu área de estudio
• Cumplir con los estándares de calidad de tu universidad (UNAM, IPN, ITESM, UAM, UVM, etc.)
• Titularte más rápido y avanzar en tu carrera profesional

🎯 ¿Cómo Funciona el Servicio para Hacer Tu Tesis en Tesipedia?

En Tesipedia te hacemos tu tesis de principio a fin. Nuestro proceso es simple:

• Cotización gratuita: Nos contactas por WhatsApp y nos cuentas tu proyecto
• Asignación de experto: Te asignamos un asesor especializado en tu área
• Desarrollo: Elaboramos tu tesis con estructura metodológica profesional
• Revisión antiplagio: Pasamos tu tesis por Turnitin y escáner anti-IA
• Correcciones: Incluimos correcciones de tu asesor y sinodales
• Aprobación: Te acompañamos hasta tu titulación

📊 ¿Cuánto Cuesta Hacer una Tesis en México?

Los precios para hacer una tesis en México varían según el nivel académico, la extensión y la complejidad. En Tesipedia ofrecemos precios competitivos:

• Tesis de licenciatura (100 páginas): desde $9,900 MXN
• Tesis de maestría: desde $14,900 MXN
• Artículos científicos: desde $6,300 MXN
• Tesinas: desde $7,900 MXN

Aceptamos pagos en parcialidades, tarjetas de crédito/débito, transferencias y OXXO.

🔬 ¿Por Qué Tesipedia es la Mejor Opción para Hacer Tu Tesis?

• +3,000 estudiantes titulados exitosamente
• 98% de índice de aprobación
• +50 asesores expertos en todas las áreas
• Escáner antiplagio Turnitin incluido
• Escáner anti-IA incluido
• Entrega desde 3 semanas
• 100% confidencial
• Garantía de aprobación

✅ Universidades Donde Nuestros Estudiantes se Han Titulado

Hemos ayudado a hacer tesis a estudiantes de las principales universidades de México: UNAM, IPN, ITESM (Tec de Monterrey), UAM, UVM, UNITEC, La Salle, Anáhuac, Iberoamericana, BUAP, UdeG, UANL, y muchas más.

📝 Contáctanos para Hacer Tu Tesis

¿Listo para hacer tu tesis? Contáctanos por WhatsApp al +52 56 7007 1517 y recibe una cotización gratuita sin compromiso. En Tesipedia te hacemos tu tesis con la calidad que tu universidad exige.`
    },
    {
      id: 5,
      title: '¿Es Seguro Comprar Tesis en México? Lo Que Debes Saber',
      excerpt: '¿Estás pensando en comprar tu tesis? Te explicamos cómo funciona el servicio de elaboración de tesis por encargo, qué garantías pedir y cómo asegurarte de recibir un trabajo de calidad.',
      image: images.comprarTesis,
      date: '2026-03-18',
      category: 'Consejos',
      readTime: '7 min',
      content: `Comprar tesis en México es una práctica más común de lo que piensas. Miles de profesionistas ya titulados recurrieron a servicios profesionales para elaborar su tesis. En este artículo te explicamos todo lo que necesitas saber antes de comprar tu tesis.

📌 ¿Qué Significa "Comprar Tesis"?

Comprar una tesis no significa adquirir un documento genérico. Un servicio profesional de tesis por encargo desarrolla un proyecto de investigación único y personalizado para ti. Tu tesis se elabora desde cero, adaptada a los requisitos específicos de tu universidad y programa académico.

🎯 ¿Qué Garantías Debes Pedir al Comprar tu Tesis?

Antes de comprar tu tesis con cualquier servicio, asegúrate de que ofrezcan:

• Escáner antiplagio Turnitin: Garantiza que tu tesis sea 100% original
• Escáner anti-IA: Asegura que el contenido no sea generado por inteligencia artificial
• Correcciones incluidas: Tu asesor universitario pedirá cambios, deben estar incluidos
• Garantía de aprobación: El servicio debe acompañarte hasta que tu tesis sea aprobada
• Confidencialidad total: Nadie debe saber que recibiste ayuda
• Comunicación directa: Debes poder hablar con tu asesor asignado

📊 ¿Cuánto Cuesta Comprar una Tesis?

Los precios para comprar tesis en México van desde $6,300 hasta $22,000 MXN dependiendo del nivel académico y la extensión. Desconfía de precios extremadamente bajos, ya que podrían ser trabajos reciclados o generados con IA.

🔬 ¿Por Qué Comprar tu Tesis con Tesipedia?

Tesipedia es el servicio #1 en México para comprar tesis profesionales. Con más de 3,000 estudiantes titulados, ofrecemos:

• Desarrollo 100% original desde cero
• Investigadores expertos con maestría y doctorado
• Turnitin + escáner anti-IA incluido
• Correcciones ilimitadas de asesor y sinodales
• Pago seguro con tarjeta, transferencia u OXXO
• Entrega puntual garantizada

✅ ¿Es Legal Comprar una Tesis?

La elaboración de tesis por encargo es un servicio de asesoría académica profesional. Es completamente legal y opera bajo la figura de asesoría y consultoría educativa. Tu tesis será un proyecto único que tú presentas y defiendes.

📝 Compra Tu Tesis con Tesipedia

¿Listo para comprar tu tesis? Cotiza gratis por WhatsApp al +52 56 7007 1517. Más de 3,000 estudiantes ya se titularon con Tesipedia. Tú puedes ser el siguiente.`
    },
    {
      id: 6,
      title: 'Hacemos Tu Tesis: ¿Cómo Elegir el Mejor Servicio de Tesis en México?',
      excerpt: '¿Buscas quién te haga tu tesis? Compara los servicios de elaboración de tesis disponibles en México y aprende a elegir el mejor para tu proyecto académico.',
      image: images.elegirServicio,
      date: '2026-03-15',
      category: 'Guía',
      readTime: '6 min',
      content: `Cada año miles de estudiantes en México buscan servicios que les hagan su tesis. Con tantas opciones disponibles, elegir el servicio correcto puede ser complicado. En esta guía te ayudamos a tomar la mejor decisión.

📌 ¿Qué Buscar en un Servicio que te Haga tu Tesis?

No todos los servicios de tesis son iguales. Estos son los criterios más importantes:

• Experiencia comprobada: Busca un servicio con historial de tesis aprobadas
• Equipo de expertos: Asesores con maestría o doctorado en tu área
• Antiplagio profesional: Debe incluir Turnitin, no solo software genérico
• Anti-IA: En 2026, las universidades detectan contenido de IA. Tu servicio debe garantizar contenido humano
• Garantía de aprobación: No solo entregar la tesis, sino acompañarte hasta la titulación
• Transparencia en precios: Cotización clara sin costos ocultos

🎯 Comparativa de Servicios de Tesis en México

Al comparar servicios para hacer tu tesis, considera:

• ¿Incluyen Turnitin? Muchos servicios usan software antiplagio gratuito que no es aceptado por universidades
• ¿Tienen escáner anti-IA? En 2026 esto es fundamental
• ¿Ofrecen correcciones? Tu asesor universitario pedirá cambios, deben estar incluidos
• ¿Cuál es su índice de aprobación? Un buen servicio tiene >90%
• ¿Tienen testimonios verificables? Busca reseñas reales

🔬 ¿Por Qué Tesipedia es Diferente?

Tesipedia se distingue de otros servicios porque:

• Somos 100% mexicanos: Entendemos el sistema universitario de México
• +3,000 titulados: El historial más grande del país
• 98% aprobación: Índice superior al promedio de la industria
• Turnitin + anti-IA: Doble escáner incluido en todos los paquetes
• Asesores verificados: +50 expertos con posgrado en diversas áreas
• Plataforma propia: Seguimiento en tiempo real de tu proyecto
• WhatsApp 24/7: Comunicación directa y rápida

📊 Testimonios de Estudiantes

Más de 3,000 estudiantes han confiado en Tesipedia para hacer su tesis. Desde estudiantes de la UNAM, IPN, ITESM, hasta universidades privadas como UVM, La Salle y Anáhuac.

✅ Haz Tu Tesis con los Expertos

¿Necesitas que te hagan tu tesis? Contacta a Tesipedia por WhatsApp al +52 56 7007 1517 y recibe una cotización personalizada. Te hacemos tu tesis con la calidad que mereces.`
    },
    {
      id: 7,
      title: 'Tesis por Encargo en México: Precios, Tiempos y Todo Lo Que Necesitas Saber',
      excerpt: '¿Cuánto cuesta encargar una tesis en México? ¿Cuánto tiempo tarda? Resolvemos todas tus dudas sobre el servicio de tesis por encargo más confiable del país.',
      image: images.preciosTesis,
      date: '2026-03-10',
      category: 'Precios',
      readTime: '7 min',
      content: `Si estás buscando encargar tu tesis en México, es normal tener muchas dudas sobre precios, tiempos y calidad. En este artículo respondemos las preguntas más frecuentes sobre tesis por encargo.

📌 ¿Qué es una Tesis por Encargo?

Una tesis por encargo es un proyecto de investigación académica desarrollado por profesionales a solicitud de un estudiante. A diferencia de un trabajo genérico, una tesis por encargo se elabora 100% desde cero, siguiendo los lineamientos específicos de tu universidad, programa y tema de investigación.

🎯 ¿Cuánto Cuesta una Tesis por Encargo en México en 2026?

Los precios de tesis por encargo en México varían según varios factores:

• Nivel académico: Licenciatura, maestría o doctorado
• Extensión: Número de páginas requeridas
• Complejidad: Área de estudio y metodología requerida
• Urgencia: Plazo de entrega solicitado

En Tesipedia, los precios actualizados a 2026 son:

• Artículo científico (35 págs): desde $6,300 MXN
• Tesina (50 págs): desde $7,900 MXN
• Tesis de licenciatura (100 págs): desde $9,900 MXN
• Tesis de maestría (120+ págs): desde $14,900 MXN
• Tesis doctoral: cotización personalizada

📊 ¿Cuánto Tiempo Tarda una Tesis por Encargo?

Los tiempos estándar en Tesipedia son:

• Tesis de licenciatura: 3-4 semanas
• Tesis de maestría: 4-6 semanas
• Tesis doctoral: 6-10 semanas
• Servicio express: disponible con entrega acelerada

🔬 ¿Qué Incluye la Tesis por Encargo de Tesipedia?

Cada tesis por encargo incluye:

• Desarrollo completo desde cero
• Estructura metodológica profesional
• Marco teórico con fuentes actualizadas
• Análisis de datos según tu metodología
• Escáner antiplagio Turnitin
• Escáner anti-IA
• Correcciones de asesor y sinodales
• Preparación para defensa de tesis
• Garantía de aprobación

✅ Formas de Pago

Aceptamos múltiples formas de pago para tu comodidad:

• Tarjetas de crédito y débito (Visa, Mastercard, AMEX)
• Transferencia bancaria SPEI
• PayPal
• OXXO
• Pagos en parcialidades disponibles
• 10% descuento por pago completo en efectivo

📝 Encarga Tu Tesis con Tesipedia

¿Listo para encargar tu tesis? Más de 3,000 estudiantes ya se titularon con nosotros. Cotiza gratis por WhatsApp al +52 56 7007 1517. Tesipedia: te hacemos tu tesis de la mejor calidad.`
    },
    {
      id: 1,
      title: 'Cómo Estructurar tu Tesis Correctamente',
      excerpt: 'Aprende los elementos fundamentales que debe contener una tesis profesional y cómo organizarlos de manera efectiva para maximizar el impacto de tu investigación.',
      image: images.estructuraTesis,
      date: '2024-01-15',
      category: 'Metodología',
      readTime: '5 min',
      content: `La estructura de una tesis es fundamental para presentar tu investigación de manera clara, coherente y profesional. En esta guía, exploraremos cada componente esencial y las mejores prácticas para su desarrollo.

📌 Elementos Preliminares

• Portada: Incluye el título de la tesis, tu nombre, la institución, el grado que obtendrás y la fecha.
• Agradecimientos: Reconoce a quienes te apoyaron en tu investigación.
• Índice: Organiza el contenido de manera clara y accesible.
• Resumen/Abstract: Síntesis concisa de tu investigación (250-300 palabras).

🎯 Capítulo 1: Introducción

• Planteamiento del problema: Define claramente el problema de investigación.
• Justificación: Explica por qué tu investigación es relevante y necesaria.
• Objetivos: Establece objetivos generales y específicos medibles y alcanzables.
• Hipótesis: Formula las hipótesis que guiarán tu investigación.

📚 Capítulo 2: Marco Teórico

• Antecedentes: Revisa investigaciones previas relevantes.
• Fundamentos teóricos: Presenta las teorías que sustentan tu investigación.
• Marco conceptual: Define los conceptos clave de tu estudio.
• Estado del arte: Analiza las investigaciones más recientes en tu campo.

🔬 Capítulo 3: Metodología

• Diseño de investigación: Describe el tipo de estudio realizado.
• Población y muestra: Define y justifica tu selección de participantes.
• Instrumentos: Detalla las herramientas de recolección de datos.
• Procedimientos: Explica paso a paso cómo realizaste la investigación.

📊 Capítulo 4: Resultados y Análisis

• Presentación de datos: Utiliza tablas, gráficos y figuras efectivamente.
• Análisis estadístico: Interpreta los datos cuantitativos.
• Análisis cualitativo: Examina patrones y temas emergentes.
• Discusión: Contrasta tus hallazgos con investigaciones previas.

✅ Capítulo 5: Conclusiones

• Síntesis de hallazgos: Resume los principales descubrimientos.
• Implicaciones: Discute el impacto de tu investigación.
• Limitaciones: Reconoce las limitaciones del estudio.
• Recomendaciones: Sugiere líneas futuras de investigación.

📝 Consejos de Formato y Estilo

• Utiliza un estilo académico formal y objetivo.
• Mantén consistencia en el formato de títulos y subtítulos.
• Sigue rigurosamente el manual de estilo requerido (APA, Chicago, etc.).
• Incluye citas y referencias actualizadas y relevantes.

🔍 Revisión y Edición

• Revisa la coherencia y fluidez entre secciones.
• Verifica la precisión de datos y citas.
• Realiza una revisión ortográfica y gramatical exhaustiva.
• Solicita retroalimentación de tu asesor y pares académicos.`
    },
    {
      id: 2,
      title: 'Tips para Defender tu Tesis con Éxito',
      excerpt: 'Descubre las estrategias clave y consejos prácticos para preparar y realizar una defensa de tesis exitosa que impresione a tu comité evaluador.',
      image: images.defensaTesis,
      date: '2024-01-10',
      category: 'Consejos',
      readTime: '4 min',
      content: `La defensa de tesis es el momento culminante de tu trayectoria académica. Aquí te presentamos una guía completa para prepararte y destacar en esta importante presentación.

🔍 Preparación Previa (2-3 semanas antes)

• Revisa exhaustivamente tu documento de tesis
• Identifica posibles preguntas y prepara respuestas
• Practica tu presentación múltiples veces
• Familiarízate con el espacio y equipo de presentación

📊 Estructura de la Presentación

• Introducción (2-3 minutos): Presenta el tema y su relevancia
• Metodología (4-5 minutos): Explica tu enfoque de investigación
• Resultados Principales (5-6 minutos): Presenta los hallazgos más importantes
• Conclusiones (2-3 minutos): Resume los puntos clave

🎤 Durante la Defensa

• Mantén contacto visual con el comité
• Habla con claridad y a un ritmo adecuado
• Muestra seguridad y dominio del tema
• Escucha atentamente las preguntas

💡 Consejos para las Preguntas

• Toma notas durante las preguntas
• Pide aclaraciones si es necesario
• Responde con precisión y concisión
• Admite limitaciones cuando sea apropiado

🎯 Aspectos Técnicos

• Prepara una presentación visual efectiva
• Utiliza gráficos y tablas relevantes
• Asegura que el formato sea profesional
• Ten un respaldo de tu presentación

⚡ Tips de Último Minuto

• Descansa bien la noche anterior
• Llega con tiempo de anticipación
• Viste profesionalmente
• Ten agua a la mano
• Respira profundamente antes de comenzar`
    },
    {
      id: 3,
      title: 'Métodos de Investigación: Guía Completa',
      excerpt: 'Explora los diferentes métodos de investigación académica y aprende a elegir el más adecuado para tu proyecto de tesis.',
      image: images.metodosInvestigacion,
      date: '2024-01-20',
      category: 'Investigación',
      readTime: '6 min',
      content: `La selección del método de investigación adecuado es crucial para el éxito de tu tesis. Esta guía te ayudará a comprender y elegir el enfoque más apropiado para tu investigación.

🔬 Métodos Cuantitativos

• Investigación Experimental: Control de variables y análisis estadístico riguroso
• Investigación No Experimental: Estudios descriptivos y correlacionales
• Encuestas y Cuestionarios: Recolección de datos a gran escala
• Estudios Longitudinales: Seguimiento de variables en el tiempo

📊 Análisis Cuantitativo

• Estadística descriptiva
• Pruebas de hipótesis
• Análisis de regresión
• Modelado estadístico

👥 Métodos Cualitativos

• Etnografía: Observación participante y análisis cultural
• Estudio de Caso: Análisis detallado con múltiples fuentes de datos
• Investigación Fenomenológica: Experiencias vividas e interpretación subjetiva
• Teoría Fundamentada: Desarrollo de teoría a partir de datos

📝 Análisis Cualitativo

• Codificación de datos
• Análisis temático
• Triangulación
• Saturación teórica

🔄 Métodos Mixtos

• Diseño Secuencial: Fase cuantitativa seguida de cualitativa o viceversa
• Diseño Convergente: Recolección simultánea y análisis paralelo
• Integración de hallazgos de ambos enfoques

🛠 Herramientas y Software

• Análisis Cuantitativo: SPSS, R, Excel, Stata
• Análisis Cualitativo: NVivo, Atlas.ti, MAXQDA, Dedoose

📈 Validez y Confiabilidad

• Validez Interna: Control de variables y diseño apropiado
• Validez Externa: Generalización y representatividad
• Confiabilidad: Consistencia, estabilidad y reproducibilidad

🎯 Selección del Método

Factores a considerar:

• Objetivos de investigación
• Naturaleza del problema
• Recursos disponibles
• Tiempo y presupuesto
• Acceso a participantes
• Experticia del investigador`
    }
  ];

  const categories = ['Todos', ...new Set(blogPosts.map(p => p.category))];

  const filteredPosts = activeCategory === 'Todos'
    ? blogPosts
    : blogPosts.filter(p => p.category === activeCategory);

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  const getCategoryColor = (category) => {
    const colors = {
      'Metodología': '#059669',
      'Consejos': '#2563EB',
      'Investigación': '#7C3AED',
      'Guía': '#EA580C',
      'Precios': '#DC2626'
    };
    return colors[category] || '#6B7280';
  };

  const getCategoryBg = (category) => {
    const colors = {
      'Metodología': 'rgba(5, 150, 105, 0.1)',
      'Consejos': 'rgba(37, 99, 235, 0.1)',
      'Investigación': 'rgba(124, 58, 237, 0.1)',
      'Guía': 'rgba(234, 88, 12, 0.1)',
      'Precios': 'rgba(220, 38, 38, 0.1)'
    };
    return colors[category] || 'rgba(107, 114, 128, 0.1)';
  };

  const handleReadMore = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (/^[📌🎯📚🔬📊✅📝🔍🎤💡⚡👥🔄🛠📈]/.test(paragraph)) {
        return <h3 key={index} className="modal-subtitle">{paragraph}</h3>;
      }
      if (paragraph.includes('•')) {
        const items = paragraph.split('•').filter(item => item.trim());
        return (
          <ul key={index} className="modal-list">
            {items.map((item, i) => (
              <li key={i}>{item.trim()}</li>
            ))}
          </ul>
        );
      }
      return <p key={index}>{paragraph}</p>;
    });
  };

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Blog Académico — Tesipedia",
    "description": "Recursos, consejos y guías profesionales para estudiantes universitarios. Aprende a estructurar tu tesis, defender tu proyecto y dominar métodos de investigación.",
    "url": "https://tesipedia.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Tesipedia",
      "url": "https://tesipedia.com"
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.date,
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "image": post.image
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://tesipedia.com/blog" }
    ]
  };

  return (
    <>
    <Helmet>
      <title>Blog: Hacer Tesis en México | Guías, Precios y Consejos — Tesipedia</title>
      <meta name="description" content="¿Necesitas hacer tu tesis? Blog con guías completas sobre cómo hacer tu tesis, cuánto cuesta, dónde comprar tesis en México, y consejos de expertos. Tesipedia: te hacemos tu tesis." />
      <meta name="keywords" content="hacer tesis, comprar tesis México, tesis por encargo, cuánto cuesta una tesis, hacer mi tesis, te hacemos tu tesis, servicio de tesis, guía tesis profesional, Tesipedia blog" />
      <meta property="og:title" content="Blog Académico — Tesipedia | Guías y Consejos para tu Tesis" />
      <meta property="og:description" content="Recursos gratuitos y guías profesionales para que tu tesis sea un éxito. Por los expertos de Tesipedia." />
      <meta property="og:type" content="blog" />
      <meta property="og:url" content="https://tesipedia.com/blog" />
      <meta property="og:image" content="https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" />
      <meta property="og:locale" content="es_MX" />
      <link rel="canonical" href="https://tesipedia.com/blog" />
      <script type="application/ld+json">{JSON.stringify(blogSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
    <div className="blog-page">
      {/* Hero header */}
      <div className="blog-hero">
        <Container>
          <div className="blog-hero-content">
            <span className="blog-hero-badge">Blog Tesipedia</span>
            <h1 className="blog-hero-title">Guías y Recursos para tu Tesis</h1>
            <p className="blog-hero-subtitle">
              Precios actualizados, consejos de expertos y todo lo que necesitas para tu tesis de licenciatura, maestría o doctorado
            </p>
          </div>
        </Container>
      </div>

      <Container className="blog-container">
        {/* Category pills */}
        <div className="blog-categories">
          {categories.map(cat => (
            <button
              key={cat}
              className={`blog-cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              style={activeCategory === cat ? {
                backgroundColor: cat === 'Todos' ? '#1E3A5F' : getCategoryColor(cat),
                color: 'white'
              } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {featuredPost && (
          <div className="blog-featured" onClick={() => handleReadMore(featuredPost)}>
            <div className="blog-featured-image">
              <img src={featuredPost.image} alt={featuredPost.title} loading="lazy" />
              <div className="blog-featured-overlay" />
            </div>
            <div className="blog-featured-content">
              <span
                className="blog-tag"
                style={{
                  color: getCategoryColor(featuredPost.category),
                  backgroundColor: getCategoryBg(featuredPost.category)
                }}
              >
                {featuredPost.category}
              </span>
              <h2 className="blog-featured-title">{featuredPost.title}</h2>
              <p className="blog-featured-excerpt">{featuredPost.excerpt}</p>
              <div className="blog-featured-meta">
                <span>{formatDate(featuredPost.date)}</span>
                <span className="blog-meta-dot" />
                <span>{featuredPost.readTime} de lectura</span>
              </div>
            </div>
          </div>
        )}

        {/* Grid de posts */}
        <Row className="g-4 blog-grid">
          {remainingPosts.map(post => (
            <Col key={post.id} md={6} lg={4}>
              <article className="blog-card" onClick={() => handleReadMore(post)}>
                <div className="blog-card-image">
                  <img src={post.image} alt={post.title} loading="lazy" />
                  <div className="blog-card-image-overlay" />
                </div>
                <div className="blog-card-body">
                  <span
                    className="blog-tag"
                    style={{
                      color: getCategoryColor(post.category),
                      backgroundColor: getCategoryBg(post.category)
                    }}
                  >
                    {post.category}
                  </span>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-footer">
                    <span className="blog-card-date">{formatDate(post.date)}</span>
                    <span className="blog-card-read">{post.readTime}</span>
                  </div>
                </div>
              </article>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Modal de lectura */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        className="blog-modal"
        centered
      >
        {selectedPost && (
          <>
            <Modal.Header closeButton>
              <div className="modal-header-inner">
                <span
                  className="blog-tag"
                  style={{
                    color: getCategoryColor(selectedPost.category),
                    backgroundColor: getCategoryBg(selectedPost.category)
                  }}
                >
                  {selectedPost.category}
                </span>
                <Modal.Title>{selectedPost.title}</Modal.Title>
                <div className="modal-header-meta">
                  <span>{formatDate(selectedPost.date)}</span>
                  <span className="blog-meta-dot" />
                  <span>{selectedPost.readTime} de lectura</span>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modal-hero-image">
                <img src={selectedPost.image} alt={selectedPost.title} loading="lazy" />
              </div>
              <div className="modal-article">
                {formatContent(selectedPost.content)}
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </div>
    </>
  );
}

export default Blog;
