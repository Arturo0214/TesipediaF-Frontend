/**
 * Tracking utilities — Meta Pixel events + UTM attribution
 */

// Obtener UTMs guardados del sessionStorage
export function getUTMParams() {
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'referrer'];
  const params = {};
  keys.forEach(key => {
    const val = sessionStorage.getItem(key);
    if (val) params[key] = val;
  });
  return params;
}

// Detectar fuente del lead basado en UTMs
export function detectLeadSource() {
  const utms = getUTMParams();
  if (utms.fbclid || utms.utm_source?.includes('facebook') || utms.utm_source?.includes('meta') || utms.utm_source?.includes('ig')) {
    return `meta_${utms.utm_campaign || 'direct'}`;
  }
  if (utms.gclid || utms.utm_source?.includes('google')) {
    return `google_${utms.utm_campaign || 'ads'}`;
  }
  if (utms.utm_source) return utms.utm_source;
  if (utms.referrer) {
    if (utms.referrer.includes('instagram')) return 'instagram_organic';
    if (utms.referrer.includes('facebook')) return 'facebook_organic';
    if (utms.referrer.includes('tiktok')) return 'tiktok';
    if (utms.referrer.includes('google')) return 'google_organic';
    return 'referral';
  }
  return 'direct';
}

// Meta Pixel — Track Lead event
export function trackMetaLead(data = {}) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {
      content_name: data.tipo_proyecto || data.title || 'Cotización',
      content_category: data.nivel || data.category || 'Académico',
      value: data.precio || 0,
      currency: 'MXN',
    });
  }
}

// Meta Pixel — Track Purchase/Payment event
export function trackMetaPurchase(data = {}) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      value: data.amount || data.precio || 0,
      currency: 'MXN',
      content_name: data.title || 'Proyecto',
    });
  }
}

// Meta Pixel — Track InitiateCheckout (cotización enviada)
export function trackMetaInitiateCheckout(data = {}) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      value: data.precio || 0,
      currency: 'MXN',
      content_name: data.title || 'Cotización',
      num_items: 1,
    });
  }
}

// Meta Pixel — Custom event
export function trackMetaCustom(eventName, data = {}) {
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, data);
  }
}
