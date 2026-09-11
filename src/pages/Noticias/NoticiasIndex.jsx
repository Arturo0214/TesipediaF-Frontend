import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Noticias.css';

const API = (import.meta.env.VITE_BASE_URL || '/api/');
const CAT_LBL = { tesis: 'Tesis', metodologia: 'Metodología', 'ia-academica': 'IA académica', titulacion: 'Titulación', becas: 'Becas', 'vida-universitaria': 'Vida universitaria' };

export default function NoticiasIndex() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    fetch(`${API}noticias`).then((r) => r.json()).then((d) => setItems(d.noticias || [])).catch(() => setItems([]));
  }, []);

  return (
    <div className="ntp">
      <Helmet>
        <title>Noticias y artículos para tesistas | Tesipedia</title>
        <meta name="description" content="Artículos y noticias sobre tesis, metodología de investigación, titulación, becas e IA académica para estudiantes universitarios en México." />
        <link rel="canonical" href="https://tesipedia.com/noticias" />
      </Helmet>
      <header className="ntp-head">
        <h1>Noticias y artículos</h1>
        <p>Tips, tendencias y recursos para tu tesis y tu vida universitaria.</p>
      </header>
      {items === null && <p className="ntp-muted">Cargando…</p>}
      {items && items.length === 0 && <p className="ntp-muted">Pronto publicaremos contenido nuevo.</p>}
      <div className="ntp-grid">
        {(items || []).map((n) => (
          <Link key={n.slug} to={`/noticias/${n.slug}`} className="ntp-card">
            <div className="ntp-card-img">{n.imagen ? <img src={n.imagen} alt={n.titulo} loading="lazy" /> : <div className="ntp-card-ph">{CAT_LBL[n.categoria] || 'Tesipedia'}</div>}</div>
            <div className="ntp-card-body">
              <span className="ntp-cat">{CAT_LBL[n.categoria] || n.categoria}</span>
              <h2>{n.titulo}</h2>
              <p>{n.resumen}</p>
              <span className="ntp-date">{n.publicado_at ? new Date(n.publicado_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
