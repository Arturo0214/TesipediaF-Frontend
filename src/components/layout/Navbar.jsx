import { Navbar, Nav, Container, Button, Dropdown, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { FaUser } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import './Navbar.css';

function MainNavbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const [showRegister, setShowRegister] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const TesipediaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';

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
        setExpanded(false);
        await dispatch(logout());
        navigate('/');
    };

    const handleRegister = () => {
        setExpanded(false);
        navigate('/login');
    };

    const closeNavbar = () => setExpanded(false);

    return (
        <Navbar bg="white" variant="light" expand="lg" fixed="top"
            className={`shadow-sm ${scrolled ? 'scrolled' : ''}`}
            expanded={expanded}
            onToggle={(expanded) => setExpanded(expanded)}
        >
            <Container>
                <Navbar.Brand as={Link} to="/" className="brand-container" onClick={closeNavbar}>
                    <img
                        src={TesipediaLogo}
                        alt="Tesipedia"
                        className="brand-logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/" onClick={closeNavbar}>Inicio</Nav.Link>
                        <Nav.Link as={NavLink} to="/servicios" onClick={closeNavbar}>Servicios</Nav.Link>
                        <Nav.Link as={NavLink} to="/como-funciona" onClick={closeNavbar}>¿Cómo Funciona?</Nav.Link>
                        <Nav.Link as={NavLink} to="/precios" onClick={closeNavbar}>Precios</Nav.Link>
                        <Nav.Link as={NavLink} to="/cotizar" className="nav-link-cotizar" style={{ color: '#4F46E5' }} onClick={closeNavbar}>Cotizar</Nav.Link>
                        <NavDropdown title="Más" id="nav-dropdown" className="nav-dropdown">
                            <NavDropdown.Item as={NavLink} to="/sobre-nosotros" onClick={closeNavbar}>Sobre Nosotros</NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/preguntas-frecuentes" onClick={closeNavbar}>Preguntas Frecuentes</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={NavLink} to="/contacto" onClick={closeNavbar}>Contacto</NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/blog" onClick={closeNavbar}>Blog</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav className="align-items-center">
                        <Button as={Link} to="/cotizar" className="btn-cotizar me-2" onClick={closeNavbar}>
                            Cotizar Tesis
                        </Button>
                        {isAuthenticated ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="outline-secondary" id="user-dropdown">
                                    <FaUser className="me-2" />
                                    {user?.name}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/dashboard" onClick={closeNavbar}>Dashboard</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/perfil" onClick={closeNavbar}>Mi Perfil</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/mis-cotizaciones" onClick={closeNavbar}>Mis Cotizaciones</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>Cerrar Sesión</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <>
                                <Button as={Link} to="/login" variant="outline-secondary" className="me-2" onClick={closeNavbar}>
                                    Iniciar Sesión
                                </Button>
                                <Button as={Link} to="/register" variant="outline-primary" onClick={closeNavbar}>
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