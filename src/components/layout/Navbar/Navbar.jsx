import { Navbar, Nav, Container, Button, Dropdown, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../features/auth/authSlice';
import { FaUser } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    const navVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const linkVariants = {
        hover: {
            scale: 1.05,
            transition: { duration: 0.2 }
        }
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={navVariants}
            style={{ position: 'fixed', width: '100%', top: 0, zIndex: 1000 }}
        >
            <Navbar bg="white" variant="light" expand="lg"
                className={`shadow-sm ${scrolled ? 'scrolled' : ''}`}
                expanded={expanded}
                onToggle={(expanded) => setExpanded(expanded)}
            >
                <Container>
                    <Navbar.Brand as={Link} to="/" className="brand-container" onClick={closeNavbar}>
                        <motion.img
                            src={TesipediaLogo}
                            alt="Tesipedia"
                            className="brand-logo"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={NavLink} to="/" onClick={closeNavbar}>Inicio</Nav.Link>
                            </motion.div>
                            {/* <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={NavLink} to="/cotizaciones" style={{ color: '#4F46E5', fontWeight: '600' }} onClick={closeNavbar}>Cotizaciones</Nav.Link>
                            </motion.div> */}
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={NavLink} to="/sobre-nosotros" onClick={closeNavbar}>Sobre Nosotros</Nav.Link>
                            </motion.div>
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={NavLink} to="/preguntas-frecuentes" onClick={closeNavbar}>Preguntas Frecuentes</Nav.Link>
                            </motion.div>
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={NavLink} to="/contacto" onClick={closeNavbar}>Contacto</Nav.Link>
                            </motion.div>
                        </Nav>
                        <Nav className="align-items-center">
                            <AnimatePresence>
                                {isAuthenticated ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
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
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Button as={Link} to="/login" variant="outline-secondary" className="me-2" onClick={closeNavbar}>
                                            Iniciar Sesión
                                        </Button>
                                        <Button as={Link} to="/register" variant="outline-primary" onClick={closeNavbar}>
                                            Regístrate
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </motion.div>
    );
}

export default MainNavbar; 