
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NavbarRedactor from './NavbarRedactor';
import NavbarAdmin from './NavbarAdmin';
import NavbarCliente from './NavbarCliente';
import Navbar from './Navbar';
import { Footer } from './Footer';
import ScrollToTop from '../common/ScrollToTop';

function MainLayout() {
    const { user, isAuthenticated } = useSelector(state => state.auth);

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
        </div>
    );
}

export default MainLayout;