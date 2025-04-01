import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import MainLayout from './components/layout/MainLayout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import FixedButtons from './components/sections/FixedButtons.jsx';
import './chartSetup';

// Páginas públicas
import Home from './pages/Home/Home.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Services from './pages/Services/Services.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Quote from './pages/Quote/Quote.jsx';
import Blog from './pages/Blog.jsx';
import Contact from './pages/Contact.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import Prices from './pages/Prices/Prices.jsx';

// Páginas protegidas - Usuario
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Profile from './pages/dashboard/Profile.jsx';
import MyQuotes from './pages/dashboard/MyQuotes.jsx';
import MyOrders from './pages/dashboard/MyOrders.jsx';
import Messages from './pages/dashboard/Messages.jsx';
import Payments from './pages/dashboard/Payments.jsx';

// Páginas protegidas - Admin
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import ManageOrders from './pages/admin/ManageOrders.jsx';
import ManageQuotes from './pages/admin/ManageQuotes.jsx';
import ManageWriters from './pages/admin/ManageWriters.jsx';
import ManageVisits from './pages/admin/ManageVisits.jsx';

function App() {
  const [isChatVisible, setChatVisible] = useState(false);

  const handleChatClick = () => {
    setChatVisible(!isChatVisible);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Rutas públicas */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="servicios" element={<Services />} />
          <Route path="como-funciona" element={<HowItWorks />} />
          <Route path="cotizar" element={<Quote />} />
          <Route path="blog" element={<Blog />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="precios" element={<Prices />} />

          {/* Rutas protegidas - Usuario */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="mis-cotizaciones" element={<MyQuotes />} />
            <Route path="mis-pedidos" element={<MyOrders />} />
            <Route path="mensajes" element={<Messages />} />
            <Route path="pagos" element={<Payments />} />
          </Route>

          {/* Rutas protegidas - Admin */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/usuarios" element={<ManageUsers />} />
            <Route path="admin/pedidos" element={<ManageOrders />} />
            <Route path="admin/cotizaciones" element={<ManageQuotes />} />
            <Route path="admin/escritores" element={<ManageWriters />} />
            <Route path="admin/visitas" element={<ManageVisits />} />
          </Route>
        </Route>
      </Routes>

      <FixedButtons onChatClick={handleChatClick} />
      {isChatVisible && <ChatComponent />}
    </Router>
  );
}

export default App;
