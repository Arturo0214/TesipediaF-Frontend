import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { getPostBySlug, blogPosts } from './blogData';
import './BlogPost.css';

// Gradient fallbacks for when images fail to load
const gradientFallbacks = [
  'linear-gradient(135deg, #1E3A5F 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
  'linear-gradient(135deg, #059669 0%, #10B981 100%)',
  'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
  'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
  'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
  'linear-gradient(135deg, #0891B2 0%, #6366F1 100%)',
];

const BlogPostImage = ({ src, alt, index = 0 }) => {
  const [failed, setFailed] = useState(false);
  const handleError = useCallback(() => setFailed(true), []);

  if (failed) {
    return (
      <div
        className="blog-post-hero-fallback"
        style={{ background: gradientFallbacks[index % gradientFallbacks.length] }}
        aria-label={alt}
      >
        <span className="blog-img-fallback-icon">📄</span>
        <span className="blog-img-fallback-text">{alt}</span>
      </div>
    );
  }

  return <img src={src} alt={alt} loading="eager" onError={handleError} />;
};

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

const formatContent = (content) => {
  return content.split('\n\n').map((paragraph, index) => {
    if (/^[📌🎯📚🔬📊✅📝🔍🎤💡⚡👥🔄🛠📈💰🏆🎓]/.test(paragraph)) {
      return <h2 key={index} className="blogpost-subtitle">{paragraph}</h2>;
    }
    if (paragraph.includes('•')) {
      const items = paragraph.split('•').filter(item => item.trim());
      return (
        <ul key={index} className="blogpost-list">
          {items.map((item, i) => (
            <li key={i}>{item.trim()}</li>
          ))}
        </ul>
      );
    }
    if (paragraph.includes('+52 56 7007 1517') || paragraph.includes('wa.me')) {
      return (
        <div key={index} className="blogpost-cta">
          <p>{paragraph.replace(/Cotiza gratis por WhatsApp al \+52 56 7007 1517\.?|Contáctanos por WhatsApp al \+52 56 7007 1517[^.]*\.?|Escríbenos por WhatsApp al \+52 56 7007 1517[^.]*\.?|WhatsApp al \+52 56 7007 1517[^.]*\.?/g, '').trim()}</p>
          <a href="https://wa.me/525670071517" target="_blank" rel="noopener noreferrer">
            Cotizar por WhatsApp
          </a>
        </div>
      );
    }
    return <p key={index}>{paragraph}</p>;
  });
};

function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="blog-page">
        <Container className="blog-container" style={{ textAlign: 'center', paddingTop: '6rem' }}>
          <h1>Artículo no encontrado</h1>
          <p style={{ color: '#64748B', margin: '1rem 0 2rem' }}>El artículo que buscas no existe o fue movido.</p>
          <Link to="/blog" className="blogpost-back-link">← Volver al blog</Link>
        </Container>
      </div>
    );
  }

  // Find related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 2);

  // If not enough from same category, fill with recent posts
  if (relatedPosts.length < 2) {
    const morePosts = blogPosts
      .filter(p => p.id !== post.id && !relatedPosts.find(r => r.id === p.id))
      .slice(0, 2 - relatedPosts.length);
    relatedPosts.push(...morePosts);
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Organization",
      "name": "Tesipedia",
      "url": "https://tesipedia.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tesipedia",
      "logo": {
        "@type": "ImageObject",
        "url": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://tesipedia.com/blog/${post.slug}`
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://tesipedia.com" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://tesipedia.com/blog" },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://tesipedia.com/blog/${post.slug}` }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{post.title} — Tesipedia Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={`${post.category}, tesis México, hacer tesis, Tesipedia, ${post.title.toLowerCase().split(' ').slice(0, 5).join(', ')}`} />
        <link rel="canonical" href={`https://tesipedia.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://tesipedia.com/blog/${post.slug}`} />
        <meta property="og:image" content={post.image} />
        <meta property="og:locale" content="es_MX" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content="Tesipedia" />
        <meta property="article:section" content={post.category} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <article className="blogpost-page">
        {/* Hero Image */}
        <div className="blogpost-hero-image">
          <BlogPostImage src={post.image} alt={post.title} index={post.id} />
          <div className="blogpost-hero-overlay" />
        </div>

        <Container>
          <div className="blogpost-content-wrapper">
            {/* Breadcrumb */}
            <nav className="blogpost-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Inicio</Link>
              <span>/</span>
              <Link to="/blog">Blog</Link>
              <span>/</span>
              <span>{post.category}</span>
            </nav>

            {/* Header */}
            <header className="blogpost-header">
              <span
                className="blog-tag"
                style={{
                  color: getCategoryColor(post.category),
                  backgroundColor: getCategoryBg(post.category)
                }}
              >
                {post.category}
              </span>
              <h1 className="blogpost-title">{post.title}</h1>
              <div className="blogpost-meta">
                <span>{formatDate(post.date)}</span>
                <span className="blog-meta-dot" />
                <span>{post.readTime} de lectura</span>
                <span className="blog-meta-dot" />
                <span>Por Tesipedia</span>
              </div>
            </header>

            {/* Article Body */}
            <div className="blogpost-body">
              {formatContent(post.content)}
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="blogpost-related">
                <h2>Artículos relacionados</h2>
                <div className="blogpost-related-grid">
                  {relatedPosts.map(rp => (
                    <Link key={rp.id} to={`/blog/${rp.slug}`} className="blogpost-related-card">
                      <span
                        className="blog-tag"
                        style={{
                          color: getCategoryColor(rp.category),
                          backgroundColor: getCategoryBg(rp.category)
                        }}
                      >
                        {rp.category}
                      </span>
                      <h3>{rp.title}</h3>
                      <span className="blogpost-related-meta">{formatDate(rp.date)} · {rp.readTime}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Back to blog */}
            <div className="blogpost-back">
              <Link to="/blog" className="blogpost-back-link">← Volver al blog</Link>
            </div>
          </div>
        </Container>
      </article>
    </>
  );
}

export default BlogPost;
