import { Container, Row, Col, Card, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Blog.css';

function Blog() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const estructuraTesis = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713698/Estructurar-tesis_t6kiop.png';
  const defensaTesis = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743799333/ChatGPT_Image_4_abr_2025_02_41_53_p.m._hjnfrc.png';
  const metodosInvestigacion = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743800151/WhatsApp_Image_2025-04-04_at_14.55.22_hmlo1d.jpg';

  const blogPosts = [
    {
      id: 1,
      title: 'Cómo Estructurar tu Tesis Correctamente',
      excerpt: 'Aprende los elementos fundamentales que debe contener una tesis profesional y cómo organizarlos de manera efectiva para maximizar el impacto de tu investigación.',
      image: estructuraTesis,
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
      image: defensaTesis,
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

1. Introducción (2-3 minutos)
   • Presenta el tema y su relevancia
   • Establece el contexto de tu investigación
   • Menciona brevemente tu motivación

2. Metodología (4-5 minutos)
   • Explica tu enfoque de investigación
   • Describe los métodos utilizados
   • Justifica tus decisiones metodológicas

3. Resultados Principales (5-6 minutos)
   • Presenta los hallazgos más importantes
   • Utiliza visualizaciones efectivas
   • Conecta con tus objetivos iniciales

4. Conclusiones (2-3 minutos)
   • Resume los puntos clave
   • Discute implicaciones
   • Sugiere investigaciones futuras

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
      image: metodosInvestigacion,
      date: '2024-01-20',
      category: 'Investigación',
      readTime: '6 min',
      content: `La selección del método de investigación adecuado es crucial para el éxito de tu tesis. Esta guía te ayudará a comprender y elegir el enfoque más apropiado para tu investigación.

🔬 Métodos Cuantitativos

1. Investigación Experimental
   • Control de variables
   • Grupos de control y experimental
   • Medición precisa de resultados
   • Análisis estadístico riguroso

2. Investigación No Experimental
   • Estudios descriptivos
   • Investigación correlacional
   • Estudios longitudinales
   • Encuestas y cuestionarios

📊 Análisis Cuantitativo
   • Estadística descriptiva
   • Pruebas de hipótesis
   • Análisis de regresión
   • Modelado estadístico

👥 Métodos Cualitativos

1. Etnografía
   • Observación participante
   • Notas de campo
   • Entrevistas en profundidad
   • Análisis cultural

2. Estudio de Caso
   • Análisis detallado
   • Múltiples fuentes de datos
   • Contexto específico
   • Narrativa rica

3. Investigación Fenomenológica
   • Experiencias vividas
   • Interpretación subjetiva
   • Entrevistas semi-estructuradas
   • Análisis temático

📝 Análisis Cualitativo
   • Codificación de datos
   • Análisis temático
   • Triangulación
   • Saturación teórica

🔄 Métodos Mixtos

1. Diseño Secuencial
   • Fase cuantitativa seguida de cualitativa
   • Fase cualitativa seguida de cuantitativa
   • Integración de resultados

2. Diseño Convergente
   • Recolección simultánea
   • Análisis paralelo
   • Integración de hallazgos

🛠 Herramientas y Software

• Análisis Cuantitativo
  - SPSS
  - R
  - Excel
  - Stata

• Análisis Cualitativo
  - NVivo
  - Atlas.ti
  - MAXQDA
  - Dedoose

📈 Validez y Confiabilidad

• Validez Interna
  - Control de variables
  - Diseño apropiado
  - Instrumentos calibrados

• Validez Externa
  - Generalización
  - Representatividad
  - Replicabilidad

• Confiabilidad
  - Consistencia
  - Estabilidad
  - Reproducibilidad

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

  const getCategoryColor = (category) => {
    const colors = {
      'Metodología': '#4CAF50',
      'Consejos': '#2196F3',
      'Investigación': '#9C27B0'
    };
    return colors[category] || '#757575';
  };

  const handleReadMore = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const formatContent = (content) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('📌') ||
        paragraph.startsWith('🎯') ||
        paragraph.startsWith('📚') ||
        paragraph.startsWith('🔬') ||
        paragraph.startsWith('📊') ||
        paragraph.startsWith('✅') ||
        paragraph.startsWith('📝') ||
        paragraph.startsWith('🔍') ||
        paragraph.startsWith('🎤') ||
        paragraph.startsWith('💡') ||
        paragraph.startsWith('🎯') ||
        paragraph.startsWith('⚡') ||
        paragraph.startsWith('👥') ||
        paragraph.startsWith('🔄') ||
        paragraph.startsWith('🛠') ||
        paragraph.startsWith('📈')) {
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

  return (
    <div className="blog-page">
      <Container className="blog-container">
        <div className="blog-header">
          <h1 className="gradient-title">Blog Académico</h1>
          <p className="blog-subtitle">
            Recursos, consejos y guías para ayudarte en tu camino académico
          </p>
        </div>

        <Row className="g-4">
          {blogPosts.map(post => (
            <Col key={post.id} md={6} lg={4}>
              <Card className="blog-card">
                <div className="blog-image-container">
                  <Card.Img variant="top" src={post.image} className="blog-image" />
                </div>
                <Card.Body>
                  <Card.Title>{post.title}</Card.Title>
                  <span
                    className="blog-category"
                    style={{ backgroundColor: getCategoryColor(post.category) }}
                  >
                    {post.category}
                  </span>
                  <Card.Text>{post.excerpt}</Card.Text>
                  <div className="blog-meta">
                    <span className="blog-date">
                      <i className="far fa-calendar-alt"></i>
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    <span className="blog-read-time">
                      <i className="far fa-clock"></i>
                      {post.readTime}
                    </span>
                  </div>
                  <button
                    onClick={() => handleReadMore(post)}
                    className="blog-button"
                  >
                    Leer más
                  </button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        className="blog-modal"
      >
        {selectedPost && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedPost.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="modal-image-container">
                <img src={selectedPost.image} alt={selectedPost.title} className="modal-image" />
              </div>
              <div className="modal-content-wrapper">
                <div className="modal-content">
                  {formatContent(selectedPost.content)}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className="modal-meta">
                <span className="modal-category" style={{ backgroundColor: getCategoryColor(selectedPost.category) }}>
                  {selectedPost.category}
                </span>
                <span className="modal-date">
                  <i className="far fa-calendar-alt"></i>
                  {new Date(selectedPost.date).toLocaleDateString()}
                </span>
                <span className="modal-read-time">
                  <i className="far fa-clock"></i>
                  {selectedPost.readTime}
                </span>
              </div>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Blog;
