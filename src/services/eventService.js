import axiosWithAuth from '../utils/axioswithAuth';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://tesipedia-backend-service-production.up.railway.app';
const TRACK_URL = BASE_URL.endsWith('/') ? `${BASE_URL}events/track` : `${BASE_URL}/events/track`;

// ─── Session ID (persiste por sesión del navegador) ───
const getSessionId = () => {
  let sid = sessionStorage.getItem('tsp_session_id');
  if (!sid) {
    sid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('tsp_session_id', sid);
  }
  return sid;
};

// ─── Buffer para enviar eventos en batch (mejor performance) ───
let eventBuffer = [];
let flushTimeout = null;
const FLUSH_INTERVAL = 3000; // Enviar cada 3 seg
const MAX_BUFFER = 20;       // O cuando hay 20 eventos

const flushEvents = () => {
  if (eventBuffer.length === 0) return;
  const batch = [...eventBuffer];
  eventBuffer = [];
  clearTimeout(flushTimeout);
  flushTimeout = null;

  // Fire-and-forget — no bloquea la UI
  fetch(TRACK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batch),
    keepalive: true, // Sobrevive a navegación de página
  }).catch(() => {});
};

const scheduleFlush = () => {
  if (!flushTimeout) {
    flushTimeout = setTimeout(flushEvents, FLUSH_INTERVAL);
  }
};

// Flush al cerrar la página
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushEvents();
  });
  window.addEventListener('pagehide', flushEvents);
}

// ─── API Pública: trackear un evento ───
export const trackEvent = (type, action, options = {}) => {
  const event = {
    sessionId: getSessionId(),
    type,
    category: options.category || 'general',
    action,
    label: options.label || '',
    value: options.value ?? null,
    page: window.location.pathname,
    element: options.element || '',
    metadata: options.metadata || {},
  };

  eventBuffer.push(event);
  if (eventBuffer.length >= MAX_BUFFER) {
    flushEvents();
  } else {
    scheduleFlush();
  }
};

// ─── Convenience helpers ───
export const trackClick = (action, label = '', element = '') =>
  trackEvent('click', action, { category: 'engagement', label, element });

export const trackCTA = (action, label = '') =>
  trackEvent('cta', action, { category: 'conversion', label });

export const trackScroll = (percent) =>
  trackEvent('scroll', 'scroll_depth', { category: 'engagement', value: percent, label: `${percent}%` });

export const trackPageView = (page = window.location.pathname) =>
  trackEvent('pageview', 'page_view', { category: 'navigation', label: page });

export const trackChat = (action, label = '') =>
  trackEvent('chat', action, { category: 'engagement', label });

export const trackForm = (action, label = '') =>
  trackEvent('form', action, { category: 'conversion', label });

// ─── Google Ads Conversion Tracking ───
export const trackGoogleAdsConversion = () => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: 'AW-18036773645/y_s6CLDHqJEcEI2mzZhD',
    });
  }
};

// ─── Admin endpoints (autenticados) ───
export const getEventFeed = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await axiosWithAuth.get(`/events/feed?${query}`);
  return res.data;
};

export const getEventStats = async (hours = 24) => {
  const res = await axiosWithAuth.get(`/events/stats?hours=${hours}`);
  return res.data;
};

export const getRealtimeData = async () => {
  const res = await axiosWithAuth.get(`/events/realtime`);
  return res.data;
};
