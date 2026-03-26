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
    keywords: 'preguntas frecuentes tesis, cuánto cuesta una tesis, servicio de tesis preguntas, FAQ Tesipedia',
    schema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "¿Cuánto cuesta hacer una tesis en México?", "acceptedAnswer": { "@type": "Answer", "text": "Para una tesis de licenciatura de 100 páginas, desde $9,900 MXN (corrección) hasta $19,800 MXN (desarrollo completo). Cotización gratuita disponible." } },
        { "@type": "Question", "name": "¿Cuánto tiempo tardan en hacer una tesis?", "acceptedAnswer": { "@type": "Answer", "text": "3 a 4 semanas para licenciatura, 4 a 8 semanas para maestría y doctorado. Servicio express disponible." } },
        { "@type": "Question", "name": "¿La tesis es original y sin plagio?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, cada tesis se verifica con Turnitin y escáneres anti-IA. Elaborada 100% por investigadores humanos." } },
        { "@type": "Question", "name": "¿Dónde comprar tesis en México de forma segura?", "acceptedAnswer": { "@type": "Answer", "text": "Tesipedia: +3,000 titulados, 98% aprobación, tesis 100% originales. WhatsApp: +52 56 7007 1517." } },
        { "@type": "Question", "name": "¿Hacen tesis para cualquier universidad?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, para UNAM, IPN, ITESM, UAM, UVM, UNITEC, La Salle, Anáhuac y todas las universidades de México." } }
      ]
    }
  },
  {
    path: '/como-funciona',
    title: 'Cómo Funciona Tesipedia — Proceso Paso a Paso para Tu Tesis',
    description: 'Conoce cómo funciona Tesipedia. 4 pasos simples: cotiza, elige tu plan, recibe avances y obtén tu tesis terminada. Proceso transparente y seguro.',
    keywords: 'cómo funciona Tesipedia, proceso tesis, pasos para hacer tesis, servicio de tesis paso a paso'
  },
  {
    path: '/servicios',
    title: 'Servicios de Tesis — Tesipedia | Desarrollo, Asesoría y Corrección',
    description: 'Servicios profesionales de tesis: desarrollo completo, asesoría personalizada, corrección de estilo, revisión antiplagio Turnitin y detección anti-IA.',
    keywords: 'servicios tesis, desarrollo de tesis, asesoría tesis, corrección tesis, revisión antiplagio, Tesipedia servicios'
  },
  {
    path: '/precios',
    title: 'Precios de Tesis en México 2026 — Tesipedia | Cotiza Gratis',
    description: 'Precios transparentes para tu tesis. Desde $9,900 MXN. Planes de pago flexibles: único, 50-50, quincenas y MSI. Cotización gratuita por WhatsApp.',
    keywords: 'precios tesis México, cuánto cuesta una tesis, cotizar tesis, precio tesis licenciatura, precio tesis maestría, Tesipedia precios'
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
    path: '/blog/cuanto-cuesta-hacer-una-tesis-en-mexico-2026-precios-reales',
    title: '¿Cuánto Cuesta Hacer una Tesis en México en 2026? Precios Reales — Tesipedia',
    description: 'Descubre cuánto cuesta hacer una tesis en México en 2026. Precios reales por nivel académico, tipo de tesis y universidad. Compara costos y ahorra.',
    keywords: 'cuánto cuesta una tesis, precio tesis México 2026, costo tesis licenciatura, precio tesis maestría, hacer tesis precio',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-25',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "¿Cuánto Cuesta Hacer una Tesis en México en 2026? Precios Reales",
      "datePublished": "2026-03-25",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "description": "Precios reales de tesis en México en 2026 por nivel académico y tipo."
    }
  },
  {
    path: '/blog/tesis-unam-2026-requisitos-formatos-como-titularte',
    title: 'Tesis UNAM 2026: Requisitos, Formatos y Cómo Titularte Más Rápido — Tesipedia',
    description: 'Guía completa para hacer tu tesis en la UNAM en 2026. Requisitos actualizados, formatos oficiales, trámites y cómo titularte más rápido.',
    keywords: 'tesis UNAM, requisitos tesis UNAM 2026, formato tesis UNAM, titulación UNAM, cómo titularse UNAM',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-25',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Tesis UNAM 2026: Requisitos, Formatos y Cómo Titularte Más Rápido",
      "datePublished": "2026-03-25",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "description": "Guía completa de requisitos y formatos para tesis UNAM 2026."
    }
  },
  {
    path: '/blog/formato-apa-7-edicion-tesis-guia-completa-ejemplos',
    title: 'Formato APA 7a Edición para Tesis: Guía Completa con Ejemplos — Tesipedia',
    description: 'Aprende a aplicar el formato APA 7a edición en tu tesis. Guía paso a paso con ejemplos de citas, referencias, tablas y figuras.',
    keywords: 'formato APA 7, APA 7 edición tesis, citas APA, referencias APA, normas APA tesis',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-25',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Formato APA 7a Edición para Tesis: Guía Completa con Ejemplos",
      "datePublished": "2026-03-25",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "description": "Guía completa de formato APA 7a edición para tesis con ejemplos prácticos."
    }
  },
  {
    path: '/blog/como-hacer-marco-teorico-tesis-guia-paso-a-paso',
    title: 'Cómo Hacer un Marco Teórico para Tesis: Guía Paso a Paso — Tesipedia',
    description: 'Aprende a elaborar el marco teórico de tu tesis paso a paso. Estructura, ejemplos, fuentes confiables y errores comunes a evitar.',
    keywords: 'marco teórico tesis, cómo hacer marco teórico, ejemplo marco teórico, estructura marco teórico',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-25',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Cómo Hacer un Marco Teórico para Tesis: Guía Paso a Paso",
      "datePublished": "2026-03-25",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "description": "Guía paso a paso para elaborar el marco teórico de una tesis."
    }
  },
  {
    path: '/blog/como-hacer-una-tesis-rapido-10-pasos-titularte-2026',
    title: '¿Cómo Hacer una Tesis Rápido? 10 Pasos para Titularte en 2026 — Tesipedia',
    description: '10 pasos probados para hacer tu tesis rápido y titularte en 2026. Organización, herramientas, atajos legítimos y cuándo pedir ayuda profesional.',
    keywords: 'cómo hacer tesis rápido, tesis rápida, titularse rápido 2026, pasos para hacer tesis, terminar tesis rápido',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-25',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "¿Cómo Hacer una Tesis Rápido? 10 Pasos para Titularte en 2026",
      "datePublished": "2026-03-25",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "description": "10 pasos para hacer tu tesis rápido y titularte en 2026."
    }
  },
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
  },
  {
    path: '/blog/como-detectan-plagio-las-universidades-en-mexico-lo-que-debes-saber-en-2026',
    title: '¿Cómo Detectan Plagio las Universidades en México? — Tesipedia',
    description: 'Las universidades mexicanas usan Turnitin, iThenticate y detectores de IA. Descubre cómo funcionan y cómo garantizar originalidad en tu tesis.',
    keywords: 'detectar plagio tesis, Turnitin México, detector IA tesis, originalidad tesis, plagio universidades',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-20',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "¿Cómo Detectan Plagio las Universidades en México? Lo que Debes Saber en 2026",
      "datePublished": "2026-03-20",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/tesis-de-maestria-vs-licenciatura-diferencias-clave-y-que-esperar',
    title: 'Tesis de Maestría vs Licenciatura: Diferencias Clave — Tesipedia',
    description: 'Conoce las diferencias fundamentales entre una tesis de maestría y una de licenciatura: extensión, profundidad, metodología y nivel de exigencia.',
    keywords: 'tesis maestría vs licenciatura, diferencias tesis, tesis maestría México, requisitos tesis maestría',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-18',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Tesis de Maestría vs Licenciatura: Diferencias Clave y Qué Esperar",
      "datePublished": "2026-03-18",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/como-formular-una-hipotesis-de-investigacion-correctamente',
    title: 'Cómo Formular una Hipótesis de Investigación — Tesipedia',
    description: 'Aprende a redactar hipótesis de investigación claras y verificables. Tipos de hipótesis, ejemplos prácticos y errores comunes.',
    keywords: 'hipótesis investigación, cómo hacer hipótesis tesis, tipos hipótesis, ejemplo hipótesis',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-15',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Cómo Formular una Hipótesis de Investigación Correctamente",
      "datePublished": "2026-03-15",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/revision-de-literatura-como-buscar-y-organizar-fuentes-academicas',
    title: 'Revisión de Literatura: Cómo Buscar y Organizar Fuentes — Tesipedia',
    description: 'Domina la revisión de literatura para tu tesis. Bases de datos académicas, gestores bibliográficos y tips para escribir tu estado del arte.',
    keywords: 'revisión de literatura, fuentes académicas, estado del arte tesis, bases datos académicas México',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-12',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Revisión de Literatura: Cómo Buscar y Organizar Fuentes Académicas",
      "datePublished": "2026-03-12",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/analisis-de-datos-en-tu-tesis-spss-r-y-excel-explicados',
    title: 'Análisis de Datos: SPSS, R y Excel para tu Tesis — Tesipedia',
    description: 'Guía práctica para elegir la herramienta de análisis estadístico correcta. Comparamos SPSS, R y Excel: cuándo usar cada uno.',
    keywords: 'análisis datos tesis, SPSS tesis, R estadística, Excel análisis, herramientas estadísticas tesis',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-08',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Análisis de Datos en tu Tesis: SPSS, R y Excel Explicados",
      "datePublished": "2026-03-08",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/comprar-tesis-en-linea-en-mexico-como-elegir-un-servicio-confiable',
    title: 'Comprar Tesis en Línea en México: Cómo Elegir un Servicio Confiable — Tesipedia',
    description: 'Guía honesta para evaluar servicios de tesis en línea en México. Señales de alerta, qué preguntar y cómo proteger tu inversión.',
    keywords: 'comprar tesis en línea, servicio tesis confiable, tesis por encargo México, elegir servicio tesis',
    image: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-05',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Comprar Tesis en Línea en México: Cómo Elegir un Servicio Confiable",
      "datePublished": "2026-03-05",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/opciones-de-titulacion-en-mexico-2026-tesis-egel-tesina-y-mas',
    title: 'Opciones de Titulación en México 2026: Tesis, EGEL, Tesina y Más — Tesipedia',
    description: 'Conoce todas las opciones de titulación en México: tesis, tesina, EGEL-CENEVAL, diplomado y experiencia profesional. Costos y tiempos.',
    keywords: 'opciones titulación México, EGEL CENEVAL, tesina, titulación sin tesis, cómo titularse México 2026',
    image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-03-01',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Opciones de Titulación en México 2026: Tesis, EGEL, Tesina y Más",
      "datePublished": "2026-03-01",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/como-usar-chatgpt-para-tu-tesis-sin-que-te-detecten-y-sin-hacer-trampa',
    title: 'Cómo Usar ChatGPT para tu Tesis Sin Hacer Trampa — Tesipedia',
    description: 'Guía ética para usar IA como ChatGPT en tu tesis. Qué sí puedes hacer, qué no, y cómo las universidades detectan contenido generado por IA.',
    keywords: 'ChatGPT tesis, IA tesis, detector IA universidad, usar ChatGPT académico, tesis con inteligencia artificial',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-02-25',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Cómo Usar ChatGPT para tu Tesis Sin que Te Detecten (y Sin Hacer Trampa)",
      "datePublished": "2026-02-25",
      "dateModified": "2026-03-25",
      "author": { "@type": "Organization", "name": "Tesipedia" },
      "publisher": { "@type": "Organization", "name": "Tesipedia", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } }
    }
  },
  {
    path: '/blog/cuanto-cobran-por-hacer-una-tesis-en-mexico-comparativa-de-precios-2026',
    title: '¿Cuánto Cobran por Hacer una Tesis en México? Comparativa 2026 — Tesipedia',
    description: 'Comparamos precios de servicios de tesis en México: freelancers, agencias y profesionales. Descubre qué incluye cada opción.',
    keywords: 'cuánto cobran tesis México, comparar precios tesis, freelancer tesis, agencia tesis, precio tesis 2026',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&q=80',
    datePublished: '2026-02-20',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "¿Cuánto Cobran por Hacer una Tesis en México? Comparativa de Precios 2026",
      "datePublished": "2026-02-20",
      "dateModified": "2026-03-25",
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

      // Remove any existing <title> tag if present (safety cleanup)
      html = html.replace(/<title>[^<]*<\/title>/, '');
      // Remove any existing canonical, description, or OG tags from base HTML
      html = html.replace(/<link rel="canonical"[^>]*>/g, '');
      html = html.replace(/<meta name="description"[^>]*>/g, '');
      html = html.replace(/<meta property="og:(title|description|url|type|image)"[^>]*>/g, '');
      html = html.replace(/<meta name="twitter:(title|description|image|card|url)"[^>]*>/g, '');

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
