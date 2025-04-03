import { Container, Row, Col, Card, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Blog.css';

function Blog() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const blogPosts = [
    {
      id: 1,
      title: 'Cómo Estructurar tu Tesis Correctamente',
      excerpt: 'Aprende los elementos fundamentales que debe contener una tesis profesional y cómo organizarlos de manera efectiva para maximizar el impacto de tu investigación.',
      image: '/blog/tesis-estructura.jpg',
      date: '2024-01-15',
      category: 'Metodología',
      readTime: '5 min',
      content: `Estructurar correctamente tu tesis no solo mejora la presentación académica, sino que también facilita su comprensión para el lector y el comité.

Elementos esenciales:

📌 Resumen ejecutivo: Un vistazo general, claro y conciso de todo tu trabajo.

🧭 Introducción: Define el problema, tus objetivos y justificación.

🧠 Marco teórico: Fundamenta tu proyecto con referencias actualizadas.

🛠 Metodología: Explica cómo investigaste, con qué instrumentos y por qué elegiste ese camino.

📊 Resultados y análisis: Presenta tus hallazgos con gráficas, tablas y reflexiones.

✅ Conclusiones y recomendaciones: Cierra con propuestas y áreas futuras de investigación.

💡 Tip visual: Usa títulos jerarquizados, interlineado adecuado y citas APA actualizadas.`
    },
    {
      id: 2,
      title: 'Tips para Defender tu Tesis con Éxito',
      excerpt: 'Descubre las estrategias clave y consejos prácticos para preparar y realizar una defensa de tesis exitosa que impresione a tu comité evaluador.',
      image: '/blog/defensa-tesis.jpg',
      date: '2024-01-10',
      category: 'Consejos',
      readTime: '4 min',
      content: `Tu defensa es la culminación de tu esfuerzo. Prepárate para impactar con claridad y seguridad.

🔍 Antes de la defensa:

• Revisa tus capítulos más de una vez.
• Prepara una presentación de máximo 15 diapositivas.
• Ensaya con un amigo o frente al espejo.

🎤 Durante la defensa:

• Habla con claridad y evita tecnicismos innecesarios.
• Escucha las preguntas con atención y responde con argumentos.
• Agradece los comentarios del jurado, incluso si son críticos.

💪 Consejo emocional: Respira, mantén contacto visual, y recuerda que tú eres quien más sabe de tu investigación.`
    },
    {
      id: 3,
      title: 'Métodos de Investigación: Guía Completa',
      excerpt: 'Explora los diferentes métodos de investigación académica y aprende a elegir el más adecuado para tu proyecto de tesis.',
      image: '/blog/metodos-investigacion.jpg',
      date: '2024-01-20',
      category: 'Investigación',
      readTime: '6 min',
      content: `Elegir el método de investigación adecuado puede ser la diferencia entre una tesis sólida y una con vacíos.

🧪 Cuantitativo: 
• Datos medibles, estadística, encuestas, experimentos.

👥 Cualitativo: 
• Entrevistas, observaciones, estudios de caso.

⚖️ Mixto: 
• Combinación de ambos; ideal si tu investigación tiene múltiples enfoques.

📊 Tips clave:

• Usa software como SPSS o Excel para el análisis.
• Asegúrate de tener una muestra representativa.
• Incluye instrumentos validados en anexos.`
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
                  <span
                    className="blog-category"
                    style={{ backgroundColor: getCategoryColor(post.category) }}
                  >
                    {post.category}
                  </span>
                </div>
                <Card.Body>
                  <Card.Title>{post.title}</Card.Title>
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
              <div className="modal-content">
                {selectedPost.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={paragraph.includes('📌') || paragraph.includes('🔍') || paragraph.includes('🧪') ? 'section-title' : ''}>
                    {paragraph}
                  </p>
                ))}
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
