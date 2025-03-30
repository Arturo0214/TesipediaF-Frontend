import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Footer } from './Footer';
import ScrollToTop from '../common/ScrollToTop';

function MainLayout() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-fill main-content">
                <Outlet />
            </main>
            <Footer />
            <ScrollToTop />
        </div>
    );
}

export default MainLayout; 