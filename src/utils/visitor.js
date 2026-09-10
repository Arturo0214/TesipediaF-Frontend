/**
 * Identidad persistente del visitante + atribución de origen (first-touch).
 *
 * - visitorId: cookie `tsp_vid` (1 año) → identifica a la MISMA persona entre sesiones/visitas.
 * - atribución: de dónde viene el visitante (UTMs, fbclid/gclid, referrer, landing).
 *   Se guarda el PRIMER toque en localStorage (no se sobrescribe) para atribución honesta,
 *   y el ÚLTIMO toque en sessionStorage por si se quiere ver la sesión actual.
 */

const VID_COOKIE = 'tsp_vid';
const VID_LS = 'tsp_vid';
const FIRST_TOUCH_LS = 'tsp_first_touch';
const ONE_YEAR = 365 * 24 * 60 * 60;

const uuid = () =>
  (crypto?.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name, value, maxAgeSec) {
  if (typeof document === 'undefined') return;
  // SameSite=Lax: acompaña la navegación normal sin exponerse a CSRF de terceros.
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
}

/** ID persistente del visitante. Se crea una sola vez y se conserva en cookie + localStorage. */
export function getVisitorId() {
  if (typeof window === 'undefined') return '';
  let id = readCookie(VID_COOKIE);
  if (!id) {
    try { id = localStorage.getItem(VID_LS); } catch { /* ignore */ }
  }
  if (!id) id = uuid();
  // Reafirmar en ambos lados (renueva expiración y cubre el caso de que falte en uno).
  writeCookie(VID_COOKIE, id, ONE_YEAR);
  try { localStorage.setItem(VID_LS, id); } catch { /* ignore */ }
  return id;
}

const SRC_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];

/** Detecta la fuente/origen legible a partir de UTMs + referrer. */
function detectSource(utm, referrer) {
  const s = (utm.utm_source || '').toLowerCase();
  if (utm.fbclid || s.includes('facebook') || s.includes('meta') || s.includes('ig') || s.includes('instagram')) {
    return `meta${utm.utm_campaign ? `_${utm.utm_campaign}` : ''}`;
  }
  if (utm.gclid || s.includes('google')) {
    return utm.gclid || utm.utm_medium === 'cpc' ? 'google_ads' : 'google';
  }
  if (s) return s;
  const r = (referrer || '').toLowerCase();
  if (!r) return 'directo';
  if (r.includes('instagram')) return 'instagram_organico';
  if (r.includes('facebook') || r.includes('fb.com')) return 'facebook_organico';
  if (r.includes('tiktok')) return 'tiktok';
  if (r.includes('google')) return 'google_organico';
  if (r.includes('bing')) return 'bing_organico';
  if (r.includes('t.co') || r.includes('twitter') || r.includes('x.com')) return 'x_twitter';
  if (r.includes('whatsapp')) return 'whatsapp';
  if (r.includes('tesipedia.com')) return 'directo';
  return 'referral';
}

/**
 * Captura la atribución en el primer toque. Idempotente: si ya existe first-touch, no lo pisa.
 * Llamar una vez al arrancar la app (main.jsx).
 */
export function captureAttribution() {
  if (typeof window === 'undefined') return getAttribution();
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    SRC_KEYS.forEach((k) => { const v = params.get(k); if (v) utm[k] = v; });
    const referrer = document.referrer && !document.referrer.includes(window.location.host)
      ? document.referrer
      : '';

    const existing = safeGet(FIRST_TOUCH_LS);
    // Guardar first-touch solo si no existe, o si esta visita trae UTMs y la guardada no tenía ninguno.
    const hasUtm = Object.keys(utm).length > 0 || Boolean(referrer);
    if (!existing || (hasUtm && !existing.hasSignal)) {
      const attribution = {
        visitorId: getVisitorId(),
        utm,
        referrer,
        landing: window.location.pathname,
        source: detectSource(utm, referrer),
        hasSignal: hasUtm,
        ts: new Date().toISOString(),
      };
      safeSet(FIRST_TOUCH_LS, attribution);
    } else {
      // Asegura que el visitorId quede vinculado aunque el first-touch sea previo a la cookie.
      getVisitorId();
    }
  } catch { /* ignore */ }
  return getAttribution();
}

/** Devuelve la atribución guardada (first-touch) lista para adjuntar a cada evento. */
export function getAttribution() {
  const ft = safeGet(FIRST_TOUCH_LS) || {};
  return {
    visitorId: getVisitorId(),
    source: ft.source || 'directo',
    utm: ft.utm || {},
    referrer: ft.referrer || '',
    landing: ft.landing || (typeof window !== 'undefined' ? window.location.pathname : ''),
  };
}

function safeGet(k) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
}
function safeSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ }
}

export default { getVisitorId, captureAttribution, getAttribution };
