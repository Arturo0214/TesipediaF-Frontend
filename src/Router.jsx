import {
  createBrowserRouter,
} from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Services from './pages/Services/Services';
import HowItWorks from './pages/HowItWorks/HowItWorks';
import Quote from './pages/Quote/Quote';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Prices from './pages/Prices/Prices';
import AboutUs from './pages/AboutUs/AboutUs';
import FAQ from './pages/FAQ/FAQ';

import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile';
import MyQuotes from './pages/dashboard/MyQuotes';
import MyOrders from './pages/dashboard/MyOrders';
import Messages from './pages/dashboard/Messages';
import Payments from './pages/dashboard/Payments';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import ManageQuotes from './pages/admin/ManageQuotes';
import ManageWriters from './pages/admin/ManageWriters';
import ManageVisits from './pages/admin/ManageVisits';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />,
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
        { path: 'reset-password/:token', element: <ResetPassword /> },
        { path: 'precios', element: <Prices /> },
        { path: 'sobre-nosotros', element: <AboutUs /> },
        { path: 'preguntas-frecuentes', element: <FAQ /> },

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

        {
          element: <ProtectedRoute requireAdmin />,
          children: [
            { path: 'admin', element: <AdminDashboard /> },
            { path: 'admin/usuarios', element: <ManageUsers /> },
            { path: 'admin/pedidos', element: <ManageOrders /> },
            { path: 'admin/cotizaciones', element: <ManageQuotes /> },
            { path: 'admin/escritores', element: <ManageWriters /> },
            { path: 'admin/visitas', element: <ManageVisits /> },
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
