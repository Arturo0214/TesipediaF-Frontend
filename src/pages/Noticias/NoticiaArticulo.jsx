import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Noticias.css';

const API = (import.meta.env.VITE_BASE_URL || '/api/');
const CAT_LBL = { tesis: 'Tesis', metodologia: 'Metodología', 'ia-academica': 'IA académica', titulacion: 'Titulación', becas: 'Becas', 'vida-universitaria': 'Vida universitaria' };

export default function NoticiaArticulo() {
  const { slug } = useParams();
  const [n, setN] = useState(undefined); // undefined=cargando, null=no encontrada

  useEffect(() => {
    setN(undefined);
    fetch(`${API}noticias/${slug}`).then((r) => (r.ok ? r.json() : null)).then(setN).catch(() => setN(null));
  }, [slug]);

  if (n === undefined) return <div className="ntp"><p className="ntp-muted">Cargando…</p></div>;
  if (!n) return <div className="ntp"><p className="ntp-muted">Artículo no encontrado. <Link to="/noticias">Ver todas las noticias</Link></p></div>;

  const fecha = n.publicado_at ? new Date(n.publicado_at).toISOString() : undefined;
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'NewsArticle',
    headline: n.titulo, description: n.resumen, image: n.imagen ? [n.imagen] : undefined,
    datePublished: fecha, author: { '@type': 'Organization', name: n.autor || 'Tesipedia' },
    publisher: { '@type': 'Organization', name: 'Tesipedia' },
    mainEntityOfPage: `https://tesipedia.com/noticias/${n.slug}`,
  };

  return (
    <article className="ntp ntp-article">
      <Helmet>
        <title>{n.titulo} | Tesipedia</title>
        <meta name="description" content={n.resumen || ''} />
        <link rel="canonical" href={`https://tesipedia.com/noticias/${n.slug}`} />
        <meta property="og:title" content={n.titulo} />
        <meta property="og:description" content={n.resumen || ''} />
        <meta property="og:type" content="article" />
        {n.imagen && <meta property="og:image" content={n.imagen} />}
        <script type="application/ld+json">{JSON.stringify(jsonld)}</script>
      </Helmet>
      <nav className="ntp-breadcrumb"><Link to="/noticias">Noticias</Link> · <span>{CAT_LBL[n.categoria] || n.categoria}</span></nav>
      <h1>{n.titulo}</h1>
      <p className="ntp-dek">{n.resumen}</p>
      <div className="ntp-byline">Por {n.autor || 'Redacción Tesipedia'}{fecha && ` · ${new Date(n.publicado_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`}</div>
      {n.imagen && <img className="ntp-hero" src={n.imagen} alt={n.titulo} />}
      <div className="ntp-body" dangerouslySetInnerHTML={{ __html: n.cuerpo || '' }} />
      {(n.tags || []).length > 0 && <div className="ntp-tags">{n.tags.map((t) => <span key={t}>#{t}</span>)}</div>}
      {n.fuente_url && <p className="ntp-fuente">Basado en información de <a href={n.fuente_url} target="_blank" rel="noopener noreferrer">{n.fuente_nombre || 'la fuente original'}</a>.</p>}
      <div className="ntp-cta"><h3>¿Trabajas en tu tesis?</h3><p>En Tesipedia te acompañamos en metodología, redacción y titulación.</p><Link to="/contacto" className="ntp-cta-btn">Contáctanos</Link></div>
    </article>
  );
}
