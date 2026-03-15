import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ClientLayout from './components/layout/ClientLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Services from './pages/Services/Services';
import HowItWorks from './pages/HowItWorks/HowItWorks';
import Quote from './pages/Quote/Quote';
import Blog from './pages/Blog/Blog';
import Contact from './pages/Contact/Contact';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Prices from './pages/Prices/Prices';
import AboutUs from './pages/AboutUs/AboutUs';
import FAQ from './pages/FAQ/FAQ';
import PaymentSuccess from './pages/PaymentSuccess/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel/PaymentCancel';
import SalesQuote from './pages/SalesQuote/SalesQuote';

import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';

import ClientPanel from './pages/Client/ClientPanel';
import WriterPanel from './pages/Writer/WriterPanel';
import RoleDashboard from './components/common/RoleDashboard';

// Admin Pages
import AdminPanel from './pages/admin/adminPanel/AdminPanel';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />, // Público
      children: [
        { index: true, element: <Home /> },
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: 'servicios', element: <Services /> },
        { path: 'como-funciona', element: <HowItWorks /> },
        { path: 'cotizar', element: <Quote /> },
        { path: 'blog', element: <Blog /> },
        { path: 'contacto', element: <Contact /> },
        { path: 'forgot-password', element: <ForgotPassword /> },
        { path: 'auth/reset-password/:token', element: <ResetPassword /> },
        { path: 'precios', element: <Prices /> },
        { path: 'sobre-nosotros', element: <AboutUs /> },
        { path: 'politica-de-privacidad', element: <PrivacyPolicy /> },
        { path: 'preguntas-frecuentes', element: <FAQ /> },
        { path: 'payment/success', element: <PaymentSuccess /> },
        { path: 'payment/cancel', element: <PaymentCancel /> },
        { path: 'cotizaciones', element: <SalesQuote /> },
      ],
    },

    // Panel de Cliente/Redactor — layout propio sin navbar público (como AdminPanel)
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <ClientLayout />,
          children: [
            { path: 'dashboard', element: <RoleDashboard /> },
            { path: 'mi-proyecto', element: <ClientPanel /> },
            { path: 'panel-redactor', element: <WriterPanel /> },
          ],
        },
      ],
    },

    // Panel de Admin — layout propio
    {
      element: <ProtectedRoute requireAdmin />,
      children: [
        {
          element: <AdminLayout />,
          children: [
            { path: 'admin', element: <AdminPanel /> },
            { path: 'admin/cotizaciones', element: <AdminPanel /> },
            { path: 'admin/proyectos', element: <AdminPanel /> },
            { path: 'admin/pagos', element: <AdminPanel /> },
            { path: 'admin/pedidos', element: <AdminPanel /> },
            { path: 'admin/urgentes', element: <AdminPanel /> },
            { path: 'admin/whatsapp', element: <AdminPanel /> },
            { path: 'admin/mensajes', element: <AdminPanel /> },
            { path: 'admin/usuarios', element: <AdminPanel /> },
            { path: 'admin/escritores', element: <AdminPanel /> },
            { path: 'admin/servicios', element: <AdminPanel /> },
            { path: 'admin/visitas', element: <AdminPanel /> },
            { path: 'admin/*', element: <AdminPanel /> },
          ],
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default router;
