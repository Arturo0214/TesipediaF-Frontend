import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { FaUser } from 'react-icons/fa';
import { useState } from 'react';

function MainNavbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const [showRegister, setShowRegister] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const handleRegister = () => {
        console.log("Registro en proceso...");
        navigate('/login');
    };

    return (
        <Navbar bg="white" variant="light" expand="lg" fixed="top" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    <img src="/logo.png" alt="Tesipedia" height="40" className="d-inline-block align-top" />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/servicios" className="nav-link">Servicios</Nav.Link>
                        <Nav.Link as={Link} to="/como-funciona" className="nav-link">¿Cómo Funciona?</Nav.Link>
                        <Nav.Link as={Link} to="/precios" className="nav-link">Precios</Nav.Link>
                        <Nav.Link as={Link} to="/blog" className="nav-link">Blog</Nav.Link>
                    </Nav>
                    <Nav>
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
                                <Button as={Link} to="/cotizar" variant="primary" className="me-2" style={{ fontWeight: 'bold' }}>
                                    Cotizar Tesis
                                </Button>
                                <Button as={Link} to="/login" variant="outline-secondary" style={{ fontWeight: 'bold', marginRight: '10px' }}>
                                    Iniciar Sesión
                                </Button>
                                <Button onClick={handleRegister} variant="outline-primary" style={{ fontWeight: 'bold' }}>
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