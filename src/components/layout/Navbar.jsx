import { Navbar, Nav, Container, Button, Dropdown, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { FaUser } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import TesipediaLogo from '../../assets/images/Tesipedia-logo.png';
import './Navbar.css';

function MainNavbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const [showRegister, setShowRegister] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/');
    };

    const handleRegister = () => {
        navigate('/login');
    };

    return (
        <Navbar bg="white" variant="light" expand="lg" fixed="top" className={`shadow-sm ${scrolled ? 'scrolled' : ''}`}>
            <Container>
                <Navbar.Brand as={Link} to="/" className="brand-container">
                    <img
                        src={TesipediaLogo}
                        alt="Tesipedia"
                        className="brand-logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/" className={({ isActive }) => isActive ? 'active' : ''}>Inicio</Nav.Link>
                        <Nav.Link as={NavLink} to="/servicios" className={({ isActive }) => isActive ? 'active' : ''}>Servicios</Nav.Link>
                        <Nav.Link as={NavLink} to="/como-funciona" className={({ isActive }) => isActive ? 'active' : ''}>¿Cómo Funciona?</Nav.Link>
                        <Nav.Link as={NavLink} to="/precios" className={({ isActive }) => isActive ? 'active' : ''}>Precios</Nav.Link>
                        <Nav.Link as={NavLink} to="/cotizar" className="nav-link-cotizar" style={{ color: '#4F46E5' }}>Cotizar</Nav.Link>
                        <NavDropdown title="Más" id="nav-dropdown" className="nav-dropdown">
                            <NavDropdown.Item as={NavLink} to="/sobre-nosotros" className={({ isActive }) => isActive ? 'active' : ''}>Sobre Nosotros</NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/preguntas-frecuentes" className={({ isActive }) => isActive ? 'active' : ''}>Preguntas Frecuentes</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={NavLink} to="/contacto" className={({ isActive }) => isActive ? 'active' : ''}>Contacto</NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/blog" className={({ isActive }) => isActive ? 'active' : ''}>Blog</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav className="align-items-center">
                        <Button as={Link} to="/cotizar" className="btn-cotizar me-2">
                            Cotizar Tesis
                        </Button>
                        {isAuthenticated ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="outline-secondary" id="user-dropdown">
                                    <FaUser className="me-2" />
                                    {user?.name}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/dashboard">Dashboard</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/perfil">Mi Perfil</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/mis-cotizaciones">Mis Cotizaciones</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>Cerrar Sesión</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <>
                                <Button as={Link} to="/login" variant="outline-secondary" className="me-2">
                                    Iniciar Sesión
                                </Button>
                                <Button as={Link} to="/register" variant="outline-primary">
                                    Regístrate
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default MainNavbar; 