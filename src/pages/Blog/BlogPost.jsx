import { useParams, Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FaCalendarAlt, FaClock, FaUser, FaArrowLeft, FaWhatsapp } from 'react-icons/fa';
import { getPostBySlug, blogPosts } from './blogData';
import './BlogPost.css';

const gradientFallbacks = [
  'linear-gradient(135deg, #1E3A5F 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
  'linear-gradient(135deg, #059669 0%, #10B981 100%)',
  'linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)',
  'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
  'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
  'linear-gradient(135deg, #0891B2 0%, #6366F1 100%)',
];

const BlogPostImage = ({ src, alt, index = 0, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const handleError = useCallback(() => setFailed(true), []);

  if (failed) {
    return (
      <div
        className={`bp-img-fallback ${className}`}
        style={{ background: gradientFallbacks[index % gradientFallbacks.length] }}
        aria-label={alt}
      >
        <span className="bp-img-fallback-icon">📚</span>
        <span className="bp-img-fallback-text">Tesipedia Blog</span>
      </div>
    );
  }

  return <img src={src} alt={alt} loading="eager" className={className} onError={handleError} />;
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
    'Metodología': 'rgba(5, 150, 105, 0.08)',
    'Consejos': 'rgba(37, 99, 235, 0.08)',
    'Investigación': 'rgba(124, 58, 237, 0.08)',
    'Guía': 'rgba(234, 88, 12, 0.08)',
    'Precios': 'rgba(220, 38, 38, 0.08)'
  };
  return colors[category] || 'rgba(107, 114, 128, 0.08)';
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Renderiza markdown inline: enlaces internos [texto](/ruta), externos [texto](http...) y **negritas**.
// Los enlaces internos usan <Link> (SPA) — clave para el interlinking SEO entre artículos y landings.
const renderInline = (text) => {
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let key = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    if (m[1] !== undefined) {
      const label = m[1];
      const url = m[2];
      if (url.startsWith('/')) {
        parts.push(<Link key={`l${key++}`} to={url}>{label}</Link>);
      } else {
        parts.push(<a key={`l${key++}`} href={url} target="_blank" rel="noopener noreferrer">{label}</a>);
      }
    } else if (m[3] !== undefined) {
      parts.push(<strong key={`b${key++}`}>{m[3]}</strong>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
};

const formatContent = (content) => {
  return content.split('\n\n').map((paragraph, index) => {
    if (/^[📌🎯📚🔬📊✅📝🔍🎤💡⚡👥🔄🛠📈💰🏆🎓]/.test(paragraph)) {
      return <h2 key={index} className="bp-subtitle">{renderInline(paragraph)}</h2>;
    }
    if (paragraph.includes('•')) {
      const items = paragraph.split('•').filter(item => item.trim());
      return (
        <ul key={index} className="bp-list">
          {items.map((item, i) => (
            <li key={i}>{renderInline(item.trim())}</li>
          ))}
        </ul>
      );
    }
    if (paragraph.includes('+52 56 7007 1517') || paragraph.includes('wa.me')) {
      const cleaned = paragraph.replace(/Cotiza gratis por WhatsApp al \+52 56 7007 1517\.?|Contáctanos por WhatsApp al \+52 56 7007 1517[^.]*\.?|Escríbenos por WhatsApp al \+52 56 7007 1517[^.]*\.?|WhatsApp al \+52 56 7007 1517[^.]*\.?/g, '').trim();
      return (
        <div key={index} className="bp-cta-block">
          <p>{renderInline(cleaned)}</p>
          <a href="https://wa.me/525670071517" target="_blank" rel="noopener noreferrer" className="bp-wa-btn">
            <FaWhatsapp /> Cotizar por WhatsApp
          </a>
        </div>
      );
    }
    return <p key={index}>{renderInline(paragraph)}</p>;
  });
};

function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="bp-page">
        <Container>
          <div className="bp-not-found">
            <h1>Artículo no encontrado</h1>
            <p>El artículo que buscas no existe o fue movido.</p>
            <Link to="/blog" className="bp-back-btn"><FaArrowLeft /> Volver al blog</Link>
          </div>
        </Container>
      </div>
    );
  }

  // Find related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  if (relatedPosts.length < 3) {
    const morePosts = blogPosts
      .filter(p => p.id !== post.id && !relatedPosts.find(r => r.id === p.id))
      .slice(0, 3 - relatedPosts.length);
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
    "author": { "@type": "Organization", "name": "Tesipedia", "url": "https://tesipedia.com" },
    "publisher": {
      "@type": "Organization",
      "name": "Tesipedia",
      "logo": { "@type": "ImageObject", "url": "https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://tesipedia.com/blog/${post.slug}` }
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

  // FAQPage schema → habilita rich snippets de preguntas en Google (solo si el post trae FAQ)
  const faqSchema = post.faq && post.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  } : null;

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
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      <article className="bp-page">
        {/* ── Header Section ── */}
        <div className="bp-header-section">
          <Container>
            <div className="bp-header-inner">
              {/* Breadcrumb */}
              <nav className="bp-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Inicio</Link>
                <span className="bp-breadcrumb-sep">/</span>
                <Link to="/blog">Blog</Link>
                <span className="bp-breadcrumb-sep">/</span>
                <span>{post.category}</span>
              </nav>

              {/* Category + Title + Meta */}
              <span
                className="bp-tag"
                style={{ color: getCategoryColor(post.category), backgroundColor: getCategoryBg(post.category) }}
              >
                {post.category}
              </span>
              <h1 className="bp-title">{post.title}</h1>
              <p className="bp-excerpt">{post.excerpt}</p>

              <div className="bp-meta">
                <div className="bp-meta-item">
                  <FaCalendarAlt />
                  <span>{formatDate(post.date)}</span>
                </div>
                <div className="bp-meta-item">
                  <FaClock />
                  <span>{post.readTime} de lectura</span>
                </div>
                <div className="bp-meta-item">
                  <FaUser />
                  <span>Tesipedia</span>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* ── Featured Image ── */}
        <Container>
          <div className="bp-featured-image">
            <BlogPostImage src={post.image} alt={post.title} index={post.id} className="bp-img" />
          </div>
        </Container>

        {/* ── Article Body ── */}
        <Container>
          <div className="bp-content-wrapper">
            <div className="bp-body">
              {formatContent(post.content)}
            </div>

            {/* ── CTA Banner ── */}
            <div className="bp-cta-banner">
              <div className="bp-cta-banner-content">
                <h3>¿Necesitas ayuda con tu tesis?</h3>
                <p>En Tesipedia te hacemos tu tesis 100% original. +3,000 estudiantes titulados en México.</p>
              </div>
              <div className="bp-cta-banner-actions">
                <a href="https://wa.me/525670071517" target="_blank" rel="noopener noreferrer" className="bp-cta-wa">
                  <FaWhatsapp /> Cotiza Gratis
                </a>
                <Link to="/preguntas-frecuentes" className="bp-cta-faq">Preguntas Frecuentes</Link>
              </div>
            </div>

            {/* ── FAQ (preguntas frecuentes del artículo) ── */}
            {post.faq && post.faq.length > 0 && (
              <section className="bp-faq">
                <h2 className="bp-faq-title">Preguntas frecuentes</h2>
                <div className="bp-faq-list">
                  {post.faq.map((f, i) => (
                    <details key={i} className="bp-faq-item">
                      <summary className="bp-faq-q">{f.q}</summary>
                      <p className="bp-faq-a">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* ── Related Posts ── */}
            {relatedPosts.length > 0 && (
              <section className="bp-related">
                <h2 className="bp-related-title">Artículos relacionados</h2>
                <div className="bp-related-grid">
                  {relatedPosts.map(rp => (
                    <Link key={rp.id} to={`/blog/${rp.slug}`} className="bp-related-card">
                      <div className="bp-related-card-img">
                        <BlogPostImage src={rp.image} alt={rp.title} index={rp.id} className="bp-related-img" />
                      </div>
                      <div className="bp-related-card-body">
                        <span
                          className="bp-tag bp-tag-sm"
                          style={{ color: getCategoryColor(rp.category), backgroundColor: getCategoryBg(rp.category) }}
                        >
                          {rp.category}
                        </span>
                        <h3>{rp.title}</h3>
                        <span className="bp-related-card-meta">{formatDate(rp.date)} · {rp.readTime}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Back ── */}
            <div className="bp-back">
              <Link to="/blog" className="bp-back-btn"><FaArrowLeft /> Volver al blog</Link>
            </div>
          </div>
        </Container>
      </article>
    </>
  );
}

export default BlogPost;
