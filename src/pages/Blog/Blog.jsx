import { Container, Row, Col } from 'react-bootstrap';
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
const BlogImage = ({ src, alt, index = 0 }) => {
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => setFailed(true), []);

  if (failed) {
    return (
      <div
        className="blog-img-fallback"
        style={{ background: gradientFallbacks[index % gradientFallbacks.length] }}
        aria-label={alt}
      >
        <span className="blog-img-fallback-icon">📄</span>
        <span className="blog-img-fallback-text">{alt}</span>
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" onError={handleError} />;
};

function Blog() {
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      <Container className="blog-container">
        <div className="blog-layout">
          {/* Sidebar: title + category filters */}
          <aside className="blog-sidebar">
            <div className="blog-sidebar-sticky">
              <h1 className="blog-sidebar-heading">Blog</h1>
              <p className="blog-sidebar-desc">Guías y recursos para tu tesis</p>
              <h3 className="blog-sidebar-title">Categorías</h3>
              <nav className="blog-categories">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`blog-cat-button ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    <span className="cat-button-text">{cat}</span>
                    {activeCategory === cat && <span className="cat-button-indicator" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content area */}
          <main className="blog-main">
            {/* Featured post */}
            {featuredPost && (
              <Link to={`/blog/${featuredPost.slug}`} className="blog-featured">
                <div className="blog-featured-image-wrapper">
                  <BlogImage src={featuredPost.image} alt={featuredPost.title} index={0} />
                  <div className="blog-featured-overlay" />
                </div>
                <div className="blog-featured-content">
                  <div className="blog-featured-top">
                    <span
                      className="blog-tag"
                      style={{
                        color: getCategoryColor(featuredPost.category),
                        backgroundColor: getCategoryBg(featuredPost.category)
                      }}
                    >
                      {featuredPost.category}
                    </span>
                  </div>
                  <h2 className="blog-featured-title">{featuredPost.title}</h2>
                  <p className="blog-featured-excerpt">{featuredPost.excerpt}</p>
                  <div className="blog-featured-meta">
                    <span>{formatDate(featuredPost.date)}</span>
                    <span className="blog-meta-sep">•</span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of posts */}
            <div className="blog-grid">
              {remainingPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="blog-card">
                  <div className="blog-card-image-wrapper">
                    <BlogImage src={post.image} alt={post.title} index={post.id} />
                    <div className="blog-card-image-overlay" />
                  </div>
                  <div className="blog-card-content">
                    <div className="blog-card-top">
                      <span
                        className="blog-tag"
                        style={{
                          color: getCategoryColor(post.category),
                          backgroundColor: getCategoryBg(post.category)
                        }}
                      >
                        {post.category}
                      </span>
                    </div>
                    <h3 className="blog-card-title">{post.title}</h3>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <div className="blog-card-meta">
                      <span>{formatDate(post.date)}</span>
                      <span className="blog-meta-sep">•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </Container>
    </div>
    </>
  );
}

export default Blog;
