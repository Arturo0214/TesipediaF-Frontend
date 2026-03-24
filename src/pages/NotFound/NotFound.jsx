import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function NotFound() {
  return (
    <>
      <Helmet>
        <title>Página no encontrada — Tesipedia</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        marginTop: '2rem'
      }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 800, color: '#E2E8F0', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '1rem 0 0.5rem' }}>
          Página no encontrada
        </h2>
        <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          La página que buscas no existe o fue movida. Pero no te preocupes, podemos ayudarte con tu tesis.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" style={{
            padding: '0.7rem 1.5rem',
            background: '#1E3A5F',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            Ir al inicio
          </Link>
          <Link to="/blog" style={{
            padding: '0.7rem 1.5rem',
            background: 'white',
            color: '#1E3A5F',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            border: '1px solid #E2E8F0'
          }}>
            Ver el blog
          </Link>
          <a href="https://wa.me/525670071517" target="_blank" rel="noopener noreferrer" style={{
            padding: '0.7rem 1.5rem',
            background: '#25D366',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            Cotizar por WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}

export default NotFound;
