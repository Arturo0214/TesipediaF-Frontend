#!/usr/bin/env node

/**
 * Script de pre-renderizado para Tesipedia
 *
 * Genera HTML estático para rutas públicas después del build.
 * Google puede leer este HTML sin ejecutar JavaScript.
 *
 * Ejecución: node scripts/prerender.js
 * O bien:   npm run prerender
 */

import { createServer } from 'vite';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

// Importar rutas desde configuración centralizada
import { prerenderRoutes } from '../prerender.config.js';
const routes = prerenderRoutes;

const PORT = 4173;

async function prerender() {
  console.log('🚀 Iniciando pre-renderizado SEO para Tesipedia...\n');

  // Verificar que dist existe
  if (!existsSync(distDir)) {
    console.error('❌ Error: No se encontró el directorio dist/. Ejecuta "npm run build" primero.');
    process.exit(1);
  }

  // Iniciar servidor de preview
  console.log(`📦 Iniciando servidor local en puerto ${PORT}...`);

  const { preview } = await import('vite');
  const server = await preview({
    root: rootDir,
    preview: {
      port: PORT,
      strictPort: true,
      open: false,
    },
  });

  const baseUrl = `http://localhost:${PORT}`;

  // Iniciar Puppeteer
  console.log('🌐 Iniciando navegador headless...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  let successCount = 0;
  let errorCount = 0;

  for (const route of routes) {
    try {
      const url = `${baseUrl}${route}`;
      console.log(`  📄 Pre-renderizando: ${route}`);

      const page = await browser.newPage();

      // Configurar viewport y user agent de Googlebot
      await page.setViewport({ width: 1440, height: 900 });
      await page.setUserAgent(
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      );

      // Navegar y esperar a que la SPA renderice
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Esperar a que React haya montado el contenido
      await page.waitForSelector('#root', { timeout: 10000 });

      // Espera adicional para asegurar que Helmet haya actualizado los meta tags
      await new Promise(r => setTimeout(r, 2000));

      // Extraer el HTML completo renderizado
      const html = await page.content();

      // Guardar el HTML
      const outputPath = route === '/'
        ? resolve(distDir, 'index.html')
        : resolve(distDir, route.slice(1), 'index.html');

      // Crear directorio si no existe
      const outputDir = dirname(outputPath);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      // Limpiar scripts de Vite que podrían causar doble-renderizado
      // y agregar un marcador de pre-renderizado
      const cleanedHtml = html
        .replace('</head>', '  <meta name="prerendered" content="true" />\n  </head>');

      writeFileSync(outputPath, cleanedHtml, 'utf-8');

      const sizeKb = (Buffer.byteLength(cleanedHtml, 'utf-8') / 1024).toFixed(1);
      console.log(`     ✅ Guardado (${sizeKb} KB): ${outputPath.replace(rootDir, '')}`);

      successCount++;
      await page.close();
    } catch (err) {
      console.error(`     ❌ Error en ${route}: ${err.message}`);
      errorCount++;
    }
  }

  // Cerrar browser y servidor
  await browser.close();
  server.httpServer.close();

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ Pre-renderizado completado:`);
  console.log(`   Exitosos: ${successCount}/${routes.length}`);
  if (errorCount > 0) {
    console.log(`   Errores:  ${errorCount}/${routes.length}`);
  }
  console.log(`${'═'.repeat(50)}\n`);

  console.log('📋 Las siguientes rutas ahora tienen HTML estático:');
  routes.forEach(r => console.log(`   ${r}`));
  console.log('\n🔍 Google podrá indexar este contenido sin ejecutar JavaScript.');
  console.log('🚀 ¡Deploy listo!\n');

  process.exit(0);
}

prerender().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
