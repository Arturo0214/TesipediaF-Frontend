import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../features/auth/authSlice';
import { FaUser, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';

function NavbarRedactor() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const TesipediaLogo = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';

    const handleLogout = async () => {
        await dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    return (
        <Navbar bg="white" variant="light" expand="lg" fixed="top" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/dashboard">
                    <img src={TesipediaLogo} alt="Tesipedia" style={{ height: 36 }} loading="lazy" />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="writer-navbar-nav" />
                <Navbar.Collapse id="writer-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/dashboard">
                            <FaClipboardList className="me-1" /> Mis Proyectos
                        </Nav.Link>
                        <Nav.Link as={Link} to="/perfil">
                            <FaUser className="me-1" /> Perfil
                        </Nav.Link>
                    </Nav>
                    <Nav>
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                                <FaUser className="me-1" /> {user?.name || 'Redactor'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item as={Link} to="/perfil">
                                    <FaUser className="me-2" /> Editar Perfil
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout}>
                                    <FaSignOutAlt className="me-2" /> Cerrar Sesión
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarRedactor;
