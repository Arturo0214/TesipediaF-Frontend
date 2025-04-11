import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NavbarRedactor from './NavbarRedactor';
import NavbarAdmin from './NavbarAdmin/NavbarAdmin';
import NavbarCliente from './NavbarClient/NavbarCliente';
import Navbar from "./Navbar/Navbar";
import { Footer } from "./Footer";
import ScrollToTop from "../common/ScrollToTop";
import FixedButtons from "../sections/FixedButtons";
import ChatPanel from "../chat/ChatPanel";

function MainLayout() {
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const [isChatVisible, setChatVisible] = useState(false);

    const handleChatClick = () => {
        setChatVisible(prev => !prev);
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {!isAuthenticated ? (
                <Navbar />
            ) : (
                <>
                    {user?.role === 'admin' && <NavbarAdmin />}
                    {user?.role === 'redactor' && <NavbarRedactor />}
                    {user?.role === 'cliente' && <NavbarCliente />}
                </>
            )}

            <main className="flex-fill main-content">
                <Outlet />
            </main>

            <Footer />
            <ScrollToTop />

            {/* ✅ Botones flotantes y componente de chat */}
            <FixedButtons onChatClick={handleChatClick} />
            {isChatVisible && <ChatPanel />}
        </div>
    );
}

export default MainLayout;
