import { useEffect, useMemo } from 'react';
import { getVisitorId } from '../utils/visitor';
import { trackEvent } from '../services/eventService';

/**
 * useABTest — A/B testing ligero, sin dependencias.
 *
 * - Asignación DETERMINÍSTICA por visitante: hash(visitorId + testId) % variantes.
 *   El mismo visitante ve siempre la misma variante en todas sus sesiones,
 *   y un mismo visitante puede caer en variantes distintas de tests distintos.
 * - Exposición trackeada UNA vez por sesión por test:
 *   trackEvent('experiment', 'exposure', label: "<testId>:<variante>").
 *   Como todo evento lleva visitorId/sessionId, la conversión (view_product,
 *   initiate_checkout, purchase) se cruza por visitorId para leer el resultado.
 *
 * Uso:
 *   const variant = useABTest('promobar_copy');            // 'A' | 'B'
 *   const variant = useABTest('stage_reco', ['A','B','C']); // multivariante
 */

// FNV-1a 32-bit — estable y suficiente para bucketing
const fnv1a = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

const exposed = new Set(); // por sesión de JS (se resetea al recargar; el guard real es sessionStorage)

export function getVariant(testId, variants = ['A', 'B']) {
  const vid = getVisitorId() || 'anon';
  return variants[fnv1a(`${vid}::${testId}`) % variants.length];
}

export default function useABTest(testId, variants = ['A', 'B']) {
  const variant = useMemo(() => getVariant(testId, variants), [testId, variants.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const key = `tp_exp_${testId}`;
    let already = exposed.has(key);
    try { already = already || sessionStorage.getItem(key) === '1'; } catch { /* private mode */ }
    if (already) return;
    exposed.add(key);
    try { sessionStorage.setItem(key, '1'); } catch { /* private mode */ }
    trackEvent('experiment', 'exposure', {
      category: 'experiment',
      label: `${testId}:${variant}`,
      metadata: { testId, variant },
    });
  }, [testId, variant]);

  return variant;
}
