// Evaluador de VIRALIDAD para el Estudio de Contenido — calibrado con las señales reales de 2026.
// Predice, ANTES de publicar, qué tan probable es que una pieza se distribuya. Basado en:
//   • Sistema de audición: la app enseña a un pool chico y expande si las señales tempranas son buenas.
//   • Señales que rankean: WATCH TIME (incl. replays) > SENDS/reach (≈3-5x un like, palanca de alcance
//     frío) > SAVES > comentarios (1ª hora) > likes. Formato reel ≈100-250x sobre estático.
//   • SEO de caption (nuevo 2026): el caption se indexa en la app y en Google → keywords naturales.
//   • Gancho = AFIRMACIÓN, no pregunta (la pregunta baja la retención al frame 0; va en el caption
//     para comentarios). Ver analisis-profundo-viralidad-2026.md.
// Es heurística (0-100); se recalibra con retención/sends reales cuando el token de Meta tenga insights.

export const RANGO_VIRAL = { alto: 70, medio: 45 };

// Ganchos = AFIRMACIONES que detienen el scroll (no preguntas). Reconoce estructuras reales:
// número/%, POV, negación de creencia, verbos de tensión (muere/pierde/cuesta), "tu X está mal", etc.
const GANCHOS = [
  /^\s*\d+[\s.)%]/, /\d+\s*%/, /\bpov\b/i, /as[ií] no|as[ií] s[ií]/i, /deja de\b/i, /nadie te (dice|cuenta|enseña)/i,
  /esto es lo que|lo que nadie/i, /el (error|secreto|truco|problema)/i, /la verdad (sobre|es)/i,
  /antes de\b/i, /no hagas\b/i, /deten(te|te ya)|para de\b/i, /opini[oó]n impopular/i, /\bhack\b/i,
  /est[aá] mal\b|est[aá]s\b/i, /te (est[aá]|cuesta|falla)\b/i, /si (eres|entregas|mandas|llevas|vas)/i,
  /\b(muere|pierde|cuesta|reprueba|fracasa|falla|te frena|no cuadra|no aguanta)\b/i, /^tu\b/i, /ni (lo sabes|te enteras)/i,
];
const DOLOR = {
  Tesipedia: [/tesis/i, /titulaci[oó]n|titular(te|se)?/i, /asesor/i, /plazo|fecha l[ií]mite|entrega/i, /reprob|repruebo/i,
    /estr[eé]s|ansiedad|nervios/i, /cap[ií]tulo|marco te[oó]rico|metodolog|antecedentes/i, /\bapa\b|formato/i, /revisi[oó]n|correcci[oó]n/i],
  Contratado: [/\bats\b/i, /vacante|empleo|trabajo|chamba/i, /reclutador|recursos humanos|rrhh/i, /entrevista/i,
    /\bcv\b|curr[ií]culum/i, /rechaz|no me llaman|sin respuesta|ignoran/i, /sueldo|salario|paga/i, /linkedin/i, /contrat(an|ar|ado)/i, /desemple/i],
};
// SENDS/SAVES: lo que dispara compartir por DM (palanca #1 de alcance frío) y guardar.
const ENVIO = [/m[aá]ndaselo|m[aá]ndalo|env[ií]aselo|comp[aá]rtelo|comparte esto|et[ií]queta a|arroba a|manda esto/i];
const GUARDAR = [/guarda (esto|este|esta)/i, /gu[aá]rda(lo|la|te)/i, /toma nota|ap[uú]ntalo/i, /no lo olvides/i, /checklist|paso a paso/i];
// SEO de caption: frases que tu audiencia TECLEA en el buscador (por marca).
const SEO_KW = {
  Tesipedia: [/c[oó]mo (hacer|redactar|escribir) (una|la|mi) tesis/i, /marco te[oó]rico/i, /normas? apa/i, /metodolog[ií]a de (la )?investigaci[oó]n/i,
    /planteamiento del problema/i, /estado del arte|antecedentes/i, /c[oó]mo titularse|proceso de titulaci[oó]n/i, /ejemplo de tesis/i],
  Contratado: [/c[oó]mo hacer un (buen )?cv|c[oó]mo hacer un curr[ií]culum/i, /cv que (pasa|pase|supere)( el)? ats|para el ats|pasar el ats/i, /plantillas? de cv/i,
    /preguntas? de entrevista/i, /carta de presentaci[oó]n/i, /optimizar (mi )?linkedin/i, /c[oó]mo conseguir (empleo|trabajo)/i, /palabras clave (del|para el|de la vacante)/i, /adaptar (el|tu|mi) cv/i, /vacantes de gobierno/i, /negociar (el )?sueldo/i],
};
const CTA = [/tesipedia\.com|contratado\.com/i, /link (en|de)|enlace/i, /en el perfil|en la bio/i, /escr[ií]benos|m[aá]ndanos|dm\b|mensaje/i,
  /descarga|cons[ií]guela?|obt[eé]n|prueba(la)?|analiza tu/i, /agenda|cotiza|reserva/i];

