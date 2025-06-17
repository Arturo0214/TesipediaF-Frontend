import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png',
  ogType = 'website',
  canonical = 'https://tesipedia.com'
}) => {
  const defaultTitle = 'Tesipedia | Servicios profesionales de tesis y asesoría académica';
  const defaultDescription = 'Cotiza, corrige y mejora tu tesis con nuestros expertos. Tesipedia te ayuda con plagio, estilo, redacción y más. Atención personalizada.';
  const defaultKeywords = 'tesis, tesipedia, corrección de estilo, revisión académica, plagio, investigación, servicios académicos';

  return (
    <Helmet>
      <title>{title ? `${title} | Tesipedia` : defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title ? `${title} | Tesipedia` : defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={title ? `${title} | Tesipedia` : defaultTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;