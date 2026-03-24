import { Container, Row, Col, Card, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { blogPosts, images } from './blogData';
import './Blog.css';

// Gradient fallbacks for when images fail to load (e.g. sandbox/dev)
const gradientFallbacks = [
  'linear-gradient(135deg, #1E3A5F 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
  'linear-gradient(135deg, #059669 0%, #10B981 100%)',
  'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
  'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
  'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
  'linear-gradient(135deg, #0891B2 0%, #6366F1 100%)',
];

/** Image component with graceful fallback to gradient + emoji */
const BlogImage = ({ src, alt, index = 0, className = '' }) => {
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => setFailed(true), []);

  if (failed) {
    return (
      <div
        className={`blog-img-fallback ${className}`}
        style={{ background: gradientFallbacks[index % gradientFallbacks.length] }}
        aria-label={alt}
      >
        <span className="blog-img-fallback-icon">📄</span>
        <span className="blog-img-fallback-text">{alt}</span>
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" className={className} onError={handleError} />;
};

function Blog() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Todos');

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
      // Section headings (emoji prefix)
      if (/^[📌🎯📚🔬📊✅📝🔍🎤💡⚡👥🔄🛠📈💰🏆🎓]/.test(paragraph)) {
        return <h3 key={index} className="modal-subtitle">{paragraph}</h3>;
      }
      // Bullet lists
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
      // CTA blocks (WhatsApp number present)
      if (paragraph.includes('+52 56 7007 1517') || paragraph.includes('wa.me')) {
        return (
          <div key={index} className="modal-cta-block">
            <p>{paragraph.replace(/Cotiza gratis por WhatsApp al \+52 56 7007 1517\.?|Contáctanos por WhatsApp al \+52 56 7007 1517[^.]*\.?|WhatsApp al \+52 56 7007 1517[^.]*\.?/g, '').trim()}</p>
            <a href="https://wa.me/525670071517" target="_blank" rel="noopener noreferrer">
              Cotizar por WhatsApp
            </a>
          </div>
        );
      }
      // Highlight boxes (for price info)
      if (paragraph.includes('$') && paragraph.includes('MXN') && paragraph.split('$').length >= 3) {
        return (
          <div key={index} className="modal-highlight-box">
            <p>{paragraph}</p>
          </div>
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
      "url": `https://tesipedia.com/blog/${post.slug}`,
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

        {/* Featured post — uses Link for SEO crawlability */}
        {featuredPost && (
          <Link to={`/blog/${featuredPost.slug}`} className="blog-featured">
            <div className="blog-featured-image">
              <BlogImage src={featuredPost.image} alt={featuredPost.title} index={0} />
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
          </Link>
        )}

        {/* Grid de posts */}
        <Row className="g-4 blog-grid">
          {remainingPosts.map(post => (
            <Col key={post.id} md={6} lg={4}>
              <Link to={`/blog/${post.slug}`} className="blog-card">
                <div className="blog-card-image">
                  <BlogImage src={post.image} alt={post.title} index={post.id} />
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
              </Link>
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
                <BlogImage src={selectedPost.image} alt={selectedPost.title} index={selectedPost.id} />
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
