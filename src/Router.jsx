import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import MainLayout from './components/layout/MainLayout';
const AdsLandingLayout = lazy(() => import('./components/layout/AdsLandingLayout'));

// Lazy load all pages for code splitting
const Home = lazy(() => import('./pages/Home/Home'));

// Redirect authenticated users to their dashboard, show Home for visitors
const HomeOrDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  if (user) return <Navigate to="/dashboard" replace />;
  return <Home />;
};
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const AboutUs = lazy(() => import('./pages/AboutUs/AboutUs'));
const FAQ = lazy(() => import('./pages/FAQ/FAQ'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/PaymentCancel/PaymentCancel'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy/PrivacyPolicy'));
const Blog = lazy(() => import('./pages/Blog/Blog'));
const BlogPost = lazy(() => import('./pages/Blog/BlogPost'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const SalesQuote = lazy(() => import('./pages/SalesQuote/SalesQuote'));

// SEO Landing Pages
const ComprarTesis = lazy(() => import('./pages/landing/ComprarTesis'));
const TesisLicenciatura = lazy(() => import('./pages/landing/TesisLicenciatura'));
const TesisMaestria = lazy(() => import('./pages/landing/TesisMaestria'));
const TesisDoctorado = lazy(() => import('./pages/landing/TesisDoctorado'));
const TutoriaAcademica = lazy(() => import('./pages/landing/TutoriaAcademica'));
const CotizarLanding = lazy(() => import('./pages/landing/CotizarLanding'));
const CuantoCuestaUnaTesis = lazy(() => import('./pages/landing/CuantoCuestaUnaTesis'));
const AyudaConTesis = lazy(() => import('./pages/landing/AyudaConTesis'));

// Lazy load protected layouts and pages (not needed on initial load)
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const ClientLayout = lazy(() => import('./components/layout/ClientLayout'));
const ProtectedRoute = lazy(() => import('./components/common/ProtectedRoute'));
const ClientPanel = lazy(() => import('./pages/Client/ClientPanel'));
const WriterPanel = lazy(() => import('./pages/Writer/WriterPanel'));
const RoleDashboard = lazy(() => import('./components/common/RoleDashboard'));
const AdminPanel = lazy(() => import('./pages/admin/adminPanel/AdminPanel'));

// Minimal loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

// Wrapper for lazy components
const LazyPage = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />, // Público
      children: [
        { index: true, element: <LazyPage><HomeOrDashboard /></LazyPage> },
        { path: 'login', element: <LazyPage><Login /></LazyPage> },
        { path: 'register', element: <LazyPage><Register /></LazyPage> },
        { path: 'contacto', element: <LazyPage><Contact /></LazyPage> },
        { path: 'forgot-password', element: <LazyPage><ForgotPassword /></LazyPage> },
        { path: 'auth/reset-password/:token', element: <LazyPage><ResetPassword /></LazyPage> },
        { path: 'sobre-nosotros', element: <LazyPage><AboutUs /></LazyPage> },
        { path: 'politica-de-privacidad', element: <LazyPage><PrivacyPolicy /></LazyPage> },
        { path: 'preguntas-frecuentes', element: <LazyPage><FAQ /></LazyPage> },
        { path: 'blog', element: <LazyPage><Blog /></LazyPage> },
        { path: 'blog/:slug', element: <LazyPage><BlogPost /></LazyPage> },
        { path: 'cotizacion/:id', element: <LazyPage><SalesQuote /></LazyPage> },
        { path: 'comprar-tesis', element: <LazyPage><ComprarTesis /></LazyPage> },
        { path: 'tesis-licenciatura', element: <LazyPage><TesisLicenciatura /></LazyPage> },
        { path: 'tesis-maestria', element: <LazyPage><TesisMaestria /></LazyPage> },
        { path: 'tesis-doctoral', element: <LazyPage><TesisDoctorado /></LazyPage> },
        { path: 'cotizar', element: <LazyPage><CotizarLanding /></LazyPage> },
        { path: 'cuanto-cuesta-una-tesis', element: <LazyPage><CuantoCuestaUnaTesis /></LazyPage> },
        { path: 'ayuda-con-tesis', element: <LazyPage><AyudaConTesis /></LazyPage> },
        { path: 'payment/success', element: <LazyPage><PaymentSuccess /></LazyPage> },
        { path: 'payment/cancel', element: <LazyPage><PaymentCancel /></LazyPage> },
        { path: '*', element: <LazyPage><NotFound /></LazyPage> },
      ],
    },

    // Landing pages para Google Ads — layout limpio sin navbar/footer del sitio principal
    {
      path: '/',
      element: <LazyPage><AdsLandingLayout /></LazyPage>,
      children: [
        { path: 'tutoria-academica', element: <LazyPage><TutoriaAcademica /></LazyPage> },
      ],
    },

    // Panel de Cliente/Redactor — layout propio sin navbar público
    {
      element: <LazyPage><ProtectedRoute /></LazyPage>,
      children: [
        {
          element: <LazyPage><ClientLayout /></LazyPage>,
          children: [
            { path: 'dashboard', element: <LazyPage><RoleDashboard /></LazyPage> },
            { path: 'mi-proyecto', element: <LazyPage><ClientPanel /></LazyPage> },
            { path: 'panel-redactor', element: <LazyPage><WriterPanel /></LazyPage> },
          ],
        },
      ],
    },

    // Panel de Admin — layout propio
    {
      element: <LazyPage><ProtectedRoute requireAdmin /></LazyPage>,
      children: [
        {
          element: <LazyPage><AdminLayout /></LazyPage>,
          children: [
            { path: 'admin', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/cotizaciones', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/proyectos', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/pagos', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/pedidos', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/urgentes', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/whatsapp', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/manychat', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/automatizaciones', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/mensajes', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/usuarios', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/escritores', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/servicios', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/visitas', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/revenue', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/informes', element: <LazyPage><AdminPanel /></LazyPage> },
            { path: 'admin/*', element: <LazyPage><AdminPanel /></LazyPage> },
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
