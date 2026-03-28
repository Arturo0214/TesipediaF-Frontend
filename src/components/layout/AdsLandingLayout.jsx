import { Outlet } from 'react-router-dom';
import ScrollToTop from '../common/ScrollToTop';
import FixedButtons from '../sections/FixedButtons';
import { useState } from 'react';

/**
 * AdsLandingLayout — Layout limpio para landing pages de Google Ads.
 * NO incluye el Navbar ni Footer estándar del sitio para evitar que
 * Google detecte lenguaje de otras páginas y rechace la campaña.
 * Solo incluye FixedButtons (WhatsApp + Sofia) y ScrollToTop.
 */
function AdsLandingLayout() {
  const [isChatVisible, setChatVisible] = useState(false);
  const handleChatClick = () => setChatVisible(prev => !prev);

  return (
    <div className="d-flex flex-column min-vh-100">
      <main id="main-content" className="flex-fill" role="main">
        <Outlet />
      </main>
      <ScrollToTop />
      <FixedButtons onChatClick={handleChatClick} />
    </div>
  );
}

export default AdsLandingLayout;
