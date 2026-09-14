import { Navbar, Nav, Container, Button, Dropdown, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../features/auth/authSlice';
import { FaUser, FaBookOpen } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CartButton from '../../cart/CartButton';
import useABTest from '../../../hooks/useABTest';
import './Navbar.css';

function MainNavbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector(state => state.auth);
    // Experimento 5: "Guías para tu tesis" (A) vs "Tienda de guías" (B)
    const navCopy = useABTest('nav_copy');
    const [showRegister, setShowRegister] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [expanded, setExpanded] = useState(false);
    // Optimized: WebP format, auto quality, resized to 200px width for navbar
    const TesipediaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/f_auto,q_auto,w_200/v1743713944/Tesipedia-logo_n1liaw.png';

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
            style={{ position: 'fixed', width: '100%', top: 0, zIndex: 1030 }}
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
                            alt="Tesipedia - Servicio profesional de tesis en México"
                            className="brand-logo"
                            width="150"
                            height="40"
                            loading="eager"
                            fetchPriority="high"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto nav-main align-items-lg-center">
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={NavLink} to="/" end onClick={closeNavbar}>Inicio</Nav.Link>
                            </motion.div>
                            {/* Todo lo informativo agrupado en un dropdown (patrón Contratado) */}
                            <NavDropdown title="Recursos" id="nav-recursos" className="nav-dropdown-recursos">
                                <NavDropdown.Item as={NavLink} to="/sobre-nosotros" onClick={closeNavbar}>Sobre Nosotros</NavDropdown.Item>
                                <NavDropdown.Item as={NavLink} to="/preguntas-frecuentes" onClick={closeNavbar}>Preguntas Frecuentes</NavDropdown.Item>
                                <NavDropdown.Item as={NavLink} to="/contacto" onClick={closeNavbar}>Contacto</NavDropdown.Item>
                            </NavDropdown>
                            {/* Destacado: Blog (mismo nivel que Detector y Tienda) */}
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={NavLink} to="/blog" className="nav-link-destacado nav-link-blog" onClick={closeNavbar}>
                                    <FaBookOpen /> Blog
                                </Nav.Link>
                            </motion.div>
                            {/* Destacado 1: Escáner / Detector IA */}
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={NavLink} to="/detector-ia-tesis" className="nav-link-destacado nav-link-detector" onClick={closeNavbar}>
                                    <span className="nav-dot" aria-hidden="true" /> Detector de IA
                                </Nav.Link>
                            </motion.div>
                            {/* Destacado 2: Tienda de guías (CTA comercial) */}
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={NavLink} to="/guias" className="nav-link-destacado nav-link-guias" onClick={closeNavbar} data-track-cta={`nav_guias_${navCopy.toLowerCase()}`}>
                                    📚 {navCopy === 'B' ? 'Tienda de guías' : 'Guías'}<span className="nav-guias-badge">desde $79</span>
                                </Nav.Link>
                            </motion.div>
                        </Nav>
                        <Nav className="align-items-center">
                            <CartButton className="me-2" />
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
                                                <Dropdown.Item as={Link} to="/dashboard" onClick={closeNavbar}>Mi Panel</Dropdown.Item>
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