import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: 'Cómo Estructurar tu Tesis Correctamente',
      excerpt: 'Aprende los elementos fundamentales que debe contener una tesis profesional...',
      image: '/blog/tesis-estructura.jpg',
      date: '2024-01-15',
      category: 'Metodología'
    },
    {
      id: 2,
      title: 'Tips para Defender tu Tesis con Éxito',
      excerpt: 'Preparación y consejos para una defensa de tesis exitosa...',
      image: '/blog/defensa-tesis.jpg',
      date: '2024-01-10',
      category: 'Consejos'
    },
    // Más posts...
  ];

  return (
    <Container className="blog-container">
      <h1 className="text-center mb-5">Blog Académico</h1>
      <Row className="g-4">
        {blogPosts.map(post => (
          <Col key={post.id} md={4}>
            <Card className="blog-post-card">
              <Card.Img variant="top" src={post.image} />
              <Card.Body>
                <small className="text-muted d-block mb-2">{post.category}</small>
                <Card.Title>{post.title}</Card.Title>
                <Card.Text>{post.excerpt}</Card.Text>
                <Link to={`/blog/${post.id}`} className="btn btn-outline-primary">
                  Leer más
                </Link>
              </Card.Body>
              <Card.Footer>
                {new Date(post.date).toLocaleDateString()}
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Blog;
