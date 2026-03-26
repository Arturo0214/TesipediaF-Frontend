#!/usr/bin/env node

/**
 * Lightweight SEO pre-render script for Tesipedia
 *
 * Generates static HTML with proper meta tags, Open Graph data,
 * and JSON-LD structured data for each public route.
 *
 * NO Puppeteer or Chromium required — works in any CI environment.
 *
 * Usage: node scripts/prerender-seo.js
 * Or:    npm run prerender
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

// ─── SEO metadata for each route ───────────────────────────────────────

const SITE_URL = 'https://tesipedia.com';
const SITE_NAME = 'Tesipedia';
const DEFAULT_IMAGE = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';
const PHONE = '+52 56 7007 1517';

const routesMeta = [
  {
    path: '/',
    title: 'Tesipedia — Hacemos Tu Tesis en México | Licenciatura, Maestría y Doctorado',
    description: '¿Necesitas hacer tu tesis? Tesipedia te hace tu tesis de licenciatura, maestría y doctorado en México. 100% original, libre de plagio e IA. +3,000 titulados. Cotiza gratis.',
    keywords: 'hacer tesis, tesis por encargo, comprar tesis, tesis México, servicio de tesis, hacemos tu tesis, tesis de licenciatura, tesis de maestría, Tesipedia',
    schema: {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Tesipedia",
      "url": SITE_URL,
      "logo": DEFAULT_IMAGE,
      "description": "Servicio profesional de elaboración de tesis en México. +3,000 estudiantes titulados.",
      "telephone": "+52-56-7007-1517",
      "address": { "@type": "PostalAddress", "addressLocality": "Ciudad de México", "addressRegion": "CDMX", "addressCountry": "MX" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "3000", "bestRating": "5" },
      "priceRange": "$$"
    }
  },
  {
    path: '/contacto',
    title: 'Contacto — Tesipedia | Cotiza Tu Tesis Gratis',
    description: 'Contáctanos para cotizar tu tesis. WhatsApp +52 56 7007 1517. Respuesta inmediata, cotización gratuita y sin compromiso. Tesipedia — hacemos tu tesis.',
    keywords: 'contacto Tesipedia, cotizar tesis, WhatsApp tesis, precio tesis México'
  },
  {
    path: '/sobre-nosotros',
    title: 'Sobre Nosotros — Tesipedia | Equipo de Asesores Expertos',
    description: 'Conoce al equipo de Tesipedia. +50 asesores con maestría y doctorado, +3,000 estudiantes titulados. El servicio de tesis más confiable de México.',
    keywords: 'sobre Tesipedia, equipo Tesipedia, asesores de tesis, servicio de tesis México'
  },
  {
    path: '/preguntas-frecuentes',
    title: 'Preguntas Frecuentes — Tesipedia | Todo Sobre Nuestro Servicio de Tesis',
    description: '¿Cuánto cuesta una tesis? ¿Cuánto tarda? ¿Es seguro? Resolvemos todas tus dudas sobre el servicio de elaboración de tesis de Tesipedia.',
    keywords: 'preguntas frecuentes tesis, cuánto cuesta una tesis, servicio de tesis preguntas, FAQ Tesipedia'
  },
  {
    path: '/blog',
    title: 'Blog — Tesipedia | Guías, Tips y Recursos para Tu Tesis',
    description: 'Artículos y guías para hacer tu tesis: estructura, métodos de investigación, defensa, precios y más. Recursos gratuitos de Tesipedia.',
    keywords: 'blog tesis, guía tesis, cómo hacer una tesis, tips tesis, recursos tesis'
  },
  {
    path: '/register',
    title: 'Registrarse — Tesipedia | Comienza Tu Proyecto de Tesis',
    description: 'Crea tu cuenta en Tesipedia y comienza tu proyecto de tesis. Seguimiento en tiempo real, comunicación directa con tu asesor.',
    keywords: 'registro Tesipedia, crear cuenta tesis, empezar tesis'
  },
  {
    path: '/politica-de-privacidad',
    title: 'Política de Privacidad — Tesipedia',
    description: 'Política de privacidad de Tesipedia. Conoce cómo protegemos tus datos personales.',
    keywords: 'política de privacidad Tesipedia, protección de datos'
  },

  // ─── Blog posts ───────────────────────────────────────────────────────
  {
    path: '/blog/donde-hacer-tu-tesis-en-mexico-guia-completa-2026',
    title: '¿Dónde Hacer Tu Tesis en México? Guía Completa 2026 — Tesipedia',
    description: '¿Necesitas hacer tu tesis y no sabes por dónde empezar? Descubre las mejores opciones para hacer tu tesis de licenciatura, maestría o doctorado en México de forma profesional y confiable.',
    keywords: 'dónde hacer tesis México, hacer tesis 2026, servicio de tesis México, tesis licenciatura México',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-20',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "¿Dónde Hacer Tu Tesis en México? Guía Completa 2026",
      "datePublished": "2026-03-20",
      "dateModified": "2026-03-24",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "description": "Guía completa para hacer tu tesis en México en 2026. Opciones, precios y cómo elegir el mejor servicio."
    }
  },
  {
    path: '/blog/es-seguro-comprar-tesis-en-mexico-lo-que-debes-saber',
    title: '¿Es Seguro Comprar Tesis en México? Lo Que Debes Saber — Tesipedia',
    description: '¿Estás pensando en comprar tu tesis? Te explicamos cómo funciona el servicio de elaboración de tesis por encargo, qué garantías pedir y cómo asegurarte de recibir un trabajo de calidad.',
    keywords: 'comprar tesis México, es seguro comprar tesis, tesis por encargo seguro, garantías tesis',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-18',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "¿Es Seguro Comprar Tesis en México? Lo Que Debes Saber",
      "datePublished": "2026-03-18",
      "dateModified": "2026-03-24",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/hacemos-tu-tesis-como-elegir-el-mejor-servicio-de-tesis-en-mexico',
    title: 'Hacemos Tu Tesis: ¿Cómo Elegir el Mejor Servicio de Tesis en México? — Tesipedia',
    description: '¿Buscas quién te haga tu tesis? Compara los servicios de elaboración de tesis disponibles en México y aprende a elegir el mejor para tu proyecto académico.',
    keywords: 'hacemos tu tesis, mejor servicio de tesis México, elegir servicio tesis, comparar servicios tesis',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-15',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Hacemos Tu Tesis: ¿Cómo Elegir el Mejor Servicio de Tesis en México?",
      "datePublished": "2026-03-15",
      "dateModified": "2026-03-24",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/tesis-por-encargo-en-mexico-precios-tiempos-y-todo-lo-que-necesitas-saber',
    title: 'Tesis por Encargo en México: Precios, Tiempos y Todo Lo Que Necesitas Saber — Tesipedia',
    description: '¿Cuánto cuesta encargar una tesis en México? ¿Cuánto tiempo tarda? Resolvemos todas tus dudas sobre el servicio de tesis por encargo más confiable del país.',
    keywords: 'tesis por encargo México, precio tesis México 2026, cuánto cuesta una tesis, tiempo tesis por encargo',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-10',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Tesis por Encargo en México: Precios, Tiempos y Todo Lo Que Necesitas Saber",
      "datePublished": "2026-03-10",
      "dateModified": "2026-03-24",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/como-estructurar-tu-tesis-correctamente',
    title: 'Cómo Estructurar tu Tesis Correctamente — Tesipedia',
    description: 'Aprende los elementos fundamentales que debe contener una tesis profesional y cómo organizarlos de manera efectiva para maximizar el impacto de tu investigación.',
    keywords: 'estructura tesis, cómo estructurar tesis, formato tesis, partes de una tesis',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop&q=80',
    datePublished: '2024-01-15',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Cómo Estructurar tu Tesis Correctamente",
      "datePublished": "2024-01-15",
      "dateModified": "2026-03-24",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/tips-para-defender-tu-tesis-con-exito',
    title: 'Tips para Defender tu Tesis con Éxito — Tesipedia',
    description: 'Descubre las estrategias clave y consejos prácticos para preparar y realizar una defensa de tesis exitosa que impresione a tu comité evaluador.',
    keywords: 'defensa de tesis, tips defensa tesis, cómo defender tesis, preparar defensa tesis',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=450&fit=crop&q=80',
    datePublished: '2024-01-10',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Tips para Defender tu Tesis con Éxito",
      "datePublished": "2024-01-10",
      "dateModified": "2026-03-24",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/metodos-de-investigacion-guia-completa',
    title: 'Métodos de Investigación: Guía Completa — Tesipedia',
    description: 'Explora los diferentes métodos de investigación académica y aprende a elegir el más adecuado para tu proyecto de tesis.',
    keywords: 'métodos de investigación, investigación cualitativa, investigación cuantitativa, metodología tesis',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop&q=80',
    datePublished: '2024-01-20',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Métodos de Investigación: Guía Completa",
      "datePublished": "2024-01-20",
      "dateModified": "2026-03-24",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  }
];

// ─── HTML generation ─────────────────────────────────────────────────────

function generateMetaTags(route) {
  const url = `${SITE_URL}${route.path}`;
  const image = route.image || DEFAULT_IMAGE;

  let tags = `
    <title>${route.title}</title>
    <meta name="description" content="${route.description}" />
    <meta name="keywords" content="${route.keywords}" />
    <link rel="canonical" href="${url}" />

    <!-- Open Graph -->
    <meta property="og:type" content="${route.datePublished ? 'article' : 'website'}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="es_MX" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${route.title}" />
    <meta name="twitter:description" content="${route.description}" />
    <meta name="twitter:image" content="${image}" />`;

  if (route.datePublished) {
    tags += `
    <meta property="article:published_time" content="${route.datePublished}" />`;
  }

  return tags;
}

function generateSchemaScript(route) {
  if (!route.schema) return '';
  return `\n    <script type="application/ld+json">${JSON.stringify(route.schema)}</script>`;
}

function generateCrawlerContent(route) {
  // SEO content for crawlers — hidden visually but readable by Googlebot's HTML parser.
  // Googlebot reads the raw HTML BEFORE executing JS, so these semantic elements
  // help it understand the page content. React replaces #root on mount.
  // Using aria-hidden + hidden attribute so it never flashes on real users.
  const url = `${SITE_URL}${route.path}`;
  let content = `
    <div data-prerendered="true" hidden aria-hidden="true" style="display:none!important">
      <h1>${route.title.split(' — ')[0]}</h1>
      <p>${route.description}</p>`;

  if (route.datePublished) {
    content += `\n      <time datetime="${route.datePublished}">${route.datePublished}</time>`;
  }

  content += `
      <nav>
        <a href="${SITE_URL}/">Inicio</a> |
        <a href="${SITE_URL}/blog">Blog</a> |
        <a href="${SITE_URL}/sobre-nosotros">Sobre Nosotros</a> |
        <a href="${SITE_URL}/contacto">Contacto</a> |
        <a href="${SITE_URL}/preguntas-frecuentes">Preguntas Frecuentes</a>
      </nav>
      <p>Tesipedia — Hacemos tu tesis en México. <a href="https://wa.me/525670071517">WhatsApp: ${PHONE}</a></p>
    </div>`;
  return content;
}

async function prerender() {
  console.log('🚀 Iniciando pre-renderizado SEO ligero para Tesipedia...\n');

  // Verify dist exists
  if (!existsSync(distDir)) {
    console.error('❌ Error: No se encontró el directorio dist/. Ejecuta "npm run build" primero.');
    process.exit(1);
  }

  // Read the base index.html from Vite build
  const indexPath = resolve(distDir, 'index.html');
  if (!existsSync(indexPath)) {
    console.error('❌ Error: No se encontró dist/index.html.');
    process.exit(1);
  }

  const baseHtml = readFileSync(indexPath, 'utf-8');
  let successCount = 0;

  for (const route of routesMeta) {
    try {
      console.log(`  📄 Generando: ${route.path}`);

      // Generate the SEO-enhanced HTML
      let html = baseHtml;

      // Replace the <title> tag (Vite default)
      html = html.replace(/<title>[^<]*<\/title>/, '');

      // Inject meta tags before </head>
      const metaTags = generateMetaTags(route);
      const schemaScript = generateSchemaScript(route);
      const prerenderedMeta = '\n    <meta name="prerendered" content="true" />';

      html = html.replace(
        '</head>',
        `${metaTags}${schemaScript}${prerenderedMeta}\n  </head>`
      );

      // Add visible HTML content inside <div id="root"> for crawlers
      // React will hydrate over this content when JS loads
      const crawlerContent = generateCrawlerContent(route);
      html = html.replace(
        '<div id="root"></div>',
        `<div id="root">${crawlerContent}</div>`
      );

      // Determine output path
      const outputPath = route.path === '/'
        ? resolve(distDir, 'index.html')
        : resolve(distDir, route.path.slice(1), 'index.html');

      // Create directory if needed
      const outputDir = dirname(outputPath);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      writeFileSync(outputPath, html, 'utf-8');

      const sizeKb = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
      console.log(`     ✅ Guardado (${sizeKb} KB): ${outputPath.replace(rootDir, '')}`);
      successCount++;
    } catch (err) {
      console.error(`     ❌ Error en ${route.path}: ${err.message}`);
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ Pre-renderizado SEO completado:`);
  console.log(`   Exitosos: ${successCount}/${routesMeta.length}`);
  console.log(`${'═'.repeat(50)}\n`);

  console.log('📋 Rutas con HTML estático SEO-optimizado:');
  routesMeta.forEach(r => console.log(`   ${r.path}`));
  console.log('\n🔍 Google puede leer meta tags, Open Graph y JSON-LD sin ejecutar JavaScript.');
  console.log('🚀 ¡Deploy listo!\n');
}

prerender().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