const primeraLinea = (t) => String(t || '').split('\n').map((s) => s.trim()).find(Boolean) || '';
const cuenta = (re, txt) => (re.filter((r) => r.test(txt)).length);
const tags = (h) => (String(h || '').match(/#[\wáéíóúñ]+/gi) || []).length;

// pieza = { formato, copy, hashtags, video_url, cta } · abierta aporta imagenes/tema/titular/marca
export function scoreViralidad(pieza = {}, abierta = {}) {
  const formato = (pieza.formato || abierta.formato || '').toUpperCase();
  const esReel = formato === 'VIDEO' || !!(pieza.video_url || abierta.video_url);
  const esCarrusel = formato === 'CARRUSEL';
  const copy = pieza.copy || abierta.copy || '';
  const tema = abierta.tema || abierta.titular || '';
  const marca = abierta.marca || 'Tesipedia';
  const dolorRe = DOLOR[marca] || DOLOR.Tesipedia;
  const seoRe = SEO_KW[marca] || SEO_KW.Tesipedia;
  const linea = primeraLinea(copy);
  const nLaminas = (abierta.imagenes || []).length;
  const txt = `${tema}\n${copy}`;
  const f = []; // factores {k, label, pts, max, tip?}

  // 1) Formato (0-26) — palanca #1
  const fmtPts = esReel ? 26 : esCarrusel ? 17 : 9;
  f.push({ k: 'formato', label: esReel ? 'Reel de video' : esCarrusel ? 'Carrusel' : 'Estático', pts: fmtPts, max: 26,
    tip: esReel ? null : 'Conviértelo en Reel de video: distribuye ~100-250x más que un estático (dato real de tu página).' });

  // 2) Gancho-AFIRMACIÓN en la 1ª línea (0-18) — penaliza pregunta-como-gancho
  const g = cuenta(GANCHOS, linea);
  const esPregunta = /^\s*[¿?]|\?\s*$/.test(linea);
  let gPts = g >= 2 ? 18 : g === 1 ? 12 : 0;
  if (esPregunta) gPts = Math.max(0, gPts - 8); // la pregunta va en el caption, no como gancho del reel
  if (linea.length > 120) gPts = Math.max(0, gPts - 5);
  f.push({ k: 'gancho', label: esPregunta ? 'Gancho es pregunta (mejor afirmación)' : g ? `Gancho-afirmación (${g})` : 'Sin gancho claro', pts: gPts, max: 18,
    tip: gPts < 12 ? 'Frame 0 = AFIRMACIÓN en ≤6 palabras ("Tu CV muere en 6s"). Las preguntas bajan la retención; guárdalas para el caption.' : null });

  // 3) Retención / valor (0-14)
  let retPts, retTip = null;
  if (esReel) {
    const corto = /\b(en\s*\d+\s*(seg|segundos|pasos)|r[aá]pido|30s|15s|shorts?)\b/i.test(txt);
    retPts = corto ? 14 : 10;
    retTip = 'Reel de 12-25 s, 1 idea, corte cada 2-3 s y LOOP (el final conecta con el inicio = +watch time).';
  } else if (esCarrusel) {
    retPts = nLaminas >= 4 && nLaminas <= 8 ? 14 : nLaminas ? 9 : 6;
    retTip = nLaminas < 4 ? 'Carrusel de 5-7 láminas numeradas, un ejemplo por lámina.' : null;
  } else {
    retPts = /COMPARATIVA|CHECKLIST|DICCIONARIO|PRUEBA/.test(formato) ? 11 : 7;
  }
  f.push({ k: 'retencion', label: esReel ? 'Retención del reel' : 'Valor denso', pts: retPts, max: 14, tip: retTip });

  // 4) Dolor / emoción (0-10)
  const d = cuenta(dolorRe, txt);
  const dPts = d >= 2 ? 10 : d === 1 ? 7 : 0;
  f.push({ k: 'dolor', label: d ? 'Conecta con un dolor real' : 'Sin dolor identificado', pts: dPts, max: 10,
    tip: dPts < 7 ? `Toca un dolor real (${marca === 'Contratado' ? 'ATS, rechazo, sin respuesta' : 'estrés de tesis, plazos, el asesor'}): lo que duele se comparte.` : null });

  // 5) Sends & Saves (0-12) — la palanca de ALCANCE FRÍO (un send pesa ~3-5x un like)
  const pideEnvio = ENVIO.some((r) => r.test(txt));
  const pideGuardar = GUARDAR.some((r) => r.test(txt)) || esCarrusel || /CHECKLIST/.test(formato);
  const ssPts = (pideEnvio ? 7 : 0) + (pideGuardar ? 5 : 0);
  f.push({ k: 'sends', label: pideEnvio && pideGuardar ? 'Pide send + save' : pideEnvio ? 'Pide compartir (send)' : pideGuardar ? 'Pide guardar' : 'No pide send/save', pts: ssPts, max: 12,
    tip: ssPts < 12 ? 'Agrega un CTA de SEND ("mándaselo a quien está en su tesis / etiqueta al que busca chamba") y de SAVE ("guarda esto"). El send es la palanca #1 de alcance frío.' : null });

  // 6) SEO de caption (0-12) — que te encuentren en búsqueda (la cola larga)
  const kw = cuenta(seoRe, txt);
  const seoPts = kw >= 2 ? 12 : kw === 1 ? 8 : 0;
  f.push({ k: 'seo', label: kw ? `Keywords de búsqueda (${kw})` : 'Sin keywords de búsqueda', pts: seoPts, max: 12,
    tip: seoPts < 8 ? `Incluye en el caption (natural) frases que tu público TECLEA: ${marca === 'Contratado' ? '"cv que pasa el ATS", "plantillas de cv"' : '"cómo hacer una tesis", "marco teórico ejemplo"'}. Y escribe el ALT TEXT a mano con keywords.` : null });

  // 7) Conversación (0-8): pregunta en el caption + 3-5 hashtags de nicho
  const pregunta = /\?/.test(copy);
  const nt = tags(pieza.hashtags ?? abierta.hashtags);
  const convPts = (pregunta ? 4 : 0) + (nt >= 3 && nt <= 5 ? 4 : nt >= 1 && nt <= 5 ? 2 : 0);
  let convTip = null;
  if (!pregunta) convTip = 'Cierra el caption con una pregunta para disparar comentarios en la 1ª hora.';
  else if (nt > 5) convTip = `Baja a 3-5 hashtags de nicho (tienes ${nt}); más ya no suma.`;
  else if (nt < 3) convTip = 'Usa 3-5 hashtags de nicho (1 de marca + 2-3 de tema). Los genéricos (#fyp #viral) no sirven.';
  f.push({ k: 'conversacion', label: 'Conversación + hashtags', pts: convPts, max: 8, tip: convTip });

  const score = f.reduce((s, x) => s + x.pts, 0);
  const tier = score >= RANGO_VIRAL.alto ? 'alto' : score >= RANGO_VIRAL.medio ? 'medio' : 'bajo';
  const sugerencias = f.filter((x) => x.tip && x.pts < x.max).sort((a, b) => (a.pts / a.max) - (b.pts / b.max)).map((x) => x.tip);
  return { score, tier, factores: f, sugerencias };
}

export const TIER_INFO = {
  alto: { emoji: '🔥', label: 'Alto potencial', color: '#16A34A' },
  medio: { emoji: '⚠️', label: 'Ajustar', color: '#F5B301' },
  bajo: { emoji: '❌', label: 'Bajo alcance', color: '#DC2626' },
};
