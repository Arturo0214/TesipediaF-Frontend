import { useEffect, useRef } from 'react';
import { trackPageView, trackScroll, trackClick, trackCTA } from '../services/eventService';

/**
 * Hook que trackea automáticamente:
 * - Page view al montar
 * - Scroll depth (25%, 50%, 75%, 100%)
 * - Clicks en CTAs (botones con data-track-cta)
 * - Clicks en links con data-track-click
 *
 * Uso: useEventTracking() en cualquier página/componente
 */
const useEventTracking = (options = {}) => {
  const { trackScrollDepth = true, trackClicks = true } = options;
  const scrollMilestones = useRef(new Set());

  useEffect(() => {
    // Track page view
    trackPageView();
  }, []);

  // Scroll tracking
  useEffect(() => {
    if (!trackScrollDepth) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = Math.round((scrollTop / docHeight) * 100);
      const milestones = [25, 50, 75, 100];

      for (const m of milestones) {
        if (percent >= m && !scrollMilestones.current.has(m)) {
          scrollMilestones.current.add(m);
          trackScroll(m);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth]);

  // Click tracking via data attributes
  useEffect(() => {
    if (!trackClicks) return;

    const handleClick = (e) => {
      const target = e.target.closest('[data-track-cta], [data-track-click]');
      if (!target) return;

      const ctaName = target.getAttribute('data-track-cta');
      const clickName = target.getAttribute('data-track-click');
      const label = target.getAttribute('data-track-label') || target.textContent?.trim().slice(0, 50) || '';

      if (ctaName) {
        trackCTA(ctaName, label);
      } else if (clickName) {
        trackClick(clickName, label);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [trackClicks]);
};

export default useEventTracking;
