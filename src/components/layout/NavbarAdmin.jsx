import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout, reset } from '../../features/auth/authSlice';
import './Navbar.css';

function NavbarAdmin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const TesipediaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';

    const handleLogout = async () => {
        await dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    return (
        <Navbar bg="white" variant="light" expand="lg" fixed="top" className="shadow-sm">
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
                        <Nav.Link as={NavLink} to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                            Panel de Administración
                        </Nav.Link>
                        <NavDropdown title="Gestión" id="nav-dropdown" className="nav-dropdown">
                            <NavDropdown.Item as={NavLink} to="/admin/usuarios" className={({ isActive }) => isActive ? 'active' : ''}>
                                Usuarios
                            </NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/admin/pedidos" className={({ isActive }) => isActive ? 'active' : ''}>
                                Pedidos
                            </NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/admin/cotizaciones" className={({ isActive }) => isActive ? 'active' : ''}>
                                Cotizaciones
                            </NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/admin/escritores" className={({ isActive }) => isActive ? 'active' : ''}>
                                Escritores
                            </NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/admin/visitas" className={({ isActive }) => isActive ? 'active' : ''}>
                                Visitas
                            </NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link as={NavLink} to="/admin/estadisticas" className={({ isActive }) => isActive ? 'active' : ''}>
                            Estadísticas
                        </Nav.Link>
                    </Nav>
                    <Button variant="outline-secondary" onClick={handleLogout}>Cerrar Sesión</Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarAdmin;
