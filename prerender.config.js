/**
 * Configuración de pre-renderizado para SEO
 *
 * Este script genera archivos HTML estáticos para las rutas públicas
 * después del build de Vite. Esto permite que Google indexe el contenido
 * sin necesidad de ejecutar JavaScript.
 *
 * USO:
 *   npm run build       (build normal)
 *   npm run build:seo   (build + genera HTML estático)
 *
 * REQUISITO:
 *   npm install puppeteer --save-dev
 */

export const prerenderRoutes = [
  '/',
  '/contacto',
  '/sobre-nosotros',
  '/preguntas-frecuentes',
  '/blog',
  '/blog/donde-hacer-tu-tesis-en-mexico-guia-completa-2026',
  '/blog/es-seguro-comprar-tesis-en-mexico-lo-que-debes-saber',
  '/blog/hacemos-tu-tesis-como-elegir-el-mejor-servicio-de-tesis-en-mexico',
  '/blog/tesis-por-encargo-en-mexico-precios-tiempos-y-todo-lo-que-necesitas-saber',
  '/blog/como-estructurar-tu-tesis-correctamente',
  '/blog/tips-para-defender-tu-tesis-con-exito',
  '/blog/metodos-de-investigacion-guia-completa',
  '/register',
  '/politica-de-privacidad',
];

export const prerenderConfig = {
  // Puerto para el servidor local durante el pre-renderizado
  port: 4173,

  // Tiempo máximo de espera para que la página cargue (ms)
  timeout: 30000,

  // Esperar a que el contenido se renderice antes de capturar
  waitForSelector: '#root',

  // Tiempo adicional después de que el selector aparezca (ms)
  renderAfterTime: 2000,

  // Directorio de salida (dist por defecto de Vite)
  outputDir: 'dist',
};
