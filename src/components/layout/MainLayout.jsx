import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NavbarRedactor from './NavbarRedactor';
import NavbarCliente from './NavbarClient/NavbarCliente';
import Navbar from "./Navbar/Navbar";
import { Footer } from "./Footer";
import ScrollToTop from "../common/ScrollToTop";
import FixedButtons from "../sections/FixedButtons";
import useEventTracking from '../../hooks/useEventTracking';

function MainLayout() {
    const { user, isAuthenticated } = useSelector(state => state.auth);
    useEventTracking(); // Auto-track pageviews, scroll depth, and data-track-* clicks
    const [isChatVisible, setChatVisible] = useState(false);

    const handleChatClick = () => {
        setChatVisible(prev => !prev);
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {isAuthenticated && user?.role === 'redactor' ? (
                <NavbarRedactor />
            ) : isAuthenticated && user?.role === 'cliente' ? (
                <NavbarCliente />
            ) : (
                <Navbar />
            )}

            <main id="main-content" className="flex-fill main-content" role="main">
                <Outlet />
            </main>

            <Footer />
            <ScrollToTop />

            {/* Botones flotantes con chat lazy-loaded */}
            <FixedButtons onChatClick={handleChatClick} />
        </div>
    );
}

export default MainLayout;
