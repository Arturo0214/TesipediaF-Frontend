// Images for blog posts — Unsplash (gratuitas, confiables, temáticas académicas)
export const images = {
  guiaTesis: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop&q=80',
  comprarTesis: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop&q=80',
  elegirServicio: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop&q=80',
  preciosTesis: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&q=80',
  estructuraTesis: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop&q=80',
  defensaTesis: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=450&fit=crop&q=80',
  metodosInvestigacion: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop&q=80',
};

// Helper function to create URL-friendly slugs
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Blog posts with all fields and generated slugs
export const blogPosts = [
  {
    id: 4,
    title: '¿Dónde Hacer Tu Tesis en México? Guía Completa 2026',
    excerpt: '¿Necesitas hacer tu tesis y no sabes por dónde empezar? Descubre las mejores opciones para hacer tu tesis de licenciatura, maestría o doctorado en México de forma profesional y confiable.',
    image: images.guiaTesis,
    date: '2026-03-20',
    category: 'Guía',
    readTime: '8 min',
    featured: true,
    slug: 'donde-hacer-tu-tesis-en-mexico-guia-completa-2026',
    content: `Si estás leyendo esto, probablemente llevas semanas (o meses) pensando en tu tesis sin saber por dónde empezar. No te preocupes — es más común de lo que crees. Cada semestre, miles de estudiantes en México se enfrentan al mismo reto: necesitan titularse, pero la tesis se convierte en un muro que parece imposible de escalar.

📌 La realidad de hacer una tesis en México

Seamos honestos: el sistema educativo mexicano exige tesis como requisito de titulación, pero rara vez prepara a los estudiantes para escribir una. Te enseñan tu carrera, pero no cómo investigar, estructurar un documento de 100 páginas o pasar un examen con sinodales. A eso súmale que muchos estudiantes ya trabajan, tienen familia o simplemente no cuentan con un asesor que realmente los apoye.

Por eso existen los servicios profesionales de asesoría de tesis. No es hacer trampa — es buscar la ayuda experta que tu universidad no te dio.

🎯 ¿Cómo funciona Tesipedia en la práctica?

El proceso es bastante directo. Primero nos escribes por WhatsApp y nos cuentas qué necesitas: tu carrera, universidad, tema (si ya tienes uno) y fecha límite. A partir de ahí:

• Te damos una cotización clara, sin costos ocultos ni sorpresas
• Asignamos a un asesor con experiencia real en tu área de estudio
• Se desarrolla tu tesis capítulo por capítulo, con tu retroalimentación
• Pasamos todo por Turnitin y escáner anti-IA antes de entregarte
• Incluimos las correcciones que pida tu asesor universitario o sinodales
• Te preparamos para tu defensa de tesis

No es solo "entregar un documento" — te acompañamos hasta que te titules.

💰 ¿Cuánto cuesta realmente?

Depende de varios factores: nivel académico, número de páginas, área de estudio y urgencia. Como referencia, nuestros precios van desde $120 por página en redacción y $60 por página en corrección. El precio final depende de tu proyecto específico — por eso ofrecemos cotización personalizada y gratuita.

Aceptamos tarjetas, transferencias, OXXO y pagos en parcialidades. Sabemos que no todos pueden pagar de un jalón.

🏆 Algunos números que nos respaldan

Llevamos más de 3,000 estudiantes titulados con un índice de aprobación del 98%. Nuestro equipo tiene más de 50 asesores con posgrado en áreas como derecho, administración, ingeniería, psicología, educación, medicina y más. Todos los proyectos incluyen escáner Turnitin y anti-IA — porque en 2026 las universidades ya lo revisan.

✅ Estudiantes de todas las universidades

Hemos trabajado con estudiantes de la UNAM, IPN, Tec de Monterrey, UAM, UVM, UNITEC, La Salle, Anáhuac, Ibero, BUAP, UdeG, UANL y muchas más. Conocemos los lineamientos de cada institución.

📝 Da el primer paso

¿Quieres saber cuánto costaría tu tesis? Escríbenos por WhatsApp al +52 56 7007 1517. La cotización es gratuita y sin compromiso.`
  },
  {
    id: 5,
    title: '¿Es Seguro Comprar Tesis en México? Lo Que Debes Saber',
    excerpt: '¿Estás pensando en comprar tu tesis? Te explicamos cómo funciona el servicio de elaboración de tesis por encargo, qué garantías pedir y cómo asegurarte de recibir un trabajo de calidad.',
    image: images.comprarTesis,
    date: '2026-03-18',
    category: 'Consejos',
    readTime: '7 min',
    featured: false,
    slug: 'es-seguro-comprar-tesis-en-mexico-lo-que-debes-saber',
    content: `"Comprar tesis" suena fuerte, pero la realidad es mucho más matizada de lo que parece. No se trata de ir a una tienda y llevarte un documento genérico bajo el brazo. Se trata de contratar asesoría profesional para que expertos desarrollen tu proyecto de investigación desde cero, adaptado a ti, tu tema y tu universidad.

📌 Qué es realmente una tesis por encargo

Cuando contratas un servicio de tesis, lo que obtienes es un proyecto de investigación personalizado. Un asesor con experiencia en tu área desarrolla el trabajo siguiendo los lineamientos de tu institución: la estructura que pide tu universidad, el formato de citación (APA, Chicago, Harvard), la extensión requerida y la metodología adecuada para tu tema.

No es copiar y pegar. No es reciclar. Es investigación original hecha por profesionales.

🎯 Lo que deberías exigir antes de contratar

Hay muchos servicios en el mercado, y no todos son iguales. Antes de pagar un solo peso, verifica que el servicio ofrezca:

• Turnitin real (no software genérico): Muchos presumen "antiplagio" pero usan herramientas gratuitas que las universidades no aceptan
• Escáner anti-IA: En 2026 esto ya no es opcional — tu universidad lo va a revisar
• Correcciones de sinodales incluidas: Porque siempre van a pedir cambios, y eso no debería costarte extra
• Garantía de aprobación: Si no te aprueban, ¿de qué sirvió?
• Comunicación directa con tu asesor: Nada de intermediarios que no saben de tu tema

📊 Rango de precios realista

En Tesipedia manejamos precios desde $120 por página en redacción y $60 por página en corrección. El costo final depende de tu nivel académico, área y urgencia. Si alguien te ofrece precios ridículamente bajos, desconfía — probablemente sea un trabajo reciclado o generado con ChatGPT sin revisión.

🔬 Lo que incluye Tesipedia

Con nosotros obtienes desarrollo original desde cero, asesores con maestría y doctorado, doble escáner (Turnitin + anti-IA), correcciones ilimitadas, pago seguro y entrega puntual. Más de 3,000 estudiantes ya pasaron por este proceso exitosamente.

✅ ¿Es legal?

Sí. Los servicios de asesoría y elaboración de tesis operan bajo la figura de consultoría educativa profesional. Tu tesis es un proyecto único que tú presentas, defiendes y del que eres responsable académicamente.

📝 ¿Te interesa?

Cotiza gratis por WhatsApp al +52 56 7007 1517 y te decimos exactamente cuánto costaría tu proyecto.`
  },
  {
    id: 6,
    title: 'Hacemos Tu Tesis: ¿Cómo Elegir el Mejor Servicio de Tesis en México?',
    excerpt: '¿Buscas quién te haga tu tesis? Compara los servicios de elaboración de tesis disponibles en México y aprende a elegir el mejor para tu proyecto académico.',
    image: images.elegirServicio,
    date: '2026-03-15',
    category: 'Guía',
    readTime: '6 min',
    featured: false,
    slug: 'hacemos-tu-tesis-como-elegir-el-mejor-servicio-de-tesis-en-mexico',
    content: `Googlea "servicio de tesis México" y te salen decenas de resultados. Páginas de Facebook, cuentas de Instagram, sitios web que prometen tesis en 48 horas... ¿Cómo distinguir a los buenos de los que van a dejarte colgado? Aquí te damos las señales que debes buscar.

📌 Las preguntas que debes hacer antes de pagar

Antes de contratar cualquier servicio, hay cosas básicas que debes verificar. Te sorprendería cuántos "servicios de tesis" no cumplen ni con lo mínimo:

• ¿Usan Turnitin o software genérico? Las universidades solo aceptan Turnitin. Si te dicen "nuestro software antiplagio", desconfía
• ¿Tienen escáner anti-IA? Desde 2025, universidades como la UNAM y el IPN ya revisan contenido generado por inteligencia artificial. Si tu servicio no lo filtra, te van a detectar
• ¿Las correcciones de sinodales están incluidas? Si cobran extra por cada ronda de correcciones, vas a terminar pagando el doble
• ¿Cuál es su índice de aprobación? Pregúntalo directamente. Si no te dan un número, mala señal
• ¿Puedes hablar con tu asesor? Si todo es a través de un "ejecutivo de ventas" que no sabe de tu tema, el resultado va a reflejarlo

🎯 Señales de alerta

Hay patrones que identifican a servicios poco confiables:

• Precios demasiado bajos que no cuadran con el trabajo real que implica una tesis
• Promesas de entrega en días (una tesis seria toma semanas)
• No tienen sitio web propio ni historial verificable
• Solo se comunican por redes sociales sin datos de contacto formales
• No ofrecen factura ni comprobantes de pago

🔬 Lo que Tesipedia hace diferente

Somos un equipo 100% mexicano que lleva años en esto. Conocemos las particularidades del sistema universitario del país — desde los formatos que pide la UNAM hasta los estándares del Tec de Monterrey. Tenemos más de 50 asesores con posgrado, una plataforma donde puedes dar seguimiento a tu proyecto, y comunicación directa por WhatsApp.

Nuestro índice de aprobación es del 98% con más de 3,000 estudiantes titulados. Incluimos Turnitin y escáner anti-IA en todos los proyectos, sin excepción.

📊 Lo que dicen nuestros estudiantes

Hemos trabajado con alumnos de la UNAM, IPN, ITESM, UAM, UVM, La Salle, Anáhuac y decenas de universidades más. Puedes ver reseñas reales en nuestro sitio y redes sociales.

✅ ¿Listo para cotizar?

Escríbenos por WhatsApp al +52 56 7007 1517. Te decimos precio, tiempo de entrega y te asignamos un asesor en tu área. Sin compromiso.`
  },
  {
    id: 7,
    title: 'Tesis por Encargo en México: Precios, Tiempos y Todo Lo Que Necesitas Saber',
    excerpt: '¿Cuánto cuesta encargar una tesis en México? ¿Cuánto tiempo tarda? Resolvemos todas tus dudas sobre el servicio de tesis por encargo más confiable del país.',
    image: images.preciosTesis,
    date: '2026-03-10',
    category: 'Precios',
    readTime: '7 min',
    featured: false,
    slug: 'tesis-por-encargo-en-mexico-precios-tiempos-y-todo-lo-que-necesitas-saber',
    content: `La pregunta que todo el mundo quiere saber: ¿cuánto me va a costar? Y es totalmente válido. Antes de tomar una decisión, necesitas números claros. Aquí te damos la información directa, sin rodeos.

📌 ¿Qué determina el precio de una tesis?

No hay un precio único porque cada proyecto es diferente. Los factores principales son:

• Nivel académico: No es lo mismo una tesina de 50 páginas que una tesis doctoral con investigación de campo
• Área de estudio: Derecho, administración o psicología tienen requerimientos muy distintos a ingeniería o medicina
• Extensión y complejidad: Una tesis cuantitativa con análisis estadístico en SPSS cuesta más que una cualitativa documental
• Urgencia: Si necesitas entrega en 2 semanas en lugar de 6, el precio sube

💰 Precios de Tesipedia actualizados a 2026

Manejamos un esquema transparente por página:

• Redacción: desde $120 MXN por página
• Corrección: desde $60 MXN por página

El precio final de tu proyecto depende del nivel académico, la complejidad del tema y el plazo de entrega. Cada cotización es personalizada — no hay paquetes genéricos.

📊 ¿Cuánto tiempo toma?

Seamos realistas — una tesis bien hecha no se produce de la noche a la mañana. Estos son los tiempos estándar:

• Licenciatura: 3 a 4 semanas
• Maestría: 4 a 6 semanas
• Doctorado: 6 a 10 semanas

¿Tienes más prisa? Tenemos servicio express con entrega acelerada, pero te recomendamos planearlo con tiempo para un mejor resultado.

🔬 ¿Qué incluye exactamente?

Todo. Desarrollo completo desde cero, marco teórico con fuentes actualizadas, metodología profesional, análisis de datos, escáner Turnitin, escáner anti-IA, correcciones de tu asesor y sinodales, y preparación para defensa de tesis. Sin costos ocultos.

✅ Formas de pago flexibles

Sabemos que el dinero importa. Por eso aceptamos tarjetas (Visa, Mastercard, AMEX), transferencia SPEI, PayPal, OXXO, y ofrecemos pagos en parcialidades. Si pagas de contado en una sola exhibición, te hacemos un 10% de descuento.

📝 ¿Quieres saber tu precio exacto?

Cada proyecto es diferente, así que la mejor forma de saber cuánto costaría el tuyo es cotizarlo directamente. Escríbenos por WhatsApp al +52 56 7007 1517 — te respondemos en minutos.`
  },
  {
    id: 1,
    title: 'Cómo Estructurar tu Tesis Correctamente',
    excerpt: 'Aprende los elementos fundamentales que debe contener una tesis profesional y cómo organizarlos de manera efectiva para maximizar el impacto de tu investigación.',
    image: images.estructuraTesis,
    date: '2024-01-15',
    category: 'Metodología',
    readTime: '5 min',
    featured: false,
    slug: 'como-estructurar-tu-tesis-correctamente',
    content: `Una de las razones más comunes por las que los estudiantes se atascan es que no saben cómo organizar su tesis. Tienen ideas, tienen datos, a veces hasta tienen investigación avanzada — pero no saben cómo presentarlo todo de forma que su comité lo acepte. Aquí te explicamos la estructura que funciona.

📌 Lo primero: las páginas preliminares

Antes de que empiece tu tesis como tal, necesitas una serie de elementos que muchos olvidan o hacen mal: portada con los datos exactos que pide tu universidad, página de agradecimientos, índice completo (con números de página correctos), y un resumen o abstract de 250 a 300 palabras. Parece sencillo, pero la portada mal formateada es una de las correcciones más comunes que piden los sinodales.

🎯 La introducción: aquí se juega todo

El primer capítulo es donde defines tu problema de investigación. No basta con decir "quiero estudiar X" — necesitas justificar por qué es relevante, plantear objetivos que sean medibles (no vagos), y formular tu hipótesis. Un error frecuente: objetivos demasiado amplios. Entre más específico seas, mejor.

📚 Marco teórico: la base de tu argumento

Aquí demuestras que sabes de qué hablas. Revisa qué se ha investigado antes sobre tu tema, presenta las teorías que sustentan tu trabajo, y define los conceptos clave. Un buen marco teórico tiene fuentes actualizadas (últimos 5 años) y no se limita a copiar definiciones del diccionario.

🔬 Metodología: cómo lo hiciste

Este capítulo explica tu diseño de investigación (experimental, cuasi-experimental, descriptivo, etc.), tu población y muestra, los instrumentos que usaste para recolectar datos, y el procedimiento paso a paso. Tip: sé tan detallado que alguien más pueda replicar tu estudio.

📊 Resultados y discusión

Presenta tus datos con tablas y gráficas claras, interpreta los resultados estadísticos, y contrasta tus hallazgos con la literatura existente. La discusión es donde muestras pensamiento crítico — no solo repitas números, explica qué significan.

✅ Conclusiones que cierran bien

Resume tus hallazgos principales, discute las implicaciones prácticas, reconoce honestamente las limitaciones de tu estudio (todos los tienen), y sugiere líneas futuras de investigación. Un buen cierre deja una impresión fuerte en tus sinodales.

📝 Formato y estilo: los detalles que importan

Usa el formato de citación que pide tu universidad (APA 7a es el más común en México), mantén consistencia en títulos y subtítulos, y revisa ortografía y gramática múltiples veces. Pide retroalimentación a tu asesor antes de la versión final.`
  },
  {
    id: 2,
    title: 'Tips para Defender tu Tesis con Éxito',
    excerpt: 'Descubre las estrategias clave y consejos prácticos para preparar y realizar una defensa de tesis exitosa que impresione a tu comité evaluador.',
    image: images.defensaTesis,
    date: '2024-01-10',
    category: 'Consejos',
    readTime: '4 min',
    featured: false,
    slug: 'tips-para-defender-tu-tesis-con-exito',
    content: `La defensa de tesis genera más ansiedad que casi cualquier otra etapa del proceso. Y es entendible — estás frente a un panel de expertos que van a cuestionar tu trabajo. Pero con la preparación adecuada, no solo puedes sobrevivir tu defensa: puedes destacar.

🔍 Prepárate con 2-3 semanas de anticipación

No dejes la preparación para los últimos días. Relee tu tesis completa (sí, las 100+ páginas), identifica los puntos que podrían generar preguntas, y practica tu presentación frente a alguien — un amigo, un familiar, o incluso frente al espejo. La primera vez que presentas siempre es la peor; asegúrate de que no sea frente a tus sinodales.

📊 Cómo estructurar tu presentación

Tu defensa debería durar entre 15 y 20 minutos. Distribúyela así:

• Introducción (2-3 min): Tu problema de investigación y por qué importa
• Metodología (4-5 min): Cómo lo investigaste — sé claro y directo
• Resultados clave (5-6 min): No muestres todos los datos; enfócate en los hallazgos más relevantes
• Conclusiones (2-3 min): Qué encontraste y qué significa

No pongas párrafos enteros en tus diapositivas. Usa gráficas, tablas y palabras clave. Los sinodales quieren escucharte hablar, no leer tus slides.

🎤 Durante la defensa: lo que funciona

Mantén contacto visual con tu comité (no con la pantalla), habla a un ritmo que permita seguirte, y muestra que dominas tu tema. Si te pones nervioso, recuerda: tú eres quien más sabe sobre tu investigación en esa sala. Nadie más pasó meses trabajando en esto.

💡 Cómo manejar las preguntas

Las preguntas son la parte que más asusta, pero también la oportunidad de demostrar tu conocimiento. Escucha la pregunta completa antes de responder, toma notas si necesitas, y no tengas miedo de decir "esa es una limitación que reconocemos en el estudio" cuando sea apropiado. Los sinodales respetan la honestidad intelectual.

⚡ El día de la defensa

Descansa bien la noche anterior (en serio, no te desveles repasando). Llega al menos 30 minutos antes para probar el proyector y tu USB. Viste profesionalmente — primera impresión importa. Y ten agua cerca; hablar 20 minutos seguidos seca la garganta.`
  },
  {
    id: 3,
    title: 'Métodos de Investigación: Guía Completa',
    excerpt: 'Explora los diferentes métodos de investigación académica y aprende a elegir el más adecuado para tu proyecto de tesis.',
    image: images.metodosInvestigacion,
    date: '2024-01-20',
    category: 'Investigación',
    readTime: '6 min',
    featured: false,
    slug: 'metodos-de-investigacion-guia-completa',
    content: `Elegir tu método de investigación es una de las decisiones más importantes de tu tesis, y sorprendentemente, muchos estudiantes la toman casi al azar. "Mi asesor me dijo que hiciera encuestas" o "vi que otros usaron entrevistas" no son buenas razones. Cada método tiene sus fortalezas, y elegir el correcto depende de qué quieres descubrir.

🔬 Métodos cuantitativos: cuando necesitas números

Si tu pregunta de investigación busca medir, comparar o predecir algo, lo tuyo es cuantitativo. Dentro de este enfoque:

• Investigación experimental: Controlas variables y mides efectos. Ideal para ciencias exactas y salud
• No experimental (descriptivo/correlacional): Observas sin manipular. Funciona cuando no puedes controlar las variables
• Encuestas: Recolectas datos de muchas personas a la vez. La herramienta más usada en ciencias sociales
• Estudios longitudinales: Sigues a un grupo en el tiempo. Más complejos pero muy valiosos

Para el análisis, necesitarás estadística descriptiva (medias, frecuencias), pruebas de hipótesis (t-Student, chi-cuadrada), y posiblemente regresión o modelado. SPSS y R son los programas más usados en México.

👥 Métodos cualitativos: cuando necesitas profundidad

Si tu investigación busca comprender experiencias, significados o procesos complejos, el enfoque cualitativo es tu camino:

• Etnografía: Observas y participas en un contexto cultural específico
• Estudio de caso: Analizas a profundidad un caso particular usando múltiples fuentes
• Fenomenología: Exploras cómo las personas viven y perciben una experiencia
• Teoría fundamentada: Construyes teoría a partir de los datos, no al revés

El análisis cualitativo implica codificación de datos, identificación de categorías y temas, y técnicas como la triangulación para darle rigor a tus hallazgos. NVivo y Atlas.ti son los programas más populares.

🔄 Métodos mixtos: lo mejor de ambos mundos

Cada vez más tesis combinan enfoques cuantitativos y cualitativos. Puedes hacer un diseño secuencial (primero encuestas, luego entrevistas) o convergente (ambos al mismo tiempo). La clave es justificar por qué la combinación enriquece tu investigación.

🎯 ¿Cómo elijo el mío?

Hazte estas preguntas: ¿Qué tipo de respuesta necesito (número o comprensión profunda)? ¿Tengo acceso a suficientes participantes para una muestra cuantitativa? ¿Cuánto tiempo y presupuesto tengo? ¿Qué espera mi universidad o mi asesor? La respuesta honesta a estas preguntas te llevará al método correcto.`
  }
];

/**
 * Get a blog post by its slug
 * @param {string} slug - The URL-friendly slug of the post
 * @returns {Object|null} The blog post object or null if not found
 */
export const getPostBySlug = (slug) => {
  return blogPosts.find(post => post.slug === slug) || null;
};

/**
 * Get all blog post slugs
 * @returns {Array} Array of all slugs
 */
export const getAllSlugs = () => {
  return blogPosts.map(post => post.slug);
};
