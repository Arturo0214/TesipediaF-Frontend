import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout'; // <-- Nuevo AdminLayout
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

import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile';
import MyQuotes from './pages/dashboard/MyQuotes';
import MyOrders from './pages/dashboard/MyOrders';
import Messages from './pages/dashboard/Messages';
import Payments from './pages/dashboard/Payments';

// Admin Pages
import AdminDashboard from './pages/admin/adminDashboard/AdminDashboard';
import AdminPanel from './pages/admin/adminPanel/AdminPanel';
import AdminMessages from './pages/admin/adminMessages/AdminMessages';
import UrgentProjects from './pages/admin/urgentProjects/UrgentProjects';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />, // Público y clientes
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
        { path: 'preguntas-frecuentes', element: <FAQ /> },
        { path: 'payment/success', element: <PaymentSuccess /> },
        { path: 'payment/cancel', element: <PaymentCancel /> },

        {
          element: <ProtectedRoute />,
          children: [
            { path: 'dashboard', element: <Dashboard /> },
            { path: 'perfil', element: <Profile /> },
            { path: 'mis-cotizaciones', element: <MyQuotes /> },
            { path: 'mis-pedidos', element: <MyOrders /> },
            { path: 'mensajes', element: <Messages /> },
            { path: 'pagos', element: <Payments /> },
          ],
        },
      ],
    },
    {
      element: <ProtectedRoute requireAdmin />, // Protegido para Admin
      children: [
        {
          element: <AdminLayout />, // <-- NUEVO AdminLayout limpio
          children: [
            { path: 'admin', element: <AdminDashboard /> },
            { path: 'admin/dashboard', element: <AdminDashboard /> },
            { path: 'admin/panel', element: <AdminPanel /> },
            { path: 'admin/mensajes', element: <AdminMessages /> },
            { path: 'admin/proyectos-urgentes', element: <UrgentProjects /> },
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
