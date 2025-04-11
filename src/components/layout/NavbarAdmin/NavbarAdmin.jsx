import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../../features/auth/authSlice';
import { FaUser, FaCog, FaSignOutAlt, FaEnvelope, FaUserTie, FaUserEdit, FaCogs, FaTachometerAlt, FaBell, FaFileAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './NavbarAdmin.css';

function NavbarAdmin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [scrolled, setScrolled] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const TesipediaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        setExpanded(false);
        await dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    const closeNavbar = () => setExpanded(false);

    const navVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
    };

    return (
        <Navbar
            as={motion.nav}
            initial="hidden"
            animate="visible"
            variants={navVariants}
            bg="white"
            variant="light"
            expand="lg"
            fixed="top"
            className={`shadow-sm ${scrolled ? 'scrolled' : ''}`}
            expanded={expanded}
            onToggle={(expanded) => setExpanded(expanded)}
        >
            <Container fluid>
                <Navbar.Brand as={Link} to="/admin" className="navbar-brand" onClick={closeNavbar}>
                    <img src={TesipediaLogo} alt="Tesipedia" className="brand-logo" />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeNavbar}>
                            <FaTachometerAlt className="me-1" /> Dashboard
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/admin/panel" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeNavbar}>
                            <FaCogs className="me-1" /> Panel de Administración
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/admin/mensajes" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeNavbar}>
                            <FaEnvelope className="me-1" /> Mensajes
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/admin/proyectos-urgentes" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeNavbar}>
                            <FaFileAlt className="me-1" /> Proyectos Urgentes
                        </Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link as={NavLink} to="/admin/notificaciones" className="position-relative" onClick={closeNavbar}>
                            <FaBell className="me-1" />
                            <Badge bg="danger" className="notification-badge">3</Badge>
                        </Nav.Link>
                        <NavDropdown
                            title={<span className="user-dropdown"><FaUser className="me-1" /> {user?.name || 'Usuario'}</span>}
                            id="user-dropdown"
                            align="end"
                        >
                            <NavDropdown.Item as={NavLink} to="/admin/administradores" onClick={closeNavbar}>
                                <FaUserTie className="me-2" /> Administradores
                            </NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/admin/redactores" onClick={closeNavbar}>
                                <FaUserEdit className="me-2" /> Redactores
                            </NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/admin/configuraciones" onClick={closeNavbar}>
                                <FaCog className="me-2" /> Configuraciones
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleLogout}>
                                <FaSignOutAlt className="me-2" /> Salir
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarAdmin;

