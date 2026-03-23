import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  keywords,
  ogImage = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png',
  ogType = 'website',
  canonical = 'https://tesipedia.com',
  schema = null,
  noindex = false
}) => {
  const defaultTitle = 'Tesipedia | ¿Necesitas ayuda con tu tesis? Servicio #1 en México';
  const defaultDescription = '¿No sabes cómo hacer tu tesis? En Tesipedia desarrollamos tu tesis de licenciatura, maestría o doctorado. 100% original, sin plagio ni IA. +3,000 titulados. Cotiza gratis.';
  const defaultKeywords = 'hacer mi tesis, ayuda con mi tesis, quién me hace mi tesis México, desarrollo de tesis, asesoría de tesis, cuánto cuesta una tesis, tesis licenciatura, tesis maestría, corrección de tesis, Tesipedia';

  const fullTitle = title ? `${title} | Tesipedia` : defaultTitle;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large'} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="es_MX" />
      <meta property="og:site_name" content="Tesipedia" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
