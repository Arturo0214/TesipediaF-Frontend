// Frontend/src/components/layout/NavbarUser.jsx
import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../../features/auth/authSlice';
import { FaUser, FaBell, FaCog, FaSignOutAlt, FaComments, FaFileAlt, FaBlog } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './NavbarCliente.css';
import Notifications from '../../../pages/Client/Notifications/Notifications';

function NavbarCliente() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector(state => state.auth);
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
        dispatch(reset());
        navigate('/');
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
                    <Navbar.Brand as={Link} to="/cotizar" className="brand-container" onClick={closeNavbar}>
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
                                <Nav.Link as={Link} to="/cotizar" onClick={closeNavbar}>Cotizar</Nav.Link>
                            </motion.div>
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={Link} to="/mi-proyecto" onClick={closeNavbar}>Mi Proyecto</Nav.Link>
                            </motion.div>
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={Link} to="/pagos" onClick={closeNavbar}>Pagos</Nav.Link>
                            </motion.div>
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={Link} to="/servicios" onClick={closeNavbar}>Servicios</Nav.Link>
                            </motion.div>
                            <motion.div variants={linkVariants} whileHover="hover">
                                <Nav.Link as={Link} to="/preguntas-frecuentes" onClick={closeNavbar}>Preguntas frecuentes</Nav.Link>
                            </motion.div>
                        </Nav>
                        <Nav className="align-items-center">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button as={Link} to="/cotizar" className="btn-cotizar me-2" onClick={closeNavbar}>
                                    Cotizar Tesis
                                </Button>
                            </motion.div>
                            <AnimatePresence>
                                {isAuthenticated && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="d-flex align-items-center"
                                    >
                                        {/* Componente de Notificaciones */}
                                        <div className="me-2">
                                            <Notifications />
                                        </div>

                                        {/* Perfil de usuario */}
                                        <Dropdown align="end">
                                            <Dropdown.Toggle variant="outline-secondary" id="user-dropdown">
                                                <FaUser className="me-2" />
                                                {user?.name}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item as={Link} to="/perfil" onClick={closeNavbar}>
                                                    <FaUser className="me-2" /> Editar Perfil
                                                </Dropdown.Item>
                                                <Dropdown.Item as={Link} to="/mensajes" onClick={closeNavbar}>
                                                    <FaComments className="me-2" /> Mensajes
                                                </Dropdown.Item>
                                                <Dropdown.Item as={Link} to="/mis-cotizaciones" onClick={closeNavbar}>
                                                    <FaFileAlt className="me-2" /> Mis Cotizaciones
                                                </Dropdown.Item>
                                                <Dropdown.Item as={Link} to="/blog" onClick={closeNavbar}>
                                                    <FaBlog className="me-2" /> Blog
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item onClick={handleLogout}>
                                                    <FaSignOutAlt className="me-2" /> Cerrar Sesión
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
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

export default NavbarCliente;